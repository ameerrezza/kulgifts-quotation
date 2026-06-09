// AUTH
function checkPassword() {
    const p = "7777777";
    if (document.getElementById("passwordInput").value === p) {
        document.getElementById("authScreen").style.display = "none";
    } else { alert("Wrong password"); }
}
// Add Enter key support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('authScreen').style.display !== 'none') {
        checkPassword();
    }
});

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

// DOC TYPE HANDLING
function handleDocTypeChange() {
    const type = document.getElementById('documentType').value;
    
    // Toggle input fields
    document.getElementById('invoice-fields').style.display = type === 'invoice' ? 'block' : 'none';
    document.getElementById('receipt-fields').style.display = type === 'receipt' ? 'grid' : 'none';
    
    // Toggle preview rows
    document.getElementById('row-ref-quote').style.display = type === 'invoice' ? 'flex' : 'none';
    document.getElementById('row-ref-invoice').style.display = type === 'receipt' ? 'flex' : 'none';
    document.getElementById('row-payment-method').style.display = type === 'receipt' ? 'flex' : 'none';
    document.getElementById('row-valid-until').style.display = type === 'receipt' ? 'none' : 'flex';
    
    updateDocIdPrefix();
    updatePreview();
}

function updateDocIdPrefix() {
    const el = document.getElementById('p-quote-id');
    const currentId = el.textContent;
    const match = currentId.match(/\d{4}$/);
    const baseId = match ? match[0] : Math.floor(1000 + Math.random() * 9000);
    const type = document.getElementById('documentType') ? document.getElementById('documentType').value : 'quotation';
    const prefix = type === 'invoice' ? 'KG-I-' : (type === 'receipt' ? 'KG-R-' : 'KG-Q-');
    el.textContent = prefix + baseId;
}

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

    if(document.getElementById('refQuote')) document.getElementById('p-ref-quote').textContent = document.getElementById('refQuote').value || '-';
    if(document.getElementById('refInvoice')) document.getElementById('p-ref-invoice').textContent = document.getElementById('refInvoice').value || '-';
    if(document.getElementById('paymentMethod')) document.getElementById('p-payment-method').textContent = document.getElementById('paymentMethod').value || '-';

    const type = document.getElementById('documentType') ? document.getElementById('documentType').value : 'quotation';
    const titleEl = document.getElementById('p-doc-type-title');
    const lDocId = document.getElementById('l-doc-id');
    const lDateIssued = document.getElementById('l-date-issued');
    const lValidUntil = document.getElementById('l-valid-until');
    const notesList = document.getElementById('notes-list');

    if (titleEl && notesList) {
        if (type === 'quotation') {
            titleEl.textContent = 'QUOTATION';
            lDocId.textContent = 'Quote ID:';
            lDateIssued.textContent = 'Date Issued:';
            lValidUntil.textContent = 'Valid Until:';
            notesList.innerHTML = `
                <li>Quotation is valid for 7 days</li>
                <li>Production starts after confirmation</li>
                <li>Delivery timeline shared upon order</li>
                <li>Lalamove can be arranged by request</li>
                <li id="note-deposit" style="display: none;">60% deposit required to confirm order, remaining 40% upon completion</li>
            `;
        } else if (type === 'invoice') {
            titleEl.textContent = 'INVOICE';
            lDocId.textContent = 'Invoice No:';
            lDateIssued.textContent = 'Invoice Date:';
            lValidUntil.textContent = 'Payment Due:';
            notesList.innerHTML = `
                <li>Payment terms: Due upon receipt</li>
                <li>Please include Invoice No. as payment reference</li>
                <li>Delivery timeline shared upon order</li>
                <li>Lalamove can be arranged by request</li>
                <li id="note-deposit" style="display: none;">60% deposit required to confirm order, remaining 40% upon completion</li>
            `;
        } else if (type === 'receipt') {
            titleEl.textContent = 'RECEIPT';
            lDocId.textContent = 'Receipt No:';
            lDateIssued.textContent = 'Payment Date:';
            notesList.innerHTML = `
                <li>Payment received with thanks</li>
                <li>This is a computer-generated receipt. No signature required.</li>
                <li>Delivery timeline shared upon order</li>
                <li id="note-deposit" style="display: none;">60% deposit required to confirm order, remaining 40% upon completion</li>
            `;
        }
    }

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
    const type = document.getElementById('documentType') ? document.getElementById('documentType').value : 'quotation';
    const prefix = type === 'invoice' ? 'KG-I-' : (type === 'receipt' ? 'KG-R-' : 'KG-Q-');
    const id = prefix + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('p-date-issued').textContent = now.toLocaleDateString('en-GB', opt);
    document.getElementById('p-valid-until').textContent = v.toLocaleDateString('en-GB', opt);
    document.getElementById('p-quote-id').textContent = id;
}

