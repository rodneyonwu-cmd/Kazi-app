const COLORS = [
  '#1a7f5e', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#ca8a04', '#0891b2', '#4f46e5', '#be123c', '#059669',
]

function getInitials(name) {
  if (!name) return '?'
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

function getColor(name) {
  const str = String(name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function InitialsAvatar({ name, size = 40, radius, className = '', style = {} }) {
  const initials = getInitials(name)
  const bg = getColor(name)
  const fontSize = Math.round(size * 0.4)
  const borderRadius = radius !== undefined ? radius : '50%'

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 800,
        color: '#ffffff',
        flexShrink: 0,
        lineHeight: 1,
        textAlign: 'center',
        ...style,
      }}
    >
      {initials}
    </div>
  )
}
