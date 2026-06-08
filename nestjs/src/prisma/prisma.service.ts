import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function buildPool(): Pool {
  const connectionString = process.env.DATABASE_URL!;

  // Extract ?schema= (Prisma-specific param that pg ignores at runtime).
  // Pass it as a PostgreSQL startup option — sent synchronously in the
  // connection handshake, so search_path is set before the first query.
  let schema = 'public';
  try {
    const url = new URL(connectionString);
    schema = url.searchParams.get('schema') ?? 'public';
  } catch {
    // malformed URL — fall back to public
  }

  return new Pool({
    connectionString,
    options: `-c search_path="${schema}",public`,
  });
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  readonly client: PrismaClient;

  // Expose Prisma model delegates at the service level for convenience
  get template()   { return this.client.template; }
  get invitation() { return this.client.invitation; }

  constructor() {
    this.pool = buildPool();
    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await this.pool.end();
  }
}
