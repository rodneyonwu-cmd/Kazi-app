import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[rand(0, arr.length - 1)] }

const startTimes = ['07:00', '07:30', '08:00', '08:30', '09:00']
const endTimes = ['16:00', '16:30', '17:00', '17:30', '18:00']

async function main() {
  const providers = await prisma.provider.findMany({ include: { user: true } })
  console.log(`Found ${providers.length} providers\n`)

  for (const provider of providers) {
    const name = provider.user?.firstName || provider.id

    // Weekly recurring availability (3-5 random days)
    const numDays = rand(3, 5)
    const allDays = [0, 1, 2, 3, 4, 5, 6]
    const selectedDays = []
    while (selectedDays.length < numDays) {
      const d = pick(allDays)
      if (!selectedDays.includes(d)) selectedDays.push(d)
    }
    selectedDays.sort()

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

    // A few specific upcoming dates
    const numSpecific = rand(2, 5)
    for (let i = 0; i < numSpecific; i++) {
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

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    console.log(`  ${name}: ${selectedDays.map(d => dayNames[d]).join(', ')} + ${numSpecific} specific dates`)
  }

  console.log('\n✅ Availability restored.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
