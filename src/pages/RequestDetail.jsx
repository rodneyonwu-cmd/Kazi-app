import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShiftDetailsView from '../components/ShiftDetailsView';
import TopBar from '../components/TopBar';

// ============================================================
// KAZI REQUEST DETAIL — Wraps ShiftDetailsView in invite mode
// Route: /requests/:id
// ============================================================

const MOCK_REQUESTS = {
  'req-1': {
    office: {
      id: 'demo',
      initials: 'MC',
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
    date: 'Today',
    hours: '9:00 AM – 5:00 PM',
    lunch: '45 min',
    rate: '$55/hr',
    role: 'Dental Hygienist',
    earnings: 440,
    note: 'Please wear navy scrubs. Park in lot B and check in at the front desk. Lunch will be provided.',
    expiresIn: '45m',
  },
  'req-2': {
    office: {
      id: 'demo',
      initials: 'SP',
      name: 'Sugarland Premier Dental',
      location: 'Sugar Land, TX · 7.8 mi away',
      rating: '4.7',
      reviewCount: 31,
      practiceType: 'General Dentistry',
      software: 'Eaglesoft',
      teamSize: '8 staff',
      parking: 'Free on-site',
      dressCode: 'Scrubs provided',
      address: '1234 Sweetwater Blvd\nSugar Land, TX 77479',
      distance: '7.8 mi',
    },
    date: 'Monday, Apr 14',
    hours: '8:00 AM – 4:00 PM',
    lunch: '45 min',
    rate: '$50/hr',
    role: 'Dental Hygienist',
    earnings: 400,
    note: 'Looking for an experienced RDH comfortable with Eaglesoft. We have a friendly, close-knit team. Scrubs provided. Free parking on-site.',
    expiresIn: '6h 22m',
  },
};

export default function RequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const shift = MOCK_REQUESTS[id] || MOCK_REQUESTS['req-2'];

  const handleAccept = () => {
    alert(`Accepted shift at ${shift.office.name}`);
    navigate('/requests');
  };

  const handleDecline = () => {
    if (window.confirm('Decline this shift request?')) {
      navigate('/requests');
    }
  };

  return (
    <>
      <TopBar role="provider" />
      <ShiftDetailsView mode="invite" shift={shift} onAccept={handleAccept} onDecline={handleDecline} />
    </>
  );
}
