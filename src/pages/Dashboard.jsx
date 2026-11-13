import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { dateKey, startOfWeek, addDays } from '../utils/date';
import { Card, Button, ProgressBar, Chip, Modal, Input, EmptyState } from '../components/ui';
import { CheckCircle2, Plus, Flame, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const QUOTES = [
  "The way to get started is to quit talking and begin doing.",
  "Focus is the art of knowing what to ignore.",
  "Small daily improvements compound into staggering results.",
  "You don't need more time. You need more clarity.",
  "Discipline is choosing between what you want now and what you want most.",
  "Protect your attention — it is your most valuable asset.",
];

export default function Dashboard() {
  const { state, addTask, toggleTask, setUser } = useApp();
  const [quickAdd, setQuickAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [name, setName] = useState(state.user.name || '');

  const today = dateKey();
  const todays = useMemo(() => state.tasks.filter(t => t.scheduledDate === today), [state.tasks, today]);
  const completedToday = todays.filter(t => t.done).length;
  const pct = todays.length ? Math.round(completedToday/todays.length*100) : 0;
  const priorities = todays.filter(t => t.isPriority && !t.done).slice(0, 5);
  const sessions = state.sessions.filter(s => s.mode==='focus' && s.completedAt.slice(0,10)===today);
  const focusMins = sessions.reduce((a,s) => a + s.duration, 0);
  const upcoming = state.timeboxes.filter(t => t.date===today).sort((a,b)=>a.start.localeCompare(b.start)).slice(0,4);

  const ws = startOfWeek();
  const weekData = Array.from({length:7}, (_,i) => {
    const d = addDays(ws, i), k = dateKey(d);
    const day = state.tasks.filter(t => (t.scheduledDate===k) || (t.done && t.completedAt?.slice(0,10)===k));
    return { day: d.toLocaleDateString(undefined,{weekday:'short'}), done: day.filter(t=>t.done).length };
  });

  const greeting = (() => { const h = new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; })();
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const saveQuick = () => { if (!title.trim()) return; addTask({ title: title.trim(), scheduledDate: today, quadrant: 1 }); setTitle(''); setQuickAdd(false); };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-sm font-medium text-primary">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-2 tracking-tight text-white">{greeting}{name?`, ${name}`:''}.</h1>
          <p className="text-[#94A3B8] text-sm mt-3 italic border-l-2 border-primary/30 pl-3">"{quote}"</p>
        </div>
        <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {!state.user.name && (
            <Modal open={!name} onClose={() => setUser({ name: 'Friend' })} title="Welcome to ASVIRO TIMEFLOW" footer={<Button onClick={() => { setUser({ name: name.trim() || 'Friend' }); }}>Continue</Button>}>
              <p className="text-sm text-[#94A3B8] mb-3">What should we call you?</p>
              <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/>
            </Modal>
          )}
          <Button onClick={() => setQuickAdd(true)} className="shadow-glow-primary"><Plus size={18}/> Quick add</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Today" value={`${pct}%`} hint={`${completedToday}/${todays.length} tasks`} tone="primary" delay="0.15s"/>
        <Stat label="Focus time" value={`${Math.floor(focusMins/60)}h ${focusMins%60}m`} hint={`${sessions.length} sessions`} tone="lavender" delay="0.2s"/>
        <Stat label="Goals" value={state.goals.length} hint="active" tone="secondary" delay="0.25s"/>
        <Stat label="Pending" value={todays.filter(t=>!t.done).length} hint="today" tone="warning" delay="0.3s"/>
      </div>

      <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        {/* Priorities */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white"><Flame size={20} className="text-warning"/> Today's priorities</h2>
            <Link to="/daily" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          {priorities.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No priorities set" description="Add priorities from the Daily planner to stay focused." action={<Link to="/daily" className="btn btn-soft">Open Daily</Link>}/>
          ) : (
            <ul className="space-y-2">
              {priorities.map(t => (
                <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => toggleTask(t.id)}>
                  <div className="w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center group-hover:border-primary transition-colors">
                    {t.done && <CheckCircle2 size={16} className="text-success"/>}
                  </div>
                  <span className="flex-1 text-sm font-medium text-white/90">{t.title}</span>
                  {t.quadrant===1 && <Chip tone="danger">Do now</Chip>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        
        {/* Upcoming Schedule */}
        <Card>
          <h2 className="font-bold text-lg flex items-center gap-2 mb-5 text-white"><Clock size={18} className="text-secondary"/> Upcoming today</h2>
          {upcoming.length === 0 ? <p className="text-sm text-[#94A3B8]">No scheduled blocks yet.</p> : (
            <ul className="space-y-4 relative before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              {upcoming.map(tb => (
                <li key={tb.id} className="flex items-center gap-3 text-sm relative z-10">
                  <span className="text-xs font-bold text-[#94A3B8] tabular-nums w-12 bg-panel py-1">{tb.start}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-glow-secondary ring-4 ring-panel"></div>
                  <span className="flex-1 truncate font-medium text-white/90">{tb.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Chart */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="font-bold text-lg flex items-center gap-2 mb-6 text-white"><TrendingUp size={20} className="text-success"/> Weekly productivity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} dy={10} stroke="#94A3B8"/>
              <YAxis hide/>
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} />
              <Bar dataKey="done" fill="#4DA3FF" radius={[6,6,0,0]} maxBarSize={40}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Modal open={quickAdd} onClose={() => setQuickAdd(false)} title="Quick add task">
        <Input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" onKeyDown={e => e.key==='Enter' && saveQuick()}/>
        <div className="flex justify-end mt-4"><Button onClick={saveQuick}>Add to today</Button></div>
      </Modal>
    </div>
  );
}

function Stat({ label, value, hint, tone, delay }) {
  const styles = { 
    primary: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
    lavender: 'from-lavender/20 to-lavender/5 border-lavender/20 text-lavender',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/20 text-secondary',
    warning: 'from-warning/20 to-warning/5 border-warning/20 text-warning',
  };
  return (
    <div 
      className={`rounded-3xl p-5 border bg-gradient-to-br ${styles[tone]} animate-fade-in-up hover:-translate-y-1 hover:shadow-glass transition-all duration-300`}
      style={{ animationDelay: delay }}
    >
      <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">{label}</div>
      <div className="text-3xl font-extrabold mt-2 tracking-tight text-white">{value}</div>
      <div className="text-xs font-medium opacity-70 mt-1">{hint}</div>
    </div>
  );
      }
