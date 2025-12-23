import toast, { Toaster, ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: '#000',
    color: '#fff',
    borderRadius: '8px',
    padding: '12px 16px',
  },
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    ...defaultOptions.style,
    background: '#10b981',
  },
  icon: '✓',
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    ...defaultOptions.style,
    background: '#ef4444',
  },
  icon: '✕',
};

const loadingOptions: ToastOptions = {
  ...defaultOptions,
  duration: Infinity,
};

export const Toast = {
  success: (message: string) => toast.success(message, successOptions),
  error: (message: string) => toast.error(message, errorOptions),
  loading: (message: string) => toast.loading(message, loadingOptions),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      defaultOptions
    );
  },
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

export function ToastProvider() {
  return <Toaster />;
}

export default Toast;
