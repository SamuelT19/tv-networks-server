const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const types = [
  { id: 1, name: 'Live TV' },
  { id: 2, name: 'Movies' },
  { id: 3, name: 'TV Shows' },
  { id: 4, name: 'Sports' },
];

const categories = [
  { id: 1, name: 'Recommended' },
  { id: 2, name: 'Popular' },
  { id: 3, name: 'Featured' },
  { id: 4, name: 'Favorites' },
  { id: 5, name: 'Watch Later' },
];

async function main() {
  console.log('Seeding types...');
  for (const type of types) {
    await prisma.type.upsert({
      where: { id: type.id },
      update: {},
      create: type,
    });
  }

  console.log('Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
