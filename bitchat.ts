
import { loadWallet } from './src'
import { Actor } from './src/bitchat'

export async function main() {

    const message = process.argv[2]
    const paymail = process.argv[3] || 'Anonomous'

    if (!message || !paymail) { throw new Error('message and paymail required') }

    console.log({ message, paymail })

    try {

        const wallet = await loadWallet()

        const actor = new Actor({
            wallet
        })
    
        const result = await actor.post({message, paymail, channel: 'powco.dev' })
    
        console.log(result)

    } catch(error) {

        console.error(error)
    }

}

main()

