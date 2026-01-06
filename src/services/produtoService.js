// src/services/produtoService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
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
 * Lista produtos do estabelecimento.
 */
export async function listarProdutos(estabelecimentoId) {
  try {
    const ref = collection(db, "estabelecimentos", estabelecimentoId, "produtos");
    const snap = await getDocs(ref);
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
    const ref = collection(db, "estabelecimentos", estabelecimentoId, "produtos");

    const novo = {
      nome: dados.nome || "",
      validade: dados.validade || null,
      quantidade: Number(dados.quantidade) || 0,
      categoria: dados.categoria || "",
      criadoPor: {
        uid: usuario?.uid || null,
        nome: usuario?.nome || "Sistema",
      },
      criadoEm: serverTimestamp(),
    };

    const docRef = await addDoc(ref, novo);

    await gerarHistorico(estabelecimentoId, "adicionado", { id: docRef.id, ...novo }, usuario);

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
    const refDoc = doc(db, "estabelecimentos", estabelecimentoId, "produtos", produtoId);

    const beforeSnap = await getDoc(refDoc);
    const beforeData = beforeSnap.exists() ? { id: beforeSnap.id, ...beforeSnap.data() } : null;

    const atualizado = {
      nome: dados.nome,
      validade: dados.validade || null,
      quantidade: Number(dados.quantidade) || 0,
      categoria: dados.categoria || "",
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
    const refDoc = doc(db, "estabelecimentos", estabelecimentoId, "produtos", produtoId);
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
