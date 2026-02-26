// src/pages/HistoricoEstoque.jsx
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 🔹 import do contexto
import { db } from "../firebase/firebaseConfig";

export default function HistoricoEstoque() {
  // ✅ ID do estabelecimento vem da rota
  const { estabelecimentoId } = useParams();
  const { userData } = useAuth(); // 🔹 pega usuário logado
  const [empresaNome, setEmpresaNome] = useState("N/D");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!estabelecimentoId) return;

    async function carregarHistorico() {
      setLoading(true);
      try {
        // 🔹 Pega o documento do estabelecimento
        const estabRef = doc(db, "estabelecimentos", estabelecimentoId);
        const estabSnap = await getDoc(estabRef);
        if (estabSnap.exists()) {
          setEmpresaNome(estabSnap.data().nome || "N/D");
        }

        // 🔹 Pega a subcoleção historicoEstoque
        const ref = collection(db, "estabelecimentos", estabelecimentoId, "historicoEstoque");
        const q = query(ref, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistorico(list);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarHistorico();
  }, [estabelecimentoId]);

  return (
    <div className="container mt-4">
      <h3>📜 Histórico do Estoque</h3>

      {/* 🔹 Mostra usuário logado e ID do estabelecimento */}
      <p>
        <strong>Usuário logado:</strong> {userData?.nome || "—"}
      </p>
      <p>
        <strong>Empresa:</strong> {empresaNome}
      </p>

      {loading ? (
        <p>Carregando...</p>
      ) : historico.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Data</th>
              <th>Ação</th>
              <th>Produto</th>
              <th>Usuário</th>
              <th>Detalhes</th>
            </tr>
          </thead>

          <tbody>
            {historico.map((h) => (
              <tr key={h.id}>
                <td>
                  {h.createdAt?.toDate
                    ? h.createdAt.toDate().toLocaleString()
                    : "—"}
                </td>
                <td>{h.acao}</td>
                <td>{h.produto?.nome || h.produto?.depois?.nome || h.produto?.antes?.nome || "—"}</td>
                <td>{h.usuario?.nome || "Sistema"}</td>
                <td style={{ maxWidth: 400, wordBreak: "break-word" }}>
                  {h.acao === "editado" ? (
                    <>
                      <strong>Antes:</strong> {JSON.stringify(h.produto?.antes)}
                      <br />
                      <strong>Depois:</strong> {JSON.stringify(h.produto?.depois)}
                    </>
                  ) : (
                    JSON.stringify(h.produto)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
