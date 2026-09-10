var NaNbI18n = (function () {
    var STORAGE_KEY = 'nanb_lang';
    var currentLang = 'mm';

    var STRINGS = {
        en: {
            'nav.home': 'Home',
            'nav.shop': 'Shop All',
            'nav.contact': 'Contact Us',
            'nav.about': 'About Us',
            'nav.orders': 'Order Tracking',
            'nav.login': 'Login',
            'nav.signup': 'Signup',
            'nav.logout': 'Logout',
            'nav.profile': 'My Profile',
            'footer.tagline': 'Premium streetwear marketplace featuring exclusive local brands, authentic sneakers, accessories, and limited drops.',
            'footer.stayUpdated': 'Stay Updated',
            'footer.emailPlaceholder': 'Enter your email',
            'footer.notifyMe': 'Notify Me',
            'footer.notifyHint': 'Get notified about new drops, sales and exclusive offers.',
            'footer.shop': 'Shop',
            'footer.allProducts': 'All Products',
            'footer.sneakers': 'Sneakers',
            'footer.outfits': 'Outfits',
            'footer.accessories': 'Accessories',
            'footer.wishlist': 'Wishlist',
            'footer.customerService': 'Customer Service',
            'footer.orderTracking': 'Order Tracking',
            'footer.faq': 'FAQ',
            'footer.returns': 'Returns & Refunds',
            'footer.shipping': 'Shipping Policy',
            'footer.contact': 'Contact',
            'footer.rights': '© 2026 NaNb. All Rights Reserved.',
            'footer.terms': 'Terms & Conditions',
            'footer.privacy': 'Privacy Policy',
            'footer.cookies': 'Cookie Policy',
            'hero.slide1.title': 'DROP THE LIMITS',
            'hero.slide1.text': 'Discover verified authentic limited sneakers, streetwear, and exclusive local designer releases inside one curated marketplace.',
            'hero.slide1.btn1': 'Shop Collection',
            'hero.slide1.btn2': 'Our Project',
            'hero.slide2.title': 'NEW STREET CULTURE',
            'hero.slide2.text': 'Every single item is meticulously inspected by our expert team before shipping. Shop with absolute confidence.',
            'hero.slide2.btn': 'Browse Hype Items',
            'hero.slide3.title': 'EXCLUSIVE DROPS',
            'hero.slide3.text': 'Never miss out on highly anticipated local brand stock drops and global holy-grail items.',
            'hero.slide3.btn': 'Explore Drops',
            'marquee.authentic': '100% AUTHENTIC',
            'marquee.local': 'LOCAL BRANDS',
            'marquee.budget': 'BELOW 200K MMK',
            'marquee.culture': 'STREET CULTURE',
            'marquee.drops': 'EXCLUSIVE DROPS',
            'cat.sneakers': 'Sneakers',
            'cat.outfits': 'Outfits',
            'cat.trending': 'Trending',
            'cat.local': 'Local Brands',
            'cat.accessories': 'Accessories',
            'home.trending.eyebrow': 'Worldwide',
            'home.trending.title': 'Trending',
            'home.trending.more': 'More',
            'home.trending.search': 'Search trending sneakers, brands, colors...',
            'home.local.eyebrow': 'Myanmar Made',
            'home.local.title': 'Local Brands',
            'home.budget.eyebrow': 'Budget Friendly',
            'home.budget.title': 'Below 200,000 MMK',
            'home.reviews.eyebrow': 'Watch & Learn',
            'home.reviews.title': 'Reviews & Videos',
            'home.reviews.more': 'More Reviews',
            'home.cta.eyebrow': 'Join The Culture',
            'home.cta.title': 'AUTHENTIC STREETWEAR.<br>LOCAL ENERGY.',
            'home.cta.text': 'Verified drops, local designers, and hype pieces — all in one place. Shop the culture today.',
            'home.cta.shop': 'Shop All',
            'home.cta.about': 'About NaNb',
            'products.allDrops': 'All Drops',
            'products.sneakers': 'Sneakers',
            'products.tees': 'Tees',
            'products.pants': 'Pants',
            'products.jackets': 'Jackets',
            'products.shopByBrand': 'SHOP BY BRAND',
            'products.browseTitle': 'BROWSE ALL DROPS',
            'products.browseSub': '100% Authentic Verified Streetwear & Sneakers',
            'products.sortBy': 'Sort By:',
            'products.sort.popular': 'Most Popular',
            'products.sort.priceLow': 'Price: Low to High',
            'products.sort.priceHigh': 'Price: High to Low',
            'products.sort.newest': 'Newest Drops',
            'products.sort.rating': 'Highest Rating',
            'products.search': 'Search sneakers, brands, colors...',
            'products.readyShip': 'Ready to ship',
            'products.subcategory': 'Subcategory',
            'products.size': 'Size',
            'products.colorways': 'Colorways',
            'products.price': 'Price',
            'products.under200k': 'Under 200K',
            'products.price200500': '200K - 500K',
            'products.price5001m': '500K - 1M',
            'products.priceAbove1m': 'Above 1M',
            'products.brand': 'Brand',
            'products.rating': 'Rating',
            'products.reset': 'Reset',
            'products.dropsFound': 'drops found',
            'products.chooseSize': 'Choose Your Size',
            'products.pickSize': 'Pick one available size before adding to cart.',
            'products.addCart': 'Add to cart',
            'products.emptyFilter': 'No products match your filters.',
            'cart.title': 'Your Acquisition Cart',
            'cart.loginView': 'Login to view and manage your cart.',
            'cart.empty': 'Your acquisition cart is empty.',
            'cart.browse': 'Browse Drops',
            'cart.loginNow': 'Login now',
            'cart.loginRequired': 'Please login to checkout your cart.',
            'cart.checkout': 'Checkout',
            'wishlist.title': 'Your Watchlist Portfolio',
            'wishlist.loginView': 'Login to view and manage your wishlist.',
            'wishlist.empty': 'Your watchlist portfolio is empty.',
            'wishlist.notify': 'Notify Drop',
            'wishlist.instaCop': 'Insta-Cop',
            'order.title': 'AUTHENTICATION & ORDER RADAR',
            'order.subtitle': 'Enter your verification serial to audit current order status or review your historical purchase portfolio.',
            'order.archived': 'orders archived',
            'order.orderArchived': 'order archived',
            'order.label': 'Order ID / Certificate Serial',
            'order.placeholder': 'e.g., NANB-1024',
            'order.verify': 'Verify & Track',
            'order.activeLabel': 'Active Tracking Order',
            'order.statusLabel': 'Verification Status',
            'order.currentStatus': 'Current Order Status',
            'order.portfolio': 'PAST PURCHASE PORTFOLIO',
            'order.archive': 'Archive',
            'order.loginView': 'Login to view your order history.',
            'order.empty': 'No orders yet. Complete checkout to see your first order here.',
            'order.noActive': 'No active order',
            'order.loginTrack': 'Login to view and track your orders.',
            'order.searching': 'Searching order...',
            'order.notFound': 'Order not found in your account. Check your order ID from checkout.',
            'order.loginTrackShort': 'Login to track your orders.',
            'contact.title': 'LOCATE THE BRAIN',
            'contact.intro': 'Got questions regarding sizing, shipping, or consignment? Drop us a line or visit our base in Mandalay. We\'re here to keep you laced.',
            'contact.hq': 'HQ Base Location',
            'contact.emailSupport': 'Email Support',
            'contact.sendMessage': 'SEND A MESSAGE',
            'contact.yourName': 'Your Name',
            'contact.namePlaceholder': 'Full Name',
            'contact.email': 'Email Address',
            'contact.subject': 'Subject',
            'contact.subjectPlaceholder': 'Hype Inquiries / Consignment Deal',
            'contact.message': 'Message Body',
            'contact.messagePlaceholder': 'Type your message details here...',
            'contact.submit': 'Fire Message',
            'contact.sent': 'Message Sent',
            'contact.fixFields': 'Please fix the highlighted fields before sending.',
            'contact.success': 'Thanks! Your message was received. We will reply within 24 hours.',
            'contact.emailInvalid': 'Please enter a valid email address.',
            'auth.welcomeBack': 'Welcome Back',
            'auth.login': 'Login',
            'auth.join': 'Join NaNb',
            'auth.signup': 'Sign Up',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.fullName': 'Full Name',
            'auth.confirmPassword': 'Confirm Password',
            'auth.remember': 'Remember me',
            'auth.fullPage': 'Full page',
            'auth.createAccount': 'Create Account',
            'auth.noAccount': 'Don\'t have an account?',
            'auth.signUpLink': 'Sign up',
            'auth.haveAccount': 'Already have an account?',
            'auth.loginLink': 'Login',
            'auth.backHome': 'Back to Home',
            'auth.loginSubtitle': 'Sign in to track orders, save wishlists, and checkout faster.',
            'auth.signupSubtitle': 'Create your account to unlock wishlist sync and secure checkout.',
            'auth.createAccountLink': 'Create account',
            'auth.emailPlaceholder': 'you@email.com',
            'auth.passwordPlaceholder': 'Enter password',
            'auth.namePlaceholder': 'Your name',
            'auth.createPassword': 'Create password',
            'auth.confirmPlaceholder': 'Confirm password',
            'auth.loginFail': 'Please enter a valid email and password.',
            'auth.signupFail': 'Please fill in all fields with a valid email.',
            'auth.passwordMismatch': 'Passwords do not match.',
            'auth.loginSuccess': 'Login successful.',
            'auth.signupSuccess': 'Account created successfully.',
            'auth.invalidCredentials': 'Invalid email or password.',
            'auth.serviceUnavailable': 'Authentication service is unavailable.',
            'human.label': 'Human verification',
            'human.hint': 'Solve the math problem to prove you are human.',
            'human.fail': 'Incorrect answer. Please try again.',
            'newsletter.thanks': 'Thanks! You\'ll be notified about future drops.',
            'newsletter.exists': 'This email is already subscribed.',
            'common.login': 'Login',
            'common.browseDrops': 'Browse Drops',
            'common.price': 'Price',
            'common.sizes': 'sizes',
            'about.hero.badge': 'Mandalay, Myanmar',
            'about.hero.title': 'WE DROP THE HYPE',
            'about.hero.sub': 'No Aim No Brain (NANB) - Premium authentic resell hub curated for global streetwear culture, operated straight out of Mandalay.',
            'about.core.title': 'MANDALAY CORE',
            'about.core.p1': 'Established in 2026, NaNb — short for No Aim No Brain — was founded by a collective of streetwear enthusiasts dedicated to bringing global sneaker culture and highly coveted hype drops closer to local collectors.',
            'about.core.p2': 'Based in Mandalay, we bridge the gap between premium international brands and Myanmar\'s growing community of hypebeasts, resellers, and first-time buyers who want verified pieces without the guesswork.',
            'about.val.verified': '100% Verified',
            'about.val.verifiedDesc': 'Every item undergoes a rigorous physical legit-check by our expert curators before reaching your hands.',
            'about.val.local': 'Local & Global',
            'about.val.localDesc': 'Sourcing hyper-limited sneakers, underground streetwear brands, and exclusive archival pieces worldwide.',
            'about.val.fair': 'Fair Pricing',
            'about.val.fairDesc': 'Transparent MMK pricing, budget-friendly drops under 200K, and our AI bargaining assistant for smarter deals.',
            'about.val.track': 'Tracked Delivery',
            'about.val.trackDesc': 'From authentication to dispatch, every order gets a vault ID and live status updates on our order radar.',
            'about.mission.label': 'Our Mission',
            'about.mission.title': 'Make authentic hype accessible.',
            'about.mission.text': 'We exist to remove the fear from buying sneakers and streetwear online. NaNb gives collectors a trusted home where every listing is inspected, every price is clear, and every order can be tracked from warehouse to doorstep.',
            'about.vision.label': 'Our Vision',
            'about.vision.title': 'Myanmar\'s streetwear vault.',
            'about.vision.text': 'We want NaNb to become the go-to marketplace for verified drops across the country — connecting local designers with global culture, and building a community where style, trust, and resale value all move together.',
            'about.stat.verified': 'Items Verified',
            'about.stat.brands': 'Brands Curated',
            'about.stat.satisfaction': 'Buyer Satisfaction',
            'about.stat.turnaround': 'Avg. Auth Turnaround',
            'about.process.label': 'How We Work',
            'about.process.title': 'THE NANB AUTHENTICATION FLOW',
            'about.process.sub': 'Every product passes through the same inspection pipeline — whether it\'s a grail sneaker or a local brand tee.',
            'about.roadmap.label': 'Since Day One',
            'about.roadmap.title': 'OUR ROADMAP',
            'about.roadmap.sub': 'From a small Mandalay resale circle to a full streetwear marketplace — here\'s how NaNb has been building the culture.',
            'about.team.title': 'THE NANB TEAM',
            'about.team.sub': 'The crew behind our verified drops, smooth orders, and customer care.',
            'about.cta.label': 'Join The Drop',
            'about.cta.title': 'READY TO COP VERIFIED HEAT?',
            'about.cta.text': 'Browse trending sneakers, local brand picks, and budget-friendly drops — all authenticated, all tracked, all NaNb.',
            'about.cta.shop': 'Shop Collection',
            'about.cta.contact': 'Contact Us'
        },
        mm: {
            'nav.home': 'ပင်မစာမျက်နှာ',
            'nav.shop': 'အားလုံးကြည့်ရန်',
            'nav.contact': 'ဆက်သွယ်ရန်',
            'nav.about': 'ကျွန်ုပ်တို့အကြောင်း',
            'nav.orders': 'မှာယူမှုခြေရာခံ',
            'nav.login': 'ဝင်ရန်',
            'nav.signup': 'စာရင်းသွင်းရန်',
            'nav.logout': 'ထွက်ရန်',
            'nav.profile': 'ကျွန်ုပ်၏ပရိုဖိုင်',
            'footer.tagline': 'ဒေသတွင်းအမှတ်တံဆိပ်များ၊ စစ်မှန်သော sneakers များနှင့် limited drops များပါဝင်သည့် premium streetwear marketplace.',
            'footer.stayUpdated': 'နောက်ဆုံးရသတင်းရယူရန်',
            'footer.emailPlaceholder': 'သင့် email ထည့်ပါ',
            'footer.notifyMe': 'အကြောင်းကြားပါ',
            'footer.notifyHint': 'drop အသစ်များ၊ sale များနှင့် exclusive offers များအတွက် အကြောင်းကြားချက်ရယူပါ။',
            'footer.shop': 'ဆိုင်',
            'footer.allProducts': 'ပစ္စည်းအားလုံး',
            'footer.sneakers': 'Sneakers',
            'footer.outfits': 'Outfits',
            'footer.accessories': 'Accessories',
            'footer.wishlist': 'Wishlist',
            'footer.customerService': 'Customer Service',
            'footer.orderTracking': 'မှာယူမှုခြေရာခံ',
            'footer.faq': 'FAQ',
            'footer.returns': 'Returns & Refunds',
            'footer.shipping': 'Shipping Policy',
            'footer.contact': 'ဆက်သွယ်ရန်',
            'footer.rights': '© 2026 NaNb. All Rights Reserved.',
            'footer.terms': 'Terms & Conditions',
            'footer.privacy': 'Privacy Policy',
            'footer.cookies': 'Cookie Policy',
            'hero.slide1.title': 'DROP THE LIMITS',
            'hero.slide1.text': 'စစ်မှန်အတည်ပြုထားသော limited sneakers၊ streetwear နှင့် ဒေသတွင်းဒီဇိုင်နာ release များကို တစ်နေရာတည်းတွင် ရှာဖွေပါ။',
            'hero.slide1.btn1': 'Collection ကြည့်ရန်',
            'hero.slide1.btn2': 'ကျွန်ုပ်တို့ Project',
            'hero.slide2.title': 'NEW STREET CULTURE',
            'hero.slide2.text': 'ပစ္စည်းတိုင်းကို ကျွမ်းကျင်အဖွဲ့က ပို့ဆောင်မီ စနစ်တကျ စစ်ဆေးပေးပါသည်။',
            'hero.slide2.btn': 'Hype Items ကြည့်ရန်',
            'hero.slide3.title': 'EXCLUSIVE DROPS',
            'hero.slide3.text': 'မျှော်လင့်ထားသော local brand drop များနှင့် global holy-grail items များကို လက်လွတ်မခံပါနဲ့။',
            'hero.slide3.btn': 'Drops ရှာရန်',
            'marquee.authentic': '100% AUTHENTIC',
            'marquee.local': 'LOCAL BRANDS',
            'marquee.budget': 'BELOW 200K MMK',
            'marquee.culture': 'STREET CULTURE',
            'marquee.drops': 'EXCLUSIVE DROPS',
            'cat.sneakers': 'Sneakers',
            'cat.outfits': 'Outfits',
            'cat.trending': 'Trending',
            'cat.local': 'Local Brands',
            'cat.accessories': 'Accessories',
            'home.trending.eyebrow': 'Worldwide',
            'home.trending.title': 'Trending',
            'home.trending.more': 'More',
            'home.trending.search': 'Trending sneakers, brand, color ရှာပါ...',
            'home.local.eyebrow': 'Myanmar Made',
            'home.local.title': 'Local Brands',
            'home.budget.eyebrow': 'Budget Friendly',
            'home.budget.title': 'Below 200,000 MMK',
            'home.reviews.eyebrow': 'Watch & Learn',
            'home.reviews.title': 'Reviews & Videos',
            'home.reviews.more': 'More Reviews',
            'home.cta.eyebrow': 'Join The Culture',
            'home.cta.title': 'AUTHENTIC STREETWEAR.<br>LOCAL ENERGY.',
            'home.cta.text': 'Verified drops၊ local designers နှင့် hype pieces — အားလုံးကို တစ်နေရာတည်းတွင်။',
            'home.cta.shop': 'Shop All',
            'home.cta.about': 'About NaNb',
            'products.allDrops': 'All Drops',
            'products.sneakers': 'Sneakers',
            'products.tees': 'Tees',
            'products.pants': 'Pants',
            'products.jackets': 'Jackets',
            'products.shopByBrand': 'SHOP BY BRAND',
            'products.browseTitle': 'BROWSE ALL DROPS',
            'products.browseSub': '100% Authentic Verified Streetwear & Sneakers',
            'products.sortBy': 'Sort By:',
            'products.sort.popular': 'Most Popular',
            'products.sort.priceLow': 'Price: Low to High',
            'products.sort.priceHigh': 'Price: High to Low',
            'products.sort.newest': 'Newest Drops',
            'products.sort.rating': 'Highest Rating',
            'products.search': 'Sneakers, brand, color ရှာပါ...',
            'products.readyShip': 'Ready to ship',
            'products.subcategory': 'Subcategory',
            'products.size': 'Size',
            'products.colorways': 'Colorways',
            'products.price': 'Price',
            'products.under200k': 'Under 200K',
            'products.price200500': '200K - 500K',
            'products.price5001m': '500K - 1M',
            'products.priceAbove1m': 'Above 1M',
            'products.brand': 'Brand',
            'products.rating': 'Rating',
            'products.reset': 'Reset',
            'products.dropsFound': 'drops found',
            'products.chooseSize': 'Size ရွေးပါ',
            'products.pickSize': 'Cart ထည့်မီ available size တစ်ခုရွေးပါ။',
            'products.addCart': 'Cart ထည့်ရန်',
            'products.emptyFilter': 'Filter နှင့် ကိုက်ညီသော product မရှိပါ။',
            'cart.title': 'Your Acquisition Cart',
            'cart.loginView': 'Cart ကြည့်ရှုရန် login ဝင်ပါ။',
            'cart.empty': 'သင့် cart ဗလာဖြစ်နေပါသည်။',
            'cart.browse': 'Browse Drops',
            'cart.loginNow': 'Login now',
            'cart.loginRequired': 'Checkout လုပ်ရန် login ဝင်ပါ။',
            'cart.checkout': 'Checkout',
            'wishlist.title': 'Your Watchlist Portfolio',
            'wishlist.loginView': 'Wishlist ကြည့်ရှုရန် login ဝင်ပါ။',
            'wishlist.empty': 'သင့် wishlist ဗလာဖြစ်နေပါသည်။',
            'wishlist.notify': 'Notify Drop',
            'wishlist.instaCop': 'Insta-Cop',
            'order.title': 'AUTHENTICATION & ORDER RADAR',
            'order.subtitle': 'Order status စစ်ဆေးရန် သို့မဟုတ် ဝယ်ယူမှုမှတ်တမ်း ကြည့်ရန် verification serial ထည့်ပါ။',
            'order.archived': 'orders archived',
            'order.orderArchived': 'order archived',
            'order.label': 'Order ID / Certificate Serial',
            'order.placeholder': 'ဥပမာ NANB-1024',
            'order.verify': 'Verify & Track',
            'order.activeLabel': 'Active Tracking Order',
            'order.statusLabel': 'Verification Status',
            'order.currentStatus': 'Current Order Status',
            'order.portfolio': 'PAST PURCHASE PORTFOLIO',
            'order.archive': 'Archive',
            'order.loginView': 'Order history ကြည့်ရန် login ဝင်ပါ။',
            'order.empty': 'Order မရှိသေးပါ။ Checkout ပြီးပါက ဤနေရာတွင် ပေါ်လာပါမည်။',
            'order.noActive': 'Active order မရှိပါ',
            'order.loginTrack': 'Order tracking ကြည့်ရန် login ဝင်ပါ။',
            'order.searching': 'Order ရှာနေသည်...',
            'order.notFound': 'Account တွင် order မတွေ့ပါ။ Checkout ID ကို ပြန်စစ်ပါ။',
            'order.loginTrackShort': 'Order tracking အတွက် login ဝင်ပါ။',
            'contact.title': 'LOCATE THE BRAIN',
            'contact.intro': 'Size၊ shipping သို့မဟုတ် consignment အကြောင်း မေးခွန်းရှိပါသလား။ Mandalay HQ သို့ ဆက်သွယ်ပါ။',
            'contact.hq': 'HQ Base Location',
            'contact.emailSupport': 'Email Support',
            'contact.sendMessage': 'SEND A MESSAGE',
            'contact.yourName': 'Your Name',
            'contact.namePlaceholder': 'Full Name',
            'contact.email': 'Email Address',
            'contact.subject': 'Subject',
            'contact.subjectPlaceholder': 'Hype Inquiries / Consignment Deal',
            'contact.message': 'Message Body',
            'contact.messagePlaceholder': 'Message အသေးစိတ်ရေးပါ...',
            'contact.submit': 'Fire Message',
            'contact.sent': 'Message Sent',
            'contact.fixFields': 'ပို့မီ highlighted fields များကို ပြင်ဆင်ပါ။',
            'contact.success': 'ကျေးဇူးတင်ပါသည်! Message လက်ခံရရှိပြီး ၂၄ နာရီအတွင်း reply ပေးပါမည်။',
            'contact.emailInvalid': 'မှန်ကန်သော email ထည့်ပါ။',
            'auth.welcomeBack': 'Welcome Back',
            'auth.login': 'Login',
            'auth.join': 'Join NaNb',
            'auth.signup': 'Sign Up',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.fullName': 'Full Name',
            'auth.confirmPassword': 'Confirm Password',
            'auth.remember': 'Remember me',
            'auth.fullPage': 'Full page',
            'auth.createAccount': 'Create Account',
            'auth.noAccount': 'Account မရှိသေးဘူးလား?',
            'auth.signUpLink': 'Sign up',
            'auth.haveAccount': 'Account ရှိပြီးသားလား?',
            'auth.loginLink': 'Login',
            'auth.backHome': 'ပင်မစာမျက်နှာသို့',
            'auth.loginSubtitle': 'Order tracking၊ wishlist နှင့် checkout အတွက် sign in လုပ်ပါ။',
            'auth.signupSubtitle': 'Wishlist sync နှင့် secure checkout အတွက် account ဖွင့်ပါ။',
            'auth.createAccountLink': 'Create account',
            'auth.emailPlaceholder': 'you@email.com',
            'auth.passwordPlaceholder': 'Password ထည့်ပါ',
            'auth.namePlaceholder': 'Your name',
            'auth.createPassword': 'Password ဖန်တီးပါ',
            'auth.confirmPlaceholder': 'Password အတည်ပြုပါ',
            'auth.loginFail': 'မှန်ကန်သော email နှင့် password ထည့်ပါ။',
            'auth.signupFail': 'Valid email ဖြင့် field အားလုံးဖြည့်ပါ။',
            'auth.passwordMismatch': 'Password များ မတူညီပါ။',
            'auth.loginSuccess': 'Login အောင်မြင်ပါသည်။',
            'auth.signupSuccess': 'Account ဖန်တီးပြီးပါပြီ။',
            'auth.invalidCredentials': 'Email သို့မဟုတ် password မမှန်ပါ။',
            'auth.serviceUnavailable': 'Authentication service မရရှိနိုင်ပါ။',
            'human.label': 'Human verification',
            'human.hint': 'လူသားဖြစ်ကြောင်း အတည်ပြုရန် math problem ကိုဖြေပါ။',
            'human.fail': 'ဖြေကြိုးမှား။ ထပ်မံကြိုးစားပါ။',
            'newsletter.thanks': 'ကျေးဇူးတင်ပါသည်! Drop အသစ်များအတွက် အကြောင်းကြားပါမည်။',
            'newsletter.exists': 'Email ဤ subscriber list တွင် ရှိပြီးသားဖြစ်သည်။',
            'common.login': 'Login',
            'common.browseDrops': 'Browse Drops',
            'common.price': 'Price',
            'common.sizes': 'sizes',
            'about.hero.badge': 'Mandalay, Myanmar',
            'about.hero.title': 'WE DROP THE HYPE',
            'about.hero.sub': 'No Aim No Brain (NANB) - Mandalay မှ လည်ပတ်သော global streetwear culture အတွက် premium authentic resell hub.',
            'about.core.title': 'MANDALAY CORE',
            'about.core.p1': '၂၀၂၆ တွင် တည်ထောင်ခဲ့သော NaNb — No Aim No Brain — သည် global sneaker culture နှင့် hype drops များကို local collectors များအနီးသို့ ယူဆောင်လာရန် streetwear enthusiast များ၏ collective ဖြစ်သည်။',
            'about.core.p2': 'Mandalay အခြေစိုက်ဖြင့် premium international brands နှင့် Myanmar hypebeasts community ကြားက ကွင်းဆက်ကို ဖြည့်ဆည်းပေးပါသည်။',
            'about.val.verified': '100% Verified',
            'about.val.verifiedDesc': 'ပစ္စည်းတိုင်းကို expert curators က physical legit-check လုပ်ပြီးမှ ပို့ဆောင်ပေးပါသည်။',
            'about.val.local': 'Local & Global',
            'about.val.localDesc': 'Hyper-limited sneakers၊ underground streetwear brands နှင့် exclusive archival pieces များကို worldwide မှ ရှာဖွေပါသည်။',
            'about.val.fair': 'Fair Pricing',
            'about.val.fairDesc': 'Transparent MMK pricing၊ 200K အောက် budget drops နှင့် AI bargaining assistant ပါဝင်ပါသည်။',
            'about.val.track': 'Tracked Delivery',
            'about.val.trackDesc': 'Authentication မှ dispatch အထိ vault ID နှင့် live status updates ပေးပါသည်။',
            'about.mission.label': 'Our Mission',
            'about.mission.title': 'Make authentic hype accessible.',
            'about.mission.text': 'Online မှာ sneakers နှင့် streetwear ဝယ်ရာက ကြောက်ရွံ့မှုကို ဖယ်ရှားရန် NaNb ရှိပါသည်။ Listing တိုင်း inspected၊ price တိုင်း clear ဖြစ်ပါသည်။',
            'about.vision.label': 'Our Vision',
            'about.vision.title': 'Myanmar\'s streetwear vault.',
            'about.vision.text': 'Verified drops အတွက် နိုင်ငံတဝှ်း go-to marketplace ဖြစ်လာစေရန် local designers နှင့် global culture ကို ချိတ်ဆက်ပါသည်။',
            'about.stat.verified': 'Items Verified',
            'about.stat.brands': 'Brands Curated',
            'about.stat.satisfaction': 'Buyer Satisfaction',
            'about.stat.turnaround': 'Avg. Auth Turnaround',
            'about.process.label': 'How We Work',
            'about.process.title': 'THE NANB AUTHENTICATION FLOW',
            'about.process.sub': 'Grail sneaker ဖြစ်ဖြစ် local brand tee ဖြစ်ဖြစ် inspection pipeline တူညီပါသည်။',
            'about.roadmap.label': 'Since Day One',
            'about.roadmap.title': 'OUR ROADMAP',
            'about.roadmap.sub': 'Mandalay resale circle မှ streetwear marketplace အဖြစ် NaNb တိုးတက်လာပုံ။',
            'about.team.title': 'THE NANB TEAM',
            'about.team.sub': 'Verified drops၊ smooth orders နှင့် customer care နောက်ကွယ်ရှိ team.',
            'about.cta.label': 'Join The Drop',
            'about.cta.title': 'READY TO COP VERIFIED HEAT?',
            'about.cta.text': 'Trending sneakers၊ local brand picks နှင့် budget-friendly drops — authenticated, tracked, NaNb.',
            'about.cta.shop': 'Shop Collection',
            'about.cta.contact': 'Contact Us'
        }
    };

    function getLang() {
        return currentLang;
    }

    function t(key, fallback) {
        var bucket = STRINGS[currentLang] || STRINGS.en;
        if (bucket[key] != null) return bucket[key];
        if (STRINGS.en[key] != null) return STRINGS.en[key];
        return fallback != null ? fallback : key;
    }

    function setLang(lang) {
        var next = lang === 'en' ? 'en' : 'mm';
        currentLang = next;
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch (error) {}
        document.documentElement.lang = next === 'mm' ? 'my' : 'en';
        apply(document);
        updateSwitchUI();
        window.dispatchEvent(new CustomEvent('nanb:lang-changed', { detail: { lang: next } }));
    }

    function apply(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (!key) return;
            var value = t(key);
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });
        scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        });
        scope.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
        });
        translateSharedChrome();
        translateSelectOptions();
    }

    function translateSelectOptions() {
        var sort = document.getElementById('sortSelect');
        if (sort) {
            Array.from(sort.options).forEach(function (opt) {
                var key = opt.getAttribute('data-i18n');
                if (key) opt.textContent = t(key);
            });
        }
    }

    function translateSharedChrome() {
        setTextIfExists('.navbar-nav a.nav-link-hype[href="index.html"]:not([href*="?"])', 'nav.home');
        setTextIfExists('.navbar-nav a.nav-link-hype[href="products.html"]', 'nav.shop');
        setTextIfExists('.navbar-nav a.nav-link-hype[href="contactus.html"]', 'nav.contact');
        setTextIfExists('.navbar-nav a.nav-link-hype[href="aboutus.html"]', 'nav.about');

        document.querySelectorAll('.navbar-nav a.nav-link-hype[href="order.html"]').forEach(function (el) {
            var icon = el.querySelector('i');
            if (icon) {
                el.innerHTML = icon.outerHTML + ' ' + t('nav.orders');
            } else {
                el.textContent = t('nav.orders');
            }
        });

        document.querySelectorAll('.nav-auth-buttons .btn-nav-login').forEach(function (el) {
            if (!el.querySelector('.fa-user')) el.textContent = t('nav.login');
        });
        document.querySelectorAll('.nav-auth-buttons .btn-nav-signup').forEach(function (el) {
            el.textContent = t('nav.signup');
        });

        setTextIfExists('.footer-hype .col-lg-4 > p.text-white-50.mb-4', 'footer.tagline');
        setTextIfExists('.footer-heading', null, true);
        setTextIfExists('#newsletterForm input[type="email"]', null, false, true);
        setTextIfExists('.newsletter-btn', 'footer.notifyMe');
        setTextIfExists('.footer-hype .col-lg-4 small.text-white-50', 'footer.notifyHint');
    }

    function setTextIfExists(selector, key, isFooterHeading, isPlaceholder) {
        document.querySelectorAll(selector).forEach(function (el) {
            if (isFooterHeading) {
                var map = {
                    'Stay Updated': 'footer.stayUpdated',
                    'Shop': 'footer.shop',
                    'Customer Service': 'footer.customerService',
                    'Contact': 'footer.contact'
                };
                var headingKey = map[el.textContent.trim()];
                if (headingKey) el.textContent = t(headingKey);
                return;
            }
            if (isPlaceholder && key === null) {
                el.placeholder = t('footer.emailPlaceholder');
                return;
            }
            if (key) el.textContent = t(key);
        });

        if (key === 'footer.tagline') return;

        var footerLinks = {
            'All Products': 'footer.allProducts',
            'Sneakers': 'footer.sneakers',
            'Outfits': 'footer.outfits',
            'Accessories': 'footer.accessories',
            'Wishlist': 'footer.wishlist',
            'Contact Us': 'footer.contact',
            'Order Tracking': 'footer.orderTracking',
            'FAQ': 'footer.faq',
            'Returns & Refunds': 'footer.returns',
            'Shipping Policy': 'footer.shipping',
            'Terms & Conditions': 'footer.terms',
            'Privacy Policy': 'footer.privacy',
            'Cookie Policy': 'footer.cookies'
        };

        document.querySelectorAll('.footer-links a').forEach(function (link) {
            var text = link.textContent.trim();
            if (footerLinks[text]) link.textContent = t(footerLinks[text]);
        });

        document.querySelectorAll('.footer-hype small.text-white-50').forEach(function (el) {
            if (el.textContent.indexOf('© 2026') !== -1) el.textContent = t('footer.rights');
        });
    }

    function injectLangSwitch() {
        document.querySelectorAll('.navbar-nav').forEach(function (nav) {
            if (nav.querySelector('.nanb-lang-switch')) return;
            var authItem = nav.querySelector('.nav-auth-buttons');
            var li = document.createElement('li');
            li.className = 'nav-item d-flex align-items-center';
            li.innerHTML =
                '<div class="nanb-lang-switch" role="group" aria-label="Language switch">' +
                    '<button type="button" class="nanb-lang-btn" data-lang="mm">MM</button>' +
                    '<button type="button" class="nanb-lang-btn" data-lang="en">EN</button>' +
                '</div>';
            if (authItem && authItem.parentElement === nav) {
                nav.insertBefore(li, authItem);
            } else {
                nav.appendChild(li);
            }
        });

        document.querySelectorAll('.nanb-lang-btn').forEach(function (btn) {
            if (btn.dataset.langBound === 'true') return;
            btn.dataset.langBound = 'true';
            btn.addEventListener('click', function () {
                setLang(btn.getAttribute('data-lang'));
            });
        });
        updateSwitchUI();
    }

    function updateSwitchUI() {
        document.querySelectorAll('.nanb-lang-btn').forEach(function (btn) {
            btn.classList.toggle('is-active', btn.getAttribute('data-lang') === currentLang);
        });
    }

    function init() {
        try {
            currentLang = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'mm';
        } catch (error) {
            currentLang = 'mm';
        }
        document.documentElement.lang = currentLang === 'mm' ? 'my' : 'en';
        injectLangSwitch();
        apply(document);
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        t: t,
        getLang: getLang,
        setLang: setLang,
        apply: apply
    };
})();
