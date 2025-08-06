export type ClaudeOptions = {
  temperature?: number;
  maxTokens?: number;
  system?: string;
};

// Message types
export type ClaudeMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Streaming event types
export type ClaudeStreamEvent = {
  type:
    | "content_block_start"
    | "content_block_delta"
    | "content_block_stop"
    | "message_stop";
  delta?: { text: string };
  contentBlock?: { type: string; text?: string };
};

// Callbacks for streaming responses
export type ClaudeStreamCallbacks = {
  onContent?: (content: string) => void;
  onComplete?: (
    fullContent: string,
    usage?: { inputTokens: number; outputTokens: number }
  ) => void;
  onError?: (error: Error) => void;
};

export type AnthropicMessageResponse = {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};
