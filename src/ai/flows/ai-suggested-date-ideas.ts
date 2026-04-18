'use server';
/**
 * @fileOverview An AI agent that suggests date ideas based on distance and mutual interests.
 *
 * - suggestDateIdeas - A function that suggests date ideas.
 * - SuggestDateIdeasInput - The input type for the suggestDateIdeas function.
 * - SuggestDateIdeasOutput - The return type for the suggestDateIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logEventServer } from '@/lib/logging-service';

const SuggestDateIdeasInputSchema = z.object({
  userLocation: z
    .string()
    .describe("The user's current location (e.g., 'city, country')."),
  partnerLocation: z
    .string()
    .describe("The partner's current location (e.g., 'city, country')."),
  mutualInterests: z
    .string()
    .describe('A comma-separated list of mutual interests (e.g., hiking, movies, cooking).'),
  maxDistanceMiles: z
    .number()
    .int()
    .positive()
    .optional()
    .optional()
    .describe('The maximum distance in miles the user is willing to travel.'),
});
export type SuggestDateIdeasInput = z.infer<typeof SuggestDateIdeasInputSchema>;

const SuggestDateIdeasOutputSchema = z.object({
  dateIdeas: z
    .array(z.string())
    .describe('A list of suggested date ideas.'),
});
export type SuggestDateIdeasOutput = z.infer<typeof SuggestDateIdeasOutputSchema>;

export async function suggestDateIdeas(input: SuggestDateIdeasInput): Promise<SuggestDateIdeasOutput> {
  return suggestDateIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDateIdeasPrompt',
  input: {schema: SuggestDateIdeasInputSchema},
  output: {schema: SuggestDateIdeasOutputSchema},
  config: {
    temperature: 0.7, // Add a bit more creativity
  },
  prompt: `You are a date idea generator.  Given the user's location, their partner's location, and their mutual interests, suggest some date ideas. Consider the distance between them, and suggest both in-person and virtual date ideas.

User Location: {{{userLocation}}}
Partner Location: {{{partnerLocation}}}
Mutual Interests: {{{mutualInterests}}}

{% if maxDistanceMiles %}Maximum travel distance: {{{maxDistanceMiles}}} miles.{% endif %}

Here are some date ideas:
`,
});

const suggestDateIdeasFlow = ai.defineFlow(
  {
    name: 'suggestDateIdeasFlow',
    inputSchema: SuggestDateIdeasInputSchema,
    outputSchema: SuggestDateIdeasOutputSchema,
  },
  async input => {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Unauthorized: You must be logged in.");
    }

    try {
      const {output} = await prompt(input);
      
      // Log successful AI request
      await logEventServer('ai_request', `Generated date ideas for ${user.email}`, { 
        input, 
        result_count: output?.dateIdeas?.length || 0 
      });

      return output!;
    } catch (error) {
      console.error("AI Genkit error:", error);
      
      // Log AI error
      await logEventServer('ai_error', `Failed to generate date ideas for ${user.email}`, { error: String(error) });
      
      throw new Error("Failed to generate date ideas. Please try again.");
    }
  }
);
