
import { findOne } from './src/onchain'

async function start() {

  const result = await findOne({

    author: '18h6yhKBBqXQge6XRauMTeEaQ9HF4jR1qV',

    app: 'linestar.tech.alpha',

    type: 'sku',

    content: {

      sku: '7374af28-f613-40ab-8f4b-3932bef6b0df'

    }

  })

  console.log("findOne.result", result)

}

start()
