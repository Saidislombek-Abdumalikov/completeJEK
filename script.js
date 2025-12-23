// Data & Logic
let excelData = [];
let settings = { dollarRate: 12200, aviaPrice: 9.5, avtoPrice: 6 };
let stats = { visits: 0, searches: 0, uploadedFiles: 0, totalCodes: 0 };
let activityLog = [];
let clientMessages = [];
let clickCount = 0;
let clickTimer = null;
let adminModal = null;

// New: Site Content Management
let siteContent = {
    siteTitle: "JEK KARGO",
    logoUrl: "jek-logo.png",
    heroTitle: "Xitoydan O‘zbekistonga tez yuk tashish",
    heroSubtitle: "JEK KARGO - ishonchli logistika xizmati.",
    heroPrices: `<strong>Narxlar (kg uchun): 💲</strong><br>
                 <em>Avto: $6-7.5 🚚 (14-18 kun) | Avia: $9.5-11 ✈️ (3-5 kun)</em><br>
                 <small>1 kg+ : Eng yaqin Emu Pochta bepul!</small>`,
    services: [
        {icon: "fa-plane", title: "Avia kargo", desc: "3-5 kun. $9.5-11/kg ✈️"},
        {icon: "fa-truck", title: "Avto kargo", desc: "14-18 kun. $6-7.5/kg 🚚"},
        {icon: "fa-shield-alt", title: "Sug‘urta", desc: "To‘liq himoya."},
        {icon: "fa-headset", title: "24/7 Yordam", desc: "Kuzatish va maslahat."},
        {icon: "fa-warehouse", title: "Zamonaviy ombor", desc: "Yiwu shahrida xavfsiz saqlash."}
    ],
    contactOffices: `<p><strong>Xitoy:</strong> Yiwu<br><strong>O‘zbekiston:</strong> Toshkent (asosiy), Namangan</p>`,
    contactPhone: "+998 94 948 0542",
    tg1: "https://t.me/jekkargo",
    tg2: "https://t.me/jek_kargo",
    instagram: "https://instagram.com/jekkargo",
    footerText: "© 2025 JEK KARGO. Huquqlar himoyalangan."
};

window.onload = function() {
    loadSettings();
    loadStats();
    loadClientMessages();
    loadExcelFiles();
    loadSiteContent();
    trackVisit();
    renderServices();

    // Initialize Bootstrap modal
    const modalElement = document.getElementById('adminLoginModal');
    if (modalElement) {
        adminModal = new bootstrap.Modal(modalElement);
    }
};

function adminClickCounter() {
    clickCount++;
    if (clickCount === 3) {
        if (adminModal) {
            adminModal.show();
        } else {
            alert("Modal yuklanmadi. Sahifani yangilang.");
        }
        clickCount = 0;
        clearTimeout(clickTimer);
        return;
    }

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 2000);
}

// === Site Content Functions ===
function loadSiteContent() {
    const saved = localStorage.getItem('jekSiteContent');
    if (saved) {
        siteContent = JSON.parse(saved);
    }
    applySiteContent();
}

function applySiteContent() {
    document.getElementById('siteTitle').textContent = siteContent.siteTitle;
    document.getElementById('siteLogo').src = siteContent.logoUrl;
    document.getElementById('heroTitle').textContent = siteContent.heroTitle;
    document.getElementById('heroSubtitle').textContent = siteContent.heroSubtitle;
    document.getElementById('heroPrices').innerHTML = siteContent.heroPrices;
    document.getElementById('contactOffices').innerHTML = siteContent.contactOffices;
    document.getElementById('contactPhone').textContent = siteContent.contactPhone;
    document.getElementById('tg1').href = siteContent.tg1;
    document.getElementById('tg1').textContent = "t.me/jekkargo";
    document.getElementById('tg2').href = siteContent.tg2;
    document.getElementById('tg2').textContent = "t.me/jek_kargo";
    document.getElementById('instagram').href = siteContent.instagram;
    document.getElementById('footerText').textContent = siteContent.footerText;

    const footerLinks = document.querySelectorAll('#footerSocial a');
    if (footerLinks.length === 3) {
        footerLinks[0].href = siteContent.tg1;
        footerLinks[1].href = siteContent.tg2;
        footerLinks[2].href = siteContent.instagram;
    }

    renderServices();
    if (document.getElementById('adminPanel').style.display === 'block') {
        fillAdminForm();
    }
}

function renderServices() {
    const container = document.getElementById('servicesContainer');
    if (!container) return;
    container.innerHTML = siteContent.services.map(s => `
        <div class="col-md-4">
            <div class="card service-card h-100 text-center p-4 shadow-sm">
                <i class="fas ${s.icon} fa-3x mb-3"></i>
                <h4>${s.title}</h4>
                <p>${s.desc}</p>
            </div>
        </div>
    `).join('');
}

// Admin content editing functions
function fillAdminForm() {
    document.getElementById('editSiteTitle').value = siteContent.siteTitle;
    document.getElementById('editLogoUrl').value = siteContent.logoUrl;
    document.getElementById('editHeroTitle').value = siteContent.heroTitle;
    document.getElementById('editHeroSubtitle').value = siteContent.heroSubtitle;
    document.getElementById('editHeroPrices').value = siteContent.heroPrices;
    document.getElementById('editContactOffices').value = siteContent.contactOffices;
    document.getElementById('editContactPhone').value = siteContent.contactPhone;
    document.getElementById('editTg1').value = siteContent.tg1;
    document.getElementById('editTg2').value = siteContent.tg2;
    document.getElementById('editInstagram').value = siteContent.instagram;
    document.getElementById('editFooterText').value = siteContent.footerText;
    renderAdminServices();
}

