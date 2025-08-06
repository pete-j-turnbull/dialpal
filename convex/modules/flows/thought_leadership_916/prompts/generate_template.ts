import { type Token } from "@packages/video-templates";

export const prompt = (tokens: Token[], companyName?: string) => `
<prompt>
  <goal>
    Convert the provided tokens into a structured LinkedIn video template following all template constraints and best practices.
  </goal>

  <instructions>
    • Analyze the content and create optimal scene structure for LinkedIn talking-head video
    • Always start with talking-head scene (never b-roll)
    • Break content into natural scenes based on content flow and editing rhythm
    • Add strategic b-roll cuts during key moments
    • Place logo tags when mentioning company/brand
    • Add important tags on single impactful words (use sparingly)
    • Ensure all b-roll scenes have required category and description
    • Each scene covers a contiguous range of tokens via start/end indices
    • Every token index from 0 to ${
      tokens.length - 1
    } must be covered by exactly one scene
    • All scenes must have explicit "type" attribute: "talking-head" or "broll"
    • Tag start/end indices reference token indices, not token IDs
  </instructions>

  <template_constraints>
    <scene_types>
      • Talking-head scenes: type="talking-head", no category/description attrs
      • B-roll scenes: type="broll", must have category and description attrs
      • First scene MUST be talking-head (never start with b-roll)
    </scene_types>

    <scene_attributes>
      • talking-head scenes:
        - type: "talking-head" (required)
        - style: "close-up" or "standard" (required)
        - effect: "slow-zoom" (optional, for high impact moments only)
      • broll scenes:
        - type: "broll" (required)
        - category: REQUIRED, must be one of: "pain-point", "solution", "product-walkthrough", "cta", "abstract"
        - description: REQUIRED, specific search terms for stock footage
        - style: "video-on-video" (optional, 16:9 video over blurred background)
    </scene_attributes>

    <allowed_tags>
      • "logo" - Show company logo when mentioning company name
        - Use on single word or company name tokens only
      • "important" - Emphasis on single impactful words
        - Use on single words only (including hyphenated words)
        - Use sparingly for maximum effect
    </allowed_tags>

    <broll_category_rules>
      • "pain-point" - User frustration/problems before using product
      • "solution" - Positive outcomes and benefits after using product
      • "product-walkthrough" - Complete user journey from start to finish
      • "cta" - Specific next steps for the viewer
      • "abstract" - Generic footage (use sparingly, only when no other category fits)
    </broll_category_rules>

    ${
      companyName
        ? `<logo_usage_rules>
      • Add logo tags ONLY when explicitly mentioning: "${companyName}"
      • Do NOT use logo tags for general brand concepts, credibility statements, or value propositions
      • Logo tags should only appear on tokens that contain or directly reference the company name
    </logo_usage_rules>`
        : ""
    }
  </template_constraints>

  <tokens_json>
    ${JSON.stringify(tokens, null, 2)}
  </tokens_json>

  <critical_response_requirements>
    IMPORTANT: You MUST wrap your response in <output></output> tags, with each scene wrapped in individual <scene_json></scene_json> tags for streaming support.
    
    Response Format:
    • Wrap the entire response in <output></output> tags
    • Wrap each individual scene JSON in <scene_json></scene_json> tags
    • The JSON inside each scene tag must be valid and properly formatted
    • Scenes should be output in sequential order
    • You may include brief explanatory text outside the XML tags if needed
    
    JSON Requirements:
    • Use double quotes for all strings
    • Ensure all brackets and braces are properly closed
    • No trailing commas
    • Numbers should be integers (not strings)
    • Boolean values should be true/false (not strings)
    • Each scene must be a complete, valid JSON object
    
    Validation Checklist:
    • All scene start/end indices are covered sequentially
    • No gaps or overlaps in token coverage
    • All required attributes are present
    • All string values use double quotes
    • Each scene JSON is properly formatted and valid
  </critical_response_requirements>

  <response_format>
  WRAP YOUR RESPONSE IN XML TAGS LIKE THIS:
  
  <output>
    <scene_json>
    {
      "id": "s1",
      "startIndex": 0,
      "endIndex": 15,
      "attrs": [
        {"key": "type", "value": "talking-head"},
        {"key": "style", "value": "standard"},
        {"key": "effect", "value": "slow-zoom"}
      ],
      "tags": []
    }
    </scene_json>
    <scene_json>
    {
      "id": "s2", 
      "startIndex": 16,
      "endIndex": 28,
      "attrs": [
        {"key": "type", "value": "broll"},
        {"key": "category", "value": "solution"},
        {"key": "description", "value": "business success, growth charts, celebrating team"}
      ],
      "tags": [{"name": "important", "startIndex": 20, "endIndex": 20}]
    }
    </scene_json>
  </output>
  </response_format>
</prompt>
`;
