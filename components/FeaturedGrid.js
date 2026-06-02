import { FiArrowRight } from 'react-icons/fi';

const items = [
  { icon: '🏗️', bg: '#EBF8FF', title: 'Materiales de Construcción', desc: 'Cemento, ladrillos, varillas y todos los materiales esenciales para tu obra.' },
  { icon: '🔩', bg: '#FFFAF0', title: 'Ferretería General', desc: 'Clavos, tornillos, herramientas manuales, pinturas y accesorios para el hogar.' },
  { icon: '⚡', bg: '#F0FFF4', title: 'Electricidad', desc: 'Cables, interruptores, termomagnéticas, tuberías conduit y material eléctrico.' },
  { icon: '🚿', bg: '#FFF5F5', title: 'Plomería', desc: 'Tuberías PVC, conexiones, llaves de paso, tanques y accesorios sanitarios.' },
];

export default function FeaturedGrid() {
  return (
    <section className="grid grid-cols-2 gap-3 mb-4 lg:gap-[18px]">
      {items.map((item, i) => (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary-100" key={i}>
          <div className="h-[85px] flex items-center justify-center text-2xl lg:h-[100px] lg:text-3xl" style={{ background: item.bg }}>{item.icon}</div>
          <div className="px-3.5 pb-3.5 pt-2.5">
            <h4 className="text-xs text-primary mb-0.5">{item.title}</h4>
            <p className="text-[0.7rem] text-gray-500 leading-relaxed mb-2">{item.desc}</p>
            <button className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-primary bg-transparent text-primary text-[0.68rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-primary hover:text-white">
              Más Información <FiArrowRight size={12} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
