
import * as bsv from 'bsv'

import { Actor } from './actor'

import { v4 as uuid } from 'uuid'

import { fetch } from 'powco'

import { fromTx, Txo } from 'txo'

import { loadWallet, Wallet } from './wallet'

import { log } from './log'

const axios = require('axios')

interface OnchainPostParams {
  app: string;
  key: string;
  val: any;
}

interface OnchainPostResult {
  txid: string;
  txhex: string;
  tx: bsv.Transaction;
  txo: Txo;
}

var wallet: Wallet

// use default wallet
export async function post(params: OnchainPostParams) {

  return onchain().post(params)

}

export async function findOne(params: any) {

  return onchain().findOne(params)

}

interface FindOne {
  app?: string;
  type?: string;
  content?: any;
  author?: string;
}

const onchain = (wallet?: Wallet) => {

  return {

    findOne: async(params: FindOne) => {

      const where = {}

      if (params.app) { where['app'] = params.app }

      if (params.author) { where['author'] = params.author }

      if (params.type) { where['type'] = params.type }

      if (params.content) {

        Object.keys(params.content).forEach(key => {

          where[key] = params.content[key]

        })

        delete params.content

      }

      const query = new URLSearchParams(where).toString()

      const url = `https://onchain.sv/api/v1/events?${query}`

      log.debug('onchain.sv.events.get', { url })

      const { data } = await axios.get(url)

      log.debug('onchain.sv.events.get.result', { url, data })

      const [event] = data.events

      if (!event) {

        return
      }

      return event

    },

    post: async (params: OnchainPostParams) => {

      if (!wallet) {

        wallet = await loadWallet()

      }

      const actor = new Actor({
        wallet
      })

      const message = {
        app: params.app,
        event: params.key,
        payload: params.val,
        nonce: uuid()
      }

      console.log('onchain.publish.message', message)

      const txid: any = await actor.publishMessage(message)

      console.log('onchain.publish.message.result', { result: txid, message })

      const txhex = await fetch(txid)

      const txo = await fromTx(txhex)

      axios.get(`https://onchain.sv/api/v1/events/${txid}`)
        .then((result) => {

          log.debug('onchain.sv.import.success', result.data)

        })
        .catch((error) => {

          log.error('onchain.sv.import.error', error)

        })

      return {
        txid,
        txhex,
        txo,
        tx: new bsv.Transaction(txhex)
      }

    }

  }

}

export default onchain
