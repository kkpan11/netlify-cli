import type { OptionValues } from 'commander'
import terminalLink from 'terminal-link'

import { chalk } from '../../utils/command-helpers.js'
import requiresSiteInfo from '../../utils/hooks/requires-site-info.js'
import type BaseCommand from '../base-command.js'

const functions = (_options: OptionValues, command: BaseCommand) => {
  command.help()
}

export const createFunctionsCommand = (program: BaseCommand) => {
  program
    .command('functions:build')
    .alias('function:build')
    .description('Build functions locally')
    .option('-f, --functions <directory>', 'Specify a functions directory to build to')
    .option('-s, --src <directory>', 'Specify the source directory for the functions')
    .action(async (options: OptionValues, command: BaseCommand) => {
      const { functionsBuild } = await import('./functions-build.js')
      await functionsBuild(options, command)
    })

  program
    .command('functions:create')
    .alias('function:create')
    .argument('[name]', 'name of your new function file inside your functions directory')
    .description('Create a new function locally')
    .option('-n, --name <name>', 'function name')
    .option('-u, --url <url>', 'pull template from URL')
    .option('-l, --language <lang>', 'function language')
    .option('-o, --offline', 'Disables any features that require network access')
    .addExamples([
      'netlify functions:create',
      'netlify functions:create hello-world',
      'netlify functions:create --name hello-world',
    ])
    .action(async (name: string, options: OptionValues, command: BaseCommand) => {
      const { functionsCreate } = await import('./functions-create.js')
      await functionsCreate(name, options, command)
    })

  program
    .command('functions:invoke')
    .alias('function:trigger')
    .argument('[name]', 'function name to invoke')
    .description(
      `Trigger a function while in netlify dev with simulated data, good for testing function calls including Netlify's Event Triggered Functions`,
    )
    .option('-n, --name <name>', 'function name to invoke')
    .option('-f, --functions <dir>', 'Specify a functions folder to parse, overriding netlify.toml')
    .option('-q, --querystring <query>', 'Querystring to add to your function invocation')
    .option('-p, --payload <data>', 'Supply POST payload in stringified json, or a path to a json file')
    // TODO: refactor to not need the `undefined` state by removing the --identity flag (value `identity` will be then always defined to true or false)
    .option(
      '--identity',
      'simulate Netlify Identity authentication JWT. pass --identity to affirm unauthenticated request',
    )
    .option(
      '--no-identity',
      'simulate Netlify Identity authentication JWT. pass --no-identity to affirm unauthenticated request',
    )
    .option('--port <port>', 'Port where netlify dev is accessible. e.g. 8888', (value) => Number.parseInt(value))
    .option('-o, --offline', 'Disables any features that require network access')
    .addExamples([
      'netlify functions:invoke',
      'netlify functions:invoke myfunction',
      'netlify functions:invoke --name myfunction',
      'netlify functions:invoke --name myfunction --identity',
      'netlify functions:invoke --name myfunction --no-identity',
      `netlify functions:invoke myfunction --payload '{"foo": 1}'`,
      'netlify functions:invoke myfunction --querystring "foo=1',
      'netlify functions:invoke myfunction --payload "./pathTo.json"',
    ])
    .action(async (name: string, options: OptionValues, command: BaseCommand) => {
      const { functionsInvoke } = await import('./functions-invoke.js')
      await functionsInvoke(name, options, command)
    })

  program
    .command('functions:list')
    .alias('function:list')
    .description(
      `List functions that exist locally
Helpful for making sure that you have formatted your functions correctly

NOT the same as listing the functions that have been deployed. For that info you need to go to your Netlify deploy log.`,
    )
    .option('-f, --functions <dir>', 'Specify a functions directory to list')
    .option('--json', 'Output function data as JSON')
    .hook('preAction', requiresSiteInfo)
    .action(async (options: OptionValues, command: BaseCommand) => {
      const { functionsList } = await import('./functions-list.js')
      await functionsList(options, command)
    })

  program
    .command('functions:serve')
    .alias('function:serve')
    .description('Serve functions locally')
    .option('-f, --functions <dir>', 'Specify a functions directory to serve')
    .option('-p, --port <port>', 'Specify a port for the functions server', (value) => Number.parseInt(value))
    .option('-o, --offline', 'Disables any features that require network access')
    .addHelpText('after', 'Helpful for debugging functions.')
    .action(async (options: OptionValues, command: BaseCommand) => {
      const { functionsServe } = await import('./functions-serve.js')
      await functionsServe(options, command)
    })

  const name = chalk.greenBright('`functions`')

  return program
    .command('functions')
    .alias('function')
    .description(
      `Manage netlify functions
The ${name} command will help you manage the functions in this project`,
    )
    .addExamples([
      'netlify functions:create --name function-xyz',
      'netlify functions:build --functions build/to/directory --src source/directory',
    ])
    .addHelpText('afterAll', () => {
      const docsUrl = 'https://docs.netlify.com/functions/overview/'
      return `
For more information about Netlify Functions, see ${terminalLink(docsUrl, docsUrl, { fallback: false })}
`
    })
    .action(functions)
}
