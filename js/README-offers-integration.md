# دمج العروض في المنيو + بانر ديناميكي

## نظرة عامة
تم تبسيط نظام العروض بدمجها كفئة عادية في المنيو مع إضافة بانر ديناميكي يعرض العروض الحقيقية من الـ API.

## التغييرات الجديدة

### 1. **حذف روابط العروض**
تم حذف جميع روابط صفحة العروض من:
- `index.html` - navbar + hero button
- `menu.html` - navbar
- `login.html` - navbar  
- `cart.html` - navbar
- `includes/header.html` - header template

### 2. **بانر ديناميكي للعروض**
- `js/dynamic-offers-banner.js` - يحمل العروض الحقيقية من الـ API
- يعرض منتجات فئة العروض (CategoryID = 4) مع:
  - الصور الحقيقية من الـ API
  - الأسعار الحقيقية مع خصم 20%
  - أسماء المنتجات الحقيقية

### 3. **وظائف البانر الديناميكي**
```javascript
// تحميل العروض من 3 APIs
const categoryData = await apiCall('/categories/get_category_with_products/4');
const allVariants = await apiCall('/product_variants/all_products');
const allProducts = await apiCall('/products/all_products');

// حساب الخصم التلقائي
const originalPrice = parseFloat(variants[0].Price);
const offerPrice = (originalPrice * 0.8).toFixed(0); // خصم 20%
```

### 4. **معالجة الحالات الاستثنائية**
- إخفاء البانر إذا لم توجد عروض
- صور احتياطية عند فشل تحميل الصور
- تكرار العناصر للحركة المستمرة

## الملفات المحدثة

### جديدة:
- `js/dynamic-offers-banner.js` - بانر العروض الديناميكي

### محدثة:
- `index.html`, `menu.html`, `login.html` - حذف روابط العروض + تحميل البانر الديناميكي
- `cart.html`, `includes/header.html` - حذف روابط العروض

### محذوفة:
- `js/offers-redirect.js` - لم يعد مطلوباً

## النتيجة النهائية

### 1. **واجهة مبسطة**
- لا توجد روابط منفصلة للعروض
- العروض متاحة في المنيو كفئة عادية
- بانر يعرض العروض الحقيقية

### 2. **بانر ديناميكي**
- يحمل العروض الحقيقية من قاعدة البيانات
- يعرض الصور والأسعار الصحيحة
- خصم 20% تلقائي على جميع العروض
- يوجه للمنيو عند النقر

### 3. **تجربة مستخدم محسنة**
- عروض حقيقية بدلاً من الثابتة
- أسعار دقيقة ومحدثة
- صور المنتجات الفعلية
- تنقل سلس للمنيو

## الاستخدام

### تحميل البانر:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    loadDynamicOffersBanner();
});
```

### التنقل للمنيو:
```javascript
function goToOffers() {
    window.location.href = 'menu.html';
}
```

الآن النظام يعرض العروض الحقيقية في البانر ويدمجها في المنيو بشكل كامل! 🎉