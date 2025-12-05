const express = require('express')
const router = express.Router()
const axios = require('axios')
const config = require('../config')

// Import pdfjs-dist for PDF parsing
let pdfjsLib = null
async function getPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  }
  return pdfjsLib
}

// Helper: Fetch and parse PDF to extract real content
async function extractPdfContent(pdfUrl) {
  try {
    const pdfjs = await getPdfJs()

    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const pdfData = new Uint8Array(response.data)
    const loadingTask = pdfjs.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise

    // Extract text from all pages (up to first 3 pages for speed)
    let fullText = ''
    const maxPages = Math.min(pdf.numPages, 3)

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }

    const text = fullText.trim()
    if (!text || text.length < 50) {
      console.log('PDF has insufficient text content')
      return { name: null, email: null, phone: null, text: null }
    }

    // Extract name from PDF text
    // PDF text often has names at the very start, possibly with credentials
    let name = null

    // Split by multiple spaces (PDF text often separates sections this way)
    const segments = text.split(/\s{2,}/).map(s => s.trim()).filter(s => s.length > 2)

    // Also try newline split
    const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0)

    // Combine and prioritize first segments
    const candidates = [...segments.slice(0, 10), ...lines.slice(0, 10)]

    for (const segment of candidates) {
      // Skip if it's just contact info
      if (/^[\d\s\-\(\)\+]+$/.test(segment)) continue
      if (segment.includes('@') && !segment.includes(' ')) continue

      // Skip common headers
      const lower = segment.toLowerCase()
      if (lower.includes('resume') || lower.includes('curriculum') || lower.includes('vitae')) continue
      if (lower.includes('objective') || lower.includes('summary') || lower.includes('education')) continue
      if (lower.includes('experience') || lower.includes('qualifications') || lower.includes('skills')) continue

      // Job title words that shouldn't start a name
      const titleWords = ['nurse', 'senior', 'junior', 'staff', 'lead', 'chief', 'head', 'director',
                          'manager', 'specialist', 'coordinator', 'assistant', 'associate', 'analyst',
                          'engineer', 'developer', 'consultant', 'advisor', 'officer', 'executive',
                          'registered', 'licensed', 'certified', 'clinical', 'educator', 'practitioner']

      // Pattern 1: "FirstName MiddleName LastName, CREDENTIALS" (e.g., "Patrick A. McMurray, MSN, RN")
      const credMatch = segment.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+){1,2})\s*,/)
      if (credMatch) {
        const firstWord = credMatch[1].toLowerCase().split(' ')[0]
        if (!titleWords.includes(firstWord)) {
          name = credMatch[1].trim()
          break
        }
      }

      // Pattern 2: "FirstName LastName | contact" or "FirstName LastName - title"
      const pipeMatch = segment.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+){1,2})\s*[\|\-]/)
      if (pipeMatch) {
        const firstWord = pipeMatch[1].toLowerCase().split(' ')[0]
        if (!titleWords.includes(firstWord)) {
          name = pipeMatch[1].trim()
          break
        }
      }

      // Pattern 3: Just "FirstName LastName" or "FirstName M. LastName" at start
      const simpleMatch = segment.match(/^([A-Z][a-z]{2,15}(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]{2,15})(?:\s|$)/)
      if (simpleMatch) {
        const testName = simpleMatch[1].toLowerCase()
        // Skip common resume section headers and non-name words
        // Note: Words like "nurse" could be last names, but job titles like "Nurse Educator" start with them
        const invalidFirstWords = ['key', 'career', 'work', 'job', 'contact', 'personal', 'about', 'dear', 'cover',
                                   'nursing', 'baylor', 'university', 'college', 'hospital', 'medical', 'center',
                                   'health', 'research', 'clinical', 'academy', 'institute', 'school', 'department',
                                   'senior', 'junior', 'staff', 'lead', 'chief', 'head', 'director', 'manager',
                                   'specialist', 'coordinator', 'assistant', 'associate', 'analyst', 'engineer',
                                   'developer', 'consultant', 'advisor', 'officer', 'executive', 'administrator',
                                   'supervisor', 'educator', 'practitioner', 'therapist', 'technician', 'registered']
        // Check if FIRST word is a title/header
        const firstWord = testName.split(' ')[0]
        if (!invalidFirstWords.includes(firstWord)) {
          name = simpleMatch[1].trim()
          break
        }
      }
    }

    // Final validation - reject if name contains institution/organization keywords
    if (name) {
      const nameLower = name.toLowerCase()
      // Note: "nurse" is a valid surname (e.g., "Nancy Nurse"), so don't filter it
      // But "nursing" usually indicates institution
      const invalidNames = ['university', 'college', 'hospital', 'medical', 'center', 'health',
                           'research', 'clinical', 'academy', 'institute', 'school', 'department',
                           'nursing', 'baylor', 'texas', 'california', 'florida',
                           'attorney', 'attorneys', 'providing', 'services', 'consulting', 'legal',
                           'corporation', 'company', 'inc', 'llc', 'group', 'associates']
      if (invalidNames.some(word => nameLower.includes(word))) {
        name = null
      }

      // Also reject job titles that look like names (e.g., "Nurse Educator", "Staff Nurse")
      const jobTitlePatterns = ['nurse educator', 'nurse practitioner', 'nurse manager', 'nurse specialist',
                                'staff nurse', 'charge nurse', 'head nurse', 'clinical nurse',
                                'registered nurse', 'licensed nurse', 'senior nurse', 'junior nurse']
      if (name && jobTitlePatterns.some(title => nameLower === title)) {
        name = null
      }
    }

    // Extract email (skip placeholder emails)
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
    // Filter out placeholder/fake emails
    const validEmails = emailMatches.filter(e => {
      const lower = e.toLowerCase()
      return !lower.includes('example') && !lower.includes('firstlast') &&
             !lower.includes('yourname') && !lower.includes('email.com') &&
             !lower.includes('sample') && !lower.includes('placeholder')
    })
    const email = validEmails.length > 0 ? validEmails[0] : null

    // Extract phone (various formats)
    const phoneMatches = text.match(/(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []
    // Filter out placeholder/fake phones (all same digit, 000s, 444s, etc.)
    const validPhones = phoneMatches.filter(p => {
      const digits = p.replace(/\D/g, '')
      // Skip if all same digit or looks fake
      if (/^(.)\1+$/.test(digits)) return false  // All same digit
      if (/^0+$/.test(digits)) return false       // All zeros
      if (digits.includes('444444')) return false // Placeholder
      if (digits.includes('123456')) return false // Placeholder
      if (digits.length < 10) return false        // Too short
      return true
    })
    const phone = validPhones.length > 0 ? validPhones[0] : null

    console.log(`PDF parsed: name="${name}", email="${email}", phone="${phone}"`)
    return { name, email, phone, text: text.substring(0, 500) }
  } catch (error) {
    console.log('PDF fetch/parse error:', error.message)
    return { name: null, email: null, phone: null, text: null }
  }
}

