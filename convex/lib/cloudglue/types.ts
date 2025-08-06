export type File = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  bytes?: (number | null) | undefined;
  created_at?: number | undefined;
  filename?: string | undefined;
  uri: string;
  metadata?: (object | null) | undefined;
  video_info?:
    | Partial<{
        duration_seconds: number | null;
        height: number | null;
        width: number | null;
        format: string | null;
        has_audio: boolean | null;
      }>
    | undefined;
};

export type Collection = {
  id: string;
  object: "collection";
  name: string;
  description?: (string | null) | undefined;
  collection_type: "entities" | "rich-transcripts";
  extract_config?:
    | Partial<{
        prompt: string;
        schema: object;
        enable_video_level_entities: boolean;
        enable_segment_level_entities: boolean;
      }>
    | undefined;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
      }>
    | undefined;
  created_at: number;
  file_count: number;
};

export type FileList = {
  object: "list";
  data: Array<File>;
  total: number;
  limit: number;
  offset: number;
};

export type CollectionList = {
  object: "list";
  data: Array<Collection>;
  total: number;
  limit: number;
  offset: number;
};

export type CollectionFile = {
  collection_id: string;
  file_id: string;
  object: "collection_file";
  added_at: number;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  extract_status?:
    | ("pending" | "processing" | "completed" | "failed" | "not_applicable")
    | undefined;
  searchable_status?:
    | ("pending" | "processing" | "completed" | "failed" | "not_applicable")
    | undefined;
  file?: File | undefined;
};

export type CollectionFileList = {
  object: "list";
  data: Array<CollectionFile>;
  total: number;
  limit: number;
  offset: number;
};

export type ChatCompletionResponse = Partial<{
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<
    Partial<{
      index: number;
      message: ChatMessage;
      citations: Array<
        Partial<{
          collection_id: string;
          file_id: string;
          segment_id: string;
          start_time: string | number;
          end_time: string | number;
          text: string;
          context: string;
          relevant_sources: Array<
            Partial<{
              text: string;
            }>
          >;
          visual_scene_description: Array<
            Partial<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          >;
          scene_text: Array<
            Partial<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          >;
          speech: Array<
            Partial<{
              speaker: string;
              text: string;
              start_time: number;
              end_time: number;
            }>
          >;
        }>
      >;
    }>
  >;
  usage: Partial<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }>;
}>;

export type ChatCompletionRequest = {
  model: "nimbus-001";
  messages: Array<ChatMessage>;
  collections: Array<string>;
  filter?:
    | Partial<{
        metadata: Array<{
          path: string;
          operator:
            | "NotEqual"
            | "Equal"
            | "LessThan"
            | "GreaterThan"
            | "In"
            | "ContainsAny"
            | "ContainsAll";
          valueText?: string | undefined;
          valueTextArray?: Array<string> | undefined;
        }>;
        video_info: Array<{
          path: string;
          operator:
            | "NotEqual"
            | "Equal"
            | "LessThan"
            | "GreaterThan"
            | "In"
            | "ContainsAny"
            | "ContainsAll";
          valueText?: string | undefined;
          valueTextArray?: Array<string> | undefined;
        }>;
        file: Array<{
          path: string;
          operator:
            | "NotEqual"
            | "Equal"
            | "LessThan"
            | "GreaterThan"
            | "In"
            | "ContainsAny"
            | "ContainsAll";
          valueText?: string | undefined;
          valueTextArray?: Array<string> | undefined;
        }>;
      }>
    | undefined;
  force_search?: boolean | undefined;
  include_citations?: boolean | undefined;
  temperature?: number | undefined;
  top_p?: number | undefined;
  max_tokens?: number | undefined;
};
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string | undefined;
};

export type ChatCompletionFilter = {
  metadata?: Array<{
    path: string;
    operator:
      | "NotEqual"
      | "Equal"
      | "LessThan"
      | "GreaterThan"
      | "In"
      | "ContainsAny"
      | "ContainsAll";
    valueText?: string;
    valueTextArray?: string[];
  }>;
  video_info?: Array<{
    path: string;
    operator:
      | "NotEqual"
      | "Equal"
      | "LessThan"
      | "GreaterThan"
      | "In"
      | "ContainsAny"
      | "ContainsAll";
    valueText?: string;
    valueTextArray?: string[];
  }>;
  file?: Array<{
    path: string;
    operator:
      | "NotEqual"
      | "Equal"
      | "LessThan"
      | "GreaterThan"
      | "In"
      | "ContainsAny"
      | "ContainsAll";
    valueText?: string;
    valueTextArray?: string[];
  }>;
};

export type TranscriptionJob = {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  url: string;
  created_at: number;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_visual_scene_description: boolean;
        enable_scene_text: boolean;
      }>
    | undefined;
  data?:
    | {
        content?: string | undefined;
        title?: string | undefined;
        summary?: string | undefined;
        speech?:
          | Array<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          | undefined;
        visual_scene_description?:
          | Array<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          | undefined;
        scene_text?:
          | Array<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          | undefined;
      }
    | undefined;
  error?: string | undefined;
};
