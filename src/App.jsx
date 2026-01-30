import React, { useState, useEffect } from 'react';
import { 
  Bus, Search, MapPin, MessageCircle, Clock, Users, AlertCircle, 
  Share2, ThumbsUp, MessageSquare, ChevronRight, PlusCircle, Save,
  ArrowRightLeft, Phone, Heart, Shield, HelpCircle, X, Menu, Home,
  Edit3, CheckCircle, Info, PlusSquare, Map, AlertTriangle, Trash2, 
  BarChart3, Database, Star, Navigation, Ticket, Trophy, Sparkles,
  ExternalLink, FileText, Lock, Eye, Mail, Cookie, Filter, Monitor,
  Maximize2, Minimize2
} from 'lucide-react';

// --- ASSET IMPORTS ---
import busImg1 from './assets/bus/keralabuses.png';
import busImg2 from './assets/bus/keralabuses_ksrtc.png';
import busImg3 from './assets/bus/keralabuses_private_bus.png';
import busImg4 from './assets/bus/keralabuses_ksrtc_volvo.png';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion, query, orderBy, increment, getDoc 
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not connected. Please update firebaseConfig.");
}

// --- CONSTANTS ---
const BUS_STOPS_RAW = [
  "THIRUVANANTHAPURAM","KOTTAYAM","ALUVA","VYTILLA HUB","THRISSUR","ERNAKULAM","ALAPPUZHA","KOTTARAKKARA","CHANGANASSERY","KOLLAM","THIRUVALLA","CHERTHALA","KOZHIKKODE","KAYAMKULAM","CHALAKUDY","KARUNAGAPPALLY","MUVATTUPUZHA","ANKAMALY","ATTINGAL","NEYYATTINKARA","THRIPPUNITHURA","NEDUMANGAD","ADOOR","ETTUMANOOR","TRIVANDRUM","PUTHUKKAD","VENJARAMOODU","CHENGANNUR","PALA","KATTAKKADA","PERUMBAVOOR","KANIYAPURAM","KILIMANOOR","PUNALUR","PATHANAMTHITTA","OACHIRA","PALAKKAD","NORTH PARAVOOR","HARIPPAD","KANJIRAPALLY","CHATHANNOOR","CHADAYAMANGALAM","PAPPANAMCODE","AYOOR","BALARAMAPURAM","PANDALAM","MANANTHAVADY","KALPETTA","KOTTIYAM","KUNNAMKULAM","AMBALAPPUZHA","KOOTHATTUKULAM","THAMARASSERY","BANGALORE","PARASSALA","EDAPPAL","MEDICAL COLLEGE THIRUVANANTHAPURAM","MUNDAKKAYAM","THODUPUZHA","PONKUNNAM","KAZHAKKOOTTAM","KASARAGOD","KOTTAKKAL","KALIYIKKAVILA","CHAVARA","KUNDARA","KODUNGALLUR","GURUVAYOOR","EAST FORT","POOVAR","KUNNAMANGALAM","CHINNAKKADA","AROOR","KUTTIPPURAM","ERAMALLOOR","THURAVOOR","VAIKKOM","ERNAKULAM JETTY","PATTOM","VIZHINJAM","PATHANAPURAM","EDAPALLI BYE-PASS JN","ERATTUPETTA","ATHANI","CALICUT UNIVERSITY","PEROORKADA","KOZHENCHERRY","THALAYOLAPARAMBU","VARAPPUZHA","KOONAMMAVU","ADIVAARAM","PERINTHALMANNA","SREEKARYAM","VADANAPPALLY","KUTHIYATHODE","KOLENCHERY","KARICODE","ERUMELY","KANHANGAD","KANNUR","EZHUKONE","KARAKULAM","AMBALLUR","PUTHENKURISH","CHAVAKKAD","SULTAN BATHERY","PEYAD","POTHENCODE","PUTHENPALAM","THIRUMALA","KARETTU","VALANCHERY","KALAMASSERY","VELLARADA","VADAKKENCHERRY","KUNDANOOR","VANDANAM MEDICAL COLLEGE","PARIPPALLY","PIRAVOM","MARAMPALLY","KODAKARA","CHINGAVANAM","ANCHAL","THRIPRAYAR","KODUVALLY","VELLANAD","KARAKONAM","MATHILAKAM","MOONUPEEDIKA","CHULLIMANOOR","ARYANAD","UDIYANKULANGARA","KOTHAMANGALAM","ALAMCODE","MANGALAPURAM","VEMBAYAM","KALLAMBALAM","MUKKOLA","KUTTIKKANAM","PAMPADY","ALATHUR","EDATHUVA","VALAKOM","KUZHALMANNAM","OLLUR","VADAKARA","THALASSERY","ANGAMALY","THIRUVALLOM","RAMANATTUKARA","BHARANAMGANAM","KATTAPPANA","KUNNIKODE","KONNI","PANAMARAM","RANNY","THIRUVANKULAM","ENGAPUZHA","KOVALAM","PALODE","K.CHAPPATH","AZHAKULAM","KOZHIKODE","KARUKACHAL","MARANALLOOR","KUMILY","MALAYINKEEZH","KALLARA","POOVACHAL","KALLUVATHUKKAL","KURAVILANGAD","VYTHIRI","MAVELIKKARA","MALAPPURAM","CHAKKULATHUKAVU","THACHOTTU KAVU","RAMANKARI","KOILANDI","VITHURA","KAKKANAD","THOTTAPPALLY","MONCOMBU","KANJIKKUZHY","KORATTY","KALOOR","KANJIRAMKULAM","NILAMEL","NEDUMUDY","MANNARKAD","MALLAPPALLY","THENMALA","KOTTAPURAM","PONNANI","KARUKUTTY","KALAVOOR","NILAMBUR","PATTAMBI","KIDANGARA","LAKKIDI","MEENANGADI","KONDOTTY","PANACHAMOODU","KADUTHURUTHY","VAMANAPURAM","ELANTHOOR","MANNUTHY","KAMBALAKKAD","THOPPUMPADY","MYSORE","BHARANIKKAVU","KUTTICHAL","VANDIPERIYAR","MUHAMMA","PUTHIYATHURA","MANGALORE","KADAKKAL","PEERMEDU","KANJIRAMATTOM","KULATHUPUZHA","UCHAKADA","KIDANGOOR","MAHE","POOTHOTTA","PATTIKKAD","PUTHUKAD","CHARUMMOODU","ELAMBAL","VATTAPPARA","OLATHANI","MADATHARA","THALAPPAADI","WALAYAR","COIMBATORE","MUTTOM","KALLADIKODE","PAYYANNUR","ENATH","THOTTILPALAM","THAKAZHY","UZHAMALAKKAL","KESAVADASAPURAM","MALA","OTTASEKHARAMANGALAM","PAZHAYAKADA","MANJESHWAR","TIRUR","THALIPARAMBA","UPPALA","NELLIMOODU","ARANMULA","THANNEERMUKKOM","KURUPPANTHARA","KUMBLA","KUTTIADY","OORUTTAMBALAM","KALLISSERY","MANNANCHERY","MANJERI","MANDAPATHINKADAVU","KURAMPALA","MUNDUR","CHERUVATHOOR","EDAKOCHI","CHETTIKULANGARA","MARTHANDAM","ELAPPARA","ULLIYERI","UZHAVOOR","THATTATHUMALA","THEKKADA","TVM GENERAL HOSPITAL","IRINJALAKUDA","UCHAKKADA","SASTHAMKOTTA","KALLIKKAD","NEELESWARAM","KURUPPAMPADY","NAGERCOVIL","MARAKKULAM","CHAKKA","CHENGANNUR RS","OORAMBU","KARAKKAD","MOOLAMATTOM","VARKALA","MANOOR","PERUMATHURA","CHENKAVILA","CHAMRAVATTOM","MUNNAR","VAZHIKKADAVU","NERIAMANGALAM","KUTTIPURAM","THENKASI","POOYAPPALLY","PULLAD","THIRUVAMBADY","MURUKKUMPUZHA","KALAYAPURAM","KUMARAKOM","KARUNAGAPPALLI","ERAVIPEROOR","RAMAPURAM","AMBALAPUZHA","VENJARAMMOODU","ARYANKAVU","PERAMBRA","CHIRAYINKEEZHU","NEDUMKANDAM","NANNIYODE","ADIMALY","PUTHUKURICHY","ANCHALUMMOODU","ARAKKUNNAM","PAIKA","COIMBATORE UKKADAM","KATTANAM","THOLICODE","CHERAI","CHERUTHONI","KUMARAMPUTHUR","THANNEERMUKKOM","NADAKKAVU","MUKKAM","NATTUKAL","NOORANADU","VYPIN","PAZHAKULAM","DHANUVACHAPURAM","NJARACKAL","SHENKOTTAI","MUNDELA","PARIYAARAM","HARIPAD","KOTTAYAM MCH","VILAPPILSALA","ATHIKKATTUKULANGARA","ARUMANOOR","KARIVELLUR","BEKAL","MAKKARAPARAMBA","OYOOR","MANNAR","NELLIKUNNAM","SASTHAMANGALAM","PALLIKKAL","HIGH COURT","OTTAPALAM","VATTIYOORKAVU","CHEMBOOR","ATHOLI","PUTHUPPALLY","CHITTUMALA","MARAYAMUTTOM","VENNIKULAM","THALAYAZHAM","KADAMPANAD","MANIMALA","CHAMPAKULAM","ELATHUR","PUTHOOR","PUTHANANGADY","ERUTHAVOOR","THALAPPUZHA","PULPALLY","IRINCHAYAM","POLLACHI","ANCHALPETTY","CHUNGATHARA","VENGANOOR","YEROOR","ELANJI","KALLODY","MUKKOOTTUTHARA","KOKKADU","KURUMASSERY","KIZHAKKAMBALAM","KATTIKULAM","PAYYOLI","AIMS HOSPITAL","VARANAD","PARAMBATH","EDAKKARA","KARAVALOOR","ARUVIKKARA","KOZHIKODE UNIVERSITY","NAGAROOR","KAVALAM","PARAPPANANGADI","PATHIRIPPALA","URAKAM","PAPPINISSERI","PERAYAM","THEKKUMBHAGAM","NADUVANNUR","CHANGARAMKULAM","THEMPAMMOODU","VEEYAPURAM","KANNANALLOOR","VELLAMUNDA","PATTAZHY","TANUR","PERUMKADAVILA","BALUSSERY","THEVARA","CHITHARA","ODANAVATTOM","PATTIMATTOM","NEYYAR DAM","KOOTTANAD","VELIYAM","KARUNAGAPALLY","PULINKUNNU","VELLANGALLUR","HMT KALAMASSERY","KALLAR","IRITTY","PADAPPANAL","VAZHICHAL","MITHIRMALA","KOZHINJAMPARA","MANNAMKONAM","CHOONDY","ANNAMANADA","KADINAMKULAM","MUTHUVILA","PANAVOOR","PEREKONAM","EDAVANNA","OONNUKAL","KOOVAPPALLY","MONIPPALLY","KOLLAM CIVIL STATION","KUNNATHUR","CHOTTANIKARA","MOOZHY","PERINGAMMALA","KAMUKINCODE","THALACHIRA","WANDOOR","PUNNAMOODU","KOZHIKKODE MCH","POZHIYOOR","ANDOORKONAM","PAKALKURI","POONJAR","ANACHAL","AYATHIL","ASHTAMICHIRA","NIRAVILPUZHA","KUTTAMASSERY","EDAMON","THAMARAKULAM","AMBALAMKUNNU","CHALAKKUDY","PERUVA","AROOKUTTY","GOPALAPURAM","VAZHAKULAM","ELAVUMTHITTA","AREACODE","AMBOORI","KAROOR","CHITTOOR","MEEYANNOOR","NEDUMBASSERY AIRPORT","CHERKALA","NIT CALICUT","KADAPUZHA","ELAMKADU","POONOOR","ILLIKKAL","OLAVAKODE","EDAKKAD","ALUR","NADAVAYAL","OMASSERY","PAMBAVALLEY","PANDIKKAD","CHALLIMUKKU","MEPPADI","KAVANATTINKARA","KALADY","MARANGATTUPALLY","THOTTAKKAD","CHELACHUVADU","PUDUNAGARAM","SHORNUR","KOOTTAPPU","VELI","VALLUVAMBRAM","BEENACHI","MANJANIKKARA","ARYANCODE","CHERUPUZHA","VADASSERIKKARA","PLAMOOTTUKADA","KULAMAVU","ANAKKAMPOYIL","TEEKOY","UPPUTHARA","THOOKKUPALAM","NELLAD","PANGODU","GUNDULPET","POOVATHUSSERY","PAIPAD","KUDAPPANAMOODU","MARYKULAM","ANAYADI","KULATHOOR HS","CHATHANAD","MARAPPALAM","CHUNKAPPARA","NANJANGUD","KENGERI","KOODAL","KUNNAMTHANAM","PULLURAMPARA","POOCHAKKAL","CHERIYAKONNI","PARA","MOOLITHODU","KUTTA COORG","KODunGOOR","UPPUKANDAM","THOLPETTY","KAYAMKULAM RS","KANJAR","VALAT","MEENKUNNAM","AYIRAMTHENGU","THAMARAKUDY","KOZHIKKOD UNIVERSITY","ALL SAINTS COLLEGE","CHOZHIYAKODU","NELLIMATTOM","KALLOOPPARA","MANDYA","KAKKATTIL","KOTTOOR","PERINGAMALA","CHAKKUVARAKKAL","NADAPURAM","AZHEEKKAL","CHUNAKKARA","PALAPPETTY","KORUTHODU","KOLLAPALLY","CHERIAZHEEKKAL","VALLIKKUNNU","PALLICKATHODU","PERUMBALAM","DASANAKKARA","PAKKOM","PAINGOTTOOR","PUTHUSSERY","SALEM","VELIYANNOOR","KENICHIRA","KANJIRAPPALLY","UMMANNOOR","KUZHIMAVU","PADINJARETHARA","MUTHUKULAM","BHAGAVATHIPURAM","ANAPPARA","ARATTUPUZHA","VLATHANKARA","WADAKKANCHERY","POOZHIKUNNU","NARUVAMOODU","ARTHUNKAL","PUTHUPPADY","RAMANAGARA","KOTTIYOOR","CHANNAPATTANA","SRIRANGAPATNA","KRISHNAN KOTTA","KRISHNAPURAM","AMBAYATHODE","KATTILKADAVU","MADDUR","MEDICAL COLLEGE ERNAKULAM","THRIKKUNNAPPUZHA","THUMPODU","KIDANGANNOOR","PERAVOOR","PARAVUR","VALLIKKAVU","KOOTHUPARAMBA","BHARATHANOOR","VAGAMON","KAZHUTHURUTTY","KARIMBAN","POOZHANADU","KOLLAKADAVU","KEEZHAROOR","KAINAKARY","KOODARANJI","CHENAPPADY","MULLERIA","NENMARA","PALIYODU","PARAYAKADAVU","CHELLANAM","PATHARAM","KOCHEEDA JETTY","SULLIA","PUTHentHOPE","THULAPPALLY","PALLITHURA","NANMINDA","MALAYALAPUZHA","THIRUVANIYOOR","VALAVOOR","KAKKAYANGAD","CHEPRA","EZHUMATTOOR","AYARKUNNAM","JALSOOR","MEENANKAL","VETTIKKAL","KODALY","THADIYAMPAD","PALANI","MATTANNUR","MANEED","POYYA","VYTTILA HUB","ERATTAYAR","INFOPARK","KUMBALAM","ANDHAKARANAZHY","LABBAKKADA","MALIANKARA","MAKKIYAD","MULAYARA","MEENAKSHIPURAM","ARAYANKAVU","TALIPARAMBA","KARIMUGHAL","PAYYANUR","ERUMELI","VELLIKULANGARA","CALICUT AIRPORT","ALAKKODE","KOLLENGODE","ARUVIPPURAM","KONGAD","THENNOOR","MARAYOOR","OTHERA","PAVUMBA","KOZHUVALLOOR","KAKKODI","KANICHUKULANGARA","CHITTAR","CHERPULASSERY","BADIYADKA","CHOORALMALA","PRAKKULAM","MURIKKASSERY","MANARCADU","NADUKANI","MULAGUNNATHUKAVU","ALUMKADAVU","AANAPPARA","HOSUR","CHEMPAZHANTHY","THAMBALAKKADU","GUDALLUR","VENKODE","ADIMALI","PUNALAL","SULTHAN BATHERY","PERLA","ORKKATTERI","KOTTAVASAL","PANAYAMUTTAM","SEETHATHODE","VILAKKUPARA","MUPLIYAM","CHITTARIKKAL","ERAVATHOOR","MELATTUMOOZHY","VELLARIKUND","PERIKKALLOOR","PUTTUR","POTHANICAD","PUTHUKKULAM","EDAKKUNNAM","PUNCHAVAYAL","THENGAMAM","PUTHUVELI","PANACODE","CHENNAI","VENMONY","SHORANUR","KOOMBARA","POINACHY","KOLOTH JETTY","ANGAMOOZHY","PAMBA","VETTICHIRA","CUMBUMMETTU","UDUMALPET","THACHAMPARA","SARADKA","PERUNAD","PADAPPAKKARA","KOLAHALAMEDU","THURUTHIPURAM","GUDALUR","VECHOOCHIRA","PANNIYODE","CHELAKKARA","THIRUVANVANDOOR","KAPPIL","ADIMALATHURA","KURUVILANGADU","POREDAM","THENI","ALAKODE","KOORACHUNDU","FEROKE","KOTTAVATTOM","THOPRAMKUDY","KANNAMMOOLA","KARAVUR","NEDUMPOIL","KRISHNAN KOTTA","BALAGRAM","DEVIKULAM","NEDUMBASSERY","NEDUMANKAVU","VANNAPURAM","PARAVOOR NORTH","KUNNAMKERY","POOVATTOOR","RAJAKKAD","MUTHAPPANPUZHA","VENGODE","KASARGODE","CHEMBAKAPPARA","BAVALI","KARITHOTTA","KUTTAMALA","VADUVANCHAL","KOPPAM","PAYYAVOOR","PARUTHIKUZHY","HUNSUR","VELIYANAD","PARAPPIL","MUTTAR","POOPPARA","VAZHITHALA","TVM CIVIL STATION","KODUVAYUR","SECRETARIAT","NEDUVANNOOR","MALAMPUZHA","KURUTHANCODE","KAMUKUMCHERY","VELLUMANNADI","MOONNANAKUZHY","PANAMBUKADU","MOOKKANNUR","VANDANMEDU","TECHNOPARK","KOTHAD FERRY","CHEEKKAL KADAVU","THATHAPPILLY","SENKOTTAI","GONIKOPPAL","MYLACHAL","KADAMMANITTA","KAVUMANNAM","TV PURAM","KOOTTALIDA","KADALUNDI","CHETTACHAL","KONNAKUZHY","UDUPI","THOLANUR","VELLANATHURUTHU","CHAMAMPATHAL","VENPAKAL","THADICADU","BHEEMANADY","PANTHA","PARUMALA","MANNADY","EDAVA","PUNKULAM","THYCATTUSSERY","NALANCHIRA","CHOONAD","PERUMON","THIDANAD","KODENCHERY","THERTHALLY","POOMALA","ORAVACKAL","PACHAMALA","THURAYIL KADAVU","PARANDODE","MOOTHEDATHUKAVU","PUNNAKULAM","KOOROPPADA","NALKAVALA","KOYILANDY","MADURAI","ADIVARAM","PAINAVU","PERUVANTHANAM","UNDAPPARA","VETTILAPPARA","CHULLIYODE","NARIKKUNNI","ASHTAMUDI","CVR PURAM","CHANNAPETTA","VALIAZHEEKAL","KANYAKUMARI","ATTUKAL TEMPLE","MANAVARY","MULANTHURUTHY","VENNIYODE","VALLIKUNNAM","VENMANY","504 COLONY","KODANKARA","KARIMBIL","PARIPPU","MUTHOLY","CHERAMBADI","KOKKUNNU","KAVALAM","KOLLADU BOAT JETTY","KUTTIYANI","KULATHOORMOZHY","THEKKADY","KUMMALLOOR","OOTY","VELIYATHUNADU","THAYAMKARI","ERODE","NILAKKAL","CHANGUVETTY","KARUVANCHAL","VALIYAPERUMPUZHA","PONMUDI","THANKAMANI","POOVAMPALLY","THADIYOOR","POOKKATTUPADY","ELOOR","MAYAM","AGRIFARM","KAPPUKAD","KONGORPILLY","THANDIRIKKAL","KALLARKUTTY","CHEPPILODE","VELLARIKUNDU","CHEMBIRIKA","DEVALA","ERNAKULAM SOUTH","THIRUVILWAMALA","GOVINDAPURAM","BAIRAKUPPA","SHANTINAGAR","THADICADU","KAREEPRA","THIRUNELLI TEMPLE","IDUKKI","KEERUKUZHI","ULLOOR","LAHA","RAJAKUMARI","KALADY PLANTATION","VARKALA SIVAGIRI","ADIVAD","MANJAPRA","VADAKKANCHERY","KUZHITHOLU","PANDAPILLY","GOKULAM MCH","THALOOR","SREEKANDAPURAM","PUTHANATHAANI","MANNATHOOR","PADANILAM","EDAPPALLY","MADIWALA ST JOHN","AGALY","VELIYAMCODE","THAVALAM","KAMBISSERY", "KUTHIRAVATTOM", "PANDIKKAD", "PERINTHALMANNA","CHANDAKUNNU"
];

