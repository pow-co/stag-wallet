
require('dotenv').config()

import { deployDevIssueContract } from './'

async function start() {

  const transaction = await deployDevIssueContract({
    platform: 'github',
    org: 'pow-co',
    repo: 'powco.dev',
    issue_number: 0n,
    title: 'Automatically Post New DevIssue Instance On New Issue Created',
    description: 'Then index the issue in the database so no duplicates are created'
  }) 

  console.log(transaction)

  //console.log(transaction.serialize())

}

if (require.main === module) {

  start()

}
