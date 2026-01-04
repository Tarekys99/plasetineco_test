// API Functions

// Load sizes and types
async function loadSizesAndTypes() {
    try {
        const [sizesRes, typesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/sizes/get_sizes`),
            fetch(`${API_BASE_URL}/types/get_types`)
        ]);
        sizes = await sizesRes.json();
        types = await typesRes.json();
    } catch (error) {
        console.error('Error loading sizes/types:', error);
    }
}

// Load all categories
async function loadCategories() {
    const container = document.getElementById('categories-list');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/categories/get_all_categories`);
        if (!response.ok) throw new Error('فشل في تحميل الفئات');

        categories = await response.json();
        displayCategories(categories);
        populateCategorySelect();
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p>خطأ في تحميل الفئات</p>
                <button onclick="loadCategories()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">إعادة المحاولة</button>
            </div>
        `;
    }
}

// Load products for a category
async function loadProducts(categoryId) {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>جاري تحميل المنتجات...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/categories/get_category_with_products/${categoryId}`);
        if (!response.ok) throw new Error('فشل في تحميل المنتجات');

        const data = await response.json();
        currentProducts = data.products || [];

        const variantsResponse = await fetch(`${API_BASE_URL}/product_variants/all_products`);
        allVariants = await variantsResponse.json();

        displayProducts(currentProducts, allVariants);
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <p>خطأ في تحميل المنتجات</p>
                <button onclick="loadProducts(${categoryId})" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">إعادة المحاولة</button>
            </div>
        `;
    }
}

// Save variants for a product
async function saveVariants(productId, variants) {
    const existingVariants = allVariants.filter(v => v.ProductID === productId);

    for (const variant of variants) {
        const variantData = {
            ProductID: productId,
            SizeID: variant.SizeID,
            TypeID: variant.TypeID,
            Price: variant.Price,
            IsAvailable: variant.IsAvailable
        };

        if (variant.VariantID) {
            await fetch(`${API_BASE_URL}/product_variants/update_variant/${variant.VariantID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variantData)
            });
        } else {
            await fetch(`${API_BASE_URL}/product_variants/create_variant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variantData)
            });
        }
    }

    // Delete removed variants
    const newVariantIds = variants.filter(v => v.VariantID).map(v => v.VariantID);
    for (const existing of existingVariants) {
        if (!newVariantIds.includes(existing.VariantID)) {
            await fetch(`${API_BASE_URL}/product_variants/delete_variant/${existing.VariantID}`, {
                method: 'DELETE'
            });
        }
    }
}

// Delete product API call
async function deleteProductAPI(productId) {
    const response = await fetch(`${API_BASE_URL}/products/delete_product/${productId}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'فشل في حذف المنتج');
    }
    return response;
}

// Save product API call
async function saveProductAPI(formData, productId = null) {
    const url = productId
        ? `${API_BASE_URL}/products/update_product/${productId}`
        : `${API_BASE_URL}/products/create_product`;

    const response = await fetch(url, {
        method: productId ? 'PUT' : 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'فشل في حفظ المنتج');
    }
    return response.json();
}
