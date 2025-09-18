import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSignTypedData } from 'wagmi'
import { injected } from 'wagmi/connectors'

type AuthContextValue = {
  address?: `0x${string}`
  chainId?: number
  accessToken?: string
  refreshToken?: string
  accessTokenExp?: number
  isSignedIn: boolean
  isConnected: boolean
  connecting: boolean
  connectWallet: () => Promise<void>
  signIn: () => Promise<void>
  logout: () => Promise<void>
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId, isConnected } = useAccount()
  const { connectAsync, isPending: connecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { signTypedDataAsync } = useSignTypedData()

  const [accessToken, setAccessToken] = useState<string | undefined>()
  const [accessTokenExp, setAccessTokenExp] = useState<number | undefined>()
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    () => typeof localStorage !== 'undefined' ? localStorage.getItem('raven.refresh') || undefined : undefined
  )

  useEffect(() => {
    if (refreshToken) localStorage.setItem('raven.refresh', refreshToken)
    else localStorage.removeItem('raven.refresh')
  }, [refreshToken])

  const decodeExp = (jwt?: string): number | undefined => {
    if (!jwt) return undefined
    try {
      const [, payload] = jwt.split('.')
      const json = JSON.parse(atob(payload))
      return typeof json.exp === 'number' ? json.exp : undefined
    } catch {
      return undefined
    }
  }

  const connectWallet = useCallback(async () => {
    await connectAsync({ connector: injected() })
  }, [connectAsync])

  const signIn = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected')
    // If already have a valid token (>60s left), no-op
    const nowSec = Math.floor(Date.now() / 1000)
    if (accessToken && accessTokenExp && accessTokenExp - nowSec > 60) return
    // Try refresh first if we have a refresh token
    if (refreshToken) {
      try {
        await (async () => {
          const res = await fetch('http://localhost:8787/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
          if (!res.ok) throw new Error('refresh fail')
          const tokens = await res.json()
          setAccessToken(tokens.token)
          setAccessTokenExp(decodeExp(tokens.token))
          setRefreshToken(tokens.refreshToken)
        })()
        return
      } catch {}
    }
    const nonceRes = await fetch(`http://localhost:8787/auth/nonce?address=${address}`)
    if (!nonceRes.ok) throw new Error('Failed to get nonce')
    const noncePayload = await nonceRes.json()

    const signature = await signTypedDataAsync({
      domain: noncePayload.domain,
      primaryType: noncePayload.primaryType,
      types: noncePayload.types,
      message: noncePayload.message,
    })

    const verifyRes = await fetch('http://localhost:8787/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature, nonce: noncePayload.nonce }),
    })
    if (!verifyRes.ok) throw new Error('Verify failed')
    const tokens = await verifyRes.json()
    setAccessToken(tokens.token)
    setAccessTokenExp(decodeExp(tokens.token))
    setRefreshToken(tokens.refreshToken)
    try {
      const exp = decodeExp(tokens.token)
      if (exp) {
        const mins = Math.max(0, Math.floor((exp * 1000 - Date.now()) / 60000))
        // Keep this human and simple; no full token in logs
        // eslint-disable-next-line no-console
        console.log(`Signed in. Access token valid for about ${mins} minute(s).`)
      } else {
        // eslint-disable-next-line no-console
        console.log('Signed in. Access token issued.')
      }
    } catch {}
  }, [address, signTypedDataAsync, accessToken, accessTokenExp, refreshToken])

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await fetch('http://localhost:8787/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
      } catch {}
    }
    setAccessToken(undefined)
    setAccessTokenExp(undefined)
    setRefreshToken(undefined)
    disconnect()
  }, [disconnect, refreshToken])

  const refresh = useCallback(async () => {
    if (!refreshToken) throw new Error('No refresh token')
    const res = await fetch('http://localhost:8787/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const tokens = await res.json()
    setAccessToken(tokens.token)
    setAccessTokenExp(decodeExp(tokens.token))
    setRefreshToken(tokens.refreshToken)
    try {
      const exp = decodeExp(tokens.token)
      if (exp) {
        const mins = Math.max(0, Math.floor((exp * 1000 - Date.now()) / 60000))
        // eslint-disable-next-line no-console
        console.log(`Refreshed session. Access token valid for about ${mins} minute(s).`)
      } else {
        // eslint-disable-next-line no-console
        console.log('Refreshed session. Access token issued.')
      }
    } catch {}
    return tokens.token as string
  }, [refreshToken])

  const fetchWithAuth = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    let token = accessToken
    const doFetch = (t?: string) => fetch(input, {
      ...init,
      headers: { ...(init?.headers || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    })
    let resp = await doFetch(token)
    if (resp.status === 401 && refreshToken) {
      try {
        token = await refresh()
        resp = await doFetch(token)
      } catch {}
    }
    return resp
  }, [accessToken, refreshToken, refresh])

  const value = useMemo<AuthContextValue>(() => ({
    address,
    chainId,
    isConnected: !!isConnected,
    connecting,
    isSignedIn: !!accessToken,
    connectWallet,
    signIn,
    logout,
    accessToken,
    refreshToken,
    accessTokenExp,
    fetchWithAuth,
  }), [address, chainId, isConnected, connecting, connectWallet, signIn, logout, accessToken, refreshToken, accessTokenExp, fetchWithAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


