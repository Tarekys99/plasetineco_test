// Main Dashboard - Event Handlers & Initialization

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function () {
    loadCategories();
    loadSizesAndTypes();
    loadZones(); // Load zones on startup

    // Image file preview
    document.getElementById('product-image-file').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('image-preview').innerHTML =
                    `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Add product button
    document.getElementById('add-product-btn').addEventListener('click', openAddProductModal);

    // Product form submission
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // Close modals on outside click
    document.getElementById('product-modal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    document.getElementById('delete-modal').addEventListener('click', function (e) {
        if (e.target === this) closeDeleteModal();
    });
});

// Switch between tabs (Products/Zones)
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Update view content
    document.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));
    document.getElementById(`${tabName}-view`).classList.add('active');

    // Load data if needed
    if (tabName === 'zones') {
        loadZones();
    }
}

// Select a category and load its products
async function selectCategory(categoryId, categoryName) {
    currentCategoryId = categoryId;

    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.id) === categoryId) {
            item.classList.add('active');
        }
    });

    document.getElementById('category-title').textContent = categoryName;
    document.getElementById('add-product-btn').style.display = 'block';

    await loadProducts(categoryId);
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'جاري الحفظ...';

    try {
        const formData = new FormData();

        // Get form values
        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const categoryId = document.getElementById('product-category').value;
        const isUrlType = document.getElementById('image-type-url').checked;
        const imageUrl = document.getElementById('product-image-url').value.trim();
        const imageFile = document.getElementById('product-image-file').files[0];

        // Get variants
        const variants = getVariantsFromForm();
        if (variants.length === 0) {
            throw new Error('يجب إضافة حجم وسعر واحد على الأقل');
        }

        // Validate required fields
        if (!name) throw new Error('اسم المنتج مطلوب');
        if (!categoryId) throw new Error('الفئة مطلوبة');

        // Build FormData
        formData.append('Name', name);
        formData.append('CategoryID', categoryId);
        if (description) formData.append('Description', description);

        // Handle image
        if (isUrlType && imageUrl) {
            formData.append('ImageUrl', imageUrl);
        } else if (!isUrlType && imageFile) {
            formData.append('image', imageFile);
        } else if (!editingProductId) {
            throw new Error('يجب إضافة صورة (رابط أو ملف)');
        }

        // Save product
        const result = await saveProductAPI(formData, editingProductId);
        console.log('Product saved:', result);

        // Get product ID
        const productId = editingProductId || result.ProductID || result.product_id;

        // Save variants
        await saveVariants(productId, variants);

        notifySuccess(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
        closeModal();

        if (currentCategoryId) {
            await loadProducts(currentCategoryId);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        notifyError(error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'حفظ';
    }
}

// Make functions globally available
window.selectCategory = selectCategory;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.confirmDelete = confirmDelete;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.loadCategories = loadCategories;
window.loadProducts = loadProducts;
window.toggleImageInput = toggleImageInput;
window.addVariantRow = addVariantRow;
window.removeVariantRow = removeVariantRow;
window.switchTab = switchTab;
