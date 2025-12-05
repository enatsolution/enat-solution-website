const express = require('express');
const axios = require('axios');
const router = express.Router();

const DEVTO_API = 'https://dev.to/api';

// Search Dev.to users by finding articles and extracting authors
router.get('/search', async (req, res) => {
  try {
    const { query, tag, page = 1 } = req.query;
    
    // Dev.to doesn't have direct user search, so we search articles and get unique authors
    const params = {
      per_page: 30,
      page: page
    };
    
    if (tag) params.tag = tag;
    if (query) params.tag = query; // Use query as tag for better results
    
    const response = await axios.get(`${DEVTO_API}/articles`, {
      params,
      headers: { 'User-Agent': 'CandidateProfileSearch' }
    });

    // Extract unique users from articles
    const userMap = new Map();
    response.data.forEach(article => {
      if (!userMap.has(article.user.user_id)) {
        userMap.set(article.user.user_id, {
          id: article.user.user_id,
          source: 'devto',
          username: article.user.username,
          name: article.user.name,
          avatar: article.user.profile_image_90 || article.user.profile_image,
          profileUrl: `https://dev.to/${article.user.username}`,
          twitter: article.user.twitter_username,
          github: article.user.github_username,
          website: article.user.website_url
        });
      }
    });

    // Fetch detailed user info for first 10 users
    const users = Array.from(userMap.values()).slice(0, 10);
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        try {
          const userResponse = await axios.get(`${DEVTO_API}/users/by_username`, {
            params: { url: user.username },
            headers: { 'User-Agent': 'CandidateProfileSearch' }
          });
          return {
            ...user,
            bio: userResponse.data.summary,
            location: userResponse.data.location,
            joinedAt: userResponse.data.joined_at
          };
        } catch (err) {
          return user;
        }
      })
    );

    res.json({
      total: userMap.size,
      page: parseInt(page),
      candidates: usersWithDetails
    });
  } catch (error) {
    console.error('Dev.to search error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to search Dev.to',
      message: error.message
    });
  }
});

// Get user's articles (shows expertise areas)
router.get('/user/:username/articles', async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`${DEVTO_API}/articles`, {
      params: { username, per_page: 10 },
      headers: { 'User-Agent': 'CandidateProfileSearch' }
    });

    const tags = [...new Set(response.data.flatMap(article => article.tag_list))];
    
    res.json({
      articles: response.data.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        tags: article.tag_list,
        reactions: article.positive_reactions_count,
        publishedAt: article.published_at
      })),
      expertise: tags
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
});

module.exports = router;

