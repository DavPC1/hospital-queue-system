export default function StatCard({ title, value, hint, color="blue" }) {
  const palette = {
    blue:   "bg-blue-50 text-blue-800 border-blue-200",
    green:  "bg-green-50 text-green-800 border-green-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    red:    "bg-red-50 text-red-800 border-red-200",
    gray:   "bg-gray-50 text-gray-800 border-gray-200",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
  }[color] || "bg-gray-50 text-gray-800 border-gray-200";

  return (
    <div className={`border rounded-xl p-4 ${palette}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-3xl font-extrabold">{value}</p>
      {hint ? <p className="text-xs opacity-70 mt-1">{hint}</p> : null}
    </div>
  );
}
