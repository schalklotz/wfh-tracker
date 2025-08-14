import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create staff members
  const staffData = [
    { fullName: 'Schalk Lotz' },
    { fullName: 'Yvette Gottschalk' },
    { fullName: 'Werner Cloete' },
    { fullName: 'Olan Moodley' },
    { fullName: 'Alexander Esterhuyse' },
    { fullName: 'Iggy Maboshego' },
    { fullName: 'Monray Jacobs' },
    { fullName: 'Sauraav Jayrajh' }
  ]

  const staff = []
  for (const member of staffData) {
    const createdStaff = await prisma.staff.upsert({
      where: { fullName: member.fullName },
      update: {},
      create: member
    })
    staff.push(createdStaff)
  }
  console.log(`Created ${staff.length} staff members`)

  // Create reasons
  const reasonsData = [
    { name: 'Medical' },
    { name: 'Family' },
    { name: 'Contractors at Home' },
    { name: 'Deliveries' },
    { name: 'Load shedding' },
    { name: 'Internet outage' },
    { name: 'Focus work' },
    { name: 'Other' }
  ]

  const reasons = []
  for (const reason of reasonsData) {
    const createdReason = await prisma.reason.upsert({
      where: { name: reason.name },
      update: {},
      create: reason
    })
    reasons.push(createdReason)
  }
  console.log(`Created ${reasons.length} reasons`)

  // Create historic WFH entries
  const historicEntries = [
    // August 2025
    { staffName: 'Schalk Lotz', date: '2025-08-07', reasonName: 'Other' },
    { staffName: 'Sauraav Jayrajh', date: '2025-08-07', reasonName: 'Family' },
    { staffName: 'Yvette Gottschalk', date: '2025-08-13', reasonName: 'Contractors at Home' },
    { staffName: 'Yvette Gottschalk', date: '2025-08-14', reasonName: 'Contractors at Home' },
    
    // June 2025 - Focus work day
    { staffName: 'Schalk Lotz', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Yvette Gottschalk', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Werner Cloete', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Olan Moodley', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Alexander Esterhuyse', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Iggy Maboshego', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Monray Jacobs', date: '2025-06-05', reasonName: 'Focus work' },
    { staffName: 'Sauraav Jayrajh', date: '2025-06-05', reasonName: 'Focus work' },
    
    // June 12, 2025 - Another Focus work day
    { staffName: 'Schalk Lotz', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Yvette Gottschalk', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Werner Cloete', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Olan Moodley', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Alexander Esterhuyse', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Iggy Maboshego', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Monray Jacobs', date: '2025-06-12', reasonName: 'Focus work' },
    { staffName: 'Sauraav Jayrajh', date: '2025-06-12', reasonName: 'Focus work' }
  ]

  let entriesCreated = 0
  for (const entry of historicEntries) {
    const staffMember = staff.find(s => s.fullName === entry.staffName)
    const reason = reasons.find(r => r.name === entry.reasonName)
    
    if (staffMember && reason) {
      await prisma.wfhEntry.upsert({
        where: {
          staffId_date: {
            staffId: staffMember.id,
            date: new Date(entry.date + 'T00:00:00.000Z')
          }
        },
        update: {},
        create: {
          staffId: staffMember.id,
          reasonId: reason.id,
          date: new Date(entry.date + 'T00:00:00.000Z'),
          createdBy: 'system'
        }
      })
      entriesCreated++
    }
  }
  console.log(`Created ${entriesCreated} historic WFH entries`)

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })