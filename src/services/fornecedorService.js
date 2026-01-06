import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Adicionar fornecedor
export async function adicionarFornecedor(estabelecimentoId, fornecedor) {
  const ref = collection(db, "fornecedores");
  await addDoc(ref, {
    ...fornecedor,
    estabelecimentoId,
    criado_em: new Date(),
  });
}

// Listar fornecedores
export async function listarFornecedores(estabelecimentoId) {
  const q = query(
    collection(db, "fornecedores"),
    where("estabelecimentoId", "==", estabelecimentoId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Editar fornecedor
export async function editarFornecedor(id, dadosAtualizados) {
  const ref = doc(db, "fornecedores", id);
  await updateDoc(ref, dadosAtualizados);
}

// Excluir fornecedor
export async function excluirFornecedor(id) {
  const ref = doc(db, "fornecedores", id);
  await deleteDoc(ref);
}
