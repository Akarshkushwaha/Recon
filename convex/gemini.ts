import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generatePRDescription = action({
  args: { diff: v.string() },
  handler: async (ctx, args) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a world-class software engineer. Analyze the following git diff and write a structured pull request description.
    Include:
    - **Summary**: A high-level overview of the changes.
    - **Key Changes**: A bulleted list of significant modifications.
    - **Testing**: Suggestions on how to verify these changes.
    
    Git Diff:
    ${args.diff.slice(0, 20000)} // Truncate if too long
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  },
});
