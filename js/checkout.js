
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        window.location.href = 'index.html';
        return;
    }

    const itemsContainer = document.getElementById('checkout-items');
    let subtotal = 0;

    cart.forEach(item => {
        const price = item.product.is_promo ? item.product.promo_price : item.product.price;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        itemsContainer.innerHTML += `
            <div class="checkout-item">
                <img src="${item.product.image_url || 'assets/placeholder.jpg'}">
                <div class="checkout-item-details">
                    <h4>${item.product.name}</h4>
                    <p>Tam: ${item.variant.size} | Cor: ${item.variant.color}</p>
                    <p>Qtd: ${item.quantity} x ${formatCurrency(price)}</p>
                </div>
                <div style="font-weight:bold;">${formatCurrency(itemTotal)}</div>
            </div>
        `;
    });

    // Lógica de cálculo (Desconto e Entrega)
    const discountData = JSON.parse(localStorage.getItem('applied_coupon')) || { value: 0, code: 'Nenhum' };
    let shippingTax = 0;
    
    const renderTotals = () => {
        document.getElementById('chk-subtotal').textContent = formatCurrency(subtotal);
        if (discountData.value > 0) {
            document.getElementById('chk-discount-line').style.display = 'flex';
            document.getElementById('chk-discount').textContent = `- ${formatCurrency(discountData.value)}`;
        }
        
        let total = subtotal - discountData.value + shippingTax;
        
        const deliveryType = document.querySelector('input[name="delivery_type"]:checked')?.value;
        if (deliveryType === 'station') {
            document.getElementById('chk-shipping').textContent = formatCurrency(15);
        } else if (deliveryType === 'address') {
            document.getElementById('chk-shipping').textContent = 'A confirmar no WhatsApp';
            total = subtotal - discountData.value; // Taxa será somada depois
        } else {
            document.getElementById('chk-shipping').textContent = 'Selecione a entrega';
        }
        
        document.getElementById('chk-total').textContent = formatCurrency(total);
    };

    renderTotals();

    // Toggle forms
    document.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'station') {
                document.getElementById('station-section').style.display = 'block';
                document.getElementById('address-section').style.display = 'none';
                shippingTax = 15;
            } else {
                document.getElementById('station-section').style.display = 'none';
                document.getElementById('address-section').style.display = 'block';
                shippingTax = 0;
            }
            renderTotals();
        });
    });

    // Finalizar
    document.getElementById('btn-finish-whatsapp').addEventListener('click', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('cli-nome').value.trim();
        const telefone = document.getElementById('cli-telefone').value.trim();
        const deliveryType = document.querySelector('input[name="delivery_type"]:checked')?.value;
        
        if (!nome || !telefone || !deliveryType) {
            alert('Preencha os campos obrigatórios (Nome, Telefone e Modalidade de Entrega).');
            return;
        }

        let addressDetails = '';
        let stationDetails = '';
        let taxaStr = '';
        
        if (deliveryType === 'station') {
            const station = document.getElementById('station-select').value;
            if (!station) return alert('Selecione uma estação.');
            stationDetails = station;
            addressDetails = `Retirada na estação: ${station}`;
            taxaStr = 'R$ 15,00';
        } else {
            const cep = document.getElementById('end-cep').value;
            const rua = document.getElementById('end-rua').value;
            const num = document.getElementById('end-numero').value;
            if (!cep || !rua || !num) return alert('Preencha CEP, Rua e Número para entrega.');
            addressDetails = `${rua}, ${num} - ${document.getElementById('end-bairro').value} - ${document.getElementById('end-cidade').value}/${document.getElementById('end-estado').value}. CEP: ${cep}`;
            taxaStr = 'A confirmar';
        }

        // Construir mensagem
        let msg = `Olá! Gostaria de fazer um pedido na loja.%0A%0A*DADOS DO PEDIDO*%0A`;
        
        cart.forEach((item, index) => {
            const price = item.product.is_promo ? item.product.promo_price : item.product.price;
            msg += `Produto ${index+1}: ${item.product.name}%0ATamanho: ${item.variant.size}%0ACor: ${item.variant.color}%0AQuantidade: ${item.quantity}%0AValor unitário: ${formatCurrency(price)}%0ASubtotal: ${formatCurrency(price * item.quantity)}%0A%0A`;
        });

        const finalTotal = subtotal - discountData.value + shippingTax;

        msg += `*RESUMO FINANCEIRO*%0ASubtotal dos produtos: ${formatCurrency(subtotal)}%0A`;
        msg += `Cupom utilizado: ${discountData.code}%0ADesconto: ${formatCurrency(discountData.value)}%0A`;
        msg += `Entrega: ${deliveryType === 'station' ? 'Retirada em Estação' : 'Entrega em Endereço'}%0A`;
        if (deliveryType === 'station') msg += `Estação: ${stationDetails}%0A`;
        msg += `Taxa de entrega: ${taxaStr}%0ATotal do pedido: ${deliveryType === 'station' ? formatCurrency(finalTotal) : formatCurrency(finalTotal) + ' + Frete'}%0A%0A`;

        msg += `*DADOS DO CLIENTE*%0ANome: ${nome}%0ATelefone: ${telefone}%0A`;
        msg += `*LOCAL DE ENTREGA/RETIRADA*%0A${addressDetails}%0A`;
        
        const obs = document.getElementById('cli-obs').value;
        if(obs) msg += `Observações: ${obs}%0A`;
        
        msg += `%0AAguardo a confirmação. Obrigado!`;

        // Buscar telefone da loja nas configurações (Simulado para o script. No Supabase usaria uma query)
        const phone = "5511999999999"; // Substituir por config no BD
        
        // Limpar carrinho
        localStorage.removeItem('cart');
        localStorage.removeItem('applied_coupon');
        
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        window.location.href = 'index.html';
    });
});
