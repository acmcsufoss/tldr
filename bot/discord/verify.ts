import { nacl } from "../../deps.ts";

/**
 * verify verifies whether the request is coming from Discord.
 */
export async function verify(
  request: Request,
  publicKey: string,
): Promise<{ error: Response; body: null } | { error: null; body: string }> {
  if (request.method !== "POST") {
    return {
      error: new Response("Method not allowed", { status: 405 }),
      body: null,
    };
  }

  if (request.headers.get("content-type") !== "application/json") {
    return {
      error: new Response("Unsupported Media Type", { status: 415 }),
      body: null,
    };
  }

  const signature = request.headers.get("X-Signature-Ed25519");
  if (!signature) {
    return {
      error: new Response("Missing header X-Signature-Ed25519", {
        status: 401,
      }),
      body: null,
    };
  }

  const timestamp = request.headers.get("X-Signature-Timestamp");
  if (!timestamp) {
    return {
      error: new Response("Missing header X-Signature-Timestamp", {
        status: 401,
      }),
      body: null,
    };
  }

  const body = await request.text();
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(publicKey),
  );

  // When the request's signature is not valid, we return a 401 and this is
  // important as Discord sends invalid requests to test our verification.
  if (!valid) {
    return {
      error: new Response("Invalid request", { status: 401 }),
      body: null,
    };
  }

  return { body, error: null };
}

/** hexToUint8Array converts a hexadecimal string to Uint8Array. */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}
