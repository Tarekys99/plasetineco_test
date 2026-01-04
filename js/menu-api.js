// Menu API - Compact 4-Row Card Style
const API_BASE_URL = 'https://pizza-alslam-apis.onrender.com';

// Make API_BASE_URL available globally for other scripts
window.API_BASE_URL = API_BASE_URL;

// Smart image URL handler - supports both absolute and relative URLs
function getImageUrl(imageUrl) {
    if (!imageUrl) {
        return 'images/food.png';
    }

    // Check if it's already an absolute URL (starts with http:// or https://)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('Using absolute URL:', imageUrl);
        return imageUrl;
    }

    // If it's a relative path, add the API base URL
    const fullUrl = API_BASE_URL + '/' + encodeURI(imageUrl);
    console.log('Converting relative to absolute URL:', imageUrl, '->', fullUrl);
    return fullUrl;
}

async function apiCall(endpoint) {
    var response = await fetch(API_BASE_URL + endpoint);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
}

async function loadCategories() {
    var tabsContainer = document.getElementById('v-pills-tab');
    if (!tabsContainer) return;

    try {
        var categories = await apiCall('/categories/get_all_categories');
        tabsContainer.innerHTML = '';

        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            var tab = document.createElement('a');
            tab.className = 'nav-link' + (i === 0 ? ' active' : '');
            tab.href = 'javascript:void(0)';

            // Special styling for offers category (CategoryID = 4)
            if (cat.CategoryID === 4) {
                tab.innerHTML = '<i class="icon-tag" style="color: #fac564; margin-left: 5px;"></i>' + cat.CategoryName;
                tab.style.background = 'linear-gradient(45deg, #fac564, #f0b90b)';
                tab.style.color = '#000';
                tab.style.fontWeight = 'bold';
                tab.style.border = '2px solid #fac564';
            } else {
                tab.innerText = cat.CategoryName;
            }

            tab.setAttribute('data-id', cat.CategoryID);
            tab.onclick = function () {
                var allTabs = document.querySelectorAll('#v-pills-tab .nav-link');
                for (var j = 0; j < allTabs.length; j++) {
                    allTabs[j].className = 'nav-link';
                    // Reset special styling
                    allTabs[j].style.background = '';
                    allTabs[j].style.color = '';
                    allTabs[j].style.fontWeight = '';
                    allTabs[j].style.border = '';
                }
                this.className = 'nav-link active';

                // Re-apply special styling for offers if selected
                var categoryId = parseInt(this.getAttribute('data-id'));
                if (categoryId === 4) {
                    this.style.background = 'linear-gradient(45deg, #fac564, #f0b90b)';
                    this.style.color = '#000';
                    this.style.fontWeight = 'bold';
                    this.style.border = '2px solid #fac564';
                }

                loadProducts(this.getAttribute('data-id'));
            };
            tabsContainer.appendChild(tab);
        }

        if (categories.length > 0) {
            // Check if there's a target offer from banner click
            const targetOffer = sessionStorage.getItem('targetOffer');
            if (targetOffer) {
                const offerData = JSON.parse(targetOffer);
                console.log('Target offer detected:', offerData);

                // Load the offers category (CategoryID = 4)
                loadProducts(offerData.categoryID);

                // Activate the offers tab
                const offerTab = document.querySelector(`[data-id="${offerData.categoryID}"]`);
                if (offerTab) {
                    // Remove active from all tabs
                    document.querySelectorAll('#v-pills-tab .nav-link').forEach(tab => {
                        tab.className = 'nav-link';
                        tab.style.background = '';
                        tab.style.color = '';
                        tab.style.fontWeight = '';
                        tab.style.border = '';
                    });

                    // Activate offers tab
                    offerTab.className = 'nav-link active';
                    offerTab.style.background = 'linear-gradient(45deg, #fac564, #f0b90b)';
                    offerTab.style.color = '#000';
                    offerTab.style.fontWeight = 'bold';
                    offerTab.style.border = '2px solid #fac564';
                }

                // Clear the target offer after use
                sessionStorage.removeItem('targetOffer');

                // Scroll to the specific product after a short delay
                setTimeout(() => {
                    scrollToProduct(offerData.productID, offerData.productName);
                }, 1000);
            } else {
                // Normal behavior - load first category
                loadProducts(categories[0].CategoryID);
            }
        }
    } catch (error) {
        tabsContainer.innerHTML = '<div class="text-danger p-3">خطأ في تحميل الفئات</div>';
    }
}

