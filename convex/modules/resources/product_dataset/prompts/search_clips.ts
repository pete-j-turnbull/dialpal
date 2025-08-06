import { Id } from "@convex/_generated/dataModel";
import { RichTranscript } from "@convex/schema/resources/product_dataset";

// Prompt for searching video clips that match a query with specified duration
// Takes a search query, target clip duration in seconds, and array of videos with transcripts
// Returns clips that semantically match the query and are approximately the specified duration

export const prompt = (
  query: string,
  duration: number,
  videos: {
    id: Id<"product_dataset_assets">;
    transcript: RichTranscript;
  }[]
) => `
<prompt>
  <goal>
    Analyze the provided video transcripts to find and extract segments that match the given query. Return precise timestamps for each matching segment along with the relevant content.
  </goal>

  <instructions>
    • Search through all provided video transcripts for segments that match the query
    • Identify relevant clips based on semantic meaning, not just exact text matches
    • Consider context around matched segments to determine appropriate start and end times
    • Return clips that are approximately ${duration} seconds in length
    • Return multiple clips if the query matches content in different parts of the videos
    • Prioritize segments that provide complete, coherent thoughts related to the query
    • Include segments where the topic is discussed in depth, not just mentioned in passing
    • Adjust clip boundaries to match natural speech patterns while respecting the duration constraint
  </instructions>

  <data_constraints>
    <clip_structure>
      Each clip JSON object must include these fields:
      • "id": The ID of the video asset containing this clip
      • "start": Start timestamp in seconds (number)
      • "end": End timestamp in seconds (number)
      • "content": The actual transcript text for this segment
      • "relevance": Brief explanation of why this clip matches the query
      • "confidence": A score from 0-1 indicating match confidence
    </clip_structure>

    <matching_criteria>
      • Semantic relevance to the query topic
      • Completeness of thought or explanation
      • Natural speech boundaries (avoid cutting mid-sentence)
      • Target clip duration of ${duration} seconds
      • Allow ±20% variance from target duration to accommodate natural speech boundaries
      • Prioritize content relevance over exact duration matching when necessary
    </matching_criteria>
  </data_constraints>

  <query>
    ${query}
  </query>

  <target_duration>
    ${duration} seconds
  </target_duration>

  <videos>
    ${JSON.stringify(videos, null, 2)}
  </videos>

  <critical_response_requirements>
    IMPORTANT: You MUST wrap your response in <output></output> tags, with each clip wrapped in individual <clip_json></clip_json> tags for streaming support.
    
    Response Format:
    • Wrap the entire response in <output></output> tags
    • Wrap each individual clip JSON in <clip_json></clip_json> tags
    • The JSON inside each clip tag must be valid and properly formatted
    • Clips should be output in order of relevance (highest confidence first)
    • You may include brief explanatory text outside the XML tags if needed
    
    JSON Requirements:
    • Use double quotes for all strings
    • Ensure all brackets and braces are properly closed
    • No trailing commas
    • Each clip must be a complete, valid JSON object
    • Timestamps must be numbers (not strings)
    
    Validation Checklist:
    • All required fields are present in each clip
    • All string values use double quotes
    • Timestamps are valid numbers
    • Each clip JSON is properly formatted and valid
  </critical_response_requirements>

  <response_format>
  WRAP YOUR RESPONSE IN XML TAGS LIKE THIS:
  
  <output>
    <clip_json>
    {
      "id": "j97abc123def456",
      "start": 15500,
      "end": 25500,
      "content": "The actual transcript text from this segment...",
      "relevance": "This segment discusses the query topic by explaining...",
      "confidence": 0.95
    }
    </clip_json>
    <clip_json>
    {
      "id": "j97xyz789ghi012",
      "start": 120000,
      "end": 130200,
      "content": "Another relevant segment from a different video...",
      "relevance": "This clip provides examples of the query topic through...",
      "confidence": 0.87
    }
    </clip_json>
  </output>
  </response_format>
</prompt>
`;
