
import { pay } from './src'

export async function start() {

  const url = 'https://api.anypayx.com/r/uh83lFFhE'

  const result = await pay(url)

  console.log(result)

  process.exit(0)

}

start()

