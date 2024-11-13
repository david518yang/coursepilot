'use client';

import { ChevronsUpDown, Sparkles, LogOut, UserRoundCog } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { useUser, useClerk } from '@clerk/nextjs';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useSidebar } from '@/components/ui/sidebar';

export function NavUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  const { toggleSidebar } = useSidebar();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
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
                  <span className='truncate text-xs'>{user.primaryEmailAddress?.emailAddress}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              side='bottom'
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
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
                    <span className='truncate text-xs'>{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    toggleSidebar();
                    openUserProfile();
                  }}
                >
                  <UserRoundCog className='w-5 h-5 mr-2' />
                  Account
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                }}
              >
                <LogOut className='w-5 h-5 mr-2' />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
