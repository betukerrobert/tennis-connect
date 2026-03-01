function Logo({ size = 'md', dark = false }) {
  const sizes = {
    sm: { ball: 24, font: 13, gap: 7 },
    md: { ball: 32, font: 16, gap: 9 },
    lg: { ball: 48, font: 22, gap: 12 },
  };
  const s = sizes[size];
  const textColor = dark ? '#0a1628' : 'white';
  const accentColor = '#c8ff00';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, cursor: 'pointer' }}>

      {/* Tennis ball SVG */}
      <svg
        width={s.ball}
        height={s.ball}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ball background */}
        <circle cx="20" cy="20" r="19" fill={accentColor} />

        {/* Tennis ball seam curves */}
        <path
          d="M 6 14 Q 14 20 6 26"
          stroke="#0a1628"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 34 14 Q 26 20 34 26"
          stroke="#0a1628"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle border */}
        <circle cx="20" cy="20" r="19" stroke="#0a162820" strokeWidth="1" fill="none" />
      </svg>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontSize: s.font,
          fontWeight: '700',
          color: textColor,
          letterSpacing: '-0.3px',
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}>
          Tennis
        </span>
        <span style={{
          fontSize: s.font * 0.75,
          fontWeight: '400',
          color: dark ? '#9aa0ac' : 'rgba(255,255,255,0.55)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          marginTop: '1px',
        }}>
          Connect
        </span>
      </div>

    </div>
  );
}

export default Logo;
