import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto fácilmente en cualquier componente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// 3. Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socioData, setSocioData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('kalianAdmin') === 'true');
  const [loading, setLoading] = useState(true);

  // Lógica temporal de Admin (Centralizada)
  const loginAdmin = (password) => {
    if (password === 'kalian2026') {
      setIsAdmin(true);
      localStorage.setItem('kalianAdmin', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('kalianAdmin');
  };

  const logoutSocio = () => {
    // Centralizamos la función de signOut de Firebase
    return signOut(auth);
  };

  // Lógica de Firebase Auth y Firestore (Socios)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const q = query(collection(db, "socios"), where("uid", "==", firebaseUser.uid));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setSocioData(snap.docs[0].data());
          }
        } catch (error) {
          console.error("Error obteniendo datos del socio:", error);
        }
      } else {
        setUser(null);
        setSocioData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculamos el rol dinámicamente
  const role = isAdmin ? 'admin' : (user ? 'socio' : 'invitado');

  // Lo que exponemos al resto de la app
  const value = { user, socioData, isAdmin, role, loading, loginAdmin, logoutAdmin, logoutSocio };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};