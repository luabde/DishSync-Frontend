const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciant seed de la base de dades...');

  // ─────────────────────────────────────────
  // 1. Crear els 3 tipus de TAULES
  // ─────────────────────────────────────────
  const taulaPetita = await prisma.taula.upsert({
    where: { id: 1 },
    update: {},
    create: {
      num_persones: 4,      // capacitat màxima
      span_fila: 1,         // ocupa 1 fila al grid
      span_columna: 1,      // ocupa 1 columna al grid
      min_persones_reserva: 1,
    },
  });

  const taulaMitjana = await prisma.taula.upsert({
    where: { id: 2 },
    update: {},
    create: {
      num_persones: 6,
      span_fila: 2,         // ocupa 2 files al grid
      span_columna: 1,      // ocupa 1 columna al grid
      min_persones_reserva: 4,
    },
  });

  const taulaGran = await prisma.taula.upsert({
    where: { id: 3 },
    update: {},
    create: {
      num_persones: 8,
      span_fila: 3,         // ocupa 3 files al grid
      span_columna: 1,      // ocupa 1 columnes al grid
      min_persones_reserva: 6,
    },
  });

  console.log('Taules creades:');
  console.log(`   - Petit  (1x1): id=${taulaPetita.id}`);
  console.log(`   - Mitjà  (2x1): id=${taulaMitjana.id}`);
  console.log(`   - Gran   (3x1): id=${taulaGran.id}`);

  // ─────────────────────────────────────────
  // 2. Crear el Restaurant de prova
  // ─────────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nom: 'Restaurant de Prova',
      direccio: 'Carrer de Proves, 1',
      horaris: 'Dl-Dv: 13:00-16:00 / 20:00-23:00',
      telefon: '600000000',
      url: 'https://www.restaurantdeprova.cat', //pendent de canvi
      descripcio: 'Restaurant creat automàticament pel seed inicial.',
      estat: 'ACTIU',
      temps_cortesia: 15,
    },
  });

  console.log(`\n Restaurant creat: "${restaurant.nom}" (id=${restaurant.id})`);

  // ─────────────────────────────────────────
  // 3. Crear la Zona 'Menjador Principal'
  // ─────────────────────────────────────────
  const zona = await prisma.zone.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nom: 'Menjador Principal',
      capacitat_max: 50,
      id_restaurant: restaurant.id,
    },
  });

  console.log(`Zona creada: "${zona.nom}" (id=${zona.id})`);

  console.log('\n Seed completat correctament!');
}

main()
  .catch((e) => {
    console.error(' Error durant el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
