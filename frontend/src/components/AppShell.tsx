"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Compass, Home, LayoutGrid, Menu, Settings, X } from "lucide-react";
import { useTranslation } from "@/i18n/use-translation";
import type { TranslationKey } from "../i18n/translations";

type NavItem = {
  href: string;
  labelKey: TranslationKey;
  icon: "home" | "explore" | "dashboard" | "settings";
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/",
    labelKey: "home",
    icon: "home",
    match: (pathname) => pathname === "/",
  },
  {
    href: "/explore",
    labelKey: "exploreTopics",
    icon: "explore",
    match: (pathname) => pathname === "/explore",
  },
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: "dashboard",
    match: (pathname) => pathname === "/dashboard" || pathname.startsWith("/course/"),
  },
  {
    href: "/settings",
    labelKey: "settings",
    icon: "settings",
    match: (pathname) => pathname === "/settings",
  },
];

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="app-background md:flex">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-300/20 blur-xl sm:h-96 sm:w-96" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/15 blur-xl sm:h-96 sm:w-96" />
      </div>

      <aside className="hidden w-60 shrink-0 border-r border-amber-100/80 bg-white/80 backdrop-blur md:fixed md:left-0 md:top-0 md:z-20 md:block md:h-screen md:overflow-y-auto">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">{t("appName")}</p>
          <p className="mt-1 text-sm text-slate-600">{t("guestDemo")}</p>
        </div>
        <nav className="space-y-1 px-3 pb-4">{navItems.map((item) => renderNavItem(item, pathname, false, t(item.labelKey)))}</nav>
      </aside>

      <div className="relative z-10 flex min-h-screen flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-20 border-b border-amber-100/80 bg-white/85 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label={t("openNavigationMenu")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-slate-800">{t("appName")}</p>
            <span className="w-10" />
          </div>
        </header>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-slate-900/30 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-amber-100 bg-white p-4 shadow-xl md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{t("navigation")}</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t("closeNavigationMenu")}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <nav className="space-y-1">{navItems.map((item) => renderNavItem(item, pathname, true, t(item.labelKey)))}</nav>
            </aside>
          </>
        )}

        <main className="relative z-10 flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function renderNavItem(item: NavItem, pathname: string, isMobile: boolean, label: string) {
  const active = item.match(pathname);

  return (
    <Link
      key={`${item.href}-${isMobile ? "mobile" : "desktop"}`}
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-red-50 text-red-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span aria-hidden="true" className="text-base">
        <NavIcon icon={item.icon} active={active} />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function NavIcon({ icon, active }: { icon: NavItem["icon"]; active: boolean }) {
  const iconColor = active ? "text-red-700" : "text-slate-500";

  if (icon === "home") {
    return <Home className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />;
  }

  if (icon === "explore") {
    return <Compass className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />;
  }

  if (icon === "dashboard") {
    return <LayoutGrid className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />;
  }

  return <Settings className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />;
}