import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Card, Button, EmptyState } from '../components/ui';
import { Sparkles, RefreshCw } from 'lucide-react';
import { dateKey, addDays } from '../utils/date';

function buildSummary(state) {
  const today = dateKey();
  const last7 = Array.from({length:7}, (_,i)=>dateKey(addDays(new Date(), -i)));
  const tasks = state.tasks;
  const completed = tasks.filter(t=>t.done);
  const last7Done = completed.filter(t => t.completedAt && last7.includes(t.completedAt.slice(0,10)));
  const focusSessions = state.sessions.filter(s=>s.mode==='focus');
  const auditByCat = ['use','invest','waste'].reduce((acc,c)=>{acc[c]=state.timeAudit.filter(e=>e.category===c).reduce((a,e)=>a+e.duration,0);return acc;},{});

  return {
    today,
    tasks: {
      total: tasks.length,
      completed: completed.length,
      pending: tasks.filter(t=>!t.done).length,
      completionPct: tasks.length ? Math.round(completed.length/tasks.length*100) : 0,
      doneToday: tasks.filter(t => t.done && t.completedAt?.slice(0,10)===today).length,
      doneLast7: last7Done.length,
      overdue: tasks.filter(t => t.deadline && new Date(t.deadline)<new Date() && !t.done).length,
      byQuadrant: [1,2,3,4].map(q=>({ q, count: tasks.filter(t=>t.quadrant===q).length })),
    },
    goals: state.goals.map(g=>{
      const gt = tasks.filter(t=>t.goalId===g.id);
      return { title:g.title, targetDate:g.targetDate||null, taskCount:gt.length, doneCount: gt.filter(t=>t.done).length };
    }),
    focus: {
      totalSessions: focusSessions.length,
      sessionsLast7: focusSessions.filter(s => last7.includes(s.completedAt.slice(0,10))).length,
      totalMinutes: focusSessions.reduce((a,s)=>a+s.duration,0),
    },
    timeAudit: auditByCat,
    notToDo: state.notToDo.map(n=>({ rule:n.rule, followed: Object.values(n.log).filter(v=>v==='followed').length, broken: Object.values(n.log).filter(v=>v==='broken').length })),
  };
}

export default function Coach() {
  const { state } = useApp();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [warn, setWarn] = useState('');

  const run = async () => {
    setLoading(true); setWarn(''); setText('');
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: buildSummary(state), messages: [{ role:'user', content:'Give me today\'s productivity observations and 3 concrete suggestions.' }] }),
      });
      const data = await res.json();
      setText(data.text || 'No response.');
      if (data.warn) setWarn(data.warn);
    } catch (e) {
      setText('Could not reach the coach service. Your data is safe — try again later, or use the Insights below.');
    }
    setLoading(false);
  };

  const s = buildSummary(state);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Card>
        <div className="flex items-center gap-2 mb-2"><Sparkles size={18}/><h2 className="font-semibold">AI Productivity Coach</h2></div>
        <p className="text-sm text-ink/60 dark:text-white/60">Analysis is grounded in your actual stored data. When no API key is set, the coach uses a local rule-based engine on the same numbers.</p>
        <Button className="mt-3" onClick={run} disabled={loading}>{loading?<><RefreshCw size={16} className="animate-spin"/> Analyzing…</>:<><Sparkles size={16}/> Analyze my productivity</>}</Button>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Data snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat v={`${s.tasks.completionPct}%`} l="Completion"/>
          <Stat v={s.tasks.pending} l="Pending"/>
          <Stat v={s.tasks.overdue} l="Overdue"/>
          <Stat v={s.focus.totalSessions} l="Focus sessions"/>
        </div>
      </Card>

      {text && (
        <Card>
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles size={16}/> Insights</h3>
          {warn && <p className="text-xs text-amber-600 mb-2">Note: {warn}. Using local analysis.</p>}
          <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{text}</pre>
        </Card>
      )}

      {!text && !loading && (
        <Card><EmptyState icon={Sparkles} title="No analysis yet" description="Tap Analyze to get a data-driven report."/></Card>
      )}
    </div>
  );
}

const Stat = ({ v, l }) => <div><div className="text-xl font-bold">{v}</div><div className="text-xs text-ink/50">{l}</div></div>;
