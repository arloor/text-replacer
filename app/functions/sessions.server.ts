import { createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: "__session",

        // all of these are optional
        // domain: "reactrouter.com",
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        maxAge: 604800, // -1 means the session will not expire
        path: "/",
        sameSite: "lax",
        secrets: ["s3cret1"],
        secure: false,
      },
    }
  );


  /**
 * 验证用户凭据
 * @param username 用户名
 * @param password 密码
 * @returns 成功时返回用户ID，失败时返回null
 */
export async function validateCredentials(
  username: FormDataEntryValue | null,
  password: FormDataEntryValue | null
): Promise<string | null> {
  // 基本验证
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return null;
  }

  // 在实际应用中，您应该:
  // 1. 检查数据库中的凭据
  // 2. 使用适当的密码哈希(bcrypt, argon2等)
  // 3. 永远不要存储明文密码

  // 这是一个简化的示例 - 请替换为实际的身份验证逻辑
  if (username === "admin" && password === "liuganghuan") {
    return "admin@arloor.com"; // 身份验证成功时返回用户ID
  }

  // 身份验证失败
  return null;
}

export { getSession, commitSession, destroySession };
