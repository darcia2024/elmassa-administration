/**
 * Aplikasi Galeri Paket El Massa - Alpine.js Controller
 * Tour & Travel Umroh, Haji Khusus & Wisata Halal
 */

function elMassaApp() {
  return {
    // Navigation & View States
    activeTab: 'galeri',
    drawerOpen: false,
    drawerCatOpen: false,
    drawerCityOpen: false,
    showSearchBar: false,
    searchQuery: '',
    packageSortBy: 'terdekat',
    selectedCategory: 'Semua',
    selectedCity: 'Semua Kota',
    selectedAirline: 'Semua',
    galleryMonth: 'Semua Bulan',
    maxPriceFilter: 200000000,
    favorites: [],
    showSortDropdown: false,
    showNotifDropdown: false,
    detailModalTab: 'itinerary', // 'itinerary' | 'include-exclude' | 'flyer' | 'hotel'

    // Loading & Pagination
    initialLoading: false,
    globalLoading: false,
    packagePageSize: 12,
    visiblePackageLimit: 12,

    // Data Storage
    settings: {},
    categories: [],
    cities: [],
    airlines: [],
    packages: [],
    schedules: [],
    defaultInclude: [],
    defaultExclude: [],
    toasts: [],
    notifications: [],

    // Wishlist / Favorite
    toggleFavorite(pkg) {
      if (!pkg) return;
      const id = String(pkg.cardId || pkg.id);
      const idx = this.favorites.indexOf(id);
      if (idx > -1) {
        this.favorites.splice(idx, 1);
        this.showToast('Dihapus dari paket tersimpan', 'info');
      } else {
        this.favorites.push(id);
        this.showToast('Disimpan ke paket favorit!', 'success');
      }
    },

    isFavorite(pkg) {
      if (!pkg) return false;
      const id = String(pkg.cardId || pkg.id);
      return this.favorites.includes(id);
    },

    getCategoryCount(cat) {
      if (cat === 'Semua') return this.activePackagesList.length;
      return this.activePackagesList.filter(p => p.category === cat).length;
    },

    getCityCount(city) {
      if (city === 'Semua Kota') return this.activePackagesList.length;
      return this.schedules.filter(s => s.startCity === city).length;
    },

    getAirlineCount(airline) {
      if (airline === 'Semua') return this.activePackagesList.length;
      return this.schedules.filter(s => s.airline === airline).length;
    },

    getMonthCount(monthKey) {
      if (monthKey === 'Semua Bulan') return this.schedules.length;
      return this.schedules.filter(s => String(s.departureDate || '').slice(0, 7) === monthKey).length;
    },

    // Modal & Active Selections
    showDetailModal: false,
    activeDetailPackage: null,
    activeSchedule: null,
    showScheduleSelectionModal: false,
    selectedPackageForScheduleSelect: null,
    selectedPackageSchedules: [],
    showZoomImage: false,
    showRegisterPrompt: false,
    showShareModal: false,
    showLockedPackageModal: false,
    lockedPackage: null,

    // Flash Sale Timer
    showFlashSaleCountdown: true,
    fsHours: '08',
    fsMinutes: '45',
    fsSeconds: '20',

    // Seat Management & Filters
    seatSearch: '',
    seatCategory: 'Semua',
    seatCity: 'Semua Kota',
    seatMonth: 'Semua Bulan',
    seatSort: 'terdekat',
    showSeatFilters: false,
    seatDrafts: {},
    seatUpdateLoading: false,
    manageSeatSearch: '',
    manageSeatCategory: 'Semua',
    manageSeatCity: 'Semua Kota',
    manageSeatMonth: 'Semua Bulan',
    manageSeatSort: 'terdekat',
    showManageSeatFilters: false,

    // Savings Calculator State
    calculator: {
      packageId: 'pkg-01',
      selectedScheduleId: '',
      targetMonths: 12,
      pax: 2,
      customPrice: 34700000,
      customDp: 5000000,
      includePassport: false,
      includeVaccine: false,
      roomUpgrade: 'quad'
    },

    // Admin & Auth
    adminSession: null,
    currentAdminUser: '',
    currentAdminRole: 'Superadmin',
    adminUserInput: '',
    adminPasswordInput: '',
    showPassword: false,
    loginLoading: false,
    loginError: '',
    showPackageFormModal: false,
    showDeleteConfirmModal: false,
    showLogoutConfirmModal: false,
    pkgToDelete: null,
    savePkgLoading: false,

    // Admin Package Form State (With Itinerary & Include/Exclude Support)
    editingPkg: {
      id: null,
      title: '',
      category: 'Umroh Direct Flight',
      tagsStr: '',
      programSummary: '',
      flyerUrl: '',
      thumbnailUrl: '',
      activeStatus: 'Aktif',
      hotelMakkah: '',
      hotelMadinah: '',
      hotelExtra: '',
      customIncludes: [],
      customExcludes: [],
      newIncludeInput: '',
      newExcludeInput: '',
      itinerary: [],
      schedules: []
    },

    // City & Airline CRUD in Admin
    showAddCityModal: false,
    newCityName: '',
    editingCityName: '',
    showAddAirlineModal: false,
    newAirlineName: '',
    editingAirlineName: '',

    // Default Images
    defaultKaaba: 'images/placeholder-package.svg',
    defaultLogo: 'images/logo.png',

    // Initialization
    initApp() {
      this.loadStorageData();
      if (!this.settings.WEBSITE_LOGO_URL) {
        this.settings.WEBSITE_LOGO_URL = 'images/logo.png';
      }
      this.initFlashSaleTimer();
      this.syncNotifications();
      this.syncLiveSeats();

      // Watchers to reset pagination
      const self = this;
      this.$watch('selectedCategory', () => { self.resetPackagePagination(); });
      this.$watch('selectedCity', () => { self.resetPackagePagination(); });
      this.$watch('galleryMonth', () => { self.resetPackagePagination(); });
      this.$watch('searchQuery', () => { self.resetPackagePagination(); });
      this.$watch('packageSortBy', () => { self.resetPackagePagination(); });
    },

    // LocalStorage & Data Layer
    loadStorageData() {
      try {
        const stored = localStorage.getItem('EL_MASSA_APP_DATA_V36');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.settings = parsed.settings || DEFAULT_ELMASSA_DATA.settings;
          if (!this.settings.WEBSITE_LOGO_URL) {
            this.settings.WEBSITE_LOGO_URL = 'images/logo.png';
          }
          this.categories = parsed.categories || DEFAULT_ELMASSA_DATA.categories;
          this.cities = parsed.cities || DEFAULT_ELMASSA_DATA.cities;
          this.airlines = parsed.airlines || DEFAULT_ELMASSA_DATA.airlines;
          this.packages = parsed.packages || DEFAULT_ELMASSA_DATA.packages;
          this.defaultInclude = parsed.defaultInclude || DEFAULT_ELMASSA_DATA.defaultInclude;
          this.defaultExclude = parsed.defaultExclude || DEFAULT_ELMASSA_DATA.defaultExclude;
        } else {
          this.resetToDefaultData(false);
        }
      } catch (err) {
        console.warn('Fallback to default dataset', err);
        this.resetToDefaultData(false);
      }
      this.rebuildScheduleFlatList();
    },

    saveStorageData() {
      const dataToSave = {
        settings: this.settings,
        categories: this.categories,
        cities: this.cities,
        airlines: this.airlines,
        packages: this.packages,
        defaultInclude: this.defaultInclude,
        defaultExclude: this.defaultExclude
      };
      localStorage.setItem('EL_MASSA_APP_DATA_V36', JSON.stringify(dataToSave));
      this.rebuildScheduleFlatList();
    },

    resetToDefaultData(showToastMsg = true) {
      this.settings = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.settings));
      this.settings.WEBSITE_LOGO_URL = 'images/logo.png';
      this.categories = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.categories));
      this.cities = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.cities));
      this.airlines = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.airlines));
      this.packages = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.packages));
      this.defaultInclude = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.defaultInclude));
      this.defaultExclude = JSON.parse(JSON.stringify(DEFAULT_ELMASSA_DATA.defaultExclude));
      this.saveStorageData();
      if (showToastMsg) {
        this.showToast('Data berhasil diperbarui ke 10 paket resmi El Massa.', 'success');
      }
    },

    rebuildScheduleFlatList() {
      const allSch = [];
      (this.packages || []).forEach(pkg => {
        (pkg.schedules || []).forEach(sch => {
          allSch.push({
            ...sch,
            packageId: pkg.id,
            pkgTitle: pkg.title,
            pkgCategory: pkg.category,
            pkgStatus: pkg.activeStatus
          });
        });
      });
      this.schedules = allSch;
    },

    // Sisa seat live dari sistem El Massa (lihat SEAT_SYNC di data.js). Gagal
    // atau lambat? Katalog tetap tampil dengan angka bawaan, tanpa error.
    async syncLiveSeats() {
      const cfg = (typeof SEAT_SYNC !== 'undefined' && SEAT_SYNC) || {};
      const map = { ...(cfg.map || {}) };
      (this.packages || []).forEach(pkg => (pkg.schedules || []).forEach(sch => {
        if (sch.systemPackageId && !map[sch.id]) map[sch.id] = sch.systemPackageId;
      }));
      if (!cfg.url || Object.keys(map).length === 0) return;

      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(cfg.url, { signal: ctrl.signal });
        clearTimeout(timer);
        const json = await res.json();
        if (!json || !json.ok || !Array.isArray(json.data)) return;

        const byId = {};
        json.data.forEach(row => { byId[row.packageId] = row; });

        let updated = 0;
        (this.packages || []).forEach(pkg => {
          if (this.isHajiPackage(pkg)) return; // Haji pakai label teks, bukan angka
          (pkg.schedules || []).forEach(sch => {
            const row = byId[map[sch.id]];
            if (!row) return;
            sch.availableSeats = Math.max(0, Number(row.remaining) || 0);
            sch.liveSeats = true;
            updated++;
          });
        });

        if (updated > 0) {
          this.settings.LAST_SEAT_UPDATE = json.generatedAt || new Date().toISOString();
          this.rebuildScheduleFlatList();
        }
      } catch (err) {
        console.warn('Sinkron seat dari sistem gagal, memakai data bawaan.', err);
      }
    },

    syncNotifications() {
      this.notifications = this.newestPackages.slice(0, 5);
    },

    // Toast Management
    showToast(message, type = 'success') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type });
      const self = this;
      setTimeout(() => {
        self.removeToast(id);
      }, 4000);
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    // Flash Sale Timer Logic
    initFlashSaleTimer() {
      const self = this;
      const update = () => {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const diff = endOfDay - now;
        if (diff > 0) {
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          self.fsHours = String(h).padStart(2, '0');
          self.fsMinutes = String(m).padStart(2, '0');
          self.fsSeconds = String(s).padStart(2, '0');
        }
      };
      update();
      setInterval(update, 1000);
    },

    // Formatter Helpers
    formatRupiah(value) {
      const amount = Number(value);
      if (!Number.isFinite(amount)) return 'IDR 0 JT';
      const juta = amount / 1000000;
      if (Number.isInteger(juta)) return `IDR ${juta} JT`;
      return `IDR ${juta.toFixed(1).replace('.', ',')} JT`;
    },

    formatRupiahFull(value) {
      const num = Number(value) || 0;
      return 'Rp ' + num.toLocaleString('id-ID');
    },

    formatDollar(value) {
      const amount = Number(value);
      if (!Number.isFinite(amount)) return '$0';
      return '$' + Math.round(amount).toLocaleString('id-ID');
    },

    isHajiPackage(pkg) {
      if (!pkg) return false;
      const cat = String(pkg.category || '').toLowerCase();
      return cat.includes('haji');
    },

    isHajiSchedule(sch) {
      if (!sch) return false;
      const pkg = this.packages.find(p => String(p.id) === String(sch.packageId));
      return this.isHajiPackage(pkg);
    },

    formatScheduleMoney(sch, value) {
      if (!sch) return '-';
      return this.isHajiSchedule(sch) ? this.formatDollar(value) : this.formatRupiah(value);
    },

    formatScheduleMoneyFull(sch, value) {
      if (!sch) return '-';
      return this.isHajiSchedule(sch) ? this.formatDollar(value) : this.formatRupiahFull(value);
    },

    formatDateRange(startStr, endStr) {
      if (!startStr) return '';
      const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoPattern.test(startStr) || (endStr && !isoPattern.test(endStr))) {
        return endStr && endStr !== startStr ? `${startStr} – ${endStr}` : startStr;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      const s = new Date(startStr);
      const sDay = s.getDate();
      const sMonth = months[s.getMonth()];
      const sYear = s.getFullYear();

      if (!endStr) return `${sDay} ${sMonth} ${sYear}`;

      const e = new Date(endStr);
      const eDay = e.getDate();
      const eMonth = months[e.getMonth()];
      const eYear = e.getFullYear();

      if (sMonth === eMonth && sYear === eYear) {
        return `${sDay} – ${eDay} ${sMonth} ${sYear}`;
      }
      return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${eYear}`;
    },

    getScheduleDurationText(sch) {
      if (!sch) return '';
      const raw = String(sch.duration || '').trim();
      if (!raw) return '9 Hari';
      return raw.toLowerCase().includes('hari') ? raw : `${raw} Hari`;
    },

    formatScheduleDateWithDuration(sch) {
      if (!sch) return '';
      const dateText = this.formatDateRange(sch.departureDate, sch.returnDate);
      const durText = this.getScheduleDurationText(sch);
      return durText ? `${dateText} (${durText})` : dateText;
    },

    getScheduleCityDateText(pkg) {
      const sch = this.getCardSchedule(pkg);
      if (sch) {
        return `Start ${sch.startCity || 'Jakarta'} • ${this.formatScheduleDateWithDuration(sch)}`;
      }
      return 'Start Jakarta';
    },

    // Badges & Availability (Apple iOS - Dominant Pink + Chocolate Accents)
    getSeatBadgeText(pkg) {
      if (this.isHajiPackage(pkg)) {
        const sch = this.getCardSchedule(pkg);
        return (sch && sch.availableSeats) ? String(sch.availableSeats).toUpperCase() : 'TERSEDIA';
      }
      const sch = this.getCardSchedule(pkg);
      const seats = sch ? Number(sch.availableSeats || 0) : 0;
      if (seats <= 0) return 'FULL';
      return `${seats} Seat Lagi`;
    },

    getSeatBadgeClass(pkg) {
      if (this.isHajiPackage(pkg)) {
        return 'bg-[#ffe4ec] text-[#54280e] border border-[#ffb8ca] font-medium';
      }
      const sch = this.getCardSchedule(pkg);
      const seats = sch ? Number(sch.availableSeats || 0) : 0;
      if (seats <= 0) return 'bg-[#54280e] text-[#ffe4ec] border border-[#6d3514] font-normal';
      if (seats <= 6) return 'bg-[#ffe4ec] text-[#e84370] border border-[#ff2d55]/40 font-medium animate-pulse-subtle';
      if (seats <= 15) return 'bg-[#fff0f5] text-[#6d3514] border border-[#ffd6e2] font-normal';
      return 'bg-[#fff0f5] text-[#54280e] border border-[#ffd6e2] font-normal';
    },

    getScheduleAvailabilityClass(sch) {
      if (!sch) return 'bg-gray-100 text-gray-500 font-normal';
      if (this.isHajiSchedule(sch)) {
        return 'bg-[#ffe4ec] text-[#54280e] border border-[#ffb8ca] font-medium';
      }
      const seats = Number(sch.availableSeats || 0);
      if (seats <= 0) return 'bg-[#54280e] text-[#ffe4ec] border border-[#6d3514] font-normal';
      if (seats <= 6) return 'bg-[#ffe4ec] text-[#e84370] border border-[#ff2d55]/40 font-medium';
      if (seats <= 15) return 'bg-[#fff0f5] text-[#6d3514] border border-[#ffd6e2] font-normal';
      return 'bg-[#fff0f5] text-[#54280e] border border-[#ffd6e2] font-normal';
    },

    getScheduleAvailabilityText(sch) {
      if (!sch) return '-';
      if (this.isHajiSchedule(sch)) {
        return String(sch.availableSeats || 'TERSEDIA').toUpperCase();
      }
      const seats = Number(sch.availableSeats || 0);
      if (seats <= 0) return 'FULL';
      return `${seats} Seat`;
    },

    getSeatCount(pkg) {
      const sch = this.getCardSchedule(pkg);
      if (!sch) return 0;
      if (this.isHajiSchedule(sch)) return 'VIP';
      return Number(sch.availableSeats || 0);
    },

    getSeatStatusInfo(pkg) {
      const sch = this.getCardSchedule(pkg);
      if (!sch) return { label: 'Tersedia', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500', percent: 60 };
      if (this.isHajiSchedule(sch)) {
        return { label: 'Tersedia (Kuota Haji)', badgeClass: 'bg-[#fff0f4] text-[#e84370] border-pink-200', dotClass: 'bg-[#e84370]', percent: 80 };
      }
      const seats = Number(sch.availableSeats || 0);
      if (seats <= 0) {
        return { label: 'Seat Penuh (Sold Out)', badgeClass: 'bg-gray-100 text-gray-700 border-gray-300', dotClass: 'bg-gray-400', percent: 0 };
      }
      if (seats <= 8) {
        return { label: 'Seat Menipis (Hampir Penuh)', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse-subtle', dotClass: 'bg-amber-500', percent: 25 };
      }
      if (seats <= 18) {
        return { label: 'Seat Terbatas', badgeClass: 'bg-pink-50 text-[#e84370] border-pink-200', dotClass: 'bg-[#e84370]', percent: 50 };
      }
      return { label: 'Tersedia (Siap Booking)', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500', percent: 75 };
    },

    // Package Card Expansion & Schedule Mapping
    getSchedulesForPkg(pkgId) {
      return (this.schedules || []).filter(s => String(s.packageId) === String(pkgId));
    },

    getJakartaSchedule(pkg) {
      if (!pkg) return null;
      const schs = this.getSchedulesForPkg(pkg.id);
      return schs.find(s => String(s.startCity || '').toLowerCase().includes('jakarta')) || null;
    },

    getPangkalPinangSchedule(pkg) {
      if (!pkg) return null;
      const schs = this.getSchedulesForPkg(pkg.id);
      return schs.find(s => String(s.startCity || '').toLowerCase().includes('pangkal')) || null;
    },

    getJakartaPrice(pkg) {
      const sch = this.getJakartaSchedule(pkg);
      if (!sch) return '-';
      return this.formatScheduleMoney(sch, sch.price);
    },

    getPangkalPinangPrice(pkg) {
      const sch = this.getPangkalPinangSchedule(pkg);
      if (!sch) return '-';
      return this.formatScheduleMoney(sch, sch.price);
    },

    getCardSchedule(pkg) {
      if (pkg && pkg.selectedSchedule) return pkg.selectedSchedule;
      const list = pkg ? this.getSchedulesForPkg(pkg.id) : [];
      return list.length > 0 ? list[0] : null;
    },

    makeScheduleCard(pkg, sch, index) {
      const card = Object.assign({}, pkg);
      card.selectedSchedule = sch || null;
      card.cardId = `${pkg.id}_${sch && sch.id ? sch.id : 'SCH_' + index}`;
      return card;
    },

    expandPackagesBySchedule(packageList) {
      const self = this;
      const cards = [];
      (packageList || []).forEach(pkg => {
        const schs = self.getSchedulesForPkg(pkg.id);
        if (schs.length === 0) {
          cards.push(self.makeScheduleCard(pkg, null, 0));
        } else {
          schs.forEach((sch, idx) => {
            cards.push(self.makeScheduleCard(pkg, sch, idx));
          });
        }
      });
      return cards;
    },

    cacheBust(url) {
      if (!url || url.startsWith('data:') || url.startsWith('http')) return url;
      // Local posters only exist as .webp now. Package data from the Google
      // Sheet may still say .png/.jpg, so point those at the .webp file.
      url = url.replace(/^(images\/poster-[\w-]+)\.(png|jpe?g)(?=$|\?)/i, '$1.webp');
      return url.includes('?') ? url : `${url}?v=202611v3`;
    },

    getPackageThumbnail(pkg) {
      if (!pkg) return this.defaultKaaba;
      let raw = '';
      if (pkg.id === 'pkg-02') {
        if (this.selectedCity && this.selectedCity.toLowerCase().includes('jakarta')) {
          raw = pkg.flyerUrlJakarta || 'images/poster-november-hanan-attaki-jakarta.webp';
        } else {
          raw = pkg.flyerUrlPangkalPinang || pkg.flyerUrl || pkg.thumbnailUrl || 'images/poster-november-hanan-attaki.webp';
        }
      } else if (pkg.thumbnailUrl) {
        raw = pkg.thumbnailUrl;
      } else if (pkg.flyerUrl) {
        raw = pkg.flyerUrl;
      } else {
        return this.defaultKaaba;
      }
      return this.cacheBust(raw);
    },

    getActiveDetailFlyer() {
      const p = this.activeDetailPackage;
      if (!p) return this.defaultKaaba;
      let raw = '';
      if (p.id === 'pkg-02') {
        if (this.activeSchedule && String(this.activeSchedule.startCity || '').toLowerCase().includes('jakarta')) {
          raw = p.flyerUrlJakarta || 'images/poster-november-hanan-attaki-jakarta.webp';
        } else {
          raw = p.flyerUrlPangkalPinang || p.flyerUrl || 'images/poster-november-hanan-attaki.webp';
        }
      } else {
        raw = p.flyerUrl || p.thumbnailUrl || this.defaultKaaba;
      }
      return this.cacheBust(raw);
    },

    getScheduleFlyer(sch, pkg) {
      const p = pkg || this.selectedPackageForScheduleSelect || this.activeDetailPackage;
      if (!p) return this.defaultKaaba;
      let raw = '';
      if (p.id === 'pkg-02') {
        if (sch && String(sch.startCity || '').toLowerCase().includes('jakarta')) {
          raw = p.flyerUrlJakarta || 'images/poster-november-hanan-attaki-jakarta.webp';
        } else {
          raw = p.flyerUrlPangkalPinang || p.flyerUrl || 'images/poster-november-hanan-attaki.webp';
        }
      } else {
        raw = p.flyerUrl || p.thumbnailUrl || this.defaultKaaba;
      }
      return this.cacheBust(raw);
    },

    // Computed / Getter Lists
    get activePackagesList() {
      return (this.packages || []).filter(p => (p.activeStatus || 'Aktif') === 'Aktif');
    },

    get availableCategories() {
      const activeCats = ['Semua'];
      const activePkgs = this.activePackagesList;
      this.categories.forEach(cat => {
        if (cat === 'Semua') return;
        if (activePkgs.some(p => p.category === cat)) {
          activeCats.push(cat);
        }
      });
      return activeCats;
    },

    get availableCities() {
      const list = [];
      const activePkgIds = this.activePackagesList.map(p => String(p.id));
      const activeSchs = this.schedules.filter(s => activePkgIds.includes(String(s.packageId)));
      this.cities.forEach(city => {
        if (activeSchs.some(s => s.startCity === city)) {
          list.push(city);
        }
      });
      return list;
    },

    get availableScheduleMonths() {
      const map = {};
      this.schedules.forEach(sch => {
        const key = String(sch.departureDate || '').slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(key)) {
          map[key] = true;
        }
      });
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return [{ value: 'Semua Bulan', label: 'Semua Bulan' }].concat(
        Object.keys(map).sort().map(key => {
          const parts = key.split('-');
          return {
            value: key,
            label: `${months[Number(parts[1]) - 1]} ${parts[0]}`
          };
        })
      );
    },

    get filteredPackages() {
      const self = this;
      const activePkgs = self.activePackagesList;

      const filtered = activePkgs.filter(pkg => {
        const schs = self.getSchedulesForPkg(pkg.id);

        if (self.selectedCategory !== 'Semua' && pkg.category !== self.selectedCategory) {
          return false;
        }
        if (self.selectedCity !== 'Semua Kota') {
          const matchCity = schs.some(s => s.startCity && s.startCity.toLowerCase().includes(self.selectedCity.toLowerCase()));
          if (!matchCity) return false;
        }
        if (self.selectedAirline !== 'Semua') {
          const matchAirline = schs.some(s => s.airline === self.selectedAirline);
          if (!matchAirline) return false;
        }
        if (self.galleryMonth !== 'Semua Bulan') {
          const matchMonth = schs.some(s => String(s.departureDate || '').slice(0, 7) === self.galleryMonth);
          if (!matchMonth) return false;
        }
        if (schs.length > 0) {
          const minPrice = Math.min(...schs.map(s => Number(s.price || 0)));
          if (minPrice > self.maxPriceFilter) return false;
        }
        if (self.searchQuery.trim()) {
          const q = self.searchQuery.toLowerCase();
          const matchTitle = String(pkg.title || '').toLowerCase().includes(q);
          const matchCat = String(pkg.category || '').toLowerCase().includes(q);
          const matchTags = (pkg.tags || []).some(t => String(t || '').toLowerCase().includes(q));
          const matchSummary = String(pkg.programSummary || '').toLowerCase().includes(q);
          const matchSch = schs.some(s =>
            String(s.startCity || '').toLowerCase().includes(q) ||
            String(s.airline || '').toLowerCase().includes(q) ||
            String(s.departureDate || '').toLowerCase().includes(q)
          );
          if (!matchTitle && !matchCat && !matchTags && !matchSummary && !matchSch) return false;
        }
        return true;
      });

      return filtered.sort((a, b) => {
        const schA = (self.getJakartaSchedule(a) || self.getSchedulesForPkg(a.id)[0]) || {};
        const schB = (self.getJakartaSchedule(b) || self.getSchedulesForPkg(b.id)[0]) || {};
        const dateA = schA.departureDate || '9999-12-31';
        const dateB = schB.departureDate || '9999-12-31';
        const priceA = Number(schA.price || 0);
        const priceB = Number(schB.price || 0);
        const dpA = Number(schA.dp || 0);
        const dpB = Number(schB.dp || 0);

        if (self.packageSortBy === 'terdekat') return dateA.localeCompare(dateB);
        if (self.packageSortBy === 'terlama') return dateB.localeCompare(dateA);
        if (self.packageSortBy === 'az') return String(a.title || '').localeCompare(String(b.title || ''));
        if (self.packageSortBy === 'za') return String(b.title || '').localeCompare(String(a.title || ''));
        if (self.packageSortBy === 'harga_rendah') return priceA - priceB;
        if (self.packageSortBy === 'harga_tinggi') return priceB - priceA;
        if (self.packageSortBy === 'dp_rendah') return dpA - dpB;
        if (self.packageSortBy === 'dp_tinggi') return dpB - dpA;
        return dateA.localeCompare(dateB);
      });
    },

    get visiblePackages() {
      return this.filteredPackages.slice(0, this.visiblePackageLimit);
    },

    resetPackagePagination() {
      this.visiblePackageLimit = this.packagePageSize;
    },

    loadMorePackages() {
      if (this.visiblePackageLimit >= this.filteredPackages.length) return;
      this.visiblePackageLimit = Math.min(this.visiblePackageLimit + this.packagePageSize, this.filteredPackages.length);
    },

    get flashSalePackages() {
      const flash = this.activePackagesList.filter(p => (p.tags || []).some(t => t.toLowerCase().includes('flash sale') || t.toLowerCase().includes('promo')));
      return this.expandPackagesBySchedule(flash).slice(0, 6);
    },

    get newestPackages() {
      const sorted = this.activePackagesList.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return this.expandPackagesBySchedule(sorted).slice(0, 5);
    },

    // Grouped Seat Updates
    get seatScheduleGroups() {
      const self = this;
      const q = self.seatSearch.toLowerCase().trim();
      const filtered = self.schedules.filter(sch => {
        const pkg = self.packages.find(p => String(p.id) === String(sch.packageId));
        if (!pkg || pkg.activeStatus !== 'Aktif') return false;
        if (self.seatCategory !== 'Semua' && pkg.category !== self.seatCategory) return false;
        if (self.seatCity !== 'Semua Kota' && sch.startCity !== self.seatCity) return false;
        if (self.seatMonth !== 'Semua Bulan' && String(sch.departureDate || '').slice(0, 7) !== self.seatMonth) return false;
        if (q) {
          const haystack = `${pkg.title} ${pkg.category} ${sch.startCity} ${sch.airline}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

      // Group by Category and Start City
      const groups = {};
      filtered.forEach(sch => {
        const pkg = self.packages.find(p => String(p.id) === String(sch.packageId));
        const groupTitle = `${pkg.category} • Start ${sch.startCity || 'Jakarta'}`;
        if (!groups[groupTitle]) {
          groups[groupTitle] = {
            title: groupTitle,
            category: pkg.category,
            city: sch.startCity,
            items: []
          };
        }
        groups[groupTitle].items.push(sch);
      });

      // Sort items within group
      return Object.keys(groups).map(k => {
        const g = groups[k];
        g.items.sort((a, b) => {
          if (self.seatSort === 'terlama') return String(b.departureDate || '').localeCompare(String(a.departureDate || ''));
          return String(a.departureDate || '').localeCompare(String(b.departureDate || ''));
        });
        return g;
      });
    },

    getPkgForSchedule(sch) {
      if (!sch) return null;
      return this.packages.find(p => String(p.id) === String(sch.packageId)) || null;
    },

    get filteredSeatPackages() {
      const self = this;
      const q = self.seatSearch.toLowerCase().trim();
      const list = self.packages.filter(pkg => {
        if (pkg.activeStatus !== 'Aktif') return false;
        if (self.seatCategory !== 'Semua' && pkg.category !== self.seatCategory) return false;
        if (self.seatCity !== 'Semua Kota') {
          const schs = self.getSchedulesForPkg(pkg.id);
          const hasCity = schs.some(s => String(s.startCity || '').toLowerCase().includes(self.seatCity.toLowerCase()));
          if (!hasCity) return false;
        }
        if (self.seatMonth !== 'Semua Bulan') {
          const schs = self.getSchedulesForPkg(pkg.id);
          const hasMonth = schs.some(s => String(s.departureDate || '').slice(0, 7) === self.seatMonth);
          if (!hasMonth) return false;
        }
        if (q) {
          const schs = self.getSchedulesForPkg(pkg.id);
          const schInfo = schs.map(s => `${s.startCity} ${s.airline} ${s.departureDate}`).join(' ');
          const haystack = `${pkg.title} ${pkg.category} ${pkg.hotelMakkah} ${schInfo}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

      return list.sort((a, b) => {
        const schA = self.getJakartaSchedule(a) || self.getCardSchedule(a);
        const schB = self.getJakartaSchedule(b) || self.getCardSchedule(b);
        if (self.seatSort === 'terlama') {
          return String(schB?.departureDate || '').localeCompare(String(schA?.departureDate || ''));
        }
        if (self.seatSort === 'seat_sedikit') {
          return (Number(schA?.availableSeats || 0)) - (Number(schB?.availableSeats || 0));
        }
        if (self.seatSort === 'seat_banyak') {
          return (Number(schB?.availableSeats || 0)) - (Number(schA?.availableSeats || 0));
        }
        if (self.seatSort === 'harga_rendah') {
          return (Number(schA?.price || 0)) - (Number(schB?.price || 0));
        }
        return String(schA?.departureDate || '').localeCompare(String(schB?.departureDate || ''));
      });
    },

    get filteredSeatSchedules() {
      const self = this;
      const q = self.seatSearch.toLowerCase().trim();
      const list = self.schedules.filter(sch => {
        const pkg = self.packages.find(p => String(p.id) === String(sch.packageId));
        if (!pkg || pkg.activeStatus !== 'Aktif') return false;
        if (self.seatCategory !== 'Semua' && pkg.category !== self.seatCategory) return false;
        if (self.seatCity !== 'Semua Kota' && !String(sch.startCity || '').toLowerCase().includes(self.seatCity.toLowerCase())) return false;
        if (self.seatMonth !== 'Semua Bulan' && String(sch.departureDate || '').slice(0, 7) !== self.seatMonth) return false;
        if (q) {
          const haystack = `${pkg.title} ${pkg.category} ${sch.startCity} ${sch.airline}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

      return list.sort((a, b) => {
        if (self.seatSort === 'terlama') return String(b.departureDate || '').localeCompare(String(a.departureDate || ''));
        if (self.seatSort === 'seat_sedikit') return Number(a.availableSeats || 0) - Number(b.availableSeats || 0);
        if (self.seatSort === 'seat_banyak') return Number(b.availableSeats || 0) - Number(a.availableSeats || 0);
        if (self.seatSort === 'harga_rendah') return Number(a.price || 0) - Number(b.price || 0);
        return String(a.departureDate || '').localeCompare(String(b.departureDate || ''));
      });
    },

    get totalAvailableSeatsCount() {
      return this.schedules.reduce((acc, s) => acc + (Number(s.availableSeats) || 0), 0);
    },

    hasOfficialFlyer(pkg) {
      if (!pkg) return false;
      const flyer = String(pkg.flyerUrl || pkg.thumbnailUrl || '');
      return Boolean(flyer && !flyer.includes('placeholder-package') && flyer.trim().length > 0);
    },

    isPackageLocked(pkg) {
      return !this.hasOfficialFlyer(pkg);
    },

    // Modal Interaction
    handleCardClick(pkg) {
      if (!pkg || this.isPackageLocked(pkg)) return;
      const schs = this.getSchedulesForPkg(pkg.id);
      if (pkg.selectedSchedule) {
        this.openPackageDetail(pkg, pkg.selectedSchedule);
      } else if (schs.length > 1) {
        this.selectedPackageForScheduleSelect = pkg;
        this.selectedPackageSchedules = schs;
        this.showScheduleSelectionModal = true;
      } else if (schs.length === 1) {
        this.openPackageDetail(pkg, schs[0]);
      } else {
        this.openPackageDetail(pkg, null);
      }
    },

    getWhatsAppWaitingListUrl(pkg) {
      const p = pkg || this.lockedPackage;
      const phone = this.settings.WHATSAPP_NUMBER || '6281171715125';
      let text = `*Assalamu'alaikum Admin El Massa Tour & Travel*\n\n`;
      text += `Saya tertarik dan ingin masuk ke *Waiting List / Pra-Reservasi* untuk paket ibadah yang segera rilis berikut:\n\n`;
      text += `🕌 *Paket:* ${p ? p.title : '-'}\n`;
      text += `🏷️ *Kategori:* ${p ? p.category : '-'}\n`;
      text += `\nMohon kabari saya segera begitu flyer resmi dan jadwal fix sudah dirilis. Terima kasih.`;

      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    },

    selectScheduleAndOpenDetail(sch) {
      this.showScheduleSelectionModal = false;
      const pkg = this.packages.find(p => String(p.id) === String(sch.packageId));
      if (pkg) this.openPackageDetail(pkg, sch);
    },

    openPackageDetail(pkg, sch) {
      this.activeDetailPackage = pkg;
      this.activeSchedule = sch || (this.getSchedulesForPkg(pkg.id)[0] || null);
      this.detailModalTab = 'itinerary'; // Default ke itinerary harian
      this.showDetailModal = true;
    },

    getDetailPackageIncludes() {
      if (!this.activeDetailPackage) return this.defaultInclude;
      if (Array.isArray(this.activeDetailPackage.customIncludes) && this.activeDetailPackage.customIncludes.length > 0) {
        return this.activeDetailPackage.customIncludes;
      }
      return this.defaultInclude;
    },

    getDetailPackageExcludes() {
      if (!this.activeDetailPackage) return this.defaultExclude;
      if (Array.isArray(this.activeDetailPackage.customExcludes) && this.activeDetailPackage.customExcludes.length > 0) {
        return this.activeDetailPackage.customExcludes;
      }
      return this.defaultExclude;
    },

    // WhatsApp Action Builders
    getWhatsAppBookingUrl(pkg, sch) {
      const p = pkg || this.activeDetailPackage;
      const s = sch || this.activeSchedule;
      const phone = this.settings.WHATSAPP_NUMBER || '6281171715125';

      let text = `*Assalamu'alaikum Admin El Massa Tour & Travel*\n\n`;
      text += `Saya berminat mendaftar / konsultasi untuk paket ibadah berikut:\n`;
      text += `🕌 *Paket:* ${p ? p.title : '-'}\n`;
      text += `🏷️ *Kategori:* ${p ? p.category : '-'}\n`;
      if (s) {
        text += `🗓️ *Jadwal Keberangkatan:* ${this.formatScheduleDateWithDuration(s)}\n`;
        text += `✈️ *Maskapai:* ${s.airline || '-'} (Start ${s.startCity || 'Jakarta'})\n`;
        text += `💰 *Harga Paket:* ${this.formatScheduleMoneyFull(s, s.price)}\n`;
        text += `💳 *DP Awal:* ${this.formatScheduleMoneyFull(s, s.dp)}\n`;
      }
      text += `\nMohon informasi ketersediaan seat, rincian fasilitas dan persyaratan pendaftarannya. Terima kasih.`;

      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    },

    copyShareText(pkg, sch) {
      const p = pkg || this.activeDetailPackage;
      const s = sch || this.activeSchedule;
      let text = `🌟 *${p.title}* bersama *El Massa Tour & Travel* 🌟\n`;
      text += `📍 Kategori: ${p.category}\n`;
      if (s) {
        text += `🗓️ Jadwal: ${this.formatScheduleDateWithDuration(s)}\n`;
        text += `✈️ Penerbangan: ${s.airline} Start ${s.startCity}\n`;
        text += `💵 Harga: ${this.formatScheduleMoneyFull(s, s.price)} (DP: ${this.formatScheduleMoneyFull(s, s.dp)})\n`;
      }
      text += `\nInfo pendaftaran & detail itinerary lengkap: ${window.location.href}`;

      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Teks paket berhasil disalin ke clipboard!', 'success');
      }).catch(() => {
        this.showToast('Gagal menyalin teks.', 'error');
      });
    },

    // =========================================================================
    // ENHANCED SAVINGS CALCULATOR LOGIC
    // =========================================================================
    get calculatorSelectedPackage() {
      if (!this.calculator.packageId) return null;
      return this.packages.find(p => p.id === this.calculator.packageId) || null;
    },

    get calculatorSelectedSchedule() {
      const pkg = this.calculatorSelectedPackage;
      if (!pkg) return null;
      const schs = this.getSchedulesForPkg(pkg.id);
      if (this.calculator.selectedScheduleId) {
        return schs.find(s => s.id === this.calculator.selectedScheduleId) || schs[0] || null;
      }
      return schs[0] || null;
    },

    get calculatedBasePricePerPax() {
      const sch = this.calculatorSelectedSchedule;
      if (sch && sch.price) return Number(sch.price);
      return Number(this.calculator.customPrice) || 34700000;
    },

    get calculatedDpPerPax() {
      const sch = this.calculatorSelectedSchedule;
      if (sch && sch.dp) return Number(sch.dp);
      return Number(this.calculator.customDp) || 5000000;
    },

    get calculatedAddonsPerPax() {
      let addon = 0;
      if (this.calculator.includePassport) addon += 650000;
      if (this.calculator.includeVaccine) addon += 550000;
      if (this.calculator.roomUpgrade === 'triple') addon += 3000000;
      if (this.calculator.roomUpgrade === 'double') addon += 5000000;
      return addon;
    },

    get calculatedTotalPricePerPax() {
      return this.calculatedBasePricePerPax + this.calculatedAddonsPerPax;
    },

    get calculatedTotalPackageCost() {
      const pax = Number(this.calculator.pax) || 1;
      return this.calculatedTotalPricePerPax * pax;
    },

    get calculatedTotalDp() {
      const pax = Number(this.calculator.pax) || 1;
      return this.calculatedDpPerPax * pax;
    },

    get calculatedTotalRemaining() {
      return Math.max(0, this.calculatedTotalPackageCost - this.calculatedTotalDp);
    },

    get calculatedMonthlySaving() {
      const targetMonths = Number(this.calculator.targetMonths) || 12;
      return Math.ceil(this.calculatedTotalRemaining / targetMonths);
    },

    get calculatedDailySaving() {
      return Math.ceil(this.calculatedMonthlySaving / 30);
    },

    get calculatedTargetDateText() {
      const targetMonths = Number(this.calculator.targetMonths) || 12;
      const d = new Date();
      d.setMonth(d.getMonth() + targetMonths);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    },

    getWhatsAppCalculatorUrl() {
      const phone = this.settings.WHATSAPP_NUMBER || '6281171715125';
      const pkg = this.calculatorSelectedPackage;
      const sch = this.calculatorSelectedSchedule;
      const pax = this.calculator.pax;
      const months = this.calculator.targetMonths;

      let text = `*Assalamu'alaikum Admin El Massa Tour & Travel*\n\n`;
      text += `Saya ingin konsultasi rencana *Program Tabungan Umrah* dengan simulasi berikut:\n\n`;
      text += `🕌 *Paket Pilihan:* ${pkg ? pkg.title : 'Custom Budget Plan'}\n`;
      if (sch) {
        text += `✈️ *Rute & Maskapai:* ${sch.airline} (Start ${sch.startCity})\n`;
      }
      text += `👥 *Jumlah Jamaah:* ${pax} Orang\n`;
      text += `⏳ *Target Waktu Menabung:* ${months} Bulan (${this.calculatedTargetDateText})\n`;
      text += `💰 *Total Biaya Paket:* ${this.formatRupiahFull(this.calculatedTotalPackageCost)}\n`;
      text += `💳 *Total Setoran Awal (DP):* ${this.formatRupiahFull(this.calculatedTotalDp)}\n`;
      text += `✨ *Estimasi Tabungan Bulanan:* ${this.formatRupiahFull(this.calculatedMonthlySaving)} / bulan\n`;
      text += `☕ *Estimasi Tabungan Harian:* ${this.formatRupiahFull(this.calculatedDailySaving)} / hari\n\n`;
      text += `Mohon info pembukaan rekening tabungan & bimbingan rencana keberangkatan. Terima kasih.`;

      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    },

    copyCalculatorSummary() {
      const pkg = this.calculatorSelectedPackage;
      const pax = this.calculator.pax;
      const months = this.calculator.targetMonths;

      let text = `📋 *Ringkasan Simulasi Tabungan Umrah El Massa*\n`;
      text += `Paket: ${pkg ? pkg.title : 'Custom Budget'}\n`;
      text += `Jumlah: ${pax} Jamaah | Target: ${months} Bulan (${this.calculatedTargetDateText})\n`;
      text += `Total Biaya: ${this.formatRupiahFull(this.calculatedTotalPackageCost)}\n`;
      text += `DP: ${this.formatRupiahFull(this.calculatedTotalDp)}\n`;
      text += `Tabungan Bulanan: ${this.formatRupiahFull(this.calculatedMonthlySaving)}/bln (~${this.formatRupiahFull(this.calculatedDailySaving)}/hari)\n`;
      text += `\nKonsultasi Resmi El Massa: +62 811-7171-5125`;

      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Ringkasan simulasi tabungan disalin ke clipboard!', 'success');
      }).catch(() => {
        this.showToast('Gagal menyalin teks.', 'error');
      });
    },

    // Admin & Auth Methods
    handleAdminLogin() {
      if (this.adminUserInput.trim().toLowerCase() === 'admin' && this.adminPasswordInput === 'elmassa123') {
        this.adminSession = 'TOKEN_ELMASSA_' + Date.now();
        this.currentAdminUser = 'Admin El Massa';
        this.currentAdminRole = 'Superadmin';
        this.adminPasswordInput = '';
        this.showToast('Selamat datang di Dashboard Admin El Massa!', 'success');
      } else {
        this.loginError = 'Username atau Password salah. (Coba: admin / elmassa123)';
      }
    },

    performAdminLogout() {
      this.adminSession = null;
      this.currentAdminUser = '';
      this.showLogoutConfirmModal = false;
      this.showToast('Logout berhasil.', 'success');
    },

    // Admin Package CRUD
    openPackageForm(pkg) {
      if (pkg) {
        this.editingPkg = {
          id: pkg.id,
          title: pkg.title || '',
          category: pkg.category || 'Umroh Direct Flight',
          tagsStr: Array.isArray(pkg.tags) ? pkg.tags.join(', ') : '',
          programSummary: pkg.programSummary || '',
          flyerUrl: pkg.flyerUrl || '',
          thumbnailUrl: pkg.thumbnailUrl || '',
          activeStatus: pkg.activeStatus || 'Aktif',
          hotelMakkah: pkg.hotelMakkah || '',
          hotelMadinah: pkg.hotelMadinah || '',
          hotelExtra: pkg.hotelExtra || '',
          customIncludes: Array.isArray(pkg.customIncludes) && pkg.customIncludes.length > 0 ? [...pkg.customIncludes] : [...this.defaultInclude],
          customExcludes: Array.isArray(pkg.customExcludes) && pkg.customExcludes.length > 0 ? [...pkg.customExcludes] : [...this.defaultExclude],
          newIncludeInput: '',
          newExcludeInput: '',
          itinerary: Array.isArray(pkg.itinerary) ? JSON.parse(JSON.stringify(pkg.itinerary)) : [],
          schedules: (pkg.schedules || []).map(s => ({ ...s }))
        };
      } else {
        this.editingPkg = {
          id: null,
          title: '',
          category: 'Umroh Direct Flight',
          tagsStr: 'Direct Flight, Bintang 5, Promo',
          programSummary: '',
          flyerUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1080&q=80',
          thumbnailUrl: '',
          activeStatus: 'Aktif',
          hotelMakkah: 'Pullman Zamzam (★5)',
          hotelMadinah: 'Front Taiba (★5)',
          hotelExtra: '',
          customIncludes: [...this.defaultInclude],
          customExcludes: [...this.defaultExclude],
          newIncludeInput: '',
          newExcludeInput: '',
          itinerary: [
            {
              day: 1,
              title: 'Hari 1: Keberangkatan Jakarta – Saudi Arabia',
              route: 'Jakarta (CGK) ➔ Madinah (MED)',
              activities: [
                'Berkumpul di Lounge Bandara Soekarno Hatta Terminal 3.',
                'Penerbangan langsung ke Madinah.',
                'Tiba di Madinah, check-in hotel dan istirahat.'
              ]
            },
            {
              day: 2,
              title: 'Hari 2: Ziarah Raudhah & Masjid Nabawi',
              route: 'Madinah Al-Munawwarah',
              activities: [
                'Sholat berjamaah di Masjid Nabawi.',
                'Ziarah Makam Rasulullah SAW dan Raudhah resmi Nusuk.'
              ]
            }
          ],
          schedules: [
            {
              id: 'sch-' + Date.now(),
              startCity: 'Jakarta',
              departureDate: '2026-10-10',
              returnDate: '2026-10-18',
              duration: 9,
              airline: 'Saudia Airlines',
              price: 29800000,
              dp: 5000000,
              availableSeats: 20,
              itineraryUrl: ''
            }
          ]
        };
      }
      this.showPackageFormModal = true;
    },

    addScheduleToEditingPkg() {
      this.editingPkg.schedules.push({
        id: 'sch-' + Date.now() + Math.floor(Math.random() * 100),
        startCity: 'Jakarta',
        departureDate: '',
        returnDate: '',
        duration: 9,
        airline: 'Saudia Airlines',
        price: 29800000,
        dp: 5000000,
        availableSeats: 20,
        itineraryUrl: ''
      });
    },

    addItineraryDay() {
      const nextDay = (this.editingPkg.itinerary.length || 0) + 1;
      this.editingPkg.itinerary.push({
        day: nextDay,
        title: `Hari ${nextDay}: Kegiatan Ibadah / Ziarah`,
        route: 'Kota Makkah / Madinah',
        activities: ['Kegiatan sholat fardhu dan ibadah sunnah berjamaah.']
      });
    },

    removeItineraryDay(idx) {
      this.editingPkg.itinerary.splice(idx, 1);
    },

    addActivityToDay(dayObj) {
      if (!Array.isArray(dayObj.activities)) dayObj.activities = [];
      dayObj.activities.push('Rincian kegiatan baru...');
    },

    removeActivityFromDay(dayObj, actIdx) {
      dayObj.activities.splice(actIdx, 1);
    },

    addIncludeItem() {
      if (this.editingPkg.newIncludeInput.trim()) {
        this.editingPkg.customIncludes.push(this.editingPkg.newIncludeInput.trim());
        this.editingPkg.newIncludeInput = '';
      }
    },

    removeIncludeItem(idx) {
      this.editingPkg.customIncludes.splice(idx, 1);
    },

    addExcludeItem() {
      if (this.editingPkg.newExcludeInput.trim()) {
        this.editingPkg.customExcludes.push(this.editingPkg.newExcludeInput.trim());
        this.editingPkg.newExcludeInput = '';
      }
    },

    removeExcludeItem(idx) {
      this.editingPkg.customExcludes.splice(idx, 1);
    },

    savePackageSubmit() {
      if (!this.editingPkg.title.trim()) {
        this.showToast('Nama paket wajib diisi.', 'error');
        return;
      }

      this.savePkgLoading = true;
      const pkgId = this.editingPkg.id || ('pkg-' + Date.now());
      const tagsArray = this.editingPkg.tagsStr.split(',').map(s => s.trim()).filter(Boolean);

      const pkgData = {
        id: pkgId,
        title: this.editingPkg.title.trim(),
        category: this.editingPkg.category,
        tags: tagsArray,
        programSummary: this.editingPkg.programSummary,
        flyerUrl: this.editingPkg.flyerUrl || this.defaultKaaba,
        thumbnailUrl: this.editingPkg.thumbnailUrl || this.editingPkg.flyerUrl || this.defaultKaaba,
        activeStatus: this.editingPkg.activeStatus || 'Aktif',
        createdAt: this.editingPkg.id ? (this.packages.find(p => p.id === pkgId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        hotelMakkah: this.editingPkg.hotelMakkah,
        hotelMadinah: this.editingPkg.hotelMadinah,
        hotelExtra: this.editingPkg.hotelExtra,
        customIncludes: this.editingPkg.customIncludes,
        customExcludes: this.editingPkg.customExcludes,
        itinerary: this.editingPkg.itinerary,
        schedules: this.editingPkg.schedules.map((s, idx) => ({
          ...s,
          id: s.id || `sch-${pkgId}-${idx}`,
          packageId: pkgId,
          price: Number(s.price) || 0,
          dp: Number(s.dp) || 0,
          availableSeats: this.isHajiPackage(this.editingPkg) ? String(s.availableSeats || 'TERSEDIA').toUpperCase() : Number(s.availableSeats || 0)
        }))
      };

      const existingIndex = this.packages.findIndex(p => p.id === pkgId);
      if (existingIndex >= 0) {
        this.packages[existingIndex] = pkgData;
        this.showToast('Paket berhasil diperbarui!', 'success');
      } else {
        this.packages.unshift(pkgData);
        this.showToast('Paket baru berhasil ditambahkan!', 'success');
      }

      this.saveStorageData();
      this.syncNotifications();
      this.savePkgLoading = false;
      this.showPackageFormModal = false;
    },

    confirmDeletePackage(pkg) {
      this.pkgToDelete = pkg;
      this.showDeleteConfirmModal = true;
    },

    executeDeletePackage() {
      if (!this.pkgToDelete) return;
      this.packages = this.packages.filter(p => p.id !== this.pkgToDelete.id);
      this.saveStorageData();
      this.syncNotifications();
      this.showDeleteConfirmModal = false;
      this.pkgToDelete = null;
      this.showToast('Paket berhasil dihapus.', 'success');
    },

    // Bulk Seat Management
    openSeatManager() {
      const drafts = {};
      this.schedules.forEach(s => {
        drafts[s.id] = s.availableSeats;
      });
      this.seatDrafts = drafts;
      this.activeTab = 'admin-seat-manager';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    get changedSeatCount() {
      let count = 0;
      this.schedules.forEach(s => {
        if (this.seatDrafts[s.id] !== undefined && String(this.seatDrafts[s.id]) !== String(s.availableSeats)) {
          count++;
        }
      });
      return count;
    },

    submitBulkSeatUpdate() {
      this.seatUpdateLoading = true;
      this.packages.forEach(pkg => {
        (pkg.schedules || []).forEach(sch => {
          if (this.seatDrafts[sch.id] !== undefined) {
            sch.availableSeats = this.isHajiSchedule(sch)
              ? String(this.seatDrafts[sch.id]).toUpperCase()
              : Number(this.seatDrafts[sch.id]);
          }
        });
      });
      this.settings.LAST_SEAT_UPDATE = new Date().toISOString();
      this.saveStorageData();
      this.seatUpdateLoading = false;
      this.showToast('Semua perubahan jumlah seat berhasil disimpan!', 'success');
    },

    // City & Airline Master Data
    submitAddCity() {
      if (this.newCityName.trim() && !this.cities.includes(this.newCityName.trim())) {
        this.cities.push(this.newCityName.trim());
        this.newCityName = '';
        this.saveStorageData();
        this.showToast('Kota berhasil ditambahkan.', 'success');
      }
    },

    deleteCity(cityName) {
      this.cities = this.cities.filter(c => c !== cityName);
      this.saveStorageData();
      this.showToast('Kota berhasil dihapus.', 'success');
    },

    submitAddAirline() {
      if (this.newAirlineName.trim() && !this.airlines.includes(this.newAirlineName.trim())) {
        this.airlines.push(this.newAirlineName.trim());
        this.newAirlineName = '';
        this.saveStorageData();
        this.showToast('Maskapai berhasil ditambahkan.', 'success');
      }
    },

    deleteAirline(airlineName) {
      this.airlines = this.airlines.filter(a => a !== airlineName);
      this.saveStorageData();
      this.showToast('Maskapai berhasil dihapus.', 'success');
    }
  };
}
