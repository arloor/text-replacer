import { data, redirect } from "react-router";
import type { Route } from "./+types/login";

import { getSession, commitSession } from "../sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  console.log("session", session.data);

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  return data(
    { error: session.get("error") },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  const userId = await validateCredentials(username, password);

  if (userId == null) {
    session.flash("error", "Invalid username/password");

    // Redirect back to the login page with errors.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", userId);

  // Login succeeded, send them to the home page.
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      <form method="POST">
        <div>
          <p>Please sign in</p>
        </div>
        <label>
          Username: <input type="text" name="username" />
        </label>
        <label>
          Password: <input type="password" name="password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

async function validateCredentials(
  username: FormDataEntryValue | null,
  password: FormDataEntryValue | null
): Promise<string | null> {
  // Basic validation
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return null;
  }

  // In a real application, you would:
  // 1. Check credentials against a database
  // 2. Use proper password hashing (bcrypt, argon2, etc.)
  // 3. Never store plain-text passwords

  // This is a simplified example - replace with actual authentication logic
  if (username === "admin" && password === "password") {
    return "user_123"; // Return a user ID on successful authentication
  }

  // Authentication failed
  return null;
}
