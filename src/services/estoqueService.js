// src/services/estoqueService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Adiciona um item ao estoque do estabelecimento
 */
export async function adicionarItemEstoque(estabelecimentoId, item) {
  try {
    const ref = collection(db, "estoque");
    await addDoc(ref, {
      ...item,
      estabelecimentoId,
      criado_em: serverTimestamp(), // salva a data de criação
    });
    return { ok: true };
  } catch (error) {
    console.error("Erro ao adicionar item ao estoque:", error);
    return { ok: false, error };
  }
}

/**
 * Lista itens do estoque filtrados pelo estabelecimento
 */
export async function listarEstoque(estabelecimentoId) {
  try {
    const q = query(
      collection(db, "estoque"),
      where("estabelecimentoId", "==", estabelecimentoId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao listar estoque:", error);
    return [];
  }
}

/**
 * Edita um item específico do estoque
 */
export async function editarItemEstoque(id, dados) {
  try {
    const ref = doc(db, "estoque", id);
    await updateDoc(ref, {
      ...dados,
      atualizado_em: serverTimestamp(), // salva a data da atualização
    });
    return { ok: true };
  } catch (error) {
    console.error("Erro ao editar item do estoque:", error);
    return { ok: false, error };
  }
}

/**
 * Exclui um item do estoque
 */
export async function excluirItemEstoque(id) {
  try {
    const ref = doc(db, "estoque", id);
    await deleteDoc(ref);
    return { ok: true };
  } catch (error) {
    console.error("Erro ao excluir item do estoque:", error);
    return { ok: false, error };
  }
}

/**
 * Registra histórico de alterações no estoque
 */
// src/services/estoqueService.js
export async function registrarHistorico(estabelecimentoId, acao, produto, usuario) {
  try {
    const ref = collection(
      db,
      "estabelecimentos",
      estabelecimentoId,
      "historicoEstoque"
    );

    await addDoc(ref, {
      estabelecimentoId,
      acao, // "adicionado" | "editado" | "deletado"
      produto,
      usuario: {
        uid: usuario?.uid || null,
        nome: usuario?.nome || "Sistema",
        email: usuario?.email || null,
        tipo: usuario?.tipo || null,
      },
      createdAt: serverTimestamp(),
    });

    return { ok: true };
  } catch (error) {
    console.error("Erro ao registrar histórico:", error);
    return { ok: false, error };
  }
}
