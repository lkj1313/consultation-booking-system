import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { defineConfig } from '@mikro-orm/postgresql';

export const buildMikroOrmConfig = (configService: ConfigService) =>
  defineConfig({
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 55432),
    user: configService.get<string>('DB_USER', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    dbName: configService.get<string>('DB_NAME', 'consultation_booking'),
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    migrations: {
      path: './dist/migrations',
      pathTs: './src/migrations',
      tableName: 'mikro_orm_migrations',
      transactional: true,
      allOrNothing: true,
    },
    discovery: {
      warnWhenNoEntities: false,
    },
    logger: (message: string) => Logger.log(message, 'MikroORM'),
    debug: configService.get<string>('NODE_ENV') !== 'production',
  });
