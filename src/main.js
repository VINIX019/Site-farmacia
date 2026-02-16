import './style.css'
let cart = [];

const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartBtn = document.getElementById("cart-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");
const addressInput = document.getElementById("address-input");
const addressWarn = document.getElementById("address-warn");
const checkoutBtn = document.getElementById("checkout-btn");
const paymentMethod = document.getElementById("payment-method");
const obsInput = document.getElementById("obs");

// Abrir modal
cartBtn.addEventListener("click", () => {
    updateCartModal();
    cartModal.classList.remove("hidden");
    cartModal.classList.add("flex");
});

// Fechar modal ao clicar fora ou no botão fechar
cartModal.addEventListener("click", (event) => {
    if (event.target === cartModal || event.target === closeModalBtn) {
        cartModal.classList.add("hidden");
        cartModal.classList.remove("flex");
    }
});

// Adicionar ao carrinho
document.addEventListener("click", (event) => {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartModal();
}

// Atualiza o visual do modal e o contador
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col", "border-b", "pb-2");

        cartItemElement.innerHTML = `
      <div class="flex items-center justify-between font-medium">
        <div>
          <p class="text-gray-800">${item.name}</p>
          <p class="text-sm text-gray-500">Qtd: ${item.quantity}</p>
          <p class="text-[#009b9d] font-bold">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-from-cart-btn text-red-500 hover:text-red-700 font-bold" data-name="${item.name}">
          Remover
        </button>
      </div>
    `;

        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    cartCount.innerHTML = cart.length;
}

// Remover item do carrinho
cartItemsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        const item = cart[index];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }
}

// Finalizar Pedido
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Montar mensagem para o WhatsApp
    const cartItems = cart.map((item) => {
        return `*${item.name}* \nQuantidade: ${item.quantity} \nPreço: R$${item.price.toFixed(2)}\n\n`;
    }).join("");

    const message = encodeURIComponent(
        `🛍️ *Novo Pedido - Farmagente Pompeia*\n\n` +
        `${cartItems}` +
        `💰 *Total: ${cartTotal.textContent}*\n` +
        `💳 Pagamento: ${paymentMethod.value}\n` +
        `📍 Endereço: ${addressInput.value}\n` +
        `📝 Obs: ${obsInput.value}`
    );

    const phone = "5519989776179";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    cart = [];
    updateCartModal();
    cartModal.classList.add("hidden");
});