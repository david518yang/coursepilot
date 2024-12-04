import Hero from '@/components/landing/Hero';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className='flex flex-col items-center justify-center gap-8'>
      <Hero />
      <div className='z-0 mt-[-32px] sm:mt-[-100px]'>
        <Image src='/coursepilot_landing.png' alt='coursepilot landing' width={800} height={500} />
      </div>
    </main>
  );
}
