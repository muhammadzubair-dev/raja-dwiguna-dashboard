import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const usePrivileges = create(
  persist(
    (set) => ({
      privileges: [],
      updatePrivileges: (newPrivileges) => set({ privileges: newPrivileges }),
    }),
    {
      name: 'privileges',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default usePrivileges;
