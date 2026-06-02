export default function HeroBanner({ stats, loading }) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary-light rounded-lg p-6 text-white mb-5 flex flex-wrap justify-between items-center gap-4 min-h-[130px] sm:min-h-[160px] sm:p-7 lg:px-9 lg:py-8 lg:min-h-[170px]">
      <div className="hero-text">
        <h2 className="text-xl font-bold mb-1 lg:text-2xl">Panel de Administración</h2>
        <p className="text-xs opacity-85 max-w-[380px] leading-relaxed">
          Bienvenido al sistema de gestión integral de FERROTECH.
          Administre usuarios, pedidos, ventas y más desde un solo lugar.
        </p>
      </div>
      <div className="hidden sm:flex gap-5">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-accent-light lg:text-3xl">
            {loading ? '...' : stats.usuarios}
          </div>
          <div className="text-[0.62rem] opacity-70">Usuarios</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-accent-light lg:text-3xl">
            {loading ? '...' : stats.productos}
          </div>
          <div className="text-[0.62rem] opacity-70">Productos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-accent-light lg:text-3xl">
            {loading ? '...' : stats.clientes}
          </div>
          <div className="text-[0.62rem] opacity-70">Clientes</div>
        </div>
      </div>
    </div>
  );
}
