import './CandidateCard.css'

function CandidateCard({ candidate, onViewDetails }) {
  const getSourceIcon = () => {
    switch(candidate.source) {
      case 'github': return '🐙'
      case 'devto': return '📝'
      case 'jobspider': return '🕷️'
      case 'jobvertise': return '💼'
      case 'postjobfree': return '📄'
      case 'google': return '🔍'
      case 'npi': return '🏥'
      default: return '👤'
    }
  }

  // Generate initials for JobSpider candidates without avatar
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="candidate-card">
      <div className="card-header">
        {candidate.avatar ? (
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="avatar"
          />
        ) : (
          <div className="avatar avatar-initials">
            {getInitials(candidate.name)}
          </div>
        )}
        <div className="card-title">
          <h3>{candidate.name}</h3>
          {candidate.username && <span className="username">@{candidate.username}</span>}
          {candidate.title && candidate.source !== 'google' && (candidate.source === 'jobspider' || candidate.source === 'postjobfree') && (
            <span className="job-title">{candidate.title}</span>
          )}
          <span className="source-icon">{getSourceIcon()}</span>
        </div>
      </div>

      {candidate.bio && (
        <p className="bio">{candidate.bio.slice(0, 120)}{candidate.bio.length > 120 ? '...' : ''}</p>
      )}

      {candidate.objective && (
        <p className="objective">{candidate.objective.slice(0, 150)}{candidate.objective.length > 150 ? '...' : ''}</p>
      )}

      {candidate.experience && (
        <p className="experience">{candidate.experience.slice(0, 200)}{candidate.experience.length > 200 ? '...' : ''}</p>
      )}

      <div className="card-details">
        {/* NPI-specific fields */}
        {candidate.source === 'npi' && (
          <>
            {candidate.specialty && (
              <span className="detail specialty">🩺 {candidate.specialty}</span>
            )}
            {candidate.credential && (
              <span className="detail credential">🎓 {candidate.credential}</span>
            )}
            {candidate.npiNumber && (
              <span className="detail npi-number">🆔 NPI: {candidate.npiNumber}</span>
            )}
            {candidate.gender && (
              <span className="detail">👤 {candidate.gender}</span>
            )}
          </>
        )}

        {candidate.location && (
          <span className="detail">📍 {candidate.location}</span>
        )}
        {candidate.industry && (
          <span className="detail">🏭 {candidate.industry}</span>
        )}
        {candidate.jobLevel && (
          <span className="detail">📊 {candidate.jobLevel}</span>
        )}
        {candidate.positionType && (
          <span className="detail">💼 {candidate.positionType}</span>
        )}
        {candidate.degree && candidate.source !== 'npi' && (
          <span className="detail">🎓 {candidate.degree}</span>
        )}
        {candidate.company && (
          <span className="detail">🏢 {candidate.company}</span>
        )}
        {candidate.publicRepos && (
          <span className="detail">📦 {candidate.publicRepos} repos</span>
        )}
        {candidate.followers && (
          <span className="detail">👥 {candidate.followers} followers</span>
        )}
        {candidate.postedDate && (
          <span className="detail">📅 Posted: {candidate.postedDate}</span>
        )}
        {candidate.date && (
          <span className="detail">📅 {candidate.date}</span>
        )}
        {candidate.fileType && (
          <span className="detail">📁 {candidate.fileType.toUpperCase()}</span>
        )}
      </div>

      <div className="contact-info">
        {candidate.phone && (
          <a href={`tel:${candidate.phone.replace(/\D/g, '')}`} className="contact-link phone">
            📞 {candidate.phone}
          </a>
        )}
        {candidate.fax && (
          <span className="contact-link fax">
            📠 Fax: {candidate.fax}
          </span>
        )}
        {candidate.email && (
          <a href={`mailto:${candidate.email}`} className="contact-link email">
            ✉️ {candidate.email}
          </a>
        )}
        {candidate.fullAddress && candidate.source === 'npi' && (
          <span className="contact-link address">
            🏢 {candidate.fullAddress.split('\n').join(', ')}
          </span>
        )}
        {candidate.twitter && (
          <a href={`https://twitter.com/${candidate.twitter}`} target="_blank" rel="noopener noreferrer" className="contact-link">
            🐦 @{candidate.twitter}
          </a>
        )}
        {candidate.blog && (
          <a href={candidate.blog.startsWith('http') ? candidate.blog : `https://${candidate.blog}`} target="_blank" rel="noopener noreferrer" className="contact-link">
            🌐 Website
          </a>
        )}
        {candidate.github && (
          <a href={`https://github.com/${candidate.github}`} target="_blank" rel="noopener noreferrer" className="contact-link">
            🐙 GitHub
          </a>
        )}
      </div>

      {!candidate.email && !candidate.phone && candidate.source === 'jobspider' && (
        <p className="contact-note">💡 Click "View Profile" to contact this candidate on JobSpider</p>
      )}

      {candidate.hireable && (
        <span className="hireable-badge">✅ Open to opportunities</span>
      )}

      <div className="card-actions">
        <a 
          href={candidate.profileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-card btn-view-profile"
        >
          View Profile
        </a>
        <button onClick={onViewDetails} className="btn-card btn-details">
          More Details
        </button>
      </div>
    </div>
  )
}

export default CandidateCard

