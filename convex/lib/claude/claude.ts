import { ClaudeModelType } from "./const";
import {
  AnthropicMessageResponse,
  ClaudeMessage,
  ClaudeOptions,
  ClaudeStreamCallbacks,
} from "./types";
import { requireEnv } from "../../../env";

export class ClaudeClient {
  /**
   * Generate a streaming text completion from Claude
   */
  async completeStream(
    messages: ClaudeMessage[],
    callbacks: ClaudeStreamCallbacks,
    model: ClaudeModelType = ClaudeModelType.CLAUDE_SONNET_4_20250514,
    options: ClaudeOptions = {}
  ): Promise<void> {
    try {
      const env = requireEnv("claude");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.claude.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "messages-2023-12-15",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens ?? 4000,
          temperature: options.temperature ?? 0.7,
          system: options.system,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Claude API error: ${response.status} ${errorText}`
        );
        callbacks.onError?.(error);
        throw error;
      }

      if (!response.body) {
        const error = new Error("Response body is null");
        callbacks.onError?.(error);
        throw error;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let responseObj: AnthropicMessageResponse | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const jsonData = line.slice(6); // Remove 'data: ' prefix
            if (jsonData === "[DONE]") break;

            try {
              const data = JSON.parse(jsonData);

              if (data.type === "content_block_delta" && data.delta?.text) {
                fullContent += data.delta.text;
                callbacks.onContent?.(data.delta.text);
              } else if (data.type === "message_stop") {
                responseObj = data.message;
              }
            } catch (e) {
              console.error("Error parsing streaming response", {
                error: e,
                line,
              });
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (responseObj) {
        const inputTokens = responseObj.usage?.input_tokens || 0;
        const outputTokens = responseObj.usage?.output_tokens || 0;
        const totalTokens = inputTokens + outputTokens;

        console.info("Claude API token usage", {
          model,
          inputTokens,
          outputTokens,
          totalTokens,
        });

        callbacks.onComplete?.(fullContent, {
          inputTokens,
          outputTokens,
        });
      } else {
        callbacks.onComplete?.(fullContent);
      }
    } catch (error) {
      console.error("Claude API streaming error", { error });
      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async complete(
    messages: ClaudeMessage[],
    model: ClaudeModelType = ClaudeModelType.CLAUDE_SONNET_4_20250514,
    options: ClaudeOptions = {}
  ): Promise<string> {
    try {
      const env = requireEnv("claude");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.claude.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "messages-2023-12-15",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens ?? 4000,
          temperature: options.temperature ?? 0.7,
          system: options.system,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} ${errorText}`);
      }

      const data: AnthropicMessageResponse = await response.json();

      const content = data.content[0]?.text || "";
      return content;
    } catch (error) {
      console.error("Claude API error", { error });
      throw error;
    }
  }

  /**
   * Utility method to create a simple user message
   */
  static createUserMessage(content: string): ClaudeMessage {
    return {
      role: "user",
      content,
    };
  }

  /**
   * Utility method to create a simple assistant message
   */
  static createAssistantMessage(content: string): ClaudeMessage {
    return {
      role: "assistant",
      content,
    };
  }
}
