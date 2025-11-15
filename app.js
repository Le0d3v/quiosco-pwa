// =====================
//  APP JS (PWA SHELL)
// =====================

// Variables globales
let menu = [];
let cart = [];

// IndexedDB / PouchDB DB
let db = new PouchDB("kioskDB");

// UI Elements
const menuGrid = document.getElementById("menuGrid");
const cartItems = document.getElementById("cartItems");
const totalPriceEl = document.getElementById("totalPrice");
const searchInput = document.getElementById("search");

// Productos base
const defaultMenu = [
  {
    id: "1",
    title: "Hamburguesa Clásica",
    desc: "Carne 100% res, queso cheddar y vegetales frescos.",
    price: 75,
    img: "https://picsum.photos/400/200?1",
  },
  {
    id: "2",
    title: "Pizza Personal",
    desc: "Masa crujiente con salsa italiana tradicional.",
    price: 89,
    img: "https://picsum.photos/400/200?2",
  },
  {
    id: "3",
    title: "Tacos de Pastor",
    desc: "Clásicos tacos mexicanos con piña.",
    price: 55,
    img: "https://picsum.photos/400/200?3",
  },
  {
    id: "4",
    title: "Agua Fresca",
    desc: "Sabor jamaica, horchata o limón.",
    price: 25,
    img: "https://picsum.photos/400/200?4",
  },
];

// =====================================================
//  Cargar datos desde PouchDB o usar default
// =====================================================
async function loadMenu() {
  try {
    const result = await db.allDocs({ include_docs: true });

    if (result.rows.length === 0) {
      // Guardar defaultMenu
      for (let item of defaultMenu) {
        await db.put({ _id: item.id, ...item });
      }
      menu = [...defaultMenu];
    } else {
      menu = result.rows.map((r) => r.doc);
    }

    renderMenu(menu);
  } catch (err) {
    console.error("Error cargando menú", err);
    menu = [...defaultMenu];
    renderMenu(menu);
  }
}

// =====================================================
//  Renderizar Menú
// =====================================================
function renderMenu(list) {
  menuGrid.innerHTML = "";
  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "menu-item";
    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div class="item-info">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <div class="price">$${item.price}</div>
        <button class="btn btn-add" onclick='addToCart("${item.id}")'>Agregar</button>
      </div>
    `;
    menuGrid.appendChild(card);
  });
}

// =====================================================
//  Carrito
// =====================================================
function addToCart(id) {
  const item = menu.find((m) => m.id === id);
  cart.push(item);
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <span>${item.title}</span>
      <span>$${item.price}</span>
    `;
    cartItems.appendChild(row);
  });

  totalPriceEl.textContent = `$${total}.00`;
}

// =====================================================
//  Buscador
// =====================================================
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = menu.filter(
    (i) => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
  );
  renderMenu(filtered);
});

// =====================================================
//  Instalación PWA
// =====================================================
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  console.log("Instalación:", choice.outcome);
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

// =====================================================
//  Inicializar App
// =====================================================
loadMenu();
