import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, ShoppingBag, Palette, ChevronRight, ChevronLeft, 
  MessageCircle, Upload, Lock, Unlock, Phone, MapPin, 
  Instagram, Send, Copy, Check, Info, Zap, Tag, Gift, X, Clock, HelpCircle,
  Shirt, Utensils, Dumbbell, Briefcase, Hammer, Pencil, Search, ScanLine, Camera, Bot, Image as ImageIcon, Sparkles, Wand2, Volume2, Mic, RefreshCw, Flame, Percent, Layers, Settings, Database, ZoomIn, ZoomOut, Move, Type, Sliders, Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- CONFIGURATION ---
// NOTE FOR NETLIFY DEPLOYMENT:
// Replace the lines below with your actual firebaseConfig object from Firebase Console.
// Example: const firebaseConfig = { apiKey: "...", authDomain: "...", ... };
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // If running locally without the environment variable, paste your config here
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
    projectId: "PASTE_YOUR_PROJECT_ID_HERE",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "PASTE_YOUR_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 
const appId = typeof __app_id !== 'undefined' ? __app_id : 'db-final-v42';

const WHATSAPP_NUM = "918328364086";
const INSTA_URL = "https://www.instagram.com/discount_bazarr";
const MAP_URL = "https://maps.google.com/?q=Discount+Bazarr"; 

const CATEGORIES = [
  { id: 'HOUSEHOLD', name: 'Household Items', icon: Package, color: 'bg-orange-500' },
  { id: 'FOOTWEAR', name: 'Premium Footwear', icon: ShoppingBag, color: 'bg-blue-600' },
  { id: 'APPARELS', name: 'Fashion Wear', icon: Shirt, color: 'bg-purple-500' },
  { id: 'KITCHEN', name: 'Kitchen Appliances', icon: Utensils, color: 'bg-red-500' },
  { id: 'SPORTS', name: 'Sports & Fitness', icon: Dumbbell, color: 'bg-green-600' },
  { id: 'ELECTRONICS', name: 'Small Appliances', icon: Zap, color: 'bg-yellow-500' },
  { id: 'LUGGAGE', name: 'Luggage & Bags', icon: Briefcase, color: 'bg-emerald-500' },
  { id: 'TOOLS', name: 'Home Tools', icon: Hammer, color: 'bg-slate-600' },
  { id: 'STATIONARY', name: 'Stationary Items', icon: Pencil, color: 'bg-pink-500' }
];

const QUOTES = [
  "Style is a way to say who you are without having to speak.",
  "Fashion fades, only style remains the same.",
  "Create your own visual style... let it be unique for yourself.",
  "Clothes mean nothing until someone lives in them."
];

const DESIGN_OPTS = {
  ages: ["Kids", "Adults"],
  styles: ["Round Neck", "Collar (Polo)", "Hoodies", "Oversized", "V-Neck", "Sleeveless", "Full Sleeve", "Sweatshirt", "Zipper Hoodie", "Sports Jersey", "Tank Top", "Crop Top"],
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "Free Size"],
  colors: [
    { name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#000080" }, { name: "Red", hex: "#FF0000" },
    { name: "Yellow", hex: "#FFD700" }, { name: "Grey", hex: "#808080" },
    { name: "Maroon", hex: "#800000" }, { name: "Olive", hex: "#808000" },
    { name: "Royal Blue", hex: "#4169E1" }, { name: "Pink", hex: "#FFC0CB" },
    { name: "Purple", hex: "#800080" }, { name: "Orange", hex: "#FFA500" }
  ],
  vibes: ["Original", "Caricature", "Sketchify", "Minimalist", "Funky", "Typography", "Vintage", "Abstract"]
};

// CSS Filter Mappings
const VIBE_FILTERS = {
  "Original": "none",
  "Caricature": "contrast(150%) saturate(200%)", 
  "Sketchify": "grayscale(100%) contrast(300%) brightness(120%)",
  "Minimalist": "grayscale(100%) contrast(110%)",
  "Funky": "saturate(300%) hue-rotate(15deg)",
  "Typography": "opacity(90%) blur(0.5px)",
  "Vintage": "sepia(80%) contrast(90%)",
  "Abstract": "hue-rotate(180deg) invert(10%)"
};

