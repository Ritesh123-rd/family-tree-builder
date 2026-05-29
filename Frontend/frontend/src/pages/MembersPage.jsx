import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMembers, deleteMember } from '../api';
import MemberForm from '../components/MemberForm';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data.members);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this family member?")) {
      try {
        await deleteMember(id);
        fetchMembers();
      } catch (error) {
        alert("Failed to delete member");
      }
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = (shouldRefresh) => {
    setIsFormOpen(false);
    setEditingMember(null);
    if (shouldRefresh) fetchMembers();
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGenderEmoji = (gender) => {
    if (gender === 'Male') return '👨';
    if (gender === 'Female') return '👩';
    return '🧑';
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>👥 Manage Members</h1>
          <p>Add, edit, or remove family members from your tree</p>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={18} /> Add Member
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '360px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search members by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '42px' }}
        />
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ padding: '0.5rem' }}>
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p>Loading members...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Father</th>
                  <th>Mother</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td style={{ fontWeight: 600 }}>
                      {getGenderEmoji(member.gender)} {member.name}
                    </td>
                    <td>{member.gender}</td>
                    <td>{member.dob ? new Date(member.dob).toLocaleDateString() : '—'}</td>
                    <td>{member.father ? member.father.name : '—'}</td>
                    <td>{member.mother ? member.mother.name : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-btn edit" onClick={() => handleEdit(member)} title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(member._id)} title="Delete" style={{ marginLeft: '4px' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <p>{searchQuery ? 'No members match your search.' : 'No family members added yet.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isFormOpen && (
        <MemberForm
          member={editingMember}
          allMembers={members}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
