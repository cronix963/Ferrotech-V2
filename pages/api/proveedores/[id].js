import { query, getPool } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      if (req.query.stats === 'true') {
        const stats = await query('SELECT COUNT(*) as compras FROM compras WHERE proveedor_id = $1', [id]);
        return res.status(200).json(stats.rows[0]);
      }
      const result = await query('SELECT * FROM proveedores WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { nombre, contacto, email, telefono, direccion, ciudad, notas, activo } = req.body;
      const result = await query('UPDATE proveedores SET nombre=$1, contacto=$2, email=$3, telefono=$4, direccion=$5, ciudad=$6, notas=$7, activo=$8 WHERE id=$9 RETURNING *',
        [nombre, contacto, email, telefono, direccion, ciudad, notas, activo !== undefined ? activo : true, id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const delCompras = await client.query('DELETE FROM compras WHERE proveedor_id = $1', [id]);
        const updProductos = await client.query('UPDATE productos SET proveedor_id = NULL, updated_at = NOW() WHERE proveedor_id = $1', [id]);
        const delProveedor = await client.query('DELETE FROM proveedores WHERE id = $1', [id]);
        await client.query('COMMIT');
        if (delProveedor.rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        return res.status(200).json({
          message: 'Proveedor y registros relacionados eliminados',
          deleted: {
            compras: delCompras.rowCount,
            productos_desvinculados: updProductos.rowCount,
            proveedor: delProveedor.rowCount
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
    console.error('[API] Proveedores/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
