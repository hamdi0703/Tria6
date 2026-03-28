# Tria App - Kapsamlı Test Yönergeleri

Bu belge, Tria uygulamasının genel işleyişini, profil yönetimini, koleksiyon (liste) oluşturma ve paylaşma özelliklerini, oyunları ve SEO uyumluluğunu masaüstü ortamında test etmeniz için hazırlanmış detaylı bir kılavuzdur.

Testleri gerçekleştirirken beklenen sonuçları ve dikkat etmeniz gereken noktaları her adımın altında bulabilirsiniz.

---

## 1. Genel Yükleme ve SEO Kontrolleri

### Adım 1.1: Ana Sayfa Yüklenmesi ve Meta Etiketleri
**İşlem:** Uygulamayı tarayıcınızda açın (örn. `http://localhost:5173/` veya canlı URL). Tarayıcının "İncele" (Inspect) aracını açarak `<head>` bölümüne bakın.
**Beklenen Sonuç:**
- `title` etiketinin başlangıçta `Tria | Keşfet` olması.
- `<meta name="description">`, `og:title`, `og:image`, `twitter:card` vb. SEO etiketlerinin mevcut ve dolu olması.
- Sayfada konsol hatası (kırmızı metinler) olmaması.

### Adım 1.2: Dinamik Başlık (Title) Değişimi
**İşlem:** Menüden farklı sayfalara (Koleksiyonum, Profil, Oyunlar vb.) gidin ve bir filmin/dizinin detay sayfasına tıklayın.
**Beklenen Sonuç:**
- Tarayıcı sekmesindeki başlıkların sayfa bağlamına göre değişmesi. (Örn. Profil için `@kullaniciadi | Tria`, bir film seçildiğinde `Film Adı | Tria`).

---

## 2. Kimlik Doğrulama ve Profil Yönetimi

### Adım 2.1: Kayıt Olma / Giriş Yapma
**İşlem:**
1. Sağ üst köşedeki veya "Koleksiyonum" sayfasındaki "Giriş Yap / Kayıt Ol" butonuna tıklayın.
2. Yeni bir e-posta ve şifre ile kayıt olun (veya mevcut hesapla giriş yapın).
**Beklenen Sonuç:**
- Modal sorunsuz açılıp kapanmalı.
- Başarılı girişten sonra sağ üstte avatarınız görünmeli.
- Hatalı şifre/email durumlarında uygun uyarı mesajı (toast) çıkmalı.

### Adım 2.2: Profil Modal - Profil Düzenleme
**İşlem:**
1. Avatarınıza tıklayarak "Profil"i açın.
2. Sol menüden "Profil Düzenle" (PROFILE) sekmesinde olduğunuzdan emin olun.
3. Kullanıcı adınızı, web sitenizi ve biyografinizi değiştirin.
4. "Avatar Seçimi" kısmından farklı bir avatar karakteri seçin ve "Değişiklikleri Kaydet"e tıklayın.
**Beklenen Sonuç:**
- "Profil ayarları kaydedildi" bildirimi gelmeli.
- Sol üstteki ve ana header'daki avatarınız seçtiğiniz yeni avatar ile güncellenmeli.

### Adım 2.3: Profil Modal - Güvenlik ve Gizlilik
**İşlem:**
1. Profil modaldan "Gizlilik & Güvenlik" (SECURITY) sekmesine geçin.
2. "Herkese Açık Profil" anahtarını (toggle) kapatıp "Gizlilik Ayarını Güncelle"ye tıklayın.
3. Şifre değiştirme bölümünden yeni bir şifre (en az 6 karakter) belirleyip onaylayın.
**Beklenen Sonuç:**
- Profil gizlilik durumunun kaydedildiğine dair başarı bildirimi almalısınız.
- Şifreler eşleşmezse veya 6 karakterden kısaysa uyarı vermeli.