async function loadProducts(categoryId) {
    var container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';

    try {
        var categoryData = await apiCall('/categories/get_category_with_products/' + categoryId);
        var allVariants = await apiCall('/product_variants/all_products');
        var allProducts = await apiCall('/products/all_products');
        var products = categoryData.products || [];

        if (products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-4"><p style="color:#888;">لا توجد منتجات</p></div>';
            return;
        }

        var html = '';

        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            var variants = [];

            // Find product image using smart handler that supports both URL types
            var productImage = '';

            // First try to get image from allProducts API
            for (var p = 0; p < allProducts.length; p++) {
                if (allProducts[p].ProductID === product.ProductID && allProducts[p].ImageUrl) {
                    productImage = getImageUrl(allProducts[p].ImageUrl);
                    console.log('Found image in allProducts for', product.Name, ':', productImage);
                    break;
                }
            }

            // If not found in allProducts, try direct ImageUrl from product
            if (!productImage && product.ImageUrl) {
                productImage = getImageUrl(product.ImageUrl);
                console.log('Using direct ImageUrl for', product.Name, ':', productImage);
            }

            // Fallback to default image
            if (!productImage) {
                productImage = 'images/food.png';
                console.log('Using fallback image for', product.Name);
            }

            for (var j = 0; j < allVariants.length; j++) {
                if (allVariants[j].ProductID === product.ProductID && allVariants[j].IsAvailable) {
                    variants.push(allVariants[j]);
                }
            }

            variants.sort(function (a, b) { return parseFloat(a.Price) - parseFloat(b.Price); });

            var productName = product.Name;
            var sizeButtons = '';
            var addedSizes = [];

            for (var k = 0; k < variants.length; k++) {
                var sizeName = variants[k].sizes.SizeName;
                if (addedSizes.indexOf(sizeName) === -1) {
                    addedSizes.push(sizeName);
                    var displayName = sizeName === 'افتراضي' ? '' : sizeName;
                    var price = parseFloat(variants[k].Price);
                    var displayPrice = price.toFixed(0);
                    var isActive = k === 0 ? ' active' : '';
                    var variantId = variants[k].VariantID;

                    var sizeLabelHtml = displayName ? '<span class="size-name">' + displayName + '</span>' : '';

                    sizeButtons += '<button class="size-btn' + isActive + '" data-size="' + sizeName + '" data-price="' + price + '" data-variant-id="' + variantId + '" onclick="menuSelectSize(this)">';
                    sizeButtons += sizeLabelHtml;
                    sizeButtons += '<span class="size-price">' + displayPrice + ' EGP</span>';
                    sizeButtons += '</button>';
                }
            }

            var defaultPrice = variants.length > 0 ? parseFloat(variants[0].Price).toFixed(2) : '0.00';
            var defaultSize = variants.length > 0 ? variants[0].sizes.SizeName : '';
            var productDesc = product.Description || '';

            html += '<div class="col-12">';
            html += '<div class="menu-product-card" data-name="' + productName + '" data-desc="' + productDesc + '" data-image="' + productImage + '">';

            // Row 1: Image + Name
            html += '<div class="card-row-1">';
            html += '<div class="card-img" style="background-image: url(' + productImage + ');"></div>';
            html += '<h3 class="card-title">' + productName + '</h3>';
            html += '</div>';

            // Row 2: Description (if exists)
            if (productDesc) {
                html += '<p class="card-desc">' + productDesc + '</p>';
            }

            // Row 3: Size Buttons
            html += '<div class="card-row-3">';
            html += '<div class="size-buttons" data-selected="' + defaultSize + '">' + sizeButtons + '</div>';
            html += '</div>';

            // Row 4: Qty + Add Button
            html += '<div class="card-row-4">';
            html += '<div class="qty-group">';
            html += '<button class="qty-btn" onclick="menuChangeQty(this,-1)">-</button>';
            html += '<input type="text" class="qty-input" value="1" readonly>';
            html += '<button class="qty-btn" onclick="menuChangeQty(this,1)">+</button>';
            html += '</div>';
            html += '<button class="add-btn" onclick="menuAddToCart(this)">إضافة للسلة</button>';
            html += '</div>';

            html += '</div>';
            html += '</div>';
        }

        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<div class="col-12 text-center py-4 text-danger">خطأ في التحميل</div>';
    }
}

