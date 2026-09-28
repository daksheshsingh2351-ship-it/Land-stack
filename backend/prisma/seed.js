import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo parcels...');

  for (let i = 0; i < 30; i++) {
    const ulpinId = 123 + i;
    const ulpin = `ULPIN-MH-000${ulpinId}`;
    
    const existing = await prisma.parcel.findUnique({
      where: { ulpin }
    });

    if (!existing) {
      await prisma.parcel.create({
        data: {
          ulpin: ulpin,
          plotNumber: `P-${118 + i}`,
          area: 500.0,
          areaUnit: 'sqm',
          location: 'Pune, Maharashtra',
          village: 'Hinjewadi',
          taluka: 'Haveli',
          district: 'Pune',
          state: 'MH',
          landUse: i % 3 === 0 ? 'COMMERCIAL' : 'RESIDENTIAL',
          status: ulpinId === 123 || ulpinId === 125 ? 'UNDER_REVIEW' : 'VERIFIED',
          riskStatus: ulpinId === 123 || ulpinId === 125 ? 'MEDIUM' : 'LOW',
          ownerships: {
            create: {
              ownerName: i === 0 ? 'Citizen' : `Demo Owner ${i}`,
              ownershipType: 'INDIVIDUAL',
              ownershipStatus: 'CLEAR_TITLE',
              isCurrent: true,
            }
          }
        }
      });
      console.log(`Created parcel ${ulpin}`);
    } else {
      console.log(`Parcel ${ulpin} already exists`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
