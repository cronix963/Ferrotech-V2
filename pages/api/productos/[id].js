import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT p.*, c.nombre AS categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { nombre, descripcion, categoria_id, categoria, precio, precio_compra, stock, stock_minimo, unidad, codigo_barras, codigo_interno, proveedor_id, icono, imagen, activo } = req.body;
      const result = await query(
        `UPDATE productos SET nombre=$1, descripcion=$2, categoria_id=$3, categoria=$4, precio=$5, precio_compra=$6, stock=$7, stock_minimo=$8, unidad=$9, codigo_barras=$10, codigo_interno=$11, proveedor_id=$12, icono=$13, imagen=$14, activo=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
        [nombre, descripcion||null, categoria_id||null, categoria||null, precio, precio_compra||0, stock||0, stock_minimo||5, unidad||'unidad', codigo_barras||null, codigo_interno||null, proveedor_id||null, icono||'📦', imagen||null, activo !== undefined ? activo : true, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      const result = await query('DELETE FROM productos WHERE id = $1', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.status(200).json({ message: 'Producto eliminado permanentemente' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Productos/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
