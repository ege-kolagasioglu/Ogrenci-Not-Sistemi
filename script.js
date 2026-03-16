// --- DOM Seçimleri ---
const userNameInput = document.getElementById('userName');
const studentIdInput = document.getElementById('studentId'); // Yeni eklendi
const courseNameInput = document.getElementById('courseName');
const vizeInput = document.getElementById('vize');
const finalInput = document.getElementById('final');
const addBtn = document.getElementById('addBtn');
const tableBody = document.getElementById('tableBody');
const clearAllBtn = document.getElementById('clearAllBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

// --- Veri Yönetimi ---
let gradesList = JSON.parse(localStorage.getItem('grades')) || [];

window.onload = () => {
    loadDarkModePreference();
    renderTable();
};

// --- Hesaplama Fonksiyonları ---
function calculateAverage(vize, final) {
    const average = (vize * 0.4) + (final * 0.6);
    return average.toFixed(2);
}

function getLetterGrade(average) {
    if (average >= 90) return 'AA';
    if (average >= 85) return 'BA';
    if (average >= 80) return 'BB';
    if (average >= 75) return 'CB';
    if (average >= 65) return 'CC';
    if (average >= 58) return 'DC';
    if (average >= 50) return 'DD';
    if (average >= 40) return 'FD';
    return 'FF';
}

// --- Ana İşlemler ---
function renderTable() {
    tableBody.innerHTML = ''; 

    gradesList.forEach((item, index) => {
        const durum = item.average >= 50 ? 'Geçti' : 'Kaldı';
        const durumClass = item.average >= 50 ? 'gecti' : 'kaldi'; 

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.studentId}</td>
            <td>${item.userName}</td>
            <td>${item.course}</td>
            <td>${item.vize}</td>
            <td>${item.final}</td>
            <td>${item.average}</td>
            <td><strong>${item.letterGrade}</strong></td>
            <td class="${durumClass}">${durum}</td>
            <td><button onclick="deleteGrade(${index})" style="background-color: var(--danger-color); color: white; padding: 5px 10px; border-radius: 4px; border: none; cursor: pointer;">Sil</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

addBtn.addEventListener('click', () => {
    const userName = userNameInput.value.trim();
    const studentId = studentIdInput.value.trim(); // Yeni eklendi
    const course = courseNameInput.value.trim();
    const vize = Number(vizeInput.value);
    const final = Number(finalInput.value);

    // Hata Kontrolleri
    if (!userName || !studentId) {
        alert("Lütfen öğrenci adı ve numarasını eksiksiz giriniz!");
        return;
    }
    if (!course || vizeInput.value === '' || finalInput.value === '') {
        alert("Lütfen ders adı, vize ve final notlarını eksiksiz girin.");
        return;
    }
    if (vize < 0 || vize > 100 || final < 0 || final > 100) {
        alert("Notlar 0 ile 100 arasında olmalıdır!");
        return;
    }

    const average = calculateAverage(vize, final);
    const letterGrade = getLetterGrade(average);

    if (average < 50) {
        alert(`Uyarı: ${course} dersi ortalamanız 50'nin altında (${average}). Biraz daha gayret etmelisiniz!`);
    }

    // Objeye numarayı ve ismi de dahil ettik
    const newGrade = {
        studentId: studentId,
        userName: userName,
        course: course,
        vize: vize,
        final: final,
        average: parseFloat(average),
        letterGrade: letterGrade
    };

    gradesList.push(newGrade);
    localStorage.setItem('grades', JSON.stringify(gradesList));
    renderTable();

    // Sadece ders notlarını temizleyelim, isim ve numara kalsın (seri giriş için)
    courseNameInput.value = '';
    vizeInput.value = '';
    finalInput.value = '';
});

function deleteGrade(index) {
    if(confirm("Bu dersi silmek istediğinize emin misiniz?")) {
        gradesList.splice(index, 1); 
        localStorage.setItem('grades', JSON.stringify(gradesList)); 
        renderTable(); 
    }
}

clearAllBtn.addEventListener('click', () => {
    if(confirm("Tüm not verileri silinecek! Onaylıyor musunuz?")) {
        gradesList = []; 
        localStorage.removeItem('grades'); 
        renderTable(); 
        userNameInput.value = ''; 
        studentIdInput.value = ''; // Numarayı da sıfırlayalım
    }
});

// --- Karanlık Mod ---
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        darkModeToggle.innerText = '☀️ Aydınlık Mod';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        darkModeToggle.innerText = '🌙 Karanlık Mod';
    }
});

function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerText = '☀️ Aydınlık Mod';
    }
}