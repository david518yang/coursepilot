'use client';

import { ChevronsUpDown, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { useUser, useClerk } from '@clerk/nextjs';

export function NavUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            openUserProfile();
          }}
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <Avatar className='h-8 w-8 rounded-lg'>
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={user.fullName || 'avatar'} />
            ) : (
              <AvatarFallback className='bg-accent text-sidebar-primary'>
                <Sparkles />
              </AvatarFallback>
            )}
          </Avatar>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{user.fullName}</span>
            {user.primaryEmailAddress !== null && (
              <span className='truncate text-xs'>{user.primaryEmailAddress.emailAddress}</span>
            )}
          </div>
          <ChevronsUpDown className='ml-auto size-4' />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
