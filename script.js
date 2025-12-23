// Data & Logic
let excelData = [];
let settings = { dollarRate: 12200, aviaPrice: 9.5, avtoPrice: 6 };
let stats = { visits: 0, searches: 0, uploadedFiles: 0, totalCodes: 0 };
let activityLog = [];
let clientMessages = [];
let clickCount = 0;
let clickTimer = null;
let adminModal = null;
let currentEditIndex = null;

window.onload = function() {
    loadSettings();
    loadStats();
    loadClientMessages();
    loadExcelFiles();
    loadExcelData();
    trackVisit();

    adminModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
};

function adminClickCounter() {
    clickCount++;
    if (clickCount === 3) {
        adminModal.show();
        clickCount = 0;
    }
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
}

// Settings & Stats
function loadSettings() {
    const saved = localStorage.getItem('jekSettings');
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById('dollarRate').value = settings.dollarRate;
        document.getElementById('aviaPrice').value = settings.aviaPrice;
        document.getElementById('avtoPrice').value = settings.avtoPrice;
    }
}

function loadStats() {
    const saved = localStorage.getItem('jekStats');
    if (saved) stats = JSON.parse(saved);
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem('jekStats', JSON.stringify(stats));
    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('totalVisits').textContent = stats.visits;
    document.getElementById('totalSearches').textContent = stats.searches;
    document.getElementById('uploadedFiles').textContent = stats.uploadedFiles;
    document.getElementById('totalCodes').textContent = stats.totalCodes;
}

function trackVisit() {
    stats.visits++;
    saveStats();
    logActivity('Saytga tashrif');
}

function logActivity(msg) {
    const time = new Date().toLocaleTimeString();
    activityLog.unshift({time, msg});
    if (activityLog.length > 50) activityLog.pop();
    const logEl = document.getElementById('activityLog');
    if (logEl) {
        logEl.innerHTML = activityLog.map(l => `<div><strong>[${l.time}]</strong> ${l.msg}</div>`).join('');
    }
}

// Client Messages Management
function loadClientMessages() {
    const saved = localStorage.getItem('jekClientMessages');
    if (saved) {
        clientMessages = JSON.parse(saved);
        displayClientMessages();
    }
}

function saveClientMessage(name, phone, message) {
    const timestamp = new Date().toLocaleString();
    clientMessages.unshift({ name, phone, message, timestamp });
    if (clientMessages.length > 100) clientMessages.pop();
    localStorage.setItem('jekClientMessages', JSON.stringify(clientMessages));
    logActivity(`Yangi mijoz xabari: ${name} (${phone})`);
}

function displayClientMessages() {
    const container = document.getElementById('clientMessages');
    if (clientMessages.length === 0) {
        container.innerHTML = '<p class="text-muted">Hali xabar yo\'q</p>';
        return;
    }
    container.innerHTML = clientMessages.map((msg, idx) => `
        <div class="message-item">
            <div class="d-flex justify-content-between">
                <div>
                    <strong>${msg.name}</strong> <span class="message-time">— ${msg.timestamp}</span><br>
                    <strong>Telefon:</strong> ${msg.phone}<br>
                    <p class="mb-0">${msg.message}</p>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteMessage(${idx})">O'chirish</button>
            </div>
        </div>
    `).join('');
}

function deleteMessage(idx) {
    if (confirm('Bu xabarni o\'chirmoqchimisiz?')) {
        clientMessages.splice(idx, 1);
        localStorage.setItem('jekClientMessages', JSON.stringify(clientMessages));
        displayClientMessages();
        logActivity('Mijoz xabari o\'chirildi');
    }
}

function clearAllMessages() {
    if (confirm('Barcha xabarlarni o\'chirmoqchimisiz?')) {
        clientMessages = [];
        localStorage.setItem('jekClientMessages', JSON.stringify(clientMessages));
        displayClientMessages();
        logActivity('Barcha xabarlar o\'chirildi');
    }
}

// Contact Form
document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (name && phone && message) {
        saveClientMessage(name, phone, message);
        alert('Xabar yuborildi! Tez orada siz bilan bog\'lanamiz.');
        e.target.reset();
    } else {
        alert('Iltimos, barcha maydonlarni to\'ldiring.');
    }
});

