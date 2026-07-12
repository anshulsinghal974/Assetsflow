import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { allocationAPI } from '../api/allocation';
import { transferAPI } from '../api/transfer';
import { assetAPI } from '../api/asset';
import { employeeAPI } from '../api/employee';
import DataTable from '../components/Tables';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { IoAddOutline, IoReturnDownBackOutline, IoSwapHorizontalOutline } from 'react-icons/io5';

export default function Allocation() {
  const { isAssetManager, isDeptHead } = useAuth();
  const [activeTab, setActiveTab] = useState('allocations');
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { register: regReturn, handleSubmit: handleReturn, reset: resetReturn } = useForm();
  const { register: regTransfer, handleSubmit: handleTransfer, reset: resetTransfer } = useForm();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [allocRes, transRes, assetsRes, employeesRes] = await Promise.all([
        allocationAPI.getAll(),
        transferAPI.getAll(),
        assetAPI.getAll(),
        employeeAPI.getAll(),
      ]);
      setAllocations(allocRes.data || []);
      setTransfers(transRes.data || []);
      setAssetList(assetsRes.data || []);
      setEmployeeList(employeesRes.data || []);
    } catch {
      setAllocations([]);
      setTransfers([]);
      setAssetList([]);
      setEmployeeList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (data) => {
    try {
      await allocationAPI.create(data);
      toast.success('Asset allocated successfully!');
      setShowAllocateModal(false);
      reset();
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Allocation failed';
      toast.error(msg);
    }
  };

  const handleReturnSubmit = async (data) => {
    try {
      await allocationAPI.returnAsset(selectedAllocation._id, data);
      toast.success('Asset returned successfully!');
      setShowReturnModal(false);
      resetReturn();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    }
  };

  const handleTransferSubmit = async (data) => {
    try {
      await transferAPI.create(data);
      toast.success('Transfer request submitted!');
      setShowTransferModal(false);
      resetTransfer();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Transfer request failed');
    }
  };

  const handleTransferAction = async (id, action) => {
    try {
      if (action === 'approve') await transferAPI.approve(id);
      else await transferAPI.reject(id);
      toast.success(`Transfer ${action}d!`);
      loadData();
    } catch (err) {
      toast.error(`Failed to ${action} transfer`);
    }
  };

  const allocationColumns = [
    { header: 'Asset', render: (row) => (
      <div>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{row.asset?.assetTag}</span>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.asset?.name}</p>
      </div>
    )},
    { header: 'Employee', render: (row) => <span style={{ fontWeight: 500 }}>{row.employee?.name}</span> },
    { header: 'Allocated Date', render: (row) => new Date(row.allocatedDate).toLocaleDateString() },
    { header: 'Expected Return', render: (row) => row.expectedReturnDate ? new Date(row.expectedReturnDate).toLocaleDateString() : '—' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} dot /> },
    { header: 'Actions', sortable: false, render: (row) => (
      row.status === 'Active' || row.status === 'Overdue' ? (
        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedAllocation(row); setShowReturnModal(true); }}
          id={`return-btn-${row._id}`}>
          <IoReturnDownBackOutline size={14} /> Return
        </button>
      ) : null
    )},
  ];

  const transferColumns = [
    { header: 'Asset', render: (row) => (
      <div>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{row.asset?.assetTag}</span>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.asset?.name}</p>
      </div>
    )},
    { header: 'From', render: (row) => row.fromUser?.name },
    { header: 'To', render: (row) => row.toUser?.name },
    { header: 'Requested By', render: (row) => row.requestedBy?.name },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', sortable: false, render: (row) => (
      row.status === 'Requested' && (isAssetManager() || isDeptHead()) ? (
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button className="btn btn-success btn-sm" onClick={() => handleTransferAction(row._id, 'approve')} id={`approve-transfer-${row._id}`}>Approve</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleTransferAction(row._id, 'reject')} id={`reject-transfer-${row._id}`}>Reject</button>
        </div>
      ) : null
    )},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={5} cols={6} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Allocation & Transfers</h1>
          <p className="page-header-subtitle">Manage asset allocations and transfer requests</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" onClick={() => setShowTransferModal(true)} id="request-transfer-btn">
            <IoSwapHorizontalOutline size={18} /> Request Transfer
          </button>
          {isAssetManager() && (
            <button className="btn btn-primary" onClick={() => setShowAllocateModal(true)} id="allocate-btn">
              <IoAddOutline size={18} /> Allocate Asset
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'allocations' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocations')} id="allocations-tab">
          Allocations ({allocations.length})
        </button>
        <button className={`tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')} id="transfers-tab">
          Transfer Requests ({transfers.length})
        </button>
      </div>

      {activeTab === 'allocations' ? (
        <DataTable columns={allocationColumns} data={allocations} searchPlaceholder="Search allocations..." id="allocations-table" />
      ) : (
        <DataTable columns={transferColumns} data={transfers} searchPlaceholder="Search transfers..." id="transfers-table" />
      )}

      {/* Allocate Modal */}
      <Modal isOpen={showAllocateModal} onClose={() => { setShowAllocateModal(false); reset(); }} title="Allocate Asset">
        <form onSubmit={handleSubmit(handleAllocate)}>
          <div className="form-group">
            <label className="form-label">Asset *</label>
            <select className={`form-select ${errors.asset ? 'error' : ''}`} {...register('asset', { required: 'Asset is required' })} id="allocate-asset-input">
              <option value="">Select Asset...</option>
              {assetList.map(a => <option key={a._id} value={a._id}>{a.assetTag} - {a.name}</option>)}
            </select>
            {errors.asset && <p className="form-error">{errors.asset.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select className={`form-select ${errors.employee ? 'error' : ''}`} {...register('employee', { required: 'Employee is required' })} id="allocate-employee-input">
              <option value="">Select Employee...</option>
              {employeeList.map(e => <option key={e._id} value={e._id}>{e.name} ({e.email})</option>)}
            </select>
            {errors.employee && <p className="form-error">{errors.employee.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Expected Return Date</label>
            <input type="date" className="form-input" {...register('expectedReturnDate')} id="allocate-return-date" />
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowAllocateModal(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="allocate-submit-btn">Allocate</button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={showReturnModal} onClose={() => { setShowReturnModal(false); resetReturn(); }} title="Return Asset">
        <form onSubmit={handleReturn(handleReturnSubmit)}>
          {selectedAllocation && (
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Returning</p>
              <p style={{ fontWeight: 700 }}>{selectedAllocation.asset?.assetTag} — {selectedAllocation.asset?.name}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Held by: {selectedAllocation.employee?.name}</p>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Condition at Check-In</label>
            <select className="form-select" {...regReturn('conditionCheckIn')} id="return-condition-select">
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Any notes about the condition..." {...regReturn('notes')} id="return-notes" />
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowReturnModal(false); resetReturn(); }}>Cancel</button>
            <button type="submit" className="btn btn-success" id="return-submit-btn">Confirm Return</button>
          </div>
        </form>
      </Modal>

      {/* Transfer Request Modal */}
      <Modal isOpen={showTransferModal} onClose={() => { setShowTransferModal(false); resetTransfer(); }} title="Request Transfer">
        <form onSubmit={handleTransfer(handleTransferSubmit)}>
          <div className="form-group">
            <label className="form-label">Asset *</label>
            <select className="form-select" {...regTransfer('asset', { required: true })} id="transfer-asset-input">
              <option value="">Select Asset...</option>
              {assetList.map(a => <option key={a._id} value={a._id}>{a.assetTag} - {a.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Transfer To (Employee) *</label>
            <select className="form-select" {...regTransfer('toUser', { required: true })} id="transfer-to-input">
              <option value="">Select Employee...</option>
              {employeeList.map(e => <option key={e._id} value={e._id}>{e.name} ({e.email})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-textarea" placeholder="Why is this transfer needed?" {...regTransfer('reason')} id="transfer-reason" />
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowTransferModal(false); resetTransfer(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="transfer-submit-btn">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
