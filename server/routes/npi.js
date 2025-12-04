const express = require('express');
const axios = require('axios');

const router = express.Router();

// NPI Registry API base URL
const NPI_API_URL = 'https://npiregistry.cms.hhs.gov/api/';

// Cache for storing all results for a search query
const searchCache = new Map();

// Check if a provider has an active license
function hasActiveLicense(provider) {
  const basic = provider.basic || {};
  const taxonomies = provider.taxonomies || [];

  // Check if NPI status is Active ('A')
  if (basic.status !== 'A') {
    return false;
  }

  // Check if provider has at least one taxonomy with a license
  const hasLicense = taxonomies.some(t => t.license && t.license.trim() !== '');
  
  return hasLicense;
}

// Helper function to fetch all NPI results for a query
async function fetchAllNPIResults(params, activeOnly = true) {
  const cacheKey = JSON.stringify({ ...params, activeOnly });

  // Check cache first (valid for 5 minutes)
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log('Using cached results:', cached.results.length, 'total');
      return cached.results;
    }
  }

  const allResults = [];
  let skip = 0;
  const batchSize = 200; // Max allowed by NPI API
  const maxResults = 2100; // Limit to prevent excessive API calls

  console.log('Fetching all NPI results (activeOnly:', activeOnly, ')...');

  while (skip < maxResults) {
    try {
      const response = await axios.get(NPI_API_URL, {
        params: {
          ...params,
          version: '2.1',
          limit: batchSize,
          skip: skip,
          enumeration_type: 'NPI-1'
        },
        headers: {
          'User-Agent': 'CandidateProfileSearch/1.0'
        },
        timeout: 30000
      });

      const results = response.data.results || [];

      if (results.length === 0) {
        console.log('No more results at skip:', skip);
        break;
      }

      // Filter for active licenses if requested
      if (activeOnly) {
        const activeResults = results.filter(hasActiveLicense);
        allResults.push(...activeResults);
        console.log(`Fetched ${results.length} results at skip ${skip}, ${activeResults.length} with active licenses, total active: ${allResults.length}`);
      } else {
        allResults.push(...results);
        console.log(`Fetched ${results.length} results at skip ${skip}, total: ${allResults.length}`);
      }

      if (results.length < batchSize) {
        // Got less than requested, no more results
        break;
      }

      skip += batchSize;

      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error fetching batch at skip', skip, ':', error.message);
      break;
    }
  }

  // Sort results by first name (A-Z)
  allResults.sort((a, b) => {
    const firstNameA = (a.basic?.first_name || '').toLowerCase();
    const firstNameB = (b.basic?.first_name || '').toLowerCase();
    return firstNameA.localeCompare(firstNameB);
  });

  console.log('Results sorted by first name');

  // Cache the results
  searchCache.set(cacheKey, {
    results: allResults,
    timestamp: Date.now()
  });

  console.log('Total active licensed results fetched:', allResults.length);
  return allResults;
}