// Price Calculator
document.getElementById('quoteForm').addEventListener('submit', e => {
    e.preventDefault();
    const service = document.getElementById('service').value;
    const items = parseInt(document.getElementById('items').value) || 1;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const dims = document.getElementById('dimensions').value.trim();

    let maxDim = 0;
    if (dims) {
        const parts = dims.split(/[xX]/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
        if (parts.length === 3) maxDim = Math.max(...parts);
    }

    const isHighRate = (items >= 5) || (maxDim > 50);
    const baseRate = service === 'avia' ? settings.aviaPrice : settings.avtoPrice;
    const rate = isHighRate ? (service === 'avia' ? 11 : 7.5) : baseRate;
    const totalUSD = (rate * weight).toFixed(2);
    const totalUZS = Math.round(rate * weight * settings.dollarRate).toLocaleString();

    const reason = isHighRate ? ' (Yuqori narx: donalar ≥5 yoki o\'lcham >50sm)' : '';

    document.getElementById('quoteResult').innerHTML = `
        <div class="alert alert-success text-center">
            <h4>Narx: $${totalUSD} (${rate}$/kg)${reason}</h4>
            <h5>So'mda: ${totalUZS} so'm</h5>
            ${weight > 1 ? '<p class="mb-0"><strong>1kg+: Emu Pochta bepul!</strong></p>' : ''}
        </div>
    `;
    document.getElementById('quoteResult').style.display = 'block';
});

// Tracking
function trackCargo() {
    const input = document.getElementById('trackingInput').value.trim();
    if (!input) return alert('Trek raqam(lar)ini kiriting');
    const codes = input.split(',').map(c => c.trim()).filter(c => c);

    const results = codes.map(code => excelData.find(r => r.trackingCode === code)).filter(Boolean);

    stats.searches++;
    saveStats();
    logActivity(`Qidiruv: ${codes.join(', ')}`);

    const container = document.getElementById('trackingResults');
    if (results.length === 0) {
        container.innerHTML = '<div class="alert alert-warning text-center">Hech nima topilmadi</div>';
        return;
    }

    container.innerHTML = results.map(item => {
        const cost = Math.round(item.weight * item.pricePerKg * settings.dollarRate);
        const delivery = calculateDeliveryDate(item.receiptDate, item.type);
        return `
            <div class="card result-card mb-3">
                <div class="card-body">
                    <h5>${item.trackingCode} 
                        <button class="btn btn-sm btn-outline-secondary float-end" onclick="navigator.clipboard.writeText('${item.trackingCode}'); alert('Nusxalandi!')">📋</button>
                    </h5>
                    <p><strong>Og'irlik:</strong> ${item.weight} kg | <strong>Narx:</strong> ${cost.toLocaleString()} so'm</p>
                    <p><strong>Qabul sanasi:</strong> ${item.receiptDate} | <strong>Reys:</strong> ${item.flight}</p>
                    <p><strong>Taxminiy yetib kelish:</strong> ${delivery}</p>
                </div>
            </div>
        `;
    }).join('');
}

function calculateDeliveryDate(dateStr, type) {
    if (!dateStr) return 'Noma\'lum';
    const date = new Date(dateStr);
    const min = type === 'Avia' ? 3 : 14;
    const max = type === 'Avia' ? 5 : 18;
    const minDate = new Date(date); minDate.setDate(date.getDate() + min);
    const maxDate = new Date(date); maxDate.setDate(date.getDate() + max);
    return `${minDate.toLocaleDateString('uz-UZ')} - ${maxDate.toLocaleDateString('uz-UZ')}`;
}

// Excel Data Management
function loadExcelData() {
    const saved = localStorage.getItem('jekExcelData');
    if (saved) {
        excelData = JSON.parse(saved);
        stats.totalCodes = excelData.length;
        saveStats();
    }
}

function saveExcelData() {
    localStorage.setItem('jekExcelData', JSON.stringify(excelData));
    stats.totalCodes = excelData.length;
    saveStats();
}

function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, {header: 1});
        parseExcelData(json, file.name);
        stats.uploadedFiles++;
        saveStats();
        logActivity(`Fayl yuklandi: ${file.name}`);
        saveExcelFile(file.name, json);
        loadExcelFiles();
        displayTrackingCodes();
        alert('Fayl muvaffaqiyatli yuklandi!');
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}

