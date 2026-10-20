import { useState } from 'react';
import { useAuth } from '../App';
import { useToast, Toast } from '../components/UI';
import Dashboard from './Dashboard';
import Production from './Production';
import Wastage from './Wastage';
import Inventory from './Inventory';
import Delivery from './Delivery';
import Machines from './Machines';
import Attendance from './Attendance';
import Approvals from './Approvals';
import Reports from './Reports';
import MyOrders from './MyOrders';

const NAV = {
  admin: [
    { sec:'Overview', links:[{id:'dashboard',ic:'ti-layout-dashboard',lb:'Dashboard'},{id:'production',ic:'ti-building-factory-2',lb:'Production'},{id:'wastage',ic:'ti-recycle',lb:'Wastage'},{id:'inventory',ic:'ti-package',lb:'Inventory'}] },
    { sec:'Operations', links:[{id:'delivery',ic:'ti-truck',lb:'Delivery',pip:3,red:true},{id:'machines',ic:'ti-settings-automation',lb:'Machines'}] },
    { sec:'People', links:[{id:'attendance',ic:'ti-users',lb:'Attendance'},{id:'approvals',ic:'ti-shield-check',lb:'Approvals',pip:2}] },
  ],
  manager: [
    { sec:'Overview', links:[{id:'dashboard',ic:'ti-layout-dashboard',lb:'Dashboard'},{id:'production',ic:'ti-building-factory-2',lb:'Production'},{id:'inventory',ic:'ti-package',lb:'Inventory'}] },
    { sec:'Operations', links:[{id:'delivery',ic:'ti-truck',lb:'Delivery',pip:3,red:true},{id:'machines',ic:'ti-settings-automation',lb:'Machines'}] },
    { sec:'Analytics', links:[{id:'reports',ic:'ti-chart-bar',lb:'Reports'},{id:'wastage',ic:'ti-recycle',lb:'Wastage'},{id:'approvals',ic:'ti-shield-check',lb:'Approvals',pip:2}] },
  ],
  supervisor: [
    { sec:'My floor', links:[{id:'production',ic:'ti-building-factory-2',lb:'Production'},{id:'machines',ic:'ti-settings-automation',lb:'Machines'},{id:'wastage',ic:'ti-recycle',lb:'Wastage'}] },
    { sec:'Team', links:[{id:'attendance',ic:'ti-users',lb:'Attendance'},{id:'approvals',ic:'ti-shield-check',lb:'Approvals',pip:2}] },
  ],
  client: [
    { sec:'Account', links:[{id:'myorders',ic:'ti-truck',lb:'My Orders'}] },
  ],
};

const DEFAULTS = { admin:'dashboard', manager:'dashboard', supervisor:'production', client:'myorders' };

const PAGES = { dashboard:Dashboard, production:Production, wastage:Wastage, inventory:Inventory, delivery:Delivery, machines:Machines, attendance:Attendance, approvals:Approvals, reports:Reports, myorders:MyOrders };

const TITLES = { dashboard:'Dashboard', production:'Production', wastage:'Wastage Tracker', inventory:'Inventory', delivery:'Delivery Management', machines:'Machine Monitor', attendance:'Attendance & Onboarding', approvals:'Approvals', reports:'Reports & Analytics', myorders:'My Orders' };

export default function Layout() {
  const { user, logout } = useAuth();
  const { msgs, show } = useToast();
  const [page, setPage] = useState(DEFAULTS[user.role] || 'dashboard');

  const nav = NAV[user.role] || NAV.admin;
  const Page = PAGES[page] || (() => <div style={{ padding:40, textAlign:'center', color:'var(--text3)' }}>🔒 Access restricted</div>);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      {/* SIDEBAR */}
      <nav style={{ width:228, background:'var(--bg)', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', boxShadow:'4px 0 20px rgba(0,0,0,.06)' }}>
        <div style={{ padding:'18px 16px 14px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'var(--bg)', borderRadius:11, boxShadow:'var(--s-out)', display:'grid', placeItems:'center', flexShrink:0 }}>
            <i className="ti ti-circles-relation" style={{ fontSize:18, color:'var(--accent)' }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Sastha Appalam</div>
            <div style={{ fontSize:10, color:'var(--text3)', fontWeight:500 }}>ERP Suite</div>
          </div>
        </div>

        <div style={{ flex:1, padding:'8px 10px' }}>
          {nav.map(g => (
            <div key={g.sec} style={{ marginTop:4 }}>
              <div style={{ padding:'10px 10px 4px', fontSize:9.5, fontWeight:700, letterSpacing:.8, textTransform:'uppercase', color:'var(--text4)' }}>{g.sec}</div>
              {g.links.map(l => (
                <div key={l.id} onClick={() => setPage(l.id)} style={{
                  display:'flex', alignItems:'center', gap:9, padding:'9px 12px', margin:'2px 0', borderRadius:'var(--r8)',
                  cursor:'pointer', fontSize:12.5, transition:'all .15s',
                  color: page === l.id ? 'var(--accent)' : 'var(--text3)',
                  fontWeight: page === l.id ? 600 : 400,
                  background: page === l.id ? 'var(--bg)' : 'transparent',
                  boxShadow: page === l.id ? 'var(--s-in)' : 'none',
                }}>
                  <i className={`ti ${l.ic}`} style={{ fontSize:15, width:16, textAlign:'center' }} />
                  {l.lb}
                  {l.pip && <span style={{ marginLeft:'auto', minWidth:18, height:18, background: l.red ? 'var(--red)' : 'var(--accent)', color:'#fff', fontSize:10, fontWeight:700, borderRadius:9, display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'0 5px' }}>{l.pip}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderTop:'1px solid var(--bg2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, background:'var(--bg)', borderRadius:'var(--r8)', padding:'10px 12px', boxShadow:'var(--s-in)' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--bg)', boxShadow:'var(--s-sm)', color:'var(--accent)', fontSize:11, fontWeight:700, display:'grid', placeItems:'center', flexShrink:0 }}>{user.initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'capitalize' }}>{user.role}</div>
            </div>
            <button onClick={() => { logout(); show('👋 Logged out'); }} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:4, display:'flex' }}>
              <i className="ti ti-logout" style={{ fontSize:15 }} />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ height:52, background:'var(--bg)', display:'flex', alignItems:'center', padding:'0 22px', gap:10, boxShadow:'0 2px 12px rgba(0,0,0,.06)', flexShrink:0 }}>
          <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--text)' }}>{TITLES[page]}</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500 }}>
              <span className="live-dot" />Live
            </div>
            <div style={{ width:1, height:20, background:'var(--bg2)', margin:'0 6px' }} />
            <div style={{ width:30, height:30, borderRadius:'var(--r8)', background:'var(--bg)', display:'grid', placeItems:'center', boxShadow:'var(--s-sm)', color:'var(--text3)', cursor:'pointer' }}>
              <i className="ti ti-bell" style={{ fontSize:15 }} />
            </div>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--bg)', color:'var(--accent)', fontSize:11, fontWeight:700, display:'grid', placeItems:'center', boxShadow:'var(--s-sm)', cursor:'pointer' }}>{user.initials}</div>
          </div>
        </header>

        <div style={{ flex:1, overflowY:'auto', padding:22, background:'var(--bg)' }}>
          <Page toast={show} goTo={setPage} role={user.role} />
        </div>
      </div>

      <Toast messages={msgs} />
    </div>
  );
}
