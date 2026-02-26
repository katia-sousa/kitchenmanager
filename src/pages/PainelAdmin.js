import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../firebase/firebaseConfig";

export default function PainelAdmin() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const nomeUsuario = userData?.nome || "Administrador";

  // 🔐 Garante que só admin entra
  useEffect(() => {
    if (!loading && userData?.tipo !== "admin") {
      navigate("/login");
    }
  }, [loading, userData, navigate]);

  // 🔗 Busca estabelecimento vinculado ao admin (admins[])
  useEffect(() => {
    const buscarEstabelecimento = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "estabelecimentos"),
          where("admins", "array-contains", user.uid)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // 👉 usa o primeiro estabelecimento encontrado
          setEstabelecimentoId(snapshot.docs[0].id);
        } else {
          setEstabelecimentoId(null);
        }
      } catch (error) {
        console.error("Erro ao buscar estabelecimento:", error);
        setEstabelecimentoId(null);
      }
    };

    buscarEstabelecimento();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="container mt-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👋 Bem-vindo, {nomeUsuario}</h2>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm"
        >
          Sair
        </button>
      </div>

      {/* CARDS */}
      <div className="row g-4">
        {/* COLABORADORES */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>👥 Colaboradores</h5>
            <p className="text-muted small">Gerencie sua equipe</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/colaboradores")}
            >
              Acessar
            </button>
          </div>
        </div>

        {/* ESTOQUE ENTRADAS */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>📦 Estoque Entradas</h5>
            <p className="text-muted small">Controle e monitoramento</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/admin/estabelecimento/${estabelecimentoId}/estoque`)}
            >
              Acessar
            </button>
          </div>
        </div>

        {/* ESTOQUE SAÍDAS */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>📦 Estoque Saídas</h5>
            <p className="text-muted small">Controle e monitoramento</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate( `/admin/estabelecimento/${estabelecimentoId}/registrar-saidas`)}
            >
              Acessar
            </button>
          </div>
        </div>

        {/* HISTÓRICO DE ESTOQUE */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>🕒 Histórico Estoque</h5>
            <p className="text-muted small">Veja alterações e movimentações</p>
            <button
              className="btn btn-primary btn-sm"
              disabled={!estabelecimentoId}
              onClick={() =>
                navigate(
                  (`/admin/estabelecimento/${estabelecimentoId}/historico-estoque`)
                )
              }
            >
              Acessar
            </button>
            {!estabelecimentoId && (
              <small className="text-danger d-block mt-2">
                Nenhum estabelecimento vinculado.
              </small>
            )}
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>🗂️ Categorias</h5>
            <p className="text-muted small">Gerencie produtos</p>
            <button
              className="btn btn-primary btn-sm"
              disabled={!estabelecimentoId}
              onClick={() =>
                navigate(
                  `/admin/estabelecimento/${estabelecimentoId}/categorias`
                )
              }
            >
              Acessar
            </button>
            {!estabelecimentoId && (
              <small className="text-danger d-block mt-2">
                Nenhum estabelecimento vinculado.
              </small>
            )}
          </div>
        </div>

        {/* FORNECEDORES */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>🚚 Fornecedores</h5>
            <p className="text-muted small">Controle de compras</p>
            <button
              className="btn btn-primary btn-sm"
              disabled={!estabelecimentoId}
              onClick={() =>
                navigate(
                  `/admin/estabelecimento/${estabelecimentoId}/fornecedores`
                )
              }
            >
              Acessar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
