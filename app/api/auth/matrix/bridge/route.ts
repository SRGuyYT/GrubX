import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { readServerEnv } from "@/lib/env";

export const runtime = "nodejs";

type MatrixLoginResponse = {
  access_token: string;
  user_id: string;
};

const toFirebaseUid = (matrixUserId: string) => {
  const digest = createHash("sha256").update(matrixUserId).digest("hex");
  return `matrix_${digest.slice(0, 32)}`;
};

const parseErrorText = async (response: Response) => {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      homeserverUrl?: string;
    };

    const username = body.username?.trim();
    const password = body.password;
    const homeserverUrl = body.homeserverUrl?.trim() || readServerEnv("MATRIX_HOMESERVER_URL");

    if (!username || !password) {
      return NextResponse.json({ error: "Matrix username and password are required." }, { status: 400 });
    }

    if (!homeserverUrl) {
      return NextResponse.json(
        { error: "Matrix homeserver URL is not configured." },
        { status: 503 },
      );
    }

    const loginResponse = await fetch(`${homeserverUrl.replace(/\/$/, "")}/_matrix/client/v3/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "m.login.password",
        identifier: {
          type: "m.id.user",
          user: username,
        },
        password,
        initial_device_display_name: "GrubX Next.js",
      }),
    });

    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: await parseErrorText(loginResponse) },
        { status: loginResponse.status },
      );
    }

    const loginPayload = (await loginResponse.json()) as MatrixLoginResponse;
    const whoAmIResponse = await fetch(`${homeserverUrl.replace(/\/$/, "")}/_matrix/client/v3/account/whoami`, {
      headers: {
        Authorization: `Bearer ${loginPayload.access_token}`,
      },
    });

    if (!whoAmIResponse.ok) {
      return NextResponse.json(
        { error: await parseErrorText(whoAmIResponse) },
        { status: whoAmIResponse.status },
      );
    }

    const whoAmIPayload = (await whoAmIResponse.json()) as { user_id?: string };
    const matrixUserId = whoAmIPayload.user_id ?? loginPayload.user_id;
    if (!matrixUserId) {
      return NextResponse.json(
        { error: "Matrix identity could not be resolved." },
        { status: 502 },
      );
    }

    const firebaseUid = toFirebaseUid(matrixUserId);
    const customToken = await getFirebaseAdminAuth().createCustomToken(firebaseUid, {
      authProvider: "matrix",
      matrixUserId,
    });

    return NextResponse.json({
      customToken,
      firebaseUid,
      matrixUserId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Matrix bridge failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
