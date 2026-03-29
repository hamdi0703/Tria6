# Tria App - Kapsamlı Test ve Canlıya Alım (Pre-Launch) Kılavuzu

Bu belge, Tria uygulamasının hatasız çalıştığından, performans sorunları olmadığından ve kullanıcılara sunulmaya (production) hazır olduğundan emin olmanız için hazırlanmış **çok detaylı, adım adım** bir test rehberidir.

Bu testleri yaparken tarayıcınızın **Geliştirici Araçları**'nı (Developer Tools -> `F12` veya `Sağ Tık > İncele`) sürekli açık tutmanız; özellikle **Console (Konsol)** ve **Network (Ağ)** sekmelerini takip etmeniz uygulamanın arka planında her şeyin yolunda olduğunu anlamanız için kritiktir.

---

## 1. İlk Yükleme, Genel Performans ve SEO Kontrolleri

Sistemin ilk yüklendiği andaki davranışını ve arama motorları için doğru hazırlandığını kontrol edeceğiz.

### Adım 1.1: Uygulamanın Başlatılması ve Temel Hata Kontrolü
**Nasıl Yapılır:**
1. Uygulamanızı başlatın (örn. `npm run dev` veya Vercel bağlantınız).
2. Tarayıcıda sayfayı açmadan önce Geliştirici Araçlarını (F12) açın.
3. Sayfayı yenileyin (`F5` veya `Ctrl+R`).

**Neyi Kontrol Etmelisiniz (Konsol/Ağ):**
- **Console Sekmesi:** Kırmızı renkli *hiçbir* "Error" olmamalıdır. (Sarı uyarılar -Warning- React veya üçüncü parti kütüphanelerden gelebilir, şimdilik kabul edilebilir). "Uncaught ReferenceError", "Failed to fetch" gibi kritik hatalar kesinlikle olmamalıdır.
- **Network Sekmesi:** `index.html`, `.js` ve `.css` dosyalarının yükleme durumları (Status) `200 OK` veya `304 Not Modified` olmalıdır. Kırmızı renkli başarısız (`404` veya `500`) bir ağ isteği olmamalıdır.

### Adım 1.2: SEO Meta Etiketleri ve Dinamik Sayfa Başlıkları
**Nasıl Yapılır:**
1. Ana sayfadayken tarayıcı sekmesinin üstündeki yazıya bakın (Title).
2. Geliştirici araçlarında `Elements` (Öğeler) sekmesine gelin, `<head>` etiketini genişletin.
3. Sırasıyla menüden "Koleksiyonum", "Profil" sayfalarına ve ardından herhangi bir filmin detay sayfasına tıklayın.

**Neyi Kontrol Etmelisiniz:**
- `<head>` içinde `<meta name="description" content="...">` dolu ve anlamlı mı?
- `<meta property="og:title">`, `og:image` gibi sosyal medya paylaşım (Open Graph) etiketleri mevcut mu?
- Ana sayfadayken Title `Tria | Keşfet` olmalı.
- Bir film seçtiğinizde sekme adı `Oppenheimer | Tria` (veya filmin adı neyse) olarak *anında* değişmeli.
- Profilinize girdiğinizde Title `@kullaniciadiniz | Tria` olarak güncellenmeli.

---

## 2. Kullanıcı Kaydı, Giriş ve Kimlik Doğrulama (Auth)

Kullanıcıların sisteme giriş çıkış yaparken takılmadığından emin olmalıyız. Bu süreç Supabase ile haberleştiği için Network ağını izlemek çok önemlidir.

### Adım 2.1: Yeni Üye Kaydı (Sign Up)
**Nasıl Yapılır:**
1. Sağ üstten veya "Koleksiyonum" boş durum ekranından "Giriş Yap / Kayıt Ol" butonuna basın. Modal açılacaktır.
2. Formda daha önce sisteme kaydedilmemiş **yeni** bir e-posta ve şifre girin.
3. Kayıt butonuna basın.

