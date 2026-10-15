import { createContext, useContext, type ComponentType, type ReactNode } from 'react';
export type DesignSystem = {
  palette: { bg: string; text: string; accent: string };
  fonts: { display: string; body: string };
  typeScale: { hero: number; body: number };
  radius: number;
};
export type Page = ComponentType & { transition?: unknown };
export type SlideMeta = { title?: string; theme?: string; createdAt?: string };
const Ctx = createContext<{ index: number; total: number } | null>(null);
export const PageProvider = Ctx.Provider;
export function useSlidePageNumber() {
  const v = useContext(Ctx);
  if (!v) throw new Error('no page context');
  return { current: v.index + 1, total: v.total };
}
export function Steps({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function Step({ children }: { children?: ReactNode; duration?: number }) {
  return <div data-osd-step="revealed">{children}</div>;
}
