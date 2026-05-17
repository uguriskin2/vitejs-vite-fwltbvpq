import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';

// --- İkonlar ---
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconUser = ({size=24}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPlusCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const IconLink = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconTrash2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconPrinter = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconSmartphone = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IconBookOpen = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconActivity = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconActivitySmall = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

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

const getInitialQuestion = () => ({ 
  text: '', type: 'multiple-choice', topic: '', imageUrl: '', 
  options: ['', '', '', ''], correct: 0, correctText: '', 
  pairs: [{left: '', right: ''}, {left: '', right: ''}, {left: '', right: ''}] 
});

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
  
  // Şifrenin iptal olmaması için API anahtarını arayüzden alıyoruz
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  
  // YENİ: Sınav Kodu (examCode) eklendi
  const [newExam, setNewExam] = useState({ title: '', duration: 30, examCode: '', questions: [] });
  const [aiText, setAiText] = useState('');
  const [aiConfig, setAiConfig] = useState({ count: 10, types: ['multiple-choice'] });

  // PDF İşlemleri
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [pageRange, setPageRange] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(getInitialQuestion());
  const [activeExam, setActiveExam] = useState(null);
  
  // ÖĞRENCİ BİLGİLERİ
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [studentExamCode, setStudentExamCode] = useState(''); // YENİ: Öğrencinin girdiği kod
  
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

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

  // --- API BAĞLANTISI ---
  async function callGemini(prompt, systemInstruction = "", pdfBase64 = null) {
    const currentKey = geminiKey ? geminiKey.trim() : "";

    if (!currentKey) {
        throw new Error("Lütfen 'AI Sihirbazı' panelindeki kutucuğa Google Gemini API Anahtarınızı girin.");
    }

    if (currentKey === firebaseConfig.apiKey) {
        throw new Error("DİKKAT: Kutucuğa yapay zeka yerine FIREBASE şifrenizi girdiniz! Lütfen aistudio.google.com adresinden YENİ bir anahtar alıp kutucuğa yapıştırın.");
    }

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash-8b",
        "gemini-pro"
    ];

    let errorLogs = [];

    for (const model of modelsToTry) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
            
            const combinedText = `SİSTEM YÖNERGESİ:\n${systemInstruction}\n\nKULLANICI TALEBİ:\n${prompt || "Ekli belgeye veya metne göre soru üret."}`;
            const parts = [{ text: combinedText }];

            if (pdfBase64) {
                const base64Data = pdfBase64.split(',')[1];
                parts.push({
                    inlineData: { mimeType: "application/pdf", data: base64Data }
                });
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
            
            const response = await fetch(endpoint, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData?.error?.message || errorData?.error?.status || `HTTP Hatası: ${response.status}`;
                
                if (errMsg.includes("API key not valid") || errMsg.includes("API key")) {
                    throw new Error("API_KEY_ERROR");
                }
                throw new Error(errMsg);
            }
            
            const result = await response.json();

            if (result.promptFeedback && result.promptFeedback.blockReason) {
                throw new Error(`Google Güvenlik Filtresi Engeli: ${result.promptFeedback.blockReason}`);
            }
            
            if (result.candidates && result.candidates.length > 0) {
                 return result.candidates[0].content.parts[0].text;
            } else {
                 throw new Error("Yapay Zeka soruyu hazırladı ancak boş yanıt döndürdü.");
            }
            
        } catch (err) { 
            if (err.message === "API_KEY_ERROR") {
                throw new Error("API_KEY_ERROR");
            }
            errorLogs.push(`[${model}]: ${err.message}`);
        }
    }
    
    throw new Error(`Google API Bağlantısı Başarısız Oldu.\n\nDetaylı Hata Kaydı:\n${errorLogs.join('\n\n')}`);
  }

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (e) { console.warn("Anonim giriş başarısız", e); }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if(isMounted) setUser(u || {uid: 'test-user'});
    });
    return () => { isMounted = false; unsub(); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubExams = () => {};
    let unsubSubs = () => {};

    if (user) {
      const examsRef = collection(db, 'artifacts', appId, 'public', 'data', 'exams');
      unsubExams = onSnapshot(examsRef, (s) => {
        if(isMounted) {
          setExams(s.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }
      }, () => { if(isMounted) setLoading(false); });

      const subsRef = collection(db, 'artifacts', appId, 'public', 'data', 'submissions');
      unsubSubs = onSnapshot(subsRef, (s) => {
        if(isMounted) setSubmissions(s.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    const fallbackTimer = setTimeout(() => {
      if (loading && isMounted) setLoading(false);
    }, 4000);

    return () => { isMounted = false; unsubExams(); unsubSubs(); clearTimeout(fallbackTimer); };
  }, [user]);

  useEffect(() => {
    let timer;
    if (view === 'exam' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (view === 'exam' && timeLeft === 0) {
      handleFinishExam();
    }
    return () => clearInterval(timer);
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

  // YENİ: Link kopyalama fonksiyonu sadece site linkini ve kodu verecek şekilde güncellendi
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

  const toggleAiType = (type) => {
    setAiConfig(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? (prev.types.length > 1 ? prev.types.filter(t => t !== type) : prev.types)
        : [...prev.types, type]
    }));
  };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.type !== 'application/pdf') {
          showModal("Hata", "Lütfen sadece PDF dosyası yükleyin.", "error");
          return;
      }
      if (file.size > 5 * 1024 * 1024) { 
          showModal("Hata", "Dosya boyutu çok büyük. Lütfen en fazla 5MB olan bir PDF seçin.", "error");
          return;
      }
      setPdfName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => { setPdfFile(reader.result); };
      reader.readAsDataURL(file);
  };

  const generateWithAI = async () => {
    if (!geminiKey || geminiKey.trim() === "") {
        showModal("API Anahtarı Eksik", "Lütfen AI Sihirbazı panelindeki kutucuğa Google Gemini API Anahtarınızı girin.", "error");
        return;
    }
    if (!aiText.trim() && !pdfFile) {
        showModal("Eksik", "Lütfen metin girin veya bir PDF dosyası yükleyin.", "error");
        return;
    }
    
    setAiProcessing(true);
    try {
      const typeStr = aiConfig.types.join(", ");
      let instruction = `Sen profesyonel bir sınav hazırlayıcısın. Görevin verilen metinden veya ekli PDF belgesinden tam olarak ${aiConfig.count} adet soru üretmektir. İstenilen soru türleri: ${typeStr}.`;

      if (pdfFile && pageRange.trim()) {
          instruction += `\nÖNEMLİ DİKKAT: Ekli PDF dosyasının SADECE şu sayfalarındaki veya şu kısımlarındaki bilgileri kullanarak soru üret: "${pageRange}"`;
      }

      instruction += `\nYanıt SADECE VE SADECE geçerli bir JSON dizisi olmalıdır. JSON formatı dışında başında veya sonunda hiçbir metin, markdown (\`\`\`json) veya açıklama ekleme. JSON içindeki anahtarlar ve değerler mutlaka ÇİFT TIRNAK (") ile sarılmalıdır. Soru metni içinde tırnak işareti kullanman gerekirse mutlaka tek tırnak (') kullan, çift tırnak kullanma. Kesinlikle sondaki elemandan sonra fazladan virgül koyma. Format Örneği: [{"text": "Soru metni", "topic": "Konu", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correct": 0, "correctText": "", "pairs": [{"left": "Terim", "right": "Açıklama"}]}]`;
      
      const res = await callGemini(aiText, instruction, pdfFile);
      
      const cleanRes = res.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleanRes.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
          throw new Error("Yapay zeka geçerli bir soru formatı (JSON) üretemedi. Lütfen işlemi tekrar başlatın.");
      }

      try {
          const questions = JSON.parse(jsonMatch[0]);
          setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), ...questions] }));
          setAiText(''); setPdfFile(null); setPdfName(''); setPageRange('');
      } catch (parseError) {
          console.error("Parse Edilemeyen Veri:", jsonMatch[0]);
          throw new Error("Yapay zeka soruları yazarken noktalama kurallarına uymadı (Format Hatası). Lütfen 'Oluştur' butonuna tekrar basın.");
      }

    } catch (e) { 
        if (e.message === "API_KEY_ERROR") {
             showModal("Geçersiz Şifre", "Girdiğiniz API Anahtarı iptal edilmiş veya hatalı. Lütfen Google AI Studio'dan yeni bir anahtar alıp kutucuğa yapıştırın.", "error");
        } else if (e.message.includes("DEMO_MODE_TRIGGER")) {
             const demoQuestions = [
                 { text: "Türkiye'nin başkenti neresidir?", topic: "Coğrafya", type: "multiple-choice", options: ["İstanbul", "Ankara", "İzmir", "Antalya"], correct: 1, correctText: "", pairs: [{left: '', right: ''}] },
                 { text: "H2O hangi bileşiğin kimyasal formülüdür?", topic: "Kimya", type: "short-answer", options: ['', '', '', ''], correct: 0, correctText: "Su", pairs: [{left: '', right: ''}] },
                 { text: "Aşağıdaki tarihleri önemli olaylarla eşleştirin:", topic: "Tarih", type: "matching", options: ['', '', '', ''], correct: 0, correctText: "", pairs: [{left: "1923", right: "Cumhuriyetin İlanı"}, {left: "1920", right: "TBMM'nin Açılışı"}, {left: "1453", right: "İstanbul'un Fethi"}] }
             ];
             
             setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), ...demoQuestions] }));
             setAiText(''); setPdfFile(null); setPdfName(''); setPageRange('');
             
             showModal(
                "🚀 Örnek Sorular Yüklendi", 
                "Sistem çalışıyor ancak girdiğiniz Google API şifresi şu an yetkisiz olduğu için gerçek yapay zeka bağlantısı kurulamadı.\n\nSistemi test edebilmeniz için taslağınıza otomatik olarak 'Örnek Sorular' eklendi. Sınavı yayınlayıp test edebilirsiniz!", 
                "success"
             );
        } else {
             showModal("Hata Oluştu", e.message || "Bilinmeyen bir hata oluştu.", "error"); 
        }
    }
    finally { setAiProcessing(false); }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.text) return;
    setNewExam(prev => ({ ...prev, questions: [...(prev.questions || []), { ...currentQuestion, topic: currentQuestion.topic?.trim() || "Genel" }] }));
    setCurrentQuestion(getInitialQuestion());
  };

  const handleSaveExam = async () => {
    // YENİ: Sınav Kodu boş olamaz
    if (!newExam.title || !newExam.questions.length || !newExam.examCode) {
        showModal("Eksik Bilgi", "Lütfen Sınav Başlığı, Sınav Kodu ve en az bir soru eklediğinizden emin olun.", "error");
        return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), { ...newExam, createdAt: serverTimestamp(), userId: user.uid });
      setNewExam({ title: '', duration: 30, examCode: '', questions: [] });
      setView('teacher');
    } catch (e) { 
       showModal("Uyarı", "Bağlantı hatası: Sınav geçici belleğe kaydedildi.", "error"); 
       setExams(prev => [...prev, {...newExam, id: Date.now().toString()}]);
       setNewExam({ title: '', duration: 30, examCode: '', questions: [] });
       setView('teacher');
    }
  };

  // YENİ: Öğrencinin KOD ile sınava giriş yapmasını sağlayan fonksiyon
  const handleStudentStart = () => {
    if(!studentName || !studentNumber || !studentExamCode) {
        showModal("Eksik Bilgi", "Lütfen adınızı, numaranızı ve öğretmenin verdiği Sınav Kodunu eksiksiz girin.", "error");
        return;
    }
    
    // Girilen koda sahip sınavı bul
    const foundExam = exams.find(e => e.examCode && e.examCode.toUpperCase() === studentExamCode.toUpperCase());
    
    if (!foundExam) {
        showModal("Hatalı Kod", `"${studentExamCode}" koduna ait bir sınav bulunamadı. Lütfen giriş kodunu kontrol edin.`, "error");
        return;
    }
    
    // Doğruysa sınavı başlat
    setActiveExam(foundExam); 
    setAnswers({}); 
    setTimeLeft(foundExam.duration * 60); 
    setView('exam');
  };

  const handleFinishExam = async () => {
    if (!activeExam) return;
    let score = 0;
    const questionDetails = (activeExam.questions || []).map((q, idx) => {
      const ans = answers[idx];
      let isCorrect = false;
      if (q.type === 'short-answer') isCorrect = ans?.toLowerCase().trim() === q.correctText?.toLowerCase().trim();
      else if (q.type === 'matching') isCorrect = q.pairs?.every(p => ans?.[p.left] === p.right);
      else isCorrect = parseInt(ans) === q.correct;
      if (isCorrect) score++;
      return { topic: q.topic || 'Genel', isCorrect };
    });

    const submissionData = {
        examId: activeExam.id, studentName, studentNumber, deviceId,
        score: (score / activeExam.questions.length) * 100, correctCount: score,
        totalQuestions: activeExam.questions.length, questionDetails, submittedAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), submissionData);
      setView('landing'); setActiveExam(null); setAnswers({}); setStudentName(''); setStudentNumber(''); setStudentExamCode('');
      showModal("Tebrikler", "Sınavınız başarıyla kaydedildi.", "success");
    } catch (e) {
      setSubmissions(prev => [...prev, {...submissionData, id: Date.now().toString()}]);
      setView('landing'); setActiveExam(null); setAnswers({}); setStudentName(''); setStudentNumber(''); setStudentExamCode('');
      showModal("Tebrikler", "Sınavınız tamamlandı (Yerel Kayıt).", "success");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const examSubs = submissions.filter(s => s.examId === activeExam?.id);
    let csv = "Ogrenci,Okul No,Cihaz ID,Puan,Tarih\n";
    examSubs.forEach(s => { csv += `${s.studentName},${s.studentNumber},${s.deviceId},${Number(s.score).toFixed(1)},${s.submittedAt}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = "Katilimci_Listesi.csv"; a.click();
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
        if (d.isCorrect) stats[tName].correct++;
      });
    });
    return Object.keys(stats).map(name => ({ name, percentage: ((stats[name].correct / stats[name].total) * 100).toFixed(1) }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse bg-white text-2xl uppercase tracking-tighter">Sistem Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <style>{`@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; } }`}</style>
      
      {modal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 border-t-8 border-indigo-600">
            <h3 className={`text-2xl font-black mb-3 uppercase ${modal.type === 'error' ? 'text-red-600' : modal.type === 'success' ? 'text-green-600' : 'text-indigo-600'}`}>{modal.title}</h3>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar whitespace-pre-wrap">{modal.message}</p>
            <div className="flex gap-3">
              {modal.type === 'confirm' ? (
                <><button type="button" onClick={closeModal} className="flex-1 py-4 font-bold text-slate-400">İptal</button><button type="button" onClick={() => { modal.onConfirm(); closeModal(); }} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Onayla</button></>
              ) : <button type="button" onClick={closeModal} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Tamam</button>}
            </div>
          </div>
        </div>
      )}

      {aiProcessing && <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm z-[200] flex flex-col items-center justify-center text-white print:hidden"><IconActivity className="animate-spin mb-4" /><p className="font-black uppercase tracking-widest text-center">PDF/METİN OKUNUYOR<br/>SORULAR ÜRETİLİYOR...</p></div>}

      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex items-center gap-2 font-black text-2xl text-indigo-600 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg"><IconTarget/></div>
          <div className="flex flex-col">
            <span>SINAV<span className="text-slate-800">AI</span></span>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest lowercase -mt-1 hidden sm:block">uguriskin@gmail.com</span>
          </div>
        </div>
        <div className="flex gap-4">
          {!isTeacher ? (
            <button type="button" onClick={() => setShowPassModal(true)} className="flex items-center gap-2 font-bold text-slate-500 hover:text-indigo-600 transition-colors"><IconLock/> Panel</button>
          ) : (
            <><button type="button" onClick={() => setView('teacher')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold">Yönetim</button><button type="button" onClick={() => { setIsTeacher(false); setView('landing'); }} className="flex items-center gap-2 font-bold text-red-500 px-2 transition-colors hover:text-red-700"><IconLogOut/> Çıkış</button></>
          )}
          <button type="button" onClick={() => setView('student')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black shadow-xl hover:bg-indigo-700 transition-all">SINAVA GİR</button>
        </div>
      </nav>

      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center border-t-8 border-indigo-600">
            <h3 className="text-2xl font-black mb-6 uppercase">Yönetici Girişi</h3>
            <input type="password" autoFocus className="w-full p-5 bg-slate-50 border-none rounded-3xl outline-none ring-4 ring-transparent focus:ring-indigo-500 text-center mb-6 font-black text-2xl tracking-widest" placeholder="••••" onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()} />
            <div className="flex gap-3"><button type="button" onClick={() => setShowPassModal(false)} className="flex-1 py-4 font-bold text-slate-400">İptal</button><button type="button" onClick={handleTeacherLogin} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">GİRİŞ YAP</button></div>
          </div>
        </div>
      )}

      <main className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1">
        {view === 'landing' && (
          <div className="text-center py-20 animate-in fade-in zoom-in print:hidden">
            <h2 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter uppercase text-slate-900">Bulut Tabanlı <br/><span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-8">Akıllı Sınav</span></h2>
            <p className="text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-bold leading-relaxed">Öğrencileriniz için hesap gerekmez. Sınavları AI ile hazırlayın, özel sınav koduyla güvenle paylaşın.</p>
            <button type="button" onClick={() => setView('student')} className="bg-indigo-600 text-white px-12 py-6 rounded-[3rem] font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-4 mx-auto shadow-indigo-200"><IconUser/> SINAVA BAŞLA</button>
          </div>
        )}

        {view === 'teacher' && isTeacher && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 print:hidden">
            <div className="flex justify-between items-end">
              <div><h2 className="text-4xl font-black text-slate-900 uppercase">Sınav Merkezi</h2><p className="text-indigo-600 font-bold uppercase text-[10px] animate-pulse">PANEL AKTİF</p></div>
              <button type="button" onClick={() => setView('create')} className="bg-green-600 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"><IconPlusCircle/> YENİ SINAV</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exams.length === 0 ? (
                <div className="col-span-full border-4 border-dashed rounded-[3rem] py-32 text-center text-slate-200 font-black text-3xl uppercase bg-white/50 border-slate-100">Henüz Sınav Yok</div>
              ) : exams.map(exam => {
                const examSubs = submissions.filter(s => s.examId === exam.id);
                const avg = examSubs.length > 0 ? (examSubs.reduce((a, b) => a + (Number(b?.score) || 0), 0) / examSubs.length).toFixed(1) : 0;
                return (
                  <div key={exam.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group relative hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                       <button type="button" onClick={(e) => handleCopyLink(e, exam)} className="bg-white shadow-md p-2 rounded-xl text-indigo-500" title="Kodu ve Linki Kopyala"><IconLink/></button>
                       <button type="button" onClick={(e) => { e.stopPropagation(); showModal("Sil", "Bu sınav kalıcı olarak silinecek. Emin misiniz?", "confirm", () => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', exam.id))); }} className="bg-white shadow-md p-2 rounded-xl text-red-500" title="Sil"><IconTrash2/></button>
                    </div>
                    <button type="button" onClick={() => { setActiveExam(exam); setView('analytics'); }} className="text-left w-full h-full pr-10">
                      <h3 className="font-black text-2xl mb-2 line-clamp-1 uppercase text-indigo-900 tracking-tight">{exam.title}</h3>
                      {/* Sınav kodu öğretmen panelinde net olarak gösteriliyor */}
                      <p className="text-sm font-bold text-indigo-500 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-lg border border-indigo-100">KOD: {exam.examCode}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-center mb-8">
                        <div className="bg-slate-50 p-2 rounded-2xl border"><p className="text-[8px] font-black text-slate-400 uppercase">Soru</p><p className="font-black">{exam.questions?.length || 0}</p></div>
                        <div className="bg-green-50 p-2 rounded-2xl border border-green-100"><p className="text-[8px] font-black text-green-600 uppercase">Ort.</p><p className="font-black text-green-700">%{avg}</p></div>
                      </div>
                      <div className="w-full py-4 bg-slate-900 text-white rounded-2xl text-center font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors">Analiz Et</div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'create' && isTeacher && (
          <div className="grid md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 print:hidden">
            <div className="md:col-span-8 space-y-6">
               <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-10"><button type="button" onClick={() => setView('teacher')} className="p-3 bg-stone-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><IconChevronLeft/></button><h2 className="text-4xl font-black uppercase text-stone-900">Sınav Tasarla</h2></div>
                  
                  {/* YENİ: Sınav Kodu belirleme alanı eklendi */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                     <input className="w-full p-6 bg-slate-50 rounded-[2rem] font-black text-xl outline-none shadow-inner border focus:border-indigo-500" placeholder="SINAV BAŞLIĞI" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value.toUpperCase()})} />
                     <input className="w-full p-6 bg-slate-50 rounded-[2rem] font-black text-xl outline-none shadow-inner border focus:border-indigo-500" type="number" placeholder="SÜRE (DK)" value={newExam.duration} onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value) || 0})} />
                     <input className="w-full p-6 bg-indigo-50 rounded-[2rem] font-black text-xl outline-none shadow-inner border-2 border-indigo-200 focus:border-indigo-500 text-indigo-700 placeholder-indigo-300 uppercase tracking-widest" placeholder="GİRİŞ KODU (Örn: MAT101)" value={newExam.examCode} onChange={e => setNewExam({...newExam, examCode: e.target.value.toUpperCase()})} />
                  </div>
                  
                  <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl mb-12">
                     <div className="flex items-center gap-3 mb-8"><IconActivitySmall className="text-indigo-200" /><div><h3 className="text-xl font-black uppercase tracking-widest leading-none">✨ AI Sihirbazı</h3><p className="text-xs text-indigo-300 font-bold mt-1 uppercase">Belge ve Metinden Soru Üretin</p></div></div>
                     
                     <div className="mb-8 p-5 bg-black/20 rounded-2xl border border-white/10">
                        <label className="text-[10px] font-black uppercase mb-2 block tracking-widest text-indigo-200">Google Gemini API Anahtarı <span className="text-red-400">*</span></label>
                        <input 
                            type="password" 
                            placeholder="AIzaSy ile başlayan anahtarınızı buraya yapıştırın..." 
                            value={geminiKey} 
                            onChange={e => { setGeminiKey(e.target.value); localStorage.setItem('gemini_api_key', e.target.value); }}
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none text-sm text-white focus:border-indigo-400 transition-colors placeholder:text-white/30"
                        />
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-2 inline-block font-bold">Ücretsiz API Anahtarı Al &rarr;</a>
                        <p className="text-xs text-indigo-300 mt-2 opacity-80">Not: Eğer 'Model bulunamadı' hatası alırsanız, Google Cloud hesabınızda "Generative Language API" aktif edilmemiş demektir.</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div><label className="text-[10px] font-black uppercase mb-2 block opacity-50 tracking-widest">Soru Sayısı</label><div className="flex gap-2">{[5,10,20,40].map(n=><button type="button" key={n} onClick={()=>setAiConfig({...aiConfig, count:n})} className={"flex-1 py-3 rounded-xl font-black text-xs transition-all " + (aiConfig.count===n?'bg-white text-indigo-900':'bg-white/10')}>{n}</button>)}</div></div>
                        <div><label className="text-[10px] font-black uppercase mb-2 block opacity-50 tracking-widest">Tür</label><div className="grid grid-cols-2 gap-1">{['multiple-choice','true-false','short-answer','matching'].map(t=><button type="button" key={t} onClick={()=>toggleAiType(t)} className={"py-2 rounded-lg text-[8px] font-black uppercase transition-all " + (aiConfig.types.includes(t)?'bg-white text-indigo-900':'bg-white/10')}>{t==='matching'?'Eşleş.':t==='true-false'?'D/Y':t==='short-answer'?'Kısa':'ABCD'}</button>)}</div></div>
                     </div>

                     <div className="mb-6 space-y-4">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">PDF DOSYASINDAN ÜRET (OPSİYONEL)</span>
                                {pdfFile && <button type="button" onClick={()=>{setPdfFile(null);setPdfName('');setPageRange('');}} className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"><IconTrash2/></button>}
                            </div>
                            
                            {!pdfFile ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-300/30 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                                    <IconFileText />
                                    <span className="text-indigo-200 font-bold text-xs uppercase tracking-widest mt-2">PDF SEÇ VEYA SÜRÜKLE</span>
                                    <span className="text-indigo-300/50 text-[10px] mt-1">Maksimum 5MB Boyutunda</span>
                                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                                </label>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-green-300 font-bold text-sm bg-green-900/40 p-3 rounded-xl border border-green-500/30">
                                        <IconCheckCircle />
                                        <span className="truncate">{pdfName}</span>
                                    </div>
                                    <input type="text" placeholder="Hangi sayfalar? (Örn: Sadece 12-15 arası)" value={pageRange} onChange={e=>setPageRange(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 outline-none text-sm placeholder:text-white/40 text-white focus:border-indigo-400 transition-colors" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 opacity-30">
                            <div className="h-px bg-white flex-1"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">VEYA MANUEL METİN GİRİN</span>
                            <div className="h-px bg-white flex-1"></div>
                        </div>

                        <textarea className="w-full h-28 bg-white/5 border border-white/10 rounded-3xl p-6 outline-none text-sm shadow-inner placeholder:text-white/30 custom-scrollbar focus:border-indigo-400 transition-colors" placeholder="PDF yüklemek yerine ders notunu buraya da yapıştırabilirsiniz..." value={aiText} onChange={e=>setAiText(e.target.value)} />
                     </div>

                     <button type="button" onClick={generateWithAI} disabled={aiProcessing || (!aiText.trim() && !pdfFile)} className="w-full py-5 bg-white text-indigo-900 rounded-[2rem] font-black text-lg shadow-xl disabled:opacity-50 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2"><IconTarget/> SORULARI OLUŞTUR</button>
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[3rem] space-y-8 border shadow-inner">
                    <h3 className="font-black text-xl uppercase text-slate-800 tracking-widest">Manuel Soru Editörü</h3>
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">{['multiple-choice','true-false','short-answer','matching'].map(t=><button type="button" key={t} onClick={()=>setCurrentQuestion({...currentQuestion,type:t})} className={"px-4 py-2 rounded-xl text-[10px] font-black uppercase border-4 transition-all " + (currentQuestion.type===t?'bg-indigo-600 text-white border-indigo-600 shadow-xl':'bg-white text-slate-300 border-slate-200')}>{t}</button>)}</div>
                    <textarea className="w-full p-6 bg-white rounded-[2rem] shadow-lg outline-none font-black text-xl border focus:border-indigo-500" placeholder="Soru metni..." value={currentQuestion.text} onChange={e=>setCurrentQuestion({...currentQuestion, text:e.target.value})} />
                    {currentQuestion.type === 'multiple-choice' && <div className="grid grid-cols-2 gap-4">{currentQuestion.options.map((opt,i)=><div key={i} className="flex items-center gap-2 bg-white p-3 rounded-2xl border"><input type="radio" checked={currentQuestion.correct===i} onChange={()=>setCurrentQuestion({...currentQuestion, correct:i})} /><input className="w-full font-bold outline-none" placeholder={String.fromCharCode(65+i) + " Şıkkı"} value={opt} onChange={e=>{const o=[...currentQuestion.options];o[i]=e.target.value;setCurrentQuestion({...currentQuestion,options:o});}} /></div>)}</div>}
                    {currentQuestion.type === 'short-answer' && <input className="w-full p-6 rounded-2xl bg-white shadow-lg outline-none text-center font-black text-2xl uppercase tracking-widest border" placeholder="DOĞRU CEVAP" value={currentQuestion.correctText} onChange={e=>setCurrentQuestion({...currentQuestion, correctText: e.target.value})} />}
                    {currentQuestion.type === 'matching' && <div className="space-y-2">{currentQuestion.pairs.map((p,i)=><div key={i} className="flex gap-2"><input className="flex-1 p-3 rounded-xl bg-white border outline-none font-bold" placeholder="Sol İfade" value={p.left} onChange={e=>{const np=[...currentQuestion.pairs];np[i].left=e.target.value;setCurrentQuestion({...currentQuestion,pairs:np});}} /><input className="flex-1 p-3 rounded-xl bg-white border outline-none font-bold" placeholder="Sağ İfade" value={p.right} onChange={e=>{const np=[...currentQuestion.pairs];np[i].right=e.target.value;setCurrentQuestion({...currentQuestion,pairs:np});}} /></div>)}</div>}
                    <button type="button" onClick={handleAddQuestion} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Taslağa Ekle</button>
                  </div>
               </div>
            </div>
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border sticky top-24">
                 <div className="flex justify-between items-center mb-8"><h3 className="font-black text-2xl uppercase tracking-tighter">Taslak ({newExam.questions.length})</h3><button type="button" onClick={handleSaveExam} className="bg-green-600 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg disabled:opacity-40 hover:bg-green-700" disabled={newExam.questions.length===0}>Yayınla</button></div>
                 <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {newExam.questions.length===0 && <div className="py-20 text-center text-slate-200 font-black italic border-4 border-dashed rounded-[2.5rem] uppercase tracking-widest"><IconBookOpen className="mx-auto mb-2 opacity-50"/> BOŞ</div>}
                  {newExam.questions.map((q,i)=>(<div key={i} className="p-5 bg-slate-50 rounded-[2rem] border-2 relative group hover:border-indigo-200 transition-all"><div className="flex justify-between items-start mb-2"><span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">{q.topic || 'Genel'}</span><button type="button" onClick={()=>setNewExam({...newExam, questions:newExam.questions.filter((_,idx)=>idx!==i)})} className="text-slate-300 hover:text-red-500 transition-colors"><IconTrash2/></button></div><p className="text-[11px] font-black text-slate-700 line-clamp-2 leading-tight uppercase tracking-tighter">{i+1}. {q.text}</p></div>))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'analytics' && activeExam && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
              <div className="flex items-center gap-4"><button type="button" onClick={() => setView('teacher')} className="p-4 bg-white rounded-3xl text-slate-400 shadow-xl border border-slate-100 hover:scale-110 active:scale-95 transition-all"><IconChevronLeft/></button><h2 className="text-4xl font-black text-slate-900 uppercase pr-10">{activeExam.title}</h2></div>
              <div className="flex gap-2"><button type="button" onClick={handleExportCSV} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 border-2 border-indigo-50 shadow-sm transition-all hover:bg-indigo-50"><IconDownload/> EXCEL</button><button type="button" onClick={handlePrint} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 shadow-xl transition-all"><IconPrinter/> YAZDIR / PDF</button></div>
            </div>
            <div id="report-content" className="space-y-8 print:m-0 print:p-0">
              <div className="grid md:grid-cols-12 gap-8">
                 <div className="md:col-span-4 space-y-8">
                    <div className="bg-white rounded-[4rem] p-10 shadow-sm border border-slate-100">
                      <h3 className="font-black text-lg mb-8 uppercase text-slate-400 tracking-widest">Konu Analizi</h3>
                      <div className="space-y-6">{getTopicAnalysis(activeExam.id).map((t, i) => (<div key={i}><div className="flex justify-between text-[10px] font-black mb-2 uppercase text-indigo-900"><span>{t.name}</span><span>%{t.percentage}</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border"><div className="bg-indigo-600 h-full transition-all duration-1000" style={{width: t.percentage + "%"}}></div></div></div>))}</div>
                    </div>
                    <div className="bg-indigo-600 rounded-[4rem] p-10 text-white text-center shadow-2xl"><p className="text-[10px] font-black uppercase opacity-60 mb-4 tracking-widest">Ortalama Başarı</p><p className="text-8xl font-black tracking-tighter">%{ (submissions.filter(s=>s.examId===activeExam.id).reduce((a,b)=>a+(Number(b?.score)||0),0)/(submissions.filter(s=>s.examId===activeExam.id).length||1)).toFixed(1) }</p></div>
                 </div>
                 <div className="md:col-span-8 bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0"><h3 className="font-black text-xl uppercase tracking-tighter">Katılımcı Listesi</h3><span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest">{submissions.filter(s=>s.examId===activeExam.id).length} ÖĞRENCİ</span></div>
                    <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-slate-50 border-b uppercase text-[10px] font-black text-slate-400 tracking-widest"><tr><th className="p-6">Öğrenci Bilgileri</th><th className="p-6 text-center">Doğru</th><th className="p-6 text-center">Başarı</th><th className="p-6 text-center">Cihaz ID</th></tr></thead><tbody className="divide-y divide-slate-50 font-black text-slate-800">{submissions.filter(s=>s.examId===activeExam.id).map((sub, i) => (<tr key={i} className="hover:bg-indigo-50/10 transition-colors"><td className="p-6"><div className="text-xl tracking-tighter uppercase text-indigo-900">{sub.studentName}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NO: {sub.studentNumber}</div></td><td className="p-6 text-center text-slate-400 font-mono">{sub.correctCount} / {sub.totalQuestions}</td><td className="p-6 text-center"><span className="inline-block px-5 py-1.5 bg-white border-4 border-indigo-50 rounded-full text-indigo-600 text-sm shadow-sm font-black">%{Number(sub.score).toFixed(1)}</span></td><td className="p-6 text-center text-[8px] text-slate-300 font-mono flex flex-col items-center justify-center gap-1"><IconSmartphone/>{sub.deviceId}</td></tr>))}</tbody></table></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* YENİ: Tamamen Güvenli Öğrenci Giriş Paneli (Liste kaldırıldı, Kahoot tarzı koda bağlandı) */}
        {view === 'student' && (
          <div className="max-w-lg mx-auto py-12 animate-in fade-in duration-500 print:hidden">
             <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-50 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600/5"></div>
                <div className="bg-indigo-600 w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-white mb-10 shadow-2xl relative z-10"><IconUser size={48} /></div>
                
                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-slate-900 relative z-10">Sınav Girişi</h2>
                <p className="text-slate-400 font-bold mb-10 text-sm relative z-10">Öğretmeninizin size verdiği Sınav Kodunu girin.</p>
                
                <div className="space-y-4 mb-10 relative z-10">
                    <input className="w-full p-6 bg-slate-50 border rounded-[2rem] text-center font-black text-2xl shadow-inner outline-none focus:ring-4 focus:ring-indigo-500 transition-all uppercase" placeholder="AD SOYAD" value={studentName} onChange={e => setStudentName(e.target.value.toUpperCase())} />
                    <input className="w-full p-6 bg-slate-50 border rounded-[2rem] text-center font-black text-xl shadow-inner outline-none focus:ring-4 focus:ring-indigo-500 transition-all uppercase tracking-widest" placeholder="OKUL NUMARASI" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} />
                    
                    <div className="pt-4">
                        <input className="w-full p-6 bg-indigo-50 border-2 border-indigo-200 rounded-[2rem] text-center font-black text-3xl shadow-inner outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all uppercase tracking-[0.2em] text-indigo-700 placeholder-indigo-300" placeholder="SINAV KODU" value={studentExamCode} onChange={e => setStudentExamCode(e.target.value.toUpperCase())} />
                    </div>
                </div>

                <button 
                    onClick={handleStudentStart} 
                    className="w-full bg-indigo-600 text-white py-6 rounded-[3rem] font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 relative z-10"
                >
                    BAŞLA <IconChevronRight size={28} />
                </button>
             </div>
          </div>
        )}

        {view === 'exam' && activeExam && (
          <div className="max-w-4xl mx-auto pb-32 animate-in slide-in-from-right print:hidden">
             <div className="bg-slate-900 text-white p-12 rounded-t-[5rem] flex justify-between items-center sticky top-20 z-40 shadow-2xl">
                <div><h2 className="text-4xl font-black uppercase tracking-tight leading-none text-indigo-400">{activeExam.title}</h2><p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">{studentName} • NO: {studentNumber}</p></div>
                <div className={"px-10 py-5 rounded-[2.5rem] font-mono text-4xl bg-white/10 flex items-center gap-4 border-2 border-white/10 transition-all " + (timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-indigo-300')}><IconClock/> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
             </div>
             <div className="bg-white p-8 md:p-16 rounded-b-[5rem] shadow-2xl space-y-24 border-x-2 border-b-2">
                {(activeExam.questions || []).map((q, qIdx) => (
                   <div key={qIdx} className="space-y-12 pb-24 border-b last:border-0 border-slate-50">
                      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                         <span className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 shadow-xl rotate-[-5deg]">{qIdx + 1}</span>
                         <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4"><p className="text-3xl md:text-4xl font-black text-slate-800 leading-tight uppercase tracking-tighter">{q.text}</p><span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shrink-0">{q.topic || 'Genel'}</span></div>
                            {q.imageUrl && <div className="mb-12 rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-inner"><img src={q.imageUrl} className="max-h-[500px] w-full object-contain" alt="Görsel" /></div>}
                            
                            {q.type === 'multiple-choice' && <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{q.options.map((opt, oIdx) => (<button type="button" key={oIdx} onClick={() => setAnswers({...answers, [qIdx]: oIdx})} className={"p-8 text-left rounded-[3rem] border-4 font-black transition-all flex justify-between items-center group relative overflow-hidden " + (answers[qIdx] === oIdx ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 text-slate-400')}><span className="text-xl flex items-center gap-4"><span className={"font-black text-2xl " + (answers[qIdx] === oIdx ? 'text-indigo-200' : 'text-slate-200 group-hover:text-indigo-600')}>{String.fromCharCode(65 + oIdx)}</span> {opt}</span>{answers[qIdx] === oIdx && <IconCheckCircle/>}</button>))}</div>}
                            
                            {q.type === 'true-false' && <div className="flex gap-8">{['DOĞRU','YANLIŞ'].map((opt, oIdx) => (<button type="button" key={oIdx} onClick={() => setAnswers({...answers, [qIdx]: oIdx})} className={"flex-1 p-10 rounded-[3rem] border-4 font-black text-3xl transition-all " + (answers[qIdx] === oIdx ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl' : 'border-slate-100 bg-slate-50 text-slate-300 hover:bg-white')}>{opt}</button>))}</div>}
                            
                            {q.type === 'short-answer' && <input type="text" placeholder="CEVABINIZI YAZIN..." className="w-full p-10 bg-slate-50 rounded-[3rem] border-4 border-transparent outline-none focus:border-indigo-500 focus:bg-white font-black text-4xl text-center uppercase transition-all tracking-widest shadow-inner" value={answers[qIdx] || ''} onChange={e => setAnswers({...answers, [qIdx]: e.target.value})} />}
                            
                            {q.type === 'matching' && <div className="space-y-6 mt-8">{q.pairs.map((pair, pIdx) => (<div key={pIdx} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-6 rounded-[2rem] border-4 border-slate-100 hover:bg-white transition-all shadow-sm focus-within:border-indigo-500"><span className="w-full md:flex-1 font-black text-xl text-slate-800 text-center md:text-left">{pair.left}</span><select className="w-full md:flex-1 p-6 rounded-[1.5rem] border-4 border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-600 bg-white shadow-sm" value={answers[qIdx]?.[pair.left] || ''} onChange={(e) => { const currentAns = answers[qIdx] || {}; setAnswers({...answers, [qIdx]: {...currentAns, [pair.left]: e.target.value}}); }}><option value="">-- Eşleştirin --</option>{[...q.pairs].map(p => p.right).sort().map((ro, roIdx) => (<option key={roIdx} value={ro}>{ro}</option>))}</select></div>))}</div>}
                         </div>
                      </div>
                   </div>
                ))}
                <div className="flex flex-col items-center gap-6"><button type="button" onClick={handleFinishExam} className="bg-indigo-600 text-white px-24 py-8 rounded-[4rem] font-black text-3xl hover:bg-indigo-700 shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center gap-6 uppercase tracking-tighter"><IconSend/> SINAVI TAMAMLA</button><p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] animate-pulse italic">Sınav sonuçlarınız bulut sunucularına kaydedilecektir.</p></div>
             </div>
          </div>
        )}
      </main>

      <footer className="w-full text-center py-8 mt-auto border-t border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] print:hidden">
        tasarım ve geliştirme: <a href="mailto:uguriskin@gmail.com" className="text-indigo-600 hover:text-indigo-800 transition-colors lowercase">uguriskin@gmail.com</a>
      </footer>
    </div>
  );
};

export default App;