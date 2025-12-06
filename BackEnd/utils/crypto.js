import crypto from "crypto";

// =====================================================
// RSA KEY PAIR GENERATION
// =====================================================

/**
 * Generate RSA key pair for a supplier
 * @returns {{ publicKey: string, privateKey: string }}
 */
export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
}

// =====================================================
// HASHING
// =====================================================

/**
 * Create SHA256 hash of data
 * @param {string} data - Data to hash
 * @returns {string} Hex-encoded hash
 */
export function sha256Hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Compute order hash from order data
 * @param {object} order - Order object with id, productId, quantity, etc.
 * @returns {string} SHA256 hash
 */
export function computeOrderHash(order) {
  const dataToHash = [
    order.id,
    order.productId,
    order.quantity,
    order.customerId,
    order.supplierId,
    order.totalAmount,
    order.deliveryAddress,
  ].join("|");

  return sha256Hash(dataToHash);
}

// =====================================================
// DIGITAL SIGNATURES
// =====================================================

/**
 * Sign data with private key
 * @param {string} data - Data to sign
 * @param {string} privateKey - RSA private key in PEM format
 * @returns {string} Base64-encoded signature
 */
export function signData(data, privateKey) {
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, "base64");
}

/**
 * Verify signature with public key
 * @param {string} data - Original data that was signed
 * @param {string} signature - Base64-encoded signature
 * @param {string} publicKey - RSA public key in PEM format
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(data, signature, publicKey) {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, "base64");
  } catch (error) {
    return false;
  }
}

// =====================================================
// QR TOKEN GENERATION & PARSING
// =====================================================

/**
 * Generate QR token containing order verification data
 * @param {object} params - Token parameters
 * @param {number} params.orderId
 * @param {string} params.supplierSignature
 * @param {string} params.serverSignature
 * @returns {string} URL-safe base64 encoded token
 */
export function generateQrToken({
  orderId,
  supplierSignature,
  serverSignature,
}) {
  const payload = {
    oid: orderId,
    ss: supplierSignature,
    svs: serverSignature,
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  const jsonString = JSON.stringify(payload);
  // URL-safe base64 encoding
  return Buffer.from(jsonString)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Parse QR token back to object
 * @param {string} token - URL-safe base64 encoded token
 * @returns {object|null} Parsed payload or null if invalid
 */
export function parseQrToken(token) {
  try {
    // Restore standard base64
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(jsonString);

    return {
      orderId: payload.oid,
      supplierSignature: payload.ss,
      serverSignature: payload.svs,
      timestamp: payload.ts,
      nonce: payload.nonce,
    };
  } catch (error) {
    return null;
  }
}

// =====================================================
// PRIVATE KEY VALIDATION
// =====================================================

/**
 * Validate supplier's private key against stored hash
 * @param {string} privateKey - Private key provided by supplier
 * @param {string} storedHash - Hash stored in database
 * @returns {boolean} True if valid
 */
export function validatePrivateKey(privateKey, storedHash) {
  // Normalize the key (remove extra whitespace)
  const normalizedKey = privateKey.trim();
  const computedHash = sha256Hash(normalizedKey);

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch {
    return false;
  }
}

// =====================================================
// SERVER KEY HELPERS
// =====================================================

/**
 * Get server private key from environment
 * @returns {string} Server private key
 */
export function getServerPrivateKey() {
  const key = process.env.SERVER_PRIVATE_KEY;
  if (!key) {
    throw new Error("SERVER_PRIVATE_KEY not configured in environment");
  }
  // Handle escaped newlines from .env
  return key.replace(/\\n/g, "\n");
}

/**
 * Get server public key from environment
 * @returns {string} Server public key
 */
export function getServerPublicKey() {
  const key = process.env.SERVER_PUBLIC_KEY;
  if (!key) {
    throw new Error("SERVER_PUBLIC_KEY not configured in environment");
  }
  // Handle escaped newlines from .env
  return key.replace(/\\n/g, "\n");
}
