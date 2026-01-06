import { getAuth } from "firebase/auth";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Cadastra um novo estabelecimento vinculado ao usuário logado.
 */
export async function cadastrarEstabelecimento(dadosEstabelecimento) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não está logado!");
  }

  try {
    const docRef = await addDoc(collection(db, "estabelecimentos"), {
      nome: dadosEstabelecimento.nome,
      endereco: dadosEstabelecimento.endereco,
      telefone: dadosEstabelecimento.telefone,
      adminId: user.uid, 
      criado_em: serverTimestamp(),
    });

    console.log("Estabelecimento cadastrado com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao cadastrar estabelecimento:", error);
    throw error;
  }
}

/**
 * Lista todos os estabelecimentos do usuário logado.
 */
export async function listarEstabelecimentosDoUsuario(uid) {
  try {
    const q = query(collection(db, "estabelecimentos"), where("adminId", "==", uid)
);
    const querySnapshot = await getDocs(q);

    const estabelecimentos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return estabelecimentos;
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    throw error;
  }
  
}
export async function getEstabelecimentoPorAdmin(adminId) {
  const q = query(
    collection(db, "estabelecimentos"),
    where("adminId", "==", adminId)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

