import type { ReactNode } from "react";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { LogoutForm } from "./logout-form";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
};

type DashboardShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  navItems: NavItem[];
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ eyebrow, title, subtitle, navItems, actions, children }: DashboardShellProps) {
  return (
    <main className="dashboard">
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <BookOpen size={22} />
            </span>
            <span>Perpustakaan</span>
          </Link>

          <details className="dashboard-menu">
            <summary className="ghost-button">
              <Menu size={16} />
              Menu
            </summary>
            <div className="dashboard-menu-panel">
              <nav className="dashboard-menu-nav" aria-label="Navigasi dashboard">
                {navItems.map((item) => (
                  <Link className={item.active ? "active" : ""} href={item.href} key={item.href}>
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="dashboard-menu-actions">
              <Link className="ghost-button" href="/">
                Katalog Publik
              </Link>
              <LogoutForm />
              </div>
            </div>
          </details>
        </div>
      </header>

      <section className="main">
        <div className="main-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
          </div>
          {actions ? <div className="main-header-actions">{actions}</div> : null}
        </div>

        {children}
      </section>
    </main>
  );
}