// Commercial/ad domains to block
const BLOCKED_DOMAINS = [
  'resume.io', 'myperfectresume.com', 'zety.com', 'novoresume.com',
  'resumegenius.com', 'livecareer.com', 'indeed.com', 'monster.com',
  'glassdoor.com', 'thebalancemoney.com', 'thebalancecareers.com',
  'easypdf.live', 'pdfcoffee.com', 'scribd.com', 'slideshare.net',
  'pinterest.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'resumetemplates', 'resumebuilder', 'resume-now', 'resumehelp',
  'hloom.com', 'canva.com', 'visme.co', 'kickresume.com',
  'careercup.com', 'beamjobs.com', 'enhancv.com', 'cvmaker',
  'resumecoach', 'visualcv.com', 'standardresume.co', 'rxresu.me',
  'overleaf.com', 'coolfreecv.com', 'freesumes.com', 'resumelab.com',
  'resumecat', 'resumeworded', 'jobscan.co', 'rezi.ai', 'tealhq.com',
  'how2become.com', 'theinterviewguys.com', 'jobhero.com', 'velvetjobs.com',
  'qwikresume.com', 'resumekraft.com', 'resumeok.com', 'greatresumesfast.com',
  // Academic/journal publishing sites
  'nursingcenter.com', 'journals.lww.com', 'wolterskluwer.com', 'pubmed.gov',
  'ncbi.nlm.nih.gov', 'researchgate.net', 'sciencedirect.com', 'springer.com',
  'wiley.com', 'elsevier.com', 'tandfonline.com', 'sagepub.com', 'oup.com',
  'cambridge.org/core', 'nature.com', 'bmj.com', 'jamanetwork.com'
]

