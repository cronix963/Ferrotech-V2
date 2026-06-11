import { useRouter } from 'next/router';

export default function Factura() {
  const router = useRouter();
  const { codigo, cliente, items, total, metodo_pago } = router.query;

  const parsedItems = items ? JSON.parse(decodeURIComponent(items)) : [];
  const totalNum = parseFloat(total) || 0;
  const subtotal = totalNum / 1.13;
  const impuesto = totalNum - subtotal;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl max-w-[500px] w-full shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/images/productos/ferrotech_logo.svg" alt="FERROTECH" className="h-14 w-auto mx-auto" />
          <div className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Factura de Venta</div>
        </div>

        <div className="space-y-1 text-xs text-gray-600 mb-4 border-b border-gray-100 pb-4">
          <div className="flex justify-between"><span>Pedido:</span><span className="font-bold">{codigo || 'N/A'}</span></div>
          <div className="flex justify-between"><span>Fecha:</span><span>{new Date().toLocaleDateString('es-BO')}</span></div>
          <div className="flex justify-between"><span>Cliente:</span><span>{cliente || 'N/A'}</span></div>
          <div className="flex justify-between"><span>Método:</span><span className="font-semibold">{metodo_pago || 'N/A'}</span></div>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500">Producto</th>
              <th className="text-center py-2 text-gray-500">Cant.</th>
              <th className="text-right py-2 text-gray-500">P.U.</th>
              <th className="text-right py-2 text-gray-500">Subt.</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{item.nombre}</td>
                <td className="py-2 text-center">{item.cantidad}</td>
                <td className="py-2 text-right">Bs{Number(item.precio).toFixed(2)}</td>
                <td className="py-2 text-right font-medium">Bs{(item.cantidad * item.precio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-200 pt-3 space-y-1 text-xs">
          <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>Bs{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>IVA (13%):</span><span>Bs{impuesto.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-bold text-primary border-t border-gray-200 pt-2"><span>TOTAL:</span><span>Bs{totalNum.toFixed(2)}</span></div>
        </div>

        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-semibold border border-green-200">✅ Pago Confirmado</div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-primary text-white border-0 cursor-pointer hover:bg-primary-light">🖨 Imprimir</button>
          <button onClick={() => router.push('/tienda')} className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-white text-gray-600 border border-gray-200 cursor-pointer hover:bg-gray-50">Volver a la Tienda</button>
        </div>
      </div>
    </div>
  );
}
