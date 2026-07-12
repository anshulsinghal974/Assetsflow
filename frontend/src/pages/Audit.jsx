import { useState, useEffect } from 'react';
import { auditAPI } from '../api/audit';
import DataTable from '../components/Tables';
import StatusBadge from '../components/StatusBadge';
import { SkeletonTable } from '../components/LoadingSkeleton';

const demoAudits = [
  { _id: '1', scope: 'HQ - Floor 3', startDate: '2024-07-01', endDate: '2024-07-05', status: 'Completed', stats: { total: 145, verified: 140, missing: 2, damaged: 3 } },
  { _id: '2', scope: 'Engineering Department (Laptops)', startDate: '2024-07-10', endDate: '2024-07-15', status: 'Ongoing', stats: { total: 42, verified: 28, missing: 0, damaged: 0 } },
];

export default function Audit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAudits(); }, []);

  const loadAudits = async () => {
    try {
      const res = await auditAPI.getCycles();
      setAudits(res.data?.cycles || res.data || []);
    } catch {
      setAudits(demoAudits);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Audit Scope', render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.scope}</span> },
    { header: 'Period', render: (row) => (
      <span style={{ fontSize: '0.8125rem' }}>
        {new Date(row.startDate).toLocaleDateString()} – {new Date(row.endDate).toLocaleDateString()}
      </span>
    )},
    { header: 'Status', render: (row) => <StatusBadge status={row.status === 'Completed' ? 'Completed' : 'Ongoing'} /> },
    { header: 'Progress', sortable: false, render: (row) => {
      const verifiedPercent = (row.stats.verified / row.stats.total) * 100;
      return (
        <div style={{ width: 150 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
            <span>{row.stats.verified} / {row.stats.total}</span>
            <span style={{ fontWeight: 600 }}>{Math.round(verifiedPercent)}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--bg-main)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${verifiedPercent}%`, height: '100%', background: row.status === 'Completed' ? 'var(--success)' : 'var(--primary)' }}></div>
          </div>
        </div>
      );
    }},
    { header: 'Discrepancies', sortable: false, render: (row) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{row.stats.missing} Missing</span>
        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{row.stats.damaged} Damaged</span>
      </div>
    )},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={4} cols={5} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Audit Cycles</h1>
          <p className="page-header-subtitle">Track and review physical asset audits</p>
        </div>
        <button className="btn btn-primary btn-sm" disabled>New Audit (Coming Soon)</button>
      </div>

      <DataTable
        columns={columns}
        data={audits}
        searchPlaceholder="Search audits..."
        id="audits-table"
      />
    </div>
  );
}
