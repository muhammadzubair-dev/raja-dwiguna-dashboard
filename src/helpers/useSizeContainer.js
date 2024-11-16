import { create } from 'zustand';

const useSizeContainer = create((set) => ({
  sizeContainer: 'fit', // fit or fluid
  updateSizeContainer: (newSize) => set({ sizeContainer: newSize }),
}));

export default useSizeContainer;
