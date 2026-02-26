import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  adicionarCategoria,
  editarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../services/categoriaService";

function Categorias() {
  const { estabelecimentoId } = useParams(); // ✅ CORRETO
  const { userData } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [nova, setNova] = useState({ nome: "" });
  const [editando, setEditando] = useState(null);
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");

  useEffect(() => {
    if (!estabelecimentoId) return; // ⛔ evita erro
    carregarCategorias();
    carregarEstabelecimento();
  }, [estabelecimentoId]);

  // 🔹 Carrega categorias
  const carregarCategorias = async () => {
    try {
      const lista = await listarCategorias(estabelecimentoId);
      setCategorias(lista);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  // 🔹 Carrega nome do estabelecimento
  const carregarEstabelecimento = async () => {
    try {
      const ref = doc(db, "estabelecimentos", estabelecimentoId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setNomeEstabelecimento(snap.data().nome);
      } else {
        setNomeEstabelecimento("Estabelecimento não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar estabelecimento:", error);
      setNomeEstabelecimento("Erro ao carregar estabelecimento");
    }
  };

  // ➕ Adicionar
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nova.nome.trim()) return;

    try {
      await adicionarCategoria(estabelecimentoId, nova);
      setNova({ nome: "" });
      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Erro ao adicionar categoria.");
    }
  };

  // ✏️ Editar
  const handleEdit = (cat) => {
    setEditando(cat);
    setNova({ nome: cat.nome });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!nova.nome.trim()) return;

    try {
      await editarCategoria(editando.id, { nome: nova.nome });
      setEditando(null);
      setNova({ nome: "" });
      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
    }
  };

  // 🗑️ Excluir
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      await excluirCategoria(id);
      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Categorias</h3>

      <p className="text-muted">
        Estabelecimento: <strong>{nomeEstabelecimento}</strong>
      </p>

      <p className="text-muted">
        Usuário: <strong>{userData?.nome}</strong>
      </p>

      <form onSubmit={editando ? handleUpdate : handleAdd} className="mb-3">
        <input
          className="form-control mb-2"
          placeholder="Nome da categoria"
          value={nova.nome}
          onChange={(e) => setNova({ nome: e.target.value })}
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
            Cancelar
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
              className="list-group-item d-flex justify-content-between"
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
