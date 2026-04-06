import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[rand(0, arr.length - 1)] }

const COMMENTS = [
  "Excellent work! Very professional and punctual.",
  "Great with patients, highly recommend.",
  "Showed up on time and was very thorough.",
  "Wonderful chairside manner, patients loved them.",
  "Very skilled and efficient. Would book again.",
  "Outstanding hygienist, knows their stuff inside and out.",
  "Reliable and friendly. Made the day so much easier.",
  "Did a fantastic job, very detail-oriented.",
  "Super easy to work with. Great communication.",
  "Impressive clinical skills. Will definitely rebook.",
  "Punctual, professional, and a pleasure to have in the office.",
  "Good work overall. A few areas for improvement.",
  "Solid performer, patients had no complaints.",
  "Knowledgeable and efficient. Great addition to the team.",
  "Went above and beyond expectations.",
  "Very thorough with charting and documentation.",
  "Handled a busy schedule with ease. True professional.",
  "Patients specifically asked when they'd be back!",
  "Adapted quickly to our software and workflow.",
  "Dependable and consistent. Exactly what we needed.",
]

const TAGS = [
  ['punctual', 'professional'],
  ['skilled', 'friendly'],
  ['great-with-patients'],
  ['efficient', 'thorough'],
  ['team-player'],
  ['knowledgeable', 'reliable'],
  ['detail-oriented'],
  ['communicative', 'punctual'],
]

async function main() {
  // Get all providers
  const providers = await prisma.provider.findMany({ include: { user: true } })
  console.log(`Found ${providers.length} providers`)

  if (providers.length === 0) {
    console.log('No providers to seed.')
    return
  }

  // Get all offices
  const offices = await prisma.office.findMany()
  console.log(`Found ${offices.length} offices`)

  if (offices.length === 0) {
    console.log('No offices found — need at least one office for bookings/reviews.')
    return
  }

  for (const provider of providers) {
    console.log(`\nSeeding ${provider.user?.firstName || provider.id}...`)

    // 1. Generate random stats
    const reliability = rand(70, 100)
    const numShifts = rand(8, 45)
    const numReviews = rand(3, Math.min(numShifts, 20))
    // Generate individual ratings, weighted towards 4-5
    const ratings = Array.from({ length: numReviews }, () => Math.random() < 0.75 ? rand(4, 5) : rand(3, 5))
    const avgRating = ratings.length > 0 ? parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)) : 0

    await prisma.provider.update({
      where: { id: provider.id },
      data: { reliabilityScore: reliability, avgRating, reviewCount: numReviews, shiftsCompleted: numShifts },
    })
    console.log(`  Reliability: ${reliability}% | Rating: ${avgRating} (${numReviews} reviews) | Shifts: ${numShifts}`)

    // 2. Delete existing availability for this provider, then create new random ones
    await prisma.availability.deleteMany({ where: { providerId: provider.id } })

    // Add weekly recurring availability (3-5 random days)
    const numDays = rand(3, 5)
    const allDays = [0, 1, 2, 3, 4, 5, 6]
    const selectedDays = []
    while (selectedDays.length < numDays) {
      const d = pick(allDays)
      if (!selectedDays.includes(d)) selectedDays.push(d)
    }
    selectedDays.sort()

    const startTimes = ['07:00', '07:30', '08:00', '08:30', '09:00']
    const endTimes = ['16:00', '16:30', '17:00', '17:30', '18:00']

    for (const dow of selectedDays) {
      await prisma.availability.create({
        data: {
          providerId: provider.id,
          dayOfWeek: dow,
          startTime: pick(startTimes),
          endTime: pick(endTimes),
        },
      })
    }
    console.log(`  Availability: ${selectedDays.length} days/week (days: ${selectedDays.join(',')})`)

    // Also add some specific date availability for the next 30 days
    const numSpecificDates = rand(2, 6)
    for (let i = 0; i < numSpecificDates; i++) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + rand(1, 30))
      futureDate.setHours(0, 0, 0, 0)
      await prisma.availability.create({
        data: {
          providerId: provider.id,
          date: futureDate,
          startTime: pick(startTimes),
          endTime: pick(endTimes),
        },
      })
    }
    console.log(`  + ${numSpecificDates} specific dates`)

    // 3. Create completed bookings + reviews
    // First, delete existing reviews and bookings for this provider
    await prisma.review.deleteMany({ where: { providerId: provider.id } })
    const existingBookings = await prisma.booking.findMany({
      where: { providerId: provider.id },
      select: { id: true, shiftId: true },
    })
    if (existingBookings.length > 0) {
      await prisma.booking.deleteMany({ where: { providerId: provider.id } })
      // Also delete the shifts that were created for these bookings
      for (const b of existingBookings) {
        await prisma.shift.deleteMany({ where: { id: b.shiftId } }).catch(() => {})
      }
    }

    const bookingShifts = rand(5, 35)
    const bookingReviews = rand(3, Math.min(bookingShifts, 15))
    const office = pick(offices)

    console.log(`  Creating ${bookingShifts} completed shifts, ${bookingReviews} reviews...`)

    const createdBookingIds = []
    for (let i = 0; i < bookingShifts; i++) {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - rand(7, 180))
      pastDate.setHours(0, 0, 0, 0)

      try {
        // Create a shift for this booking
        const shift = await prisma.shift.create({
          data: {
            officeId: office.id,
            role: provider.role || 'hygienist',
            date: pastDate,
            startTime: pick(startTimes),
            endTime: pick(endTimes),
            hourlyRate: provider.hourlyRate || rand(40, 65),
            status: 'FILLED',
          },
        })

        const booking = await prisma.booking.create({
          data: {
            shiftId: shift.id,
            officeId: office.id,
            providerId: provider.id,
            status: 'COMPLETED',
          },
        })
        createdBookingIds.push(booking.id)
      } catch (err) {
        // Skip if unique constraint or other error
      }
    }

    // Create reviews on some of the bookings
    for (let i = 0; i < Math.min(bookingReviews, createdBookingIds.length); i++) {
      const rating = rand(3, 5)
      const finalRating = Math.random() < 0.75 ? rand(4, 5) : rating

      try {
        await prisma.review.create({
          data: {
            bookingId: createdBookingIds[i],
            officeId: office.id,
            providerId: provider.id,
            rating: finalRating,
            comment: pick(COMMENTS),
            tags: pick(TAGS),
          },
        })
      } catch (err) {
        // Skip duplicates
      }
    }

    console.log(`  Done! ${createdBookingIds.length} bookings, ${bookingReviews} reviews created.`)
  }

  console.log('\n✅ Seeding complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
