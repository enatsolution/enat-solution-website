import { useState } from 'react'

const PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'React', 'Vue', 'Angular', 'Node.js'
]

// Industry categories for JobSpider
const INDUSTRY_CATEGORIES = [
  { id: 'it', name: 'Information Technology' },
  { id: 'software', name: 'Software/Programming' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'medical', name: 'Medical/Health' },
  { id: 'nursing', name: 'Nursing' },
  { id: 'management', name: 'Management' },
  { id: 'executive', name: 'Executive' },
  { id: 'business', name: 'Business/Management' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'finance', name: 'Finance/Investment' },
  { id: 'accounting', name: 'Accounting' },
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'admin', name: 'Administrative/Receptionist' },
  { id: 'customer_service', name: 'Customer Service' },
  { id: 'engineering', name: 'Engineering' }
]

// Healthcare specialties for NPI Registry
const HEALTHCARE_SPECIALTIES = [
  { id: '', name: 'All Specialties' },
  { id: 'Nurse', name: 'Nurse (RN, LPN, NP)' },
  { id: 'Physician', name: 'Physician (MD, DO)' },
  { id: 'Nurse Practitioner', name: 'Nurse Practitioner' },
  { id: 'Registered Nurse', name: 'Registered Nurse' },
  { id: 'Physical Therapist', name: 'Physical Therapist' },
  { id: 'Pharmacist', name: 'Pharmacist' },
  { id: 'Dentist', name: 'Dentist' },
  { id: 'Psychologist', name: 'Psychologist' },
  { id: 'Social Worker', name: 'Social Worker' },
  { id: 'Occupational Therapist', name: 'Occupational Therapist' },
  { id: 'Speech Therapist', name: 'Speech-Language Pathologist' },
  { id: 'Chiropractor', name: 'Chiropractor' },
  { id: 'Optometrist', name: 'Optometrist' },
  { id: 'Podiatrist', name: 'Podiatrist' },
  { id: 'Physician Assistant', name: 'Physician Assistant' },
  { id: 'Emergency Medicine', name: 'Emergency Medicine' },
  { id: 'Family Medicine', name: 'Family Medicine' },
  { id: 'Internal Medicine', name: 'Internal Medicine' },
  { id: 'Pediatrics', name: 'Pediatrics' },
  { id: 'Cardiology', name: 'Cardiology' },
  { id: 'Orthopedic', name: 'Orthopedic' },
  { id: 'Dermatology', name: 'Dermatology' },
  { id: 'Psychiatry', name: 'Psychiatry' },
  { id: 'Radiology', name: 'Radiology' },
  { id: 'Anesthesiology', name: 'Anesthesiology' },
  { id: 'Surgery', name: 'Surgery' }
]

