// Modal Functions

// Close product modal
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    editingProductId = null;
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    deletingProductId = null;
}

// Open modal for adding new product
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('modal-title').textContent = 'إضافة منتج جديد';
    document.getElementById('product-form').reset();
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('image-type-url').checked = true;
    toggleImageInput();

    if (currentCategoryId) {
        document.getElementById('product-category').value = currentCategoryId;
    }

    // Clear variants and add one default row
    document.getElementById('variants-container').innerHTML = '';
    addVariantRow();

    document.getElementById('product-modal').style.display = 'flex';
}

// Edit product - open modal with data
function editProduct(productId) {
    const product = currentProducts.find(p => p.ProductID === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('modal-title').textContent = 'تعديل المنتج';

    document.getElementById('product-name').value = product.Name || '';
    document.getElementById('product-description').value = product.Description || '';
    document.getElementById('product-image-url').value = product.ImageUrl || '';
    document.getElementById('product-category').value = currentCategoryId || '';

    // Reset image inputs
    document.getElementById('image-type-url').checked = true;
    toggleImageInput();
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('product-image-file').value = '';

    // Load existing variants
    document.getElementById('variants-container').innerHTML = '';
    const productVariants = allVariants.filter(v => v.ProductID === productId);

    if (productVariants.length > 0) {
        productVariants.forEach(v => {
            addVariantRow(v.SizeID, v.Price, v.VariantID, v.IsAvailable);
        });
    } else {
        addVariantRow();
    }

    document.getElementById('product-modal').style.display = 'flex';
}

// Delete product - show confirmation
function deleteProduct(productId, productName) {
    deletingProductId = productId;
    document.getElementById('delete-product-name').textContent = productName;
    document.getElementById('delete-modal').style.display = 'flex';
}

// Confirm delete
async function confirmDelete() {
    if (!deletingProductId) return;

    const btn = document.querySelector('.delete-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'جاري الحذف...';

    try {
        await deleteProductAPI(deletingProductId);
        notifySuccess('تم حذف المنتج بنجاح');
        closeDeleteModal();

        if (currentCategoryId) {
            await loadProducts(currentCategoryId);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        notifyError('خطأ في حذف المنتج: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'نعم، احذف';
    }
}
