import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('OAuth Error:', error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: supabaseError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (supabaseError) {
      console.error('Supabase Auth Error:', supabaseError.message);
      return NextResponse.redirect(
        `${requestUrl.origin}/?error=${encodeURIComponent(supabaseError.message)}`
      );
    }
  }

  // Redirect to dashboard after successful sign in
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}