// US States for NPI search
const US_STATES = [
  { code: '', name: 'All States' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington DC' }
]

function SearchForm({ onSearch, loading }) {
  const [filters, setFilters] = useState({
    source: 'npi',
    keywords: '',
    location: '',
    skills: '',
    experience: '',
    category: '',
    filetype: 'pdf',
    // NPI-specific fields
    specialty: '',
    state: '',
    city: '',
    lastName: ''
  })
  const [jobvertiseCookies, setJobvertiseCookies] = useState('')
  const [showCookieSetup, setShowCookieSetup] = useState(false)
  const [cookieStatus, setCookieStatus] = useState('')

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      source: filters.source, // Keep current source
      keywords: '',
      location: '',
      skills: '',
      experience: '',
      category: '',
      filetype: 'pdf',
      specialty: '',
      state: '',
      city: '',
      lastName: ''
    })
  }

  const handleSetCookies = async () => {
    try {
      setCookieStatus('Saving...')
      const response = await fetch('/api/jobvertise/set-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: jobvertiseCookies })
      })
      const data = await response.json()
      if (data.success) {
        setCookieStatus('✅ Cookies saved! You can now search.')
        setShowCookieSetup(false)
      } else {
        setCookieStatus('❌ ' + (data.error || 'Failed'))
      }
    } catch (err) {
      setCookieStatus('❌ Error: ' + err.message)
    }
  }

  return (
    <div className="search-container">
      <div className="source-tabs">
        <button
          className={`source-tab ${filters.source === 'google' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'google' })}
        >
          🔍 Google X-Ray
        </button>
        <button
          className={`source-tab ${filters.source === 'npi' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'npi' })}
        >
          🏥 NPI Registry
        </button>
        <button
          className={`source-tab ${filters.source === 'postjobfree' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'postjobfree' })}
        >
          📄 PostJobFree
        </button>
        <button
          className={`source-tab ${filters.source === 'jobvertise' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'jobvertise' })}
        >
          💼 Jobvertise
        </button>
        <button
          className={`source-tab ${filters.source === 'jobspider' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'jobspider' })}
        >
          🕷️ JobSpider
        </button>
        <button
          className={`source-tab ${filters.source === 'github' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'github' })}
        >
          🐙 GitHub
        </button>
        <button
          className={`source-tab ${filters.source === 'devto' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, source: 'devto' })}
        >
          📝 Dev.to
        </button>
      </div>

      {/* Jobvertise Cookie Setup */}
      {filters.source === 'jobvertise' && (
        <div className="cookie-setup" style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '1px solid #ffc107'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
            ⚠️ Jobvertise requires manual login
          </p>
          <button
            type="button"
            onClick={() => setShowCookieSetup(!showCookieSetup)}
            style={{ background: '#ffc107', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showCookieSetup ? 'Hide Setup' : '🔧 Setup Cookies'}
          </button>

          {showCookieSetup && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}>
                1. Open <a href="https://www.jobvertise.com/employers/login" target="_blank" rel="noreferrer">Jobvertise Login</a> in a new tab<br/>
                2. Login with: <code>enatsolution / P@ssw0rd</code><br/>
                3. Press F12 → Application → Cookies → jobvertise.com<br/>
                4. Copy all cookie name=value pairs (e.g., PHPSESSID=xxx; memberid=xxx)<br/>
                5. Paste below:
              </p>
              <textarea
                value={jobvertiseCookies}
                onChange={(e) => setJobvertiseCookies(e.target.value)}
                placeholder="PHPSESSID=abc123; memberid=enatsolution; ..."
                style={{ width: '100%', height: '60px', marginBottom: '10px' }}
              />
              <button
                type="button"
                onClick={handleSetCookies}
                style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Save Cookies
              </button>
              {cookieStatus && <span style={{ marginLeft: '10px' }}>{cookieStatus}</span>}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="search-form">
        {/* NPI-specific fields */}
        {filters.source === 'npi' && (
          <>
            <div className="form-group">
              <label>Healthcare Specialty</label>
              <select name="specialty" value={filters.specialty || ''} onChange={handleChange}>
                {HEALTHCARE_SPECIALTIES.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>State</label>
              <select name="state" value={filters.state || ''} onChange={handleChange}>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>City (Optional)</label>
              <input
                type="text"
                name="city"
                placeholder="e.g., Los Angeles, Houston"
                value={filters.city || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name (Optional)</label>
              <input
                type="text"
                name="lastName"
                placeholder="Search by last name"
                value={filters.lastName || ''}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Non-NPI fields */}
        {filters.source !== 'npi' && (
          <>
            <div className="form-group">
              <label>Keywords / Job Title</label>
              <input
                type="text"
                name="keywords"
                placeholder="e.g., Nurse, Project Manager, Software Developer"
                value={filters.keywords}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Location (State)</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., California, TX, New York"
                value={filters.location}
                onChange={handleChange}
              />
            </div>

            {/* File Type - shown for Google */}
            {filters.source === 'google' && (
              <div className="form-group">
                <label>File Type</label>
                <select name="filetype" value={filters.filetype} onChange={handleChange}>
                  <option value="pdf">PDF Documents</option>
                  <option value="doc">Word Documents (.doc)</option>
                  <option value="docx">Word Documents (.docx)</option>
                  <option value="">Any Format</option>
                </select>
              </div>
            )}

            {/* Industry Category - shown for JobSpider */}
            {filters.source === 'jobspider' && (
              <div className="form-group">
                <label>Industry / Category</label>
                <select name="category" value={filters.category} onChange={handleChange}>
                  <option value="">All Industries</option>
                  {INDUSTRY_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Skills - shown for GitHub/DevTo */}
            {(filters.source === 'github' || filters.source === 'devto') && (
              <div className="form-group">
                <label>Skills / Programming Language</label>
                <select name="skills" value={filters.skills} onChange={handleChange}>
                  <option value="">All Skills</option>
                  {PROGRAMMING_LANGUAGES.map(lang => (
                    <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Experience Level</label>
              <select name="experience" value={filters.experience} onChange={handleChange}>
                <option value="">Any Experience</option>
                <option value="junior">Junior (0-2 years)</option>
                <option value="mid">Mid-Level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>
          </>
        )}
      </form>

      <div className="search-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Searching...' : '🔍 Search Candidates'}
        </button>
        <button className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default SearchForm

