import { initOrm } from './mikro-orm';

const run = async () => {
  const orm = await initOrm();

  try {
    await orm.getMigrator().up();
    console.log('Migration up completed.');
  } finally {
    await orm.close(true);
  }
};

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
