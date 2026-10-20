import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, Table, BtnSm, Modal, Select, SectionHeader, Spinner } from '../components/UI';

const ST = { running:'green', idle:'amber', stopped:'red', maintenance:'red' };

export default function Machines({ toast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);

  const load = () => api.machines.list().then(setData).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const update = async () => {
    try { await api.machines.update(editItem.id,{status:editItem.status,last_event:editItem.last_event}); toast('✅ Machine updated'); setEditItem(null); load(); }
    catch(e) { toast('❌ '+e.message); }
  };

  const running = data.filter(d=>d.status==='running').length;
  const idle = data.filter(d=>d.status==='idle').length;
  const stopped = data.filter(d=>['stopped','maintenance'].includes(d.status)).length;
  const avgUptime = data.length ? Math.round(data.reduce((a,b)=>a+(b.uptime_pct||0),0)/data.length) : 0;

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Running" value={running} sub="Active now" accent />
        <KPI label="Idle" value={idle} sub="Awaiting input" />
        <KPI label="Stopped" value={stopped} sub="Need attention" tag={stopped>0?"Fix now":"OK"} tagType={stopped>0?"red":"green"} />
        <KPI label="Avg uptime" value={`${avgUptime}%`} sub="Target 90%" tag={avgUptime<90?"Below target":"On target"} tagType={avgUptime<90?"red":"green"} />
      </div>

      <Table
        cols={[
          {key:'name',label:'Machine',w:'150px',render:r=><span style={{fontWeight:600}}>{r.name}</span>},
          {key:'status',label:'Status',w:'95px',render:r=><Tag label={r.status} type={ST[r.status]||'gray'}/>},
          {key:'current_batch',label:'Batch',w:'80px',render:r=>r.current_batch||'—'},
          {key:'started_at',label:'Started',w:'75px',render:r=>r.started_at||'—'},
          {key:'uptime_pct',label:'Uptime',w:'100px',render:r=>(
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:60, height:5, background:'var(--bg2)', borderRadius:3, overflow:'hidden', boxShadow:'var(--s-in)' }}>
                <div style={{ width:`${r.uptime_pct}%`, height:'100%', background:r.uptime_pct<50?'var(--red)':r.uptime_pct<80?'var(--amber)':'var(--green)', borderRadius:3 }}/>
              </div>
              <span style={{ fontSize:11, color:'var(--text3)' }}>{r.uptime_pct}%</span>
            </div>
          )},
          {key:'output',label:'Output',render:r=>r.output||'—'},
          {key:'last_event',label:'Last event',render:r=>r.last_event||'—'},
          {key:'operator',label:'Operator',w:'100px',render:r=>r.operator||'—'},
        ]}
        rows={data}
        onEdit={r=>setEditItem({...r})}
      />

      <Card style={{ marginTop:20 }}>
        <SectionHeader title="Start / Stop log — today" />
        <Table
          cols={[
            {key:'time',label:'Time',w:'90px'},{key:'machine',label:'Machine',w:'140px'},
            {key:'event',label:'Event',w:'90px',render:r=><Tag label={r.event} type={r.type}/>},
            {key:'operator',label:'Operator',w:'100px'},{key:'note',label:'Note'},
          ]}
          rows={[
            {time:'05:55 AM',machine:'Mixer #1',event:'Started',type:'green',operator:'Selvam K.',note:'Batch SA-441 — Appalam 200g'},
            {time:'06:10 AM',machine:'Packing Line A',event:'Started',type:'green',operator:'Meena R.',note:'Auto-start after mixer'},
            {time:'07:28 AM',machine:'Dryer #1',event:'Started',type:'green',operator:'Arjun P.',note:'Temp set 44°C'},
            {time:'08:12 AM',machine:'Dryer #2',event:'Stopped',type:'red',operator:'System',note:'Overheat alarm — 68°C'},
            {time:'08:30 AM',machine:'Mixer #2',event:'Started',type:'green',operator:'Priya M.',note:'Batch SA-442'},
            {time:'12:45 PM',machine:'Dryer #1',event:'Cooling',type:'amber',operator:'System',note:'Batch SA-441 complete'},
          ]}
        />
      </Card>

      <Modal open={!!editItem} title="Update Machine" onClose={()=>setEditItem(null)} onSubmit={update}>
        {editItem && <>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:14 }}>{editItem.name}</div>
          <Select label="Status" value={editItem.status} onChange={e=>setEditItem({...editItem,status:e.target.value})}>
            <option value="running">Running</option><option value="idle">Idle</option><option value="stopped">Stopped</option><option value="maintenance">Maintenance</option>
          </Select>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>Note</label>
            <input value={editItem.last_event||''} onChange={e=>setEditItem({...editItem,last_event:e.target.value})} style={{ width:'100%', background:'var(--bg)', border:'none', borderRadius:'var(--r8)', padding:'9px 13px', fontSize:13, color:'var(--text)', outline:'none', fontFamily:'inherit', boxShadow:'var(--s-in)' }} placeholder="Add note" />
          </div>
        </>}
      </Modal>
    </div>
  );
}
