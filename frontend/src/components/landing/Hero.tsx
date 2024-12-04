import { SignInButton } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <div className='relative w-4/5 text-center flex flex-col items-center gap-8 px-16 py-24'>
      <div className='absolute inset-0 bg-grid-pattern bg-radial-gradient'>
        <div className='absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]'></div>
      </div>

      <div className='flex flex-col gap-8 items-center justify-center z-10'>
        <h1 className='flex items-center justify-center text-4xl md:text-6xl  font-bold gap-3'>
          <Image src='favicon.svg' alt='coursepilot logo' height={72} width={72} />
          coursepilot
        </h1>
        <h1 className='text-xl '>
          Accelerate your notetaking with the power of{' '}
          <span className='inline-flex gap-2 items-center text-blue-500'>
            <Sparkles size={16} />
            AI
          </span>
        </h1>
        <div className='mx-auto flex items-center gap-4 md:gap-6'>
          {/* <button className='group relative inline-flex text-sm h-12 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-zinc-300 px-6 font-medium text-neutral-600 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-[3px] hover:translate-y-[3px] hover:[box-shadow:0px_0px_rgb(82_82_82)]'>
          Learn More
        </button> */}
          <Link href='/courses'>
            <SignInButton forceRedirectUrl={'/courses'}>
              <button className='group relative inline-flex text-sm h-12 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-background px-6 font-medium text-neutral-600 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-[3px] hover:translate-y-[3px] hover:[box-shadow:0px_0px_rgb(82_82_82)]'>
                Try for free today
              </button>
            </SignInButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
