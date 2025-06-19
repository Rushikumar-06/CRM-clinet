
'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { auth } from '@/firebase/config';
import { getFirebaseIdToken } from '@/lib/firebaseAuth'; 

export default function ProfilePage() {
  const { user, setUser,loading } = useAuth();
  const fileInputRef = useRef();
  const [localPhoto, setLocalPhoto] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editName, setEditName] = useState(false);


  useEffect(() => {
    if (user) {
      setLocalPhoto(user.photoURL);
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setLocalPhoto(base64Image);
      try {
        const token = await getFirebaseIdToken();
        const response = await fetch("http://localhost:5000/api/user/update-photo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ photoURL: base64Image }),
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to update photo:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDisplayNameUpdate = async () => {
    try {
      const token = await getFirebaseIdToken();
      const response = await fetch('http://localhost:5000/api/user/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName }),
      });
      setEditName(false);
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">Profile Settings</h1>

      <div className="flex flex-col items-center">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title="Click to change profile photo"
        >
          <Avatar className="h-32 w-32 ring-2 ring-ring group-hover:brightness-75 transition">
            <AvatarImage src={localPhoto} />
            <AvatarFallback>{displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-background border rounded-full p-1 shadow-sm group-hover:scale-105 transition-transform">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      <div className="w-full space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Display Name</label>
        {editName ? (
          <div className="flex gap-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleDisplayNameUpdate}>Save</Button>
            <Button variant="ghost" onClick={() => setEditName(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between border rounded-md px-4 py-2">
            <span className="text-base font-medium text-foreground">{displayName}</span>
            <Button variant="ghost" size="icon" onClick={() => setEditName(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}