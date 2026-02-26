import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";

function EstoqueNutricionista() {
  const { id } = useParams(); // id do estabelecimento
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEstoque() {
      try {
        const q = query(
          collection(db, "estoque"),
          where("estabelecimentoId", "==", id)
        );

        const snap = await getDocs(q);

        const lista = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProdutos(lista);
      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarEstoque();
  }, [id]);

  // 🔹 Verifica se produto está próximo da validade (≤ 30 dias)
  const isProximoValidade = (validade) => {
    if (!validade) return false;

    const hoje = new Date();
    const dataValidade = new Date(validade);
    const diff = (dataValidade - hoje) / (1000 * 60 * 60 * 24);

    return diff <= 30;
  };

  // 🔹 Agrupa produtos por categoria
  const produtosPorCategoria = useMemo(() => {
    return produtos.reduce((acc, p) => {
      const categoria =
        typeof p.categoria === "string"
          ? p.categoria
          : p.categoria?.nome || "Sem categoria";

      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(p);
      return acc;
    }, {});
  }, [produtos]);

  if (loading) {
    return <p className="text-center mt-4">Carregando estoque...</p>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">📦 Estoque do Estabelecimento</h3>

      {Object.keys(produtosPorCategoria).length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        Object.entries(produtosPorCategoria).map(
          ([categoria, itens]) => (
            <div key={categoria} className="mb-4">
              <h5 className="border-bottom pb-1">
                🗂️ {categoria}
              </h5>

              <ul className="list-group mt-2">
                {itens.map((p) => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{p.nome}</strong>
                      <div className="text-muted small">
                        Quantidade: {p.quantidade}
                      </div>
                    </div>

                    {isProximoValidade(p.validade) && (
                      <span
                        title="Produto próximo da validade"
                        style={{ fontSize: "1.4rem" }}
                      >
                        ⚠️
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        )
      )}
    </div>
  );
}

export default EstoqueNutricionista;
