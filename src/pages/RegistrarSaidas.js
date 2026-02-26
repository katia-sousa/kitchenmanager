import { useEffect, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  editarItemEstoque,
  listarEstoque,
  registrarHistorico,
} from "../services/estoqueService";

export default function RegistrarSaidas() {
  const { userData } = useAuth();
  const { estabelecimentoId } = useParams();

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeSaida, setQuantidadeSaida] = useState("");
  const [quantidades, setQuantidades] = useState({});
  const [busca, setBusca] = useState("");
  const [scaneando, setScaneando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // 🔄 CARREGAR ESTOQUE
  const carregarProdutos = async () => {
    if (!estabelecimentoId) return;
    const lista = await listarEstoque(estabelecimentoId);
    setProdutos(lista);
  };

  useEffect(() => {
    carregarProdutos();
  }, [estabelecimentoId]);

  // 🔍 BUSCAR PRODUTO
  const buscarProduto = (valor) => {
    if (!valor) return;

    const termo = valor.toLowerCase();

    const produto = produtos.find(
      (p) =>
        p.codigoBarras === valor ||
        p.nome?.toLowerCase().includes(termo)
    );

    if (!produto) {
      setMensagem("❌ Produto não encontrado");
      return;
    }

    setProdutoSelecionado(produto);
    setQuantidadeSaida("");
    setMensagem(`✅ Produto selecionado: ${produto.nome}`);
    setScaneando(false);
  };

  // 🧠 FUNÇÃO CENTRAL DE SAÍDA
  const processarSaida = async (produto, quantidadeDigitada) => {
    const quantidade = quantidadeDigitada
      ? Math.abs(Number(quantidadeDigitada))
      : 1;

    if (quantidade <= 0) {
      alert("Quantidade inválida");
      return;
    }

    if (quantidade > produto.quantidade) {
      alert("Quantidade maior que o estoque");
      return;
    }

    const novaQuantidade = produto.quantidade - quantidade;

    try {
      await editarItemEstoque(produto.id, {
        quantidade: novaQuantidade,
      });

      await registrarHistorico(
        estabelecimentoId,
        "saida",
        {
          produtoId: produto.id,
          nome: produto.nome,
          quantidade,
          antes: produto.quantidade,
          depois: novaQuantidade,
        },
        userData
      );

      setMensagem(`✅ Saída registrada: ${produto.nome}`);

      setProdutoSelecionado(null);
      setQuantidadeSaida("");
      setBusca("");

      await carregarProdutos();
    } catch (error) {
      console.error(error);
      setMensagem("❌ Erro ao registrar saída");
    }
  };

  // 📤 SAÍDA VIA PESQUISA / SCANNER
  const registrarSaidaPesquisa = () => {
    if (!produtoSelecionado) return;
    processarSaida(produtoSelecionado, quantidadeSaida);
  };

  // 📤 SAÍDA VIA LISTA
  const registrarSaidaLista = (produto) => {
    const quantidade = quantidades[produto.id] || 1;
    processarSaida(produto, quantidade);

    setQuantidades((prev) => ({
      ...prev,
      [produto.id]: "",
    }));
  };

  // 🔄 estoque atualizado para pesquisa
  const produtoAtualizado = produtoSelecionado
    ? produtos.find((p) => p.id === produtoSelecionado.id)
    : null;

  return (
    <div className="container mt-4">
      <h3>📤 Registrar Saídas</h3>

      <input
        className="form-control mb-2"
        placeholder="Buscar por nome ou código"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
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

      {produtoAtualizado && (
        <div className="mt-4 border p-3 rounded">
          <h5>{produtoAtualizado.nome}</h5>
          <p>Estoque atual: {produtoAtualizado.quantidade}</p>

          <input
            type="number"
            className="form-control mb-2"
            placeholder="Quantidade (padrão 1)"
            value={quantidadeSaida}
            onChange={(e) => setQuantidadeSaida(e.target.value)}
          />

          <button
            className="btn btn-danger"
            onClick={registrarSaidaPesquisa}
          >
            Registrar Saída
          </button>
        </div>
      )}

      <hr />

      <h5>📦 Estoque</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Qtd</th>
            <th>Saída</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.categoria}</td>
              <td>{p.quantidade}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-outline-danger"
                  onClick={() => registrarSaidaLista(p)}
                >
                  ➖
                </button>

                <input
                  type="number"
                  className="form-control"
                  style={{ width: "80px" }}
                  placeholder="1"
                  value={quantidades[p.id] || ""}
                  onChange={(e) =>
                    setQuantidades({
                      ...quantidades,
                      [p.id]: e.target.value,
                    })
                  }
                />

                <button
                  className="btn btn-danger"
                  onClick={() => registrarSaidaLista(p)}
                >
                  Registrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mensagem && <p className="mt-3">{mensagem}</p>}
    </div>
  );
}