// Words in title that indicate template/guide pages (not actual resumes)
const BLOCKED_TITLE_WORDS = [
  'template', 'templates', 'example', 'examples', 'sample', 'samples',
  'guide', 'how to', 'tips', 'writing guide', 'create your', 'build your',
  'best resume', 'top resume', 'free download', '2024', '2025', 'format guide',
  'resume writing service', 'resume help', 'resume tips', 'career advice',
  'job search tips', 'interview tips', 'hiring manager',
  'workbook', 'cover letter', 'worksheet', 'checklist', 'toolkit',
  'test report', 'product report', 'technical report', 'lab report',
  'specification', 'datasheet', 'data sheet', 'manual', 'handbook',
  'catalog', 'catalogue', 'brochure', 'flyer', 'newsletter',
  'press release', 'annual report', 'quarterly report', 'white paper',
  'case study', 'research paper', 'thesis', 'dissertation',
  'certificate of', 'certification', 'compliance', 'inspection',
  'safety data', 'material safety', 'msds', 'sds',
  'invoice', 'receipt', 'order form', 'application form',
  'building products', 'crown building', 'test results'
]

// Legal/court document indicators to filter out
const LEGAL_INDICATORS = [
  'case 1:', 'case no.', 'case number', 'docket', 'filed', 'plaintiff',
  'defendant', 'v.', 'vs.', 'court', 'judgment', 'order', 'motion',
  'district court', 'circuit court', 'bankruptcy', 'petition', 'complaint',
  'stipulated', 'settlement', 'injunction', 'civil action', 'document 3',
  'page 1 of', 'page 2 of', 'bureau of', 'united states district'
]

// Job posting indicators - these are NOT resumes
const JOB_POSTING_INDICATORS = [
  'we are hiring', 'apply now', 'job description', 'job posting',
  'job opening', 'now hiring', 'position available', 'join our team',
  'career opportunity', 'employment opportunity', 'job opportunity',
  'salary range', 'salary:', 'benefits:', 'requirements:',
  'responsibilities:', 'qualifications:', 'how to apply',
  'submit your resume', 'send your resume', 'equal opportunity employer',
  'eoe', 'full-time position', 'part-time position', 'remote position',
  'hybrid position', 'we offer', 'competitive salary', 'health insurance',
  '401k', 'pto', 'paid time off', 'job id:', 'requisition', 'posting date',
  'closing date', 'application deadline', 'about the company', 'about us',
  'who we are', 'what you\'ll do', 'what we\'re looking for'
]

// Corporate/product/institutional document indicators (require 2+ matches to filter)
const PRODUCT_DOC_INDICATORS = [
  'test report', 'intertek', 'ul listed', 'scope of work', 'impact resistance',
  'fm approved', 'astm', 'ansi', 'testing of', 'test results',
  'specimen', 'sample tested', 'report number', 'project number',
  'client:', 'manufacturer:', 'model:', 'product:', 'part number',
  'sapi de cv', 'dba crown', 's.a. de c.v.',
  'total quality assured', 'quality assurance program',
  // Institutional documents (only filter if clear institutional doc)
  'grant process', 'grant application', 'application process',
  'policy and procedure', 'procedure manual', 'training manual', 'employee handbook',
  'strategic plan', 'annual report', 'quarterly report', 'fiscal year',
  'request for proposal', 'rfp', 'rfi',
  'board of directors', 'governance', 'bylaws'
]

// Academic/journal article indicators - these are articles ABOUT resumes, not actual resumes
const ACADEMIC_ARTICLE_INDICATORS = [
  'abstract', 'keywords:', 'doi:', 'doi#', 'journal of', 'themed issue',
  'american association', 'nurse practitioners', 'professional development',
  'biosketch', 'biosketches', 'business documents', 'introducing the documents',
  'supplemental digital', 'content 2', 'copyright ©', '© 20',
  'author:', 'authors:', 'correspondence:', 'affiliations',
  'published by', 'published in', 'peer-reviewed', 'peer reviewed',
  'research article', 'original article', 'review article', 'clinical article',
  'methods:', 'results:', 'conclusion:', 'discussion:',
  'references', 'bibliography', 'citations', 'cited by',
  'volume ', 'issue ', 'pages ', 'pp.', 'et al.',
  'manuscript', 'submitted', 'accepted', 'received',
  'acknowledgments', 'funding:', 'conflict of interest',
  'institutional review board', 'irb', 'informed consent',
  'study design', 'sample size', 'data analysis', 'statistical analysis'
]

