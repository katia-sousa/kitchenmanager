import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Adicionar categoria
export async function adicionarCategoria(estabelecimentoId, categoria) {
  const ref = collection(db, "categorias");
  await addDoc(ref, {
    ...categoria,
    estabelecimentoId,
    criado_em: serverTimestamp(), // ✅ Agora usa timestamp do servidor
  });
}

// Listar categorias
export async function listarCategorias(estabelecimentoId) {
  const q = query(
    collection(db, "categorias"),
    where("estabelecimentoId", "==", estabelecimentoId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Editar categoria
export async function editarCategoria(id, dadosAtualizados) {
  const ref = doc(db, "categorias", id);
  await updateDoc(ref, dadosAtualizados);
}

// Excluir categoria
export async function excluirCategoria(id) {
  const ref = doc(db, "categorias", id);
  await deleteDoc(ref);
}
