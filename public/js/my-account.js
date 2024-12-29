const baseUrl = 'http://localhost:3000';

async function checkAuth() {
  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    const userData = await response.json();
    document.getElementById('user-name').textContent = userData.user.username;
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/';
    return false;
  }
}

function getUserFavorites() {
  const favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  return userId ? (favorites[userId] || []) : [];
}

function loadFavorites() {
  const favoritesList = document.getElementById('favorites-list');
  if (!favoritesList) return;

  const favorites = getUserFavorites();

  if (favorites.length === 0) {
      favoritesList.innerHTML = '<p>Anda belum memiliki cafe favorit.</p>';
      return;
  }

  favoritesList.innerHTML = favorites.map(cafe => `
      <div class="favorite-item">
          <img src="${cafe.image}" alt="${cafe.name}" class="favorite-image">
          <div class="favorite-details">
              <h3>${cafe.name}</h3>
              <p>${cafe.description}</p>
              <div class="favorite-rating">
                  ${Array(Math.round(cafe.rating))
                      .fill('<i data-feather="star" class="star-full"></i>')
                      .join('')}
              </div>
              <button onclick="removeFavorite(${cafe.id})" class="remove-btn">
                  Hapus dari Favorit
              </button>
          </div>
      </div>
  `).join('');

  feather.replace();
}

function saveUserFavorites(favorites) {
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  if (!userId) return;

  const allFavorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
  allFavorites[userId] = favorites;
  localStorage.setItem('userFavorites', JSON.stringify(allFavorites));
}

function removeFavorite(cafeId) {
  const favorites = getUserFavorites();
  const updatedFavorites = favorites.filter(cafe => cafe.id !== cafeId);

  saveUserFavorites(updatedFavorites);

  const cafeElement = document.querySelector(`.favorite-item button[onclick="removeFavorite(${cafeId})"]`).closest('.favorite-item');
  if (cafeElement) {
    cafeElement.remove();
  }

  showNotification('Berhasil menghapus dari favorit!');

  if (updatedFavorites.length === 0) {
    const favoritesList = document.getElementById('favorites-list');
    if (favoritesList) {
      favoritesList.innerHTML = '<p>Anda belum memiliki cafe favorit.</p>';
    }
  }
}

document.getElementById('logout').addEventListener('click', (e) => {
  e.preventDefault();
  fetch(`${baseUrl}/api/logout`, { method: 'POST', credentials: 'include' })
    .then(() => {
      localStorage.removeItem('user');
      window.location.href = "login.html";
    })
    .catch(err => console.error("Logout error:", err));
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('favorites-list')) {
      loadFavorites();
  }
});
window.addEventListener('load', checkAuth);
