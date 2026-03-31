import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // NUEVO

const PerfilSocio = () => {
  const [reservas, setReservas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate(); // NUEVO

  useEffect(() => {
    const cargarDatos = async () => {
      // NUEVO: Protección de ruta
      // Si el usuario no está autenticado, lo mandamos al login
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        // 1. Cargar info del socio
        const qSocio = query(collection(db, "socios"), where("uid", "==", auth.currentUser.uid));
        const snapSocio = await getDocs(qSocio);
        // Corregido: snapSocio.docs[0] en lugar de snapSocio.doc[0]
        if (!snapSocio.empty) setUsuario(snapSocio.docs[0].data());

        // 2. Cargar sus reservas (La colección global que creamos)
        const qRes = query(collection(db, "reservas_globales"), where("uid", "==", auth.currentUser.uid));
        const snapRes = await getDocs(qRes);
        const lista = snapRes.docs.map(d => ({ id: d.id, ...d.data() }));
        setReservas(lista);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [navigate]); // Añadimos navigate a las dependencias

  const actualizarAcompañantes = async (reserva, nuevoNum) => {
    if (nuevoNum < 0 || nuevoNum > 4) return;
    
    try {
      // A. Actualizar en la Reserva Global
      await updateDoc(doc(db, "reservas_globales", reserva.id), {
        acompañantes: nuevoNum
      });

      // B. Actualizar en la Subcolección Original
      await updateDoc(doc(db, reserva.pathOriginal, reserva.reservaIdOriginal), {
        acompañantes: nuevoNum
      });

      setReservas(prev => prev.map(r => r.id === reserva.id ? { ...r, acompañantes: nuevoNum } : r));
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("No se pudo actualizar el número de acompañantes.");
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white font-black italic uppercase animate-pulse">Cargando Panel...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-12 text-slate-100 font-sans">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic uppercase leading-none">Mi Panel<br/><span className="text-indigo-500">Kalian</span></h1>
          {usuario && <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Socio: {usuario.nombre} • {usuario.dni}</p>}
        </div>
        <button 
          onClick={() => auth.signOut().then(() => navigate('/'))}
          className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reservas.length === 0 ? (
          <div className="col-span-full bg-slate-800/50 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-700">
            <p className="italic text-slate-500 font-bold uppercase tracking-tighter text-2xl">No tienes actividades<br/>inscritas todavía</p>
          </div>
        ) : reservas.map(res => (
          <div key={res.id} className="bg-white rounded-[3rem] p-8 text-slate-900 shadow-2xl flex flex-col items-center transform hover:scale-[1.02] transition-transform">
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 tracking-tighter">
              {res.tipo} • {res.fechaActividad}
            </span>
            
            <h3 className="text-xl font-black uppercase leading-tight text-center mb-6 h-12 flex items-center">{res.titulo}</h3>
            
            {/* CÓDIGO QR */}
            <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-6 shadow-inner border border-slate-100">
              <img src={res.qrUrl} alt="Ticket QR" className="w-32 h-32 mix-blend-multiply" />
              <p className="text-center font-mono text-[9px] mt-4 text-slate-400 font-bold tracking-widest">{res.ticketID}</p>
            </div>

            {/* GESTIÓN DE ACOMPAÑANTES */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Acompañantes</p>
                <p className="text-2xl font-black italic">{res.acompañantes}</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => actualizarAcompañantes(res, res.acompañantes - 1)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-black hover:bg-slate-900 hover:text-white transition-all shadow-sm">-</button>
                <button 
                  onClick={() => actualizarAcompañantes(res, res.acompañantes + 1)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-black hover:bg-slate-900 hover:text-white transition-all shadow-sm">+</button>
              </div>
            </div>
            <p className="text-[8px] text-slate-400 mt-3 uppercase font-black tracking-widest italic">Límite: 4 acompañantes</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default PerfilSocio;