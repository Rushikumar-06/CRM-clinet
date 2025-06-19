// === components/shared/Sidebar.js ===
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Contact,
  ListTodo,
  Tag,
  Bot,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <aside className="w-64 flex flex-col justify-between h-full p-4 bg-background border-r">
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Avatar>
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/contacts')}>
            <Contact className="mr-2 h-4 w-4" /> Contacts
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/activities')}>
            <ListTodo className="mr-2 h-4 w-4" /> Activities
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/tags')}>
            <Tag className="mr-2 h-4 w-4" /> Tags
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/ai')}>
            <Bot className="mr-2 h-4 w-4" /> AI Assistant
          </Button>
        </nav>
      </div>
      <Button
        onClick={() => {
          logout();
          router.push('/login');
        }}
        variant="destructive"
        className="w-full justify-start"
      >
        <LogOut className="h-4 w-4 mr-2" /> Logout
      </Button>
    </aside>
  );
}