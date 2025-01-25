import { 
  renderProjectCard, 
  renderErrorCard,
  renderLoadingState,
  renderLinkButton 
} from './render.js';

document.addEventListener('DOMContentLoaded', async () => {
  const username = 'gcuore';
  const projectsContainer = document.getElementById('projects-container');
  const loadMoreBtn = document.getElementById('load-more');
  const totalLikesElement = document.querySelector('#total-likes .stat-value');
  const totalViewsElement = document.querySelector('#total-views .stat-value');
  const toggleLinksBtn = document.getElementById('toggle-links');
  const toggleLikesBtn = document.getElementById('toggle-likes');
  const usernameElement = document.getElementById('username');

  usernameElement.textContent = `@${username}`;
  
  // Hardcoded stats
  totalLikesElement.textContent = '200'; 
  totalViewsElement.textContent = '1,000+';

  let nextCursor = null;
  let currentView = 'links';

  async function loadProjectItems(loader, cursor = null) {
    try {
      if (currentView === 'links') {
        // When in links view, load links section
        projectsContainer.innerHTML = '';
        
        // Create social link buttons
        const linkButtons = [
          {
            platform: 'Geometry Dash',
            icon: 'fas fa-gamepad',
            url: 'https://gcuore.github.io/geometry-dash'
          },
          {
            platform: 'Hotel Empire',
            icon: 'fas fa-hotel',
            url: 'https://gcuore.github.io/hotel-empire'
          },
          {
            platform: 'Spotify Web Player',
            icon: 'fab fa-spotify',
            url: 'https://open.spotify.com/user/gcuore'
          }
        ];

        linkButtons.forEach(button => {
          const linkButton = document.createElement('div');
          linkButton.innerHTML = renderLinkButton(button);
          projectsContainer.appendChild(linkButton);
        });

        loadMoreBtn.style.display = 'none';
        return null;
      }

      // Simulate API response with hardcoded data
      const mockData = {
        projects: {
          data: [
            // Add some mock project data here if needed
          ],
          meta: {
            end_cursor: null,
            has_next_page: false
          }
        }
      };
      
      const items = mockData.projects.data;
      
      if (!items || items.length === 0) {
        loadMoreBtn.style.display = 'none';
        projectsContainer.innerHTML = '<p>No items to display.</p>';
        return null;
      }

      // Clear loading state on first load
      projectsContainer.innerHTML = '';

      // You can add mock project rendering logic here if needed
      
      loadMoreBtn.style.display = 'none';

      return null;
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

    toggleLinksBtn.classList.toggle('active', view === 'links');
    toggleLikesBtn.classList.toggle('active', view === 'likes');

    if (view === 'links') {
      loadProjectItems(null);
    } else if (view === 'likes') {
      loadProjectItems(null);
    }
  }

  // Prevent zooming on input focus for mobile devices
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      });
      input.addEventListener('blur', () => {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
      });
    });

    // Adjust font sizes dynamically for mobile
    function adjustFontSizes() {
      const rootFontSize = window.innerWidth / 40; // Responsive base font size
      document.documentElement.style.fontSize = `${rootFontSize}px`;
    }

    // Initial adjustment
    adjustFontSizes();

    // Readjust on resize
    window.addEventListener('resize', adjustFontSizes);
  }

  // Initial load
  toggleView('links');

  // Load more button handler
  loadMoreBtn.addEventListener('click', () => {
    if (currentView === 'links') {
      loadProjectItems(null, nextCursor);
    } else if (currentView === 'likes') {
      loadProjectItems(null, nextCursor);
    }
  });

  toggleLinksBtn.addEventListener('click', () => toggleView('links'));
  toggleLikesBtn.addEventListener('click', () => toggleView('likes'));
});
