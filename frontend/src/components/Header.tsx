import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import PopoverMenu from '@/components/ui/PopoverMenu';
import MenuItems from '@/components/ui/MenuItems';
import Link from 'next/link';

const HeaderButton = ({ children }: { children: React.ReactNode }) => (
  <button className='group relative inline-flex text-nowrap h-10 min-w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white text-sm font-medium'>
    <div className='inline-flex h-12 translate-y-0 items-center justify-center px-6 text-neutral-950 transition duration-500 group-hover:-translate-y-[150%]'>
      {children}
    </div>
    <div className='absolute inline-flex h-12 w-full translate-y-[100%] items-center justify-center text-neutral-50 transition duration-500 group-hover:translate-y-0'>
      <span className='absolute h-full w-full translate-y-full skew-y-12 scale-y-0 bg-blue-500 transition duration-500 group-hover:translate-y-0 group-hover:scale-150'></span>
      <span className='z-10'>{children}</span>
    </div>
  </button>
);

const DashboardButton = () => (
  <Link href={'/editor'} prefetch={false}>
    <HeaderButton>Dashboard</HeaderButton>
  </Link>
);

export default function Header() {
  return (
    <header className='flex w-full items-center justify-between p-2 text-black'>
      <h1 className='text-2xl text-nowrap w-max'>
        📝🚀 <b>Coursepilot</b>
      </h1>
      <div className='flex gap-2 md:gap-8 items-center'>
        <ul className='hidden md:flex gap-6'>
          <MenuItems />
        </ul>
        <SignedIn>
          <DashboardButton />
        </SignedIn>
        <SignedOut>
          <div className='group relative inline-flex text-nowrap h-10 min-w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white text-sm font-medium'>
            <div className='inline-flex h-12 translate-y-0 items-center justify-center px-6 text-neutral-950 transition duration-500 group-hover:-translate-y-[150%]'>
              <SignInButton forceRedirectUrl={'/editor'} />
            </div>
            <div className='absolute inline-flex h-12 w-full translate-y-[100%] items-center justify-center text-neutral-50 transition duration-500 group-hover:translate-y-0'>
              <span className='absolute h-full w-full translate-y-full skew-y-12 scale-y-0 bg-blue-500 transition duration-500 group-hover:translate-y-0 group-hover:scale-150'></span>
              <span className='z-10'>
                <SignInButton forceRedirectUrl={'/editor'} />
              </span>
            </div>
          </div>
        </SignedOut>
        <PopoverMenu />
      </div>
    </header>
  );
}

