'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="p-4 border-b flex items-center justify-between bg-background">
      <h1 className="text-lg font-semibold">CRM Profile</h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
