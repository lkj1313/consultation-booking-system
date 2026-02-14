import { ConfigService } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/postgresql';
import { buildMikroOrmConfig } from '../config/mikro-orm.config';

export const initOrm = async () => {
  const configService = new ConfigService(process.env);
  return MikroORM.init(buildMikroOrmConfig(configService));
};
