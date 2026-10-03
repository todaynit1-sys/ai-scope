export default function ScopeMark({size=28}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="scope-mark"><circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v7M16 23v7M2 16h7M23 16h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="16" cy="16" r="3.5" fill="currentColor"/></svg>;
}
