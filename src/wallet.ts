require('dotenv').config()

import { getRPC } from './rpc'

import config from './config'

import BigNumber from 'bignumber.js'

import { getBitcore } from './bitcore'

import { Invoice } from './invoice'

import { Client } from './client'

import * as blockchair from './blockchair'

import axios from 'axios'

export class UnsufficientFundsError extends Error {
  currency: string;
  address: string;
  paymentRequest: any;
  balance: number;
  required: number;

  constructor({
    currency,
    address,
    paymentRequest,
    balance,
    required
  }: {
    currency: string,
    address: string,
    paymentRequest: any,
    balance: number,
    required: number})
  {
    super()

    this.currency = currency;
    this.address = address;
    this.balance = balance;
    this.required = required;
    this.paymentRequest = paymentRequest

    this.message = `Insufficient ${currency} Balance of ${balance} in ${address}: ${required} required`
  }

}

var assets = require('require-all')({
  dirname  :  __dirname + '/assets',
  recursive: true,
  filter      :  /(.+)\.ts$/,
  map: (name) => name.toUpperCase()
});

import { FeeRates, getRecommendedFees } from './mempool.space'
import log from './log'
import { convertBalance } from './balance'

export interface Utxo {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey?: string;
}

interface PaymentTx {
  tx_hex: string;
  tx_hash?: string;
  tx_key?: string;
}

export interface Balance {
  asset: string;
  address: string;
  value: number;
  value_usd?: number;
  errors?: Error[];
}

interface LoadCard {
  asset: string;
  privatekey: string;
}

export class Wallet {
  cards: Card[]

  constructor(params: {
    cards: Card[]
  }) {
    this.cards = params.cards
  }

  static async load(cards: LoadCard[]): Promise<Wallet> {

    return new Wallet({ cards: cards.map(card => new Card(card)) })

  }

  async balances(): Promise<Balance[]> {

    let balances = await Promise.all(this.cards.map(async card => {

      //if (card.asset === 'DOGE') { return }
 
      try {

        let balance = await card.balance()

        return balance

      } catch(error) {

        log.error('balances.error', error)

        return null

      }

    }))

    return balances.filter(balance => balance !== null)

  }

  async payInvoice(invoice_uid: string, asset:string, {transmit}:{transmit: boolean}={transmit:true}): Promise<PaymentTx> {

    log.info(`wallet-bot.simple-wallet.payInvoice`, {
      invoice_uid,
      asset,
      transmit
    })

    return this.payUri(`${config.get('API_BASE')}/i/${invoice_uid}`, asset, { transmit })
  }

  async payUri(uri: string, asset:string, {transmit}:{transmit: boolean}={transmit:true}): Promise<PaymentTx> {

    log.info(`wallet-bot.simple-wallet.payUri`, {
      uri,
      asset,
      transmit
    })

    let client = new Client(uri)

    let paymentRequest = await client.selectPaymentOption({
      chain: asset,
      currency: asset
    })

    var payment;

    var options: any;

    payment = await this.buildPayment(paymentRequest, asset)

    if (!transmit) return payment;

    try {
      
      let result = await client.transmitPayment(paymentRequest, payment, options)

      log.info('simple-wallet.transmitPayment.result', result)

    } catch(error) {

      log.info('simple-wallet.transmitPayment.error', error)

      throw error

    }

    return payment

  }

  asset(asset: string) {

    return this.cards.filter(card => card.asset === asset)[0]
  }

  async newInvoice(newInvoice: { amount: number, currency: string }): Promise<Invoice> {
    return new Invoice()
  }

  async buildPayment(paymentRequest, asset) {

    let { instructions } = paymentRequest

    let wallet = this.asset(asset)

    await wallet.listUnspent()

    let bitcore = getBitcore(asset)

    let privatekey = new bitcore.PrivateKey(wallet.privatekey)

    var tx, totalInput, totalOutput = 0;

    const unspent = await Promise.all(wallet.unspent.map(async utxo => {

      if (utxo.scriptPubKey) {
        return utxo
      }

      const raw_transaction = await blockchair.getRawTx(wallet.asset, utxo.txid)

      return Object.assign(utxo, {
        scriptPubKey: raw_transaction['vout'][utxo.vout].scriptPubKey.hex,
      })
    }))

    try {

      const coins = unspent.map(utxo => {

        const result = {
          txId: utxo.txid,
          outputIndex: utxo.vout,
          satoshis: utxo.value,
          scriptPubKey: utxo.scriptPubKey
        }

        return result
      })

      tx = new bitcore.Transaction()
        .from(coins)
        .change(wallet.address)

    } catch(error) {

      log.error('buildPayment', error)
    }

    totalInput = wallet.unspent.reduce((sum, input) => {

      let satoshis = new BigNumber(input.value).times(100000000).toNumber()

      return sum.plus(satoshis)

    }, new BigNumber(0)).toNumber()

    for (let output of instructions[0].outputs) {

      // TODO: Support Script Instead of Address

      if (output.address) {

        let address = bitcore.Address.fromString(output.address)

        let script = bitcore.Script.fromAddress(address)

        tx.addOutput(
          bitcore.Transaction.Output({
            satoshis: output.amount,
            script: script.toHex()
          })
        )

        totalOutput += output.amount

      } else if (output.script) {

        let script = bitcore.Script(output.script)

        tx.addOutput(
          bitcore.Transaction.Output({
            satoshis: output.amount,
            script: script.toHex()
          })
        )

        totalOutput += output.amount

      }

    }

    if (totalInput < totalOutput) {

      log.info('InsufficientFunds', {
        currency: wallet.asset,
        totalInput,
        totalOutput
      })

      throw new Error(`Insufficient ${wallet.asset} funds to pay invoice`)
    }

    if (totalOutput > totalInput) {

      throw new UnsufficientFundsError({
        currency: wallet.asset,
        address: wallet.address,
        paymentRequest,
        balance: totalInput,
        required: totalOutput
      })

    }

    tx.sign(privatekey)

    return tx.toString('hex')

  }

