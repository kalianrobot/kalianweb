
import React, { useState, useEffect } from 'react';

import { db } from '../../firebase';

import { collection, setDoc, doc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';

import { Link } from 'react-router-dom';



const AdminCursos = () => {

  const [cursos, setCursos] = useState([]);

  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({ titulo: '', periodicidad: '', precio: '', categoria: 'musica', fechaInicio: '', fechaFin: '' });



  const fetchCursos = async () => {

    const snap = await getDocs(query(collection(db, "cursos"), orderBy("titulo", "asc")));

    setCursos(snap.docs.map(d => ({ id: d.id, ...d.data() })));

  };



  useEffect(() => { fetchCursos(); }, []);



  const crear = async (e) => {

    e.preventDefault();

    try {

      const mesAnio = form.fechaInicio.substring(0, 7); 

      const slug = form.titulo.trim().replace(/\s+/g, '-').toUpperCase();

      const customId = `${mesAnio}-${slug}`;



      await setDoc(doc(db, "cursos", customId), { ...form, precio: Number(form.precio) });

      

      setMsg("✅ Curso creado: " + customId);

      setTimeout(() => setMsg(''), 3000);

      setForm({ titulo: '', periodicidad: '', precio: '', categoria: 'musica', fechaInicio: '', fechaFin: '' });

      fetchCursos();

    } catch (err) { alert("Error al guardar"); }

  };



  return (

    <div className="min-h-screen bg-slate-100 p-6 font-sans">

      <div className="max-w-4xl mx-auto">

        <Link to="/admin" className="text-indigo-600 font-bold text-xs uppercase tracking-widest">← Volver</Link>

        <h1 className="text-3xl font-black italic uppercase mb-8 mt-2">Academia Kalian</h1>



        {msg && <div className="bg-emerald-500 text-white p-4 rounded-2xl mb-6 font-bold text-center">{msg}</div>}



        <form onSubmit={crear} className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-4 mb-10">

          <input type="text" placeholder="Nombre" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />

          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col"><label className="text-[10px] font-bold ml-2">FECHA INICIO</label>

            <input type="date" className="p-4 bg-slate-50 rounded-2xl outline-none" value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} required /></div>

            <div className="flex flex-col"><label className="text-[10px] font-bold ml-2">FECHA FIN</label>

            <input type="date" className="p-4 bg-slate-50 rounded-2xl outline-none" value={form.fechaFin} onChange={e => setForm({...form, fechaFin: e.target.value})} required /></div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <input type="number" placeholder="Precio Mensual" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />

            <select className="p-4 bg-slate-50 rounded-2xl font-bold uppercase" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>

              <option value="musica">🎸 Música</option><option value="danza">💃 Danza</option><option value="local">🏠 Local</option>

            </select>

          </div>

          <button className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase shadow-xl">Crear Curso</button>

        </form>



        <div className="space-y-3">

          {cursos.map(c => (

            <div key={c.id} className="bg-white p-6 rounded-3xl flex justify-between items-center shadow-sm">

              <div><h3 className="font-bold">{c.titulo}</h3><p className="text-[10px] text-slate-400">Del {c.fechaInicio} al {c.fechaFin}</p></div>

              <button onClick={async () => { if(confirm("¿Borrar?")) { await deleteDoc(doc(db, "cursos", c.id)); fetchCursos(); } }} className="text-red-400 font-bold text-xs">Borrar</button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};

export default AdminCursos;

