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

export async function adicionarCategoria(estabelecimentoId, categoria) {
  return addDoc(collection(db, "categorias"), {
    nome: categoria.nome,
    estabelecimentoId,
    criado_em: serverTimestamp(),
  });
}

export async function listarCategorias(estabelecimentoId) {
  if (!estabelecimentoId) return [];

  const q = query(
    collection(db, "categorias"),
    where("estabelecimentoId", "==", estabelecimentoId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function editarCategoria(id, dados) {
  return updateDoc(doc(db, "categorias", id), dados);
}

export async function excluirCategoria(id) {
  return deleteDoc(doc(db, "categorias", id));
}
