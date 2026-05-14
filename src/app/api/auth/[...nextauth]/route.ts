// Disabled legacy NextAuth API route. Recon now uses Clerk for authentication.
export const GET = () => new Response("Legacy auth disabled", { status: 200 });
export const POST = () => new Response("Legacy auth disabled", { status: 200 });
