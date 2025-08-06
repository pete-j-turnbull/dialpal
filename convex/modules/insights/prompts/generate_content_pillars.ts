import { CreatorDNA } from "@convex/schema/workspace";

export const prompt = (creatorDNA: CreatorDNA) => `
<prompt>
  <goal>
    Use the information provided from the company and creator profile to generate 3 unique, highly personalized content pillars. Each pillar must reflect the specific values, goals, target audience, tone, and unique characteristics of this company and creator.
  </goal>

  <instructions>
    • Generate 3 unique content pillars based on the creator DNA
    • Each pillar must be highly personalized and reflect specific values, goals, and characteristics
    • Avoid generic suggestions - directly incorporate details from the profiles
    • Scripts should be entertaining and not feel like direct promotional content or sales pitches
    • Ensure content is tailored and relevant to the specific brand identity
  </instructions>

  <data_constraints>
    <pillar_structure>
      Each content pillar JSON object must include these fields:
      • "title": A clear, specific name for the pillar
      • "summary": A concise explanation of the theme
      • "purpose": What this content pillar aims to achieve (e.g., attract leads, build authority)
      • "audience": Who the content is intended for
      • "tone": The voice or style to use (e.g., confident, witty, expert)
      • "ideas": An array of 3-5 idea objects
    </pillar_structure>

    <idea_structure>
      Each idea object in the "ideas" array must contain:
      • "title": A compelling video headline
      • "summary": 1-2 sentence overview of the idea
      • "script": A fully written short-form script (~35s), optimized for talking-head delivery. Use strong hooks, delayed payoffs, and retention-boosting structures
    </idea_structure>
  </data_constraints>

  <creator_dna>
    ${JSON.stringify(creatorDNA, null, 2)}
  </creator_dna>

  <critical_response_requirements>
    IMPORTANT: You MUST wrap your response in <output></output> tags, with each pillar wrapped in individual <pillar_json></pillar_json> tags for streaming support.
    
    Response Format:
    • Wrap the entire response in <output></output> tags
    • Wrap each individual pillar JSON in <pillar_json></pillar_json> tags
    • The JSON inside each pillar tag must be valid and properly formatted
    • Pillars should be output in sequential order
    • You may include brief explanatory text outside the XML tags if needed
    
    JSON Requirements:
    • Use double quotes for all strings
    • Ensure all brackets and braces are properly closed
    • No trailing commas
    • Each pillar must be a complete, valid JSON object
    
    Validation Checklist:
    • All required fields are present in each pillar
    • All string values use double quotes
    • Each pillar JSON is properly formatted and valid
    • Character limit is respected
  </critical_response_requirements>

  <response_format>
  WRAP YOUR RESPONSE IN XML TAGS LIKE THIS:
  
  <output>
    <pillar_json>
    {
      "title": "Example Pillar",
      "summary": "This theme explores XYZ for [target audience].",
      "purpose": "Educate startup founders on go-to-market strategies",
      "audience": "Early-stage SaaS founders",
      "tone": "Authoritative yet conversational",
      "ideas": [
        {
          "title": "Sample Video Title",
          "summary": "This video introduces the concept of...",
          "script": "This is the full 35-second short-form script..."
        }
      ]
    }
    </pillar_json>
    <pillar_json>
    {
      "title": "Another Example Pillar",
      "summary": "This theme focuses on ABC for [different audience].",
      "purpose": "Build brand authority and trust",
      "audience": "Enterprise decision makers",
      "tone": "Professional and insightful",
      "ideas": [
        {
          "title": "Another Video Title",
          "summary": "This video explains how to...",
          "script": "Hook: Did you know that 87% of enterprises... [continue script]"
        }
      ]
    }
    </pillar_json>
  </output>
  </response_format>
</prompt>
`;
