import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const result = await query(
        'SELECT *, created_at AS fecha FROM pagos_cobros WHERE id = $1', [id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { tipo, referencia_id, referencia_tipo, monto, metodo, concepto, cliente, estado, registrado_por } = req.body;

      const updates = [];
      const params = [];
      let pi = 1;

      if (tipo !== undefined) { updates.push(`tipo=$${pi++}`); params.push(tipo); }
      if (referencia_id !== undefined) { updates.push(`referencia_id=$${pi++}`); params.push(referencia_id); }
      if (referencia_tipo !== undefined) { updates.push(`referencia_tipo=$${pi++}`); params.push(referencia_tipo); }
      if (monto !== undefined) { updates.push(`monto=$${pi++}`); params.push(monto); }
      if (metodo !== undefined) { updates.push(`metodo=$${pi++}`); params.push(metodo); }
      if (concepto !== undefined) { updates.push(`concepto=$${pi++}`); params.push(concepto); }
      if (cliente !== undefined) { updates.push(`cliente=$${pi++}`); params.push(cliente); }
      if (estado !== undefined) { updates.push(`estado=$${pi++}`); params.push(estado); }
      if (registrado_por !== undefined) { updates.push(`registrado_por=$${pi++}`); params.push(registrado_por); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      params.push(id);
      const result = await query(
        `UPDATE pagos_cobros SET ${updates.join(', ')} WHERE id=$${pi} RETURNING *`,
        params
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      await query('DELETE FROM pagos_cobros WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Registro eliminado' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Pagos/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
