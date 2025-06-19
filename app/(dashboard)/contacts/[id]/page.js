'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getFirebaseIdToken } from '@/lib/firebaseAuth'; 
import AddEditContactModal from '../AddEditContactModal';

export default function ContactDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchContact = async () => {
    const token = await getFirebaseIdToken();
    const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setContact(data);
  };

  useEffect(() => {
    if (user && id) fetchContact();
  }, [user, id]);

  const handleDelete = async () => {
    const token = await getFirebaseIdToken();
    await fetch(`http://localhost:5000/api/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push('/contacts');
  };

  if (!contact) return <p className="p-6">Loading contact...</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">{contact.name}</h2>
      <p>Email: {contact.email}</p>
      <p>Phone: {contact.phone}</p>
      <p>Company: {contact.company}</p>
      <p>Tags: {contact.tags?.join(', ')}</p>
      <p>Notes: {contact.notes}</p>
      <p>Last Interaction: {new Date(contact.lastInteraction).toLocaleDateString()}</p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/contacts')}>
          Back
        </Button>
        <Button variant="default" onClick={() => setEditModalOpen(true)}>
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      {editModalOpen && (
        <AddEditContactModal
          contact={contact}
          onClose={async () => {
            setEditModalOpen(false);
            await fetchContact();
          }}
        />
      )}
    </div>
  );
}
