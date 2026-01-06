import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";

function PainelColaborador() {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const colaboradorNome = userData?.nome || "";
  const [estabelecimentoNome, setEstabelecimentoNome] = useState("Carregando...");

  useEffect(() => {
    const carregarEstabelecimento = async () => {
      if (!userData) return;

      const estabelecimentoId = userData.estabelecimentoId;

      if (!estabelecimentoId) {
        setEstabelecimentoNome("ID não encontrado");
        return;
      }

      try {
        const ref = doc(db, "estabelecimentos", estabelecimentoId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setEstabelecimentoNome(snap.data().nome || "Sem nome cadastrado");
        } else {
          setEstabelecimentoNome("Estabelecimento não encontrado");
        }
      } catch (erro) {
        console.error("Erro ao carregar estabelecimento:", erro);
        setEstabelecimentoNome("Erro ao carregar");
      }
    };

    carregarEstabelecimento();
  }, [userData]);

  return (
    <Card className="p-4 shadow-lg">
      <h3 className="text-primary text-center mb-3">Painel do Colaborador</h3>

      <p><strong>Estabelecimento:</strong> {estabelecimentoNome}</p>
      <p><strong>Colaborador:</strong> {colaboradorNome}</p>

      <div className="text-center mt-3">
        <Button
          variant="warning"
          className="me-2"
          onClick={() => navigate("/home-colaborador")}
        >
          Dados do coloborador
        </Button>
        <Button
          variant="warning"
          className="me-2"
          onClick={() => navigate("/estoque")}
        >
          Registrar Entrada
        </Button>
         <Button
          variant="danger"  // cor diferente para diferenciar saída
          className="me-2"
          onClick={() => navigate("/registrar-saidas")}
        >
          Registrar Saída
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate(`/controle-estoque/${userData?.estabelecimentoId}`)}
        >
          Consultar Estoque
        </Button>
      </div>
    </Card>
  );
}

export default PainelColaborador;
