import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Verifica se o responsável já está cadastrado
export async function verificarResponsavel(uid) {
  const docRef = doc(db, "responsaveis", uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists(); // true = já cadastrado
}

// Cadastra novo responsável
export async function cadastrarResponsavel(uid, dados) {
  await setDoc(doc(db, "responsaveis", uid), {
    cpf: dados.cpf,
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    criadoEm: serverTimestamp(),
  });
}
