import { create } from 'zustand';
import { Invitation } from '../types';

interface InvitationStore {
  currentInvitation: Invitation | null;
  setCurrentInvitation: (invitation: Invitation) => void;
  clearCurrentInvitation: () => void;
}

export const useInvitationStore = create<InvitationStore>((set) => ({
  currentInvitation: null,
  setCurrentInvitation: (invitation) => set({ currentInvitation: invitation }),
  clearCurrentInvitation: () => set({ currentInvitation: null }),
}));
