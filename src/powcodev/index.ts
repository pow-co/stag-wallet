
import { loadWallet, Wallet } from '../wallet'

import { Actor } from '../actor'

interface DevIssue {
  platform: string;
  org: string;
  repo: string;
  issue_number: string;
  title: string;
  description: string;
}

var wallet: Wallet

import { join } from 'path'

import * as scrypt from 'scryptlib'

import { readFileSync } from 'fs'

import * as bsv from 'bsv'

const { buildContractClass } = scrypt

export function loadArtifact(fileName) {
  return JSON.parse(readFileSync(fileName).toString());
}

const artifact = join(__dirname, 'DevIssue.json')

const DevIssueContract = buildContractClass(loadArtifact(artifact))

export async function createIssue() {

}

export async function findIssue() {

}

export async function findOrCreateIssue() {

}

export async function deployDevIssueContract(devIssue: DevIssue, satoshis: number): Promise<string> {

  const { issue, lockingScript } = await buildContractForDevIssue(devIssue)

  console.log(issue, {
    lockingScript: {
      hex: lockingScript,
      asm: issue.lockingScript.toString()
    }
  })

  if (!wallet) {

     wallet = await loadWallet()
  }

  const actor = new Actor({ wallet })

  const result = await actor.publishScript({
    script: issue.lockingScript,
    satoshis
  })

  return result

}

async function Utxos() {
  return []
}

export async function buildContractForDevIssue({
  platform,
  org,
  repo,
  issue_number,
  title,
  description,
}: DevIssue) {

  const issue = new DevIssueContract(
    Buffer.from(platform).toString('hex'),
    Buffer.from(org).toString('hex'),
    Buffer.from(repo).toString('hex'),
    Buffer.from(issue_number).toString('hex'),
    Buffer.from(title).toString('hex'),
    Buffer.from(description).toString('hex')
  );

  return {
    issue: issue,
    lockingScript: issue.lockingScript.toBuffer().toString('hex')
  }

}


