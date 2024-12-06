import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'enterprise_management',
  password: 'Pop781216',
  port: 5432,
});

export default pool;