// Transform NPI provider to candidate format
function transformProvider(provider) {
  const basic = provider.basic || {};
  const addresses = provider.addresses || [];
  const taxonomies = provider.taxonomies || [];
  const endpoints = provider.endpoints || [];

  const practiceAddress = addresses.find(a => a.address_purpose === 'LOCATION') || addresses[0] || {};
  const primaryTaxonomy = taxonomies.find(t => t.primary) || taxonomies[0] || {};

  const credential = basic.credential || '';
  const fName = basic.first_name || '';
  const lName = basic.last_name || '';
  const middleName = basic.middle_name || '';

  const fullName = [fName, middleName, lName].filter(Boolean).join(' ');
  const nameWithCredential = credential ? `${fullName}, ${credential}` : fullName;

  const phone = practiceAddress.telephone_number || null;
  const fax = practiceAddress.fax_number || null;

  let email = null;
  if (endpoints && endpoints.length > 0) {
    const emailEndpoint = endpoints.find(e =>
      e.endpointType === 'EMAIL' ||
      e.endpointTypeDescription?.toLowerCase().includes('email') ||
      (e.endpoint && e.endpoint.includes('@'))
    );
    if (emailEndpoint && emailEndpoint.endpoint) {
      email = emailEndpoint.endpoint;
    }
  }

  const location = [
    practiceAddress.city,
    practiceAddress.state,
    practiceAddress.postal_code?.substring(0, 5)
  ].filter(Boolean).join(', ');

  const fullAddress = [
    practiceAddress.address_1,
    practiceAddress.address_2,
    `${practiceAddress.city || ''}, ${practiceAddress.state || ''} ${practiceAddress.postal_code?.substring(0, 5) || ''}`
  ].filter(Boolean).join('\n');

  // Get all licenses from taxonomies
  const licenses = taxonomies
    .filter(t => t.license && t.license.trim() !== '')
    .map(t => ({
      number: t.license,
      state: t.state || '',
      specialty: t.desc || ''
    }));

  return {
    id: provider.number,
    npiNumber: provider.number,
    name: nameWithCredential,
    firstName: fName,
    lastName: lName,
    credential: credential,
    specialty: primaryTaxonomy.desc || 'Healthcare Professional',
    taxonomyCode: primaryTaxonomy.code || '',
    licenseNumber: primaryTaxonomy.license || '',
    licenseState: primaryTaxonomy.state || '',
    licenses: licenses,
    location,
    fullAddress,
    phone,
    fax,
    email,
    gender: basic.gender === 'M' ? 'Male' : basic.gender === 'F' ? 'Female' : '',
    lastUpdated: basic.last_updated || '',
    enumerationDate: basic.enumeration_date || '',
    status: basic.status === 'A' ? 'Active' : basic.status || 'Unknown',
    allSpecialties: taxonomies.map(t => t.desc).filter(Boolean),
    endpoints: endpoints.map(e => ({ type: e.endpointTypeDescription, value: e.endpoint })),
    source: 'npi',
    profileUrl: `https://npiregistry.cms.hhs.gov/provider-view/${provider.number}`
  };
}

// Search healthcare professionals by specialty, location, name
router.get('/search', async (req, res) => {
  try {
    const {
      specialty = '',
      state = '',
      city = '',
      firstName = '',
      lastName = '',
      page = 1,
      limit = 20,
      activeOnly = 'true'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const perPage = Math.min(parseInt(limit) || 20, 100);
    const filterActive = activeOnly !== 'false';

    // Build query parameters for NPI API
    const searchParams = {};
    if (specialty) searchParams.taxonomy_description = specialty;
    if (state) searchParams.state = state.toUpperCase();
    if (city) searchParams.city = city;
    if (firstName) searchParams.first_name = firstName;
    if (lastName) searchParams.last_name = lastName;

    console.log('NPI Search Request:', { searchParams, page: pageNum, limit: perPage, activeOnly: filterActive });

    // Fetch all results (filtered for active licenses, sorted by first name)
    const allResults = await fetchAllNPIResults(searchParams, filterActive);

    if (allResults.length === 0) {
      return res.json({
        candidates: [],
        total: 0,
        page: pageNum,
        perPage: perPage,
        totalPages: 0,
        message: filterActive 
          ? 'No healthcare professionals with active licenses found matching your criteria'
          : 'No healthcare professionals found matching your criteria'
      });
    }

    // Calculate pagination
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / perPage);
    const startIndex = (pageNum - 1) * perPage;
    const endIndex = startIndex + perPage;

    // Get page of results
    const pageResults = allResults.slice(startIndex, endIndex);

    // Transform to candidate format
    const candidates = pageResults.map(transformProvider);

    console.log(`Returning page ${pageNum} of ${totalPages} (${candidates.length} candidates, ${totalResults} total with active licenses)`);

    res.json({
      candidates,
      total: totalResults,
      page: pageNum,
      perPage: perPage,
      totalPages: totalPages,
      activeOnly: filterActive,
      sortedBy: 'firstName',
      source: 'NPI Registry'
    });

  } catch (error) {
    console.error('NPI API Error:', error.message);
    res.status(500).json({
      error: 'Failed to search NPI Registry',
      message: error.message
    });
  }
});

// Get single provider details by NPI number
router.get('/provider/:npi', async (req, res) => {
  try {
    const { npi } = req.params;

    const response = await axios.get(NPI_API_URL, {
      params: {
        version: '2.1',
        number: npi
      }
    });

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(response.data.results[0]);
  } catch (error) {
    console.error('NPI Provider Lookup Error:', error.message);
    res.status(500).json({ error: 'Failed to lookup provider' });
  }
});

// Clear cache endpoint (for admin use)
router.post('/clear-cache', (req, res) => {
  searchCache.clear();
  res.json({ message: 'Cache cleared' });
});

module.exports = router;
