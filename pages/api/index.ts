import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

interface Visit {
  patient_name?: string;
  date_of_visit?: string;
  notes?: string;
}

const SYSTEM_PROMPT = `You are an expert DevOps and Cloud Infrastructure analyst. 
You are provided with deployment logs, error messages, and infrastructure details from a DevOps engineer.
Your job is to analyze the deployment and provide actionable insights.
Reply with exactly three sections with these headings:
### Deployment Analysis Summary
### Critical Issues & Recommendations
### Optimization Suggestions`;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Permit simple health checks / preflight to avoid 405 errors
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res
      .status(200)
      .json({ status: "ok", message: "Use POST to stream a summary." });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userId } = await getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { patient_name, date_of_visit, notes } = (req.body || {}) as Visit;

  const prompt = `${SYSTEM_PROMPT}

Patient Name: ${patient_name}
Date of Visit: ${date_of_visit}
Notes:
${notes}`;

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const llmProvider = process.env.LLM_PROVIDER || "gemini";

  try {
    if (llmProvider === "gemini") {
      const genai = require("@google/generative-ai");
      const client = new genai.GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
      );
      const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const stream = await model.generateContentStream(prompt);

      for await (const chunk of stream.stream) {
        const text = chunk.text();
        if (text) {
          for (const line of text.split("\n")) {
            res.write(`data: ${line}\n\n`);
          }
        }
      }
    } else if (llmProvider === "openai") {
      const OpenAI = require("openai");
      const openai = new OpenAI.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const stream = openai.beta.chat.completions.stream({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });

      stream.on("text", (text: string) => {
        for (const line of text.split("\n")) {
          res.write(`data: ${line}\n\n`);
        }
      });

      await stream.finalMessage();
    } else {
      res.write("data: ❌ Invalid LLM_PROVIDER\n\n");
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.write(`data: Error: ${error}\n\n`);
    res.end();
  }
}

