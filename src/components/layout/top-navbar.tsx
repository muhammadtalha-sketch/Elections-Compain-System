"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu, Bell, Sun, Moon, Search, ChevronDown,
  User, LogOut, Settings, Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your campaign data" },
  "/dashboard/members": { title: "Members", subtitle: "Manage registered campaign members" },
  "/dashboard/search": { title: "Search Records", subtitle: "Advanced search and filter members" },
  "/dashboard/add-member": { title: "Add Member", subtitle: "Register a new campaign member" },
  "/dashboard/import": { title: "Import Data", subtitle: "Bulk import member records" },
  "/dashboard/analytics": { title: "Analytics", subtitle: "Campaign insights and statistics" },
  "/dashboard/users": { title: "Users", subtitle: "Manage system users and permissions" },
  "/dashboard/activity-logs": { title: "Activity Logs", subtitle: "Track all system activities" },
  "/dashboard/settings": { title: "Settings", subtitle: "Configure system preferences" },
};

const NOTIFICATIONS = [
  { id: 1, title: "Import Completed", desc: "45 members imported successfully", time: "2m ago", unread: true, type: "success" },
  { id: 2, title: "New Member Added", desc: "SLK-0120 added by Fatima Zahra", time: "15m ago", unread: true, type: "info" },
  { id: 3, title: "Export Ready", desc: "Hajipura area export is ready", time: "1h ago", unread: false, type: "info" },
  { id: 4, title: "Low Storage Warning", desc: "Database at 78% capacity", time: "3h ago", unread: false, type: "warning" },
];

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState("");

  const pageInfo = PAGE_TITLES[pathname] || { title: "Dashboard", subtitle: "" };
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 lg:px-6 py-3.5 bg-background/80 backdrop-blur-xl border-b border-border">
      <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="hidden sm:block">
        <h1 className="text-base font-bold text-foreground leading-none">{pageInfo.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{pageInfo.subtitle}</p>
      </div>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2 max-w-xs w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Quick search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger className="relative inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
          </div>
          <div className="divide-y divide-border">
            {NOTIFICATIONS.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  notif.unread && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    notif.type === "success" && "bg-green-500",
                    notif.type === "warning" && "bg-amber-500",
                    notif.type === "info" && "bg-primary",
                  )} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.desc}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-xs text-primary h-7">
              View all notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* User profile */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors cursor-pointer outline-none">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              AM
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-xs font-medium text-foreground">Arif Mehmood</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <div>
              <p className="text-sm font-semibold">Arif Mehmood</p>
              <p className="text-xs text-muted-foreground font-normal">arif.mehmood@ecs.pk</p>
              <Badge className="mt-1 text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20 font-medium">
                Administrator
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
            <User className="w-3.5 h-3.5" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
            <Settings className="w-3.5 h-3.5" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm cursor-pointer">
            <Shield className="w-3.5 h-3.5" />
            Security
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* TODO: Backend Integration — JWT logout, session clearing */}
          <DropdownMenuItem className="gap-2 text-sm text-destructive cursor-pointer focus:text-destructive">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
