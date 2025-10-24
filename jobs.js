// Jobs Management System
let allJobs = [];
let selectedJob = null;

// Load jobs from JSON
async function loadJobs() {
    try {
        // Try multiple paths to handle both local and deployed versions
        let response;
        try {
            response = await fetch('./jobs.json');
        } catch (e) {
            response = await fetch('/jobs.json');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allJobs = data.jobs.filter(job => job.status === 'active');
        displayJobs();
    } catch (error) {
        console.error('Error loading jobs:', error);
        const container = document.getElementById('jobs-container');
        if (container) {
            container.innerHTML = '<p class="no-jobs">Error loading jobs. Please try again later.</p>';
        }
    }
}

// Display all jobs in grid
function displayJobs() {
    const container = document.getElementById('jobs-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (allJobs.length === 0) {
        container.innerHTML = '<p class="no-jobs">No jobs available at this time.</p>';
        return;
    }

    allJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card-item';
        jobCard.innerHTML = `
            <div class="job-card-header">
                <h3>${job.title}</h3>
                <span class="job-type-badge ${job.type.toLowerCase()}">${job.type}</span>
            </div>
            <div class="job-card-body">
                <p class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                <p class="job-employment"><i class="fas fa-briefcase"></i> ${job.employmentType}</p>
                <p class="job-description">${job.shortDescription}</p>
            </div>
            <div class="job-card-footer">
                <button class="btn btn-primary btn-sm" onclick="viewJobDetails(${job.id})">View Details</button>
            </div>
        `;
        container.appendChild(jobCard);
    });
}

// View job details
function viewJobDetails(jobId) {
    selectedJob = allJobs.find(job => job.id === jobId);
    if (!selectedJob) return;

    const modal = document.getElementById('job-detail-modal');
    const detailContent = document.getElementById('job-detail-content');

    detailContent.innerHTML = `
        <div class="job-detail-header">
            <h2>${selectedJob.title}</h2>
            <span class="job-type-badge ${selectedJob.type.toLowerCase()}">${selectedJob.type}</span>
        </div>

        <div class="job-detail-info">
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${selectedJob.location}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-briefcase"></i>
                <span>${selectedJob.employmentType}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>Posted: ${new Date(selectedJob.postedDate).toLocaleDateString()}</span>
            </div>
        </div>

        <div class="job-detail-section">
            <h3>About the Role</h3>
            <p>${selectedJob.fullDescription}</p>
        </div>

        <div class="job-detail-section">
            <h3>Key Responsibilities</h3>
            <ul>
                ${selectedJob.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        </div>

        <div class="job-detail-section">
            <h3>Qualifications</h3>
            <ul>
                ${selectedJob.qualifications.map(qual => `<li>${qual}</li>`).join('')}
            </ul>
        </div>

        <div class="job-detail-section">
            <h3>Benefits</h3>
            <ul>
                ${selectedJob.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
        </div>

        <div class="job-detail-section">
            <h3>About Us</h3>
            <p>${selectedJob.aboutCompany}</p>
        </div>

        <div class="job-detail-actions">
            <a href="candidate-submission.html" class="btn btn-primary">Apply Now</a>
            <button class="btn btn-secondary" onclick="closeJobDetail()">Back to Jobs</button>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close job detail modal
function closeJobDetail() {
    const modal = document.getElementById('job-detail-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    selectedJob = null;
}

// Filter jobs by type
function filterJobs(type) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (type === 'all') {
        displayJobs();
    } else {
        const filtered = allJobs.filter(job => job.type.toLowerCase() === type.toLowerCase());
        const container = document.getElementById('jobs-container');
        container.innerHTML = '';
        
        if (filtered.length === 0) {
            container.innerHTML = '<p class="no-jobs">No jobs found in this category.</p>';
            return;
        }

        filtered.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card-item';
            jobCard.innerHTML = `
                <div class="job-card-header">
                    <h3>${job.title}</h3>
                    <span class="job-type-badge ${job.type.toLowerCase()}">${job.type}</span>
                </div>
                <div class="job-card-body">
                    <p class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                    <p class="job-employment"><i class="fas fa-briefcase"></i> ${job.employmentType}</p>
                    <p class="job-description">${job.shortDescription}</p>
                </div>
                <div class="job-card-footer">
                    <button class="btn btn-primary btn-sm" onclick="viewJobDetails(${job.id})">View Details</button>
                </div>
            `;
            container.appendChild(jobCard);
        });
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('job-detail-modal');
    if (event.target === modal) {
        closeJobDetail();
    }
});

// Load jobs when page loads
document.addEventListener('DOMContentLoaded', loadJobs);

