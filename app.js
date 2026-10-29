// !    Variable

const apiURL = 'https://www.themealdb.com/api/json/v1/1/';
const mealList = document.querySelector('#mealList');
const modal = document.querySelector('#cartModal');
const categorySelect = document.querySelector('#categorySelect');
const ingredientSelect = document.querySelector('#ingredientSelect');
const searchInput = document.querySelector('#searchInput');

let mealData = [];
let cards = [];

// !    Functions
const addRandomPrice = (data) => {
  return data.map((meal) => {
    meal.price = Math.floor(Math.random() * (60 - 5 + 1)) + 5;
    return meal;
  });
};

const fetchFoods = async (apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}search.php?s=`);
    if (!response.ok) {
      throw new Error('Network response was Failed !!!');
    }
    const data = await response.json();
    mealData = addRandomPrice(data.meals);
    console.log(mealData);

    displayMeals(mealData);
  } catch (error) {
    console.error(error);
  }
};

const displayMeals = (meals) => {
  mealList.innerHTML = '';
  meals.forEach((meal) => {
    const mealItem = document.createElement('div');
    mealItem.classList.add('meal');
    mealItem.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <h3>${meal.strMeal}</h3>
          <p>قیمت : ${convertToPersianDigit(meal.price)} دلار</p>
          <button class="add-meal" onclick='addToCard("${meal.idMeal}", "${meal.strMeal}", ${meal.price}, "${meal.strMealThumb}")'>افزودن به سبد خرید</button>
    `;
    mealList.appendChild(mealItem);
  });
};

const convertToPersianDigit = (number) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return number.toString().replace(/\d/g, (digit) => persianDigits[digit]);
};

const manageAuth = () => {
  const authSection = document.querySelector('#authSection');
  const token = localStorage.getItem('token');
  if (token) {
    const username = localStorage.getItem('loggedUser');
    authSection.innerHTML = `
      <div class="user-menu-container">
        <img src="images/user-icon.png" id="userIcon" class="user-icon" alt="user-icon">
        <div id="userMenu" class="user-menu hidden">
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            ${username}
          </p>
          <p>
              <button id="logoutBtn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  خروج
              </button>
          </p>
        </div>
      </div>
    `;
    document.querySelector('#userIcon').addEventListener('click', () => {
      const userMenu = document.querySelector('#userMenu');
      userMenu.classList.toggle('hidden');
    });

    document.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('loggedUser');
      location.reload();
    });
  } else {
    authSection.innerHTML =
      '<a href="login.html">ورود</a> | <a href="register.html">ثبت نام</a>';
  }
};

const addToCard = (id, title, price, img) => {
  const cards = loadUserCard();
  const excistUserCard = cards.find((item) => item.id === id);
  if (excistUserCard) {
    excistUserCard.quentity = excistUserCard.quentity + 1;
  } else {
    cards.push({ id, title, price, img, quentity: 1 });
  }

  console.log('cards : ', cards);
  saveUserCards(cards);
  updateCard();

  showNotification(`${title} با موفقیت به سبد اضافه شد`);
};

const saveUserCards = (data) => {
  const user = localStorage.getItem('loggedUser');
  localStorage.setItem(`card_${user}`, JSON.stringify(data));
};

const loadUserCard = () => {
  const user = localStorage.getItem('loggedUser');
  const userCard = JSON.parse(localStorage.getItem(`card_${user}`)) || [];
  return userCard;
};

const updateCard = () => {
  const card = loadUserCard();
  const countCard = card.reduce((sum, item) => sum + item.quentity, 0);
  document.querySelector('#cartCount').textContent =
    convertToPersianDigit(countCard);
};

