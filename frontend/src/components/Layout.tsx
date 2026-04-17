import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <h1>Blackjack Trainer</h1>
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
