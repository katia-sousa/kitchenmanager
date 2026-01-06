import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarEstabelecimentosDoUsuario } from "../services/estabelecimentoService";

function SelecionarEstabelecimento() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    // 🔥 Espera o Firebase garantir que o usuário está logado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const estabelecimentos = await listarEstabelecimentosDoUsuario(user.uid);
        setLista(estabelecimentos);
      } else {
        navigate("/login");
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (carregando) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h3>Selecione um Estabelecimento</h3>

      {lista.length === 0 ? (
        <>
          <p className="mt-3">Nenhum estabelecimento encontrado.</p>
          <button
            className="btn btn-success"
            onClick={() => navigate("/cadastro-estabelecimento")}
          >
            Cadastrar Novo Estabelecimento
          </button>
        </>
      ) : (
        <>
          <ul className="list-group mb-3 mt-3">
            {lista.map((e) => (
              <li
                key={e.id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                onClick={() => navigate(`/home/${e.id}`)}
                style={{ cursor: "pointer" }}
              >
                <span>{e.nome}</span>
                <i className="bi bi-chevron-right"></i>
              </li>
            ))}
          </ul>

          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/cadastro-estabelecimento")}
          >
            + Adicionar Novo Estabelecimento
          </button>
        </>
      )}
    </div>
  );
}

export default SelecionarEstabelecimento;
