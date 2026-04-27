// src/pages/ControleEstoque.jsx
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";

function ControleEstoque() {
  const { userData } = useAuth();
  const { estabelecimentoId } = useParams();

  const [estabelecimento, setEstabelecimento] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estabelecimentoId) {
      console.warn("ControleEstoque: usuário não possui estabelecimento");
      setLoading(false);
      return;
    }

    async function carregarDados() {
      setLoading(true);
      try {
        // 🔹 Buscar nome do estabelecimento
        const ref = doc(db, "estabelecimentos", estabelecimentoId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setEstabelecimento({ id: snap.id, ...snap.data() });
        } else {
          setEstabelecimento(null);
        }

        // 🔹 Buscar todos os produtos do estabelecimento
        const estoqueRef = collection(db, "estoque");
        const q = query(estoqueRef, where("estabelecimentoId", "==", estabelecimentoId));
        const snapProdutos = await getDocs(q);

        const listaProdutos = snapProdutos.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome || "—",
            marca: data.marca || "—",
            validade: data.validade || "—",
            quantidade: data.quantidade ?? 0,
            categoria: typeof data.categoria === "string" ? data.categoria : data.categoria?.nome || "—",
            codigoBarras: data.codigoBarras || "—",
          };
        });

        setProdutos(listaProdutos);
      } catch (err) {
        console.error("Erro ao carregar dados do estoque:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [estabelecimentoId]);

  if (loading) {
    return <p className="text-center mt-4">Carregando dados do estoque...</p>;
  }

  return (
    <div className="container mt-4">
      <h3>📦 Controle de Estoque</h3>

      <p>
        <strong>Estabelecimento:</strong>{" "}
        {estabelecimento ? estabelecimento.nome : "Não encontrado"}
      </p>

      <p>
        <strong>Colaborador:</strong> {userData?.nome || "—"}
      </p>

      <hr />

      <h5>Itens do Estoque</h5>

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Marca</th>
              <th>Categoria</th>
              <th>Validade</th>
              <th>Quantidade</th>
              <th>Código de Barras</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.marca}</td>
                <td>{p.categoria}</td>
                <td>{p.validade}</td>
                <td>{p.quantidade}</td>
                <td>{p.codigoBarras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ControleEstoque;
