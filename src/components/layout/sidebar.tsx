"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Search, UserPlus, Upload,
  BarChart3, UserCog, ClipboardList, Settings,
  ChevronLeft, ChevronRight, Vote, X, CircleUserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { initials, ROLE_BADGE } from "@/lib/rbac";

// All nav items are shown to every authenticated user.
// Permission enforcement happens inside each page, not here.
const NAV_ITEMS = [
  { label: "Dashboard",      href: "/dashboard",               icon: LayoutDashboard },
  { label: "Members",        href: "/dashboard/members",       icon: Users           },
  { label: "Search Records", href: "/dashboard/search",        icon: Search          },
  { label: "Add Member",     href: "/dashboard/add-member",    icon: UserPlus        },
  { label: "Import Data",    href: "/dashboard/import",        icon: Upload          },
  { label: "Analytics",      href: "/dashboard/analytics",     icon: BarChart3       },
  { label: "Users",          href: "/dashboard/users",         icon: UserCog         },
  { label: "Activity Logs",  href: "/dashboard/activity-logs", icon: ClipboardList   },
  { label: "Settings",       href: "/dashboard/settings",      icon: Settings        },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { profile, role } = useAuth();

  const displayName = profile?.full_name ?? "User";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white dark:border-sidebar animate-pulse" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-extrabold text-foreground leading-none whitespace-nowrap">ECS Portal</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">Election Campaign System</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={onMobileClose} className="ml-auto lg:hidden text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items — always all items, no role filtering */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  "flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                  collapsed ? "w-5 h-5" : "w-4.5 h-4.5"
                )} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div layoutId="active-indicator" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse toggle (desktop) */}
      <div className="hidden lg:block p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* User badge */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3"
          >
            <Link
              href="/dashboard/profile"
              onClick={onMobileClose}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials(displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                {role && (
                  <span className={cn("text-[9px] font-semibold px-1 py-0.5 rounded", ROLE_BADGE[role])}>
                    {role}
                  </span>
                )}
              </div>
              <CircleUserRound className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border overflow-hidden z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
