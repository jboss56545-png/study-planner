import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, addDays, pad } from '../utils/date';
import { Card, Button, Input, Modal, Chip, EmptyState } from '../components/ui';
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, AlertTriangle } from 'lucide-react';

export default function Timeboxing() {
  const { state, addTimebox, updateTimebox, deleteTimebox, addTask } = useApp();
  const [selected, setSelected] = useState(dateKey());
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ title:'' });

  const slots = useMemo(() => {
    const [sh, sm] = state.user.workingHours.start.split(':').map(Number);
    const [eh, em] = state.user.workingHours.end.split(':').map(Number);
    let cur = sh*60 + sm;
    const endM = eh*60 + em;
    const arr = [];
    while (cur < endM) {
      const s = `${pad(Math.floor(cur/60))}:${pad(cur%60)}`;
      const e = `${pad(Math.floor((cur+slotMinutes)/60))}:${pad((cur+slotMinutes)%60)}`;
      arr.push({ start: s, end: e });
      cur += slotMinutes;
    }
    return arr;
  }, [state.user.workingHours, slotMinutes]);

  const todays = state.timeboxes.filter(t => t.date===selected).sort((a,b)=>a.start.localeCompare(b.start));
  const findBox = (start) => todays.find(t => t.start === start);

  // detect conflicts (overlaps)
  const conflicts = useMemo(() => {
    const set = new Set();
    for (let i=0;i<todays.length;i++) for (let j=i+1;j<todays.length;j++) {
      const a = todays[i], b = todays[j];
      if (a.start < b.end && b.start < a.end) { set.add(a.id); set.add(b.id); }
    }
    return set;
  }, [todays]);

  const addSlot = (slot) => { setOpen({ slot }); setForm({ title:'' }); };
  const save = () => { if (!form.title.trim() || !open) return; addTimebox({ date: selected, start: open.slot.start, end: open.slot.end, title: form.title.trim() }); setOpen(null); };

  const priorities = state.tasks.filter(t => t.scheduledDate===selected && t.isPriority && !t.done);
  const others = state.tasks.filter(t => t.scheduledDate===selected && !t.isPriority && !t.done);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button onClick={()=>setSelected(dateKey(addDays(new Date(selected), -1)))} className="btn btn-ghost !px-2"><ChevronLeft size={18}/></button>
        <div className="flex items-center gap-2">
          <select value={slotMinutes} onChange={e=>setSlotMinutes(Number(e.target.value))} className="input !w-auto !py-1.5">
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>
          <div className="font-semibold">{new Date(selected).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
        </div>
        <button onClick={()=>setSelected(dateKey(addDays(new Date(selected), 1)))} className="btn btn-ghost !px-2"><ChevronRight size={18}/></button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <h3 className="font-semibold mb-3">Timeline</h3>
          <ul className="space-y-1">
            {slots.map(slot => {
              const tb = findBox(slot.start);
              const conflict = tb && conflicts.has(tb.id);
              return (
                <li key={slot.start} className={`flex items-center gap-2 p-2 rounded-xl ${conflict?'bg-red-50 dark:bg-red-500/10':'bg-black/[.02] dark:bg-white/5'}`}>
                  <span className="text-xs tabular-nums w-14 text-ink/60">{slot.start}</span>
                  {tb ? (
                    <div className="flex-1 flex items-center gap-2">
                      <button onClick={()=>updateTimebox(tb.id,{done:!tb.done})}>{tb.done?<CheckCircle2 size={16} className="text-sage"/>:<Circle size={16}/>}</button>
                      <span className={`flex-1 text-sm ${tb.done?'line-through text-ink/40':''}`}>{tb.title}</span>
                      {conflict && <Chip tone="danger"><AlertTriangle size={11}/> conflict</Chip>}
                      <button onClick={()=>deleteTimebox(tb.id)} className="text-red-500"><Trash2 size={13}/></button>
                    </div>
                  ) : (
                    <button onClick={()=>addSlot(slot)} className="flex-1 text-left text-sm text-ink/40 hover:text-ink flex items-center gap-1"><Plus size={14}/> Add activity</button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Priorities</h3>
          <ul className="space-y-1 mb-4">
            {priorities.map(t => <li key={t.id} className="text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sage"/>{t.title}</li>)}
            {priorities.length===0 && <li className="text-xs text-ink/40">No priorities</li>}
          </ul>
          <h3 className="font-semibold mb-2">Other tasks</h3>
          <ul className="space-y-1">
            {others.slice(0,8).map(t => <li key={t.id} className="text-sm text-ink/70 dark:text-white/70">· {t.title}</li>)}
            {others.length===0 && <li className="text-xs text-ink/40">No tasks</li>}
          </ul>
        </Card>
      </div>

      <Modal open={!!open} onClose={()=>setOpen(null)} title={`Add ${open?.slot.start}–${open?.slot.end}`} footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setOpen(null)}>Cancel</Button><Button onClick={save}>Save</Button></div>}>
        <Input autoFocus value={form.title} onChange={e=>setForm({title:e.target.value})} placeholder="Activity name" onKeyDown={e=>e.key==='Enter'&&save()}/>
      </Modal>
    </div>
  );
}
