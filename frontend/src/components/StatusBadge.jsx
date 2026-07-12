const statusConfig = {
  // Asset statuses
  Available: 'badge-available',
  Allocated: 'badge-allocated',
  Reserved: 'badge-reserved',
  UnderMaintenance: 'badge-undermaintenance',
  Lost: 'badge-lost',
  Retired: 'badge-retired',
  Disposed: 'badge-disposed',

  // Allocation statuses
  Active: 'badge-active',
  Returned: 'badge-returned',
  Overdue: 'badge-overdue',

  // Transfer statuses
  Requested: 'badge-requested',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  Reallocated: 'badge-allocated',

  // Booking statuses
  Upcoming: 'badge-upcoming',
  Ongoing: 'badge-ongoing',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',

  // Maintenance statuses
  Pending: 'badge-pending',
  Resolved: 'badge-resolved',

  // Audit statuses
  Verified: 'badge-verified',
  Missing: 'badge-missing',
  Damaged: 'badge-damaged',
};

const statusLabels = {
  UnderMaintenance: 'Under Maintenance',
  DeptHead: 'Dept Head',
  AssetManager: 'Asset Manager',
};

export default function StatusBadge({ status, dot = false }) {
  const className = statusConfig[status] || 'badge-available';
  const label = statusLabels[status] || status;

  return (
    <span className={`badge ${className}`}>
      {dot && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
          animation: status === 'Active' || status === 'Ongoing' ? 'pulse-dot 2s infinite' : 'none',
        }}></span>
      )}
      {label}
    </span>
  );
}
