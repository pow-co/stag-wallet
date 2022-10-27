
import { findOne } from './src/onchain'

async function start() {

  const result = await findOne({

    author: '18h6yhKBBqXQge6XRauMTeEaQ9HF4jR1qV',

    app: 'alpha-0.linestar.tech',

    type: 'product',

    content: {

      sku: '01827391'

    }

  })

  console.log("findOne.result", result)

}

start()
