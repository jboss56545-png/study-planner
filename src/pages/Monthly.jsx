import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, addDays, monthKey, pad } from '../utils/date';
import { Card, Button, Input, Modal } from '../components/ui';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus } from 'lucide-react';

function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday start
  const start = new Date(year, month, 1 - offset);
  return Array.from({length:42}, (_,i) => addDays(start, i));
}

export default function Monthly() {
  const { state, addTask, toggleTask, setMonthlyNotes } = useApp();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [adding, setAdding] = useState(null);
  const [title, setTitle] = useState('');

  const grid = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const key = monthKey(cursor);

  const shift = (delta) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+delta, 1));
  const doAdd = () => { if (!title.trim() || !adding) return; addTask({ title: title.trim(), scheduledDate: adding, quadrant: 2 }); setTitle(''); setAdding(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={()=>shift(-1)} className="btn btn-ghost !px-2"><ChevronLeft size={18}/></button>
        <div className="font-semibold text-lg">{cursor.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</div>
        <button onClick={()=>shift(1)} className="btn btn-ghost !px-2"><ChevronRight size={18}/></button>
      </div>

      <Card className="!p-2 md:!p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-ink/50 mb-1">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map(d => {
            const k = dateKey(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = k === dateKey();
            const tasks = state.tasks.filter(t => t.scheduledDate === k);
            return (
              <div key={k} className={`min-h-[64px] md:min-h-[80px] rounded-lg p-1 text-left ${inMonth?'bg-black/[.02] dark:bg-white/5':'opacity-40'} ${isToday?'ring-2 ring-sage':''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{d.getDate()}</span>
                  <button onClick={()=>{ setAdding(k); setTitle(''); }} className="opacity-0 hover:opacity-100 focus:opacity-100 text-ink/40"><Plus size={11}/></button>
                </div>
                <ul className="mt-0.5 space-y-0.5">
                  {tasks.slice(0,2).map(t => (
                    <li key={t.id} className="text-[10px] truncate flex items-center gap-1">
                      <button onClick={()=>toggleTask(t.id)}>{t.done?<CheckCircle2 size={9} className="text-sage"/>:<Circle size={9}/>}</button>
                      <span className={t.done?'line-through text-ink/40':''}>{t.title}</span>
                    </li>
                  ))}
                  {tasks.length>2 && <li className="text-[10px] text-ink/40">+{tasks.length-2} more</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Monthly notes</h3>
        <textarea className="input" rows={4} value={state.monthlyNotes[key]||''} onChange={e=>setMonthlyNotes(key, e.target.value)} placeholder="Reflections, reminders for the month…"/>
      </Card>

      <Modal open={!!adding} onClose={()=>setAdding(null)} title="Add task" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setAdding(null)}>Cancel</Button><Button onClick={doAdd}>Add</Button></div>}>
        <Input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" onKeyDown={e=>e.key==='Enter'&&doAdd()}/>
        {adding && <p className="text-xs text-ink/50 mt-2">Scheduled for {adding}</p>}
      </Modal>
    </div>
  );
}
