// src/components/TreeCanvas.jsx
import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, addEdge, useNodesState, useEdgesState } from 'react-flow-renderer';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const nodeWidth = 180;
const nodeHeight = 100;

export default function TreeCanvas({ treeId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load tree
  useEffect(() => {
    const load = async () => {
      const { data: people } = await supabase.from('people').select('*').eq('tree_id', treeId);
      const { data: rels } = await supabase.from('relationships').select('*').eq('tree_id', treeId);

      const nodeMap = {};
      const newNodes = people.map(p => {
        const node = {
          id: p.id,
          type: 'default',
          data: { label: `${p.name}\n${p.dob || ''}`, photo: p.photo_url },
          position: { x: Math.random() * 500, y: Math.random() * 500 }
        };
        nodeMap[p.id] = node;
        return node;
      });

      const newEdges = rels.map(r => ({
        id: `${r.parent_id}-${r.child_id}`,
        source: r.parent_id,
        target: r.child_id,
        label: r.type
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    };
    load();
  }, [treeId]);

  const onConnect = async (params) => {
    setEdges(eds => addEdge(params, eds));
    await supabase.from('relationships').insert({
      tree_id: treeId,
      parent_id: params.source,
      child_id: params.target,
      type: 'biological'
    });
  };

  return (
    <div style={{ height: '80vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}