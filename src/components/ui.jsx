import React from 'react';
import { X } from 'lucide-react';

export const Card = ({ className = '', children, ...p }) => <div className={`card p-5 ${className}`} {...p}>{children}</div>;
export const Button = ({ variant='primary', className='', children, ...p }) => {
  const cls = variant==='primary'?'btn btn-primary':variant==='ghost'?'btn btn-ghost':'btn btn-soft';
  return <button className={`${cls} ${className}`} {...p}>{children}</button>;
};
export const Input = ({ className='', ...p }) => <input className={`input ${className}`} {...p} />;
export const Textarea = ({ className='', ...p }) => <textarea className={`input ${className}`} {...p} />;

export const ProgressBar = ({ value=0, className='', tone='sage' }) => {
  const tones = { sage:'bg-sage', mint:'bg-mint', pastel:'bg-pastel', lavender:'bg-lavender' };
  return (
    <div className={`w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden ${className}`}>
      <div className={`h-full ${tones[tone]||tones.sage} transition-all`} style={{width: `${Math.max(0, Math.min(100, value))}%`}}/>
    </div>
  );
};

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white dark:bg-[#1e2227] rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 sticky top-0 bg-white dark:bg-[#1e2227] z-10">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><X size={18}/></button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="p-4 border-t border-black/5 dark:border-white/5 sticky bottom-0 bg-white dark:bg-[#1e2227]">{footer}</div>}
      </div>
    </div>
  );
}

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6">
    {Icon && <div className="w-14 h-14 rounded-2xl bg-sage/20 dark:bg-white/10 flex items-center justify-center mb-3"><Icon size={22}/></div>}
    <h4 className="font-semibold text-lg">{title}</h4>
    {description && <p className="text-sm text-ink/60 dark:text-white/60 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Chip = ({ tone='sage', children }) => {
  const t = {
    sage:'bg-sage/25 text-ink dark:bg-sage/25 dark:text-white',
    lavender:'bg-lavender text-ink dark:bg-lavender/20 dark:text-white',
    pastel:'bg-pastel text-ink dark:bg-pastel/20 dark:text-white',
    mint:'bg-mint text-ink dark:bg-mint/20 dark:text-white',
    danger:'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    ink:'bg-ink text-white dark:bg-white dark:text-ink',
  };
  return <span className={`chip ${t[tone]||t.sage}`}>{children}</span>;
};

export function Confirm({ open, onClose, onConfirm, title='Are you sure?', description, confirmLabel='Delete' }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink/70 dark:text-white/70">{description}</p>
      <div className="mt-5 flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <button className="btn bg-red-600 text-white" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
                                                                                                                  }
