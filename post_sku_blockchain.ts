
require('dotenv').config()

import { loadWallet } from './src'

import { v4 as uuid } from 'uuid'

import { Actor } from './src/actor'

;(async () => {

  for (let i=0; i<10; i++) {

    try {

      const wallet = await loadWallet()
  
      const app = 'linestar.tech.alpha'
  
      const [balance] = await wallet.balances()
  
      console.log("wallet.balance", `${balance.value} sats = $${balance.value_usd}`)
  
      const wif = String(process.env.BSV_PRIVATE_KEY)
  
      const actor = new Actor({
        wallet
      })
      
      const actorPublishResult = await actor.publishMessage(({
        app,
        event: 'sku',
        payload: {
          sku: uuid()
        },
        nonce: uuid()
      }))
  
      console.log('actorPublicResult', actorPublishResult)

    } catch(error) {

      console.error(error)


    }

  }

})()

