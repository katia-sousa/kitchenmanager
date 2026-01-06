import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { registrarHistorico } from "../services/estoqueService";

export default function RegistrarSaidas() {
  const { userData } = useAuth();
  const estabelecimentoId = userData?.estabelecimentoId;

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeSaida, setQuantidadeSaida] = useState("");
  const [busca, setBusca] = useState("");
  const [scaneando, setScaneando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // 🔄 Carregar produtos do estoque
  useEffect(() => {
    if (!estabelecimentoId) return;

    async function carregarProdutos() {
      const q = query(
        collection(db, "estoque"),
        where("estabelecimentoId", "==", estabelecimentoId)
      );
      const snap = await getDocs(q);
      setProdutos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    carregarProdutos();
  }, [estabelecimentoId]);

  // 🔍 Buscar produto por nome ou código de barras
  const buscarProduto = (valor) => {
    if (!valor) return;

    const termo = valor.toLowerCase();

    const produto = produtos.find(p =>
      p.codigoBarras === valor ||
      p.nome.toLowerCase().includes(termo)
    );

    if (!produto) {
      setMensagem("❌ Produto não encontrado");
      return;
    }

    setProdutoSelecionado(produto);
    setQuantidadeSaida("");
    setMensagem(`Produto selecionado: ${produto.nome}`);
    setScaneando(false);
  };

  // 📤 Registrar saída
  const registrarSaida = async () => {
    if (!produtoSelecionado) return;

    const quantidade = quantidadeSaida ? Number(quantidadeSaida) : 1;

    if (quantidade > produtoSelecionado.quantidade) {
      alert("Quantidade maior que o estoque disponível");
      return;
    }

    const novaQuantidade = produtoSelecionado.quantidade - quantidade;

    await updateDoc(doc(db, "estoque", produtoSelecionado.id), {
      quantidade: novaQuantidade
    });

    await registrarHistorico(
      estabelecimentoId,
      "saida",
      {
        nome: produtoSelecionado.nome,
        codigoBarras: produtoSelecionado.codigoBarras || "—",
        quantidade,
        antes: produtoSelecionado.quantidade,
        depois: novaQuantidade
      },
      userData
    );

    setProdutoSelecionado(null);
    setQuantidadeSaida("");
    setBusca("");
    setMensagem("✅ Saída registrada com sucesso");

    // 🔄 Recarregar estoque
    const q = query(
      collection(db, "estoque"),
      where("estabelecimentoId", "==", estabelecimentoId)
    );
    const snap = await getDocs(q);
    setProdutos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  return (
    <div className="container mt-4">
      <h3>📤 Registrar Saída</h3>
      <p><strong>Colaborador:</strong> {userData?.nome}</p>

      {/* BUSCA */}
      <input
        className="form-control mb-2"
        placeholder="Buscar por nome ou código de barras"
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      <button
        className="btn btn-primary me-2"
        onClick={() => buscarProduto(busca)}
      >
        Buscar
      </button>

      <button
        className="btn btn-secondary"
        onClick={() => setScaneando(!scaneando)}
      >
        {scaneando ? "Fechar Scanner" : "Escanear Código"}
      </button>

      {/* SCANNER */}
      {scaneando && (
        <div className="mt-3">
          <BarcodeScannerComponent
            width={300}
            height={200}
            onUpdate={(err, result) => {
              if (result) buscarProduto(result.text);
            }}
          />
        </div>
      )}

      {/* PRODUTO SELECIONADO */}
      {produtoSelecionado && (
        <div className="mt-4">
          <p><strong>Produto:</strong> {produtoSelecionado.nome}</p>
          <p><strong>Código de Barras:</strong> {produtoSelecionado.codigoBarras || "—"}</p>
          <p><strong>Estoque Atual:</strong> {produtoSelecionado.quantidade}</p>

          <input
            type="number"
            className="form-control mb-2"
            placeholder="Quantidade (padrão = 1)"
            value={quantidadeSaida}
            onChange={e => setQuantidadeSaida(e.target.value)}
            min="1"
            max={produtoSelecionado.quantidade}
          />

          <button className="btn btn-danger" onClick={registrarSaida}>
            Registrar Saída
          </button>
        </div>
      )}

      {mensagem && <p className="mt-3">{mensagem}</p>}

      <hr />

      {/* TABELA */}
      <h5>Produtos em Estoque</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código de Barras</th>
            <th>Categoria</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(p => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.codigoBarras || "—"}</td>
              <td>{p.categoria}</td>
              <td>{p.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
