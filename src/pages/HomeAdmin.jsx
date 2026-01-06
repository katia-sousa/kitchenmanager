import { Button, Card } from "react-bootstrap";

function PainelAdmin() {
  return (
    <Card className="p-4 shadow-lg">
      <h3 className="text-primary text-center mb-3">Painel do Administrador</h3>
      <p>Bem-vindo! Aqui você pode gerenciar estabelecimentos, funcionários e relatórios.</p>
      <div className="text-center">
        <Button variant="success" className="me-2">Gerenciar Estabelecimentos</Button>
        <Button variant="info">Ver Relatórios</Button>
      </div>
    </Card>
  );
}

export default PainelAdmin;
