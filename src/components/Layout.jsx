import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, Grid2x2, Clock, Sun, Ban, Timer, CalendarRange, CalendarDays, Calendar,
  NotebookPen, BarChart3, Sparkles, Settings as SettingsIcon, Plus, Menu, X, Moon, SunMedium,
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
  const { state, setUser } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const current = NAV.find(n => n.to === loc.pathname) || NAV[0];
  
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  const toggleTheme = () => setUser({ theme: state.user.theme === 'dark' ? 'light' : 'dark' });

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Glassmorphism */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 border-r border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#0B0D12]/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-ink text-cream dark:bg-mint dark:text-ink flex items-center justify-center font-bold shadow-md">A</div>
          <div><div className="font-bold tracking-tight dark:text-white">ASVIRO</div><div className="text-xs text-ink/50 dark:text-white/50 -mt-0.5">TIMEFLOW</div></div>
        </div>
        <nav className="mt-3 flex-1 overflow-y-auto space-y-0.5 pr-2">
          {NAV.map(({to,label,icon:Icon}) => (
            <NavLink key={to} to={to} end={to==='/'} className={({isActive}) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-ink text-white shadow-md dark:bg-white/10 dark:text-mint dark:shadow-[0_0_15px_rgba(213,237,227,0.1)] dark:border dark:border-white/10 scale-[1.02]' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-1 dark:text-white/70 dark:hover:text-white'
              }`}>
              <Icon size={18}/> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={toggleTheme} className="mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors dark:text-white/70 dark:hover:text-white">
          {state.user.theme==='dark'?<SunMedium size={18}/>:<Moon size={18}/>} {state.user.theme==='dark'?'Light Mode':'Dark Mode'}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-cream/80 dark:bg-[#0B0D12]/80 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 dark:text-white" onClick={() => setOpen(v => !v)}>
              {open?<X size={20}/>:<Menu size={20}/>}
            </button>
            <div className="flex-1 min-w-0 font-semibold truncate text-lg dark:text-white">{current.label}</div>
            <button onClick={() => navigate('/daily')} className="btn btn-soft !px-2.5 !py-2 shadow-sm" title="Quick add"><Plus size={18}/></button>
          </div>
        </header>

        <main key={loc.pathname} className="flex-1 px-4 py-5 md:px-8 md:py-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 animate-fade-in-up">
          {children}
        </main>

        {/* Mobile Menu */}
        {open && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"/>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream dark:bg-[#16181F] border-r dark:border-white/5 p-4 overflow-y-auto animate-pop-in origin-left" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-ink text-cream dark:bg-mint dark:text-ink flex items-center justify-center font-bold">A</div>
                <div><div className="font-bold dark:text-white">ASVIRO</div><div className="text-xs text-ink/50 dark:text-white/50 -mt-0.5">TIMEFLOW</div></div>
              </div>
              {NAV.map(({to,label,icon:Icon}) => (
                <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive?'bg-ink text-white dark:bg-white/10 dark:text-mint':'hover:bg-black/5 dark:hover:bg-white/5 dark:text-white/70'}`}>
                  <Icon size={18}/> {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-[#0B0D12]/90 backdrop-blur-xl border-t border-black/5 dark:border-white/5 px-2 py-1.5 flex justify-around pb-safe">
          {[NAV[0],NAV[3],NAV[9],NAV[12],NAV[13]].map(({to,label,icon:Icon}) => (
            <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] transition-colors ${isActive?'text-ink dark:text-mint font-semibold':'text-ink/50 dark:text-white/40'}`}>
              <Icon size={20}/> {label}
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
    <NavLink to="/pomodoro" className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl dark:bg-mint dark:text-ink hover:scale-105 transition-transform animate-fade-in-up dark:shadow-[0_0_20px_rgba(213,237,227,0.3)]">
      <Timer size={18} className="animate-pulse"/><span className="tabular-nums font-bold text-lg">{m}:{String(s).padStart(2,'0')}</span>
      <span className="text-xs font-medium uppercase tracking-wider opacity-70 bg-black/10 dark:bg-black/10 px-2 py-0.5 rounded-md">{p.mode}</span>
    </NavLink>
  );
}
