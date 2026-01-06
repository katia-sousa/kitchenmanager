// src/services/colaboradorService.js
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
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

// 👉 Adicionar colaborador (cria usuário e associa ao estabelecimento)
export async function adicionarColaborador(estabelecimentoId, colaborador) {
  const auth = getAuth();

  try {
    // Cria o usuário no Authentication
    const userCred = await createUserWithEmailAndPassword(
      auth,
      colaborador.email,
      "123456" // senha padrão (depois o colaborador pode redefinir)
    );

    // Salva no Firestore com vínculo ao estabelecimento
    const ref = collection(db, "colaboradores");
    await addDoc(ref, {
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone,
      uid: userCred.user.uid,
      estabelecimentoId,
      tipo: "colaborador",
      criado_em: new Date(),
    });

    console.log("✅ Colaborador criado e vinculado ao estabelecimento!");
  } catch (error) {
    console.error("Erro ao adicionar colaborador:", error);
    throw error;
  }
}

// 👉 Listar colaboradores por estabelecimento
export async function listarColaboradores(estabelecimentoId) {
  const q = query(
    collection(db, "colaboradores"),
    where("estabelecimentoId", "==", estabelecimentoId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// 👉 Editar colaborador
export async function editarColaborador(id, dadosAtualizados) {
  const ref = doc(db, "colaboradores", id);
  await updateDoc(ref, dadosAtualizados);
}

// 👉 Excluir colaborador
export async function excluirColaborador(id) {
  const ref = doc(db, "colaboradores", id);
  await deleteDoc(ref);
}
