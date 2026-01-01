import toast from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
    },
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const showConfirm = (
  title: string,
  message: string,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in';
    
    // Modal header
    const header = document.createElement('div');
    header.className = 'mb-4';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'text-xl font-bold text-gray-900';
    titleEl.textContent = title;
    
    // Modal body
    const body = document.createElement('div');
    body.className = 'mb-6';
    
    const messageEl = document.createElement('p');
    messageEl.className = 'text-gray-600';
    messageEl.textContent = message;
    
    // Modal footer
    const footer = document.createElement('div');
    footer.className = 'flex gap-3 justify-end';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors';
    cancelBtn.textContent = cancelText;
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium';
    confirmBtn.textContent = confirmText;
    
    // Event listeners
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
      resolve(false);
    };
    
    confirmBtn.onclick = () => {
      document.body.removeChild(modal);
      resolve(true);
    };
    
    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(false);
      }
    };
    
    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
        resolve(false);
      }
    };
    
    // Assemble modal
    header.appendChild(titleEl);
    body.appendChild(messageEl);
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    document.addEventListener('keydown', handleEscape);
    
    // Focus on cancel button by default
    cancelBtn.focus();
  });
};