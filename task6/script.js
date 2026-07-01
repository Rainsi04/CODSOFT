/* ===== ShopWave — E-Commerce Store =====
   Vanilla JS single-page app with localStorage persistence.
*/

// ─────────────────────────────────────────
// PRODUCT CATALOGUE
// ─────────────────────────────────────────
const PRODUCTS = [
  { id: 1,  name: 'Wireless Earbuds Pro',      category: 'electronics', price: 2499, originalPrice: 3499, emoji: '🎧', rating: 4.7, reviews: 1832, badge: 'Sale', desc: 'True wireless earbuds with active noise cancellation, 30-hour battery, and premium sound.' },
  { id: 2,  name: 'Smart Watch Series X',      category: 'electronics', price: 5999, originalPrice: 7999, emoji: '⌚', rating: 4.5, reviews: 942,  badge: 'Sale', desc: 'AMOLED display, heart-rate monitor, GPS, and 7-day battery life. Water-resistant.' },
  { id: 3,  name: 'Mechanical Keyboard',       category: 'electronics', price: 3299, originalPrice: null, emoji: '⌨️', rating: 4.6, reviews: 510,  badge: null,   desc: 'Full-size RGB mechanical keyboard with tactile blue switches and brushed aluminium frame.' },
  { id: 4,  name: 'USB-C Hub 7-in-1',          category: 'electronics', price: 1299, originalPrice: 1799, emoji: '🔌', rating: 4.3, reviews: 724,  badge: 'Sale', desc: 'HDMI 4K, 3× USB-A, USB-C PD 100W, SD & microSD card reader in one slim hub.' },
  { id: 5,  name: 'Classic Linen Shirt',       category: 'fashion',     price: 849,  originalPrice: null, emoji: '👕', rating: 4.4, reviews: 380,  badge: null,   desc: 'Relaxed-fit 100% linen shirt perfect for summer. Available in earthy tones.' },
  { id: 6,  name: 'Leather Crossbody Bag',     category: 'fashion',     price: 1599, originalPrice: 2199, emoji: '👜', rating: 4.6, reviews: 267,  badge: 'Sale', desc: 'Genuine leather crossbody with adjustable strap, two compartments, and magnetic clasp.' },
  { id: 7,  name: 'Running Sneakers V2',       category: 'fashion',     price: 2799, originalPrice: null, emoji: '👟', rating: 4.8, reviews: 1150, badge: 'New',  desc: 'Lightweight mesh upper, cushioned sole, and breathable interior for long-distance comfort.' },
  { id: 8,  name: 'Aviator Sunglasses',        category: 'fashion',     price: 699,  originalPrice: null, emoji: '🕶️', rating: 4.2, reviews: 198,  badge: null,   desc: 'UV400 polarised lenses with metal frame — a timeless everyday essential.' },
  { id: 9,  name: 'Ergonomic Office Chair',    category: 'home',        price: 8999, originalPrice:11999, emoji: '🪑', rating: 4.7, reviews: 634,  badge: 'Sale', desc: 'Adjustable lumbar support, 4D armrests, breathable mesh back. 5-year warranty.' },
  { id: 10, name: 'Indoor Plant Set (3pc)',     category: 'home',        price: 649,  originalPrice: null, emoji: '🪴', rating: 4.5, reviews: 420,  badge: null,   desc: 'Low-maintenance succulents in ceramic pots. Perfect for desks and windowsills.' },
  { id: 11, name: 'Aroma Diffuser',            category: 'home',        price: 999,  originalPrice: 1499, emoji: '🕯️', rating: 4.4, reviews: 815,  badge: 'Sale', desc: 'Ultrasonic mist diffuser with 7-colour LED and auto shut-off. 400 ml capacity.' },
  { id: 12, name: 'Yoga Mat Premium',          category: 'sports',      price: 1199, originalPrice: null, emoji: '🧘', rating: 4.6, reviews: 960,  badge: null,   desc: '6mm thick non-slip natural rubber mat with alignment lines. Includes carry strap.' },
  { id: 13, name: 'Resistance Band Set',       category: 'sports',      price: 549,  originalPrice: null, emoji: '💪', rating: 4.3, reviews: 702,  badge: null,   desc: 'Set of 5 latex bands with different resistance levels. Includes door anchor.' },
  { id: 14, name: 'Football Pro Edition',      category: 'sports',      price: 1299, originalPrice: 1799, emoji: '⚽', rating: 4.5, reviews: 430,  badge: 'Sale', desc: 'FIFA-quality PU leather match ball. Excellent grip and all-weather performance.' },
  { id: 15, name: 'Bluetooth Speaker 360°',    category: 'electronics', price: 2199, originalPrice: 2999, emoji: '🔊', rating: 4.6, reviews: 1200, badge: 'Sale', desc: 'Waterproof IPX7, 24-hour playtime, dual-driver 360° surround sound.' },
  { id: 16, name: 'Stainless Water Bottle',    category: 'sports',      price: 449,  originalPrice: null, emoji: '🥤', rating: 4.8, reviews: 2100, badge: null,   desc: 'Double-wall insulated 750ml bottle. Keeps drinks cold 24h / hot 12h.' },
];

