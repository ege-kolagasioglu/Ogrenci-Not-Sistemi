

// indeximizden çekiş yapıyoruz
const ogrenciAdiInput = document.getElementById('ogrenciAdi');
const ogrenciNoInput = document.getElementById('ogrenciNo');
const dersSecimiInput = document.getElementById('dersSecimi');
const vizeNotuInput = document.getElementById('vizeNotu');
const finalNotuInput = document.getElementById('finalNotu');
const ekleButon = document.getElementById('ekleButon');
const tabloGövdesi = document.getElementById('tabloGövdesi');
const ozetAlani = document.getElementById('ozetAlani');
const tumunuTemizleButon = document.getElementById('tumunuTemizleButon');
const karanlikModButon = document.getElementById('karanlikModButon');
const vizeOranInput = document.getElementById('vizeOran');
const finalOranInput = document.getElementById('finalOran');

//BAŞLAAAAAA

// localstorageden önceki notları falan filanı getiriyoruz yoksa boş getiriyoz
let notlarListesi = JSON.parse(localStorage.getItem('notlar')) || [];
let grafikNesnesi = null;

/**
 * site başladığında çalışacak ana fonksiyon
 */
window.onload = () => {
    karanlikModYukle();
    tabloCiz();
    grafikGuncelle();
    istatistikGuncelle();
};

/**
 * Vize oranı değiştikçe final oranını otomatik tamamlar
 */
vizeOranInput.addEventListener('input', () => {
    let v = parseInt(vizeOranInput.value) || 0;
    if (v > 100) v = 100;
    if (v < 0) v = 0;
    vizeOranInput.value = v;
    finalOranInput.value = 100 - v; // Toplam 100 olmalı eğer 100 den fazla girilirse izin vermiyorr
});

/**
 *  ayarlara göre vize ve finalin ortalamasını hesaplıyor
 */
function ortalamaBul(vize, final) {
    const vOran = (parseInt(vizeOranInput.value) || 40) / 100;
    const fOran = (parseInt(finalOranInput.value) || 60) / 100;
    return (vize * vOran + final * fOran).toFixed(2);
}

/**
 * Ortalamaya göre başarı harfini gönederir
 */
function harfNotuBul(ort) {
    if (ort >= 90) return 'AA';
    if (ort >= 85) return 'BA';
    if (ort >= 80) return 'BB';
    if (ort >= 75) return 'CB';
    if (ort >= 65) return 'CC';
    if (ort >= 58) return 'DC';
    if (ort >= 50) return 'DD';
    if (ort >= 40) return 'FD';
    return 'FF';
}

/**
 * Ders bazlı ortalamaları toplayıp grafiği yeniler
 */
function grafikGuncelle() {
    const canvas = document.getElementById('ortalamaGrafigi');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Verileri ders adlarına göre gruplandırıyoruz
    const dersGruplari = {};
    notlarListesi.forEach(n => {
        if (!dersGruplari[n.ders]) dersGruplari[n.ders] = [];
        dersGruplari[n.ders].push(parseFloat(n.ort));
    });

    const etiketler = Object.keys(dersGruplari);
    const ortalamalar = etiketler.map(d => {
        const toplam = dersGruplari[d].reduce((a, b) => a + b, 0);
        return (toplam / dersGruplari[d].length).toFixed(2);
    });

    // eğer eski bir grafik varsa silip yeniden oluşturuyoruz (Chart.js kuralı)
    if (grafikNesnesi) grafikNesnesi.destroy();

    grafikNesnesi = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiketler,
            datasets: [{
                label: 'Ders Genel Ortalaması',
                data: ortalamalar,
                backgroundColor: '#4CAF50',
                borderRadius: 5
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { 
                y: { beginAtZero: true, max: 100 } 
            }
        }
    });
}


