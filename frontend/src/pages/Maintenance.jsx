import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { maintenanceAPI } from '../api/maintenance';
import { assetAPI } from '../api/asset';
import DataTable from '../components/Tables';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHammerOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoFlameOutline,
} from 'react-icons/io5';

const PriorityIcon = ({ priority }) => {
  const config = {
    Low: { icon: IoAlertCircleOutline, color: 'var(--info)', label: 'Low' },
    Medium: { icon: IoWarningOutline, color: 'var(--warning)', label: 'Medium' },
    High: { icon: IoFlameOutline, color: 'var(--danger)', label: 'High' },
    Critical: { icon: IoFlameOutline, color: 'var(--danger)', label: 'Critical' },
  };
  const c = config[priority] || config.Medium;
  const Icon = c.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: c.color, fontWeight: 600, fontSize: '0.8125rem' }}>
      <Icon size={16} /> {c.label}
    </span>
  );
};

export default function Maintenance() {
  const { isAssetManager } = useAuth();
  const [requests, setRequests] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [res, assetsRes] = await Promise.all([
        maintenanceAPI.getAll(),
        assetAPI.getAll()
      ]);
      setRequests(res.data || []);
      setAssetList(assetsRes.data || []);
    } catch {
      setRequests([]);
      setAssetList([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await maintenanceAPI.create(data);
      toast.success('Maintenance request submitted!');
      setShowModal(false);
      reset();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to submit request');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await maintenanceAPI.approve(id);
      else if (action === 'reject') await maintenanceAPI.reject(id);
      else if (action === 'resolve') await maintenanceAPI.resolve(id);
      toast.success(`Request ${action}d!`);
      loadData();
    } catch (err) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const filteredRequests = statusFilter
    ? requests.filter(r => r.status === statusFilter)
    : requests;

  const columns = [
    { header: 'Asset', render: (row) => (
      <div>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{row.asset?.assetTag}</span>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.asset?.name}</p>
      </div>
    )},
    { header: 'Raised By', render: (row) => <span style={{ fontWeight: 500 }}>{row.raisedBy?.name}</span> },
    { header: 'Issue', accessor: 'issue', render: (row) => (
      <span style={{ fontSize: '0.8125rem', maxWidth: 250, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.issue}
      </span>
    )},
    { header: 'Priority', render: (row) => <PriorityIcon priority={row.priority} /> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} dot /> },
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Actions', sortable: false, render: (row) => {
      if (!isAssetManager()) return null;
      return (
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {row.status === 'Pending' && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => handleAction(row._id, 'approve')} id={`approve-maint-${row._id}`}>
                <IoCheckmarkCircleOutline size={14} /> Approve
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleAction(row._id, 'reject')} id={`reject-maint-${row._id}`}>
                <IoCloseCircleOutline size={14} />
              </button>
            </>
          )}
          {row.status === 'Approved' && (
            <button className="btn btn-primary btn-sm" onClick={() => handleAction(row._id, 'resolve')} id={`resolve-maint-${row._id}`}>
              <IoHammerOutline size={14} /> Resolve
            </button>
          )}
        </div>
      );
    }},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={5} cols={7} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p className="page-header-subtitle">Track and manage maintenance requests</p>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Pending', count: requests.filter(r => r.status === 'Pending').length, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Approved', count: requests.filter(r => r.status === 'Approved').length, color: 'var(--info)', bg: 'var(--info-light)' },
          { label: 'Resolved', count: requests.filter(r => r.status === 'Resolved').length, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Rejected', count: requests.filter(r => r.status === 'Rejected').length, color: 'var(--danger)', bg: 'var(--danger-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--space-4)', cursor: 'pointer', borderLeft: `3px solid ${s.color}` }}
            onClick={() => setStatusFilter(statusFilter === s.label ? '' : s.label)}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredRequests}
        searchPlaceholder="Search by asset, issue, or person..."
        id="maintenance-table"
        filters={
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="maintenance-status-filter">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Resolved">Resolved</option>
          </select>
        }
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="raise-maintenance-btn">
            <IoAddOutline size={18} /> Raise Request
          </button>
        }
      />

      {/* Raise Request Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Raise Maintenance Request">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Asset *</label>
            <select className={`form-select ${errors.asset ? 'error' : ''}`}
              {...register('asset', { required: 'Asset is required' })} id="maint-asset-input">
              <option value="">Select an asset...</option>
              {assetList.map(a => <option key={a._id} value={a._id}>{a.assetTag} - {a.name}</option>)}
            </select>
            {errors.asset && <p className="form-error">{errors.asset.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Issue Description *</label>
            <textarea className={`form-textarea ${errors.issue ? 'error' : ''}`} rows={4}
              placeholder="Describe the issue in detail..."
              {...register('issue', { required: 'Issue description is required' })} id="maint-issue-input" />
            {errors.issue && <p className="form-error">{errors.issue.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Priority *</label>
            <select className="form-select" {...register('priority', { required: true })} id="maint-priority-select">
              <option value="Low">Low — Can wait</option>
              <option value="Medium">Medium — Needs attention soon</option>
              <option value="High">High — Urgent</option>
              <option value="Critical">Critical — Immediate action needed</option>
            </select>
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="maint-submit-btn">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
