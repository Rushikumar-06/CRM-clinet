'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';

export default function AddEditContactModal({ onClose, contact }) {
  const isEdit = !!contact;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    tags: contact?.tags?.join(', ') || '',
    notes: contact?.notes || '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const token = await getFirebaseIdToken();
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `http://localhost:5000/api/contacts/${contact._id}`
      : 'http://localhost:5000/api/contacts';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map((tag) => tag.trim()),
      }),
    });

    queryClient.invalidateQueries(['contacts']);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogTitle>{isEdit ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <Input name="company" placeholder="Company" value={formData.company} onChange={handleChange} />
        <Input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} />
        <Input name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
        <Button onClick={handleSubmit}>{isEdit ? 'Update' : 'Add'} Contact</Button>
      </DialogContent>
    </Dialog>
  );
}