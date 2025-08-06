import { claude, ClaudeModelType } from "@convex/lib/claude";
import { Id } from "@convex/_generated/dataModel";

type Clip = {
  id: Id<"product_dataset_assets">;
  start: number;
  end: number;
  content: string;
  relevance: string;
  confidence: number;
};

export const parseClipsFromText = (text: string) => {
  const outputMatch = text.match(/<output>([\s\S]*?)<\/output>/);
  if (!outputMatch) {
    throw new Error(
      "No output found in response. Expected content wrapped in <output></output> tags."
    );
  }

  const outputContent = outputMatch[1];

  const clipMatches = outputContent.matchAll(
    /<clip_json>([\s\S]*?)<\/clip_json>/g
  );
  const clips: Clip[] = [];

  for (const match of clipMatches) {
    try {
      const clipJson = match[1].trim();
      const clip = JSON.parse(clipJson) as Clip;
      clips.push(clip);
    } catch (error) {
      throw new Error(`Invalid clip JSON format`);
    }
  }

  return clips;
};

export const executePrompt = (args: {
  prompt: string;
  system: string;
}): Promise<string> => {
  const { prompt, system } = args;

  return claude.complete(
    [
      {
        role: "user",
        content: prompt,
      },
    ],
    ClaudeModelType.CLAUDE_SONNET_4_20250514,
    {
      system,
      maxTokens: 8000,
      temperature: 0.7,
    }
  );
};
