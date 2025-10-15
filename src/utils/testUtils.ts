import { serialiseJsx } from "@metamask/snaps-utils";

// Helper to serialise an unknown JSX/content into a string for tests.
// We keep the single internal cast here to avoid sprinkling `as any`
// throughout the tests. This localises the unsafe cast to one file.
export function serialiseUnknownContent(node: unknown): string {
  // The test runtime accepts the JSX produced by the snap; the type
  // system for serialiseJsx is stricter than what the test runtime
  // accepts. Localise the cast here to keep test files clean.
  // serialiseJsx currently has a narrower type than the runtime returns.
  // Suppress the type error here rather than using `as any` in many places.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore -- accepted: runtime produces valid JSX for serialiseJsx
  return serialiseJsx(node);
}
