export function renderProjectCard(project, site) {
  const projectUrl = site ?
    `https://websim.ai/c/${site.id}` :
    `https://websim.ai/p/${project.id}`;

  // Use site.id for the image URL if available, otherwise use a placeholder
  const imageUrl = site ?
    `https://images.websim.ai/v1/site/${site.id}/600` :
    'https://images.websim.ai/placeholder.png'; // Fallback image

  const lastUpdated = new Date(project.updated_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const author = project.created_by;

  return `
    <a href="${projectUrl}" target="_blank" style="display: flex; align-items: stretch; text-decoration: none;">
      <div class="project-thumbnail-container">
        <img
          src="${imageUrl}"
          alt="${project.title || 'Untitled project'}"
          class="project-image"
          loading="lazy"
        />
      </div>
      <div class="project-info">
        <h2 class="project-title">${project.title || 'Untitled project'}</h2>
        <h3 class="project-author">@${author.username}</h3>
        <p class="project-description">${project.description || 'No description provided.'}</p>
        <div class="project-meta">
          <span class="project-date">Last Updated: ${lastUpdated}</span>
        </div>
      </div>
    </a>
  `;
}

export function renderErrorCard(projectTitle) {
  return `
    <div class="project-info">
      <h2 class="project-title">Error loading project</h2>
      <p>Failed to load details for ${projectTitle || 'this project'}.</p>
    </div>
  `;
}

export function renderLoadingState() {
  return `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  `;
}

export function renderLinkButton(button) {
  return `
    <a href="${button.url}" target="_blank" class="social-link-button">
      <div class="social-link-card">
        <i class="${button.icon} social-link-icon"></i>
        <span class="social-link-text">${button.platform}</span>
      </div>
    </a>
  `;
}
