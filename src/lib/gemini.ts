import {GoogleGenerativeAI} from '@google/generative-ai'
import { Document } from '@langchain/core/documents'
import { waitForDebugger } from 'inspector';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash'
})

const wait = (ms: number) => new Promise(res => setTimeout(res, ms))

export const aiSummariseCommit = async (diff: string) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await wait(2000)
      const response = await model.generateContent([
          `You are an expert programer, and you are trying to summarise a git diff. Explain all the changes you find in detail.
          Reminders about the git diff format:
          For every file. there are a few metadata lines, like (for example):
          \`\`\`
          diff --git a/lib/index.js b/lib/index.js
          index aad691..bfef603 100644
          --- a/lib/index.js
          +++ b/lib/index.js
          \`\`\`
          This means that \`lib/index.js\` was modified in this commit. Note that this file is only an example.
          Then there is a specifier of the lines that were modified.
          A line starting with \`+\` means it was added.
          A line starting with \`-\` means that the line was deleted.
          A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
          It is not part of the diff.
          [...]
          EXAMPLE SUMMARY COMMENTS:
          \`\`\`
          * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
          * Fixed a typo in github action name [.github/workflows/gpt-commit-summariser.yml]
          * Moved the \`octokit\` initialization to a seperate file [src/octokit.ts], [src/index.ts]
          * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
          * Lowered numeric tolerance for test files
          \`\`\`
          Most commits will have less comments than this examples list.
          The last comment does not include the file names,
          because there were more than two relevant files in the hypothetical commit.
          Do not include parts of the example in your summary.
          It is given only as an example of appropriate comments.
          `,
          `Please summarise the following diff file: \n\n${diff}`
      ])
      return response.response.text();
    } catch (error: any) {
      if (
        error.message.includes("rate limit") ||
        error.message.includes("too many requests")
      ) {
        const waitTime = 1000 * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
        console.warn(`Rate limit hit on aiSummariseCommit, retrying in ${waitTime}ms...`);
        await new Promise((res) => setTimeout(res, waitTime));
        attempt++;
      } else {
        console.error("Error in aiSummariseCommit:", error);
        break;
      }
    }
  }
  return "";
};


export async function summariseCode(doc: Document) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await wait(2000)
      const code = doc.pageContent.slice(0, 10000);
      if (!code.trim()) {
        console.warn("No code found in document");
        return "";
      }
      const prompt = `
        You are an intelligent senior software engineer helping onboard a junior engineer.
        Explain the purpose of the file: ${doc.metadata.source}.
        Here is the code:
        ---
        ${code}
        ---
        Give a concise summary in no more than 100 words.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      if (
        error.message.includes("rate limit") ||
        error.message.includes("too many requests")
      ) {
        const waitTime = 1000 * Math.pow(2, attempt);
        console.warn(`Rate limit hit on summariseCode, retrying in ${waitTime}ms...`);
        await new Promise((res) => setTimeout(res, waitTime));
        attempt++;
      } else {
        console.error("Error in summariseCode:", error);
        break;
      }
    }
  }
  return "";
}


export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await wait(2000)
      const result = await model.embedContent({
        content: {
          role: "user",
          parts: [
            {
              text: summary,
            },
          ],
        },
      });
      return result.embedding.values;
    } catch (error: any) {
      if (
        error.message.includes("rate limit") ||
        error.message.includes("too many requests")
      ) {
        const waitTime = 1000 * Math.pow(2, attempt);
        console.warn(`Rate limit hit on generateEmbedding, retrying in ${waitTime}ms...`);
        await new Promise((res) => setTimeout(res, waitTime));
        attempt++;
      } else {
        console.error("Error in generateEmbedding:", error);
        break;
      }
    }
  }
  return [];
}





