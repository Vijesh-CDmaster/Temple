
import { WorkerProvider } from "@/context/WorkerContext";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkerProvider>
      <div className="flex min-h-dvh bg-muted/40">
        {children}
      </div>
    </WorkerProvider>
  );
}
