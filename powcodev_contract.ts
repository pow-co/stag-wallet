
require('dotenv').config()

import { deployDevIssueContract } from './src/powcodev'

import { broadcast } from './src/whatsonchain'

async function start() {

  const transaction = await deployDevIssueContract({
    platform: 'github',
    org: 'pow-co',
    repo: 'powco.dev',
    //@ts-ignore
    issue_number: 0n,
    title: 'Automatically Post New DevIssue Instance On New Issue Created',
    description: 'Then index the issue in the database so no duplicates are created'
  }, 100_000) 

  console.log(transaction)

  const txid = await broadcast(transaction)

  console.log({ txid })

}

if (require.main === module) {

  start()

}

