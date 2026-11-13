import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey } from '../utils/date';
import { Card, Button, EmptyState } from '../components/ui';
import { Timer, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function Pomodoro() {
  const { state, setPomodoro } = useApp();
  const p = state.pomodoro;
  const cfg = state.user.pomodoro;
  const [selectedTaskId, setSelectedTaskId] = useState(p.taskId || '');

  const minutes = Math.floor(p.timeLeft/60);
  const seconds = p.timeLeft%60;
  const total = (p.mode==='focus'?cfg.focus:p.mode==='short'?cfg.short:cfg.long) * 60;
  const progress = 100 - (p.timeLeft/total*100);

  const start = () => setPomodoro({ isRunning: true, taskId: selectedTaskId || null });
  const pause = () => setPomodoro({ isRunning: false });
  const reset = () => setPomodoro({ isRunning: false, timeLeft: total });
  const switchMode = (mode) => {
    const dur = (mode==='focus'?cfg.focus:mode==='short'?cfg.short:cfg.long) * 60;
    setPomodoro({ mode, timeLeft: dur, isRunning: false });
  };

  const openTasks = useMemo(() => state.tasks.filter(t => !t.done).slice(0, 40), [state.tasks]);
  const todaySessions = state.sessions.filter(s => s.mode==='focus' && s.completedAt.slice(0,10)===dateKey());

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {['focus','short','long'].map(m => (
          <button key={m} onClick={()=>switchMode(m)} className={`p-3 rounded-xl text-center text-sm font-medium ${p.mode===m?'bg-ink text-white dark:bg-white dark:text-ink':'bg-white dark:bg-white/5'}`}>
            {m==='focus'?'Focus':m==='short'?'Short break':'Long break'}
          </button>
        ))}
      </div>

      <Card className="text-center">
        <div className="relative mx-auto w-56 h-56 md:w-64 md:h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/5 dark:text-white/10"/>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#A8B9A0" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*46}`} strokeDashoffset={`${2*Math.PI*46*(1-progress/100)}`}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold tabular-nums">{minutes}:{String(seconds).padStart(2,'0')}</div>
            <div className="text-xs text-ink/50 mt-1 uppercase tracking-wider">{p.mode}</div>
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {p.isRunning ? <Button onClick={pause} variant="soft"><Pause size={16}/> Pause</Button> : <Button onClick={start}><Play size={16}/> Start</Button>}
          <Button onClick={reset} variant="ghost"><RotateCcw size={16}/> Reset</Button>
        </div>

        <div className="mt-4">
          <label className="label">Associate a task</label>
          <select value={selectedTaskId} onChange={e=>{ setSelectedTaskId(e.target.value); setPomodoro({ taskId: e.target.value || null }); }} className="input">
            <option value="">No task</option>
            {openTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center"><div className="text-2xl font-bold">{todaySessions.length}</div><div className="text-xs text-ink/50">Sessions today</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold">{Math.round(todaySessions.reduce((a,s)=>a+s.duration,0)/60*10)/10}h</div><div className="text-xs text-ink/50">Focus time today</div></Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-2">Today's session history</h3>
        {todaySessions.length === 0 ? <p className="text-sm text-ink/50">No completed sessions yet.</p> : (
          <ul className="space-y-1.5">
            {todaySessions.map(s => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} className="text-sage"/>
                <span className="flex-1">{state.tasks.find(t=>t.id===s.taskId)?.title || 'Unassigned'}</span>
                <span className="text-ink/50 text-xs">{new Date(s.completedAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})} · {s.duration}m</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