function menuSelectSize(btn) {
    var card = btn.closest('.menu-product-card');
    var allBtns = card.querySelectorAll('.size-btn');
    for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].className = 'size-btn';
    }
    btn.className = 'size-btn active';
    var container = card.querySelector('.size-buttons');
    container.setAttribute('data-selected', btn.getAttribute('data-size'));
}

function menuChangeQty(btn, delta) {
    var input = btn.parentElement.querySelector('.qty-input');
    var val = parseInt(input.value) || 1;
    val = val + delta;
    if (val < 1) val = 1;
    input.value = val;
}

function menuAddToCart(btn) {
    var card = btn.closest('.menu-product-card');
    var name = card.getAttribute('data-name');
    var desc = card.getAttribute('data-desc');
    var productImage = card.getAttribute('data-image');
    var activeBtn = card.querySelector('.size-btn.active');
    var qtyInput = card.querySelector('.qty-input');

    var size = activeBtn.getAttribute('data-size');
    var displaySize = size === 'افتراضي' ? '' : size;

    var price = parseFloat(activeBtn.getAttribute('data-price'));
    var quantity = parseInt(qtyInput.value) || 1;
    var variantID = parseInt(activeBtn.getAttribute('data-variant-id'));

    // التحقق من صحة VariantID قبل الإضافة
    if (!variantID || isNaN(variantID)) {
        if (typeof showError === 'function') {
            showError('خطأ: لا يمكن إضافة المنتج. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.');
        } else {
            alert('خطأ: لا يمكن إضافة المنتج. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.');
        }
        return;
    }

    var itemName = name;
    if (displaySize) {
        itemName = name + ' (' + displaySize + ')';
    }

    var cartItem = {
        name: itemName,
        price: price,
        quantity: quantity,
        image: productImage,
        description: desc,
        variantID: variantID
    };

    if (typeof addToCart === 'function') {
        addToCart(cartItem);

        var originalText = btn.innerText;
        btn.innerText = '✓ تم';
        btn.style.background = '#28a745';
        btn.disabled = true;

        setTimeout(function () {
            btn.innerText = originalText;
            btn.style.background = '';
            btn.innerText = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 1200);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('v-pills-tab')) {
        loadCategories();
    }
});

window.menuSelectSize = menuSelectSize;
window.menuChangeQty = menuChangeQty;
window.menuAddToCart = menuAddToCart;

// Scroll to specific product and highlight it
function scrollToProduct(productID, productName) {
    console.log(`Looking for product: ${productName} (ID: ${productID})`);

    // Find all product cards
    const productCards = document.querySelectorAll('.menu-product-card');
    let targetCard = null;

    // Search for the product by name (since ProductID might not be in DOM)
    for (let card of productCards) {
        const cardName = card.getAttribute('data-name');
        if (cardName && cardName.includes(productName)) {
            targetCard = card;
            break;
        }
    }

    if (targetCard) {
        console.log('Found target product card, scrolling and highlighting');

        // Scroll to the product with smooth animation
        targetCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Highlight the product temporarily
        const originalStyle = targetCard.style.cssText;
        targetCard.style.border = '3px solid #fac564';
        targetCard.style.boxShadow = '0 0 20px rgba(250, 197, 100, 0.5)';
        targetCard.style.transform = 'scale(1.02)';
        targetCard.style.transition = 'all 0.3s ease';

        // Remove highlight after 3 seconds
        setTimeout(() => {
            targetCard.style.cssText = originalStyle;
        }, 3000);

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`🔥 ${productName} - عرض خاص!`);
        }
    } else {
        console.log('Product card not found');
    }
}

// Make function available globally
window.scrollToProduct = scrollToProduct;