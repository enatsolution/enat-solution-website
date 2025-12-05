const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const router = express.Router();

// JobSpider credentials from environment or defaults
const JOBSPIDER_USERNAME = process.env.JOBSPIDER_USERNAME || 'Enat Solution';
const JOBSPIDER_PASSWORD = process.env.JOBSPIDER_PASSWORD || 'P@ssw0rd';

// Create a cookie jar and axios instance with cookie support
const jar = new CookieJar();
const axiosClient = wrapper(axios.create({
  jar,
  withCredentials: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  }
}));

let isLoggedIn = false;
let lastLoginAttempt = 0;
const LOGIN_COOLDOWN = 5 * 60 * 1000; // 5 minutes

// Function to login to JobSpider
async function loginToJobSpider() {
  const now = Date.now();

  // Avoid repeated login attempts
  if (isLoggedIn || (now - lastLoginAttempt < LOGIN_COOLDOWN)) {
    return isLoggedIn;
  }

  lastLoginAttempt = now;

  try {
    console.log('Attempting to login to JobSpider...');

    // First get the login page to get any hidden fields/cookies
    const loginPageResponse = await axiosClient.get('https://www.jobspider.com/job/main-overview.asp');
    const $ = cheerio.load(loginPageResponse.data);

    // Extract hidden form fields
    const hiddenFields = {};
    $('input[type="hidden"]').each((_, el) => {
      const name = $(el).attr('name');
      const value = $(el).attr('value') || '';
      if (name) hiddenFields[name] = value;
    });

    // Prepare login data
    const loginData = new URLSearchParams();
    loginData.append('username', JOBSPIDER_USERNAME);
    loginData.append('password', JOBSPIDER_PASSWORD);
    loginData.append('_method', 'Button1');

    // Add hidden fields
    for (const [key, value] of Object.entries(hiddenFields)) {
      loginData.append(key, value);
    }

    // Submit login form
    const loginResponse = await axiosClient.post(
      'https://www.jobspider.com/job/main-overview.asp',
      loginData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.jobspider.com/job/main-overview.asp'
        },
        maxRedirects: 5
      }
    );

    // Check if login was successful by looking for signs of being logged in
    const responseText = loginResponse.data;
    if (responseText.includes('Log Off') || responseText.includes('My Account') ||
        responseText.includes('Welcome') || !responseText.includes('Enter Your Logon')) {
      isLoggedIn = true;
      console.log('Successfully logged in to JobSpider!');
    } else {
      console.log('Login may have failed - checking further...');
      // Sometimes login redirects, check the cookie jar
      const cookies = await jar.getCookies('https://www.jobspider.com');
      if (cookies.length > 0) {
        isLoggedIn = true;
        console.log('Login successful (cookies found)');
      }
    }

    return isLoggedIn;
  } catch (error) {
    console.error('Login error:', error.message);
    return false;
  }
}

// Category mappings for different industries
const CATEGORIES = {
  // IT/Tech categories
  'it': 'Information Technology',
  'software': 'Computer Software/Programming',
  'hardware': 'Computer Hardware',
  'engineering': 'Engineering',
  
  // Healthcare categories
  'healthcare': 'Healthcare',
  'medical': 'Medical/Health',
  'nursing': 'Nurses/Nurses Aids',
  'dental': 'Dental',
  
  // Management categories
  'management': 'Management',
  'executive': 'Executive',
  'hr': 'Human Resources',
  'business': 'Business/Management',
  'finance': 'Finance/Investment',
  
  // Other common categories
  'sales': 'Sales/Demonstrators',
  'marketing': 'Marketing',
  'admin': 'Secretary/Admin. Assistant/Receptionist',
  'customer_service': 'Customer Service/Technical Support',
  'accounting': 'Accounting/Bookkeeping'
};

