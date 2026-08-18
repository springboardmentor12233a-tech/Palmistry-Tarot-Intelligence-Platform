import React, { useState } from 'react';
import { User, Sparkles, Check, X, ShieldCheck, Heart } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface UserProfileModalProps {
  userProfile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userProfile,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [newGoal, setNewGoal] = useState('');

  const zodiacSigns = [
    'Aries ♈', 'Taurus ♉', 'Gemini ♊', 'Cancer ♋',
    'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Scorpio ♏',
    'Sagittarius ♐', 'Capricorn ♑', 'Aquarius ♒', 'Pisces ♓'
  ];

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setFormData((prev) => ({
        ...prev,
        spiritualGoals: [...prev.spiritualGoals, newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      spiritualGoals: prev.spiritualGoals.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#13152c] border border-amber-500/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg font-bold text-amber-200">
              Seeker Profile & Astrological Alignment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Name & Zodiac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Seeker Name / Pseudonym</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-[#0b0c1a] text-slate-200 rounded-xl p-2.5 border border-slate-700 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Zodiac Sun Sign</label>
              <select
                value={formData.zodiacSign}
                onChange={(e) => setFormData({ ...formData, zodiacSign: e.target.value })}
                className="w-full bg-[#0b0c1a] text-slate-200 rounded-xl p-2.5 border border-slate-700 focus:border-amber-400 outline-none cursor-pointer"
              >
                {zodiacSigns.map((z) => (
                  <option key={z} value={z.split(' ')[0]}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Spiritual Goals */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium">Spiritual Intentions & Focus Areas</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add intention (e.g., Throat chakra activation)..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGoal();
                  }
                }}
                className="flex-1 bg-[#0b0c1a] text-slate-200 rounded-xl p-2 border border-slate-700 focus:border-amber-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddGoal}
                className="px-3 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.spiritualGoals.map((goal, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#1a1d3b] border border-amber-500/30 text-amber-200 text-[11px] flex items-center space-x-1"
                >
                  <span>{goal}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="text-slate-400 hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md hover:from-amber-400 hover:to-amber-500"
            >
              Save Profile
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
