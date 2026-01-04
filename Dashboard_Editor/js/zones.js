// Zones Management Functions

let zones = [];
let editingZoneId = null;
let deletingZoneId = null;

// Load all zones (show all zones with their status)
async function loadZones() {
    try {
        const response = await fetch(`${API_BASE_URL}/zones/all_zones`);
        if (!response.ok) throw new Error('فشل في تحميل المناطق');

        zones = await response.json();
        displayZones(zones);
        displayZonesList(zones);
    } catch (error) {
        console.error('Error loading zones:', error);
        document.getElementById('zones-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <p>خطأ في تحميل المناطق</p>
                <button onclick="loadZones()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">إعادة المحاولة</button>
            </div>
        `;
    }
}

// Toggle show all zones
function toggleShowAllZones() {
    loadZones();
}

// Display zones in main area
function displayZones(zones) {
    const container = document.getElementById('zones-container');

    if (!zones || zones.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🗺️</div>
                <p>لا توجد مناطق توصيل</p>
                <p style="font-size: 14px; color: #666;">ابدأ بإضافة منطقة جديدة</p>
            </div>
        `;
        return;
    }

    container.innerHTML = zones.map(zone => `
        <div class="zone-card ${zone.IsActive ? 'active' : 'inactive'}" data-id="${zone.ZoneID}">
            <div class="zone-header">
                <div class="zone-name">
                    <i class="icon-map-marker"></i>
                    ${zone.ZoneName}
                </div>
                <div class="zone-status ${zone.IsActive ? 'active' : 'inactive'}">
                    ${zone.IsActive ? 'فعّالة' : 'معطّلة'}
                </div>
            </div>
            <div class="zone-cost">
                تكلفة التوصيل: ${parseFloat(zone.DeliveryCost).toFixed(2)} جنيه
            </div>
            <div class="zone-actions">
                <button class="zone-edit-btn" onclick="editZone(${zone.ZoneID})">
                    ✏️ تعديل
                </button>
                ${zone.IsActive ?
            `<button class="zone-deactivate-btn" onclick="deactivateZone(${zone.ZoneID})">
                        ⏸️ إلغاء التفعيل
                    </button>` :
            `<span class="zone-disabled">-</span>`
        }
            </div>
        </div>
    `).join('');
}

// Display zones list in sidebar
function displayZonesList(zones) {
    const container = document.getElementById('zones-list');

    if (!zones || zones.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد مناطق</p></div>';
        return;
    }

    container.innerHTML = zones.map(zone => `
        <div class="zone-item ${zone.IsActive ? 'active' : 'inactive'}" data-id="${zone.ZoneID}">
            <div class="zone-item-info">
                <div class="zone-item-name">${zone.ZoneName}</div>
                <div class="zone-item-cost">${parseFloat(zone.DeliveryCost).toFixed(2)} جنيه</div>
            </div>
            <div class="zone-item-status ${zone.IsActive ? 'active' : 'inactive'}">
                ${zone.IsActive ? '●' : '○'}
            </div>
        </div>
    `).join('');
}

// Open add zone modal
function openAddZoneModal() {
    editingZoneId = null;
    document.getElementById('zone-modal-title').textContent = 'إضافة منطقة جديدة';
    document.getElementById('zone-form').reset();

    // Hide status group for new zones
    document.getElementById('zone-status-group').style.display = 'none';
    document.getElementById('zone-active').checked = true;

    document.getElementById('zone-modal').style.display = 'flex';
}

// Edit zone
function editZone(zoneId) {
    const zone = zones.find(z => z.ZoneID === zoneId);
    if (!zone) return;

    editingZoneId = zoneId;
    document.getElementById('zone-modal-title').textContent = 'تعديل المنطقة';
    document.getElementById('zone-name').value = zone.ZoneName;
    document.getElementById('zone-cost').value = parseFloat(zone.DeliveryCost);

    // Show reactivation option for inactive zones
    const statusGroup = document.getElementById('zone-status-group');
    const activeCheckbox = document.getElementById('zone-active');

    if (!zone.IsActive) {
        statusGroup.style.display = 'block';
        activeCheckbox.checked = false;
    } else {
        statusGroup.style.display = 'none';
        activeCheckbox.checked = true;
    }

    document.getElementById('zone-modal').style.display = 'flex';
}

// Deactivate zone (using DELETE API)
async function deactivateZone(zoneId) {
    const zone = zones.find(z => z.ZoneID === zoneId);
    if (!zone) return;

    // Show beautiful confirmation modal instead of confirm()
    showDeactivateConfirmation(zone);
}

// Show beautiful deactivate confirmation modal
function showDeactivateConfirmation(zone) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div class="confirmation-content" style="
            background: #2c3e50;
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #f39c12;
            text-align: center;
            max-width: 500px;
            width: 90%;
            color: white;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h3 style="color: #f39c12; margin-bottom: 20px; font-size: 20px;">
                تأكيد إلغاء تفعيل المنطقة
            </h3>
            <p style="margin-bottom: 15px; font-size: 16px;">
                هل أنت متأكد من إلغاء تفعيل منطقة <strong>"${zone.ZoneName}"</strong>؟
            </p>
            <div style="
                background: rgba(243, 156, 18, 0.1);
                border: 1px solid #f39c12;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: right;
            ">
                <div style="color: #f39c12; font-weight: bold; margin-bottom: 10px;">تحذير:</div>
                <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.6;">
                    <li style="margin-bottom: 8px;">• العملاء الذين لديهم عناوين محفوظة في هذه المنطقة لن يتمكنوا من الطلب</li>
                    <li style="margin-bottom: 8px;">• سيتم إخفاء هذه المنطقة من قائمة المناطق المتاحة للعملاء الجدد</li>
                    <li>• يمكنك إعادة تفعيلها لاحقاً من خلال تعديل المنطقة</li>
                </ul>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
                <button onclick="confirmDeactivateZone(${zone.ZoneID})" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s;
                " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
                    نعم، إلغاء التفعيل
                </button>
                <button onclick="closeDeactivateModal()" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='#7f8c8d'" onmouseout="this.style.background='#95a5a6'">
                    إلغاء
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeDeactivateModal();
        }
    });
}

