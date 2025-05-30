import fetch from 'node-fetch'
import execa from 'execa'

import { GitHubRepoResponse, logAndThrowError } from '../command-helpers.js'
import { GitHubRepo } from '../types.js'

export const getTemplatesFromGitHub = async (token: string): Promise<GitHubRepo[]> => {
  const getPublicGitHubReposFromOrg = new URL(`https://api.github.com/orgs/netlify-templates/repos`)
  // GitHub returns 30 by default and we want to avoid our limit
  // due to our archived repositories at any given time
  const REPOS_PER_PAGE = 70

  getPublicGitHubReposFromOrg.searchParams.set('type', 'public')
  getPublicGitHubReposFromOrg.searchParams.set('sort', 'full_name')
  // @ts-expect-error TS(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
  getPublicGitHubReposFromOrg.searchParams.set('per_page', REPOS_PER_PAGE)

  let allTemplates: GitHubRepo[] = []
  try {
    const templates = await fetch(getPublicGitHubReposFromOrg, {
      method: 'GET',
      headers: {
        Authorization: `token ${token}`,
      },
    })
    allTemplates = (await templates.json()) as GitHubRepo[]
  } catch (error_) {
    return logAndThrowError(error_)
  }
  return allTemplates
}

export const validateTemplate = async ({ ghToken, templateName }: { ghToken: string; templateName: string }) => {
  const response = await fetch(`https://api.github.com/repos/${templateName}`, {
    headers: {
      Authorization: `token ${ghToken}`,
    },
  })

  if (response.status === 404) {
    return { exists: false }
  }

  if (!response.ok) {
    throw new Error(`Error fetching template ${templateName}: ${await response.text()}`)
  }

  const data = (await response.json()) as GitHubRepoResponse

  return { exists: true, isTemplate: data.is_template }
}

export const createRepo = async (
  templateName: string,
  ghToken: string,
  siteName: string,
): Promise<GitHubRepoResponse> => {
  const resp = await fetch(`https://api.github.com/repos/${templateName}/generate`, {
    method: 'POST',
    headers: {
      Authorization: `token ${ghToken}`,
    },
    body: JSON.stringify({
      name: siteName,
    }),
  })

  const data = await resp.json()

  return data as GitHubRepoResponse
}

export const callLinkSite = async (cliPath: string, repoName: string, input: string) => {
  const { stdout } = await execa(cliPath, ['link'], {
    input,
    cwd: repoName,
  })
  return stdout
}
