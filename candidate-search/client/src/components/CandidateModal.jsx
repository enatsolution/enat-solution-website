import './CandidateModal.css'

function CandidateModal({ candidate, onClose }) {
  if (!candidate) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <img src={candidate.avatar} alt={candidate.name} className="modal-avatar" />
          <div>
            <h2>{candidate.name}</h2>
            <p className="modal-username">@{candidate.username}</p>
            {candidate.location && <p className="modal-location">📍 {candidate.location}</p>}
          </div>
        </div>

        {candidate.bio && <p className="modal-bio">{candidate.bio}</p>}

        <div className="modal-section">
          <h3>📬 Contact Information</h3>
          <div className="contact-grid">
            {candidate.email && (
              <a href={`mailto:${candidate.email}`} className="contact-item">
                <span className="icon">✉️</span>
                <span>{candidate.email}</span>
              </a>
            )}
            {candidate.twitter && (
              <a href={`https://twitter.com/${candidate.twitter}`} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="icon">🐦</span>
                <span>@{candidate.twitter}</span>
              </a>
            )}
            {candidate.blog && (
              <a href={candidate.blog.startsWith('http') ? candidate.blog : `https://${candidate.blog}`} target="_blank" rel="noopener noreferrer" className="contact-item">
                <span className="icon">🌐</span>
                <span>Website</span>
              </a>
            )}
            <a href={candidate.profileUrl} target="_blank" rel="noopener noreferrer" className="contact-item">
              <span className="icon">{candidate.source === 'github' ? '🐙' : '📝'}</span>
              <span>View Full Profile</span>
            </a>
          </div>
        </div>

        {candidate.loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading details...</p>
          </div>
        ) : (
          <>
            {candidate.languages && candidate.languages.length > 0 && (
              <div className="modal-section">
                <h3>💻 Skills & Languages</h3>
                <div className="tags">
                  {candidate.languages.map(lang => (
                    <span key={lang} className="tag">{lang}</span>
                  ))}
                </div>
              </div>
            )}

            {candidate.expertise && candidate.expertise.length > 0 && (
              <div className="modal-section">
                <h3>🎯 Expertise Areas</h3>
                <div className="tags">
                  {candidate.expertise.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {candidate.repos && candidate.repos.length > 0 && (
              <div className="modal-section">
                <h3>📦 Recent Projects</h3>
                <div className="projects-list">
                  {candidate.repos.map(repo => (
                    <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" className="project-item">
                      <div className="project-name">{repo.name}</div>
                      {repo.description && <div className="project-desc">{repo.description}</div>}
                      <div className="project-meta">
                        {repo.language && <span className="lang">{repo.language}</span>}
                        <span>⭐ {repo.stars}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {candidate.articles && candidate.articles.length > 0 && (
              <div className="modal-section">
                <h3>📝 Recent Articles</h3>
                <div className="projects-list">
                  {candidate.articles.map(article => (
                    <a key={article.title} href={article.url} target="_blank" rel="noopener noreferrer" className="project-item">
                      <div className="project-name">{article.title}</div>
                      <div className="project-meta">
                        <span>❤️ {article.reactions}</span>
                        {article.tags && article.tags.slice(0,3).map(tag => (
                          <span key={tag} className="tag-small">{tag}</span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CandidateModal

