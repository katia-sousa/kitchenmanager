// src/services/produtoService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Registra ações no histórico do estabelecimento.
 */
async function gerarHistorico(estabelecimentoId, acao, produto, usuario) {
  try {
    const ref = collection(
      db,
      "estabelecimentos",
      estabelecimentoId,
      "historicoEstoque"
    );

    const registro = {
      acao, // exemplo: "adicionado", "editado", "excluido"
      produto,
      usuario: {
        uid: usuario?.uid || null,
        nome: usuario?.nome || "Sistema",
        tipo: usuario?.tipo || null,
      },
      createdAt: serverTimestamp(),
    };

    await addDoc(ref, registro);
  } catch (error) {
    console.error("Erro ao gerar histórico:", error);
  }
}
/**
 * Soma quantidade de um produto existente (mesmo lote).
 */
export async function somarQuantidadeProduto(
  estabelecimentoId,
  produtoId,
  quantidade,
  usuario
) {
  try {
    const refDoc = doc(db, "estoque", produtoId);

    await updateDoc(refDoc, {
      quantidade: increment(Number(quantidade)),
      atualizadoPor: {
        uid: usuario?.uid || null,
        nome: usuario?.nome || "Sistema",
      },
      atualizadoEm: serverTimestamp(),
    });

    await gerarHistorico(
      estabelecimentoId,
      "quantidade_somada",
      { produtoId, quantidade },
      usuario
    );

    return true;
  } catch (error) {
    console.error("Erro ao somar quantidade:", error);
    return false;
  }
}

/**
 * Lista produtos do estabelecimento.
 */
export async function listarProdutos(estabelecimentoId) {
  try {
    const q = query(
      collection(db, "estoque"),
      where("estabelecimentoId", "==", estabelecimentoId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return [];
  }
}

/**
 * Adiciona produto.
 */
export async function adicionarProduto(estabelecimentoId, dados, usuario) {
  try {
    const ref = collection(db, "estoque");

    const novo = {
      estabelecimentoId,
      nome: dados.nome || "",
      validade: dados.validade || null,
      quantidade: Number(dados.quantidade) || 0,
      categoria: dados.categoria || "",
      marca: dados.marca || "",
      codigoBarras: dados.codigoBarras || "",
      loteDiferente: dados.loteDiferente || false,
      criadoPor: {
        uid: usuario?.uid || null,
        nome: usuario?.nome || "Sistema",
      },
      criado_em: serverTimestamp(),
    };

    const docRef = await addDoc(ref, novo);

    await gerarHistorico(
      estabelecimentoId,
      "adicionado",
      { id: docRef.id, ...novo },
      usuario
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    return null;
  }
}

/**
 * Edita produto.
 */
export async function editarProduto(estabelecimentoId, produtoId, dados, usuario) {
  try {
    const refDoc = doc(db, "estoque", produtoId);

    const beforeSnap = await getDoc(refDoc);
    const beforeData = beforeSnap.exists() ? { id: beforeSnap.id, ...beforeSnap.data() } : null;

    const atualizado = {
      nome: dados.nome,
      validade: dados.validade || null,
      quantidade: Number(dados.quantidade) || 0,
      categoria: dados.categoria || "",
      marca: dados.marca || "",
      atualizadoPor: {
        uid: usuario?.uid || null,
        nome: usuario?.nome || "Sistema",
      },
      atualizadoEm: serverTimestamp(),
    };

    await updateDoc(refDoc, atualizado);

    await gerarHistorico(estabelecimentoId, "editado", {
      antes: beforeData,
      depois: { id: produtoId, ...atualizado },
    }, usuario);

    return true;
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    return false;
  }
}

/**
 * Exclui produto.
 */
export async function excluirProduto(estabelecimentoId, produtoId, usuario) {
  try {
    const refDoc = doc(db, "estoque", produtoId);
    const snap = await getDoc(refDoc);
    const antes = snap.exists() ? { id: snap.id, ...snap.data() } : { id: produtoId };

    await deleteDoc(refDoc);

    await gerarHistorico(estabelecimentoId, "excluido", { antes }, usuario);

    return true;
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return false;
  }
}
export async function salvarProdutoInteligente(
  estabelecimentoId,
  dados,
  usuario
) {
  try {
    const produtos = await listarProdutos(estabelecimentoId);

    // 🔍 MESMO LOTE (codigo + validade + marca)
    const produtoExato = produtos.find(
      (p) =>
        p.codigoBarras === dados.codigoBarras &&
        p.validade === dados.validade &&
        p.marca === dados.marca
    );

    if (produtoExato) {
      await somarQuantidadeProduto(
        estabelecimentoId,
        produtoExato.id,
        dados.quantidade,
        usuario
      );

      return { tipo: "somado" };
    }

    // 🔍 EXISTE MESMO CÓDIGO MAS LOTE DIFERENTE?
    const loteDiferente = produtos.some(
      (p) =>
        p.codigoBarras === dados.codigoBarras &&
        (p.validade !== dados.validade || p.marca !== dados.marca)
    );

    const novoId = await adicionarProduto(
      estabelecimentoId,
      { ...dados, loteDiferente },
      usuario
    );

    return { tipo: "novo", id: novoId };

  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return { erro: true };
  }
}