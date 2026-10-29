type RegistrationPayload = {
  username?: unknown;
  email?: unknown;
  password?: unknown;
};

const strapiUrl = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");

function getStrapiErrorMessage(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const error = "error" in value ? value.error : null;
  if (!error || typeof error !== "object") return null;
  const message = "message" in error ? error.message : null;
  return typeof message === "string" ? message : null;
}

export async function POST(request: Request) {
  let data: RegistrationPayload;

  try {
    data = (await request.json()) as RegistrationPayload;
  } catch {
    return Response.json({ message: "Enter valid registration details." }, { status: 400 });
  }

  const username = typeof data.username === "string" ? data.username.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (username.length < 3 || username.length > 50) {
    return Response.json({ message: "Username must be between 3 and 50 characters." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return Response.json({ message: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  try {
    const response = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      cache: "no-store",
    });
    const body = (await response.json()) as unknown;

    if (!response.ok) {
      return Response.json(
        { message: getStrapiErrorMessage(body) || "Unable to create that account." },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
      );
    }

    return Response.json({ message: "Account created." }, { status: 201 });
  } catch (error) {
    console.error("Unable to register Strapi user", error);
    return Response.json(
      { message: "The authentication service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}
