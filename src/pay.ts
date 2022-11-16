
/*
 * import { pay } from 'stag-wallet'
 *
 * const { txid, txhex } = await pay('https://name.sv/owenkellogg/1-USD')
 *
 */

import { loadWallet } from './wallet'

export async function pay(url: string): Promise<any> {

  const wallet = await loadWallet()

  const result = await wallet.payUri(url, 'BSV')

  return result

}