**Neyi Kontrol Etmelisiniz (Konsol/Ağ):**
- **Network Sekmesi:** Supabase Auth servisine (örn: `auth/v1/signup`) bir `POST` isteği gitmeli. Dönüş kodu `200 OK` olmalıdır.
- **Arayüz:** "Kayıt başarılı, giriş yapıldı" (veya e-posta onayı gerektiriyorsa "E-postanızı kontrol edin") toast (bildirim) mesajı çıkmalı.
- Sayfa yenilenmesine gerek kalmadan sağ üstte kullanıcı ikonunuz/avatarınız belirmelidir.

### Adım 2.2: Hatalı Giriş ve Validation (Doğrulama) Testi
**Nasıl Yapılır:**
1. Hesaptan çıkış yapın (Avatar > Oturumu Kapat).
2. Giriş yap ekranını açın.
3. Şifreyi eksik (örn: 2 karakter) veya yanlış girin.

**Neyi Kontrol Etmelisiniz:**
- Şifrenin en az 6 karakter olması gerektiğine dair form uyarısı çıkmalı.
- Yanlış şifre denemesinde **Console**'da uygulama çökmemeli; sadece arayüzde kırmızı bir bildirim (Toast) belirmeli ("Invalid login credentials" vs.).

---

## 3. Profil Düzenleme, Güvenlik ve Veri Yönetimi

Profil bölümü, kullanıcının hem uygulamanın veritabanını (Supabase `profiles` tablosu) hem de uygulamanın görünümünü kontrol ettiği yerdir.

### Adım 3.1: Profil Bilgileri ve Avatar Güncelleme
**Nasıl Yapılır:**
1. Giriş yapmış durumdayken avatarınıza tıklayıp "Profil"i açın.
2. "Profil Düzenle" (PROFILE) sekmesinde Kullanıcı Adı, Web Sitesi ve Biyografi alanlarını doldurun.
3. Avatar Seçimi galerisinden farklı bir karakter (örn. "Neon Ninja") seçin.
4. "Değişiklikleri Kaydet" butonuna tıklayın.

**Neyi Kontrol Etmelisiniz:**
- **Network Sekmesi:** Supabase'in `profiles` veya `users` tablosuna bir `PATCH` veya `UPDATE` isteği gitmeli. İşlem `204 No Content` veya `200 OK` dönmeli.
- **Arayüz:** Kaydetme işlemi sırasında buton "Kaydediliyor..." durumuna geçmeli. İşlem bitince başarı bildirimi gelmeli.
- Modal'ı kapatın. Ana ekrandaki üst menüde (Header) avatarınızın az önce seçtiğiniz karakterle değiştiğini doğrulayın.

### Adım 3.2: Uygulama Tercihleri (Tema Değişimi)
**Nasıl Yapılır:**
1. Profil modaldan "Uygulama Tercihleri" sekmesine gelin.
2. "Aydınlık Mod" (Light) ve "Karanlık Mod" (Dark) arasında geçiş yapın.

**Neyi Kontrol Etmelisiniz:**
- Tema değişikliği *sayfa yenilenmeden* anında tüm sisteme (arka planlar, metin renkleri) yansımalı.

### Adım 3.3: Kullanıcı Verilerini İndirme (GDPR Uyumluluğu)
**Nasıl Yapılır:**
1. Profil modaldan "Veri Yönetimi" (DATA_ZONE) sekmesine gelin.
2. "Verilerimi İndir (JSON)" butonuna tıklayın.

**Neyi Kontrol Etmelisiniz:**
- Bilgisayarınıza `tria-backup-KULLANICIADI.json` formatında bir dosya inmeli.
- Dosyayı bir metin editöründe açın. İçerisinde oluşturduğunuz koleksiyonların, profil verilerinizin ve (varsa) yazdığınız yorumların JSON formatında, temiz ve eksiksiz olarak bulunduğunu teyit edin. Eğer "undefined" veya "null" fırlatan bir data yapısı varsa, bu bir hatadır.

---

## 4. Keşfet, Arama ve Filtreleme İşlevleri (Explore)

