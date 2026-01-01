'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUser } from '@/lib/supabase/auth';
import { Shield, Upload, CheckCircle, AlertCircle, FileText, Clock, History, RefreshCw } from 'lucide-react';
import { showSuccess, showError, showInfo, showLoading, dismissToast } from '@/lib/utils';

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [documentFiles, setDocumentFiles] = useState<{
    front: File | null;
    back: File | null;
  }>({ front: null, back: null });
  const [documentType, setDocumentType] = useState('nic');
  const [uploading, setUploading] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setPageLoading(true);
      const currentUser = await getUser();
      if (!currentUser) {
        router.push('/');
        return;
      }

      setUser(currentUser);

      const supabase = createClient();
      
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status, is_verified, verification_doc_url')
        .eq('id', currentUser.id)
        .single();

      // Check if user has already submitted verification
      const { data: requests } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requests && requests.length > 0) {
        setVerificationRequest(requests[0]);
        setHasSubmitted(true);
      }

      setVerificationStatus(profile?.is_verified ? 'verified' : profile?.verification_status || 'not_verified');
    } catch (error) {
      console.error('Error checking verification status:', error);
      showError('Failed to load verification status');
    } finally {
      setPageLoading(false);
    }
  };

  const handleFileUpload = (side: 'front' | 'back') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showError('Please upload JPEG, PNG, or JPG images only');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should be less than 5MB');
      return;
    }

    setDocumentFiles(prev => ({
      ...prev,
      [side]: file
    }));
    showSuccess(`${side === 'front' ? 'Front' : 'Back'} image selected`);
  };

  const removeDocument = (side: 'front' | 'back') => {
    setDocumentFiles(prev => ({
      ...prev,
      [side]: null
    }));
    showInfo(`${side === 'front' ? 'Front' : 'Back'} image removed`);
  };

  const submitVerification = async () => {
    if (!documentFiles.front || !documentFiles.back) {
      showError('Please upload both front and back images of your document');
      return;
    }

    setUploading(true);
    const loadingToast = showLoading('Submitting verification request...');

    try {
      const supabase = createClient();

      // Upload front image
      const frontFileExt = documentFiles.front.name.split('.').pop();
      const frontFileName = `${user.id}/verification/${Date.now()}_front.${frontFileExt}`;

      const { error: frontUploadError } = await supabase.storage
        .from('verification-docs')
        .upload(frontFileName, documentFiles.front);

      if (frontUploadError) throw frontUploadError;

      const { data: { publicUrl: frontUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(frontFileName);

      // Upload back image
      const backFileExt = documentFiles.back.name.split('.').pop();
      const backFileName = `${user.id}/verification/${Date.now()}_back.${backFileExt}`;

      const { error: backUploadError } = await supabase.storage
        .from('verification-docs')
        .upload(backFileName, documentFiles.back);

      if (backUploadError) throw backUploadError;

      const { data: { publicUrl: backUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(backFileName);

      // Create verification request with both images
      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          document_type: documentType,
          front_image_url: frontUrl,
          back_image_url: backUrl,
          status: 'pending'
        });

      if (requestError) throw requestError;

      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'pending'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setVerificationStatus('pending');
      setHasSubmitted(true);
      dismissToast(loadingToast);
      showSuccess('Verification submitted! We will review it within 24 hours.');
      
      // Refresh status
      setTimeout(() => {
        checkVerificationStatus();
      }, 1000);
      
    } catch (error: any) {
      console.error('Verification error:', error);
      dismissToast(loadingToast);
      showError('Failed to submit verification. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Document types - Only 3 options
  const documentTypes = [
    { 
      value: 'nic', 
      label: 'National Identity Card (NIC)', 
      description: 'Pakistan National ID Card',
      icon: '🆔',
      frontLabel: 'Front Side (Photo & Details)',
      backLabel: 'Back Side (Address & Barcode)'
    },
    { 
      value: 'passport', 
      label: 'Passport', 
      description: 'Valid Passport',
      icon: '📘',
      frontLabel: 'Photo Page',
      backLabel: 'Last Page (If any details)'
    },
    { 
      value: 'driving', 
      label: 'Driving License', 
      description: 'Valid Driving License',
      icon: '🚗',
      frontLabel: 'Front Side',
      backLabel: 'Back Side (If applicable)'
    },
  ];

  // Render document type selection cards
  const renderDocumentTypeCards = () => (
    <div className="space-y-4 mb-6">
      <p className="text-gray-700 font-medium">Select Document Type (Choose one):</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documentTypes.map((doc) => (
          <div
            key={doc.value}
            onClick={() => !hasSubmitted && setDocumentType(doc.value)}
            className={`border-2 rounded-xl p-4 transition-all ${
              documentType === doc.value
                ? 'border-red-500 bg-red-50 shadow-sm'
                : hasSubmitted
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-70'
                : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md cursor-pointer'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  documentType === doc.value ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {doc.icon}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{doc.label}</span>
                  {documentType === doc.value && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                {hasSubmitted && documentType !== doc.value && (
                  <p className="text-xs text-red-500 mt-2">Cannot change after submission</p>
                )}
              </div>
            </div>
            
            {/* Radio button - hidden but accessible */}
            <input
              type="radio"
              name="documentType"
              value={doc.value}
              checked={documentType === doc.value}
              onChange={(e) => !hasSubmitted && setDocumentType(e.target.value)}
              disabled={hasSubmitted}
              className="sr-only"
            />
          </div>
        ))}
      </div>
      
      {/* Selected document indicator */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-full">
          <span className="text-red-700 font-medium">
            Selected: {documentTypes.find(d => d.value === documentType)?.label}
          </span>
          {hasSubmitted && (
            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              Cannot be changed
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Render file upload section for both sides
  const renderFileUpload = () => {
    const selectedDoc = documentTypes.find(d => d.value === documentType);
    
    return (
      <div className="space-y-6 mb-6">
        {/* Front Side Upload */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            📷 {selectedDoc?.frontLabel}
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors bg-gray-50">
            <input
              type="file"
              id="front-upload"
              onChange={handleFileUpload('front')}
              accept=".jpg,.jpeg,.png"
              disabled={hasSubmitted}
              className="hidden"
            />
            
            {documentFiles.front ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{documentFiles.front.name}</p>
                  <p className="text-gray-600 text-sm">
                    {(documentFiles.front.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!hasSubmitted && (
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById('front-upload')?.click()}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocument('front')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <label 
                htmlFor="front-upload" 
                className={`cursor-pointer block space-y-3 ${hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Upload Front Side</p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG (Max 5MB)
                  </p>
                  {hasSubmitted && (
                    <p className="text-xs text-red-500 mt-1">Already submitted</p>
                  )}
                </div>
                {!hasSubmitted && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('front-upload')?.click()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                      Browse Front Image
                    </button>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* Front Preview */}
          {documentFiles.front && (
            <div className="mt-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <img
                  src={URL.createObjectURL(documentFiles.front)}
                  alt="Front Side Preview"
                  className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                />
                <p className="text-sm text-gray-500 text-center mt-2">
                  Front side preview
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back Side Upload */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
          📷 {selectedDoc?.backLabel}
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors bg-gray-50">
            <input
              type="file"
              id="back-upload"
              onChange={handleFileUpload('back')}
              accept=".jpg,.jpeg,.png"
              disabled={hasSubmitted}
              className="hidden"
            />
            
            {documentFiles.back ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{documentFiles.back.name}</p>
                  <p className="text-gray-600 text-sm">
                    {(documentFiles.back.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!hasSubmitted && (
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById('back-upload')?.click()}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocument('back')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <label 
                htmlFor="back-upload" 
                className={`cursor-pointer block space-y-3 ${hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Upload Back Side</p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG (Max 5MB)
                  </p>
                  {hasSubmitted && (
                    <p className="text-xs text-red-500 mt-1">Already submitted</p>
                  )}
                </div>
                {!hasSubmitted && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('back-upload')?.click()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                      Browse Back Image
                    </button>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* Back Preview */}
          {documentFiles.back && (
            <div className="mt-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <img
                  src={URL.createObjectURL(documentFiles.back)}
                  alt="Back Side Preview"
                  className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                />
                <p className="text-sm text-gray-500 text-center mt-2">
                  Back side preview
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Important Note */}
        {!hasSubmitted && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Important Notice</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• You can submit verification <span className="font-bold">ONLY ONCE</span></li>
              <li>• After submission, you cannot change document type or images</li>
              <li>• Make sure both images are clear and readable</li>
              <li>• Double-check before submitting</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Loading Spinner for page
  if (pageLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading verification status...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-8">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Verification</h1>
                <p className="text-gray-600">Verify once, list unlimited cars</p>
              </div>
            </div>

            {/* Status Display */}
            {verificationStatus === 'verified' ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-semibold text-green-800">Your account is verified!</p>
                      <p className="text-green-700">You can now list cars for sale.</p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Verification Complete! ✅
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your account has been successfully verified.
                  </p>
                  <button
                    onClick={() => router.push('/sell')}
                    className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    List Your First Car
                  </button>
                </div>
              </div>
            ) : verificationStatus === 'pending' ? (
              <div className="space-y-6">
                {/* Pending Status */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Verification Pending</p>
                      <p className="text-yellow-700">
                        Your document is under review. This usually takes 24 hours.
                      </p>
                      
                      {verificationRequest && (
                        <div className="mt-3 text-sm text-yellow-800">
                          <p>• Submitted on: {formatDate(verificationRequest.created_at)}</p>
                          <p>• Document Type: {verificationRequest.document_type.toUpperCase()}</p>
                          <p>• Status: <span className="font-semibold">Pending Review</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Already Submitted Notice */}
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <History className="h-5 w-5 mr-2 text-gray-600" />
                    Verification Already Submitted
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You have already submitted your verification documents. You cannot change or resubmit.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <span className="font-semibold">Note:</span> If there's an issue with your submission, 
                        please contact our support team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Check Status Button with loading */}
                <div className="text-center">
                  <button
                    onClick={checkVerificationStatus}
                    disabled={uploading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Checking...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Check Verification Status
                      </div>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Click to refresh and check if your verification is complete
                  </p>
                </div>
              </div>
            ) : (
              /* Not Verified - Show Full Form */
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-semibold text-blue-800">Verification Required</p>
                      <p className="text-blue-700">
                        Upload both sides of any one document to verify your account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Selection Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Choose Document Type</h3>
                  <p className="text-gray-600 text-sm">
                    Select one document type and upload BOTH front and back images. 
                    You can only submit once, so choose carefully.
                  </p>
                </div>

                {/* Document Type Selection */}
                {renderDocumentTypeCards()}

                {/* File Upload Section - Both sides */}
                {renderFileUpload()}

                {/* Upload Guidelines */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Guidelines:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Upload BOTH front and back sides of the document</li>
                    <li>• Ensure all text is clearly visible and readable</li>
                    <li>• Take photos in good lighting with no glare</li>
                    <li>• All corners of the document should be visible</li>
                    <li>• Do not edit or modify the images</li>
                    <li>• File size must be less than 5MB each</li>
                  </ul>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">🔒 Privacy & Security</h3>
                  <p className="text-sm text-blue-700">
                    Your documents are stored securely and encrypted. We only use them for verification 
                    and never share with third parties.
                  </p>
                </div>

                {/* Submit Button with loading spinner */}
                <button
                  onClick={submitVerification}
                  disabled={uploading || hasSubmitted || !documentFiles.front || !documentFiles.back}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all shadow-lg flex items-center justify-center ${
                    hasSubmitted || !documentFiles.front || !documentFiles.back
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl'
                  }`}
                >
                  {hasSubmitted ? (
                    'Already Submitted'
                  ) : uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Verification...
                    </>
                  ) : !documentFiles.front || !documentFiles.back ? (
                    'Upload Both Images First'
                  ) : (
                    'Submit Verification (One Time Only)'
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  ⚠️ You can only submit verification once. Double-check before submitting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}