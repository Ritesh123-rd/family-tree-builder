import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createMember, updateMember } from '../api';

export default function MemberForm({ member, allMembers, onClose }) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    gender: member?.gender || 'Male',
    dob: member?.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
    father: member?.father?._id || '',
    mother: member?.mother?._id || ''
  });
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableFathers = allMembers.filter(m => m.gender === 'Male' && m._id !== member?._id);
  const availableMothers = allMembers.filter(m => m.gender === 'Female' && m._id !== member?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.father) delete dataToSubmit.father;
      if (!dataToSubmit.mother) delete dataToSubmit.mother;
      if (!dataToSubmit.dob) delete dataToSubmit.dob;

      if (member) {
        await updateMember(member._id, dataToSubmit);
      } else {
        await createMember(dataToSubmit);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="modal-card"
      >
        <div className="form-modal-body">
          <button 
            onClick={() => onClose(false)}
            style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>

          <h2>{member ? '✏️ Edit Member' : '➕ Add Family Member'}</h2>
          <p className="subtitle">{member ? 'Update the details below' : 'Fill in the details to add a new family member'}</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label>Name *</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Enter full name" 
              />
            </div>

            <div className="form-row">
              <div>
                <label>Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="Male">👨 Male</option>
                  <option value="Female">👩 Female</option>
                  <option value="Other">🧑 Other</option>
                </select>
              </div>
              <div>
                <label>Date of Birth</label>
                <input 
                  type="date" 
                  value={formData.dob} 
                  onChange={e => setFormData({...formData, dob: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <label>Father</label>
              <select value={formData.father} onChange={e => setFormData({...formData, father: e.target.value})}>
                <option value="">— None —</option>
                {availableFathers.map(f => <option key={f._id} value={f._id}>👨 {f.name}</option>)}
              </select>
            </div>

            <div>
              <label>Mother</label>
              <select value={formData.mother} onChange={e => setFormData({...formData, mother: e.target.value})}>
                <option value="">— None —</option>
                {availableMothers.map(m => <option key={m._id} value={m._id}>👩 {m.name}</option>)}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => onClose(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : member ? 'Update Member' : '🌿 Save Member'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
