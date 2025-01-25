import { 
  fetchUserStats, 
  fetchProjects, 
  fetchProjectDetails,
  fetchLikes 
} from './api.js';
import { 
  renderProjectCard, 
  renderErrorCard,
  renderLoadingState 
} from './render.js';

document.addEventListener('DOMContentLoaded', async () => {
  const projectsContainer = document.getElementById('projects-container');
  const loadMoreBtn = document.getElementById('load-more');
  const totalLikesElement = document.querySelector('#total-likes .stat-value');
  const totalViewsElement = document.querySelector('#total-views .stat-value');
  const toggleProjectsBtn = document.getElementById('toggle-projects');
  const toggleLikesBtn = document.getElementById('toggle-likes');

  let nextCursor = null;
  let currentView = 'projects';

  // Fetch and display user stats
  try {
    const statsData = await fetchUserStats();
    totalLikesElement.textContent = statsData.stats.total_likes.toLocaleString();
    totalViewsElement.textContent = statsData.stats.total_views.toLocaleString();
  } catch (error) {
    console.error('Error updating user stats:', error);
  }

  async function loadProjectItems(loader, cursor = null) {
    try {
      const data = await loader(cursor);
      const items = data.projects?.data || data.likes?.data;
      
      if (!items || items.length === 0) {
        loadMoreBtn.style.display = 'none';
        projectsContainer.innerHTML = '<p>No items to display.</p>';
        return null;
      }

      // Clear loading state on first load
      if (!cursor) {
        projectsContainer.innerHTML = '';
      }

      for (const item of items) {
        const { project, site } = item;
        
        try {
          const projectDetailsData = await fetchProjectDetails(project.id);
          
          if (projectDetailsData) {
            const updatedProject = projectDetailsData.project;
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = renderProjectCard(updatedProject, site);
            projectsContainer.appendChild(card);
          } else {
            const card = document.createElement('div');
            card.className = 'project-card error-card';
            card.innerHTML = renderErrorCard(project.title);
            projectsContainer.appendChild(card);
          }
        } catch (error) {
          console.error('Error processing project:', error);
        }
      }

      // Update next cursor and show/hide load more button
      nextCursor = data.projects?.meta?.end_cursor || data.likes?.meta?.end_cursor;
      loadMoreBtn.style.display = 
        (data.projects?.meta?.has_next_page || data.likes?.meta?.has_next_page) 
          ? 'block' : 'none';

      return nextCursor;
    } catch (error) {
      console.error('Error loading items:', error);
      projectsContainer.innerHTML = `
        <div class="error">
          Failed to load items. Please try again later.
        </div>
      `;
      return null;
    }
  }

  function toggleView(view) {
    currentView = view;
    nextCursor = null; // Reset cursor
    projectsContainer.innerHTML = renderLoadingState(); // Show loading

    toggleProjectsBtn.classList.toggle('active', view === 'projects');
    toggleLikesBtn.classList.toggle('active', view === 'likes');

    if (view === 'projects') {
      loadProjectItems(fetchProjects);
    } else if (view === 'likes') {
      loadProjectItems(fetchLikes);
    }
  }

  // Initial load
  toggleView('projects');

  // Load more button handler
  loadMoreBtn.addEventListener('click', () => {
    if (currentView === 'projects') {
      loadProjectItems(fetchProjects, nextCursor);
    } else if (currentView === 'likes') {
      loadProjectItems(fetchLikes, nextCursor);
    }
  });

  toggleProjectsBtn.addEventListener('click', () => toggleView('projects'));
  toggleLikesBtn.addEventListener('click', () => toggleView('likes'));
});
