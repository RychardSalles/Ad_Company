
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('featured-grid');
    
    // Buscar produtos ativos (limite 4 para home)
    const { data: products, error } = await supabase
        .from('products')
        .select(`id, name, price, promo_price, is_promo, image_url`)
        .eq('is_active', true)
        .limit(4);
        
    if (error) {
        console.error(error);
        grid.innerHTML = '<p>Erro ao carregar produtos.</p>';
        return;
    }
    
    if (products.length === 0) {
        grid.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
        return;
    }
    
    grid.innerHTML = '';
    products.forEach(p => {
        const priceHTML = p.is_promo 
            ? `<span class="old-price">${formatCurrency(p.price)}</span><span class="promo-price">${formatCurrency(p.promo_price)}</span>`
            : `<span class="product-price">${formatCurrency(p.price)}</span>`;
            
        const badge = p.is_promo ? '<span class="badge">PROMOÇÃO</span>' : '';
        
        const card = `
            <a href="produto.html?id=${p.id}" class="product-card">
                ${badge}
                <img src="${p.image_url || 'assets/placeholder.jpg'}" alt="${p.name}" class="product-img">
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <div class="price-container">${priceHTML}</div>
                </div>
            </a>
        `;
        grid.innerHTML += card;
    });
});
