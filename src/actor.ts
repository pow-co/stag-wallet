
import * as bsv from 'bsv-2'

import filepay from './filepay'

import * as uuid from 'uuid'

import { Wallet } from './wallet';

import { run } from './run'

interface NewMessage {
  app: string;
  event: string;
  payload: any;
  nonce?: string;
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

  purse: bsv.PrivKey;
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

      const params = {
        pay:  {
          key: this.purse.toWif(),
          inputs,
          to: [{

            data: [
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
            ],

            value: 0
          }]
        }
      };

      filepay.build(params, async (error, tx) => {

        if (error) { return reject(error.response) }

        const txhex = tx.serialize()

        const result = await run.blockchain.broadcast(txhex)

        resolve(result)

      })

    })

  }

}
