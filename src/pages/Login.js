import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const userDoc = await getDoc(doc(db, "usuarios", cred.user.uid));

      if (!userDoc.exists()) {
        alert("Usuário não encontrado no sistema.");
        return;
      }

      const userData = userDoc.data();
      if (userData.tipo === "admin") navigate("/admin");
      else navigate("/painel-colaborador");
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Acessar Sistema</h3>
        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button className="btn btn-primary w-100 mb-2">Entrar</button>
        </form>
        <div className="text-center mt-2">
          <small>
            Não tem uma conta? <Link to="/cadastro-usuario">Cadastre-se</Link>
          </small>
        </div>
      </div>
    </div>
  );
}
