import { getAuth } from "@/lib/auth";

// Hand-rolled instead of toNextJsHandler(auth) because the auth instance
// is created lazily (getDb() is async).
const handler = async (req: Request) => (await getAuth()).handler(req);

export { handler as GET, handler as POST };
