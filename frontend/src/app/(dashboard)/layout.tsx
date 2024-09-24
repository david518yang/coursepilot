import Sidebar from '@/components/Sidebar';
import { SignedIn, UserButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-screen flex'>
      <Sidebar />
      <div className='flex-1 relative'>
        <div className='absolute top-3 right-3 z-10'>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <main className='h-full p-4 overflow-auto'>{children}</main>
      </div>
    </div>
  );
}