// Ensure unique stops for suggestions
const BUS_STOPS = [...new Set(BUS_STOPS_RAW)];

// --- SEED DATA (EMPTY AS REQUESTED) ---
const SEED_BUSES = [];

// --- HELPER FUNCTIONS ---
const formatTime = (timeStr) => {
    if (!timeStr) return "";
    // If already in 12h format, return
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    
    // Convert HH:MM to 12h
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${suffix}`;
};

const getMinutesFromMidnight = (timeStr) => {
    if (!timeStr) return -1;
    // Normalize to HH:MM 24h for comparison
    let hours = 0, minutes = 0;
    
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
        // Parse 12h format
        const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (parts) {
            hours = parseInt(parts[1], 10);
            minutes = parseInt(parts[2], 10);
            if (parts[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (parts[3].toUpperCase() === "AM" && hours === 12) hours = 0;
        }
    } else {
        // Parse 24h format (HH:MM)
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10);
        }
    }
    return hours * 60 + minutes;
};

// --- FARE CALCULATION UTILITY ---
const calculateFare = (distance, type = 'Private') => {
    const km = parseFloat(distance);
    if (!km || isNaN(km) || km <= 0) return null;
    
    // Basic Rate Logic (Approximate for Kerala)
    // Min Charge: Ordinary 10, Fast 14, Superfast 20 etc.
    // Rates per KM approx: Ord 1.10, Fast 1.45
    
    let fare = 0;
    const isPremium = type === 'KSRTC' || type === 'Swift' || type === 'SuperFast';
    
    if (isPremium) {
        fare = Math.max(14, Math.ceil(km * 1.45));
    } else {
        // Ordinary / Private
        fare = Math.max(10, Math.ceil(km * 1.10));
    }
    
    // Round to nearest 1 or 5 if preferred, usually rounded to nearest integer
    return fare;
};

// Generate Schema for SEO
const generateSchema = (pageType, data = {}) => {
  if (pageType === 'home') {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "KeralaBuses.in",
      "url": "https://keralabuses.in",
      "description": "Find accurate bus timings for Kerala Private and KSRTC buses.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://keralabuses.in/#/search/{search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  } else if (pageType === 'bus' && data) {
    return {
      "@context": "https://schema.org",
      "@type": "BusTrip",
      "provider": { "@type": "Organization", "name": data.type },
      "departureTime": data.time,
      "arrivalStation": { "@type": "BusStation", "name": data.to },
      "departureStation": { "@type": "BusStation", "name": data.from },
      "name": `${data.name} - ${data.route}`
    };
  }
  return null;
};

// --- COMPONENTS ---

// 0. TOAST NOTIFICATION COMPONENT
const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(toast => (
      <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-slide-up ${toast.type === 'success' ? 'bg-teal-900 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
        {toast.type === 'success' ? <CheckCircle size={18} className="text-teal-400" /> : 
         toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} className="text-blue-500"/>}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    ))}
  </div>
);

// 0.1 IMAGE CAROUSEL
const ImageCarousel = () => {
  const images = [busImg1, busImg2, busImg3, busImg4];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-40 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-md group bg-gray-200">
       {images.map((img, index) => (
         <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
           <img src={img} alt="Kerala Bus" className="w-full h-full object-cover" />
         </div>
       ))}
       {/* Overlay Gradient */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
       <div className="absolute bottom-6 left-6 text-white max-w-lg z-10">
          <h2 className="text-2xl font-bold mb-1 drop-shadow-md">Explore Kerala by Bus</h2>
          <p className="text-sm opacity-90 drop-shadow-sm">Find timings for KSRTC & Private buses instantly.</p>
       </div>
       {/* Dots */}
       <div className="absolute bottom-4 right-6 flex justify-center gap-2 z-10">
         {images.map((_, idx) => (
           <button 
             key={idx} 
             onClick={() => setCurrentIndex(idx)}
             className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'}`} 
           />
         ))}
       </div>
    </div>
  );
};

