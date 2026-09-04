/* ==========================================================
   1) Dữ liệu sản phẩm — mảng products gồm 6 sản phẩm Tây Nguyên
   ========================================================== */
const products = [
  {
    id: 1,
    name: "Cà phê Buôn Ma Thuột",
    category: "coffee",
    price: 120000,
    origin: "Đắk Lắk",
    image: "images/ca-phe-buon-ma-thuot.jpg",
    inStock: true
  },
  {
    id: 2,
    name: "Mật ong rừng Tây Nguyên",
    category: "honey",
    price: 180000,
    origin: "Đắk Lắk",
    image: "images/mat-ong-rung-tay-nguyen.jpg",
    inStock: true
  },
  {
    id: 3,
    name: "Mắc ca Tây Nguyên",
    category: "nuts",
    price: 190000,
    origin: "Đắk Nông",
    image: "images/mac-ca-tay-nguyen.jpg",
    inStock: true
  },
  {
    id: 4,
    name: "Tiêu Đắk Nông",
    category: "spice",
    price: 95000,
    origin: "Đắk Nông",
    image: "images/tieu-dak-nong.jpg",
    inStock: false
  },
  {
    id: 5,
    name: "Bơ sáp Đắk Lắk",
    category: "fruit",
    price: 60000,
    origin: "Đắk Lắk",
    image: "images/bo-sap-dak-lak.jpg",
    inStock: true
  },
  {
    id: 6,
    name: "Thổ cẩm Tây Nguyên",
    category: "handicraft",
    price: 350000,
    origin: "Gia Lai",
    image: "images/tho-cam-tay-nguyen.jpg",
    inStock: true
  }
];

/* ==========================================================
   2) Trạng thái giao diện (state đơn giản, không dùng framework)
   ========================================================== */
const state = {
  keyword: "",
  category: "all",
  cartCount: 0
};

/* ==========================================================
   3) Hàm định dạng và render
   ========================================================== */
const formatPrice = (price) => price.toLocaleString("vi-VN") + " đ";

function renderProductCard(product) {
  const stockLabel = product.inStock
    ? `<span class="stock in">Còn hàng</span>`
    : `<span class="stock out">Hết hàng</span>`;

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="thumb">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="body">
        <h3>${product.name}</h3>
        <p class="origin">Xuất xứ: ${product.origin}</p>
        ${stockLabel}
        <p class="price">${formatPrice(product.price)}</p>
        <button
          class="btn-add-cart"
          data-id="${product.id}"
          ${product.inStock ? "" : "disabled"}
        >
          ${product.inStock ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </article>
  `;
}

function getFilteredProducts() {
  const keyword = state.keyword.trim().toLowerCase();

  return products
    .filter((p) => state.category === "all" || p.category === state.category)
    .filter((p) => p.name.toLowerCase().includes(keyword));
}

function renderProducts() {
  const grid = document.querySelector("#product-grid");
  const emptyState = document.querySelector("#empty-state");
  const errorState = document.querySelector("#error-state");
  const resultMeta = document.querySelector("#result-meta");

  try {
    const filtered = getFilteredProducts();

    resultMeta.textContent = `Hiển thị ${filtered.length}/${products.length} sản phẩm`;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      errorState.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    errorState.style.display = "none";
    grid.innerHTML = filtered.map(renderProductCard).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = "";
    errorState.style.display = "block";
  }
}

/* ==========================================================
   4) Tìm kiếm và lọc theo danh mục
   ========================================================== */
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");

searchInput.addEventListener("input", (event) => {
  state.keyword = event.target.value;
  renderProducts();
});

categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

/* ==========================================================
   5) Thêm vào giỏ hàng — dùng event delegation trên productGrid
   ========================================================== */
const cartCountEl = document.querySelector("#cart-count");
const productGrid = document.querySelector("#product-grid");

function updateCartBadge() {
  cartCountEl.textContent = state.cartCount;
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".btn-add-cart");
  if (!button || button.disabled) return;

  const productId = Number(button.dataset.id);
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  state.cartCount += 1;
  updateCartBadge();

  const original = button.textContent;
  button.textContent = "Đã thêm ✓";
  setTimeout(() => {
    if (!button.disabled) button.textContent = original;
  }, 900);
});

/* ==========================================================
   6) Form đặt hàng — validate họ tên, số điện thoại, địa chỉ
   ========================================================== */
function validatePhone(phone) {
  const pattern = /^(0|\+84)[0-9]{9}$/;
  return pattern.test(phone.trim());
}

function setFieldError(fieldId, hasError) {
  const field = document.querySelector(`#field-${fieldId}`);
  field.classList.toggle("has-error", hasError);
  field.querySelector("input, textarea").classList.toggle("invalid", hasError);
}

function validateOrder(order) {
  const errors = {};

  if (!order.fullName || !order.fullName.trim()) {
    errors.fullName = true;
  }
  if (!validatePhone(order.phone || "")) {
    errors.phone = true;
  }
  if (!order.address || !order.address.trim()) {
    errors.address = true;
  }

  ["fullName", "phone", "address"].forEach((key) => {
    setFieldError(key, Boolean(errors[key]));
  });

  return Object.keys(errors).length === 0;
}

const orderForm = document.querySelector("#order-form");
const orderFeedback = document.querySelector("#order-feedback");

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(orderForm);
  const order = Object.fromEntries(data.entries());

  const isValid = validateOrder(order);

  if (!isValid) {
    orderFeedback.className = "error";
    orderFeedback.textContent = "Vui lòng kiểm tra lại thông tin đã nhập bên trên.";
    return;
  }

  // Chuẩn bị dữ liệu đơn hàng (sẽ dùng để gửi lên API ở mục 3.2)
  const finalOrder = {
    ...order,
    cartCount: state.cartCount,
    createdAt: new Date().toISOString()
  };
  console.log("Đơn hàng hợp lệ, sẵn sàng gửi API:", finalOrder);

  orderFeedback.className = "success";
  orderFeedback.textContent = `Cảm ơn ${order.fullName}, đơn hàng đã đặt thành công.`;
  orderForm.reset();
});

/* ==========================================================
   7) Khởi chạy
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartBadge();
});
