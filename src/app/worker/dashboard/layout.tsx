import { WorkerSidebar } from "./_components/sidebar";

export default function WorkerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WorkerSidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
