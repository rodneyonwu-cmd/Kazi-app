import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Check all applications
  const apps = await prisma.application.findMany({
    include: {
      shift: true,
      provider: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  console.log(`\n=== APPLICATIONS (${apps.length}) ===`)
  apps.forEach(a => {
    const name = `${a.provider?.user?.firstName || ''} ${a.provider?.user?.lastName || ''}`.trim()
    console.log(`  [${a.status}] app=${a.id.slice(-8)} shift=${a.shiftId.slice(-8)} provider=${name} date=${a.shift?.date?.toISOString().split('T')[0]} shiftStatus=${a.shift?.status}`)
  })

  // Check all bookings
  const bookings = await prisma.booking.findMany({
    include: { shift: true, provider: { include: { user: { select: { firstName: true, lastName: true } } } } },
  })
  console.log(`\n=== BOOKINGS (${bookings.length}) ===`)
  bookings.forEach(b => {
    const name = `${b.provider?.user?.firstName || ''} ${b.provider?.user?.lastName || ''}`.trim()
    console.log(`  [${b.status}] booking=${b.id.slice(-8)} shift=${b.shiftId.slice(-8)} provider=${name}`)
  })

  // Check all shifts
  const shifts = await prisma.shift.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
  console.log(`\n=== RECENT SHIFTS (${shifts.length}) ===`)
  shifts.forEach(s => {
    console.log(`  [${s.status}] shift=${s.id.slice(-8)} role=${s.role} date=${s.date?.toISOString().split('T')[0]} rate=$${s.hourlyRate}`)
  })

  // Check offices
  const offices = await prisma.office.findMany({ include: { user: { select: { firstName: true, email: true, clerkId: true } } } })
  console.log(`\n=== OFFICES (${offices.length}) ===`)
  offices.forEach(o => {
    console.log(`  id=${o.id.slice(-8)} name=${o.name} user=${o.user?.firstName} clerkId=${o.user?.clerkId?.slice(-8)}`)
  })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
