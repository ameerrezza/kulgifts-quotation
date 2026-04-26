// STATE
let leads = JSON.parse(localStorage.getItem('kulgifts_leads')) || [];
let products = [{ 
    id: Date.now(), desc: '', details: '', qty: '', price: '',
    addPkg: false, addLogo: false, addCard: false 
}];

// INIT
document.addEventListener('DOMContentLoaded', () => {
    updateDates();
    renderProductBlocks();
    updatePreview();
    renderLeads();
    lucide.createIcons();
});

// MULTI-PRODUCT MANAGEMENT
function addProductBlock() {
    products.push({ id: Date.now(), desc: '', details: '', qty: '', price: '', addPkg: false, addLogo: false, addCard: false });
    renderProductBlocks();
    updatePreview();
}

function removeProductBlock(id) {
    if (products.length <= 1) return;
    products = products.filter(p => p.id !== id);
    renderProductBlocks();
    updatePreview();
}

function handleInput(id, field, value) {
    const p = products.find(p => p.id === id);
    if (p) {
        p[field] = value;
        updatePreview();
    }
}

function renderProductBlocks() {
    const container = document.getElementById('product-blocks-container');
    container.innerHTML = '';
    products.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'product-card-block';
        div.innerHTML = `
            <button type="button" class="remove-block-btn" onclick="removeProductBlock(${p.id})"><i data-lucide="x" style="width: 14px; height: 14px"></i></button>
            <div class="input-group">
                <label>Product Name ${index + 1}</label>
                <input type="text" value="${p.desc}" placeholder="e.g. Batik Totebag Reversible" oninput="handleInput(${p.id}, 'desc', this.value)">
            </div>
            <div class="input-group">
                <label>Description / Details</label>
                <textarea oninput="handleInput(${p.id}, 'details', this.value)">${p.details}</textarea>
            </div>
            <div class="grid-2">
                <div class="input-group">
                    <label>Quantity</label>
                    <input type="text" value="${p.qty}" placeholder="e.g. 100" oninput="handleInput(${p.id}, 'qty', this.value)">
                </div>
                <div class="input-group">
                    <label>Unit Price (RM)</label>
                    <input type="text" value="${p.price}" placeholder="e.g. 47" oninput="handleInput(${p.id}, 'price', this.value)">
                </div>
            </div>
            <div class="inner-addons">
                <label class="compact-check"><input type="checkbox" ${p.addPkg ? 'checked' : ''} onchange="handleInput(${p.id}, 'addPkg', this.checked)"><span class="check-name">Pkg (+RM5)</span></label>
                <label class="compact-check"><input type="checkbox" ${p.addLogo ? 'checked' : ''} onchange="handleInput(${p.id}, 'addLogo', this.checked)"><span class="check-name">Logo (+RM3)</span></label>
                <label class="compact-check"><input type="checkbox" ${p.addCard ? 'checked' : ''} onchange="handleInput(${p.id}, 'addCard', this.checked)"><span class="check-name">Card (+RM2)</span></label>
            </div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

// CALCULATION & PREVIEW
function updatePreview() {
    // 1. DATA FIX: Sender Info (Full address forced)
    const senderLoc = "G4, The Street Mall, Lingkaran Cyber Point Timur, Cyberjaya, 63000 Cyberjaya, Selangor";
    const senderPhone = "60182630390";
    const senderEmail = "kulgifts2u@gmail.com";
    
    const fromP = document.querySelector('.address-block:first-child');
    if (fromP) {
        fromP.innerHTML = `
            <label>FROM</label>
            <p><strong>${document.getElementById('fromName').value || 'KUL Gifts Team'}</strong></p>
            <p>${senderPhone}</p>
            <p>${senderEmail}</p>
            <p>${senderLoc}</p>
        `;
    }

    // 2. Client Info
    document.getElementById('p-client-name').textContent = document.getElementById('clientName').value || 'Client Name';
    document.getElementById('p-company-name').textContent = document.getElementById('companyName').value || 'Company Name';
    document.getElementById('p-phone').textContent = document.getElementById('phoneNumber').value || 'Phone Number';
    document.getElementById('p-email').textContent = document.getElementById('email').value || 'Email Address';
    document.getElementById('p-client-location').textContent = document.getElementById('clientLocation').value || 'Client Location';

    const pContainer = document.getElementById('p-items-container');
    let subtotal = 0;
    let totalQty = 0;
    pContainer.innerHTML = '';

    products.forEach((p, index) => {
        const qty = parseInt(p.qty) || 0;
        totalQty += qty;
        const price = parseFloat(p.price) || 0;
        const baseTotal = qty * price;
        
        let productAddonsTotal = 0;
        const activeAddonNames = [];
        if (p.addPkg) { productAddonsTotal += (5 * qty); activeAddonNames.push('Packaging (+RM5)'); }
        if (p.addLogo) { productAddonsTotal += (3 * qty); activeAddonNames.push('Logo Printing (+RM3)'); }
        if (p.addCard) { productAddonsTotal += (2 * qty); activeAddonNames.push('Custom Card (+RM2)'); }
        
        const lineTotal = baseTotal + productAddonsTotal;
        subtotal += lineTotal;

        const rowWrap = document.createElement('div');
        rowWrap.className = 'p-item-row-wrapper';
        rowWrap.innerHTML = `
            <div class="p-item-row">
                <div>
                    <div class="text-name">${index + 1}. ${p.desc || 'Product Name'}</div>
                    ${p.details ? `<div class="text-details">${p.details}</div>` : ''}
                    ${activeAddonNames.length > 0 ? `<div class="p-item-addons">${activeAddonNames.map(a => `<div class="p-item-addon-line">• ${a}</div>`).join('')}</div>` : ''}
                </div>
                <div class="text-center">${qty.toLocaleString()}</div>
                <div class="text-right">${formatRM(price)}</div>
                <div class="text-right"><strong>${formatRM(lineTotal)}</strong></div>
            </div>
            ${index < products.length - 1 ? `<div class="p-product-divider"></div>` : ''}
        `;
        pContainer.appendChild(rowWrap);
    });

    const ship = parseFloat(document.getElementById('shippingPrice').value) || 0;
    const finalTotal = subtotal + ship;
    
    // Conditional Deposit Logic
    const isBulk = totalQty >= 100;
    const deposit = finalTotal * 0.6;
    const balance = finalTotal * 0.4;

    document.getElementById('p-subtotal').textContent = formatRM(subtotal);
    document.getElementById('p-shipping').textContent = formatRM(ship);
    document.getElementById('p-total-amount').textContent = formatRM(finalTotal);
    
    // Toggle UI for Deposit
    const rowDeposit = document.getElementById('row-deposit');
    const rowBalance = document.getElementById('row-balance');
    const noteDeposit = document.getElementById('note-deposit');

    if (isBulk) {
        rowDeposit.style.display = 'flex';
        rowBalance.style.display = 'flex';
        noteDeposit.style.display = 'list-item';
        document.getElementById('p-deposit').textContent = formatRM(deposit);
        document.getElementById('p-balance').textContent = formatRM(balance);
    } else {
        rowDeposit.style.display = 'none';
        rowBalance.style.display = 'none';
        noteDeposit.style.display = 'none';
    }
}

function formatRM(val) { return 'RM ' + parseFloat(val).toLocaleString('en-MY', { minimumFractionDigits: 2 }); }

function updateDates() {
    const now = new Date(), v = new Date(); v.setDate(now.getDate() + 7);
    const opt = { day: '2-digit', month: 'short', year: 'numeric' };
    const id = 'KG-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('p-date-issued').textContent = now.toLocaleDateString('en-GB', opt);
    document.getElementById('p-valid-until').textContent = v.toLocaleDateString('en-GB', opt);
    document.getElementById('p-quote-id').textContent = id;
}

function sendWhatsApp() {
    const phoneInput = document.getElementById('phoneNumber').value;
    const clientName = document.getElementById('clientName').value || 'Client';
    const quoteId = document.getElementById('p-quote-id').textContent;
    const totalAmount = document.getElementById('p-total-amount').textContent;

    if (!phoneInput) {
        alert("Please enter client phone number");
        return;
    }

    // Clean phone number: remove non-digits, and ensure it's in 60X format if needed
    let cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '6' + cleanPhone;
    } else if (!cleanPhone.startsWith('60') && cleanPhone.length > 0) {
        cleanPhone = '60' + cleanPhone;
    }

    const message = `Hello ${clientName},\nHere is your quotation from KUL Gifts.\n\nQuote ID: ${quoteId}\nTotal Amount: ${totalAmount}\n\nLet me know if you’d like to proceed.`;
    
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
}
async function generatePDF() { 
    // 1. Force final update
    updatePreview();
    
    // 2. Prepare Dynamic Filename
    const originalTitle = document.title;
    const company = document.getElementById('companyName').value;
    const client = document.getElementById('clientName').value;
    const filenameSource = (company || client || 'Client').trim();
    
    // Set dynamic title (Browser uses this as default PDF filename)
    document.title = `KUL Gifts Quotation - ${filenameSource}`;

    // 3. Wait for fonts (Inter) to be ready to prevent fallback rendering
    try {
        await document.fonts.ready;
    } catch(e) {
        console.warn('Font loading timed out, proceeding anyway.');
    }
    
    // 4. Trigger Print
    window.print(); 

    // 5. Restore original title
    document.title = originalTitle;
}
function resetForm() { if (confirm('Reset tool?')) location.reload(); }
