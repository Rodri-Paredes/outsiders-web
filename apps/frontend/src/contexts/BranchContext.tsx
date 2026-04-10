'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BranchId = '2953bdad-4079-4389-b66c-522ef897756d' | '68a8c694-c872-4814-8618-bdf02277771c';

export interface BranchInfo {
  id: BranchId;
  name: string;
  label: string;
  city: string;
}

export const BRANCHES: BranchInfo[] = [
  {
    id: '2953bdad-4079-4389-b66c-522ef897756d',
    name: 'Sucursal Cochabamba',
    label: 'Cochabamba',
    city: 'Cochabamba',
  },
  {
    id: '68a8c694-c872-4814-8618-bdf02277771c',
    name: 'Sucursal Santa Cruz',
    label: 'Santa Cruz',
    city: 'Santa Cruz',
  },
];

interface BranchContextValue {
  selectedBranch: BranchInfo | null;
  setBranch: (branch: BranchInfo) => void;
  isLoaded: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const STORAGE_KEY = 'outsiders_branch';
const EXPIRY_HOURS = 24;

const BranchContext = createContext<BranchContextValue>({
  selectedBranch: null,
  setBranch: () => {},
  isLoaded: false,
  showModal: false,
  setShowModal: () => {},
});

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<BranchInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { branchId, expiresAt } = JSON.parse(stored);
        if (Date.now() < expiresAt) {
          const branch = BRANCHES.find((b) => b.id === branchId);
          if (branch) {
            setSelectedBranch(branch);
            setIsLoaded(true);
            return;
          }
        }
        // Expired or invalid — clear it
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    // No valid saved branch — show modal
    setShowModal(true);
    setIsLoaded(true);
  }, []);

  const setBranch = (branch: BranchInfo) => {
    setSelectedBranch(branch);
    setShowModal(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          branchId: branch.id,
          expiresAt: Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
        })
      );
    } catch {
      // localStorage not available (e.g. SSR)
    }
  };

  return (
    <BranchContext.Provider value={{ selectedBranch, setBranch, isLoaded, showModal, setShowModal }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}
