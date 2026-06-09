import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM pedidos WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { estado, pago, notas, metodo_pago, cliente, email, telefono, direccion, items, total, subtotal, impuesto } = req.body;

      // Build dynamic update
      const updates = [];
      const params = [];
      let pi = 1;

      if (estado !== undefined) { updates.push(`estado=$${pi++}`); params.push(estado); }
      if (pago !== undefined) { updates.push(`pago=$${pi++}`); params.push(pago); }
      if (notas !== undefined) { updates.push(`notas=$${pi++}`); params.push(notas); }
      if (metodo_pago !== undefined) { updates.push(`metodo_pago=$${pi++}`); params.push(metodo_pago); }
      if (cliente !== undefined) { updates.push(`cliente=$${pi++}`); params.push(cliente); }
      if (email !== undefined) { updates.push(`email=$${pi++}`); params.push(email); }
      if (telefono !== undefined) { updates.push(`telefono=$${pi++}`); params.push(telefono); }
      if (direccion !== undefined) { updates.push(`direccion=$${pi++}`); params.push(direccion); }
      if (items !== undefined) { updates.push(`items=$${pi++}::jsonb`); params.push(JSON.stringify(items)); }
      if (total !== undefined) { updates.push(`total=$${pi++}`); params.push(total); }
      if (subtotal !== undefined) { updates.push(`subtotal=$${pi++}`); params.push(subtotal); }
      if (impuesto !== undefined) { updates.push(`impuesto=$${pi++}`); params.push(impuesto); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      updates.push(`updated_at=NOW()`);
      params.push(id);

      const result = await query(
        `UPDATE pedidos SET ${updates.join(', ')} WHERE id=$${pi} RETURNING *`,
        params
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      await query('DELETE FROM pedidos WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Pedido eliminado' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Pedidos/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
