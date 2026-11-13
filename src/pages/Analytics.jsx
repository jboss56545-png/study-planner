import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { dateKey, addDays } from '../utils/date';
import { Card } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#4DA3FF','#42D9E8','#A78BFA','#FBBF24'];

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
  const auditData = ['use','invest','waste'].map(c => ({ name: c.toUpperCase(), value: state.timeAudit.filter(e => e.category===c).reduce((a,e)=>a+e.duration,0) }));
  const totalFocus = Math.round(dailyData.reduce((a,d)=>a+d.focus,0)*10)/10;
  const totalTasksDone = dailyData.reduce((a,d)=>a+d.done,0);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[7,30,90].map(r => (
          <button key={r} onClick={()=>setRange(r)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${range===r?'bg-primary/20 text-primary border-primary/30':'bg-white/5 text-[#94A3B8] border-white/5 hover:bg-white/10'}`}>Last {r} days</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Tasks done" value={totalTasksDone} tone="primary"/>
        <Mini label="Focus hours" value={`${totalFocus}h`} tone="lavender"/>
        <Mini label="Sessions" value={state.sessions.filter(s=>new Date(s.completedAt)>=cutoff && s.mode==='focus').length} tone="secondary"/>
        <Mini label="Notes" value={state.notes.length} tone="success"/>
      </div>

      <Card>
        <h3 className="font-bold text-white mb-4">Daily completion & focus</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} stroke="#94A3B8" interval="preserveStartEnd"/>
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8"/>
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} />
              <Line type="monotone" dataKey="done" stroke="#4DA3FF" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="focus" stroke="#A78BFA" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-bold text-white mb-4">Priority matrix distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={matrixData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#94A3B8"/>
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8"/>
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                <Bar dataKey="value" fill="#4DA3FF" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-white mb-4">Time audit split</h3>
          <div className="h-64">
            {auditData.every(d => d.value===0) ? <p className="text-sm text-[#94A3B8] text-center py-20">No audit data yet.</p> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={auditData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {auditData.map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                  </Pie>
                  <Legend/><Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

const Mini = ({ label, value, tone }) => {
  const bg = { primary:'bg-primary/10 text-primary border-primary/20', lavender:'bg-lavender/10 text-lavender border-lavender/20', secondary:'bg-secondary/10 text-secondary border-secondary/20', success:'bg-success/10 text-success border-success/20' };
  return (
    <div className={`rounded-2xl p-4 border ${bg[tone]}`}>
      <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
};
