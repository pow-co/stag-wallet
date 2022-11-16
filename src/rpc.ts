require('dotenv').config()

import { rpc as bsv } from './assets/bsv'

export function getRPC(currency) {

  switch(currency) {
    case 'BSV':
      return bsv
    default:
      throw new Error('rpc for currency not found')
  }

}

