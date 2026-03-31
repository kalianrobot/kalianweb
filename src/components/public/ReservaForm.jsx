import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ReservaForm = ({ item, alCerrar }) => {
  const [form, setForm] = useState({ nombre: '', email: '', dni: '', acompañantes: 0 });
  const [datosSocio, setDatosSocio] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargandoSocio, setCargandoSocio] = useState(false);
  const navigate = useNavigate();
  
  const esCurso = item.fechaFin !== undefined;
  const precioUnitario = Number(item.precio_estandar || item.precio || 0);

  useEffect(() => {
    const cargarDatosSocio = async () => {
      if (esCurso && auth.currentUser) {
        setCargandoSocio(true);
        const q = query(collection(db, "socios"), where("uid", "==", auth.currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setDatosSocio(data);
          setForm(f => ({ ...f, nombre: data.nombre, email: data.email, dni: data.dni }));
        }
        setCargandoSocio(false);
      }
    };
    cargarDatosSocio();
  }, [esCurso]);

  const enviar = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (esCurso && !user) {
      sessionStorage.setItem('url_retorno', window.location.pathname);
      setMensaje("⚠️ Para inscribirte en un curso debes ser socio. Redirigiendo...");
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    try {
      const col = esCurso ? "inscritos" : "asistentes";
      const parent = esCurso ? "cursos" : "eventos";
      
      // 1. VALIDACIÓN DE DUPLICADOS
      if (user) {
        const qDuplicado = query(
          collection(db, parent, item.id, col),
          where("uid", "==", user.uid)
        );
        const snapDuplicado = await getDocs(qDuplicado);
        if (!snapDuplicado.empty) {
          setMensaje("⚠️ Ya estás inscrito en esta actividad.");
          return;
        }
      }

      // 2. PROCESO DE GUARDADO
      const tID = Math.random().toString(36).substring(2, 8).toUpperCase();
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KALIAN-${tID}-${form.dni}`;

      const refReserva = await addDoc(collection(db, parent, item.id, col), {
        ...form,
        uid: user?.uid || 'anonimo',
        totalPagado: esCurso ? precioUnitario : (precioUnitario * (parseInt(form.acompañantes) + 1)),
        ticketID: tID,
        fecha: new Date().toISOString(),
        qrUrl: qrUrl
      });

      // 3. COPIA GLOBAL Y ACTUALIZACIÓN (Solo para socios logueados)
      if (user) {
        await addDoc(collection(db, "reservas_globales"), {
          uid: user.uid,
          titulo: item.titulo,
          tipo: esCurso ? 'Curso' : 'Evento',
          fechaActividad: item.fechaInicio || item.fecha || 'Consultar',
          ticketID: tID,
          qrUrl: qrUrl,
          dni: form.dni.toUpperCase(),
          pathOriginal: `${parent}/${item.id}/${col}`,
          reservaIdOriginal: refReserva.id,
          acompañantes: parseInt(form.acompañantes) || 0
        });

        if (esCurso && datosSocio) {
          const socioRef = doc(db, "socios", datosSocio.dni);
          await updateDoc(socioRef, {
            [`expiraciones.${item.categoria}`]: item.fechaFin,
            verificado: true
          });
        }
      }

      setMensaje("✅ ¡Inscripción completada con éxito!");
      setTimeout(alCerrar, 3000);

    } catch (err) {
      console.error(err);
      setMensaje("Error al procesar: " + err.message);
    }
  };

  if (cargandoSocio) return <div className="p-10 text-center animate-pulse italic">Validando datos de socio...</div>;

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-md w-full relative text-slate-900">
      <button onClick={alCerrar} className="absolute top-6 right-6 text-slate-300 font-bold">✕</button>
      
      <h2 className="text-2xl font-black italic uppercase leading-tight mb-2">{item.titulo}</h2>
      <p className="text-[10px] font-bold text-indigo-600 uppercase mb-6 tracking-widest">
        {esCurso ? '📝 Inscripción de Curso' : '🎟️ Reserva de Evento'}
      </p>

      {mensaje ? (
        <div className="bg-slate-900 text-white p-10 rounded-[2rem] text-center font-bold italic">{mensaje}</div>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          {esCurso && datosSocio ? (
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Datos del Socio</p>
              <p className="font-bold text-lg">{datosSocio.nombre}</p>
              <p className="text-xs font-mono text-slate-500">{datosSocio.dni}</p>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[9px] text-emerald-700 font-bold uppercase">✨ Usuario Verificado</p>
              </div>
            </div>
          ) : (
            <>
              <input 
                type="text" placeholder="DNI" 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold uppercase outline-none" 
                value={form.dni} 
                onChange={e => setForm({...form, dni: e.target.value.toUpperCase()})} 
                required 
              />
              <input 
                type="text" placeholder="NOMBRE COMPLETO" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none" 
                value={form.nombre} 
                onChange={e => setForm({...form, nombre: e.target.value})} 
                required 
              />
            </>
          )}

          {!esCurso && (
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400">Acompañantes</span>
              <input 
                type="number" min="0" max="4"
                className="w-16 bg-white p-2 rounded-xl text-center font-bold" 
                value={form.acompañantes} 
                onChange={e => setForm({...form, acompañantes: e.target.value})} 
              />
            </div>
          )}

          <div className="flex justify-between items-center p-6 bg-slate-900 rounded-[2.5rem] text-white">
            <span className="text-3xl font-black italic">{esCurso ? precioUnitario : precioUnitario * (parseInt(form.acompañantes) + 1)}€</span>
            <button className="bg-indigo-600 px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-indigo-500 transition-colors">
              {esCurso ? 'Inscribirme' : 'Reservar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReservaForm;