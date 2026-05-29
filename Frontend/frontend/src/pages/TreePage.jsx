import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFamilyTree } from '../api';
import MemberDetailModal from '../components/MemberDetailModal';

const TreeNode = ({ node, onSelect }) => {
  const genderClass = node.gender === 'Male' ? 'male' : node.gender === 'Female' ? 'female' : 'other';
  const initial = node.name ? node.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="tree-node-wrapper">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={`tree-node-card ${genderClass}`}
        onClick={() => onSelect(node._id)}
      >
        <div className={`tree-node-avatar ${genderClass}`}>
          {initial}
        </div>
        <span className="tree-node-name">{node.name}</span>
        <span className="tree-node-gender">{node.gender}</span>
      </motion.div>

      {node.children && node.children.length > 0 && (
        <div className={`tree-children-container ${node.children.length === 1 ? 'single-child' : ''}`}>
          {node.children.map((child, index) => (
            <TreeNode key={`${child._id}-${index}`} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TreePage() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const data = await getFamilyTree();
        setTree(data.tree);
      } catch (error) {
        console.error("Failed to fetch tree", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  if (loading) {
    return (
      <div className="empty-state animate-in">
        <div className="empty-state-icon">⏳</div>
        <p>Loading Family Tree...</p>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>🌳 Family Tree</h1>
          <p>Click on any member to view their details, parents, children & siblings</p>
        </div>
      </div>

      <div className="card">
        <div className="tree-canvas">
          {tree.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍👩‍👧‍👦</div>
              <p>No family members yet. Go to "Manage Members" to start building your tree!</p>
            </div>
          ) : (
            <div className="tree-root-container">
              {tree.map((root, index) => (
                <TreeNode key={`${root._id}-root-${index}`} node={root} onSelect={setSelectedId} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <MemberDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
