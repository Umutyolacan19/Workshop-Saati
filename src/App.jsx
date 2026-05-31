import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  Coffee, Calendar, Users, LogOut, Plus, X, CheckCircle, Clock, Book, 
  Award, User, File, Filter, Printer, Star, Bell, Globe, MapPin, 
  Mail, Phone, MessageCircle, ArrowRight, Image as ImageIcon, ArrowLeft
} from 'lucide-react';

// Özel Sosyal Medya İkonları
const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

// === GÜVENLİK KALKANI (Error Boundary) ===
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.toString() };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg text-center border-2 border-red-200">
            <h1 className="text-2xl font-black text-red-600 mb-4">Sistem Çökmesi Engellendi!</h1>
            <p className="text-gray-700 mb-6 font-medium">Uygulamada bir hata oluştu ve kalkan tarafından durduruldu. Hata detayı:</p>
            <div className="bg-red-100 p-4 rounded-lg text-red-800 text-sm font-mono mb-6 overflow-x-auto text-left">
              {this.state.errorMessage}
            </div>
            <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg">
              Sayfayı Yenile ve Tekrar Dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Firebase Başlatma ---
let db = null;
let auth = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kahve-akademi-mvp-v9';
const isLocalhost = typeof __firebase_config === 'undefined';

if (!isLocalhost) {
  try {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase config yüklenirken hata:", error);
  }
}

// --- Çeviri Sözlüğü (TR / EN) ---
const dict = {
  tr: {
    navHome: "Ana Sayfa", navExperiences: "Tüm Atölyeler", navGallery: "Galeri", navBlog: "Blog", navAbout: "Hakkımızda",
    loginBtn: "Akademiye Giriş", logout: "Çıkış", admin: "Yönetici", student: "Öğrenci",
    heroTitle: "Kahve Sanatını ", heroTitleHighlight: "Uzmanlarından", heroTitleEnd: " Öğrenin",
    heroDesc: "Üçüncü nesil kahve demleme tekniklerinden, profesyonel latte art atölyelerine kadar geniş yelpazede eğitimler sizi bekliyor.",
    heroBtn: "Atölyeleri Keşfet", quickLinks: "Hızlı Bağlantılar", corporate: "Kurumsal", contact: "İletişim", allRights: "Tüm hakları saklıdır.",
    privacy: "Gizlilik Politikası", terms: "Kullanım Şartları", galleryTitle: "Atölye Galerisi", blogTitle: "Kahve Blogu",
    aboutTitle: "Hakkımızda & Biz Kimiz?", expLatte: "Latte Art Atölyeleri", expBrew: "3. Nesil Demlemeler", expCupping: "Tadım (Cupping) Günleri", expBarista: "Temel Barista Eğitimleri",
    backToCats: "Kategorilere Dön", joinPrompt: "Bu Eğitime Katılmak İster misiniz?", joinDesc: "Eğitim tarihlerimiz belirlendikçe sistemden duyurulmaktadır. Kayıt için Akademi Portalı'na göz atabilirsiniz.",
    loginToAcademy: "Akademiye Giriş Yap", expSubtitle: "Akademimizde sunduğumuz eğitim konseptleri. Detayları incelemek için bir kategoriye tıklayın.",
    viewDetails: "Detayları İncele", galSubtitle: "Eğitimlerimizden, taze kavrulmuş çekirdeklerimizden ve enfes demlemelerimizden kareler.",
    blogSubtitle: "Kahve kültürü, demleme teknikleri ve baristalık üzerine faydalı makaleler.", backToBlog: "Blog Listesine Dön", readArticle: "Makaleyi Oku",
    aboutMission: "Misyonumuz", aboutVision: "Vizyonumuz", aboutWhatWeDo: "Neler Yapıyoruz?"
  },
  en: {
    navHome: "Home", navExperiences: "All Workshops", navGallery: "Gallery", navBlog: "Blog", navAbout: "About Us",
    loginBtn: "Academy Login", logout: "Logout", admin: "Admin", student: "Student",
    heroTitle: "Learn the Art of Coffee from ", heroTitleHighlight: "Experts", heroTitleEnd: "",
    heroDesc: "From third-wave coffee brewing techniques to professional latte art workshops, a wide range of training awaits you.",
    heroBtn: "Explore Workshops", quickLinks: "Quick Links", corporate: "Corporate", contact: "Contact", allRights: "All rights reserved.",
    privacy: "Privacy Policy", terms: "Terms of Use", galleryTitle: "Workshop Gallery", blogTitle: "Coffee Blog",
    aboutTitle: "About Us & Who We Are?", expLatte: "Latte Art Workshops", expBrew: "3rd Wave Brewing", expCupping: "Cupping Days", expBarista: "Basic Barista Training",
    backToCats: "Back to Categories", joinPrompt: "Would you like to join this training?", joinDesc: "Training dates are announced on the system. Check the Academy Portal to register.",
    loginToAcademy: "Login to Academy", expSubtitle: "Training concepts offered at our academy. Click a category for details.",
    viewDetails: "View Details", galSubtitle: "Frames from our trainings, freshly roasted beans, and exquisite brews.",
    blogSubtitle: "Useful articles on coffee culture, brewing techniques, and barista skills.", backToBlog: "Back to Blog List", readArticle: "Read Article",
    aboutMission: "Our Mission", aboutVision: "Our Vision", aboutWhatWeDo: "What We Do?"
  }
};

