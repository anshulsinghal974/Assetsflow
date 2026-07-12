import { useState, useEffect } from 'react';
import { deptAPI } from '../api/dept';
import DataTable from '../components/Tables';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { IoAddOutline, IoBusinessOutline } from 'react-icons/io5';

const demoDepts = [
  { _id: '1', name: 'Engineering', head: { name: 'Rahul Sharma' }, status: 'Active', parent: null },
  { _id: '2', name: 'Frontend', head: { name: 'Priya Singh' }, status: 'Active', parent: { name: 'Engineering' } },
  { _id: '3', name: 'Backend', head: { name: 'Amit Kumar' }, status: 'Active', parent: { name: 'Engineering' } },
  { _id: '4', name: 'Human Resources', head: { name: 'Neha Gupta' }, status: 'Active', parent: null },
  { _id: '5', name: 'Finance', head: { name: 'Raj Malhotra' }, status: 'Active', parent: null },
  { _id: '6', name: 'Legacy Operations', head: { name: 'Sneha Patel' }, status: 'Inactive', parent: null },
];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => { loadDepts(); }, []);

  const loadDepts = async () => {
    try {
      const res = await deptAPI.getAll();
      setDepartments(res.data?.departments || res.data || []);
    } catch {
      setDepartments(demoDepts);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await deptAPI.create(data);
      toast.success('Department created successfully!');
      setShowModal(false);
      reset();
      loadDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  };

  const columns = [
    { header: 'Name', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <IoBusinessOutline size={18} color="var(--primary)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span>
      </div>
    )},
    { header: 'Head of Department', render: (row) => row.head?.name || '—' },
    { header: 'Parent Department', render: (row) => row.parent?.name || '—' },
    { header: 'Status', render: (row) => (
      <span className={`badge ${row.status === 'Active' ? 'badge-available' : 'badge-retired'}`}>
        {row.status}
      </span>
    )},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={5} cols={4} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p className="page-header-subtitle">Manage organizational hierarchy</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        searchPlaceholder="Search departments..."
        id="depts-table"
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-dept-btn">
            <IoAddOutline size={18} /> Add Department
          </button>
        }
      />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Add Department">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g., Engineering"
              {...register('name', { required: 'Name is required' })} id="dept-name-input" />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Parent Department</label>
            <select className="form-select" {...register('parent')} id="dept-parent-select">
              <option value="">None (Top Level)</option>
              {departments.filter(d => !d.parent).map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Head of Department (Email)</label>
            <input type="email" className="form-input" placeholder="head@company.com" {...register('head')} id="dept-head-input" />
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="dept-submit-btn">Create Department</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
