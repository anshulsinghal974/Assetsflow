export function SkeletonCard({ count = 1 }) {
  return (
    <div className="kpi-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
              <div className="skeleton skeleton-title" style={{ width: '40%', height: 28, marginTop: 8 }}></div>
            </div>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="skeleton" style={{ height: 38, width: 300, borderRadius: 'var(--radius-full)' }}></div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}><div className="skeleton skeleton-text" style={{ width: '70%' }}></div></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, ri) => (
            <tr key={ri}>
              {Array.from({ length: cols }, (_, ci) => (
                <td key={ci}><div className="skeleton skeleton-text" style={{ width: `${60 + Math.random() * 30}%` }}></div></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card">
      <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
      <div className="skeleton" style={{ height: 250, marginTop: 'var(--space-4)' }}></div>
    </div>
  );
}
