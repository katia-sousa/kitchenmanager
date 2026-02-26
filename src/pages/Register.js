// src/pages/Register.jsx
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";

function Register() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nome,
        cpf,
        telefone,
        email,
        tipo: "admin", // Identifica como administrador
        criadoEm: new Date(),
      });
      navigate("/cadastro-estabelecimento");
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Cadastro de Administrador</h2>
      <form onSubmit={handleRegister} className="mt-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />
        <input
          type="email"
          className="form-control mb-2"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100">Cadastrar</button>
      </form>
      {erro && <p className="text-danger mt-3">{erro}</p>}
    </div>
  );
}

export default Register;
