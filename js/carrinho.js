
// Funções globais de carrinho baseadas em LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((acc, item) => acc + item.quantity, 0);
        countEl.textContent = total;
    }
}

function addToCart(product, variant, quantity) {
    // variant = { id, size, color }
    const existing = cart.find(item => item.variant.id === variant.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ product, variant, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Produto adicionado ao carrinho!');
}

document.addEventListener('DOMContentLoaded', updateCartCount);
