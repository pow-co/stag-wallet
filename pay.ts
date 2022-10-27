
import { pay } from '.'

export async function start() {

  const url = 'https://api.anypayx.com/r/Fu83roATP'

  const result = await pay(url)

  console.log(result)

  process.exit(0)

}

start()

