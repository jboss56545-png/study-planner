import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, startOfWeek, addDays, weekKey } from '../utils/date';
import { Card, Button, Input, ProgressBar, Modal } from '../components/ui';
import { Plus, CheckCircle2, Circle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function Weekly() {
  const { state, addTask, toggleTask, updateTask, setWeeklyNotes } = useApp();
  const [offset, setOffset] = useState(0);
  const [adding, setAdding] = useState(null);
  const [title, setTitle] = useState('');

  const ws = startOfWeek(addDays(new Date(), offset*7));
  const days = Array.from({length:7}, (_,i) => addDays(ws, i));
  const key = weekKey(ws);
  const weekTasks = state.tasks.filter(t => t.scheduledDate && days.some(d => dateKey(d)===t.scheduledDate));
  const done = weekTasks.filter(t => t.done).length;
  const pct = weekTasks.length ? Math.round(done/weekTasks.length*100) : 0;

  const doAdd = () => { if (!title.trim() || !adding) return; addTask({ title: title.trim(), scheduledDate: adding, quadrant: 2 }); setTitle(''); setAdding(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={()=>setOffset(o=>o-1)} className="btn btn-ghost !px-2"><ChevronLeft size={18}/></button>
        <div className="text-center">
          <div className="font-semibold">{ws.toLocaleDateString(undefined,{month:'short',day:'numeric'})} — {addDays(ws,6).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</div>
          <div className="text-xs text-ink/50">{offset===0?'This week':''}</div>
        </div>
        <button onClick={()=>setOffset(o=>o+1)} className="btn btn-ghost !px-2"><ChevronRight size={18}/></button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2"><h2 className="font-semibold">Week progress</h2><span className="text-sm">{done}/{weekTasks.length} · {pct}%</span></div>
        <ProgressBar value={pct}/>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {days.map(d => {
          const k = dateKey(d);
          const tasks = state.tasks.filter(t => t.scheduledDate===k);
          const isToday = k===dateKey();
          return (
            <Card key={k} className={`!p-3 ${isToday?'ring-2 ring-sage':''}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink/50">{d.toLocaleDateString(undefined,{weekday:'short'})}</div>
                  <div className="font-semibold">{d.getDate()}</div>
                </div>
                <button onClick={()=>{ setAdding(k); setTitle(''); }} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"><Plus size={14}/></button>
              </div>
              <ul className="space-y-1">
                {tasks.map(t => (
                  <li key={t.id} className="text-xs flex items-start gap-1.5">
                    <button onClick={()=>toggleTask(t.id)}>{t.done?<CheckCircle2 size={14} className="text-sage"/>:<Circle size={14}/>}</button>
                    <span className={`flex-1 ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                  </li>
                ))}
                {tasks.length===0 && <li className="text-[11px] text-ink/30">—</li>}
              </ul>
              {tasks.some(t=>!t.done) && (
                <button onClick={() => { const next = dateKey(addDays(d,1)); tasks.filter(t=>!t.done).forEach(t=>updateTask(t.id,{ scheduledDate: next })); }}
                  className="mt-2 text-[11px] text-ink/50 hover:underline flex items-center gap-1"><ArrowRight size={10}/> Move unfinished</button>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="font-semibold mb-2">Weekly notes</h3>
        <textarea className="input" rows={4} value={state.weeklyNotes[key]||''} onChange={e=>setWeeklyNotes(key, e.target.value)} placeholder="Reflections, reminders…"/>
      </Card>

      <Modal open={!!adding} onClose={()=>setAdding(null)} title="Add task to day" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setAdding(null)}>Cancel</Button><Button onClick={doAdd}>Add</Button></div>}>
        <Input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" onKeyDown={e=>e.key==='Enter'&&doAdd()}/>
      </Modal>
    </div>
  );
}
