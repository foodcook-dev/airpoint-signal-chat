import { create } from 'zustand';

interface ConfirmState {
  title: string;
  message: string;
  isOpen: boolean;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  showConfirm: (config: {
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  closeConfirm: () => void;
}

const useConfirmStore = create<ConfirmState>((set) => ({
  title: '알림',
  message: '',
  isOpen: false,
  onConfirm: null,
  onCancel: null,
  showConfirm: ({ title = '알림', message, onConfirm, onCancel }) =>
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
    }),
  closeConfirm: () =>
    set({
      isOpen: false,
      title: '알림',
      message: '',
      onConfirm: null,
      onCancel: null,
    }),
}));

export default useConfirmStore;
