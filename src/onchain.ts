
import * as bsv from 'bsv'

import { Actor } from './actor'

import { v4 as uuid } from 'uuid'

import { fetch } from 'powco'

import { fromTx, Txo } from 'txo'

import { loadWallet, Wallet } from './wallet'

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

const onchain = (wallet?: Wallet) => {

  return {

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
