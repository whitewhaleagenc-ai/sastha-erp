import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, BtnSm, Modal, Input, Select, SectionHeader, Spinner } from '../components/UI';

const ST = { pending:'gray', packaging:'amber', enroute:'blue', delivered:'green', delayed:'amber', stuck:'red', shortage:'red' };
const ST_LABEL = { pending:'Pending', packaging:'Packaging', enroute:'En route', delivered:'Delivered', delayed:'Delayed', stuck:'Stuck', shortage:'Shortage' };

export default function Delivery({ toast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ order_no:'', customer:'', product:'', quantity:'', destination:'', driver:'', eta:'', value:'' });

  const load = () => api.deliveries.list().then(setData).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    try { await api.deliveries.create({...form,quantity:Number(form.quantity),value:Number(form.value)}); toast('✅ Order created'); setModal(false); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const saveEdit = async () => {
    try { await api.deliveries.update(editItem.id,{status:editItem.status,driver:editItem.driver,eta:editItem.eta}); toast('✅ Updated'); setEditModal(false); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const del = async (r) => {
    if (!confirm('Delete this order?')) return;
    try { await api.deliveries.delete(r.id); toast('🗑️ Deleted'); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const filtered = filter === 'all' ? data : data.filter(d => filter === 'issue' ? ['delayed','stuck','shortage'].includes(d.status) : d.status === filter);
  const delivered = data.filter(d=>d.status==='delivered').length;
  const delayed = data.filter(d=>['delayed','stuck'].includes(d.status)).length;
  const shortage = data.filter(d=>d.status==='shortage').length;
  const intransit = data.filter(d=>d.status==='enroute').length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ background:'var(--rM)', borderRadius:'var(--r8)', padding:'11px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:'var(--red)', boxShadow:'3px 3px 8px #C8CAD2,-3px -3px 8px #FFFFFF' }}>
        <i className="ti ti-alert-circle" style={{ fontSize:15 }} />
        Shortage — SA-098 (Export Pack 1 kg × 300) cannot be dispatched. Produce urgently or reschedule.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Delivered" value={delivered} sub="On-time: 78%" accent />
        <KPI label="Delayed / Stuck" value={delayed} sub="Need resolution" tag={delayed>2?"Critical":"OK"} tagType={delayed>2?"red":"green"} />
        <KPI label="In transit" value={intransit} sub="Active" />
        <KPI label="Shortages" value={shortage} sub="No stock" tag={shortage>0?"Alert":"OK"} tagType={shortage>0?"red":"green"} />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>All deliveries</div>
        <div style={{ display:'flex', gap:8 }}>
          {['all','issue','delivered'].map(f=>(
            <BtnSm key={f} variant={filter===f?'primary':'secondary'} onClick={()=>setFilter(f)}>
              {f==='all'?'All':f==='issue'?'Issues':'Delivered'}
            </BtnSm>
          ))}
          <Btn onClick={()=>setModal(true)}><i className="ti ti-plus" />New order</Btn>
        </div>
      </div>

      <Table
        cols={[
          {key:'order_no',label:'Order',w:'80px',render:r=><span style={{fontWeight:700,color:'var(--accent)'}}>{r.order_no}</span>},
          {key:'customer',label:'Customer',w:'160px'},
          {key:'product',label:'Product',w:'130px'},
          {key:'quantity',label:'Qty',w:'80px',render:r=>`${r.quantity} pks`},
          {key:'destination',label:'Destination',w:'100px'},
          {key:'driver',label:'Driver',w:'80px',render:r=>r.driver||'—'},
          {key:'status',label:'Status',w:'95px',render:r=><Tag label={ST_LABEL[r.status]||r.status} type={ST[r.status]||'gray'}/>},
          {key:'eta',label:'ETA',w:'65px',render:r=>r.eta||'—'},
          {key:'value',label:'Value',w:'80px',render:r=>`₹${r.value?.toLocaleString()}`},
        ]}
        rows={filtered}
        onEdit={r=>{setEditItem({...r});setEditModal(true);}}
        onDelete={del}
      />

      <Modal open={modal} title="New Delivery Order" onClose={()=>setModal(false)} onSubmit={save}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Order No" value={form.order_no} onChange={e=>setForm({...form,order_no:e.target.value})} placeholder="SA-099" />
          <Input label="Customer" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})} placeholder="Customer name" />
        </div>
        <Select label="Product" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
          <option value="">Select product</option>
          <option>Appalam 200g Regular</option><option>Appalam 500g Family</option><option>Appalam 1 kg Bulk</option><option>Hotel Pack 5 kg</option><option>Export Pack 1 kg</option>
        </Select>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Quantity (packs)" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="500" />
          <Input label="Value (₹)" type="number" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} placeholder="7500" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Destination" value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} placeholder="Madurai" />
          <Input label="Driver" value={form.driver} onChange={e=>setForm({...form,driver:e.target.value})} placeholder="Driver name" />
        </div>
        <Input label="ETA" value={form.eta} onChange={e=>setForm({...form,eta:e.target.value})} placeholder="15:30" />
      </Modal>

      <Modal open={editModal} title="Update Order" onClose={()=>setEditModal(false)} onSubmit={saveEdit}>
        {editItem && <>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:14 }}>{editItem.order_no} · {editItem.customer}</div>
          <Select label="Status" value={editItem.status} onChange={e=>setEditItem({...editItem,status:e.target.value})}>
            {Object.entries(ST_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="Driver" value={editItem.driver||''} onChange={e=>setEditItem({...editItem,driver:e.target.value})} />
          <Input label="ETA" value={editItem.eta||''} onChange={e=>setEditItem({...editItem,eta:e.target.value})} />
        </>}
      </Modal>
    </div>
  );
}
