import { query } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM cotizaciones ORDER BY created_at DESC');
      return res.status(200).json({ data: result.rows, total: result.rows.length });
    }
    if (req.method === 'POST') {
      const { cliente, cliente_id, items, subtotal, impuesto, total, validez_dias, notas, estado, creado_por } = req.body;
      if (!cliente) return res.status(400).json({ error: 'Cliente es requerido' });
      const codigo = '#C-' + Date.now();
      const result = await query(
        `INSERT INTO cotizaciones (codigo, cliente, cliente_id, items, subtotal, impuesto, total, validez_dias, notas, estado, creado_por) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [codigo, cliente, cliente_id||null, JSON.stringify(items||[]), subtotal||0, impuesto||0, total||0, validez_dias||30, notas||null, estado||'Pendiente', creado_por||null]
      );
      return res.status(201).json({ data: result.rows[0] });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Cotizaciones error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
