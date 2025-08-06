import { Token, Scene as RawScene } from "@packages/video-templates";
import {
  SceneType,
  Scene,
  Video as TemplatedVideo,
  BrollCategory,
} from "@packages/video-templates/thought-leadership-169";
import { claude, ClaudeModelType } from "@convex/lib/claude";
import { STOCK_MUSIC } from "./const";
import {
  FileAudio,
  FileVideo,
  FileType,
  ContentType,
} from "@convex/schema/common";
import { Id } from "@convex/_generated/dataModel";
import { convex } from "@convex/lib/convex";
import { api } from "@convex/_generated/api";
import { ProductDatasetAssetType } from "@convex/schema/resources/product_dataset";

import { prompt } from "./prompts/generate_template";
import { pexels } from "@convex/lib/pexels";

const searchPexels = async (query: string): Promise<FileVideo[]> => {
  console.log("searchPexels", query);

  const searchResults = await pexels.searchVideos(query, {
    orientation: "landscape",
  });

  console.log("searchResults", searchResults);

  const files: FileVideo[] = [];

  for (const result of searchResults) {
    const stockId = result.id.toString();
    const videoFile = result.video_files.find(
      (f) => f.width === 1920 && f.height === 1080
    );

    if (!videoFile) continue;

    const file: FileVideo = {
      id: stockId,
      type: FileType.Video,
      url: videoFile.link,
      filename: videoFile.id.toString(),
      contentType: ContentType.VideoMp4,
      metadata: {
        width: 1920,
        height: 1080,
        duration: Math.floor(result.duration * 1000),
      },
    };

    files.push(file);
  }

  console.log("files", files);

  return files;
};

export const generateRawScenes = async (
  tokens: Token[],
  companyName?: string
) => {
  const result = await claude.complete(
    [
      {
        role: "user",
        content: prompt(tokens, companyName),
      },
    ],
    ClaudeModelType.CLAUDE_SONNET_4_20250514,
    {
      system: `You are an expert video editing AI that analyzes video structures and generates precise modification patches. You understand video scenes, tokens, timing, and how to optimize video structure for engagement. Focus on maintaining proper scene coverage and creating logical, engaging video flow.`,
      maxTokens: 8000,
      temperature: 0.3,
    }
  );

  const outputMatch = result.match(/<output>([\s\S]*?)<\/output>/);
  if (!outputMatch) {
    throw new Error(
      "No output found in response. Expected content wrapped in <output></output> tags."
    );
  }

  const outputContent = outputMatch[1];

  // Extract all scene JSON objects from <scene_json></scene_json> tags
  const sceneMatches = outputContent.matchAll(
    /<scene_json>([\s\S]*?)<\/scene_json>/g
  );
  const scenes: RawScene[] = [];

  for (const match of sceneMatches) {
    try {
      const sceneJson = match[1].trim();
      const scene = JSON.parse(sceneJson) as RawScene;
      scenes.push(scene);
    } catch (error) {
      console.error("Failed to parse scene JSON:", match[1], error);
      throw new Error("Invalid scene JSON format");
    }
  }

  if (scenes.length === 0) {
    throw new Error("No scenes found in response");
  }

  return scenes;
};

export const autoSelectBroll = async (args: {
  video: TemplatedVideo;
  productDatasetId?: Id<"product_datasets">;
}): Promise<TemplatedVideo> => {
  const { video, productDatasetId } = args;

  const brollScenes = video.scenes.filter(
    (scene) => scene.type === SceneType.Broll
  );

  const searchPromises = [];

  // trigger search queries
  for (let i = 0; i < brollScenes.length; i++) {
    const scene = brollScenes[i];
    const isAbstract = scene.category === BrollCategory.Abstract;

    const searchPromise = new Promise<{
      sceneId: string;
      searchResults: {
        file: FileVideo;
        trimStart?: number;
        trimEnd?: number;
      }[];
      isAbstract: boolean;
    }>(async (resolve, reject) => {
      try {
        let searchResults: {
          file: FileVideo;
          trimStart?: number;
          trimEnd?: number;
        }[] = [];

        if (isAbstract) {
          // Use Pexels for abstract scenes
          searchResults = (await searchPexels(scene.description)).map(
            (file) => ({
              file,
            })
          );
        } else {
          // Use product dataset for specific scenes (product walkthrough, solution, etc.)
          try {
            // Calculate scene duration from tokens
            const sceneTokens = video.tokens.slice(
              scene.startIndex,
              scene.endIndex + 1
            );
            const duration =
              sceneTokens.length > 0
                ? sceneTokens[sceneTokens.length - 1].end - sceneTokens[0].start
                : 3000; // Default to 3 seconds if no tokens

            // Map scene category to product dataset asset type
            const getAssetType = (
              category: BrollCategory
            ): ProductDatasetAssetType => {
              switch (category) {
                case BrollCategory.PainPoint:
                  return ProductDatasetAssetType.PainPoint;
                case BrollCategory.Solution:
                  return ProductDatasetAssetType.Solution;
                case BrollCategory.ProductWalkthrough:
                  return ProductDatasetAssetType.UserJourney;
                case BrollCategory.CTA:
                  return ProductDatasetAssetType.CallToAction;
                default:
                  return ProductDatasetAssetType.Solution;
              }
            };

            if (!productDatasetId) throw new Error("No product dataset ID");

            const clips = await convex.action(
              api.private.resources.product_dataset.searchClips,
              {
                productDatasetId,
                data: {
                  query: scene.description,
                  duration,
                  filter: {
                    type: getAssetType(scene.category),
                  },
                },
              }
            );

            searchResults = clips.map((clip) => ({
              file: clip.file,
              trimStart: clip.start,
              trimEnd: clip.end,
            }));

            if (searchResults.length === 0) {
              throw new Error("No clips found");
            }
          } catch (error) {
            console.warn(
              `Product dataset search failed for scene "${scene.description}": ${error}. Falling back to Pexels.`
            );
            // Fall back to Pexels if product dataset search fails
            searchResults = (await searchPexels(scene.description)).map(
              (file) => ({
                file,
              })
            );
          }
        }

        return resolve({ sceneId: scene.id, searchResults, isAbstract });
      } catch (error) {
        return reject(error);
      }
    });

    searchPromises.push(searchPromise);
  }

  const searches = await Promise.all(searchPromises);

  const updatedScenes: Scene[] = video.scenes.map((scene) => {
    if (scene.type === SceneType.TalkingHead) return scene;

    const search = searches.find((r) => r.sceneId === scene.id);
    console.log(search, "search");

    if (!search) return scene;

    if (search.searchResults.length === 0) return scene;
    const resultToUse = search.searchResults[0];

    return {
      ...scene,
      file: resultToUse.file,
      trimStart: resultToUse.trimStart,
      trimEnd: resultToUse.trimEnd,
    };
  });

  return {
    ...video,
    scenes: updatedScenes,
  };
};

export const getRandomMusicFile = (): FileAudio => {
  return STOCK_MUSIC[Math.floor(Math.random() * STOCK_MUSIC.length)];
};