// US States mapping
const US_STATES = {
  'alabama': 'Alabama - USA', 'alaska': 'Alaska - USA', 'arizona': 'Arizona - USA',
  'arkansas': 'Arkansas - USA', 'california': 'California - USA', 'colorado': 'Colorado - USA',
  'connecticut': 'Connecticut - USA', 'delaware': 'Delaware - USA', 'dc': 'District of Columbia - USA',
  'florida': 'Florida - USA', 'georgia': 'Georgia - USA', 'hawaii': 'Hawaii - USA',
  'idaho': 'Idaho - USA', 'illinois': 'Illinois - USA', 'indiana': 'Indiana - USA',
  'iowa': 'Iowa - USA', 'kansas': 'Kansas - USA', 'kentucky': 'Kentucky - USA',
  'louisiana': 'Louisiana - USA', 'maine': 'Maine - USA', 'maryland': 'Maryland - USA',
  'massachusetts': 'Massachusetts - USA', 'michigan': 'Michigan - USA', 'minnesota': 'Minnesota - USA',
  'mississippi': 'Mississippi - USA', 'missouri': 'Missouri - USA', 'montana': 'Montana - USA',
  'nebraska': 'Nebraska - USA', 'nevada': 'Nevada - USA', 'new hampshire': 'New Hampshire - USA',
  'new jersey': 'New Jersey - USA', 'new mexico': 'New Mexico - USA', 'new york': 'New York - USA',
  'north carolina': 'North Carolina - USA', 'north dakota': 'North Dakota - USA', 'ohio': 'Ohio - USA',
  'oklahoma': 'Oklahoma - USA', 'oregon': 'Oregon - USA', 'pennsylvania': 'Pennsylvania - USA',
  'rhode island': 'Rhode Island - USA', 'south carolina': 'South Carolina - USA',
  'south dakota': 'South Dakota - USA', 'tennessee': 'Tennessee - USA', 'texas': 'Texas - USA',
  'utah': 'Utah - USA', 'vermont': 'Vermont - USA', 'virginia': 'Virginia - USA',
  'washington': 'Washington - USA', 'west virginia': 'West Virginia - USA',
  'wisconsin': 'Wisconsin - USA', 'wyoming': 'Wyoming - USA'
};

// Parse state from location string
function parseState(location) {
  if (!location) return '';
  const loc = location.toLowerCase().trim();
  
  // Check for state abbreviations
  const stateAbbrevs = {
    'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
    'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'dc': 'dc', 'fl': 'florida',
    'ga': 'georgia', 'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana',
    'ia': 'iowa', 'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine',
    'md': 'maryland', 'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota',
    'ms': 'mississippi', 'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada',
    'nh': 'new hampshire', 'nj': 'new jersey', 'nm': 'new mexico', 'ny': 'new york',
    'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma',
    'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',
    'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah', 'vt': 'vermont',
    'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia', 'wi': 'wisconsin', 'wy': 'wyoming'
  };
  
  // Check if location contains a state abbreviation
  for (const [abbrev, state] of Object.entries(stateAbbrevs)) {
    if (loc.includes(abbrev) || loc.includes(state)) {
      return US_STATES[state] || '';
    }
  }
  
  // Check for full state names
  for (const [state, value] of Object.entries(US_STATES)) {
    if (loc.includes(state)) {
      return value;
    }
  }
  
  return '';
}

// Get available categories
router.get('/categories', (req, res) => {
  res.json({
    categories: Object.entries(CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value
    }))
  });
});

