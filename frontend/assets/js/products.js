(function () {
    var CATEGORY_ICONS = { sneakers:'fa-shoe-prints', tees:'fa-shirt', pants:'fa-person', jackets:'fa-vest', accessories:'fa-bag-shopping' };
    var selectedProductForCart = null;
    var selectedSizeForCart = '';
    var selectedProductForBargain = null;
    var bargainFinalPrice = 0;
    var bargainCurrentLang = localStorage.getItem('nanb_bargain_lang') || 'mm';

    // Pagination Variables
    var currentPage = 1;
    var itemsPerPage = 20; // တစ်မျက်နှာလျှင် ၂၀ ခု ပြသရန်

    function escapeHtml(text){ var div=document.createElement('div'); div.textContent = text == null ? '' : String(text); return div.innerHTML; }
    function slugify(text){ return String(text || '').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
    function parsePrice(price){ return Number(String(price || '0').replace(/[^0-9.]/g,'')) || 0; }
    function formatPrice(price){ return parsePrice(price).toLocaleString() + ' MMK'; }
    function getCategoryIcon(category){ return CATEGORY_ICONS[category] || 'fa-tag'; }
    function uniqueSorted(values){ return Array.from(new Set(values.filter(Boolean))).sort(function(a,b){ return String(a).localeCompare(String(b)); }); }
    function brandList(product){ return Array.isArray(product.brand) ? product.brand : String(product.brand || 'NaNb').split(',').map(function(x){return x.trim();}); }
    function mainBrand(product){ return brandList(product)[0] || 'NaNb'; }
    function productBrandSlugs(product){ return brandList(product).map(slugify); }
    function normalizeProduct(product){
        var price = parsePrice(product.price);
        var brands = brandList(product);
        return Object.assign({}, product, {
            id: String(product.id),
            price: price,
            brand: brands.join(', '),
            brandList: brands,
            brandSlug: slugify(brands[0]),
            brandSlugs: brands.map(slugify),
            category: String(product.category || '').toLowerCase(),
            color: product.color || '',
            rating: Number(product.rating || 0),
            instock_size: Array.isArray(product.instock_size) ? product.instock_size : [],
            keywordsText: [product.name, product.description, product.category, product.color, (product.keyword || []).join(' '), brands.join(' ')].join(' ').toLowerCase(),
            popularity: Number(product.popularity || Math.round(Number(product.rating || 4.5) * 100)),
            createdAt: product.createdAt || '2026-01-01'
        });
    }
    function normalizeCatalog(products){ return (products || []).map(normalizeProduct); }

    function getQueryParams(){ var p=new URLSearchParams(window.location.search); return { category:p.get('category')||'', brand:p.get('brand')||'', sort:p.get('sort')||'popular', search:p.get('q')||'', size:p.get('size')||'', color:p.get('color')||'', price:p.get('price')||'', rating:p.get('rating')||'' }; }
    function currentFilters(){ return { category:val('categoryFilter'), brand:val('brandFilter'), size:val('sizeFilter'), color:val('colorFilter'), price:val('priceFilter'), rating:val('ratingFilter'), sort:val('sortSelect')||'popular', search:val('productSearchInput') }; }
    function val(id){ var el=document.getElementById(id); return el ? el.value.trim() : ''; }
    function setVal(id, value){ var el=document.getElementById(id); if(el) el.value = value || ''; }

    function filterProducts(products, filters){
        return products.filter(function(product){
            if(filters.category && product.category !== filters.category) return false;
            if(filters.brand && product.brandSlugs.indexOf(filters.brand) === -1) return false;
            if(filters.size && product.instock_size.indexOf(filters.size) === -1) return false;
            if(filters.color && slugify(product.color) !== filters.color) return false;
            if(filters.rating && product.rating < Number(filters.rating)) return false;
            if(filters.price){ var parts=filters.price.split('-').map(Number); if(product.price < parts[0] || product.price > parts[1]) return false; }
            if(filters.search){ var q=filters.search.toLowerCase(); if(product.keywordsText.indexOf(q) === -1) return false; }
            return true;
        });
    }
    function sortProducts(products, sortKey){ var s=products.slice(); s.sort(function(a,b){ if(sortKey==='price_low')return a.price-b.price; if(sortKey==='price_high')return b.price-a.price; if(sortKey==='newest')return new Date(b.createdAt)-new Date(a.createdAt); if(sortKey==='rating')return b.rating-a.rating; return b.popularity-a.popularity; }); return s; }

    function renderStars(rating){ var full=Math.floor(rating); var half=rating-full>=0.5; var html='<div class="nanb-rating-stars" title="'+escapeHtml(rating)+' stars">'; for(var i=1;i<=5;i++){ html += '<i class="fa-' + (i<=full ? 'solid' : (i===full+1 && half ? 'solid nanb-star-half' : 'regular')) + ' fa-star"></i>'; } return html + '<span>'+rating.toFixed(1)+'</span></div>'; }

    // Mobile screen အတွက် col-6 ပြောင်းထားပါသည်
    function renderGridCard(product){
        var icon=getCategoryIcon(product.category);
        var wishlisted=typeof NaNbWishlist !== 'undefined' && NaNbWishlist.isIn(product.id);
        var imageHtml=product.image ? '<img src="'+escapeHtml(product.image)+'" alt="'+escapeHtml(product.name)+'" class="product-card-image" loading="lazy" onerror="this.classList.add(\'is-broken\')"><div class="product-card-fallback"><i class="fa-solid '+icon+' fa-4x text-muted opacity-25"></i></div>' : '<div class="product-card-fallback is-visible"><i class="fa-solid '+icon+' fa-4x text-muted opacity-25"></i></div>';
        return '<div class="col-6 col-md-6 col-lg-4 col-xl-3 product-card-container" data-db-brand="'+escapeHtml(product.brandSlug)+'" data-db-cat="'+escapeHtml(product.category)+'">'+
            '<div class="card product-card p-0 h-100 position-relative">'+
                '<div class="img-container"><div class="product-card-media">'+imageHtml+'</div></div>'+
                '<div class="card-body p-3 d-flex flex-column justify-content-between">'+
                    '<div class="product-card-top"><div class="d-flex justify-content-between gap-2 align-items-start"><span class="brand-name">'+escapeHtml(product.brand)+'</span>'+renderStars(product.rating)+'</div><h4 class="product-title">'+escapeHtml(product.name)+'</h4><div class="product-card-meta"><span>'+escapeHtml(product.color)+'</span><span>'+product.instock_size.length+' sizes</span></div></div>'+
                    '<div class="product-card-footer d-flex justify-content-between align-items-center mt-3 gap-2"><span class="resell-price">'+formatPrice(product.price)+'</span><div class="product-card-actions d-flex gap-2"><button type="button" class="btn btn-sm product-wishlist-btn'+(wishlisted?' is-active':'')+'" data-wishlist-id="'+product.id+'" aria-label="Add to wishlist" aria-pressed="'+(wishlisted?'true':'false')+'"><i class="'+(wishlisted?'fa-solid':'fa-regular')+' fa-heart"></i></button><button type="button" class="btn btn-outline-warning btn-sm product-bargain-btn" data-bargain-id="'+product.id+'" aria-label="Negotiate price"><i class="fa-solid fa-handshake"></i></button><button type="button" class="btn btn-dark btn-sm product-add-cart-btn" data-add-to-cart="'+product.id+'" aria-label="Add to cart"><i class="fa-solid fa-cart-plus text-white"></i></button></div></div>'+
                '</div></div></div>';
    }

    function t(key, fallback) {
        return window.NaNbI18n && typeof NaNbI18n.t === 'function' ? NaNbI18n.t(key, fallback) : (fallback || key);
    }

    function renderEmptyState(message) {
        return '<div class="col-12 text-center py-5"><i class="fa-solid fa-box-open fa-3x text-muted opacity-50 mb-3"></i><p class="text-muted mb-0">' + escapeHtml(message || t('products.emptyFilter')) + '</p></div>';
    }

    // Responsive Pagination with Ellipsis
    function renderPagination(totalItems) {
        var paginationNav = document.querySelector('nav ul.streetwear-pagination');
        if (!paginationNav) return;

        var totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) {
            paginationNav.innerHTML = '';
            return;
        }

        var html = '';

        // Previous Button
        html += '<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">' +
                '<a class="page-link" href="#" data-page="' + (currentPage - 1) + '">«</a></li>';

        // Calculate Visible Page Range
        var startPage = Math.max(1, currentPage - 1);
        var endPage = Math.min(totalPages, currentPage + 1);

        if (currentPage <= 2) {
            endPage = Math.min(totalPages, 3);
        } else if (currentPage >= totalPages - 1) {
            startPage = Math.max(1, totalPages - 2);
        }

        // First Page & Ellipsis
        if (startPage > 1) {
            html += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
            if (startPage > 2) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Middle Pages
        for (var i = startPage; i <= endPage; i++) {
            html += '<li class="page-item ' + (i === currentPage ? 'active' : '') + '">' +
                    '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
        }

        // Last Page & Ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            html += '<li class="page-item"><a class="page-link" href="#" data-page="' + totalPages + '">' + totalPages + '</a></li>';
        }

        // Next Button
        html += '<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">' +
                '<a class="page-link" href="#" data-page="' + (currentPage + 1) + '">»</a></li>';

        paginationNav.innerHTML = html;
    }

    function renderProductsGrid(){ 
        var grid = document.getElementById('productsDisplayGrid'); 
        if(!grid) return; 

        var filters = currentFilters(); 
        var allFilteredProducts = sortProducts(filterProducts(window.NANB_PRODUCTS || [], filters), filters.sort); 

        document.getElementById('productResultCount').textContent = allFilteredProducts.length; 

        var totalPages = Math.ceil(allFilteredProducts.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) currentPage = 1;

        var startIndex = (currentPage - 1) * itemsPerPage;
        var paginatedProducts = allFilteredProducts.slice(startIndex, startIndex + itemsPerPage);

        grid.innerHTML = paginatedProducts.length 
            ? paginatedProducts.map(renderGridCard).join('') 
            : renderEmptyState(); 

        renderPagination(allFilteredProducts.length);

        if (typeof NaNbWishlist !== 'undefined') NaNbWishlist.syncButtons(); 
        updateUrl(filters); 
    }

    function updateUrl(filters){ var url=new URL(window.location.href); ['category','brand','size','color','price','rating','sort'].forEach(function(k){ filters[k]?url.searchParams.set(k,filters[k]):url.searchParams.delete(k); }); filters.search?url.searchParams.set('q',filters.search):url.searchParams.delete('q'); window.history.replaceState({},'',url); }
    function fillSelect(id, items, labeler){ var el=document.getElementById(id); if(!el)return; var first=el.options[0] ? el.options[0].outerHTML : '<option value="">All</option>'; el.innerHTML=first+items.map(function(item){ return '<option value="'+escapeHtml(item.value)+'">'+escapeHtml(labeler?labeler(item):item.label)+'</option>'; }).join(''); }
    
    function buildFilters(){
        var products=window.NANB_PRODUCTS||[];
        fillSelect('categoryFilter', uniqueSorted(products.map(function(p){return p.category;})).map(function(x){return{value:x,label:x.charAt(0).toUpperCase()+x.slice(1)}}));
        fillSelect('sizeFilter', uniqueSorted(products.reduce(function(all,p){ return all.concat(p.instock_size || []); },[])).map(function(x){return{value:x,label:x}}));
        fillSelect('colorFilter', uniqueSorted(products.map(function(p){return p.color;})).map(function(x){return{value:slugify(x),label:x}}));
        var ratingItems=uniqueSorted(products.map(function(p){ return Number(p.rating || 0).toFixed(1); })).filter(function(r){ return Number(r) > 0; }).sort(function(a,b){ return Number(b)-Number(a); }).map(function(r){ return { value:r, label:r + '+ stars' }; });
        fillSelect('ratingFilter', ratingItems);
        var brandItems=[]; products.forEach(function(p){ p.brandList.forEach(function(b){ brandItems.push(b); }); });
        brandItems=uniqueSorted(brandItems).map(function(b){return{value:slugify(b),label:b}});
        fillSelect('brandFilter', brandItems);
        renderBrandShowcase(brandItems);
    }

    function renderBrandShowcase(brands) {
        var row = document.getElementById('brandFilterRow');
        if (!row) return;
        row.innerHTML = brands.map(function (b) {
            var initials = (window.NaNbBrandLogos && NaNbBrandLogos.getInitials)
                ? NaNbBrandLogos.getInitials(b.label)
                : b.label.split(/\s+/).map(function (x) { return x[0]; }).join('').slice(0, 3).toUpperCase();
            var logoUrl = window.NaNbBrandLogos ? NaNbBrandLogos.getUrl(b.value) : null;
            var circleContent = logoUrl
                ? '<img src="' + escapeHtml(logoUrl) + '" alt="' + escapeHtml(b.label) + '" class="nanb-brand-logo-img" loading="lazy" onerror="this.remove();this.parentElement.querySelector(\'.nanb-txt-logo\').classList.add(\'is-visible\');">'
                  + '<span class="nanb-txt-logo">' + escapeHtml(initials) + '</span>'
                : '<span class="nanb-txt-logo is-visible">' + escapeHtml(initials) + '</span>';
            return '<a href="products.html?brand=' + escapeHtml(b.value) + '" class="nanb-brand-node text-decoration-none py-3" data-brand-pick="' + escapeHtml(b.value) + '">' +
                '<div class="nanb-brand-circle">' + circleContent + '</div>' +
                '<span class="nanb-brand-label">' + escapeHtml(b.label) + '</span></a>';
        }).join('');
    }

    function initProductsPage(){ 
        var grid=document.getElementById('productsDisplayGrid'); 
        if(!grid)return; 
        
        buildFilters(); 
        var q=getQueryParams(); 
        Object.keys(q).forEach(function(k){ var map={category:'categoryFilter',brand:'brandFilter',size:'sizeFilter',color:'colorFilter',price:'priceFilter',rating:'ratingFilter',sort:'sortSelect',search:'productSearchInput'}; setVal(map[k],q[k]); }); 
        
        renderProductsGrid(); 

        ['categoryFilter','sizeFilter','colorFilter','priceFilter','brandFilter','ratingFilter','sortSelect'].forEach(function(id){ 
            var el=document.getElementById(id); 
            if(el) el.addEventListener('change', function(){
                currentPage = 1;
                renderProductsGrid();
            }); 
        }); 

        var search=document.getElementById('productSearchInput'); 
        if(search) search.addEventListener('input', function(){
            currentPage = 1;
            renderProductsGrid();
        }); 

        var clear=document.getElementById('clearSearchBtn'); 
        if(clear) clear.addEventListener('click',function(){
            setVal('productSearchInput','');
            currentPage = 1;
            renderProductsGrid();
        }); 

        var reset=document.getElementById('resetFiltersBtn'); 
        if(reset) reset.addEventListener('click',function(){
            ['categoryFilter','sizeFilter','colorFilter','priceFilter','brandFilter','ratingFilter','productSearchInput'].forEach(function(id){setVal(id,'');});
            currentPage = 1;
            renderProductsGrid();
        }); 

        document.addEventListener('click',function(e){ 
            var b=e.target.closest('[data-brand-pick]'); 
            if(!b)return; 
            e.preventDefault(); 
            setVal('brandFilter',b.getAttribute('data-brand-pick')); 
            currentPage = 1;
            renderProductsGrid(); 
        }); 

        // Pagination Click Handler
        document.addEventListener('click', function(e) {
            var pageLink = e.target.closest('.streetwear-pagination [data-page]');
            if (!pageLink) return;
            e.preventDefault();
            
            var targetPage = parseInt(pageLink.getAttribute('data-page'), 10);
            if (targetPage && targetPage !== currentPage) {
                currentPage = targetPage;
                renderProductsGrid();
                window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
            }
        });
    }

    function renderHomeStars(rating){
        var value = Number(rating || 0);
        var full = Math.floor(value);
        var html = '<div class="home-card-stars" aria-label="Rating '+escapeHtml(value.toFixed(1))+' out of 5">';
        for(var i=1;i<=5;i++) html += '<i class="fa-' + (i<=full ? 'solid' : 'regular') + ' fa-star"></i>';
        return html + '<span>'+value.toFixed(1)+'</span></div>';
    }

    function renderColumnCard(product, tagText, tagClass){
        var icon=getCategoryIcon(product.category);
        var wishlisted=typeof NaNbWishlist !== 'undefined' && NaNbWishlist.isIn(product.id);
        var imageHtml=product.image ? '<img src="'+escapeHtml(product.image)+'" alt="'+escapeHtml(product.name)+'" loading="lazy" onerror="this.classList.add(\'is-broken\')"><div class="product-column-fallback"><i class="fa-solid '+icon+' fa-3x text-muted opacity-25"></i></div>' : '<div class="product-column-fallback" style="display:flex"><i class="fa-solid '+icon+' fa-3x text-muted opacity-25"></i></div>';
        return '<article class="product-column-card">'+
            '<a class="product-column-link" href="products.html?category='+escapeHtml(product.category)+'&q='+encodeURIComponent(product.name)+'" aria-label="View '+escapeHtml(product.name)+'"></a>'+
            '<span class="card-tag '+escapeHtml(tagClass||'')+'">'+escapeHtml(tagText||'Drop')+'</span>'+
            '<div class="product-column-image">'+imageHtml+'</div>'+
            '<div class="product-column-body">'+
                '<span class="product-column-brand">'+escapeHtml(product.brand)+'</span>'+
                '<h3 class="product-column-title">'+escapeHtml(product.name)+'</h3>'+
                renderHomeStars(product.rating)+
                '<p class="product-column-name">'+escapeHtml(product.color)+' · '+(product.instock_size||[]).length+' sizes</p>'+
                '<div class="product-column-footer">'+
                    '<div class="product-column-price-block"><span class="product-column-price-label">Price</span><span class="product-column-price">'+formatPrice(product.price)+'</span></div>'+
                    '<div class="product-column-actions">'+
                        '<button type="button" class="product-column-wishlist'+(wishlisted?' is-active':'')+'" data-wishlist-id="'+product.id+'" aria-label="Add to wishlist" aria-pressed="'+(wishlisted?'true':'false')+'"><i class="'+(wishlisted?'fa-solid':'fa-regular')+' fa-heart"></i></button>'+
                        '<button type="button" class="product-column-cart product-column-bargain" data-bargain-id="'+product.id+'" aria-label="Negotiate price"><i class="fa-solid fa-handshake"></i></button><button type="button" class="product-column-cart" data-add-to-cart="'+product.id+'" aria-label="Add to cart"><i class="fa-solid fa-cart-plus"></i></button>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</article>';
    }

    function renderHomeSections(){
        var products=window.NANB_PRODUCTS||[];
        var trending=document.getElementById('promotionsScroll');
        var local=document.getElementById('localBrandsScroll');
        var budget=document.getElementById('budgetScroll');
        if(!trending && !local && !budget) return;

        var searchInput=document.getElementById('homeTrendingSearchInput');
        var searchQuery=searchInput?searchInput.value.trim().toLowerCase():'';
        var baseTrending=products.filter(function(p){return p.rating>=4.8 || p.popularity>=470;});
        var trendingItems=searchQuery
            ? sortProducts(filterProducts(baseTrending,{category:'',brand:'',size:'',color:'',price:'',rating:'',search:searchQuery}),'rating').slice(0,12)
            : sortProducts(baseTrending,'rating').slice(0,12);
        var localNames=['Local Brand'];
        var localItems=products.filter(function(p){ return (p.brandList||[]).some(function(b){ return localNames.indexOf(b)!==-1; }); }).slice(0,12);
        var budgetItems=sortProducts(products.filter(function(p){return p.price<=200000;}),'price_low').slice(0,12);

        if(trending) trending.innerHTML = trendingItems.map(function(p){return renderColumnCard(p,'Trending','card-tag-sale');}).join('') || renderEmptyState(searchQuery ? t('products.emptyFilter') : 'No trending items found.');
        if(local) local.innerHTML = localItems.map(function(p){return renderColumnCard(p,'Local Pick','card-tag-local');}).join('') || renderEmptyState('No local brand items found.');
        if(budget) budget.innerHTML = budgetItems.map(function(p){return renderColumnCard(p,'Under 200K','card-tag-budget');}).join('') || renderEmptyState('No budget items found.');

        var searchMeta=document.getElementById('homeTrendingSearchMeta');
        if(searchMeta){
            if(searchQuery){
                searchMeta.classList.remove('d-none');
                searchMeta.innerHTML='Showing <strong>'+trendingItems.length+'</strong> trending result'+(trendingItems.length===1?'':'s')+' for "<strong>'+escapeHtml(searchQuery)+'</strong>". <a href="products.html?q='+encodeURIComponent(searchQuery)+'">View all shop results</a>';
            }else{
                searchMeta.classList.add('d-none');
                searchMeta.textContent='';
            }
        }

        if(typeof NaNbWishlist!=='undefined') NaNbWishlist.syncButtons();
    }

    function initHomeTrendingSearch(){
        var input=document.getElementById('homeTrendingSearchInput');
        var clearBtn=document.getElementById('homeTrendingSearchClear');
        var form=document.getElementById('homeTrendingSearchForm');
        if(!input) return;
        input.addEventListener('input',renderHomeSections);
        if(clearBtn) clearBtn.addEventListener('click',function(){ input.value=''; renderHomeSections(); input.focus(); });
        if(form) form.addEventListener('submit',function(e){ e.preventDefault(); renderHomeSections(); });
    }

    function sameId(a, b) {
        return String(a).replace(/^0+/, '') === String(b).replace(/^0+/, '');
    }

    function findProductById(productId) {
        return (window.NANB_PRODUCTS || []).find(function (item) {
            return sameId(item.id, productId);
        });
    }

    function addToCartDirect(product, selectedSize) {
        if (typeof NaNbCart === 'undefined') return false;
        var size = selectedSize || ((product.instock_size && product.instock_size[0]) || 'Free Size');
        NaNbCart.add(Object.assign({}, product, { selectedSize: size }), 1);
        return true;
    }

    function openSizeModal(product){
        selectedProductForCart=product; selectedSizeForCart='';
        var modal=document.getElementById('sizePickerModal'); var info=document.getElementById('sizePickerProduct'); var options=document.getElementById('sizePickerOptions'); var confirm=document.getElementById('confirmSizeAddBtn');
        if(!modal||!info||!options||!confirm){
            return addToCartDirect(product);
        }
        var sizes = Array.isArray(product.instock_size) && product.instock_size.length ? product.instock_size : ['Free Size'];
        info.innerHTML='<img src="'+escapeHtml(product.image)+'" alt=""><div><span>'+escapeHtml(product.brand)+'</span><strong>'+escapeHtml(product.name)+'</strong><small>'+formatPrice(product.price)+'</small></div>';
        options.innerHTML=sizes.map(function(size){return '<button type="button" class="nanb-size-choice" data-size-choice="'+escapeHtml(size)+'">'+escapeHtml(size)+'</button>';}).join('');
        confirm.disabled=true;
        confirm.textContent='Add to cart';
        modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false');
        if(sizes.length===1){
            selectedSizeForCart=sizes[0];
            var firstChoice=options.querySelector('.nanb-size-choice');
            if(firstChoice) firstChoice.classList.add('is-selected');
            confirm.disabled=false;
        }
    }

    function closeSizeModal(){ var modal=document.getElementById('sizePickerModal'); if(modal){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');} selectedProductForCart=null; selectedSizeForCart=''; }
    
    function initAddToCartButtons(){
        document.addEventListener('click',function(event){
            var button=event.target.closest('[data-add-to-cart]');
            if(!button) return;
            event.preventDefault();
            event.stopPropagation();
            if(window.NaNbApi && !NaNbApi.requireLogin('Login required to add items to your cart.')) return;
            var productId=String(button.getAttribute('data-add-to-cart'));
            var product=findProductById(productId);
            if(!product){
                if(typeof NaNbCart!=='undefined' && NaNbCart.showToast) NaNbCart.showToast('Product is still loading. Try again.', 'error');
                return;
            }
            openSizeModal(product);
        });
        document.addEventListener('click',function(e){
            var s=e.target.closest('[data-size-choice]');
            if(s){
                document.querySelectorAll('.nanb-size-choice').forEach(function(x){x.classList.remove('is-selected')});
                s.classList.add('is-selected');
                selectedSizeForCart=s.getAttribute('data-size-choice');
                var confirmBtn=document.getElementById('confirmSizeAddBtn');
                if(confirmBtn) confirmBtn.disabled=false;
            }
            if(e.target.closest('[data-close-size-modal]')) closeSizeModal();
        });
        var confirm=document.getElementById('confirmSizeAddBtn');
        if(confirm) confirm.addEventListener('click',function(){
            if(!selectedProductForCart||!selectedSizeForCart||typeof NaNbCart==='undefined') return;
            var product=Object.assign({},selectedProductForCart,{selectedSize:selectedSizeForCart});
            NaNbCart.add(product,1);
            confirm.innerHTML='<i class="fa-solid fa-check me-2"></i>Added!';
            setTimeout(function(){confirm.innerHTML='Add to cart'; closeSizeModal();},850);
        });
    }

    function bargainText(key, data){
        data = data || {};
        var text = {
            mm: {
                title: 'Negotiate Your Price',
                desc: 'စျေးညှိချင်တဲ့ amount ကိုရေးပါ။ AI Bot က approve / counter offer ပြန်ပေးမယ်။',
                hello: 'မင်္ဂလာပါ 👋 ဒီ item ကို စျေးညှိချင်တာလား? မင်း offer price ကိုရေးပါ။',
                invalid: 'Offer price ကို number နဲ့ရေးပါနော်။ ဥပမာ 85000',
                userOffer: formatPrice(data.offer) + ' နဲ့ရမလား?',
                original: 'Original: ',
                approved: 'Deal approved ✅ ' + formatPrice(data.finalPrice) + ' နဲ့ယူလို့ရပါတယ်။ Accept နှိပ်ရင် deal price နဲ့ cart ထဲထည့်ပေးမယ်။',
                counter: 'အဲ့စျေးက နည်းနည်းခက်ပါတယ် 😅 ဒါပေမယ့် today special အနေနဲ့ ' + formatPrice(data.finalPrice) + ' နဲ့ပေးနိုင်ပါတယ်။',
                rejected: 'Sorry ပါ။ ' + formatPrice(data.offer) + ' က minimum price ထက်နည်းနေပါတယ်။ အနည်းဆုံး ' + formatPrice(data.finalPrice) + ' လောက်ဆိုရင် deal လုပ်ပေးနိုင်ပါတယ်။',
                acceptApproved: 'Accept Deal & Add to Cart',
                acceptCounter: 'Accept Counter Offer',
                added: 'Added with Deal Price!',
                dealNote: 'DEAL PRICE'
            },
            en: {
                title: 'Negotiate Your Price',
                desc: 'Enter your offer amount. The AI Bot will approve, reject, or give a counter offer.',
                hello: 'Hi 👋 Want to negotiate this item? Enter your offer price.',
                invalid: 'Please enter the offer price as a number. Example: 85000',
                userOffer: 'Can I get it for ' + formatPrice(data.offer) + '?',
                original: 'Original: ',
                approved: 'Deal approved ✅ You can get it for ' + formatPrice(data.finalPrice) + '. Click accept to add it to cart with the deal price.',
                counter: 'That price is a little difficult 😅 But today I can offer it for ' + formatPrice(data.finalPrice) + '.',
                rejected: 'Sorry, ' + formatPrice(data.offer) + ' is below our minimum price. The best deal I can offer is ' + formatPrice(data.finalPrice) + '.',
                acceptApproved: 'Accept Deal & Add to Cart',
                acceptCounter: 'Accept Counter Offer',
                added: 'Added with Deal Price!',
                dealNote: 'DEAL PRICE'
            }
        };
        return (text[bargainCurrentLang] || text.mm)[key] || key;
    }

    function updateBargainLanguageUI(){
        document.querySelectorAll('[data-bargain-lang]').forEach(function(btn){
            btn.classList.toggle('is-active', btn.getAttribute('data-bargain-lang') === bargainCurrentLang);
        });
        var title = document.getElementById('bargainTitleText');
        var desc = document.getElementById('bargainDescText');
        if(title) title.textContent = bargainText('title');
        if(desc) desc.textContent = bargainText('desc');
    }

    function openBargainModal(product){
        selectedProductForBargain = product;
        bargainFinalPrice = 0;
        var modal = document.getElementById('bargainModal');
        var productBox = document.getElementById('bargainProduct');
        var offerInput = document.getElementById('bargainOfferInput');
        var chat = document.getElementById('bargainChat');
        var acceptBtn = document.getElementById('acceptBargainBtn');
        if(!modal || !productBox || !offerInput || !chat || !acceptBtn) return;
        productBox.innerHTML = '<img src="'+escapeHtml(product.image)+'" alt=""><div><span>'+escapeHtml(product.brand)+'</span><strong>'+escapeHtml(product.name)+'</strong><small>'+bargainText('original')+formatPrice(product.price)+'</small></div>';
        updateBargainLanguageUI();
        offerInput.value = '';
        chat.innerHTML = '<div class="bargain-bubble ai">'+escapeHtml(bargainText('hello'))+'</div>';
        acceptBtn.disabled = true;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden','false');
        setTimeout(function(){ offerInput.focus(); }, 150);
    }

    function closeBargainModal(){
        var modal=document.getElementById('bargainModal');
        if(modal){ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); }
    }

    function initBargainBot(){
        document.addEventListener('click', function(e){
            var button = e.target.closest('[data-bargain-id]');
            if(!button) return;
            e.preventDefault();
            e.stopPropagation();
            var productId = String(button.getAttribute('data-bargain-id'));
            var product = (window.NANB_PRODUCTS || []).find(function(item){ return String(item.id) === productId; });
            if(product) openBargainModal(product);
        });

        document.addEventListener('click', function(e){
            if(e.target.closest('[data-close-bargain-modal]')) closeBargainModal();
        });

        document.querySelectorAll('[data-bargain-lang]').forEach(function(btn){
            btn.addEventListener('click', function(){
                bargainCurrentLang = btn.getAttribute('data-bargain-lang') || 'mm';
                localStorage.setItem('nanb_bargain_lang', bargainCurrentLang);
                updateBargainLanguageUI();
                var chatNow = document.getElementById('bargainChat');
                if(chatNow && selectedProductForBargain && chatNow.children.length <= 1){
                    chatNow.innerHTML = '<div class="bargain-bubble ai">'+escapeHtml(bargainText('hello'))+'</div>';
                }
            });
        });

        var sendBtn = document.getElementById('sendBargainOfferBtn');
        var offerInput = document.getElementById('bargainOfferInput');
        var chat = document.getElementById('bargainChat');
        var acceptBtn = document.getElementById('acceptBargainBtn');

        async function sendOffer(){
            if (!selectedProductForBargain || !offerInput || !chat || !acceptBtn) return;
            
            var offer = parsePrice(offerInput.value);
            if (!offer) {
                chat.innerHTML += '<div class="bargain-bubble ai">' + escapeHtml(bargainText('invalid')) + '</div>';
                return;
            }

            chat.innerHTML += '<div class="bargain-bubble user">' + escapeHtml(bargainText('userOffer', { offer: offer })) + '</div>';
            
            var loadingId = 'ai-typing-' + Date.now();
            var loadingMsg = (bargainCurrentLang === 'mm') 
                ? 'AI က စျေးကွက်စစ်ဆေးပြီး စဉ်းစားနေပါတယ်...' 
                : 'AI is thinking & analyzing market price...';
                
            chat.innerHTML += '<div class="bargain-bubble ai" id="' + loadingId + '">' + loadingMsg + '</div>';
            chat.scrollTop = chat.scrollHeight;

            try {
                var response = await fetch('http://localhost:5000/api/bargain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productName: selectedProductForBargain.name,
                        storePrice: selectedProductForBargain.price,
                        internetPrice: selectedProductForBargain.marketPrice || selectedProductForBargain.price,
                        userOffer: offer,
                        lang: bargainCurrentLang
                    })
                });

                var decision = await response.json();

                var loadingEl = document.getElementById(loadingId);
                if (loadingEl) loadingEl.remove();

                bargainFinalPrice = decision.finalPrice;
                chat.innerHTML += '<div class="bargain-bubble ai ' + decision.status + '">' + escapeHtml(decision.message) + '</div>';
                
                acceptBtn.disabled = (decision.status === 'rejected');
                acceptBtn.innerHTML = (decision.status === 'approved') 
                    ? bargainText('acceptApproved') 
                    : bargainText('acceptCounter');

            } catch (err) {
                var loadingEl = document.getElementById(loadingId);
                if (loadingEl) loadingEl.remove();
                chat.innerHTML += '<div class="bargain-bubble ai rejected">ချိတ်ဆက်မှု မအောင်မြင်ပါ။ မကြာမီ ပြန်လည် ကြိုးစားပါ။</div>';
            }

            offerInput.value = '';
            chat.scrollTop = chat.scrollHeight;
        }

        if(sendBtn) sendBtn.addEventListener('click', sendOffer);
        if(offerInput) offerInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') sendOffer(); });
        if(acceptBtn) acceptBtn.addEventListener('click', function(){
            if(window.NaNbApi && !NaNbApi.requireLogin('Login required to add deal items to your cart.')) return;
            if(!selectedProductForBargain || !bargainFinalPrice || typeof NaNbCart === 'undefined') return;
            var product = Object.assign({}, selectedProductForBargain, {
                price: bargainFinalPrice,
                dealPrice: bargainFinalPrice,
                negotiatedPrice: bargainFinalPrice,
                originalPrice: parsePrice(selectedProductForBargain.price),
                isNegotiatedDeal: true,
                selectedSize: (selectedProductForBargain.instock_size || [])[0] || 'Free Size'
            });
            NaNbCart.add(product, 1);
            acceptBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>'+escapeHtml(bargainText('added'));
            setTimeout(closeBargainModal, 700);
        });
    }

    async function fetchFirstWorkingJson(paths){
        for(var i=0;i<paths.length;i++){
            try{
                var response = await fetch(paths[i], { cache: 'no-store' });
                if(response.ok){
                    var data = await response.json();
                    if(Array.isArray(data) && data.length) return data;
                }
            }catch(error){}
        }
        return [];
    }

    function fixImagePaths(products){
        return products.map(function(product){
            if(product.image && String(product.image).indexOf('/') === -1){
                product.image = 'assets/images/' + product.image;
            }
            return product;
        });
    }

    document.addEventListener('DOMContentLoaded', async function(){
        var rawProducts = await fetchFirstWorkingJson([
            'assets/js/Products.json',
            'Products.json',
            './Products.json',
            '/assets/js/Products.json'
        ]);

        if(!rawProducts.length && typeof NaNbApi !== 'undefined'){
            rawProducts = await NaNbApi.loadProducts();
        }

        window.NANB_PRODUCTS = normalizeCatalog(fixImagePaths(rawProducts));
        initProductsPage(); renderHomeSections(); initHomeTrendingSearch(); initAddToCartButtons(); initBargainBot();
    });

    window.addEventListener('nanb:lang-changed', function () {
        if (window.NaNbI18n) NaNbI18n.apply(document);
        renderHomeSections();
        renderProductsGrid();
        buildFilters();
    });
})();