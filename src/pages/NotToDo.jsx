import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey } from '../utils/date';
import { Card, Button, Input, EmptyState, Modal } from '../components/ui';
import { Ban, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function NotToDo() {
  const { state, addNotToDo, updateNotToDo, deleteNotToDo } = useApp();
  const [open, setOpen] = useState(false);
  const [rule, setRule] = useState('');
  const today = dateKey();

  const mark = (id, value) => {
    const n = state.notToDo.find(x => x.id===id);
    if (!n) return;
    updateNotToDo(id, { log: { ...n.log, [today]: value } });
  };

  const streak = (n) => {
    let s = 0;
    const d = new Date();
    for (let i=0;i<365;i++) {
      const k = dateKey(d);
      if (n.log[k]==='followed') { s++; d.setDate(d.getDate()-1); }
      else break;
    }
    return s;
  };

  const save = () => { if (!rule.trim()) return; addNotToDo(rule.trim()); setRule(''); setOpen(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/60 dark:text-white/60">Protect your attention by naming what you will not do.</p>
        <Button onClick={()=>setOpen(true)}><Plus size={16}/> Add rule</Button>
      </div>

      {state.notToDo.length === 0 ? (
        <Card><EmptyState icon={Ban} title="No not-to-do rules yet" description="Examples: unplanned scrolling, unfocused multitasking, unnecessary interruptions." action={<Button onClick={()=>setOpen(true)}>Add rule</Button>}/></Card>
      ) : (
        <div className="space-y-3">
          {state.notToDo.map(n => {
            const status = n.log[today];
            return (
              <Card key={n.id}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{n.rule}</div>
                    <div className="text-xs text-ink/50 mt-0.5">Streak: {streak(n)} day{streak(n)!==1?'s':''}</div>
                  </div>
                  <button onClick={()=>deleteNotToDo(n.id)} className="text-red-500"><Trash2 size={15}/></button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>mark(n.id,'followed')} className={`flex-1 py-2 rounded-xl text-sm border ${status==='followed'?'bg-sage/30 border-sage':''}`}>
                    <CheckCircle2 size={14} className="inline mr-1"/> Followed
                  </button>
                  <button onClick={()=>mark(n.id,'broken')} className={`flex-1 py-2 rounded-xl text-sm border ${status==='broken'?'bg-red-50 dark:bg-red-500/10 border-red-200':''}`}>
                    <XCircle size={14} className="inline mr-1"/> Slipped
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title="Add not-to-do rule" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={save}>Add</Button></div>}>
        <Input autoFocus value={rule} onChange={e=>setRule(e.target.value)} placeholder="e.g. Unplanned social media scrolling" onKeyDown={e=>e.key==='Enter'&&save()}/>
      </Modal>
    </div>
  );
}
