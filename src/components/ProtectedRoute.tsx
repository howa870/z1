import { Redirect } from "wouter";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-cairo">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;

  return <>{children}</>;
}