function renderAdminServices() {
    const list = document.getElementById('adminServicesList');
    if (!list) return;
    list.innerHTML = siteContent.services.map((s, i) => `
        <div class="card mb-3 p-3">
            <div class="row g-2 align-items-center">
                <div class="col-md-2"><input type="text" class="form-control" value="${s.icon}" onchange="siteContent.services[${i}].icon=this.value"></div>
                <div class="col-md-4"><input type="text" class="form-control" value="${s.title}" onchange="siteContent.services[${i}].title=this.value"></div>
                <div class="col-md-5"><input type="text" class="form-control" value="${s.desc}" onchange="siteContent.services[${i}].desc=this.value"></div>
                <div class="col-md-1"><button class="btn btn-danger btn-sm" onclick="removeService(${i})">✕</button></div>
            </div>
        </div>
    `).join('');
}

function addNewService() {
    siteContent.services.push({icon: "fa-star", title: "Yangi xizmat", desc: "Tavsif kiriting..."});
    renderAdminServices();
}

function removeService(index) {
    siteContent.services.splice(index, 1);
    renderAdminServices();
}

function saveContent() {
    siteContent.siteTitle = document.getElementById('editSiteTitle').value.trim();
    siteContent.heroTitle = document.getElementById('editHeroTitle').value.trim();
    siteContent.heroSubtitle = document.getElementById('editHeroSubtitle').value.trim();
    siteContent.heroPrices = document.getElementById('editHeroPrices').value;
    siteContent.contactOffices = document.getElementById('editContactOffices').value;
    siteContent.contactPhone = document.getElementById('editContactPhone').value.trim();
    siteContent.tg1 = document.getElementById('editTg1').value.trim();
    siteContent.tg2 = document.getElementById('editTg2').value.trim();
    siteContent.instagram = document.getElementById('editInstagram').value.trim();
    siteContent.footerText = document.getElementById('editFooterText').value.trim();

    const logoFile = document.getElementById('logoUpload').files[0];
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            siteContent.logoUrl = e.target.result;
            saveAndApply();
        };
        reader.readAsDataURL(logoFile);
    } else {
        siteContent.logoUrl = document.getElementById('editLogoUrl').value.trim() || siteContent.logoUrl;
        saveAndApply();
    }

    function saveAndApply() {
        localStorage.setItem('jekSiteContent', JSON.stringify(siteContent));
        applySiteContent();
        alert('Barcha o‘zgarishlar saqlandi!');
    }
}

// === Existing Functions (Fixed Calculator) ===
document.getElementById('quoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const service = document.getElementById('service').value;
    const items = parseInt(document.getElementById('items').value) || 1;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const dims = document.getElementById('dimensions').value.trim();

    if (weight <= 0) {
        alert("Og‘irlikni to‘g‘ri kiriting!");
        return;
    }

    let maxDim = 0;
    if (dims) {
        const parts = dims.split(/[xX*]/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
        if (parts.length === 3) maxDim = Math.max(...parts);
    }

    const isHighRate = (items >= 5) || (maxDim > 50);
    const baseRate = service === 'avia' ? settings.aviaPrice : settings.avtoPrice;
    const rate = isHighRate ? (service === 'avia' ? 11 : 7.5) : baseRate;
    const totalUSD = (rate * weight).toFixed(2);
    const totalUZS = Math.round(rate * weight * settings.dollarRate).toLocaleString();

    const reason = isHighRate ? ' (Yuqori narx: donalar ≥5 yoki o‘lcham >50sm)' : '';

    document.getElementById('quoteResult').innerHTML = `
        <div class="alert alert-success text-center">
            <h4>Narx: $${totalUSD} (${rate}$/kg)${reason}</h4>
            <h5>So‘mda: ${totalUZS} so‘m</h5>
            ${weight >= 1 ? '<p class="mb-0"><strong>1kg+: Emu Pochta bepul!</strong></p>' : ''}
        </div>
    `;
    document.getElementById('quoteResult').style.display = 'block';
});

// Contact Form (fixed ID)
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhoneInput').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (name && phone && message) {
        saveClientMessage(name, phone, message);
        alert('Xabar yuborildi! Tez orada siz bilan bog‘lanamiz.');
        e.target.reset();
    } else {
        alert('Iltimos, barcha maydonlarni to‘ldiring.');
    }
});

// === All other original functions (unchanged) ===
// Paste the rest of your original functions here: loadSettings, saveSetting, trackCargo, uploadFile, parseExcelData, etc.
// They remain exactly the same.

function loadSettings() {
    const saved = localStorage.getItem('jekSettings');
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById('dollarRate').value = settings.dollarRate;
        document.getElementById('aviaPrice').value = settings.aviaPrice;
        document.getElementById('avtoPrice').value = settings.avtoPrice;
    }
}

// ... (keep all your other functions like saveSetting, trackCargo, uploadFile, etc.)

function adminAuth() {
    const password = document.getElementById('adminPassword').value;
    if (password === 's08121719') {
        adminModal.hide();
        document.querySelector('main').style.display = 'none';
        document.querySelector('nav').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadExcelFiles();
        displayClientMessages();
        fillAdminForm(); // Important!
        updateStatsDisplay();
    } else {
        alert('Noto‘g‘ri parol!');
    }
}

function logout() {
    document.getElementById('adminPanel').style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('nav').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    document.getElementById('adminPassword').value = '';
}
