import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetAPI } from '../api/asset';
import DataTable from '../components/Tables';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { IoAddOutline, IoEyeOutline, IoCreateOutline } from 'react-icons/io5';

const conditionOptions = [
  { value: 'New', label: 'New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Available', label: 'Available' },
  { value: 'Allocated', label: 'Allocated' },
  { value: 'Reserved', label: 'Reserved' },
  { value: 'UnderMaintenance', label: 'Under Maintenance' },
  { value: 'Retired', label: 'Retired' },
];

// Demo data
const demoAssets = [
  { _id: '1', assetTag: 'AF-0001', name: 'MacBook Pro 14"', category: { name: 'Laptops' }, status: 'Available', condition: 'New', location: 'HQ Floor 3', department: { name: 'Engineering' }, serialNumber: 'MBP-2024-001' },
  { _id: '2', assetTag: 'AF-0002', name: 'Standing Desk', category: { name: 'Furniture' }, status: 'Allocated', condition: 'Good', location: 'HQ Floor 2', department: { name: 'Design' }, serialNumber: 'SD-2024-015' },
  { _id: '3', assetTag: 'AF-0003', name: 'Conference Room Projector', category: { name: 'Electronics' }, status: 'Available', condition: 'Good', location: 'Room B2', department: { name: 'Shared' }, serialNumber: 'PRJ-2024-003' },
  { _id: '4', assetTag: 'AF-0004', name: 'Herman Miller Chair', category: { name: 'Furniture' }, status: 'Allocated', condition: 'Good', location: 'HQ Floor 1', department: { name: 'HR' }, serialNumber: 'HMC-2024-042' },
  { _id: '5', assetTag: 'AF-0005', name: 'Dell Monitor 27"', category: { name: 'Electronics' }, status: 'UnderMaintenance', condition: 'Fair', location: 'IT Storage', department: { name: 'Engineering' }, serialNumber: 'DM-2024-089' },
  { _id: '6', assetTag: 'AF-0006', name: 'Company Vehicle - Sedan', category: { name: 'Vehicles' }, status: 'Reserved', condition: 'Good', location: 'Parking B', department: { name: 'Operations' }, serialNumber: 'VH-2024-007' },
  { _id: '7', assetTag: 'AF-0007', name: 'Wireless Keyboard', category: { name: 'Peripherals' }, status: 'Available', condition: 'New', location: 'HQ Floor 3', department: { name: 'Engineering' }, serialNumber: 'KB-2024-156' },
  { _id: '8', assetTag: 'AF-0008', name: 'Whiteboard 6x4ft', category: { name: 'Office Supplies' }, status: 'Available', condition: 'Good', location: 'Room A1', department: { name: 'Shared' }, serialNumber: 'WB-2024-011' },
];

export default function Assets() {
  const { isAssetManager } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try {
      const res = await assetAPI.getAll();
      setAssets(res.data?.assets || res.data || []);
    } catch {
      setAssets(demoAssets);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await assetAPI.create(data);
      toast.success('Asset registered successfully!');
      setShowModal(false);
      reset();
      loadAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register asset');
    }
  };

  const filteredAssets = statusFilter
    ? assets.filter(a => a.status === statusFilter)
    : assets;

  const columns = [
    {
      header: 'Asset Tag',
      accessor: 'assetTag',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {row.assetTag}
        </span>
      ),
    },
    { header: 'Name', accessor: 'name', render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
    { header: 'Category', render: (row) => row.category?.name || '—' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} dot /> },
    { header: 'Condition', accessor: 'condition' },
    { header: 'Location', accessor: 'location' },
    { header: 'Department', render: (row) => row.department?.name || '—' },
    {
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSelectedAsset(row); setShowDetailModal(true); }}
            id={`view-asset-${row._id}`}
          >
            <IoEyeOutline size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={8} cols={7} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Asset Directory</h1>
          <p className="page-header-subtitle">Manage and track all organizational assets</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredAssets}
        searchPlaceholder="Search by name, tag, or serial number..."
        id="assets-table"
        filters={
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="asset-status-filter"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        }
        actions={
          isAssetManager() && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)} id="register-asset-btn">
              <IoAddOutline size={18} /> Register Asset
            </button>
          )
        }
      />

      {/* Register Asset Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Register New Asset" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Asset Name *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g., MacBook Pro 14 inch"
                {...register('name', { required: 'Asset name is required' })} id="asset-name-input" />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input className="form-input" placeholder="e.g., MBP-2024-001" {...register('serialNumber')} id="asset-serial-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" {...register('category')} id="asset-category-select">
                <option value="">Select category</option>
                <option value="Laptops">Laptops</option>
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-select" {...register('condition')} id="asset-condition-select">
                {conditionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="e.g., HQ Floor 3" {...register('location')} id="asset-location-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Acquisition Date</label>
              <input type="date" className="form-input" {...register('acquisitionDate')} id="asset-date-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Acquisition Cost</label>
              <input type="number" className="form-input" placeholder="0.00" {...register('acquisitionCost')} id="asset-cost-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Bookable?</label>
              <select className="form-select" {...register('isBookable')} id="asset-bookable-select">
                <option value="false">No</option>
                <option value="true">Yes (e.g., rooms, vehicles)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="asset-submit-btn">Register Asset</button>
          </div>
        </form>
      </Modal>

      {/* Asset Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Asset Details" size="md">
        {selectedAsset && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>{selectedAsset.assetTag}</span>
                <h3 style={{ marginTop: 'var(--space-1)' }}>{selectedAsset.name}</h3>
              </div>
              <StatusBadge status={selectedAsset.status} dot />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                ['Category', selectedAsset.category?.name],
                ['Condition', selectedAsset.condition],
                ['Location', selectedAsset.location],
                ['Department', selectedAsset.department?.name],
                ['Serial Number', selectedAsset.serialNumber],
                ['Bookable', selectedAsset.isBookable ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