const FONT_STYLES = [
  { name: "Modern", font: "sans-serif" },
  { name: "Serif", font: "serif" },
  { name: "Handwritten", font: "cursive" },
  { name: "Bold", font: "Impact, sans-serif" },
  { name: "Mono", font: "monospace" }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [catalog, setCatalog] = useState({});
  const [hotCatalog, setHotCatalog] = useState([]);
  const [currentTab, setCurrentTab] = useState('deals');
  const [activeCat, setActiveCat] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [toast, setToast] = useState(null);
  
  // Image Upload & Enhance State
  const [uploadingId, setUploadingId] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hi! I'm DB Bot 🤖. I give short, crisp answers about stock availability.", sender: 'bot', type: 'text' }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatScrollRef = useRef(null);

  // Movable Chatbot State
  const [chatPos, setChatPos] = useState({ x: 20, y: window.innerHeight - 140 }); 
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Design Lab State
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [uploadedDesign, setUploadedDesign] = useState(null);
  const [mockupZoom, setMockupZoom] = useState(1);
  const [designSpecs, setDesignSpecs] = useState({
    age: 'Adults', style: 'Round Neck', size: 'M', color: 'Black', vibe: 'Original'
  });
  
  // New Mockup Text States
  const [mockupText, setMockupText] = useState("");
  const [textPos, setTextPos] = useState({ x: 50, y: 30 }); 
  const [textConfig, setTextConfig] = useState({ size: 16, font: "sans-serif", color: "#000000" });
  const isTextDragging = useRef(false);
  const mockupRef = useRef(null);

  // Audio/TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Slogan Generator State
  const [sloganTheme, setSloganTheme] = useState("");
  const [sloganList, setSloganList] = useState([]);
  const [isGeneratingSlogans, setIsGeneratingSlogans] = useState(false);

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, setUser);
    setChatPos({ x: 20, y: window.innerHeight - 140 });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, isChatOpen]);

  // --- PERMANENT DATA STORAGE (FIRESTORE LISTENER) ---
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'stock', 'global');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
         const data = snap.data();
         setCatalog(prev => ({ ...prev, ...(data.categories || {}) }));
         setHotCatalog(data.hotItems || []);
      }
    }, (err) => console.error(err));
    return () => unsub();
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogoTap = () => {
    setTapCount(prev => prev + 1);
    if (tapCount + 1 === 5) {
      setIsAdmin(!isAdmin);
      showToast(isAdmin ? "Admin Locked 🔒" : "Admin Access Granted 🔓");
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 2000);
  };

  // --- GLOBAL DRAG HANDLING ---
  const handleGlobalDragStart = (e, type) => {
    if (type === 'bot') {
        isDragging.current = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStart.current = { x: clientX - chatPos.x, y: clientY - chatPos.y };
    } else if (type === 'text') {
        e.stopPropagation(); 
        isTextDragging.current = true;
    }
  };

  const handleGlobalDragMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isDragging.current) {
        e.preventDefault(); 
        setChatPos({
          x: clientX - dragStart.current.x,
          y: clientY - dragStart.current.y
        });
    }

    if (isTextDragging.current && mockupRef.current) {
        e.preventDefault();
        const rect = mockupRef.current.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        setTextPos({ x, y });
    }
  };

  const handleGlobalDragEnd = () => {
    isDragging.current = false;
    isTextDragging.current = false;
  };

  // --- GEMINI API HELPER ---
  const callGemini = async (prompt, isTTS = false, imageBase64 = null) => {
    const apiKey = ""; 
    let model = "gemini-2.5-flash-preview-09-2025";
    let payload = {};

    if (isTTS) {
        model = "gemini-2.5-flash-preview-tts";
        payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
            }
        };
    } else if (imageBase64) {
        model = "gemini-2.5-flash-image-preview";
        payload = {
            contents: [{ parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/png", data: imageBase64 } }
            ]}],
            generationConfig: { responseModalities: ["IMAGE"] }
        };
    } else {
        payload = { contents: [{ parts: [{ text: prompt }] }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (isTTS) return data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (imageBase64) return data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Thinking...";
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  };

  const playAudio = (inlineData) => {
    if (!inlineData) return;
    try {
        const { data } = inlineData;
        const pcmData = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const sampleRate = 24000;
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);
        const writeString = (offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
        
        writeString(0, 'RIFF'); view.setUint32(4, 36 + pcmData.length, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, 'data');
        view.setUint32(40, pcmData.length, true);
        
        const blob = new Blob([wavHeader, pcmData], { type: 'audio/wav' });
        const audio = new Audio(URL.createObjectURL(blob));
        setIsSpeaking(true); audio.onended = () => setIsSpeaking(false); audio.play();
    } catch (e) { setIsSpeaking(false); }
  };

  const handleAnnounceProduct = async (e, item, isHot) => {
    e.stopPropagation();
    if (isSpeaking) return;
    const finalPrice = isHot ? Math.round(item.price * 0.9) : item.price;
    // Updated Prompt
    const prompt = `Say enthusiastically: "${item.brand} ${item.name}! Only ${finalPrice} rupees! That's a Limited deal in Discount Bazarr, hurry up!"`;
    const audioData = await callGemini(prompt, true);
    if (audioData) playAudio(audioData);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setChatInput("");
    
    if (userMsg.toLowerCase().includes('design') || userMsg.toLowerCase().includes('custom')) {
        setMessages(prev => [...prev, { text: "For designs, please check the 'Design Lab' tab above! You'll find all options there.", sender: 'bot' }]);
        return;
    }

    setIsBotTyping(true);
    // Short & Crisp Answer
    const stockContext = `Inventory: ` + Object.values(catalog).map(c => c.items?.map(i => i.name).join(', ')).join(', ');
    const systemPrompt = `You are DB Bot. Answer the user's question shortly and crisply (max 15 words). strictly base your answer on the provided stock inventory. If not found, say 'Not in stock'. Inventory: ${stockContext}. User: ${userMsg}`;
    
    const aiResponse = await callGemini(systemPrompt);
    setMessages(prev => [...prev, { text: aiResponse, sender: 'bot' }]);
    setIsBotTyping(false);
  };

  const handleGenerateSlogans = async () => {
    if (!sloganTheme) return;
    setIsGeneratingSlogans(true);
    setSloganList([]);
    const result = await callGemini(`Generate 5 catchy short T-shirt slogans for: ${sloganTheme}. Return them as a list.`);
    if (result) {
        const lines = result.split('\n').filter(line => line.trim().length > 0)
                      .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/"/g, '').replace(/^\*\s*/, '').trim())
                      .filter(l => l.length > 2);
        setSloganList(lines);
    }
    setIsGeneratingSlogans(false);
  };

  const handleEnhanceImage = async () => {
      if (!uploadedDesign) return;
      setIsEnhancing(true);
      showToast("Enhancing Image... ✨");
      
      const response = await fetch(uploadedDesign);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          const enhancedBase64 = await callGemini("Make this image high quality, clear and HD. Maintain the original content but remove noise.", false, base64data);
          
          if (enhancedBase64) {
              setUploadedDesign(`data:image/png;base64,${enhancedBase64}`);
              showToast("Image Enhanced! 🌟");
          } else {
              showToast("Enhancement Failed (Try again)");
          }
          setIsEnhancing(false);
      };
      reader.readAsDataURL(blob);
  };

  // --- CSV FILE HANDLING (ROBUST & PERSISTENT) ---
  const handleFileUpload = async (e, catId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== ''); // Remove empty lines
        
        let headerRow = -1;
        let cols = { brand: -1, title: -1, fsp: -1, asp: -1, bdz: -1 };

        // 1. ROBUST HEADER SCAN
        for(let i=0; i < Math.min(lines.length, 50); i++) {
            const rowLower = lines[i].toLowerCase();
            const cells = rowLower.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/"/g, ''));
            
            // Check for key columns
            const hasTitle = cells.some(c => c.includes('product') || c.includes('name') || c.includes('title') || c.includes('description') || c.includes('item'));
            const hasPrice = cells.some(c => c.includes('price') || c.includes('mrp') || c.includes('cost') || c.includes('amount') || c.includes('rate'));

            if (hasTitle && hasPrice) {
                headerRow = i;
                cols.brand = cells.findIndex(c => c.includes('brand'));
                cols.title = cells.findIndex(c => c.includes('product') || c.includes('name') || c.includes('title') || c.includes('description') || c.includes('item'));
                cols.fsp = cells.findIndex(c => c === 'fsp' || c === 'mrp' || c.includes('list price') || c.includes('market') || c.includes('original'));
                cols.asp = cells.findIndex(c => c === 'asp' || c.includes('amazon') || c.includes('online') || c.includes('flipkart') || c.includes('web'));
                cols.bdz = cells.findIndex(c => c.includes('bdz') || c.includes('db price') || c.includes('value') || c.includes('offer') || c.includes('our price') || c.includes('discount') || c.includes('final'));
                
                if (cols.bdz === -1) {
                    cols.bdz = cells.findIndex(c => c === 'price' || c === 'rate' || c === 'amount');
                }
                break;
            }
        }

        if (headerRow === -1 || cols.title === -1) {
             showToast("Error: CSV Headers (Name/Price) not found.");
             return;
        }

        // 2. PARSE ITEMS
        const parsedItems = lines.slice(headerRow + 1).map(line => {
            const p = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const clean = (val) => { 
                if (!val) return 0; 
                return parseFloat(val.replace(/[",₹Rs.\s]/g, '')) || 0; 
            }
            
            const name = p[cols.title]?.replace(/"/g, '').trim();
            if (!name) return null; 

            let fsp = cols.fsp !== -1 ? clean(p[cols.fsp]) : 0;
            let asp = cols.asp !== -1 ? clean(p[cols.asp]) : 0;
            let bdz = cols.bdz !== -1 ? clean(p[cols.bdz]) : 0;
            
            // Intelligent Price Fill
            if (bdz === 0 && fsp > 0) bdz = fsp; 
            if (fsp === 0 && bdz > 0) fsp = Math.round(bdz * 1.2); 

            let brand = "Generic";
            if (cols.brand !== -1 && p[cols.brand]) brand = p[cols.brand].replace(/"/g, '').trim();

            return {
                brand, name, 
                mrp: Math.round(fsp), 
                asp: Math.round(asp), 
                price: Math.round(bdz),
                discount: fsp > 0 ? Math.round(((fsp - bdz) / fsp) * 100) : 0,
                image: null 
            };
        }).filter(Boolean);

        if (parsedItems.length === 0) {
            showToast("Error: No items found in CSV.");
            return;
        }

        const timestamp = new Date().toLocaleString('en-IN', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        });

        // 3. UPDATE FIRESTORE (PERSISTENT STORAGE)
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'stock', 'global');
        
        let updatePayload = {};
        if (catId === 'HOT_DEALS') {
            updatePayload = { hotItems: parsedItems };
            setHotCatalog(parsedItems); // Immediate UI Update
        } else {
            // Using dot notation for deep merge in Firestore to persist other categories
            updatePayload = {
                [`categories.${catId}`]: { 
                    items: parsedItems, 
                    updatedAt: timestamp 
                }
            };
            setCatalog(prev => ({
                ...prev,
                [catId]: { items: parsedItems, updatedAt: timestamp }
            })); // Immediate UI Update
            setActiveCat(catId); // Auto-open category
        }

        // Write to Cloud
        await setDoc(docRef, updatePayload, { merge: true });
        showToast(`Success! ${parsedItems.length} items loaded. 📂`);

      } catch (err) {
        console.error(err);
        showToast("Error parsing CSV. Check format.");
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = async (file, itemIndex, catId, isHot) => {
      if (!file) return;
      
      // AUTH CHECK
      if (!user) {
          showToast("Waiting for secure connection...");
          return;
      }

      setUploadingId(itemIndex);
      
      try {
          // FILENAME SANITIZATION & FALLBACK
          const timestamp = Date.now();
          const originalName = file.name || `image_${timestamp}.jpg`; 
          // Replace anything that isn't a letter, number, or dot with an underscore
          const cleanFileName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
          const finalPath = `products/${timestamp}_${cleanFileName}`;
          
          const storageRef = ref(storage, finalPath);
          
          // METADATA (Crucial for correct browser handling)
          const metadata = {
              contentType: file.type || 'image/jpeg',
          };

          await uploadBytes(storageRef, file, metadata);
          const url = await getDownloadURL(storageRef);
          
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'stock', 'global');
          let updatePayload = {};

          if (isHot) {
              const newItems = hotCatalog.map((item, i) => 
                  i === itemIndex ? { ...item, image: url } : item
              );
              updatePayload = { hotItems: newItems };
              setHotCatalog(newItems);
          } else {
              const currentItems = catalog[catId]?.items || [];
              const newItems = currentItems.map((item, i) => 
                  i === itemIndex ? { ...item, image: url } : item
              );
              
              updatePayload = { [`categories.${catId}.items`]: newItems };
              
              setCatalog(prev => ({
                  ...prev,
                  [catId]: { ...prev[catId], items: newItems }
              }));
          }
          
          await setDoc(docRef, updatePayload, { merge: true });
          showToast("Photo Updated! 📸");
      } catch(e) {
          console.error("Upload Error:", e);
          showToast(`Upload Failed: ${e.message || "Unknown error"}`);
      } finally {
          setUploadingId(null);
      }
  };

  const shareWA = (item, isHot) => {
    const finalPrice = isHot ? Math.round(item.price * 0.9) : item.price;
    let text = `Hi *Discount Bazarr*! 👋\nI found this deal:\n\n🔥 *${item.brand} - ${item.name}*\n💰 *My Price: ₹${finalPrice}* ${isHot ? '(Extra 10% OFF)' : ''}\n❌ Online Price: ₹${item.mrp}\n\nIs this available?`;
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const items = activeCat ? catalog[activeCat]?.items || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-900 relative overflow-x-hidden"
         onMouseMove={(e) => handleGlobalDragMove(e)}
         onMouseUp={handleGlobalDragEnd}
         onTouchMove={(e) => handleGlobalDragMove(e)}
         onTouchEnd={handleGlobalDragEnd}>
      
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-blue-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-white/20"><Check size={16} className="text-yellow-400" /><span className="text-xs font-bold uppercase tracking-wider">{toast}</span></div>}

      {/* MOVABLE CHATBOT ICON */}
      <div 
        className="fixed z-[90] flex flex-col items-center gap-1 group cursor-move touch-none"
        style={{ left: chatPos.x, top: chatPos.y }} 
        onMouseDown={(e) => handleGlobalDragStart(e, 'bot')}
        onTouchStart={(e) => handleGlobalDragStart(e, 'bot')}
      >
         <div className="bg-blue-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-lg select-none pointer-events-none">DB Bot</div>
         <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-yellow-400 text-blue-900 p-4 rounded-full shadow-2xl active:scale-95 transition-transform border-4 border-white ring-2 ring-blue-900/10">
            {isChatOpen ? <X size={24} /> : <Bot size={24} />}
         </button>
      </div>

      {isChatOpen && (
        <div className="fixed z-[80] w-80 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10"
             style={{ 
               left: Math.max(10, Math.min(window.innerWidth - 330, chatPos.x)), 
               top: Math.max(10, Math.min(window.innerHeight - 510, chatPos.y - 510))
             }}>
           
           <div className="bg-yellow-400 p-4 flex items-center justify-between border-b border-yellow-500">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center"><Bot size={20} className="text-yellow-400"/></div>
                   <div><p className="text-blue-900 text-sm font-black uppercase">DB Bot</p><p className="text-blue-900/70 text-[10px] font-bold">Guided Assistant</p></div>
               </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={chatScrollRef}>
               {messages.map((msg, idx) => (
                   <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                       <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-bold ${msg.sender === 'user' ? 'bg-blue-900 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>{msg.text}</div>
                   </div>
               ))}
               {isBotTyping && <div className="flex justify-start"><span className="animate-pulse text-[10px] text-slate-400 font-bold ml-2">Typing...</span></div>}
           </div>

           <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
               <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChatSend()} placeholder="Ask specific questions..." className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs font-bold outline-none" />
               <button onClick={handleChatSend} className="bg-blue-900 text-white p-2 rounded-full"><Send size={14}/></button>
           </div>
        </div>
      )}

      {/* --- IMPROVED HEADER --- */}
      <header className="bg-blue-800 pt-8 pb-20 px-6 text-center relative overflow-hidden rounded-b-[60px] shadow-2xl">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-6">
            <a href={`tel:${WHATSAPP_NUM}`} className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                <Phone size={20} />
            </a>
            <a href={MAP_URL} target="_blank" className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                <MapPin size={20} />
            </a>
        </div>

        {/* Logo & Title */}
        <div onClick={handleLogoTap} className="relative inline-block group cursor-pointer mb-2">
          <div className="w-24 h-24 bg-white rounded-3xl rotate-3 shadow-2xl flex items-center justify-center p-1 border-4 border-yellow-400 group-active:scale-95 transition-transform">
             <div className="w-full h-full bg-blue-900 rounded-2xl flex items-center justify-center">
                 <span className="text-white font-black text-4xl italic tracking-tighter">DB</span>
             </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-[10px] font-black shadow-lg">OFFICIAL</div>
        </div>
        
        {/* Instagram Link Under Logo */}
        <div className="flex justify-center mb-4">
            <a href={INSTA_URL} target="_blank" className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg hover:opacity-90 transition-opacity">
                <Instagram size={12} /> @discount_bazarr
            </a>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Discount Bazarr</h1>
          {/* TAGLINE RESTORED HERE */}
          <div className="flex flex-col gap-1 text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 italic">
              <p>🤝 Come with Trust</p>
              <p>🛡️ Buy with Confidence</p>
              <p>😊 Move with Happiness</p>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className={`max-w-md mx-auto px-4 -mt-10 relative z-10 flex gap-2`}>
        <button onClick={() => { setCurrentTab('deals'); setActiveCat(null); }} className={`flex-1 py-4 rounded-3xl font-black text-sm uppercase flex flex-col items-center gap-1 shadow-xl transition-all ${currentTab === 'deals' ? 'bg-blue-900 text-white ring-2 ring-white scale-105' : 'bg-white text-slate-400'}`}>
            <Tag size={16} /> Daily Deals
        </button>
        <button onClick={() => { setCurrentTab('hot'); setActiveCat(null); }} className={`flex-1 py-4 rounded-3xl font-black text-sm uppercase flex flex-col items-center gap-1 shadow-xl transition-all ${currentTab === 'hot' ? 'bg-red-600 text-white ring-2 ring-white scale-105' : 'bg-white text-red-400'}`}>
            <Flame size={16} className={currentTab === 'hot' ? 'animate-pulse' : ''} /> Hot Deals
        </button>
        <button onClick={() => setCurrentTab('custom')} className={`flex-1 py-4 rounded-3xl font-black text-sm uppercase flex flex-col items-center gap-1 shadow-xl transition-all ${currentTab === 'custom' ? 'bg-blue-900 text-white ring-2 ring-white scale-105' : 'bg-white text-slate-400'}`}>
            <Palette size={16} /> Design Lab
        </button>
      </div>

      <main className="max-w-md mx-auto p-6">
        
        {/* --- DAILY DEALS TAB --- */}
        {currentTab === 'deals' && (
          <>
            {!activeCat ? (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in">
                <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div><h2 className="text-sm font-black text-blue-900 uppercase tracking-widest italic">Full Inventory</h2></div>
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 group relative">
                    <div onClick={() => setActiveCat(cat.id)} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4"><div className={`${cat.color} p-4 rounded-2xl text-white shadow-lg`}><cat.icon size={24} /></div><div><p className="font-black uppercase text-slate-800 text-xs">{cat.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase italic">
                          {catalog[cat.id]?.updatedAt ? `Updated: ${catalog[cat.id].updatedAt}` : 'Stock Loaded'}
                      </p></div></div>
                      <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    {/* CSV UPLOAD BUTTON FOR ADMIN */}
                    {isAdmin && (
                        <label onClick={(e) => e.stopPropagation()} className="mt-4 block bg-slate-50 text-slate-500 py-3 rounded-xl border border-dashed border-slate-300 text-[10px] font-bold text-center cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all">
                             <Upload size={14} className="inline mr-1"/> Upload CSV for {cat.name}
                             <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, cat.id)} />
                        </label>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => { setActiveCat(null); setSearchTerm(''); }} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-5 py-2.5 rounded-full hover:bg-blue-100 transition-colors"><ChevronLeft size={16} /> Back</button>
                    {catalog[activeCat]?.updatedAt && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full"><Clock size={10} className="inline mr-1"/>{catalog[activeCat].updatedAt}</span>
                    )}
                </div>
                
                <div className="space-y-6">
                  {items.length > 0 ? items.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-all cursor-pointer group">
                        <div onClick={() => shareWA(item, false)}>
                            
                            {/* IMAGE OR LOADING SPINNER */}
                            {uploadingId === idx ? (
                                <div className="w-full h-56 bg-slate-100 flex flex-col items-center justify-center animate-pulse border-b border-slate-100">
                                    <Loader2 size={32} className="animate-spin text-blue-500 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploading Photo...</span>
                                </div>
                            ) : (
                                item.image && <img src={item.image} className="w-full h-56 object-cover" />
                            )}
                            
                            <div className="p-5">
                              
                              {/* 1. PRICE BOX (MOVED DIRECTLY UNDER IMAGE) */}
                              <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 mb-4 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase">{item.discount}% OFF</div>
                                  <div className="flex flex-col">
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 line-through mb-1">
                                         <span>MRP: ₹{item.mrp}</span>
                                         {item.asp > 0 && <span>Online: ₹{item.asp}</span>}
                                      </div>
                                      <div className="flex items-baseline gap-2">
                                         <span className="text-xs font-bold text-slate-500 uppercase">DB Price:</span>
                                         <span className="text-3xl font-black text-blue-900 tracking-tight">₹{item.price}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* 2. PRODUCT DETAILS (BELOW PRICE) */}
                              <div className="mb-2">
                                 <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">In Stock</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</p>
                                 </div>
                                 <h3 className="text-base font-black text-slate-800 uppercase leading-snug line-clamp-2">{item.name}</h3>
                              </div>
                              
                              {/* Audio Button */}
                              <div className="flex justify-end -mt-8 mb-2">
                                 <button onClick={(e) => handleAnnounceProduct(e, item, false)} className="bg-slate-100 text-slate-400 p-2 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"><Volume2 size={16}/></button>
                              </div>

                            </div>
                        </div>
                        {/* ADMIN ONLY: LIVE CAMERA UPLOAD */}
                        {isAdmin && (
                            <label className="w-full bg-blue-50 text-blue-600 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase cursor-pointer border-t border-blue-100 hover:bg-blue-100 transition-colors">
                                <Camera size={14} /> Live Photo Update
                                <input type="file" hidden accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e.target.files[0], idx, activeCat, false)} />
                            </label>
                        )}
                        <div className="p-6 pt-0"><button onClick={() => shareWA(item, false)} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-xl hover:bg-blue-800 transition-colors"><MessageCircle size={16} /> Order</button></div>
                    </div>
                  )) : (
                      <div className="text-center py-20 text-slate-300">
                          <Package size={48} className="mx-auto mb-2 opacity-50"/>
                          <p className="text-xs font-bold uppercase">No items in this category.</p>
                          {isAdmin && <p className="text-[10px] text-blue-500 mt-2">Upload a CSV to get started.</p>}
                      </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- TODAY'S HOT DEALS TAB --- */}
        {currentTab === 'hot' && (
            <div className="animate-in fade-in">
                {/* Hot Deals Banner */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-6">
                    <div className="relative z-10">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Today's Hot Deals</h2>
                    <p className="text-xs font-bold bg-white text-red-600 inline-block px-3 py-1 rounded-lg mt-2 uppercase tracking-widest">Extra 10% Discount on Daily Deals</p>
                    </div>
                    <Flame className="absolute -right-4 -bottom-4 text-white/20 w-32 h-32 animate-pulse" />
                </div>
                
                {/* CSV UPLOAD FOR HOT DEALS (ADMIN) */}
                {isAdmin && (
                    <div className="mb-6">
                        <label className="block w-full bg-red-50 text-red-500 py-4 rounded-[32px] border-2 border-dashed border-red-200 text-xs font-black uppercase text-center cursor-pointer hover:bg-red-100 hover:border-red-300 transition-all">
                             <Upload size={16} className="inline mr-2"/> Upload Hot Deals CSV
                             <input type="file" hidden accept=".csv" onChange={(e) => handleFileUpload(e, 'HOT_DEALS')} />
                        </label>
                    </div>
                )}

                <div className="space-y-6">
                    {hotCatalog.length > 0 ? (
                        hotCatalog.map((item, idx) => {
                            const finalPrice = Math.round(item.price * 0.9);
                            return (
                                <div key={idx} className="bg-white rounded-[40px] border-2 border-red-100 overflow-hidden shadow-xl ring-4 ring-red-50 relative">
                                    <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg border border-white/20"><Flame size={10} /> Extra 10% OFF</div>
                                    <div onClick={() => shareWA(item, true)}>
                                        
                                        {/* IMAGE OR LOADING SPINNER */}
                                        {uploadingId === idx ? (
                                            <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center animate-pulse border-b border-red-50">
                                                <Loader2 size={32} className="animate-spin text-red-500 mb-2" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploading...</span>
                                            </div>
                                        ) : (
                                            item.image && <img src={item.image} className="w-full h-48 object-cover" />
                                        )}

                                        <div className="p-6 bg-gradient-to-b from-white to-red-50/30">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-black text-slate-800 uppercase text-lg line-clamp-2 leading-tight">{item.name}</h3>
                                                <button onClick={(e) => handleAnnounceProduct(e, item, true)} className="bg-red-100 text-red-600 p-2 rounded-full"><Volume2 size={16} className={isSpeaking ? 'animate-pulse' : ''}/></button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="p-4 bg-slate-50 rounded-3xl"><p className="text-[8px] font-black text-slate-400 uppercase">Regular</p><p className="text-sm text-slate-400 line-through">₹{item.price}</p></div>
                                                <div className="p-4 bg-red-600 text-white rounded-3xl shadow-lg ring-2 ring-red-200"><p className="text-[8px] font-black uppercase animate-pulse">Hot Price</p><p className="text-2xl font-black italic">₹{finalPrice}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ADMIN ONLY: LIVE CAMERA UPLOAD */}
                                    {isAdmin && (
                                        <label className="w-full bg-red-50 text-red-500 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase cursor-pointer border-t border-red-100 hover:bg-red-100 transition-colors">
                                            <Camera size={14} /> Live Photo Update
                                            <input type="file" hidden accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e.target.files[0], idx, null, true)} />
                                        </label>
                                    )}
                                    <div className="p-6 pt-0"><button onClick={() => shareWA(item, true)} className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-xl hover:opacity-90 transition-opacity">Grab Deal</button></div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-20 text-red-300"><Flame size={48} className="mx-auto mb-2"/><p className="text-xs font-bold uppercase">No Hot Deals Loaded</p></div>
                    )}
                </div>
            </div>
        )}

        {/* --- DESIGN LAB (KEPT AS IS) --- */}
        {currentTab === 'custom' && (
          <div className="text-center py-10 bg-white rounded-[40px] border border-slate-100 shadow-sm px-6 animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-600"><Camera size={40} /></div>
             <h2 className="text-2xl font-black text-slate-800 uppercase italic italic">The Design Lab</h2>
             
             {/* QUOTE SLIDER */}
             <div className="h-24 flex items-center justify-center my-4 px-4 overflow-hidden relative">
                 <p key={quoteIndex} className="text-lg font-medium italic text-slate-600 leading-relaxed transition-all duration-700 animate-in slide-in-from-right fade-in">
                     "{QUOTES[quoteIndex]}"
                 </p>
             </div>

             {/* INSTANT MOCKUP STUDIO */}
             <div className="mb-8">
                <div 
                   ref={mockupRef}
                   className="relative w-full aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group touch-none"
                >
                    <Shirt size={240} className="text-slate-300 absolute" strokeWidth={0.5} style={{ fill: designSpecs.color === 'White' ? '#fff' : designSpecs.color === 'Black' ? '#222' : DESIGN_OPTS.colors.find(c => c.name === designSpecs.color)?.hex || '#eee' }} />
                    
                    {/* Movable Photo with LIVE VIBE FILTER */}
                    {uploadedDesign ? (
                        <img 
                          src={uploadedDesign} 
                          style={{ 
                              transform: `scale(${mockupZoom})`,
                              filter: VIBE_FILTERS[designSpecs.vibe] || "none",
                              transition: 'filter 0.5s ease'
                          }}
                          className="max-w-[120px] max-h-[120px] z-10 object-contain transition-transform pointer-events-none"
                        />
                    ) : (
                        <div className="flex flex-col items-center z-10 pointer-events-none">
                            <Upload className="text-slate-400 mb-2" size={32} />
                            <span className="text-xs font-black text-slate-400 uppercase">Upload Design</span>
                        </div>
                    )}

                    {/* Movable Slogan Text with CUSTOM STYLE */}
                    {mockupText && (
                        <div 
                           style={{ 
                               position: 'absolute', 
                               top: `${textPos.y}%`, 
                               left: `${textPos.x}%`, 
                               transform: 'translate(-50%, -50%)',
                               cursor: 'move',
                               fontSize: `${textConfig.size}px`,
                               fontFamily: textConfig.font,
                               color: textConfig.color,
                               textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                           }}
                           onMouseDown={(e) => handleGlobalDragStart(e, 'text')}
                           onTouchStart={(e) => handleGlobalDragStart(e, 'text')}
                           className="z-30 select-none whitespace-nowrap bg-white/20 px-2 rounded-lg border border-dashed border-transparent hover:border-slate-400 transition-colors"
                        >
                            {mockupText}
                        </div>
                    )}

                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) setUploadedDesign(URL.createObjectURL(file));
                    }} />
                </div>

                {/* IMAGE ZOOM & ENHANCE CONTROLS */}
                {uploadedDesign && (
                   <div className="flex items-center justify-center gap-4 mt-4">
                       <button onClick={() => setMockupZoom(z => Math.max(0.5, z - 0.1))} className="p-3 bg-white shadow-lg rounded-full text-slate-600 border border-slate-100 hover:bg-slate-50"><ZoomOut size={20}/></button>
                       <button 
                         onClick={handleEnhanceImage} 
                         className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                       >
                           {isEnhancing ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />} 
                           {isEnhancing ? "Enhancing..." : "Auto-Enhance"}
                       </button>
                       <button onClick={() => setMockupZoom(z => Math.min(2.5, z + 0.1))} className="p-3 bg-white shadow-lg rounded-full text-blue-600 border border-blue-100 hover:bg-blue-50"><ZoomIn size={20}/></button>
                   </div>
                )}
             </div>

             {/* --- DESIGN CONTROLS --- */}
             <div className="space-y-6 text-left mb-8">
                 
                 {/* Slogan Text Customization Toolbar */}
                 {mockupText && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                             <Type size={14} className="text-blue-600"/>
                             <p className="text-[10px] font-black uppercase text-blue-900">Text Styler</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Size Slider */}
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 block mb-1">Size</label>
                                <input 
                                    type="range" min="10" max="60" 
                                    value={textConfig.size} 
                                    onChange={(e) => setTextConfig({...textConfig, size: parseInt(e.target.value)})}
                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                             {/* Color Picker */}
                             <div>
                                <label className="text-[9px] font-bold text-slate-400 block mb-1">Color</label>
                                <input 
                                    type="color" 
                                    value={textConfig.color}
                                    onChange={(e) => setTextConfig({...textConfig, color: e.target.value})}
                                    className="w-full h-6 rounded cursor-pointer"
                                />
                             </div>
                        </div>
                        {/* Font Style */}
                        <div className="mt-3">
                            <label className="text-[9px] font-bold text-slate-400 block mb-1">Font Style</label>
                            <div className="flex flex-wrap gap-2">
                                {FONT_STYLES.map((f) => (
                                    <button 
                                        key={f.name}
                                        onClick={() => setTextConfig({...textConfig, font: f.font})}
                                        className={`px-3 py-1 rounded-lg text-[10px] border transition-all ${textConfig.font === f.font ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                        style={{ fontFamily: f.font }}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                 )}

                 {/* Vibe Selection (Live Filter) */}
                 <div>
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-pink-500"/>
                        <p className="text-[10px] font-black uppercase text-slate-400">Define the Vibe (Live Filter)</p>
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {DESIGN_OPTS.vibes.map(v => (
                             <button key={v} onClick={() => setDesignSpecs({...designSpecs, vibe: v})} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${designSpecs.vibe === v ? 'bg-pink-600 text-white border-pink-600 shadow-lg scale-105' : 'bg-white text-slate-500 border-slate-200'}`}>{v}</button>
                         ))}
                     </div>
                 </div>

                 {/* Age Selection */}
                 <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Who is this for?</p>
                     <div className="flex gap-2">
                         {DESIGN_OPTS.ages.map(a => (
                             <button key={a} onClick={() => setDesignSpecs({...designSpecs, age: a})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${designSpecs.age === a ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-500 border-slate-200'}`}>{a}</button>
                         ))}
                     </div>
                 </div>

                 {/* Style Selection */}
                 <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Pick a Style</p>
                     <div className="flex flex-wrap gap-2">
                         {DESIGN_OPTS.styles.map(s => (
                             <button key={s} onClick={() => setDesignSpecs({...designSpecs, style: s})} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${designSpecs.style === s ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-500 border-slate-200'}`}>{s}</button>
                         ))}
                     </div>
                 </div>

                 {/* Size Selection */}
                 <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Select Size</p>
                     <div className="flex flex-wrap gap-2">
                         {DESIGN_OPTS.sizes.map(s => (
                             <button key={s} onClick={() => setDesignSpecs({...designSpecs, size: s})} className={`w-8 h-8 flex items-center justify-center rounded-full text-[9px] font-bold border transition-all ${designSpecs.size === s ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-500 border-slate-200'}`}>{s}</button>
                         ))}
                     </div>
                 </div>

                 {/* Color Selection */}
                 <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Choose Color</p>
                     <div className="flex flex-wrap gap-3">
                         {DESIGN_OPTS.colors.map(c => (
                             <button key={c.name} onClick={() => setDesignSpecs({...designSpecs, color: c.name})} className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${designSpecs.color === c.name ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'border-slate-100'}`} style={{ backgroundColor: c.hex }} title={c.name}></button>
                         ))}
                     </div>
                     <p className="text-[10px] text-slate-400 mt-1 font-bold text-right">{designSpecs.color}</p>
                 </div>
             </div>
             
             {/* AI SLOGAN GENERATOR */}
             <div className="mt-8 bg-pink-50 rounded-3xl p-6 border border-pink-100 text-left">
                <div className="flex items-center gap-2 mb-3">
                   <div className="bg-pink-100 p-2 rounded-lg"><Wand2 size={16} className="text-pink-600" /></div>
                   <p className="text-xs font-black uppercase text-pink-900">AI Slogan Generator ✨</p>
                </div>
                <div className="flex gap-2 mb-4">
                   <input type="text" placeholder="Theme (e.g. Cricket)..." value={sloganTheme} onChange={(e) => setSloganTheme(e.target.value)} className="flex-1 bg-white border border-pink-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                   <button onClick={handleGenerateSlogans} className="bg-pink-600 text-white px-4 rounded-xl font-bold text-xs">{isGeneratingSlogans ? '...' : 'Go'}</button>
                </div>
                
                {/* Slogan List with Copy/Preview Buttons */}
                <div className="space-y-2">
                    {sloganList.map((slogan, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-pink-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-[10px] font-bold text-slate-700 flex-1">{slogan}</p>
                            <button 
                                onClick={() => { 
                                    navigator.clipboard.writeText(slogan); 
                                    setMockupText(slogan); // Live Update Mockup
                                    showToast("Copied & Applied to Shirt! 👕"); 
                                }} 
                                className="bg-pink-50 text-pink-500 p-2 rounded-lg hover:bg-pink-100 active:scale-95 transition-transform"
                                title="Copy & Preview"
                            >
                                <Copy size={12}/>
                            </button>
                        </div>
                    ))}
                </div>
             </div>

             <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=Hi! I want to order a custom design:%0A%0ADetails:%0A- Age: ${designSpecs.age}%0A- Style: ${designSpecs.style}%0A- Size: ${designSpecs.size}%0A- Color: ${designSpecs.color}%0A- Vibe: ${designSpecs.vibe}%0A- Text: ${mockupText}`, '_blank')} className="mt-10 w-full bg-pink-600 text-white py-5 rounded-3xl font-black uppercase text-xs shadow-xl shadow-pink-600/20 active:scale-95 transition-transform">Start Designing on WhatsApp</button>
          </div>
        )}
      </main>
    </div>
  );
}