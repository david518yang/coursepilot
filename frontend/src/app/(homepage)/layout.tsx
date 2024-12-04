import Nav from '@/components/landing/Nav';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid grid-rows-[auto_1fr_auto] min-h-screen h-full w-full overflow-hidden'>
      <Nav />
      {children}
      <footer className='flex gap-6 flex-wrap text-zinc-600 text-sm items-center justify-center border-t w-full h-full p-4 z-10'>
        By Davis Banks, Lucian Prinz, and David Yang
      </footer>
    </div>
  );
}
