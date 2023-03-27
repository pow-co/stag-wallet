
import { DevIssueContract } from './src/powcodev'

import { fetch } from 'powco'

import { Transaction } from 'bsv'

export async function main() {

  const txid = process.argv[2] || '2ca075bba3ddfa845ca849efa02597572bc5e38d26e679a0337609780178f92d'

  const txhex = await fetch(txid)

  const tx = new Transaction(txhex)

  const contract = DevIssueContract.fromTransaction(txhex)

  console.log(contract)

  console.log(contract.scriptedConstructor.args)

  console.log('genesis', contract.isGenesis)

  console.log('repo', contract.org)

  console.log('repo', contract.repo)

  console.log('closed', contract.closed)

  console.log(toJSON(contract))

}

function toJSON(contract:  typeof DevIssueContract | any): any {

  const props = contract.scriptedConstructor.args.reduce((out, arg) => {

    out[arg.name] = Buffer.from(arg.value, 'hex').toString('utf8')

    return out
  }, {})

  let closed = contract.statePropsArgs.find(arg => arg.name === 'closed').value

  return Object.assign(props, { closed })

}

main()