function parseExcelData(data, filename) {
    const type = filename.toLowerCase().includes('avia') ? 'Avia' : 'Avto';
    const flightNum = filename.match(/\d+/) ? filename.match(/\d+/)[0] : '1';
    const flight = `${type} ${flightNum}`;
    const price = type === 'Avia' ? settings.aviaPrice : settings.avtoPrice;

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[2]) {
            excelData.push({
                trackingCode: String(row[2]),
                receiptDate: row[1] || '',
                weight: parseFloat(row[6]) || 0,
                flight: flight,
                type: type,
                pricePerKg: price
            });
        }
    }
    saveExcelData();
}

function saveExcelFile(filename, data) {
    let files = JSON.parse(localStorage.getItem('jekExcelFiles') || '[]');
    files.push({filename, uploadDate: new Date().toISOString(), rowCount: data.length - 1});
    localStorage.setItem('jekExcelFiles', JSON.stringify(files));
}

function deleteFile(filename) {
    if (!confirm('Bu fayl va undagi barcha trek kodlarni o\'chirmoqchimisiz?')) return;
    let files = JSON.parse(localStorage.getItem('jekExcelFiles') || '[]');
    files = files.filter(f => f.filename !== filename);
    localStorage.setItem('jekExcelFiles', JSON.stringify(files));

    const type = filename.toLowerCase().includes('avia') ? 'Avia' : 'Avto';
    const flightNum = filename.match(/\d+/) ? filename.match(/\d+/)[0] : null;
    const flight = flightNum ? `${type} ${flightNum}` : null;

    if (flight) {
        const prev = excelData.length;
        excelData = excelData.filter(r => r.flight !== flight);
        saveExcelData();
        logActivity(`Fayl o'chirildi: ${filename} (${prev - excelData.length} kod o'chirildi)`);
    }
    stats.uploadedFiles = files.length;
    saveStats();
    loadExcelFiles();
    displayTrackingCodes();
}

function loadExcelFiles() {
    const files = JSON.parse(localStorage.getItem('jekExcelFiles') || '[]');
    const container = document.getElementById('fileList');
    if (files.length === 0) {
        container.innerHTML = '<p class="text-muted">Hali fayl yuklanmagan</p>';
        return;
    }
    container.innerHTML = files.map(f => `
        <div class="d-flex justify-content-between align-items-center p-3 border mb-2 rounded">
            <div>
                <strong>${f.filename}</strong><br>
                <small>${new Date(f.uploadDate).toLocaleString()} | ${f.rowCount} kod</small>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteFile('${f.filename}')">O'chirish</button>
        </div>
    `).join('');
}

// Tracking Code Management
function displayTrackingCodes() {
    const container = document.getElementById('trackingCodesList');
    const searchTerm = document.getElementById('codeSearch').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    
    let filtered = excelData;
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.trackingCode.toLowerCase().includes(searchTerm) ||
            item.flight.toLowerCase().includes(searchTerm)
        );
    }
    if (filterType !== 'all') {
        filtered = filtered.filter(item => item.type === filterType);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Trek kodlar topilmadi</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Trek Kod</th>
                        <th>Turi</th>
                        <th>Reys</th>
                        <th>Og'irlik (kg)</th>
                        <th>Sana</th>
                        <th>Narx ($/kg)</th>
                        <th>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map((item, idx) => `
                        <tr>
                            <td><strong>${item.trackingCode}</strong></td>
                            <td><span class="badge bg-${item.type === 'Avia' ? 'primary' : 'success'}">${item.type}</span></td>
                            <td>${item.flight}</td>
                            <td>${item.weight}</td>
                            <td>${item.receiptDate}</td>
                            <td>$${item.pricePerKg}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick="editCode(${excelData.indexOf(item)})">✏️</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCode(${excelData.indexOf(item)})">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function addNewCode() {
    const modal = new bootstrap.Modal(document.getElementById('codeModal'));
    document.getElementById('codeModalTitle').textContent = 'Yangi Trek Kod Qo\'shish';
    document.getElementById('codeForm').reset();
    currentEditIndex = null;
    modal.show();
}

function editCode(idx) {
    const item = excelData[idx];
    const modal = new bootstrap.Modal(document.getElementById('codeModal'));
    document.getElementById('codeModalTitle').textContent = 'Trek Kodni Tahrirlash';
    
    document.getElementById('editTrackingCode').value = item.trackingCode;
    document.getElementById('editType').value = item.type;
    document.getElementById('editFlight').value = item.flight;
    document.getElementById('editWeight').value = item.weight;
    document.getElementById('editReceiptDate').value = item.receiptDate;
    document.getElementById('editPricePerKg').value = item.pricePerKg;
    
    currentEditIndex = idx;
    modal.show();
}

function saveCode() {
    const trackingCode = document.getElementById('editTrackingCode').value.trim();
    const type = document.getElementById('editType').value;
    const flight = document.getElementById('editFlight').value.trim();
    const weight = parseFloat(document.getElementById('editWeight').value);
    const receiptDate = document.getElementById('editReceiptDate').value;
    const pricePerKg = parseFloat(document.getElementById('editPricePerKg').value);

    if (!trackingCode || !flight || isNaN(weight) || isNaN(pricePerKg)) {
        alert('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring!');
        return;
    }

    const codeData = { trackingCode, type, flight, weight, receiptDate, pricePerKg };

    if (currentEditIndex !== null) {
        excelData[currentEditIndex] = codeData;
        logActivity(`Trek kod tahrirlandi: ${trackingCode}`);
    } else {
        excelData.push(codeData);
        logActivity(`Yangi trek kod qo'shildi: ${trackingCode}`);
    }

    saveExcelData();
    displayTrackingCodes();
    bootstrap.Modal.getInstance(document.getElementById('codeModal')).hide();
}

