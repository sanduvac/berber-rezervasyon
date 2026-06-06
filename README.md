# 💈 Berber Rezervasyon

Modern ve şık tasarımlı, çoklu platform (Mobil ve Web) destekli bir berber randevu uygulaması. React Native + Expo ile geliştirilmiş, Firebase ile entegre edilmiştir.

## ✨ Özellikler

### 👥 Çoklu Rol Sistemi
Uygulama üç farklı kullanıcı rolünü destekler:
- **Müşteri:** Randevu alabilir, favorilere ekleyebilir, yorum yapabilir.
- **Berber Sahibi:** Kendi işletmesinin istatistiklerini görebilir, randevularını yönetebilir, hizmet ve saatlerini güncelleyebilir.
- **Platform Yöneticisi (Admin):** Platformdaki berberleri yönetir, yeni berber taleplerini onaylar veya reddeder.

### 🏠 Ana Sayfa (Müşteri)
- Yakındaki berberlerin listesi (mesafe, puan, yorum özeti, çalışma saatleri)
- Arama çubuğu ve kategori filtreleri
- Fotoğraflar uygulama açılışında önbelleğe alınır (hızlı yükleme)

### 💇 Berber Detay & Randevu Sistemi
- İşletme bilgileri, hizmetler ve fiyatlar
- Kullanıcı yorumları ve puanlama
- Hizmet seçimi → Tarih/saat seçimi → Onay akışı
- Alınan randevuların listelenmesi ve kalan süre gösterimi
- Randevu detay ekranı ve iptal etme

### 💼 Berber Paneli
- **İstatistikler:** Günlük randevular, tahmini kazanç ve ortalama puan görüntüleme.
- **Randevu Yönetimi:** Gelen randevuları görme.
- **Hizmetler:** Sunulan hizmetleri ve fiyatlarını düzenleme.
- **Çalışma Saatleri:** Günlük müsaitlik durumunu ve çalışma saatlerini belirleme.
- **Başvuru Sistemi:** Yeni bir işletme açmak için platform yöneticisine onay talebi gönderme. Sonuç ekranı ile başvurunun onay/ret durumunu takip etme.

### 🛡️ Platform Yönetici Paneli
- Yeni berber işletmesi ve sahibi hesabı oluşturma.
- **Onay Sistemi:** Berber sahiplerinden gelen yeni işletme taleplerini inceleme, onaylama veya sebep girerek reddetme.
- Berber ve sahip hesaplarını sistemden kalıcı olarak silme yetkisi.

### 🌐 Web Desteği
- Mobil görünüme ek olarak, geniş ekranlar (Masaüstü/Tablet) için özel tasarlanmış Sidebar (Yan Menü) navigasyonu.
- Web ortamı için optimize edilmiş yönlendirmeler (Auth, Landing Page).

### 🗺️ Yol Tarifi ve Harita
- Randevu detayından **"Yol Tarifi Al"** butonuyla uygulama içi harita açılır (OSRM Route API).
- Harita sekmesinde tüm berber konumlarının ve kullanıcı konumunun pin olarak gösterilmesi.

### 👤 Profil & Ayarlar
- **📸 Profil Fotoğrafı:** Kamera veya galeriden fotoğraf seçme/değiştirme/kaldırma
- **👤 Kişisel Bilgiler:** Ad, telefon, e-posta vb. düzenleme
- **🔒 Gizlilik & Güvenlik:** Biyometrik giriş, konum paylaşımı vs.
- **🌗 Koyu / Açık Mod:** Dinamik tema sistemi

## 🛠️ Teknik Bilgiler

| Teknoloji | Açıklama |
|---|---|
| **Expo SDK** | ~52 |
| **React Native** | 0.76.x |
| **TypeScript** | Uygulama genelinde statik tip denetimi |
| **Firebase** | Auth (Kimlik doğrulama) ve Firestore (Gerçek zamanlı veritabanı) |
| **react-native-maps** | Harita ve konum işlemleri |
| **Expo Router / Navigation**| React Navigation tabanlı çoklu platform yönlendirme |

## 🚀 Kurulum ve Çalıştırma

```bash
# Node 20 gerekli
nvm use 20 || nvm install 20

# Bağımlılıkları yükle
npm install

# Mobil için başlat
npx expo start -c

# Web ortamı için başlat
npx expo start -w
```

## 📁 Proje Yapısı (Öne Çıkanlar)

```
├── src/
│   ├── components/      # Ortak bileşenler (BarberCard, WebNavbar vb.)
│   ├── context/         # AuthContext, AppContext (Global State ve Firebase entegrasyonu)
│   ├── navigation/      # AppNavigator, AdminNavigator, BarberNavigator
│   ├── screens/
│   │   ├── admin/       # Platform yöneticisi ekranları (Onay, Oluşturma)
│   │   ├── barber/      # Berber paneli ekranları (İstatistik, Talep Gönderme vb.)
│   │   ├── profile/     # Profil alt ekranları
│   │   ├── web/         # Web'e özel ekranlar (Landing vb.)
│   │   └── ...          # Müşteri ana ekranları (Home, Map, Randevular)
│   ├── services/        # Firebase Firestore, Auth ve Request servisleri
│   ├── theme/           # Tema tokenleri ve context
│   └── types/           # TS tipleri (BarberRequest, UserRole vb.)
```

## 📝 Güncelleme Notları

### Son Güncellemeler
- 🛡️ **Berber Onay Sistemi:** Berber sahiplerinin yeni berber açmak için başvuru yapabileceği ve adminlerin bu talepleri "bekleyenler" listesinden görüp onaylayıp/reddedebileceği tam teşekküllü onay akışı eklendi.
- 👥 **Çoklu Rol (Role-based) Navigasyon:** Kullanıcı giriş yaptığında rolüne göre (Admin, Barber, Customer) farklı panel ve navigasyon yapılarına (Sidebar vs. BottomTab) yönlendirilmesi sağlandı.
- 🔥 **Firebase Entegrasyonu:** Tüm mock veriler kaldırılarak Firestore veritabanına bağlandı. Gerçek zamanlı randevu dinleme, berber listesi senkronizasyonu tamamlandı.
- 💻 **Web Desteği:** Yönetici ve Berber panelleri masaüstü/tablet ekranları için özel "Sidebar" arayüzü ile güçlendirildi.
