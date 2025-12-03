/**
 * Twitter Verification Utilities
 * Frontend-only Twitter verification using public APIs
 */

export interface TwitterVerificationResult {
  verified: boolean
  postExists: boolean
  message: string
  tweetData?: {
    text?: string
    author?: string
    url?: string
  }
}

/**
 * Verify tweet using Twitter oEmbed API (Public, no auth required)
 * Note: Twitter's oEmbed API may have CORS restrictions. 
 * If CORS fails, consider using Twitter API v2 with Bearer Token instead.
 */
export const verifyTweetUsingOEmbed = async (
  tweetUrl: string
): Promise<TwitterVerificationResult> => {
  try {
    // Twitter oEmbed API endpoint (public, no auth required)
    const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true`
    
    const response = await fetch(oEmbedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          verified: false,
          postExists: false,
          message: 'Tweet not found. Please check the URL and ensure the tweet is public.',
        }
      }
      throw new Error(`oEmbed API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract tweet text from HTML (oEmbed returns HTML)
    const htmlText = data.html || ''
    
    // Check if tweet exists and extract basic info
    if (data.html && data.author_name) {
      // Try to extract text content from HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlText
      const tweetText = tempDiv.textContent || tempDiv.innerText || ''
      
      return {
        verified: true,
        postExists: true,
        message: 'Tweet verified successfully',
        tweetData: {
          text: tweetText,
          author: data.author_name,
          url: tweetUrl,
        },
      }
    }

    return {
      verified: false,
      postExists: false,
      message: 'Could not verify tweet content',
    }
  } catch (error) {
    console.error('oEmbed verification error:', error)
    
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        verified: false,
        postExists: false,
        message: 'CORS error: Cannot verify tweet from browser. Please use Twitter API v2 with Bearer Token (set VITE_TWITTER_BEARER_TOKEN in .env) or implement backend verification.',
      }
    }
    
    return {
      verified: false,
      postExists: false,
      message: error instanceof Error ? error.message : 'Verification failed due to network error',
    }
  }
}

/**
 * Verify tweet using Twitter API v2 (Requires Bearer Token)
 * More accurate but requires API credentials
 */
export const verifyTweetUsingAPIv2 = async (
  tweetId: string,
  tweetUrl: string,
  bearerToken?: string
): Promise<TwitterVerificationResult> => {
  if (!bearerToken) {
    return {
      verified: false,
      postExists: false,
      message: 'Twitter API Bearer Token not configured',
    }
  }

  try {
    // Twitter API v2 endpoint
    const apiUrl = `https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id&tweet.fields=text,created_at,author_id&user.fields=username`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          verified: false,
          postExists: false,
          message: 'Tweet not found. It may have been deleted or is not accessible.',
        }
      }
      
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.data && data.data.text) {
      const authorUsername = data.includes?.users?.[0]?.username || ''
      
      return {
        verified: true,
        postExists: true,
        message: 'Tweet verified successfully',
        tweetData: {
          text: data.data.text,
          author: authorUsername,
          url: tweetUrl,
        },
      }
    }

    return {
      verified: false,
      postExists: false,
      message: 'Tweet data not available',
    }
  } catch (error) {
    console.error('Twitter API v2 verification error:', error)
    return {
      verified: false,
      postExists: false,
      message: error instanceof Error ? error.message : 'API verification failed',
    }
  }
}

/**
 * Check if tweet content contains expected keywords
 */
export const checkTweetContent = (
  tweetText: string,
  expectedKeywords: string[] = ['raven']
): boolean => {
  const lowerText = tweetText.toLowerCase()
  return expectedKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
}

/**
 * Main verification function - tries API v2 first if token available, falls back to oEmbed
 */
export const verifyTwitterPost = async (
  tweetUrl: string,
  tweetId: string,
  expectedContent: string[] = ['raven'],
  bearerToken?: string
): Promise<TwitterVerificationResult> => {
  // Try Twitter API v2 first if bearer token is available
  if (bearerToken) {
    const apiResult = await verifyTweetUsingAPIv2(tweetId, tweetUrl, bearerToken)
    if (apiResult.verified && apiResult.tweetData?.text) {
      // Check if content matches expected keywords
      const contentMatches = checkTweetContent(apiResult.tweetData.text, expectedContent)
      if (!contentMatches) {
        return {
          verified: false,
          postExists: true,
          message: 'Tweet verified but does not contain expected content about Raven.',
        }
      }
      return apiResult
    }
  }

  // Fall back to oEmbed API (public, no auth)
  const oEmbedResult = await verifyTweetUsingOEmbed(tweetUrl)
  
  if (oEmbedResult.verified && oEmbedResult.tweetData?.text) {
    // Check if content matches expected keywords
    const contentMatches = checkTweetContent(oEmbedResult.tweetData.text, expectedContent)
    if (!contentMatches) {
      return {
        verified: false,
        postExists: true,
        message: 'Tweet exists but does not appear to contain content about Raven. Please ensure your tweet mentions Raven.',
      }
    }
  }
  
  return oEmbedResult
}

