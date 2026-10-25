import type { Expect } from "@playwright/test";

/** Derived from the public extension API, including releases before this type was exported. */
export type MatcherReturnType = Awaited<ReturnType<Parameters<Expect["extend"]>[0][string]>>;
