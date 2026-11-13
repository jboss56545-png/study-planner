import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey } from '../utils/date';
import { Card, Button, Input, Modal, EmptyState, Chip, Confirm } from '../components/ui';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATS = [
  { id:'use', label:'Use', tone:'mint', desc:'Productive activity' },
  { id:'invest', label:'Invest', tone:'sage', desc:'Improves future productivity' },
  { id:'waste', label:'Waste', tone:'lavender', desc:'Low-value time' },
];
const COLORS = { use:'#D5EDE3', invest:'#A8B9A0', waste:'#EAE3F2' };

export default function TimeAudit() {
  const { state, addTimeAudit, deleteTimeAudit } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ activity:'', category:'use', duration:30, date: dateKey(), notes:'' });
  const [confirmDel, setConfirmDel] = useState(null);

  const entries = state.timeAudit;
  const totals = useMemo(() => CATS.map(c => ({ name: c.label, value: entries.filter(e => e.category===c.id).reduce((a,e) => a+e.duration, 0), id: c.id })).filter(x => x.value>0), [entries]);
  const totalMinutes = entries.reduce((a,e) => a+e.duration, 0);

  const save = () => {
    if (!form.activity.trim() || !form.duration) return;
    addTimeAudit({ ...form, duration: Number(form.duration) });
    setForm({ activity:'', category:'use', duration:30, date: dateKey(), notes:'' });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/60 dark:text-white/60">{entries.length} entries · {Math.round(totalMinutes/60)}h logged</p>
        <Button onClick={()=>setOpen(true)}><Plus size={16}/> Log activity</Button>
      </div>

      <Card>
        <h3 className="font-semibold mb-2">Time distribution</h3>
        {totals.length === 0 ? (
          <EmptyState icon={Clock} title="Nothing logged yet" description="Log what you did today to see where your time goes." action={<Button onClick={()=>setOpen(true)}>Log activity</Button>}/>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={totals} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {totals.map(t => <Cell key={t.id} fill={COLORS[t.id]}/>)}
                </Pie>
                <Tooltip formatter={(v)=>`${Math.round(v/60*10)/10}h`}/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Recent entries</h3>
        <ul className="divide-y divide-black/5 dark:divide-white/5">
          {entries.slice(0,30).map(e => (
            <li key={e.id} className="py-2.5 flex items-center gap-3">
              <Chip tone={CATS.find(c=>c.id===e.category)?.tone || 'sage'}>{CATS.find(c=>c.id===e.category)?.label}</Chip>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{e.activity}</div>
                <div className="text-xs text-ink/50">{e.date} · {e.duration} min{e.notes?` · ${e.notes}`:''}</div>
              </div>
              <button onClick={()=>setConfirmDel(e.id)} className="text-red-500"><Trash2 size={14}/></button>
            </li>
          ))}
          {entries.length===0 && <li className="py-6 text-center text-sm text-ink/40">No entries yet.</li>}
        </ul>
      </Card>

      <Modal open={open} onClose={()=>setOpen(false)} title="Log activity" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>}>
        <div className="space-y-3">
          <div><label className="label">Activity</label><Input autoFocus value={form.activity} onChange={e=>setForm({...form,activity:e.target.value})} placeholder="e.g. Deep work on report"/></div>
          <div><label className="label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATS.map(c => (
                <button key={c.id} onClick={()=>setForm({...form,category:c.id})} className={`p-2 rounded-xl text-left text-xs border ${form.category===c.id?'border-ink dark:border-white':'border-black/10 dark:border-white/15'}`}>
                  <div className="font-semibold">{c.label}</div>
                  <div className="text-ink/50 dark:text-white/50">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Minutes</label><Input type="number" min="1" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/></div>
            <div><label className="label">Date</label><Input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          </div>
          <div><label className="label">Notes (optional)</label><Input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        </div>
      </Modal>

      <Confirm open={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>deleteTimeAudit(confirmDel)} title="Delete entry?"/>
    </div>
  );
}
