import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Find all shifts that were created via booking requests (have a PENDING application)
  // but are incorrectly marked as OPEN
  const apps = await prisma.application.findMany({
    where: { status: 'PENDING' },
    include: { shift: true },
  })

  let fixed = 0
  for (const app of apps) {
    if (app.shift && app.shift.status === 'OPEN') {
      await prisma.shift.update({
        where: { id: app.shift.id },
        data: { status: 'PENDING' },
      })
      fixed++
      console.log(`  Fixed shift ${app.shift.id} → PENDING`)
    }
  }

  console.log(`\n✅ Fixed ${fixed} shift(s) from OPEN to PENDING`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
