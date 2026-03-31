
import React, { useState, useEffect } from 'react';

import { db } from '../../firebase';

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

import { Link } from 'react-router-dom';



const AdminSocios = () => {

  const [socios, setSocios] = useState([]);

  const hoy = new Date().toISOString().split('T')[0];



  const fetchYLimpiar = async () => {

    const snap = await getDocs(collection(db, "socios"));

    const procesados = await Promise.all(snap.docs.map(async (d) => {

      const data = d.data();

      const exp = data.expiraciones || {};

      let cambio = false;

      const nuevasExp = { ...exp };



      for (const cat in nuevasExp) {

        if (nuevasExp[cat] < hoy) { delete nuevasExp[cat]; cambio = true; }

      }



      if (cambio) {

        await updateDoc(doc(db, "socios", d.id), { expiraciones: nuevasExp, verificado: Object.keys(nuevasExp).length > 0 });

        return { id: d.id, ...data, expiraciones: nuevasExp };

      }

      return { id: d.id, ...data };

    }));

    setSocios(procesados);

  };



  useEffect(() => { fetchYLimpiar(); }, []);



  return (

    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      <div className="max-w-5xl mx-auto">

        <header className="mb-8 flex justify-between items-center">

          <h1 className="text-3xl font-black italic uppercase">Socios Kalian</h1>

          <button onClick={fetchYLimpiar} className="text-xs font-bold uppercase bg-white p-3 rounded-xl shadow-sm">🔄 Refrescar</button>

        </header>

        <div className="grid gap-4">

          {socios.map(s => (

            <div key={s.id} className="bg-white p-6 rounded-[2.5rem] flex justify-between items-center shadow-sm border border-slate-200">

              <div>

                <p className="font-black text-slate-800 uppercase leading-none mb-1">{s.nombre}</p>

                <p className="text-[10px] text-slate-400 font-mono">{s.dni}</p>

              </div>

              <div className="flex gap-2">

                {Object.keys(s.expiraciones || {}).map(cat => (

                  <span key={cat} className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg">{cat}</span>

                ))}

                {Object.keys(s.expiraciones || {}).length === 0 && <span className="text-red-400 font-bold text-[10px] uppercase">Inactivo</span>}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};

export default AdminSocios;

