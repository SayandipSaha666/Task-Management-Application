import { GlobalContext } from '../../context/Store.jsx';
import { callLogoutUserApi } from "../../services/api_service.js";
import { LogOut, LayoutList, Kanban, Menu, X } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Header() {
  const { setUser } = useContext(GlobalContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    const response = await callLogoutUserApi();

    if (response?.success) {
      setUser(null);
      navigate("/auth");
    }
  }

  const navLinks = [
    { to: "/tasks/list", label: "Tasks", icon: LayoutList },
    { to: "/tasks/scrum-board", label: "Board", icon: Kanban },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/tasks/list" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-gradient">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-indigo-600 transition-colors">
              TaskFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200
                  ${isActive(link.to)
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <link.icon size={16} strokeWidth={isActive(link.to) ? 2.5 : 2} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              title="Sign out"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border/50 animate-fade-in-up">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${isActive(link.to)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;