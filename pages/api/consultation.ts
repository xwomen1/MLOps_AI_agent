import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure streaming response
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
};

interface RequestBody {
  patient_name?: string;
  date_of_visit?: string;
  notes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate using Clerk (reads from cookies automatically)
    // For development/testing: allow all requests (TODO: remove in production)
    const { userId } = getAuth(req);
    
    // Temporarily allow requests for testing
    // const authenticatedUserId = userId || 'dev-user';

    // Parse request body
    const body = req.body as RequestBody;
    const { patient_name, date_of_visit, notes } = body;

    // Initialize Google Generative AI
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GOOGLE_API_KEY not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Build prompt based on the Python version's system prompt
    const systemPrompt = `
You are provided with notes written by a doctor from a patient's visit.
Your job is to summarize the visit for the doctor and provide an email.
Reply with exactly three sections with the headings:
### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language
`;

    const userPrompt = `Create the summary, next steps and draft email for:
Patient Name: ${patient_name}
Date of Visit: ${date_of_visit}
Notes:
${notes}`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Generate content with streaming
    const result = await model.generateContentStream(fullPrompt);

    // Stream the response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        // Send data in SSE format (matching Python version's format)
        const lines = chunkText.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          res.write(`data: ${lines[i]}\n\n`);
          res.write('data: \n');
        }
        res.write(`data: ${lines[lines.length - 1]}\n\n`);
      }
    }

    // End the stream
    res.end();
  } catch (error) {
    console.error('Error in API route:', error);
    
    // If headers haven't been sent, send error response
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Otherwise, send error via SSE
    res.write(`data: Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`);
    res.end();
  }
}