const displayCartInModal = () => {
  const card = loadUserCard();
  const cardContainerItems = document.querySelector('#cartItems');
  cardContainerItems.innerHTML = '';
  let total = 0;
  const checkoutButton = document.querySelector('#checkoutButton');
  const cartTotal = document.querySelector('#cartTotal');
  const loginReminder = document.querySelector('#loginReminder');
  console.log(card);

  if (card.length === 0) {
    cardContainerItems.innerHTML = `
      <tr>
        <td colspan='6'>سبد خرید شما خالی است </td>
      </tr>
    `;
    return;
  }
  card.forEach((item, index) => {
    console.log('cardContainerItem :', item);

    cardContainerItems.innerHTML += `
      <tr>
        <td><img src="${item.img}" alt="${item.title}"></td>
        <td>${item.title}</td>
        <td>${convertToPersianDigit(item.price)} $</td>
        <td class='btns-modal'>
          <div>
            <button onclick='changeQuantity(${index}, -1)'>-</button>
            ${convertToPersianDigit(item.quentity)}
            <button onclick='changeQuantity(${index}, 1)'>+</button>
          </div>
        </td>
        <td>${convertToPersianDigit(item.quentity * item.price)} $</td>
        <td>
          <button class='removeFromCart' onclick="removeFromCard(${index})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          </button>
        </td>
      </tr>
    `;

    total += item.quentity * item.price;
  });

  const token = localStorage.getItem('token');
  if (token) {
    checkoutButton.style.display = 'block';
    loginReminder.style.display = 'none';
  } else {
    checkoutButton.style.display = 'none';
    loginReminder.style.display = 'block';
  }

  cartTotal.innerHTML = `
    <h3>مجموع : ${convertToPersianDigit(total)} $</h3>
  `;
};

const changeQuantity = (index, delta) => {
  const card = loadUserCard();
  if (card[index].quentity + delta > 0) {
    card[index].quentity += delta;
  } else {
    removeFromCard(index);
  }
  saveUserCards(card);
  displayCartInModal();
};

const removeFromCard = (index) => {
  let card = loadUserCard();
  card.splice(index, 1);
  saveUserCards(card);
  displayCartInModal();
  updateCard();
};

const showNotification = (message, type = 'success') => {
  notification.textContent = message;
  notification.className = type === 'error' ? 'show error' : 'show';

  setTimeout(() => {
    notification.className = 'hidden';
  }, 1000);
};

const searchFoods = async (query) => {
  try {
    const response = await fetch(`${apiURL}search.php?s=${query}`);
    if (!response.ok) {
      throw new Error('Network response serachFoods Was Faild');
    }

    const data = await response.json();
    let mealData = addRandomPrice(data.meals);
    displayMeals(mealData);
  } catch (error) {
    console.error(error);
  }
};

const filterMeals = async (type, query) => {
  try {
    let url;
    switch (type) {
      case 'category':
        url = `${apiURL}filter.php?c=${query}`;
        break;
      case 'ingredient':
        url = `${apiURL}filter.php?i=${query}`;
        break;
      case 'region':
        url = `${apiURL}filter.php?a=${query}`;
        break;
      default:
        throw new Error('qurey is invalid');
        break;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network respose serachByRegion was Failed!');
    }

    const data = await response.json();
    const mealData = addRandomPrice(data.meals);

    displayMeals(mealData);
  } catch (error) {
    console.error(error);
  }
};

// !    Events

document.querySelector('#cartIcon').addEventListener('click', () => {
  modal.style.display = 'block';
  displayCartInModal();
});
document.querySelector('.close').addEventListener('click', () => {
  modal.style.display = 'none';
});

document.querySelector('#searchForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const searchInput = document.querySelector('#searchInput').value;
  searchFoods(searchInput);
});

searchInput.addEventListener('input', () => {
  const searchInput = document.querySelector('#searchInput').value;
  searchFoods(searchInput);
});

document.querySelectorAll('.region-buttons div').forEach((element) => {
  element.addEventListener('click', () => {
    const region = element.getAttribute('data-region');
    filterMeals('region', region);
  });
});

ingredientSelect.addEventListener('change', (e) => {
  const ingredient = e.target.value;
  filterMeals('ingredient', ingredient);
});

categorySelect.addEventListener('change', (e) => {
  const category = e.target.value;
  filterMeals('category', category);
});

document.querySelector('#clearFilters').addEventListener('click', () => {
  ingredientSelect.value = '';
  categorySelect.value = '';
  searchInput.value = '';
  fetchFoods(apiURL);
});

// ?  Window Load
window.addEventListener('load', () => {
  fetchFoods(apiURL);
  manageAuth();
  updateCard();
});
