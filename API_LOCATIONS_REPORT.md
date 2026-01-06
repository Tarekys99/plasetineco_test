# تقرير شامل: أماكن استخدام API في المشروع

## ✅ تم التحديث بنجاح!

### API القديم:
```
https://pizza-alslam-apis.onrender.com
```

### API الجديد:
```
https://plasetineco-apis.onrender.com
```

**تاريخ التحديث**: 2026-01-06

---

## الملفات التي تحتوي على API_BASE_URL

### 1. **js/auth-core.js** (السطر 4) ✅ تم التحديث
- **الاستخدام**: Authentication (تسجيل الدخول والتسجيل)
- **الكود الجديد**:
```javascript
const API_BASE_URL = 'https://plasetineco-apis.onrender.com';
```
- **الوظائف المستخدمة**:
  - `/users/register` - تسجيل مستخدم جديد
  - `/users/login` - تسجيل الدخول

---

### 2. **js/menu-api.js** (السطر 2) ✅ تم التحديث
- **الاستخدام**: عرض المنيو والمنتجات
- **الكود الجديد**:
```javascript
const API_BASE_URL = 'https://plasetineco-apis.onrender.com';
```
- **الوظائف المستخدمة**:
  - `/categories/get_all_categories` - جلب جميع الفئات
  - `/categories/get_category_with_products/{categoryId}` - جلب منتجات فئة معينة
  - `/product_variants/all_products` - جلب جميع أشكال المنتجات
  - `/products/all_products` - جلب جميع المنتجات

---

### 3. **js/cart-helpers.js** (السطر 4) ✅ تم التحديث
- **الاستخدام**: وظائف مساعدة للسلة
- **الكود الجديد**:
```javascript
const API_BASE_URL = 'https://plasetineco-apis.onrender.com';
```
- **الوظائف المستخدمة**:
  - `/shifts/all_shifts` - جلب الشفتات النشطة

---

### 4. **js/zone-payment-manager.js**
- **الاستخدام**: إدارة المناطق وطرق الدفع
- **يستخدم**: `cartApiCall` من cart-helpers.js
- **الوظائف المستخدمة**:
  - `/zones/all_zones` - جلب جميع مناطق التوصيل
  - `/payment/all_payment_methods` - جلب طرق الدفع

---

### 5. **js/address-manager.js**
- **الاستخدام**: إدارة العناوين
- **يستخدم**: `cartApiCall` من cart-helpers.js
- **الوظائف المستخدمة**:
  - `/addresses/user/{userID}` - جلب عناوين المستخدم
  - `/addresses/create/{userID}` - إنشاء عنوان جديد

---

### 6. **js/order-creator.js**
- **الاستخدام**: إنشاء الطلبات
- **يستخدم**: `cartApiCall` من cart-helpers.js
- **الوظائف المستخدمة**:
  - `/orders/create` - إنشاء طلب جديد

---

### 7. **js/user-orders.js** ✅ تم التحديث
- **الاستخدام**: عرض وإدارة طلبات المستخدم
- **يستخدم**: Fetch مباشر
- **الوظائف المستخدمة**:
  - `https://plasetineco-apis.onrender.com/orders/user_orders/{userID}` - جلب طلبات المستخدم
  - `https://plasetineco-apis.onrender.com/orders/{orderId}/status?new_status=delivered` - تحديث حالة الطلب

---

### 8. **Dashboard_Editor/js/config.js** (السطر 2) ✅ تم التحديث
- **الاستخدام**: لوحة التحكم - الإعدادات
- **الكود الجديد**:
```javascript
const API_BASE_URL = 'https://plasetineco-apis.onrender.com';
```

---

### 9. **Dashboard_Editor/js/api.js**
- **الاستخدام**: لوحة التحكم - إدارة المنتجات والفئات
- **يستخدم**: `API_BASE_URL` من config.js
- **الوظائف المستخدمة**:
  - `/sizes/get_sizes` - جلب الأحجام
  - `/types/get_types` - جلب الأنواع
  - `/categories/get_all_categories` - جلب الفئات
  - `/categories/get_category_with_products/{categoryId}` - جلب منتجات فئة
  - `/product_variants/all_products` - جلب أشكال المنتجات
  - `/product_variants/create_variant` - إنشاء شكل منتج
  - `/product_variants/update_variant/{variantID}` - تحديث شكل منتج
  - `/product_variants/delete_variant/{variantID}` - حذف شكل منتج
  - `/products/delete_product/{productId}` - حذف منتج
  - `/products/create_product` - إنشاء منتج
  - `/products/update_product/{productId}` - تحديث منتج

