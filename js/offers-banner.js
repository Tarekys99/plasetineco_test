/**
 * Offers Banner - Dynamic Product Slider
 * Desktop: Auto-scrolling animation
 * Mobile: Manual swipe slider
 */

(function() {
    'use strict';

    const API_URL = window.API_BASE_URL || 'https://plasetineco-apis.onrender.com';
    const OFFERS_CATEGORY_ID = 11;

    // Initialize when DOM ready
    document.addEventListener('DOMContentLoaded', loadOffersBanner);

    async function loadOffersBanner() {
        try {
            const [categoryData, variants] = await Promise.all([
                fetchAPI(`/categories/get_category_with_products/${OFFERS_CATEGORY_ID}`),
                fetchAPI('/product_variants/all_products')
            ]);

            const products = categoryData.products || [];
            
            if (products.length === 0) {
                hideBanner();
                return;
            }

            renderBanner(products, variants);
        } catch (error) {
            console.error('Offers banner error:', error);
            hideBanner();
        }
    }

    async function fetchAPI(endpoint) {
        const response = await fetch(API_URL + endpoint);
        if (!response.ok) throw new Error('API Error');
        return response.json();
    }

    function renderBanner(products, variants) {
        const container = document.querySelector('.offers-scroll');
        if (!container) return;

        container.innerHTML = '';
        const isMobile = window.innerWidth <= 768;

        // Create product cards
        products.forEach(product => {
            const card = createOfferCard(product, variants);
            container.appendChild(card);
        });

        // Desktop: duplicate for seamless loop
        if (!isMobile) {
            const cards = container.innerHTML;
            container.innerHTML = cards + cards;
        }

        console.log(`Banner: ${products.length} offers loaded (${isMobile ? 'mobile' : 'desktop'} mode)`);
    }

    function createOfferCard(product, variants) {
        const price = getProductPrice(product, variants);
        const imageUrl = getImageUrl(product.ImageUrl);

        const card = document.createElement('div');
        card.className = 'offer-item';
        card.innerHTML = `
            <img src="${imageUrl}" alt="${product.Name}" class="offer-image" 
                 onerror="this.src='images/food.png'">
            <div class="offer-content">
                <span class="offer-text">🔥 ${product.Name}</span>
                <span class="offer-price">${price > 0 ? price + ' EGP' : 'عرض خاص'}</span>
            </div>
        `;

        card.addEventListener('click', () => goToOffer(product));
        return card;
    }

    function getProductPrice(product, variants) {
        const productVariants = variants.filter(v => 
            v.ProductID === product.ProductID && v.IsAvailable
        );

        if (productVariants.length > 0) {
            const prices = productVariants.map(v => parseFloat(v.Price));
            return Math.min(...prices).toFixed(0);
        }

        return product.BasePrice || product.Price || 0;
    }

    function getImageUrl(url) {
        if (!url) return 'images/food.png';
        if (url.startsWith('http')) return url;

        // Encode each part of the path properly
        const pathParts = url.split('/');
        const encodedParts = pathParts.map(part => {
            // encodeURIComponent doesn't encode parentheses, so we need to do it manually
            return encodeURIComponent(part)
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29');
        });
        const encodedPath = encodedParts.join('/');

        return API_URL + '/' + encodedPath;
    }

    function goToOffer(product) {
        sessionStorage.setItem('targetOffer', JSON.stringify({
            productID: product.ProductID,
            productName: product.Name,
            categoryID: OFFERS_CATEGORY_ID
        }));
        window.location.href = 'menu.html';
    }

    function hideBanner() {
        const banner = document.querySelector('.offers-banner');
        if (banner) banner.style.display = 'none';
    }

    // Expose for external use
    window.loadOffersBanner = loadOffersBanner;
})();
