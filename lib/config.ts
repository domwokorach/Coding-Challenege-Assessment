// Set NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL to the org/repo's actual Discussions
// page when deploying. Falls back to a placeholder so the button still works
// in local development.
export const GITHUB_DISCUSSIONS_URL =
  process.env.NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL ??
  "https://github.com/orgs/your-org/discussions";
