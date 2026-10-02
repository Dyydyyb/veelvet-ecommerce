import { create } from 'zustand';

interface UIState {
  isSizeGuideOpen: boolean;
  sizeGuideDefaultTab: 'buzo' | 'pantalon';
  isShowroomModalOpen: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'info' | 'error';
  
  openSizeGuide: (defaultTab?: 'buzo' | 'pantalon') => void;
  closeSizeGuide: () => void;
  openShowroomModal: () => void;
  closeShowroomModal: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSizeGuideOpen: false,
  sizeGuideDefaultTab: 'buzo',
  isShowroomModalOpen: false,
  toastMessage: null,
  toastType: 'success',

  openSizeGuide: (defaultTab = 'buzo') => set({ isSizeGuideOpen: true, sizeGuideDefaultTab: defaultTab }),
  closeSizeGuide: () => set({ isSizeGuideOpen: false }),

  openShowroomModal: () => set({ isShowroomModalOpen: true }),
  closeShowroomModal: () => set({ isShowroomModalOpen: false }),

  showToast: (message, type = 'success') => {
    set({ toastMessage: message, toastType: type });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3500);
  },
  hideToast: () => set({ toastMessage: null }),
}));
