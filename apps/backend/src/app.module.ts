import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildMikroOrmConfig } from './config/mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildMikroOrmConfig(configService),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
