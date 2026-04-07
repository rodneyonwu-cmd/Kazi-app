import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany({
    include: { provider: true, office: true },
  })
  users.forEach(u => {
    console.log(`${u.firstName || 'N/A'} ${u.lastName || ''} (${u.role}) clerkId=${u.clerkId?.slice(-8)}`)
    console.log(`  hasProvider: ${!!u.provider} | hasOffice: ${!!u.office}`)
    if (u.provider) console.log(`  provider.id: ${u.provider.id}`)
    if (u.office) console.log(`  office.id: ${u.office.id} office.name: ${u.office.name}`)
    console.log()
  })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