### Adım 2.4: Profil Modal - Tercihler ve Veri Yönetimi
**İşlem:**
1. "Uygulama Tercihleri" (APP_PREFS) sekmesinden Aydınlık/Karanlık modlar arası geçiş yapın.
2. "Veri Yönetimi" (DATA_ZONE) sekmesinden "Verilerimi İndir (JSON)" butonuna tıklayın.
**Beklenen Sonuç:**
- Tema değişikliği tüm uygulamada anında yansımalı.
- `tria-backup-[username].json` adında, içeriklerinizi kapsayan bir dosya bilgisayarınıza inmeli.

---

## 3. Koleksiyon (Liste) Yönetimi ve Paylaşım

### Adım 3.1: Yeni Liste Oluşturma
**İşlem:**
1. Alt menüden veya header'dan "Koleksiyonum" (Dashboard) sayfasına gidin.
2. "Yeni Liste Oluştur" veya benzeri butona tıklayın.
3. Liste adını, açıklamasını girin ve görünürlüğünü "Herkese Açık" (Public) olarak seçin.
**Beklenen Sonuç:**
- Liste başarıyla oluşturulmalı ve listeleriniz arasında görünmeli.

### Adım 3.2: Listeye İçerik Ekleme ve Çıkarma
**İşlem:**
1. "Keşfet" (Explore) sayfasında veya arama çubuğunu kullanarak birkaç film veya dizi bulun.
2. İçerik kartının üzerindeki "+" ikonuna veya detay sayfasındaki koleksiyona ekle butonuna tıklayın.
3. Az önce oluşturduğunuz listeyi seçin.
4. İşlemi geri almak için aynı butona tekrar tıklayarak içeriği listeden çıkarın.
**Beklenen Sonuç:**
- İçerik başarıyla listeye eklenmeli, arayüzde (buton rengi veya ikonu ile) eklendiği belli olmalı.
- Çıkarma işleminden sonra arayüz eski haline dönmeli.

### Adım 3.3: Tria Passport ve Profil Paylaşımı
**İşlem:**
1. Profil sayfanıza (`/profile/:username` görünümü veya Paylaş modülü) gidin.
2. **Tria Passport** kartının render edildiğini, istatistiklerinizin (izlenen, listeler vb.) ve seçtiğiniz en sevdiğiniz 4 filmin (varsa) kart üzerinde göründüğünü teyit edin.
3. Header'daki Paylaş (Share) ikonuna tıklayın.
4. Açılan "Paylaşım Merkezi" modalında "Profilini Paylaş" kısmından "Bağlantıyı Kopyala"ya tıklayın.
5. Kopyalanan bağlantıyı yeni bir gizli sekmede (incognito) açın.
**Beklenen Sonuç:**
- Tria Passport doğru verilerle ve efektlerle (seviye/tier bazlı parlama) görünmeli.
- Gizli sekmede (üye girişi yapılmamış olsa bile) profilinizin herkese açık versiyonu (`TriaPassport` dahil) görülebilmeli. *(Not: Profil "Gizli" moddaysa görülmemeli veya boş dönmeli.)*

### Adım 3.4: Liste Paylaşımı
**İşlem:**
1. "Paylaşım Merkezi" modalında "Liste Paylaş" bölümünden az önce oluşturduğunuz "Herkese Açık" listeyi seçip "Kopyala"ya tıklayın.
2. Kopyalanan bağlantıyı (`/shared?token=...`) yeni bir gizli sekmede açın.
**Beklenen Sonuç:**
- Listenizin adı, açıklaması ve içindeki filmler/diziler başarılı bir şekilde yüklenmeli.
- Misafir kullanıcı, listeden film detaylarına tıklayabilmeli ancak düzenleme/silme yapamamalıdır.

---

## 4. Oyunlar (Game Hub) Testleri

