import { useState, useMemo } from 'react'
import { useAccount, useSignTypedData, useWalletClient } from 'wagmi'
import { keccak256, stringToBytes, type Hex } from 'viem'

const REGISTRY_ADDRESS = (import.meta.env.VITE_REGISTRY_ADDRESS as `0x${string}`) || '0x6553c9F9c59224ef6fd7D15556B358f14DE00CF7'

const REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'authorizer', type: 'address' },
      { internalType: 'address', name: 'delegate', type: 'address' },
      { internalType: 'bytes32', name: 'scope', type: 'bytes32' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { internalType: 'uint256', name: 'expiry', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'addDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'delegate', type: 'address' }],
    name: 'revokeDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export default function Delegations() {
  const { address, isConnected } = useAccount()
  const { data: wallet } = useWalletClient()
  const { signTypedDataAsync } = useSignTypedData()

  const [delegate, setDelegate] = useState('')
  const [scopeInput, setScopeInput] = useState('test-scope')
  const [nonce, setNonce] = useState<number>(1)
  const [expiryMins, setExpiryMins] = useState<number>(60) // default 1h
  const [active, setActive] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [myDelegations, setMyDelegations] = useState<Array<{delegate: string; scope: Hex}>>(() => {
    try { return JSON.parse(localStorage.getItem('raven.myDelegations') || '[]') } catch { return [] }
  })

  const scope: Hex = useMemo(() => {
    if (scopeInput.startsWith('0x') && scopeInput.length === 66) return scopeInput as Hex
    return keccak256(stringToBytes(scopeInput))
  }, [scopeInput])

  const saveMyDelegations = (items: Array<{delegate: string; scope: Hex}>) => {
    setMyDelegations(items)
    localStorage.setItem('raven.myDelegations', JSON.stringify(items))
  }

  const checkActive = async () => {
    if (!address || !delegate) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(
        `http://localhost:8787/registry/is-active?authorizer=${address}&delegate=${delegate}&scope=${scope}`
      )
      const j = await res.json()
      setActive(!!j.active)
    } catch (e: any) {
      setMessage('Failed to check active')
    } finally {
      setLoading(false)
    }
  }

  const createDelegation = async () => {
    if (!address || !wallet || !delegate) return
    setLoading(true)
    setMessage('')
    try {
      const expiry = BigInt(Math.floor(Date.now() / 1000) + expiryMins * 60)
      const domain = {
        name: 'RavenAuth',
        version: '1',
        chainId: await wallet.getChainId(),
        verifyingContract: REGISTRY_ADDRESS,
      } as const
      const types = {
        Delegation: [
          { name: 'authorizer', type: 'address' },
          { name: 'delegate', type: 'address' },
          { name: 'scope', type: 'bytes32' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
        ],
      } as const
      const message = {
        authorizer: address,
        delegate,
        scope,
        nonce: BigInt(nonce),
        expiry,
      } as const

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Delegation',
        message,
      })

      const hash = await wallet.writeContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'addDelegation',
        args: [message.authorizer, message.delegate, message.scope, message.nonce, message.expiry, signature],
      })
      saveMyDelegations([{ delegate, scope }, ...myDelegations.filter(d => !(d.delegate.toLowerCase() === delegate.toLowerCase() && d.scope === scope))])
      setMessage(`Submitted tx: ${hash}`)
    } catch (e: any) {
      setMessage('Create failed')
    } finally {
      setLoading(false)
    }
  }

  const revokeDelegation = async () => {
    if (!wallet || !delegate) return
    setLoading(true)
    setMessage('')
    try {
      const hash = await wallet.writeContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'revokeDelegation',
        args: [delegate],
      })
      saveMyDelegations(myDelegations.filter(d => d.delegate.toLowerCase() !== delegate.toLowerCase()))
      setMessage(`Revoke tx: ${hash}`)
    } catch (e: any) {
      setMessage('Revoke failed')
    } finally {
      setLoading(false)
    }
  }

  const relayTest = async () => {
    if (!address || !delegate) return
    setLoading(true)
    setMessage('')
    try {
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const domain = { name: 'RavenAuth', version: '1', chainId: await (wallet?.getChainId() || Promise.resolve(0)), verifyingContract: REGISTRY_ADDRESS } as const
      const types = {
        Delegation: [
          { name: 'authorizer', type: 'address' },
          { name: 'delegate', type: 'address' },
          { name: 'scope', type: 'bytes32' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
        ],
      } as const
      const message = { authorizer: address, delegate, scope, nonce: BigInt(nonce), expiry } as const
      const signature = await signTypedDataAsync({ domain, types, primaryType: 'Delegation', message })
      const payload = {
        authorization: {
          authorizer: address,
          delegate,
          scope,
          nonce: message.nonce.toString(),
          expiry: message.expiry.toString(),
          signature,
        },
        call: { to: delegate, data: '0x', value: '0' },
      }
      const res = await fetch('http://localhost:8787/relay/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const j = await res.json()
      setMessage(res.ok ? 'Relayer accepted' : `Relay failed: ${j?.error || 'error'}`)
    } catch (e: any) {
      setMessage('Relay test failed')
    } finally { setLoading(false) }
  }

  // Demo encoded relay inputs
  const [toAddress, setToAddress] = useState('')
  const [arg1, setArg1] = useState('')
  const [arg2, setArg2] = useState('0')

  const relayEncoded = async () => {
    if (!address || !delegate || !toAddress) return
    setLoading(true)
    setMessage('')
    try {
      const abi = [{ name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [ { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' } ], outputs: [ { name: '', type: 'bool' } ] }]
      const encodeRes = await fetch('http://localhost:8787/encode', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ abi, functionName: 'transfer', args: [arg1, arg2] })
      })
      const { data } = await encodeRes.json()
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const domain = { name: 'RavenAuth', version: '1', chainId: await (wallet?.getChainId() || Promise.resolve(0)), verifyingContract: REGISTRY_ADDRESS } as const
      const types = { Delegation: [ { name: 'authorizer', type: 'address' }, { name: 'delegate', type: 'address' }, { name: 'scope', type: 'bytes32' }, { name: 'nonce', type: 'uint256' }, { name: 'expiry', type: 'uint256' } ] } as const
      const message = { authorizer: address, delegate, scope, nonce: BigInt(nonce), expiry } as const
      const signature = await signTypedDataAsync({ domain, types, primaryType: 'Delegation', message })
      const payload = { authorization: { authorizer: address, delegate, scope, nonce: message.nonce.toString(), expiry: message.expiry.toString(), signature }, call: { to: toAddress, data, value: '0' } }
      const res = await fetch('http://localhost:8787/relay/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json()
      setMessage(res.ok ? 'Relayer accepted (encoded call)' : `Relay failed: ${j?.error || 'error'}`)
    } catch (e: any) {
      setMessage('Encoded relay failed')
    } finally { setLoading(false) }
  }

  // Demo: ping(string) via relayer
  const [demoAddr, setDemoAddr] = useState('')
  const [demoMsg, setDemoMsg] = useState('hello raven')
  const relayPing = async () => {
    if (!address || !delegate || !demoAddr) return
    setLoading(true)
    setMessage('')
    try {
      const abi = [{ name: 'ping', type: 'function', stateMutability: 'nonpayable', inputs: [ { name: 'message', type: 'string' } ], outputs: [] }]
      const encodeRes = await fetch('http://localhost:8787/encode', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ abi, functionName: 'ping', args: [demoMsg] })
      })
      const { data } = await encodeRes.json()
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const domain = { name: 'RavenAuth', version: '1', chainId: await (wallet?.getChainId() || Promise.resolve(0)), verifyingContract: REGISTRY_ADDRESS } as const
      const types = { Delegation: [ { name: 'authorizer', type: 'address' }, { name: 'delegate', type: 'address' }, { name: 'scope', type: 'bytes32' }, { name: 'nonce', type: 'uint256' }, { name: 'expiry', type: 'uint256' } ] } as const
      const message = { authorizer: address, delegate, scope, nonce: BigInt(nonce), expiry } as const
      const signature = await signTypedDataAsync({ domain, types, primaryType: 'Delegation', message })
      const payload = { authorization: { authorizer: address, delegate, scope, nonce: message.nonce.toString(), expiry: message.expiry.toString(), signature }, call: { to: demoAddr, data, value: '0' } }
      const res = await fetch('http://localhost:8787/relay/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json()
      setMessage(res.ok ? 'Relayer accepted (ping)' : `Relay failed: ${j?.error || 'error'}`)
    } catch (e: any) {
      setMessage('Ping relay failed')
    } finally { setLoading(false) }
  }

  const canAct = isConnected && !!delegate

  return (
    <div className="min-h-screen w-screen bg-black p-6 text-white">
      <h2 className="text-2xl mb-4 font-semibold">Delegations</h2>
      {!isConnected && (
        <div className="mb-3 text-sm text-yellow-400">Connect your wallet to enable actions.</div>
      )}
      <div className="flex flex-col gap-4 max-w-4xl">
        <label className="text-sm text-gray-300">Delegate address</label>
        <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Delegate 0x..." value={delegate} onChange={e => setDelegate(e.target.value)} />

        <label className="text-sm text-gray-300">Scope (string is hashed to bytes32)</label>
        <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Scope (string or 0xbytes32)" value={scopeInput} onChange={e => setScopeInput(e.target.value)} />

        <div className="flex gap-4 items-start">
          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Nonce</label>
            <input className="bg-gray-900 border border-gray-700 rounded p-3 w-36" type="number" min={1} value={nonce} onChange={e => setNonce(Number(e.target.value))} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-300">Expiry (minutes)</label>
            <input className="bg-gray-900 border border-gray-700 rounded p-3 w-36" type="number" min={1} value={expiryMins} onChange={e => setExpiryMins(Number(e.target.value))} />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={checkActive} disabled={loading || !delegate} className={`px-4 py-2 rounded border ${loading || !delegate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} bg-gray-800 border-gray-700`}>Check Active</button>
          <button onClick={createDelegation} disabled={loading || !canAct} className={`px-4 py-2 rounded border ${loading || !canAct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#45FFAE]/20'} bg-[#45FFAE]/10 border-[#45FFAE]`}>Create</button>
          <button onClick={revokeDelegation} disabled={loading || !canAct} className={`px-4 py-2 rounded border ${loading || !canAct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/20'} bg-red-500/10 border-red-500`}>Revoke</button>
          <button onClick={relayTest} disabled={loading || !canAct} className={`px-4 py-2 rounded border ${loading || !canAct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500/20'} bg-blue-500/10 border-blue-500`}>Relay test</button>
        </div>
        {active !== null && (
          <div className="text-sm">Active: {String(active)}</div>
        )}
        {message && <div className="text-sm text-gray-300">{message}</div>}

        <div className="mt-6">
          <h3 className="text-lg mb-2">My delegations (local)</h3>
          {myDelegations.length === 0 ? (
            <div className="text-sm text-gray-400">No cached delegations yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {myDelegations.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded p-3">
                  <div className="text-sm">{d.delegate} · scope {d.scope}</div>
                  <button onClick={async () => { setDelegate(d.delegate); setScopeInput(d.scope); await revokeDelegation(); }} className="text-xs bg-red-500/10 border border-red-500 px-2 py-1 rounded">Revoke</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-lg mb-2">Demo: Relay ping(string) to DemoRelayTarget</h3>
          <div className="flex flex-col gap-3 max-w-2xl">
            <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Demo contract 0x..." value={demoAddr} onChange={e => setDemoAddr(e.target.value)} />
            <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Message" value={demoMsg} onChange={e => setDemoMsg(e.target.value)} />
            <button onClick={relayPing} disabled={loading || !canAct || !demoAddr} className={`px-4 py-2 rounded border ${loading || !canAct || !demoAddr ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500/20'} bg-blue-500/10 border-blue-500`}>Relay ping</button>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-lg mb-2">Demo: Relay encoded ERC20 transfer</h3>
          <div className="flex flex-col gap-3 max-w-2xl">
            <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Token contract (to) 0x..." value={toAddress} onChange={e => setToAddress(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Recipient 0x..." value={arg1} onChange={e => setArg1(e.target.value)} />
              <input className="bg-gray-900 border border-gray-700 rounded p-3" placeholder="Amount (wei)" value={arg2} onChange={e => setArg2(e.target.value)} />
            </div>
            <button onClick={relayEncoded} disabled={loading || !canAct || !toAddress} className={`px-4 py-2 rounded border ${loading || !canAct || !toAddress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500/20'} bg-blue-500/10 border-blue-500`}>Relay encoded transfer</button>
          </div>
        </div>
      </div>
    </div>
  )
}