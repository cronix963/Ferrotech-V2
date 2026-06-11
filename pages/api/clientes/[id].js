import { query, getPool } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      if (req.query.stats === 'true') {
        const stats = await query(`
          SELECT
            (SELECT COUNT(*) FROM pedidos WHERE cliente_id = $1) as pedidos,
            (SELECT COUNT(*) FROM ventas WHERE cliente_id = $1) as ventas,
            (SELECT COUNT(*) FROM cotizaciones WHERE cliente_id = $1) as cotizaciones
        `, [id]);
        return res.status(200).json(stats.rows[0]);
      }
      const result = await query('SELECT * FROM clientes WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { nombre, email, telefono, direccion, ciudad, nit, empresa, activo } = req.body;
      const result = await query('UPDATE clientes SET nombre=$1, email=$2, telefono=$3, direccion=$4, ciudad=$5, nit=$6, empresa=$7, activo=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
        [nombre, email, telefono, direccion, ciudad, nit, empresa, activo !== undefined ? activo : true, id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const delVentas = await client.query('DELETE FROM ventas WHERE cliente_id = $1', [id]);
        const delCotizaciones = await client.query('DELETE FROM cotizaciones WHERE cliente_id = $1', [id]);
        const delPedidos = await client.query('DELETE FROM pedidos WHERE cliente_id = $1', [id]);
        const delCliente = await client.query('DELETE FROM clientes WHERE id = $1', [id]);
        await client.query('COMMIT');
        if (delCliente.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        return res.status(200).json({
          message: 'Cliente y registros relacionados eliminados',
          deleted: {
            ventas: delVentas.rowCount,
            cotizaciones: delCotizaciones.rowCount,
            pedidos: delPedidos.rowCount,
            cliente: delCliente.rowCount
          }
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Clientes/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
