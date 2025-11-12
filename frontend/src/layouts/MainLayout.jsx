import { Link, Outlet, useLocation } from "react-router-dom";

const NavLink = ({ to, children }) => {
  const loc = useLocation();
  const active = loc.pathname === to || (to === "/dashboard" && loc.pathname === "/");
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded transition ${
        active ? "bg-white text-blue-700" : "bg-blue-700 text-white hover:bg-blue-600"
      }`}
    >
      {children}
    </Link>
  );
};

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-blue-800 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Sistema de Turnos Hospitalarios</h1>
          <nav className="flex gap-2">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/reception">Recepción</NavLink>
            <NavLink to="/triage">Triaje</NavLink>
            <NavLink to="/doctor">Médico</NavLink>
            <NavLink to="/display">Pantalla</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white text-center py-2 text-sm">
        © 2025 Hospital Queue System
      </footer>
    </div>
  );
}
