
require('dotenv').config()

import { loadWallet } from './src'

import { v4 as uuid } from 'uuid'

import { onchain } from './src'

;(async () => {

  for (let i=0; i<10; i++) {

    try {

      const wallet = await loadWallet()
  
      const app = 'linestar.tech.alpha'
  
      const result = await onchain.post({
        app,
        type: 'sku',
        content: {
          sku: uuid()
        },
      })
  
      console.log('onchain.post.result', result)

    } catch(error) {

      console.error(error)


    }

  }

})()