Ana sayfadaki verilerin TMDB'den doğru ve hızlı çekildiğini, arama motorunun düzgün çalıştığını kontrol edeceğiz.

### Adım 4.1: Sonsuz Kaydırma (Infinite Scroll) veya Sayfalamayı Test Etme
**Nasıl Yapılır:**
1. "Keşfet" sekmesinde yer alan "Popüler / Trendler" listesinde aşağıya doğru kaydırın (veya "Daha Fazla Yükle" butonuna basın).

**Neyi Kontrol Etmelisiniz:**
- Yeni içerikler yüklenirken arayüzde kısa süreliğine bir "Yükleniyor (Skeleton)" animasyonu görünmeli.
- **Network Sekmesi:** TMDB API'sine `page=2`, `page=3` parametreleriyle yeni istekler (`GET /discover/movie` vb.) atılmalı.
- Sayfa takılmamalı veya içerikler üst üste binmemelidir. Aynı film iki kere gösterilmemelidir (Duplicate key hatası olmamalı).

### Adım 4.2: Arama (Search) Doğruluğu ve Hata Toleransı
**Nasıl Yapılır:**
1. Üst menüdeki Büyüteç ikonuna tıklayın.
2. Arama çubuğuna popüler bir film yazın (örn. `Matrix`). Sonuçları gözlemleyin.
3. Arama çubuğunu temizleyip anlamsız bir metin yazın (örn. `qweqwe123asd`).

**Neyi Kontrol Etmelisiniz:**
- Matrix aramasında saniyeler içinde doğru sonuçlar listelenmeli.
- Anlamsız aramada sayfa çökmek veya beyaz ekrana düşmek yerine, ortada şık bir tasarımla "Sonuç bulunamadı" veya "Aramanıza uygun içerik yok" benzeri bir boş durum (Empty State) mesajı göstermelidir.
- **Console Sekmesi:** Aramalar esnasında API rate-limit (Çok fazla istek) `429 Too Many Requests` hatası almadığınızdan emin olun (Arama barında *debounce* yani yazmayı bitirmeyi bekleme özelliği olmalıdır).

### Adım 4.3: Filtre Barı (Filter Bar) Çalışıyor Mu?
**Nasıl Yapılır:**
1. Keşfet sayfasındaki film türlerini (Aksiyon, Komedi, Bilim Kurgu vb.) seçin.
2. Diziler (TV) ve Filmler (Movie) sekmeleri arasında geçiş yapın.

**Neyi Kontrol Etmelisiniz:**
- Örneğin "Bilim Kurgu" seçtiğinizde sayfa sadece bilim kurgu içerikleriyle yenilenmeli.
- TMDB API isteğinde `with_genres` parametresi doğru gitmelidir (Ağ sekmesinden incelenebilir).

---

## 5. Film / Dizi Detay Sayfası ve İnceleme (Review) Sistemi

Bir içeriğin tüm detaylarının eksiksiz geldiğinden ve etkileşim kurulabildiğinden emin olmalıyız.

### Adım 5.1: Detay Sayfası Yükleme Performansı
**Nasıl Yapılır:**
1. Listeden herhangi bir filme tıklayın.

**Neyi Kontrol Etmelisiniz:**
- **Çok Önemli:** Sayfa en aşağıda kalmamalı, film detayına girildiğinde otomatik olarak **sayfanın en üstüne** kaydırılmış (scroll to top) olarak açılmalıdır.
- Arka planda büyük poster (Hero image), cast (oyuncular) listesi, özet, yayın yılı, durum (Devam Ediyor, İptal vs.) alanlarının tümü dolu olmalıdır. Veri eksikse (örn: özet yoksa) boş kalmamalı, "Bu içerik için özet bulunmamaktadır" tarzında yedek bir metin göstermelidir.

### Adım 5.2: İnceleme ve Puanlama Ekleme (Review Section)
**Nasıl Yapılır:**
1. Film detay sayfasında aşağı kaydırarak "İncelemeler" (Reviews) bölümünü bulun.
2. 5 yıldız üzerinden bir puan verin ve bir yorum yazarak "Gönder" deyin.

