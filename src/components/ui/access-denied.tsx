"use client";

import { ShieldOff } from "lucide-react";
import { motion } from "framer-motion";

interface AccessDeniedProps {
  title?:       string;
  description?: string;
}

export function AccessDenied({
  title       = "Access Restricted",
  description = "You do not have permission to perform this action. Contact your administrator if you need access.",
}: AccessDeniedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <ShieldOff className="w-7 h-7 text-destructive" />
      </div>
      <div className="max-w-sm">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
