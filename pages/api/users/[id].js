import { query, getPool } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      if (req.query.stats === 'true') {
        const stats = await query(`
          SELECT
            (SELECT COUNT(*) FROM clientes WHERE user_id = $1) as clientes,
            (SELECT COUNT(*) FROM pedidos WHERE creado_por = $1) as pedidos,
            (SELECT COUNT(*) FROM ventas WHERE vendedor_id = $1) as ventas,
            (SELECT COUNT(*) FROM compras WHERE creado_por = $1) as compras,
            (SELECT COUNT(*) FROM cotizaciones WHERE creado_por = $1) as cotizaciones,
            (SELECT COUNT(*) FROM pagos_cobros WHERE registrado_por = $1) as pagos_cobros
        `, [id]);
        return res.status(200).json(stats.rows[0]);
      }
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { nombre, email, rol, activo } = req.body;
      const result = await query('UPDATE users SET nombre=$1, email=$2, rol=$3, activo=$4, updated_at=NOW() WHERE id=$5 RETURNING *', [nombre, email, rol, activo !== undefined ? activo : true, id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const updClientes = await client.query('UPDATE clientes SET user_id = NULL, updated_at = NOW() WHERE user_id = $1', [id]);
        const updPedidos = await client.query('UPDATE pedidos SET creado_por = NULL, updated_at = NOW() WHERE creado_por = $1', [id]);
        const updVentas = await client.query('UPDATE ventas SET vendedor_id = NULL WHERE vendedor_id = $1', [id]);
        const updCompras = await client.query('UPDATE compras SET creado_por = NULL WHERE creado_por = $1', [id]);
        const updCotizaciones = await client.query('UPDATE cotizaciones SET creado_por = NULL WHERE creado_por = $1', [id]);
        const updPagos = await client.query('UPDATE pagos_cobros SET registrado_por = NULL WHERE registrado_por = $1', [id]);
        const delUser = await client.query('DELETE FROM users WHERE id = $1', [id]);
        await client.query('COMMIT');
        if (delUser.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.status(200).json({
          message: 'Usuario y referencias eliminados',
          updated: {
            clientes: updClientes.rowCount,
            pedidos: updPedidos.rowCount,
            ventas: updVentas.rowCount,
            compras: updCompras.rowCount,
            cotizaciones: updCotizaciones.rowCount,
            pagos_cobros: updPagos.rowCount
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
    console.error('[API] Users/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