function deleteCode(idx) {
    if (confirm('Bu trek kodni o\'chirmoqchimisiz?')) {
        const code = excelData[idx].trackingCode;
        excelData.splice(idx, 1);
        saveExcelData();
        displayTrackingCodes();
        logActivity(`Trek kod o'chirildi: ${code}`);
    }
}

function deleteAllCodes() {
    if (confirm('BARCHA trek kodlarni o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi!')) {
        if (confirm('Ishonchingiz komilmi? Barcha ma\'lumotlar yo\'qoladi!')) {
            excelData = [];
            saveExcelData();
            displayTrackingCodes();
            logActivity('Barcha trek kodlar o\'chirildi');
            alert('Barcha trek kodlar o\'chirildi!');
        }
    }
}

function exportCodesToExcel() {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trek Kodlar');
    XLSX.writeFile(wb, `JEK_KARGO_${new Date().toISOString().split('T')[0]}.xlsx`);
    logActivity('Trek kodlar Excel ga eksport qilindi');
}

// Settings
function saveSetting(name) {
    const val = parseFloat(document.getElementById(name).value);
    if (isNaN(val)) return alert('Raqam kiriting');
    settings[name] = val;
    localStorage.setItem('jekSettings', JSON.stringify(settings));
    logActivity(`${name} yangilandi: ${val}`);
    alert('Saqlandi!');

    excelData.forEach(item => {
        item.pricePerKg = item.type === 'Avia' ? settings.aviaPrice : settings.avtoPrice;
    });
    saveExcelData();
}

function resetSettings() {
    if (confirm('Barcha sozlamalarni asl holatiga qaytarmoqchimisiz?')) {
        settings = { dollarRate: 12200, aviaPrice: 9.5, avtoPrice: 6 };
        localStorage.setItem('jekSettings', JSON.stringify(settings));
        document.getElementById('dollarRate').value = settings.dollarRate;
        document.getElementById('aviaPrice').value = settings.aviaPrice;
        document.getElementById('avtoPrice').value = settings.avtoPrice;
        logActivity('Sozlamalar asl holatiga qaytarildi');
        alert('Sozlamalar qaytarildi!');
    }
}

function resetStats() {
    if (confirm('Barcha statistikani tozalamoqchimisiz?')) {
        stats = { visits: 0, searches: 0, uploadedFiles: excelData.length, totalCodes: excelData.length };
        saveStats();
        logActivity('Statistika tozalandi');
        alert('Statistika tozalandi!');
    }
}

// Admin Auth & Logout
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
        displayTrackingCodes();
        logActivity('Admin panelga kirdi');
    } else {
        alert('Noto\'g\'ri parol!');
    }
}

function logout() {
    document.getElementById('adminPanel').style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('nav').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    logActivity('Admin paneldan chiqdi');
}
