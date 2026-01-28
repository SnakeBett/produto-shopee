/**
 * Product Loader - Carrega dados do produto da API e renderiza na página
 * Estrutura idêntica ao index.html
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

    // Generate stars HTML (SVG igual ao index.html)
    function generateStarsSVG(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `
                <div class="e-icon">
                    <div class="e-icon-wrapper e-icon-marked">
                        <svg aria-hidden="true" class="e-font-icon-svg e-eicon-star" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                            <path d="M450 75L338 312 88 350C46 354 25 417 58 450L238 633 196 896C188 942 238 975 275 954L500 837 725 954C767 975 813 942 804 896L763 633 942 450C975 417 954 358 913 350L663 312 550 75C529 33 471 33 450 75Z"></path>
                        </svg>
                    </div>
                    <div class="e-icon-wrapper e-icon-unmarked">
                        <svg aria-hidden="true" class="e-font-icon-svg e-eicon-star" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                            <path d="M450 75L338 312 88 350C46 354 25 417 58 450L238 633 196 896C188 942 238 975 275 954L500 837 725 954C767 975 813 942 804 896L763 633 942 450C975 417 954 358 913 350L663 312 550 75C529 33 471 33 450 75Z"></path>
                        </svg>
                    </div>
                </div>
            `;
        }
        return stars;
    }

    // Render product with same structure as index.html
    function renderProduct(product) {
        const container = document.getElementById('product-container');
        
        // Update page title
        document.getElementById('page-title').textContent = product.title;
        document.title = product.title;

        // Calculate discount
        const priceOriginal = parseFloat(product.priceOriginal) || 299.90;
        const pricePromo = parseFloat(product.pricePromo) || 0;
        const discountPercent = Math.round(((priceOriginal - pricePromo) / priceOriginal) * 100);
        
        // Calculate installments
        const installments = product.installments || 3;
        const installmentValue = (pricePromo / installments).toFixed(2);

        // Generate carousel images HTML
        const carouselImages = (product.images || []).filter(img => img).map((img, index) => `
            <div class="carousel-item-xz12b3"><img src="${img}" alt="Imagem ${index + 1}"></div>
        `).join('');

        // Generate reviews HTML (same structure as index.html)
        const reviewsHtml = (product.reviews || []).map((review, idx) => `
            <div class="elementor-element elementor-element-review-${idx} e-flex e-con-boxed e-con e-parent e-lazyloaded" data-element_type="container" style="background: #fff;">
                <div class="e-con-inner">
                    <!-- Avatar -->
                    <div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container">
                        <div class="elementor-element elementor-widget elementor-widget-image" data-element_type="widget">
                            <div class="elementor-widget-container">
                                <img loading="lazy" decoding="async" width="150" height="150" src="images/blank-profile-picture-973460_640-150x150.webp" class="attachment-thumbnail size-thumbnail" alt="" style="border-radius: 50%;">
                            </div>
                        </div>
                    </div>
                    <!-- Name, Stars, Text -->
                    <div class="elementor-element elementor-element-1516b7be e-con-full e-flex e-con e-child" data-element_type="container">
                        <div class="elementor-element elementor-widget elementor-widget-text-editor" data-element_type="widget">
                            <div class="elementor-widget-container" style="padding: 20px; margin-left: -17px; margin-top: -10px;">
                                <p>${review.name || 'Cliente'}</p>
                            </div>
                        </div>
                        <div class="elementor-element elementor-widget elementor-widget-rating" data-element_type="widget">
                            <div class="elementor-widget-container">
                                <div class="e-rating" itemtype="https://schema.org/Rating" itemscope="" itemprop="reviewRating">
                                    <meta itemprop="worstRating" content="0">
                                    <meta itemprop="bestRating" content="5">
                                    <div class="e-rating-wrapper" itemprop="ratingValue" content="${review.rating || 5}" role="img" aria-label="Classificado como ${review.rating || 5} de 5">
                                        ${generateStarsSVG(review.rating || 5)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elementor-element elementor-widget elementor-widget-text-editor" data-element_type="widget">
                            <div class="elementor-widget-container">
                                <p>${review.text || ''}</p>
                            </div>
                        </div>
                    </div>
                    <!-- Empty spacer -->
                    <div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container"></div>
                    <!-- Review image -->
                    ${review.image ? `
                    <div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container">
                        <div class="elementor-element elementor-widget elementor-widget-image" data-element_type="widget">
                            <div class="elementor-widget-container">
                                <img src="${review.image}" alt="" style="border-radius: 10px; max-width: 150px;">
                            </div>
                        </div>
                    </div>
                    ` : '<div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container"></div>'}
                    <!-- Empty spacer -->
                    <div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container"></div>
                    <!-- Date -->
                    <div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container">
                        <div class="elementor-element elementor-widget elementor-widget-text-editor" data-element_type="widget">
                            <div class="elementor-widget-container">
                                <p>${review.date || ''}</p>
                            </div>
                        </div>
                    </div>
                    <!-- Divider -->
                    <div class="elementor-element e-con-full e-flex e-con e-child" data-element_type="container">
                        <div class="elementor-element elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-element_type="widget">
                            <div class="elementor-widget-container">
                                <div class="elementor-divider">
                                    <span class="elementor-divider-separator"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <!-- Header Banner (igual ao index) -->
            <div class="sc-hLQRIN jiNjgB">
                <a href="${product.checkoutUrl || '#'}" style="width: 50%;" id="umdoistrestplink1">
                    <img src="images/Logo%20Shopee%20White-d247f0f6.webp" alt="Logo">
                </a>
                <div class="container_banner">
                    <span>1500 CUPONS DISPONÍVEIS</span>
                    <div class="name_cupom">
                        <h3 class="animated-heading">DAY WEEK</h3>
                        <h5><span style="font-weight: bold;">|</span> ${discountPercent}% OFF</h5>
                    </div>
                </div>
            </div>

            <style>
                .jiNjgB {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 10px;
                    background: linear-gradient(181deg, rgb(245, 63, 45), rgb(254, 99, 50) 87%);
                }
                .jiNjgB img { width: 100%; }
                .jiNjgB .container_banner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    color: rgb(255, 255, 255);
                    border: 1px solid rgb(255, 255, 255);
                    padding: 0.2em;
                    max-width: 80%;
                }
                .jiNjgB .container_banner>span { font-size: 10px; }
                .jiNjgB .name_cupom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                }
                .jiNjgB .name_cupom>h3 {
                    font-size: 16px;
                    color: rgb(0, 221, 220);
                    animation: shake 1s infinite;
                    margin: 0;
                }
                .jiNjgB .name_cupom>h5 {
                    font-size: 10px;
                    color: rgb(255, 255, 255);
                    margin: 0;
                }
                .jiNjgB .name_cupom>h5>span {
                    margin-right: 5px;
                    margin-left: 3px;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
                @media screen and (min-width: 768px) {
                    .jiNjgB { justify-content: center; }
                    .jiNjgB img { width: 150px; }
                    .jiNjgB .container_banner { display: none; }
                }
            </style>

            <!-- Fixed Buttons (igual ao index) -->
            <div class="elementor-element elementor-element-20800a52 e-con-full e-flex e-con e-parent e-lazyloaded" style="position:fixed; right: 10px; top: 50%; transform: translateY(-50%); z-index: 1000;">
                <div class="elementor-element e-con-full e-flex e-con e-child" style="background: #25d366; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <a href="${product.checkoutUrl || '#'}">
                        <img decoding="async" width="30" height="30" src="images/chat.png" alt="">
                    </a>
                </div>
                <div class="elementor-element e-con-full e-flex e-con e-child" style="background: #25d366; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <a href="${product.checkoutUrl || '#'}">
                        <img decoding="async" width="30" height="30" src="images/cart.png" alt="">
                    </a>
                </div>
            </div>

            <!-- Carousel (igual ao index - carousel-xz12b3) -->
            <style>
                .carousel-xz12b3 {
                    position: relative;
                    width: 100%;
                    max-width: 100%;
                    overflow: hidden;
                    border-radius: 10px;
                }
                .carousel-track-xz12b3 {
                    display: flex;
                    transition: transform 0.3s ease-in-out;
                    width: 100%;
                }
                .carousel-item-xz12b3 {
                    min-width: 100%;
                    user-select: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .carousel-item-xz12b3 img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .carousel-btn-xz12b3 {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background-color: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    cursor: pointer;
                    padding: 10px 14px;
                    border-radius: 5px;
                    z-index: 10;
                    font-size: 24px;
                    line-height: 1;
                    font-weight: bold;
                }
                .carousel-prev-xz12b3 { left: 10px; }
                .carousel-next-xz12b3 { right: 10px; }
            </style>
            <div class="carousel-xz12b3">
                <button class="carousel-btn-xz12b3 carousel-prev-xz12b3" type="button" aria-label="Anterior">‹</button>
                <div class="carousel-track-xz12b3">
                    ${carouselImages || '<div class="carousel-item-xz12b3"><div style="padding: 50px; text-align: center; color: #999;">Sem imagens</div></div>'}
                </div>
                <button class="carousel-btn-xz12b3 carousel-next-xz12b3" type="button" aria-label="Próximo">›</button>
            </div>

            <!-- Price Section (igual ao index) -->
            <div class="elementor-element elementor-element-4b528ec2 e-flex e-con-boxed e-con e-parent" style="background: #fff;">
                <div class="e-con-inner">
                    <div class="elementor-element e-con-full e-flex e-con e-child">
                        <div class="elementor-element elementor-widget elementor-widget-heading">
                            <div class="elementor-widget-container">
                                <h2 class="elementor-heading-title elementor-size-default"><strike>R$ ${priceOriginal.toFixed(2).replace('.', ',')}</strike> <span style="background-color:#ffe97a;color:#ee4d2d;padding-left:2px;padding-right: 2px;font-size:14px;vertical-align:center">-<strong>${discountPercent}%</strong></span></h2>
                            </div>
                        </div>
                        <div class="elementor-element elementor-widget elementor-widget-heading">
                            <div class="elementor-widget-container">
                                <h2 class="elementor-heading-title elementor-size-default" style="font-size: 28px; font-weight: 700; color: #ee4d2d;"><span style="font-size:18px">R$</span>${pricePromo.toFixed(2).replace('.', ',')}</h2>
                            </div>
                        </div>
                    </div>
                    <div class="elementor-element e-con-full e-flex e-con e-child">
                        <div class="elementor-element elementor-widget elementor-widget-image">
                            <div class="elementor-widget-container">
                                <img loading="lazy" decoding="async" src="images/promo-relampago.png" alt="" style="max-width: 200px;">
                            </div>
                        </div>
                        <div class="elementor-element elementor-widget elementor-widget-text-editor">
                            <div class="elementor-widget-container">
                                <p style="color: #666; font-size: 13px;">${product.sold || 2799} Vendidos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Installments & Countdown (igual ao index) -->
            <div class="elementor-element e-flex e-con-boxed e-con e-parent" style="background: #fff; border-top: 1px solid #eee;">
                <div class="e-con-inner" style="display: flex; justify-content: space-between; align-items: center; padding: 15px;">
                    <div class="elementor-element e-con-full e-flex e-con e-child">
                        <div class="elementor-element elementor-widget elementor-widget-heading">
                            <div class="elementor-widget-container">
                                <h2 class="elementor-heading-title elementor-size-default" style="font-size: 14px;">Em até <strong style="font-weight:600">${installments}x R$${installmentValue.replace('.', ',')}</strong></h2>
                            </div>
                        </div>
                    </div>
                    <div class="elementor-element e-con-full e-flex e-con e-child" style="display: flex; align-items: center; gap: 10px;">
                        <div class="elementor-element elementor-widget elementor-widget-text-editor">
                            <div class="elementor-widget-container">
                                <p style="font-size: 12px; color: #666;">TERMINA EM:</p>
                            </div>
                        </div>
                        <div class="elementor-countdown-wrapper" style="display: flex; gap: 5px;">
                            <div class="elementor-countdown-item" style="background: #ee4d2d; color: white; padding: 5px 8px; border-radius: 4px; font-weight: 600; font-size: 14px;"><span class="elementor-countdown-hours">00</span></div>
                            <div class="elementor-countdown-item" style="background: #ee4d2d; color: white; padding: 5px 8px; border-radius: 4px; font-weight: 600; font-size: 14px;"><span class="elementor-countdown-minutes">00</span></div>
                            <div class="elementor-countdown-item" style="background: #ee4d2d; color: white; padding: 5px 8px; border-radius: 4px; font-weight: 600; font-size: 14px;"><span class="elementor-countdown-seconds">00</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product Title (igual ao index - com tag Indicado) -->
            <div class="elementor-element elementor-element-1d04633e e-con-full e-flex e-con e-parent" style="background: #fff; border-top: 1px solid #eee; padding: 15px;">
                <div class="elementor-element elementor-widget elementor-widget-heading">
                    <div class="elementor-widget-container">
                        <h2 class="elementor-heading-title elementor-size-default" style="font-size: 16px; font-weight: 500; line-height: 1.4;"><span style="background-color:#ee4d2d;color:white;border-radius:4px;padding:3px;font-size:12px;margin-right:8px;">Indicado</span>${product.title || 'Produto sem título'}</h2>
                    </div>
                </div>
            </div>

            <!-- Features Banner (igual ao index) -->
            <div class="elementor-element e-con-full e-flex e-con e-parent" style="background: #fff; padding: 10px;">
                <div class="elementor-element elementor-widget elementor-widget-image">
                    <div class="elementor-widget-container">
                        <img loading="lazy" decoding="async" src="images/Rev-1024x61.png" alt="" style="width: 100%;">
                    </div>
                </div>
            </div>

            <!-- Shipping (igual ao index) -->
            <div class="elementor-element e-con-full e-flex e-con e-parent" style="background: #fff; padding: 15px; display: flex; align-items: center; gap: 15px; border-top: 1px solid #eee;">
                <div class="elementor-element e-con-full e-flex e-con e-child">
                    <div class="elementor-element elementor-widget elementor-widget-image">
                        <div class="elementor-widget-container">
                            <img loading="lazy" decoding="async" width="60" height="41" src="images/truck.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="elementor-element e-con-full e-flex e-con e-child">
                    <div class="elementor-element elementor-widget elementor-widget-text-editor">
                        <div class="elementor-widget-container">
                            <p style="font-size: 14px;"><strong>Frete:</strong><span style="color: #ee4d2d;"> Grátis</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Seller (igual ao index) -->
            <div class="elementor-element e-con-full e-flex e-con e-parent" style="background: #fff; padding: 15px; display: flex; align-items: center; gap: 15px; border-top: 1px solid #eee;">
                <div class="elementor-element elementor-widget elementor-widget-image">
                    <div class="elementor-widget-container">
                        <img loading="lazy" decoding="async" width="60" height="60" src="${product.sellerLogo || 'images/logolar-150x150.png'}" alt="" style="border-radius: 50%;">
                    </div>
                </div>
                <div class="elementor-element elementor-widget elementor-widget-text-editor">
                    <div class="elementor-widget-container">
                        <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 5px;">${product.sellerName || 'Shopee Brasil'}</h3>
                        <p style="font-size: 12px; color: #666;">${product.sellerLocation || 'São Paulo, SP'}</p>
                    </div>
                </div>
            </div>

            <!-- Seller Stats (igual ao index) -->
            <div class="elementor-element e-con-full e-flex e-con e-parent" style="background: #fff; padding: 10px;">
                <div class="elementor-element elementor-widget elementor-widget-image">
                    <div class="elementor-widget-container">
                        <img loading="lazy" decoding="async" src="images/aval-vend-1024x100.png" alt="" style="width: 100%;">
                    </div>
                </div>
            </div>

            <!-- Description (igual ao index) -->
            <div class="elementor-element e-con-full e-flex e-con e-parent" style="background: #fff; padding: 20px; margin-top: 10px;">
                <div class="elementor-element elementor-widget elementor-widget-heading" style="width: 100%;">
                    <div class="elementor-widget-container">
                        <h2 style="font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">Descrição</h2>
                    </div>
                </div>
                <div class="elementor-element elementor-widget elementor-widget-text-editor" style="width: 100%;">
                    <div class="elementor-widget-container" style="padding: 18px; font-family: 'Roboto', sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
                        ${product.descTitle ? `<h3 style="color: #ee4d2d; font-size: 16px; margin-bottom: 10px;">${product.descTitle}</h3>` : ''}
                        ${product.description ? `<p style="margin-bottom: 10px;">${product.description}</p>` : ''}
                        
                        ${product.specs ? `<ul style="list-style: none; padding-left: 0; margin: 10px 0;">${product.specs.split('\n').map(line => `<li style="padding: 3px 0;">• ${line}</li>`).join('')}</ul>` : ''}
                        
                        ${product.idealFor ? `<p><strong>• Ideal para:</strong> ${product.idealFor}</p>` : ''}
                        ${product.usage ? `<p><strong>• Utilização:</strong> ${product.usage}</p>` : ''}
                        ${product.includes ? `<p><strong>• Inclui:</strong> ${product.includes.split('\n').map(line => line.trim()).filter(line => line).join(' | ')}</p>` : ''}
                        
                        <p><strong>• Pagamento:</strong> em até <span style="color:#ee4d2d;"><strong>${installments}x sem juros</strong></span> no cartão</p>
                        <p><strong>• Frete Grátis</strong> com rastreio atualizado</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <p style="text-align: center; margin-bottom: 10px;"><strong>NOSSA GARANTIA</strong></p>
                            <p style="margin-bottom: 10px;">📦 <strong>Envio seguro:</strong> Cada pedido inclui detalhes de rastreamento em tempo real e cobertura de seguro.</p>
                            <p style="margin-bottom: 10px;">💰 <strong>Garantia de devolução:</strong> Se seus itens chegarem danificados ou apresentarem defeito dentro de 30 dias, teremos o prazer de emitir uma substituição ou reembolso.</p>
                            <p style="color: #ee4d2d;"><strong>• Garantia de 90 dias com Suporte Premium.</strong></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reviews Header (igual ao index) -->
            ${(product.reviews && product.reviews.length > 0) ? `
            <div class="elementor-element e-con-full e-flex e-con e-parent" style="background: #fff; padding: 20px; margin-top: 10px;">
                <div class="elementor-element elementor-widget elementor-widget-image" style="width: 100%;">
                    <div class="elementor-widget-container">
                        <img loading="lazy" decoding="async" src="images/aval-nota-1024x242.png" alt="" style="width: 100%;">
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Reviews List (igual ao index) -->
            <style>
                .e-rating { display: inline-flex; }
                .e-rating-wrapper { display: flex; gap: 2px; }
                .e-icon { display: inline-flex; position: relative; }
                .e-icon-wrapper { display: flex; }
                .e-icon-marked { color: #ffc107; }
                .e-icon-unmarked { position: absolute; top: 0; left: 0; color: transparent; }
                .e-font-icon-svg { width: 16px; height: 16px; fill: currentColor; }
                .elementor-divider { padding: 10px 0; }
                .elementor-divider-separator { display: block; border-top: 1px solid #eee; }
            </style>
            ${reviewsHtml}

            <!-- Footer -->
            <div style="padding: 20px; font-size: 12px; background: #f5f5f5;">
                <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1; min-width: 150px;">
                        <p><strong>ATENDIMENTO AO CLIENTE</strong></p>
                        <p>Central de Ajuda</p>
                        <p>Como Comprar</p>
                        <p>Métodos de Pagamento</p>
                        <p>Garantia</p>
                        <p>Devolução e Reembolso</p>
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <p><strong>SOBRE</strong></p>
                        <p>Sobre Nós</p>
                        <p>Políticas</p>
                        <p>Política de Privacidade</p>
                        <p>Blog</p>
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <p><strong>PAGAMENTO</strong></p>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;">
                            <img src="images/visa.svg" alt="visa" width="40" height="25" style="background: #fff; border-radius: 4px;">
                            <img src="images/mastercard.svg" alt="mastercard" width="40" height="25" style="background: #fff; border-radius: 4px;">
                            <img src="images/amex.svg" alt="amex" width="40" height="25" style="background: #fff; border-radius: 4px;">
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p>© 2025 Todos os direitos reservados.</p>
                </div>
            </div>

            <!-- Footer space for fixed button -->
            <div style="height: 60px;"></div>

            <!-- Fixed Buy Button (igual ao index) -->
            <a href="${product.checkoutUrl || '#'}" id="clickbotao" style="position: fixed; bottom: 0; left: 0; right: 0; background: #ee4d2d; color: white; text-align: center; padding: 15px; font-weight: 600; font-size: 16px; text-decoration: none; z-index: 1000;">Comprar agora</a>
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
            <div style="text-align: center; padding: 50px; color: #666;">
                <h2 style="color: #ee4d2d; margin-bottom: 15px;">Produto não encontrado</h2>
                <p>${message}</p>
                <p style="margin-top: 20px;">
                    <a href="index.html" style="color: #ee4d2d; text-decoration: none;">← Voltar para a página inicial</a>
                </p>
            </div>
        `;
    }

    // Carousel functionality
    let currentSlide = 0;
    let totalSlides = 0;

    function initCarousel() {
        const track = document.querySelector('.carousel-track-xz12b3');
        const prevButton = document.querySelector('.carousel-prev-xz12b3');
        const nextButton = document.querySelector('.carousel-next-xz12b3');
        
        if (!track) return;
        
        totalSlides = document.querySelectorAll('.carousel-item-xz12b3').length;
        
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateCarousel();
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateCarousel();
            });
        }
        
        // Touch support
        let startX = 0;
        let endX = 0;
        
        track.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        track.addEventListener('touchmove', function(e) {
            endX = e.touches[0].clientX;
        });
        
        track.addEventListener('touchend', function() {
            if (startX - endX > 50) {
                currentSlide = (currentSlide + 1) % totalSlides;
            } else if (endX - startX > 50) {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            }
            updateCarousel();
        });
    }

    function updateCarousel() {
        const track = document.querySelector('.carousel-track-xz12b3');
        if (track) {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
    }

    // Countdown timer (igual ao index)
    function initCountdown() {
        const countdownWrapper = document.querySelector('.elementor-countdown-wrapper');
        if (!countdownWrapper) return;

        let hours = 2;
        let minutes = 59;
        let seconds = 59;

        function updateCountdown() {
            if (seconds === 0) {
                if (minutes === 0) {
                    if (hours === 0) {
                        // Reset timer
                        hours = 2;
                        minutes = 59;
                        seconds = 59;
                    } else {
                        hours--;
                        minutes = 59;
                        seconds = 59;
                    }
                } else {
                    minutes--;
                    seconds = 59;
                }
            } else {
                seconds--;
            }

            const hoursEl = countdownWrapper.querySelector('.elementor-countdown-hours');
            const minutesEl = countdownWrapper.querySelector('.elementor-countdown-minutes');
            const secondsEl = countdownWrapper.querySelector('.elementor-countdown-seconds');

            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
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
        container.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; min-height: 50vh; font-size: 18px; color: #666;">Carregando produto...</div>';

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
