import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧹 Resetting Kazi to a clean slate...\n')

  // Delete in order of dependencies (children first)
  const reviews = await prisma.review.deleteMany()
  console.log(`  Deleted ${reviews.count} reviews`)

  const bookings = await prisma.booking.deleteMany()
  console.log(`  Deleted ${bookings.count} bookings`)

  const applications = await prisma.application.deleteMany()
  console.log(`  Deleted ${applications.count} applications`)

  const shifts = await prisma.shift.deleteMany()
  console.log(`  Deleted ${shifts.count} shifts`)

  const availability = await prisma.availability.deleteMany()
  console.log(`  Deleted ${availability.count} availability records`)

  const messages = await prisma.message.deleteMany()
  console.log(`  Deleted ${messages.count} messages`)

  const notifications = await prisma.notification.deleteMany().catch(() => ({ count: 0 }))
  console.log(`  Deleted ${notifications.count} notifications`)

  const savedProviders = await prisma.savedProvider.deleteMany().catch(() => ({ count: 0 }))
  console.log(`  Deleted ${savedProviders.count} saved providers`)

  const savedOffices = await prisma.savedOffice.deleteMany().catch(() => ({ count: 0 }))
  console.log(`  Deleted ${savedOffices.count} saved offices`)

  // Reset all provider stats back to defaults
  const providers = await prisma.provider.updateMany({
    data: {
      reliabilityScore: 100,
      avgRating: 0,
      reviewCount: 0,
      shiftsCompleted: 0,
    },
  })
  console.log(`  Reset stats for ${providers.count} providers`)

  console.log('\n✅ Kazi is a fresh slate. Only real user/office/provider accounts remain.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
