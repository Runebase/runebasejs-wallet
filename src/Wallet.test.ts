import { assert } from "chai"

import { networks, generateMnemonic, NetworkNames } from "./"
import { generateBlock } from "./runebaseRPC"
import { sleep } from "./time"
import { params } from "./scrypt"

describe("Wallet", () => {
  const network = networks.regtest

  it("generates mnemonic of 12 words", () => {
    const mnemonic = generateMnemonic()
    assert.isString(mnemonic)

    const words = mnemonic.split(" ")
    assert.equal(words.length, 12)
  })

  const testMnemonic = "behind lunar size snap unfold stereo case shift flavor shove cricket divorce"
  const password = "covfefe"

  it("recovers wallet from mnemonic", async () => {
    const wallet = await network.fromMnemonic(testMnemonic)
    assert.equal(wallet.address, "na8iDoMiWs1tobsVgxdU29xD78LqJj8Gkh")
  })

  it("recovers wallet from mnemonic with password", async () => {
    const wallet = await network.fromMnemonic(testMnemonic, password)

    assert.equal(wallet.address, "nV5FqbtGTHpAHBoG2PHq28A7N4KbDaiBkQ")
  })

  const wifPrivateKey = "WzxXxpgKjAg2sk4y7ieFB2WkhAgbJ2bS2bpTPFS3xVKcThVkUtGf"

  it("recovers wallet from WIF", () => {
    const wallet = network.fromWIF(wifPrivateKey)

    assert.equal(wallet.address, "nmLUR7Jsqycqp374TkDAcrErwUydEhcwnc")
  })

  it("recovers wallet from EncryptedPrivateKey", () => {
    const wif = "WushkEqJZMZswfD3nY7G7SGBbevi2ZkrSxLqESSnFK77DQ2dDn2j"
    const encryptPassword = "testtest"

    const wallet = network.fromWIF(wif)

    const encryptedKey = wallet.toEncryptedPrivateKey(encryptPassword, params.noop)

    const wallet2 = network.fromEncryptedPrivateKey(encryptedKey, encryptPassword, params.noop)

    assert.equal(wallet2.toWIF(), wif)
  })

  it("dumps wallet to WIF", () => {
    const wallet = network.fromWIF(wifPrivateKey)

    assert.equal(wallet.toWIF(), wifPrivateKey)
  })

  it("gets wallet info", async function () {
    this.timeout(10000)

    const wallet = network.fromWIF(wifPrivateKey)

    const info = await wallet.getInfo()
    assert.containsAllKeys(info, [
      "addrStr",
      "balance",
      "balanceSat",
      "totalReceived",
      "totalReceivedSat",
      "totalSent",
      "totalSentSat",
      "transactions",
    ])
  })

  it("gets wallet transactions", async function () {
    this.timeout(10000)

    const wallet = network.fromWIF(wifPrivateKey)

    const rawTxs = await wallet.getTransactions()

    assert.containsAllKeys(rawTxs, ["txs", "pagesTotal"])
    assert.isArray(rawTxs.txs)
  })

  it("sends payment to a receiving address", async function () {
    this.timeout(20000)

    const insight = network.insight()
    const wallet = network.fromWIF(wifPrivateKey)

    const toAddress = "npuqCtHQx1FdhNpYCGsfS8pW3GUKqxxpQF"
    const amount = 1e8 // 1 runebase (in sat)

    const senderOldInfo = await insight.getInfo(wallet.address)
    const receiverOldInfo = await insight.getInfo(toAddress)

    const tx = await wallet.send(toAddress, amount, {
      feeRate: 4000, // 0.04 runebase / KB
    })
    assert.isNotEmpty(tx.txid)

    await generateBlock(network)
    await sleep(2000)

    const senderNewInfo = await insight.getInfo(wallet.address)
    const receiverNewInfo = await insight.getInfo(toAddress)

    assert.equal(senderOldInfo.balanceSat - senderNewInfo.balanceSat, Math.round(1.009 * 1e8), "sender")
    assert.equal(receiverNewInfo.balanceSat - receiverOldInfo.balanceSat, 1e8, "receiver")
  })
})
