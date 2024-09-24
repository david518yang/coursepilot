import Sidebar from "@/components/Sidebar";
import { SignedIn, UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="absolute top-2 right-2 z-10">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <main className="w-full h-full overflow-auto">{children}</main>
      </div>
    </div>
  );
}