---

### 10. **cart.html** (السطر 356) ✅ تم التحديث
- **الاستخدام**: نسخة احتياطية مضمنة في HTML
- **الكود الجديد**:
```javascript
const API_BASE_URL = 'https://plasetineco-apis.onrender.com';
```
- **ملاحظة**: هذا كود احتياطي في حالة فشل تحميل cart-api.js

---

## ملخص الملفات التي تحتاج للتعديل

### ملفات JavaScript الرئيسية (9 ملفات):
1. ✅ `js/auth-core.js` - السطر 4
2. ✅ `js/menu-api.js` - السطر 2
3. ✅ `js/cart-helpers.js` - السطر 4
4. ✅ `js/user-orders.js` - السطر 399 و 408 (استخدام مباشر)
5. ✅ `Dashboard_Editor/js/config.js` - السطر 2
6. ✅ `cart.html` - السطر 356 (نسخة احتياطية)

### ملفات تستخدم API بشكل غير مباشر (لا تحتاج تعديل):
- `js/zone-payment-manager.js` - يستخدم cartApiCall
- `js/address-manager.js` - يستخدم cartApiCall
- `js/order-creator.js` - يستخدم cartApiCall
- `Dashboard_Editor/js/api.js` - يستخدم API_BASE_URL من config.js

---

## خطوات التغيير

### الخطوة 1: تحديد API الجديد
```javascript
const NEW_API_BASE_URL = 'YOUR_NEW_API_URL_HERE';
```

### الخطوة 2: تعديل الملفات التالية
1. `js/auth-core.js` - السطر 4
2. `js/menu-api.js` - السطر 2
3. `js/cart-helpers.js` - السطر 4
4. `js/user-orders.js` - السطر 399 و 408
5. `Dashboard_Editor/js/config.js` - السطر 2
6. `cart.html` - السطر 356

### الخطوة 3: اختبار الوظائف
- ✅ تسجيل الدخول والتسجيل
- ✅ عرض المنيو والمنتجات
- ✅ إضافة للسلة
- ✅ اختيار المنطقة وطريقة الدفع
- ✅ إنشاء الطلب
- ✅ عرض الطلبات السابقة
- ✅ لوحة التحكم

---

## ملاحظات مهمة

1. **js/user-orders.js** يستخدم fetch مباشر بدلاً من استخدام API_BASE_URL constant
2. **cart.html** يحتوي على نسخة احتياطية من الكود - يجب تحديثها أيضاً
3. جميع الملفات الأخرى تستخدم الدوال المساعدة (apiCall, cartApiCall) التي تعتمد على الملفات الرئيسية

---

## API Endpoints المستخدمة في المشروع

### Authentication
- POST `/users/register`
- POST `/users/login`

### Categories & Products
- GET `/categories/get_all_categories`
- GET `/categories/get_category_with_products/{categoryId}`
- GET `/products/all_products`
- POST `/products/create_product`
- PUT `/products/update_product/{productId}`
- DELETE `/products/delete_product/{productId}`

### Product Variants
- GET `/product_variants/all_products`
- POST `/product_variants/create_variant`
- PUT `/product_variants/update_variant/{variantID}`
- DELETE `/product_variants/delete_variant/{variantID}`

### Sizes & Types
- GET `/sizes/get_sizes`
- GET `/types/get_types`

### Orders
- POST `/orders/create`
- GET `/orders/user_orders/{userID}`
- PATCH `/orders/{orderId}/status?new_status=delivered`

### Addresses
- GET `/addresses/user/{userID}`
- POST `/addresses/create/{userID}`

### Zones & Payment
- GET `/zones/all_zones`
- GET `/payment/all_payment_methods`

### Shifts
- GET `/shifts/all_shifts`

---

تم إنشاء هذا التقرير في: 2026-01-06
