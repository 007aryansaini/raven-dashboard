/**
 * Polymarket API Fetcher
 * Fetches events and markets from Polymarket API
 * New API structure: markets are nested within events
 */

import { POLYMARKET_API_BASE } from './constants'

export interface PolymarketEvent {
  id: string
  title: string
  description?: string
  category?: string
  subcategory?: string
  endDate?: string
  active?: boolean
  closed?: boolean
  volume?: number
  liquidity?: number
  image?: string
  icon?: string
}

export interface PolymarketMarket {
  id: string
  question: string
  outcomes?: string[]
  yesPrice?: number
  noPrice?: number
  volume?: number
  liquidity?: number
  category?: string
  endDate?: string
  active?: boolean
  closed?: boolean
}

export class PolymarketFetcher {
  /**
   * Fetch top events with their nested markets
   * Markets are already included in the events response
   */
  async fetchEventsWithMarkets(limit = 20): Promise<Array<{ event: PolymarketEvent; market?: PolymarketMarket }>> {
    try {
      // Fetch top 20 active events (not closed, active)
      // The API returns events sorted by popularity/volume by default
      const url = `${POLYMARKET_API_BASE}/events?limit=${limit}&offset=0&active=true&closed=false`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        return []
      }

      // Map events with their first market (or best market)
      const eventsWithMarkets: Array<{ event: PolymarketEvent; market?: PolymarketMarket }> = []

      data.forEach((eventData: any) => {
        // Extract event data
        const event: PolymarketEvent = {
          id: String(eventData.id || ''),
          title: eventData.title || 'Untitled Event',
          description: eventData.description,
          category: eventData.category || eventData.subcategory || 'General',
          subcategory: eventData.subcategory,
          endDate: eventData.endDate,
          active: eventData.active !== false,
          closed: eventData.closed === true,
          volume: typeof eventData.volume === 'number' ? eventData.volume : parseFloat(eventData.volume || '0'),
          liquidity: typeof eventData.liquidity === 'number' ? eventData.liquidity : parseFloat(eventData.liquidity || '0'),
          image: eventData.image || eventData.icon || '',
          icon: eventData.icon || eventData.image || ''
        }

        // Extract the first active market from the event's markets array
        let market: PolymarketMarket | undefined = undefined

        if (eventData.markets && Array.isArray(eventData.markets) && eventData.markets.length > 0) {
          // Find the first active market, or just use the first one
          const marketData = eventData.markets.find((m: any) => m.active && !m.closed) || eventData.markets[0]

          if (marketData) {
            const outcomes = this.parseOutcomes(marketData.outcomes)
            const prices = this.parsePrices(marketData.outcomePrices)

            market = {
              id: String(marketData.id || ''),
              question: marketData.question || event.title,
              outcomes,
              yesPrice: prices[0] || 0,
              noPrice: prices[1] || 0,
              volume: typeof marketData.volumeNum === 'number' 
                ? marketData.volumeNum 
                : parseFloat(marketData.volumeNum || marketData.volume || '0'),
              liquidity: typeof marketData.liquidityNum === 'number'
                ? marketData.liquidityNum
                : parseFloat(marketData.liquidityNum || marketData.liquidity || '0'),
              category: marketData.category || event.category,
              endDate: marketData.endDate || event.endDate,
              active: marketData.active !== false,
              closed: marketData.closed === true
            }
          }
        }

        eventsWithMarkets.push({
          event,
          market
        })
      })

      return eventsWithMarkets
    } catch (error: any) {
      return []
    }
  }

  parseOutcomes(outcomes: any): string[] {
    if (Array.isArray(outcomes)) return outcomes
    if (typeof outcomes === 'string') {
      try {
        return JSON.parse(outcomes)
      } catch {
        return [outcomes]
      }
    }
    return []
  }

  parsePrices(priceString: any): number[] {
    if (!priceString) return [0, 0]

    let prices: any[]
    if (Array.isArray(priceString)) {
      prices = priceString
    } else if (typeof priceString === 'string') {
      try {
        prices = JSON.parse(priceString)
      } catch {
        return [0, 0]
      }
    } else {
      return [0, 0]
    }

    return prices.map(p => parseFloat(p || '0') * 100) // Convert to cents
  }

}
