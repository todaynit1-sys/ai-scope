import type { ReactNode } from 'react';

/** Reserved placement: pass approved ad content here when monetization is enabled. */
export default function AdSlot({placement,children}:{placement:'after-summary'|'before-footer';children?:ReactNode}) {
  return <aside className={`ad-slot ${children?'ad-slot-filled':''}`} data-ad-slot={placement} aria-label="광고"><span className="ad-label">ADVERTISEMENT</span><div className="ad-slot-content">{children||<span className="ad-placeholder">광고 공간</span>}</div></aside>;
}
