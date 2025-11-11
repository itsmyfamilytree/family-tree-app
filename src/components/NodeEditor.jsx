// src/components/NodeEditor.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { uploadToDrive } from '../lib/googleAuth';

export default function NodeEditor({ node, treeId, onClose }) {
  // ----- STATE -----
  const [name, setName] = useState(node?.data?.label.split('\n')[0] || '');
  const [dob, setDob] = useState('');               // <-- NEW
  const [anniversary, setAnniversary] = useState(''); // optional, for future
  const [photo, setPhoto] = useState(null);

  // ----- HELPERS -----
  const getAccessToken = () => {
    const auth = window.gapi?.auth2?.getAuthInstance();
    return auth?.currentUser?.get()?.getAuthResponse()?.access_token;
  };

  const addBirthdayToCalendar = async (personName, birthDate) => {
    if (!birthDate) return;
    const token = getAccessToken();
    if (!token) return;

    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `${personName}'s Birthday`,
        start: { date: birthDate },
        end: { date: birthDate },
        recurrence: ['RRULE:FREQ=YEARLY'],
      }),
    });
  };

  // ----- SAVE HANDLER -----
  const handleSave = async () => {
    try {
      let photoUrl = node?.data?.photo;

      // 1. Upload photo if selected
      if (photo) {
        const token = getAccessToken();
        if (!token) throw new Error('Google auth not available');
        photoUrl = await uploadToDrive(token, photo);
      }

      // 2. Insert or update person
      const payload = {
        name,
        dob: dob || null,
        anniversary: anniversary || null,
        photo_url: photoUrl,
      };

      if (node) {
        // UPDATE
        await supabase.from('people').update(payload).eq('id', node.id);
      } else {
        // INSERT
        await supabase
          .from('people')
          .insert({ tree_id: treeId, ...payload })
          .select();
      }

      // 3. Google Calendar (birthday only)
      if (dob) await addBirthdayToCalendar(name, dob);

      onClose(); // close modal & refresh canvas
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save: ' + err.message);
    }
  };

  // ----- UI -----
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl mb-4">{node ? 'Edit' : 'Add'} Person</h2>

        <input
          className="w-full p-2 border mb-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-2 border mb-2"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-2 border mb-2"
          placeholder="Anniversary (optional)"
          value={anniversary}
          onChange={(e) => setAnniversary(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}