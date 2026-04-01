import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePublica = () => {
  const { role, currentUser } = useAuth();

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenidos a Kalian HKG</h1>
      
      {role === 'invitado' && (
        <div>
          <p className="mb-6">Únete a nuestra asociación de música y disfruta de eventos exclusivos.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded">Área Socios</Link>
        </div>
      )}

      {role === 'socio' && (
        <div className="bg-green-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold">Hola de nuevo, Socio</h2>
          <p className="mt-2">Tu suscripción de música expira el: 2026-05-06</p>
          <Link to="/perfil" className="mt-4 inline-block text-blue-600 underline">Ver mi carnet digital</Link>
        </div>
      )}

      {role === 'admin' && (
        <div className="bg-purple-100 p-6 rounded-lg border-2 border-purple-500">
          <h2 className="text-2xl font-bold text-purple-800">Modo Administrador</h2>
          <p className="mb-4">Tienes control total sobre eventos y socios.</p>
          <Link to="/admin" className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition">
            IR AL PANEL DE CONTROL
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePublica;