import {
  suggestDateIdeas,
  type SuggestDateIdeasInput,
  type SuggestDateIdeasOutput,
} from '@/ai/flows/ai-suggested-date-ideas';

export const dateIdeasProvider = {
  id: 'genkit-googleai',
  label: 'Gemini via Genkit',
};

export async function generateDateIdeas(input: SuggestDateIdeasInput): Promise<SuggestDateIdeasOutput> {
  return suggestDateIdeas(input);
}
