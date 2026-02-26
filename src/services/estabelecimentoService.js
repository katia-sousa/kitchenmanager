import { getAuth } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Cadastra ou associa um estabelecimento ao usuário logado
 */
export async function cadastrarEstabelecimento(dados) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não está logado!");
  }

  try {
    // 🔎 Verifica se já existe estabelecimento com esse CNPJ
    const q = query(
      collection(db, "estabelecimentos"),
      where("cnpj", "==", dados.cnpj)
    );

    const snap = await getDocs(q);

    // ===============================
    // 🟡 CASO 1: CNPJ JÁ EXISTE
    // ===============================
    if (!snap.empty) {
      const docExistente = snap.docs[0];
      const dadosExistentes = docExistente.data();

      // associa o estabelecimento ao usuário
      await updateDoc(doc(db, "usuarios", user.uid), {
        estabelecimentos: arrayUnion(docExistente.id),
      });

      return {
        tipo: "existente",
        dados: dadosExistentes,
        estabelecimentoId: docExistente.id,
      };
    }

    // ===============================
    // 🟢 CASO 2: CNPJ NÃO EXISTE
    // ===============================
    const novoRef = doc(collection(db, "estabelecimentos"));

    await setDoc(novoRef, {
      nome: dados.nome,
      cnpj: dados.cnpj,
      endereco: dados.endereco,
      telefone: dados.telefone,
      admins: [user.uid],
      criado_em: serverTimestamp(),
    });

    // associa o novo estabelecimento ao usuário
    await updateDoc(doc(db, "usuarios", user.uid), {
      estabelecimentos: arrayUnion(novoRef.id),
    });

    return {
      tipo: "novo",
      dados,
      estabelecimentoId: novoRef.id,
    };
  } catch (error) {
    console.error("Erro ao cadastrar/associar estabelecimento:", error);
    throw error;
  }
}

/**
 * Lista todos os estabelecimentos associados ao usuário
 */
export async function listarEstabelecimentosDoUsuario(uid) {
  try {
    const q = query(
      collection(db, "estabelecimentos"),
      where("admins", "array-contains", uid)
    );

    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    throw error;
  }
}
