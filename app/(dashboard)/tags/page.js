// ✅ FRONTEND: app/tags/page.js
'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TagsPage() {
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#888888');
  const queryClient = useQueryClient();

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/tags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.tags || data;
    },
  });

  const addTag = async () => {
    const token = await getFirebaseIdToken();
    await fetch('http://localhost:5000/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newTag, color: newColor }),
    });
    setNewTag('');
    setNewColor('#888888');
    queryClient.invalidateQueries(['tags']);
    queryClient.invalidateQueries(['available-tags']);
  };

  const deleteTag = async (id) => {
    const token = await getFirebaseIdToken();
    await fetch(`http://localhost:5000/api/tags/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    queryClient.invalidateQueries(['tags']);
    queryClient.invalidateQueries(['available-tags']);
  };

  const updateTag = async (id, updates) => {
    const token = await getFirebaseIdToken();
    await fetch(`http://localhost:5000/api/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    queryClient.invalidateQueries(['tags']);
    queryClient.invalidateQueries(['available-tags']);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-800">Tags</h2>

      <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg shadow">
        <Input
          placeholder="New tag name"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="max-w-sm border border-blue-300"
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-10 h-10 border rounded"
        />
        <Button onClick={addTag} className="bg-blue-600 hover:bg-blue-700 text-white">Add Tag</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.isArray(tags) && tags.map((tag) => (
          <div key={tag._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
              <Input
                value={tag.name}
                onChange={(e) => updateTag(tag._id, { name: e.target.value })}
                className="text-sm w-32 border border-gray-300"
              />
              <input
                type="color"
                value={tag.color}
                onChange={(e) => updateTag(tag._id, { color: e.target.value })}
                className="w-8 h-8 border rounded"
              />
              <span className="text-xs text-gray-500">Used {tag.usageCount}x</span>
            </div>
            <Button size="sm" variant="destructive" onClick={() => deleteTag(tag._id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
