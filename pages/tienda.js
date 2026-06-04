import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';
import { useProductosStore } from '../stores/productos.store';
import pb from '../lib/pocketbase';
import { FiSearch, FiShoppingCart, FiX, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';

export default function Tienda() {
  const router = useRouter();
  const { isAuthenticated, user, hydrating, rol, logout } = useAuthStore();
  const { fetchAll, items: storeProducts } = useProductosStore();
  const [userName, setUserName] = useState('Cliente');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [detailProd, setDetailProd] = useState(null);
  const [form, setForm] = useState({ nombre:'', email:'', direccion:'', metodo:'Efectivo' });
  const [submitting, setSubmitting] = useState(false);

  /* ── Products from PocketBase ── */
  const products = storeProducts
    .filter((p) => p.estado !== 'Inactivo')
    .map((p) => ({
      id: p.id,
      name: p.nombre,
      cat: p.categoria,
      price: p.precio,
      stock: p.stock,
      icon: p.icono || '📦',
      desc: p.descripcion || '',
    }));
  const categories = ['Todas', ...new Set(products.map((p) => p.cat))];

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (user?.nombre) setUserName(user.nombre);
    else if (user?.email) setUserName(user.email);
  }, [user]);

  useEffect(() => {
    if (!hydrating && (!isAuthenticated || rol !== 'cliente')) {
      router.replace('/');
    }
  }, [hydrating, isAuthenticated, rol, router]);

  useEffect(() => {
    if (!hydrating && isAuthenticated) {
      const saved = localStorage.getItem('ferrotech_cliente_nombre');
      if (saved) setForm(f => ({...f, nombre: saved}));
    }
  }, [hydrating, isAuthenticated]);

  if (hydrating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || rol !== 'cliente') return null;

  const filtered = products.filter(p => {
    const mc = cat === 'Todas' || p.cat === cat;
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const getQty = (id) => quantities[id] || 1;
  const setQty = (id, v) => setQuantities(prev => ({...prev, [id]: Math.max(1, Math.min(v, products.find(p => p.id === id)?.stock || 99))}));

  const addToCart = (p) => {
    const q = getQty(p.id);
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, qty: i.qty + q} : i);
      return [...prev, {...p, qty: q}];
    });
    setQuantities(prev => ({...prev, [p.id]: 1}));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const n = i.qty + delta;
      return n <= 0 ? null : {...i, qty: n};
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCheckout = async () => {
    const orderCode = '#P-' + Date.now().toString(36).toUpperCase();
    setSubmitting(true);
    try {
      await pb.collection('pedidos').create({
        codigo: orderCode,
        cliente: form.nombre,
        email: form.email,
        direccion: form.direccion,
        items: cart.map((i) => ({
          producto_id: i.id,
          nombre: i.name,
          cantidad: i.qty,
          precio: i.price,
        })),
        total: cartTotal,
        tipo: 'tienda',
        estado: 'Pendiente',
        pago: form.metodo,
        creadoPor: user?.id,
      });

      setLastOrder({ num: orderCode, total: cartTotal, items: [...cart] });
      setOrderDone(true);
      setCartOpen(false);
      setCheckoutOpen(false);
      setCart([]);
      localStorage.setItem('ferrotech_cliente_nombre', form.nombre);
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-primary px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-50 sm:px-6 max-sm:px-3 max-sm:py-2.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg cursor-pointer" onClick={() => router.push('/tienda')}>
          <span className="bg-white/15 w-8 h-8 rounded-lg flex items-center justify-center">🔧</span> FERROTECH
        </div>
        <div className="flex-1 max-w-[500px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={15} />
          <input placeholder="Buscá productos..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2.5 pl-9 pr-3.5 border-0 rounded-lg text-sm bg-white/15 text-white outline-none placeholder:text-white/40 focus:bg-white/25 max-sm:text-xs"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white py-1 pl-1 pr-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200" onClick={handleLogout}>
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-xs text-white">{userName.charAt(0).toUpperCase()}</div>
            <div>
              <span className="text-xs font-medium block max-sm:hidden">{userName}</span>
              <span className="text-[0.6rem] text-white/40 block max-sm:hidden">Cliente</span>
            </div>
          </div>
          <button className="relative bg-white/10 border-0 text-white w-9 h-9 rounded-lg cursor-pointer flex items-center justify-center text-lg transition-all duration-200 hover:bg-white/20" onClick={() => setCartOpen(true)}>
            <FiShoppingCart />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-accent text-white w-5 h-5 rounded-full text-[0.6rem] font-bold flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="flex gap-2 px-6 py-3 bg-white border-b border-gray-200 overflow-x-auto max-sm:px-3">
        {categories.map(c => (
          <button key={c}
            className={`shrink-0 px-[18px] py-1.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap ${
              cat === c ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-light hover:text-primary'
            }`}
            onClick={() => setCat(c)}
          >{c}</button>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="flex-1 px-6 py-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 max-w-[1400px] mx-auto w-full max-sm:px-3 max-sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-sm:gap-2.5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400">No se encontraron productos 😕</div>
        ) : filtered.map(p => (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 flex flex-col hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-100 cursor-pointer" key={p.id} onClick={() => setDetailProd(p)}>
            <div className="h-[140px] bg-gray-50 flex items-center justify-center text-4xl border-b border-gray-100">{p.icon}</div>
            <div className="px-4 pb-4 pt-3.5 flex-1 flex flex-col">
              <span className="text-[0.6rem] uppercase tracking-wide text-primary-light font-semibold mb-0.5">{p.cat}</span>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">{p.name}</h4>
              <div className="text-lg font-bold text-primary mb-1">Bs{p.price.toFixed(2)}</div>
              <div className={`text-[0.68rem] mb-3 ${
                p.stock > 10 ? 'text-success' : p.stock > 0 ? 'text-warning' : 'text-danger'
              }`}>
                {p.stock > 10 ? '✔ En stock' : p.stock > 0 ? `⚠ Solo ${p.stock} uds` : '✗ Sin stock'}
              </div>
              {/* Quantity selector */}
              <div className="flex items-center gap-2 mb-2">
                {p.stock > 0 && (
                  <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5">
                    <button className="w-[26px] h-[26px] border-0 bg-gray-100 rounded cursor-pointer text-xs font-semibold flex items-center justify-center"
                      onClick={() => setQty(p.id, getQty(p.id) - 1)}
                    ><FiMinus size={12} /></button>
                    <span className="text-xs font-semibold min-w-[20px] text-center">{getQty(p.id)}</span>
                    <button className="w-[26px] h-[26px] border-0 bg-gray-100 rounded cursor-pointer text-xs font-semibold flex items-center justify-center"
                      onClick={() => setQty(p.id, getQty(p.id) + 1)}
                      disabled={getQty(p.id) >= p.stock}
                    ><FiPlus size={12} /></button>
                  </div>
                )}
              </div>
              <button
                className={`mt-auto w-full py-2 border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  cart.some(i => i.id === p.id) ? 'bg-success text-white hover:bg-success' : 'bg-primary text-white hover:bg-primary-light'
                }`}
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
              >
                {cart.some(i => i.id === p.id) ? <><FiCheck /> Agregado ({getQty(p.id)})</> : <><FiShoppingCart /> Agregar {getQty(p.id) > 1 ? `×${getQty(p.id)}` : ''}</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CART OVERLAY */}
      <div className={`fixed inset-0 bg-black/40 z-[200] transition-opacity duration-300 ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setCartOpen(false)} />

      {/* CART SIDEBAR */}
      <aside className={`fixed top-0 right-0 bottom-0 w-[380px] max-w-full bg-white z-[201] flex flex-col shadow-[-8px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-300 max-sm:w-screen ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
          <h3 className="text-base text-primary">🛒 Tu Carrito ({cartCount})</h3>
          <button className="w-8 h-8 border-0 rounded-md bg-gray-100 cursor-pointer flex items-center justify-center text-lg text-gray-500" onClick={() => setCartOpen(false)}><FiX /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">El carrito está vacío</div>
          ) : cart.map(i => (
            <div className="flex gap-3 py-3 border-b border-gray-100" key={i.id}>
              <div className="w-[50px] h-[50px] bg-gray-50 rounded-lg flex items-center justify-center shrink-0 text-xl">{i.icon}</div>
              <div className="flex-1">
                <h5 className="text-xs font-semibold text-gray-700">{i.name}</h5>
                <div className="text-xs text-primary font-semibold">Bs{(i.price * i.qty).toFixed(2)}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <button className="w-[26px] h-[26px] border border-gray-200 rounded cursor-pointer flex items-center justify-center text-xs text-gray-600 bg-white"
                    onClick={() => updateQty(i.id, -1)}><FiMinus /></button>
                  <span className="text-xs font-semibold min-w-[20px] text-center">{i.qty}</span>
                  <button className="w-[26px] h-[26px] border border-gray-200 rounded cursor-pointer flex items-center justify-center text-xs text-gray-600 bg-white"
                    onClick={() => updateQty(i.id, 1)}
                    disabled={i.qty >= (products.find(p => p.id === i.id)?.stock || 99)}><FiPlus /></button>
                </div>
              </div>
              <button className="bg-none border-0 text-gray-400 cursor-pointer text-xs self-start hover:text-danger" onClick={() => removeFromCart(i.id)}><FiX /></button>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-xl font-bold text-primary">Bs{cartTotal.toFixed(2)}</span>
          </div>
          <button className="w-full py-3 border-0 rounded-lg bg-accent text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cart.length === 0} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>
            Proceder al Pago
          </button>
        </div>
      </aside>

      {/* CHECKOUT */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 max-w-[480px] w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg text-primary mb-1">📄 Finalizar Pedido</h3>
            <p className="text-xs text-gray-500 mb-5">Completá tus datos para procesar la compra</p>
            <div className="text-2xl font-bold text-primary text-center py-4 bg-gray-50 rounded-lg mb-5">
              Total: Bs{cartTotal.toFixed(2)}
              <small className="block text-[0.7rem] font-normal text-gray-500">{cart.length} producto{cart.length !== 1 ? 's' : ''}</small>
            </div>
            <div className="mb-3.5">
              <label className="block text-xs text-gray-600 font-semibold mb-1.5">Nombre completo</label>
              <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Tu nombre"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light bg-white" />
            </div>
            <div className="mb-3.5">
              <label className="block text-xs text-gray-600 font-semibold mb-1.5">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="tu@email.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light bg-white" />
            </div>
            <div className="mb-3.5">
              <label className="block text-xs text-gray-600 font-semibold mb-1.5">Dirección de entrega</label>
              <input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Calle, N°, Zona"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light bg-white" />
            </div>
            <div className="mb-3.5">
              <label className="block text-xs text-gray-600 font-semibold mb-1.5">Método de pago</label>
              <select value={form.metodo} onChange={e => setForm({...form, metodo: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none bg-white focus:border-primary-light">
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>QR</option>
                <option>Transferencia</option>
              </select>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                onClick={() => setCheckoutOpen(false)}>Cancelar</button>
              <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-accent text-white border-0 hover:brightness-110"
                onClick={handleCheckout} disabled={!form.nombre || !form.email || !form.direccion || submitting}>
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {detailProd && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5" onClick={() => setDetailProd(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-5xl text-center mb-4">{detailProd.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 text-center">{detailProd.name}</h3>
            <span className="text-[0.65rem] uppercase tracking-wide text-primary-light font-semibold block text-center mb-2">{detailProd.cat}</span>
            <div className="text-2xl font-bold text-primary text-center mb-3">Bs{detailProd.price.toFixed(2)}</div>
            <div className={`text-center text-sm mb-4 ${detailProd.stock > 10 ? 'text-success' : detailProd.stock > 0 ? 'text-warning' : 'text-danger'}`}>
              {detailProd.stock > 10 ? '✔ En stock' : detailProd.stock > 0 ? `⚠ Solo ${detailProd.stock} uds` : '✗ Sin stock'}
            </div>
            {detailProd.desc && (
              <p className="text-sm text-gray-600 mb-4 text-center">{detailProd.desc}</p>
            )}
            <button className="w-full py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-all"
              onClick={() => { addToCart(detailProd); setDetailProd(null) }}
              disabled={detailProd.stock === 0}>
              {detailProd.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
            <button className="w-full mt-2 py-2 text-gray-500 text-xs hover:text-gray-700"
              onClick={() => setDetailProd(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* CONFIRMATION TOAST */}
      {orderDone && lastOrder && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success text-white px-7 py-4 rounded-xl font-semibold z-[400] shadow-[0_8px_24px_rgba(56,161,105,0.3)] text-center max-w-[400px]">
          ✅ ¡Pedido {lastOrder.num} confirmado!<br />
          <span className="text-xs opacity-90">
            Total: Bs{lastOrder.total.toFixed(2)} — {lastOrder.items.length} producto{lastOrder.items.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
