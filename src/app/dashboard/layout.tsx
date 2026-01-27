import { PilgrimHeader } from "@/components/shared/PilgrimHeader";
import { SosButton } from "@/components/shared/SosButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <PilgrimHeader />
      <main className="flex-1">{children}</main>
      <SosButton />
    </div>
  );
}
