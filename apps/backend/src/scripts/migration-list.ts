import { initOrm } from './mikro-orm';

const run = async () => {
  const orm = await initOrm();

  try {
    const executed = await orm.getMigrator().getExecutedMigrations();
    if (executed.length === 0) {
      console.log('No executed migrations.');
      return;
    }

    executed.forEach((migration) => {
      console.log(`${migration.name} (${migration.executed_at.toISOString()})`);
    });
  } finally {
    await orm.close(true);
  }
};

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
