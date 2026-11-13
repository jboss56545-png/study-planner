import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Card, Button, Input, Textarea, Modal, ProgressBar, Chip, Confirm, EmptyState } from '../components/ui';
import { Target, Plus, Trash2, Pencil, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { fmtDateShort, isOverdue } from '../utils/date';

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal, addTask, toggleTask, deleteTask } = useApp();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', targetDate:'' });
  const [confirmDel, setConfirmDel] = useState(null);
  const [taskOpen, setTaskOpen] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');

  const openNew = () => { setEditId(null); setForm({ title:'', description:'', targetDate:'' }); setOpen(true); };
  const openEdit = (g) => { setEditId(g.id); setForm({ title:g.title, description:g.description||'', targetDate:g.targetDate||'' }); setOpen(true); };
  const save = () => {
    if (!form.title.trim()) return;
    if (editId) updateGoal(editId, form); else addGoal(form);
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/60 dark:text-white/60">{state.goals.length} goal{state.goals.length!==1?'s':''}</p>
        <Button onClick={openNew}><Plus size={16}/> New goal</Button>
      </div>

      {state.goals.length === 0 ? (
        <Card><EmptyState icon={Target} title="Set your first goal" description="Break goals into tasks so progress is visible and trackable." action={<Button onClick={openNew}>Create goal</Button>}/></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {state.goals.map(g => {
            const tasks = state.tasks.filter(t => t.goalId === g.id);
            const done = tasks.filter(t => t.done).length;
            const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
            const overdue = g.targetDate && isOverdue(g.targetDate) && pct<100;
            return (
              <Card key={g.id} className="flex flex-col">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{g.title}</h3>
                    {g.description && <p className="text-sm text-ink/60 dark:text-white/60 line-clamp-2 mt-0.5">{g.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {g.targetDate && <Chip tone={overdue?'danger':'mint'}><Calendar size={12}/> {fmtDateShort(g.targetDate)}</Chip>}
                      <Chip tone={pct===100?'mint':'sage'}>{pct}%</Chip>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><Pencil size={15}/></button>
                    <button onClick={() => setConfirmDel(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={15}/></button>
                  </div>
                </div>
                <ProgressBar value={pct} className="mt-3"/>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs uppercase tracking-wider text-ink/50 dark:text-white/50">Tasks</span>
                    <button onClick={() => { setTaskOpen(g.id); setTaskTitle(''); }} className="text-xs text-ink/60 hover:underline flex items-center gap-1"><Plus size={12}/> Add task</button>
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {tasks.map(t => (
                      <li key={t.id} className="flex items-center gap-2 text-sm group">
                        <button onClick={() => toggleTask(t.id)}>{t.done?<CheckCircle2 size={16} className="text-sage"/>:<Circle size={16}/>}</button>
                        <span className={`flex-1 ${t.done?'line-through text-ink/40':''}`}>{t.title}</span>
                        <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={13}/></button>
                      </li>
                    ))}
                    {tasks.length === 0 && <li className="text-xs text-ink/40">No tasks yet.</li>}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId?'Edit goal':'New goal'} footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>}>
        <div className="space-y-3">
          <div><label className="label">Title</label><Input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Description</label><Textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div><label className="label">Target date</label><Input type="date" value={form.targetDate} onChange={e=>setForm({...form,targetDate:e.target.value})}/></div>
        </div>
      </Modal>

      <Modal open={!!taskOpen} onClose={() => setTaskOpen(null)} title="Add task to goal">
        <Input autoFocus value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Task title"/>
        <div className="flex justify-end mt-4"><Button onClick={() => { if (taskTitle.trim() && taskOpen) { addTask({ title: taskTitle.trim(), goalId: taskOpen, quadrant: 2 }); setTaskOpen(null); } }}>Add task</Button></div>
      </Modal>

      <Confirm open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => deleteGoal(confirmDel)} title="Delete goal?" description="The goal will be removed. Its tasks remain but become unlinked."/>
    </div>
  );
}
