import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen px-4 sm:px-8 py-8 pb-8 gap-16'>
      <div className='mt-44 max-w-3xl text-center flex flex-col items-center gap-8'>
        <h1 className='text-5xl font-bold '>
          Accelerate your notetaking with the power of{' '}
          <span className='inline-flex gap-2 items-center text-blue-500'>
            <Sparkles size={34} />
            AI
          </span>
        </h1>
        <div className='mx-auto flex items-center gap-4 md:gap-6'>
          <button className='group relative inline-flex text-sm h-12 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-zinc-300 px-6 font-medium text-neutral-600 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-[3px] hover:translate-y-[3px] hover:[box-shadow:0px_0px_rgb(82_82_82)]'>
            Learn More
          </button>
          <button className='group relative inline-flex text-sm h-12 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-transparent px-6 font-medium text-neutral-600 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-[3px] hover:translate-y-[3px] hover:[box-shadow:0px_0px_rgb(82_82_82)]'>
            Try for free today
          </button>
        </div>
      </div>
    </main>
  );
}
