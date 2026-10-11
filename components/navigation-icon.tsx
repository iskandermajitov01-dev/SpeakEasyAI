/** Small enamel-style symbols, drawn for the seven learning spaces. */
export function NavigationIcon({kind}:{kind:string}){
 const art:Record<string,React.ReactNode>={
  home:<><path d="M5 12 16 3l11 9v14H5Z" fill="#ff9279"/><path d="M12 26V15h8v11" fill="#fff1bb"/><path d="m3 13 13-11 13 11"/></>,
  topics:<><circle cx="16" cy="16" r="12" fill="#95dfbf"/><path d="m21 10-3 9-9 3 4-9Z" fill="#fff4ba"/><circle cx="16" cy="16" r="2" fill="#e87861"/></>,
  dictionary:<><path d="M3 6q7-3 13 2 6-5 13-2v21q-7-3-13 1-6-4-13-1Z" fill="#c6adf1"/><path d="M16 8v20M7 12l5 1m-5 5 5 1m8-6 5-1m-5 7 5-1"/></>,
  progress:<><path d="M9 4h14v10c0 10-14 10-14 0Z" fill="#ffd36f"/><path d="M9 7H4v5q0 7 7 7m12-12h5v5q0 7-7 7M16 23v5m-6 0h12"/><path d="m16 8 1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5Z" fill="#fff5d6" stroke="none"/></>,
  adventures:<><path d="m16 2 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="#f69fba"/><path d="m25 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#ffd36f" stroke="none"/></>,
  shop:<><path d="M6 11h20l2 18H4Z" fill="#f8bc7a"/><path d="M11 12V8a5 5 0 0 1 10 0v4"/><path d="m16 16 1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5Z" fill="#fff4bf" stroke="none"/></>,
  settings:<><rect x="3" y="4" width="26" height="24" rx="8" fill="#9cd1de"/><path d="M8 11h16M8 21h16"/><circle cx="12" cy="11" r="3" fill="#fff5cf"/><circle cx="21" cy="21" r="3" fill="#fff5cf"/></>
 };
 return <span className={`navigation-icon icon-${kind}`} aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="#49384f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{art[kind]||art.home}</svg></span>;
}
