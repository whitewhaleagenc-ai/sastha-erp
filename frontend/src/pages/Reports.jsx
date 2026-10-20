import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, KPI, Table, SectionHeader, Spinner, ProgressBar } from '../components/UI';

export default function Reports() {
  const [data, setData] = useState(null);
  useEffect(()=>{ api.reports().then(setData).catch(()=>{}); },[]);
  if (!data) return <Spinner />;

  return (
    <div>
      <div style={{ background:'var(--bM)', borderRadius:'var(--r8)', padding:'11px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontSize:12.5, color:'var(--blue)', boxShadow:'3px 3px 8px #C8CAD2,-3px -3px 8px #FFF' }}>
        <i className="ti ti-chart-bar" style={{ fontSize:15 }} />
        Analytics view — Manager access. Sastha Appalam consolidated report · June 2026.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPI label="Monthly output" value={`${(data.totalOutput/1000).toFixed(1)}K`} sub="packs this month" accent />
        <KPI label="Avg waste rate" value="4.6%" sub="Threshold 4%" tag="Above limit" tagType="red" />
        <KPI label="Delivery on-time" value={`${data.onTimeRate}%`} sub="Target 90%" tag={data.onTimeRate<90?"Below target":"On target"} tagType={data.onTimeRate<90?"red":"green"} />
        <KPI label="Revenue est." value="₹62L" sub="June 2026" tag="+8.4%" tagType="green" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <Card>
          <SectionHeader title="Supervisor performance" />
          <Table
            cols={[
              {key:'name',label:'Supervisor',w:'120px',render:r=><span style={{fontWeight:600}}>{r.name}</span>},
              {key:'output',label:'Output',w:'90px'},
              {key:'waste',label:'Waste %',w:'80px',render:r=><span style={{color:parseFloat(r.waste)>4?'var(--red)':parseFloat(r.waste)>3.5?'var(--amber)':'var(--green)'}}>{r.waste}</span>},
              {key:'batches',label:'Batches'},
            ]}
            rows={[
              {name:'Selvam K.',output:'2,400 pks',waste:'3.8%',batches:3},
              {name:'Meena R.',output:'1,600 pks',waste:'6.2%',batches:2},
              {name:'Arjun P.',output:'980 pks',waste:'4.5%',batches:2},
              {name:'Priya M.',output:'800 pks',waste:'5.1%',batches:2},
            ]}
          />
        </Card>
        <Card>
          <SectionHeader title="Cost vs revenue — June" />
          {[
            {k:'Production cost',v:'₹48,00,000',c:'var(--text)'},
            {k:'Revenue generated',v:'₹62,00,000',c:'var(--green)'},
            {k:'Gross margin',v:'₹14,00,000 (22.6%)',c:'var(--green)'},
            {k:'Wastage loss',v:'— ₹1,20,000',c:'var(--red)'},
            {k:'Net profit (est.)',v:'₹12,80,000',c:'var(--accent)',bold:true},
          ].map((r,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:i<4?'1px solid var(--bg2)':'none', fontSize:12.5 }}>
              <span style={{ color:'var(--text3)' }}>{r.k}</span>
              <span style={{ fontWeight:r.bold?700:500, color:r.c }}>{r.v}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SectionHeader title="Top customers — June 2026" />
        <Table
          cols={[
            {key:'name',label:'Customer',w:'180px',render:r=><span style={{fontWeight:600}}>{r.name}</span>},
            {key:'city',label:'City',w:'110px'},
            {key:'orders',label:'Orders',w:'70px'},
            {key:'value',label:'Value',w:'100px'},
            {key:'product',label:'Product mix'},
          ]}
          rows={[
            {name:'Annapoorna Hotels Chain',city:'Coimbatore',orders:12,value:'₹8,40,000',product:'Hotel Pack 5 kg'},
            {name:'Star Supermart',city:'Chennai',orders:18,value:'₹6,20,000',product:'200g, 500g mixed'},
            {name:'Grand Exports',city:'Tirunelveli',orders:6,value:'₹5,80,000',product:'Export 1 kg carton'},
            {name:'Ravi General Stores',city:'Madurai',orders:22,value:'₹4,10,000',product:'200g retail'},
            {name:'Kumari Snacks',city:'Nagercoil',orders:9,value:'₹2,90,000',product:'Bulk 1 kg'},
          ]}
        />
      </Card>
    </div>
  );
}
