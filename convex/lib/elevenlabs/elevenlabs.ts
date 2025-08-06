"use node";

import {
  ElevenLabs as ElevenLabsClass,
  ElevenLabsClient,
} from "@elevenlabs/elevenlabs-js";
import { requireEnv } from "../../../env";

export class Elevenlabs {
  private client?: ElevenLabsClient;

  private ensureClient(): ElevenLabsClient {
    if (!this.client) {
      const env = requireEnv("elevenlabs");
      this.client = new ElevenLabsClient({ apiKey: env.elevenlabs.apiKey });
    }

    return this.client;
  }

  public async streamTextToSpeech(voiceId: string, text: string) {
    const client = this.ensureClient();
    const result = await client.textToSpeech.stream(voiceId, {
      outputFormat: ElevenLabsClass.OutputFormat.Mp344100128,
      text,
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0,
        useSpeakerBoost: true,
      },
    });

    return result;
  }

  public async generateForcedAlignment(audioBlob: Blob, text: string) {
    const startTime = performance.now();

    const client = this.ensureClient();

    try {
      const transcript = await client.forcedAlignment.create({
        file: audioBlob,
        text,
        enabledSpooledFile: true,
      });

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      console.log(
        `generateForcedAlignment completed in ${executionTime}ms (${(
          executionTime / 1000
        ).toFixed(2)}s)`
      );

      const tokens = transcript.words
        .filter((w) => w.text.trim() !== "")
        .map((w) => ({
          text: w.text,
          start: Math.round(w.start * 1000),
          end: Math.round(w.end * 1000),
        }));

      return tokens;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      console.error(
        `generateForcedAlignment failed after ${executionTime}ms (${(
          executionTime / 1000
        ).toFixed(2)}s):`,
        error
      );

      throw error;
    }
  }
}
