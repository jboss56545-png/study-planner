import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Card, Button, Input, Modal, EmptyState } from '../components/ui';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { fmtDateShort, isOverdue } from '../utils/date';

const Q = [
  { id:1, title:'Do Now', sub:'Important · Urgent' },
  { id:2, title:'Schedule', sub:'Important · Not Urgent' },
  { id:3, title:'Delegate', sub:'Not Important · Urgent' },
  { id:4, title:'Eliminate', sub:'Not Important · Not Urgent' },
];

export default function Matrix() {
  const { state, addTask, toggleTask, updateTask, deleteTask } = useApp();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ title:'', deadline:'' });
  const [filter, setFilter] = useState('');
  const [showDone, setShowDone] = useState(false);

  const save = () => {
    if (!form.title.trim()) return;
    addTask({ title: form.title.trim(), quadrant: open, deadline: form.deadline || null });
    setOpen(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Input className="!w-auto flex-1 min-w-[200px]" placeholder="Search tasks…" value={filter} onChange={e => setFilter(e.target.value)}/>
        <label className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white dark:bg-white/5 cursor-pointer">
          <input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)}/> Show completed
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {Q.map(q => {
          const tasks = state.tasks.filter(t => t.quadrant===q.id && (showDone||!t.done) && t.title.toLowerCase().includes(filter.toLowerCase()));
          return (
            <Card key={q.id}>
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="font-semibold">{q.title}</h3><p className="text-xs text-ink/50 dark:text-white/50">{q.sub}</p></div>
                <button onClick={() => { setOpen(q.id); setForm({title:'',deadline:''}); }} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><Plus size={16}/></button>
              </div>
              <ul className="space-y-1.5 min-h-[100px]">
                {tasks.map(t => (
                  <li key={t.id} className="p-2 rounded-xl bg-black/[.02] dark:bg-white/5 group">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleTask(t.id)}>{t.done?<CheckCircle2 size={16} className="text-sage"/>:<Circle size={16} className="text-ink/40"/>}</button>
                      <span className={`flex-1 text-sm ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                      <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={13}/></button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 ml-6 flex-wrap">
                      {t.deadline && <span className={`text-[11px] ${isOverdue(t.deadline)&&!t.done?'text-red-600':'text-ink/50 dark:text-white/50'}`}>{fmtDateShort(t.deadline)}</span>}
                      <select value={t.quadrant} onChange={e => updateTask(t.id, { quadrant: Number(e.target.value) })} className="text-[11px] bg-transparent border border-black/10 dark:border-white/15 rounded-md px-1 py-0.5">
                        {Q.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
                      </select>
                    </div>
                  </li>
                ))}
                {tasks.length === 0 && <li className="text-xs text-ink/40 py-4 text-center">No tasks</li>}
              </ul>
            </Card>
          );
        })}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} title={`Add to ${Q.find(q=>q.id===open)?.title||''}`} footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={save}>Add</Button></div>}>
        <div className="space-y-3">
          <div><label className="label">Task</label><Input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Deadline (optional)</label><Input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
        </div>
      </Modal>
    </div>
  );
}
