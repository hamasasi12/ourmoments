import { Pool, QueryResultRow } from 'pg';

declare global {
    // eslint-disable-next-line no-var
    var _pgPool: Pool | undefined;
}

function createPool() {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}

// Singleton pool to avoid exhausting connections in dev hot-reload
const pool = globalThis._pgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
    globalThis._pgPool = pool;
}

export default pool;

export async function query<T extends QueryResultRow = Record<string, unknown>>(
    text: string,
    params?: unknown[]
) {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
        console.log('DB query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
}
