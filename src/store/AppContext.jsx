import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const KEY = 'asviro-timeflow-v1';
const DEFAULT = {
  version: 1,
  user: { name: '', workingHours: { start: '09:00', end: '18:00' }, pomodoro: { focus: 25, short: 5, long: 15, autoStart: true, sound: true }, theme: 'light' },
  goals: [], tasks: [], timeAudit: [], notToDo: [], sessions: [], timeboxes: [], notes: [],
  dailyNotes: {}, weeklyNotes: {}, monthlyNotes: {},
  pomodoro: { mode: 'focus', timeLeft: 25*60, isRunning: false, taskId: null, completedSessions: 0 },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const p = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT), ...p,
      user: { ...DEFAULT.user, ...(p.user || {}), pomodoro: { ...DEFAULT.user.pomodoro, ...(p.user?.pomodoro || {}) } },
      pomodoro: { ...DEFAULT.pomodoro, ...(p.pomodoro || {}), isRunning: false },
    };
  } catch { return structuredClone(DEFAULT); }
}

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }, [state]);
  useEffect(() => { document.documentElement.classList.toggle('dark', state.user.theme === 'dark'); }, [state.user.theme]);

  const update = useCallback((fn) => setState(prev => typeof fn === 'function' ? fn(prev) : { ...prev, ...fn }), []);

  // Global Pomodoro ticker — survives page navigation
  useEffect(() => {
    if (!state.pomodoro.isRunning) return;
    const id = setInterval(() => {
      setState(prev => {
        const p = prev.pomodoro;
        if (!p.isRunning) return prev;
        const left = p.timeLeft - 1;
        if (left > 0) return { ...prev, pomodoro: { ...p, timeLeft: left } };
        // session complete
        const cfg = prev.user.pomodoro;
        const dur = p.mode === 'focus' ? cfg.focus : p.mode === 'short' ? cfg.short : cfg.long;
        const session = { id: crypto.randomUUID(), taskId: p.taskId, mode: p.mode, duration: dur, completedAt: new Date().toISOString() };
        const nextMode = p.mode === 'focus' ? ((p.completedSessions + 1) % 4 === 0 ? 'long' : 'short') : 'focus';
        const nextDur = (nextMode === 'focus' ? cfg.focus : nextMode === 'short' ? cfg.short : cfg.long) * 60;
        const sessions = p.mode === 'focus' ? [session, ...prev.sessions].slice(0, 500) : prev.sessions;
        const completedSessions = p.mode === 'focus' ? p.completedSessions + 1 : p.completedSessions;
        if (cfg.sound) {
          try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination); o.frequency.value = 880; g.gain.value = 0.06;
            o.start(); setTimeout(() => { o.stop(); ac.close(); }, 450);
          } catch {}
        }
        return { ...prev, sessions, pomodoro: { ...p, mode: nextMode, timeLeft: nextDur, isRunning: !!cfg.autoStart, completedSessions } };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.pomodoro.isRunning]);

  const api = useMemo(() => ({
    state,
    addTask: (t) => update(p => ({ ...p, tasks: [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), done: false, quadrant: 1, ...t }, ...p.tasks] })),
    updateTask: (id, patch) => update(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, ...patch } : t) })),
    deleteTask: (id) => update(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) })),
    toggleTask: (id) => update(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null } : t) })),

    addGoal: (g) => update(p => ({ ...p, goals: [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), milestones: [], ...g }, ...p.goals] })),
    updateGoal: (id, patch) => update(p => ({ ...p, goals: p.goals.map(g => g.id === id ? { ...g, ...patch } : g) })),
    deleteGoal: (id) => update(p => ({ ...p, goals: p.goals.filter(g => g.id !== id), tasks: p.tasks.map(t => t.goalId === id ? { ...t, goalId: null } : t) })),

    addTimeAudit: (e) => update(p => ({ ...p, timeAudit: [{ id: crypto.randomUUID(), ...e }, ...p.timeAudit] })),
    deleteTimeAudit: (id) => update(p => ({ ...p, timeAudit: p.timeAudit.filter(e => e.id !== id) })),

    addNotToDo: (rule) => update(p => ({ ...p, notToDo: [{ id: crypto.randomUUID(), rule, log: {}, createdAt: new Date().toISOString() }, ...p.notToDo] })),
    updateNotToDo: (id, patch) => update(p => ({ ...p, notToDo: p.notToDo.map(n => n.id === id ? { ...n, ...patch } : n) })),
    deleteNotToDo: (id) => update(p => ({ ...p, notToDo: p.notToDo.filter(n => n.id !== id) })),

    addTimebox: (tb) => update(p => ({ ...p, timeboxes: [{ id: crypto.randomUUID(), done: false, ...tb }, ...p.timeboxes] })),
    updateTimebox: (id, patch) => update(p => ({ ...p, timeboxes: p.timeboxes.map(t => t.id === id ? { ...t, ...patch } : t) })),
    deleteTimebox: (id) => update(p => ({ ...p, timeboxes: p.timeboxes.filter(t => t.id !== id) })),

    addNote: (n) => update(p => ({ ...p, notes: [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...n }, ...p.notes] })),
    updateNote: (id, patch) => update(p => ({ ...p, notes: p.notes.map(n => n.id === id ? { ...n, ...patch } : n) })),
    deleteNote: (id) => update(p => ({ ...p, notes: p.notes.filter(n => n.id !== id) })),

    setPomodoro: (patch) => update(p => ({ ...p, pomodoro: { ...p.pomodoro, ...patch } })),
    setDailyNotes: (k, v) => update(p => ({ ...p, dailyNotes: { ...p.dailyNotes, [k]: v } })),
    setWeeklyNotes: (k, v) => update(p => ({ ...p, weeklyNotes: { ...p.weeklyNotes, [k]: v } })),
    setMonthlyNotes: (k, v) => update(p => ({ ...p, monthlyNotes: { ...p.monthlyNotes, [k]: v } })),
    setUser: (patch) => update(p => ({ ...p, user: { ...p.user, ...patch } })),

    exportData: () => JSON.stringify(state, null, 2),
    importData: (d) => update(() => ({
      ...structuredClone(DEFAULT), ...d,
      user: { ...DEFAULT.user, ...(d.user || {}), pomodoro: { ...DEFAULT.user.pomodoro, ...(d.user?.pomodoro || {}) } },
      pomodoro: { ...DEFAULT.pomodoro, ...(d.pomodoro || {}), isRunning: false },
    })),
    resetAll: () => update(() => structuredClone(DEFAULT)),
  }), [state, update]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export const useApp = () => { const c = useContext(Ctx); if (!c) throw new Error('useApp outside provider'); return c; };
