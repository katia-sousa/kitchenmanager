import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        let dados = userSnap.exists() ? userSnap.data() : {};

        // Se for admin, busca o estabelecimento que ele administra
        if (dados.tipo === "admin") {
          const q = query(collection(db, "estabelecimentos"), where("adminId", "==", user.uid));
          const estabSnap = await getDocs(q);
          if (!estabSnap.empty) {
            dados.estabelecimentoId = estabSnap.docs[0].id;
            dados.nomeEmpresa = estabSnap.docs[0].data().nome || "N/D";
          } else {
            dados.estabelecimentoId = null;
            dados.nomeEmpresa = "N/D";
          }
        }

        // Se for colaborador, pega o estabelecimento que ele pertence
        if (dados.tipo === "colaborador" && dados.estabelecimentoId) {
          const estabRef = doc(db, "estabelecimentos", dados.estabelecimentoId);
          const estabSnap = await getDoc(estabRef);
          if (estabSnap.exists()) {
            dados.nomeEmpresa = estabSnap.data().nome || "N/D";
          } else {
            dados.nomeEmpresa = "N/D";
          }
        }

        setUserData({ uid: user.uid, ...dados });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setUserData({ uid: user.uid, nomeEmpresa: "N/D" });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
