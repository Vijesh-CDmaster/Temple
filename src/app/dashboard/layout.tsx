import { PilgrimHeader } from "@/components/shared/PilgrimHeader";
import { SosButton } from "@/components/shared/SosButton";
import { TokenProvider } from "@/context/TokenContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TokenProvider>
      <div className="relative flex min-h-dvh flex-col">
        <PilgrimHeader />
        <main className="flex-1">{children}</main>
        <SosButton />
      </div>
    </TokenProvider>
  );
}