async function triggerWebhook() {
    const quoteId = document.getElementById('p-quote-id').textContent;
    const clientName = document.getElementById('clientName').value || 'Client';
    const company = document.getElementById('companyName').value || '';
    const phone = document.getElementById('phoneNumber').value || '';
    const email = document.getElementById('email').value || '';
    const location = document.getElementById('clientLocation').value || '';

    // Financials
    const totalAmountStr = document.getElementById('p-total-amount').textContent;
    const totalAmount = parseFloat(totalAmountStr.replace(/[^\d.]/g, '')) || 0;

    // Product Summary & Addons
    let totalQuantity = 0;
    const descriptions = [];
    const addonsSet = new Set();

    products.forEach(p => {
        const qty = parseInt(p.qty) || 0;
        totalQuantity += qty;
        if (p.desc) descriptions.push(`${p.desc} (x${qty})`);
        if (p.addPkg) addonsSet.add('Packaging');
        if (p.addLogo) addonsSet.add('Logo Printing');
        if (p.addCard) addonsSet.add('Custom Card');
    });

    const productSummary = descriptions.join(', ');
    const addOns = Array.from(addonsSet).join(', ');

    try {
        fetch("https://hook.eu2.make.com/07lnkos0vfifxr0a82c8zlnv48gyq6td", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: clientName,
                company: company,
                phone: phone,
                email: email,
                location: location,
                product: productSummary,
                quantity: totalQuantity,
                addons: addOns,
                total: totalAmount,
                quoteId: quoteId,
                status: "NEW",
                priority: totalAmount >= 5000 ? "HIGH" : "MEDIUM",
                followUp: "",
                lastContacted: "",
                notes: "",
                date: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn('Webhook send failed', e);
    }
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

    // Trigger Webhook
    triggerWebhook();

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

    // 2. Trigger Webhook
    triggerWebhook();

    // 3. Prepare Dynamic Filename
    const originalTitle = document.title;
    const company = document.getElementById('companyName').value;
    const client = document.getElementById('clientName').value;
    const filenameSource = (company || client || 'Client').trim();

    // Set dynamic title (Browser uses this as default PDF filename)
    document.title = `KUL Gifts Quotation - ${filenameSource}`;

    // 4. Wait for fonts (Inter) to be ready to prevent fallback rendering
    try {
        await document.fonts.ready;
    } catch (e) {
        console.warn('Font loading timed out, proceeding anyway.');
    }

    // 5. Trigger Print
    window.print();

    // 6. Restore original title
    document.title = originalTitle;
}

function resetForm() {
    if (!confirm('Reset tool? All data will be cleared.')) return;

    // 1. Clear text inputs and textareas (except password)
    document.querySelectorAll("input, textarea").forEach(el => {
        if (el.id !== "passwordInput" && el.type !== "button" && el.type !== "submit") {
            el.value = "";
        }
    });

    // 2. Reset product state to 1 empty product
    products = [{ 
        id: Date.now(), desc: '', details: '', qty: '', price: '',
        addPkg: false, addLogo: false, addCard: false 
    }];

    // 3. Refresh UI
    updateDates(); // Generate new Quote ID & Current Dates
    renderProductBlocks();
    updatePreview();
}
