import { useState, useEffect } from 'react';
import { categoryAPI } from '../api/category';
import DataTable from '../components/Tables';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { IoAddOutline, IoLayersOutline } from 'react-icons/io5';

const demoCategories = [
  { _id: '1', name: 'Laptops', assetCount: 42, customFields: [{ name: 'RAM' }, { name: 'Storage' }] },
  { _id: '2', name: 'Furniture', assetCount: 156, customFields: [{ name: 'Material' }] },
  { _id: '3', name: 'Vehicles', assetCount: 8, customFields: [{ name: 'License Plate' }, { name: 'Make' }] },
  { _id: '4', name: 'Electronics', assetCount: 89, customFields: [] },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState('');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data?.categories || res.data || []);
    } catch {
      setCategories(demoCategories);
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (newField.trim() && !customFields.includes(newField.trim())) {
      setCustomFields([...customFields, newField.trim()]);
      setNewField('');
    }
  };

  const removeField = (field) => {
    setCustomFields(customFields.filter(f => f !== field));
  };

  const onSubmit = async (data) => {
    try {
      await categoryAPI.create({ ...data, customFields });
      toast.success('Category created successfully!');
      setShowModal(false);
      reset();
      setCustomFields([]);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const columns = [
    { header: 'Category Name', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <IoLayersOutline size={18} color="var(--primary)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span>
      </div>
    )},
    { header: 'Assets', accessor: 'assetCount', render: (row) => row.assetCount || 0 },
    { header: 'Custom Fields', render: (row) => (
      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
        {row.customFields?.length > 0 ? row.customFields.map((f, i) => (
          <span key={i} className="badge" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
            {f.name || f}
          </span>
        )) : <span className="text-muted">None</span>}
      </div>
    )},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={4} cols={3} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Asset Categories</h1>
          <p className="page-header-subtitle">Manage asset classifications and metadata</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Search categories..."
        id="categories-table"
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-category-btn">
            <IoAddOutline size={18} /> Add Category
          </button>
        }
      />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); setCustomFields([]); }} title="Add Category">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g., Laptops"
              {...register('name', { required: 'Name is required' })} id="category-name-input" />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Custom Fields (Optional)</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <input type="text" className="form-input" placeholder="e.g., Screen Size"
                value={newField} onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }} id="category-field-input" />
              <button type="button" className="btn btn-secondary" onClick={addField} id="add-field-btn">Add</button>
            </div>
            {customFields.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {customFields.map(f => (
                  <span key={f} className="badge badge-allocated" style={{ padding: '6px 12px' }}>
                    {f}
                    <button type="button" onClick={() => removeField(f)} style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 6, cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); setCustomFields([]); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="category-submit-btn">Create Category</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
