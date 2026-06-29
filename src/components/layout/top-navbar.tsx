"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, Bell, Sun, Moon, Search, ChevronDown,
  User, LogOut, Settings, Shield,
  UserPlus, PencilLine, Trash2, MessageSquare, ThumbsUp, Upload, CheckCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { initials, ROLE_BADGE } from "@/lib/rbac";
import type { AppNotification } from "@/services/notificationService";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":             { title: "Dashboard",      subtitle: "Overview of your campaign data" },
  "/dashboard/members":     { title: "Members",         subtitle: "Manage registered campaign members" },
  "/dashboard/search":      { title: "Search Records",  subtitle: "Advanced search and filter members" },
  "/dashboard/add-member":  { title: "Add Member",      subtitle: "Register a new campaign member" },
  "/dashboard/import":      { title: "Import Data",     subtitle: "Bulk import member records" },
  "/dashboard/analytics":   { title: "Analytics",       subtitle: "Campaign insights and statistics" },
  "/dashboard/users":       { title: "Users",           subtitle: "Manage system users and permissions" },
  "/dashboard/activity-logs":{ title: "Activity Logs",  subtitle: "Track all system activities" },
  "/dashboard/settings":    { title: "Settings",        subtitle: "Configure system preferences" },
  "/dashboard/profile":     { title: "My Profile",      subtitle: "Manage your account settings" },
};

type NotifMeta = { icon: React.ElementType; dot: string }

const NOTIF_META: Record<string, NotifMeta> = {
  member_added:     { icon: UserPlus,      dot: "bg-green-500"  },
  member_updated:   { icon: PencilLine,    dot: "bg-blue-500"   },
  member_deleted:   { icon: Trash2,        dot: "bg-red-500"    },
  comment_added:    { icon: MessageSquare, dot: "bg-violet-500" },
  interest_changed: { icon: ThumbsUp,      dot: "bg-amber-500"  },
  import_completed: { icon: Upload,        dot: "bg-teal-500"   },
  user_created:     { icon: UserPlus,      dot: "bg-primary"    },
}

const DEFAULT_META: NotifMeta = { icon: Bell, dot: "bg-muted-foreground" }

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)   return "just now"
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400)return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

interface TopNavbarProps { onMenuToggle: () => void }

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, profile, role, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [signingOut,  setSigningOut]  = useState(false);

  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  const pageInfo     = PAGE_TITLES[pathname] ?? { title: "Dashboard", subtitle: "" };
  const displayName  = profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const displayEmail = user?.email ?? "";
  const avatarUrl    = profile?.avatar_url ?? null;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    toast.success("Signed out successfully");
    router.push("/login");
  };

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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Bell className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n: AppNotification) => {
                const meta = NOTIF_META[n.type] ?? DEFAULT_META
                const Icon = meta.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.isRead) markRead(n.id) }}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        n.isRead ? "bg-muted" : `${meta.dot} bg-opacity-15`
                      )}>
                        <Icon className={cn("w-3.5 h-3.5", n.isRead ? "text-muted-foreground" : "text-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.isRead && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", meta.dot)} />}
                          <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-[10px] text-center text-muted-foreground/60">
                Showing last {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* User profile */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors cursor-pointer outline-none">
          <Avatar className="h-6 w-6">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-xs font-medium text-foreground">{displayName}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">{displayEmail}</p>
                {role && (
                  <span className={cn(
                    "inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                    ROLE_BADGE[role]
                  )}>
                    {role}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
            <User className="w-3.5 h-3.5" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
            <Settings className="w-3.5 h-3.5" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm cursor-pointer" onClick={() => router.push("/dashboard/profile?tab=security")}>
            <Shield className="w-3.5 h-3.5" /> Security
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-sm text-destructive cursor-pointer focus:text-destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="w-3.5 h-3.5" />
            {signingOut ? "Signing out…" : "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