  async getInvoice(uid: string): Promise<any> {

    let { data } = await axios.get(`${config.get('api_base')}/invoices/${uid}`)

    return data

  }
}

interface RPC {
  listUnspent?(address: string, trace?: string): Promise<Utxo[]>;
  getBalance?(address: any): Promise<number>;
}

export class Card {

  asset: string;
  privatekey: string;
  address: string;
  mnemonic: string;
  hdprivatekey: string;
  unspent: Utxo[];

  constructor(params: {
    asset: string,
    privatekey?: string,
    address?: string;
    mnemonic?: string;
    hdprivatekey?: string;
  }) {
    this.unspent = []
    this.asset = params.asset
    this.privatekey = params.privatekey
    this.address = params.address
    this.hdprivatekey = params.hdprivatekey
    this.mnemonic = params.mnemonic

    let bitcore = getBitcore(this.asset)

    if (bitcore.PrivateKey) {
      this.address = new bitcore.PrivateKey(this.privatekey).toAddress().toString();
    }
    
  }
  
  async getUnspent() {

    const blockchairUnspent = await blockchair.listUnspent(this.asset, this.address)

    this.unspent = blockchairUnspent
  }

  async listUnspent(): Promise<Utxo[]> {

    let rpc: RPC = getRPC(this.asset)

    if (rpc['listUnspent']) {

      this.unspent = await rpc['listUnspent'](this.address)

    } else {

      try {

        this.unspent = await blockchair.listUnspent(this.asset, this.address)


      } catch(error) {

        error.asset = this.asset
        error.address = this.address

        log.error('blockchair.listUnspent.error', error)

      }
      
    }

    return this.unspent

  }

  async balance(): Promise<Balance> {

    const asset = this.asset

    let rpc = getRPC(this.asset)

    var value;

    const errors = []

    if (rpc['getBalance']) {

      value = await rpc['getBalance'](this.address)

    } else {

      try {

        value = await blockchair.getBalance(this.asset, this.address)

      } catch(error) {

        errors.push(error)

        error.asset = this.asset
        error.address = this.address

        log.error('blockchair.getBalance.error', error)

      }
      
    }

    const { amount: value_usd } = await convertBalance({
      currency: this.asset,
      amount: this.asset === 'XMR' ? value : value / 100000000
    }, 'USD')

    try {

      this.unspent = await this.listUnspent()

      if (!value) {

        value = this.unspent.reduce((sum, output) => {

          return sum.plus(output.value)
    
        }, new BigNumber(0)).toNumber()

      }

      if (errors.length > 0 && !value) {

        value = false
      }

      return {
        asset: this.asset,
        value: value,
        value_usd,
        address: this.address,
        errors
      }

    } catch(error) {

      return {
        asset: this.asset,
        value: value,
        value_usd,
        address: this.address,
        errors
      }

    }


  }

}

const bsv = require('bsv')

const { Bip39 } = require('bsv-2')

export function fromBackupSeedPhrase(mnemonic: string): Wallet{

  const seed = Bip39.fromString(mnemonic).toSeed().toString('hex')

  const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed)

  const bsvKey     = hdPrivateKey.deriveChild(`m/44'/236'/0'/0/0`).privateKey

  const changeKey  = hdPrivateKey.deriveChild(`m/44'/236'/0'/1/0`).privateKey

  const runKey     = hdPrivateKey.deriveChild(`m/44'/236'/0'/2/0`).privateKey

  const cancelKey  = hdPrivateKey.deriveChild(`m/44'/236'/0'/3/0`).privateKey

  const paymailKey = hdPrivateKey.deriveChild(`m/0'/236'/0'/0/0`).privateKey

  return new Wallet({
    cards: [
      new Card({
        asset: 'BSV',
        privatekey: bsvKey,
        mnemonic,
        hdprivatekey: hdPrivateKey.toString()
      })
    ]
  })

}

export async function loadWallet(loadCards?: LoadCard[]) {

  let cards: Card[] = []

  if (loadCards) {

    for (let loadCard of loadCards) {

      cards.push(new Card(loadCard))

    }
    
  } else {

    if (process.env.stag_private_key) {

      cards.push(new Card({
        asset: 'BSV',
        privatekey: process.env.stag_private_key
      }))

    }

    if (process.env.BSV_PRIVATE_KEY) {

      cards.push(new Card({
        asset: 'BSV',
        privatekey: process.env.BSV_PRIVATE_KEY
      }))

    }

  }

  return new Wallet({ cards })

}

