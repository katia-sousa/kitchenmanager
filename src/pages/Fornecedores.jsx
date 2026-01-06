import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  adicionarFornecedor,
  editarFornecedor,
  excluirFornecedor,
  listarFornecedores,
} from "../services/fornecedorService";

function Fornecedores() {
  const { id } = useParams(); // id do estabelecimento
  const [fornecedores, setFornecedores] = useState([]);
  const [novo, setNovo] = useState({
    nome: "",
    email: "",
    telefone: "",
    cnpj: "",
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    carregarFornecedores();
  }, [id]);

  const carregarFornecedores = async () => {
    try {
      const lista = await listarFornecedores(id);
      setFornecedores(lista);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novo.nome) return alert("Informe o nome do fornecedor!");

    try {
      await adicionarFornecedor(id, novo);
      setNovo({ nome: "", email: "", telefone: "", cnpj: "" });
      carregarFornecedores();
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      alert("Erro ao adicionar fornecedor.");
    }
  };

  const handleEdit = (f) => {
    setEditando(f);
    setNovo({
      nome: f.nome,
      email: f.email,
      telefone: f.telefone,
      cnpj: f.cnpj,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await editarFornecedor(editando.id, novo);
      setEditando(null);
      setNovo({ nome: "", email: "", telefone: "", cnpj: "" });
      carregarFornecedores();
    } catch (error) {
      console.error("Erro ao editar fornecedor:", error);
      alert("Erro ao atualizar fornecedor.");
    }
  };

  const handleDelete = async (idFornecedor) => {
    if (!window.confirm("Deseja realmente excluir este fornecedor?")) return;
    try {
      await excluirFornecedor(idFornecedor);
      carregarFornecedores();
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      alert("Erro ao excluir fornecedor.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Fornecedores</h3>

      <form onSubmit={editando ? handleUpdate : handleAdd} className="mb-3">
        <input
          placeholder="Nome do fornecedor"
          className="form-control mb-2"
          value={novo.nome}
          onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
          required
        />
        <input
          placeholder="E-mail"
          className="form-control mb-2"
          type="email"
          value={novo.email}
          onChange={(e) => setNovo({ ...novo, email: e.target.value })}
        />
        <input
          placeholder="Telefone"
          className="form-control mb-2"
          value={novo.telefone}
          onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
        />
        <input
          placeholder="CNPJ"
          className="form-control mb-2"
          value={novo.cnpj}
          onChange={(e) => setNovo({ ...novo, cnpj: e.target.value })}
        />

        <button className="btn btn-success w-100">
          {editando ? "Salvar Alterações" : "Adicionar Fornecedor"}
        </button>
        {editando && (
          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => {
              setEditando(null);
              setNovo({ nome: "", email: "", telefone: "", cnpj: "" });
            }}
          >
            Cancelar Edição
          </button>
        )}
      </form>

      {fornecedores.length === 0 ? (
        <p>Nenhum fornecedor cadastrado.</p>
      ) : (
        <ul className="list-group">
          {fornecedores.map((f) => (
            <li
              key={f.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{f.nome}</strong>
                <br />
                <small>{f.email || "Sem e-mail"} | {f.telefone || "Sem telefone"}</small>
                <br />
                <small>CNPJ: {f.cnpj || "Não informado"}</small>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(f)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(f.id)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Fornecedores;