function MainApp() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State'leri
  const [publicTab, setPublicTab] = useState('home'); 
  const [studentTab, setStudentTab] = useState('explore'); 
  const [filterCategory, setFilterCategory] = useState('Tümü');
  const [showNotifications, setShowNotifications] = useState(false);
  const [lang, setLang] = useState('tr'); 
  const [selectedExp, setSelectedExp] = useState(null);
  const [activePost, setActivePost] = useState(null);
  
  // Veritabanı State'leri
  const [workshops, setWorkshops] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]); 
  
  // Form State'leri
  const [newWorkshop, setNewWorkshop] = useState({ 
    title: '', date: '', time: '', capacity: '', instructor: '', 
    level: 'Başlangıç', category: 'Latte Art', description: '' 
  });
  const [reviewForm, setReviewForm] = useState({ workshopId: null, rating: 5, comment: '' });
  const [loginError, setLoginError] = useState('');
  const [systemModal, setSystemModal] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.warn("Lokal auth atlandı."); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    try {
      const unsubWs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'workshops'), (snap) => setWorkshops(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubRes = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'reservations'), (snap) => setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubRev = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), (snap) => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      return () => { unsubWs(); unsubRes(); unsubRev(); };
    } catch(e) { console.warn("Lokal DB atlandı."); }
  }, [user]);

  // --- İŞ MANTIĞI VE LOKAL YEDEKLER ---
  const handleLogin = (selectedRole) => {
    setLoginError('');
    if (!userName || !userName.trim()) return setLoginError("Lütfen bir kullanıcı adı giriniz.");
    if (!password || !password.trim()) return setLoginError("Lütfen şifrenizi giriniz.");
    
    const cleanPassword = password.trim().toLowerCase();
    
    if (selectedRole === 'admin' && cleanPassword !== 'kahvesever') return setLoginError("Hatalı yönetici şifresi! Doğru Şifre: kahvesever");
    if (selectedRole === 'student' && cleanPassword !== 'ogrenci123') return setLoginError("Hatalı öğrenci şifresi! Doğru Şifre: ogrenci123");
    
    setRole(selectedRole);
    setPublicTab('home');
  };

  const handleLogout = () => { 
    setRole(null); setUserName(''); setPassword(''); setStudentTab('explore'); setLoginError(''); setPublicTab('home'); 
    setSelectedExp(null); setActivePost(null);
  };

  const handleAddWorkshop = async (e) => {
    e.preventDefault();
    const newWs = { 
      id: Date.now().toString(), 
      title: newWorkshop.title || 'İsimsiz Eğitim',
      date: newWorkshop.date || '-',
      time: newWorkshop.time || '-',
      capacity: parseInt(newWorkshop.capacity) || 1, 
      instructor: newWorkshop.instructor || 'Belirtilmemiş',
      level: newWorkshop.level || 'Başlangıç',
      category: newWorkshop.category || 'Atölye',
      description: newWorkshop.description || '',
      status: 'active', 
      createdAt: new Date().toISOString(), 
      createdBy: userName 
    };

    if (db && user) {
      try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'workshops'), newWs); } catch(err) {}
    } else {
      setWorkshops(prev => [...prev, newWs]); 
    }
    
    setNewWorkshop({ title: '', date: '', time: '', capacity: '', instructor: '', level: 'Başlangıç', category: 'Latte Art', description: '' });
    setSystemModal({ type: 'alert', title: 'Başarılı', message: 'Eğitim başarıyla oluşturuldu!' });
  };

  const handleDeleteWorkshop = async (wsId) => {
    setSystemModal({ type: 'confirm', title: 'Eğitimi Sil', message: 'Bu atölyeyi silmek istediğinize emin misiniz?', onConfirm: async () => { 
      if (db && user) {
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'workshops', wsId)); } catch(err) {}
      } else {
        setWorkshops(prev => prev.filter(w => w.id !== wsId)); 
      }
      setSystemModal(null); 
    }});
  };

  const handleToggleCertificate = async (resId, currentStatus) => { 
    if (db && user) {
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reservations', resId), { certified: !currentStatus }); } catch(err) {}
    } else {
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, certified: !currentStatus } : r));
    }
  };

  const handleCompleteWorkshop = async (ws, wsReservations) => {
    setSystemModal({ type: 'confirm', title: 'Eğitimi Tamamla', message: `"${ws.title}" tamamlanıyor. Öğrencilere sertifika verilecek.`, onConfirm: async () => {
      if (db && user) {
        try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'workshops', ws.id), { status: 'completed', completedAt: new Date().toISOString() });
          await Promise.all((wsReservations || []).map(res => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reservations', res.id), { certified: true })));
        } catch(err) {}
      } else {
        setWorkshops(prev => prev.map(w => w.id === ws.id ? { ...w, status: 'completed' } : w));
        const resIds = (wsReservations || []).map(r => r.id);
        setReservations(prev => prev.map(r => resIds.includes(r.id) ? { ...r, certified: true } : r));
      }
      setSystemModal(null);
    }});
  };

  const handleBookWorkshop = async (wsId) => {
    if ((reservations || []).some(r => r.workshopId === wsId && r.userName === userName)) return setSystemModal({ type: 'alert', title: 'Uyarı', message: 'Zaten kayıtlısınız.' });
    
    const newRes = { 
      id: Date.now().toString(), 
      workshopId: wsId, 
      userId: user ? user.uid : 'local-user', 
      userName: userName || 'Anonim', 
      bookedAt: new Date().toISOString(), 
      certified: false 
    };
    
    if (db && user) {
      try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reservations'), newRes); } catch(err) {}
    } else {
      setReservations(prev => [...prev, newRes]);
    }
    
    setSystemModal({ type: 'alert', title: 'Başarılı', message: 'Kayıt başarılı! Takviminize ekleyebilirsiniz.' });
    setStudentTab('profile');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.workshopId) return;
    const newRev = { 
      id: Date.now().toString(), 
      workshopId: reviewForm.workshopId, 
      userName: userName || 'Anonim', 
      rating: reviewForm.rating || 5, 
      comment: reviewForm.comment || '', 
      createdAt: new Date().toISOString() 
    };
    
    if (db && user) {
      try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), newRev); } catch(err) {}
    } else {
      setReviews(prev => [...prev, newRev]);
    }
    
    setReviewForm({ workshopId: null, rating: 5, comment: '' });
    setSystemModal({ type: 'alert', title: 'Teşekkürler', message: 'Değerlendirmeniz kaydedildi!' });
  };

  const generateGoogleCalendarLink = (ws) => {
    try {
      if (!ws || !ws.date || !ws.time || ws.date === '-' || ws.time === '-') return "#";
      const dateStr = `${ws.date}T${ws.time}`;
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return "#";

      const formatISO = (d) => d.toISOString().split('.')[0].replace(/[-:]/g, "") + "Z";
      const startDate = formatISO(dateObj);
      const endDateObj = new Date(dateObj.getTime());
      endDateObj.setHours(endDateObj.getHours() + 2);
      const endDate = formatISO(endDateObj);
      
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ws.title || '')}&dates=${startDate}/${endDate}&details=${encodeURIComponent((ws.description || "") + "\nEğitmen: " + (ws.instructor || ""))}&location=Workshop+Saati+Akademi`;
    } catch (e) { return "#"; }
  };

  const t = dict[lang]; 

  // --- KÜRESEL BİLEŞENLER (RENDER FONKSİYONLARI) ---
  const renderSiteHeader = () => {
    let notifs = [];
    if (role === 'student') {
      const activeWs = (workshops || []).filter(ws => ws.status !== 'completed');
      if (activeWs.length > 0) notifs.push({ id: 1, text: `Sisteme eklenmiş ${activeWs.length} adet yeni yaklaşan eğitim var! Kayıt olmayı unutmayın.` });
    } else if (role === 'admin') {
      const myWorkshops = (workshops || []).filter(ws => ws.createdBy === userName && ws.status !== 'completed');
      myWorkshops.forEach(ws => {
        const resCount = (reservations || []).filter(r => r.workshopId === ws.id).length;
        if (resCount >= (Number(ws.capacity) || 1)) notifs.push({ id: ws.id, text: `"${ws.title}" adlı eğitiminizin kontenjanı doldu (${resCount}/${ws.capacity}).` });
      });
    }

    return (
      <header className="bg-white text-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setRole(null); setPublicTab('home'); setSelectedExp(null); setActivePost(null); }}>
            <div className="bg-amber-600 p-2.5 rounded-xl shadow-inner"><Coffee className="w-6 h-6 text-white" /></div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">Workshop Saati</h1>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Workshops & Akademi</span>
            </div>
          </div>

          {!role && (
            <nav className="hidden lg:flex items-center gap-8 font-bold text-sm text-gray-600">
              <button onClick={() => { setPublicTab('home'); setSelectedExp(null); setActivePost(null); }} className={`hover:text-amber-600 transition ${publicTab === 'home' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : ''}`}>{t.navHome}</button>
              <button onClick={() => { setPublicTab('experiences'); setSelectedExp(null); setActivePost(null); }} className={`hover:text-amber-600 transition ${publicTab === 'experiences' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : ''}`}>{t.navExperiences}</button>
              <button onClick={() => { setPublicTab('gallery'); setSelectedExp(null); setActivePost(null); }} className={`hover:text-amber-600 transition ${publicTab === 'gallery' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : ''}`}>{t.navGallery}</button>
              <button onClick={() => { setPublicTab('blog'); setSelectedExp(null); setActivePost(null); }} className={`hover:text-amber-600 transition ${publicTab === 'blog' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : ''}`}>{t.navBlog}</button>
              <button onClick={() => { setPublicTab('about'); setSelectedExp(null); setActivePost(null); }} className={`hover:text-amber-600 transition ${publicTab === 'about' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : ''}`}>{t.navAbout}</button>
            </nav>
          )}
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500 border-r border-gray-200 pr-4">
              <Globe className="w-4 h-4 text-gray-400" />
              <button onClick={() => setLang('tr')} className={`transition ${lang === 'tr' ? 'text-amber-600' : 'hover:text-gray-900'}`}>TR</button>
              <button onClick={() => setLang('en')} className={`transition ${lang === 'en' ? 'text-amber-600' : 'hover:text-gray-900'}`}>EN</button>
            </div>

            {role ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-full transition relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifs.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="bg-gray-50 p-3 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-sm">Bildirimler</h3></div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifs.length === 0 ? <p className="p-4 text-sm text-gray-500 text-center">Yeni bildiriminiz yok.</p> : (
                          notifs.map((n, i) => (
                            <div key={i} className="p-3 border-b border-gray-50 text-sm text-gray-700 hover:bg-gray-50 flex items-start gap-2">
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div><p>{n.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{role === 'admin' ? t.admin : t.student}</span>
                  <span className="text-sm font-bold text-gray-800">{userName}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition font-bold">
                  <LogOut className="w-4 h-4" /> {t.logout}
                </button>
              </div>
            ) : (
               <button onClick={() => setPublicTab('login')} className="flex items-center gap-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-lg">
                 <User className="w-4 h-4" /> {t.loginBtn}
               </button>
            )}
          </div>
        </div>
      </header>
    );
  };

  const renderSiteFooter = () => (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 mb-12">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-600 p-1.5 rounded-lg"><Coffee className="w-5 h-5 text-white" /></div>
            <h2 className="text-lg font-black text-gray-900 leading-none">Workshop Saati</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {lang === 'tr' ? "Türkiye'deki en benzersiz atölyeleri keşfedin. Çekirdekten fincana, unutulmaz tatlar ve eğitimler yaratın." : "Discover the most unique workshops in Turkey. From bean to cup, create unforgettable tastes and trainings."}
          </p>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/yolacanumut/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/umut-yola%C3%A7an-089549255/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition">
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">{t.quickLinks}</h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><button onClick={() => { setRole(null); setPublicTab('home'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.navHome}</button></li>
            <li><button onClick={() => { setRole(null); setPublicTab('gallery'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.navGallery}</button></li>
            <li><button onClick={() => { setRole(null); setPublicTab('blog'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.navBlog}</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">{t.navExperiences}</h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><button onClick={() => { setRole(null); setPublicTab('experiences'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.expLatte}</button></li>
            <li><button onClick={() => { setRole(null); setPublicTab('experiences'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.expBrew}</button></li>
            <li><button onClick={() => { setRole(null); setPublicTab('experiences'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.expCupping}</button></li>
            <li><button onClick={() => { setRole(null); setPublicTab('experiences'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.expBarista}</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">{t.corporate}</h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><button onClick={() => { setRole(null); setPublicTab('about'); setSelectedExp(null); setActivePost(null); }} className="hover:text-amber-600 transition">{t.navAbout}</button></li>
            <li><button className="hover:text-amber-600 transition">{lang === 'tr' ? 'Eğitmenlerimiz' : 'Our Trainers'}</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">{t.contact}</h3>
          <ul className="space-y-4 text-sm text-gray-500">
            <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-amber-600 shrink-0" /><span>İstanbul, Türkiye</span></li>
            <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-amber-600 shrink-0" /><a href="mailto:emr.umut03@gmail.com" className="hover:text-amber-600">emr.umut03@gmail.com</a></li>
            <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-amber-600 shrink-0" /><a href="tel:+905320000000" className="hover:text-amber-600">+90 532 000 00 00</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
        <p>© 2024 Workshop Saati Akademi. {t.allRights}</p>
        <div className="flex items-center gap-4">
          <button className="hover:text-gray-600">{t.privacy}</button>
          <button className="hover:text-gray-600">{t.terms}</button>
        </div>
      </div>
    </footer>
  );

  const renderWhatsAppButton = () => (
    <a href="https://wa.me/905320000000" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd5a] hover:scale-110 transition-all z-50 group">
      <MessageCircle className="w-7 h-7" />
    </a>
  );

  // --- ZİYARETÇİ (PUBLIC) İÇERİK RENDER FONKSİYONLARI ---
  const renderPublicHome = () => (
    <div className="flex-grow">
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop" alt="Coffee Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-32 flex flex-col items-start min-h-[70vh] justify-center">
          <span className="bg-amber-600 text-white font-bold tracking-widest uppercase px-4 py-1.5 rounded-full text-xs mb-6 shadow-lg">{lang === 'tr' ? 'Kahve Tutkunlarına Özel' : 'For Coffee Lovers'}</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 max-w-3xl leading-tight">{t.heroTitle} <span className="text-amber-500">{t.heroTitleHighlight}</span>{t.heroTitleEnd}</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl">{t.heroDesc}</p>
          <div className="flex gap-4">
            <button onClick={() => setPublicTab('experiences')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg flex items-center gap-2 text-lg">
              {t.heroBtn} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublicExperiences = () => {
    const exps = [
      { id: 1, title: t.expLatte, img: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=800&auto=format&fit=crop', shortDesc: lang === 'tr' ? 'Süt köpürtme ve serbest döküş teknikleriyle fincanınızı bir tuvale çevirin.' : 'Turn your cup into a canvas with milk frothing and free pour techniques.', fullDesc: lang === 'tr' ? 'Latte Art atölyemizde, espresso üzerinde mükemmel mikro köpük yaratmanın sırlarını paylaşıyoruz. Sütün sıcaklığı, sürahinin (pitcher) tutuş açısı ve serbest döküş (free pour) teknikleri ile kalp, rosetta ve lale gibi klasik desenleri çizmeyi uygulamalı olarak öğreniyorsunuz. Önceden baristalık tecrübeniz olmasına gerek yok, tamamen pratik odaklı ve eğlenceli bir deneyim sizi bekliyor.' : 'In our Latte Art workshop, we share the secrets of creating perfect microfoam over espresso. You will practically learn to draw classic patterns such as hearts, rosettas, and tulips with the temperature of the milk, the holding angle of the pitcher, and free pour techniques. You do not need to have barista experience beforehand; a completely practice-oriented and fun experience awaits you.' },
      { id: 2, title: t.expBrew, img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop', shortDesc: lang === 'tr' ? 'V60, Chemex ve Aeropress ile kahve çekirdeğinin gerçek potansiyelini ortaya çıkarın.' : 'Reveal the true potential of the coffee bean with V60, Chemex, and Aeropress.', fullDesc: lang === 'tr' ? 'Pour-over dünyasına adım atın! Bu eğitimde farklı filtre demleme ekipmanlarının (V60, Chemex, Aeropress vb.) dinamiklerini inceliyoruz. Suyun sıcaklığı, döküş hızı (flow rate), kahvenin öğütüm kalınlığı (grind size) ve demleme süresinin (contact time) fincandaki tada olan muazzam etkilerini tadarak ve bizzat demleyerek öğreniyorsunuz. Evdeki kahvenizi bir üst seviyeye taşımak için birebir.' : 'Step into the pour-over world! In this training, we examine the dynamics of different filter brewing equipments (V60, Chemex, Aeropress, etc.). You learn the tremendous effects of water temperature, flow rate, grind size, and contact time on the taste in the cup by tasting and brewing yourself. Perfect for taking your home coffee to the next level.' },
      { id: 3, title: t.expCupping, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop', shortDesc: lang === 'tr' ? 'Farklı yörelerden gelen çekirdekleri test edin, damak paletinizi geliştirin.' : 'Test beans from different regions, develop your palate.', fullDesc: lang === 'tr' ? 'Cupping, kahve profesyonellerinin çekirdekleri analiz etmek için kullandığı evrensel bir tadım yöntemidir. Bu atölyede farklı kıtalardan (Afrika, Güney Amerika, Asya) gelen kahve çekirdeklerinin gövde, asidite, aroma ve tatlılık gibi karakteristik özelliklerini koklayarak ve hüpleterek analiz ediyoruz. Lezzet sözlüğünü (flavor wheel) kullanmayı ve kahveleri puanlamayı öğreneceksiniz.' : 'Cupping is a universal tasting method used by coffee professionals to analyze beans. In this workshop, we analyze the characteristic features such as body, acidity, aroma, and sweetness of coffee beans from different continents (Africa, South America, Asia) by smelling and slurping. You will learn how to use the flavor wheel and score coffees.' },
      { id: 4, title: t.expBarista, img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop', shortDesc: lang === 'tr' ? 'Profesyonel espresso makinesi kullanımı ve kahve dükkanı operasyonları.' : 'Professional espresso machine usage and coffee shop operations.', fullDesc: lang === 'tr' ? 'Baristalık kariyerine ilk adımı atanlar veya kahve dükkanı açmayı planlayanlar için tasarlanmış kapsamlı eğitimimiz. Profesyonel espresso makinesi ve değirmeninin kalibrasyonu, ideal espresso ekstraksiyonu, makine temizliği ve temel süt işleme gibi konularda yoğun teorik ve pratik eğitim veriyoruz. Kendi kahve istasyonunuzu yönetebilecek özgüvenle ayrılacaksınız.' : 'Our comprehensive training designed for those taking their first step into a barista career or planning to open a coffee shop. We provide intensive theoretical and practical training on subjects such as the calibration of professional espresso machines and grinders, ideal espresso extraction, machine cleaning, and basic milk processing. You will leave with the self-confidence to manage your own coffee station.' }
    ];

    if (selectedExp) {
      return (
        <div className="flex-grow bg-white py-16 animate-fade-in">
          <div className="max-w-4xl mx-auto px-4">
            <button onClick={() => setSelectedExp(null)} className="mb-8 flex items-center gap-2 text-gray-500 hover:text-amber-600 font-bold transition">
              <ArrowLeft className="w-5 h-5"/> {t.backToCats}
            </button>
            <img src={selectedExp.img} className="w-full h-80 object-cover rounded-3xl mb-8 shadow-md" alt={selectedExp.title}/>
            <h2 className="text-4xl font-black text-gray-900 mb-6">{selectedExp.title}</h2>
            <div className="prose prose-lg text-gray-600">
              <p className="leading-relaxed">{selectedExp.fullDesc}</p>
            </div>
            <div className="mt-12 bg-amber-50 p-8 rounded-3xl text-center border border-amber-100">
              <h3 className="text-xl font-bold text-amber-900 mb-3">{t.joinPrompt}</h3>
              <p className="text-amber-700/80 mb-6 text-sm">{t.joinDesc}</p>
              <button onClick={() => setPublicTab('login')} className="bg-amber-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-amber-700 transition">{t.loginToAcademy}</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-grow bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.navExperiences}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.expSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {exps.map(exp => (
              <div key={exp.id} onClick={() => setSelectedExp(exp)} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
                <div className="h-56 overflow-hidden relative">
                  <img src={exp.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={exp.title}/>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{exp.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">{exp.shortDesc}</p>
                  <span className="text-amber-600 font-bold flex items-center gap-2">{t.viewDetails} <ArrowRight className="w-4 h-4"/></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPublicGallery = () => {
    // 6 adet güncel ve çalışan lokal dosya yolları (.jpg)
    const galleryImages = [
      "/1.jpg", 
      "/2.jpg", 
      "/3.jpg", 
      "/4.jpg", 
      "/5.jpg", 
      "/6.jpg" 
    ];

    return (
      <div className="flex-grow bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <ImageIcon className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.galleryTitle}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.galSubtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((src, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl aspect-square shadow-sm bg-gray-100">
                <img src={src} alt={`Galeri ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-bold tracking-widest uppercase text-sm border border-white/50 px-4 py-2 rounded-lg backdrop-blur-sm">Workshop Saati</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPublicBlog = () => {
    const blogPosts = [
      {
        id: 1,
        title: "Evde V60 Demleme Rehberi: Püf Noktalar",
        category: "3. Nesil Demlemeler",
        excerpt: "V60 ile kahve demlerken suyun sıcaklığından, döküş hızına kadar dikkat etmeniz gereken her şey bu yazımızda...",
        content: "V60 demleme yöntemi, filtre kahvenin en berrak ve aromatik halini elde etmenizi sağlayan muazzam bir tekniktir. Püf noktası: Suyun sıcaklığının 92-94 derece aralığında olmasıdır. Kaynar suyu direkt kahvenin üzerine dökerseniz çekirdekleri yakar ve acı (bitter) bir tat elde edersiniz.\n\nÖncelikle filtre kağıdınızı sıcak suyla yıkayarak kağıt tadını atın ve ekipmanınızı ısıtın. 15 gram taze çekilmiş kahve için 250ml su kullanacağız. İlk döküşte (Blooming - Çiçeklenme) 30-40ml su ekleyip 30 saniye kahvenin gazını salmasını bekleyin. Ardından dairesel ve yavaş hareketlerle suyu ilave edin. Sabır ve doğru döküş hızı, fincandaki tatlılığı ve gövdeyi belirleyecektir.",
        img: "/4.jpg" // V60 resmi
      },
      {
        id: 2,
        title: "Espresso'da İdeal Krema Nasıl Olmalı?",
        category: "Temel Barista",
        excerpt: "Mükemmel bir espressonun imzası olan krema (crema) rengi, kalınlığı ve dokusu bize kahve hakkında ne anlatır?",
        content: "Kremsi, altın kahverengi ve üzerinde hafif kaplan desenleri (tiger mottling) olan bir krema, mükemmel bir espressonun habercisidir. Krema, kahve çekirdeklerindeki yağların ve basınç altında çözünen karbondioksitin birleşimiyle oluşur.\n\nEğer krema çok ince ve açık sarı renkteyse, kahveniz az ekstrakte (under-extracted) olmuş demektir; yani su kahvenin içinden çok hızlı geçmiştir (muhtemelen kalın öğütüm). Eğer krema çok koyu, ince ve kenarlarda siyah bir halka oluşturuyorsa, fazla ekstrakte (over-extracted) olmuştur ve tat yanık/acı olacaktır. Doğru tamp, doğru öğütüm ve 9 barlık basınç ile ideal dengeyi yakalamak baristanın en büyük sanatıdır.",
        img: "/1.jpg" // Espresso resmi
      },
      {
        id: 3,
        title: "Nitelikli Kahve (Specialty Coffee) Nedir?",
        category: "Genel Kültür",
        excerpt: "Sürekli duyduğumuz 'Nitelikli Kahve' kavramı aslında neyi ifade ediyor? Çekirdeğin puanlanma sürecini inceledik.",
        content: "Nitelikli kahve (Specialty Coffee), SCA (Specialty Coffee Association) standartlarına göre 100 üzerinden 80 ve üzeri puan alan kahvelere verilen uluslararası bir ünvandır. Bu puanlama; çekirdeğin yetiştirildiği rakım, hasat ediliş biçimi (elle tek tek toplama), kusur (defekt) oranı ve tadım notaları göz önüne alınarak bağımsız Q-Grader'lar tarafından yapılır.\n\nNitelikli kahve sadece bir tat değil, bir ekosistemdir. Çiftçinin adil ücret aldığı, çekirdeklerin çuvalına kadar izlenebilir olduğu (hangi çiftlik, hangi varyete, hangi işlem) şeffaf bir süreci ifade eder. Fincanınızda hissettiğiniz yasemin, çilek veya çikolata notaları tamamen o yörenin toprağından gelen doğal tatlardır; sonradan eklenmiş bir şurup değildir.",
        img: "/2.jpg" // Kahve çekirdeği resmi
      }
    ];

    if (activePost) {
      return (
        <div className="flex-grow bg-white py-16 animate-fade-in">
          <div className="max-w-3xl mx-auto px-4">
            <button onClick={() => setActivePost(null)} className="mb-8 flex items-center gap-2 text-gray-500 hover:text-amber-600 font-bold transition">
              <ArrowLeft className="w-5 h-5"/> {t.backToBlog}
            </button>
            <span className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 block">{activePost.category}</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">{activePost.title}</h1>
            <img src={activePost.img} className="w-full h-[400px] object-cover rounded-3xl mb-10 shadow-lg" alt={activePost.title} />
            <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6">
              {activePost.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Workshop Saati Blog</p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/yolacanumut/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-amber-100 hover:text-amber-600 transition">
                  <InstagramIcon className="w-4 h-4"/>
                </a>
                <a href="https://www.linkedin.com/in/umut-yola%C3%A7an-089549255/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-amber-100 hover:text-amber-600 transition">
                  <LinkedinIcon className="w-4 h-4"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-grow bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.blogTitle}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.blogSubtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div key={post.id} onClick={() => setActivePost(post)} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="h-56 overflow-hidden">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-8">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 block">{post.category}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3">{post.excerpt}</p>
                  <span className="text-gray-900 font-bold text-sm flex items-center gap-1 group-hover:text-amber-600 transition">{t.readArticle} <ArrowRight className="w-4 h-4"/></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPublicAbout = () => (
    <div className="flex-grow bg-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-6">{t.aboutTitle}</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="prose prose-lg text-gray-600 mx-auto">
          <p className="lead font-medium text-gray-800 text-xl text-center mb-10">
            Workshop Saati Akademi, kahve tutkunlarını ve profesyonellerini bir araya getirmek, nitelikli kahve kültürünü yaymak amacıyla kurulmuş yenilikçi bir eğitim platformudur.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="bg-amber-50 p-8 rounded-3xl">
              <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2"><Coffee className="w-6 h-6"/> {t.aboutMission}</h3>
              <p className="text-sm leading-relaxed">Kahve çekirdeğinin tarladan fincana olan yolculuğuna saygı duyarak, bu serüveni hem ev demliyicilerine hem de profesyonel baristalara en doğru tekniklerle aktarmak. Teorik bilgiyi pratikle birleştirerek sektördeki kalite standartlarını yükseltmek.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><Award className="w-6 h-6 text-gray-700"/> {t.aboutVision}</h3>
              <p className="text-sm leading-relaxed">Türkiye'nin en saygın, en yenilikçi ve ulaşılabilir kahve akademisi olmak. Mezunlarımızın kahve sektöründe aranan isimler olmasını sağlamak ve kahve deneyimini sanat seviyesine taşımak.</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center mt-12">{t.aboutWhatWeDo}</h3>
          <ul className="space-y-4 text-center md:text-left md:max-w-2xl mx-auto list-none">
            <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle className="w-5 h-5 text-amber-600 shrink-0"/> <span className="font-medium">SCA standartlarında profesyonel Barista Eğitimleri</span></li>
            <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle className="w-5 h-5 text-amber-600 shrink-0"/> <span className="font-medium">Süt köpürtme ve serbest döküş Latte Art Atölyeleri</span></li>
            <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle className="w-5 h-5 text-amber-600 shrink-0"/> <span className="font-medium">V60, Chemex ve Aeropress ile 3. Nesil Demleme Teknikleri</span></li>
            <li className="flex items-center justify-center md:justify-start gap-3"><CheckCircle className="w-5 h-5 text-amber-600 shrink-0"/> <span className="font-medium">Çekirdek profil tanıma ve Tadım (Cupping) Etkinlikleri</span></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderLoginScreen = () => (
    <div className="flex-grow bg-[url('/1.jpg')] bg-cover bg-center flex items-center justify-center p-4 relative min-h-[80vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="bg-white/95 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center relative z-10 border border-white/20">
        <button onClick={() => setPublicTab('home')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition"><X className="w-6 h-6"/></button>
        <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Coffee className="w-10 h-10 text-amber-800" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Akademi Portalı</h2>
        <p className="text-gray-600 mb-8 font-medium">Uzmanlık eğitimleri ve atölye rezervasyonları için giriş yapın.</p>

        <div className="space-y-4">
          <input type="text" placeholder="Kullanıcı Adı (Ad Soyad)" value={userName} onChange={(e) => setUserName(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 bg-white/50 outline-none transition" />
          <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 bg-white/50 outline-none transition" />
          
          {loginError && <p className="text-red-500 text-sm font-semibold text-left ml-2">{loginError}</p>}
          
          <div className="bg-amber-50 p-4 rounded-xl text-left border border-amber-100 mt-2">
            <p className="text-[10px] font-bold text-amber-800 mb-2 uppercase tracking-wider">Jüri / Demo Giriş Bilgileri</p>
            <div className="text-sm text-amber-900 space-y-1">
              <p>Kullanıcı Adı: <span className="font-medium bg-white px-2 py-0.5 rounded border border-amber-100">İstediğiniz bir isim</span></p>
              <p>Öğrenci Şifresi: <span className="font-bold bg-white px-2 py-0.5 rounded border border-amber-100">ogrenci123</span></p>
              <p>Yönetici Şifresi: <span className="font-bold bg-white px-2 py-0.5 rounded border border-amber-100">kahvesever</span></p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button onClick={() => handleLogin('student')} className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <Book className="w-5 h-5" /> Öğrenci
            </button>
            <button onClick={() => handleLogin('admin')} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2">
              <User className="w-5 h-5" /> Yönetici
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentPanel = () => {
    const myReservations = (reservations || []).filter(r => r.userName === userName);
    const myWorkshops = (workshops || []).filter(ws => myReservations.some(r => r.workshopId === ws.id));
    const activeWorkshops = (workshops || []).filter(ws => ws.status !== 'completed' && (filterCategory === 'Tümü' || ws.category === filterCategory));
    const categories = ['Tümü', 'Latte Art', '3. Nesil Demlemeler', 'Tadım (Cupping)', 'Temel Barista'];
    const safeUserName = userName || '';

    return (
      <div className="flex-grow bg-gray-50 pb-10">
        <div className="bg-white shadow-sm border-b sticky top-20 z-30">
          <div className="max-w-4xl mx-auto flex">
            <button onClick={() => setStudentTab('explore')} className={`flex-1 py-4 font-bold text-center border-b-[3px] transition ${studentTab === 'explore' ? 'border-amber-600 text-amber-700 bg-amber-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <Book className="w-5 h-5 inline-block mr-2" /> Eğitim Takvimi
            </button>
            <button onClick={() => setStudentTab('profile')} className={`flex-1 py-4 font-bold text-center border-b-[3px] transition ${studentTab === 'profile' ? 'border-amber-600 text-amber-700 bg-amber-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <User className="w-5 h-5 inline-block mr-2" /> Profilim & Geçmiş
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 mt-6">
          {studentTab === 'explore' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Aktif Eğitimler</h2>
                  <p className="text-gray-500 font-medium">Size uygun tarihli eğitime kayıt olun.</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
                  <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filterCategory === cat ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              
              {activeWorkshops.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <Coffee className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold text-lg">Bu kategoride planlanmış eğitim yok.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeWorkshops.map(ws => {
                    const wsRes = (reservations || []).filter(r => r.workshopId === ws.id);
                    const isBooked = wsRes.some(r => r.userName === userName);
                    const isFull = wsRes.length >= (Number(ws.capacity) || 1);

                    return (
                      <div key={ws.id} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all flex flex-col group">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-b border-gray-100 relative overflow-hidden">
                          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="bg-white text-amber-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-amber-100">{ws.category || 'Atölye'}</span>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${ws.level === 'Başlangıç' ? 'bg-green-50 text-green-700 border-green-200' : ws.level === 'Orta' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{ws.level || 'Tümü'} Seviye</span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{ws.title || ''}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 relative z-10">{ws.description || ''}</p>
                        </div>
                        
                        <div className="p-6 flex-grow space-y-4">
                          <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-2.5 rounded-xl"><Calendar className="w-5 h-5 mr-3 text-amber-600" /> {ws.date || '-'} | {ws.time || '-'}</div>
                          <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-2.5 rounded-xl"><User className="w-5 h-5 mr-3 text-amber-600" /> Eğitmen: <span className="font-bold ml-1 text-gray-900">{ws.instructor || 'Belirtilmemiş'}</span></div>
                          <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-2.5 rounded-xl"><Users className="w-5 h-5 mr-3 text-amber-600" /> Kontenjan: <span className={`font-black ml-1 ${isFull ? 'text-red-500' : 'text-green-600'}`}>{wsRes.length} / {Number(ws.capacity) || 1}</span></div>
                        </div>
                        
                        <div className="p-6 pt-0 mt-auto">
                          {isBooked ? (
                            <button disabled className="w-full bg-gray-50 text-gray-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-200"><CheckCircle className="w-5 h-5 text-green-500" /> Zaten Kayıtlısınız</button>
                          ) : isFull ? (
                            <button disabled className="w-full bg-red-50 text-red-500 py-3.5 rounded-xl font-bold border border-red-100">Kontenjan Dolu</button>
                          ) : (
                            <button onClick={() => handleBookWorkshop(ws.id)} className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold hover:bg-amber-700 transition shadow-md hover:shadow-lg active:scale-95">Hemen Kayıt Ol</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {studentTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-amber-200 transform rotate-3">
                  {safeUserName ? safeUserName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="pt-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{safeUserName}</h2>
                  <p className="text-gray-500 font-medium mt-1">Akademi Katılımcısı</p>
                </div>
                <div className="sm:ml-auto flex gap-6 pt-2">
                  <div className="text-center"><p className="text-3xl font-black text-amber-600">{myReservations.length}</p><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Kayıt</p></div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="text-center"><p className="text-3xl font-black text-green-600">{myReservations.filter(r=>r.certified).length}</p><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Sertifika</p></div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 border-b pb-4">Eğitim Yolculuğum</h3>
              
              {myWorkshops.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">Henüz hiçbir eğitime katılmadınız.</p>
              ) : (
                <div className="space-y-5">
                  {myWorkshops.map(ws => {
                    const myRes = myReservations.find(r => r.workshopId === ws.id);
                    const isCertified = myRes ? myRes.certified : false;
                    const isCompleted = ws.status === 'completed';
                    const hasReviewed = (reviews || []).some(r => r.workshopId === ws.id && r.userName === userName);

                    return (
                      <div key={ws.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{ws.category || ''}</span>
                            {isCompleted && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Tamamlandı</span>}
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{ws.title || ''}</h4>
                          <p className="text-sm font-medium text-gray-500"><Calendar className="w-4 h-4 inline mr-1.5 text-gray-400"/>{ws.date || '-'} | Eğitmen: {ws.instructor || '-'}</p>
                        </div>
                        
                        <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                          {isCompleted ? (
                            isCertified ? (
                              <div className="flex flex-col gap-2">
                                <button onClick={() => setSelectedCertificate(ws)} className="w-full bg-amber-100 text-amber-800 hover:bg-amber-200 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition"><Award className="w-5 h-5" /> Sertifikayı Gör</button>
                                {!hasReviewed ? (
                                  <button onClick={() => setReviewForm({...reviewForm, workshopId: ws.id})} className="text-sm font-bold text-gray-500 hover:text-amber-600 transition flex items-center justify-center gap-1"><Star className="w-4 h-4" /> Eğitimi Değerlendir</button>
                                ) : (
                                  <span className="text-xs font-bold text-gray-400 text-center block">✓ Değerlendirildi</span>
                                )}
                              </div>
                            ) : (
                              <div className="bg-gray-50 text-gray-500 py-3 px-6 rounded-xl font-bold text-sm border border-gray-200 text-center flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5"/> Katılım Sağlandı</div>
                            )
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="bg-blue-50 text-blue-600 py-3 px-6 rounded-xl font-bold text-sm border border-blue-100 text-center flex items-center justify-center gap-2"><Clock className="w-5 h-5"/> Eğitim Günü Bekleniyor</div>
                              <a href={generateGoogleCalendarLink(ws)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition flex items-center justify-center gap-1 bg-white border border-gray-200 py-2 rounded-lg">
                                <Calendar className="w-4 h-4" /> Takvime Ekle
                              </a>
                            </div>
                          )}
                        </div>

                        {reviewForm.workshopId === ws.id && (
                          <form onSubmit={handleSubmitReview} className="w-full md:w-full mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 col-span-full">
                            <h5 className="font-bold text-gray-800 mb-3 text-sm">Bu eğitimi nasıl buldunuz?</h5>
                            <div className="mb-4">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} type="button" onClick={() => setReviewForm({...reviewForm, rating: star})} className="transition-transform hover:scale-110">
                                    <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea required rows="2" placeholder="Eğitim, eğitmen veya ortam hakkındaki düşüncelerinizi yazın..." value={reviewForm.comment} onChange={(e)=>setReviewForm({...reviewForm, comment: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm mb-3"></textarea>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setReviewForm({workshopId:null, rating:5, comment:''})} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-lg">İptal</button>
                              <button type="submit" className="px-4 py-2 text-sm font-bold bg-gray-900 text-white hover:bg-black rounded-lg shadow-md">Gönder</button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminPanel = () => {
    const adminWorkshops = (workshops || []).filter(w => w.createdBy === userName);
    const totalStudents = adminWorkshops.reduce((acc, ws) => acc + (reservations || []).filter(r => r.workshopId === ws.id).length, 0);
    const totalCerts = adminWorkshops.reduce((acc, ws) => acc + (reservations || []).filter(r => r.workshopId === ws.id && r.certified).length, 0);
    
    const adminReviews = (reviews || []).filter(rev => adminWorkshops.some(ws => ws.id === rev.workshopId));
    const avgRating = adminReviews.length ? (adminReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / adminReviews.length).toFixed(1) : '-';

    return (
      <div className="flex-grow bg-gray-100 pb-10">
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center justify-between shadow-sm"><div className="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center"><Book className="w-7 h-7" /></div><div className="text-right"><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Açılan Eğitim</p><p className="text-4xl font-black text-gray-900">{adminWorkshops.length}</p></div></div>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center justify-between shadow-sm"><div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Users className="w-7 h-7" /></div><div className="text-right"><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Toplam Öğrenci</p><p className="text-4xl font-black text-amber-600">{totalStudents}</p></div></div>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center justify-between shadow-sm"><div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Award className="w-7 h-7" /></div><div className="text-right"><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Verilen Sertifika</p><p className="text-4xl font-black text-green-600">{totalCerts}</p></div></div>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center justify-between shadow-sm"><div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center"><Star className="w-7 h-7 fill-yellow-500" /></div><div className="text-right"><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Genel Puan</p><p className="text-4xl font-black text-gray-900">{avgRating}</p></div></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-200 sticky top-24">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><Plus className="w-6 h-6 text-amber-600" /> Yeni Eğitim Modülü</h2>
                <form onSubmit={handleAddWorkshop} className="space-y-4">
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Eğitim Başlığı *</label><input required type="text" value={newWorkshop.title} onChange={e => setNewWorkshop({...newWorkshop, title: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50 focus:bg-white transition" placeholder="Örn: İleri Seviye Latte Art" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori</label><select value={newWorkshop.category} onChange={e => setNewWorkshop({...newWorkshop, category: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50"><option>Latte Art</option><option>3. Nesil Demlemeler</option><option>Tadım (Cupping)</option><option>Temel Barista</option></select></div>
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Seviye</label><select value={newWorkshop.level} onChange={e => setNewWorkshop({...newWorkshop, level: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50"><option>Başlangıç</option><option>Orta</option><option>İleri</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tarih *</label><input required type="date" value={newWorkshop.date} onChange={e => setNewWorkshop({...newWorkshop, date: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50" /></div>
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saat *</label><input required type="time" value={newWorkshop.time} onChange={e => setNewWorkshop({...newWorkshop, time: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kontenjan *</label><input required type="number" min="1" value={newWorkshop.capacity} onChange={e => setNewWorkshop({...newWorkshop, capacity: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50" placeholder="Kişi" /></div>
                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Eğitmen *</label><input required type="text" value={newWorkshop.instructor} onChange={e => setNewWorkshop({...newWorkshop, instructor: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50" placeholder="Ad Soyad" /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Açıklama</label><textarea rows="3" value={newWorkshop.description} onChange={e => setNewWorkshop({...newWorkshop, description: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-gray-50" placeholder="Eğitim içeriği..."></textarea></div>
                  <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-black tracking-wide hover:bg-black transition shadow-lg hover:shadow-xl mt-6">EĞİTİMİ YAYINLA</button>
                </form>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><File className="w-6 h-6 text-amber-600" /> Operasyon Masası</h2>
                
                {adminWorkshops.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300 font-medium">Sol taraftaki formu kullanarak atölye oluşturmaya başlayın.</div>
                ) : (
                  <div className="space-y-6">
                    {adminWorkshops.map(ws => {
                      const wsReservations = (reservations || []).filter(r => r.workshopId === ws.id);
                      const wsReviews = (reviews || []).filter(r => r.workshopId === ws.id);
                      const isCompleted = ws.status === 'completed';
                      
                      return (
                        <div key={ws.id} className={`rounded-3xl border overflow-hidden transition-all ${isCompleted ? 'bg-gray-50 border-gray-200 opacity-90' : 'bg-white border-gray-200 shadow-sm'}`}>
                          <div className={`p-5 md:p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isCompleted ? 'bg-gray-100/50' : 'bg-gradient-to-r from-amber-50/50 to-white'}`}>
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="font-black text-xl text-gray-900">{ws.title ? ws.title : ''}</h3>
                                {isCompleted && <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Tamamlandı</span>}
                              </div>
                              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/>{ws.date ? ws.date : '-'} | {ws.time ? ws.time : '-'} <span className="mx-1">•</span> {ws.category ? ws.category : ''} <span className="mx-1">•</span> {ws.level ? ws.level : ''}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              {!isCompleted && <button onClick={() => handleCompleteWorkshop(ws, wsReservations)} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"><Award className="w-4 h-4"/> Eğitimi Tamamla</button>}
                              <button onClick={() => handleDeleteWorkshop(ws.id)} className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition border border-transparent hover:border-red-100" title="Sil"><X className="w-5 h-5" /></button>
                            </div>
                          </div>

                          <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-800 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-amber-500"/> Katılımcı Listesi</span>
                                <span className={`text-xs px-3 py-1 rounded-lg font-black ${wsReservations.length >= (Number(ws.capacity) || 1) ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>Kayıt: {wsReservations.length}/{Number(ws.capacity) || 1}</span>
                              </div>
                              
                              {wsReservations.length === 0 ? <p className="text-xs text-gray-400 italic bg-white border border-gray-100 p-4 rounded-xl text-center">Henüz kayıt yok.</p> : (
                                <div className="space-y-2">
                                  {wsReservations.map((res, index) => (
                                    <div key={res.id} className="flex items-center justify-between gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                      <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">{index + 1}</div>
                                        <p className="text-sm font-bold text-gray-800">{res.userName ? res.userName : 'Bilinmiyor'}</p>
                                      </div>
                                      {isCompleted && (
                                        <button onClick={() => handleToggleCertificate(res.id, res.certified)} className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 transition border ${res.certified ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}>
                                          <Award className="w-3 h-3" />{res.certified ? 'Sertifikalı' : 'Sertifika Ver'}
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-800 text-sm flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500"/> Geri Bildirimler</span>
                                {wsReviews.length > 0 && <span className="text-xs font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Ort: {(wsReviews.reduce((sum,r)=>sum+(Number(r.rating) || 0),0)/wsReviews.length).toFixed(1)}</span>}
                              </div>
                              
                              {wsReviews.length === 0 ? <p className="text-xs text-gray-400 italic bg-white border border-gray-100 p-4 rounded-xl text-center">Bu eğitim için henüz yorum yapılmamış.</p> : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                                  {wsReviews.map((rev) => (
                                    <div key={rev.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-gray-700">{rev.userName ? rev.userName : 'Bilinmiyor'}</span>
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= (Number(rev.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} />)}
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 italic">"{rev.comment ? rev.comment : ''}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemModalUI = () => {
    if (!systemModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{systemModal.title}</h3>
          <p className="text-gray-600 mb-8">{systemModal.message}</p>
          <div className="flex gap-3 justify-center">
            {systemModal.type === 'confirm' && <button onClick={() => setSystemModal(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">İptal</button>}
            <button onClick={() => { if (systemModal.type === 'confirm') systemModal.onConfirm(); else setSystemModal(null); }} className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition">
              {systemModal.type === 'confirm' ? 'Evet, Onaylıyorum' : 'Tamam'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificateModal = () => {
    if (!selectedCertificate) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #print-section, #print-section * { visibility: visible; }
            #print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; border: 4px double #92400e; }
          }
        `}</style>
        <div id="print-section" className="bg-white p-10 md:p-16 rounded-sm shadow-2xl max-w-3xl w-full relative border-8 border-double border-amber-800 text-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <button onClick={() => setSelectedCertificate(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl print:hidden">✕</button>
          <Award className="w-24 h-24 text-amber-600 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-serif text-amber-900 mb-2 uppercase tracking-widest">Başarı Sertifikası</h2>
          <p className="text-lg text-gray-600 italic mb-10">Bu belge, aşağıdaki katılımcının eğitimi başarıyla tamamladığını onaylar.</p>
          <h3 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-4 inline-block px-10">{userName}</h3>
          <p className="text-xl text-gray-700 mb-2">Başarıyla tamamlanan eğitim programı:</p>
          <h4 className="text-2xl font-bold text-amber-800 mb-10">"{selectedCertificate.title}"</h4>
          <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-300">
            <div className="text-left"><p className="font-bold text-gray-800 border-t border-gray-800 pt-2 inline-block px-4">Eğitmen: {selectedCertificate.instructor}</p></div>
            <div className="text-right"><p className="text-sm text-gray-500">Tarih: {selectedCertificate.date}</p><p className="text-sm text-gray-500">Workshop Saati Akademi</p></div>
          </div>
          <button onClick={() => window.print()} className="mt-10 bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto transition print:hidden">
            <Printer className="w-5 h-5" /> PDF Olarak Kaydet / Yazdır
          </button>
        </div>
      </div>
    );
  };

  return (
    <div translate="no" className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      {renderSiteHeader()}
      {renderSystemModalUI()}
      {renderCertificateModal()}
      <main className="flex-grow flex flex-col">
        {!role ? (
          publicTab === 'home' ? renderPublicHome() :
          publicTab === 'experiences' ? renderPublicExperiences() :
          publicTab === 'gallery' ? renderPublicGallery() :
          publicTab === 'blog' ? renderPublicBlog() :
          publicTab === 'about' ? renderPublicAbout() :
          renderLoginScreen()
        ) : (
          role === 'student' ? renderStudentPanel() : renderAdminPanel()
        )}
      </main>
      {renderSiteFooter()}
      {renderWhatsAppButton()}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}