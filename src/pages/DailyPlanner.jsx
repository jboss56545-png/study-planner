import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, addDays, pad } from '../utils/date';
import { Card, Button, Input, ProgressBar, Modal } from '../components/ui';
import { Plus, CheckCircle2, Circle, ChevronLeft, ChevronRight, Trash2, Star, Calendar, ListTodo } from 'lucide-react';

export default function DailyPlanner() {
  const { state, addTask, toggleTask, deleteTask, updateTask, setDailyNotes, setUser } = useApp();
  const [selected, setSelected] = useState(dateKey());
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [editHours, setEditHours] = useState(false);
  const [hoursForm, setHoursForm] = useState(state.user.workingHours);

  const tasks = state.tasks.filter(t => t.scheduledDate === selected);
  const priorities = tasks.filter(t => t.isPriority);
  const todos = tasks.filter(t => !t.isPriority);
  const completed = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(completed/tasks.length*100) : 0;
  const notes = state.dailyNotes[selected] || '';

  const schedule = useMemo(() => {
    const [sh] = state.user.workingHours.start.split(':').map(Number);
    const [eh] = state.user.workingHours.end.split(':').map(Number);
    const arr = [];
    for (let h = sh; h < eh; h++) arr.push(`${pad(h)}:00`);
    return arr;
  }, [state.user.workingHours]);

  const prev = () => setSelected(dateKey(addDays(new Date(selected), -1)));
  const next = () => setSelected(dateKey(addDays(new Date(selected), 1)));
  const addNow = (isP) => {
    const title = (isP?newPriority:newTask).trim();
    if (!title) return;
    addTask({ title, scheduledDate: selected, isPriority: isP, quadrant: isP?1:2 });
    isP ? setNewPriority('') : setNewTask('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prev} className="btn btn-ghost !px-2"><ChevronLeft size={18}/></button>
        <div className="text-center">
          <div className="font-semibold">{new Date(selected).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
          <div className="text-xs text-ink/50">{selected===dateKey()?'Today':''}</div>
        </div>
        <button onClick={next} className="btn btn-ghost !px-2"><ChevronRight size={18}/></button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Daily completion</h2>
          <span className="text-sm tabular-nums">{completed}/{tasks.length} · {pct}%</span>
        </div>
        <ProgressBar value={pct}/>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Star size={16}/> Priorities</h3>
          <div className="flex gap-2 mb-3">
            <Input value={newPriority} onChange={e=>setNewPriority(e.target.value)} placeholder="Add a priority" onKeyDown={e=>e.key==='Enter'&&addNow(true)}/>
            <Button onClick={()=>addNow(true)}><Plus size={16}/></Button>
          </div>
          <ul className="space-y-1.5">
            {priorities.map(t=>(
              <li key={t.id} className="flex items-center gap-2 group">
                <button onClick={()=>toggleTask(t.id)}>{t.done?<CheckCircle2 size={16} className="text-sage"/>:<Circle size={16}/>}</button>
                <span className={`flex-1 text-sm ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                <button onClick={()=>updateTask(t.id,{isPriority:false})} className="text-[11px] text-ink/40 opacity-0 group-hover:opacity-100">demote</button>
                <button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={13}/></button>
              </li>
            ))}
            {priorities.length===0 && <li className="text-xs text-ink/40 text-center py-2">No priorities yet.</li>}
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-3"><ListTodo size={16}/> To-do</h3>
          <div className="flex gap-2 mb-3">
            <Input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add a task" onKeyDown={e=>e.key==='Enter'&&addNow(false)}/>
            <Button onClick={()=>addNow(false)}><Plus size={16}/></Button>
          </div>
          <ul className="space-y-1.5">
            {todos.map(t=>(
              <li key={t.id} className="flex items-center gap-2 group">
                <button onClick={()=>toggleTask(t.id)}>{t.done?<CheckCircle2 size={16} className="text-sage"/>:<Circle size={16}/>}</button>
                <span className={`flex-1 text-sm ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                <button onClick={()=>updateTask(t.id,{isPriority:true})} className="text-[11px] text-ink/40 opacity-0 group-hover:opacity-100">promote</button>
                <button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={13}/></button>
              </li>
            ))}
            {todos.length===0 && <li className="text-xs text-ink/40 text-center py-2">No tasks yet.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><Calendar size={16}/> Hourly schedule</h3>
          <button onClick={()=>{ setHoursForm(state.user.workingHours); setEditHours(true); }} className="text-xs text-ink/60 hover:underline">Working hours</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {schedule.map(h => {
            const tbs = state.timeboxes.filter(tb => tb.date===selected && tb.start.startsWith(h.split(':')[0]));
            return (
              <div key={h} className="flex items-start gap-2 p-2 rounded-xl bg-black/[.02] dark:bg-white/5">
                <span className="text-xs tabular-nums w-12 text-ink/60">{h}</span>
                <div className="flex-1 space-y-1">
                  {tbs.length ? tbs.map(tb => <div key={tb.id} className="text-sm bg-sage/25 dark:bg-sage/20 rounded-lg px-2 py-1">{tb.start}–{tb.end} {tb.title}</div>) : <div className="text-xs text-ink/30 dark:text-white/30 py-0.5">—</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Notes</h3>
        <textarea className="input" rows={4} placeholder="Notes for the day…" value={notes} onChange={e=>setDailyNotes(selected, e.target.value)}/>
      </Card>

      <Modal open={editHours} onClose={()=>setEditHours(false)} title="Working hours" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setEditHours(false)}>Cancel</Button><Button onClick={()=>{ setUser({ workingHours: hoursForm }); setEditHours(false); }}>Save</Button></div>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start</label><Input type="time" value={hoursForm.start} onChange={e=>setHoursForm({...hoursForm, start:e.target.value})}/></div>
          <div><label className="label">End</label><Input type="time" value={hoursForm.end} onChange={e=>setHoursForm({...hoursForm, end:e.target.value})}/></div>
        </div>
      </Modal>
    </div>
  );
}
