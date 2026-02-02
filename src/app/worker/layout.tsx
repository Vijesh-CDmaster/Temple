
import { WorkerAuthProvider } from "@/context/WorkerContext";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkerAuthProvider>
      <div className="flex min-h-dvh bg-muted/40">
        {children}
      </div>
    </WorkerAuthProvider>
  );
}
