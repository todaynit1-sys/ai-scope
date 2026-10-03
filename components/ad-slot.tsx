import type { ReactNode } from 'react';

/** Reserved placement: pass approved ad content here when monetization is enabled. */
export default function AdSlot({placement,children}:{placement:'after-summary'|'before-footer';children?:ReactNode}) {
  if(!children) return <div className="ad-slot" data-ad-slot={placement} aria-hidden="true"><div className="ad-slot-content"/></div>;
  return <aside className="ad-slot ad-slot-filled" data-ad-slot={placement} aria-label="광고"><span className="ad-label">ADVERTISEMENT</span><div className="ad-slot-content">{children}</div></aside>;
}
