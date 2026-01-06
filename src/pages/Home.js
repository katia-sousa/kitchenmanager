import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";

function Home() {
  const { id } = useParams(); // ID do estabelecimento
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);

  useEffect(() => {
    const carregarEstabelecimento = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }

        const docRef = doc(db, "estabelecimentos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          setEstabelecimento({ id: docSnap.id, ...dados });

          if (dados.responsavel_uid === user.uid) setTipoUsuario("admin");
          else setTipoUsuario("colaborador");
        } else {
          console.warn("Estabelecimento não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do estabelecimento:", error);
      }
    };

    carregarEstabelecimento();
  }, [id, navigate]);

  if (!estabelecimento) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p>Carregando informações do estabelecimento...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-3">Bem-vindo ao KitchenManager!</h2>
      <p>
        Estabelecimento ativo:{" "}
        <strong className="text-primary">{estabelecimento.nome}</strong>
      </p>

      {tipoUsuario === "admin" && (
        <div className="mt-4">
          <h4 className="mb-3">Painel do Administrador</h4>
          <div className="list-group shadow-sm">
            <button
              className="list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => navigate(`/colaboradores/${id}`)}
            >
              👥 <span className="ms-2">Gerenciar Colaboradores</span>
            </button>
            <button
              className="list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => navigate(`/controle-estoque/${id}`)}
            >
              📦 <span className="ms-2">Controle de Estoque</span>
            </button>
            <button
              className="list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => navigate(`/categorias/${id}`)}
            >
              🗂️ <span className="ms-2">Categorias</span>
            </button>
            <button
              className="list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => navigate(`/fornecedores/${id}`)}
            >
              🚚 <span className="ms-2">Fornecedores</span>
            </button>
          </div>
        </div>
      )}

      {tipoUsuario === "colaborador" && (
        <div className="mt-4">
          <h4 className="mb-3">Painel do Colaborador</h4>
          <div className="list-group shadow-sm">
            <button
              className="list-group-item list-group-item-action"
              onClick={() => navigate(`/categoria/${id}/camera-fria`)}
            >
              ❄️ Câmara Fria
            </button>
            <button
              className="list-group-item list-group-item-action"
              onClick={() => navigate(`/categoria/${id}/quimica`)}
            >
              🧴 Câmara Química
            </button>
            <button
              className="list-group-item list-group-item-action"
              onClick={() => navigate(`/categoria/${id}/seca`)}
            >
              🥫 Câmara Seca
            </button>
            <button
              className="list-group-item list-group-item-action"
              onClick={() => navigate(`/categoria/${id}/congelada`)}
            >
              🧊 Câmara Congelada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
