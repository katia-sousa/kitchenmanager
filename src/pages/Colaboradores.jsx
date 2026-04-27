import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";

export default function Colaboradores() {
  const { userData } = useAuth();

  const [colaboradores, setColaboradores] = useState([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("colaborador");
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const [editando, setEditando] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editTipo, setEditTipo] = useState("colaborador");

  const functions = getFunctions(undefined, "southamerica-east1");
  const resetarSenhaFn = httpsCallable(functions, "resetarSenhaColaborador");
  const criarColaboradorFn = httpsCallable(functions, "criarColaborador");

  // 🔍 Carregar usuários do estabelecimento
  const carregarTodosUsuarios = useCallback(async (estabelecimentoId) => {
    const lista = [];

    // 👥 usuários vinculados direto
    const qUsuarios = query(
      collection(db, "usuarios"),
      where("estabelecimentos", "array-contains", estabelecimentoId),
    );

    const usuariosSnap = await getDocs(qUsuarios);
    usuariosSnap.forEach((d) => {
      lista.push({
        id: d.id,
        ...d.data(),
        tipo: d.data().role || d.data().tipo,
      });
    });

    // 🥗 nutricionistas por vínculo
    const qVinculos = query(
      collection(db, "nutricionista_estabelecimentos"),
      where("estabelecimentoId", "==", estabelecimentoId),
    );

    const vinculosSnap = await getDocs(qVinculos);
    for (const v of vinculosSnap.docs) {
      const nutricionistaId = v.data().nutricionistaId;
      if (lista.find((u) => u.id === nutricionistaId)) continue;

      const userSnap = await getDoc(doc(db, "usuarios", nutricionistaId));
      if (userSnap.exists()) {
        lista.push({
          id: userSnap.id,
          ...userSnap.data(),
          tipo: "nutricionista",
        });
      }
    }

    setColaboradores(lista);
  }, []);

  // 🏢 Carregar estabelecimento do admin (OBRIGATÓRIO)
  useEffect(() => {
    const carregarEstabelecimento = async () => {
      if (!userData?.uid) return;

      const userSnap = await getDoc(doc(db, "usuarios", userData.uid));
      if (!userSnap.exists()) return;

      const estabelecimentosIds = userSnap.data().estabelecimentos || [];
      if (estabelecimentosIds.length === 0) return;

      const estSnap = await getDoc(
        doc(db, "estabelecimentos", estabelecimentosIds[0]),
      );

      if (estSnap.exists()) {
        const est = { id: estSnap.id, ...estSnap.data() };
        setEstabelecimento(est);
        carregarTodosUsuarios(est.id);
      }
    };

    carregarEstabelecimento();
  }, [userData, carregarTodosUsuarios]);

  // ➕ Cadastro
  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!estabelecimento) return;

    try {
      const res = await criarColaboradorFn({
        nome,
        cpf,
        email,
        telefone,
        tipo,
        estabelecimentoId: estabelecimento.id,
      });

      setMensagem(`✅ ${res.data.mensagem}`);

      setNome("");
      setCpf("");
      setEmail("");
      setTelefone("");
      setTipo("colaborador");

      await carregarTodosUsuarios(estabelecimento.id);
    } catch (err) {
      console.error("Erro:", err);
      if (
        err.code === "already-exists" ||
        err.code === "auth/email-already-exists"
      ) {
        setMensagem("❌ Este email já está cadastrado!");
      } else {
        setMensagem("❌ Erro ao cadastrar usuário");
      }
    }
  };
  const resetarSenha = async (uid) => {
    try {
      await resetarSenhaFn({ uidAlvo: uid });
      setMensagem("Senha resetada com sucesso.");
    } catch (error) {
      console.error("ERRO COMPLETO:", error);
      setMensagem(`❌ ${error.message}`);
    }
  };
  // ✏️ Editar
  const abrirEdicao = (c) => {
    setEditando(c);
    setEditNome(c.nome);
    setEditCpf(c.cpf || "");
    setEditEmail(c.email || "");
    setEditTelefone(c.telefone || "");
    setEditTipo(c.tipo || c.role || "colaborador");
  };

  const salvarEdicao = async () => {
    await updateDoc(doc(db, "usuarios", editando.id), {
      nome: editNome,
      cpf: editCpf,
      email: editEmail,
      telefone: editTelefone,
      role: editTipo,
      tipo: editTipo,
    });

    setEditando(null);
    carregarTodosUsuarios(estabelecimento.id);
    setMensagem("✅ Usuário atualizado");
  };

  // ❌ Exclusões
  const excluirColaborador = async (id) => {
    if (!window.confirm("Deseja excluir este usuário?")) return;
    await deleteDoc(doc(db, "usuarios", id));
    carregarTodosUsuarios(estabelecimento.id);
  };

  const excluirVinculoNutricionista = async (nutricionistaId) => {
    if (!window.confirm("Remover nutricionista deste estabelecimento?")) return;

    const q = query(
      collection(db, "nutricionista_estabelecimentos"),
      where("nutricionistaId", "==", nutricionistaId),
      where("estabelecimentoId", "==", estabelecimento.id),
    );

    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }

    carregarTodosUsuarios(estabelecimento.id);
  };

  return (
    <div className="container mt-5">
      <h2>👥 Colaboradores</h2>

      <form onSubmit={handleCadastrar} className="mt-3">
        <input
          className="form-control mb-2"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <select
          className="form-control mb-3"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="colaborador">Colaborador</option>
          <option value="nutricionista">Nutricionista</option>
          <option value="gerente">Gerente</option>
          <option value="admin">Administrador</option>
        </select>

        <button className="btn btn-success w-100">Cadastrar</button>
      </form>

      {mensagem && <p className="mt-3">{mensagem}</p>}

      <ul className="list-group mt-4">
        {colaboradores.map((c) => (
          <li
            key={c.id}
            className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            {editando?.id === c.id ? (
              // 🔹 MODO EDIÇÃO
              <div className="w-100">
                <input
                  className="form-control mb-2"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                />

                <input
                  className="form-control mb-2"
                  value={editCpf}
                  onChange={(e) => setEditCpf(e.target.value)}
                />

                <input
                  className="form-control mb-2"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />

                <input
                  className="form-control mb-2"
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(e.target.value)}
                />
                <select
                  className="form-control mb-2"
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="gerente">Gerente</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="admin">Administrador</option>
                </select>

                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={salvarEdicao}
                >
                  Salvar
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              // 🔹 MODO NORMAL
              <>
                <div>
                  <strong>{c.nome}</strong> — {c.email} <b>({c.tipo})</b>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-end mt-2 mt-md-0">
                  <button
                    className="btn btn-warning btn-sm flex-fill flex-md-grow-0"
                    onClick={() => abrirEdicao(c)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-warning btn-sm flex-fill flex-md-grow-0"
                    onClick={() => resetarSenha(c.id)}
                  >
                    Resetar Senha
                  </button>

                  <button
                    className="btn btn-warning btn-sm flex-fill flex-md-grow-0"
                    onClick={() =>
                      c.tipo === "nutricionista"
                        ? excluirVinculoNutricionista(c.id)
                        : excluirColaborador(c.id)
                    }
                  >
                    Excluir
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
