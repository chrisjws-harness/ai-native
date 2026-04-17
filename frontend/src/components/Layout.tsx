import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <div className="casino-brand">
            <span className="brand-the">THE</span>
            <h1>KINO CASINO</h1>
            <span className="brand-sub">Blackjack Trainer</span>
          </div>
          {user && (
            <nav className="header-nav">
              <Link to="/train" className={`nav-link ${location.pathname === "/train" ? "nav-active" : ""}`}>Train</Link>
              <Link to="/stats" className={`nav-link ${location.pathname === "/stats" ? "nav-active" : ""}`}>Stats</Link>
            </nav>
          )}
        </div>
        {user && (
          <div className="header-right">
            <span>{user.username}</span>
            <button onClick={logout} className="btn btn-sm">Logout</button>
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
