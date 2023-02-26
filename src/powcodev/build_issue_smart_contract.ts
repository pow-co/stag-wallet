
require('dotenv').config()

import { deployDevIssueContract } from './'

async function start() {

  const transaction = await deployDevIssueContract({
    version: '0.0.1',
    platform: 'github',
    org: 'pow-co',
    repo: 'powco.dev',
    issue_number: '0',
    title: 'Automatically Post New DevIssue Instance On New Issue Created',
    description: 'Then index the issue in the database so no duplicates are created'
  }, 10_000) 

  console.log(transaction)

  //console.log(transaction.serialize())

}

if (require.main === module) {

  start()

}

