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
  };

  return (
    <div className="space-y-5">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
        <button onClick={prev} className="btn btn-ghost !px-3 !py-3"><ChevronLeft size={20}/></button>
        <div className="text-center">
          <div className="font-bold text-lg text-white">{new Date(selected).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
          <div className="text-xs text-primary font-medium">{selected===dateKey()?'Today':''}</div>
        </div>
        <button onClick={next} className="btn btn-ghost !px-3 !py-3"><ChevronRight size={20}/></button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">Daily completion</h2>
          <span className="text-sm font-semibold text-primary">{completed}/{tasks.length} · {pct}%</span>
        </div>
        <ProgressBar value={pct} tone="primary"/>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Priorities */}
        <Card>
          <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Star size={18} className="text-warning"/> Priorities</h3>
          <div className="flex gap-2 mb-4">
            <Input value={newPriority} onChange={e=>setNewPriority(e.target.value)} placeholder="Add a priority" onKeyDown={e=>e.key==='Enter'&&addNow(true)}/>
            <Button onClick={()=>addNow(true)} className="!px-4"><Plus size={20}/></Button>
          </div>
          <ul className="space-y-2">
            {priorities.map(t=>(
              <li key={t.id} className="flex items-center gap-2 group p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <button onClick={()=>toggleTask(t.id)} className="p-1">
                  {t.done?<CheckCircle2 size={22} className="text-success"/>:<Circle size={22} className="text-[#94A3B8]"/>}
                </button>
                <span className={`flex-1 text-sm font-medium ${t.done?'line-through text-[#94A3B8]':'text-white/90'}`}>{t.title}</span>
                <button onClick={()=>updateTask(t.id,{isPriority:false})} className="text-xs text-[#94A3B8] hover:text-white px-2 py-1.5 rounded-lg bg-white/5">Demote</button>
                <button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-danger p-1"><Trash2 size={16}/></button>
              </li>
            ))}
            {priorities.length===0 && <li className="text-sm text-[#94A3B8] text-center py-6">No priorities yet.</li>}
          </ul>
        </Card>

        {/* To-Do with Drag & Drop */}
        <Card>
          <h3 className="font-bold text-white flex items-center gap-2 mb-4"><ListTodo size={18} className="text-primary"/> To-do</h3>
          <div className="flex gap-2 mb-4">
            <Input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add a task" onKeyDown={e=>e.key==='Enter'&&addNow(false)}/>
            <Button onClick={()=>addNow(false)} className="!px-4"><Plus size={20}/></Button>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {todos.map((t, index) => (
                    <Draggable key={t.id} draggableId={t.id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center gap-2 group p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <GripVertical size={16} className="text-white/20 cursor-grab active:cursor-grabbing"/>
                          <button onClick={()=>toggleTask(t.id)} className="p-1">
                            {t.done?<CheckCircle2 size={22} className="text-success"/>:<Circle size={22} className="text-[#94A3B8]"/>}
                          </button>
                          <span className={`flex-1 text-sm font-medium ${t.done?'line-through text-[#94A3B8]':'text-white/90'}`}>{t.title}</span>
                          <button onClick={()=>updateTask(t.id,{isPriority:true})} className="text-xs text-[#94A3B8] hover:text-white px-2 py-1.5 rounded-lg bg-white/5">Promote</button>
                          <button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-danger p-1"><Trash2 size={16}/></button>
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

      {/* Schedule */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-secondary"/> Hourly schedule</h3>
          <button onClick={()=>{ setHoursForm(state.user.workingHours); setEditHours(true); }} className="text-xs font-semibold text-primary hover:underline">Edit working hours</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {schedule.map(h => {
            const tbs = state.timeboxes.filter(tb => tb.date===selected && tb.start.startsWith(h.split(':')[0]));
            return (
              <div key={h} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-sm font-bold tabular-nums w-14 text-[#94A3B8]">{h}</span>
                <div className="flex-1 space-y-1.5">
                  {tbs.length ? tbs.map(tb => <div key={tb.id} className="text-sm bg-secondary/10 text-secondary rounded-xl px-3 py-2 border border-secondary/20 font-medium">{tb.start}–{tb.end} {tb.title}</div>) : <div className="text-xs text-white/30 py-2">Empty slot</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-white mb-3">Notes</h3>
        <textarea className="input" rows={4} placeholder="Notes for the day…" value={notes} onChange={e=>setDailyNotes(selected, e.target.value)}/>
      </Card>

      <Modal open={editHours} onClose={()=>setEditHours(false)} title="Working hours" footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={()=>setEditHours(false)}>Cancel</Button><Button onClick={()=>{ setUser({ workingHours: hoursForm }); setEditHours(false); }}>Save</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Start</label><Input type="time" value={hoursForm.start} onChange={e=>setHoursForm({...hoursForm, start:e.target.value})}/></div>
          <div><label className="label">End</label><Input type="time" value={hoursForm.end} onChange={e=>setHoursForm({...hoursForm, end:e.target.value})}/></div>
        </div>
      </Modal>
    </div>
  );
}
