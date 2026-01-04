// Variants Management Functions

// Add variant row
function addVariantRow(sizeId = '', price = '', variantId = null, isAvailable = true) {
    const container = document.getElementById('variants-container');
    const row = document.createElement('div');
    row.className = 'variant-row';
    row.dataset.variantId = variantId || '';

    const sizeOptions = sizes.map(s =>
        `<option value="${s.SizeID}" ${s.SizeID == sizeId ? 'selected' : ''}>${s.SizeName}</option>`
    ).join('');

    row.innerHTML = `
        <select class="variant-size" required>
            <option value="">اختر الحجم</option>
            ${sizeOptions}
        </select>
        <input type="number" class="variant-price" placeholder="السعر" value="${price}" min="0" step="0.01" required>
        <span>EGP</span>
        <label class="availability-toggle">
            <input type="checkbox" class="variant-available" ${isAvailable ? 'checked' : ''}>
            <span class="toggle-slider"></span>
        </label>
        <button type="button" class="remove-variant-btn" onclick="removeVariantRow(this)">×</button>
    `;

    container.appendChild(row);
}

// Remove variant row
function removeVariantRow(btn) {
    const container = document.getElementById('variants-container');
    if (container.children.length > 1) {
        btn.closest('.variant-row').remove();
    } else {
        notifyWarning('يجب وجود حجم واحد على الأقل');
    }
}

// Get variants from form
function getVariantsFromForm() {
    const rows = document.querySelectorAll('.variant-row');
    const variants = [];

    rows.forEach(row => {
        const sizeId = row.querySelector('.variant-size').value;
        const price = row.querySelector('.variant-price').value;
        const variantId = row.dataset.variantId;
        const isAvailable = row.querySelector('.variant-available').checked;

        if (sizeId && price) {
            variants.push({
                SizeID: parseInt(sizeId),
                TypeID: types.length > 0 ? types[0].TypeID : 1,
                Price: parseFloat(price),
                IsAvailable: isAvailable,
                VariantID: variantId ? parseInt(variantId) : null
            });
        }
    });

    return variants;
}
