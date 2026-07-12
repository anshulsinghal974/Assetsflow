import { useState, useEffect } from 'react';
import { bookingAPI } from '../api/booking';
import { assetAPI } from '../api/asset';
import BookingCalendar from '../components/Calendar';
import DataTable from '../components/Tables';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { IoAddOutline, IoCalendarOutline, IoListOutline, IoCloseCircleOutline } from 'react-icons/io5';

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar');
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [res, assetsRes] = await Promise.all([
        bookingAPI.getAll(),
        assetAPI.getAll({ isBookable: true })
      ]);
      setBookings(res.data || []);
      setAssetList(assetsRes.data || []);
    } catch {
      setBookings([]);
      setAssetList([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await bookingAPI.create(data);
      toast.success('Booking created successfully!');
      setShowModal(false);
      reset();
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Booking failed — slot may overlap';
      toast.error(msg);
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  // Convert bookings to calendar events
  const calendarEvents = bookings.map(b => ({
    id: b._id,
    title: `${b.asset?.name || b.asset?.assetTag} — ${b.bookedBy?.name}`,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    status: b.status,
  }));

  const columns = [
    { header: 'Resource', render: (row) => (
      <div>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{row.asset?.assetTag}</span>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.asset?.name}</p>
      </div>
    )},
    { header: 'Booked By', render: (row) => <span style={{ fontWeight: 500 }}>{row.bookedBy?.name}</span> },
    { header: 'Start', render: (row) => new Date(row.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
    { header: 'End', render: (row) => new Date(row.endTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
    { header: 'Duration', render: (row) => {
      const ms = new Date(row.endTime) - new Date(row.startTime);
      const hours = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      return `${hours}h ${mins}m`;
    }},
    { header: 'Status', render: (row) => <StatusBadge status={row.status} dot /> },
    { header: 'Actions', sortable: false, render: (row) => (
      row.status === 'Upcoming' ? (
        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(row._id)} id={`cancel-booking-${row._id}`}>
          <IoCloseCircleOutline size={14} /> Cancel
        </button>
      ) : null
    )},
  ];

  if (loading) return <div className="animate-fade-in"><SkeletonTable rows={5} cols={6} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Resource Booking</h1>
          <p className="page-header-subtitle">Book rooms, vehicles, and shared resources</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {/* View Toggle */}
          <div style={{
            display: 'flex',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <button
              className={`btn btn-ghost btn-sm`}
              style={{
                borderRadius: 0,
                background: view === 'calendar' ? 'var(--primary)' : 'transparent',
                color: view === 'calendar' ? 'white' : 'var(--text-secondary)',
              }}
              onClick={() => setView('calendar')}
              id="calendar-view-btn"
            >
              <IoCalendarOutline size={16} /> Calendar
            </button>
            <button
              className={`btn btn-ghost btn-sm`}
              style={{
                borderRadius: 0,
                background: view === 'list' ? 'var(--primary)' : 'transparent',
                color: view === 'list' ? 'white' : 'var(--text-secondary)',
              }}
              onClick={() => setView('list')}
              id="list-view-btn"
            >
              <IoListOutline size={16} /> List
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="new-booking-btn">
            <IoAddOutline size={18} /> New Booking
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'calendar' ? (
        <div className="card">
          <BookingCalendar
            events={calendarEvents}
            onSelectEvent={(event) => toast(`${event.title}\nStatus: ${event.status}`)}
            onSelectSlot={() => setShowModal(true)}
          />
        </div>
      ) : (
        <DataTable columns={columns} data={bookings} searchPlaceholder="Search bookings..." id="bookings-table" />
      )}

      {/* New Booking Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="New Booking">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Resource *</label>
            <select className={`form-select ${errors.asset ? 'error' : ''}`}
              {...register('asset', { required: 'Select a resource' })} id="booking-resource-select">
              <option value="">Select a resource</option>
              {assetList.map(a => <option key={a._id} value={a._id}>{a.assetTag} - {a.name}</option>)}
            </select>
            {errors.asset && <p className="form-error">{errors.asset.message}</p>}
            {assetList.length === 0 && (
              <p className="form-error" style={{ marginTop: 5, color: 'var(--warning)' }}>
                ⚠️ No bookable resources (e.g., vehicles, rooms) available. Please <a href="/assets" style={{ textDecoration: 'underline', color: 'var(--primary)' }}>register a bookable asset</a> first.
              </p>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input type="datetime-local" className={`form-input ${errors.startTime ? 'error' : ''}`}
                {...register('startTime', { required: 'Start time is required' })} id="booking-start-input" />
              {errors.startTime && <p className="form-error">{errors.startTime.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input type="datetime-local" className={`form-input ${errors.endTime ? 'error' : ''}`}
                {...register('endTime', { required: 'End time is required' })} id="booking-end-input" />
              {errors.endTime && <p className="form-error">{errors.endTime.message}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Purpose (Optional)</label>
            <textarea className="form-textarea" placeholder="Brief description of the booking purpose..."
              {...register('purpose')} rows={3} id="booking-purpose" />
          </div>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--info-light)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            fontSize: '0.8125rem',
            color: 'var(--info)',
          }}>
            💡 Back-to-back bookings are allowed. Overlapping slots will be automatically rejected.
          </div>
          <div className="modal-footer" style={{ padding: 'var(--space-4) 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="booking-submit-btn">Book Resource</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
