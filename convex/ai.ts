import { action } from "./_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";

export const parseIssue = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical project manager. Parse the user's natural language input into a GitHub Issue JSON.
          Return ONLY JSON with the following fields: 
          - title: string
          - body: string (detailed description)
          - labels: string[] (suggest relevant labels)
          - assignee: string | null (extract if mentioned)
          - estimate: string | null (e.g. "2 days")`,
        },
        {
          role: "user",
          content: args.text,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  },
});
