import type { PropsWithChildren } from 'react';

// Native SVG responder props are not DOM events. Use an accessible SVG group on web.
export function MapTouchTarget({ children, onPress, label }: PropsWithChildren<{ onPress: () => void; label: string }>) {
  return <g role="button" tabIndex={0} aria-label={label} onClick={onPress} style={{ cursor: 'pointer' }}
    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPress(); } }}>
    {children}
  </g>;
}
