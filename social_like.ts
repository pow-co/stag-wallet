
import { loadWallet, social } from './src'

async function main() {

  const wallet = await loadWallet()

  try {

    const like = await social.like(wallet, {

      app: 'boostpatriots.win',

      txid: '328aa499987a9c97bd51d0701f1cbf46c518b8b487f2c74de7b758d051d124bd',

      emoji: '🤣'

    })

    console.log({ like })

  } catch(error) {

    console.error('error', error)

  }

}

main()