// ─────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────
const STORE = {
  getUsers:   () => JSON.parse(localStorage.getItem('sw_users')   || '[]'),
  saveUsers:  (u) => localStorage.setItem('sw_users',  JSON.stringify(u)),
  getSession: () => JSON.parse(localStorage.getItem('sw_session') || 'null'),
  setSession: (u) => localStorage.setItem('sw_session', JSON.stringify(u)),
  clearSession:()  => localStorage.removeItem('sw_session'),
  getCart:    () => JSON.parse(localStorage.getItem('sw_cart')    || '[]'),
  saveCart:   (c) => localStorage.setItem('sw_cart',   JSON.stringify(c)),
};

let cart = STORE.getCart();

function saveCart() { STORE.saveCart(cart); }

// ─────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────
const VIEWS = ['home','shop','product','auth','checkout','success'];
let currentView = 'home';

function navigate(name, opts = {}) {
  VIEWS.forEach(v => document.getElementById(`view-${v}`).classList.toggle('hidden', v !== name));
  currentView = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.nav-links').classList.remove('open');
  closeCart();

  if (name === 'home') renderFeatured();
  if (name === 'shop') { renderShop(opts.filter); }
  if (name === 'auth') renderAuth();
  if (name === 'checkout') renderCheckout();
}

document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const target = el.getAttribute('data-nav');
    const filter = el.getAttribute('data-filter') || null;
    if (target === 'shop' && filter) {
      // sale filter
      navigate('shop', { filter: 'sale' });
    } else if (target === 'create') {
      navigate('auth');
    } else {
      navigate(target);
    }
  });
});

// category cards
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    navigate('shop', { category: card.dataset.category });
  });
});

// Mobile nav toggle
document.querySelector('.nav-toggle').addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
});

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
function renderAuth() {
  document.getElementById('loginMsg').textContent = '';
  document.getElementById('registerMsg').textContent = '';
}

function updateAuthNav() {
  const session = STORE.getSession();
  const link = document.getElementById('authNavLink');
  link.textContent = session ? `Hi, ${session.name.split(' ')[0]}` : 'Sign In';
}

document.getElementById('authNavLink').addEventListener('click', (e) => {
  e.preventDefault();
  if (STORE.getSession()) {
    STORE.clearSession();
    updateAuthNav();
    navigate('home');
  } else {
    navigate('auth');
  }
});

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.getElementById('loginForm').classList.toggle('hidden', target !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', target !== 'register');
  });
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const msg = document.getElementById('registerMsg');

  if (password.length < 6) {
    msg.textContent = 'Password must be at least 6 characters.';
    msg.className = 'form-msg error'; return;
  }
  const users = STORE.getUsers();
  if (users.find(u => u.email === email)) {
    msg.textContent = 'An account with that email already exists.';
    msg.className = 'form-msg error'; return;
  }
  users.push({ name, email, password });
  STORE.saveUsers(users);
  STORE.setSession({ name, email });
  updateAuthNav();
  msg.textContent = 'Account created!';
  msg.className = 'form-msg success';
  setTimeout(() => navigate('home'), 600);
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMsg');
  const user = STORE.getUsers().find(u => u.email === email && u.password === password);
  if (!user) {
    msg.textContent = 'Invalid email or password.';
    msg.className = 'form-msg error'; return;
  }
  STORE.setSession({ name: user.name, email: user.email });
  updateAuthNav();
  msg.textContent = 'Welcome back, ' + user.name.split(' ')[0] + '!';
  msg.className = 'form-msg success';
  setTimeout(() => navigate('home'), 500);
});

// ─────────────────────────────────────────
// PRODUCT RENDERING
// ─────────────────────────────────────────
function stars(rating) {
  return '⭐'.repeat(Math.round(rating)) + ` ${rating} (${(Math.random() * 900 + 100 | 0)} reviews)`;
}

