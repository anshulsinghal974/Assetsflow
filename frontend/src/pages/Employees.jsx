import { useState, useEffect } from 'react';
import { employeeAPI } from '../api/employee';
import DataTable from '../components/Tables';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';

const demoEmployees = [
  { _id: '1', name: 'Admin User', email: 'admin@company.com', role: 'Admin', department: null, status: 'Active' },
  { _id: '2', name: 'Rahul Sharma', email: 'rahul@company.com', role: 'DeptHead', department: { name: 'Engineering' }, status: 'Active' },
  { _id: '3', name: 'Priya Singh', email: 'priya@company.com', role: 'AssetManager', department: { name: 'Operations' }, status: 'Active' },
  { _id: '4', name: 'Neha Gupta', email: 'neha@company.com', role: 'Employee', department: { name: 'HR' }, status: 'Active' },
  { _id: '5', name: 'Amit Kumar', email: 'amit@company.com', role: 'Employee', department: { name: 'Engineering' }, status: 'Active' },
];

const RoleBadge = ({ role }) => {
  const styles = {
    Admin: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
    AssetManager: { bg: 'var(--primary-100)', color: 'var(--primary)' },
    DeptHead: { bg: 'var(--secondary-light)', color: 'var(--secondary)' },
    Employee: { bg: 'var(--bg-main)', color: 'var(--text-secondary)' },
  };
  const s = styles[role] || styles.Employee;
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{role === 'DeptHead' ? 'Dept Head' : role === 'AssetManager' ? 'Asset Manager' : role}</span>;
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data?.employees || res.data || []);
    } catch {
      setEmployees(demoEmployees);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (data) => {
    try {
      await employeeAPI.promote(selectedEmp._id, data);
      toast.success('Role updated successfully!');
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const columns = [
    { header: 'Name', render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
    { header: 'Email', accessor: 'email', render: (row) => <span style={{ color: 'var(--text-muted)' }}>{row.email}</span> },
    { header: 'Role', render: (row) => <RoleBadge role={row.role} /> },
    { header: 'Department', render: (row) => row.department?.name || '—' },
    { header: 'Actions', sortable: false, render: (row) => (
      row.role !== 'Admin' && (
        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedEmp(row); reset({ role: row.role }); setShowModal(true); }} id={`promote-btn-${row._id}`}>
          <IoShieldCheckmarkOutline size={16} /> Update Role
        </button>
      )
    )},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={5} cols={5} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Employee Directory</h1>
          <p className="page-header-subtitle">Manage user roles and permissions</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        searchPlaceholder="Search employees..."
        id="employees-table"
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Update Role">
        <form onSubmit={handleSubmit(handlePromote)}>
          {selectedEmp && (
            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontWeight: 600 }}>{selectedEmp.name}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedEmp.email}</p>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">New Role</label>
            <select className="form-select" {...register('role')} id="promote-role-select">
              <option value="Employee">Employee</option>
              <option value="DeptHead">Department Head</option>
              <option value="AssetManager">Asset Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              Warning: Elevating roles grants access to sensitive data and actions.
            </p>
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="promote-submit-btn">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
