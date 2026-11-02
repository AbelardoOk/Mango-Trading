import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioProvider>
      <AuthGuard requireAdmin>
        <Shell>{children}</Shell>
      </AuthGuard>
    </PortfolioProvider>
  );
}
