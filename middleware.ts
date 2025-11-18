// import { type NextRequest } from "next/server";
// import { updateSession } from "@/lib/supabase/middleware";

// export async function middleware(request: NextRequest) {
//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

// middlewareを無効化し、クライアントサイドで認証チェックを行います
export { };
