
import * as bsv from 'bsv-2'

import * as bsv1 from 'bsv'

import filepay from './filepay'

import * as uuid from 'uuid'

import { Wallet } from './wallet';

import { run } from './run'

import { broadcast } from './whatsonchain'

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

      const pubkey = bsv.PubKey.fromPrivKey(this.purse)
      
      const address = new bsv.Address().fromPubKey(pubkey)

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

        const result = await broadcast(txhex)

        resolve(result)

      })

    })

  }

  publishScript({script, satoshis}: {script: bsv1.Script, satoshis: number }): Promise<string> {

    return new Promise(async (resolve, reject) => {

      const unspent = await this.wallet.cards[0].listUnspent()

      const inputs = unspent.map(utxo => {

        return {
            txId: utxo.txid,
            satoshis: utxo.value,
            script: utxo.scriptPubKey,
            outputIndex: utxo.vout,
            required: false
        }
      })

      console.log({ inputs })

      const tx = new bsv1.Transaction()
        .from(inputs)
        .addOutput(new bsv1.Transaction.Output({
          // get the locking script for `demo` instance
          script,
          satoshis,
        }))
        .change(this.identity)

      tx.sign(this.purse.toWif())

      const txhex = tx.serialize()

      console.log('tx.signed.hex', txhex)

      const result = await broadcast(txhex)

      console.log('tx.broadcast.result', {txhex, txid: result})

      resolve(result)

    })

  }

  publishMessage(newMessage: NewMessage): Promise<BlockchainMessage> {

    return new Promise(async (resolve, reject) => {

      newMessage.nonce = newMessage.nonce || uuid.v4()

      const keypair = new bsv.KeyPair().fromPrivKey(this.owner)

      const payloadToSign = JSON.stringify(Object.assign(newMessage.payload, {
        onchain_app: newMessage.app,
        onchain_event: newMessage.event,
        onchain_nonce: newMessage.nonce
      }))

      const signature = bsv.Bsm.sign(Buffer.from(payloadToSign), keypair)

      let address = new bsv.Address().fromString(this.identity)

      let verified = bsv.Bsm.verify(Buffer.from(payloadToSign, 'utf8'), signature, address)

      if (!verified) {
        throw new Error('SIGNATURE NOT VERIFIED')
      }

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

      return this.publishOpReturn([
        'onchain.sv',
        newMessage.app,
        newMessage.event,
        payloadToSign,
        "|",
        authorIdentityPrefix,
        "BITCOIN_ECDSA",
        this.identity,
        signature,
        0x05 // signed index #5 "payloadToSign"
      ])

    })

  }

  socialMessage(newMessage: SocialMessage): Promise<BlockchainMessage> {

    const defaultContentType = 'text/markdown'

    const contentType = newMessage.contentType || 'text/markdown'

    return new Promise(async (resolve, reject) => {

      const keypair = new bsv.KeyPair().fromPrivKey(this.owner)

      const payloadToSign = newMessage.content

      const signature = bsv.Bsm.sign(Buffer.from(payloadToSign), keypair)

      let address = new bsv.Address().fromString(this.identity)

      let verified = bsv.Bsm.verify(Buffer.from(payloadToSign, 'utf8'), signature, address)

      if (!verified) {
        throw new Error('SIGNATURE NOT VERIFIED')
      }

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

      return this.publishOpReturn([
        'B',
        newMessage.app,
        payloadToSign,
        "|",
        authorIdentityPrefix,
        "BITCOIN_ECDSA",
        this.identity,
        signature,
        0x05 // signed index #5 "payloadToSign"
      ])

    })

  }

}
