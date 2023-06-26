import { create } from 'zustand';
import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';

type State = {
  safeService: SafeApiKit | null;
  safe: Safe | null;
  safeAddress: string | null;
  ethAdapter: EthersAdapter | null;
};

type Actions = {
  actions: {
    setSafeService: (safeService: State['safeService']) => void;
    setSafe: (safe: State['safe']) => void;
    setSafeAddress: (safeAddress: State['safeAddress']) => void;
    setEthAdapter: (ethAdapter: State['ethAdapter']) => void;
  };
};

export const useSafeStore = create<State & Actions>()((set) => ({
  safeService: null,
  safe: null,
  safeAddress: null,
  ethAdapter: null,
  actions: {
    setSafeService: (safeService) => set(() => ({ safeService })),
    setSafe: (safe) => set(() => ({ safe })),
    setSafeAddress: (safeAddress) => set(() => ({ safeAddress })),
    setEthAdapter: (ethAdapter) => set(() => ({ ethAdapter })),
  },
}));

export const useSafeActions = () => useSafeStore((state) => state.actions);
export const useSafeService = () => useSafeStore((state) => state.safeService);
export const useSafe = () => useSafeStore((state) => state.safe);
export const useSafeAddress = () => useSafeStore((state) => state.safeAddress);
export const useEthAdapter = () => useSafeStore((state) => state.ethAdapter);
