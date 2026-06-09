import { query } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const url = process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET';
    const result = await query('SELECT 1 as test');
    return res.status(200).json({ db: 'connected', env: url, result: result.rows });
  } catch (err) {
    return res.status(500).json({ db: 'failed', error: err.message, env: process.env.DATABASE_URL ? 'SET' : 'NOT SET' });
  }
}
