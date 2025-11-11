// src/lib/googleAuth.js
export const initGoogleAuth = (clientId, onSuccess, onError) => {
  window.gapi.load('auth2', () => {
    window.gapi.auth2.init({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file'
    }).then(() => {
      const auth = window.gapi.auth2.getAuthInstance();
      if (auth.isSignedIn.get()) onSuccess(auth.currentUser.get());
      else auth.signIn().then(onSuccess).catch(onError);
    });
  });
};

export const uploadToDrive = async (accessToken, file) => {
  const metadata = {
    name: `${Date.now()}_${file.name}`,
    mimeType: file.type,
    parents: ['appDataFolder'] // optional, or create a folder
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
    body: form
  });
  const data = await res.json();
  // Make file public
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  });
  return `https://drive.google.com/uc?id=${data.id}`;
};