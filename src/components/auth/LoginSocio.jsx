import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const LoginSocio = () => {
  const [esRegistro, setEsRegistro] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', dni: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');

    try {
      if (esRegistro) {
        const u = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await sendEmailVerification(u.user);
        await setDoc(doc(db, "socios", form.dni.toUpperCase()), {
          nombre: form.nombre, 
          email: form.email, 
          dni: form.dni.toUpperCase(),
          uid: u.user.uid, 
          verificado: false, 
          expiraciones: {}
        });
        setInfo("✨ ¡Registrado! Revisa tu email para verificar la cuenta.");
        setEsRegistro(false);
      } else {
        const u = await signInWithEmailAndPassword(auth, form.email, form.password);

if (u.user.emailVerified) {
  const destino = sessionStorage.getItem('url_retorno');
  if (destino) {
    sessionStorage.removeItem('url_retorno'); // ¡Importante limpiar!
    navigate(destino);
  } else {
    navigate('/perfil');
  }
}
      }
    } catch (err) { 
      setError("Error en el acceso. Revisa tus datos."); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl text-slate-900">
        <Link to="/" className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-600">← Volver al Inicio</Link>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-4 mb-8 leading-none whitespace-pre-line">
          {esRegistro ? 'Unirse a\nKalian' : 'Área\nSocios'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">{error}</div>}
        {info && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-emerald-100">{info}</div>}

        <form onSubmit={manejarSubmit} className="space-y-4">
          {esRegistro && (
            <>
              <input type="text" placeholder="Nombre completo" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setForm({...form, nombre: e.target.value})} required />
              <input type="text" placeholder="DNI con letra" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold uppercase" onChange={e => setForm({...form, dni: e.target.value})} required />
            </>
          )}
          <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Contraseña" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setForm({...form, password: e.target.value})} required />
          
          <button className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
            {esRegistro ? 'Registrarme' : 'Entrar'}
          </button>
        </form>

        <button onClick={() => setEsRegistro(!esRegistro)} className="w-full mt-10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">
          {esRegistro ? 'Ya soy socio' : 'Quiero ser socio'}
        </button>
      </div>
    </div>
  );
};

export default LoginSocio;