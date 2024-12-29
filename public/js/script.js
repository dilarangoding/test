const baseUrl = 'http://localhost:3000';

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const [key, value] = cookies[i].split('=');
    if (key === name) return value;
  }
  return null;
}

function getUserFavorites() {
  const favorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  return userId ? (favorites[userId] || []) : [];
}

function saveUserFavorites(favorites) {
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  if (!userId) return;

  const allFavorites = JSON.parse(localStorage.getItem('userFavorites')) || {};
  allFavorites[userId] = favorites;
  localStorage.setItem('userFavorites', JSON.stringify(allFavorites));
}

function addToFavorites(cafe) {
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  if (!userId) {
      window.location.href = '/login';
      return;
  }

  const favorites = getUserFavorites();

  if (favorites.some(fav => fav.id === cafe.id)) {
      showNotification('Cafe sudah ada di daftar favorit!', true);
      return;
  }

  // Add to favorites
  favorites.push(cafe);
  saveUserFavorites(favorites);
  showNotification('Berhasil menambahkan ke favorit!');

  // Update heart icon
  const heartIcon = document.querySelector(`[data-cafe-id="${cafe.id}"] .heart-icon`);
  if (heartIcon) {
      heartIcon.style.fill = '#b6895b';
  }
}

function removeFavorite(cafeId) {
  const favorites = getUserFavorites();
  const updatedFavorites = favorites.filter(cafe => cafe.id !== cafeId);
  saveUserFavorites(updatedFavorites);
  showNotification('Berhasil menghapus dari favorit!');
  loadFavorites();
}

function isFavorite(cafeId) {
  const favorites = getUserFavorites();
  return favorites.some(cafe => cafe.id === cafeId);
}

async function checkLoginStatus() {
  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      credentials: 'include'
    });

    if (response.ok) {
      const userData = await response.json();
      // Update UI untuk user yang sudah login
      const authSection = document.getElementById('auth-section');
      authSection.innerHTML = `
        <a href="my-account.html" class="profile-box">
          <span>Hi, ${userData.user.username}</span>
        </a>
      `;
      const userIcon = document.getElementById('user-icon');
      userIcon.href = 'my-account.html';
    } else {
      const authSection = document.getElementById('auth-section');
      authSection.innerHTML = '<a href="login.html" class="login-box">Login</a>';
      const userIcon = document.getElementById('user-icon');
      userIcon.href = 'login.html';
    }
    feather.replace();
  } catch (error) {
    console.error('Error checking login status:', error);
  }
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);

const navbarNav = document.querySelector('.navbar-nav');
document.querySelector('#hamburger-menu').onclick = () => {
  navbarNav.classList.toggle('active');
};

const searchForm = document.querySelector('.search-form');
const searchBox = document.querySelector('#search-box');

document.querySelector('#search-button').onclick = (e) => {
  searchForm.classList.toggle('active');
  searchBox.focus();
  e.preventDefault();
};

const shoppingCart = document.querySelector('.shopping-cart');
document.querySelector('#shopping-cart-button').onclick = (e) => {
  shoppingCart.classList.toggle('active');
  e.preventDefault();
};

const hm = document.querySelector('#hamburger-menu');
const sb = document.querySelector('#search-button');
const sc = document.querySelector('#shopping-cart-button');

document.addEventListener('click', function (e) {
  if (!hm.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove('active');
  }

  if (!sb.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove('active');
  }

  if (!sc.contains(e.target) && !shoppingCart.contains(e.target)) {
    shoppingCart.classList.remove('active');
  }
});

// Modal Box
const itemDetailModal = document.querySelector('#item-detail-modal');
const itemDetailButtons = document.querySelectorAll('.item-detail-button');

itemDetailButtons.forEach((btn) => {
  btn.onclick = (e) => {
    itemDetailModal.style.display = 'flex';
    e.preventDefault();
  };
});

// klik tombol close modal
document.querySelector('.modal .close-icon').onclick = (e) => {
  itemDetailModal.style.display = 'none';
  e.preventDefault();
};

// klik di luar modal
window.onclick = (e) => {
  if (e.target === itemDetailModal) {
    itemDetailModal.style.display = 'none';
  }
};


