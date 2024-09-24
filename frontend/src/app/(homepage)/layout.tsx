import Header from '@/components/Header';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen h-full max-w-5xl px-4 sm:px-8 py-8 pb-8 gap-16 mx-auto'>
      <div className='fixed left-0 top-0 -z-10 h-full w-full'>
        <div className='absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]'></div>
      </div>
      <Header />
      {children}
      <footer className='row-start-3 flex gap-6 flex-wrap text-zinc-600 items-center justify-center'>
        Notetaking, accelerated
      </footer>
    </div>
  );
}

