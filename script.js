// Initialize Lucide Icons
lucide.createIcons();

// --- Navigation Logic ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');

    document.querySelectorAll('#desktop-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-indigo-900', 'text-white', 'shadow-lg');
    });
    
    const activeBtn = document.querySelector(`#desktop-nav button[data-tab="${tabId}"]`);
    if(activeBtn) {
        activeBtn.classList.add('active', 'bg-indigo-900', 'text-white', 'shadow-lg');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Mobile Menu Toggle ---
let isMenuOpen = false;
function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (isMenuOpen) {
        menu.classList.remove('hidden');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

// --- File Diagnostic UI ---
const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name-display');

if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = "Photo Loaded: " + e.target.files[0].name;
            fileNameDisplay.parentElement.classList.replace('bg-indigo-50', 'bg-green-50');
        } else {
            fileNameDisplay.textContent = 'Upload Installation/Wiring Photo';
            fileNameDisplay.parentElement.classList.replace('bg-green-50', 'bg-indigo-50');
        }
    });
}

// --- Report Form Google Sheets Integration ---
document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Sending to Database...";
    submitBtn.disabled = true;

    // Helper function to convert the image so Google Drive can read it
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });

    try {
        const file = document.getElementById('file-upload').files[0];
        let fileBase64 = "", mimeType = "", fileName = "";

        if (file) {
            fileBase64 = await toBase64(file);
            mimeType = file.type;
            fileName = file.name;
        }

        const payload = {
            fullName: form.fullName.value,
            email: form.email.value,
            category: form.category.value,
            description: form.description.value,
            fileBase64: fileBase64,
            mimeType: mimeType,
            fileName: fileName
        };

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!! PASTE YOUR COPIED GOOGLE WEB APP URL RIGHT BELOW  !!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbx3_4uK3TwwUWi25tUQdSa3XBWuh_GjBaAWoUVQo3pKkAiYQCJPsKwjbEkIJdnhjFcI/exec"; 

        // Send to Google Sheets (using no-cors to bypass strict browser blocking)
        await fetch(GOOGLE_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        // Success UI
        form.classList.add('hidden');
        document.getElementById('report-success').classList.remove('hidden');
        
        setTimeout(() => {
            form.classList.remove('hidden');
            document.getElementById('report-success').classList.add('hidden');
            form.reset();
            if(fileNameDisplay) {
                fileNameDisplay.textContent = 'Upload Installation/Wiring Photo';
                fileNameDisplay.parentElement.classList.replace('bg-green-50', 'bg-indigo-50');
            }
        }, 4000);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit report. Please check your internet connection.');
    } finally {
        submitBtn.textContent = "Submit for Technical Review";
        submitBtn.disabled = false;
    }
});

// --- Feedback Logic (UI Only) ---
let feedbacks = [
    { name: "Damith Silva", rating: 5, comment: "Krypton N Series switches look great in my new office. Very tactile.", date: "2024-03-21" }
];

function renderFeedbacks() {
    const container = document.getElementById('reviews-container');
    container.innerHTML = feedbacks.map(f => `
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-indigo-900">${f.name}</span>
                <span class="text-xs text-slate-400 font-mono">${f.date}</span>
            </div>
            <p class="text-slate-600 italic">"${f.comment}"</p>
        </div>
    `).join('');
}
renderFeedbacks();

document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    feedbacks.unshift({
        name: document.getElementById('feedback-name').value,
        comment: document.getElementById('feedback-comment').value,
        date: new Date().toISOString().split('T')[0]
    });
    renderFeedbacks();
    e.target.reset();
});