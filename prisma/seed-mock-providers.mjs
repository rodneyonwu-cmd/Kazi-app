import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const MOCK_PROS = [
  {
    key: 'mock_alexandra_a',
    firstName: 'Alexandra', lastName: 'A.',
    email: 'mock_alexandra@kazi.mock',
    role: 'assistant',
    credentials: ['RDA', 'EFDA'],
    avgRating: 5.0, reviewCount: 47,
    hourlyRate: 28, shiftsCompleted: 130, reliabilityScore: 96,
    bio: "Bilingual RDA with 6+ years in general and pediatric practices across Houston. Known for keeping operatories spotless and calming anxious patients. Comfortable with Dentrix, Eaglesoft, and digital imaging — can step in on a busy day without needing much ramp-up.",
    software: ['Dentrix', 'Eaglesoft'],
    skills: ['Digital Imaging', 'Pediatric'],
  },
  {
    key: 'mock_sarah_k',
    firstName: 'Sarah', lastName: 'K.',
    email: 'mock_sarah@kazi.mock',
    role: 'hygienist',
    credentials: ['RDH'],
    avgRating: 4.9, reviewCount: 82,
    hourlyRate: 55, shiftsCompleted: 214, reliabilityScore: 99,
    bio: "RDH with 8 years of experience, most recently at a high-volume Katy practice. I specialize in periodontal maintenance and love building rapport with hesitant patients. Reliable, on time, and ready to jump in wherever you need me — I bring my own loupes.",
    software: ['Dentrix'],
    skills: ['Periodontal Maintenance', 'Patient Education'],
  },
  {
    key: 'mock_rachel_m',
    firstName: 'Rachel', lastName: 'M.',
    email: 'mock_rachel@kazi.mock',
    role: 'assistant',
    credentials: ['RDA'],
    avgRating: 4.8, reviewCount: 31,
    hourlyRate: 25, shiftsCompleted: 87, reliabilityScore: 82,
    bio: "3 years as an RDA, mostly in family practices. I'm a fast learner, great with kids, and I keep the ops flowing even on packed days. Open to temp shifts anywhere in the Houston metro — I bring a great attitude and a genuine love for this work.",
    software: ['Open Dental'],
    skills: ['Pediatric', 'Family Practice'],
  },
  {
    key: 'mock_maria_g',
    firstName: 'Maria', lastName: 'G.',
    email: 'mock_maria@kazi.mock',
    role: 'hygienist',
    credentials: ['RDH'],
    avgRating: 5.0, reviewCount: 56,
    hourlyRate: 58, shiftsCompleted: 156, reliabilityScore: 91,
    bio: "RDH with 5 years in both general and pediatric settings. Fluent in Spanish and English, which helps tremendously with Houston's diverse patient base. I take pride in thorough cleanings and clear patient education. Always arrive early and ready to work.",
    software: ['Eaglesoft'],
    skills: ['Bilingual ES/EN', 'Patient Education'],
  },
  {
    key: 'mock_jasmine_p',
    firstName: 'Jasmine', lastName: 'P.',
    email: 'mock_jasmine@kazi.mock',
    role: 'assistant',
    credentials: ['RDA', 'BLS CPR'],
    avgRating: 4.9, reviewCount: 64,
    hourlyRate: 26, shiftsCompleted: 112, reliabilityScore: 94,
    bio: "RDA with a background in orthodontics and general dentistry. I'm known for being calm under pressure and keeping the schedule flowing smoothly. Great chairside manner with nervous patients, and I've worked with Dentrix and Open Dental for the past 4 years.",
    software: ['Dentrix', 'Open Dental'],
    skills: ['Orthodontics', 'Chairside Manner'],
  },
  {
    key: 'mock_david_l',
    firstName: 'David', lastName: 'L.',
    email: 'mock_david@kazi.mock',
    role: 'dentist',
    credentials: ['DDS'],
    avgRating: 5.0, reviewCount: 38,
    hourlyRate: 110, shiftsCompleted: 52, reliabilityScore: 98,
    bio: "General dentist with 12 years of experience, comfortable with everything from routine exams to complex restorative work. I'm licensed in Texas, current on all CE, and available for same-day coverage when your associate calls out. Let's keep your chairs full.",
    software: ['Dentrix', 'Eaglesoft'],
    skills: ['Restorative', 'Same-day Coverage'],
  },
  {
    key: 'mock_chloe_n',
    firstName: 'Chloe', lastName: 'N.',
    email: 'mock_chloe@kazi.mock',
    role: 'front',
    credentials: [],
    avgRating: 4.7, reviewCount: 29,
    hourlyRate: 22, shiftsCompleted: 78, reliabilityScore: 88,
    bio: "5 years at the front desk in busy dental offices across Houston. Fluent in Eaglesoft, Dentrix, and insurance verification workflows. I'm warm with patients, fast with phones, and I'll keep your schedule tight. I pick up coffee for the team on long days.",
    software: ['Eaglesoft', 'Dentrix'],
    skills: ['Insurance Verification', 'Scheduling'],
  },
  {
    key: 'mock_marcus_t',
    firstName: 'Marcus', lastName: 'T.',
    email: 'mock_marcus@kazi.mock',
    role: 'hygienist',
    credentials: ['RDH', 'Local Anesthesia'],
    avgRating: 4.8, reviewCount: 71,
    hourlyRate: 52, shiftsCompleted: 189, reliabilityScore: 93,
    bio: "RDH with 6 years of experience and a special interest in perio therapy. I'm methodical, gentle, and I love educating patients. Comfortable with ultrasonics, hand scaling, and digital charting. Always bring my A-game whether it's a solo office or a 6-op practice.",
    software: ['Open Dental'],
    skills: ['Perio Therapy', 'Ultrasonics'],
  },
  {
    key: 'mock_priya_s',
    firstName: 'Priya', lastName: 'S.',
    email: 'mock_priya@kazi.mock',
    role: 'specialist',
    credentials: ['Dental Assisting Student'],
    avgRating: 4.6, reviewCount: 12,
    hourlyRate: 17, shiftsCompleted: 24, reliabilityScore: 85,
    bio: "Second-year dental assisting student at Houston Community College. Eager to learn, reliable, and respectful of your team's workflow. Available for temp shifts and hands-on experience — I'll ask questions when I need to and stay out of the way when I don't.",
    software: [],
    skills: ['Student', 'Eager Learner'],
  },
  {
    key: 'mock_anthony_b',
    firstName: 'Anthony', lastName: 'B.',
    email: 'mock_anthony@kazi.mock',
    role: 'assistant',
    credentials: ['RDA', 'EFDA', 'Radiology Cert'],
    avgRating: 4.9, reviewCount: 53,
    hourlyRate: 30, shiftsCompleted: 141, reliabilityScore: 97,
    bio: "EFDA with 7 years of chairside experience across general, cosmetic, and surgical practices. I take pride in sterile technique and efficient turnovers. Experienced with Dentrix, Eaglesoft, and intraoral scanners. Ready to walk in and contribute from minute one.",
    software: ['Dentrix', 'Eaglesoft'],
    skills: ['EFDA', 'Sterile Technique', 'Intraoral Scanners'],
  },
]

