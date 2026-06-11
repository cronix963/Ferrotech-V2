import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM cotizaciones WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { cliente, cliente_id, items, subtotal, impuesto, total, validez_dias, notas, estado, creado_por } = req.body;

      const updates = [];
      const params = [];
      let pi = 1;

      if (cliente !== undefined) { updates.push(`cliente=$${pi++}`); params.push(cliente); }
      if (cliente_id !== undefined) { updates.push(`cliente_id=$${pi++}`); params.push(cliente_id); }
      if (items !== undefined) { updates.push(`items=$${pi++}::jsonb`); params.push(JSON.stringify(items)); }
      if (total !== undefined) { updates.push(`total=$${pi++}`); params.push(total); }
      if (subtotal !== undefined) { updates.push(`subtotal=$${pi++}`); params.push(subtotal); }
      if (impuesto !== undefined) { updates.push(`impuesto=$${pi++}`); params.push(impuesto); }
      if (validez_dias !== undefined) { updates.push(`validez_dias=$${pi++}`); params.push(validez_dias); }
      if (notas !== undefined) { updates.push(`notas=$${pi++}`); params.push(notas); }
      if (estado !== undefined) { updates.push(`estado=$${pi++}`); params.push(estado); }
      if (creado_por !== undefined) { updates.push(`creado_por=$${pi++}`); params.push(creado_por); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      params.push(id);

      const result = await query(
        `UPDATE cotizaciones SET ${updates.join(', ')} WHERE id=$${pi} RETURNING *`,
        params
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      await query('DELETE FROM cotizaciones WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Cotización eliminada' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Cotizaciones/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