function formatPrice(p) { return '₹' + p.toLocaleString('en-IN'); }

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-thumb">${product.emoji}</div>
    <div class="product-info">
      <span class="product-category">${product.category}</span>
      <div class="product-name">${product.name}</div>
      <div class="product-desc">${product.desc}</div>
      <div class="product-rating">${'★'.repeat(Math.round(product.rating))} ${product.rating}</div>
    </div>
    <div class="product-footer">
      <div class="product-price">
        ${product.originalPrice ? `<span class="original">${formatPrice(product.originalPrice)}</span>` : ''}
        ${formatPrice(product.price)}
      </div>
      <div class="product-actions">
        <button class="btn btn-sm btn-secondary view-btn">Details</button>
        <button class="btn btn-sm btn-primary add-cart-btn">+ Cart</button>
      </div>
    </div>
    ${product.badge ? `<div style="position:absolute;top:12px;right:12px;"><span class="product-badge">${product.badge}</span></div>` : ''}
  `;
  card.style.position = 'relative';
  card.querySelector('.view-btn').addEventListener('click', () => openProduct(product.id));
  card.querySelector('.add-cart-btn').addEventListener('click', (e) => { e.stopPropagation(); addToCart(product.id, 1); });
  return card;
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = '';
  const featured = PRODUCTS.filter(p => p.badge || p.rating >= 4.6).slice(0, 6);
  featured.forEach(p => grid.appendChild(createProductCard(p)));
}

// ─────────────────────────────────────────
// SHOP / FILTER
// ─────────────────────────────────────────
let activeCategory = null;
let activeSale = false;

function renderShop(preFilter) {
  // Pre-filter from home page
  if (preFilter === 'sale') { activeSale = true; activeCategory = null; }
  else if (preFilter) { activeCategory = preFilter; activeSale = false; }

  // Reset category checkboxes
  document.querySelectorAll('#categoryFilters input').forEach(cb => {
    cb.checked = cb.value === 'all';
  });
  if (activeCategory) {
    document.querySelectorAll('#categoryFilters input').forEach(cb => {
      if (cb.value === activeCategory) { cb.checked = true; }
      if (cb.value === 'all') { cb.checked = false; }
    });
  }
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const sort = document.getElementById('sortSelect').value;
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const minRating = parseFloat(document.querySelector('input[name="rating"]:checked').value) || 0;

  const checkedCats = Array.from(document.querySelectorAll('#categoryFilters input:checked')).map(c => c.value);
  const allChecked = checkedCats.includes('all');

  let filtered = PRODUCTS.filter(p => {
    if (activeSale && !p.originalPrice) return false;
    if (!allChecked && !checkedCats.includes(p.category)) return false;
    if (p.price < minPrice || p.price > maxPrice) return false;
    if (p.rating < minRating) return false;
    if (search && !p.name.toLowerCase().includes(search) && !p.category.toLowerCase().includes(search)) return false;
    return true;
  });

  // Sort
  if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  else if (sort === 'rating') filtered.sort((a,b) => b.rating - a.rating);
  else if (sort === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));

  const grid = document.getElementById('shopGrid');
  const empty = document.getElementById('shopEmpty');
  grid.innerHTML = '';
  empty.classList.toggle('hidden', filtered.length > 0);
  document.getElementById('resultCount').textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  filtered.forEach(p => grid.appendChild(createProductCard(p)));
}

// Bind filter events
['searchInput','sortSelect','minPrice','maxPrice'].forEach(id => {
  document.getElementById(id).addEventListener('input', applyFilters);
});
document.querySelectorAll('#categoryFilters input').forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.value === 'all' && cb.checked) {
      document.querySelectorAll('#categoryFilters input').forEach(c => { if (c.value !== 'all') c.checked = false; });
    } else if (cb.checked) {
      document.querySelector('#categoryFilters input[value="all"]').checked = false;
    }
    activeSale = false;
    applyFilters();
  });
});
document.querySelectorAll('input[name="rating"]').forEach(r => {
  r.addEventListener('change', applyFilters);
});
document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value = 'default';
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.querySelectorAll('#categoryFilters input').forEach(c => { c.checked = c.value === 'all'; });
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  activeSale = false; activeCategory = null;
  applyFilters();
});

// Mobile filter toggle
document.getElementById('filterToggleBtn').addEventListener('click', () => {
  document.getElementById('filterSidebar').classList.toggle('open');
});

// ─────────────────────────────────────────
// PRODUCT DETAIL
// ─────────────────────────────────────────
let detailProductId = null;
let detailQty = 1;

function openProduct(id) {
  const p = PRODUCTS.find(pr => pr.id === id);
  if (!p) return;
  detailProductId = id;
  detailQty = 1;

  document.getElementById('detailImg').textContent = p.emoji;
  document.getElementById('detailRating').textContent = '★'.repeat(Math.round(p.rating)) + ` ${p.rating} · ${p.reviews} reviews`;
  document.getElementById('detailBadge').textContent = p.badge || '';
  document.getElementById('detailBadge').style.display = p.badge ? 'inline-block' : 'none';
  document.getElementById('detailName').textContent = p.name;
  document.getElementById('detailDesc').textContent = p.desc;
  document.getElementById('detailPrice').innerHTML =
    (p.originalPrice ? `<span class="original-detail">${formatPrice(p.originalPrice)}</span> ` : '') +
    formatPrice(p.price);
  document.getElementById('qtyValue').textContent = 1;

  navigate('product');
}

document.getElementById('backToShop').addEventListener('click', () => navigate('shop'));

document.getElementById('qtyMinus').addEventListener('click', () => {
  if (detailQty > 1) { detailQty--; document.getElementById('qtyValue').textContent = detailQty; }
});
document.getElementById('qtyPlus').addEventListener('click', () => {
  detailQty++;
  document.getElementById('qtyValue').textContent = detailQty;
});
document.getElementById('detailAddCart').addEventListener('click', () => {
  addToCart(detailProductId, detailQty);
  openCart();
});

// ─────────────────────────────────────────
// CART
// ─────────────────────────────────────────
function addToCart(productId, qty = 1) {
  const existing = cart.find(item => item.id === productId);
  if (existing) { existing.qty += qty; }
  else { cart.push({ id: productId, qty }); }
  saveCart();
  renderCartDrawer();
  animateCartBadge();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCartDrawer();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function renderCartDrawer() {
  const list = document.getElementById('cartItemsList');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const badge = document.getElementById('cartBadge');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = totalQty;

  list.innerHTML = '';
  if (cart.length === 0) {
    empty.classList.remove('hidden');
    footer.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  footer.classList.remove('hidden');

  cart.forEach(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-icon">${p.emoji}</div>
      <div>
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-sub">${formatPrice(p.price)} × ${item.qty} = ${formatPrice(p.price * item.qty)}</div>
      </div>
      <button class="cart-item-remove" title="Remove">✕</button>
    `;
    el.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.id));
    list.appendChild(el);
  });

  document.getElementById('cartTotal').textContent = formatPrice(cartTotal());
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartDrawer').classList.remove('hidden');
  document.getElementById('cartOverlay').classList.remove('hidden');
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  setTimeout(() => {
    document.getElementById('cartDrawer').classList.add('hidden');
    document.getElementById('cartOverlay').classList.add('hidden');
  }, 300);
}

