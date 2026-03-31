
import React, { useEffect, useState } from 'react';

import { auth, db } from '../../firebase';

import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';

import { useNavigate, Link } from 'react-router-dom';



const MiPerfil = () => {

  const [socio, setSocio] = useState(null);

  const [reservas, setReservas] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();



  useEffect(() => {

    const fetchData = async () => {

      const user = auth.currentUser;

      if (!user) { navigate('/login'); return; }

      try {

        const qS = query(collection(db, "socios"), where("uid", "==", user.uid));

        const snapS = await getDocs(qS);

        if (!snapS.empty) {

          const sData = snapS.docs[0].data();

          setSocio(sData);

          const res = [];

          const snapA = await getDocs(query(collectionGroup(db, 'asistentes'), where("dni", "==", sData.dni)));

          const snapI = await getDocs(query(collectionGroup(db, 'inscritos'), where("dni", "==", sData.dni)));

          snapA.forEach(d => res.push({ id: d.id, ...d.data() }));

          snapI.forEach(d => res.push({ id: d.id, ...d.data() }));

          setReservas(res);

        }

      } catch (err) { console.error(err); }

      setLoading(false);

    };

    fetchData();

  }, [navigate]);



  if (loading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white italic">KALIANHKG...</div>;



  return (

    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      <div className="max-w-4xl mx-auto">

        <header className="flex justify-between items-center mb-8">

          <Link to="/" className="text-3xl font-black italic uppercase tracking-tighter">Kalian</Link>

          <button onClick={() => { auth.signOut(); navigate('/'); }} className="text-slate-400 font-bold text-xs uppercase">Salir</button>

        </header>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl h-fit border border-indigo-50">

            <h2 className="text-xl font-black mb-2">{socio?.nombre}</h2>

            <p className="text-[10px] text-slate-400 font-mono mb-4">{socio?.dni}</p>

            <div className="flex flex-wrap gap-2">

              {Object.keys(socio?.expiraciones || {}).map(cat => (

                <span key={cat} className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg">{cat}</span>

              ))}

            </div>

          </div>

          <div className="md:col-span-2 space-y-4">

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Mis Próximas Citas</h3>

            {reservas.length > 0 ? reservas.map(r => (

              <div key={r.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-slate-100">

                <img src={r.qrUrl} alt="QR" className="w-24 h-24 rounded-2xl bg-slate-50 p-1 border" />

                <div>

                  <span className="text-[9px] font-black uppercase text-indigo-500">{r.tipoActividad}</span>

                  <h4 className="font-bold text-slate-800 text-lg uppercase leading-tight">{r.tituloActividad}</h4>

                  <p className="text-[10px] text-slate-400 font-bold mt-1">ID TICKET: {r.ticketID}</p>

                </div>

              </div>

            )) : <p className="p-10 text-center italic text-slate-300">No tienes reservas activas.</p>}

          </div>

        </div>

      </div>

    </div>

  );

};

export default MiPerfil;

