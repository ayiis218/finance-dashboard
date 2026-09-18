import { ROUTES } from "@/lib/registry/route";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  HandCoins,
  TrendingUp,
  PiggyBank,
  BarChart3,
  ClipboardList,
  LineChart,
} from "lucide-react";

export const navItems = [
  {
    show: true,
    title: "Dashboard",
    url: ROUTES.dashboard,
    icon: LayoutDashboard
  },
  {
    show: true,
    title: "Transactions",
    url: ROUTES.transactions.list,
    icon: Wallet
  },
  {
    show: true,
    title: "Accounts",
    url: ROUTES.accounts,
    icon: Landmark
  },
  {
    show: true,
    title: "Assets",
    url: ROUTES.assets,
    icon: Landmark
  },
  {
    show: true,
    title: "Receivables & Debts",
    url: ROUTES.receivables,
    icon: HandCoins
  },
  {
    show: true,
    title: "Investments",
    url: ROUTES.investments,
    icon: TrendingUp
  },
  {
    show: true,
    title: "Savings Goal",
    url: ROUTES.goals,
    icon: PiggyBank
  },
  {
    show: true,
    title: "Budget",
    url: ROUTES.budgets,
    icon: ClipboardList
  },
  {
    show: true,
    title: "Cashflow Forecast",
    url: ROUTES.cashflow,
    icon: LineChart
  },
  {
    show: true,
    title: "Reports",
    url: ROUTES.reports,
    icon: BarChart3
  },
];