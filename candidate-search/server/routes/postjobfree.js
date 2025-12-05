const express = require('express')
const router = express.Router()
const axios = require('axios')
const cheerio = require('cheerio')

// Search resumes on PostJobFree
router.get('/search', async (req, res) => {
  try {
    const { keywords, location } = req.query

    // Build search URL
    let searchUrl = 'https://www.postjobfree.com/resumes?'
    const params = []
    if (keywords) params.push(`q=${encodeURIComponent(keywords)}`)
    if (location) params.push(`l=${encodeURIComponent(location)}`)
    searchUrl += params.join('&')

    console.log('Searching PostJobFree:', searchUrl)

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    })

    const $ = cheerio.load(response.data)
    const candidates = []

    // Parse resume listings - each resume is in a div with class snippetPadding
    $('.snippetPadding').each((i, el) => {
      const $el = $(el)

      // Get title and link from h3.itemTitle > a
      const titleLink = $el.find('h3.itemTitle a')
      const title = titleLink.text().trim()
      const profileUrl = titleLink.attr('href')

      // Get location from span.colorLocation
      const locationEl = $el.find('span.colorLocation')
      const location = locationEl.text().trim()

      // Get snippet/bio from div.normalText (remove location and date)
      const normalText = $el.find('div.normalText')
      let snippet = normalText.text().trim()
      // Clean up the snippet - remove location and date parts
      snippet = snippet.replace(location, '').replace(/\s*-\s*(Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct)\s+\d{1,2}\s*$/i, '').trim()

      // Get date from span.colorDate
      const dateEl = $el.find('span.colorDate')
      const date = dateEl.text().trim()

      // Extract partial contact info from snippet
      const emailMatch = snippet.match(/[a-zA-Z0-9.*]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
      const phoneMatch = snippet.match(/\d{3}[-.*]+\d{3}[-.*]+\d{4}/g)

      if (title && profileUrl) {
        // Extract ID from URL like /resume/aef5nw/cna-hha...
        const urlParts = profileUrl.split('/')
        const id = urlParts[2] || `pjf-${i}` // The ID is the second part after /resume/

        candidates.push({
          id: id,
          name: title.split('-')[0]?.trim() || title.slice(0, 50),
          title: title,
          location: location || 'USA',
          bio: snippet.slice(0, 300),
          email: emailMatch?.[0] || null,
          phone: phoneMatch?.[0] || null,
          date: date,
          profileUrl: profileUrl.startsWith('http') ? profileUrl : `https://www.postjobfree.com${profileUrl}`,
          source: 'postjobfree'
        })
      }
    })

    console.log(`Found ${candidates.length} PostJobFree candidates`)
    res.json({ candidates, total: candidates.length })

  } catch (error) {
    console.error('PostJobFree search error:', error.message)
    res.status(500).json({ error: 'Failed to search PostJobFree', message: error.message })
  }
})

// Get resume details
router.get('/resume/:id', async (req, res) => {
  try {
    const { id } = req.params
    const url = `https://www.postjobfree.com/resume/${id}`

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    const $ = cheerio.load(response.data)
    
    // Get full resume content
    const resumeContent = $('div.normalText').text().trim()
    
    // Extract contact info (may be partially hidden)
    const html = response.data
    const emailMatch = html.match(/[a-zA-Z0-9.*_+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    const phoneMatch = html.match(/\d{3}[-.*]+\d{3}[-.*]+\d{4}/g)

    const details = {
      email: emailMatch?.find(e => !e.includes('postjobfree')) || null,
      phone: phoneMatch?.[0] || null,
      fullResume: resumeContent.slice(0, 5000)
    }

    res.json(details)

  } catch (error) {
    console.error('PostJobFree resume error:', error.message)
    res.status(500).json({ error: 'Failed to fetch resume' })
  }
})

// Helper function to extract name from resume snippet
function extractName(text) {
  // Look for common name patterns at the start of resume
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // Check if first line looks like a name (2-4 words, no special chars)
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(firstLine)) {
      return firstLine
    }
  }
  return null
}

module.exports = router

