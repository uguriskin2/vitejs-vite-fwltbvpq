import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, serverTimestamp, updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';

// --- İkonlar (Dış kütüphane çökmesini engellemek için doğrudan gömüldü) ---
const IconTarget = ({size=24, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconLock = ({size=18, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconLogOut = ({size=18, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconUser = ({size=24, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPlusCircle = ({size=20, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const IconLink = ({size=20, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconTrash2 = ({size=20, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconEdit = ({size=20, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconChevronLeft = ({size=32, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = ({size=32, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconDownload = ({size=20, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconPrinter = ({size=20, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconSmartphone = ({size=14, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IconBookOpen = ({size=40, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconClock = ({size=40, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheckCircle = ({size=32, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconXCircle = ({size=32, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconSend = ({size=40, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconActivity = ({size=64, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconActivitySmall = ({size=32, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconFileText = ({size=24, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconImage = ({size=24, className=""}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

// --- Firebase Yapılandırması ---
const firebaseConfig = {
  apiKey: "AIzaSyDLcdpVEUHpaUP2IgMuYeszaHmmhODcHH8",
  authDomain: "online-sinav-2026.firebaseapp.com",
  projectId: "online-sinav-2026",
  storageBucket: "online-sinav-2026.firebasestorage.app",
  messagingSenderId: "11871426342",
  appId: "1:11871426342:web:6dbcda4a5542f8b475ade7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'pro-sinav-cloud-v5';

// API Anahtarı
const apiKey = "AIzaSyC2MoW4mx8hnmJBgcLW4fCF4inv4hXbWBo"; 

const getInitialQuestion = () => ({ 
  text: '', 
  type: 'multiple-choice', 
  topic: '', 
  imageUrl: '', 
  options: ['', '', '', ''], 
  correct: 0, 
  correctText: '', 
  pairs: [{left: '', right: ''}, {left: '', right: ''}, {left: '', right: ''}] 
});

const getCorrectAnswerText = (q) => {
    if (q.type === 'multiple-choice') return String.fromCharCode(65 + q.correct) + " - " + q.options[q.correct];
    if (q.type === 'true-false') return q.correct === 0 ? 'DOĞRU' : 'YANLIŞ';
    if (q.type === 'short-answer') return q.correctText;
    if (q.type === 'matching') return q.pairs.map(p => `${p.left} ➔ ${p.right}`).join(" | ");
    return "";
};

const getGivenAnswerText = (q, ans) => {
    if (ans === undefined || ans === null || ans === '') return 'Boş Bırakıldı';
    if (q.type === 'multiple-choice') return String.fromCharCode(65 + ans) + " - " + q.options[ans];
    if (q.type === 'true-false') return ans === 0 ? 'DOĞRU' : 'YANLIŞ';
    if (q.type === 'short-answer') return String(ans);
    if (q.type === 'matching') {
        if (typeof ans === 'object') return Object.entries(ans).map(([k, v]) => `${k} ➔ ${v}`).join(" | ");
        return String(ans);
    }
    return String(ans);
};

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [isTeacher, setIsTeacher] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
  
  const ADMIN_PASSWORD = "admin123"; 

  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  
  const [newExam, setNewExam] = useState({ title: '', duration: 30, examCode: '', questions: [] });
  const [aiText, setAiText] = useState('');
  const [aiConfig, setAiConfig] = useState({ count: 10, types: ['multiple-choice'] });

  const [uploadData, setUploadData] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [pageRange, setPageRange] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(getInitialQuestion());
  const [editingQIdx, setEditingQIdx] = useState(null); 
  const [activeExam, setActiveExam] = useState(null);
  
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [studentExamCode, setStudentExamCode] = useState(''); 
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examResult, setExamResult] = useState(null); 

  const [selectedSubs, setSelectedSubs] = useState([]);

  const [cheatWarnings, setCheatWarnings] = useState(0);
  const isAway = useRef(false);

  useEffect(() => {
    const forceUnlock = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(forceUnlock);
  }, []);

  useEffect(() => {
    try {
      let id = localStorage.getItem('exam_device_id');
      if (!id) {
        id = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        localStorage.setItem('exam_device_id', id);
      }
      setDeviceId(id);

      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'student') setView('student');
    } catch (e) {}
  }, []);

  useEffect(() => {
      const handleAway = () => {
          if (view === 'exam' && !isAway.current) {
              isAway.current = true;
              setCheatWarnings(prev => prev + 1);
          }
      };

      const handleReturn = () => {
          if (view === 'exam' && isAway.current) {
              isAway.current = false;
          }
      };

      const onVisibilityChange = () => {
          if (document.hidden) handleAway();
          else handleReturn();
      };

      const onBlur = () => handleAway();
      const onFocus = () => handleReturn();

      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('blur', onBlur);
      window.addEventListener('focus', onFocus);

      return () => {
          document.removeEventListener('visibilitychange', onVisibilityChange);
          window.removeEventListener('blur', onBlur);
          window.removeEventListener('focus', onFocus);
      }
  }, [view]);

  useEffect(() => {
      if (view !== 'exam' || cheatWarnings === 0) return;

      if (cheatWarnings === 1) {
          showModal("🚨 Güvenlik Uyarısı (1/3)", "Sınav ekranından ayrıldığınız tespit edildi!\n\nBaşka sekmeye geçmek veya pencereyi küçültmek kural ihlalidir. 3 uyarı alırsanız sınavınız otomatik sonlandırılır.", "error");
      } else if (cheatWarnings === 2) {
          showModal("🚨 Son Uyarı (2/3)", "Sınav ekranından tekrar ayrıldınız!\n\nBir kez daha kural ihlali yaparsanız sınavınız iptal edilecek ve sıfır (0) puan verilecektir.", "error");
      } else if (cheatWarnings >= 3) {
          showModal("❌ Sınav Sonlandırıldı", "Kopya kurallarını üst üste ihlal ettiğiniz için sınavınız sistem tarafından otomatik olarak kapatıldı.", "error");
          handleFinishExam(true); 
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheatWarnings]);

  async function callGemini(prompt, systemInstruction = "", fileBase64 = null, mimeType = null) {
    const currentKey = geminiKey ? geminiKey.trim() : "";
    if (!currentKey) throw new Error("Lütfen 'AI Sihirbazı' panelindeki kutucuğa Google Gemini API Anahtarınızı girin.");
    if (currentKey === firebaseConfig.apiKey) throw new Error("DİKKAT: Kutucuğa yapay zeka yerine FIREBASE şifrenizi girdiniz! Lütfen aistudio.google.com adresinden YENİ bir anahtar alıp kutucuğa yapıştırın.");

    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-1.0-pro", "gemini-pro"];
    let errorLogs = [];

    for (const model of modelsToTry) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
            const combinedText = `SİSTEM YÖNERGESİ:\n${systemInstruction}\n\nKULLANICI TALEBİ:\n${prompt || "Ekli dosya veya metne göre soru üret."}`;
            const parts = [{ text: combinedText }];

            if (fileBase64 && mimeType) {
                const base64Data = fileBase64.split(',')[1];
                parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
            }

            const payload = { 
                contents: [{ parts }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            };
            
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData?.error?.message || errorData?.error?.status || `HTTP Hatası: ${response.status}`;
                if (errMsg.includes("API key not valid") || errMsg.includes("API key")) throw new Error("API_KEY_ERROR");
                throw new Error(errMsg);
            }
            
            const result = await response.json();
            if (result.promptFeedback && result.promptFeedback.blockReason) throw new Error(`Google Güvenlik Filtresi Engeli: ${result.promptFeedback.blockReason}`);
            if (result.candidates && result.candidates.length > 0) return result.candidates[0].content.parts[0].text;
            else throw new Error("Yapay Zeka soruyu hazırladı ancak boş yanıt döndürdü.");
        } catch (err) { 
            if (err.message === "API_KEY_ERROR") throw new Error("API_KEY_ERROR");
            errorLogs.push(`[${model}]: ${err.message}`);
        }
    }

    const combinedErrors = errorLogs.join(' ');
    if (combinedErrors.includes('high demand') || combinedErrors.includes('503')) {
        throw new Error("⏳ Google Yapay Zeka sunucularında şu an aşırı yoğunluk yaşanıyor. Lütfen 10-15 saniye bekleyip tekrar 'OLUŞTUR' butonuna basın.");
    }
    if (combinedErrors.includes('not found') || combinedErrors.includes('supported')) {
        throw new Error("Kullandığınız API Anahtarı mevcut modellere erişemiyor. Lütfen Google AI Studio üzerinden yeni bir ücretsiz anahtar oluşturup sisteme yapıştırın.");
    }
    
    throw new Error(`Google API Bağlantısı Başarısız Oldu.\n\nDetaylı Hata Kaydı:\n${errorLogs.join('\n\n')}`);
  }

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) {} };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => { if(isMounted) setUser(u || {uid: 'test-user'}); });
    return () => { isMounted = false; unsub(); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubExams = () => {};
    let unsubSubs = () => {};

    if (user) {
      const examsRef = collection(db, 'artifacts', appId, 'public', 'data', 'exams');
      unsubExams = onSnapshot(examsRef, (s) => {
        if(isMounted) { setExams(s.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }
      }, () => { if(isMounted) setLoading(false); });

      const subsRef = collection(db, 'artifacts', appId, 'public', 'data', 'submissions');
      unsubSubs = onSnapshot(subsRef, (s) => {
        if(isMounted) setSubmissions(s.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
    return () => { isMounted = false; unsubExams(); unsubSubs(); };
  }, [user]);

  useEffect(() => {
    let timer;
    if (view === 'exam' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (view === 'exam' && timeLeft === 0) {
      handleFinishExam(true); 
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, timeLeft]);

  const showModal = (title, message, type = 'info', onConfirm = null) => {
    setModal({ visible: true, title, message, type, onConfirm });
  };
  const closeModal = () => setModal({ ...modal, visible: false });

  const handleTeacherLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsTeacher(true); setShowPassModal(false); setView('teacher'); setPasswordInput('');
    } else showModal("Hata", "Yanlış şifre!", "error");
  };

  const handleCopyLink = (e, exam) => {
    e.stopPropagation();
    const link = window.location.origin + window.location.pathname + "?view=student";
    const text = `Sınava Giriş Linki: ${link}\nSınav Kodu: ${exam.examCode}`;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showModal("Kopyalandı", "Sınav linki ve GİRİŞ KODU panoya kopyalandı. Öğrencilerinize gönderebilirsiniz.", "success");
    } catch (err) { showModal("Hata", "Link kopyalanamadı.", "error"); }
    document.body.removeChild(textArea);
  };

  const handleEditExam = (exam) => {
    setNewExam(exam); 
    setCurrentQuestion(getInitialQuestion()); 
    setEditingQIdx(null); 
    setView('create'); 
  };

  const toggleAiType = (type) => {
    setAiConfig(prev => ({
      ...prev,
      types: prev.types.includes(type) ? (prev.types.length > 1 ? prev.types.filter(t => t !== type) : prev.types) : [...prev.types, type]
    }));
  };

  const processFile = (file) => {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) { 
          showModal("Hata", "Lütfen sadece PDF veya Resim (PNG, JPG) dosyası yükleyin.", "error"); 
          return; 
      }
      
      if (file.size > 5 * 1024 * 1024) { 
          showModal("Hata", "Dosya boyutu çok büyük. Lütfen en fazla 5MB olan bir dosya seçin.", "error"); 
          return; 
      }
      
      setUploadName(file.name && file.name !== 'image.png' ? file.name : 'Panodan_Kopyalanan_Resim.png');
      setUploadType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => { setUploadData(reader.result); };
      reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      processFile(file);
  };

  useEffect(() => {
      if (view !== 'create' || !isTeacher) return;

      const handlePaste = (e) => {
          const items = e.clipboardData?.items;
          if (!items) return;

          for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') !== -1) {
                  const file = items[i].getAsFile();
                  if (file) {
                      e.preventDefault(); 
                      processFile(file);
                      break;
                  }
              }
          }
      };

      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isTeacher]);

  const generateWithAI = async () => {
    if (!geminiKey || geminiKey.trim() === "") { showModal("API Anahtarı Eksik", "Lütfen AI Sihirbazı panelindeki kutucuğa Google Gemini API Anahtarınızı girin.", "error"); return; }
    if (!aiText.trim() && !uploadData) { showModal("Eksik", "Lütfen metin girin veya bir belge/resim yükleyin.", "error"); return; }
    
    setAiProcessing(true);
    try {
      const typeStr = aiConfig.types.join(", ");
      let instruction = `Sen profesyonel bir sınav hazırlayıcısın. Görevin verilen metinden veya ekli dosyadan tam olarak ${aiConfig.count} adet soru üretmektir. İstenilen soru türleri: ${typeStr}.`;

      instruction += `\nÖNEMLİ KURAL: Ekli dosyanın veya metnin orijinal dilini (İngilizce, Almanca, Türkçe vb.) tespit et ve soruları KESİNLİKLE METNİN ORİJİNAL DİLİNDE HAZIRLA. Metin İngilizce ise sorular ve şıklar İngilizce olmalı. Asla çeviri yapma!`;

      instruction += `\nÇOK ÖNEMLİ KURAL (GÖRSEL YASAĞI): Okuduğun PDF veya metindeki resimlere, grafiklere, tablolara veya numaralandırılmış görsellere atıfta bulunan ("Yukarıdaki görsele göre", "Şekil 1'de...", "Resimdeki" gibi) sorular KESİNLİKLE ÜRETME! Öğrenciler o görselleri göremeyecek. SADECE metinden, mantıktan veya genel kültürden çözülebilecek, görsele ihtiyaç duymayan sorular üret!`;

      if (uploadData && uploadType === 'application/pdf' && pageRange.trim()) { 
          instruction += `\nÖNEMLİ DİKKAT: Ekli PDF dosyasının SADECE şu sayfalarındaki veya şu kısımlarındaki bilgileri kullanarak soru üret: "${pageRange}"`; 
      }
      if (uploadData && uploadType.startsWith('image/')) {
          instruction += `\nÖNEMLİ DİKKAT: Lütfen ekli görseli (fotoğrafı) analiz ederek içindeki metin, grafik veya olaylara uygun, eğitim müfredatına uyan kaliteli sorular üret.`;
      }

      instruction += `\nYanıt SADECE VE SADECE geçerli bir JSON dizisi olmalıdır. JSON formatı dışında başında veya sonunda hiçbir metin, markdown (\`\`\`json) veya açıklama ekleme. JSON içindeki anahtarlar ve değerler mutlaka ÇİFT TIRNAK (") ile sarılmalıdır. Soru metni içinde tırnak işareti kullanman gerekirse mutlaka tek tırnak (') kullan, çift tırnak kullanma. Kesinlikle sondaki elemandan sonra fazladan virgül koyma. Format Örneği: [{"text": "Soru metni", "topic": "Konu", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correct": 0, "correctText": "", "pairs": [{"left": "Terim", "right": "Açıklama"}]}]`;
      
      const res = await callGemini(aiText, instruction, uploadData, uploadType);
      
      const cleanRes = res.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleanRes.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) throw new Error("Yapay zeka geçerli bir soru formatı (JSON) üretemedi. Lütfen işlemi tekrar başlatın.");

      try {
          const questions = JSON.parse(jsonMatch[0]);
          setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), ...questions] }));
          setAiText(''); setUploadData(null); setUploadName(''); setUploadType(''); setPageRange('');
      } catch (parseError) {
          throw new Error("Yapay zeka soruları yazarken noktalama kurallarına uymadı (Format Hatası). Lütfen 'Oluştur' butonuna tekrar basın.");
      }

    } catch (e) { 
        if (e.message === "API_KEY_ERROR") { showModal("Geçersiz Şifre", "Girdiğiniz API Anahtarı iptal edilmiş veya hatalı. Lütfen Google AI Studio'dan yeni bir anahtar alıp kutucuğa yapıştırın.", "error"); } 
        else if (e.message.includes("DEMO_MODE_TRIGGER")) {
             const demoQuestions = [
                 { text: "Türkiye'nin başkenti neresidir?", topic: "Coğrafya", type: "multiple-choice", options: ["İstanbul", "Ankara", "İzmir", "Antalya"], correct: 1, correctText: "", pairs: [{left: '', right: ''}] },
                 { text: "H2O hangi bileşiğin kimyasal formülüdür?", topic: "Kimya", type: "short-answer", options: ['', '', '', ''], correct: 0, correctText: "Su", pairs: [{left: '', right: ''}] },
                 { text: "Aşağıdaki tarihleri önemli olaylarla eşleştirin:", topic: "Tarih", type: "matching", options: ['', '', '', ''], correct: 0, correctText: "", pairs: [{left: "1923", right: "Cumhuriyetin İlanı"}, {left: "1920", right: "TBMM'nin Açılışı"}, {left: "1453", right: "İstanbul'un Fethi"}] }
             ];
             setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), ...demoQuestions] }));
             setAiText(''); setUploadData(null); setUploadName(''); setUploadType(''); setPageRange('');
             showModal("🚀 Örnek Sorular Yüklendi", "Sistem çalışıyor ancak girdiğiniz Google API şifresi şu an yetkisiz olduğu için gerçek yapay zeka bağlantısı kurulamadı.\n\nSistemi test edebilmeniz için taslağınıza otomatik olarak 'Örnek Sorular' eklendi. Sınavı yayınlayıp test edebilirsiniz!", "success");
        } else { showModal("Hata Oluştu", e.message || "Bilinmeyen bir hata oluştu.", "error"); }
    }
    finally { setAiProcessing(false); }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.text) return;
    
    const formattedQuestion = { ...currentQuestion, topic: currentQuestion.topic?.trim() || "Genel" };

    if (editingQIdx !== null) {
        const updatedQuestions = [...newExam.questions];
        updatedQuestions[editingQIdx] = formattedQuestion;
        setNewExam(prev => ({ ...prev, questions: updatedQuestions }));
        setEditingQIdx(null); 
    } else {
        setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), formattedQuestion] }));
    }
    setCurrentQuestion(getInitialQuestion()); 
  };

  const handleSaveExam = async () => {
    if (!newExam.title || !newExam.questions.length || !newExam.examCode) {
        showModal("Eksik Bilgi", "Lütfen Sınav Başlığı, Sınav Kodu ve en az bir soru eklediğinizden emin olun.", "error");
        return;
    }
    try {
      if (newExam.id) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', newExam.id), {
              title: newExam.title,
              duration: newExam.duration,
              examCode: newExam.examCode,
              questions: newExam.questions
          });
          showModal("Başarılı", "Sınav değişiklikleri başarıyla kaydedildi.", "success");
      } else {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), { ...newExam, createdAt: serverTimestamp(), userId: user.uid });
          showModal("Başarılı", "Yeni sınav başarıyla oluşturuldu.", "success");
      }
      
      setNewExam({ title: '', duration: 30, examCode: '', questions: [] });
      setView('teacher');
    } catch (e) { 
       showModal("Uyarı", "Bağlantı hatası: Sınav işleminiz gerçekleşmedi.", "error"); 
    }
  };

  const handleStudentStart = () => {
    if(!studentName || !studentNumber || !studentExamCode) {
        showModal("Eksik Bilgi", "Lütfen adınızı, numaranızı ve Sınav Kodunu eksiksiz girin.", "error");
        return;
    }
    
    const foundExam = exams.find(e => e.examCode && e.examCode.toUpperCase() === studentExamCode.toUpperCase());
    
    if (!foundExam) {
        showModal("Hatalı Kod", `"${studentExamCode}" koduna ait bir sınav bulunamadı.`, "error");
        return;
    }
    
    setCheatWarnings(0);
    isAway.current = false;
    
    const shuffledQuestions = shuffleArray(foundExam.questions || []);
    
    setActiveExam({...foundExam, questions: shuffledQuestions}); 
    setAnswers({}); 
    setTimeLeft(foundExam.duration * 60); 
    setView('exam');
  };

  const handleFinishExam = async (forceParam) => {
    if (!activeExam) return;
    const isForced = forceParam === true; 
    
    const unanswered = [];
    (activeExam.questions || []).forEach((q, idx) => {
        const ans = answers[idx];
        let isMissing = false;
        
        if (ans === undefined || ans === null) {
            isMissing = true;
        } else if (q.type === 'short-answer' && String(ans).trim() === '') {
            isMissing = true;
        } else if (q.type === 'matching') {
            if (typeof ans !== 'object') {
                isMissing = true;
            } else {
                const hasAll = q.pairs.every(p => ans[p.left] && String(ans[p.left]).trim() !== '');
                if (!hasAll) isMissing = true;
            }
        }
        
        if (isMissing) unanswered.push(idx + 1);
    });

    const submitData = async () => {
        const finalCheatCount = cheatWarnings;
        let totalEarned = 0;
        
        const questionDetails = (activeExam.questions || []).map((q, idx) => {
          const ans = answers[idx];
          let isCorrect = false;
          let earnedScore = 0;
          
          if (q.type === 'short-answer') {
              const normalize = (str) => (str || '').toLocaleLowerCase('tr-TR').replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();
              const correctNorm = normalize(q.correctText);
              const ansNorm = normalize(ans);
              
              if (!ansNorm) {
                  earnedScore = 0;
              } else if (correctNorm === ansNorm) {
                  earnedScore = 1;
              } else {
                  const correctWords = correctNorm.split(/\s+/).filter(w => w.length > 0);
                  const ansWords = ansNorm.split(/\s+/).filter(w => w.length > 0);
                  
                  if (correctWords.length === 0) {
                      earnedScore = 0;
                  } else {
                      const ansWordsSet = new Set(ansWords);
                      let matchCount = 0;
                      correctWords.forEach(cw => {
                          if (ansWordsSet.has(cw)) matchCount++;
                      });
                      earnedScore = matchCount / correctWords.length;
                  }
              }
              isCorrect = earnedScore === 1;
          }
          else {
              if (q.type === 'matching') isCorrect = q.pairs?.every(p => ans?.[p.left] === p.right);
              else isCorrect = parseInt(ans) === q.correct;
              earnedScore = isCorrect ? 1 : 0;
          }
          
          totalEarned += earnedScore;
          
          return { 
              topic: q.topic || 'Genel', 
              isCorrect,
              earnedScore,
              questionText: q.text,
              givenAnswerText: getGivenAnswerText(q, ans),
              correctAnswerText: getCorrectAnswerText(q)
          };
        });

        const finalScorePercentage = (totalEarned / activeExam.questions.length) * 100;

        const submissionData = {
            examId: activeExam.id, studentName, studentNumber, deviceId,
            score: finalScorePercentage, correctCount: totalEarned,
            totalQuestions: activeExam.questions.length, questionDetails, 
            submittedAt: new Date().toISOString(),
            cheatWarnings: finalCheatCount 
        };

        setExamResult({ ...submissionData, details: questionDetails });

        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), submissionData);
          setActiveExam(null); setAnswers({}); setStudentExamCode('');
          setView('result'); 
        } catch (e) {
          setSubmissions(prev => [...prev, {...submissionData, id: Date.now().toString()}]);
          setActiveExam(null); setAnswers({}); setStudentExamCode('');
          setView('result');
        }
    };

    if (!isForced && unanswered.length > 0) {
        showModal(
            "Cevapsız Sorularınız Var!", 
            `Şu soruları boş bıraktınız veya eksik cevapladınız:\n👉 Soru: ${unanswered.join(', ')}\n\nEksik sorularınız varken yine de sınavı bitirmek istiyor musunuz?`, 
            "confirm", 
            submitData
        );
    } else {
        submitData();
    }
  };

  const handleDeleteSubmission = (subId) => {
    showModal("Sonucu Sil", "Bu öğrencinin sınav sonucunu kalıcı olarak silmek istediğinize emin misiniz?", "confirm", async () => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', subId));
      } catch (error) {
        setSubmissions(prev => prev.filter(s => s.id !== subId));
      }
    });
  };

  const handleDeleteAllSubmissions = (examId) => {
    showModal("Tümünü Sil", "Bu sınava ait TÜM öğrenci sonuçlarını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.", "confirm", async () => {
      try {
        const subsToDelete = submissions.filter(s => s.examId === examId);
        for (const sub of subsToDelete) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', sub.id));
        }
        setSelectedSubs([]);
      } catch (error) {
        setSubmissions(prev => prev.filter(s => s.examId !== examId));
      }
    });
  };

  const toggleSubSelection = (subId) => {
    setSelectedSubs(prev => prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]);
  };

  const toggleAllSubs = (currentExamSubs) => {
    if (selectedSubs.length === currentExamSubs.length) {
        setSelectedSubs([]);
    } else {
        setSelectedSubs(currentExamSubs.map(s => s.id));
    }
  };

  const handleDeleteSelected = () => {
    showModal("Seçilenleri Sil", `${selectedSubs.length} adet öğrenci sonucunu kalıcı olarak silmek istediğinize emin misiniz?`, "confirm", async () => {
      try {
        for (const subId of selectedSubs) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', subId));
        }
        setSelectedSubs([]);
      } catch (error) {
        setSubmissions(prev => prev.filter(s => !selectedSubs.includes(s.id)));
        setSelectedSubs([]);
      }
    });
  };

  const handlePrint = () => {
    const content = document.getElementById('report-content');
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${activeExam?.title || 'Sınav Analiz Raporu'}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print { 
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
                            .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body class="p-8 bg-white text-slate-900">
                    <div class="max-w-4xl mx-auto">
                        <h2 class="text-3xl font-black mb-8 text-center uppercase tracking-tighter">${activeExam?.title || 'Sınav Raporu'}</h2>
                        ${content.innerHTML}
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close(); 
                        }, 1000);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    } else {
        showModal("Uyarı", "Tarayıcınız açılır pencereleri engelliyor. Lütfen adres çubuğundan izin verin.", "error");
    }
  };

  // YENİ: Excel Çıktısı - Artık CSV değil, doğrudan HTML Table mantığıyla .xls / .html uzantılı Excel tablosu oluşturur
  const handleExportExcel = () => {
    const examSubs = submissions.filter(s => s.examId === activeExam?.id);
    
    // Excel'in tabloyu ve Türkçe karakterleri doğru tanıması için HTML yapısı kuruluyor
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <!--[if gte mso 9]>
          <xml>
              <x:ExcelWorkbook>
                  <x:ExcelWorksheets>
                      <x:ExcelWorksheet>
                          <x:Name>Katilimcilar</x:Name>
                          <x:WorksheetOptions>
                              <x:DisplayGridlines/>
                          </x:WorksheetOptions>
                      </x:ExcelWorksheet>
                  </x:ExcelWorksheets>
              </x:ExcelWorkbook>
          </xml>
          <![endif]-->
      </head>
      <body>
          <table border="1">
              <thead>
                  <tr>
                      <th style="background-color: #4f46e5; color: white;">Öğrenci Adı Soyadı</th>
                      <th style="background-color: #4f46e5; color: white;">Okul Numarası</th>
                      <th style="background-color: #4f46e5; color: white;">Doğru Soru Sayısı</th>
                      <th style="background-color: #4f46e5; color: white;">Toplam Puanı</th>
                      <th style="background-color: #4f46e5; color: white;">Sınav Tarihi ve Saati</th>
                      <th style="background-color: #4f46e5; color: white;">Kural İhlali Sayısı</th>
                      <th style="background-color: #4f46e5; color: white;">Cihaz ID</th>
                  </tr>
              </thead>
              <tbody>
    `;

    examSubs.forEach(s => {
        tableHtml += `
            <tr>
                <td>${s.studentName || '-'}</td>
                <td>${s.studentNumber || '-'}</td>
                <td style="text-align: center;">${Number(s.correctCount).toFixed(1).replace('.0', '')}</td>
                <td style="text-align: center; font-weight: bold;">${Number(s.score).toFixed(0)}</td>
                <td>${s.submittedAt ? new Date(s.submittedAt).toLocaleString('tr-TR') : '-'}</td>
                <td style="text-align: center;">${s.cheatWarnings || 0}</td>
                <td style="color: #666;">${s.deviceId || '-'}</td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table></body></html>`;

    // Dosyayı oluştur ve indir
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sinav_Sonuclari_${activeExam?.examCode || 'Liste'}.xls`; // Excel uzantısı verildi
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTopicAnalysis = (examId) => {
    const examSubs = submissions.filter(s => s.examId === examId);
    if (examSubs.length === 0) return [];
    const stats = {};
    examSubs.forEach(sub => {
      (sub.questionDetails || []).forEach(d => {
        const tName = d.topic || 'Genel';
        if (!stats[tName]) stats[tName] = { correct: 0, total: 0 };
        stats[tName].total++;
        stats[tName].correct += (d.earnedScore !== undefined ? d.earnedScore : (d.isCorrect ? 1 : 0));
      });
    });
    return Object.keys(stats).map(name => ({ name, percentage: ((stats[name].correct / stats[name].total) * 100).toFixed(1) }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse bg-white text-xl sm:text-2xl uppercase tracking-tighter">Sistem Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <style>{`
        @media print { 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; } 
            .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      
      {modal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 border-t-8 border-indigo-600">
            <h3 className={`text-xl sm:text-2xl font-black mb-3 uppercase ${modal.type === 'error' ? 'text-red-600' : modal.type === 'success' ? 'text-green-600' : 'text-indigo-600'}`}>{modal.title}</h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium mb-8 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar whitespace-pre-wrap">{modal.message}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {modal.type === 'confirm' ? (
                <><button type="button" onClick={closeModal} className="flex-1 py-3 sm:py-4 font-bold text-slate-400">İptal</button><button type="button" onClick={() => { modal.onConfirm(); closeModal(); }} className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Onayla</button></>
              ) : <button type="button" onClick={closeModal} className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Tamam</button>}
            </div>
          </div>
        </div>
      )}

      {aiProcessing && <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm z-[200] flex flex-col items-center justify-center text-white print:hidden"><IconActivity size={64} className="animate-spin mb-4" /><p className="font-black uppercase tracking-widest text-center text-sm sm:text-base">DOSYA OKUNUYOR<br/>SORULAR ÜRETİLİYOR...</p></div>}

      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex items-center gap-2 font-black text-xl sm:text-2xl text-indigo-600 cursor-pointer" onClick={() => { setView('landing'); setExamResult(null); }}>
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg"><IconTarget size={24}/></div>
          <div className="flex flex-col">
            <span>SINAV<span className="text-slate-800">AI</span></span>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest lowercase -mt-1 hidden sm:block">uguriskin@gmail.com</span>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4">
          {!isTeacher ? (
            <button type="button" onClick={() => setShowPassModal(true)} className="flex items-center gap-1 sm:gap-2 font-bold text-slate-500 hover:text-indigo-600 transition-colors text-xs sm:text-base"><IconLock size={16}/> <span className="hidden sm:inline">Panel</span></button>
          ) : (
            <><button type="button" onClick={() => {
                setNewExam({ title: '', duration: 30, examCode: '', questions: [] });
                setEditingQIdx(null);
                setView('teacher');
            }} className="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-base">Yönetim</button><button type="button" onClick={() => { setIsTeacher(false); setView('landing'); setExamResult(null); }} className="flex items-center gap-1 sm:gap-2 font-bold text-red-500 px-2 transition-colors hover:text-red-700 text-xs sm:text-base"><IconLogOut size={16}/> <span className="hidden sm:inline">Çıkış</span></button></>
          )}
          <button type="button" onClick={() => { setView('student'); setExamResult(null); }} className="bg-indigo-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl font-black shadow-xl hover:bg-indigo-700 transition-all text-xs sm:text-base">SINAVA GİR</button>
        </div>
      </nav>

      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 max-w-sm w-full shadow-2xl text-center border-t-8 border-indigo-600">
            <h3 className="text-xl sm:text-2xl font-black mb-6 uppercase">Yönetici Girişi</h3>
            <input type="password" autoFocus className="w-full p-4 sm:p-5 bg-slate-50 border-none rounded-2xl sm:rounded-3xl outline-none ring-4 ring-transparent focus:ring-indigo-500 text-center mb-6 font-black text-xl sm:text-2xl tracking-widest" placeholder="••••" onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()} />
            <div className="flex gap-3"><button type="button" onClick={() => setShowPassModal(false)} className="flex-1 py-3 sm:py-4 font-bold text-slate-400 text-sm sm:text-base">İptal</button><button type="button" onClick={handleTeacherLogin} className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base">GİRİŞ YAP</button></div>
          </div>
        </div>
      )}

      <main className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1">
        {view === 'landing' && (
          <div className="text-center py-10 sm:py-20 animate-in fade-in zoom-in print:hidden px-4">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 leading-[1.1] sm:leading-[0.9] tracking-tighter uppercase text-slate-900">Bulut Tabanlı <br/><span className="text-indigo-600 underline decoration-indigo-200 decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 mt-2 inline-block">Akıllı Sınav</span></h2>
            <p className="text-sm sm:text-lg md:text-xl text-slate-400 mb-10 sm:mb-14 max-w-2xl mx-auto font-bold leading-relaxed px-4">Öğrencileriniz için hesap gerekmez. Sınavları AI ile hazırlayın, özel sınav koduyla güvenle paylaşın.</p>
            <button type="button" onClick={() => setView('student')} className="bg-indigo-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-full sm:rounded-[3rem] font-black text-lg sm:text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl sm:shadow-2xl flex items-center justify-center gap-3 sm:gap-4 mx-auto w-full sm:w-auto max-w-sm shadow-indigo-200"><IconUser size={28}/> SINAVA BAŞLA</button>
          </div>
        )}

        {view === 'teacher' && isTeacher && (
          <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-8 print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
              <div><h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase">Sınav Merkezi</h2><p className="text-indigo-600 font-bold uppercase text-[8px] sm:text-[10px] animate-pulse mt-1">PANEL AKTİF</p></div>
              <button type="button" onClick={() => {
                  setNewExam({ title: '', duration: 30, examCode: '', questions: [] });
                  setEditingQIdx(null);
                  setView('create');
              }} className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[2rem] font-black flex items-center justify-center gap-2 shadow-lg sm:shadow-2xl hover:bg-green-700 transition-all text-sm sm:text-base"><IconPlusCircle size={20}/> YENİ SINAV</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {exams.length === 0 ? (
                <div className="col-span-full border-2 sm:border-4 border-dashed rounded-2xl sm:rounded-[3rem] py-20 sm:py-32 text-center text-slate-300 sm:text-slate-200 font-black text-xl sm:text-3xl uppercase bg-white/50 border-slate-200 sm:border-slate-100">Henüz Sınav Yok</div>
              ) : exams.map(exam => {
                const examSubs = submissions.filter(s => s.examId === exam.id);
                const avg = examSubs.length > 0 ? (examSubs.reduce((a, b) => a + (Number(b?.score) || 0), 0) / examSubs.length).toFixed(1) : 0;
                return (
                  <div key={exam.id} className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] shadow-sm border border-slate-100 group relative hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all flex gap-1 sm:gap-2">
                       <button type="button" onClick={(e) => handleCopyLink(e, exam)} className="bg-white shadow-sm sm:shadow-md p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-indigo-500 hover:bg-indigo-50" title="Kodu ve Linki Kopyala"><IconLink size={18}/></button>
                       <button type="button" onClick={(e) => { e.stopPropagation(); handleEditExam(exam); }} className="bg-white shadow-sm sm:shadow-md p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-blue-500 hover:bg-blue-50" title="Sınavı Düzenle"><IconEdit size={18}/></button>
                       <button type="button" onClick={(e) => { e.stopPropagation(); showModal("Sil", "Bu sınav kalıcı olarak silinecek. Emin misiniz?", "confirm", () => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', exam.id))); }} className="bg-white shadow-sm sm:shadow-md p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-red-500 hover:bg-red-50" title="Sil"><IconTrash2 size={18}/></button>
                    </div>
                    <button type="button" onClick={() => { setActiveExam(exam); setView('analytics'); setSelectedSubs([]); }} className="text-left w-full h-full pt-8 lg:pt-0 pr-0 lg:pr-10">
                      <h3 className="font-black text-lg sm:text-2xl mb-2 line-clamp-2 sm:line-clamp-1 uppercase text-indigo-900 tracking-tight">{exam.title}</h3>
                      <p className="text-xs sm:text-sm font-bold text-indigo-500 mb-4 sm:mb-6 bg-indigo-50 inline-block px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-indigo-100">KOD: {exam.examCode}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-center mb-6 sm:mb-8">
                        <div className="bg-slate-50 p-2 rounded-xl sm:rounded-2xl border border-slate-100"><p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase">Soru</p><p className="font-black text-sm sm:text-base text-slate-700">{exam.questions?.length || 0}</p></div>
                        <div className="bg-green-50 p-2 rounded-xl sm:rounded-2xl border border-green-100"><p className="text-[7px] sm:text-[8px] font-black text-green-600 uppercase">Ort. Puan</p><p className="font-black text-sm sm:text-base text-green-700">{avg}</p></div>
                      </div>
                      <div className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-center font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors">Analizi Gör</div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'create' && isTeacher && (
          <div className="grid md:grid-cols-12 gap-6 sm:gap-8 animate-in slide-in-from-bottom-8 print:hidden">
            <div className="md:col-span-8 space-y-6">
               <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-[3.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10"><button type="button" onClick={() => setView('teacher')} className="p-2 sm:p-3 bg-stone-50 rounded-xl sm:rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><IconChevronLeft size={24}/></button><h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-stone-900">{newExam.id ? 'Sınavı Düzenle' : 'Sınav Tasarla'}</h2></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                     <input className="w-full sm:col-span-1 p-4 sm:p-5 bg-slate-50 rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-base outline-none shadow-inner border focus:border-indigo-500 transition-colors placeholder:text-slate-300" placeholder="BAŞLIK (Örn: Matematik)" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value.toUpperCase()})} />
                     <input className="w-full sm:col-span-1 p-4 sm:p-5 bg-slate-50 rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-base outline-none shadow-inner border focus:border-indigo-500 transition-colors placeholder:text-slate-300" type="number" placeholder="SÜRE (DK)" value={newExam.duration} onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value) || 0})} />
                     <input className="w-full sm:col-span-1 p-4 sm:p-5 bg-indigo-50 rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-base outline-none shadow-inner border-2 border-indigo-200 focus:border-indigo-500 transition-colors uppercase tracking-widest text-indigo-700 placeholder-indigo-300" placeholder="GİRİŞ KODU (Örn: MAT1)" value={newExam.examCode} onChange={e => setNewExam({...newExam, examCode: e.target.value.toUpperCase()})} />
                  </div>
                  
                  <div className="bg-indigo-900 rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 text-white shadow-xl sm:shadow-2xl mb-8 sm:mb-12">
                     <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8"><IconActivitySmall size={32} className="text-indigo-200" /><div><h3 className="text-lg sm:text-xl font-black uppercase tracking-widest leading-none">✨ AI Sihirbazı</h3><p className="text-[10px] sm:text-xs text-indigo-300 font-bold mt-0.5 sm:mt-1 uppercase">Belge ve Metinden Soru Üretin</p></div></div>
                     
                     <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase mb-1.5 sm:mb-2 block tracking-widest text-indigo-200">Google Gemini API Anahtarı <span className="text-red-400">*</span></label>
                        <input 
                            type="password" 
                            placeholder="AIzaSy ile başlayan anahtarınızı buraya yapıştırın..." 
                            value={geminiKey} 
                            onChange={e => { setGeminiKey(e.target.value); localStorage.setItem('gemini_api_key', e.target.value); }}
                            className="w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 outline-none text-xs sm:text-sm text-white focus:border-indigo-400 transition-colors placeholder:text-white/30"
                        />
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[9px] sm:text-[10px] text-indigo-400 hover:text-indigo-300 mt-1.5 sm:mt-2 inline-block font-bold">Ücretsiz API Anahtarı Al &rarr;</a>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
                        <div className="bg-indigo-800/30 p-3 sm:p-4 rounded-xl border border-indigo-700/50"><label className="text-[9px] sm:text-[10px] font-black uppercase mb-2 sm:mb-3 block text-indigo-200 tracking-widest">Soru Sayısı</label><div className="flex gap-1 sm:gap-2">{[5,10,20,40].map(n=><button type="button" key={n} onClick={()=>setAiConfig({...aiConfig, count:n})} className={"flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs transition-all " + (aiConfig.count===n?'bg-white text-indigo-900 shadow-md scale-105':'bg-white/10 hover:bg-white/20')}>{n}</button>)}</div></div>
                        <div className="bg-indigo-800/30 p-3 sm:p-4 rounded-xl border border-indigo-700/50"><label className="text-[9px] sm:text-[10px] font-black uppercase mb-2 sm:mb-3 block text-indigo-200 tracking-widest">Tür</label><div className="grid grid-cols-2 gap-1 sm:gap-2">{['multiple-choice','true-false','short-answer','matching'].map(t=><button type="button" key={t} onClick={()=>toggleAiType(t)} className={"py-2 rounded-lg sm:rounded-xl text-[7px] sm:text-[8px] font-black uppercase transition-all " + (aiConfig.types.includes(t)?'bg-white text-indigo-900 shadow-md scale-105':'bg-white/10 hover:bg-white/20')}>{t==='matching'?'Eşleş.':t==='true-false'?'D/Y':t==='short-answer'?'Kısa':'ABCD'}</button>)}</div></div>
                     </div>

                     <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                        <div className="bg-white/5 p-4 sm:p-5 rounded-xl sm:rounded-3xl border border-white/10">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-200">PDF / RESİM DOSYASINDAN ÜRET</span>
                                {uploadData && <button type="button" onClick={()=>{setUploadData(null);setUploadName('');setUploadType('');setPageRange('');}} className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"><IconTrash2 size={16}/></button>}
                            </div>
                            
                            {!uploadData ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed border-indigo-300/30 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-white/10 transition-all text-center px-4">
                                    <div className="flex gap-2 text-indigo-200 mb-1 sm:mb-2">
                                        <IconFileText size={20} />
                                        <IconImage size={20} />
                                    </div>
                                    <span className="text-indigo-200 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1 sm:mt-2">SEÇ, SÜRÜKLE VEYA YAPIŞTIR (CTRL+V)</span>
                                    <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFileUpload} />
                                </label>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-2 sm:gap-3 text-green-300 font-bold text-xs sm:text-sm bg-green-900/40 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-green-500/30">
                                        <IconCheckCircle size={16} />
                                        <span className="truncate">{uploadName}</span>
                                    </div>
                                    {uploadType === 'application/pdf' && (
                                        <input type="text" placeholder="Hangi sayfalar? (Örn: Sadece 12-15 arası)" value={pageRange} onChange={e=>setPageRange(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 outline-none text-xs sm:text-sm placeholder:text-white/40 text-white focus:border-indigo-400 transition-colors" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 opacity-30">
                            <div className="h-px bg-white flex-1"></div>
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">VEYA MANUEL METİN GİRİN</span>
                            <div className="h-px bg-white flex-1"></div>
                        </div>

                        <textarea className="w-full h-24 sm:h-28 bg-white/5 border border-white/10 rounded-xl sm:rounded-3xl p-4 sm:p-6 outline-none text-xs sm:text-sm shadow-inner placeholder:text-white/30 custom-scrollbar focus:border-indigo-400 transition-colors" placeholder="Ders notunu buraya yapıştırabilirsiniz..." value={aiText} onChange={e=>setAiText(e.target.value)} />
                     </div>

                     <button type="button" onClick={generateWithAI} disabled={aiProcessing || (!aiText.trim() && !uploadData)} className="w-full py-4 sm:py-5 bg-white text-indigo-900 rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2"><IconTarget size={20}/> SORULARI OLUŞTUR</button>
                  </div>

                  <div className={"p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] space-y-6 sm:space-y-8 border shadow-inner transition-colors " + (editingQIdx !== null ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200')}>
                    <h3 className={"font-black text-lg sm:text-xl uppercase tracking-widest " + (editingQIdx !== null ? 'text-indigo-900' : 'text-slate-800')}>
                        {editingQIdx !== null ? `${editingQIdx + 1}. Soruyu Düzenle` : 'Manuel Soru Ekle'}
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide">{['multiple-choice','true-false','short-answer','matching'].map(t=><button type="button" key={t} onClick={()=>setCurrentQuestion({...currentQuestion,type:t})} className={"px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase border-2 sm:border-4 transition-all whitespace-nowrap shrink-0 " + (currentQuestion.type===t?'bg-indigo-600 text-white border-indigo-600 shadow-md':'bg-white text-slate-400 border-slate-200 hover:border-indigo-300')}>{t==='multiple-choice'?'Çoktan Seçmeli':t==='true-false'?'Doğru / Yanlış':t==='short-answer'?'Kısa Cevap':'Eşleştirme'}</button>)}</div>
                    
                    <textarea className="w-full p-4 sm:p-6 bg-white rounded-xl sm:rounded-[2rem] shadow-sm outline-none font-bold sm:font-black text-sm sm:text-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 min-h-[100px]" placeholder="Soru metni..." value={currentQuestion.text} onChange={e=>setCurrentQuestion({...currentQuestion, text:e.target.value})} />
                    
                    <div className="flex items-center gap-2 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm focus-within:border-indigo-500 transition-all">
                        <IconImage size={18} className="text-slate-400" />
                        <input className="w-full font-bold text-xs sm:text-sm outline-none bg-transparent placeholder:text-slate-300" placeholder="İsteğe Bağlı Görsel: İnternetteki bir resmin linkini yapıştırın (https://...jpg)" value={currentQuestion.imageUrl || ''} onChange={e=>setCurrentQuestion({...currentQuestion, imageUrl:e.target.value})} />
                    </div>
                    
                    {currentQuestion.type === 'multiple-choice' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">{currentQuestion.options.map((opt,i)=><div key={i} className={"flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-colors " + (currentQuestion.correct===i ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100')}><input type="radio" checked={currentQuestion.correct===i} onChange={()=>setCurrentQuestion({...currentQuestion, correct:i})} className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" /><input className="w-full font-bold text-sm sm:text-base outline-none bg-transparent placeholder:text-slate-300" placeholder={String.fromCharCode(65+i) + " Şıkkı"} value={opt} onChange={e=>{const o=[...currentQuestion.options];o[i]=e.target.value;setCurrentQuestion({...currentQuestion,options:o});}} /></div>)}</div>}
                    
                    {currentQuestion.type === 'true-false' && <div className="flex flex-col sm:flex-row gap-4 sm:gap-6"><button type="button" onClick={() => setCurrentQuestion({ ...currentQuestion, correct: 0 })} className={"flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 font-black text-base sm:text-xl transition-all flex items-center justify-center gap-3 " + (currentQuestion.correct === 0 ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-[1.02]' : 'border-slate-200 bg-white text-slate-400 hover:border-green-300 hover:bg-green-50/50')}><IconCheckCircle size={20} className={currentQuestion.correct === 0 ? "text-green-600" : "opacity-40"}/> DOĞRU</button><button type="button" onClick={() => setCurrentQuestion({ ...currentQuestion, correct: 1 })} className={"flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 font-black text-base sm:text-xl transition-all flex items-center justify-center gap-3 " + (currentQuestion.correct === 1 ? 'border-red-500 bg-red-50 text-red-700 shadow-md scale-[1.02]' : 'border-slate-200 bg-white text-slate-400 hover:border-red-300 hover:bg-red-50/50')}><IconXCircle size={20} className={currentQuestion.correct === 1 ? "text-red-600" : "opacity-40"}/> YANLIŞ</button></div>}

                    {currentQuestion.type === 'short-answer' && <input className="w-full p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white shadow-sm outline-none text-center font-black text-lg sm:text-2xl border border-slate-200 focus:border-indigo-500 placeholder:text-slate-300" placeholder="DOĞRU CEVAP" value={currentQuestion.correctText} onChange={e=>setCurrentQuestion({...currentQuestion, correctText: e.target.value})} />}
                    
                    {currentQuestion.type === 'matching' && <div className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100">{currentQuestion.pairs.map((p,i)=><div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4"><input className="flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm sm:text-base focus:border-indigo-400 focus:bg-white transition-colors" placeholder="Sol İfade" value={p.left} onChange={e=>{const np=[...currentQuestion.pairs];np[i].left=e.target.value;setCurrentQuestion({...currentQuestion,pairs:np});}} /><div className="hidden sm:flex items-center justify-center text-slate-300"><IconChevronRight size={16}/></div><input className="flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm sm:text-base focus:border-indigo-400 focus:bg-white transition-colors" placeholder="Sağ İfade" value={p.right} onChange={e=>{const np=[...currentQuestion.pairs];np[i].right=e.target.value;setCurrentQuestion({...currentQuestion,pairs:np});}} /></div>)}</div>}
                    
                    <button type="button" onClick={handleAddQuestion} className={"w-full text-white py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 " + (editingQIdx !== null ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg' : 'bg-slate-900 hover:bg-indigo-600')}><IconPlusCircle size={18}/> {editingQIdx !== null ? 'Soruyu Güncelle' : 'Taslağa Ekle'}</button>
                    {editingQIdx !== null && (
                        <button type="button" onClick={() => { setCurrentQuestion(getInitialQuestion()); setEditingQIdx(null); }} className="w-full text-slate-500 py-3 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors">Düzenlemeyi İptal Et</button>
                    )}
                  </div>
               </div>
            </div>
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[3.5rem] shadow-sm border border-slate-100 sticky top-24">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
                     <div>
                         <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tighter text-slate-900">Taslak</h3>
                         <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mt-1">{newExam.questions.length} Soru Eklendi</p>
                     </div>
                     <button type="button" onClick={handleSaveExam} className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-black shadow-md hover:shadow-lg disabled:opacity-40 hover:bg-green-700 transition-all flex items-center justify-center gap-2" disabled={newExam.questions.length===0}><IconSend size={16}/> {newExam.id ? 'GÜNCELLE' : 'YAYINLA'}</button>
                 </div>
                 <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {newExam.questions.length===0 && <div className="py-12 sm:py-20 text-center text-slate-300 font-black italic border-2 sm:border-4 border-dashed rounded-xl sm:rounded-[2.5rem] uppercase tracking-widest text-xs sm:text-base"><IconBookOpen size={40} className="mx-auto mb-3 sm:mb-4 opacity-50"/> BOŞ</div>}
                  {newExam.questions.map((q,i)=>(
                      <div key={i} className={"p-4 sm:p-5 rounded-xl sm:rounded-[2rem] border relative group transition-all " + (editingQIdx === i ? 'bg-indigo-50 border-indigo-300 shadow-md' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-sm')}>
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                              <span className="text-[7px] sm:text-[9px] font-black bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 rounded-md uppercase tracking-wider">{q.type === 'multiple-choice' ? 'TEST' : q.type === 'short-answer' ? 'KISA' : q.type === 'true-false' ? 'D/Y' : 'EŞLEŞTİR'}</span>
                              <div className="flex gap-1">
                                  <button type="button" onClick={()=>{ setCurrentQuestion(q); setEditingQIdx(i); }} className="text-slate-300 hover:text-blue-500 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 transition-colors"><IconEdit size={14}/></button>
                                  <button type="button" onClick={()=>{
                                      if(editingQIdx === i) { setCurrentQuestion(getInitialQuestion()); setEditingQIdx(null); }
                                      else if (editingQIdx > i) { setEditingQIdx(prev => prev - 1); }
                                      setNewExam({...newExam, questions:newExam.questions.filter((_,idx)=>idx!==i)})
                                  }} className="text-slate-300 hover:text-red-500 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 transition-colors"><IconTrash2 size={14}/></button>
                              </div>
                          </div>
                          <p className={"text-[10px] sm:text-xs font-bold line-clamp-3 leading-snug " + (editingQIdx === i ? 'text-indigo-900' : 'text-slate-700')}>{i+1}. {q.text}</p>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- YÖNETİCİ ANALİZ PANELİ (Tümünü Sil ve Tekil Silme Özelliği Eklendi) --- */}
        {view === 'analytics' && activeExam && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
              <div className="flex items-center gap-3 sm:gap-4"><button type="button" onClick={() => setView('teacher')} className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-3xl text-slate-400 shadow-sm sm:shadow-xl border border-slate-100 hover:scale-105 active:scale-95 transition-all"><IconChevronLeft size={24}/></button><h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight line-clamp-1">{activeExam.title}</h2></div>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto"><button type="button" onClick={handleExportCSV} className="flex-1 sm:flex-none justify-center bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all"><IconDownload size={16}/> YEDEKLE</button><button type="button" onClick={handlePrint} className="flex-1 sm:flex-none justify-center bg-slate-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-800 shadow-md transition-all"><IconPrinter size={16}/> <span className="hidden sm:inline">YAZDIR /</span> PDF</button></div>
            </div>
            
            <div id="report-content" className="space-y-6 sm:space-y-8 print:m-0 print:p-0">
              <div className="grid md:grid-cols-12 gap-6 sm:gap-8">
                 <div className="md:col-span-4 space-y-6 sm:space-y-8">
                    <div className="bg-white rounded-2xl sm:rounded-[4rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                      <h3 className="font-black text-base sm:text-lg mb-6 sm:mb-8 uppercase text-slate-400 tracking-widest flex items-center gap-2"><IconActivity size={18}/> Konu Analizi</h3>
                      <div className="space-y-4 sm:space-y-6">{getTopicAnalysis(activeExam.id).map((t, i) => (<div key={i}><div className="flex justify-between text-[9px] sm:text-[10px] font-black mb-1.5 sm:mb-2 uppercase text-indigo-900 tracking-wider"><span>{t.name}</span><span>%{t.percentage}</span></div><div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-200"><div className="bg-indigo-600 h-full transition-all duration-1000 ease-out" style={{width: t.percentage + "%"}}></div></div></div>))}</div>
                      {getTopicAnalysis(activeExam.id).length === 0 && <div className="text-center py-8 sm:py-12 border-2 border-dashed border-slate-100 rounded-xl sm:rounded-3xl"><p className="text-slate-300 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Henüz yeterli veri yok</p></div>}
                    </div>
                    <div className="bg-indigo-600 rounded-2xl sm:rounded-[4rem] p-8 sm:p-10 text-white text-center shadow-lg sm:shadow-2xl relative overflow-hidden break-inside-avoid">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><IconTarget size={100}/></div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase opacity-70 mb-2 sm:mb-4 tracking-widest relative z-10">Sınıf Ortalaması</p>
                        <p className="text-6xl sm:text-8xl font-black tracking-tighter relative z-10">{ (submissions.filter(s=>s.examId===activeExam.id).reduce((a,b)=>a+(Number(b?.score)||0),0)/(submissions.filter(s=>s.examId===activeExam.id).length||1)).toFixed(1) }</p>
                    </div>
                 </div>
                 <div className="md:col-span-8 bg-white rounded-2xl sm:rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-black text-lg sm:text-xl uppercase tracking-tighter text-slate-800 flex items-center gap-2"><IconUser size={20} className="text-indigo-500"/> Katılımcı Listesi</h3>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-[9px] sm:text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full uppercase tracking-widest border border-indigo-100">{submissions.filter(s=>s.examId===activeExam.id).length} Kişi</span>
                            
                            {selectedSubs.length > 0 && (
                                <button type="button" onClick={handleDeleteSelected} className="text-[9px] sm:text-[10px] font-black bg-red-500 text-white hover:bg-red-600 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full uppercase tracking-widest transition-colors flex items-center gap-1 print:hidden shadow-sm">
                                    <IconTrash2 size={12}/> Seçilenleri Sil ({selectedSubs.length})
                                </button>
                            )}

                            {submissions.filter(s=>s.examId===activeExam.id).length > 0 && selectedSubs.length === 0 && (
                                <button type="button" onClick={() => handleDeleteAllSubmissions(activeExam.id)} className="text-[9px] sm:text-[10px] font-black bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full uppercase tracking-widest border border-red-100 transition-colors flex items-center gap-1 print:hidden">
                                    <IconTrash2 size={12}/> Tümünü Sil
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                            <thead className="bg-slate-50 border-b uppercase text-[8px] sm:text-[10px] font-black text-slate-400 tracking-widest">
                                <tr>
                                    <th className="p-4 sm:p-6 text-center font-bold text-slate-300 print:hidden w-16">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span>Seç</span>
                                            <input type="checkbox" checked={selectedSubs.length === submissions.filter(s=>s.examId===activeExam.id).length && submissions.filter(s=>s.examId===activeExam.id).length > 0} onChange={() => toggleAllSubs(submissions.filter(s=>s.examId===activeExam.id))} className="w-4 h-4 cursor-pointer accent-indigo-600" />
                                        </div>
                                    </th>
                                    <th className="p-4 sm:p-6 font-bold">Öğrenci Bilgileri</th>
                                    <th className="p-4 sm:p-6 text-center font-bold">Doğru / Toplam</th>
                                    <th className="p-4 sm:p-6 text-center font-bold">Puan</th>
                                    <th className="p-4 sm:p-6 text-center font-bold text-red-400">İhlal</th>
                                    <th className="p-4 sm:p-6 text-center font-bold">Tarih / Saat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold sm:font-black text-slate-800">
                                {submissions.filter(s=>s.examId===activeExam.id).length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-300 text-sm">Henüz sınava giren öğrenci yok.</td></tr>}
                                {submissions.filter(s=>s.examId===activeExam.id).map((sub, i) => (
                                    <tr key={i} className={"transition-colors " + (selectedSubs.includes(sub.id) ? 'bg-indigo-50/50' : 'hover:bg-indigo-50/30')}>
                                        <td className="p-4 sm:p-6 text-center print:hidden w-16">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <input type="checkbox" checked={selectedSubs.includes(sub.id)} onChange={() => toggleSubSelection(sub.id)} className="w-5 h-5 cursor-pointer accent-indigo-600 shadow-sm" />
                                                <button type="button" onClick={() => handleDeleteSubmission(sub.id)} className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm" title="Bu öğrenciyi sil">
                                                    <IconTrash2 size={14}/>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-6"><div className="text-base sm:text-xl tracking-tight uppercase text-indigo-900 mb-0.5">{sub.studentName}</div><div className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Numara: {sub.studentNumber}</div></td>
                                        <td className="p-4 sm:p-6 text-center text-slate-500 font-mono text-sm sm:text-base">{Number(sub.correctCount).toFixed(1).replace('.0', '')} <span className="text-slate-300">/</span> {sub.totalQuestions}</td>
                                        <td className="p-4 sm:p-6 text-center"><span className={"inline-block px-3 sm:px-5 py-1 sm:py-1.5 bg-white border-2 sm:border-4 rounded-full text-xs sm:text-sm shadow-sm font-black " + (Number(sub.score) >= 50 ? 'border-green-100 text-green-600' : 'border-red-100 text-red-500')}>{Number(sub.score).toFixed(0)}</span></td>
                                        <td className="p-4 sm:p-6 text-center"><span className={"inline-block px-3 py-1 bg-white border rounded-full text-xs font-black " + ((sub.cheatWarnings || 0) > 0 ? 'border-red-200 text-red-600' : 'border-slate-100 text-slate-300')}>{sub.cheatWarnings || 0} Kez</span></td>
                                        <td className="p-4 sm:p-6 text-center text-xs sm:text-sm text-slate-500 font-bold">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
              </div>

              {/* PDF İÇİN DETAYLI ÖĞRENCİ CEVAP KAĞITLARI BÖLÜMÜ */}
              {submissions.filter(s=>s.examId===activeExam.id).length > 0 && (
                  <div className="pt-12 sm:pt-16 mt-8 sm:mt-12 border-t-2 border-dashed border-slate-200">
                      <h3 className="font-black text-2xl sm:text-3xl uppercase tracking-tighter text-slate-800 mb-8 sm:mb-10 text-center print:text-left print:mt-10">Öğrenci Cevap Kağıtları</h3>
                      <div className="space-y-8 sm:space-y-12">
                          {submissions.filter(s=>s.examId===activeExam.id).map((sub, i) => (
                              <div key={i} className="bg-white border-2 border-slate-100 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-sm break-inside-avoid">
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-slate-50 pb-4 sm:pb-6 mb-6 sm:mb-8 gap-4 sm:gap-0">
                                      <div>
                                          <h4 className="font-black text-xl sm:text-2xl text-indigo-900 uppercase tracking-tight">{sub.studentName}</h4>
                                          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 flex flex-wrap items-center gap-1">Öğrenci No: {sub.studentNumber} • PUAN: {Number(sub.score).toFixed(0)} • KURAL İHLALİ: {sub.cheatWarnings || 0} • TARİH: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : '-'}</p>
                                      </div>
                                      <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                                          <p className="text-xs sm:text-sm font-black text-slate-700">{Number(sub.correctCount).toFixed(1).replace('.0', '')} Doğru Puan <span className="text-slate-300 mx-1">/</span> {sub.totalQuestions} Soru</p>
                                          <button type="button" onClick={() => handleDeleteSubmission(sub.id)} className="p-1.5 sm:p-2 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all print:hidden" title="Bu öğrencinin sonucunu sil">
                                              <IconTrash2 size={14}/>
                                          </button>
                                      </div>
                                  </div>
                                  <div className="space-y-4 sm:space-y-6">
                                      {(sub.questionDetails || []).map((qd, qIdx) => {
                                          const finalEarned = qd.earnedScore !== undefined ? qd.earnedScore : (qd.isCorrect ? 1 : 0);
                                          return (
                                          <div key={qIdx} className="bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/60">
                                              <p className="text-sm sm:text-base font-black text-slate-800 mb-3 sm:mb-4 uppercase leading-snug">{qIdx + 1}. {qd.questionText}</p>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                  <div className={"p-3 sm:p-4 rounded-xl border-2 flex flex-col " + (finalEarned === 1 ? "bg-green-50/50 border-green-100 text-green-800" : (finalEarned > 0 ? "bg-amber-50/50 border-amber-100 text-amber-800" : "bg-red-50/50 border-red-100 text-red-800"))}>
                                                      <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">Öğrencinin Cevabı</span>
                                                      <span className="font-black text-xs sm:text-sm">{qd.givenAnswerText} {finalEarned === 1 ? "✅" : (finalEarned > 0 ? `⚠️ Kısmi Puan (%${Math.round(finalEarned * 100)})` : "❌")}</span>
                                                  </div>
                                                  {finalEarned < 1 && (
                                                      <div className="p-3 sm:p-4 rounded-xl border-2 bg-indigo-50/30 border-indigo-100 text-indigo-800 flex flex-col">
                                                          <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">Beklenen Cevap</span>
                                                          <span className="font-black text-xs sm:text-sm">{qd.correctAnswerText}</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )})}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* ÖĞRENCİ KOD GİRİŞ EKRANI */}
        {view === 'student' && (
          <div className="max-w-lg mx-auto py-6 sm:py-12 animate-in fade-in zoom-in duration-500 no-print px-4">
             <div className="bg-white p-8 sm:p-12 md:p-16 rounded-3xl sm:rounded-[4rem] shadow-xl sm:shadow-2xl border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-indigo-50 to-transparent"></div>
                <div className="bg-indigo-600 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center text-white mb-6 sm:mb-10 shadow-lg sm:shadow-2xl relative z-10 transform -rotate-3"><IconUser size={40} className="sm:w-12 sm:h-12"/></div>
                
                <h2 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-4 uppercase tracking-tighter text-stone-900 relative z-10">Sınav Girişi</h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mb-8 sm:mb-10 relative z-10">Öğretmeninizin size verdiği kodu girin.</p>
                
                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 relative z-10">
                    <input className="w-full p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-[2rem] text-center font-black text-lg sm:text-2xl shadow-inner outline-none focus:ring-2 sm:focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300" placeholder="AD SOYAD" value={studentName} onChange={e => setStudentName(e.target.value.toUpperCase())} />
                    <input className="w-full p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-[2rem] text-center font-black text-base sm:text-xl shadow-inner outline-none focus:ring-2 sm:focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all uppercase tracking-widest placeholder:text-slate-300" placeholder="OKUL NUMARASI" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} />
                    
                    <div className="pt-2 sm:pt-4">
                        <input className="w-full p-4 sm:p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl sm:rounded-[2rem] text-center font-black text-xl sm:text-3xl shadow-inner outline-none focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-500/20 transition-all uppercase tracking-[0.2em] text-indigo-700 placeholder-indigo-300" placeholder="SINAV KODU" value={studentExamCode} onChange={e => setStudentExamCode(e.target.value.toUpperCase())} />
                    </div>
                </div>

                <button type="button" onClick={handleStudentStart} className="w-full bg-indigo-600 text-white py-5 sm:py-6 rounded-xl sm:rounded-[3rem] font-black text-xl sm:text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl sm:shadow-2xl flex items-center justify-center gap-3 relative z-10">
                    BAŞLA <IconChevronRight size={28} />
                </button>
             </div>
          </div>
        )}

        {/* ÖĞRENCİ SINAV SONUÇ / KARNE EKRANI */}
        {view === 'result' && examResult && (
          <div className="max-w-3xl mx-auto py-6 sm:py-12 animate-in slide-in-from-bottom-8 no-print px-4">
             <div className="bg-white p-8 sm:p-16 rounded-3xl sm:rounded-[4rem] shadow-xl sm:shadow-2xl border border-slate-100 text-center relative overflow-hidden">
                
                <h2 className="text-4xl sm:text-5xl font-black mb-2 uppercase tracking-tighter text-stone-900">Sınav Bitti!</h2>
                <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest mb-10">Tebrikler {examResult.studentName}, yanıtların kaydedildi.</p>
                
                <div className="flex justify-center mb-12">
                   <div className={"w-40 h-40 sm:w-48 sm:h-48 rounded-[3rem] flex flex-col items-center justify-center shadow-inner border-8 " + (examResult.score >= 50 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600')}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">PUAN</span>
                      <span className="text-5xl sm:text-6xl font-black tracking-tighter">{examResult.score.toFixed(0)}</span>
                   </div>
                </div>

                <div className="flex justify-center gap-4 sm:gap-8 mb-12">
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100"><p className="text-2xl font-black text-slate-800">{Number(examResult.correctCount).toFixed(1).replace('.0', '')}</p><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Doğru Puanı</p></div>
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100"><p className="text-2xl font-black text-slate-800">{(examResult.totalQuestions - examResult.correctCount).toFixed(1).replace('.0', '')}</p><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Kayıp Puan</p></div>
                </div>

                <div className="text-left space-y-6 sm:space-y-8 border-t-2 border-dashed border-slate-200 pt-10 sm:pt-12">
                    <h3 className="font-black text-xl sm:text-2xl uppercase text-slate-800 mb-6 text-center">Cevap Kağıdın</h3>
                    {examResult.details.map((qd, qIdx) => {
                        const finalEarned = qd.earnedScore !== undefined ? qd.earnedScore : (qd.isCorrect ? 1 : 0);
                        return (
                        <div key={qIdx} className="bg-slate-50 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200">
                            <p className="text-sm sm:text-base font-black text-slate-800 mb-4 uppercase leading-snug">{qIdx + 1}. {qd.questionText}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className={"p-3 sm:p-4 rounded-xl border-2 flex flex-col " + (finalEarned === 1 ? "bg-green-50 border-green-200 text-green-700" : (finalEarned > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"))}>
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">Senin Cevabın</span>
                                    <span className="font-black text-xs sm:text-sm">{qd.givenAnswerText} {finalEarned === 1 ? "✅" : (finalEarned > 0 ? `⚠️ Kısmi Puan (%${Math.round(finalEarned * 100)})` : "❌")}</span>
                                </div>
                                {finalEarned < 1 && (
                                    <div className="p-3 sm:p-4 rounded-xl border-2 bg-indigo-50 border-indigo-200 text-indigo-700 flex flex-col">
                                        <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">Beklenen Cevap</span>
                                        <span className="font-black text-xs sm:text-sm">{qd.correctAnswerText}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                </div>

                <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-100">
                    <button type="button" onClick={() => { setView('student'); setExamResult(null); }} className="bg-slate-900 text-white px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-sm sm:text-lg shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest w-full sm:w-auto">Ana Sayfaya Dön</button>
                </div>
             </div>
          </div>
        )}

        {/* KOPYA KORUMALI AKTİF SINAV EKRANI */}
        {view === 'exam' && activeExam && (
          <div 
            className="max-w-4xl mx-auto pb-20 sm:pb-32 animate-in slide-in-from-right no-print select-none"
            onCopy={(e) => { e.preventDefault(); showModal("Yasak", "Sınavda kopyalama işlemi kural ihlalidir.", "error"); }}
            onPaste={(e) => { e.preventDefault(); showModal("Yasak", "Sınavda yapıştırma işlemi kural ihlalidir.", "error"); }}
            onContextMenu={(e) => e.preventDefault()}
          >
             <div className="bg-slate-900 text-white p-6 sm:p-12 rounded-t-3xl sm:rounded-t-[5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 sticky top-0 sm:top-20 z-40 shadow-2xl border-b-4 border-indigo-500/30">
                <div>
                    <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-indigo-300 mb-2">{activeExam.title}</h2>
                    <div className="flex items-center gap-3"><div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center"><IconUser size={12}/></div><p className="text-slate-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{studentName} <span className="opacity-50 mx-1">|</span> {studentNumber}</p></div>
                </div>
                <div className={"w-full sm:w-auto flex justify-center sm:justify-start px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-2xl font-mono text-xl sm:text-2xl bg-black/40 items-center gap-2 sm:gap-3 border border-white/10 transition-colors shadow-inner " + (timeLeft < 60 ? 'text-red-400 bg-red-900/20 border-red-500/50 animate-pulse' : 'text-white')}><IconClock size={20} className="opacity-50" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
             </div>
             <div className="bg-white p-6 sm:p-10 md:p-16 rounded-b-3xl sm:rounded-b-[5rem] shadow-xl sm:shadow-2xl space-y-16 sm:space-y-24 border-x border-b border-slate-200">
                {(activeExam.questions || []).map((q, qIdx) => (
                   <div key={qIdx} className="space-y-8 sm:space-y-12 pb-16 sm:pb-24 border-b last:border-0 border-slate-100 relative">
                      <div className="flex flex-col md:flex-row gap-6 sm:gap-10">
                         <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-lg sm:shadow-xl transform -rotate-3 border-b-4 border-indigo-800">{qIdx + 1}</div>
                         <div className="flex-1 w-full mt-2 sm:mt-0">
                            <div className="flex flex-col items-start gap-3 sm:gap-4 mb-6 sm:mb-10">
                                <span className="text-[8px] sm:text-[10px] font-black bg-slate-100 text-slate-500 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full uppercase tracking-widest border border-slate-200 flex items-center gap-1.5"><IconBookOpen size={12}/> {q.topic || 'Genel'}</span>
                                <p className="text-lg sm:text-2xl md:text-3xl font-black text-stone-800 leading-snug sm:leading-tight uppercase tracking-tight">{q.text}</p>
                            </div>
                            
                            {q.imageUrl && <div className="mb-8 sm:mb-12 rounded-2xl sm:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center p-4"><img src={q.imageUrl} className="max-h-[300px] sm:max-h-[500px] w-full object-contain rounded-xl" alt="Soru Görseli" /></div>}
                            
                            {q.type === 'multiple-choice' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">{q.options.map((opt, oIdx) => (<button type="button" key={oIdx} onClick={() => setAnswers({...answers, [qIdx]: oIdx})} className={"p-4 sm:p-6 text-left rounded-xl sm:rounded-[2rem] border-2 sm:border-4 font-black transition-all flex justify-between items-center group relative overflow-hidden " + (answers[qIdx] === oIdx ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl scale-[1.02] transform' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-500 hover:text-slate-800')}><span className="text-sm sm:text-lg flex items-center gap-3 sm:gap-4 z-10"><span className={"w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl font-black text-base sm:text-xl transition-colors " + (answers[qIdx] === oIdx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600')}>{String.fromCharCode(65 + oIdx)}</span> <span className="leading-tight">{opt}</span></span>{answers[qIdx] === oIdx && <IconCheckCircle className="text-white z-10 shrink-0" size={24} />}{answers[qIdx] === oIdx && <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent"></div>}</button>))}</div>}
                            
                            {q.type === 'true-false' && <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">{['DOĞRU','YANLIŞ'].map((opt, oIdx) => (<button type="button" key={oIdx} onClick={() => setAnswers({...answers, [qIdx]: oIdx})} className={"flex-1 p-6 sm:p-8 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 font-black text-lg sm:text-2xl transition-all flex items-center justify-center gap-3 sm:gap-4 " + (answers[qIdx] === oIdx ? (oIdx===0 ? 'border-green-500 bg-green-500 text-white shadow-lg scale-[1.02]' : 'border-red-500 bg-red-500 text-white shadow-lg scale-[1.02]') : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700')}>{opt === 'DOĞRU' ? <IconCheckCircle size={24} className={answers[qIdx] === oIdx ? "text-white" : "opacity-30"}/> : <IconXCircle size={24} className={answers[qIdx] === oIdx ? "text-white" : "opacity-30"}/>}{opt}</button>))}</div>}
                            
                            {q.type === 'short-answer' && <div className="relative"><input type="text" placeholder="Cevabınızı buraya yazın..." className="w-full p-6 sm:p-8 bg-slate-50 rounded-xl sm:rounded-[2.5rem] border-2 sm:border-4 border-slate-200 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-black text-lg sm:text-2xl md:text-3xl text-center uppercase transition-all tracking-widest shadow-inner placeholder:text-slate-300 placeholder:text-sm sm:placeholder:text-xl" value={answers[qIdx] || ''} onChange={e => setAnswers({...answers, [qIdx]: e.target.value})} /></div>}
                            
                            {q.type === 'matching' && <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">{q.pairs.map((pair, pIdx) => (<div key={pIdx} className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-stretch sm:items-center bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors shadow-sm"><div className="flex-1 bg-slate-50 py-3 sm:py-4 px-4 sm:px-5 rounded-lg sm:rounded-xl border border-slate-100 flex items-center justify-between sm:justify-start gap-3 sm:gap-4"><span className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center font-black text-xs sm:text-sm text-slate-400 shadow-sm border border-slate-100 shrink-0">{pIdx+1}</span><span className="font-black text-sm sm:text-lg text-stone-800 text-right sm:text-left flex-1 break-words">{pair.left}</span></div><div className="hidden sm:flex items-center justify-center w-8 text-slate-300"><IconChevronRight size={20}/></div><div className="flex-1 relative"><select className={"w-full py-3 sm:py-4 px-4 sm:px-5 rounded-lg sm:rounded-xl border-2 outline-none font-bold sm:font-black text-xs sm:text-base appearance-none transition-all shadow-sm cursor-pointer " + (answers[qIdx]?.[pair.left] ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 focus:border-indigo-400')} value={answers[qIdx]?.[pair.left] || ''} onChange={(e) => { const currentAns = answers[qIdx] || {}; setAnswers({...answers, [qIdx]: {...currentAns, [pair.left]: e.target.value}}); }}><option value="" disabled className="text-slate-300">Seçim Yapın...</option>{[...q.pairs].map(p => p.right).sort().map((ro, roIdx) => (<option key={roIdx} value={ro} className="font-bold text-slate-700 py-2">{ro}</option>))}</select><div className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400"><IconChevronLeft size={16} className="rotate-270 transform"/></div></div></div>))}</div>}
                         </div>
                      </div>
                   </div>
                ))}
                
                <div className="flex flex-col items-center gap-4 sm:gap-6 pt-10 sm:pt-16 border-t-2 border-dashed border-slate-200">
                    <button type="button" onClick={() => handleFinishExam(false)} className="w-full sm:w-auto bg-indigo-600 text-white px-8 sm:px-20 py-4 sm:py-6 rounded-2xl sm:rounded-[3rem] font-black text-lg sm:text-2xl shadow-xl sm:shadow-2xl hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 sm:gap-4 uppercase tracking-tighter border-b-4 sm:border-b-8 border-indigo-800"><IconSend size={24} className="sm:w-8 sm:h-8" /> <span className="mt-0.5">Sınavı Bitir</span></button>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] flex items-center gap-1.5"><IconLock size={10}/> Sınav esnasında başka sekmeye geçmek veya soruları kopyalamak yasaktır.</p>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="w-full text-center py-6 sm:py-8 mt-auto border-t border-slate-200 bg-white print:hidden">
          <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-2">Tasarım & Geliştirme</p>
          <a href="mailto:uguriskin@gmail.com" className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-700 font-bold text-xs sm:text-sm transition-colors bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100"><IconTarget size={14} className="hidden sm:inline"/> uguriskin@gmail.com</a>
      </footer>
    </div>
  );
};

export default App;