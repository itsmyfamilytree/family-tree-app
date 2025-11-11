import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [trees, setTrees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('family_trees').select('*').then(({ data }) => setTrees(data));
  }, []);

  const createTree = async () => {
    const name = prompt('Tree name?');
    if (!name) return;
    const { data } = await supabase.from('family_trees').insert({ name, owner_id: (await supabase.auth.getUser()).data.user.id }).select();
    navigate(`/tree/${data[0].id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">My Family Trees</h1>
      <button onClick={createTree} className="mb-4 px-4 py-2 bg-green-600 text-white">+ New Tree</button>
      <div className="grid grid-cols-3 gap-4">
        {trees.map(t => (
          <div key={t.id} onClick={() => navigate(`/tree/${t.id}`)} className="p-4 border rounded cursor-pointer hover:bg-gray-50">
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}