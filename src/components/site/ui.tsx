import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type UI = {
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  quickView: string | null;
  setQuickView: (handle: string | null) => void;
};

const Ctx = createContext<UI | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<string | null>(null);
  const value = useMemo(() => ({ bagOpen, setBagOpen, searchOpen, setSearchOpen, quickView, setQuickView }), [bagOpen, searchOpen, quickView]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUI outside UIProvider');
  return v;
};
