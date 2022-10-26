
import { boostpow } from './src'

;(async () => {

  const answerJob = await boostpow({
    content: '2666f1c024824b3386adb9e0604ff200fadca846ae30f22674a49a8d0e8ebbe6',
    difficulty: 1,
    tag: 'askbitcoin.answer',
    category: 'ASK',
    satoshis: 52_000
  })

  console.log('boostpow.job.publish.result', { job: answerJob })

  const questionJob = await boostpow({
    content: '2b7371657d34652255a276331ac89e46a82cf58693a8e6aaafcbaacfce132cd0',
    difficulty: 1,
    tag: 'askbitcoin.question',
    category: 'ASK',
    satoshis: 52_000
  })

  console.log('boostpow.job.publish.result', { job: questionJob })


})()
