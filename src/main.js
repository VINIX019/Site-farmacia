import './style.css'

let cart = [];

// Seleção de elementos do DOM
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartBtn = document.getElementById("cart-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");

// Inputs de Endereço
const addressInput = document.getElementById("address-input");
const addressNumberInput = document.getElementById("address-number-input");
const addressNeighborhoodInput = document.getElementById("address-neighborhood-input");

// Avisos de Validação
const addressWarn = document.getElementById("address-warn");
const addressNumberWarn = document.getElementById("address-number-warn");
const addressNeighborhoodWarn = document.getElementById("address-neighborhood-warn");

// Checkout e Pagamento
const checkoutBtn = document.getElementById("checkout-btn");
const paymentMethod = document.getElementById("payment-method");
const obsInput = document.getElementById("obs");

// --- LÓGICA DO MODAL ---

// Abrir modal
cartBtn.addEventListener("click", () => {
    updateCartModal();
    cartModal.classList.remove("hidden");
    cartModal.classList.add("flex");
});

// Fechar modal
function closeModal() {
    cartModal.classList.add("hidden");
    cartModal.classList.remove("flex");
}

closeModalBtn.addEventListener("click", closeModal);

// Fechar ao clicar no fundo
cartModal.addEventListener("click", (event) => {
    if (event.target === cartModal) {
        closeModal();
    }
});

// --- LÓGICA DO CARRINHO ---

// Escutador de cliques global para os botões "Adicionar ao Carrinho"
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

// Atualiza a visualização do carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col", "border-b", "pb-2");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between font-medium">
                <div>
                    <p class="text-gray-800 font-bold">${item.name}</p>
                    <p class="text-sm text-gray-500 italic">Quantidade: ${item.quantity}</p>
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

    // Formatação de moeda brasileira
    cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    cartCount.innerHTML = cart.reduce((acc, item) => acc + item.quantity, 0);
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

// --- FINALIZAÇÃO DO PEDIDO ---

checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    let isValid = true;

    // Validação da Rua
    if (addressInput.value.trim() === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        isValid = false;
    } else {
        addressWarn.classList.add("hidden");
        addressInput.classList.remove("border-red-500");
    }

    // Validação do Número
    if (addressNumberInput.value.trim() === "") {
        addressNumberWarn.classList.remove("hidden");
        addressNumberInput.classList.add("border-red-500");
        isValid = false;
    } else {
        addressNumberWarn.classList.add("hidden");
        addressNumberInput.classList.remove("border-red-500");
    }

    // Validação do Bairro
    if (addressNeighborhoodInput.value.trim() === "") {
        addressNeighborhoodWarn.classList.remove("hidden");
        addressNeighborhoodInput.classList.add("border-red-500");
        isValid = false;
    } else {
        addressNeighborhoodWarn.classList.add("hidden");
        addressNeighborhoodInput.classList.remove("border-red-500");
    }

    if (!isValid) return;

    // Formatação da lista de produtos para o WhatsApp
    const cartItems = cart.map((item) => {
        return `• *${item.name}* \n   Qtd: ${item.quantity} | Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    }).join("\n");

    const fullAddress = `Rua: ${addressInput.value}, Nº: ${addressNumberInput.value} - Bairro: ${addressNeighborhoodInput.value}`;

    // Link do WhatsApp
    const message = encodeURIComponent(
        `🛍️ *NOVO PEDIDO - FARMAGENTE POMPEIA*\n\n` +
        `📦 *ITENS DO PEDIDO:*\n${cartItems}\n` +
        `💰 *TOTAL: ${cartTotal.textContent}*\n\n` +
        `📍 *ENDEREÇO DE ENTREGA:*\n${fullAddress}\n\n` +
        `💳 *FORMA DE PAGAMENTO:* ${paymentMethod.value.toUpperCase()}\n` +
        `💬 *OBSERVAÇÃO:* ${obsInput.value || "Nenhuma"}`
    );

    const phone = "5519989776179";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    // Resetar tudo após o envio
    cart = [];
    updateCartModal();
    closeModal();
    // Limpar campos de endereço
    addressInput.value = "";
    addressNumberInput.value = "";
    addressNeighborhoodInput.value = "";
    obsInput.value = "";
});

// Remove bordas vermelhas ao começar a digitar
[addressInput, addressNumberInput, addressNeighborhoodInput].forEach(input => {
    input.addEventListener("input", () => {
        input.classList.remove("border-red-500");
        // Esconde o aviso de erro mais próximo (irmão do input)
        const warn = input.id === "address-input" ? addressWarn :
            input.id === "address-number-input" ? addressNumberWarn :
                addressNeighborhoodWarn;
        warn.classList.add("hidden");
    });
});