import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { dateKey, startOfWeek, addDays } from '../utils/date';
import { Card, Button, ProgressBar, Chip, Modal, Input, EmptyState } from '../components/ui';
import { CheckCircle2, Plus, Flame, Clock } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-sm text-ink/50 dark:text-white/50">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{greeting}{name?`, ${name}`:''}.</h1>
          <p className="text-ink/60 dark:text-white/60 text-sm mt-1">{quote}</p>
        </div>
        <div className="flex gap-2">
          {!state.user.name && (
            <Modal open={!name} onClose={() => setUser({ name: 'Friend' })} title="Welcome to ASVIRO TIMEFLOW" footer={<Button onClick={() => { setUser({ name: name.trim() || 'Friend' }); }}>Continue</Button>}>
              <p className="text-sm text-ink/70 dark:text-white/70 mb-3">What should we call you?</p>
              <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/>
            </Modal>
          )}
          <Button onClick={() => setQuickAdd(true)}><Plus size={16}/> Quick add</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Today" value={`${pct}%`} hint={`${completedToday}/${todays.length} tasks`} tone="sage"/>
        <Stat label="Focus time" value={`${Math.floor(focusMins/60)}h ${focusMins%60}m`} hint={`${sessions.length} sessions`} tone="lavender"/>
        <Stat label="Goals" value={state.goals.length} hint="active" tone="mint"/>
        <Stat label="Pending" value={todays.filter(t=>!t.done).length} hint="today" tone="pastel"/>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><Flame size={18}/> Today's priorities</h2>
            <Link to="/daily" className="text-xs text-ink/60 hover:underline">Daily →</Link>
          </div>
          {priorities.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No priorities set" description="Add priorities from the Daily planner." action={<Link to="/daily" className="btn btn-soft">Open Daily</Link>}/>
          ) : (
            <ul className="space-y-2">
              {priorities.map(t => (
                <li key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                  <button onClick={() => toggleTask(t.id)} className="w-5 h-5 rounded-md border flex items-center justify-center border-black/20 dark:border-white/20"/>
                  <span className="flex-1 text-sm">{t.title}</span>
                  {t.quadrant===1 && <Chip tone="danger">Do now</Chip>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold flex items-center gap-2 mb-3"><Clock size={18}/> Upcoming today</h2>
          {upcoming.length === 0 ? <p className="text-sm text-ink/50 dark:text-white/50">No scheduled blocks yet.</p> : (
            <ul className="space-y-2">
              {upcoming.map(tb => (
                <li key={tb.id} className="flex items-center gap-3 text-sm">
                  <span className="text-ink/50 dark:text-white/50 tabular-nums w-14">{tb.start}</span>
                  <span className="flex-1 truncate">{tb.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold mb-3">Weekly productivity</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12}/>
              <YAxis hide/>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}/>
              <Bar dataKey="done" fill="#A8B9A0" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Modal open={quickAdd} onClose={() => setQuickAdd(false)} title="Quick add task">
        <Input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" onKeyDown={e => e.key==='Enter' && saveQuick()}/>
        <div className="flex justify-end mt-3"><Button onClick={saveQuick}>Add to today</Button></div>
      </Modal>
    </div>
  );
}

function Stat({ label, value, hint, tone }) {
  const bg = { sage:'bg-sage/20', lavender:'bg-lavender/70', mint:'bg-mint/70', pastel:'bg-pastel/70' };
  return (
    <div className={`rounded-2xl p-4 ${bg[tone]||bg.sage} dark:bg-white/5`}>
      <div className="text-xs uppercase tracking-wider text-ink/50 dark:text-white/50">{label}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
      <div className="text-xs text-ink/60 dark:text-white/60 mt-0.5">{hint}</div>
    </div>
  );
}
