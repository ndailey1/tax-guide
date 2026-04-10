import Anthropic from "@anthropic-ai/sdk";
import { cookies } from "next/headers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  // Auth check — prevent unauthenticated API usage
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("tax-guide-auth");
  if (!authCookie?.value) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { system, prompt } = await req.json();

  if (!system?.trim() || !prompt?.trim() || system.length > 10000 || prompt.length > 50000) {
    return new Response(JSON.stringify({ error: "Missing or invalid input" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6-20250610",
    max_tokens: 2500,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
