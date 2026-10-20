import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Tag, SectionHeader, Spinner, Row } from '../components/UI';

export default function Dashboard({ goTo }) {
  const [stats, setStats] = useState(null);
  const [time, setTime] = useState('');
  const [packs, setPacks] = useState(5780);

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {});
    const iv = setInterval(() => {
      const now = new Date();
      const shift = new Date(); shift.setHours(6,0,0,0);
      const d = Math.max(0, now - shift);
      const h = String(Math.floor(d/3600000)).padStart(2,'0');
      const m = String(Math.floor((d%3600000)/60000)).padStart(2,'0');
      const s = String(Math.floor((d%60000)/1000)).padStart(2,'0');
      setTime(`${h}:${m}:${s}`);
      if (Math.random() > .7) setPacks(p => p + Math.floor(Math.random()*3));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!stats) return <Spinner />;

  const weekData = [
    {lb:'Mon',prod:52,waste:6},{lb:'Tue',prod:62,waste:4},{lb:'Wed',prod:45,waste:9},
    {lb:'Thu',prod:65,waste:3},{lb:'Fri',prod:58,waste:7},{lb:'Sat',prod:50,waste:8},{lb:'Today',prod:40,waste:9,today:true}
  ];
  const maxH = 65;

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:800, letterSpacing:-.5 }}>Good morning! 👋</div>
        <div style={{ fontSize:12.5, color:'var(--text3)', marginTop:3 }}>Sastha Appalam · Monday 29 Jun 2026</div>
      </div>

      {/* Alert banner */}
      <div style={{ background:'var(--amM)', borderRadius:'var(--r8)', padding:'11px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:'var(--amber)', boxShadow:'var(--s-sm)' }}>
        <i className="ti ti-alert-triangle" style={{ fontSize:15, flexShrink:0 }} />
        <span><strong>Today:</strong> Production at 68% target · Dryer #2 stopped · Urad Dal stock critical (280 kg)</span>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Production today" value={packs.toLocaleString('en-IN')} sub="Target 8,500 packs · 68%" tag="↑ +12% yesterday" tagType="green" accent onClick={()=>goTo('production')} />
        <KPI label="Total wastage" value={`${stats.totalWaste} kg`} sub="4.8% of raw material" tag="Above 4% limit" tagType="red" onClick={()=>goTo('wastage')} />
        <KPI label="Stock value" value={`₹${(stats.stockValue/100000).toFixed(1)}L`} sub="28 SKUs · 3 zones" tag="Stable" tagType="gray" onClick={()=>goTo('inventory')} />
        <KPI label="Deliveries today" value={stats.deliveriesCount} sub={`${stats.delayedCount} delayed · ${stats.shortageCount} shortage`} tag="Action needed" tagType="red" onClick={()=>goTo('delivery')} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16, marginBottom:20 }}>
        {/* Bar chart */}
        <Card>
          <SectionHeader title="Weekly production (packs)" />
          <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:80, marginBottom:8 }}>
            {weekData.map((d,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <div style={{ borderRadius:'4px 4px 0 0', width:'100%', background:d.today?'var(--accent2)':'var(--accent)', height:`${(d.prod/maxH)*70}px`, boxShadow:'2px 0 8px rgba(255,107,53,.3)', opacity:d.today?.75:1 }} />
                <div style={{ borderRadius:'4px 4px 0 0', width:'100%', background:'#FDA4AF', height:`${(d.waste/maxH)*10}px`, opacity:d.today?.75:1 }} />
                <div style={{ fontSize:10, color:d.today?'var(--accent)':'var(--text3)', marginTop:4, fontWeight:d.today?700:400 }}>{d.lb}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:14 }}>
            {[{c:'var(--accent)',l:'Production'},{c:'#FDA4AF',l:'Wastage'}].map(x=>(
              <div key={x.l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text3)' }}>
                <div style={{ width:9, height:9, borderRadius:2, background:x.c }} />{x.l}
              </div>
            ))}
          </div>
        </Card>

        {/* Machine status */}
        <Card>
          <SectionHeader title="Machine status" action="View all →" onAction={()=>goTo('machines')} />
          {[
            {name:'Mixer #1',sub:'SA-441 · 7h 20m',status:'Running',type:'green'},
            {name:'Mixer #2',sub:'SA-442 · 5h 10m',status:'Running',type:'green'},
            {name:'Dryer #1',sub:'42°C normal',status:'Running',type:'green'},
            {name:'Dryer #2',sub:'Overheat fault',status:'Stopped',type:'red'},
            {name:'Packing Line A',sub:'5,200 bags done',status:'Running',type:'green'},
          ].map((m,i,a)=>(
            <Row key={i} last={i===a.length-1}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:`var(--${m.type})`, boxShadow:`0 0 6px var(--${m.type})` }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>{m.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{m.sub}</div>
              </div>
              <Tag label={m.status} type={m.type} />
            </Row>
          ))}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Deliveries */}
        <Card>
          <SectionHeader title="Active deliveries" action="Full view →" onAction={()=>goTo('delivery')} />
          {[
            {id:'SA-088',cust:'Ravi Stores, Madurai',sub:'200g × 500 · ETA 15:30',status:'En route',type:'blue'},
            {id:'SA-092',cust:'Star Supermart, Chennai',sub:'Mix 1kg × 200 · Checkpoint hold',status:'Stuck',type:'red'},
            {id:'SA-096',cust:'Annapoorna Hotels, CBE',sub:'5kg × 50 · Done 12:10',status:'Delivered',type:'green'},
            {id:'SA-098',cust:'Grand Exports, TVL',sub:'Export 1kg × 300 · No stock',status:'Shortage',type:'red'},
          ].map((d,i,a)=>(
            <Row key={i} last={i===a.length-1}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>{d.id} · {d.cust}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{d.sub}</div>
              </div>
              <Tag label={d.status} type={d.type} />
            </Row>
          ))}
        </Card>

        {/* Pending approvals */}
        <Card>
          <SectionHeader title="Pending approvals" action="Review →" onAction={()=>goTo('approvals')} />
          {[
            {icon:'ti-recycle',title:'Waste report #W-18',sub:'Dryer #2 · 142 kg · Selvam K.',status:'Pending',type:'amber'},
            {icon:'ti-shopping-cart',title:'Purchase PR-44 — Urad Dal',sub:'500 kg · ₹38,000 · Critical',status:'Urgent',type:'red'},
            {icon:'ti-clock',title:'OT request · 4 workers',sub:'Weekend packing shift',status:'Queued',type:'gray'},
          ].map((a,i,arr)=>(
            <Row key={i} last={i===arr.length-1}>
              <div style={{ width:30, height:30, background:'var(--bg)', borderRadius:8, boxShadow:'var(--s-sm)', display:'grid', placeItems:'center', flexShrink:0 }}>
                <i className={`ti ${a.icon}`} style={{ fontSize:15, color:'var(--accent)' }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)' }}>{a.title}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{a.sub}</div>
              </div>
              <Tag label={a.status} type={a.type} />
            </Row>
          ))}
        </Card>
      </div>

      {/* Live floor */}
      <Card>
        <SectionHeader title={<><span className="live-dot" />Live production floor</>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            {label:'Packs today',value:packs.toLocaleString('en-IN'),color:'var(--accent)'},
            {label:'Dal used',value:`${Math.round(packs*.32)} kg`,color:'var(--green)'},
            {label:'Dryer temp',value:'42.3°C',color:'var(--blue)'},
            {label:'Shift runtime',value:time,color:'var(--text)'},
          ].map((m,i)=>(
            <div key={i} style={{ background:'var(--bg)', borderRadius:'var(--r12)', boxShadow:'var(--s-in)', padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:m.color }}>{m.value}</div>
              <div style={{ fontSize:10.5, color:'var(--text3)', marginTop:3, fontWeight:500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
