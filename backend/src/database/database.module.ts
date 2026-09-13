// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME', 'fixhome'),
        ssl:
          configService.get<boolean>('DATABASE_SSL') === true
            ? { rejectUnauthorized: false }
            : false,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // Use migrations in production, synchronize only in development
        synchronize: false,
        logging: false,
        // Migration config
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
      }),
    }),
  ],
})
export class DatabaseModule {}
