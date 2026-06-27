"use client";

import { useAuth } from "@/contexts/auth-context";
import { can } from "@/lib/rbac";
import { AccessDenied } from "@/components/ui/access-denied";
import type { Permission } from "@/lib/rbac";

interface PermissionGateProps {
  permission:   Permission;
  children:     React.ReactNode;
  title?:       string;
  description?: string;
}

export function PermissionGate({
  permission,
  children,
  title,
  description,
}: PermissionGateProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!can(role, permission)) {
    return <AccessDenied title={title} description={description} />;
  }

  return <>{children}</>;
}
