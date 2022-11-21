
require('dotenv').config()

const mnemonic = process.env.relayx_seed

const bsv = require('bsv')

const { Bip39 } = require('bsv-2')

import { fromBackupSeedPhrase } from './'

async function run() {

  const wallet = fromBackupSeedPhrase(mnemonic)

  console.log("WALLET", wallet)

  const [balance] = await wallet.balances()

  console.log({ balance })

  const seed = Bip39.fromString(mnemonic).toSeed().toString('hex')

  console.log('seed', seed)

  const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed)

  // Paymail
  //
  //   m/0'/236'/0'/0/0
  //
  // BSV
  //
  //   m/44'/236'/0'/0/0
  //
  // Change
  //
  //   m/44'/236'/0'/1/0
  //
  // RUN
  //
  //   m/44'/236'/0'/2/0
  //
  // Order Cancel
  //
  //   m/44'/236'/0'/3/0

  const bsvKey     = hdPrivateKey.deriveChild(`m/44'/236'/0'/0/0`).privateKey
  const changeKey  = hdPrivateKey.deriveChild(`m/44'/236'/0'/1/0`).privateKey
  const runKey     = hdPrivateKey.deriveChild(`m/44'/236'/0'/2/0`).privateKey
  const cancelKey  = hdPrivateKey.deriveChild(`m/44'/236'/0'/3/0`).privateKey

  const paymailKey = hdPrivateKey.deriveChild(`m/0'/236'/0'/0/0`).privateKey

  console.log('bsv address: ', bsvKey.toAddress().toString())
  console.log('change address: ', changeKey.toAddress().toString())
  console.log('run address: ', runKey.toAddress().toString())
  console.log('paymail pubkey: ', paymailKey.publicKey.toString())

}

run()

