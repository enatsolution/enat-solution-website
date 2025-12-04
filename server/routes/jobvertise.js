const express = require('express')
const router = express.Router()
const axios = require('axios')
const cheerio = require('cheerio')

// Store cookies from manual browser login
let storedCookies = null

// Set cookies from manual login
router.post('/set-cookies', (req, res) => {
  const { cookies } = req.body

  if (!cookies) {
    return res.status(400).json({ error: 'Cookies required' })
  }

  storedCookies = cookies
  console.log('✅ Jobvertise cookies set successfully')
  res.json({ success: true, message: 'Cookies saved. You can now search resumes.' })
})

// Check if cookies are set
router.get('/status', (req, res) => {
  res.json({
    authenticated: !!storedCookies,
    message: storedCookies ? 'Ready to search' : 'Please set cookies from browser'
  })
})

// Search resumes using stored cookies
router.get('/search', async (req, res) => {
  try {
    const { keywords, location } = req.query

    if (!storedCookies) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please login to Jobvertise in your browser and set cookies first',
        instructions: [
          '1. Go to https://www.jobvertise.com/employers/login',
          '2. Login with your credentials',
          '3. Open browser DevTools (F12) → Application → Cookies',
          '4. Copy all cookie values and paste them in the app'
        ]
      })
    }

    // Build search URL
    let searchUrl = 'https://www.jobvertise.com/resume/search'
    if (keywords) {
      searchUrl = `https://www.jobvertise.com/resume/search?keywords=${encodeURIComponent(keywords)}`
    }
    if (location) {
      searchUrl += `&location=${encodeURIComponent(location)}`
    }

    console.log('Searching Jobvertise:', searchUrl)

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': storedCookies
      }
    })

    const $ = cheerio.load(response.data)
    const candidates = []

    // Parse resume listings
    $('a[href*="/resume/"]').each((i, el) => {
      const $el = $(el)
      const href = $el.attr('href')
      const text = $el.text().trim()

      // Skip navigation/menu links
      if (!href || href.includes('login') || href.includes('search') ||
          href.includes('employers') || text.length < 5) {
        return
      }

      const fullUrl = href.startsWith('http') ? href : `https://www.jobvertise.com${href}`

      candidates.push({
        id: `jv-${i}`,
        name: text.split('-')[0]?.trim() || text.slice(0, 50),
        title: text,
        location: location || 'USA',
        profileUrl: fullUrl,
        source: 'jobvertise'
      })
    })

    // Remove duplicates
    const uniqueCandidates = candidates.filter((c, i, arr) =>
      arr.findIndex(x => x.profileUrl === c.profileUrl) === i
    ).slice(0, 20)

    console.log(`Found ${uniqueCandidates.length} Jobvertise candidates`)
    res.json({ candidates: uniqueCandidates, total: uniqueCandidates.length })

  } catch (error) {
    console.error('Jobvertise search error:', error.message)

    if (error.response?.status === 401 || error.response?.status === 403) {
      storedCookies = null
      return res.status(401).json({
        error: 'Session expired',
        message: 'Please re-login to Jobvertise and update cookies'
      })
    }

    res.status(500).json({ error: 'Failed to search Jobvertise', message: error.message })
  }
})

// Get resume details
router.get('/resume/:id', async (req, res) => {
  try {
    const { url } = req.query

    if (!storedCookies) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': storedCookies
      }
    })

    const $ = cheerio.load(response.data)
    const text = $('body').text()

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    const email = emailMatch?.find(e => !e.includes('jobvertise')) || null

    // Extract phone
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g)
    const phone = phoneMatch?.[0] || null

    // Get resume content
    const fullResume = text.slice(0, 3000)

    res.json({ email, phone, fullResume })

  } catch (error) {
    console.error('Jobvertise resume error:', error.message)
    res.status(500).json({ error: 'Failed to fetch resume' })
  }
})

module.exports = router

