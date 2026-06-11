import { query } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM users WHERE activo = TRUE ORDER BY created_at DESC');
      return res.status(200).json({ data: result.rows, total: result.rows.length });
    }
    if (req.method === 'POST') {
      const { email, password, nombre, rol } = req.body;
      if (!email || !nombre) return res.status(400).json({ error: 'Email y nombre son requeridos' });
      let sql = `INSERT INTO users (email, nombre, rol, provider, activo) VALUES ($1, $2, $3, 'credentials', TRUE) RETURNING *`;
      const params = [email, nombre, rol || 'cliente'];
      if (password) {
        const bcrypt = (await import('bcryptjs')).default;
        const hash = await bcrypt.hash(password, 10);
        sql = `INSERT INTO users (email, password_hash, nombre, rol, provider, activo) VALUES ($1, $2, $3, $4, 'credentials', TRUE) RETURNING id, email, nombre, rol, provider, activo, created_at`;
        params.push(rol || 'cliente');
        const result = await query(sql, [email, hash, nombre, rol || 'cliente']);
        return res.status(201).json({ data: result.rows[0] });
      }
      const result = await query(sql, params);
      return res.status(201).json({ data: result.rows[0] });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Users error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
