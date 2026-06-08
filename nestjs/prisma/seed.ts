import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
let schema = 'public';
try {
  const url = new URL(connectionString);
  schema = url.searchParams.get('schema') ?? 'public';
} catch { /* ignore */ }

const pool = new Pool({
  connectionString,
  options: `-c search_path="${schema}",public`,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = [
    {
      name: 'Garden Romance',
      slug: 'garden-romance',
      thumbnail: 'https://placehold.co/400x300/d4a7b0/ffffff?text=Garden+Romance',
      category: 'Floral',
      previewImage: 'https://placehold.co/800x600/d4a7b0/ffffff?text=Garden+Romance+Preview',
      isPremium: false,
    },
    {
      name: 'Midnight Elegance',
      slug: 'midnight-elegance',
      thumbnail: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Midnight+Elegance',
      category: 'Modern',
      previewImage: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Midnight+Elegance+Preview',
      isPremium: true,
    },
    {
      name: 'Rustic Charm',
      slug: 'rustic-charm',
      thumbnail: 'https://placehold.co/400x300/8b6f47/ffffff?text=Rustic+Charm',
      category: 'Rustic',
      previewImage: 'https://placehold.co/800x600/8b6f47/ffffff?text=Rustic+Charm+Preview',
      isPremium: false,
    },
    {
      name: 'Beach Bliss',
      slug: 'beach-bliss',
      thumbnail: 'https://placehold.co/400x300/5bc0eb/ffffff?text=Beach+Bliss',
      category: 'Beach',
      previewImage: 'https://placehold.co/800x600/5bc0eb/ffffff?text=Beach+Bliss+Preview',
      isPremium: false,
    },
    {
      name: 'Classic White',
      slug: 'classic-white',
      thumbnail: 'https://placehold.co/400x300/f5f5f5/333333?text=Classic+White',
      category: 'Classic',
      previewImage: 'https://placehold.co/800x600/f5f5f5/333333?text=Classic+White+Preview',
      isPremium: false,
    },
    {
      name: 'Golden Luxe',
      slug: 'golden-luxe',
      thumbnail: 'https://placehold.co/400x300/c9a84c/ffffff?text=Golden+Luxe',
      category: 'Luxury',
      previewImage: 'https://placehold.co/800x600/c9a84c/ffffff?text=Golden+Luxe+Preview',
      isPremium: true,
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  console.log('Seeded 6 templates.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
