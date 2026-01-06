import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";

function CadastroResponsavel() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const auth = getAuth();

      // 🔍 Verifica se o e-mail já está cadastrado
      const usuariosRef = collection(db, "usuarios");
      const usuarioQuery = query(usuariosRef, where("email", "==", email));
      const usuarioSnapshot = await getDocs(usuarioQuery);

      if (!usuarioSnapshot.empty) {
        setErro("Este e-mail já está cadastrado no sistema.");
        setCarregando(false);
        return;
      }

      // 🧩 Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 💾 Salva o registro na coleção 'usuarios' com role: admin
      await addDoc(collection(db, "usuarios"), {
        uid: user.uid,
        nome,
        cpf,
        email,
        telefone,
        role: "admin",
        criado_em: new Date(),
      });

      alert("Cadastro realizado com sucesso! Agora cadastre o estabelecimento.");
      navigate("/cadastro-estabelecimento");
    } catch (error) {
      console.error("Erro ao cadastrar responsável:", error);
      setErro("Erro ao cadastrar. Verifique os dados e tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">Cadastro de Responsável</h2>
      <form onSubmit={handleCadastro}>
        <div className="mb-3">
          <label className="form-label">Nome completo</label>
          <input
            type="text"
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Seu nome completo"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">CPF</label>
          <input
            type="text"
            className="form-control"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            placeholder="000.000.000-00"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seuemail@email.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Telefone</label>
          <input
            type="text"
            className="form-control"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Senha</label>
          <input
            type="password"
            className="form-control"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="Crie uma senha segura"
          />
        </div>

        {erro && <div className="alert alert-danger text-center">{erro}</div>}

        <button type="submit" className="btn btn-primary w-100" disabled={carregando}>
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <div className="text-center mt-3">
        <p>
          Já possui conta?{" "}
          <button onClick={() => navigate("/login")} className="btn btn-link p-0">
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}

export default CadastroResponsavel;