// 0.2 FOOTER PAGES COMPONENT
const FooterPage = ({ type, onBack }) => {
    const content = {
        about: { 
            title: "About Us", 
            body: (
                <>
                    <p className="mb-4">KeralaBuses.in is a pioneering community-driven platform dedicated to digitizing the public transport network of Kerala.</p>
                    
                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">Our Mission</h4>
                    <p className="mb-4">To bridge the gap between passengers and bus schedules by providing a reliable, user-updated database of KSRTC and Private bus timings.</p>
                    
                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">Who We Are</h4>
                    <p className="mb-4">We are a team of passionate developers and transport enthusiasts who believe that information should be accessible to everyone. We are not affiliated with the government but work tirelessly to ensure the data is as accurate as possible through community verification.</p>
                    
                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">Why Use KeralaBuses.in?</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>Real-time updates from fellow passengers.</li>
                        <li>Comprehensive coverage of rural and urban routes.</li>
                        <li>Dedicated support for students and daily commuters.</li>
                        <li>AdSense-friendly, fast, and secure platform.</li>
                    </ul>
                </>
            )
        },
        contact: { 
            title: "Contact Support", 
            body: (
                <>
                    <p className="mb-6">We value your feedback and are here to assist you with any queries.</p>
                    
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-teal-700 mb-2">General Inquiries</h5>
                            <p className="text-sm">Email: <a href="mailto:support@keralabuses.in" className="text-blue-600 hover:underline">support@keralabuses.in</a></p>
                            <p className="text-sm">Phone: +91 80866 16247</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h5 className="font-bold text-green-700 mb-2">WhatsApp Support</h5>
                            <p className="text-sm">Join our community or chat with admin: <span className="font-mono font-bold">+91 80866 16247</span></p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-gray-700 mb-2">Office Address</h5>
                            <p className="text-sm text-gray-600">KeralaBuses Tech Labs,<br/>Infopark Campus,<br/>Malappuram, Kerala, 676505</p>
                        </div>
                    </div>
                </>
            )
        },
        privacy: { 
            title: "Privacy Policy", 
            body: (
                <>
                    <p className="text-xs text-gray-400 mb-6 uppercase tracking-wide font-bold">Effective Date: January 1, 2026</p>
                    
                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">1. Information We Collect</h4>
                    <p className="mb-4 text-sm">We collect minimal data to provide our services. This includes:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
                        <li>Information you voluntarily provide (e.g., bus timings, comments).</li>
                        <li>Non-personal data via cookies for analytics (Google Analytics) and ad personalization (Google AdSense).</li>
                    </ul>

                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">2. Cookies & Third-Party Advertisements</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
                        <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites.</li>
                        <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.</li>
                        <li>You may opt-out of personalized advertising by visiting Ads Settings.</li>
                    </ul>

                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">3. Data Usage</h4>
                    <p className="mb-4 text-sm">Your data is used to:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
                        <li>Improve route accuracy.</li>
                        <li>Prevent spam and abuse.</li>
                        <li>Analyze traffic trends to enhance user experience.</li>
                    </ul>

                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">4. Data Protection</h4>
                    <p className="text-sm">We implement industry-standard security measures to protect your data. We do not sell your personal information to third parties.</p>
                </>
            )
        },
        terms: { 
            title: "Terms of Service", 
            body: (
                <>
                    <h4 className="font-bold text-lg text-gray-800 mt-4 mb-2">1. Acceptance of Terms</h4>
                    <p className="mb-4 text-sm">By accessing KeralaBuses.in, you agree to be bound by these terms.</p>

                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">2. Accuracy of Information</h4>
                    <p className="mb-4 text-sm">This website is a community-driven platform. While we strive for accuracy, bus timings are subject to change by operators without notice. We are not liable for any loss, delay, or inconvenience caused by reliance on this information.</p>

                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">3. User Contributions</h4>
                    <p className="mb-4 text-sm">Users are responsible for the accuracy of the data they contribute. Malicious or false data entry will result in a ban.</p>

                    <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">4. Intellectual Property</h4>
                    <p className="mb-4 text-sm">The content, layout, and code of this website are the property of KeralaBuses.in.</p>
                </>
            )
        },
        disclaimer: { 
            title: "Disclaimer", 
            body: (
                <>
                   <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                        <h5 className="font-bold text-red-700 flex items-center gap-2 mb-2 text-sm"><AlertTriangle size={18}/> Not an Official Government Website</h5>
                        <p className="text-red-600 text-xs leading-relaxed">KeralaBuses.in is a privately maintained, community-driven informational portal. We are <strong>NOT</strong> affiliated, associated, authorized, endorsed by, or in any way officially connected with the Kerala State Road Transport Corporation (KSRTC), the Motor Vehicles Department (MVD), or any government agency.</p>
                   </div>

                   <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">Data Accuracy</h4>
                   <p className="mb-4 text-sm">All bus timings, fares, and routes are based on user contributions and public data. Schedules are subject to change due to traffic, weather, strikes, or operator decisions.</p>

                   <h4 className="font-bold text-lg text-gray-800 mt-6 mb-2">Liability</h4>
                   <p className="text-sm">We recommend verifying critical travel details with the respective bus stations or official enquiry counters. KeralaBuses.in and its maintainers shall not be held liable for any direct, indirect, or consequential damages arising from the use of this website.</p>
                </>
            )
        }
    };

    const data = content[type] || content.about;

    return (
        <div className="animate-[fadeIn_0.3s_ease-out_forwards] bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[60vh]">
            <button onClick={onBack} className="text-teal-600 font-bold text-sm flex items-center gap-1 mb-8 hover:underline">
                <ChevronRight className="rotate-180" size={18}/> Back to Home
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{data.title}</h1>
            <div className="prose prose-sm text-gray-600 leading-relaxed">
                {data.body}
            </div>
        </div>
    );
};

