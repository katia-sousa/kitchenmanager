// src/pages/Colaboradores.jsx
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("colaborador");
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");

  // Funções do Firebase
  const functions = getFunctions(undefined, "southamerica-east1");
  const criarColaboradorFn = httpsCallable(functions, "criarColaborador");

  // Carrega o admin e seu estabelecimento
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) carregarEstabelecimento(user.uid);
    });
    return () => unsub();
  }, []);

  async function carregarEstabelecimento(uid) {
    try {
      const estQuery = query(
        collection(db, "estabelecimentos"),
        where("adminId", "==", uid)
      );
      const estSnap = await getDocs(estQuery);
      if (!estSnap.empty) {
        const est = estSnap.docs[0];
        setEstabelecimento({ id: est.id, ...est.data() });
        carregarColaboradores(est.id);
      }
    } catch (err) {
      console.error("Erro ao carregar estabelecimento:", err);
      setMensagem("Erro ao carregar estabelecimento");
    }
  }

  async function carregarColaboradores(estabelecimentoId) {
    try {
      const colQuery = query(
        collection(db, "usuarios"),
        where("estabelecimentoId", "==", estabelecimentoId)
      );
      const colSnap = await getDocs(colQuery);
      setColaboradores(colSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
      setMensagem("Erro ao carregar colaboradores");
    }
  }

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!estabelecimento) {
      setMensagem("⚠️ Nenhum estabelecimento encontrado.");
      return;
    }
    try {
      await criarColaboradorFn({
        nome,
        email,
        telefone,
        tipo,
        estabelecimentoId: estabelecimento.id
      });

      setMensagem(`✅ Usuário ${nome} cadastrado com sucesso!`);
      setNome(""); setEmail(""); setTelefone(""); setTipo("colaborador");

      carregarColaboradores(estabelecimento.id);
    } catch (error) {
      console.error("Erro criar colaborador:", error);
      const msg = error?.message || "Erro interno ao criar colaborador";
      setMensagem(`⚠️ ${msg}`);
    }
  };

  const abrirEdicao = (col) => {
    setEditando(col);
    setEditNome(col.nome);
    setEditEmail(col.email);
    setEditTelefone(col.telefone);
  };

  const salvarEdicao = async () => {
    try {
      await updateDoc(doc(db, "usuarios", editando.id), {
        nome: editNome,
        email: editEmail,
        telefone: editTelefone
      });

      setColaboradores(prev =>
        prev.map(c =>
          c.id === editando.id
            ? { ...c, nome: editNome, email: editEmail, telefone: editTelefone }
            : c
        )
      );
      setEditando(null);
      setMensagem("✅ Colaborador atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      setMensagem("⚠️ Erro ao atualizar colaborador");
    }
  };

  const excluirColaborador = async (id) => {
    if (!window.confirm("Deseja realmente excluir este colaborador?")) return;
    try {
      await deleteDoc(doc(db, "usuarios", id));
      setColaboradores(prev => prev.filter(c => c.id !== id));
      setMensagem("✅ Colaborador excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir colaborador:", err);
      setMensagem("⚠️ Erro ao excluir colaborador");
    }
  };

  // 🔑 Resetar senha para 123456 (apenas admin)
  const resetarSenha = async (colaborador) => {
    if (!window.confirm(`Deseja resetar a senha de ${colaborador.nome} para 123456?`)) return;
    try {
      await updateDoc(doc(db, "usuarios", colaborador.id), {
        senha: "123456",
        senhaAlterada: false // indica que ainda não trocou
      });
      setMensagem(`✅ Senha de ${colaborador.nome} resetada para 123456. Recomenda-se alterar após login.`);
    } catch (err) {
      console.error("Erro ao resetar senha:", err);
      setMensagem("⚠️ Erro ao resetar senha");
    }
  };

  return (
    <div className="container mt-5">
      <h2>👥 Colaboradores</h2>
      {estabelecimento && (
        <p className="text-muted">
          Estabelecimento: <strong>{estabelecimento.nome}</strong>
        </p>
      )}

      {/* Formulário de cadastro */}
      <form onSubmit={handleCadastrar} className="mt-3">
        <input
          className="form-control mb-2"
          placeholder="Nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="Telefone"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          required
        />
        <select
          className="form-control mb-3"
          value={tipo}
          onChange={e => setTipo(e.target.value)}
        >
          <option value="colaborador">Colaborador</option>
          <option value="admin">Administrador</option>
        </select>
        <button className="btn btn-success w-100">Cadastrar Usuário</button>
      </form>

      {mensagem && <p className="mt-3">{mensagem}</p>}

      <hr />

      {/* Lista de colaboradores */}
      <ul className="list-group">
        {colaboradores.map(c => (
          <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              {editando?.id === c.id ? (
                <>
                  <input className="form-control mb-1" value={editNome} onChange={e => setEditNome(e.target.value)} />
                  <input className="form-control mb-1" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  <input className="form-control mb-1" value={editTelefone} onChange={e => setEditTelefone(e.target.value)} />
                  <button className="btn btn-primary btn-sm me-2 mt-1" onClick={salvarEdicao}>Salvar</button>
                  <button className="btn btn-secondary btn-sm mt-1" onClick={() => setEditando(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <strong>{c.nome}</strong> — {c.email} ({c.tipo}) — {c.telefone}
                  {c.senha === "123456" && (
                    <span className="badge bg-warning ms-2">Senha padrão</span>
                  )}
                </>
              )}
            </div>
            {editando?.id !== c.id && (
              <div>
                <button className="btn btn-warning btn-sm me-2" onClick={() => abrirEdicao(c)}>Editar</button>
                <button className="btn btn-danger btn-sm me-2" onClick={() => excluirColaborador(c.id)}>Excluir</button>
                <button className="btn btn-secondary btn-sm" onClick={() => resetarSenha(c)}>Resetar Senha</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
