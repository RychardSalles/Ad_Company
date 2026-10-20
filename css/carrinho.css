// Função de extração ultra-segura para a foto de capa no carrinho
function getCoverImage(product) {
    if (!product) return 'assets/logo.png';

    // Garante a leitura quer seja do objeto principal quer esteja aninhado
    const target = product.product ? product.product : product;
    let raw = target.images || target.fotos || target.image_url || target.foto;
    if (!raw) return 'assets/logo.png';

    if (Array.isArray(raw)) {
        return raw.length > 0 && raw[0] ? raw[0] : 'assets/logo.png';
    }

    if (typeof raw === 'string') {
        let cleaned = raw.trim();

        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            try {
                let parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
                    return parsed[0];
                }
            } catch(e) {}
        }

        if (cleaned.includes(',')) {
            cleaned = cleaned.split(',')[0].trim();
        }

        cleaned = cleaned.replace(/^['"\[\s]+\vert{}['"\]\s]+$/g, '');

        if (cleaned && cleaned.length > 5) {
            return cleaned;
        }
    }

    return 'assets/logo.png';
}

document.addEventListener('DOMContentLoaded', () => {
    // Menu Hambúrguer Mobile
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }

    renderCart();
});

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-content');
    const countEl = document.getElementById('cart-count');
    
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if(countEl) countEl.textContent = `(${totalItems})`;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
                <p style="font-size: 16px; color: var(--text-light); margin-bottom: 20px;">O seu carrinho está vazio.</p>
                <a href="produtos.html" style="background: var(--accent); color: white; padding: 12px 25px; border-radius: 6px; font-weight: 800; text-transform: uppercase; font-size: 13px; text-decoration: none;">Ver Catálogo</a>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    let itemsHTML = '<div class="cart-items-list">';

    cart.forEach((item, index) => {
        const productObj = item.product || item;
        const price = productObj.is_promo ? (productObj.promo_price || productObj.price) : productObj.price;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        const coverUrl = getCoverImage(productObj);
        const sizeText = item.variant?.size || 'N/A';
        const colorText = item.variant?.color || 'N/A';

        itemsHTML += `
            <div class="cart-item">
                <img src="${coverUrl}" alt="${productObj.name}" onerror="this.onerror=null; this.src='assets/logo.png';">
                <div class="cart-item-details">
                    <div class="cart-item-title">${productObj.name}</div>
                    <div class="cart-item-info">Tamanho: ${sizeText} | Cor: ${colorText}</div>
                    <div class="cart-item-price">${formatCurrency(price)}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateQty(${index}, -1)" style="background: #222; color: #fff; border: 1px solid #444; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-weight: 600; font-size: 14px;">${item.quantity}</span>
                    <button onclick="updateQty(${index}, 1)" style="background: #222; color: #fff; border: 1px solid #444; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <button onclick="removeItem(${index})" style="background: transparent; border: none; color: var(--text-light); cursor: pointer; font-size: 16px; margin-left: 10px;" title="Remover item">🗑️</button>
            </div>
        `;
    });
    itemsHTML += '</div>';

    // Resumo e Cupons
    const discountData = JSON.parse(localStorage.getItem('applied_coupon')) || { value: 0, code: '' };
    const total = Math.max(0, subtotal - discountData.value);

    let summaryHTML = `
        <div class="cart-summary">
            <h3>Resumo do Pedido</h3>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            ${discountData.value > 0 ? `
                <div class="summary-row" style="color: var(--accent);">
                    <span>Desconto (${discountData.code})</span>
                    <span>- ${formatCurrency(discountData.value)}</span>
                </div>
            ` : ''}
            <div class="summary-row total">
                <span>Total</span>
                <span>${formatCurrency(total)}</span>
            </div>

            <div class="coupon-box">
                <input type="text" id="coupon-input" placeholder="Cupom de desconto" value="${discountData.code}">
                <button onclick="applyCoupon()">Aplicar</button>
            </div>

            <a href="checkout.html" class="btn-checkout">Ir para Finalização</a>
        </div>
    `;

    container.innerHTML = itemsHTML + summaryHTML;
}

window.updateQty = function(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
}

window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

window.applyCoupon = async function() {
    const codeInput = document.getElementById('coupon-input');
    if (!codeInput) return;
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return alert('Digite um código de cupom.');

    const client = window.supabaseClient || supabase;

    const { data: coupon, error } = await client
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

    if (error || !coupon) {
        alert('Cupom inválido ou expirado.');
        localStorage.removeItem('applied_coupon');
        renderCart();
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = cart.reduce((acc, item) => {
        const prod = item.product || item;
        const price = prod.is_promo ? (prod.promo_price || prod.price) : prod.price;
        return acc + (price * item.quantity);
    }, 0);

    let discountValue = 0;
    if (coupon.discount_type === 'percentage' || coupon.type === 'percentage') {
        discountValue = (subtotal * coupon.discount_value) / 100;
    } else {
        discountValue = coupon.discount_value || coupon.value || 0;
    }

    localStorage.setItem('applied_coupon', JSON.stringify({ code: coupon.code, value: discountValue }));
    alert('Cupom aplicado com sucesso!');
    renderCart();
}