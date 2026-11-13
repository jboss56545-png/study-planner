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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {['focus','short','long'].map(m => (
          <button key={m} onClick={()=>switchMode(m)} className={`p-4 rounded-2xl text-center text-sm font-bold transition-all border ${p.mode===m?'bg-primary/20 text-primary border-primary/30 shadow-glow-primary':'bg-white/5 text-[#94A3B8] border-white/5 hover:bg-white/10'}`}>
            {m==='focus'?'Focus':m==='short'?'Short break':'Long break'}
          </button>
        ))}
      </div>

      <Card className="text-center !p-8">
        <div className="relative mx-auto w-64 h-64 md:w-72 md:h-72">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#4DA3FF" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*46}`} strokeDashoffset={`${2*Math.PI*46*(1-progress/100)}`}
              className="transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(77,163,255,0.5)]"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-extrabold tabular-nums tracking-tighter text-white drop-shadow-lg">{minutes}:{String(seconds).padStart(2,'0')}</div>
            <div className="text-xs font-bold text-primary mt-2 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{p.mode}</div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {p.isRunning ? <Button onClick={pause} variant="soft" className="!px-8 !py-3 !text-lg"><Pause size={20}/> Pause</Button> : <Button onClick={start} className="!px-8 !py-3 !text-lg shadow-glow-primary"><Play size={20}/> Start</Button>}
          <Button onClick={reset} variant="ghost" className="!px-6"><RotateCcw size={20}/></Button>
        </div>

        <div className="mt-8 max-w-xs mx-auto text-left">
          <label className="label">Associate a task</label>
          <select value={selectedTaskId} onChange={e=>{ setSelectedTaskId(e.target.value); setPomodoro({ taskId: e.target.value || null }); }} className="input appearance-none">
            <option value="" className="bg-panel">No task</option>
            {openTasks.map(t => <option key={t.id} value={t.id} className="bg-panel">{t.title}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center"><div className="text-3xl font-bold text-white">{todaySessions.length}</div><div className="text-xs text-[#94A3B8] mt-1">Sessions today</div></Card>
        <Card className="text-center"><div className="text-3xl font-bold text-white">{Math.round(todaySessions.reduce((a,s)=>a+s.duration,0)/60*10)/10}h</div><div className="text-xs text-[#94A3B8] mt-1">Focus time today</div></Card>
      </div>

      <Card>
        <h3 className="font-bold text-white mb-4">Today's session history</h3>
        {todaySessions.length === 0 ? <p className="text-sm text-[#94A3B8]">No completed sessions yet.</p> : (
          <ul className="space-y-2">
            {todaySessions.map(s => (
              <li key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-sm">
                <CheckCircle2 size={16} className="text-success"/>
                <span className="flex-1 font-medium text-white/90">{state.tasks.find(t=>t.id===s.taskId)?.title || 'Unassigned'}</span>
                <span className="text-[#94A3B8] text-xs font-medium">{new Date(s.completedAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})} · {s.duration}m</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
