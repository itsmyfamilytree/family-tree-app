// src/components/Login.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { initGoogleAuth } from '../lib/googleAuth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => console.log('Google API loaded');
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, [navigate]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      initGoogleAuth(
        clientId,
        async (googleUser) => {
          const id_token = googleUser.getAuthResponse().id_token;

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: id_token,
          });

          if (error) throw error;
          navigate('/dashboard');
        },
        (err) => {
          console.error('Google sign-in error:', err);
          alert('Google login failed. Check console.');
          setLoading(false);
        }
      );
    } catch (err) {
      alert('Login failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Family Tree App
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your family trees
          </p>
        </div>
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}