document.addEventListener('DOMContentLoaded', () => {
    
    let productsData = [];
    const API_URL = 'https://fakestoreapi.com/products';

    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    const retryBtn = document.getElementById('retry-btn');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    const orderForm = document.getElementById('order-form');
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const productSelect = document.getElementById('product-select');
    const quantityInput = document.getElementById('quantity-input');
    const notesInput = document.getElementById('user-notes');
    const totalPriceDisplay = document.getElementById('total-price-display');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const productError = document.getElementById('product-error');
    const quantityError = document.getElementById('quantity-error');

    const confirmationModal = document.getElementById('confirmation-modal');
    const modalBox = document.getElementById('modal-box');
    const summaryContent = document.getElementById('summary-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- FETCH API FAKE STORE ---
    function renderSkeletons() {
        loadingState.innerHTML = '';
        for (let i = 0.5; i < 8; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'bg-white border border-slate-200 rounded-2xl p-4 animate-pulse space-y-4';
            skeleton.innerHTML = `
                <div class="w-full h-48 bg-slate-200 rounded-xl"></div>
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                <div class="flex justify-between items-center pt-2">
                    <div class="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div class="h-8 bg-slate-200 rounded w-1/4"></div>
                </div>
            `;
            loadingState.appendChild(skeleton);
        }
    }

    async function fetchProducts() {
        loadingState.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        errorState.classList.add('hidden');
        emptyState.classList.add('hidden');
        renderSkeletons();

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Gagal mengambil data (HTTP status: ${response.status})`);

            const data = await response.json();
            productsData = data || [];

            loadingState.classList.add('hidden');
            productsGrid.classList.remove('hidden');

            populateCategoryOptions(productsData);
            populateProductDropdown(productsData);
            renderProducts(productsData);

        } catch (error) {
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
            errorMessage.textContent = error.message || 'Terjadi kesalahan koneksi internet.';
        }
    }

    function renderProducts(items) {
        productsGrid.innerHTML = '';

        if (items.length === 0) {
            productsGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        productsGrid.classList.remove('hidden');

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group';

            card.innerHTML = `
                <div>
                    <div class="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden mb-4 p-4 flex items-center justify-center">
                        <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy">
                        <span class="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                            <i class="fa-solid fa-star text-amber-400"></i> ${product.rating?.rate || 0}
                        </span>
                    </div>
                    
                    <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">${product.category}</span>
                    <h3 class="font-bold text-slate-900 mt-1 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors" title="${product.title}">${product.title}</h3>
                    <p class="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">${product.description}</p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                        <span class="text-xs text-slate-400 font-medium block">Harga</span>
                        <span class="text-lg font-bold text-slate-900">$${product.price.toFixed(2)}</span>
                    </div>
                    <button type="button" class="buy-product-btn bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm" 
                        data-id="${product.id}">
                        <i class="fa-solid fa-cart-plus"></i> Pesan
                    </button>
                </div>
            `;

            productsGrid.appendChild(card);
        });

        document.querySelectorAll('.buy-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                selectProductAndScroll(productId);
            });
        });
    }

    function populateCategoryOptions(products) {
        const categories = ['all', ...new Set(products.map(p => p.category))];
        categoryFilter.innerHTML = '';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat === 'all' ? 'Semua Kategori' : cat.charAt(0).toUpperCase() + cat.slice(1);
            categoryFilter.appendChild(option);
        });
    }

    function filterProducts() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedCat = categoryFilter.value;

        const filtered = productsData.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(query) || 
                                  product.description.toLowerCase().includes(query);
            const matchesCat = selectedCat === 'all' || product.category === selectedCat;
            return matchesSearch && matchesCat;
        });

        renderProducts(filtered);
    }

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    retryBtn.addEventListener('click', fetchProducts);


    // --- FORM & DOM HANDLING ---
    function populateProductDropdown(products) {
        productSelect.innerHTML = '<option value="">-- Pilih produk dari daftar --</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.title} ($${product.price})`;
            productSelect.appendChild(option);
        });
    }

    function selectProductAndScroll(productId) {
        productSelect.value = productId;
        calculateTotal();
        validateProduct();

        document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
        orderForm.classList.add('ring-2', 'ring-indigo-500');
        setTimeout(() => orderForm.classList.remove('ring-2', 'ring-indigo-500'), 1200);
    }

    function calculateTotal() {
        const selectedId = productSelect.value;
        const qty = parseInt(quantityInput.value) || 0;

        if (!selectedId || qty <= 0) {
            totalPriceDisplay.textContent = '$0.00';
            return;
        }

        const selectedProduct = productsData.find(p => p.id == selectedId);
        if (selectedProduct) {
            const total = selectedProduct.price * qty;
            totalPriceDisplay.textContent = `$${total.toFixed(2)}`;
        }
    }

    function showError(inputEl, errorEl, message) {
        inputEl.classList.add('input-error');
        inputEl.classList.remove('input-success');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    function clearError(inputEl, errorEl) {
        inputEl.classList.remove('input-error');
        inputEl.classList.add('input-success');
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }

    function validateName() {
        const val = nameInput.value.trim();
        if (val === '') {
            showError(nameInput, nameError, 'Nama lengkap wajib diisi.');
            return false;
        } else if (val.length < 3) {
            showError(nameInput, nameError, 'Nama minimal 3 karakter.');
            return false;
        }
        clearError(nameInput, nameError);
        return true;
    }

    function validateEmail() {
        const val = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val === '') {
            showError(emailInput, emailError, 'Email wajib diisi.');
            return false;
        } else if (!emailRegex.test(val)) {
            showError(emailInput, emailError, 'Format email tidak valid.');
            return false;
        }
        clearError(emailInput, emailError);
        return true;
    }

    function validateProduct() {
        const val = productSelect.value;
        if (!val) {
            showError(productSelect, productError, 'Silakan pilih produk.');
            return false;
        }
        clearError(productSelect, productError);
        return true;
    }

    function validateQuantity() {
        const val = parseInt(quantityInput.value);
        if (isNaN(val) || val < 1) {
            showError(quantityInput, quantityError, 'Jumlah minimal 1.');
            return false;
        } else if (val > 99) {
            showError(quantityInput, quantityError, 'Maksimal 99 unit.');
            return false;
        }
        clearError(quantityInput, quantityError);
        return true;
    }

    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    productSelect.addEventListener('change', () => { validateProduct(); calculateTotal(); });
    quantityInput.addEventListener('input', () => { validateQuantity(); calculateTotal(); });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isProductValid = validateProduct();
        const isQuantityValid = validateQuantity();

        if (isNameValid && isEmailValid && isProductValid && isQuantityValid) {
            const selectedProduct = productsData.find(p => p.id == productSelect.value);
            const qty = parseInt(quantityInput.value);
            const totalPrice = (selectedProduct.price * qty).toFixed(2);
            const notes = notesInput.value.trim() || '-';

            summaryContent.innerHTML = `
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Nama:</span>
                    <span class="font-semibold text-slate-800">${escapeHTML(nameInput.value)}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Email:</span>
                    <span class="font-semibold text-slate-800">${escapeHTML(emailInput.value)}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Produk:</span>
                    <span class="font-semibold text-slate-800">${escapeHTML(selectedProduct.title)}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Jumlah:</span>
                    <span class="font-semibold text-slate-800">${qty} unit</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Catatan:</span>
                    <span class="font-semibold text-slate-800">${escapeHTML(notes)}</span>
                </div>
                <div class="flex justify-between pt-2 text-base font-bold text-indigo-600">
                    <span>Total Pembayaran:</span>
                    <span>$${totalPrice}</span>
                </div>
            `;

            openModal();
            orderForm.reset();
            totalPriceDisplay.textContent = '$0.00';
            [nameInput, emailInput, productSelect, quantityInput].forEach(el => el.classList.remove('input-success'));
        }
    });

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function openModal() {
        confirmationModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        setTimeout(() => {
            confirmationModal.classList.remove('opacity-0');
            modalBox.classList.remove('scale-95');
            modalBox.classList.add('scale-100');
        }, 10);
    }

    function closeModal() {
        confirmationModal.classList.add('opacity-0');
        modalBox.classList.remove('scale-100');
        modalBox.classList.add('scale-95');
        setTimeout(() => {
            confirmationModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 300);
    }

    closeModalBtn.addEventListener('click', closeModal);
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) closeModal();
    });

    fetchProducts();
});