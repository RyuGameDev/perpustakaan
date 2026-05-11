import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
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
  children: ReactNode;
};

export function DashboardShell({ eyebrow, title, subtitle, navItems, children }: DashboardShellProps) {
  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <aside className="sidebar">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <BookOpen size={22} />
            </span>
            <span>Perpustakaan</span>
          </Link>
          <nav className="sidebar-nav" aria-label="Navigasi dashboard">
            {navItems.map((item) => (
              <Link className={item.active ? "active" : ""} href={item.href} key={item.href}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="main">
          <div className="main-header">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="muted">{subtitle}</p>
            </div>
            <div className="nav-actions">
              <Link className="ghost-button" href="/">
                Katalog Publik
              </Link>
              <LogoutForm />
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
