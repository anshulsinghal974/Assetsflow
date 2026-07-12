export default function KPICards({ cards = [] }) {
  const colorMap = {
    indigo: { bg: '#EEF2FF', icon: '#4F46E5', border: '#C7D2FE' },
    emerald: { bg: '#ECFDF5', icon: '#059669', border: '#A7F3D0' },
    amber: { bg: '#FFFBEB', icon: '#D97706', border: '#FDE68A' },
    sky: { bg: '#F0F9FF', icon: '#0284C7', border: '#BAE6FD' },
    violet: { bg: '#F5F3FF', icon: '#7C3AED', border: '#DDD6FE' },
    rose: { bg: '#FFF1F2', icon: '#E11D48', border: '#FECDD3' },
  };

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => {
        const colors = colorMap[card.color] || colorMap.indigo;
        const Icon = card.icon;

        return (
          <div
            key={i}
            className="card"
            style={{
              padding: 'var(--space-5)',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
            id={`kpi-card-${i}`}
          >
            {/* Decorative gradient corner */}
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: colors.bg,
              opacity: 0.6,
            }}></div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 'var(--space-2)',
                }}>
                  {card.title}
                </p>
                <p style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--space-1)',
                  }}>
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {Icon && <Icon size={22} color={colors.icon} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
