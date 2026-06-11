import { query } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await query(
        'SELECT *, created_at AS fecha FROM pagos_cobros ORDER BY created_at DESC'
      );
      return res.status(200).json({ data: result.rows, total: result.rows.length });
    }
    if (req.method === 'POST') {
      const { tipo, referencia_id, referencia_tipo, monto, metodo, concepto, cliente, estado, registrado_por } = req.body;
      if (!tipo || !metodo) return res.status(400).json({ error: 'Tipo y método son requeridos' });
      const result = await query(
        `INSERT INTO pagos_cobros (tipo, referencia_id, referencia_tipo, monto, metodo, concepto, cliente, estado, registrado_por) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [tipo, referencia_id||null, referencia_tipo||null, monto||0, metodo, concepto||null, cliente||null, estado||'Pendiente', registrado_por||null]
      );
      return res.status(201).json({ data: result.rows[0] });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Pagos error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
