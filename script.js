// === All your existing variables (excelData, settings, stats, etc.) remain the same ===
// Add these new ones:
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

// Load content on start
window.onload = function() {
    loadSettings();
    loadStats();
    loadClientMessages();
    loadExcelFiles();
    trackVisit();
    loadSiteContent();
    renderServices();
    adminModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
};

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
    document.getElementById('tg2').href = siteContent.tg2;
    document.getElementById('instagram').href = siteContent.instagram;
    document.getElementById('footerText').textContent = siteContent.footerText;

    // Update footer social links
    document.querySelectorAll('#footerSocial a')[0].href = siteContent.tg1;
    document.querySelectorAll('#footerSocial a')[1].href = siteContent.tg2;
    document.querySelectorAll('#footerSocial a')[2].href = siteContent.instagram;

    renderServices();
    fillAdminForm();
}

function renderServices() {
    const container = document.getElementById('servicesContainer');
    container.innerHTML = siteContent.services.map((s, i) => `
        <div class="col-md-4">
            <div class="card service-card h-100 text-center p-4 shadow-sm">
                <i class="fas ${s.icon} fa-3x mb-3"></i>
                <h4>${s.title}</h4>
                <p>${s.desc}</p>
            </div>
        </div>
    `).join('');
}

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
    list.innerHTML = siteContent.services.map((s, i) => `
        <div class="card mb-3 p-3">
            <div class="row g-2">
                <div class="col-md-2"><input type="text" class="form-control" value="${s.icon}" onchange="siteContent.services[${i}].icon=this.value"></div>
                <div class="col-md-4"><input type="text" class="form-control" value="${s.title}" onchange="siteContent.services[${i}].title=this.value"></div>
                <div class="col-md-5"><input type="text" class="form-control" value="${s.desc}" onchange="siteContent.services[${i}].desc=this.value"></div>
                <div class="col-md-1"><button class="btn btn-danger btn-sm" onclick="removeService(${i})">✕</button></div>
            </div>
        </div>
    `).join('');
}

function addNewService() {
    siteContent.services.push({icon: "fa-star", title: "Yangi xizmat", desc: "Tavsif..."});
    renderAdminServices();
}

function removeService(index) {
    siteContent.services.splice(index, 1);
    renderAdminServices();
}

function saveContent() {
    siteContent.siteTitle = document.getElementById('editSiteTitle').value;
    siteContent.heroTitle = document.getElementById('editHeroTitle').value;
    siteContent.heroSubtitle = document.getElementById('editHeroSubtitle').value;
    siteContent.heroPrices = document.getElementById('editHeroPrices').value;
    siteContent.contactOffices = document.getElementById('editContactOffices').value;
    siteContent.contactPhone = document.getElementById('editContactPhone').value;
    siteContent.tg1 = document.getElementById('editTg1').value;
    siteContent.tg2 = document.getElementById('editTg2').value;
    siteContent.instagram = document.getElementById('editInstagram').value;
    siteContent.footerText = document.getElementById('editFooterText').value;

    const logoInput = document.getElementById('logoUpload');
    if (logoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            siteContent.logoUrl = e.target.result;
            localStorage.setItem('jekSiteContent', JSON.stringify(siteContent));
            applySiteContent();
            alert('Barcha o‘zgarishlar saqlandi!');
        };
        reader.readAsDataURL(logoInput.files[0]);
    } else {
        siteContent.logoUrl = document.getElementById('editLogoUrl').value || siteContent.logoUrl;
        localStorage.setItem('jekSiteContent', JSON.stringify(siteContent));
        applySiteContent();
        alert('Barcha o‘zgarishlar saqlandi!');
    }
}

// Keep all your existing functions (trackCargo, uploadFile, adminAuth, logout, etc.)
// They remain unchanged and fully compatible.

// Only change: after adminAuth(), add:
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
        fillAdminForm();  // <<< NEW
    } else {
        alert('Noto‘g‘ri parol!');
    }
}