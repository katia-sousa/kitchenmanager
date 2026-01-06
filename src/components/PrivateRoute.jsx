import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ element }) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  if (carregando) {
    return <p className="text-center mt-5">🔒 Verificando acesso...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" />; // Redireciona se não estiver logado
  }

  return element;
}

export default PrivateRoute;
