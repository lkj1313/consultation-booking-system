import { initOrm } from './mikro-orm';

const run = async () => {
  const orm = await initOrm();

  try {
    const result = await orm.getMigrator().createMigration();
    console.log(`Migration created: ${result.fileName}`);
  } finally {
    await orm.close(true);
  }
};

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
