import handler from "vinext/server/fetch-handler";

// Independent hosting has no trusted Sites identity proxy. Existing APIs use
// their owner cookie instead; visitors cannot claim someone else's identity.
export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const headers = new Headers(request.headers);
    for (const name of [...headers.keys()]) {
      if (name.startsWith("oai-")) headers.delete(name);
    }
    return handler.fetch(new Request(request, { headers }), env, ctx);
  },
};
