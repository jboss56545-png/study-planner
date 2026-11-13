import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Card, Button, Input, Modal, Confirm } from '../components/ui';
import { useToast } from '../components/Toast';
import { Download, Upload, RotateCcw, FileSpreadsheet } from 'lucide-react';

export default function Settings() {
  const { state, setUser, exportData, importData, resetAll } = useApp();
  const toast = useToast();
  const [name, setName] = useState(state.user.name);
  const [hours, setHours] = useState(state.user.workingHours);
  const [pom, setPom] = useState(state.user.pomodoro);
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const saveUser = () => { setUser({ name, workingHours: hours, pomodoro: pom }); toast('Settings saved', 'success'); };

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `asviro-timeflow-${new Date().toISOString().slice(0,10)}.json`; a.click();
    toast('Exported', 'success');
  };

  const doImport = () => {
    try { const d = JSON.parse(importText); importData(d); toast('Data imported', 'success'); setImportOpen(false); setImportText(''); }
    catch { toast('Invalid JSON', 'error'); }
  };

  const exportCsv = () => {
    const rows = [['Title','Status','Quadrant','Scheduled','Deadline','Goal']];
    state.tasks.forEach(t => rows.push([t.title, t.done?'done':'pending', t.quadrant, t.scheduledDate||'', t.deadline||'', state.goals.find(g=>g.id===t.goalId)?.title||'']));
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tasks.csv'; a.click();
    toast('CSV exported', 'success');
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <h3 className="font-semibold mb-3">Profile</h3>
        <label className="label">Name</label>
        <Input value={name} onChange={e=>setName(e.target.value)}/>
        <label className="label mt-3">Working hours</label>
        <div className="grid grid-cols-2 gap-3">
          <Input type="time" value={hours.start} onChange={e=>setHours({...hours,start:e.target.value})}/>
          <Input type="time" value={hours.end} onChange={e=>setHours({...hours,end:e.target.value})}/>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Pomodoro</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Focus (min)</label><Input type="number" min="1" value={pom.focus} onChange={e=>setPom({...pom, focus:Number(e.target.value)||25})}/></div>
          <div><label className="label">Short (min)</label><Input type="number" min="1" value={pom.short} onChange={e=>setPom({...pom, short:Number(e.target.value)||5})}/></div>
          <div><label className="label">Long (min)</label><Input type="number" min="1" value={pom.long} onChange={e=>setPom({...pom, long:Number(e.target.value)||15})}/></div>
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={pom.autoStart} onChange={e=>setPom({...pom, autoStart:e.target.checked})}/> Auto-start next</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={pom.sound} onChange={e=>setPom({...pom, sound:e.target.checked})}/> Sound</label>
        </div>
      </Card>

      <Button onClick={saveUser} className="w-full">Save settings</Button>

      <Card>
        <h3 className="font-semibold mb-3">Data</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={doExport} variant="soft"><Download size={16}/> Export JSON</Button>
          <Button onClick={()=>setImportOpen(true)} variant="soft"><Upload size={16}/> Import JSON</Button>
          <Button onClick={exportCsv} variant="ghost" className="col-span-2"><FileSpreadsheet size={16}/> Export tasks CSV</Button>
        </div>
        <button onClick={()=>setResetConfirm(true)} className="mt-3 text-sm text-red-600 flex items-center gap-1"><RotateCcw size={14}/> Reset all data</button>
      </Card>

      <Modal open={importOpen} onClose={()=>setImportOpen(false)} title="Import JSON" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setImportOpen(false)}>Cancel</Button><Button onClick={doImport}>Import</Button></div>}>
        <p className="text-xs text-ink/50 mb-2">This will REPLACE your current data with the backup.</p>
        <textarea className="input" rows={8} value={importText} onChange={e=>setImportText(e.target.value)} placeholder='{"version":1,...}'/>
      </Modal>

      <Confirm open={resetConfirm} onClose={()=>setResetConfirm(false)} onConfirm={()=>{ resetAll(); toast('All data cleared', 'success'); }} title="Reset everything?" description="This permanently deletes all data on this device. Export a backup first if you might need it."/>
    </div>
  );
}
