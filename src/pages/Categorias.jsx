import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Contexto para pegar usuário logado
import { db } from "../firebase/firebaseConfig";
import {
  adicionarCategoria,
  editarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../services/categoriaService";

function Categorias() {
  const { id } = useParams(); // id do estabelecimento
  const { userData } = useAuth(); // usuário logado
  const [categorias, setCategorias] = useState([]);
  const [nova, setNova] = useState({ nome: "" });
  const [editando, setEditando] = useState(null);
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");

  useEffect(() => {
    carregarCategorias();
    carregarEstabelecimento();
  }, [id]);

  // Carrega categorias
  const carregarCategorias = async () => {
    try {
      const lista = await listarCategorias(id);
      setCategorias(lista);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      alert("Erro ao carregar categorias.");
    }
  };

  // Carrega o nome do estabelecimento
  const carregarEstabelecimento = async () => {
    try {
      const estRef = doc(db, "estabelecimentos", id);
      const estSnap = await getDoc(estRef);
      if (estSnap.exists()) {
        setNomeEstabelecimento(estSnap.data().nome);
      } else {
        setNomeEstabelecimento("Estabelecimento não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar estabelecimento:", error);
      setNomeEstabelecimento("Erro ao carregar estabelecimento");
    }
  };

  // Adicionar categoria
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nova.nome.trim()) return alert("Informe o nome da categoria!");

    try {
      await adicionarCategoria(id, nova);
      setNova({ nome: "" });
      carregarCategorias();
      alert("Categoria adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Erro ao adicionar categoria.");
    }
  };

  // Editar categoria
  const handleEdit = (cat) => {
    setEditando(cat);
    setNova({ nome: cat.nome });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!nova.nome.trim()) return alert("Informe o nome da categoria!");

    try {
      await editarCategoria(editando.id, nova);
      setEditando(null);
      setNova({ nome: "" });
      carregarCategorias();
      alert("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
      alert("Erro ao atualizar categoria.");
    }
  };

  // Excluir categoria
  const handleDelete = async (idCat) => {
    if (!window.confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      await excluirCategoria(idCat);
      carregarCategorias();
      alert("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao excluir categoria.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Categorias</h3>
      <p className="text-muted mb-2">
        Estabelecimento: <strong>{nomeEstabelecimento}</strong>
      </p>
      <p className="text-muted mb-3">
        Usuário logado: <strong>{userData?.nome || "Funcionário"}</strong>
      </p>

      <form onSubmit={editando ? handleUpdate : handleAdd} className="mb-3">
        <input
          placeholder="Nome da categoria"
          className="form-control mb-2"
          value={nova.nome}
          onChange={(e) => setNova({ nome: e.target.value })}
          required
        />
        <button className="btn btn-success w-100">
          {editando ? "Salvar Alterações" : "Adicionar Categoria"}
        </button>
        {editando && (
          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => {
              setEditando(null);
              setNova({ nome: "" });
            }}
          >
            Cancelar Edição
          </button>
        )}
      </form>

      {categorias.length === 0 ? (
        <p>Nenhuma categoria cadastrada.</p>
      ) : (
        <ul className="list-group">
          {categorias.map((c) => (
            <li
              key={c.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <strong>{c.nome}</strong>
              <div>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(c)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(c.id)}
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

export default Categorias;