// Confirm deactivation
async function confirmDeactivateZone(zoneId) {
    closeDeactivateModal();

    try {
        const response = await fetch(`${API_BASE_URL}/zones/delete_zone/${zoneId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.detail || 'فشل في إلغاء تفعيل المنطقة');
        }

        notifySuccess('تم إلغاء تفعيل المنطقة بنجاح');
        notifyInfo('العملاء الحاليون في هذه المنطقة لن يتمكنوا من الطلب حتى إعادة التفعيل');
        await loadZones();
    } catch (error) {
        console.error('Error deactivating zone:', error);
        notifyError('خطأ في إلغاء تفعيل المنطقة: ' + error.message);
    }
}

// Close deactivate modal
function closeDeactivateModal() {
    const modal = document.querySelector('.confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

// Delete zone - show confirmation
// Close modals
function closeZoneModal() {
    document.getElementById('zone-modal').style.display = 'none';
    editingZoneId = null;
}

// Handle zone form submission
document.addEventListener('DOMContentLoaded', function () {
    const zoneForm = document.getElementById('zone-form');
    if (zoneForm) {
        zoneForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const saveBtn = document.getElementById('zone-save-btn');
            saveBtn.disabled = true;
            saveBtn.textContent = 'جاري الحفظ...';

            try {
                const zoneName = document.getElementById('zone-name').value.trim();
                const zoneCost = document.getElementById('zone-cost').value;

                if (!zoneName) {
                    throw new Error('اسم المنطقة مطلوب');
                }
                if (!zoneCost || zoneCost < 0) {
                    throw new Error('تكلفة التوصيل مطلوبة ويجب أن تكون أكبر من أو تساوي صفر');
                }

                const zoneData = {
                    ZoneName: zoneName,
                    DeliveryCost: parseFloat(zoneCost)
                };

                // Add IsActive for editing existing zones
                if (editingZoneId) {
                    const zone = zones.find(z => z.ZoneID === editingZoneId);
                    const activeCheckbox = document.getElementById('zone-active');

                    // If zone was inactive, check if user wants to reactivate
                    if (!zone.IsActive) {
                        zoneData.IsActive = activeCheckbox.checked;
                    } else {
                        zoneData.IsActive = true; // Keep active zones active
                    }
                }

                let response;
                if (editingZoneId) {
                    // Update existing zone
                    response = await fetch(`${API_BASE_URL}/zones/update_zone/${editingZoneId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(zoneData)
                    });
                } else {
                    // Create new zone
                    response = await fetch(`${API_BASE_URL}/zones/create_zone`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(zoneData)
                    });
                }

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'فشل في حفظ المنطقة');
                }

                notifySuccess(editingZoneId ? 'تم تحديث المنطقة بنجاح' : 'تم إضافة المنطقة بنجاح');
                closeZoneModal();
                await loadZones();
            } catch (error) {
                console.error('Error saving zone:', error);
                notifyError(error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'حفظ';
            }
        });
    }
});

// Close modals on outside click
document.addEventListener('DOMContentLoaded', function () {
    const zoneModal = document.getElementById('zone-modal');

    if (zoneModal) {
        zoneModal.addEventListener('click', function (e) {
            if (e.target === this) closeZoneModal();
        });
    }
});

// Make functions globally available
window.loadZones = loadZones;
window.toggleShowAllZones = toggleShowAllZones;
window.openAddZoneModal = openAddZoneModal;
window.editZone = editZone;
window.deactivateZone = deactivateZone;
window.closeZoneModal = closeZoneModal;
window.confirmDeactivateZone = confirmDeactivateZone;
window.closeDeactivateModal = closeDeactivateModal;