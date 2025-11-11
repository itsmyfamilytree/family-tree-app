// src/components/NodeEditor.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { uploadToDrive } from '../lib/googleAuth';

export default function NodeEditor({ node, treeId, onClose }) {
  const [name, setName] = useState(node?.data?.label.split('\n')[0] || '');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleSave = async () => {
    let photoUrl = node?.data?.photo;
    if (photo) {
      const token = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
      photoUrl = await uploadToDrive(token, photo);
    }

    if (node) {
      // update
      await supabase.from('people').update({ name, dob, photo_url: photoUrl }).eq('id', node.id);
    } else {
      // create
      const { data } = await supabase.from('people').insert({
        tree_id: treeId,
        name,
        dob,
        photo_url: photoUrl
      }).select();
      // trigger re-render via parent
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl mb-4">{node ? 'Edit' : 'Add'} Person</h2>
        <input className="w-full p-2 border mb-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="date" className="w-full p-2 border mb-2" value={dob} onChange={e=>setDob(e.target.value)} />
        <input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files[0])} className="mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

// Inside handleSave after insert/update
if (dob) {
  const token = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
  await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: `${name}'s Birthday`,
      start: { date: dob },
      end: { date: dob },
      recurrence: ['RRULE:FREQ=YEARLY']
    })
  });
}