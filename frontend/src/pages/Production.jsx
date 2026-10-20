import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, BtnSm, Modal, Input, Select, SectionHeader, Spinner, ProgressBar } from '../components/UI';

const STATUS_TYPE = { complete:'green', in_progress:'blue', queued:'amber', pending:'gray' };

export default function Production({ toast }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ batch_no:'', product:'', quantity:'', started_at:'' });

  const load = () => api.batches.list().then(setBatches).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.batches.create({ ...form, quantity: Number(form.quantity) });
      toast('✅ Batch created'); setModal(false); setForm({batch_no:'',product:'',quantity:'',started_at:''}); load();
    } catch(e) { toast('❌ ' + e.message); }
  };

  const updateStatus = async (id, status) => {
    try { await api.batches.update(id, { status }); toast(`✅ Batch ${status}`); load(); }
    catch(e) { toast('❌ ' + e.message); }
  };

  const del = async (r) => {
    if (!confirm('Delete this batch?')) return;
    try { await api.batches.delete(r.id); toast('🗑️ Deleted'); load(); }
    catch(e) { toast('❌ ' + e.message); }
  };

  const total = batches.reduce((a,b) => a + (b.quantity||0), 0);
  const done = batches.filter(b=>b.status==='complete').reduce((a,b)=>a+(b.quantity||0),0);
  const waste = batches.reduce((a,b)=>a+(b.waste_kg||0),0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Total batches" value={batches.length} sub={`${batches.filter(b=>b.status==='in_progress').length} in progress`} accent />
        <KPI label="Packs planned" value={total.toLocaleString()} sub="today" />
        <KPI label="Completed" value={done.toLocaleString()} sub={`${Math.round((done/total||0)*100)}% done`} />
        <KPI label="Total wastage" value={`${waste} kg`} sub="across batches" tag={waste > 100 ? "Above limit" : "OK"} tagType={waste > 100 ? "red" : "green"} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <Card>
          <SectionHeader title="Output by product" />
          {[
            {name:'Appalam 200g Regular',pct:80,qty:'2,400 packs'},
            {name:'Appalam 500g Family',pct:60,qty:'1,600 packs'},
            {name:'Appalam 1 kg Bulk',pct:40,qty:'980 packs'},
            {name:'Hotel Pack 5 kg',pct:28,qty:'500 packs'},
            {name:'Export Pack 1 kg',pct:18,qty:'300 packs'},
          ].map((p,i)=>(
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text2)', marginBottom:5, fontWeight:500 }}>
                <span>{p.name}</span><span style={{ color:'var(--text3)' }}>{p.qty}</span>
              </div>
              <ProgressBar value={p.pct} color={i%2===0?'var(--accent)':'var(--green)'} />
            </div>
          ))}
        </Card>
        <Card>
          <SectionHeader title="Cost breakdown" />
          {[
            {k:'Urad Dal',v:'₹14,200'},{k:'Spices & additives',v:'₹2,800'},{k:'Labour (18 workers)',v:'₹3,600'},
            {k:'Energy',v:'₹1,800'},{k:'Packaging material',v:'₹1,400'},{k:'Wastage loss',v:'₹800',red:true},{k:'Total',v:'₹24,600',bold:true},
          ].map((r,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:i<6?'1px solid var(--bg2)':'none', fontSize:12.5, background:r.bold?'var(--bg2)':'', borderRadius:r.bold?'var(--r8)':'', padding:r.bold?'9px 10px':'9px 0' }}>
              <span style={{ color:r.red?'var(--red)':'var(--text3)' }}>{r.k}</span>
              <span style={{ fontWeight:r.bold?700:500, color:r.red?'var(--red)':r.bold?'var(--accent)':'var(--text)' }}>{r.v}</span>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>Active batches</div>
        <Btn onClick={()=>setModal(true)}><i className="ti ti-plus" />New batch</Btn>
      </div>

      <Table
        cols={[
          {key:'batch_no',label:'Batch',w:'90px',render:r=><span style={{fontWeight:700,color:'var(--accent)'}}>{r.batch_no}</span>},
          {key:'product',label:'Product',w:'180px'},
          {key:'started_at',label:'Start',w:'70px'},
          {key:'quantity',label:'Qty',w:'90px',render:r=>`${r.quantity.toLocaleString()} pks`},
          {key:'waste_kg',label:'Waste',w:'80px',render:r=>r.waste_kg?`${r.waste_kg} kg`:'—'},
          {key:'status',label:'Status',w:'110px',render:r=><Tag label={r.status.replace('_',' ')} type={STATUS_TYPE[r.status]||'gray'}/>},
          {key:'supervisor_name',label:'Supervisor',render:r=>r.supervisor_name||'—'},
        ]}
        rows={batches}
        onDelete={del}
        onEdit={r => { if(r.status==='pending') updateStatus(r.id,'in_progress'); else if(r.status==='in_progress') updateStatus(r.id,'complete'); }}
      />

      <Modal open={modal} title="New Batch" onClose={()=>setModal(false)} onSubmit={save}>
        <Input label="Batch No" value={form.batch_no} onChange={e=>setForm({...form,batch_no:e.target.value})} placeholder="SA-446" />
        <Select label="Product" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
          <option value="">Select product</option>
          <option>Appalam 200g Regular</option><option>Appalam 500g Family</option>
          <option>Appalam 1 kg Bulk</option><option>Hotel Pack 5 kg</option><option>Export Pack 1 kg</option>
        </Select>
        <Input label="Quantity (packs)" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="2000" />
        <Input label="Start time" value={form.started_at} onChange={e=>setForm({...form,started_at:e.target.value})} placeholder="08:00" />
      </Modal>
    </div>
  );
}
