import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, BtnSm, Modal, Input, Select, SectionHeader, Spinner } from '../components/UI';

const ST = { pending:'amber', approved:'green', rejected:'red', escalated:'blue' };
const PT = { normal:'gray', high:'amber', urgent:'red' };

export default function Approvals({ toast, role }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ref_no:'', type:'', detail:'', priority:'normal', amount:'' });

  const load = () => api.approvals.list().then(setData).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const decide = async (id, status) => {
    try { await api.approvals.update(id,{status}); toast(`✅ ${status}`); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const save = async () => {
    try { await api.approvals.create({...form,amount:Number(form.amount||0)}); toast('✅ Submitted'); setModal(false); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const pending = data.filter(d=>d.status==='pending');
  const approved = data.filter(d=>d.status==='approved').length;
  const rejected = data.filter(d=>d.status==='rejected').length;
  const escalated = data.filter(d=>d.status==='escalated').length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Pending" value={pending.length} sub="Require action" accent />
        <KPI label="Approved" value={approved} sub="Today" />
        <KPI label="Escalated" value={escalated} sub="To management" />
        <KPI label="Rejected" value={rejected} sub="Returned" />
      </div>

      {pending.length > 0 && (
        <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13.5, fontWeight:700 }}>Pending sign-off</div>
          </div>
          {pending.map((a,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:13, padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--r14)', boxShadow:'var(--s-card)', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:'var(--r10)', background:'var(--bg)', boxShadow:'var(--s-sm)', display:'grid', placeItems:'center', flexShrink:0 }}>
                <i className={a.type==='Purchase Request'?'ti ti-shopping-cart':'ti ti-recycle'} style={{ fontSize:18, color:'var(--accent)' }}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>{a.ref_no} — {a.type}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{a.detail}</div>
                <div style={{ display:'flex', gap:8, marginTop:5 }}>
                  <Tag label={a.priority} type={PT[a.priority]||'gray'} />
                  {a.amount>0 && <span style={{ fontSize:11, color:'var(--text3)', fontWeight:500 }}>₹{a.amount.toLocaleString()}</span>}
                </div>
              </div>
              {['admin','manager','supervisor'].includes(role) && (
                <div style={{ display:'flex', gap:7, flexShrink:0 }}>
                  <BtnSm variant="success" onClick={()=>decide(a.id,'approved')}><i className="ti ti-check" />Approve</BtnSm>
                  <BtnSm variant="danger" onClick={()=>decide(a.id,'rejected')}><i className="ti ti-x" />Reject</BtnSm>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, marginTop:8 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>All activity</div>
        <Btn onClick={()=>setModal(true)}><i className="ti ti-plus" />Submit request</Btn>
      </div>

      <Table
        cols={[
          {key:'ref_no',label:'Ref',w:'80px',render:r=><span style={{fontWeight:700,color:'var(--accent)'}}>{r.ref_no}</span>},
          {key:'type',label:'Type',w:'130px'},
          {key:'detail',label:'Detail'},
          {key:'submitted_by',label:'By',w:'90px'},
          {key:'priority',label:'Priority',w:'80px',render:r=><Tag label={r.priority} type={PT[r.priority]||'gray'}/>},
          {key:'amount',label:'Amount',w:'90px',render:r=>r.amount>0?`₹${r.amount.toLocaleString()}`:'—'},
          {key:'status',label:'Status',w:'95px',render:r=><Tag label={r.status} type={ST[r.status]||'gray'}/>},
        ]}
        rows={data}
      />

      <Modal open={modal} title="Submit Request" onClose={()=>setModal(false)} onSubmit={save}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Ref No" value={form.ref_no} onChange={e=>setForm({...form,ref_no:e.target.value})} placeholder="PR-45" />
          <Select label="Priority" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
            <option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
          </Select>
        </div>
        <Select label="Type" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
          <option value="">Select type</option>
          <option>Waste Report</option><option>Purchase Request</option><option>Maintenance</option><option>Leave</option><option>Overtime</option><option>QA Sign-off</option><option>Dispatch</option>
        </Select>
        <Input label="Detail" value={form.detail} onChange={e=>setForm({...form,detail:e.target.value})} placeholder="Describe the request" />
        <Input label="Amount (₹) if applicable" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0" />
      </Modal>
    </div>
  );
}
