import { claude, ClaudeModelType } from "@convex/lib/claude";
import { ContentPillar } from "@convex/schema/content_pillar";

export const parseContentPillarsFromText = (text: string) => {
  const outputMatch = text.match(/<output>([\s\S]*?)<\/output>/);
  if (!outputMatch) {
    throw new Error(
      "No output found in response. Expected content wrapped in <output></output> tags."
    );
  }

  const outputContent = outputMatch[1];

  const pillarMatches = outputContent.matchAll(
    /<pillar_json>([\s\S]*?)<\/pillar_json>/g
  );
  const pillars: ContentPillar[] = [];

  for (const match of pillarMatches) {
    try {
      const pillarJson = match[1].trim();
      const pillar = JSON.parse(pillarJson) as ContentPillar;
      pillars.push(pillar);
    } catch (error) {
      throw new Error(`Invalid pillar JSON format`);
    }
  }

  return pillars;
};

export const executePrompt = (args: {
  prompt: string;
  system: string;
}): Promise<string> => {
  const { prompt, system } = args;

  return new Promise((resolve, reject) => {
    return claude.completeStream(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        onComplete: (text) => resolve(text),
        onError: (error) => reject(error),
      },
      ClaudeModelType.CLAUDE_SONNET_4_20250514,
      {
        system,
        maxTokens: 8000,
        temperature: 0.7,
      }
    );
  });
};
