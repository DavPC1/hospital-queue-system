export default function Card({ title, children, className='' }) {
  return (
    <section className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      {title && <h3 className="text-sm font-semibold mb-2 text-slate-700">{title}</h3>}
      {children}
    </section>
  );
}
