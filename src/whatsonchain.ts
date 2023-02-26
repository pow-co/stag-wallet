
import axios from 'axios'

export async function broadcast(txhex: string): Promise<string> {

  const url = 'https://api.whatsonchain.com/v1/bsv/main/tx/raw'

  console.log("whatsonchain.broadcast", {txhex})

  const { data } = await axios.post(url, { txhex })

  console.log("whatsonchain.broadcast", {txhex, result: data})

  return data

}

