
import { loadWallet, social } from './src'

async function main() {

  const wallet = await loadWallet()

  try {

    const post = await social.post(wallet, {

      app: 'boostpatriots.win',

      content: 'Nobody fucks with a Biden\n\nhttps://patriots.win/p/15K6zchwE0/nobody-fucks-with-a-biden/c/'

    })

    console.log({ post })

  } catch(error) {

    console.error('error', error)

  }

}

main()
