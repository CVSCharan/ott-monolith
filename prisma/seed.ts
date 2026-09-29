import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)
const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt:${salt}:${derivedKey.toString('hex')}`
}

async function main() {
  console.log('🌱 Starting StreamForge database seed...')

  // ── 1. Seed Plans ──────────────────────────────────────────
  console.log('📦 Seeding subscription plans...')
  const freePlan = await prisma.plan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      pricePaise: 0,
      maxProfiles: 1,
      maxStreams: 1,
      maxQualityP: 480,
      maxTierRank: 0,
    },
  })

  const standardPlan = await prisma.plan.upsert({
    where: { slug: 'standard' },
    update: {},
    create: {
      name: 'Standard',
      slug: 'standard',
      pricePaise: 14900, // ₹149.00
      maxProfiles: 3,
      maxStreams: 2,
      maxQualityP: 720,
      maxTierRank: 1,
    },
  })

  const premiumPlan = await prisma.plan.upsert({
    where: { slug: 'premium' },
    update: {},
    create: {
      name: 'Premium',
      slug: 'premium',
      pricePaise: 24900, // ₹249.00
      maxProfiles: 5,
      maxStreams: 4,
      maxQualityP: 1080,
      maxTierRank: 2,
    },
  })

  console.log('✓ Plans seeded:', [freePlan.slug, standardPlan.slug, premiumPlan.slug].join(', '))

  // ── 2. Seed Admin Account ──────────────────────────────────
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'StreamForge_Admin_DevPassword_2026!'
  console.log('👤 Seeding admin account (admin@streamforge.dev)...')

  const adminAccount = await prisma.account.upsert({
    where: { email: 'admin@streamforge.dev' },
    update: {
      planId: premiumPlan.id,
    },
    create: {
      email: 'admin@streamforge.dev',
      passwordHash: await hashPassword(adminPassword),
      role: 'admin',
      planId: premiumPlan.id,
      profiles: {
        create: [
          {
            name: 'Admin',
            isKids: false,
          },
          {
            name: 'Kids Profile',
            isKids: true,
          },
        ],
      },
    },
  })

  console.log('✓ Admin account seeded:', adminAccount.email)

  // ── 3. Seed Genres ─────────────────────────────────────────
  console.log('🏷️ Seeding genres...')
  const genreNames = ['Animation', 'Action', 'Sci-Fi', 'Fantasy', 'Comedy', 'Family', 'Horror', 'Drama']
  const genresMap: Record<string, string> = {}

  for (const name of genreNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const g = await prisma.genre.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
    genresMap[name] = g.id
  }

  // ── 4. Seed Sample Titles ──────────────────────────────────
  console.log('🎬 Seeding sample catalog titles...')
  const sampleTitles = [
    {
      slug: 'big-buck-bunny',
      title: 'Big Buck Bunny',
      type: 'movie',
      synopsis: 'A large, lovable rabbit seeks poetic justice when bullied by forest troublemakers.',
      description: 'Big Buck Bunny tells the story of a giant, gentle rabbit with a heart bigger than his ears. When woodland bullies torment the forest creatures, Bunny engineers an ingenious retribution.',
      releaseYear: 2024,
      durationSeconds: 5520,
      minAge: 0,
      minTierRank: 0,
      status: 'published',
      dominantColor: '#1d3527',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      likeCount: 2450,
      playCount: 15400,
    },
    {
      slug: 'tears-of-steel',
      title: 'Tears of Steel',
      type: 'movie',
      synopsis: 'In a dystopian neo-Amsterdam, scientists reenact a fateful memory to avert a robotic apocalypse.',
      description: 'Set in a dystopian future where Amsterdam has become the epicenter of a robot uprising, scientists and cybernetic soldiers gather at the Oude Kerk to project past memories.',
      releaseYear: 2025,
      durationSeconds: 6300,
      minAge: 13,
      minTierRank: 1,
      status: 'published',
      dominantColor: '#1a2238',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      likeCount: 1980,
      playCount: 9800,
    },
    {
      slug: 'sintel',
      title: 'Sintel: The Dragon’s Quest',
      type: 'movie',
      synopsis: 'A fierce lone warrior braves freezing tundras to rescue her baby dragon companion.',
      description: 'Driven by devotion, a solitary wanderer named Sintel traverses harsh desert ruins and snowy peaks in search of Scales, an orphaned baby dragon.',
      releaseYear: 2024,
      durationSeconds: 4920,
      minAge: 13,
      minTierRank: 2,
      status: 'published',
      dominantColor: '#341d1a',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1920&q=80',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      likeCount: 3120,
      playCount: 18200,
    },
  ]

  for (const t of sampleTitles) {
    await prisma.title.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    })
  }

  console.log('✓ Sample catalog seeded successfully.')
  console.log('✨ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
