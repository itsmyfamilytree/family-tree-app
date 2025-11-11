import { useParams } from 'react-router-dom';
import TreeCanvas from '../components/TreeCanvas';
import NodeEditor from '../components/NodeEditor';
import { useState } from 'react';

export default function TreeView() {
  const { treeId } = useParams();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div>
      <div className="p-4 flex justify-between">
        <h1 className="text-2xl">Tree ID: {treeId}</h1>
        <button onClick={() => setEditorOpen(true)} className="px-4 py-2 bg-blue-600 text-white">+ Add Person</button>
      </div>
      <TreeCanvas treeId={treeId} />
      {editorOpen && <NodeEditor treeId={treeId} onClose={() => setEditorOpen(false)} />}
    </div>
  );
}