import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    adicionarProduto,
    editarProduto,
    excluirProduto,
    listarProdutos,
} from "../services/produtoService";

function CategoriaDetalhe() {
  const { id, categoria } = useParams(); // id do estabelecimento e nome da categoria
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    validade: "",
    quantidade: "",
    unidade: "",
  });

  useEffect(() => {
    carregarProdutos();
  }, [id, categoria]);

  const carregarProdutos = async () => {
    const lista = await listarProdutos(id, categoria);
    setProdutos(lista);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await adicionarProduto(id, categoria, novoProduto);
    setNovoProduto({ nome: "", validade: "", quantidade: "", unidade: "" });
    carregarProdutos();
  };

  const handleDelete = async (produtoId) => {
    await excluirProduto(produtoId);
    carregarProdutos();
  };

  const handleEdit = async (produtoId) => {
    const novoNome = prompt("Novo nome do produto:");
    if (!novoNome) return;
    await editarProduto(produtoId, { nome: novoNome });
    carregarProdutos();
  };

  return (
    <div className="container mt-4">
      <h3>
        Categoria: <strong>{categoria.toUpperCase()}</strong>
      </h3>

      <form onSubmit={handleAdd} className="mb-3">
        <input
          placeholder="Nome do Produto"
          className="form-control mb-2"
          value={novoProduto.nome}
          onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
          required
        />
        <input
          type="date"
          className="form-control mb-2"
          value={novoProduto.validade}
          onChange={(e) => setNovoProduto({ ...novoProduto, validade: e.target.value })}
          required
        />
        <input
          placeholder="Quantidade"
          className="form-control mb-2"
          type="number"
          value={novoProduto.quantidade}
          onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
          required
        />
        <input
          placeholder="Unidade (ex: kg, un, L)"
          className="form-control mb-2"
          value={novoProduto.unidade}
          onChange={(e) => setNovoProduto({ ...novoProduto, unidade: e.target.value })}
          required
        />
        <button className="btn btn-primary w-100">Adicionar Produto</button>
      </form>

      <ul className="list-group">
        {produtos.length === 0 ? (
          <li className="list-group-item text-center text-muted">
            Nenhum produto cadastrado ainda.
          </li>
        ) : (
          produtos.map((p) => (
            <li
              key={p.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{p.nome}</strong> <br />
                <small>
                  Validade: {p.validade} | {p.quantidade} {p.unidade}
                </small>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(p.id)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(p.id)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default CategoriaDetalhe;
