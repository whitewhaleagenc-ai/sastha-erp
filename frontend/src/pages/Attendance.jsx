import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, Btn, Modal, Input, Select, SectionHeader, Spinner } from '../components/UI';

const SS = ['present','absent','late'];
const SC = { present:'var(--green)', absent:'var(--red)', late:'var(--amber)' };
const SBG = { present:'var(--gM)', absent:'var(--rM)', late:'var(--amM)' };

export default function Attendance({ toast }) {
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:'', role:'', department:'' });

  const load = () => api.employees.list().then(setEmps).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const toggle = async (emp) => {
    const next = SS[(SS.indexOf(emp.status)+1)%3];
    try { await api.employees.update(emp.id,{status:next}); setEmps(prev=>prev.map(e=>e.id===emp.id?{...e,status:next}:e)); toast(`✅ ${emp.name} → ${next}`); }
    catch(e) { toast('❌ '+e.message); }
  };

  const save = async () => {
    try { await api.employees.create(form); toast('✅ Employee added'); setModal(false); setForm({name:'',role:'',department:''}); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const present = emps.filter(e=>e.status==='present').length;
  const absent = emps.filter(e=>e.status==='absent').length;
  const late = emps.filter(e=>e.status==='late').length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Present" value={present} sub={`Of ${emps.length} total`} accent />
        <KPI label="Absent" value={absent} sub="Including leave" />
        <KPI label="Late" value={late} sub="After 06:00 shift" />
        <KPI label="Total hours" value={`${present*7}h`} sub="Estimated today" />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:13.5, fontWeight:700 }}>Tap to toggle: Present → Absent → Late</div>
        <Btn onClick={()=>setModal(true)}><i className="ti ti-user-plus" />Onboard</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:9, marginBottom:20 }}>
        {emps.map((e,i)=>(
          <div key={i} onClick={()=>toggle(e)} style={{ background:'var(--bg)', borderRadius:'var(--r14)', padding:'11px 8px', textAlign:'center', cursor:'pointer', boxShadow:e.status==='present'?'inset 3px 3px 8px rgba(22,163,74,.2),inset -3px -3px 8px #FFF':e.status==='absent'?'inset 3px 3px 8px rgba(220,38,38,.2),inset -3px -3px 8px #FFF':'inset 3px 3px 8px rgba(217,119,6,.2),inset -3px -3px 8px #FFF', transition:'all .15s' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', margin:'0 auto 6px', background:`${e.color}18`, color:e.color, fontSize:10.5, fontWeight:700, display:'grid', placeItems:'center', boxShadow:'3px 3px 8px #C8CAD2,-3px -3px 8px #FFF' }}>{e.initials}</div>
            <div style={{ fontSize:10.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</div>
            <div style={{ fontSize:9.5, color:SC[e.status], marginTop:2, fontWeight:600 }}>{e.status}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <SectionHeader title="Shift schedule" />
          <Table
            cols={[
              {key:'shift',label:'Shift',w:'100px'},{key:'time',label:'Time',w:'130px'},
              {key:'team',label:'Team'},{key:'status',label:'Status',w:'90px',render:r=><Tag label={r.status} type={r.type}/>},
            ]}
            rows={[
              {shift:'Morning A',time:'05:00 – 13:00',team:'Mixing, Drying (12)',status:'Active',type:'green'},
              {shift:'Morning B',time:'07:00 – 15:00',team:'Packing A, B (8)',status:'Active',type:'green'},
              {shift:'Afternoon',time:'13:00 – 21:00',team:'Dispatch, QA (8)',status:'Upcoming',type:'amber'},
              {shift:'Night',time:'21:00 – 05:00',team:'Maintenance (4)',status:'Scheduled',type:'gray'},
            ]}
          />
        </Card>
        <Card>
          <SectionHeader title="Onboarding queue" />
          {[
            {init:'MK',name:'Muthu Kumar',role:'Mixer operator',date:'Joining 2 Jul',status:'Docs pending',type:'amber',color:'var(--accent)'},
            {init:'SL',name:'Saranya L.',role:'QA inspector',date:'Joining 5 Jul',status:'Ready',type:'green',color:'var(--green)'},
          ].map((e,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px', background:'var(--bg)', borderRadius:'var(--r10)', boxShadow:'var(--s-in)', marginBottom:8 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--bg)', boxShadow:'var(--s-sm)', color:e.color, fontSize:11, fontWeight:700, display:'grid', placeItems:'center', flexShrink:0 }}>{e.init}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>{e.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{e.role} · {e.date}</div>
              </div>
              <Tag label={e.status} type={e.type} />
            </div>
          ))}
        </Card>
      </div>

      <Modal open={modal} title="Onboard Employee" onClose={()=>setModal(false)} onSubmit={save}>
        <Input label="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Employee name" />
        <Select label="Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="">Select role</option>
          <option>Supervisor</option><option>Mixer Op.</option><option>Dryer Op.</option><option>Packer</option><option>QA</option><option>Driver</option><option>Helper</option>
        </Select>
        <Select label="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
          <option value="">Select dept</option>
          <option>Production</option><option>Packing</option><option>Quality</option><option>Logistics</option><option>Maintenance</option>
        </Select>
      </Modal>
    </div>
  );
}
