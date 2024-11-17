import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useSizeContainer = create(
  persist(
    (set) => ({
      sizeContainer: 'fluid', // fit or fluid
      updateSizeContainer: (newSize) => set({ sizeContainer: newSize }),
    }),
    {
      name: 'size-container',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSizeContainer;
