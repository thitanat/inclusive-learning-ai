const basePath = process.env.NODE_ENV === "production" ? "/inclusive" : "";

/** Prefix public files and API calls that the browser does not rewrite for Next's basePath. */
export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}
