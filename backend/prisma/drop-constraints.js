const { PrismaClient } = require('@prisma/client');
const mainDb = new PrismaClient();

async function main() {
  console.log('Dropping check constraints on PostgreSQL...');
  try {
    await mainDb.$executeRawUnsafe('ALTER TABLE donors DROP CONSTRAINT IF EXISTS donors_blood_type_check;');
    await mainDb.$executeRawUnsafe('ALTER TABLE blood_samples DROP CONSTRAINT IF EXISTS blood_samples_blood_type_check;');
    await mainDb.$executeRawUnsafe('ALTER TABLE blood_samples DROP CONSTRAINT IF EXISTS blood_samples_status_check;');
    await mainDb.$executeRawUnsafe('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
    console.log('Successfully dropped check constraints.');
  } catch (err) {
    console.error('Error dropping constraints:', err.message);
  } finally {
    await mainDb.$disconnect();
  }
}

main();
