import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";

export default function PainelAdmin() {
  const navigate = useNavigate();
  const { userData, loading } = useAuth();

  // ✅ Correção: Hooks sempre executam, mas lógica roda com condições
  useEffect(() => {
    if (!loading && userData?.tipo !== "admin") {
      navigate("/login");
    }
  }, [loading, userData, navigate]);

  const estabelecimentoId = userData?.estabelecimentoId || null;
  const nomeUsuario = userData?.nome || "Administrador";

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

        {/* ESTOQUE */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>📦 Estoque Entradas</h5>
            <p className="text-muted small">Controle e monitoramento</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/estoque")}
            >
              Acessar
            </button>
          </div>
        </div>
        {/* ESTOQUE */}
        <div className="col-md-3">
          <div className="card text-center shadow p-3">
            <h5>📦 Estoque Saídas</h5>
            <p className="text-muted small">Controle e monitoramento</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/registrar-saidas")}
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
                  `/admin/estabelecimento/${estabelecimentoId}/historico-estoque`
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
