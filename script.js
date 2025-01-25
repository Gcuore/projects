document.addEventListener('DOMContentLoaded', async () => {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // FAQ Collapse functionality
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't toggle if clicking a link
      if (e.target.tagName === 'A') {
        return;
      }

      const isCollapsed = item.classList.contains('collapsed');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.add('collapsed');
        }
      });

      // Toggle current item
      item.classList.toggle('collapsed');
    });
  });

  // Prevent links from triggering FAQ collapse
  const faqLinks = document.querySelectorAll('.faq-content a');
  faqLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Cosmic Particles Background
  function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
    particle.style.opacity = Math.random();
    document.querySelector('.cosmic-background').appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 5000);
  }

  setInterval(createParticle, 200);

  const projectsContainer = document.getElementById('projects-container');
  const loadMoreBtn = document.getElementById('load-more');
  const totalLikesElement = document.querySelector('#total-likes .stat-value');
  const totalViewsElement = document.querySelector('#total-views .stat-value');
  const toggleProjectsBtn = document.getElementById('toggle-projects');
  const toggleLikesBtn = document.getElementById('toggle-likes');

  let nextCursor = null;
  let currentView = 'projects'; // Default to projects

  // Fetch user stats
  try {
    const statsResponse = await fetch('/api/v1/users/websim/stats');
    const statsData = await statsResponse.json();

    totalLikesElement.textContent = statsData.stats.total_likes.toLocaleString();
    totalViewsElement.textContent = statsData.stats.total_views.toLocaleString();
  } catch (error) {
    console.error('Error fetching user stats:', error);
  }

  async function loadProjects(cursor = null) {
    try {
      const params = new URLSearchParams({
        first: 12,
        posted: true
      });

      if (cursor) {
        params.append('after', cursor);
      }

      const response = await fetch(`/api/v1/users/websim/projects?${params}`);
      const data = await response.json();

      if (data.projects.data.length === 0) {
        loadMoreBtn.style.display = 'none';
        return;
      }

      // Clear loading state on first load
      if (!cursor) {
        projectsContainer.innerHTML = '';
      }

      for (const item of data.projects.data) {
        const { project, site } = item;
        const projectId = project.id;

        try {
          const projectDetailsResponse = await fetch(`/api/v1/projects/${projectId}`);
          const projectDetailsData = await projectDetailsResponse.json();
          const updatedProject = projectDetailsData.project;
          const projectRevision = projectDetailsData.project_revision;

          const card = document.createElement('div');
          card.className = 'project-card';

          const projectUrl = site ?
            `https://websim.ai/c/${site.id}` :
            `https://websim.ai/p/${project.id}`;

          // Use site.id for the image URL if available, otherwise use a placeholder
          const imageUrl = site ?
            `https://images.websim.ai/v1/site/${site.id}/600` :
            'https://images.websim.ai/placeholder.png'; // Fallback image

          const lastUpdated = new Date(updatedProject.updated_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const author = updatedProject.created_by;

          card.innerHTML = `
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
                <p class="project-description">${updatedProject.description || 'No description provided.'}</p>
                <div class="project-meta">
                  <span class="project-date">Last Updated: ${lastUpdated}</span>
                </div>
              </div>
            </a>
          `;

          projectsContainer.appendChild(card);
        } catch (error) {
          console.error('Error fetching project details:', error);
          // Display a fallback card if fetching details fails
          const card = document.createElement('div');
          card.className = 'project-card error-card';
          card.innerHTML = `
            <div class="project-info">
              <h2 class="project-title">Error loading project</h2>
              <p>Failed to load details for ${project.title || 'this project'}.</p>
            </div>
          `;
          projectsContainer.appendChild(card);
        }
      }

      // Update next cursor and show/hide load more button
      nextCursor = data.projects.meta.end_cursor;
      loadMoreBtn.style.display = data.projects.meta.has_next_page ? 'block' : 'none';
    } catch (error) {
      console.error('Error loading projects:', error);
      projectsContainer.innerHTML = `
        <div class="error">
          Failed to load projects. Please try again later.
        </div>
      `;
    }
  }

  async function loadLikes(cursor = null) {
    try {
      const params = new URLSearchParams({
        first: 12,
      });

      if (cursor) {
        params.append('after', cursor);
      }

      const response = await fetch(`/api/v1/user/likes?${params}`);
      const data = await response.json();

      if (data.likes.data.length === 0) {
        loadMoreBtn.style.display = 'none';
        projectsContainer.innerHTML = '<p>No liked projects yet.</p>';
        return;
      }

      // Clear loading state on first load
      if (!cursor) {
        projectsContainer.innerHTML = '';
      }

      for (const item of data.likes.data) {
        const { project, site } = item;
        const projectId = project.id;

        try {
          const projectDetailsResponse = await fetch(`/api/v1/projects/${projectId}`);
          const projectDetailsData = await projectDetailsResponse.json();
          const updatedProject = projectDetailsData.project;
          const projectRevision = projectDetailsData.project_revision;
          const card = document.createElement('div');
          card.className = 'project-card';

          const projectUrl = site ?
            `https://websim.ai/c/${site.id}` :
            `https://websim.ai/p/${project.id}`;

          // Use site.id for the image URL if available, otherwise use a placeholder
          const imageUrl = site ?
            `https://images.websim.ai/v1/site/${site.id}/600` :
            'https://images.websim.ai/placeholder.png'; // Fallback image
          const lastUpdated = new Date(updatedProject.updated_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const author = updatedProject.created_by;

          card.innerHTML = `
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
                <p class="project-description">${updatedProject.description || 'No description provided.'}</p>
                <div class="project-meta">
                  <span class="project-date">Last Updated: ${lastUpdated}</span>
                </div>
              </div>
            </a>
          `;

          projectsContainer.appendChild(card);
        } catch (error) {
          console.error('Error fetching project details:', error);
          // Display a fallback card if fetching details fails
          const card = document.createElement('div');
          card.className = 'project-card error-card';
          card.innerHTML = `
            <div class="project-info">
              <h2 class="project-title">Error loading project</h2>
              <p>Failed to load details for ${project.title || 'this project'}.</p>
            </div>
          `;
          projectsContainer.appendChild(card);
        }
      }

      // Update next cursor and show/hide load more button
      nextCursor = data.likes.meta.end_cursor;
      loadMoreBtn.style.display = data.likes.meta.has_next_page ? 'block' : 'none';
    } catch (error) {
      console.error('Error loading likes:', error);
      projectsContainer.innerHTML = `
        <div class="error">
          Failed to load likes. Please try again later.
        </div>
      `;
    }
  }

  function toggleView(view) {
    currentView = view;
    nextCursor = null; // Reset cursor
    projectsContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading...</p></div>'; // Show loading

    toggleProjectsBtn.classList.toggle('active', view === 'projects');
    toggleLikesBtn.classList.toggle('active', view === 'likes');

    if (view === 'projects') {
      loadProjects();
    } else if (view === 'likes') {
      loadLikes();
    }
  }

  // Initial load
  toggleView('projects');

  // Load more button handler
  loadMoreBtn.addEventListener('click', () => {
    if (currentView === 'projects') {
      loadProjects(nextCursor);
    } else if (currentView === 'likes') {
      loadLikes(nextCursor);
    }
  });

  toggleProjectsBtn.addEventListener('click', () => toggleView('projects'));
  toggleLikesBtn.addEventListener('click', () => toggleView('likes'));
});