document.addEventListener("DOMContentLoaded", fetchCafes);


function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  const messageElement = document.getElementById('notification-message');

  messageElement.textContent = message;
  notification.className = `notification ${isError ? 'error' : 'success'} show`;

  setTimeout(() => {
      notification.classList.remove('show');
  }, 3000);
}

async function fetchCafes() {
  try {
    const response = await fetch(`${baseUrl}/api/cafes`);
    const cafes = await response.json();

    const cafeList = document.getElementById("cafe-list");
    cafeList.innerHTML = ""; // Kosongkan kontainer

    cafes.forEach((cafe) => {
      const cafeCard = `
        <div class="cafe-card" data-id="${cafe.id}">
          <div class="cafe-icons">
            <a href="#"><i data-feather="heart"></i></a>
            <a href="#" class="item-detail-button" data-cafe-id="${cafe.id}">
              <i data-feather="eye"></i>
            </a>
          </div>
          <div class="cafe-image">
            <img src="${cafe.image}" alt="${cafe.name}">
          </div>
          <div class="cafe-content">
            <h3>${cafe.name}</h3>
            <div class="cafe-stars">
              ${Array(Math.round(cafe.rating))
                .fill('<i data-feather="star" class="star-full"></i>')
                .join("")}
            </div>
          </div>
        </div>
      `;
      cafeList.innerHTML += cafeCard;
    });

    feather.replace();

    // Tambahkan event listener ke ikon heart
    addHeartListeners(cafes);

    // Menangani klik pada ikon mata untuk menampilkan modal
    const detailButtons = document.querySelectorAll('.item-detail-button');
    detailButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        const cafeId = event.target.closest('a').getAttribute('data-cafe-id');
        const selectedCafe = cafes.find(cafe => cafe.id === parseInt(cafeId));

        if (selectedCafe) {
          // Update modal dengan data cafe yang dipilih
          document.getElementById('modal-cafe-image').src = selectedCafe.image;
          document.getElementById('modal-cafe-name').textContent = selectedCafe.name;
          document.getElementById('modal-cafe-description').textContent = selectedCafe.description;

          // Mengisi rating cafe di modal
          const ratingStars = Array(Math.round(selectedCafe.rating))
            .fill('<i data-feather="star" class="star-full"></i>')
            .join("");
          document.getElementById('modal-cafe-rating').innerHTML = ratingStars;

          document.getElementById('item-detail-modal').style.display = 'block';
        }
      });
    });

    document.getElementById('close-modal').addEventListener('click', () => {
      document.getElementById('item-detail-modal').style.display = 'none';
    });
  } catch (error) {
  }
}

function addHeartListeners(cafes) {
  const heartIcons = document.querySelectorAll('.cafe-icons a:first-child');

  heartIcons.forEach((heart, index) => {
      heart.addEventListener('click', (event) => {
          event.preventDefault();
          const selectedCafe = cafes[index];

          if (!localStorage.getItem('user')) {
              window.location.href = '/login';
              return;
          }

          if (isFavorite(selectedCafe.id)) {
              removeFavorite(selectedCafe.id);
              heart.querySelector('i').style.fill = 'none';
          } else {
              addToFavorites(selectedCafe);
              heart.querySelector('i').style.fill = '#b6895b';
          }
      });

      const cafeId = cafes[index].id;
      if (isFavorite(cafeId)) {
          heart.querySelector('i').style.fill = '#b6895b';
      }
  });
}


document.addEventListener("DOMContentLoaded", fetchCafes);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = document.querySelector('input[name="name"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const phone = document.querySelector('input[name="phone"]').value;
      const message = document.querySelector('input[name="message"]').value;

      try {
        console.log('Sending data:', { name, email, phone, message }); // Debug log

        const response = await fetch(`${baseUrl}/api/send-message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, phone, message }),
        });

        const responseText = await response.text();

        const result = JSON.parse(responseText);
        alert(result.message)

        form.reset();
      } catch (error) {
        alert("Silahkan login terlebih dahulu.");
      }
    });
  } else {
    console.error("Elemen form tidak ditemukan di DOM.");
  }
});
