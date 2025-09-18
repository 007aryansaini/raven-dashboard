import { expect } from "chai";
import { ethers } from "hardhat";

describe("AuthorizationRegistry", function () {
  it("add, isActive, revoke, verify helper", async function () {
    const [authorizer, delegate, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AuthorizationRegistry");
    const reg = await Factory.deploy("RavenAuth", "1");
    await reg.waitForDeployment();

    const scope = ethers.id("test-scope");
    let nonce = 1n;
    const expiry = BigInt(Math.floor(Date.now() / 1000) + 300);

    // Build typed data matching the contract's typehash
    const domain = {
      name: "RavenAuth",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await reg.getAddress(),
    };
    const types = {
      Delegation: [
        { name: "authorizer", type: "address" },
        { name: "delegate", type: "address" },
        { name: "scope", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    } as const;
    const message = {
      authorizer: await authorizer.getAddress(),
      delegate: await delegate.getAddress(),
      scope,
      nonce,
      expiry,
    } as const;

    const signature = await authorizer.signTypedData(domain as any, types as any, message as any);

    await reg.addDelegation(message.authorizer, message.delegate, message.scope, message.nonce, message.expiry, signature);

    expect(await reg.isDelegationActive(message.authorizer, message.delegate, message.scope)).to.eq(true);

    // Nonce must increase
    await expect(
      reg.addDelegation(message.authorizer, message.delegate, message.scope, message.nonce, message.expiry, signature)
    ).to.be.revertedWith("nonce not increasing");

    // Verify helper
    expect(await reg.verifySignedDelegation(message.authorizer, message.delegate, message.scope, message.nonce, message.expiry, signature)).to.eq(true);

    // Revoke
    await reg.connect(authorizer).revokeDelegation(message.delegate);
    expect(await reg.isDelegationActive(message.authorizer, message.delegate, message.scope)).to.eq(false);

    // Expired check
    const expired = BigInt(Math.floor(Date.now() / 1000) - 10);
    const msg2 = { ...message, nonce: nonce + 1n, expiry: expired };
    const sig2 = await authorizer.signTypedData(domain as any, types as any, msg2 as any);
    await expect(
      reg.addDelegation(msg2.authorizer, msg2.delegate, msg2.scope, msg2.nonce, msg2.expiry, sig2)
    ).to.be.revertedWith("expired");
  });
});


