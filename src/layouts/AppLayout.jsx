import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../components/ui/PageLoader';
import {
  LuTrendingUp,
  LuLayoutDashboard,
  LuArrowLeftRight,
  LuFolderOpen,
  LuCreditCard,
  LuListChecks,
  LuTarget,
  LuChartBar,
  LuLogOut,
  LuChevronLeft,
  LuChevronDown,
  LuMenu,
  LuX,
  LuSun,
  LuMoon,
  LuBell,
  LuUser,
  LuSettings,
} from 'react-icons/lu';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

/* ── Navigation config ──────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'Menu',
    items: [
      { to: '/',             icon: LuLayoutDashboard, label: 'Dashboard',   end: true },
      { to: '/transactions', icon: LuArrowLeftRight,  label: 'Transações' },
    ],
  },
  {
    label: 'Finanças',
    items: [
      { to: '/categories', icon: LuFolderOpen,  label: 'Categorias' },
      { to: '/cards',         icon: LuCreditCard,  label: 'Cartões'       },
      { to: '/installments',  icon: LuListChecks,  label: 'Parcelamentos' },
      { to: '/goals',         icon: LuTarget,      label: 'Metas'         },
    ],
  },
  {
    label: 'Análises',
    items: [
      { to: '/reports', icon: LuChartBar, label: 'Relatórios' },
    ],
  },
];

const PAGE_TITLES = {
  '/':              'Dashboard',
  '/transactions':  'Transações',
  '/categories':    'Categorias',
  '/cards':         'Cartões',
  '/installments':  'Parcelamentos',
  '/goals':         'Metas',
  '/reports':       'Relatórios',
  '/profile':       'Meu Perfil',
};

/* ── Sidebar content (shared) ───────────────────── */
function SidebarContent({ collapsed, onClose }) {
  const { user, signOut } = useAuth();
  return (
    <>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-sidebar-border flex-shrink-0',
        collapsed ? 'justify-center px-3' : 'gap-3 px-5'
      )}>
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <LuTrendingUp className="w-4 h-4 text-slate-900" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-[15px] tracking-tight truncate">FinanControl</span>
        )}
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-sidebar-hover transition-colors lg:hidden"
          >
            <LuX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} className={cn('mb-1', si > 0 && 'mt-3')}>
            {/* Section label / divider */}
            {collapsed ? (
              <div className="mx-3 h-px bg-sidebar-border mb-3 mt-1" />
            ) : (
              <p className="sidebar-section-label">{section.label}</p>
            )}
            <div className="px-2 space-y-0.5">
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-0')
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 flex-shrink-0 space-y-0.5">
        {/* User profile */}
        {user && (
          <div className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-0.5',
            collapsed ? 'justify-center' : ''
          )}>
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-900">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={signOut}
          title={collapsed ? 'Sair' : undefined}
          className={cn(
            'sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10',
            collapsed && 'justify-center px-0'
          )}
        >
          <LuLogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sair da conta</span>}
        </button>
      </div>
    </>
  );
}

/* ── Main layout ────────────────────────────────── */
export default function AppLayout() {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'FinanControl';

  /* Close user menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!userMenuRef.current?.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile sidebar on navigation */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* ── Mobile backdrop ──────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 lg:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col',
          'bg-sidebar',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expandir' : 'Recolher'}
          className={cn(
            'absolute -right-3 top-[72px] z-40',
            'w-6 h-6 rounded-full border border-sidebar-border bg-sidebar',
            'hidden lg:flex items-center justify-center',
            'text-slate-500 hover:text-white transition-colors',
          )}
        >
          <LuChevronLeft className={cn(
            'w-3 h-3 transition-transform duration-300',
            collapsed && 'rotate-180'
          )} />
        </button>

        <SidebarContent
          collapsed={collapsed}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <div
        className={cn(
          'flex flex-col min-w-0 flex-1',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-64',
        )}
      >
        {/* ── Top navbar ────────────────────────── */}
        <header className="flex-shrink-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 sm:px-6 gap-3 shadow-nav">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-ghost lg:hidden flex-shrink-0"
            aria-label="Abrir menu"
          >
            <LuMenu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
              {pageTitle}
            </h2>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost"
              title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark'
                ? <LuSun className="w-[18px] h-[18px] text-amber-400" />
                : <LuMoon className="w-[18px] h-[18px]" />
              }
            </button>

            {/* Notification bell */}
            <button className="btn-ghost relative" title="Notificações">
              <LuBell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />

            {/* User dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  userMenuOpen && 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-slate-900 flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block max-w-[110px] truncate">
                  {user?.name}
                </span>
                <LuChevronDown className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block',
                  userMenuOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">

                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-slate-900 flex-shrink-0">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <LuUser className="w-4 h-4 text-slate-400" />
                      Meu Perfil
                    </Link>
                    <button
                      onClick={() => { toggleTheme(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {theme === 'dark'
                        ? <LuSun className="w-4 h-4 text-amber-400" />
                        : <LuMoon className="w-4 h-4 text-slate-400" />
                      }
                      {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-50 dark:border-slate-700 py-1.5">
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LuLogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
