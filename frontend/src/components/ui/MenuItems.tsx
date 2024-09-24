'use client';

import Link from 'next/link';

const sections = [
  { name: 'Home', href: '/' },
  { name: 'Notes', href: '/#notes' },
  { name: 'Courses', href: '/#courses' }
];

export default function MenuItems({ closeMenu }: { closeMenu?: () => void }) {
  const itemClass =
    'text-sm text-zinc-600 hover:text-zinc-500 w-full border-b border-zinc-700/10 py-2 md:border-0';

  return (
    <>
      {sections.map(section => (
        <li key={section.name} className={itemClass}>
          <Link href={section.href} onClick={() => closeMenu && closeMenu()}>
            {section.name}
          </Link>
        </li>
      ))}
    </>
  );
}

