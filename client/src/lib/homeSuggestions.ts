export type SuggestionState = "idle" | "loading" | "error" | "empty" | "results";

export function getSuggestionState({
  query,
  isLoading,
  isError,
  count,
}: {
  query: string;
  isLoading: boolean;
  isError: boolean;
  count: number;
}): SuggestionState {
  if (query.trim().length < 2) return "idle";
  if (isLoading) return "loading";
  if (isError) return "error";
  return count > 0 ? "results" : "empty";
}