// 2.5 FOOTER COMPONENT
const Footer = ({ setView, onQuickSearch }) => (
    <footer className="bg-white border-t border-gray-100 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-teal-600 text-white p-1.5 rounded-lg"><Bus size={18} /></div>
                        <span className="text-lg font-bold text-gray-800">KeralaBuses.in</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        Kerala's largest community-driven public transport network. Find KSRTC and Private bus timings, stops, and routes easily.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-xs text-gray-500">
                        <li onClick={() => setView('about')} className="hover:text-teal-600 cursor-pointer">About Us</li>
                        <li onClick={() => setView('contact')} className="hover:text-teal-600 cursor-pointer">Contact Support</li>
                        <li className="hover:text-teal-600 cursor-pointer"><a href="https://chat.whatsapp.com/KhSr7LeSW503yXSGqJW8YZ" target="_blank">Join WhatsApp</a></li>
                        <li onClick={() => setView('contact')} className="hover:text-teal-600 cursor-pointer">Report Issue</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4">Legal & Policy</h4>
                    <ul className="space-y-2 text-xs text-gray-500">
                        <li onClick={() => setView('terms')} className="hover:text-teal-600 cursor-pointer flex items-center gap-1"><FileText size={12}/> Terms of Service</li>
                        <li onClick={() => setView('privacy')} className="hover:text-teal-600 cursor-pointer flex items-center gap-1"><Lock size={12}/> Privacy Policy</li>
                        <li onClick={() => setView('disclaimer')} className="hover:text-teal-600 cursor-pointer flex items-center gap-1"><AlertCircle size={12}/> Disclaimer</li>
                        <li onClick={() => setView('privacy')} className="hover:text-teal-600 cursor-pointer">Cookie Policy</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4">Popular Routes</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {['Kozhikode', 'Manjeri', 'Thrissur', 'Palakkad', 'Kannur', 'Aluva'].map(city => (
                            <span key={city} onClick={() => onQuickSearch(city)} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-100 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 cursor-pointer transition-all">
                                Bus to {city}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-gray-400">
                    © 2026 KeralaBuses.in. All rights reserved. Not affiliated with KSRTC.
                </p>
                <p className="text-[10px] text-gray-400 max-w-md text-justify md:text-right">
                    <strong>Disclaimer:</strong> Timings shown are based on user contributions and may vary. Please verify with official enquiry counters before travel. We are not responsible for missed buses or schedule changes.
                </p>
            </div>
        </div>
    </footer>
);

// 1. NAVBAR
const Navbar = ({ setView, toggleMenu }) => (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-18 items-center py-2">
                <div className="flex items-center cursor-pointer gap-2" onClick={() => {window.location.hash = ''; setView('home');}}>
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-2.5 rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform">
                        <Bus size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-extrabold text-gray-800 tracking-tight leading-none">
                            keralabuses<span className="text-teal-600">.in</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Community Bus Network</span>
                    </div>
                </div>
                
                <div className="hidden md:flex space-x-2">
                    <button onClick={() => {window.location.hash = ''; setView('home');}} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all">Home</button>
                    <button onClick={() => setView('ksrtc')} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all">KSRTC Timings</button>
                    <button onClick={() => setView('private')} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all">Private Stand</button>
                    <a href="https://blog.keralabuses.in" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all">Blog</a>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setView('add-bus')} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 hidden sm:flex">
                        <PlusSquare size={18} /> <span className="hidden sm:inline">Add Bus</span>
                    </button>
                    <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={toggleMenu}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </div>
    </nav>
);

// 1.5 MOBILE MENU
const MobileMenu = ({ isOpen, setView, closeMenu }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-fade-in">
            <div className="flex flex-col gap-4">
                <button onClick={() => { setView('home'); closeMenu(); }} className="text-left text-lg font-bold text-gray-800 py-3 border-b border-gray-100">Home</button>
                <button onClick={() => { setView('ksrtc'); closeMenu(); }} className="text-left text-lg font-bold text-gray-800 py-3 border-b border-gray-100">KSRTC Timings</button>
                <button onClick={() => { setView('private'); closeMenu(); }} className="text-left text-lg font-bold text-gray-800 py-3 border-b border-gray-100">Private Stand</button>
                <a href="https://blog.keralabuses.in" className="text-left text-lg font-bold text-gray-800 py-3 border-b border-gray-100">Blog</a>
                <button onClick={() => { setView('add-bus'); closeMenu(); }} className="bg-teal-600 text-white py-3 rounded-xl font-bold mt-4 flex justify-center items-center gap-2">
                    <PlusSquare size={18} /> Add Bus
                </button>
            </div>
        </div>
    );
};

