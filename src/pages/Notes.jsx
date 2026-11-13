import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Card, Button, Input, Modal, EmptyState, Confirm } from '../components/ui';
import { NotebookPen, Plus, Trash2, Search } from 'lucide-react';

const TYPES = [
  { id:'note', label:'Note' },
  { id:'brain', label:'Brain dump' },
  { id:'daily', label:'Daily reflection' },
  { id:'weekly', label:'Weekly review' },
  { id:'monthly', label:'Monthly review' },
];

export default function Notes() {
  const { state, addNote, updateNote, deleteNote } = useApp();
  const [tab, setTab] = useState('note');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title:'', content:'' });
  const [editId, setEditId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const items = state.notes.filter(n => n.type===tab && (n.title+n.content).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditId(null); setForm({ title:'', content:'' }); setOpen(true); };
  const openEdit = (n) => { setEditId(n.id); setForm({ title:n.title, content:n.content }); setOpen(true); };
  const save = () => {
    if (!form.title.trim() && !form.content.trim()) return;
    if (editId) updateNote(editId, form);
    else addNote({ ...form, type: tab });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 overflow-x-auto">
          {TYPES.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap ${tab===t.id?'bg-ink text-white dark:bg-white dark:text-ink':'bg-white dark:bg-white/5'}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1"/>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"/>
          <Input className="!pl-8 !w-48" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <Button onClick={openNew}><Plus size={16}/></Button>
      </div>

      {items.length === 0 ? (
        <Card><EmptyState icon={NotebookPen} title={`No ${TYPES.find(t=>t.id===tab).label.toLowerCase()}s yet`} description="Capture thoughts before they disappear." action={<Button onClick={openNew}>Write one</Button>}/></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map(n => (
            <Card key={n.id} className="cursor-pointer hover:shadow-md transition" onClick={()=>openEdit(n)}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{n.title||'(untitled)'}</h3>
                  <p className="text-xs text-ink/50 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-ink/70 dark:text-white/70 mt-2 line-clamp-3 whitespace-pre-wrap">{n.content}</p>
                </div>
                <button onClick={e=>{e.stopPropagation(); setConfirmDel(n.id);}} className="text-red-500"><Trash2 size={14}/></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title={editId?'Edit note':'New note'} footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>}>
        <div className="space-y-3">
          <Input autoFocus placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <textarea className="input" rows={8} placeholder="Write freely…" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/>
        </div>
      </Modal>

      <Confirm open={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>deleteNote(confirmDel)} title="Delete note?"/>
    </div>
  );
}
