# Stag Wallet

## Installation

```
npm install --save stag-wallet

```
## Configure Wallet

To configure the wallet simply provide `BSV_PRIVATE_KEY` environment variable

```
export BSV_PRIVATE_KEY=KzuhQNi7gQJ3ThGi7C7YMQvjfScLWBCZ7PMb8RmpwJEYHv1JWd4G

```

## Nodejs

### Pay: Protocol

```
import { pay } from 'stag-wallet'

const url = 'https://api.anypayx.com/r/uh83lFFhE'

const { txid, txhex, txo } = await pay(url)

```

### Boostpow

```
import { boostpow } from 'stag-wallet'

const job = await boostpow({
  content: '2b7371657d34652255a276331ac89e46a82cf58693a8e6aaafcbaacfce132cd0',
  difficulty: 0.1,
  tag: 'askbitcoin.question',
  category: 'ASK',
  satoshis: 52_000
})

```

### Onchain.SV

```
import { onchain } from 'stag-wallet'

const { txid, txhex, txo } = await onchain.post({
  app: 'askbitcoin.ai,
  key: 'question',
  val: {
    content: 'Which midasvalley.net domain will be most valuable over the next month?'
  }
})

```