async function main() {
  console.log('Seeding 10 mock professionals...\n')

  for (const mock of MOCK_PROS) {
    // Upsert User by unique email
    const user = await prisma.user.upsert({
      where: { email: mock.email },
      update: { firstName: mock.firstName, lastName: mock.lastName },
      create: {
        clerkId: mock.key,
        email: mock.email,
        firstName: mock.firstName,
        lastName: mock.lastName,
        role: 'PROVIDER',
      },
    })

    // Upsert Provider by unique userId
    await prisma.provider.upsert({
      where: { userId: user.id },
      update: {
        role: mock.role,
        hourlyRate: mock.hourlyRate,
        bio: mock.bio,
        reliabilityScore: mock.reliabilityScore,
        avgRating: mock.avgRating,
        reviewCount: mock.reviewCount,
        shiftsCompleted: mock.shiftsCompleted,
        software: mock.software,
        skills: mock.skills,
        isMock: true,
        city: 'Houston',
        state: 'TX',
      },
      create: {
        userId: user.id,
        role: mock.role,
        hourlyRate: mock.hourlyRate,
        bio: mock.bio,
        reliabilityScore: mock.reliabilityScore,
        avgRating: mock.avgRating,
        reviewCount: mock.reviewCount,
        shiftsCompleted: mock.shiftsCompleted,
        software: mock.software,
        skills: mock.skills,
        isMock: true,
        city: 'Houston',
        state: 'TX',
      },
    })

    // Upsert credentials
    for (const cred of mock.credentials) {
      const existing = await prisma.credential.findFirst({
        where: { providerId: (await prisma.provider.findUnique({ where: { userId: user.id } })).id, type: cred },
      })
      if (!existing) {
        await prisma.credential.create({
          data: {
            providerId: (await prisma.provider.findUnique({ where: { userId: user.id } })).id,
            type: cred,
            verified: true,
          },
        })
      }
    }

    // Add weekly availability (Mon-Fri)
    const provider = await prisma.provider.findUnique({ where: { userId: user.id } })
    const existingAvail = await prisma.availability.findFirst({ where: { providerId: provider.id } })
    if (!existingAvail) {
      for (const dow of [1, 2, 3, 4, 5]) {
        await prisma.availability.create({
          data: { providerId: provider.id, dayOfWeek: dow, startTime: '8:00 AM', endTime: '5:00 PM' },
        })
      }
    }

    console.log(`  ✓ ${mock.firstName} ${mock.lastName} (${mock.role}) — $${mock.hourlyRate}/hr, ${mock.reliabilityScore}% reliability`)
  }

  // Verify counts
  const totalProviders = await prisma.provider.count()
  const mockCount = await prisma.provider.count({ where: { isMock: true } })
  const realCount = totalProviders - mockCount

  console.log(`\n✅ Done! ${totalProviders} total providers: ${mockCount} mock, ${realCount} real`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
