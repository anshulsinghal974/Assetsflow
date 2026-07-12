import { IoCloudUploadOutline } from 'react-icons/io5';

export function FormInput({ label, error, register, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        className={`form-input ${error ? 'error' : ''}`}
        {...(register || {})}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, error, register, options = [], placeholder, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        className={`form-select ${error ? 'error' : ''}`}
        {...(register || {})}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export function FormTextarea({ label, error, register, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea
        className={`form-textarea ${error ? 'error' : ''}`}
        {...(register || {})}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export function FormFileUpload({ label, onChange, accept = 'image/*', id }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <label
        htmlFor={id || 'file-upload'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-6)',
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          background: 'var(--bg-main)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.background = 'var(--primary-50)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--bg-main)';
        }}
      >
        <IoCloudUploadOutline size={28} color="var(--text-muted)" />
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Click to upload or drag and drop
        </span>
        <input
          type="file"
          id={id || 'file-upload'}
          accept={accept}
          onChange={onChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

export function FormRow({ children }) {
  return <div className="form-row">{children}</div>;
}