### Adım 4.1: Game Hub Modal ve Gezinme
**İşlem:**
1. Keşfet sayfasındaki veya menüdeki Oyunlar (Game Hub) ikonuna tıklayın.
2. Açılan modalda 3 oyunun (CineMatch, Frame Focus, CineRoulette) listelendiğini görün.

### Adım 4.2: Frame Focus
**İşlem:**
1. Game Hub'dan "Frame Focus" oyununu seçin.
2. Oyun başladığında resmin bulanık (blur effect) olduğunu teyit edin.
3. Kalan sürenin (timer) çalıştığını gözlemleyin.
4. Görüntüyü tahmin edip doğru veya yanlış bir cevap seçin.
**Beklenen Sonuç:**
- Canvas üzerinde "Blur" efekti düzgün çalışmalı.
- Süre akmalı.
- Doğru cevapta sistem "CORRECT" sesini, yanlışta "WRONG" sesini (ses açık ise) oynatmalı ve doğru animasyon (Ding/Buzz efektleri) gösterilmeli.
- Oyun bittiğinde puan (Süre + Zorluk hesabı üzerinden) gösterilmeli.

### Adım 4.3: CineRoulette
**İşlem:**
1. Game Hub'dan "CineRoulette" oyununu seçin.
2. Çarkı (Kasa) çevirerek rastgele bir film gelmesini sağlayın.
**Beklenen Sonuç:**
- Mekanik "TICK" sesleriyle animasyonlu bir geçiş olmalı.
- Sonunda gelen filme ait detaylar (başlık, afiş) yüklenmeli ve tıklanarak detay sayfasına gidilebilmeli.

### Adım 4.4: CineMatch
**İşlem:**
1. Game Hub'dan "CineMatch" oyununu seçin.
2. Ekrana gelen filmleri sağa (beğen) veya sola (geç) kaydırarak eşleşme mekaniğini deneyin.
**Beklenen Sonuç:**
- Kartlar sorunsuz bir şekilde kaydırılabilmeli (Tinder tarzı swipe mekaniği).
- Beğenilen filmler ilgili listeye/diziye aktarılmalı.

---

## 5. Film / Dizi Detay Görünümü

### Adım 5.1: İçerik Yüklenmesi
**İşlem:** Herhangi bir film veya dizi kartına tıklayın.
**Beklenen Sonuç:**
- Sayfa en üste otomatik kaydırılmalı (scroll to top).
- Hero section (Arka plan afişi), özet, oyuncu kadrosu, incelemeler (Review Section) ve sağ taraftaki meta bilgiler (Durum, Yönetmen/Yaratıcı, Ülke bayrakları) eksiksiz yüklenmeli.
- Eğer içerik "Dizi" ise, sezon/bölüm sayısı (TvStats bileşeni) düzgün görünmeli.

---

## 6. Hata ve İstisna Yönetimi

### Adım 6.1: Olmayan Sayfaya Gitme
**İşlem:** Geçersiz bir URL'ye veya silinmiş bir liste/kullanıcı sayfasına erişmeyi deneyin.
**Beklenen Sonuç:**
- `NotFoundView` (404 Sayfası) veya uygun bir hata durumu ("İçerik Yüklenemedi") gösterilmeli ve kullanıcıya "Geri Dön" seçeneği sunulmalı.

### Adım 6.2: Arama (Search)
**İşlem:** Header'daki arama ikonuna tıklayın ve anlamsız karakterler (örn: `asdasfasf`) yazın.
**Beklenen Sonuç:**
- Arama sonuçlanmalı ve "Sonuç bulunamadı" mesajı düzgünce gösterilmeli. Uygulama çökmemeli.

---
**Test Notu:** Bu uygulamanın çoğu özelliği client-side state ve Supabase veritabanı ile eşzamanlı çalışmaktadır. Herhangi bir noktada veri tutarsızlığı görürseniz `Profil > Veri Yönetimi > Önbelleği Temizle` seçeneğini kullanarak yerel verilerinizi sıfırlayıp tekrar test edebilirsiniz.
