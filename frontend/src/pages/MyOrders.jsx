import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, Modal, Input, Select, SectionHeader, Spinner } from '../components/UI';

const ST = { pending:'gray', packaging:'amber', enroute:'blue', delivered:'green', delayed:'amber', stuck:'red', shortage:'red' };
const SL = { pending:'Pending', packaging:'Packaging', enroute:'En route', delivered:'Delivered', delayed:'Delayed', stuck:'Stuck', shortage:'Shortage' };

export default function MyOrders({ toast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ product:'', quantity:'', destination:'' });

  useEffect(()=>{ api.deliveries.list().then(setData).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const save = async () => {
    const newOrder = { order_no:`SA-${100+data.length}`, customer:'Annapoorna Hotels', product:form.product, quantity:Number(form.quantity), destination:form.destination, value:Number(form.quantity)*35, status:'pending' };
    try { await api.deliveries.create(newOrder); toast('✅ Order placed!'); setModal(false); }
    catch(e) { toast('❌ '+e.message); }
  };

  const active = data.filter(d=>!['delivered'].includes(d.status));
  const history = data.filter(d=>d.status==='delivered');
  const totalValue = data.reduce((a,b)=>a+(b.value||0),0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ background:'var(--bM)', borderRadius:'var(--r8)', padding:'11px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:'var(--blue)', boxShadow:'3px 3px 8px #C8CAD2,-3px -3px 8px #FFF' }}>
        <i className="ti ti-info-circle" style={{ fontSize:15 }} />
        Client portal — Annapoorna Hotels. Track your active orders and delivery status.
      </div>

      <div style={{ display:'flex', background:'var(--bg)', borderRadius:'var(--r20)', boxShadow:'var(--s-card)', overflow:'hidden', marginBottom:20 }}>
        {[
          {val:active.length,lbl:'Active orders'},{val:history.length,lbl:'Delivered this month'},
          {val:`${data.reduce((a,b)=>a+(b.quantity||0),0).toLocaleString()} pks`,lbl:'Total ordered'},
          {val:`₹${(totalValue/100000).toFixed(1)}L`,lbl:'Total value'},
        ].map((s,i)=>(
          <div key={i} style={{ flex:1, padding:'14px 16px', borderRight:i<3?'1px solid var(--bg2)':'none', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{s.val}</div>
            <div style={{ fontSize:10.5, color:'var(--text3)', marginTop:2, fontWeight:500 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>Active orders</div>
        <Btn onClick={()=>setModal(true)}><i className="ti ti-plus" />Place order</Btn>
      </div>

      {active.map((o,i)=>(
        <div key={i} style={{ background:'var(--bg)', borderRadius:'var(--r14)', boxShadow:'var(--s-card)', padding:'15px 18px', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{o.order_no} · {o.product} × {o.quantity} packs</span>
            <Tag label={SL[o.status]||o.status} type={ST[o.status]||'gray'} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[{k:'Destination',v:o.destination},{k:'Driver',v:o.driver||'—'},{k:'ETA',v:o.eta||'—'}].map((f,j)=>(
              <div key={j}>
                <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2, fontWeight:500 }}>{f.k}</div>
                <div style={{ fontSize:12.5, fontWeight:600, color: f.k==='ETA'&&!o.eta?'var(--red)':'var(--text)' }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ fontSize:13.5, fontWeight:700, marginBottom:12, marginTop:8 }}>Order history</div>
      <Table
        cols={[
          {key:'order_no',label:'Order',w:'80px',render:r=><span style={{fontWeight:700,color:'var(--accent)'}}>{r.order_no}</span>},
          {key:'product',label:'Product',w:'160px'},{key:'quantity',label:'Qty',w:'80px',render:r=>`${r.quantity} pks`},
          {key:'destination',label:'City',w:'90px'},{key:'value',label:'Value',w:'80px',render:r=>`₹${r.value?.toLocaleString()}`},
          {key:'status',label:'Status',render:r=><Tag label={SL[r.status]||r.status} type={ST[r.status]||'gray'}/>},
        ]}
        rows={history}
      />

      <Modal open={modal} title="Place New Order" onClose={()=>setModal(false)} onSubmit={save}>
        <Select label="Product" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
          <option value="">Select product</option>
          <option>Appalam 200g Regular</option><option>Appalam 500g Family</option>
          <option>Appalam 1 kg Bulk</option><option>Hotel Pack 5 kg</option><option>Export Pack 1 kg</option>
        </Select>
        <Input label="Quantity (packs)" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="500" />
        <Input label="Delivery destination" value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} placeholder="Coimbatore" />
      </Modal>
    </div>
  );
}
