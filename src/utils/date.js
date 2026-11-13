export const pad = n => String(n).padStart(2, '0');
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
export const weekKey = (d = new Date()) => {
  const t = new Date(d); t.setHours(0,0,0,0);
  const day = t.getDay() || 7;
  t.setDate(t.getDate() + 4 - day);
  const ys = new Date(t.getFullYear(), 0, 1);
  return `${t.getFullYear()}-W${pad(Math.ceil((((t-ys)/86400000)+1)/7))}`;
};
export const startOfWeek = (d = new Date()) => {
  const t = new Date(d); t.setHours(0,0,0,0);
  const day = t.getDay() || 7;
  t.setDate(t.getDate() - (day - 1));
  return t;
};
export const addDays = (d, n) => { const t = new Date(d); t.setDate(t.getDate()+n); return t; };
export const fmtDateShort = (iso) => iso ? new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'}) : '';
export const isOverdue = (iso) => iso && new Date(iso) < new Date(new Date().toDateString());
