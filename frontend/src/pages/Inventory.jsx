import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, Modal, Input, Select, SectionHeader, Spinner, SkRow, ProgressBar } from '../components/UI';

export default function Inventory({ toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name:'', category:'raw', quantity:'', unit:'kg', reorder_level:'', value_per_unit:'', zone:'A' });

  const load = () => api.inventory.list().then(setItems).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await api.inventory.create({...form,quantity:Number(form.quantity),reorder_level:Number(form.reorder_level),value_per_unit:Number(form.value_per_unit)}); toast('✅ Item added'); setModal(false); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const saveEdit = async () => {
    try { await api.inventory.update(editItem.id,{quantity:Number(editItem.quantity)}); toast('✅ Updated'); setEditModal(false); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const del = async (r) => {
    if (!confirm('Delete this item?')) return;
    try { await api.inventory.delete(r.id); toast('🗑️ Deleted'); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const raw = items.filter(i=>i.category==='raw');
  const finished = items.filter(i=>i.category==='finished');
  const packaging = items.filter(i=>i.category==='packaging');
  const lowStock = items.filter(i=>i.quantity <= i.reorder_level);
  const totalValue = items.reduce((a,b)=>a+(b.quantity*b.value_per_unit),0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Total SKUs" value={items.length} sub="Across 3 zones" accent />
        <KPI label="Low stock alerts" value={lowStock.length} sub="Below reorder level" tag={lowStock.length>3?"Critical":"OK"} tagType={lowStock.length>3?"red":"green"} />
        <KPI label="Total value" value={`₹${(totalValue/100000).toFixed(1)}L`} sub="Raw + finished + pkg" />
        <KPI label="Zones" value="A B C" sub="Raw · Finished · Pkg" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <Card>
          <SectionHeader title="Raw material stock" />
          {raw.map((i,idx)=>{
            const pct=Math.round((i.quantity/Math.max(i.quantity,i.reorder_level*2))*100);
            const low=i.quantity<=i.reorder_level;
            return <SkRow key={idx} name={i.name} pct={pct} value={`${i.quantity} ${i.unit}`} low={low} last={idx===raw.length-1}/>;
          })}
        </Card>
        <Card>
          <SectionHeader title="Finished goods" />
          {finished.map((i,idx)=>{
            const pct=Math.round((i.quantity/Math.max(i.quantity,i.reorder_level*2))*100);
            const low=i.quantity<=i.reorder_level;
            return <SkRow key={idx} name={i.name} pct={pct} value={`${i.quantity.toLocaleString()} ${i.unit}`} low={low} last={idx===finished.length-1}/>;
          })}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {['A','B','C'].map((zone,i)=>{
          const zItems = items.filter(it=>it.zone===zone);
          const zLabel = ['Raw Material','Finished Goods','Packaging'][i];
          const zPct = [45,68,72][i];
          return (
            <Card key={zone}>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Zone {zone} — {zLabel}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10 }}>{zItems.length} SKUs</div>
              <ProgressBar value={zPct} />
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>{zPct}% capacity used</div>
            </Card>
          );
        })}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>All inventory</div>
        <Btn onClick={()=>setModal(true)}><i className="ti ti-plus" />Add item</Btn>
      </div>

      <Table
        cols={[
          {key:'name',label:'Item',w:'170px'},
          {key:'category',label:'Category',w:'90px',render:r=><Tag label={r.category} type={r.category==='raw'?'amber':r.category==='finished'?'green':'blue'}/>},
          {key:'quantity',label:'Qty',w:'80px',render:r=>`${r.quantity} ${r.unit}`},
          {key:'reorder_level',label:'Reorder',w:'80px',render:r=>`${r.reorder_level} ${r.unit}`},
          {key:'value_per_unit',label:'Rate',w:'80px',render:r=>`₹${r.value_per_unit}`},
          {key:'zone',label:'Zone',w:'60px',render:r=><Tag label={`Zone ${r.zone}`} type="blue"/>},
          {key:'status',label:'Status',w:'90px',render:r=>r.quantity<=r.reorder_level?<Tag label="Low" type="red"/>:<Tag label="OK" type="green"/>},
        ]}
        rows={items}
        onEdit={r=>{setEditItem({...r});setEditModal(true);}}
        onDelete={del}
      />

      <Modal open={modal} title="Add Inventory Item" onClose={()=>setModal(false)} onSubmit={save}>
        <Input label="Item name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Urad Dal" />
        <Select label="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          <option value="raw">Raw material</option><option value="finished">Finished goods</option><option value="packaging">Packaging</option>
        </Select>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Quantity" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="500" />
          <Input label="Unit" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="kg / L / pcs" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Reorder level" type="number" value={form.reorder_level} onChange={e=>setForm({...form,reorder_level:e.target.value})} placeholder="200" />
          <Input label="Rate (₹)" type="number" value={form.value_per_unit} onChange={e=>setForm({...form,value_per_unit:e.target.value})} placeholder="76" />
        </div>
        <Select label="Zone" value={form.zone} onChange={e=>setForm({...form,zone:e.target.value})}>
          <option value="A">Zone A — Raw material</option><option value="B">Zone B — Finished goods</option><option value="C">Zone C — Packaging</option>
        </Select>
      </Modal>

      <Modal open={editModal} title="Update Quantity" onClose={()=>setEditModal(false)} onSubmit={saveEdit}>
        {editItem && <>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:14 }}>{editItem.name}</div>
          <Input label="New quantity" type="number" value={editItem.quantity} onChange={e=>setEditItem({...editItem,quantity:e.target.value})} />
        </>}
      </Modal>
    </div>
  );
}
