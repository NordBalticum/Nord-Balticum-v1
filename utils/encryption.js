// 📁 src/utils/encryption.js

import sodium from "libsodium-wrappers";

// ✅ Pagrindinis raktas iš ENV (Base64)
const base64Key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

if (!base64Key) {
  throw new Error("❌ ENV klaida: NEXT_PUBLIC_ENCRYPTION_KEY nėra nustatytas.");
}

// ✅ Privatų raktą užšifruoja su libsodium
export const encryptPrivateKey = async (privateKey) => {
  await sodium.ready;

  const key = sodium.from_base64(base64Key, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const cipher = sodium.crypto_secretbox_easy(
    new TextEncoder().encode(privateKey),
    nonce,
    key
  );

  return {
    encrypted: sodium.to_base64(cipher, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
  };
};

// ✅ Dešifruoja privatų raktą
export const decryptPrivateKey = async (encrypted, nonce) => {
  await sodium.ready;

  const key = sodium.from_base64(base64Key, sodium.base64_variants.ORIGINAL);
  const cipherBytes = sodium.from_base64(encrypted, sodium.base64_variants.ORIGINAL);
  const nonceBytes = sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL);

  const decrypted = sodium.crypto_secretbox_open_easy(cipherBytes, nonceBytes, key);

  if (!decrypted) {
    throw new Error("❌ Decryption failed: neteisingi duomenys arba raktas.");
  }

  return new TextDecoder().decode(decrypted);
};
