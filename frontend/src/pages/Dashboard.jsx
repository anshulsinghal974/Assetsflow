import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api/dashboard';
import KPICards from '../components/KPICards';
import StatusBadge from '../components/StatusBadge';
import { SkeletonCard, SkeletonChart } from '../components/LoadingSkeleton';
import {
  IoCubeOutline,
  IoCheckmarkCircleOutline,
  IoConstructOutline,
  IoCalendarOutline,
  IoSwapHorizontalOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
} from 'recharts';

// Demo data (used until backend is ready)
const demoKPIs = {
  availableAssets: 142,
  allocatedAssets: 87,
  underMaintenance: 12,
  activeBookings: 23,
  pendingTransfers: 8,
  upcomingReturns: 15,
};

const pieData = [
  { name: 'Available', value: 142, color: '#059669' },
  { name: 'Allocated', value: 87, color: '#4F46E5' },
  { name: 'Reserved', value: 18, color: '#7C3AED' },
  { name: 'Maintenance', value: 12, color: '#D97706' },
  { name: 'Retired', value: 6, color: '#94A3B8' },
];

const weeklyBookings = [
  { day: 'Mon', bookings: 12, returns: 5 },
  { day: 'Tue', bookings: 18, returns: 8 },
  { day: 'Wed', bookings: 15, returns: 12 },
  { day: 'Thu', bookings: 22, returns: 7 },
  { day: 'Fri', bookings: 9, returns: 14 },
  { day: 'Sat', bookings: 4, returns: 3 },
  { day: 'Sun', bookings: 2, returns: 1 },
];

const trendData = [
  { month: 'Jan', assets: 180 },
  { month: 'Feb', assets: 195 },
  { month: 'Mar', assets: 210 },
  { month: 'Apr', assets: 225 },
  { month: 'May', assets: 245 },
  { month: 'Jun', assets: 265 },
];

const recentActivity = [
  { id: 1, action: 'Asset AF-0142 allocated to Rahul Sharma', type: 'allocation', time: '2 min ago' },
  { id: 2, action: 'Room B2 booked by Priya Singh (2:00 PM – 3:00 PM)', type: 'booking', time: '15 min ago' },
  { id: 3, action: 'Maintenance request raised for Projector P-03', type: 'maintenance', time: '1 hour ago' },
  { id: 4, action: 'Transfer request approved: Laptop L-089 → Finance Dept', type: 'transfer', time: '2 hours ago' },
  { id: 5, action: 'Asset AF-0098 returned by Neha Gupta', type: 'return', time: '3 hours ago' },
  { id: 6, action: 'New asset registered: Standing Desk SD-015', type: 'asset', time: '4 hours ago' },
];

const activityColors = {
  allocation: 'var(--primary)',
  booking: 'var(--info)',
  maintenance: 'var(--warning)',
  transfer: 'var(--secondary)',
  return: 'var(--success)',
  asset: 'var(--primary)',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [kpis, setKPIs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const res = await dashboardAPI.getKPIs();
      setKPIs(res.data);
    } catch {
      // Use demo data when backend is not ready
      setKPIs(demoKPIs);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { title: 'Available Assets', value: kpis?.availableAssets ?? 0, icon: IoCheckmarkCircleOutline, color: 'emerald', subtitle: 'Ready to allocate' },
    { title: 'Allocated', value: kpis?.allocatedAssets ?? 0, icon: IoCubeOutline, color: 'indigo', subtitle: 'Currently in use' },
    { title: 'Under Maintenance', value: kpis?.underMaintenance ?? 0, icon: IoConstructOutline, color: 'amber', subtitle: 'Service in progress' },
    { title: 'Active Bookings', value: kpis?.activeBookings ?? 0, icon: IoCalendarOutline, color: 'sky', subtitle: 'Today\'s schedule' },
    { title: 'Pending Transfers', value: kpis?.pendingTransfers ?? 0, icon: IoSwapHorizontalOutline, color: 'violet', subtitle: 'Awaiting approval' },
    { title: 'Upcoming Returns', value: kpis?.upcomingReturns ?? 0, icon: IoTimeOutline, color: 'rose', subtitle: 'Due this week' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="page-header-subtitle">
            Here's what's happening with your assets today
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <IoTrendingUpOutline size={16} color="var(--success)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>
            +12% asset utilization this month
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : (
        <KPICards cards={kpiCards} />
      )}

      {/* Charts */}
      {loading ? (
        <div className="charts-grid">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="charts-grid">
          {/* Asset Status Distribution */}
          <div className="card">
            <div className="card-header">
              <h3>Asset Status Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8125rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '0.8125rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Bookings & Returns */}
          <div className="card">
            <div className="card-header">
              <h3>Weekly Activity</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyBookings} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="day" fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8125rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '0.8125rem' }} />
                <Bar dataKey="bookings" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Bookings" />
                <Bar dataKey="returns" fill="#059669" radius={[4, 4, 0, 0]} name="Returns" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Section: Trend + Activity */}
      <div className="charts-grid" style={{ marginTop: 0 }}>
        {/* Asset Growth Trend */}
        <div className="card">
          <div className="card-header">
            <h3>Asset Growth Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
              <YAxis fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Area
                type="monotone"
                dataKey="assets"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fill="url(#colorAssets)"
                name="Total Assets"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn btn-ghost btn-sm" id="view-all-activity-btn">View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none',
                  animation: `slideInRight ${0.15 + i * 0.05}s ease`,
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: activityColors[item.type],
                  marginTop: 6,
                  flexShrink: 0,
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.action}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
