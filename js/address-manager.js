// Address Management Functions
console.log('address-manager.js loaded');

// Load user's previous addresses
async function loadUserAddresses() {
    try {
        const userID = getUserID();
        console.log('loadUserAddresses - UserID:', userID);

        if (!userID) {
            throw new Error('يجب تسجيل الدخول أولاً');
        }

        console.log('Making API call to:', `/addresses/user/${userID}`);
        const result = await cartApiCall(`/addresses/user/${userID}`);
        console.log('API response:', result);

        if (result.success) {
            console.log('API success - Raw data:', result.data);
            console.log('Data type:', typeof result.data);
            console.log('Is array:', Array.isArray(result.data));

            if (Array.isArray(result.data)) {
                console.log('Number of addresses:', result.data.length);
                const addresses = result.data.slice(-5);
                console.log('Returning addresses:', addresses);
                return addresses;
            } else {
                console.log('Data is not an array, returning empty array');
                return [];
            }
        } else {
            console.error('API failed:', result.data.message);
            console.error('Status:', result.status);
            return [];
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
        return [];
    }
}

// Show previous addresses modal
async function showPreviousAddresses() {
    console.log('showPreviousAddresses called');

    const userID = getUserID();
    console.log('UserID:', userID);

    if (!userID) {
        if (typeof showWarning === 'function') {
            showWarning('يجب تسجيل الدخول أولاً لعرض العناوين السابقة');
        } else {
            alert('يجب تسجيل الدخول أولاً لعرض العناوين السابقة');
        }
        return;
    }

    try {
        console.log('Loading addresses...');
        const addresses = await loadUserAddresses();
        console.log('Addresses loaded in showPreviousAddresses:', addresses);
        console.log('Number of addresses:', addresses.length);
        console.log('Type of addresses:', typeof addresses);
        console.log('Is addresses an array?', Array.isArray(addresses));

        if (!Array.isArray(addresses) || addresses.length === 0) {
            console.log('No addresses found - showing alert');
            if (typeof showInfo === 'function') {
                showInfo('لا توجد عناوين محفوظة');
            } else {
                alert('لا توجد عناوين محفوظة');
            }
            return;
        }

        console.log('Creating modal with addresses...');

        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 99999 !important;
        `;

        modal.innerHTML = `
            <div style="
                background: rgba(30, 30, 30, 0.95) !important;
                padding: 20px !important;
                border-radius: 15px !important;
                border: 2px solid #fac564 !important;
                text-align: center !important;
                max-width: 500px !important;
                width: 90% !important;
                max-height: 70vh !important;
                overflow-y: auto !important;
                position: relative !important;
                z-index: 100000 !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
            ">
                <button onclick="closeAddressModal()" style="
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    font-size: 24px;
                    font-weight: bold;
                    line-height: 1;
                    padding: 0;
                    width: auto;
                    height: auto;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='#fac564'" onmouseout="this.style.color='#999'">×</button>
                <h3 style="margin-bottom: 15px; color: #fff; font-size: 18px;">اختر عنوان سابق (${addresses.length})</h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                ">
                    ${addresses.map((address, index) => `
                        <div onclick="selectPreviousAddress(${index})" style="
                            border: 2px solid #fac564;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            padding: 10px;
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: right;
                            font-size: 12px;
                            color: #fff;
                        " onmouseover="this.style.background='#fac564'; this.style.color='#000';" 
                           onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='#fff';">
                            <div style="font-weight: bold; margin-bottom: 3px; font-size: 13px;">${address.RecipientName}</div>
                            <div style="margin-bottom: 2px;">${address.City} - ${address.Street}</div>
                            <div style="margin-bottom: 2px;">${address.Building}</div>
                            <div style="opacity: 0.8;">${address.RecipientPhone}</div>
                            ${address.delivery_zone ? `<div style="color: #fac564; margin-top: 3px;">
                                ${address.delivery_zone.ZoneName} - ${address.delivery_zone.DeliveryCost} EGP
                            </div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        window.loadedAddresses = addresses;
        console.log('Modal added to page successfully');

    } catch (error) {
        console.error('Error in showPreviousAddresses:', error);
        if (typeof showError === 'function') {
            showError('خطأ في تحميل العناوين: ' + error.message);
        } else {
            alert('خطأ في تحميل العناوين: ' + error.message);
        }
    }
}

// Select previous address and fill form
function selectPreviousAddress(index) {
    console.log('selectPreviousAddress called with index:', index);
    const addresses = window.loadedAddresses;
    console.log('Available addresses:', addresses);

    if (!addresses || !addresses[index]) {
        if (typeof showError === 'function') {
            showError('خطأ في اختيار العنوان');
        } else {
            alert('خطأ في اختيار العنوان');
        }
        return;
    }

    const address = addresses[index];
    console.log('Selected address:', address);

    // Store selected address for order creation
    window.selectedAddress = {
        AddressID: address.AddressID,
        data: address
    };

    // Fill form fields
    document.getElementById('customer-name').value = address.RecipientName || '';
    document.getElementById('customer-phone').value = address.RecipientPhone || '';
    document.getElementById('customer-city').value = address.City || '';
    document.getElementById('customer-street').value = address.Street || '';
    document.getElementById('customer-building').value = address.Building || '';

    // Fill the detailed address field
    const detailedAddress = `${address.City || ''} - ${address.Street || ''} - ${address.Building || ''}`.replace(/^-\s*|-\s*$/g, '').replace(/\s*-\s*-\s*/g, ' - ');
    document.getElementById('customer-address').value = detailedAddress;

    // Set selected zone if available
    if (address.delivery_zone) {
        window.selectedZone = {
            id: address.delivery_zone.ZoneID,
            name: address.delivery_zone.ZoneName,
            cost: parseFloat(address.delivery_zone.DeliveryCost)
        };

        // Update delivery fee in summary
        document.getElementById('delivery-fee').textContent = `${address.delivery_zone.DeliveryCost} EGP`;

        // Recalculate total
        if (typeof updateSummary === 'function') {
            updateSummary();
        }
    }

    closeAddressModal();

    // Show success message
    if (typeof showNotification === 'function') {
        showNotification(`تم اختيار العنوان: ${address.City} - ${address.Street}`);
    } else {
        alert(`تم اختيار العنوان: ${address.City} - ${address.Street}`);
    }
}

// Close address modal
function closeAddressModal() {
    const modal = document.querySelector('[style*="position: fixed"][style*="z-index: 99999"]');
    if (modal) {
        modal.remove();
    }
    // Clean up stored addresses
    window.loadedAddresses = null;
}

// Create new address
async function createNewAddress(addressData) {
    try {
        const userID = getUserID();
        if (!userID) {
            throw new Error('يجب تسجيل الدخول أولاً');
        }

        const requestData = {
            RecipientName: addressData.name,
            City: addressData.city,
            Street: addressData.street,
            Building: addressData.building,
            RecipientPhone: addressData.phone,
            Phone2: "", // Always empty as per requirements
            ZoneID: addressData.zoneId
        };

        const result = await cartApiCall(`/addresses/create/${userID}`, 'POST', requestData);

        if (result.success) {
            const addressID = result.data.AddressID || result.data.addressId;
            return addressID;
        } else {
            console.error('Failed to create address:', result.data.message);
            return null;
        }
    } catch (error) {
        console.error('Error creating address:', error);
        return null;
    }
}

// Make functions available globally
window.loadUserAddresses = loadUserAddresses;
window.showPreviousAddresses = showPreviousAddresses;
window.selectPreviousAddress = selectPreviousAddress;
window.closeAddressModal = closeAddressModal;
window.createNewAddress = createNewAddress;

console.log('Address management functions loaded');