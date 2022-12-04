
//https://github.com/icellan/bsocial/blob/master/bSOCIAL.md

import BSocial from 'bsocial';
import { Actor } from './actor';

var wallet;
import { loadWallet, Wallet } from './wallet'

import bap from './bap'

import { like as newLike, NewLike } from './bap'

import { NewReply, newReply } from './bap'

interface NewPost {
  app: string;
  content: string;
}

interface Post {
  txid: string;
  app: string;
  content: string;
}

export async function post(wallet: Wallet, newPost: NewPost): Promise<Post> {

  const opReturn = bap(newPost.app, newPost.content)

  const actor = new Actor({ wallet })

  return actor.publishOpReturn(opReturn)

}

export async function like(wallet: Wallet, params: NewLike): Promise<Post> {

  const opReturn = newLike(params)

  const actor = new Actor({ wallet })

  return actor.publishOpReturn(opReturn)

}

export async function comment(wallet: Wallet, params: NewReply): Promise<Post> {

  const opReturn = newReply(params)

  const actor = new Actor({ wallet })

  return actor.publishOpReturn(opReturn)

}

export async function reply() {

}

export async function repost() {

}

export async function follow() {

}

export async function unfollow() {

}