function tabloCiz() {
    tabloGövdesi.innerHTML = '';
    
    // tablo boşsa
    if (notlarListesi.length === 0) {
        tabloGövdesi.innerHTML = `<tr><td colspan="9" class="bos-mesaj">Henüz not girişi yapılmadı.</td></tr>`;
        tumunuTemizleButon.style.display = 'none';
        return;
    }

    // Temizle butonu kontrolü 2 den fazla not olunca aktif olucak
    tumunuTemizleButon.style.display = (notlarListesi.length >= 2) ? 'block' : 'none';

    notlarListesi.forEach((n, i) => {
        const durum = n.ort >= 50 ? 'Geçti' : 'Kaldı';
        const cl = n.ort >= 50 ? 'gecti' : 'kaldi';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${n.no}</td>
            <td>${n.ad}</td>
            <td>${n.ders}</td>
            <td>${n.vize}</td>
            <td>${n.final}</td>
            <td>${n.ort}</td>
            <td><strong>${n.harf}</strong></td>
            <td class="${cl}">${durum}</td>
            <td><button onclick="tekilSil(${i})" title="Sil" style="color:var(--tehlike-rengi); cursor:pointer; background:none; border:none; font-weight:bold;">Sil</button></td>
        `;
        tabloGövdesi.appendChild(tr);
    });
}

/**
 * Genel geçme/kalma istatistiklerini hesaplar ve ekrana basar
 */
function istatistikGuncelle() {
    if (notlarListesi.length === 0) {
        ozetAlani.innerHTML = '';
        return;
    }

    const gecenler = notlarListesi.filter(n => n.ort >= 50).length;
    const kalanlar = notlarListesi.length - gecenler;
    const genelOrt = (notlarListesi.reduce((a, b) => a + parseFloat(b.ort), 0) / notlarListesi.length).toFixed(2);

    ozetAlani.innerHTML = `
        <div class="ozet-kart"><h4>Toplam Girilen not</h4><span>${notlarListesi.length}</span></div>
        <div class="ozet-kart"><h4 style="color:green">Geçilen ders Sayısı</h4><span>${gecenler}</span></div>
        <div class="ozet-kart"><h4 style="color:red">Kalınan ders Sayısı</h4><span>${kalanlar}</span></div>
        <div class="ozet-kart"><h4>Genel Başarı %</h4><span>%${((gecenler/notlarListesi.length)*100).toFixed(0)}</span></div>
    `;
}


//"Not Ekle" butonuna basıldığında verileri doğrular ve kaydeder
 
ekleButon.addEventListener('click', () => {
    const ad = ogrenciAdiInput.value.trim();
    const no = ogrenciNoInput.value.trim();
    const ders = dersSecimiInput.value;
    const vize = parseFloat(vizeNotuInput.value);
    const final = parseFloat(finalNotuInput.value);


    // Form Doğrulamaları
    if (!ad || !no || !ders || isNaN(vize) || isNaN(final)) {
        alert("Lütfen tüm alanları (ad, no, ders ve notlar) eksiksiz doldurun!");
        return;
    }
    if (no.length<9 )
    {
        alert("Lütfen Öğrenci numarasını düzgün gir");
        return;
    }

    // notlardan herhangi biri 0 ve 100 arasında girilmez ise uyarıyu
    if (vize < 0 || vize > 100 || final < 0 || final > 100) {
        alert("Notlar 0 ile 100 arasında olmalıdır!");
        return;
    }

    const ort = ortalamaBul(vize, final);
    const harf = harfNotuBul(parseFloat(ort));
    // dersten geçemeyenler için bol motivasyonlu bir mesaj
    if (ort<50)
    {
        alert(ders+"dersindeki ortalamanız "+ort+" biraz daha gayret etmelisin sana güvenmekteydimdide çünkü sen aklına koyduğun herşeyi başarırsın")
    }

    // verlileri dizimize ekliyoruz
    notlarListesi.push({ ad, no, ders, vize, final, ort, harf });
    localStorage.setItem('notlar', JSON.stringify(notlarListesi));
    
    // ekrana yeni verileri ekliyoruz
    tabloCiz();
    grafikGuncelle();
    istatistikGuncelle();
    
    // yazma yerlerini sıfırlıyoruz
    vizeNotuInput.value = '';
    finalNotuInput.value = '';
    vizeNotuInput.focus(); // Aynı kişiye not kolay girilsin diye vizeye geçiyor 
});


 //Belirli bir satırı listeden siler
 
function tekilSil(index) {
    if(confirm("Bu ders kaydını silmek istediğinize emin misiniz?")) {
        notlarListesi.splice(index, 1);
        localStorage.setItem('notlar', JSON.stringify(notlarListesi));
        tabloCiz();
        grafikGuncelle();
        istatistikGuncelle();
    }
}

/**
 * Tüm verileri sıfırlama
 */
tumunuTemizleButon.addEventListener('click', () => {
    if(confirm("DİKKAT: Tüm veriler kalıcı olarak silinecek. Emin misiniz?")) {
        notlarListesi = [];
        localStorage.removeItem('notlar');
        tabloCiz();
        grafikGuncelle();
        istatistikGuncelle();
    }
});

/**
 * Karanlık ve aydınlık modu geçişi baabbba
 */
karanlikModButon.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const aktif = document.body.classList.contains('dark-mode');
    localStorage.setItem('karanlikMod', aktif ? 'evet' : 'hayir');
    karanlikModButon.innerHTML = aktif ? 'Aydınlık Mod' : ' Karanlık Mod';
});

//sayfa yeniden açıldığına localstorageden en son hangi modda kaldığımıza bakıp açıyor
function karanlikModYukle() {
    if (localStorage.getItem('karanlikMod') === 'evet') {
        document.body.classList.add('dark-mode');
        karanlikModButon.innerHTML = ' Aydınlık Mod';
    }
}