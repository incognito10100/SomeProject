const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.create({
    data: {
      name:     'Umer Abdullah',
      email:    'admin@intellectus.com',
      password: hashed,
      role:     'ADMIN',
    }
  })

  await prisma.streak.createMany({
    data: [
      { userId: admin.id, type: 'READING'    },
      { userId: admin.id, type: 'REFLECTION' },
      { userId: admin.id, type: 'TASK'       },
      { userId: admin.id, type: 'COMBINED'   },
    ]
  })

  console.log('✓ Admin created!')
  console.log('  Email:    admin@intellectus.com')
  console.log('  Password: Admin123!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())