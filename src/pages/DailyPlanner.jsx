import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, addDays, pad } from '../utils/date';
import { Card, Button, Input, ProgressBar, Modal } from '../components/ui';
import { Plus, CheckCircle2, Circle, ChevronLeft, ChevronRight, Trash2, Star, Calendar, ListTodo, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    // Note: Reordering purely visual for now, since tasks don't have an explicit `order` field.
  };

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white/50 dark:bg-white/5 p-2 rounded-2xl">
        <button onClick={prev} className="btn btn-ghost !px-3 !py-3"><ChevronLeft size={20}/></button>
        <div className="text-center">
          <div className="font-semibold text-lg">{new Date(selected).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
          <div className="text-xs text-ink/50">{selected===dateKey()?'Today':''}</div>
        </div>
        <button onClick={next} className="btn btn-ghost !px-3 !py-3"><ChevronRight size={20}/></button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Daily completion</h2>
          <span className="text-sm tabular-nums">{completed}/{tasks.length} · {pct}%</span>
        </div>
        <ProgressBar value={pct}/>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Priorities Section */}
        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Star size={18} className="text-pastel-dark"/> Priorities</h3>
          <div className="flex gap-2 mb-3">
            <Input value={newPriority} onChange={e=>setNewPriority(e.target.value)} placeholder="Add a priority" onKeyDown={e=>e.key==='Enter'&&addNow(true)}/>
            <Button onClick={()=>addNow(true)} className="!px-3"><Plus size={18}/></Button>
          </div>
          <ul className="space-y-2">
            {priorities.map(t=>(
              <li key={t.id} className="flex items-center gap-2 group p-2 -m-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <button onClick={()=>toggleTask(t.id)} className="p-1">
                  {t.done?<CheckCircle2 size={20} className="text-sage"/>:<Circle size={20} className="text-ink/40"/>}
                </button>
                <span className={`flex-1 text-sm ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                <button onClick={()=>updateTask(t.id,{isPriority:false})} className="text-xs text-ink/40 hover:text-ink px-2 py-1 rounded bg-black/5 dark:bg-white/10">Demote</button>
                <button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-1"><Trash2 size={16}/></button>
              </li>
            ))}
            {priorities.length===0 && <li className="text-sm text-ink/40 text-center py-4">No priorities yet.</li>}
          </ul>
        </Card>

        {/* To-Do Section with Drag & Drop */}
        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-3"><ListTodo size={18}/> To-do</h3>
          <div className="flex gap-2 mb-3">
            <Input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add a task" onKeyDown={e=>e.key==='Enter'&&addNow(false)}/>
            <Button onClick={()=>addNow(false)} className="!px-3"><Plus size={18}/></Button>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {todos.map((t, index) => (
                    <Draggable key={t.id} draggableId={t.id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center gap-2 group p-2 -m-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 bg-white dark:bg-[#1e2227] shadow-sm">
                          <GripVertical size={16} className="text-ink/30 cursor-grab active:cursor-grabbing"/>
                          <button onClick={()=>toggleTask(t.id)} className="p-1">
                            {t.done?<CheckCircle2 size={20} className="text-sage"/>:<Circle size={20} className="text-ink/40"/>}
                          </button>
                          <span className={`flex-1 text-sm ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                          <button onClick={()=>updateTask(t.id,{isPriority:true})} className="text-xs text-ink/40 hover:text-ink px-2 py-1 rounded bg-black/5 dark:bg-white/10">Promote</button>
                          <button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-1"><Trash2 size={16}/></button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      </div>

      {/* Schedule Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Calendar size={18}/> Hourly schedule</h3>
          <button onClick={()=>{ setHoursForm(state.user.workingHours); setEditHours(true); }} className="text-xs font-medium text-ink/60 hover:text-ink underline decoration-dotted">Edit working hours</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {schedule.map(h => {
            const tbs = state.timeboxes.filter(tb => tb.date===selected && tb.start.startsWith(h.split(':')[0]));
            return (
              <div key={h} className="flex items-start gap-3 p-3 rounded-xl bg-black/[.02] dark:bg-white/5">
                <span className="text-sm font-medium tabular-nums w-14 text-ink/60">{h}</span>
                <div className="flex-1 space-y-1">
                  {tbs.length ? tbs.map(tb => <div key={tb.id} className="text-sm bg-sage/20 dark:bg-sage/10 text-ink dark:text-white rounded-lg px-3 py-1.5 border border-sage/30">{tb.start}–{tb.end} {tb.title}</div>) : <div className="text-xs text-ink/40 dark:text-white/40 py-1.5">Empty slot</div>}
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

      {/* Working Hours Modal */}
      <Modal open={editHours} onClose={()=>setEditHours(false)} title="Working hours" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setEditHours(false)}>Cancel</Button><Button onClick={()=>{ setUser({ workingHours: hoursForm }); setEditHours(false); }}>Save</Button></div>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start</label><Input type="time" value={hoursForm.start} onChange={e=>setHoursForm({...hoursForm, start:e.target.value})}/></div>
          <div><label className="label">End</label><Input type="time" value={hoursForm.end} onChange={e=>setHoursForm({...hoursForm, end:e.target.value})}/></div>
        </div>
      </Modal>
    </div>
  );
}
