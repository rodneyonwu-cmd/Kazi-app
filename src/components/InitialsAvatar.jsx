export default function InitialsAvatar({ name, size = 40, className = '' }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const fontSize = Math.round(size * 0.4)

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: '#e8f5f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 800,
        color: '#1a7f5e',
        flexShrink: 0,
        lineHeight: 1,
        textAlign: 'center',
      }}
    >
      {initial}
    </div>
  )
}
