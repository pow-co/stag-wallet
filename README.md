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
  type: 'question',
  content: {
    content: 'Which midasvalley.net domain will be most valuable over the next month?'
  }
})

// or 

const { txid, txhex, txo } = await onchain.findOrCreate({

  where: {
    app: 'www',
    type: 'resource',
    content: {
      url: 'https://www.infowars.com/posts/dave-chappelle-tricked-snl-producers-by-giving-them-fake-monologue-during-dress-rehearsal/'
    }
  },
  defaults: {
    app: 'www',
    type: 'resource',
    content: {
      url: 'https://www.infowars.com/posts/dave-chappelle-tricked-snl-producers-by-giving-them-fake-monologue-during-dress-rehearsal/'
    }
  }

})

```

### Powco.Dev

```
import { powcodev } from 'stag-wallet'

const satoshis = 100_000_000

const txid = await powcodev.deployDevIssueContract({

  platform: 'github',

  org: 'pow-co',

  repo: 'powco.dev',

  issue_id: 555555555,

  title: '',

  description: ''

}, satoshis)

```
