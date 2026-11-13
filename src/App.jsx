import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Matrix from './pages/Matrix';
import DailyPlanner from './pages/DailyPlanner';
import Weekly from './pages/Weekly';
import Monthly from './pages/Monthly';
import Timeboxing from './pages/Timeboxing';
import TimeAudit from './pages/TimeAudit';
import NotToDo from './pages/NotToDo';
import Pomodoro from './pages/Pomodoro';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';
import Coach from './pages/Coach';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider><ToastProvider><Layout>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/goals" element={<Goals/>}/>
        <Route path="/matrix" element={<Matrix/>}/>
        <Route path="/daily" element={<DailyPlanner/>}/>
        <Route path="/weekly" element={<Weekly/>}/>
        <Route path="/monthly" element={<Monthly/>}/>
        <Route path="/timebox" element={<Timeboxing/>}/>
        <Route path="/audit" element={<TimeAudit/>}/>
        <Route path="/not-to-do" element={<NotToDo/>}/>
        <Route path="/pomodoro" element={<Pomodoro/>}/>
        <Route path="/notes" element={<Notes/>}/>
        <Route path="/analytics" element={<Analytics/>}/>
        <Route path="/coach" element={<Coach/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="*" element={<div className="text-center py-20 text-ink/50">Page not found</div>}/>
      </Routes>
    </Layout></ToastProvider></AppProvider>
  );
}
