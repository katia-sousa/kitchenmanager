import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { cadastrarEstabelecimento } from "../services/estabelecimentoService";

function CadastroEstabelecimento() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bloqueado, setBloqueado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultado = await cadastrarEstabelecimento({
        nome,
        cnpj,
        endereco,
        telefone,
      });

      if (resultado.tipo === "existente") {
        setNome(resultado.dados.nome);
        setEndereco(resultado.dados.endereco);
        setTelefone(resultado.dados.telefone);
        setBloqueado(true);

        alert(
          "CNPJ já cadastrado. O estabelecimento foi associado ao seu usuário."
        );
      } else {
        alert("Estabelecimento cadastrado com sucesso!");
      }

      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar estabelecimento: " + error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <Card className="p-4 shadow-lg w-100" style={{ maxWidth: "500px" }}>
        <h3 className="text-center mb-3 text-primary">
          Cadastro de Estabelecimento
        </h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome do Estabelecimento</Form.Label>
            <Form.Control
              type="text"
              value={nome}
              disabled={bloqueado}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>CNPJ</Form.Label>
            <Form.Control
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              type="text"
              value={endereco}
              disabled={bloqueado}
              onChange={(e) => setEndereco(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Telefone</Form.Label>
            <Form.Control
              type="text"
              value={telefone}
              disabled={bloqueado}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" variant="primary">
              Cadastrar
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default CadastroEstabelecimento;
