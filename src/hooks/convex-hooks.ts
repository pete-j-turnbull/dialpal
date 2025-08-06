import { type FunctionReference } from "convex/server";
import {
  OptionalRestArgsOrSkip,
  useConvexAuth,
  useQueries,
} from "convex/react";
import { makeUseQueryWithStatus } from "convex-helpers/react";

const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

export function useAuthenticatedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: OptionalRestArgsOrSkip<Query>[0] | "skip" = {}
) {
  const { isAuthenticated } = useConvexAuth();

  return useQueryWithStatus(query, isAuthenticated ? args : "skip");
}
