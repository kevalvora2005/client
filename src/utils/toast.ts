import { toast, type ToastOptions, type Id } from 'react-toastify';
import i18n from 'i18next';

const MAX_TOASTS = 5;
const activeToastIds: Id[] = [];

toast.onChange((payload) => {
  if (payload.status === 'removed') {
    const index = activeToastIds.indexOf(payload.id);
    if (index !== -1) activeToastIds.splice(index, 1);
  }
});

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 2000,
};

const notify = (
  type: 'success' | 'error' | 'warning' | 'info',
  msg: string,
  options?: ToastOptions
) => {
  while (activeToastIds.length >= MAX_TOASTS) {
    const oldest = activeToastIds.shift();
    if (oldest !== undefined) toast.dismiss(oldest);
  }

  const text = i18n.t(msg);
  const id = toast[type](text, { ...defaultOptions, ...options });
  if (id !== undefined && !activeToastIds.includes(id)) {
    activeToastIds.push(id);
  }
};

export const showSuccess = (msg: string, opt?: ToastOptions) => notify('success', msg, opt);
export const showError = (msg: string, opt?: ToastOptions) => notify('error', msg, opt);
export const showWarning = (msg: string, opt?: ToastOptions) => notify('warning', msg, opt);
export const showInfo = (msg: string, opt?: ToastOptions) => notify('info', msg, opt);

export const useToast = () => ({
  showSuccess,
  showError,
  showWarning,
  showInfo,
});