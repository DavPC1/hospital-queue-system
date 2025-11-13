export function Badge({ children, color='slate' }) {
  const cls = `inline-block text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-800`;
  return <span className={cls}>{children}</span>;
}
