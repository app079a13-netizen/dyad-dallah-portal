import { Loader2 } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [, setLocation] = useLocation();
  const { data: admin, isLoading } = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (!isLoading && !admin) {
      setLocation("/control-panel/login");
    }
  }, [admin, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-gray-600">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
