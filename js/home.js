// Lógica do Carrossel de Banners
let slideAtual = 0;
function moverCarrossel(direcao) {
    const slide = document.getElementById('carrossel-slide');
    if (!slide) return;
    const totalSlides = document.querySelectorAll('.carrossel-img').length;
    slideAtual = (slideAtual + direcao + totalSlides) % totalSlides;
    slide.style.transform = `translateX(-${slideAtual * 100}%)`;
}

// Roda o carrossel automaticamente a cada 5 segundos
setInterval(() => moverCarrossel(1), 5000);

// Função para extrair com segurança a PRIMEIRA foto salva como capa do produto
function getCoverImage(product) {
    if (!product) return 'assets/logo.png';

    let raw = product.image_url || product.images || product.fotos || product.foto;
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

// Lógica de Carregamento da Home (Produtos e Carrinho)
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Atualizar o contador do carrinho no cabeçalho
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = totalItems;

    // 2. Carregar os produtos em destaque do Supabase
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    // Seleciona todas as colunas para capturar images/fotos independentemente de onde foram salvas
    const { data: products, error } = await supabase
        .from('products')
        .select(`*`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
        
    if (error) {
        console.error(error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Erro ao carregar produtos.</p>';
        return;
    }
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    
    grid.innerHTML = '';
    products.forEach(p => {
        const coverUrl = getCoverImage(p);

        const priceHTML = p.is_promo 
            ? `<span style="text-decoration: line-through; color: var(--text-light); margin-right: 8px; font-size: 12px;">${formatCurrency(p.price)}</span><span style="color: var(--accent); font-weight: 800;">${formatCurrency(p.promo_price)}</span>`
            : `<span style="color: var(--accent); font-weight: 800;">${formatCurrency(p.price)}</span>`;
            
        const badge = p.is_promo ? '<span style="background: var(--accent); color: white; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 4px; display: inline-block; margin-bottom: 5px;">PROMOÇÃO</span>' : '';
        
        const card = `
            <a href="produto.html?id=${p.id}" class="product-card">
                ${badge}
                <img src="${coverUrl}" alt="${p.name}" class="product-img" onerror="this.onerror=null; this.src='assets/logo.png';">
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <div class="price-container">${priceHTML}</div>
                </div>
            </a>
        `;
        grid.innerHTML += card;
    });
});