// 2. SIDEBAR
const Sidebar = ({ setView, onSeed, favorites, onSelectFavorite, points }) => {
    // Level Calculation
    let level = "Newbie";
    if (points >= 100) level = "Explorer";
    if (points >= 500) level = "Guide";
    if (points >= 1000) level = "Expert";
    if (points >= 5000) level = "Legend";

    const nextLevel = 
        level === "Newbie" ? 100 : 
        level === "Explorer" ? 500 : 
        level === "Guide" ? 1000 : 
        level === "Expert" ? 5000 : 10000;
        
    const progress = Math.min((points / nextLevel) * 100, 100);

    return (
        <div className="space-y-6">
            {/* User Stats / Gamification */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                         <Trophy size={20} />
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-800 text-sm">Your Contribution</h4>
                         <p className="text-xs text-gray-500 font-bold text-teal-600">Level: {level}</p>
                     </div>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 mb-1">
                     <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-[10px] text-gray-400 text-right">{points} / {nextLevel} Points</p>
            </div>

            {/* WhatsApp Widget */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageCircle size={80} className="text-green-600"/>
                </div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="bg-green-500 text-white p-2.5 rounded-full shadow-md">
                        <MessageCircle size={22} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">Join Community</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed relative z-10">
                    Get live bus updates, strike alerts, and timing changes directly on WhatsApp.
                </p>
                <a href="https://chat.whatsapp.com/KhSr7LeSW503yXSGqJW8YZ" target="_blank" className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-green-700 transition-all hover:-translate-y-1 text-sm relative z-10">
                    <span>Join Group</span>
                </a>
            </div>

            {/* Saved/Favorite Buses */}
            {favorites && favorites.length > 0 && (
                 <div className="bg-white border border-yellow-200 bg-yellow-50/50 rounded-2xl p-5 shadow-sm">
                    <h4 className="font-bold text-yellow-800 text-sm mb-4 flex items-center gap-2">
                        <Star size={18} className="fill-yellow-500 text-yellow-500"/> Saved Buses
                    </h4>
                    <div className="space-y-3">
                        {favorites.map(bus => (
                            <div key={bus.id} onClick={() => onSelectFavorite(bus)} className="bg-white p-3 rounded-xl border border-yellow-100 cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all text-sm group">
                                <div className="font-bold text-gray-800 group-hover:text-yellow-700 transition-colors">{bus.route}</div>
                                <div className="text-gray-500 text-xs mt-1 flex justify-between">
                                    <span>{bus.time}</span>
                                    <span className="text-yellow-600 font-medium">{bus.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-gray-800 text-sm mb-5 pb-3 border-b border-gray-50 flex items-center gap-2">
                    <Phone size={18} className="text-teal-600"/> Emergency & Help
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Women", icon: Heart, color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-100", num: "1091" },
                        { label: "Police", icon: Shield, color: "text-blue-700", bg: "bg-blue-50 hover:bg-blue-100 border-blue-100", num: "100" },
                        { label: "Ambulance", icon: PlusCircle, color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-100", num: "108" },
                        { label: "Support", icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-100", num: "+918086616247" },
                    ].map((item, i) => (
                        <a key={i} href={item.num.includes('+') ? `tel:${item.num}` : `tel:${item.num}`} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 ${item.bg} no-underline group hover:shadow-sm`}>
                            <item.icon size={24} className={`${item.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-xs font-bold text-gray-700">{item.label}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* ADMIN TOOLS (Commented out as requested) */}
            {/* <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                <h4 className="font-bold text-gray-800 text-sm mb-4 pb-2 border-b border-gray-50 flex items-center gap-2">
                    <Database size={16} className="text-teal-600"/> Admin Tools
                </h4>
                <button 
                    onClick={onSeed} 
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition text-xs border border-slate-200"
                >
                    <PlusCircle size={14} /> + Load Sample Data
                </button>
            </div> 
            */}
        </div>
    );
};

// 3. NEWS TICKER
const NewsTicker = () => (
  <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-3 flex items-center text-sm gap-4 rounded-xl mb-8 shadow-md mx-4 lg:mx-0 overflow-hidden border border-teal-700/50">
    <span className="bg-amber-400 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
      LIVE UPDATES
    </span>
    <div className="flex-1 overflow-hidden relative h-5">
      <div className="absolute whitespace-nowrap animate-marquee font-medium text-xs md:text-sm tracking-wide top-0.5">
        New KSRTC Swift AC Services to Bangalore & Mysore • Private Bus Strike in Kozhikode withdrawn • Check updated monsoon timings for Idukki routes.
      </div>
    </div>
  </div>
);

// 4. FARE CALCULATOR
const FareCalculator = () => {
    const [km, setKm] = useState("");
    const [result, setResult] = useState(null);

    const calculate = () => {
        const val = parseFloat(km);
        if(val > 0) {
            setResult({
                ord: calculateFare(val, 'Private'),
                fast: calculateFare(val, 'KSRTC')
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h4 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <Ticket size={18} className="text-teal-600"/> Fare Calculator (Approx)
            </h4>
            <div className="flex gap-2 mb-4">
                <input 
                    type="number" 
                    placeholder="Enter KM" 
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500 bg-gray-50 focus:bg-white transition-all"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                />
                <button onClick={calculate} className="bg-teal-700 text-white px-5 rounded-xl text-sm font-bold hover:bg-teal-800 shadow-md">Check</button>
            </div>
            {result ? (
                <div className="bg-teal-50 p-4 rounded-xl text-sm space-y-2 text-teal-900 border border-teal-100">
                    <div className="flex justify-between border-b border-teal-100 pb-1"><span>Ordinary:</span> <span className="font-bold">₹{result.ord}</span></div>
                    <div className="flex justify-between pt-1"><span>Fast / Swift:</span> <span className="font-bold">₹{result.fast}</span></div>
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">Enter distance to see prices.</p>
            )}
        </div>
    );
};

// 5. SEO CONTENT
const SeoContent = ({ onQuickSearch }) => (
    <div className="pb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Kerala Bus Timings & Route Planner - KSRTC & Private</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                    Find the most accurate and up-to-date <strong>Kerala Bus Timings</strong>. Whether you are looking for <strong>KSRTC Super Fast</strong>, <strong>Low Floor AC</strong>, <strong>Swift Deluxe</strong>, or <strong>Private Bus</strong> schedules, KeralaBuses.in is your ultimate travel companion. We cover all major districts including Malappuram, Kozhikode, Wayanad, Palakkad, Thrissur, Ernakulam, and Thiruvananthapuram.
                </p>
                <p>
                    Plan your journey from <strong>Pandikkad to Perinthalmanna</strong>, <strong>Manjeri to Kozhikode</strong>, or any other route with our easy-to-use search engine. Get live updates, report delays, and contribute to the community.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                    {['KSRTC Timing', 'Private Bus Stand', 'Kerala Bus Route', 'Malappuram Bus', 'Kozhikode Bus', 'Swift Bus Time', 'Limited Stop', 'Ordinary Bus'].map(tag => (
                        <span key={tag} onClick={() => onQuickSearch(tag)} className="bg-gray-50 text-gray-600 text-[11px] px-3 py-1.5 rounded-full border border-gray-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 cursor-pointer transition-colors font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// 6. ADD BUS FORM (New)
const AddBusForm = ({ onCancel, onAdd, showToast }) => {
    const [formData, setFormData] = useState({
        name: '', type: 'Private', from: '', to: '', time: '', stops: '', description: '', endTime: '', distance: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!formData.from || !formData.to || !formData.time) {
            showToast("Please fill all required fields", "info");
            return;
        }
        const route = `${formData.from} - ${formData.to}`;
        // Create initial detailedStops from the basic info
        const displayTime = formatTime(formData.time);
        
        // Handle optional end time
        const destTime = formData.endTime ? formatTime(formData.endTime) : 'TBD';
        
        // Parse stops string into array
        const stopNames = formData.stops.split(',').map(s => s.trim()).filter(s => s);
        
        // Build the stop sequence: Origin -> Intermediate -> Dest
        const intermediateStops = stopNames.map(name => ({ name, time: 'TBD' }));
        const initialStops = [
            { name: formData.from, time: displayTime },
            ...intermediateStops,
            { name: formData.to, time: destTime }
        ];

        onAdd({ ...formData, time: displayTime, route, votes: 0, comments: [], detailedStops: initialStops, status: 'On Time', crowd: 'Low' });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-[fadeIn_0.3s_ease-out_forwards]">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-700"><PlusCircle size={24} /></div>
                Add New Bus
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">From *</label>
                        <input className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="Origin" onChange={e => setFormData({...formData, from: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">To *</label>
                        <input className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="Destination" onChange={e => setFormData({...formData, to: e.target.value})} required />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Start Time *</label>
                        <input type="time" className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 outline-none" onChange={e => setFormData({...formData, time: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">End Time (Opt)</label>
                        <input type="time" className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 outline-none" onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Bus Type</label>
                        <select className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 outline-none bg-white" onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="Private">Private Bus</option>
                            <option value="KSRTC">KSRTC</option>
                            <option value="Swift">KSRTC Swift</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Approx. Distance (KM) <span className="text-gray-300 font-normal normal-case">(For Fare Calculation)</span></label>
                     <input type="number" className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 outline-none" placeholder="e.g. 45" onChange={e => setFormData({...formData, distance: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Bus Name (Optional)</label>
                    <input className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 outline-none" placeholder="e.g. Sreehari Motors" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Intermediate Stops (Comma Separated)</label>
                    <textarea className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:border-teal-500 outline-none h-24 resize-none" placeholder="e.g. Stop A, Stop B, Stop C" onChange={e => setFormData({...formData, stops: e.target.value})}></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onCancel} className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-6 py-3.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Submit Bus</button>
                </div>
            </form>
        </div>
    );
};

// 7. BUS POST COMPONENT (Detail View + Editing + Stop Management + Fullscreen Map)
const BusPost = ({ bus, onBack, addComment, updateBusDetails, onVote, reportLate, updateCrowd, toggleFavorite, isFavorite, showToast }) => {
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  
  // Edit States
  const [editName, setEditName] = useState(bus.name);
  const [editRoute, setEditRoute] = useState(bus.route);
  const [editTime, setEditTime] = useState(bus.time); // stored as string
  const [editType, setEditType] = useState(bus.type);
  const [editDesc, setEditDesc] = useState(bus.description);
  
  // Manage Stops
  const [newStopName, setNewStopName] = useState("");
  const [newStopTime, setNewStopTime] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if(!newComment.trim() || !userName.trim()) return;
    addComment(bus.id, { 
      user: userName, 
      text: newComment, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toDateString() // Add date for filtering
    });
    setNewComment("");
  };

  const handleSaveDetails = () => {
      // If user changed time via clock, format it back to AM/PM for display logic
      const displayTime = editTime.includes(":") && !editTime.includes("M") ? formatTime(editTime) : editTime;
      
      updateBusDetails(bus.id, {
          name: editName,
          route: editRoute,
          time: displayTime,
          type: editType,
          description: editDesc,
      });
      setIsEditing(false);
  };

  const handleAddStop = () => {
      if(!newStopName) return;
      // If user selected time, format it, otherwise keep it blank/TBD if they prefer
      const displayTime = newStopTime ? formatTime(newStopTime) : "TBD";
      const updatedStops = bus.detailedStops ? [...bus.detailedStops, {name: newStopName, time: displayTime}] : [{name: newStopName, time: displayTime}];
      const stopsString = updatedStops.map(s => s.name).join(', ');
      
      updateBusDetails(bus.id, {
          detailedStops: updatedStops,
          stops: stopsString
      });
      setNewStopName("");
      setNewStopTime("");
  };

  const handleEditStop = (index, field, value) => {
      const updatedStops = [...(bus.detailedStops || [])];
      // Format time if time field is being edited
      // Note: if user types manually allowing TBD or 12h format
      let finalValue = value;
      if (field === 'time' && value.includes(':') && !value.includes('M') && !value.includes('T')) {
           finalValue = formatTime(value);
      }
      updatedStops[index] = { ...updatedStops[index], [field]: finalValue };
      
      const stopsString = updatedStops.map(s => s.name).join(', ');
      updateBusDetails(bus.id, {
          detailedStops: updatedStops,
          stops: stopsString
      });
  };

  const handleDeleteStop = (index) => {
      const updatedStops = [...(bus.detailedStops || [])];
      updatedStops.splice(index, 1);
      const stopsString = updatedStops.map(s => s.name).join(', ');
      updateBusDetails(bus.id, {
          detailedStops: updatedStops,
          stops: stopsString
      });
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out_forwards] pb-10">
      
      {/* FULLSCREEN MAP OVERLAY */}
      {showFullMap && (
        <div className="fixed inset-0 z-[100] bg-white animate-fade-in flex flex-col">
            <div className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <div>
                    <h2 className="text-xl font-bold">Route Map: {bus.route}</h2>
                    <p className="text-sm opacity-80">{bus.name} | {bus.time}</p>
                </div>
                <button onClick={() => setShowFullMap(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-2 bg-gray-100 p-4 border-b border-gray-200">
                        <span className="font-bold text-gray-600 uppercase text-sm tracking-wider">Bus Stop</span>
                        <span className="font-bold text-gray-600 uppercase text-sm tracking-wider text-right">Time</span>
                    </div>
                    {bus.detailedStops && bus.detailedStops.map((stop, i) => (
                        <div key={i} className="grid grid-cols-2 p-5 border-b border-gray-50 last:border-0 hover:bg-teal-50/50 transition-colors items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    {i + 1}
                                </div>
                                <span className="text-lg font-bold text-gray-800">{stop.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-mono font-bold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-lg border border-teal-100">{stop.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button onClick={() => setShowFullMap(false)} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors">Close View</button>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center text-teal-700 font-bold text-sm cursor-pointer sticky top-0 z-20 shadow-sm rounded-t-xl hover:bg-gray-50 transition-colors" onClick={onBack}>
        <ChevronRight className="rotate-180 mr-2" size={20} /> Back to Results
      </div>
      
      <div className="p-0 md:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 mt-6 md:mt-0 relative">
            
            {/* Edit & Favorite Buttons */}
            <div className="flex justify-end gap-3 mb-6">
                <button onClick={() => toggleFavorite(bus)} className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center gap-2 ${isFavorite ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-200 text-gray-500 hover:text-yellow-500 hover:border-yellow-200'}`}>
                    <Star size={18} className={isFavorite ? "fill-yellow-500" : ""} />
                    <span className="text-xs font-bold">{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-teal-700 flex items-center gap-2 text-xs bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 transition-all font-bold">
                        <Edit3 size={16} /> Edit Details
                    </button>
                )}
            </div>

            {isEditing ? (
                /* EDIT FORM */
                <div className="space-y-6">
                    <h3 className="font-bold text-xl text-gray-800 border-b pb-4">Edit Bus Details</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Route (From - To)</label>
                            <input className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none" value={editRoute} onChange={e => setEditRoute(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Start Time</label>
                            {/* We use type=time here. Note: value needs to be HH:MM for input type=time to show correctly */}
                            <input type="time" className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none" onChange={e => setEditTime(e.target.value)} />
                            <p className="text-[10px] text-gray-400 mt-1">Current: {bus.time}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Bus Name</label>
                            <input className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Type</label>
                            <select className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none bg-white" value={editType} onChange={e => setEditType(e.target.value)}>
                                <option value="KSRTC">KSRTC</option>
                                <option value="Private">Private</option>
                                <option value="Swift">Swift</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Description</label>
                        <textarea className="w-full p-3 border border-gray-200 rounded-lg text-sm h-24 focus:border-teal-500 outline-none resize-none" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                    </div>
                    
                    {/* ADD/DELETE STOP IN EDIT MODE */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Manage Stops</label>
                        
                        {/* List Existing (With Edit Capability) */}
                        <div className="mb-4 space-y-2">
                            {bus.detailedStops && bus.detailedStops.map((stop, i) => (
                                <div key={i} className="flex gap-3 items-center bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                    <input 
                                        className="flex-1 p-1 border-b border-transparent focus:border-teal-500 focus:outline-none text-sm font-medium text-gray-700" 
                                        value={stop.name} 
                                        onChange={(e) => handleEditStop(i, 'name', e.target.value)}
                                    />
                                    <div className="flex items-center gap-1 border-l pl-3">
                                        <Clock size={12} className="text-gray-400"/>
                                        <input 
                                            type="text"
                                            className="w-20 p-1 border-b border-transparent focus:border-teal-500 focus:outline-none text-right text-xs text-gray-500" 
                                            value={stop.time} 
                                            placeholder="TBD"
                                            onChange={(e) => handleEditStop(i, 'time', e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => handleDeleteStop(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>

                        {/* Add New */}
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                            <input className="flex-1 p-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none" placeholder="New Stop Name" value={newStopName} onChange={e => setNewStopName(e.target.value)} />
                            <input type="time" className="w-32 p-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 outline-none" value={newStopTime} onChange={e => setNewStopTime(e.target.value)} />
                            <button onClick={handleAddStop} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 shadow-md">+</button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button onClick={handleSaveDetails} className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"><Save size={18}/> Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="bg-white text-gray-600 px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                </div>
            ) : (
                /* VIEW MODE */
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{bus.name || "Bus Service"}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-lg text-gray-600 font-medium">{bus.route}</span>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${bus.type === 'KSRTC' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {bus.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100 flex flex-col md:flex-row gap-6 mb-8 shadow-sm">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={28} className="text-teal-600" />
                                <div>
                                    <span className="text-3xl font-black tracking-tight text-gray-800">{bus.time}</span>
                                    <p className="text-xs text-teal-700 font-medium">Scheduled Departure</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => onVote(bus.id)} className="flex-1 md:flex-none flex flex-col items-center justify-center gap-1 bg-white px-5 py-3 rounded-xl border border-teal-100 text-teal-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm group">
                                <ThumbsUp size={20} className={`mb-1 transition-transform group-hover:scale-110 ${bus.votes > 0 ? "fill-teal-100 group-hover:fill-white/20" : ""}`} />
                                <span className="text-xs font-bold">{bus.votes || 0} Reliable</span>
                            </button>
                            
                             {/* Crowd Reporting */}
                             <div className="flex-1 md:flex-none bg-white p-3 rounded-xl border border-teal-100 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><BarChart3 size={12}/> Live Crowd</div>
                                <div className="flex gap-1">
                                    <button onClick={() => updateCrowd(bus.id, "Low")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${bus.crowdLevel === 'Low' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>Low</button>
                                    <button onClick={() => updateCrowd(bus.id, "Medium")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${bus.crowdLevel === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>Med</button>
                                    <button onClick={() => updateCrowd(bus.id, "High")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${bus.crowdLevel === 'High' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>High</button>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* STATUS ALERT (Filtered by Day) */}
                    {bus.status === 'Late' && bus.statusDate === new Date().toDateString() && (
                        <div className="mb-8 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex items-start gap-3 shadow-sm animate-pulse">
                            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Reported Late Today</h4>
                                <p className="text-xs opacity-80 mt-1">Multiple users have reported delays for this service today.</p>
                            </div>
                        </div>
                    )}

                    {/* Real-time Tracking Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl mb-6 shadow-md flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-lg flex items-center gap-2"><Map size={20}/> Real-Time Bus Display</h4>
                            <p className="text-xs opacity-90">Track your bus live at major stations and never miss a ride again.</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                            <Monitor size={24} />
                        </div>
                    </div>

                    {/* DYNAMIC SEO CONTENT */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 text-sm text-gray-600 leading-relaxed shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Info size={18} className="text-blue-500"/> Service Overview</h4>
                        <p>
                            This <strong>{bus.type}</strong> bus service, known as <em>{bus.name}</em>, departs at <strong>{bus.time}</strong>. 
                            It operates on the <strong>{bus.route}</strong> route. 
                            {bus.stops ? `Major stops include ${bus.stops}. ` : ''} 
                            Passengers looking for reliable travel between these destinations can choose this service for a comfortable journey.
                        </p>
                        {bus.description && <p className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">Operator Note: {bus.description}</p>}
                    </div>

                    {/* DETAILED SCHEDULE TIMELINE */}
                    {bus.detailedStops && bus.detailedStops.length > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2"><Map size={16} className="text-gray-400"/> Route Schedule</h4>
                                <button onClick={() => setShowFullMap(true)} className="text-teal-600 font-bold text-xs flex items-center gap-1 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                                    <Maximize2 size={14}/> View Full Route Map
                                </button>
                            </div>
                            <div className="relative border-l-2 border-teal-100 ml-4 space-y-8 pb-2">
                                {bus.detailedStops.map((stop, i) => (
                                    <div key={i} className="ml-8 relative group">
                                        <span className="absolute -left-[39px] top-1 w-4 h-4 bg-white rounded-full border-4 border-teal-500 shadow-sm group-hover:scale-110 transition-transform"></span>
                                        <div className="flex justify-between items-start p-3 -mt-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <span className="text-base font-bold text-gray-800">{stop.name}</span>
                                            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">{stop.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <button className="bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg hover:shadow-green-200/50 hover:-translate-y-0.5 text-sm">
                            <MessageCircle size={20} /> Share via WhatsApp
                        </button>
                        <button onClick={() => reportLate(bus.id)} className="bg-amber-50 text-amber-700 border border-amber-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors text-sm">
                            <AlertTriangle size={20} /> Report Late
                        </button>
                    </div>
                </>
            )}
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-3">
            <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><MessageSquare size={20} /></div>
            Live Updates
          </h3>

          <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Post an Update</h4>
            <form onSubmit={handleCommentSubmit}>
              <input 
                type="text" 
                placeholder="Your Name (Optional)"
                className="w-full mb-3 p-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500 bg-white"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <textarea 
                placeholder="Bus was late? Changed route? Share info with the community..."
                className="w-full mb-4 p-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-500 h-24 resize-none bg-white"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button type="submit" className="w-full bg-teal-700 text-white font-bold py-3.5 rounded-xl hover:bg-teal-800 transition text-sm shadow-md">
                Post Update
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {bus.comments && bus.comments.filter(c => c.date === new Date().toDateString()).length > 0 ? (
              bus.comments
                  .filter(c => c.date === new Date().toDateString())
                  .slice().reverse().map((comment, index) => (
                <div key={index} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0 animate-[fadeIn_0.3s_ease-out_forwards]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                    {comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-gray-900 text-sm">{comment.user || "Anonymous User"}</h5>
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{comment.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm mb-1">No updates for today yet.</p>
                  <p className="text-xs text-gray-300">Be the first to help others!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. MAIN APP (Must be last to use sub-components)
export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedBus, setSelectedBus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [resultFilter, setResultFilter] = useState('all'); // 'all' or 'upcoming'

  const showToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  
  // Search State
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  
  // Autocomplete State
  const [suggestionsFrom, setSuggestionsFrom] = useState([]);
  const [suggestionsTo, setSuggestionsTo] = useState([]);

  // Load Favorites & Points
  useEffect(() => {
      const savedFavs = localStorage.getItem('keralaBusesFavs');
      if(savedFavs) setFavorites(JSON.parse(savedFavs));
      
      const savedPoints = localStorage.getItem('keralaBusesPoints');
      if(savedPoints) setUserPoints(parseInt(savedPoints));
  }, []);
  
  // SEO Injection
  useEffect(() => {
      document.title = view === 'detail' && selectedBus 
          ? `${selectedBus.route} Bus Timing - KeralaBuses.in`
          : "KeralaBuses.in - Find Private & KSRTC Bus Timings";

      // Inject JSON-LD Schema
      const scriptId = "json-ld-schema";
      let script = document.getElementById(scriptId);
      if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.type = "application/ld+json";
          document.head.appendChild(script);
      }
      
      const schemaData = generateSchema(view, selectedBus);
      if (schemaData) script.text = JSON.stringify(schemaData);

  }, [view, selectedBus]);

  const toggleFavorite = (bus) => {
      let newFavs;
      if (favorites.some(f => f.id === bus.id)) {
          newFavs = favorites.filter(f => f.id !== bus.id);
          showToast("Removed from favorites", "info");
      } else {
          newFavs = [...favorites, { id: bus.id, route: bus.route, time: bus.time, name: bus.name }];
          showToast("Added to favorites", "success");
      }
      setFavorites(newFavs);
      localStorage.setItem('keralaBusesFavs', JSON.stringify(newFavs));
  };
  
  const addPoints = (amount) => {
      const newPoints = userPoints + amount;
      setUserPoints(newPoints);
      localStorage.setItem('keralaBusesPoints', newPoints.toString());
      if (amount > 5) showToast(`+${amount} Contribution Points!`, "success"); // Only notify for big points
  };

  // URL SYNC LOGIC (HASH ROUTER)
  useEffect(() => {
      const handleHashChange = () => {
          const hash = window.location.hash;
          if (hash.startsWith('#/bus/')) {
              const busId = hash.replace('#/bus/', '');
              if (buses.length > 0) {
                  const bus = buses.find(b => b.id === busId);
                  if (bus) {
                      setSelectedBus(bus);
                      setView('detail');
                  }
              }
          } else if (hash.startsWith('#/search/')) {
              const parts = hash.split('/');
              if (parts[2]) setSearchFrom(decodeURIComponent(parts[2]));
              if (parts[3]) setSearchTo(decodeURIComponent(parts[3]));
              if (parts[4]) setFilterType(parts[4]);
              setView('results');
          } else {
              // Handle category views or footer pages if not a direct link
              if (!['ksrtc', 'private', 'add-bus', 'about', 'contact', 'privacy', 'terms', 'disclaimer'].includes(view)) {
                 if (view !== 'detail' && view !== 'results') setView('home');
              }
          }
      };

      window.addEventListener('hashchange', handleHashChange);
      
      if(!loading && buses.length > 0) {
          handleHashChange();
      }

      return () => window.removeEventListener('hashchange', handleHashChange);
  }, [buses, loading]);

  // --- FIREBASE LOGIC ---
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "buses"), orderBy("time"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const busData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBuses(busData);
      setLoading(false);
      // Sync selected bus if active (refresh details)
      if(selectedBus) {
        const updatedSelected = busData.find(b => b.id === selectedBus.id);
        if(updatedSelected) setSelectedBus(updatedSelected);
      }
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [selectedBus]);

  const addComment = async (busId, comment) => {
    if (!db) return showToast("Firebase not connected!", "error");
    await updateDoc(doc(db, "buses", busId), { comments: arrayUnion(comment) });
    showToast("Update posted!", "success");
    addPoints(2);
  };

  const updateBusDetails = async (busId, details) => {
      if (!db) return showToast("Firebase not connected!", "error");
      await updateDoc(doc(db, "buses", busId), details);
      showToast("Bus details updated!", "success");
      addPoints(10);
  };

  const updateCrowd = async (busId, level) => {
      if (!db) return showToast("Firebase not connected!", "error");
      await updateDoc(doc(db, "buses", busId), { crowdLevel: level });
      // No toast for minor action
      addPoints(1);
  };

  const reportLate = async (busId) => {
      if (!db) return showToast("Firebase not connected!", "error");
      const today = new Date().toDateString();
      const storageKey = `reported_${busId}_${today}`;
      if(localStorage.getItem(storageKey)) {
          showToast("Already reported today", "info");
          return;
      }
      
      await updateDoc(doc(db, "buses", busId), { 
          status: 'Late',
          statusDate: today,
          comments: arrayUnion({
              user: "Community Alert",
              text: "⚠️ This bus was reported late by a user.",
              time: "Just now",
              date: today
          }) 
      });
      localStorage.setItem(storageKey, "true");
      showToast("Report submitted. Thanks!", "success");
      addPoints(5);
  };

  const addNewBus = async (newBusData) => {
      if (!db) return showToast("Firebase not connected!", "error");
      try {
          await addDoc(collection(db, "buses"), newBusData);
          showToast("Bus added successfully! +20 Points", "success");
          addPoints(20);
          setView('home');
          window.location.hash = '';
      } catch(e) {
          console.error(e);
          showToast("Error adding bus", "error");
      }
  };

  const handleVote = async (busId) => {
      if (!db) return showToast("Firebase not connected!", "error");
      const today = new Date().toDateString();
      const storageKey = `voted_${busId}_${today}`;
      
      if(localStorage.getItem(storageKey)) {
          // No toast for redundant vote
          return;
      }

      await updateDoc(doc(db, "buses", busId), { votes: increment(1) });
      localStorage.setItem(storageKey, "true");
      // No toast for minor action
      addPoints(1);
  };

  const seedDatabase = async () => {
    if (!db) return showToast("Firebase not connected!", "error");
    for (const bus of SEED_BUSES) await addDoc(collection(db, "buses"), bus);
    showToast("Sample buses added!", "success");
  };

  // --- SEARCH UI LOGIC ---
  const handleSwap = () => {
    const temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  };

  const updateSuggestions = (val, type) => {
      if(!val) {
          type === 'from' ? setSuggestionsFrom([]) : setSuggestionsTo([]);
          return;
      }
      const filtered = BUS_STOPS.filter(stop => stop.toLowerCase().startsWith(val.toLowerCase())).slice(0, 8);
      type === 'from' ? setSuggestionsFrom(filtered) : setSuggestionsTo(filtered);
  };

  const handleInputChange = (e, type) => {
      const val = e.target.value;
      type === 'from' ? setSearchFrom(val) : setSearchTo(val);
      updateSuggestions(val, type);
  };

  const selectSuggestion = (val, type) => {
      type === 'from' ? setSearchFrom(val) : setSearchTo(val);
      type === 'from' ? setSuggestionsFrom([]) : setSuggestionsTo([]);
  };

  const handleFindBus = () => {
      window.location.hash = `#/search/${encodeURIComponent(searchFrom)}/${encodeURIComponent(searchTo)}/${filterType}`;
  };

  // Helper for quick search from tags
  const handleQuickSearch = (term) => {
      // Determine if term is a place or type (simple heuristic)
      if (term.includes('KSRTC') || term.includes('Private')) {
         // It's likely a type or generic term, just set text but don't force route logic yet
         // Actually better to just set destination if it looks like a place
      } 
      // Assume destination for simplicity for now
      setSearchTo(term);
      setSearchFrom(''); // clear origin to show all buses to that place
      setFilterType('all');
      setView('results');
  };

  const handleBusClick = (bus) => {
      window.location.hash = `#/bus/${bus.id}`;
  };

  const handleSelectFavorite = (favBus) => {
      const liveBus = buses.find(b => b.id === favBus.id);
      if(liveBus) {
          handleBusClick(liveBus);
      } else {
          showToast("Bus not found in live list", "error");
      }
  };

  const filteredBuses = buses.filter(bus => {
    // DIRECTIONAL SEARCH:
    // If user searches "A" -> "B", we verify that A comes BEFORE B in the route.
    const sFrom = searchFrom.toLowerCase().trim();
    const sTo = searchTo.toLowerCase().trim();
    
    const stopsStr = (bus.stops || bus.route || "").toLowerCase();
    // Also include origin/dest in search string to ensure start/end are found
    // IMPORTANT: normalize spaces
    const fullPath = `${(bus.from || "").toLowerCase()} ${stopsStr} ${(bus.to || "").toLowerCase()}`;

    // 1. Check if both keywords exist
    const hasFrom = !sFrom || fullPath.includes(sFrom);
    const hasTo = !sTo || fullPath.includes(sTo);

    // 2. Check Direction (From index < To index)
    // Only check direction if both fields are filled
    let isDirectionCorrect = true;
    if (sFrom && sTo && hasFrom && hasTo) {
        const idxFrom = fullPath.indexOf(sFrom);
        const idxTo = fullPath.indexOf(sTo); 
        if (idxFrom >= idxTo) {
            isDirectionCorrect = false; 
        }
    }

    // Filter based on view (ksrtc/private pages)
    if (view === 'ksrtc' && bus.type !== 'KSRTC') return false; 
    if (view === 'private' && bus.type !== 'Private') return false;

    // Filter based on Time (Live/Upcoming)
    if (resultFilter === 'upcoming') {
        const currentTime = new Date();
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        // Find correct time for this bus based on the searched origin
        // If searched "Manjeri", find time at Manjeri stop
        let checkTime = bus.time;
        if (searchFrom && bus.detailedStops) {
            const stop = bus.detailedStops.find(s => s.name.toLowerCase() === searchFrom.toLowerCase());
            if (stop && stop.time !== 'TBD') checkTime = stop.time;
        }

        const busMinutes = getMinutesFromMidnight(checkTime);
        if (busMinutes !== -1 && busMinutes < currentMinutes) {
            return false; // Skip past buses
        }
    }

    const matchesType = filterType === 'all' || (bus.type && bus.type.toLowerCase() === filterType.toLowerCase());

    return hasFrom && hasTo && isDirectionCorrect && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-700 pb-20">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Poppins', sans-serif; }
          .animate-marquee { animation: marquee 15s linear infinite; }
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
          .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #00695c; }
        `}</style>

        <ToastContainer toasts={toasts} />
        
        <Navbar setView={setView} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        <MobileMenu isOpen={isMenuOpen} setView={setView} closeMenu={() => setIsMenuOpen(false)} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT COLUMN (MAIN CONTENT) --- */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* HOME VIEW: SEARCH + TOOLS */}
                    {(view === 'home' || view === 'ksrtc' || view === 'private') && (
                        <>
                            <ImageCarousel />
                            <NewsTicker />
                            {/* HERO SEARCH */}
                            <div className="bg-white p-6 rounded-xl shadow-[0_5px_25px_rgba(0,0,0,0.06)] border border-gray-100 relative z-10">
                                <div className="flex items-center gap-2 mb-5 text-gray-800 font-extrabold text-lg">
                                    <Search className="text-teal-700" size={24} />
                                    {view === 'ksrtc' ? 'Search KSRTC Buses' : view === 'private' ? 'Search Private Buses' : 'Search Bus Routes'}
                                </div>

                                <div className="flex bg-gray-100 p-1 rounded-lg mb-5">
                                    {['all', 'ksrtc', 'private'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all uppercase ${filterType === type ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {type === 'all' ? 'All Buses' : type === 'ksrtc' ? 'KSRTC / Swift' : 'Private Bus'}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 items-center relative">
                                    <div className="w-full relative">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">Departure From</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                value={searchFrom}
                                                onChange={(e) => handleInputChange(e, 'from')}
                                                placeholder="Origin (e.g. Pandikkad)"
                                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 transition-all"
                                            />
                                            {suggestionsFrom.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                                    {suggestionsFrom.map((s, i) => (
                                                        <div key={i} onClick={() => selectSuggestion(s, 'from')} className="px-4 py-3 hover:bg-teal-50 hover:text-teal-800 cursor-pointer text-sm border-b border-gray-50 last:border-0">{s}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative z-10 md:mt-6">
                                        <button onClick={handleSwap} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-teal-700 shadow-sm hover:bg-teal-50 hover:rotate-180 hover:border-teal-600 transition-all duration-300">
                                            <ArrowRightLeft size={18} />
                                        </button>
                                    </div>

                                    <div className="w-full relative">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">Going To</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                value={searchTo}
                                                onChange={(e) => handleInputChange(e, 'to')}
                                                placeholder="Destination"
                                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 transition-all"
                                            />
                                            {suggestionsTo.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                                    {suggestionsTo.map((s, i) => (
                                                        <div key={i} onClick={() => selectSuggestion(s, 'to')} className="px-4 py-3 hover:bg-teal-50 hover:text-teal-800 cursor-pointer text-sm border-b border-gray-50 last:border-0">{s}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-5">
                                    <button onClick={() => {setSearchFrom(''); setSearchTo('');}} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Clear</button>
                                    <button onClick={handleFindBus} className="flex-1 py-3 bg-gradient-to-br from-teal-700 to-teal-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider">
                                        Find My Bus
                                    </button>
                                </div>
                            </div>
                            
                            {/* RESULTS LIST IN HOME VIEW TOO */}
                            {(view === 'ksrtc' || view === 'private') && (
                                <div className="animate-[fadeIn_0.3s_ease-out_forwards]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <Bus size={20} className="text-teal-600"/> 
                                            {view === 'ksrtc' ? 'KSRTC Fleet' : 'Private Buses'}
                                        </h3>
                                        
                                        {/* Result Filter */}
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button onClick={() => setResultFilter('all')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${resultFilter === 'all' ? 'bg-white shadow text-teal-800' : 'text-gray-500'}`}>All</button>
                                            <button onClick={() => setResultFilter('upcoming')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${resultFilter === 'upcoming' ? 'bg-white shadow text-teal-800' : 'text-gray-500'}`}>Upcoming</button>
                                        </div>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="py-10 text-center text-gray-400 text-sm">Loading live data...</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredBuses.length > 0 ? filteredBuses.map(bus => {
                                                // Dynamic Time Calculation for result card
                                                let displayTime = bus.time;
                                                let isIntermediate = false;
                                                
                                                if (searchFrom && bus.detailedStops) {
                                                    const stop = bus.detailedStops.find(s => s.name.toLowerCase() === searchFrom.toLowerCase());
                                                    if (stop && stop.time !== 'TBD') {
                                                        displayTime = stop.time;
                                                        isIntermediate = true;
                                                    }
                                                }

                                                // DYNAMIC FARE
                                                const estimatedFare = calculateFare(bus.distance, bus.type);

                                                return (
                                                <div key={bus.id} onClick={() => handleBusClick(bus)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center group transition-all relative">
                                                    <div className="flex gap-5 w-full">
                                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${bus.type === 'KSRTC' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                            <Bus size={24} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-xl text-teal-900 leading-tight group-hover:text-teal-700 transition-colors">{bus.name}</h4>
                                                                    <p className="text-base text-gray-600 font-medium mt-1">{bus.route}</p>
                                                                </div>
                                                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100 font-bold whitespace-nowrap">
                                                                    Verified {bus.votes > 0 && `(${bus.votes})`}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-1">
                                                                    <Clock size={14}/> {displayTime}
                                                                </span>
                                                                {isIntermediate && (
                                                                     <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-100">
                                                                        From {searchFrom}
                                                                     </span>
                                                                )}
                                                                <span className="text-xs text-gray-500">• {bus.type}</span>
                                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                                    Crowd: {bus.crowdLevel || "Low"}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                                    Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                                </span>
                                                            </div>
                                                            {/* Show intermediate stops hint if searching via stops */}
                                                            {!isIntermediate && searchFrom && bus.stops && bus.stops.toLowerCase().includes(searchFrom.toLowerCase()) && (
                                                                <div className="mt-2 text-[11px] text-teal-600 italic">
                                                                    Via: ...{searchFrom}...
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col justify-center items-end gap-2">
                                                            <ChevronRight size={24} className="text-gray-300 group-hover:text-teal-600" />
                                                            <button className="text-[10px] bg-teal-600 text-white px-3 py-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );}) : (
                                                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                                    No buses found matching your search.
                                                    {buses.length === 0 && (
                                                        <div className="mt-4">
                                                            <p className="text-xs text-gray-400 mb-3">Database is empty. Add sample data to test.</p>
                                                            <button onClick={seedDatabase} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 border border-blue-100">
                                                                + Load Sample Data
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TOOLKIT & FARE GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Traveler's Toolkit</h4>
                                    <div className="space-y-0">
                                        {[
                                            { t: "Official KSRTC Booking", l: "https://online.keralartc.com" },
                                            { t: "Check Fare Rates (MVD)", l: "https://mvd.kerala.gov.in" },
                                            { t: "Live Traffic Status", l: "https://google.com/maps" }
                                        ].map((item, i) => (
                                            <a key={i} href={item.l} target="_blank" className="flex items-center gap-3 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-700 hover:pl-2 rounded-lg transition-all border-b border-gray-50 last:border-0">
                                                <ChevronRight size={14} className="text-gray-300" /> {item.t}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <FareCalculator />
                            </div>
                            <SeoContent onQuickSearch={handleQuickSearch} />
                        </>
                    )}

                    {/* ADD BUS VIEW */}
                    {view === 'add-bus' && (
                        <AddBusForm onCancel={() => setView('home')} onAdd={addNewBus} showToast={showToast} />
                    )}

                    {/* FOOTER PAGES */}
                    {['about', 'contact', 'privacy', 'terms', 'disclaimer'].includes(view) && (
                        <FooterPage type={view} onBack={() => setView('home')} />
                    )}

                    {/* RESULTS VIEW */}
                    {view === 'results' && (
                        <div className="animate-[fadeIn_0.3s_ease-out_forwards]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Search size={20} className="text-teal-600"/> 
                                    Results for {searchFrom ? searchFrom : "All"} {searchTo && `to ${searchTo}`}
                                </h3>
                                
                                {/* Result Filter */}
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button onClick={() => setResultFilter('all')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${resultFilter === 'all' ? 'bg-white shadow text-teal-800' : 'text-gray-500'}`}>All</button>
                                    <button onClick={() => setResultFilter('upcoming')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${resultFilter === 'upcoming' ? 'bg-white shadow text-teal-800' : 'text-gray-500'}`}>Upcoming</button>
                                </div>
                            </div>

                            <button onClick={() => {window.location.hash = ''; setView('home');}} className="text-sm text-gray-500 hover:text-teal-600 underline mb-4 block">Back to Search</button>

                            {loading ? (
                                <div className="py-10 text-center text-gray-400 text-sm">Loading live data...</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredBuses.length > 0 ? filteredBuses.map(bus => {
                                        // Dynamic Time Calculation for result card
                                        let displayTime = bus.time;
                                        let isIntermediate = false;
                                        
                                        if (searchFrom && bus.detailedStops) {
                                            const stop = bus.detailedStops.find(s => s.name.toLowerCase() === searchFrom.toLowerCase());
                                            if (stop && stop.time !== 'TBD') {
                                                displayTime = stop.time;
                                                isIntermediate = true;
                                            }
                                        }

                                        // DYNAMIC FARE
                                        const estimatedFare = calculateFare(bus.distance, bus.type);

                                        return (
                                        <div key={bus.id} onClick={() => handleBusClick(bus)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center group transition-all relative">
                                            <div className="flex gap-5 w-full">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${bus.type === 'KSRTC' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                    <Bus size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-xl text-teal-900 leading-tight group-hover:text-teal-700 transition-colors">{bus.name}</h4>
                                                            <p className="text-base text-gray-600 font-medium mt-1">{bus.route}</p>
                                                        </div>
                                                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100 font-bold whitespace-nowrap">
                                                            Verified {bus.votes > 0 && `(${bus.votes})`}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-1">
                                                            <Clock size={14}/> {displayTime}
                                                        </span>
                                                        {isIntermediate && (
                                                             <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-100">
                                                                From {searchFrom}
                                                             </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">• {bus.type}</span>
                                                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                            Crowd: {bus.crowdLevel || "Low"}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                            Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                        </span>
                                                    </div>
                                                    {/* Show intermediate stops hint if searching via stops */}
                                                    {!isIntermediate && searchFrom && bus.stops && bus.stops.toLowerCase().includes(searchFrom.toLowerCase()) && (
                                                        <div className="mt-2 text-[11px] text-teal-600 italic">
                                                            Via: ...{searchFrom}...
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-center items-end gap-2">
                                                    <ChevronRight size={24} className="text-gray-300 group-hover:text-teal-600" />
                                                    <button className="text-[10px] bg-teal-600 text-white px-3 py-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );}) : (
                                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                            No buses found matching your search.
                                            {buses.length === 0 && (
                                                <div className="mt-4">
                                                    <p className="text-xs text-gray-400 mb-3">Database is empty. Add sample data to test.</p>
                                                    <button onClick={seedDatabase} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 border border-blue-100">
                                                        + Load Sample Data
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DETAIL VIEW */}
                    {view === 'detail' && selectedBus && (
                        <BusPost 
                            bus={selectedBus} 
                            onBack={() => {window.location.hash = ''; setView('results');}} 
                            addComment={addComment} 
                            updateBusDetails={updateBusDetails} 
                            onVote={handleVote}
                            reportLate={reportLate}
                            updateCrowd={updateCrowd}
                            toggleFavorite={toggleFavorite}
                            isFavorite={favorites.some(f => f.id === selectedBus.id)}
                            showToast={showToast}
                        />
                    )}
                </div>

                {/* --- RIGHT COLUMN (SIDEBAR) --- */}
                <div className="lg:col-span-4">
                    <Sidebar setView={setView} onSeed={seedDatabase} favorites={favorites} onSelectFavorite={handleSelectFavorite} points={userPoints} />
                </div>
            </div>
            
            <Footer setView={setView} onQuickSearch={handleQuickSearch} />
        </div>
    </div>
  );
}