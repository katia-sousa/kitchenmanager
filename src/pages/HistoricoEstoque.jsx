// src/pages/HistoricoEstoque.jsx
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";

export default function HistoricoEstoque() {
  const { userData } = useAuth();
  const estabelecimentoId = userData?.estabelecimentoId;
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!estabelecimentoId) return;

    async function carregar() {
      setLoading(true);
      try {
        const ref = collection(db, "estabelecimentos", estabelecimentoId, "historicoEstoque");
        const q = query(ref, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHistorico(list);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [estabelecimentoId]);

  return (
    <div className="container mt-4">
      <h3>Histórico do Estoque</h3>
      {loading ? (
        <p>Carregando...</p>
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
                <td>{h.createdAt?.toDate ? h.createdAt.toDate().toLocaleString() : "—"}</td>
                <td>{h.acao}</td>
                <td>{h.produto?.nome || (h.produto?.antes?.nome ?? h.produto?.depois?.nome) || "—"}</td>
                <td>{h.usuario?.nome || "—"}</td>
                <td style={{ maxWidth: 400, wordBreak: "break-word" }}>
                  {h.acao === "editado" ? (
                    <>
                      <strong>Antes:</strong>{" "}
                      {h.produto?.antes ? JSON.stringify(h.produto.antes) : "—"}
                      <br />
                      <strong>Depois:</strong>{" "}
                      {h.produto?.depois ? JSON.stringify(h.produto.depois) : "—"}
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