function isAcademicArticle(title, snippet, pdfText) {
  const lowerTitle = (title || '').toLowerCase()
  const lowerSnippet = (snippet || '').toLowerCase()
  const lowerPdfText = (pdfText || '').toLowerCase()
  const combined = lowerTitle + ' ' + lowerSnippet + ' ' + lowerPdfText.substring(0, 2000)

  // Strong indicators (1 match = reject)
  if (combined.includes('journal of') || combined.includes('themed issue') ||
      combined.includes('doi:') || combined.includes('doi#') ||
      combined.includes('abstract') && combined.includes('keywords')) {
    return true
  }

  // Moderate indicators (2+ matches = reject)
  const matchCount = ACADEMIC_ARTICLE_INDICATORS.filter(indicator => combined.includes(indicator)).length
  return matchCount >= 2
}

function isProductDocument(title, snippet) {
  const lowerTitle = (title || '').toLowerCase()
  const lowerSnippet = (snippet || '').toLowerCase()
  const combined = lowerTitle + ' ' + lowerSnippet

  // Require 2+ matches to filter (less aggressive)
  const matchCount = PRODUCT_DOC_INDICATORS.filter(indicator => combined.includes(indicator)).length
  return matchCount >= 2
}

function isLegalDocument(title, snippet) {
  const lowerTitle = (title || '').toLowerCase()
  const lowerSnippet = (snippet || '').toLowerCase()
  const combined = lowerTitle + ' ' + lowerSnippet

  const matchCount = LEGAL_INDICATORS.filter(indicator => combined.includes(indicator)).length
  return matchCount >= 2
}

function isJobPosting(title, snippet) {
  const lowerTitle = (title || '').toLowerCase()
  const lowerSnippet = (snippet || '').toLowerCase()
  const combined = lowerTitle + ' ' + lowerSnippet

  const matchCount = JOB_POSTING_INDICATORS.filter(indicator => combined.includes(indicator)).length
  return matchCount >= 1 // Even 1 strong indicator suggests job posting
}

function isBlockedDomain(url) {
  if (!url) return true
  const lowerUrl = url.toLowerCase()
  return BLOCKED_DOMAINS.some(domain => lowerUrl.includes(domain))
}

// Check if title indicates a template/guide page (not an actual resume)
function isTemplatePage(title) {
  const lowerTitle = (title || '').toLowerCase()
  return BLOCKED_TITLE_WORDS.some(word => lowerTitle.includes(word))
}

// Check if this looks like an actual person's resume
function isActualResume(url, title, snippet) {
  const lowerUrl = url.toLowerCase()
  const lowerTitle = (title || '').toLowerCase()
  const lowerSnippet = (snippet || '').toLowerCase()

  // REJECT: Title contains template/guide words
  if (isTemplatePage(title)) {
    return false
  }

  // REJECT: Legal/court documents
  if (isLegalDocument(title, snippet)) {
    return false
  }

  // REJECT: Job postings (not resumes)
  if (isJobPosting(title, snippet)) {
    return false
  }

  // REJECT: Product/test documents
  if (isProductDocument(title, snippet)) {
    return false
  }

  // REJECT: Academic/journal articles ABOUT resumes
  if (isAcademicArticle(title, snippet, '')) {
    return false
  }

  // REJECT: Snippet contains clear marketing/advice language
  const marketingPhrases = [
    'vital step for', 'seeking to advance your', 'looking for a job',
    'resume writing is a', 'for job seekers', 'resume writing service',
    'how to write a resume', 'resume format guide', 'resume builder tool',
    'download our', 'try our', 'sign up', 'create your resume',
    'first impression', 'important first', 'things you can do'
  ]
  if (marketingPhrases.some(phrase => lowerSnippet.includes(phrase))) {
    return false
  }

  // ACCEPT: URL ends with .pdf (actual document)
  if (lowerUrl.endsWith('.pdf')) {
    return true
  }

  // ACCEPT: edu sites, google drive, dropbox
  if (lowerUrl.includes('.edu/') || lowerUrl.includes('github.io') ||
      lowerUrl.includes('drive.google.') || lowerUrl.includes('dropbox.')) {
    return true
  }

  // ACCEPT: Snippet has specific personal details (address, phone pattern, dates)
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(snippet) || // phone
      /\d{5}/.test(snippet) || // zip code
      /@[a-z]+\.[a-z]+/.test(lowerSnippet)) { // email domain
    return true
  }

  // ACCEPT: Has concrete experience indicators
  const experienceIndicators = [
    'years of experience', 'worked at', 'responsible for',
    'bachelor', 'master', 'b.s.', 'm.s.', 'degree in',
    'certified', 'license', 'rn ', 'lpn ', 'bsn', 'msn',
    'graduated', 'university', 'college'
  ]
  if (experienceIndicators.some(word => lowerSnippet.includes(word))) {
    return true
  }

  // If it's a PDF URL anywhere, likely a resume
  if (lowerUrl.includes('.pdf')) {
    return true
  }

  return false
}

