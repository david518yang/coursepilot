import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
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
  <Link href={'/courses'} prefetch={false}>
    <HeaderButton>Dashboard</HeaderButton>
  </Link>
);

const Nav = () => {
  return (
    <header className='flex items-center justify-center w-full min-w-screen border-b border-gray px-4 py-2'>
      <div className='flex items-center justify-between w-full max-w-5xl'>
        <Link href='/'>
          <Image src='favicon.svg' alt='coursepilot logo' width={32} height={32} />
        </Link>
        <div>
          <SignedIn>
            <DashboardButton />
          </SignedIn>
          <SignedOut>
            <div className='group relative inline-flex text-nowrap h-10 min-w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white text-sm font-medium'>
              <div className='inline-flex h-12 translate-y-0 items-center justify-center px-6 text-neutral-950 transition duration-500 group-hover:-translate-y-[150%]'>
                <SignInButton forceRedirectUrl={'/courses'} />
              </div>
              <div className='absolute inline-flex h-12 w-full translate-y-[100%] items-center justify-center text-neutral-50 transition duration-500 group-hover:translate-y-0'>
                <span className='absolute h-full w-full translate-y-full skew-y-12 scale-y-0 bg-blue-500 transition duration-500 group-hover:translate-y-0 group-hover:scale-150'></span>
                <span className='z-10'>
                  <SignInButton forceRedirectUrl={'/courses'} />
                </span>
              </div>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Nav;
