import { Request, Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')
import * as utils from '../lib/utils'
const nftABI = require('../data/static/contractABIs').nftABI
const ethers = require('ethers')
const customHttpProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/0b88ff4d03a647b8a4649e9bfdf6644f')
const challenges = require('../data/datacache').challenges
const nftAddress = '0x41427790c94E7a592B17ad694eD9c06A02bb9C39'
console.log(nftABI)
const contract = new ethers.Contract(nftAddress, nftABI, customHttpProvider)
const addressesMinted = new Set()
let isEventListenerCreated = false

module.exports.nftMintListener = function nftMintListener () {
  return (req: Request, res: Response) => {
    try {
      if (!isEventListenerCreated) {
        contract.on('NFTMinted', (minter: string) => {
          if (!addressesMinted.has(minter)) {
            addressesMinted.add(minter)
          }
        })
        isEventListenerCreated = true
      }
      res.status(200).json({ success: true, message: 'Event Listener Created' })
    } catch (error) {
      console.log(error)
      res.status(500).json(utils.get(error))
    }
  }
}

module.exports.walletNFTVerify = function walletNFTVerify () {
  return (req: Request, res: Response) => {
    try {
      const metamaskAddress = req.body.walletAddress
      console.log(addressesMinted)
      if (addressesMinted.has(metamaskAddress)) {
        addressesMinted.delete(metamaskAddress)
        challengeUtils.solveIf(challenges.nftMintChallenge, () => true)
        res.status(200).json({ success: true, message: 'Challenge successfully solved', status: challenges.nftMintChallenge })
      } else {
        res.status(200).json({ success: false, message: 'Wallet did not mint the NFT', status: challenges.nftMintChallenge })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(utils.get(error))
    }
  }
}
