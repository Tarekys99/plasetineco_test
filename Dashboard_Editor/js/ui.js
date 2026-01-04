// UI Display Functions

// Display categories in sidebar
function displayCategories(categories) {
    const container = document.getElementById('categories-list');

    if (!categories || categories.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد فئات</p></div>';
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="category-item" data-id="${cat.CategoryID}" onclick="selectCategory(${cat.CategoryID}, '${cat.CategoryName}')">
            ${cat.CategoryName}
        </div>
    `).join('');
}

// Display products in grid
function displayProducts(products, allVariants) {
    const container = document.getElementById('products-container');

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <p>لا توجد منتجات في هذه الفئة</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        let imageUrl = product.ImageUrl || '../images/food.png';
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('../')) {
            imageUrl = `${API_BASE_URL}/${imageUrl}`;
        }

        let price = 'غير محدد';
        const productVariants = allVariants.filter(v => v.ProductID === product.ProductID);
        const availableVariants = productVariants.filter(v => v.IsAvailable);
        const isProductAvailable = availableVariants.length > 0;

        if (availableVariants.length > 0) {
            availableVariants.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
            price = `${parseFloat(availableVariants[0].Price).toFixed(0)} EGP`;
            if (availableVariants.length > 1) {
                price += ` - ${parseFloat(availableVariants[availableVariants.length - 1].Price).toFixed(0)} EGP`;
            }
        }

        const statusBadge = isProductAvailable
            ? '<span class="status-badge available">متاح</span>'
            : '<span class="status-badge unavailable">غير متاح</span>';

        return `
            <div class="product-card ${!isProductAvailable ? 'product-unavailable' : ''}" data-id="${product.ProductID}">
                ${statusBadge}
                <img src="${imageUrl}" alt="${product.Name}" class="product-image" onerror="this.src='../images/food.png'">
                <div class="product-info">
                    <h3 class="product-name">${product.Name}</h3>
                    <p class="product-description">${product.Description || 'بدون وصف'}</p>
                    <div class="product-price">${price}</div>
                    <div class="product-actions">
                        <button class="edit-btn" onclick="editProduct(${product.ProductID})">✏️ تعديل</button>
                        <button class="delete-btn" onclick="deleteProduct(${product.ProductID}, '${product.Name.replace(/'/g, "\\'")}')">🗑️ حذف</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Populate category select in modal
function populateCategorySelect() {
    const select = document.getElementById('product-category');
    select.innerHTML = '<option value="">اختر الفئة</option>' +
        categories.map(cat => `<option value="${cat.CategoryID}">${cat.CategoryName}</option>`).join('');
}

// Toggle image input type (URL or File)
function toggleImageInput() {
    const isUrl = document.getElementById('image-type-url').checked;
    document.getElementById('image-url-group').style.display = isUrl ? 'block' : 'none';
    document.getElementById('image-file-group').style.display = isUrl ? 'none' : 'block';
}
