import React from 'react';
import { X } from 'lucide-react';

export const Card = ({ className = '', children, ...p }) => <div className={`card p-5 ${className}`} {...p}>{children}</div>;

export const Button = ({ variant='primary', className='', children, ...p }) => {
  const cls = variant==='primary'?'btn btn-primary':variant==='ghost'?'btn btn-ghost':'btn btn-soft';
  return <button className={`${cls} ${className}`} {...p}>{children}</button>;
};

export const Input = ({ className='', ...p }) => <input className={`input ${className}`} {...p} />;
export const Textarea = ({ className='', ...p }) => <textarea className={`input ${className}`} {...p} />;

export const ProgressBar = ({ value=0, className='', tone='primary' }) => {
  const tones = { primary:'bg-primary', secondary:'bg-secondary', lavender:'bg-lavender', success:'bg-success' };
  return (
    <div className={`w-full h-2 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <div className={`h-full ${tones[tone]||tones.primary} transition-all duration-700 ease-out`} style={{width: `${Math.max(0, Math.min(100, value))}%`}}/>
    </div>
  );
};

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-base/80 backdrop-blur-sm animate-fade-in-up sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-panel/95 backdrop-blur-2xl border border-borderGlass rounded-t-3xl sm:rounded-3xl shadow-glass max-h-[92vh] overflow-y-auto animate-pop-in" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-panel/95 backdrop-blur-xl z-10 rounded-t-3xl">
          <h3 className="font-bold text-lg text-[#F1F5F9]">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-[#94A3B8] hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="p-5 border-t border-white/5 sticky bottom-0 bg-panel/95 backdrop-blur-xl rounded-b-3xl">{footer}</div>}
      </div>
    </div>
  );
}

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-in-up">
    {Icon && <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 animate-float shadow-glow-primary"><Icon size={32} className="text-primary"/></div>}
    <h4 className="font-bold text-xl text-[#F1F5F9]">{title}</h4>
    {description && <p className="text-sm text-[#94A3B8] mt-2 max-w-sm leading-relaxed">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const Chip = ({ tone='primary', children }) => {
  const t = {
    primary:'bg-primary/10 border-primary/20 text-primary',
    secondary:'bg-secondary/10 border-secondary/20 text-secondary',
    lavender:'bg-lavender/10 border-lavender/20 text-lavender',
    success:'bg-success/10 border-success/20 text-success',
    warning:'bg-warning/10 border-warning/20 text-warning',
    danger:'bg-danger/10 border-danger/20 text-danger',
  };
  return <span className={`chip ${t[tone]||t.primary}`}>{children}</span>;
};

export function Confirm({ open, onClose, onConfirm, title='Are you sure?', description, confirmLabel='Delete' }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>
      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <button className="btn bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
