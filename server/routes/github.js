const express = require('express');
const axios = require('axios');
const router = express.Router();

const GITHUB_API = 'https://api.github.com';

// Search GitHub users
router.get('/search', async (req, res) => {
  try {
    const { query, location, language, minRepos, page = 1 } = req.query;
    
    // Build search query
    let searchQuery = '';
    if (query) searchQuery += `${query} in:name in:bio in:login `;
    if (location) {
      // Wrap location in quotes if it contains spaces or special characters
      const cleanLocation = location.trim();
      if (cleanLocation.includes(' ') || cleanLocation.includes(',')) {
        searchQuery += `location:"${cleanLocation}" `;
      } else {
        searchQuery += `location:${cleanLocation} `;
      }
    }
    if (language) searchQuery += `language:${language} `;
    if (minRepos) searchQuery += `repos:>=${minRepos} `;

    searchQuery = searchQuery.trim() || 'type:user';

    console.log('GitHub search query:', searchQuery);
    
    const response = await axios.get(`${GITHUB_API}/search/users`, {
      params: {
        q: searchQuery,
        per_page: 20,
        page: page
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CandidateProfileSearch'
      }
    });

    // Fetch detailed info for each user (limited to first 10 to avoid rate limits)
    const usersWithDetails = await Promise.all(
      response.data.items.slice(0, 10).map(async (user) => {
        try {
          const userDetails = await axios.get(`${GITHUB_API}/users/${user.login}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'CandidateProfileSearch'
            }
          });
          return {
            id: user.id,
            source: 'github',
            username: user.login,
            name: userDetails.data.name || user.login,
            avatar: user.avatar_url,
            profileUrl: user.html_url,
            email: userDetails.data.email,
            bio: userDetails.data.bio,
            company: userDetails.data.company,
            location: userDetails.data.location,
            blog: userDetails.data.blog,
            twitter: userDetails.data.twitter_username,
            publicRepos: userDetails.data.public_repos,
            followers: userDetails.data.followers,
            hireable: userDetails.data.hireable
          };
        } catch (err) {
          return {
            id: user.id,
            source: 'github',
            username: user.login,
            name: user.login,
            avatar: user.avatar_url,
            profileUrl: user.html_url
          };
        }
      })
    );

    res.json({
      total: response.data.total_count,
      page: parseInt(page),
      candidates: usersWithDetails
    });
  } catch (error) {
    console.error('GitHub search error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to search GitHub',
      message: error.message
    });
  }
});

// Get user's repositories (to show skills/languages)
router.get('/user/:username/repos', async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
      params: { sort: 'updated', per_page: 10 },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CandidateProfileSearch'
      }
    });

    const languages = [...new Set(response.data.map(repo => repo.language).filter(Boolean))];
    
    res.json({
      repos: response.data.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        url: repo.html_url
      })),
      languages
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch repositories',
      message: error.message
    });
  }
});

module.exports = router;