**Neyi Kontrol Etmelisiniz:**
- Yorum gönderildikten sonra sayfa yenilenmeden yorumunuz hemen listede (tercihen en üstte) belirmelidir.
- **Console Sekmesi:** React tarafında bir "key" uyarısı (Each child in a list should have a unique "key" prop) vermediğinden emin olun.
- Profil > Veri Yönetimi kısmından JSON verinizi indirdiğinizde yazdığınız bu yorum o dosyanın içinde yer almalıdır.

---

## 6. Koleksiyon ve Paylaşım Mekanikleri (En Kritik Testler)

Koleksiyon yönetimi Tria'nın kalbidir. Veritabanı işlemleri (CRUD) sorunsuz olmalıdır.

### Adım 6.1: Liste Oluşturma, İçerik Ekleme ve Silme Akışı
**Nasıl Yapılır:**
1. "Koleksiyonum" (Dashboard) sayfasına gidin.
2. "Yeni Liste Oluştur" butonuna tıklayıp, "Favori Klasiklerim" adında, durumu **"Herkese Açık"** olan bir liste oluşturun.
3. Geri dönüp "Keşfet" sayfasından 3 farklı filmin üzerindeki `+` ikonuna tıklayıp, açılan modalda bu listeyi seçin.
4. "Koleksiyonum" sayfasına geri dönün. Listenin içine (veya ayarlarına) girip eklediğiniz filmlerden birini listeden silin (veya `+` ikonuna tekrar tıklayarak tiki kaldırın).

**Neyi Kontrol Etmelisiniz:**
- **Ağ Sekmesi:** `user_collections` tablosuna INSERT ve `collection_items` tablosuna INSERT / DELETE isteklerinin başarıyla (200/201) tamamlandığını izleyin.
- Film listeye eklendiğinde, aynı filme detay sayfasından tekrar baktığınızda "Listeye Eklendi" (veya tikli buton) olarak güncel halini göstermelidir. Sayfayı F5 ile yenilediğinizde de bu bilgi (State) korunmalıdır.
- Sildiğiniz film anında listeden kaybolmalıdır.

### Adım 6.2: Tria Passport ve Link Paylaşımı (Share Token Sistemi)
**Nasıl Yapılır:**
1. Üst menüdeki "Paylaş" ikonuna (veya profilden paylaş butonuna) tıklayarak "Paylaşım Merkezi"ni açın.
2. "Liste Paylaş" bölümünden az önce oluşturduğunuz "Favori Klasiklerim" listesini seçin ve kopyala deyin. (Bağlantı `https://.../shared?token=ABC123XYZ` formatında kopyalanacaktır).
3. Tarayıcınızda **Gizli Sekme (Incognito)** açın ve bu kopyaladığınız linki yapıştırın.

**Neyi Kontrol Etmelisiniz (Çok Önemli - Güvenlik & İşlevsellik Testi):**
- Gizli sekmede (siz oturum açmamış olsanız bile) listenin içindeki 2 filmin ve listenin adının sorunsuz yüklendiğini görün.
- **Güvenlik Kontrolü:** Gizli sekmedeki misafir kullanıcı profilinde veya listedeki filmlerde **"Sil", "Düzenle" gibi butonları kesinlikle görmemelidir.** Sadece izleme (Read-only) modunda olmalıdır.
- Liste gizlilik ayarlarından "Sadece Ben" (Private) yapılıp tekrar aynı gizli sekme linkine gidildiğinde sayfa yüklenmemeli; "Liste bulunamadı veya gizli" hatası vermelidir.

---

## 7. Game Hub (Oyunlar) Sistemi

Oyunlardaki performans ve state (durum) yönetimi tarayıcıyı yorabilecek (Canvas/Audio) işlemler içerir.

### Adım 7.1: Frame Focus - Performans ve Canvas Testi
**Nasıl Yapılır:**
1. Menüden Oyunlar'ı açıp "Frame Focus"u başlatın.
2. Oyun sırasında ekrandaki resmin kademeli olarak netleştiğini izleyin.
3. Kalan süre bitene kadar bekleyin (Bile bile yanlış yapın/zamanı doldurun).

