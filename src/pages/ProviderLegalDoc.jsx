import { useNavigate, useParams, Navigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import BottomNav from '../components/BottomNav';
import useUserRole from '../hooks/useUserRole';

const DOCS = {
  terms: {
    title: 'Terms of Service',
    updated: 'March 3, 2026',
    intro: 'Welcome to Kazi. These terms govern how you use the Kazi platform. By creating an account, posting or accepting shifts, or otherwise using Kazi, you agree to them.',
    sections: [
      {
        heading: 'Using Kazi',
        body: [
          'You must be at least 18 years old and legally eligible to work in the United States to use Kazi as a provider.',
          'You agree to provide accurate credentials, licenses, and identity information. Misrepresentation is grounds for immediate removal from the platform.',
          'Offices agree to accurately describe each shift — location, hours, pay rate, and role — and to honor the terms of any accepted booking.',
        ],
      },
      {
        heading: 'Payments',
        body: [
          'Offices pay the provider directly through Kazi after the shift is completed. Kazi charges a service fee to the office, which is shown before the shift is posted.',
          'Providers are paid within 2 business days of a completed shift, subject to standard banking delays.',
          'Cancellations within 24 hours of a shift may incur a fee, paid to the other party.',
        ],
      },
      {
        heading: 'Conduct',
        body: [
          'Providers and offices agree to treat each other with professionalism. Harassment, discrimination, or safety violations result in permanent removal.',
          'Reviews left by either party must be honest and based on firsthand experience.',
        ],
      },
      {
        heading: 'Termination',
        body: [
          'Either party may end their Kazi account at any time. Any outstanding shifts must still be completed or formally cancelled.',
          'Kazi may suspend or terminate accounts that violate these terms, at our discretion.',
        ],
      },
      {
        heading: 'Changes to these terms',
        body: [
          'We may update these terms from time to time. Material changes will be announced in-app and by email at least 30 days before taking effect.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'March 3, 2026',
    intro: 'Your privacy is a baseline, not a feature. This policy explains what we collect, why, and how you can control it.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Account info you provide: name, email, phone, home address, date of birth, professional credentials, and photo if uploaded.',
          'Shift and payment history — who you worked with, when, and how much.',
          'Device and usage data: app version, device type, and activity within the app. We do not sell this.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'To match you with appropriate shifts or candidates, verify credentials, process payments, and keep the platform safe.',
          'To send you important account, booking, and payment updates. Marketing messages are always opt-in.',
        ],
      },
      {
        heading: 'Who sees your info',
        body: [
          'Offices see the profile fields you choose to share — name, photo, credentials, rating, and reviews.',
          'We share data with trusted processors (e.g. payments, identity verification). We require them to handle your data with the same protections.',
          'We disclose data when required by law or to protect the safety of our users.',
        ],
      },
      {
        heading: 'Your controls',
        body: [
          'You can edit or delete most profile fields at any time. Deleting your account removes your personal data within 30 days, except where retention is legally required.',
          'You can opt out of non-essential emails and push notifications in Settings.',
        ],
      },
      {
        heading: 'Contact',
        body: [
          'Questions about this policy? Reach us at privacy@kazi.app.',
        ],
      },
    ],
  },
  community: {
    title: 'Community Guidelines',
    updated: 'March 3, 2026',
    intro: 'Kazi works because professionals and offices show up for each other. These guidelines keep the marketplace a place where the best people want to work.',
    sections: [
      {
        heading: 'Be reliable',
        body: [
          'Only accept shifts you can complete. If something comes up, cancel as early as possible so the office has time to rebook.',
          'Offices: post realistic shifts with accurate details. Surprise requirements on the day erode trust.',
        ],
      },
      {
        heading: 'Be respectful',
        body: [
          'Communicate professionally in messages, in reviews, and on-site.',
          'Discrimination of any kind — based on race, gender, religion, identity, disability, or age — is not tolerated.',
        ],
      },
      {
        heading: 'Be honest',
        body: [
          'Providers: only represent credentials you currently hold and can verify.',
          'Offices: pay the rate and hours that were agreed to. Do not pressure providers into unpaid work.',
        ],
      },
      {
        heading: 'Keep the marketplace clean',
        body: [
          'Do not arrange payment or booking outside of Kazi for shifts that originated on the platform. It bypasses the protections that make it worth being here.',
          'Report problems through the in-app flow so we can act quickly and fairly.',
        ],
      },
      {
        heading: 'Consequences',
        body: [
          'Violations can result in warnings, feature restrictions, or permanent removal from Kazi, depending on severity.',
        ],
      },
    ],
  },
};

export default function ProviderLegalDoc() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { isOffice } = useUserRole();
  const doc = DOCS[slug];

  if (!doc) return <Navigate to={isOffice ? '/settings' : '/provider-settings'} replace />;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role={isOffice ? 'office' : 'provider'} />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>{doc.title}</div>
      </div>

      <div style={{ padding: '24px 22px 6px' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#1a1a1a', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{doc.title}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, fontWeight: 600, letterSpacing: '0.02em' }}>LAST UPDATED · {doc.updated.toUpperCase()}</div>
      </div>

      <div style={{ padding: '18px 22px 4px' }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#3a3a3a', margin: 0 }}>{doc.intro}</p>
      </div>

      <div style={{ padding: '8px 22px 0' }}>
        {doc.sections.map((s) => (
          <section key={s.heading} style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: '#1a1a1a', letterSpacing: '-0.01em', margin: '0 0 10px', lineHeight: 1.25 }}>{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ fontSize: 13.5, lineHeight: 1.65, color: '#4a4a4a', margin: '0 0 10px' }}>{p}</p>
            ))}
          </section>
        ))}
      </div>

      {isOffice ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}
