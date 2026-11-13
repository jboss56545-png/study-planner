import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type='info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed top-3 right-3 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const I = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info;
          return (
            <div key={t.id} className="pointer-events-auto bg-ink text-white dark:bg-white dark:text-ink px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm max-w-xs">
              <I size={16}/><span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
