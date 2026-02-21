# 💈 Berber Rezervasyon

Modern ve şık tasarımlı bir berber randevu uygulaması. React Native + Expo ile geliştirilmiştir.

## ✨ Özellikler

### 🏠 Ana Sayfa
- Yakındaki berberlerin listesi (mesafe, puan, yorum özeti, çalışma saatleri)
- Arama çubuğu ve kategori filtreleri
- Fotoğraflar uygulama açılışında önbelleğe alınır (hızlı yükleme)

### 💇 Berber Detay
- İşletme bilgileri, hizmetler ve fiyatlar
- Kullanıcı yorumları ve puanlama
- Favori ekleme/çıkarma

### 📅 Randevu Sistemi
- Hizmet seçimi → Tarih/saat seçimi → Onay akışı
- Dolu saatler gri ve seçilemez
- Alınan randevuların listelenmesi ve kalan süre gösterimi
- Randevu detay ekranı ve iptal etme

### 🗺️ Yol Tarifi (Uygulama İçi Navigasyon)
- Randevu detayından **"Yol Tarifi Al"** butonuyla uygulama içi harita açılır
- **OSRM Route API** ile gerçek yollar üzerinden araç sürüş rotası çizilir
- Kullanıcının konumu ve berberin konumu pin olarak gösterilir

### 🗺️ Harita Sekmesi
- Tüm berber konumları haritada pin olarak görüntülenir
- Kullanıcı konumu gösterilir
- Pin'e tıklayınca berber bilgileri ve detaya gitme

### ❤️ Favoriler
- Favori berberlerin ayrı sekmede listelenmesi

### 👤 Profil & Ayarlar
- **📸 Profil Fotoğrafı:** Kamera veya galeriden fotoğraf seçme/değiştirme/kaldırma
- **👤 Kişisel Bilgiler:** Ad, telefon, e-posta, doğum tarihi ve cinsiyet bilgilerini görüntüleme ve düzenleme
- **🔒 Gizlilik & Güvenlik:** Biyometrik giriş, iki faktörlü doğrulama, konum paylaşımı ve analitik veri izinleri
- **🌗 Koyu / Açık Mod:** Görünüm bölümünden tema değiştirme
- **🔔 Bildirim Ayarları:** Randevu hatırlatma ve sistem bildirimleri
- **❓ Yardım Merkezi (SSS):** Uygulama hakkında sıkça sorulan sorular (açılır/kapanır akordeon)

### 🎨 Tema Sistemi
- **Koyu Mod:** Derin lacivert/mor gradient, neon aksan renkleri, glassmorphism efektleri
- **Açık Mod:** Beyaz yüzeyler, mor aksan, yüksek kontrast
- Tüm ekranlar ve bileşenler dinamik olarak temaya uyum sağlar

## 🛠️ Teknik Bilgiler

| Teknoloji | Sürüm |
|---|---|
| Expo SDK | ~52 |
| React Native | 0.76.x |
| TypeScript | ~5.7 |
| react-native-maps | 1.18 |
| expo-location | ~18 |
| expo-notifications | ~0.29 |
| expo-image-picker | ~16 |

## 🚀 Kurulum ve Çalıştırma

```bash
# Node 20 gerekli
nvm use 20 || nvm install 20

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npx expo start -c
```

Expo Go uygulamasıyla QR kodu taratarak test edebilirsiniz.

## 📁 Proje Yapısı

```
├── App.tsx                          # Ana uygulama bileşeni, navigasyon, tema sağlayıcı
├── src/
│   ├── theme/
│   │   └── ThemeContext.ts          # Koyu/Açık tema renk tokenleri ve context
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Ana sayfa, berber listesi
│   │   ├── BarberDetailScreen.tsx   # Berber detay sayfası
│   │   ├── AppointmentSelectionScreen.tsx  # Tarih/saat seçimi
│   │   ├── AppointmentConfirmScreen.tsx    # Randevu onay
│   │   ├── AppointmentsScreen.tsx   # Randevu listesi
│   │   ├── AppointmentDetailScreen.tsx     # Randevu detay + yol tarifi
│   │   ├── FavoritesScreen.tsx      # Favoriler
│   │   ├── MapScreen.tsx            # Harita
│   │   └── ProfileScreen.tsx        # Profil, tema, SSS
│   ├── components/
│   │   └── BarberCard.tsx           # Berber kart bileşeni
│   ├── data/
│   │   └── mockBarbers.ts           # Mock berber verileri
│   ├── types/
│   │   ├── barber.ts
│   │   └── appointment.ts
│   └── services/
│       └── notificationService.ts   # Bildirim servisi
```

## ⚠️ Test Notları

`MapScreen.tsx` ve `AppointmentDetailScreen.tsx` içinde test konumu aktiftir:

```ts
const FORCE_ISTANBUL_TEST_LOCATION = true;
// veya
const FORCE_TEST_LOCATION = true;
```

Gerçek cihaz konumunu kullanmak için bu değerleri `false` yapın.

## 📝 Güncelleme Notları

### v1.1.0 — 21 Şubat 2026
- 📸 **Profil fotoğrafı:** Kamera veya galeriden profil fotoğrafı seçme, değiştirme ve kaldırma desteği eklendi
- 👤 **Kişisel bilgiler sayfası:** Ad, telefon, e-posta, doğum tarihi ve cinsiyet bilgilerini görüntüleme ve satır içi düzenleme
- 🔒 **Gizlilik & güvenlik ayarları:** Biyometrik giriş, iki faktörlü doğrulama, konum paylaşımı ve analitik veri izinleri
- 📦 `expo-image-picker` paketi eklendi

### v1.0.0 — 20 Şubat 2026
- 🏠 Ana sayfa, berber listesi ve arama
- 💇 Berber detay, hizmetler ve yorumlar
- 📅 Randevu sistemi (seçim → onay → listeleme → detay → iptal)
- 🗺️ Uygulama içi yol tarifi (OSRM Route API)
- 🗺️ Harita sekmesi (tüm berber konumları)
- ❤️ Favoriler
- 🌗 Koyu / Açık mod tema sistemi
- 🔔 Bildirim ayarları
- ❓ Yardım merkezi (SSS)

## 📋 Gelecek Planları

- [ ] Gerçek kullanıcı sistemi (kayıt/giriş)
- [ ] Backend ve veritabanı entegrasyonu
- [ ] Berber paneli (hizmet ve müsait saat yönetimi)
- [ ] Kalıcı veri senkronizasyonu
- [ ] Canlı destek özelliği