document.getElementById('cartToggleBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

document.getElementById('checkoutBtn').addEventListener('click', () => {
  closeCart();
  navigate('checkout');
});

function animateCartBadge() {
  const badge = document.getElementById('cartBadge');
  badge.style.transform = 'scale(1.4)';
  setTimeout(() => badge.style.transform = 'scale(1)', 200);
}

// ─────────────────────────────────────────
// CHECKOUT
// ─────────────────────────────────────────
function renderCheckout() {
  if (cart.length === 0) { navigate('shop'); return; }

  const session = STORE.getSession();
  if (session) {
    document.getElementById('chkEmail').value = session.email;
  }

  const itemsList = document.getElementById('checkoutItemsList');
  itemsList.innerHTML = '';
  cart.forEach(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return;
    const row = document.createElement('div');
    row.className = 'checkout-item';
    row.innerHTML = `<span>${p.emoji} ${p.name} × ${item.qty}</span><span>${formatPrice(p.price * item.qty)}</span>`;
    itemsList.appendChild(row);
  });

  const subtotal = cartTotal();
  const shipping = subtotal >= 999 ? 0 : 79;
  document.getElementById('summarySubtotal').textContent = formatPrice(subtotal);
  document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('summaryTotal').textContent = formatPrice(subtotal + shipping);
}

// Payment method switching
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('cardFields').classList.toggle('hidden', radio.value !== 'card');
    document.getElementById('upiFields').classList.toggle('hidden', radio.value !== 'upi');
  });
});

// Card number formatting
document.getElementById('cardNumber').addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g,'').slice(0,16);
  e.target.value = val.match(/.{1,4}/g)?.join(' ') || val;
});
document.getElementById('cardExpiry').addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g,'').slice(0,4);
  if (val.length >= 3) val = val.slice(0,2) + ' / ' + val.slice(2);
  e.target.value = val;
});

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const msg = document.getElementById('checkoutMsg');

  // Simple card validation
  if (paymentMethod === 'card') {
    const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
    if (num.length !== 16) { msg.textContent = 'Please enter a valid 16-digit card number.'; msg.className = 'form-msg error'; return; }
  }
  if (paymentMethod === 'upi') {
    const upi = document.getElementById('upiId').value.trim();
    if (!upi.includes('@')) { msg.textContent = 'Please enter a valid UPI ID.'; msg.className = 'form-msg error'; return; }
  }

  const orderId = 'SWV-' + Date.now().toString(36).toUpperCase();
  document.getElementById('successOrderId').textContent = 'Order ID: ' + orderId;
  cart = [];
  saveCart();
  renderCartDrawer();
  navigate('success');
});

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
updateAuthNav();
renderCartDrawer();
navigate('home');
