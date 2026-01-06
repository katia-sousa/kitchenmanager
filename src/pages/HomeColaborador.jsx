// src/pages/HomeColaborador.jsx
import { updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase/firebaseConfig";

function HomeColaborador() {
  const [usuario, setUsuario] = useState(null);
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [editando, setEditando] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [senhaAlert, setSenhaAlert] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const userRef = doc(db, "usuarios", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUsuario(userData);

        // 🔔 Verifica se senha foi resetada
        if (userData.senhaAlterada === false) setSenhaAlert(true);

        if (userData.estabelecimentoId) {
          const estRef = doc(db, "estabelecimentos", userData.estabelecimentoId);
          const estSnap = await getDoc(estRef);
          if (estSnap.exists()) setEstabelecimento(estSnap.data());
        }
      }
    }

    carregarDados();
  }, []);

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf.substring(10, 11));
  }

  async function salvarAlteracoes() {
    if (!usuario.nome || !usuario.telefone || !usuario.endereco || !usuario.cpf) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!validarCPF(usuario.cpf)) {
      alert("CPF inválido!");
      return;
    }

    try {
      setSalvando(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        alert("Usuário não autenticado.");
        return;
      }

      const userRef = doc(db, "usuarios", uid);

      let fotoURLFinal = usuario.fotoURL || null;

      if (fotoFile) {
        const fotoRef = ref(storage, `perfil/${uid}/perfil.jpg`);
        await uploadBytes(fotoRef, fotoFile);
        fotoURLFinal = await getDownloadURL(fotoRef);
      }

      const dadosAtualizacao = {
        nome: usuario.nome,
        telefone: usuario.telefone,
        endereco: usuario.endereco,
        cpf: usuario.cpf,
        dadosConfirmados: true,
        atualizadoEm: new Date(),
      };

      if (fotoURLFinal) dadosAtualizacao.fotoURL = fotoURLFinal;

      await updateDoc(userRef, dadosAtualizacao);

      setUsuario(prev => ({ ...prev, ...dadosAtualizacao, fotoURL: fotoURLFinal || prev.fotoURL }));
      alert("✅ Dados atualizados com sucesso!");
      setEditando(false);
      setFotoFile(null);
      setFotoPreview(null);
    } catch (error) {
      console.error("ERRO AO SALVAR:", error);
      alert("❌ Erro ao salvar os dados.");
    } finally {
      setSalvando(false);
    }
  }

  function handleFotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function alterarCampo(campo, valor) {
    setUsuario({ ...usuario, [campo]: valor });
  }

  // 🔐 ALTERAR SENHA
  async function alterarSenha() {
    const novaSenha = prompt("Digite sua nova senha:");
    if (!novaSenha) return alert("Senha não alterada.");

    try {
      await updatePassword(auth.currentUser, novaSenha);

      const uid = auth.currentUser?.uid;
      const userRef = doc(db, "usuarios", uid);
      await updateDoc(userRef, { senhaAlterada: true });

      setSenhaAlert(false);
      alert("✅ Senha alterada com sucesso!");
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      alert("❌ Erro ao alterar senha. Tente novamente.");
    }
  }

  return (
    <div className="container mt-5">
      <h2>👤 Perfil do Colaborador</h2>

      {usuario ? (
        <div className="card p-4 shadow">

          {/* FOTO */}
          <div className="text-center mb-4">
            <img
              src={fotoPreview || usuario.fotoURL || "https://via.placeholder.com/140"}
              alt="Perfil"
              className="rounded-circle shadow"
              width="140"
              height="140"
            />
            {editando && <div className="mt-2"><input type="file" accept="image/*" onChange={handleFotoChange} /></div>}
          </div>

          {/* ALERTA DE SENHA */}
          {senhaAlert && (
            <div className="alert alert-warning">
              ⚠️ Sua senha foi resetada para <strong>123456</strong>. 
              Clique <button className="btn btn-sm btn-outline-primary ms-2" onClick={alterarSenha}>aqui</button> para alterar.
            </div>
          )}

          {/* DADOS */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Nome</label>
              <input className="form-control" disabled={!editando} value={usuario.nome || ""} onChange={e => alterarCampo("nome", e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label>Email</label>
              <input className="form-control" disabled value={usuario.email || ""} />
            </div>
            <div className="col-md-6 mb-3">
              <label>Telefone</label>
              <input className="form-control" disabled={!editando} value={usuario.telefone || ""} onChange={e => alterarCampo("telefone", e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label>CPF</label>
              <input className="form-control" disabled={!editando} value={usuario.cpf || ""} onChange={e => alterarCampo("cpf", e.target.value)} />
            </div>
            <div className="col-md-12 mb-3">
              <label>Endereço</label>
              <input className="form-control" disabled={!editando} value={usuario.endereco || ""} onChange={e => alterarCampo("endereco", e.target.value)} />
            </div>
          </div>

          {estabelecimento && (
            <div className="alert alert-info mt-3">
              <strong>Empresa:</strong> {estabelecimento.nome}
            </div>
          )}

          {/* BOTÕES */}
          <div className="mt-3 d-flex gap-2">
            {!editando ? (
              <button className="btn btn-primary" onClick={() => setEditando(true)}>✏️ Editar</button>
            ) : (
              <>
                <button className="btn btn-success" onClick={salvarAlteracoes} disabled={salvando}>💾 Salvar</button>
                <button className="btn btn-secondary" onClick={() => setEditando(false)}>❌ Cancelar</button>
              </>
            )}
          </div>

        </div>
      ) : (
        <p>Carregando informações...</p>
      )}
    </div>
  );
}

export default HomeColaborador;
