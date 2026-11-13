import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, Grid2x2, Clock, Sun, Ban, Timer, CalendarRange, CalendarDays, Calendar,
  NotebookPen, BarChart3, Sparkles, Settings as SettingsIcon, Plus, Menu, X,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

const NAV = [
  { to:'/', label:'Dashboard', icon:LayoutDashboard },
  { to:'/goals', label:'Goals', icon:Target },
  { to:'/matrix', label:'Matrix', icon:Grid2x2 },
  { to:'/daily', label:'Daily', icon:Sun },
  { to:'/weekly', label:'Weekly', icon:CalendarRange },
  { to:'/monthly', label:'Monthly', icon:CalendarDays },
  { to:'/timebox', label:'Timebox', icon:Calendar },
  { to:'/audit', label:'Time Audit', icon:Clock },
  { to:'/not-to-do', label:'Not-To-Do', icon:Ban },
  { to:'/pomodoro', label:'Focus', icon:Timer },
  { to:'/notes', label:'Notes', icon:NotebookPen },
  { to:'/analytics', label:'Analytics', icon:BarChart3 },
  { to:'/coach', label:'AI Coach', icon:Sparkles },
  { to:'/settings', label:'Settings', icon:SettingsIcon },
];

export default function Layout({ children }) {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const current = NAV.find(n => n.to === loc.pathname) || NAV[0];
  
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <div className="min-h-screen flex text-[#F1F5F9]">
      {/* Desktop Glass Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 border-r border-white/5 bg-panel/40 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-xl shadow-glow-primary">A</div>
          <div><div className="font-bold tracking-tight text-lg">ASVIRO</div><div className="text-[10px] uppercase tracking-widest text-primary font-semibold">TIMEFLOW</div></div>
        </div>
        <nav className="mt-4 flex-1 overflow-y-auto space-y-1 pr-2">
          {NAV.map(({to,label,icon:Icon}) => (
            <NavLink key={to} to={to} end={to==='/'} className={({isActive}) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-primary' 
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5'
              }`}>
              <Icon size={18}/> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-base/70 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 md:px-8">
            <button className="md:hidden p-2 -ml-2 rounded-xl text-[#F1F5F9] hover:bg-white/10" onClick={() => setOpen(v => !v)}>
              {open?<X size={20}/>:<Menu size={20}/>}
            </button>
            <div className="flex-1 min-w-0 font-bold text-xl truncate">{current.label}</div>
            <button onClick={() => navigate('/daily')} className="btn btn-primary !px-3 !py-2 shadow-glow-primary" title="Quick add"><Plus size={20}/></button>
          </div>
        </header>

        <main key={loc.pathname} className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-6xl w-full mx-auto pb-24 md:pb-8 animate-fade-in-up">
          {children}
        </main>

        {/* Mobile Drawer Menu */}
        {open && (
          <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-base/80 backdrop-blur-sm"/>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-panel/95 border-r border-white/10 p-5 overflow-y-auto animate-pop-in origin-left" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white shadow-glow-primary">A</div>
                <div><div className="font-bold text-lg">ASVIRO</div><div className="text-[10px] uppercase tracking-widest text-primary font-semibold">TIMEFLOW</div></div>
              </div>
              {NAV.map(({to,label,icon:Icon}) => (
                <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive?'bg-primary/10 text-primary':'text-[#94A3B8] hover:text-white hover:bg-white/5'}`}>
                  <Icon size={18}/> {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-panel/80 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex justify-around pb-safe">
          {[NAV[0],NAV[3],NAV[9],NAV[12],NAV[13]].map(({to,label,icon:Icon}) => (
            <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-medium transition-colors ${isActive?'text-primary':'text-[#94A3B8]'}`}>
              <Icon size={22}/> {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <GlobalTimerPill />
    </div>
  );
}

function GlobalTimerPill() {
  const { state } = useApp();
  const p = state.pomodoro;
  if (!p.isRunning) return null;
  const m = Math.floor(p.timeLeft/60), s = p.timeLeft%60;
  return (
    <NavLink to="/pomodoro" className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-3 bg-panel/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-glow-primary border border-primary/30 hover:scale-105 transition-transform animate-fade-in-up">
      <Timer size={18} className="animate-pulse text-primary"/><span className="tabular-nums font-bold text-lg">{m}:{String(s).padStart(2,'0')}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">{p.mode}</span>
    </NavLink>
  );
}
