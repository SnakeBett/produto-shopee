/**
 * Product Loader - Carrega dados do produto da API e renderiza na página
 * Design moderno dark mode
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
        const fullStars = Math.floor(rating || 5);
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < fullStars ? '★' : '☆';
        }
        return stars;
    }

    // Format specs as list
    function formatSpecs(specs) {
        if (!specs) return '';
        return specs.split('\n').filter(l => l.trim()).map(line => `<li>${line}</li>`).join('');
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

        // Calculate values
        const discount = product.discount || Math.round(((product.priceOriginal - product.pricePromo) / product.priceOriginal) * 100);
        const installments = product.installments || 3;
        const installmentValue = (product.pricePromo / installments).toFixed(2);
        const images = (product.images || []).filter(img => img);
        
        // Generate gallery slides
        const gallerySlides = images.length > 0 
            ? images.map((img, i) => `<div class="gallery-slide"><img src="${img}" alt="Imagem ${i + 1}"></div>`).join('')
            : '<div class="gallery-slide" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);">Sem imagens</div>';
        
        // Generate gallery dots
        const galleryDots = images.length > 1 
            ? images.map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')
            : '';

        // Generate reviews
        const reviewsHtml = (product.reviews || []).map(review => `
            <div class="review-item">
                <div class="review-user">
                    <img src="images/blank-profile-picture-973460_640-150x150.webp" class="review-avatar" alt="${review.name}">
                    <div class="review-user-info">
                        <h4>${review.name || 'Cliente'}</h4>
                        <div class="stars">${generateStars(review.rating)}</div>
                    </div>
                </div>
                <p class="review-text">${review.text || ''}</p>
                ${review.image ? `<img src="${review.image}" class="review-image" alt="Foto">` : ''}
                <div class="review-date">${review.date || ''}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <!-- Header -->
            <header class="header">
                <div class="header-logo">
                    <div class="header-logo-icon">🛒</div>
                    <span class="header-logo-text">Shop</span>
                </div>
                <div class="header-badge">
                    <span class="pulse"></span>
                    <span>${discount}% OFF</span>
                </div>
            </header>

            <div class="main-container">
                <!-- Gallery -->
                <div class="gallery">
                    <div class="discount-tag">-${discount}% OFF</div>
                    <div class="gallery-track" id="gallery-track">
                        ${gallerySlides}
                    </div>
                    ${images.length > 1 ? `
                        <button class="gallery-btn prev" onclick="prevSlide()">‹</button>
                        <button class="gallery-btn next" onclick="nextSlide()">›</button>
                        <div class="gallery-nav" id="gallery-nav">${galleryDots}</div>
                    ` : ''}
                </div>

                <!-- Product Info -->
                <div class="product-info">
                    <h1 class="product-title">${product.title || 'Produto sem título'}</h1>
                    <div class="product-rating">
                        <span class="stars">${generateStars(5)}</span>
                        <span class="rating-text">5.0 (${product.reviews?.length || 0} avaliações)</span>
                        <span class="sold-badge">${product.sold || 0} vendidos</span>
                    </div>
                </div>

                <!-- Price Section -->
                <div class="price-section">
                    <div class="price-row">
                        <span class="price-original">R$ ${product.priceOriginal || '0,00'}</span>
                        <span class="price-current"><small>R$</small> ${product.pricePromo || '0,00'}</span>
                    </div>
                    <div class="installments">
                        ou <strong>${installments}x de R$ ${installmentValue}</strong> sem juros
                    </div>
                    
                    <div class="countdown-section">
                        <span class="countdown-label">Oferta termina em</span>
                        <div class="countdown">
                            <span class="countdown-item" id="countdown-hours">00</span>
                            <span class="countdown-item" id="countdown-minutes">00</span>
                            <span class="countdown-item" id="countdown-seconds">00</span>
                        </div>
                    </div>
                </div>

                <!-- Benefits -->
                <div class="benefits">
                    <div class="benefit-item">
                        <div class="benefit-icon">🚚</div>
                        <div class="benefit-text">
                            <h4>Frete Grátis</h4>
                            <p>Entrega rápida para todo Brasil</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-icon">🔒</div>
                        <div class="benefit-text">
                            <h4>Compra Segura</h4>
                            <p>Seus dados protegidos</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-icon">✅</div>
                        <div class="benefit-text">
                            <h4>Garantia de 90 dias</h4>
                            <p>Devolução sem complicação</p>
                        </div>
                    </div>
                </div>

                <!-- Seller -->
                <div class="seller-section">
                    <img src="${product.sellerLogo || 'images/logolar-150x150.png'}" class="seller-avatar" alt="${product.sellerName || 'Vendedor'}">
                    <div class="seller-info">
                        <h3>${product.sellerName || 'Loja Oficial'}</h3>
                        <p>${product.sellerLocation || 'Brasil'}</p>
                    </div>
                    <div class="seller-badge">
                        <span>✓</span> Verificado
                    </div>
                </div>

                <!-- Description -->
                <div class="description">
                    <div class="description-header">
                        <span>📋</span>
                        <h2>Descrição</h2>
                    </div>
                    <div class="description-content">
                        ${product.descTitle ? `<h3>${product.descTitle}</h3>` : ''}
                        ${product.description ? `<p>${product.description}</p>` : ''}
                        
                        ${product.specs ? `<ul>${formatSpecs(product.specs)}</ul>` : ''}
                        
                        ${product.idealFor ? `<p><strong>Ideal para:</strong> ${product.idealFor}</p>` : ''}
                        ${product.usage ? `<p><strong>Utilização:</strong> ${product.usage}</p>` : ''}
                        ${product.includes ? `<p><strong>Inclui:</strong> ${formatIncludes(product.includes)}</p>` : ''}

                        <div class="guarantee-box">
                            <h4>🛡️ NOSSA GARANTIA</h4>
                            <p><strong>📦 Envio seguro:</strong> Rastreamento em tempo real + cobertura de seguro.</p>
                            <p><strong>💰 Garantia de devolução:</strong> Se chegar danificado, devolvemos seu dinheiro.</p>
                            <p><strong>⭐ Suporte Premium:</strong> Atendimento prioritário por 90 dias.</p>
                        </div>
                    </div>
                </div>

                <!-- Reviews -->
                ${(product.reviews && product.reviews.length > 0) ? `
                    <div class="reviews-section">
                        <div class="reviews-header">
                            <h2>Avaliações</h2>
                            <div class="reviews-score">
                                <span class="stars">${generateStars(5)}</span>
                                <span>(${product.reviews.length})</span>
                            </div>
                        </div>
                        ${reviewsHtml}
                    </div>
                ` : ''}
            </div>

            <!-- Fixed CTA -->
            <div class="cta-fixed">
                <a href="${product.checkoutUrl || '#'}" class="cta-button">
                    Comprar Agora - R$ ${product.pricePromo || '0,00'}
                </a>
            </div>
        `;

        // Initialize carousel
        initGallery(images.length);
        
        // Initialize countdown
        initCountdown();
    }

    // Show error
    function showError(message) {
        const container = document.getElementById('product-container');
        container.innerHTML = `
            <div class="error-message">
                <h2>😕 Produto não encontrado</h2>
                <p>${message}</p>
                <p><a href="index.html">← Voltar para a página inicial</a></p>
            </div>
        `;
    }

    // Gallery functionality
    let currentSlide = 0;
    let totalSlides = 0;

    function initGallery(slides) {
        totalSlides = slides;
        
        // Add touch support
        const track = document.getElementById('gallery-track');
        if (track && totalSlides > 1) {
            let startX = 0;
            let isDragging = false;
            
            track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            });
            
            track.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        window.nextSlide();
                    } else {
                        window.prevSlide();
                    }
                }
                isDragging = false;
            });
        }
        
        // Add dot click handlers
        const dots = document.querySelectorAll('.gallery-dot');
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => goToSlide(i));
        });
    }

    window.nextSlide = function() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateGallery();
    };

    window.prevSlide = function() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateGallery();
    };

    function goToSlide(index) {
        currentSlide = index;
        updateGallery();
    }

    function updateGallery() {
        const track = document.getElementById('gallery-track');
        if (track) {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Update dots
        const dots = document.querySelectorAll('.gallery-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Countdown timer
    function initCountdown() {
        let totalSeconds = 600; // 10 minutes

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
