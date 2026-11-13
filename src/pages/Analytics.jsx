import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, addDays } from '../utils/date';
import { Card } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#A8B9A0','#D5EDE3','#EAE3F2','#F8E9A9'];

export default function Analytics() {
  const { state } = useApp();
  const [range, setRange] = useState(30);

  const cutoff = useMemo(() => { const d = new Date(); d.setDate(d.getDate()-range+1); d.setHours(0,0,0,0); return d; }, [range]);

  const dailyData = useMemo(() => {
    return Array.from({length:range}, (_,i) => {
      const d = addDays(cutoff, i);
      const k = dateKey(d);
      const done = state.tasks.filter(t => t.done && t.completedAt?.slice(0,10)===k).length;
      const sessions = state.sessions.filter(s => s.mode==='focus' && s.completedAt.slice(0,10)===k);
      return { date: d.toLocaleDateString(undefined,{month:'short',day:'numeric'}), done, focus: Math.round(sessions.reduce((a,s)=>a+s.duration,0)/60*10)/10 };
    });
  }, [state.tasks, state.sessions, range, cutoff]);

  const matrixData = [1,2,3,4].map(q => ({ name: ['Do Now','Schedule','Delegate','Eliminate'][q-1], value: state.tasks.filter(t => t.quadrant===q).length }));
  const auditData = ['use','invest','waste'].map(c => ({ name: c, value: state.timeAudit.filter(e => e.category===c).reduce((a,e)=>a+e.duration,0) }));
  const totalFocus = Math.round(dailyData.reduce((a,d)=>a+d.focus,0)*10)/10;
  const totalTasksDone = dailyData.reduce((a,d)=>a+d.done,0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[7,30,90].map(r => (
          <button key={r} onClick={()=>setRange(r)} className={`px-3 py-1.5 rounded-xl text-sm ${range===r?'bg-ink text-white dark:bg-white dark:text-ink':'bg-white dark:bg-white/5'}`}>Last {r} days</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Tasks done" value={totalTasksDone}/>
        <Mini label="Focus hours" value={`${totalFocus}h`}/>
        <Mini label="Sessions" value={state.sessions.filter(s=>new Date(s.completedAt)>=cutoff && s.mode==='focus').length}/>
        <Mini label="Notes" value={state.notes.length}/>
      </div>

      <Card>
        <h3 className="font-semibold mb-2">Daily completion & focus</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} interval="preserveStartEnd"/>
              <YAxis fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 12, border:'none', boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}/>
              <Line type="monotone" dataKey="done" stroke="#A8B9A0" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="focus" stroke="#EAE3F2" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-2">Priority matrix distribution</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={matrixData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11}/>
                <YAxis fontSize={11} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ borderRadius: 12, border:'none' }}/>
                <Bar dataKey="value" fill="#A8B9A0" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Time audit split</h3>
          <div className="h-56">
            {auditData.every(d => d.value===0) ? <p className="text-sm text-ink/40 text-center py-16">No audit data yet.</p> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={auditData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    {auditData.map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                  </Pie>
                  <Legend/><Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-2">Goal progress</h3>
        {state.goals.length===0 ? <p className="text-sm text-ink/40">No goals.</p> : (
          <ul className="space-y-2">
            {state.goals.map(g => {
              const gt = state.tasks.filter(t=>t.goalId===g.id);
              const pct = gt.length ? Math.round(gt.filter(t=>t.done).length/gt.length*100) : 0;
              return <li key={g.id} className="flex items-center gap-3 text-sm"><span className="flex-1 truncate">{g.title}</span><span className="text-ink/50 w-10 text-right">{pct}%</span></li>;
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

const Mini = ({ label, value }) => (
  <div className="rounded-2xl p-4 bg-white dark:bg-white/5 shadow-sm">
    <div className="text-xs uppercase tracking-wider text-ink/50 dark:text-white/50">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);
