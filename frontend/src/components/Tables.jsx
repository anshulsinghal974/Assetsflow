import { IoSearchOutline, IoChevronUpOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useState } from 'react';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search...',
  onSearch,
  filters,
  actions,
  emptyTitle = 'No data found',
  emptyText = 'Try adjusting your search or filters.',
  pageSize = 10,
  id = 'data-table',
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  // Filter data
  let filtered = data;
  if (search && !onSearch) {
    const q = search.toLowerCase();
    filtered = data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }

  // Sort data
  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    if (onSearch) onSearch(val);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }} id={id}>
      {/* Toolbar */}
      <div className="table-toolbar" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="search-input-wrapper">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
            id={`${id}-search`}
          />
        </div>
        {filters}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  style={{
                    cursor: col.sortable !== false && col.accessor ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {sortKey === col.accessor && (
                      sortDir === 'asc'
                        ? <IoChevronUpOutline size={12} />
                        : <IoChevronDownOutline size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((row, ri) => (
                <tr key={row._id || ri}>
                  {columns.map((col, ci) => (
                    <td key={ci}>
                      {col.render
                        ? col.render(row)
                        : col.accessor
                          ? row[col.accessor]
                          : null
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <p className="empty-state-title">{emptyTitle}</p>
                    <p className="empty-state-text">{emptyText}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="pagination" style={{ padding: 'var(--space-4) var(--space-5)' }}>
          <span className="pagination-info">
            Showing {start + 1}–{Math.min(start + pageSize, total)} of {total}
          </span>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
