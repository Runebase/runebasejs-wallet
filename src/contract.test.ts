import { assert } from "chai"

import { Wallet, networks } from "./"
import { sleep } from "./time"
import { generateBlock } from "./runebaseRPC"

describe("Contract", () => {
  const network = networks.regtest
  const wifPrivateKey = "WxYBEMgS8wGspNxz5Y3CbnLT9nrCS1o3b5A38XQg5T9F3fmzCHyR"
  const wallet: Wallet = network.fromWIF(wifPrivateKey)

  before(async () => {
    // Avoid insight API 400 error
    await sleep(1000)
  })

  let txid: string

  it("creates a contract", async function() {
    this.timeout(10000)

    // tslint:disable:max-line-length
    const code = "608060405234801561001057600080fd5b506102c0806100206000396000f3006080604052600436106100615763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166318160ddd8114610066578063313ce5671461008d57806370a08231146100b8578063a9059cbb146100e6575b600080fd5b34801561007257600080fd5b5061007b61012b565b60408051918252519081900360200190f35b34801561009957600080fd5b506100a2610131565b6040805160ff9092168252519081900360200190f35b3480156100c457600080fd5b5061007b73ffffffffffffffffffffffffffffffffffffffff6004351661013a565b3480156100f257600080fd5b5061011773ffffffffffffffffffffffffffffffffffffffff60043516602435610162565b604080519115158252519081900360200190f35b60005481565b60015460ff1681565b73ffffffffffffffffffffffffffffffffffffffff1660009081526002602052604090205490565b600073ffffffffffffffffffffffffffffffffffffffff8316151561018657600080fd5b336000908152600260205260409020548211156101a257600080fd5b336000908152600260205260409020546101c2908363ffffffff61026c16565b336000908152600260205260408082209290925573ffffffffffffffffffffffffffffffffffffffff851681522054610201908363ffffffff61027e16565b73ffffffffffffffffffffffffffffffffffffffff84166000818152600260209081526040918290209390935580518581529051919233927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a350600192915050565b60008282111561027857fe5b50900390565b60008282018381101561028d57fe5b93925050505600a165627a7a7230582024b0f6442c54a08a0f093ce9159a2e2c934a0e8fc0aacd8e8cf72d923b6352640029"
    // tslint:enable:max-line-length

    const tx = await wallet.contractCreate(code)
    txid = tx.txid
    assert.isNotEmpty(txid)

    await generateBlock(network)
  })

  let contractAddress: string
  it("gets transaction info", async function() {
    this.timeout(10000)
    const insight = network.insight()

    const info = await insight.getTransactionInfo(txid)
    assert.equal(info.txid, txid)

    const receipt = info.receipt[0]
    assert.equal(receipt.to, "0000000000000000000000000000000000000000")
    assert.equal(receipt.excepted, "None")

    contractAddress = receipt.contractAddress
    assert.isNotEmpty(contractAddress)
  })

  it("invokes contractCall", async function() {
    this.timeout(10000)

    // get
    const encodedData = "6d4ce63c"
    const result = await wallet.contractCall(contractAddress, encodedData)

    const executionResult = result.executionResult
    assert.equal(executionResult.output, "0000000000000000000000000000000000000000000000000000000000000064")
  })

  it("invokes contractSend", async function() {
    this.timeout(10000)

    const encodedData = "60fe47b10000000000000000000000000000000000000000000000000000000000000001"
    const tx = await wallet.contractSend(contractAddress, encodedData)

    await generateBlock(network)

    await sleep(1000)

    const result = await wallet.contractCall(contractAddress, "6d4ce63c")

    const executionResult = result.executionResult
    assert.equal(executionResult.output, "0000000000000000000000000000000000000000000000000000000000000001")
  })
})
