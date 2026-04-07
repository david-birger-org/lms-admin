import type { LucideIcon } from "lucide-react";
import {
  Clock,
  CreditCard,
  History,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
} from "lucide-react";

export interface DashboardRoute {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const dashboardRoutes = [
  {
    href: "/admin",
    title: "Overview",
    description:
      "Workspace summary and room for future Vercel analytics blocks.",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/invoice",
    title: "Invoice",
    description: "Create Monobank invoices and copy checkout links quickly.",
    icon: CreditCard,
  },
  {
    href: "/admin/pending",
    title: "Pending Invoices",
    description: "View and manage invoices awaiting payment.",
    icon: Clock,
  },
  {
    href: "/admin/payment-history",
    title: "Payment History",
    description:
      "Review canonical app payment history from the payments table.",
    icon: History,
  },
  {
    href: "/admin/statement-audit",
    title: "Statement Audit",
    description:
      "Inspect the live Monobank statement feed for provider reconciliation.",
    icon: ScrollText,
  },
  {
    href: "/admin/products",
    title: "Products",
    description: "Manage products, pricing, and availability.",
    icon: Package,
  },
  {
    href: "/admin/runtime",
    title: "Runtime",
    description: "Monitor environment readiness and protected API surfaces.",
    icon: ShieldCheck,
  },
  {
    href: "/admin/settings",
    title: "Settings",
    description:
      "Manage your Better Auth account, password, and session settings.",
    icon: Settings,
  },
] as const satisfies readonly DashboardRoute[];

export type DashboardRouteHref = (typeof dashboardRoutes)[number]["href"];

export function getDashboardRoute(pathname: string) {
  return (
    dashboardRoutes.find((route) => route.href === pathname) ??
    dashboardRoutes[0]
  );
}

export function getDashboardRouteByHref(href: DashboardRouteHref) {
  return getDashboardRoute(href);
}
