
import { loadWallet, Wallet } from './wallet'

import { BoostPowJob } from 'boostpow'

import { broadcast } from 'powco'

const axios = require('axios')

interface NewBoostJob {
  content: string;
  difficulty: number;
  category: string;
  tag: string;
  satoshis: number;
}

export async function boostpow(params: NewBoostJob, wallet?: Wallet) {

  const newJob = {
    content: params.content,
    diff: params.difficulty,
  }

  if (params.category) {

    newJob['category'] = Buffer.from(params.category).toString('hex')
  }

  if (params.tag) {

    newJob['tag'] = Buffer.from(params.tag).toString('hex')
  }

  const job = BoostPowJob.fromObject(newJob)

  const script = job.toScript().toHex()

  if (!wallet) {

    wallet = await loadWallet()
    
  }
  
  const payment = await wallet.buildPayment({

    instructions: [{

      outputs: [{

        script,

        amount: params.satoshis

      }]

    }]

  }, 'BSV')

  const result = await broadcast(payment)

  axios.get(`http://pow.co/api/v1/boost/jobs/${result}`)

  return BoostPowJob.fromRawTransaction(payment)

}
