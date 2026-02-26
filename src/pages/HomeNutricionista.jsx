import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";

function PainelNutricionista() {
  const [usuario, setUsuario] = useState(null);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [ativo, setAtivo] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!usuario) return;

    async function carregar() {
      try {
        // 🔗 Busca vínculos
        const q = query(
          collection(db, "nutricionista_estabelecimentos"),
          where("nutricionistaId", "==", usuario.uid)
        );

        const snap = await getDocs(q);

        const lista = [];

        for (const docV of snap.docs) {
          const estSnap = await getDoc(
            doc(db, "estabelecimentos", docV.data().estabelecimentoId)
          );

          if (estSnap.exists()) {
            lista.push({
              id: estSnap.id,
              ...estSnap.data(),
            });
          }
        }

        setEstabelecimentos(lista);
        if (lista.length === 1) setAtivo(lista[0].id);
      } catch (e) {
        console.error(e);
      }
    }

    carregar();
  }, [usuario]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="p-4 shadow">
      <h4 className="text-center mb-3">🥗 Painel do Nutricionista</h4>

      {estabelecimentos.length === 0 ? (
        <p className="text-muted text-center">
          Nenhum estabelecimento vinculado.
        </p>
      ) : (
        <>
          <Form.Select
            className="mb-3"
            value={ativo}
            onChange={(e) => setAtivo(e.target.value)}
          >
            <option value="">Selecione o estabelecimento</option>
            {estabelecimentos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </Form.Select>

          <div className="d-flex gap-3 justify-content-center">
            <Button
              disabled={!ativo}
              onClick={() => navigate(`/estoque-nutricionista/${ativo}`)}
            >
              📦 Estoque
            </Button>

            <Button
              variant="info"
              disabled={!ativo}
              onClick={() => navigate(`/relatorios/${ativo}`)}
            >
              📊 Relatórios
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

export default PainelNutricionista;
