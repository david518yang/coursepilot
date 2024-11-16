'use client';

import { Fragment } from 'react';
import { Popover, PopoverButton, PopoverPanel, PopoverBackdrop, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Menu as MenuIcon } from 'lucide-react';
import clsx from 'clsx';

import Menu from './MenuItems';

export default function PopoverMenu() {
  return (
    <Popover className='relative md:hidden h-full w-min'>
      {({ open, close }) => (
        <>
          <PopoverButton className='h-full text-sm font-medium flex items-center justify-center '>
            <MenuIcon
              size={30}
              className={clsx('text-zinc-600 hover:text-zinc-400 transition-all', open ? 'rotate-180' : 'w-8')}
            />
          </PopoverButton>
          <PopoverBackdrop className='z-[49] fixed w-screen h-screen inset-0 bg-black/50 backdrop-blur-md' />
          <Transition
            as={Fragment}
            enter='transition duration-200 ease-out'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition duration-150 ease-out'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            <PopoverPanel className='fixed inset-x-4 top-4 rounded-3xl z-50 bg-slate-50 p-8 ring-1 ring-input flex flex-col'>
              <div className='flex justify-between mb-4'>
                <h1 className='text-sm font-medium text-zinc-500'>Menu</h1>
                <PopoverButton>
                  <XMarkIcon className='ml-auto w-5 fill-zinc-400 mb-2' />
                </PopoverButton>
              </div>
              <ul className='flex flex-col gap-4 text-zinc-800 w-full'>
                <Menu closeMenu={close} />
              </ul>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