// Search resumes on JobSpider
router.get('/search', async (req, res) => {
  try {
    const { keywords, location, category, page = 1 } = req.query;

    console.log('JobSpider search:', { keywords, location, category });

    // Build search URL
    const searchParams = new URLSearchParams();
    if (keywords) searchParams.append('keywords', keywords);

    // Parse state from location
    const state = parseState(location);
    if (state) searchParams.append('state', state);

    // Map category
    const categoryValue = CATEGORIES[category?.toLowerCase()] || '';
    if (categoryValue) searchParams.append('category', categoryValue);

    searchParams.append('page', page);

    // JobSpider resume search URL
    const searchUrl = `https://www.jobspider.com/job/resume-search-results.asp?${searchParams.toString()}`;

    console.log('Fetching:', searchUrl);

    // Make request to JobSpider
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    });

    // Parse HTML response
    const $ = cheerio.load(response.data);
    const candidates = [];

    // Find resume listings - JobSpider displays resumes in table rows
    // Resume links are in format: /job/view-resume-XXXXX.html
    $('table tr').each((index, element) => {
      const $row = $(element);
      const cells = $row.find('td');

      // Skip header rows (they use <th> not <td>)
      if (cells.length < 5) return;

      // Find the resume link in the row (last cell usually has the details link)
      const detailsLink = $row.find('a[href*="view-resume-"]');
      if (detailsLink.length === 0) return;

      const href = detailsLink.attr('href') || '';

      // Extract resume ID from URL like /job/view-resume-85147.html
      const resumeIdMatch = href.match(/view-resume-(\d+)\.html/i);
      if (!resumeIdMatch) return;

      const resumeId = resumeIdMatch[1];

      // Extract data from table cells
      // Columns: #, Posted, Job Function Sought, Desired Industry, Location, Details
      const postedDate = $(cells[1]).text().trim();
      const jobTitle = $(cells[2]).text().trim();
      const industry = $(cells[3]).text().trim();
      const location = $(cells[4]).text().trim();

      if (jobTitle && jobTitle.length > 1) {
        // Construct the proper resume view URL
        const profileUrl = `https://www.jobspider.com${href.startsWith('/') ? '' : '/'}${href}`;

        candidates.push({
          id: resumeId,
          source: 'jobspider',
          name: jobTitle, // Job title as name since actual name is on resume page
          title: jobTitle,
          industry: industry,
          location: location,
          profileUrl: profileUrl,
          postedDate: postedDate,
          skills: [],
          experience: ''
        });
      }
    });

    // Remove duplicates based on profileUrl
    const uniqueCandidates = candidates.filter((candidate, index, self) =>
      index === self.findIndex(c => c.profileUrl === candidate.profileUrl)
    );

    console.log(`Found ${uniqueCandidates.length} candidates`);

    // Fetch details for top candidates (limit to first 10 to avoid too many requests)
    const topCandidates = uniqueCandidates.slice(0, 10);
    const enrichedCandidates = await Promise.all(
      topCandidates.map(async (candidate) => {
        try {
          const details = await fetchResumeDetails(candidate.profileUrl);
          if (details) {
            return {
              ...candidate,
              name: details.name || candidate.name,
              location: details.location || candidate.location,
              industry: details.industry || candidate.industry,
              positionType: details.positionType,
              jobLevel: details.jobLevel,
              degree: details.degree,
              objective: details.objective,
              experience: details.additionalInfo,
              email: details.email,
              phone: details.phone,
              postedDate: details.postedDate || candidate.postedDate
            };
          }
          return candidate;
        } catch (err) {
          console.error('Error enriching candidate:', err.message);
          return candidate;
        }
      })
    );

    res.json({
      total: uniqueCandidates.length,
      page: parseInt(page),
      candidates: enrichedCandidates,
      source: 'jobspider'
    });

  } catch (error) {
    console.error('JobSpider search error:', error.message);
    res.status(500).json({
      error: 'Failed to search JobSpider',
      message: error.message
    });
  }
});

