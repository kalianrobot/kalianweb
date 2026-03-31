
import React, { useState, useEffect } from 'react';

import { db } from '../../firebase';

import { collection, setDoc, doc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';

import { Link } from 'react-router-dom';



const AdminEventos = () => {

  const [eventos, setEventos] = useState([]);

  const [form, setForm] = useState({ titulo: '', fecha: '', precio_estandar: '', categoria: 'musica' });



  const fetchEventos = async () => {

    const snap = await getDocs(query(collection(db, "eventos"), orderBy("fecha", "desc")));

    setEventos(snap.docs.map(d => ({ id: d.id, ...d.data() })));

  };



  useEffect(() => { fetchEventos(); }, []);



  const crear = async (e) => {

    e.preventDefault();

    const slug = form.titulo.trim().replace(/\s+/g, '-').toUpperCase();

    const customId = `${form.fecha.substring(0,10)}-${slug}`;

    await setDoc(doc(db, "eventos", customId), { ...form, precio_estandar: Number(form.precio_estandar) });

    setForm({ titulo: '', fecha: '', precio_estandar: '', categoria: 'musica' });

    fetchEventos();

  };



  return (

    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      <div className="max-w-4xl mx-auto">

        <header className="mb-8"><Link to="/admin" className="text-indigo-600 font-bold text-xs uppercase tracking-widest">← Volver</Link><h1 className="text-4xl font-black italic uppercase text-slate-900">Cartelera Eventos</h1></header>

        <form onSubmit={crear} className="bg-white p-10 rounded-[3rem] shadow-xl space-y-4 mb-10">

          <input type="text" placeholder="Título" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />

          <div className="grid grid-cols-2 gap-4">

            <input type="datetime-local" className="p-4 bg-slate-50 rounded-2xl outline-none" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />

            <input type="number" placeholder="Precio (€)" className="p-4 bg-slate-50 rounded-2xl outline-none" value={form.precio_estandar} onChange={e => setForm({...form, precio_estandar: e.target.value})} required />

          </div>

          <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold uppercase" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>

            <option value="musica">🎸 Música</option><option value="danza">💃 Danza</option>

          </select>

          <button className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase">Publicar Concierto/Evento</button>

        </form>

        <div className="space-y-3">

          {eventos.map(ev => (

            <div key={ev.id} className="bg-white p-6 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100">

              <div><h3 className="font-bold">{ev.titulo}</h3><p className="text-xs text-slate-400">{ev.fecha} | {ev.categoria}</p></div>

              <button onClick={async () => { await deleteDoc(doc(db, "eventos", ev.id)); fetchEventos(); }} className="text-red-400 font-bold text-xs">BORRAR</button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};

export default AdminEventos;

