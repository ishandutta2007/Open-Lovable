import { getGithubUser } from "../handlers/github_handlers";

export async function getGitAuthor() {
  const user = await getGithubUser();
  const author = user
    ? {
        name: `[openlovable]`,
        email: user.email,
      }
    : {
        name: "[openlovable]",
        email: "git@openlovable.sh",
      };
  return author;
}
