import { create } from 'zustand';

interface AlertState {
  message: string | null;
  isOpen: boolean;
  showAlert: (message: string) => void;
  closeAlert: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  message: null,
  isOpen: false,
  showAlert: (message) => set({ isOpen: true, message }),
  closeAlert: () => set({ isOpen: false, message: null }),
}));

export default useAlertStore;
