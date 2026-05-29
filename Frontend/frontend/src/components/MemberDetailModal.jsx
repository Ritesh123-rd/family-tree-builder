import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Users, Activity, UserPlus } from 'lucide-react';
import { getMemberDetails, createMember } from '../api';

export default function MemberDetailModal({ id, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSiblingForm, setShowSiblingForm] = useState(false);
  const [siblingData, setSiblingData] = useState({ name: '', gender: 'Male', dob: '' });
  const [siblingError, setSiblingError] = useState('');
  const [siblingSubmitting, setSiblingSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await getMemberDetails(id);
      setDetails(data);
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddSibling = async (e) => {
    e.preventDefault();
    setSiblingError('');
    setSiblingSubmitting(true);

    try {
      const payload = {
        name: siblingData.name,
        gender: siblingData.gender,
      };
      if (siblingData.dob) payload.dob = siblingData.dob;
      if (details.member.father) payload.father = details.member.father._id;
      if (details.member.mother) payload.mother = details.member.mother._id;

      await createMember(payload);
      setSiblingData({ name: '', gender: 'Male', dob: '' });
      setShowSiblingForm(false);
      setLoading(true);
      await fetchDetails();
    } catch (err) {
      setSiblingError(err.response?.data?.message || 'Failed to add sibling');
    } finally {
      setSiblingSubmitting(false);
    }
  };

  const canAddSibling = details?.member?.father || details?.member?.mother;

  const getGenderEmoji = (gender) => {
    if (gender === 'Male') return '👨';
    if (gender === 'Female') return '👩';
    return '🧑';
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="modal-card"
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>Loading details...</div>
        ) : details ? (
          <>
            {/* Gradient Header */}
            <div className="modal-header">
              <h2>{getGenderEmoji(details.member.gender)} {details.member.name}</h2>
              <div className="modal-header-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Activity size={14} /> {details.member.gender}
                </span>
                {details.member.dob && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} /> {new Date(details.member.dob).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Body Sections */}
            <div className="modal-body">
              {/* Parents */}
              <div className="modal-section">
                <h4><Users size={16} /> Parents</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Father</span>
                    <span style={{ fontWeight: 600 }}>
                      {details.member.father ? `👨 ${details.member.father.name}` : '— Unknown'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Mother</span>
                    <span style={{ fontWeight: 600 }}>
                      {details.member.mother ? `👩 ${details.member.mother.name}` : '— Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Children */}
              <div className="modal-section">
                <h4><Users size={16} /> Children ({details.children.length})</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {details.children.length > 0 ? details.children.map(c => (
                    <span key={c._id} className="chip">
                      {getGenderEmoji(c.gender)} {c.name}
                    </span>
                  )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No children</span>}
                </div>
              </div>

              {/* Siblings */}
              <div className="modal-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}><Users size={16} /> Siblings ({details.siblings.length})</h4>
                  {canAddSibling && (
                    <button className="add-sibling-btn" onClick={() => setShowSiblingForm(!showSiblingForm)}>
                      <UserPlus size={14} /> {showSiblingForm ? 'Cancel' : 'Add Sibling'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {details.siblings.length > 0 ? details.siblings.map(s => (
                    <span key={s._id} className="chip">
                      {getGenderEmoji(s.gender)} {s.name}
                    </span>
                  )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No siblings</span>}
                </div>

                {/* Inline Add Sibling Form */}
                {showSiblingForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleAddSibling}
                    className="sibling-form"
                  >
                    <p>
                      Adding a sibling for <strong>{details.member.name}</strong>. 
                      Parents auto-set to: 
                      <strong> {details.member.father?.name || '—'}</strong> & 
                      <strong> {details.member.mother?.name || '—'}</strong>
                    </p>

                    {siblingError && <div className="error-banner" style={{ marginBottom: '10px' }}>{siblingError}</div>}

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        required
                        type="text"
                        placeholder="Sibling's name"
                        value={siblingData.name}
                        onChange={e => setSiblingData({ ...siblingData, name: e.target.value })}
                        style={{ flex: 2 }}
                      />
                      <select
                        value={siblingData.gender}
                        onChange={e => setSiblingData({ ...siblingData, gender: e.target.value })}
                        style={{ flex: 1 }}
                      >
                        <option value="Male">👨 Male</option>
                        <option value="Female">👩 Female</option>
                        <option value="Other">🧑 Other</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="date"
                        value={siblingData.dob}
                        onChange={e => setSiblingData({ ...siblingData, dob: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }} disabled={siblingSubmitting}>
                        {siblingSubmitting ? 'Saving...' : '🌿 Save'}
                      </button>
                    </div>
                  </motion.form>
                )}

                {!canAddSibling && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px', fontStyle: 'italic' }}>
                    To add siblings, this member must have at least one parent assigned.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load details.</div>
        )}
      </motion.div>
    </div>
  );
}
