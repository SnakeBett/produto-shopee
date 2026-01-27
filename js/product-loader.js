/**
 * Product Loader - Carrega dados do produto da API e renderiza na página
 */

(function() {
    'use strict';

    const API_URL = '/api/products';

    // Get slug from URL
    function getSlugFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    // Fetch product by slug from API
    async function fetchProductBySlug(slug) {
        try {
            const response = await fetch(`${API_URL}?slug=${slug}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch product');
            }
            const product = await response.json();
            
            // Check for preview mode (allows viewing drafts)
            const params = new URLSearchParams(window.location.search);
            const preview = params.get('preview') === '1';
            
            if (!preview && product.status !== 'active') {
                return null;
            }
            
            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }

    // Generate stars HTML
    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '★' : '☆';
        }
        return stars;
    }

    // Format specs as list
    function formatSpecs(specs) {
        if (!specs) return '';
        return specs.split('\n').map(line => `<li>• ${line}</li>`).join('');
    }

    // Format includes as list
    function formatIncludes(includes) {
        if (!includes) return '';
        return includes.split('\n').map(line => line.trim()).filter(line => line).join(' | ');
    }

    // Render product
    function renderProduct(product) {
        const container = document.getElementById('product-container');
        
        // Update page title
        document.getElementById('page-title').textContent = product.title;
        document.title = product.title;

        // Generate carousel images
        const carouselImages = (product.images || []).filter(img => img).map((img, index) => `
            <div class="carousel-item"><img src="${img}" alt="Imagem ${index + 1}"></div>
        `).join('');

        // Generate reviews
        const reviewsHtml = (product.reviews || []).map(review => `
            <div class="review-item">
                <div class="review-user">
                    <img src="images/blank-profile-picture-973460_640-150x150.webp" class="review-avatar" alt="${review.name}">
                    <div>
                        <div class="review-name">${review.name || 'Cliente'}</div>
                        <div class="review-stars">${generateStars(review.rating || 5)}</div>
                    </div>
                </div>
                <p class="review-text">${review.text || ''}</p>
                ${review.image ? `<img src="${review.image}" class="review-image" alt="Foto da avaliação">` : ''}
                <div class="review-date">${review.date || ''}</div>
            </div>
        `).join('');

        // Calculate discount
        const discount = product.discount || Math.round(((product.priceOriginal - product.pricePromo) / product.priceOriginal) * 100);
        
        // Calculate installment value
        const installments = product.installments || 3;
        const installmentValue = product.installmentValue || (product.pricePromo / installments).toFixed(2);

        container.innerHTML = `
            <!-- Header Banner -->
            <div class="header-banner">
                <a href="${product.checkoutUrl || '#'}" style="width: 50%;">
                    <img src="images/Logo%20Shopee%20White-d247f0f6.webp" alt="Logo">
                </a>
                <div class="container_banner">
                    <span>1500 CUPONS DISPONÍVEIS</span>
                    <div class="name_cupom">
                        <h3>DAY WEEK</h3>
                        <h5><span style="font-weight: bold;">|</span> ${discount}% OFF</h5>
                    </div>
                </div>
            </div>

            <!-- Fixed Buttons -->
            <div class="fixed-buttons">
                <a href="${product.checkoutUrl || '#'}">
                    <img src="images/chat.png" alt="Chat">
                </a>
                <a href="${product.checkoutUrl || '#'}">
                    <img src="images/cart.png" alt="Carrinho">
                </a>
            </div>

            <!-- Carousel -->
            <div class="carousel">
                <button class="carousel-btn carousel-prev" onclick="prevSlide()">‹</button>
                <div class="carousel-track" id="carousel-track">
                    ${carouselImages || '<div class="carousel-item"><div style="padding: 50px; text-align: center; color: #999;">Sem imagens</div></div>'}
                </div>
                <button class="carousel-btn carousel-next" onclick="nextSlide()">›</button>
            </div>

            <!-- Price Section -->
            <div class="price-section">
                <div class="price-row">
                    <span class="price-original">R$ ${product.priceOriginal || '0,00'}</span>
                    <span class="discount-badge">-<strong>${discount}%</strong></span>
                </div>
                <div class="price-promo">
                    <span>R$</span>${product.pricePromo || '0,00'}
                </div>
                <div class="promo-badge">
                    <img src="images/promo-relampago.png" alt="Promoção Relâmpago">
                </div>
                <div class="sold-count">${product.sold || 0} Vendidos</div>
            </div>

            <!-- Installments -->
            <div class="installments-section">
                <div class="installments-text">
                    Em até <strong>${installments}x R$${installmentValue}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 12px; color: #666;">TERMINA EM:</span>
                    <div class="countdown">
                        <span class="countdown-item" id="countdown-hours">00</span>
                        <span class="countdown-item" id="countdown-minutes">00</span>
                        <span class="countdown-item" id="countdown-seconds">00</span>
                    </div>
                </div>
            </div>

            <!-- Product Title -->
            <div class="product-title-section">
                <span class="product-tag">Indicado</span>
                <span class="product-title">${product.title || 'Produto sem título'}</span>
            </div>

            <!-- Product Features Banner -->
            <div style="background: #fff; padding: 10px;">
                <img src="images/Rev-1024x61.png" alt="Características" style="width: 100%;">
            </div>

            <!-- Shipping -->
            <div class="shipping-section">
                <img src="images/truck.png" alt="Frete">
                <div class="shipping-text">
                    <strong>Frete:</strong> <span>Grátis</span>
                </div>
            </div>

            <!-- Seller -->
            <div class="seller-section">
                <img src="${product.sellerLogo || 'images/logolar-150x150.png'}" class="seller-logo" alt="${product.sellerName || 'Vendedor'}">
                <div class="seller-info">
                    <h3>${product.sellerName || 'Shopee Brasil'}</h3>
                    <p>${product.sellerLocation || ''}</p>
                </div>
            </div>

            <div class="seller-stats" style="background: #fff; padding: 10px;">
                <img src="images/aval-vend-1024x100.png" alt="Avaliação do Vendedor" style="width: 100%;">
            </div>

            <!-- Description -->
            <div class="description-section">
                <h2>Descrição</h2>
                <div class="description-content">
                    ${product.descTitle ? `<h3>${product.descTitle}</h3>` : ''}
                    ${product.description ? `<p>${product.description}</p>` : ''}
                    
                    ${product.specs ? `
                        <ul style="margin-top: 10px;">
                            ${formatSpecs(product.specs)}
                        </ul>
                    ` : ''}

                    ${product.idealFor ? `<p><strong>• Ideal para:</strong> ${product.idealFor}</p>` : ''}
                    ${product.usage ? `<p><strong>• Utilização:</strong> ${product.usage}</p>` : ''}
                    ${product.includes ? `<p><strong>• Inclui:</strong> ${formatIncludes(product.includes)}</p>` : ''}

                    <p><strong>• Pagamento:</strong> em até <span style="color:#ee4d2d;"><strong>${installments}x sem juros</strong></span> no cartão</p>
                    <p><strong>• Frete Grátis</strong> com rastreio atualizado</p>

                    <div class="guarantee-box">
                        <p style="text-align: center;"><strong>NOSSA GARANTIA</strong></p>
                        <p>📦 <strong>Envio seguro:</strong> Cada pedido inclui detalhes de rastreamento em tempo real e cobertura de seguro.</p>
                        <p>💰 <strong>Garantia de devolução:</strong> Se seus itens chegarem danificados ou apresentarem defeito dentro de 30 dias, teremos o prazer de emitir uma substituição ou reembolso.</p>
                        <p style="color: #ee4d2d;"><strong>• Garantia de 90 dias com Suporte Premium.</strong></p>
                    </div>
                </div>
            </div>

            <!-- Reviews -->
            ${(product.reviews && product.reviews.length > 0) ? `
                <div class="reviews-section">
                    <div class="review-header">
                        <img src="images/aval-nota-1024x242.png" alt="Avaliações">
                    </div>
                    ${reviewsHtml}
                </div>
            ` : ''}

            <!-- Footer space -->
            <div class="footer-space"></div>

            <!-- Fixed Buy Button -->
            <a href="${product.checkoutUrl || '#'}" class="btn-comprar-fixo">Comprar agora</a>
        `;

        // Initialize carousel
        initCarousel();
        
        // Initialize countdown
        initCountdown();
    }

    // Show error
    function showError(message) {
        const container = document.getElementById('product-container');
        container.innerHTML = `
            <div class="error-message">
                <h2>Produto não encontrado</h2>
                <p>${message}</p>
                <p style="margin-top: 20px;">
                    <a href="index.html">← Voltar para a página inicial</a>
                </p>
            </div>
        `;
    }

    // Carousel functionality
    let currentSlide = 0;
    let totalSlides = 0;

    function initCarousel() {
        const track = document.getElementById('carousel-track');
        if (track) {
            totalSlides = track.children.length;
        }
    }

    window.nextSlide = function() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    };

    window.prevSlide = function() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    };

    function updateCarousel() {
        const track = document.getElementById('carousel-track');
        if (track) {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
    }

    // Touch support for carousel
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                window.nextSlide();
            } else {
                window.prevSlide();
            }
        }
    }

    // Countdown timer
    function initCountdown() {
        // Set countdown to 10 minutes from now
        let totalSeconds = 600;

        function updateCountdown() {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const hoursEl = document.getElementById('countdown-hours');
            const minutesEl = document.getElementById('countdown-minutes');
            const secondsEl = document.getElementById('countdown-seconds');

            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

            if (totalSeconds > 0) {
                totalSeconds--;
                setTimeout(updateCountdown, 1000);
            } else {
                // Reset countdown
                totalSeconds = 600;
                updateCountdown();
            }
        }

        updateCountdown();
    }

    // Initialize
    async function init() {
        const slug = getSlugFromUrl();
        
        if (!slug) {
            showError('Nenhum produto especificado. Use ?slug=nome-do-produto na URL.');
            return;
        }

        // Show loading state
        const container = document.getElementById('product-container');
        container.innerHTML = '<div class="loading">Carregando produto...</div>';

        const product = await fetchProductBySlug(slug);
        
        if (!product) {
            showError(`Produto "${slug}" não encontrado ou não está ativo.`);
            return;
        }

        renderProduct(product);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
