import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, Modal, Input, Select, SectionHeader, Spinner, SkRow } from '../components/UI';

const ST = { pending:'amber', reused:'green', discarded:'red', sold:'blue', written_off:'gray' };

export default function Wastage({ toast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ source:'', type:'', quantity_kg:'', reason:'' });

  const load = () => api.wastage.list().then(setData).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await api.wastage.create({...form,quantity_kg:Number(form.quantity_kg)}); toast('✅ Waste logged'); setModal(false); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const update = async (id, status) => {
    try { await api.wastage.update(id,{status}); toast(`✅ Updated to ${status}`); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const total = data.reduce((a,b)=>a+(b.quantity_kg||0),0);
  const reusable = data.filter(d=>d.status==='reused').reduce((a,b)=>a+(b.quantity_kg||0),0);
  const sold = data.filter(d=>d.status==='sold').reduce((a,b)=>a+(b.quantity_kg||0),0);
  const lost = data.filter(d=>['discarded','written_off'].includes(d.status)).reduce((a,b)=>a+(b.quantity_kg||0),0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ background:'var(--rM)', borderRadius:'var(--r8)', padding:'11px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:'var(--red)', boxShadow:'3px 3px 8px #C8CAD2,-3px -3px 8px #FFFFFF' }}>
        <i className="ti ti-alert-circle" style={{ fontSize:15, flexShrink:0 }} />
        Dryer #2 generated 52 kg excess — above threshold. Supervisor sign-off required before disposal.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Total waste" value={`${total.toFixed(1)} kg`} sub="All production lines" accent />
        <KPI label="Reusable" value={`${reusable} kg`} sub="Re-processed" />
        <KPI label="Sold as feed" value={`${sold} kg`} sub={`₹${Math.round(sold*30).toLocaleString()} recovered`} />
        <KPI label="Net loss" value={`${lost} kg`} sub="Written off" tag={lost>20?"High":"Normal"} tagType={lost>20?"red":"green"} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <Card>
          <SectionHeader title="Waste composition" />
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <svg width="90" height="90" viewBox="0 0 36 36" style={{ flexShrink:0 }}>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#DFE1E8" strokeWidth="4"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#FF6B35" strokeWidth="4" strokeDasharray="55 33" strokeDashoffset="22" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#F87171" strokeWidth="4" strokeDasharray="14 74" strokeDashoffset="-33"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#A8A29E" strokeWidth="4" strokeDasharray="27 61" strokeDashoffset="-47"/>
              <text x="18" y="20" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1E2235">{total.toFixed(0)}kg</text>
            </svg>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {[{c:'#FF6B35',l:'Dough overflow — 55%'},{c:'#F87171',l:'Burnt — 14%'},{c:'#A8A29E',l:'Other — 31%'}].map((x,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'var(--text2)' }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:x.c }} />{x.l}
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Packaging remaining" />
          <SkRow name="200g poly pouches" pct={72} value="14,400" />
          <SkRow name="500g pouches" pct={55} value="8,800" />
          <SkRow name="1 kg pouches" pct={20} value="2,200" low />
          <SkRow name="5 kg HDPE bags" pct={60} value="600" />
          <SkRow name="Export cartons" pct={18} value="180" low last />
        </Card>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>Waste log — today</div>
        <Btn onClick={()=>setModal(true)}><i className="ti ti-file-plus" />Submit report</Btn>
      </div>

      <Table
        cols={[
          {key:'source',label:'Source',w:'110px'},
          {key:'type',label:'Type',w:'130px'},
          {key:'quantity_kg',label:'Qty',w:'75px',render:r=>`${r.quantity_kg} kg`},
          {key:'reason',label:'Reason'},
          {key:'status',label:'Status',w:'120px',render:r=><Tag label={r.status.replace('_',' ')} type={ST[r.status]||'gray'}/>},
          {key:'reporter',label:'By',w:'90px',render:r=>r.reporter||'—'},
        ]}
        rows={data}
        onEdit={r=>{const next={pending:'reused',reused:'sold',sold:'written_off',written_off:'discarded',discarded:'pending'}; update(r.id,next[r.status]);}}
      />

      <Modal open={modal} title="Log Waste" onClose={()=>setModal(false)} onSubmit={save}>
        <Select label="Source" value={form.source} onChange={e=>setForm({...form,source:e.target.value})}>
          <option value="">Select source</option>
          <option>Mixer #1</option><option>Mixer #2</option><option>Dryer #1</option><option>Dryer #2</option><option>Packing Line A</option><option>Packing Line B</option>
        </Select>
        <Select label="Type" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
          <option value="">Select type</option>
          <option>Dough overflow</option><option>Burnt appalam</option><option>Torn pouches</option><option>Spill/dust</option><option>Quality reject</option>
        </Select>
        <Input label="Quantity (kg)" type="number" value={form.quantity_kg} onChange={e=>setForm({...form,quantity_kg:e.target.value})} placeholder="50" />
        <Input label="Reason" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Describe the cause" />
      </Modal>
    </div>
  );
}
