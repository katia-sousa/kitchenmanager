// src/pages/Estoque.jsx
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { listarCategorias } from "../services/categoriaService";
import {
  editarItemEstoque,
  excluirItemEstoque,
  listarEstoque,
  registrarHistorico,
} from "../services/estoqueService";
import {
  salvarProdutoInteligente
} from "../services/produtoService";

function Estoque() {
  const { userData } = useAuth();
  const userTipo = userData?.tipo;
  const { estabelecimentoId } = useParams(); // ✅ FONTE ÚNICA E CONFIÁVEL

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [empresaNome, setEmpresaNome] = useState("N/D");

  const [novo, setNovo] = useState({
    nome: "",
    validade: "",
    quantidade: "",
    categoria: "",
    codigoBarras: "",
    marca: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [editando, setEditando] = useState({
    nome: "",
    validade: "",
    quantidade: "",
    categoria: "",
    codigoBarras: "",
    marca: "",
  });

  const [scannerAberto, setScannerAberto] = useState(false);

  // 🔄 CARREGAR NOME DA EMPRESA
  const carregarEmpresa = useCallback(async () => {
    if (!estabelecimentoId) return;
    try {
      const ref = doc(db, "estabelecimentos", estabelecimentoId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setEmpresaNome(snap.data().nome || "N/D");
      }
    } catch (e) {
      console.error("Erro ao carregar empresa:", e);
    }
  }, [estabelecimentoId]);

  // 🔄 CARREGAR CATEGORIAS
  const carregarCategorias = useCallback(async () => {
    if (!estabelecimentoId) return;
    try {
      const lista = await listarCategorias(estabelecimentoId);
      setCategorias(lista);
    } catch (e) {
      console.error("Erro ao carregar categorias:", e);
    }
  }, [estabelecimentoId]);

  // 🔄 CARREGAR PRODUTOS
  const carregarProdutos = useCallback(async () => {
    if (!estabelecimentoId) return;
    try {
      const lista = await listarEstoque(estabelecimentoId);
      const produtosFormatados = lista.map((p) => ({
        ...p,
        categoria:
          typeof p.categoria === "string"
            ? p.categoria
            : p.categoria?.nome || "",
      }));
      setProdutos(produtosFormatados);
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (!estabelecimentoId) return;
    carregarEmpresa();
    carregarCategorias();
    carregarProdutos();
  }, [
    estabelecimentoId,
    carregarEmpresa,
    carregarCategorias,
    carregarProdutos,
  ]);

  // ➕ ADICIONAR PRODUTO
 const handleAdd = async (e) => {
  e.preventDefault();

  if (!novo.nome || !novo.quantidade || !novo.validade || !novo.categoria) {
    return alert("Preencha todos os campos!");
  }

  try {
    const resultado = await salvarProdutoInteligente(
      estabelecimentoId,
      novo,
      userData
    );

    if (resultado.tipo === "somado") {
      alert("Quantidade somada ao lote existente!");
    } else if (resultado.tipo === "novo") {
      alert("Novo produto criado!");
    } else {
      alert("Erro ao salvar produto.");
    }

    setNovo({
      nome: "",
      validade: "",
      quantidade: "",
      categoria: "",
      codigoBarras: "",
      marca: "",
    });

    carregarProdutos();

  } catch (error) {
    console.error(error);
    alert("Erro ao adicionar produto.");
  }
};

  //Autopreenchimento
  useEffect(() => {
    if (!novo.codigoBarras) return;

    const existente = produtos.find(
      (p) => p.codigoBarras === novo.codigoBarras,
    );

    if (existente) {
      setNovo((prev) => ({
        ...prev,
        nome: existente.nome,
        categoria: existente.categoria,
        marca: existente.marca || "",
      }));
    }
  }, [novo.codigoBarras, produtos]);

  // ✏️ INICIAR EDIÇÃO
  const iniciarEdicao = (prod) => {
    setEditandoId(prod.id);
    setEditando({ ...prod });
  };

  // 💾 SALVAR EDIÇÃO
  const salvarEdicao = async () => {
    try {
      const produtoAntes = produtos.find((p) => p.id === editandoId);

      await editarItemEstoque(editandoId, {
        ...editando,
        quantidade: Number(editando.quantidade),
        categoria: String(editando.categoria),
      });

      await registrarHistorico(
        estabelecimentoId,
        "editado",
        { antes: produtoAntes, depois: editando },
        userData,
      );

      setEditandoId(null);
      carregarProdutos();
      alert("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      alert("Erro ao atualizar produto.");
    }
  };

  // ❌ EXCLUIR PRODUTO
  const handleDelete = async (produto) => {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;

    try {
      await excluirItemEstoque(produto.id);
      await registrarHistorico(
        estabelecimentoId,
        "deletado",
        produto,
        userData,
      );

      carregarProdutos();
      alert("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto.");
    }
  };

  const cancelarEdicao = () => setEditandoId(null);

  // 📷 SCANNER DE CÓDIGO DE BARRAS
  const handleScan = (result) => {
    if (result) {
      setNovo({ ...novo, codigoBarras: result.text });
      setScannerAberto(false);
    }
  };

  const handleError = (err) => {
    console.error("Erro no scanner:", err);
  };

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="mb-4">
        <h1>Estoque</h1>
        <p>
          Empresa: <strong>{empresaNome}</strong>
        </p>
        <p>
          Usuário: <strong>{userData?.nome || "N/D"}</strong>
        </p>
      </div>

      {/* FORMULÁRIO */}
      <div className="mb-4">
        <form onSubmit={handleAdd}>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Nome"
              className="form-control"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="date"
              className="form-control"
              value={novo.validade}
              onChange={(e) => setNovo({ ...novo, validade: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="number"
              placeholder="Quantidade"
              className="form-control"
              value={novo.quantidade}
              onChange={(e) => setNovo({ ...novo, quantidade: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Marca"
              className="form-control"
              value={novo.marca}
              onChange={(e) => setNovo({ ...novo, marca: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <select
              className="form-control"
              value={novo.categoria}
              onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
              required
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          {/* Código de barras */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Código de Barras"
              className="form-control"
              value={novo.codigoBarras}
              onChange={(e) =>
                setNovo({ ...novo, codigoBarras: e.target.value })
              }
            />
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-1"
              onClick={() => setScannerAberto(!scannerAberto)}
            >
              {scannerAberto ? "Fechar Scanner" : "Escanear Código de Barras"}
            </button>
          </div>

          {scannerAberto && (
            <div className="mb-2">
              <BarcodeScannerComponent
                width={300}
                height={200}
                onUpdate={(err, result) => {
                  if (result) handleScan(result);
                  if (err) handleError(err);
                }}
              />
            </div>
          )}

          <button type="submit" className="btn btn-success w-100 mt-2">
            Adicionar Produto
          </button>

          {editandoId && (
            <button
              type="button"
              className="btn btn-secondary w-100 mt-1"
              onClick={cancelarEdicao}
            >
              Cancelar Edição
            </button>
          )}
        </form>
      </div>

      {/* LISTA DE PRODUTOS */}
      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Validade</th>
              <th>Qtde</th>
              <th>Categoria</th>
              <th>Código de Barras</th>
              <th>Criado Por</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                {editandoId === p.id ? (
                  <>
                    <td>
                      <input
                        className="form-control"
                        value={editando.nome}
                        onChange={(e) =>
                          setEditando({ ...editando, nome: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control"
                        value={editando.validade}
                        onChange={(e) =>
                          setEditando({ ...editando, validade: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={editando.quantidade}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            quantidade: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={editando.categoria}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            categoria: e.target.value,
                          })
                        }
                      >
                        {categorias.map((c) => (
                          <option key={c.id} value={c.nome}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={editando.codigoBarras || ""}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            codigoBarras: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>{p.criadoPor?.nome || "Sistema"}</td>
                    <td className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={salvarEdicao}
                      >
                        Salvar
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={cancelarEdicao}
                      >
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {p.nome}
                      {p.loteDiferente && (
                        <span title="Lote com validade ou marca diferente">
                          ⚠️
                        </span>
                      )}
                    </td>
                    <td>{p.validade}</td>
                    <td>{p.quantidade}</td>
                    <td>{p.categoria}</td>
                    <td>{p.codigoBarras || "-"}</td>
                    <td>{p.criadoPor?.nome || "Sistema"}</td>
                    <td className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => iniciarEdicao(p)}
                      >
                        Editar
                      </button>

                      {userTipo === "admin" && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(p)}
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Estoque;
