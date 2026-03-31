
import React, { useState, useEffect } from 'react';

import { db, auth } from '../../firebase';

import { collection, getDocs } from 'firebase/firestore';

import { Link } from 'react-router-dom';

import ReservaForm from './ReservaForm';



const HomePublica = () => {

  const [eventos, setEventos] = useState([]);

  const [cursos, setCursos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [seleccionado, setSeleccionado] = useState(null);

  const [usuario, setUsuario] = useState(null);



  useEffect(() => {

    const unsub = auth.onAuthStateChanged(u => setUsuario(u));

    const fetchData = async () => {

      try {

        const snapE = await getDocs(collection(db, "eventos"));

        setEventos(snapE.docs.map(d => ({ id: d.id, ...d.data() })));

        const snapC = await getDocs(collection(db, "cursos"));

        setCursos(snapC.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) { console.error(err); }

      setLoading(false);

    };

    fetchData();

    return () => unsub();

  }, []);



  if (loading) return <div className="h-screen flex items-center justify-center font-black text-slate-300 italic uppercase tracking-widest">KalianHKG...</div>;



  return (

    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      <header className="bg-white py-12 px-6 text-center border-b mb-16 shadow-sm">

        <h1 className="text-6xl font-black italic mb-8 tracking-tighter text-slate-900">KALIANHKG</h1>

        <div className="flex justify-center gap-4">

          {usuario ? (

            <Link to="/perfil" className="bg-indigo-600 text-white px-10 py-3 rounded-[1.5rem] font-bold shadow-lg hover:bg-indigo-700 transition-all">MI PERFIL</Link>

          ) : (

            <Link to="/login" className="bg-slate-900 text-white px-10 py-3 rounded-[1.5rem] font-bold shadow-lg hover:bg-indigo-600 transition-all">ACCESO SOCIOS</Link>

          )}

          <Link to="/admin" className="text-slate-400 px-10 py-3 font-bold hover:text-slate-900 transition-all">STAFF</Link>

        </div>

      </header>



      <main className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        {/* EVENTOS */}

        <section>

          <h2 className="text-2xl font-black mb-10 italic uppercase border-l-8 border-indigo-600 pl-6 text-slate-800">Conciertos</h2>

          <div className="space-y-8">

            {eventos.map(ev => (

              <div key={ev.id} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:scale-[1.02] transition-transform">

                <h3 className="text-3xl font-bold text-slate-900 leading-none mb-2">{ev.titulo}</h3>

                <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-6">{ev.fecha}</p>

                <div className="flex justify-between items-center pt-8 border-t border-slate-50">

                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{ev.precio_estandar}€</span>

                  <button onClick={() => setSeleccionado(ev)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Reservar</button>

                </div>

              </div>

            ))}

          </div>

        </section>



        {/* CURSOS */}

        <section>

          <h2 className="text-2xl font-black mb-10 italic uppercase border-l-8 border-emerald-500 pl-6 text-slate-800">Academia</h2>

          <div className="space-y-8">

            {cursos.map(cu => (

              <div key={cu.id} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:scale-[1.02] transition-transform">

                <h3 className="text-3xl font-bold text-slate-900 leading-none mb-2">{cu.titulo}</h3>

                <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-6">{cu.periodicidad}</p>

                <div className="flex justify-between items-center pt-8 border-t border-slate-50">

                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{cu.precio}€</span>

                  <button onClick={() => setSeleccionado(cu)} className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Inscribirse</button>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>



      {seleccionado && (

        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">

          <ReservaForm item={seleccionado} alCerrar={() => setSeleccionado(null)} />

        </div>

      )}

    </div>

  );

};

export default HomePublica;

