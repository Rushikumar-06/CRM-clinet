// ✅ FRONTEND: app/(protected)/tags/page.js
'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function TagsPage() {
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#888888');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#88888');

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

  const openEditDialog = (tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = async () => {
    const token = await getFirebaseIdToken();
    await fetch(`http://localhost:5000/api/tags/${editingTag._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    setEditingTag(null);
    queryClient.invalidateQueries(['tags']);
    queryClient.invalidateQueries(['available-tags']);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12">
      <div className="grid sm:grid-cols-4 gap-6 bg-white border shadow-lg rounded-xl p-6 items-end">
        <div className="col-span-2">
          <label className="block text-sm font-semibold mb-1">Tag Name</label>
          <Input
            placeholder="e.g., Important, Client, Personal"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1">Color</label>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-9 h-7  border-gray-300 shadow-sm cursor-pointer"
          />
        </div>
        <Button className="h-12" onClick={addTag}>
          <Plus size={16} className="mr-2" /> Add Tag
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tags.map((tag) => (
          <div
            key={tag._id}
            className="rounded-2xl shadow-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 flex flex-col gap-4 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-semibold text-lg text-gray-800">{tag.name}</span>
              </div>
              <span className="text-xs text-gray-500">{tag.usageCount} uses</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => openEditDialog(tag)}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteTag(tag._id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent className="space-y-4">
          <h3 className="text-xl font-semibold">Edit Tag</h3>
          <Input
            placeholder="Tag Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <label className="font-medium">Color:</label>
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-9 h-7  border-gray-300 shadow-sm cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}