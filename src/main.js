import './style.css'
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

import AOS from 'aos';
import 'aos/dist/aos.css'; // Não esqueça de importar o CSS!

// Inicialize o AOS
AOS.init({
    duration: 800, // Duração da animação (em milissegundos)
    once: true,    // Se a animação deve acontecer apenas uma vez
});
// --- ESTADO DO CARRINHO ---
let cart = [];

// --- SELEÇÃO DE ELEMENTOS DO DOM ---
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartBtn = document.getElementById("cart-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");

// Inputs de Identificação e Endereço
const userNameInput = document.getElementById("user-name-input");
const userPhoneInput = document.getElementById("user-phone-input");
const addressInput = document.getElementById("address-input");
const addressNumberInput = document.getElementById("address-number-input");
const addressNeighborhoodInput = document.getElementById("address-neighborhood-input");
const addressComplementInput = document.getElementById("address-complement-input");

// Checkout e Outros
const checkoutBtn = document.getElementById("checkout-btn");
const paymentMethod = document.getElementById("payment-method");
const obsInput = document.getElementById("obs");

// --- 1. FUNÇÃO DE NOTIFICAÇÕES (TOASTIFY) ---
function showToast(text, color = "#da1d83") {
    Toastify({
        text: text,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: color,
            borderRadius: "12px",
            fontWeight: "bold"
        },
    }).showToast();
}

// --- 2. MÁSCARA DE TELEFONE (19) 99999-9999 ---
userPhoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    if (value.length > 15) value = value.substring(0, 15);
    e.target.value = value;
});

// --- 3. LÓGICA DO MODAL ---
cartBtn.addEventListener("click", () => {
    updateCartModal();
    cartModal.classList.remove("hidden");
    cartModal.classList.add("flex");
});

const closeModal = () => {
    cartModal.classList.add("hidden");
    cartModal.classList.remove("flex");
};

closeModalBtn.addEventListener("click", closeModal);
cartModal.addEventListener("click", (e) => { if (e.target === cartModal) closeModal(); });

// --- 4. LÓGICA DO CARRINHO ---

// Adicionar item
document.addEventListener("click", (event) => {
    let parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        showToast(`${name} adicionado!`, "#009b9d"); // Verde Farmagente
        updateCartModal();
    }
});

// Atualizar visual do carrinho
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
                    <p class="text-sm text-gray-500 italic">Qtd: ${item.quantity}</p>
                    <p class="text-[#009b9d] font-bold">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-btn text-red-500 hover:underline text-sm font-bold" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `;
        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    cartCount.innerHTML = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Remover item
cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        const name = e.target.getAttribute("data-name");
        const index = cart.findIndex(item => item.name === name);
        if (index !== -1) {
            if (cart[index].quantity > 1) cart[index].quantity -= 1;
            else cart.splice(index, 1);
            updateCartModal();
        }
    }
});

// --- 5. FINALIZAÇÃO DO PEDIDO (WHATSAPP) ---
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Seu carrinho está vazio!", "#da1d83");
        return;
    }

    // Validação de campos
    if (!userNameInput.value || userPhoneInput.value.length < 14 || !addressInput.value || !addressNumberInput.value) {
        showToast("Preencha Nome, Telefone e Endereço!", "#da1d83"); // Rosa Farmagente
        return;
    }

    // Gerar resumo dos itens
    const cartItems = cart.map(item => `• *${item.name}* (Qtd: ${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`).join("");

    // Formatar Endereço
    const comp = addressComplementInput.value.trim() ? `\n*Comp:* ${addressComplementInput.value}` : "";
    const fullAddress = `*Rua:* ${addressInput.value}, ${addressNumberInput.value}${comp}\n*Bairro:* ${addressNeighborhoodInput.value}`;

    // Mensagem Final
    const message = encodeURIComponent(
        `🛍️ *NOVO PEDIDO - FARMAGENTE POMPEIA*\n\n` +
        `👤 *CLIENTE:* ${userNameInput.value}\n` +
        `📞 *FONE:* ${userPhoneInput.value}\n\n` +
        `📝 *ITENS:*\n${cartItems}\n` +
        `💰 *TOTAL: ${cartTotal.textContent}*\n` +
        `⚠️ _Sujeito a taxa de entrega_\n\n` +
        `📍 *ENTREGA:* ${fullAddress}\n` +
        `💳 *PAGAMENTO:* ${paymentMethod.value.toUpperCase()}\n` +
        `💬 *OBS:* ${obsInput.value || "Nenhuma"}\n\n` +
        `📸 *IMPORTANTE:* Vou anexar a foto da receita logo abaixo desta mensagem!`
    );

    window.open(`https://wa.me/5519989776179?text=${message}`, "_blank");

    // Limpar tudo após sucesso
    cart = [];
    updateCartModal();
    closeModal();
    [userNameInput, userPhoneInput, addressInput, addressNumberInput, addressNeighborhoodInput, addressComplementInput, obsInput].forEach(i => i.value = "");
});

// --- 6. LÓGICA DOS CARROSSÉIS ---
function setupCarousel(carouselId, prevBtnId, nextBtnId) {
    const carousel = document.getElementById(carouselId);
    const prev = document.getElementById(prevBtnId);
    const next = document.getElementById(nextBtnId);

    if (carousel && prev && next) {
        next.addEventListener("click", () => carousel.scrollLeft += 350);
        prev.addEventListener("click", () => carousel.scrollLeft -= 350);
    }
}

// Inicia carrosséis de Medicamentos e Dermocosméticos
setupCarousel("carousel", "prev-btn", "next-btn");
setupCarousel("carousel-dermo", "prev-dermo", "next-dermo");