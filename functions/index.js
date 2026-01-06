const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({
  region: "southamerica-east1",
  maxInstances: 10,
});

exports.criarColaborador = onCall(async (request) => {
  // 🔐 Verifica autenticação
  if (!request.auth) {
    throw new Error("Usuário não autenticado");
  }

  const {nome, email, telefone, estabelecimentoId, tipo} = request.data;

  if (!nome || !email || !estabelecimentoId) {
    throw new Error("Dados obrigatórios não informados");
  }

  // 🔍 Verifica se quem chama é ADMIN
  const adminSnap = await admin
      .firestore()
      .collection("usuarios")
      .doc(request.auth.uid)
      .get();

  if (!adminSnap.exists || adminSnap.data().tipo !== "admin") {
    throw new Error("Permissão negada");
  }

  // 👤 Cria usuário no Auth com senha padrão
  const userRecord = await admin.auth().createUser({
    email,
    password: "123456",
    displayName: nome,
  });

  const uid = userRecord.uid;

  // 🗄️ Cria documento no Firestore
  await admin.firestore().collection("usuarios").doc(uid).set({
    nome,
    email,
    telefone: telefone || "",
    tipo: tipo || "colaborador",
    estabelecimentoId,
    precisaTrocarSenha: true,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {uid};
});