// Build proper X-Ray search query for Google
function buildGoogleXRayQuery(keywords, location, filetype) {
  // Parse keywords - could be "software engineer" or "Java Developer, Python"
  const keywordList = keywords.split(/[,|]/).map(k => k.trim()).filter(k => k)

  // Build job title part with OR
  let titlePart
  if (keywordList.length > 1) {
    titlePart = '(' + keywordList.map(k => `"${k}"`).join(' OR ') + ')'
  } else {
    titlePart = `"${keywords}"`
  }

  // Resume/CV indicator
  const resumePart = '("resume" OR "cv" OR "curriculum vitae")'

  // Filetype part
  const filetypePart = filetype === 'all'
    ? '(filetype:pdf OR filetype:doc)'
    : `filetype:${filetype}`

  // Exclude commercial sites
  const excludePart = '-site:indeed.com -site:monster.com -site:glassdoor.com -site:linkedin.com -site:zety.com -site:resume.io -site:livecareer.com'

  // Combine: Title + Location + Resume + Filetype + Exclude commercials
  let query = titlePart
  if (location) {
    query += ` "${location}"`
  }
  query += ' ' + resumePart + ' ' + filetypePart + ' ' + excludePart

  return query
}

// X-Ray search using Google Custom Search API (free 100 queries/day)
router.get('/search', async (req, res) => {
  try {
    const { keywords, location, filetype = 'pdf' } = req.query

    if (!keywords) {
      return res.status(400).json({ error: 'Keywords required' })
    }

    // Build Google X-Ray query
    const googleQuery = buildGoogleXRayQuery(keywords, location, filetype)
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`

    console.log('Google X-Ray query:', googleQuery)

    // Check for API keys
    const apiKey = config.GOOGLE_API_KEY
    const searchEngineId = config.GOOGLE_SEARCH_ENGINE_ID

    if (!apiKey || !searchEngineId) {
      console.log('No Google API keys set - returning link only')
      return res.json({
        candidates: [],
        total: 0,
        searchQuery: googleQuery,
        googleSearchUrl,
        needsSetup: true,
        message: 'Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in server/config.js'
      })
    }

    // Fetch multiple pages to get more results (limit to 3 pages = 30 results to conserve quota)
    const allResults = []
    const pagesToFetch = 3  // Reduced from 10 to conserve API quota
    let quotaExceeded = false

    for (let page = 0; page < pagesToFetch; page++) {
      const start = page * 10 + 1
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(googleQuery)}&num=10&start=${start}`

      try {
        const response = await axios.get(searchUrl)
        if (response.data.items) {
          allResults.push(...response.data.items)
        }
        // Add small delay between requests to avoid rate limiting
        if (page < pagesToFetch - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (pageError) {
        console.log(`Page ${page + 1} fetch error:`, pageError.message)
        // Check if quota exceeded
        if (pageError.response?.status === 429 || pageError.message.includes('429')) {
          quotaExceeded = true
          console.log('Google API quota exceeded - try again tomorrow or use a different API key')
          break
        }
      }
    }

    console.log(`Fetched ${allResults.length} raw results`)

    if (quotaExceeded && allResults.length === 0) {
      return res.json({
        candidates: [],
        total: 0,
        searchQuery: googleQuery,
        googleSearchUrl,
        error: 'Google API daily quota exceeded (100 queries/day). Try again tomorrow or update your API key in server/config.js'
      })
    }

    const candidates = []
    const pendingCandidates = []
    const seenUrls = new Set()

    allResults.forEach((result, i) => {
      const title = result.title || ''
      const profileUrl = result.link || ''
      const snippet = result.snippet || ''

      // Skip duplicates
      if (seenUrls.has(profileUrl)) return
      seenUrls.add(profileUrl)

      // Skip blocked/commercial domains
      if (isBlockedDomain(profileUrl)) {
        console.log('Blocked domain:', profileUrl.substring(0, 50))
        return
      }

      // Skip if doesn't look like actual resume
      if (!isActualResume(profileUrl, title, snippet)) {
        console.log('Not actual resume:', title.substring(0, 50))
        return
      }

      // Additional content validation
      if (!isValidResumeResult(title, snippet, profileUrl)) {
        console.log('Failed validation:', title.substring(0, 50))
        return
      }

      // Add to pending list for PDF parsing
      pendingCandidates.push({
        id: `google-${i}`,
        title: title.slice(0, 100),
        location: location || 'USA',
        bio: snippet.slice(0, 300),
        profileUrl: profileUrl,
        source: 'google',
        fileType: filetype
      })
    })

    // Process PDFs to extract real name, email, phone (limit to avoid timeout)
    console.log(`Processing ${pendingCandidates.length} potential resumes...`)
    const maxToProcess = Math.min(pendingCandidates.length, 30) // Limit to 30 for speed

    for (let i = 0; i < maxToProcess; i++) {
      const candidate = pendingCandidates[i]
      console.log(`Parsing PDF ${i + 1}/${maxToProcess}: ${candidate.profileUrl.substring(0, 50)}...`)

      try {
        // Only parse PDF files
        if (candidate.profileUrl.toLowerCase().includes('.pdf')) {
          const pdfContent = await extractPdfContent(candidate.profileUrl)

          // Skip if PDF content indicates it's a journal/academic article
          if (pdfContent.text && isAcademicArticle(candidate.title, candidate.bio, pdfContent.text)) {
            console.log('Academic article detected:', candidate.title.substring(0, 40))
            continue
          }

          // Must have a valid name from the PDF
          if (pdfContent.name && pdfContent.name.length >= 4) {
            candidates.push({
              ...candidate,
              name: pdfContent.name,
              email: pdfContent.email || null,
              phone: pdfContent.phone || null
            })
          } else {
            console.log('No valid name in PDF:', candidate.title.substring(0, 40))
          }
        }
      } catch (err) {
        console.log('Error processing:', err.message)
      }
    }

    console.log(`Found ${candidates.length} resume results after PDF parsing`)
    res.json({
      candidates,
      total: candidates.length,
      searchQuery: googleQuery,
      googleSearchUrl
    })

  } catch (error) {
    console.error('Search error:', error.message)
    res.status(500).json({ error: 'Failed to search', message: error.message })
  }
})

// Common words that are NOT names (keep this minimal to avoid blocking real names)
const NON_NAME_WORDS = [
  'resume', 'cv', 'curriculum', 'vitae', 'pdf', 'doc', 'docx', 'download',
  'updated', 'faculty', 'case', 'document', 'page', 'filed',
  'director', 'manager', 'engineer', 'developer', 'analyst', 'specialist',
  'coordinator', 'assistant', 'associate', 'senior', 'junior', 'lead',
  'chief', 'head', 'vice', 'president', 'officer', 'executive', 'admin',
  'nursing', 'student', 'attorney', 'lawyer', 'accountant', 'consultant',
  'the', 'and', 'for', 'with', 'from', 'about', 'professional', 'experienced',
  'certified', 'licensed', 'registered', 'global', 'international', 'national',
  'business', 'administration', 'dba', 'mba', 'phd', 'degree', 'bachelor',
  'master', 'university', 'college', 'school', 'institute', 'corporation',
  'company', 'inc', 'llc', 'ltd', 'corp', 'group', 'services', 'solutions',
  'cover', 'letter', 'workbook', 'revised', 'format',
  'template', 'example', 'sample', 'guide', 'report', 'test', 'data',
  'staff', 'clinic', 'center', 'grant', 'process', 'application',
  'research', 'innovation', 'quality', 'children', 'hospital',
  'care', 'medical', 'practice', 'office', 'department'
]

// Helper: Extract actual person's name from title and snippet
function extractNameFromTitle(title, snippet, url) {
  // First, try to find a name pattern in the title (most reliable source)
  if (title) {
    const name = findPersonName(title)
    if (name) return name
  }

  // Try to find name in the snippet (common in resumes)
  if (snippet) {
    // Search through more of the snippet
    const snippetName = findPersonName(snippet.substring(0, 200))
    if (snippetName) return snippetName
  }

  // Last resort: try filename, but validate it looks like a real name
  if (url) {
    const filename = decodeURIComponent(url.split('/').pop().split('?')[0])
      .replace(/\.(pdf|doc|docx)$/i, '')
      .replace(/[-_]/g, ' ')

    const filenameName = findPersonName(filename)
    if (filenameName) return filenameName
  }

  return null
}

// Find a person's name in text
function findPersonName(text) {
  if (!text) return null

  // Clean up the text
  let cleaned = text
    .replace(/[-_|–—:,\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Look for pattern: FirstName LastName or FirstName MiddleInitial LastName
  // First name must be 3-15 chars, last name 2-15 chars, start with capital
  const namePattern = /\b([A-Z][a-z]{2,14})\s+(?:([A-Z]\.?)\s+)?([A-Z][a-z]{1,14})\b/
  const match = cleaned.match(namePattern)

  if (match) {
    const firstName = match[1]
    const middleInitial = match[2] || ''
    const lastName = match[3]

    // Validate these are likely names (not in non-name list)
    const firstLower = firstName.toLowerCase()
    const lastLower = lastName.toLowerCase()

    // Additional validation: reject if looks like common phrases
    const invalidCombos = [
      'in clinic', 'at hospital', 'for nursing', 'of medicine', 'in health',
      'to apply', 'per diem', 'new york', 'los angeles', 'san francisco'
    ]
    const fullName = `${firstName} ${lastName}`.toLowerCase()
    if (invalidCombos.some(combo => fullName.includes(combo))) {
      return null
    }

    if (!NON_NAME_WORDS.includes(firstLower) && !NON_NAME_WORDS.includes(lastLower)) {
      if (middleInitial) {
        return `${firstName} ${middleInitial} ${lastName}`
      }
      return `${firstName} ${lastName}`
    }
  }

  return null
}

// Validate that the result looks like a real resume (not junk)
function isValidResumeResult(title, snippet, url) {
  const lowerTitle = (title || '').toLowerCase()
  const lowerSnippet = (snippet || '').toLowerCase()
  const combined = lowerTitle + ' ' + lowerSnippet

  // REJECT: Government/court documents
  if (url.includes('.gov/') && !url.includes('.edu')) {
    return false
  }

  // REJECT: News articles, press releases
  const newsIndicators = ['press release', 'news article', 'published', 'reported', 'announced']
  if (newsIndicators.some(ind => combined.includes(ind))) {
    return false
  }

  // REJECT: Too short or meaningless snippets
  if (!snippet || snippet.length < 50) {
    return false
  }

  // REJECT: Corporate/company pages
  const corpIndicators = ['about us', 'our team', 'meet the team', 'staff directory', 'board of directors']
  if (corpIndicators.some(ind => combined.includes(ind))) {
    return false
  }

  // REQUIRE: At least some resume-like content
  const resumeIndicators = [
    'experience', 'education', 'skill', 'work', 'degree', 'university',
    'college', 'certified', 'professional', 'summary', 'objective',
    'employment', 'worked', 'managed', 'developed', 'years', 'qualification',
    'bachelor', 'master', 'phd', 'b.s', 'm.s', 'mba', 'dba'
  ]
  const hasResumeContent = resumeIndicators.some(ind => combined.includes(ind))

  // Also accept if it has contact info patterns
  const hasContactInfo = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(snippet) ||
                         /@[a-z]+\.[a-z]+/i.test(snippet)

  return hasResumeContent || hasContactInfo
}

module.exports = router

