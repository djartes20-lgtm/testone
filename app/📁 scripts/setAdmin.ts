import { adminAuth } from "@/app/lib/firebase-admin";

async function setAdmin(uid: string) {
  await adminAuth.setCustomUserClaims(uid, {
    role: "admin",
  });

  console.log("Admin definido com sucesso");
}

// UID do seu usuário admin
setAdmin("UID_DO_ADMIN");