// Helper function to fetch resume details from the profile page (with login for contact info)
async function fetchResumeDetails(profileUrl, useAuth = true) {
  try {
    // Try to login first if using auth
    if (useAuth) {
      await loginToJobSpider();
    }

    // Use authenticated client if logged in, otherwise use regular axios
    const client = isLoggedIn ? axiosClient : axios;

    const response = await client.get(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.jobspider.com/job/resume-search.asp'
      }
    });

    const $ = cheerio.load(response.data);
    const pageText = $('body').text();
    const html = response.data;

    // Extract name from title or content
    const titleMatch = $('title').text().match(/^([^-]+)/);
    const name = titleMatch ? titleMatch[1].trim() : '';

    // Extract fields from the resume page
    const industryMatch = pageText.match(/Desired Industry:\s*([^\n]+)/i);
    const locationMatch = pageText.match(/Desired Job Location:\s*([^\n]+)/i);
    const positionTypeMatch = pageText.match(/Type of Position:\s*([^\n]+)/i);
    const jobLevelMatch = pageText.match(/Job Level:\s*([^\n]+)/i);
    const degreeMatch = pageText.match(/Highest Degree Attained:\s*([^\n]+)/i);
    const wageMatch = pageText.match(/Desired Wage:\s*([^\n]+)/i);
    const dateMatch = pageText.match(/Date Posted:\s*([^\n]+)/i);

    // Extract objective
    const objectiveMatch = pageText.match(/Objective:\s*([\s\S]*?)(?:Additional Information:|Candidate Contact|$)/i);
    const objective = objectiveMatch ? objectiveMatch[1].trim().substring(0, 500) : '';

    // Extract additional info/experience
    const additionalMatch = pageText.match(/Additional Information:\s*([\s\S]*?)(?:Candidate Contact|$)/i);
    const additionalInfo = additionalMatch ? additionalMatch[1].trim().substring(0, 1000) : '';

    // Try to extract contact info from the resume content
    let email = null;
    let phone = null;

    // Look for contact info section first
    const contactSection = html.match(/Candidate Contact Information[\s\S]*?<\/TABLE>/i);
    if (contactSection) {
      const contactText = contactSection[0];
      // Extract email
      const emailMatch = contactText.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) email = emailMatch[0];

      // Extract phone - look for formatted phone numbers
      const phoneMatch = contactText.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) phone = phoneMatch[1];
    }

    // Search the entire HTML for emails (candidates often include them in resume text)
    if (!email) {
      const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emailMatches) {
        // Filter out common website/system emails
        const validEmails = emailMatches.filter(e => {
          const lower = e.toLowerCase();
          return !lower.includes('jobspider') &&
                 !lower.includes('google') &&
                 !lower.includes('example') &&
                 !lower.includes('pub-') &&
                 !lower.includes('adsby') &&
                 !lower.includes('nativeassignment') &&
                 !lower.includes('analytics') &&
                 !lower.includes('adsense');
        });
        if (validEmails.length > 0) email = validEmails[0];
      }
    }

    // Search for phone numbers in the resume content
    // Look for properly formatted phone numbers (with dashes, dots, or spaces)
    if (!phone) {
      // Match phone patterns like: 360-837-6556, (360) 837-6556, 360.837.6556, 360 837 6556
      const phonePatterns = [
        /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g,  // (xxx) xxx-xxxx or xxx-xxx-xxxx
        /\+1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,  // +1 xxx xxx xxxx
      ];

      for (const pattern of phonePatterns) {
        const phoneMatches = html.match(pattern);
        if (phoneMatches && phoneMatches.length > 0) {
          // Filter out numbers that look like IDs or timestamps (all same digits, etc)
          const validPhones = phoneMatches.filter(p => {
            const digits = p.replace(/\D/g, '');
            // Must be 10 or 11 digits
            if (digits.length < 10 || digits.length > 11) return false;
            // Shouldn't be all same digit
            if (/^(\d)\1+$/.test(digits)) return false;
            // Shouldn't start with 0 or 1 (except country code)
            const areaCode = digits.length === 11 ? digits.substring(1, 4) : digits.substring(0, 3);
            if (areaCode.startsWith('0') || areaCode.startsWith('1')) return false;
            return true;
          });
          if (validPhones.length > 0) {
            phone = validPhones[0];
            break;
          }
        }
      }
    }

    console.log(`Fetched details for ${name}: email=${email}, phone=${phone}, loggedIn=${isLoggedIn}`);

    return {
      name: name || 'Candidate',
      industry: industryMatch ? industryMatch[1].trim() : '',
      location: locationMatch ? locationMatch[1].trim() : '',
      positionType: positionTypeMatch ? positionTypeMatch[1].trim() : '',
      jobLevel: jobLevelMatch ? jobLevelMatch[1].trim() : '',
      degree: degreeMatch ? degreeMatch[1].trim() : '',
      desiredWage: wageMatch ? wageMatch[1].trim() : '',
      postedDate: dateMatch ? dateMatch[1].trim() : '',
      objective,
      additionalInfo,
      email,
      phone
    };
  } catch (error) {
    console.error('Error fetching resume details:', error.message);
    return null;
  }
}

// Get detailed resume view
router.get('/resume/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Resume URL required' });
    }

    const details = await fetchResumeDetails(url);

    if (!details) {
      return res.status(500).json({ error: 'Failed to fetch resume details' });
    }

    res.json({
      id,
      ...details
    });

  } catch (error) {
    console.error('Resume fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch resume details' });
  }
});

// Login status endpoint
router.get('/login-status', (req, res) => {
  res.json({
    loggedIn: isLoggedIn,
    username: JOBSPIDER_USERNAME
  });
});

// Manual login endpoint
router.post('/login', async (req, res) => {
  try {
    // Reset login state to force new login
    isLoggedIn = false;
    lastLoginAttempt = 0;

    const success = await loginToJobSpider();
    res.json({
      success,
      message: success ? 'Successfully logged in to JobSpider' : 'Login failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

