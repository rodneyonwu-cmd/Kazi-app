import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Delete all pending applications and their PENDING shifts (these were bad test data)
  const pendingApps = await prisma.application.findMany({
    where: { status: 'PENDING' },
    include: { shift: true },
  })

  console.log(`Found ${pendingApps.length} pending applications to clean up`)

  for (const app of pendingApps) {
    await prisma.application.delete({ where: { id: app.id } })
    console.log(`  Deleted app ${app.id.slice(-8)}`)
  }

  // Delete orphaned PENDING shifts
  const pendingShifts = await prisma.shift.findMany({ where: { status: 'PENDING' } })
  for (const shift of pendingShifts) {
    await prisma.shift.delete({ where: { id: shift.id } }).catch(() => {})
    console.log(`  Deleted shift ${shift.id.slice(-8)}`)
  }

  console.log('\n✅ Cleaned up bad test data')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
