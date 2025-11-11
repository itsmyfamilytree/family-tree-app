// src/components/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Family Tree</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-8 w-8 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-800">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}