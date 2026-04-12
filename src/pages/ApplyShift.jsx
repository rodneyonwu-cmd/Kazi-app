import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShiftDetailsView from '../components/ShiftDetailsView';
import TopBar from '../components/TopBar';

// ============================================================
// KAZI APPLY SHIFT — Wraps ShiftDetailsView in browse mode
// Route: /find-shifts/:id
// ============================================================

const MOCK_OPEN_SHIFTS = {
  'shift-pwd': {
    office: {
      id: 'demo',
      initials: 'PWD',
      name: 'Pearland Wellness Dental',
      location: 'Pearland, TX · 3.1 mi away',
      rating: '4.7',
      reviewCount: 58,
      practiceType: 'Wellness Practice',
      software: 'Eaglesoft',
      teamSize: '6 staff',
      parking: 'Free on-site',
      dressCode: 'Any color scrubs',
      address: '4500 Broadway St\nPearland, TX 77581',
      distance: '3.1 mi',
    },
    date: 'Thursday, Apr 11',
    hours: '8:00 AM – 5:00 PM',
    lunch: '30 min',
    rate: '$62/hr',
    role: 'Dental Hygienist',
    earnings: 527,
    note: 'Need someone fast — our regular hygienist called out. Easy patient day, mostly recalls.',
  },
  'shift-mcd': {
    office: {
      id: 'demo',
      initials: 'MCD',
      name: 'Missouri City Dental',
      location: 'Missouri City, TX · 4.2 mi away',
      rating: '4.9',
      reviewCount: 124,
      practiceType: 'General Dentistry',
      software: 'Dentrix',
      teamSize: '12 staff',
      parking: 'Lot B',
      dressCode: 'Navy scrubs',
      address: '7890 Highway 6\nMissouri City, TX 77459',
      distance: '4.2 mi',
    },
    date: 'Wednesday, Apr 10',
    hours: '8:00 AM – 5:00 PM',
    lunch: '45 min',
    rate: '$58/hr',
    role: 'Dental Hygienist',
    earnings: 493,
    note: 'Please wear navy scrubs. Park in lot B and check in at the front desk. Lunch will be provided.',
  },
};

export default function ApplyShift() {
  const navigate = useNavigate();
  const { id } = useParams();
  const shift = MOCK_OPEN_SHIFTS[id] || MOCK_OPEN_SHIFTS['shift-mcd'];

  const handleApply = () => {
    // Toast is shown by ShiftDetailsView before this fires.
    navigate('/find-shifts');
  };

  const handleSave = () => {
    alert('Saved to favorites');
  };

  return (
    <>
      <TopBar role="provider" />
      <ShiftDetailsView mode="browse" shift={shift} onApply={handleApply} onSave={handleSave} />
    </>
  );
}
