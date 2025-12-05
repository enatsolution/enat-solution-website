import { useState, useEffect } from 'react'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import SearchForm from './components/SearchForm'
import CandidateCard from './components/CandidateCard'
import CandidateModal from './components/CandidateModal'

// Configure axios to send credentials
axios.defaults.withCredentials = true

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [activeSource, setActiveSource] = useState('npi')
  const [googleSearchUrl, setGoogleSearchUrl] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [lastFilters, setLastFilters] = useState(null)
  const [resultsPerPage, setResultsPerPage] = useState(20)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/check')
        setIsAuthenticated(response.data.authenticated)
      } catch (err) {
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      setIsAuthenticated(false)
      setCandidates([])
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const searchCandidates = async (filters, page = 1, limit = resultsPerPage) => {
    setLoading(true)
    setError(null)
    if (page === 1) setCandidates([])
    setLastFilters(filters)
    setCurrentPage(page)

    try {
      const source = filters.source || 'github'
      setActiveSource(source)

      let endpoint = ''
      let params = {}

      if (source === 'google') {
        endpoint = '/api/google-resumes/search'
        params = {
          keywords: filters.keywords,
          location: filters.location,
          filetype: filters.filetype || 'pdf'
        }
      } else if (source === 'postjobfree') {
        endpoint = '/api/postjobfree/search'
        params = {
          keywords: filters.keywords,
          location: filters.location
        }
      } else if (source === 'npi') {
        endpoint = '/api/npi/search'
        params = {
          specialty: filters.specialty,
          state: filters.state,
          city: filters.city,
          lastName: filters.lastName,
          page: page,
          limit: limit
        }
      } else if (source === 'jobvertise') {
        endpoint = '/api/jobvertise/search'
        params = {
          keywords: filters.keywords,
          location: filters.location
        }
      } else if (source === 'jobspider') {
        endpoint = '/api/jobspider/search'
        params = {
          keywords: filters.keywords,
          location: filters.location,
          category: filters.category
        }
      } else if (source === 'github') {
        endpoint = '/api/github/search'
        params = {
          query: filters.keywords,
          location: filters.location,
          language: filters.skills,
          minRepos: filters.experience === 'senior' ? 20 : filters.experience === 'mid' ? 10 : 0
        }
      } else if (source === 'devto') {
        endpoint = '/api/devto/search'
        params = {
          query: filters.keywords || filters.skills,
          tag: filters.skills
        }
      }

      console.log('Searching with params:', params)
      const response = await axios.get(endpoint, { params })
      console.log('Response:', response.data)
      
      setCandidates(response.data.candidates)
      setTotalResults(response.data.total || 0)
      setTotalPages(response.data.totalPages || 1)

      // Store Google search URL for fallback
      if (response.data.googleSearchUrl) {
        setGoogleSearchUrl(response.data.googleSearchUrl)
      } else {
        setGoogleSearchUrl(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search candidates. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    console.log('Page change to:', newPage)
    if (lastFilters && newPage >= 1 && newPage <= totalPages) {
      searchCandidates(lastFilters, newPage, resultsPerPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleResultsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value)
    setResultsPerPage(newLimit)
    if (lastFilters) {
      searchCandidates(lastFilters, 1, newLimit)
    }
  }

  const viewCandidateDetails = async (candidate) => {
    setSelectedCandidate({ ...candidate, loading: true })

    try {
      if (candidate.source === 'google') {
        setSelectedCandidate({ ...candidate, loading: false })
      } else if (candidate.source === 'postjobfree') {
        const response = await axios.get(`/api/postjobfree/resume/${candidate.id}`)
        setSelectedCandidate({ ...candidate, ...response.data, loading: false })
      } else if (candidate.source === 'npi') {
        setSelectedCandidate({ ...candidate, loading: false })
      } else if (candidate.source === 'jobvertise') {
        const response = await axios.get(`/api/jobvertise/resume/${candidate.id}`, {
          params: { url: candidate.profileUrl }
        })
        setSelectedCandidate({ ...candidate, ...response.data, loading: false })
      } else if (candidate.source === 'jobspider') {
        const response = await axios.get(`/api/jobspider/resume/${candidate.id}`, {
          params: { url: candidate.profileUrl }
        })
        setSelectedCandidate({ ...candidate, ...response.data, loading: false })
      } else if (candidate.source === 'github') {
        const response = await axios.get(`/api/github/user/${candidate.username}/repos`)
        setSelectedCandidate({ ...candidate, ...response.data, loading: false })
      } else if (candidate.source === 'devto') {
        const response = await axios.get(`/api/devto/user/${candidate.username}/articles`)
        setSelectedCandidate({ ...candidate, ...response.data, loading: false })
      }
    } catch (err) {
      setSelectedCandidate({ ...candidate, loading: false })
    }
  }

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="app">
        <div className="loading" style={{ marginTop: '100px' }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  // Generate page numbers - show 10 pages centered around current page
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 10
    
    let start = Math.max(1, currentPage - 4)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  // Calculate display range
  const startResult = (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(startResult + candidates.length - 1, totalResults)

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <img src="/logo.png" alt="Enat Solution" />
          <div className="header-logo-text">
            <span className="header-company-name">enat solution</span>
            <span className="header-tagline">CONNECTING TALENT WITH CARE</span>
          </div>
        </div>
        <h1>Candidate Profile Search</h1>
        <p>Find talented professionals from GitHub, Dev.to and more</p>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <SearchForm onSearch={(filters) => searchCandidates(filters, 1, resultsPerPage)} loading={loading} />

      <div className="results-container">
        <div className="results-header">
          <h2>
            {loading ? 'Loading all candidates...' : `${totalResults} Candidates Found`}
          </h2>
          <span className="source-badge">Source: {activeSource.toUpperCase()}</span>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading all candidates from NPI Registry...</p>
            <p style={{fontSize: '0.9rem', color: '#64748b'}}>This may take a moment for large searches</p>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {/* No results with Google fallback link */}
        {!loading && !error && candidates.length === 0 && (
          <div className="no-results">
            <p>No candidates found. Try adjusting your search criteria.</p>
            {googleSearchUrl && activeSource === 'google' && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                  Click below to search directly on Google:
                </p>
                <a
                  href={googleSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-block', textDecoration: 'none' }}
                >
                  Search on Google
                </a>
              </div>
            )}
          </div>
        )}

        {!loading && candidates.length > 0 && (
          <>
            <div className="results-grid">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={`${candidate.source}-${candidate.id}`}
                  candidate={candidate}
                  onViewDetails={() => viewCandidateDetails(candidate)}
                />
              ))}
            </div>

            {/* Pagination - show for NPI */}
            {activeSource === 'npi' && totalPages > 0 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                  >
                    Last
                  </button>
                </div>

                <div className="pagination-footer">
                  <div className="results-per-page">
                    <label htmlFor="resultsPerPage">Results per page:</label>
                    <select 
                      id="resultsPerPage" 
                      value={resultsPerPage} 
                      onChange={handleResultsPerPageChange}
                      className="results-per-page-select"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="pagination-info">
                    <strong>Showing {startResult} - {endResult} of {totalResults} candidates</strong>
                    <span style={{marginLeft: '12px'}}>| Page {currentPage} of {totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

export default App
