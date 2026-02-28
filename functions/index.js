/* eslint-disable */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({
  region: "southamerica-east1",
  maxInstances: 10,
});

exports.criarColaborador = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Usuário não autenticado");
    }

    let { nome, cpf, email, telefone, estabelecimentoId, tipo } = request.data;

    if (!nome || !tipo || !estabelecimentoId) {
      throw new HttpsError("invalid-argument", "Dados obrigatórios não informados");
    }

    if (tipo === "nutricionista" && !cpf) {
      throw new HttpsError("invalid-argument", "CPF é obrigatório para nutricionista");
    }

    email = email ? email.trim().toLowerCase() : null;

    const db = admin.firestore();
    const auth = admin.auth();

    /* =========================
       🔐 VALIDA ADMIN (CORRIGIDO)
    ========================== */

    const userUid = request.auth.uid;

    const usuarioSnap = await db.collection("usuarios").doc(userUid).get();

    const estabelecimentoSnap = await db
      .collection("estabelecimentos")
      .doc(estabelecimentoId)
      .get();

    const isAdminPorRole =
  usuarioSnap.exists &&
  (usuarioSnap.data().role === "admin" ||
   usuarioSnap.data().tipo === "admin");

    const isAdminDoEstabelecimento =
      estabelecimentoSnap.exists &&
      estabelecimentoSnap.data().adminId === userUid;

    if (!isAdminPorRole && !isAdminDoEstabelecimento) {
      throw new HttpsError(
        "permission-denied",
        "Somente admin pode cadastrar usuários"
      );
    }

    let uid = null;

    /* =========================
       1️⃣ BUSCA NUTRICIONISTA POR CPF
    ========================== */
    if (tipo === "nutricionista") {
      const cpfSnap = await db
        .collection("usuarios")
        .where("cpf", "==", cpf)
        .limit(1)
        .get();

      if (!cpfSnap.empty) {
        uid = cpfSnap.docs[0].id;
      }
    }

    /* =========================
       2️⃣ BUSCA PELO EMAIL NO AUTH
    ========================== */
    if (!uid && email) {
      try {
        const userRecord = await auth.getUserByEmail(email);
        uid = userRecord.uid;
      } catch (err) {
        if (err.code !== "auth/user-not-found") throw err;
      }
    }

    /* =========================
       3️⃣ CRIA USUÁRIO SE NÃO EXISTIR
    ========================== */
    if (!uid) {
      if (!email) {
        throw new HttpsError(
          "invalid-argument",
          "Email é obrigatório para criar um novo usuário"
        );
      }

      const userRecord = await auth.createUser({
        email,
        password: "123456",
        displayName: nome,
      });

      uid = userRecord.uid;
    }

    /* =========================
       4️⃣ SALVA / ATUALIZA USUÁRIO
    ========================== */
    await db.collection("usuarios").doc(uid).set(
      {
        nome,
        email,
        telefone: telefone || "",
        cpf: cpf || "",
        role: tipo,
        ...(tipo === "nutricionista" && { cpf }),
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    /* =========================
       5️⃣ VÍNCULO COM ESTABELECIMENTO
    ========================== */
    if (tipo === "nutricionista") {
      const vinculoRef = db.collection("nutricionista_estabelecimentos");

      const snap = await vinculoRef
        .where("nutricionistaId", "==", uid)
        .where("estabelecimentoId", "==", estabelecimentoId)
        .limit(1)
        .get();

      if (snap.empty) {
        await vinculoRef.add({
          nutricionistaId: uid,
          estabelecimentoId,
          ativo: true,
          criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } else {
      await db
        .collection("usuarios")
        .doc(uid)
     .set({
  estabelecimentos: admin.firestore.FieldValue.arrayUnion(estabelecimentoId)
}, { merge: true });  
    }

    return {
      sucesso: true,
      mensagem: "Usuário cadastrado/vinculado com sucesso",
      uid,
    };
  } catch (error) {
    console.error("❌ criarColaborador:", error);

    if (error.code && error.code.startsWith("auth/")) {
      throw new HttpsError(error.code, error.message);
    }

    throw new HttpsError("internal", error.message);
  }
});
/* =======================================================
   🔹 FUNÇÃO 2 - RESETAR SENHA
======================================================= */
exports.resetarSenhaColaborador = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Usuário não autenticado");
    }

    const { uidAlvo } = request.data;

    if (!uidAlvo) {
      throw new HttpsError("invalid-argument", "UID do usuário é obrigatório");
    }

    const db = admin.firestore();
    const auth = admin.auth();

    const adminUid = request.auth.uid;

    /* =========================
       🔍 BUSCA ADMIN
    ========================== */
    const adminSnap = await db.collection("usuarios").doc(adminUid).get();

    if (!adminSnap.exists) {
      throw new HttpsError("permission-denied", "Usuário não encontrado");
    }

    const adminData = adminSnap.data();

    const isAdmin =
      adminData.role === "admin" || adminData.tipo === "admin";

    if (!isAdmin) {
      throw new HttpsError(
        "permission-denied",
        "Somente administradores podem resetar senha"
      );
    }

    /* =========================
       🔍 BUSCA USUÁRIO ALVO
    ========================== */
    const usuarioSnap = await db.collection("usuarios").doc(uidAlvo).get();

    if (!usuarioSnap.exists) {
      throw new HttpsError("not-found", "Usuário não encontrado");
    }

    const usuarioData = usuarioSnap.data();

    /* 🚫 Impede reset de outro admin 
    if (
      usuarioData.role === "admin" ||
      usuarioData.tipo === "admin"
    ) {
      throw new HttpsError(
        "permission-denied",
        "Não é permitido resetar senha de outro administrador"
      );
    }*/

    /* 🚫 Impede reset da própria senha 
    if (uidAlvo === adminUid) {
      throw new HttpsError(
        "permission-denied",
        "Você não pode resetar sua própria senha por aqui"
      );
    }*/

    /* 🔒 Valida mesmo estabelecimento */
const adminEstabs = adminData.estabelecimentos || [];
const userEstabs = usuarioData.estabelecimentos || [];

const pertenceMesmoEstab = userEstabs.some(id =>
  adminEstabs.includes(id)
);

if (!pertenceMesmoEstab) {
  throw new HttpsError(
    "permission-denied",
    "Usuário não pertence ao seu estabelecimento"
  );
}

    /* =========================
       🔑 REDEFINE SENHA
    ========================== */
    await auth.updateUser(uidAlvo, {
      password: "123456",
    });

    return {
      sucesso: true,
      mensagem: "Senha redefinida para 123456",
    };
  } catch (error) {
    console.error("❌ resetarSenhaColaborador:", error);
    throw new HttpsError("internal", error.message);
  }
});