let currentSubtotal = 0;
let discountAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.getElementById('cart-count');
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if(countEl) countEl.textContent = `(${totalItems})`;

    if (cart.length === 0) {
        alert('O seu carrinho está vazio.');
        window.location.href = 'carrinho.html';
        return;
    }

    renderCheckoutSummary(cart);
    toggleShippingType();

    // Consulta automática de CEP via API ViaCEP
    const cepInput = document.getElementById('client-cep');
    if (cepInput) {
        cepInput.addEventListener('blur', async function() {
            let cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        const streetInput = document.getElementById('client-street');
                        if (streetInput) {
                            streetInput.value = `${data.logradouro}, Bairro: ${data.bairro} - ${data.localidade}/${data.uf}`;
                        }
                        const compInput = document.getElementById('client-complement');
                        if (compInput) compInput.focus();
                    } else {
                        alert('CEP não encontrado.');
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                }
            }
        });
    }
});

function renderCheckoutSummary(cart) {
    const container = document.getElementById('checkout-items-list');
    if (!container) return;
    container.innerHTML = '';
    currentSubtotal = 0;

    cart.forEach(item => {
        const itemTotal = (item.product.price || 0) * (item.quantity || 1);
        currentSubtotal += itemTotal;
        const size = item.variant?.size || 'N/A';
        const color = item.variant?.color || 'N/A';

        const html = `
            <div class="summary-item">
                <img src="${item.product.image_url || 'assets/logo.png'}" alt="${item.product.name}" onerror="this.src='assets/logo.png'">
                <div class="summary-item-details">
                    <span class="summary-item-title">${item.product.name}</span>
                    <span class="summary-item-variant">Tam: ${size} | Cor: ${color}</span>
                    <span style="font-size: 12px; color: var(--text-light);">Qtd: ${item.quantity} x ${formatCurrency(item.product.price)}</span>
                </div>
                <span style="font-weight: 800; color: var(--accent); font-size: 14px;">${formatCurrency(itemTotal)}</span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    document.getElementById('checkout-subtotal').textContent = formatCurrency(currentSubtotal);
    updateTotal();
}

window.toggleShippingType = function() {
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    if (!shippingRadio) return;
    
    const shippingType = shippingRadio.value;
    const metroGroup = document.getElementById('metro-group');
    const addressGroup = document.getElementById('address-group');
    const feeEl = document.getElementById('checkout-shipping-fee');

    if (shippingType === 'metro') {
        if (metroGroup) metroGroup.style.display = 'block';
        if (addressGroup) addressGroup.style.display = 'none';
        if (feeEl) feeEl.textContent = formatCurrency(15.00);
    } else {
        if (metroGroup) metroGroup.style.display = 'none';
        if (addressGroup) addressGroup.style.display = 'block';
        if (feeEl) feeEl.textContent = 'A combinar';
    }
    updateTotal();
}

window.applyCoupon = function() {
    const codeInput = document.getElementById('coupon-code');
    if (!codeInput) return;
    
    const code = codeInput.value.trim().toUpperCase();
    if (code === 'AD10') {
        discountAmount = currentSubtotal * 0.10;
        const discountRow = document.getElementById('discount-row');
        const discountVal = document.getElementById('checkout-discount');
        if (discountRow) discountRow.style.display = 'flex';
        if (discountVal) discountVal.textContent = '-' + formatCurrency(discountAmount);
        alert('Cupom aplicado com sucesso! 10% de desconto.');
    } else {
        alert('Cupom inválido ou expirado.');
        discountAmount = 0;
        const discountRow = document.getElementById('discount-row');
        if (discountRow) discountRow.style.display = 'none';
    }
    updateTotal();
}

window.updateTotal = function() {
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    if (!shippingRadio) return;

    const shippingType = shippingRadio.value;
    const fee = shippingType === 'metro' ? 15.00 : 0.00;
    const effectiveSubtotal = Math.max(0, currentSubtotal - discountAmount);
    const totalFinal = effectiveSubtotal + fee;
    
    const totalEl = document.getElementById('checkout-total');
    if (!totalEl) return;

    if (shippingType === 'metro') {
        totalEl.textContent = formatCurrency(totalFinal);
    } else {
        totalEl.textContent = formatCurrency(effectiveSubtotal) + ' + Frete';
    }
}

const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) return;

        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const shippingRadio = document.querySelector('input[name="shipping"]:checked');
        const shippingType = shippingRadio ? shippingRadio.value : 'metro';
        const notes = document.getElementById('client-notes').value.trim();

        let deliveryDetails = '';
        let shippingFeeText = '';

        if (shippingType === 'metro') {
            const station = document.getElementById('metro-station').value;
            if (!station) {
                alert('Por favor, selecione uma estação de metrô.');
                return;
            }
            deliveryDetails = `Retirada em Estação de Metrô: ${station}`;
            shippingFeeText = 'R$ 15,00 (Frete Fixo)';
        } else {
            const cep = document.getElementById('client-cep').value.trim();
            const street = document.getElementById('client-street').value.trim();
            const complement = document.getElementById('client-complement').value.trim();

            if (!cep || !street) {
                alert('Por favor, preencha pelo menos o CEP e o Endereço.');
                return;
            }
            deliveryDetails = `Envio para Endereço: CEP ${cep}, ${street}${complement ? ' - Complemento: ' + complement : ''}`;
            shippingFeeText = 'A combinar';
        }

        let message = `*NOVO PEDIDO - AD COMPANY*\n\n`;
        message += `👤 *Cliente:* ${name}\n`;
        message += `📞 *Telefone:* ${phone}\n`;
        message += `🚚 *Modalidade:* ${deliveryDetails}\n`;
        if (notes) message += `📝 *Obs:* ${notes}\n`;
        message += `\n🛍️ *Itens do Pedido:*\n`;

        let total = 0;
        cart.forEach(item => {
            const itemTotal = (item.product.price || 0) * (item.quantity || 1);
            total += itemTotal;
            const size = item.variant?.size || 'N/A';
            const color = item.variant?.color || 'N/A';
            message += `- ${item.product.name} (Tam: ${size}, Cor: ${color}) x${item.quantity} - ${formatCurrency(itemTotal)}\n`;
        });

        const effectiveSubtotal = Math.max(0, total - discountAmount);
        const finalTotal = shippingType === 'metro' ? effectiveSubtotal + 15.00 : effectiveSubtotal;
        
        message += `\n📦 *Subtotal:* ${formatCurrency(total)}`;
        if (discountAmount > 0) {
            message += `\n🏷️ *Desconto:* -${formatCurrency(discountAmount)}`;
        }
        message += `\n🚚 *Taxa de Entrega:* ${shippingFeeText}`;
        message += `\n💰 *TOTAL:* ${shippingType === 'metro' ? formatCurrency(finalTotal) : formatCurrency(effectiveSubtotal) + ' + Frete a combinar'}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/5511950070636?text=${encodedMessage}`;
        
        localStorage.removeItem('cart');
        window.open(whatsappUrl, '_blank');
        window.location.href = 'index.html';
    });
}