**Neyi Kontrol Etmelisiniz:**
- **Konsol:** Görüntü bulanıklaştırma işlemi (Canvas render) sırasında konsolda memory leak (bellek sızıntısı) uyarıları çıkmamalı.
- Ses efektlerinin ("Tick", Süre bittiğinde "Game Over" sesi) çalıştığını doğrulayın (Tarayıcınızın sekme sesinin açık olduğundan emin olun).
- Puan hesaplaması sıfırın altına (negatif) düşmemelidir.

### Adım 7.2: CineRoulette
**Nasıl Yapılır:**
1. Oyunlar menüsünden CineRoulette'i açın.
2. Çarkı art arda, animasyonun bitmesini beklemeden 3-4 kez hızlıca "Çevir" butonuna basarak zorlayın (Spam Testi).

**Neyi Kontrol Etmelisiniz:**
- Animasyonlar çakışmamalı, sistem çökmek yerine son isteği dikkate alarak veya butonun basılmasını engelleyerek (Disabled state) süreci kontrol altında tutmalıdır.
- Sonuçlanan film tıklandığında doğru detay sayfasına (`/movie/ID` veya `/tv/ID`) yönlendirilmelidir.

### Adım 7.3: CineMatch
**Nasıl Yapılır:**
1. Oyunlar menüsünden CineMatch'i açın.
2. Kartları farenizle (veya dokunmatik ekranla) sağa ve sola sürükleyip bırakın (Tinder benzeri etkileşim).

**Neyi Kontrol Etmelisiniz:**
- Kart sürükleme hissiyatı akıcı olmalı, ekrandan dışarı taşarken kesiklik yaşanmamalıdır.
- Sağa kaydırılan kartların başarıyla favorilere veya geçici eşleşme listesine eklendiğinden emin olun (Konsol veya ağ sekmesi aracılığıyla kontrol edilebilir).

---

## 8. Hata Yönetimi ve 404 Senaryoları (Edge Cases)

Kullanıcıların karşılaşabileceği nadir ancak kritik senaryoları test edelim.

### Adım 8.1: Sayfa Bulunamadı (404) Testi
**Nasıl Yapılır:**
1. Tarayıcının adres çubuğuna elle geçersiz bir link girin: `http://localhost:5173/bu-sayfa-kesinlikle-yok`

**Neyi Kontrol Etmelisiniz:**
- Beyaz ve boş bir ekran yerine, temanıza uygun bir "404 - Sayfa Bulunamadı" özel tasarımı ve ana sayfaya dönmek için bir buton görünmelidir.

### Adım 8.2: Çökme Koruması (Error Boundary Testi)
**Nasıl Yapılır:**
(Bu testi yapmak zordur ancak mekaniğin çalıştığını anlamak için)
1. İnternet bağlantınızı bilgisayarınızdan anlık olarak kesin (veya Network sekmesinden `Offline` modunu seçin).
2. "Keşfet" sekmesinde daha önce yüklenmemiş yeni bir arama yapmaya çalışın.

**Neyi Kontrol Etmelisiniz:**
- Uygulama tepkisiz kalmamalıdır. Ekranda "Ağ hatası", "Bağlantı koptu" veya "Veriler yüklenemedi" şeklinde düzgün tasarlanmış bir hata mesajı görülmeli ve internet geri geldiğinde kullanıcının tekrar denemesi için ("Tekrar Dene" butonu) fırsat sunulmalıdır. Uygulamanın beyaz ekrana çökmesi `Error Boundary` (Hata Yakalayıcı) yapısının eksik olduğunu gösterir.

---
**Final Onayı:** Yukarıdaki tüm adımları, özellikle Konsol (Console) ve Ağ (Network) sekmelerinde hata görmeden (200 OK statü kodları, kırmızı uyarısız konsol ekranı) tamamladıysanız uygulamanız üretim ortamına (Production) **çıkmaya hazırdır**. Tebrikler!
