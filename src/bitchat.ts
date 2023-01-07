
import * as bsv from 'bsv-2'

import filepay from './filepay'

import * as uuid from 'uuid'

import { Wallet } from './wallet';

import { run } from './run'

import { broadcast } from 'powco'

const axios = require('axios')

interface NewMessage {
  app: string;
  event: string;
  payload: any;
  nonce?: string;
}

interface SocialMessage  {
  app: string;
  content: string;
  author?: string;
  contentType?: string;
}

interface BlockchainMessage extends NewMessage {
  txid: string;
  vout: number;
  script: string;
  author?: string;
}

interface ActorParams {
  purse: string;
  owner: string;
}

export const authorIdentityPrefix = '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva';

export class Actor {
  //@ts-ignore
  purse: bsv.PrivKey;
  //@ts-ignore
  owner: bsv.PrivKey;
  wallet: Wallet;

  constructor({wallet}: {wallet: Wallet}) {
    this.wallet = wallet;
    this.purse = new bsv.PrivKey().fromWif(wallet.cards[0].privatekey)
    this.owner = new bsv.PrivKey().fromWif(wallet.cards[0].privatekey)
  }

  get identity() {
    return new bsv.Address().fromPrivKey(this.owner).toString()
    
  }

  publishOpReturn(opReturn: string[]): Promise<any> {

    return new Promise(async (resolve, reject) => {

      const unspent = await this.wallet.cards[0].listUnspent()

      const inputs = unspent.map(utxo => {

        return {
            "txid": utxo.txid,
            "value": utxo.value,
            "script": utxo.scriptPubKey,
            "outputIndex": utxo.vout,
            "required": false
        }
      })

      const params = {
        pay:  {
          key: this.purse.toWif(),
          inputs,
          to: [{

            data: opReturn,

            value: 0
          }]
        }
      };

      filepay.build(params, async (error, tx) => {

        if (error) { return reject(error.response) }

        const txhex = tx.serialize()

        const txid = await broadcast(txhex)

        resolve({txhex, txid})

      })

    })

  }


  async post(message: string, paymail: string): Promise<{txid:string, txhex:string}> {


      const keypair = new bsv.KeyPair().fromPrivKey(this.owner)
      let address = new bsv.Address().fromString(this.identity)

      const unspent = await this.wallet.cards[0].listUnspent()

      const inputs = unspent.map(utxo => {

        return {
            "txid": utxo.txid,
            "value": utxo.value,
            "script": utxo.scriptPubKey,
            "outputIndex": utxo.vout,
            "required": false
        }
      })

      const {txhex, txid } = await this.publishOpReturn([
        "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut", // B Prefix
         // Your Message
        message,
        "text/plain",
        "utf-8",
        "|",
        "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5", // MAP Prefix
        "SET",
        "app",
        // Your app's name
        "chat.pow.co",
        "type",
        "message",
        // Can add more key-value pairs after this as needed: 
        "paymail", 
        paymail,
        "context",
        "channel",
        "channel",
        "powco-development"
      ])

      await axios.post('https://b.map.sv/ingest', {
        rawTx: txhex
      })

      return { txhex, txid }

  }

}
