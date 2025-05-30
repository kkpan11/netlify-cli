import { expect, test } from 'vitest'

import { FixtureTestContext, setupFixtureTests } from '../../utils/fixture.js'
import { getCLIOptions, withMockApi } from '../../utils/mock-api.js'
import type { MinimalAccount } from '../../../../src/utils/types.js'

const siteInfo = {
  account_slug: 'test-account',
  id: 'site_id',
  name: 'site-name',
  admin_url: 'https://app.netlify.com/projects/test-site/overview',
  url: 'https://test-site.netlify.app/',
}

const user = { full_name: 'Test User', email: 'test@netlify.com' }

const accounts: MinimalAccount[] = [
  {
    id: 'user-id',
    name: user.full_name,
    slug: siteInfo.account_slug,
    default: true,
    team_logo_url: null,
    on_pro_trial: false,
    organization_id: null,
    type_name: 'placeholder',
    type_slug: 'placeholder',
    members_count: 1,
  },
]

const routes = [
  { path: 'sites/site_id', response: siteInfo },
  { path: 'sites/site_id/service-instances', response: [] },
  {
    path: 'accounts',
    response: accounts,
  },
  { path: 'user', response: user },
]

await setupFixtureTests('empty-project', () => {
  test<FixtureTestContext>('should print status for a linked project', async ({ fixture }) => {
    await withMockApi(routes, async ({ apiUrl }: { apiUrl: string }) => {
      const { account, siteData } = await fixture.callCli(['status', '--json'], {
        execOptions: getCLIOptions({ apiUrl }),
        offline: false,
        parseJson: true,
      })

      if (account && typeof account === 'object' && 'GitHub' in account) {
        delete account.GitHub
      }

      expect(siteData).toMatchSnapshot()
      expect(account).toMatchSnapshot()
    })
  })
})
