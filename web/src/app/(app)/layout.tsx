import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioProvider>
      <AuthGuard>
        <Shell>{children}</Shell>
      </AuthGuard>
    </PortfolioProvider>
  );
}
