import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Account creation is restricted</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Account creation is restricted. Contact your administrator.
        </p>
        <Link href="/login">
          <Button variant="outline" size="sm">Back to Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
