import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRightLeft, ChevronRight, Clock, Bus, Trophy, Star, Monitor, X, Maximize2, Sun, Moon, PlusCircle, Phone, ChevronLeft, Globe, Download } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, arrayUnion, query, orderBy, increment, getDocs } from "firebase/firestore";

// --- IMPORTS ---
import { BUS_STOPS, getMinutesFromMidnight, calculateFare, generateSchema, SEED_BUSES, DEPOT_DATA } from './utils';
import { ToastContainer, Navbar, MobileMenu, Footer, FooterPage, SkeletonCard, BusStandList } from './components/Layout';
import { ImageCarousel, NewsTicker, FareCalculator, Sidebar, SeoContent } from './components/Widgets';
import { AddBusForm, BusPost } from './components/BusFeatures';

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

let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firebase not connected. Please update firebaseConfig.");
}

// ==========================================
// SMART SEARCH ALGORITHM UTILITIES
// ==========================================

const LOCATION_ALIASES = {
    "trivandrum": "thiruvananthapuram", "tvm": "thiruvananthapuram",
    "calicut": "kozhikode", "kozhikkode": "kozhikode", "clt": "kozhikode",
    "cannore": "kannur", "cannanore": "kannur", "can": "kannur",
    "cochin": "ernakulam", "kochi": "ernakulam", "ekm": "ernakulam",
    "alleppey": "alappuzha", "allapuzha": "alappuzha",
    "trichur": "thrissur", "tcr": "thrissur",
    "palghat": "palakkad", "pkd": "palakkad",
    "quilon": "kollam",
    "bathery": "sulthan bathery", "sultan bathery": "sulthan bathery",
    "pmna": "perinthalmanna", "perintalmanna": "perinthalmanna"
};

const getSearchKeywords = (input) => {
    if (!input) return [];
    const cleanInput = input.toLowerCase().trim();
    const keywords = [cleanInput];
    if (LOCATION_ALIASES[cleanInput]) keywords.push(LOCATION_ALIASES[cleanInput]);
    Object.keys(LOCATION_ALIASES).forEach(alias => {
        if (LOCATION_ALIASES[alias] === cleanInput) keywords.push(alias);
    });
    return keywords;
};

// --- HELPER: DYNAMIC SEO TAGS ---
const updateMetaTag = (name, content) => {
    if (!content) return;
    let element = document.querySelector(`meta[name="${name}"]`) ||
        document.querySelector(`meta[property="${name}"]`);

    if (!element) {
        element = document.createElement('meta');
        if (name.includes('og:') || name.includes('twitter:')) {
            element.setAttribute('property', name);
        } else {
            element.setAttribute('name', name);
        }
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const generateBusSlug = (bus) => {
    const clean = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '-') : '';
    const timeClean = bus.time ? bus.time.toLowerCase().replace(' ', '-').replace(':', '') : '0000';
    return `${clean(bus.from)}-to-${clean(bus.to)}-${timeClean}-${clean(bus.type)}`;
};

const LiveClock = React.memo(({ darkMode }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="text-right">
            <div className={`text-3xl md:text-4xl font-mono font-bold tracking-widest ${darkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                {time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={`text-xs md:text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {time.toDateString()}
            </div>
        </div>
    );
});

// --- ADMIN TOOL: DOWNLOAD DB DUMP (Use this to create buses.json) ---
const AdminDownloadButton = ({ db }) => {
    const handleDownload = async () => {
        if (!db) return alert("Firebase not connected");
        if (!confirm("This will read ALL documents and use quota. Only do this once per update. Continue?")) return;
        
        try {
            const snapshot = await getDocs(collection(db, "buses"));
            const allBuses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const jsonString = JSON.stringify(allBuses, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "buses.json";
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            alert("Error downloading: " + e.message);
        }
    };

    return (
        <div className="fixed bottom-20 left-4 z-50">
            <button onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg border-2 border-white flex items-center gap-2 font-bold text-xs">
                <Download size={16} /> ADMIN DUMP
            </button>
        </div>
    );
};

// --- DEPOT ENQUIRY COMPONENT ---
const DepotEnquiry = () => {
    const [activeAccordion, setActiveAccordion] = useState(null);
    const toggleAccordion = (index) => setActiveAccordion(activeAccordion === index ? null : index);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="text-teal-600" size={24} /> Kerala RTC General Enquiry
                </h2>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <div>
                        <h6 className="font-bold text-sm text-gray-700">Reservation & Route Enquiry</h6>
                        <div className="flex gap-3 mt-1 text-sm">
                            <a href="tel:04712463799" className="text-teal-700 font-medium hover:underline">0471-2463799</a>,
                            <a href="tel:9447071021" className="text-teal-700 font-medium hover:underline">9447071021</a>
                        </div>
                    </div>
                    <div>
                        <h6 className="font-bold text-sm text-gray-700">Toll Free</h6>
                        <a href="tel:18005994011" className="text-teal-700 font-medium text-sm hover:underline">1800-599-4011</a>
                    </div>
                    <div>
                        <h6 className="font-bold text-sm text-gray-700">WhatsApp (We Social)</h6>
                        <a href="https://wa.me/919497722205" target="_blank" className="text-green-600 font-medium text-sm hover:underline">9497722205</a>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Depot Contact Numbers</h3>
                <div className="space-y-2">
                    {DEPOT_DATA.map((data, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <span className="font-bold text-sm text-gray-800">{data.district}</span>
                                <ChevronRight size={16} className={`text-gray-500 transition-transform ${activeAccordion === index ? 'rotate-90' : ''}`} />
                            </button>
                            {activeAccordion === index && (
                                <div className="bg-white p-2">
                                    {data.depots.map((depot, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-teal-50/30 rounded-lg">
                                            <span className="text-xs font-medium text-gray-700">{depot.name}</span>
                                            <a href={`tel:${depot.phone}`} className="text-[10px] bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100 font-bold hover:bg-green-100 flex items-center gap-1">
                                                <Phone size={10} /> Call
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [view, setView] = useState('home');
    const [selectedBus, setSelectedBus] = useState(null);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [resultFilter, setResultFilter] = useState('all');

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Board State
    const [boardStop, setBoardStop] = useState('');
    const [showBoardInput, setShowBoardInput] = useState(false);
    const [boardDarkMode, setBoardDarkMode] = useState(false);

    // Routing Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const resultsRef = useRef(null);
    const quickLinksRef = useRef(null);

    // Search State
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [suggestionsFrom, setSuggestionsFrom] = useState([]);
    const [suggestionsTo, setSuggestionsTo] = useState([]);
    const [suggestionsBoard, setSuggestionsBoard] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    // GOOGLE TRANSLATE INJECTION
    useEffect(() => {
        if (document.getElementById('google-translate-script')) return;
        const addScript = document.createElement('script');
        addScript.id = 'google-translate-script';
        addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                    includedLanguages: 'en,ml,hi,ta,kn' 
                }, 'google_translate_element');
            }
        };
    }, []);

    // Load Persistence
    useEffect(() => {
        const savedFavs = localStorage.getItem('evidebusFavs');
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        const savedPoints = localStorage.getItem('evidebusPoints');
        if (savedPoints) setUserPoints(parseInt(savedPoints));
    }, []);

    // SEO Injection & Router Logic
    useEffect(() => {
        const path = location.pathname;
        const params = path.split('/');

        if (path.startsWith('/bus/')) {
            const busSlug = params[2];
            if (buses.length > 0) {
                const bus = buses.find(b => generateBusSlug(b) === busSlug);
                if (bus) {
                    setSelectedBus(bus);
                    setView('detail');
                } else {
                    const busById = buses.find(b => b.id === busSlug);
                    if (busById) {
                        setSelectedBus(busById);
                        setView('detail');
                    }
                }
            }
        } else if (path.startsWith('/search/')) {
            if (params[2]) setSearchFrom(decodeURIComponent(params[2]));
            const toVal = decodeURIComponent(params[3] || '');
            setSearchTo(toVal === '-' ? '' : toVal);
            if (params[4]) setFilterType(params[4]);
            setView('results');
        } else if (path.startsWith('/board/')) {
            const station = decodeURIComponent(params[2] || '');
            if (station) {
                setBoardStop(station);
                setView('board');
                setShowBoardInput(false);
            }
        } else if (path === '/depot') {
            setView('depot');
        } else if (path === '/stands') {
            setView('bus-stands');
        } else if (path === '/add-bus') {
            setView('add-bus');
        } else if (path === '/ksrtc') {
            setView('ksrtc');
        } else if (path === '/private') {
            setView('private');
        } else if (['/about', '/contact', '/privacy', '/terms', '/disclaimer', '/cookies'].includes(path)) {
            setView(path.substring(1));
        } else {
            setView('home');
        }

        // DYNAMIC SEO TAGS
        let title = "evidebus.com - Find Private & KSRTC Bus Timings";
        let description = "Find real-time Kerala bus timings for KSRTC and Private buses. Check routes, fares, and live station boards.";
        let image = `${window.location.origin}/favicon/evidebus-hero.png`;

        if (view === 'detail' && selectedBus) {
            title = `${selectedBus.route} ${selectedBus.time} Bus Timing - evidebus.com`;
            description = `Check detailed timing, stops, and fare for ${selectedBus.name} (${selectedBus.type}) on the ${selectedBus.route} route.`;
        } else if (view === 'depot') {
            title = "Kerala KSRTC Depot Contact Numbers - evidebus.com";
            description = "Official contact numbers and enquiry details for all KSRTC depots across Kerala.";
        } else if (view === 'bus-stands') {
            title = "Kerala Bus Stand List - evidebus.com";
            description = "Find locations and details of major bus stands across Kerala.";
        } else if (view === 'board') {
            title = `${boardStop} Live Bus Stand Status - evidebus.com`;
            description = `Live departure board for ${boardStop} bus stand. See upcoming KSRTC and Private buses in real-time.`;
        } else if (view === 'results' && searchFrom) {
            title = `Bus from ${searchFrom} to ${searchTo || 'Anywhere'} - evidebus.com`;
            description = `Find bus timings from ${searchFrom} to ${searchTo}. Compare KSRTC and Private bus schedules and fares.`;
        }

        document.title = title;
        updateMetaTag('description', description);
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:url', window.location.href);
        updateMetaTag('og:type', 'website');
        updateMetaTag('og:image', image);
        updateMetaTag('twitter:image', image);

        const scriptId = "json-ld-schema";
        let script = document.getElementById(scriptId);
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = "application/ld+json";
            document.head.appendChild(script);
        }
        const schemaData = generateSchema(view === 'home' ? 'home' : 'bus', selectedBus);
        if (schemaData) script.text = JSON.stringify(schemaData);

    }, [location, buses, loading, view, selectedBus, boardStop, searchFrom, searchTo]);

    // ---------------------------------------------------------
    //  ⚡️ HYBRID DATA LOADING (FIXED FOR QUOTA) ⚡️
    // ---------------------------------------------------------
    useEffect(() => {
        async function loadBuses() {
            setLoading(true);
            try {
                // 1. Try to fetch static JSON first (Free, Unlimited Reads)
                // Ensure you have placed 'buses.json' in your public/ folder!
                const response = await fetch('/buses.json');
                
                if (response.ok) {
                    const data = await response.json();
                     // console.log("Loaded buses from Static JSON (Quota Safe)");
                    setBuses(data);
                } else {
                    throw new Error("JSON not found");
                }
            } catch (error) {
                console.warn("Static data failed, falling back to Firestore (Quota Risk!). Ensure buses.json is in public folder.");
                
                // 2. Fallback to Firestore (Only reads ONCE per page load, not real-time)
                if (db) {
                    try {
                        const q = query(collection(db, "buses"), orderBy("time"));
                        const snapshot = await getDocs(q); // Use getDocs instead of onSnapshot
                        const busData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setBuses(busData);
                    } catch (fsError) {
                        console.error("Firestore load failed:", fsError);
                        // Optional: Load seed data if everything fails
                        // setBuses(SEED_BUSES);
                    }
                }
            }
            setLoading(false);
        }

        loadBuses();
        // Removed real-time listener to save costs. 
        // New buses will appear only after you regenerate buses.json
    }, []);

    // Scroll to results
    useEffect(() => {
        if (view === 'results' && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [view]);

    // Logic Functions
    const addPoints = (amount) => {
        const newPoints = userPoints + amount;
        setUserPoints(newPoints);
        localStorage.setItem('evidebusPoints', newPoints.toString());
        if (amount > 5) showToast(`+${amount} Contribution Points!`, "success");
    };

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
        localStorage.setItem('evidebusFavs', JSON.stringify(newFavs));
    };

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
        addPoints(1);
    };

    const reportLate = async (busId) => {
        if (!db) return showToast("Firebase not connected!", "error");
        const today = new Date().toDateString();
        const storageKey = `reported_${busId}_${today}`;
        if (localStorage.getItem(storageKey)) {
            showToast("Already reported today", "info");
            return;
        }
        await updateDoc(doc(db, "buses", busId), {
            status: 'Late', statusDate: today,
            comments: arrayUnion({ user: "Community Alert", text: "⚠️ This bus was reported late by a user.", time: "Just now", date: today })
        });
        localStorage.setItem(storageKey, "true");
        showToast("Report submitted. Thanks!", "success");
        addPoints(5);
    };

    const addNewBus = async (newBusData) => {
        if (!db) return showToast("Firebase not connected!", "error");
        try {
            // Write to Firestore (Cheap)
            const docRef = await addDoc(collection(db, "buses"), newBusData);
            const newBusWithId = { id: docRef.id, ...newBusData };
            
            // Optimistically update UI so user sees their bus immediately
            setBuses(prev => [...prev, newBusWithId]);
            
            showToast("Bus added successfully! +20 Points", "success");
            addPoints(20);
            navigate('/');
        } catch (e) {
            console.error(e);
            showToast("Error adding bus", "error");
        }
    };

    const handleVote = async (busId) => {
        if (!db) return showToast("Firebase not connected!", "error");
        const today = new Date().toDateString();
        const storageKey = `voted_${busId}_${today}`;
        if (localStorage.getItem(storageKey)) return;
        await updateDoc(doc(db, "buses", busId), { votes: increment(1) });
        localStorage.setItem(storageKey, "true");
        addPoints(1);
    };

    const seedDatabase = async () => {
        if (!db) return showToast("Firebase not connected!", "error");
        for (const bus of SEED_BUSES) await addDoc(collection(db, "buses"), bus);
        showToast("Sample buses added!", "success");
    };

    // Search Logic
    const handleSwap = () => {
        const temp = searchFrom;
        setSearchFrom(searchTo);
        setSearchTo(temp);
    };

    const updateSuggestions = (val, type) => {
        if (!val) {
            if (type === 'from') setSuggestionsFrom([]);
            else if (type === 'to') setSuggestionsTo([]);
            else if (type === 'board') setSuggestionsBoard([]);
            return;
        }

        const cleanVal = val.toLowerCase().trim();
        const keywords = getSearchKeywords(cleanVal);

        const filtered = BUS_STOPS.filter(stop => {
            const stopLower = stop.toLowerCase();
            return keywords.some(k => stopLower.includes(k));
        }).slice(0, 8);

        if (type === 'from') setSuggestionsFrom(filtered);
        else if (type === 'to') setSuggestionsTo(filtered);
        else if (type === 'board') setSuggestionsBoard(filtered);
    };

    const handleInputChange = (e, type) => {
        const val = e.target.value;
        if (type === 'from') setSearchFrom(val);
        else if (type === 'to') setSearchTo(val);
        updateSuggestions(val, type);
    };

    const selectSuggestion = (val, type) => {
        if (type === 'from') { setSearchFrom(val); setSuggestionsFrom([]); }
        else if (type === 'to') { setSearchTo(val); setSuggestionsTo([]); }
    };

    const handleFindBus = () => {
        const toParam = searchTo.trim() || '-';
        navigate(`/search/${encodeURIComponent(searchFrom)}/${encodeURIComponent(toParam)}/${filterType}`);
    };

    const handleQuickSearch = (term) => {
        const toParam = term.trim() || '-';
        navigate(`/search/-/${encodeURIComponent(toParam)}/all`);
    };

    const handleBusClick = (bus) => {
        const slug = generateBusSlug(bus);
        navigate(`/bus/${slug}`);
    };

    const handleSelectFavorite = (favBus) => {
        const liveBus = buses.find(b => b.id === favBus.id);
        if (liveBus) {
            handleBusClick(liveBus);
        } else {
            showToast("Bus not found in live list", "error");
        }
    };

    // --- SMART SEARCH FILTER ALGORITHM ---
    const filteredBuses = useMemo(() => {
        return buses.filter(bus => {
            const fromKeywords = getSearchKeywords(searchFrom);
            const toKeywords = getSearchKeywords(searchTo);

            const stopsStr = (bus.stops || bus.route || "").toLowerCase();
            const fullPath = `${(bus.from || "").toLowerCase()} ${stopsStr} ${(bus.to || "").toLowerCase()}`;

            const hasFrom = !searchFrom || fromKeywords.some(keyword => fullPath.includes(keyword));
            const hasTo = !searchTo || toKeywords.some(keyword => fullPath.includes(keyword));

            let isDirectionCorrect = true;
            if (searchFrom && searchTo && hasFrom && hasTo) {
                let fromIndex = -1;
                for (let k of fromKeywords) {
                     const idx = fullPath.indexOf(k);
                     if (idx !== -1) { fromIndex = idx; break; }
                }

                let toIndex = -1;
                for (let k of toKeywords) {
                     const idx = fullPath.indexOf(k);
                     if (idx !== -1) { toIndex = idx; break; }
                }

                if (fromIndex >= 0 && toIndex >= 0 && fromIndex >= toIndex) {
                    isDirectionCorrect = false;
                }
            }

            if (view === 'ksrtc' && bus.type !== 'KSRTC') return false;
            if (view === 'private' && bus.type !== 'Private') return false;

            if (resultFilter === 'upcoming') {
                const currentTime = new Date();
                const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                let checkTime = bus.time;
                if (searchFrom && bus.detailedStops) {
                    const stop = bus.detailedStops.find(s => 
                        fromKeywords.some(k => s.name.toLowerCase().includes(k))
                    );
                    if (stop && stop.time !== 'TBD') checkTime = stop.time;
                }
                if (getMinutesFromMidnight(checkTime) !== -1 && getMinutesFromMidnight(checkTime) < currentMinutes) return false;
            }

            const matchesType = filterType === 'all' || (bus.type && bus.type.toLowerCase() === filterType.toLowerCase());
            return hasFrom && hasTo && isDirectionCorrect && matchesType;
        });
    }, [buses, searchFrom, searchTo, view, resultFilter, filterType]);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchFrom, searchTo, filterType, resultFilter, view]); 

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const paginatedBuses = useMemo(() => {
        const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
        const startIndex = (safePage - 1) * itemsPerPage;
        return filteredBuses.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBuses, currentPage, totalPages]);

    const handlePageChange = (direction) => {
        let newPage = currentPage;
        
        if (direction === 'next' && currentPage < totalPages) {
            newPage = currentPage + 1;
        } else if (direction === 'prev' && currentPage > 1) {
            newPage = currentPage - 1;
        } else if (typeof direction === 'number') {
            newPage = direction;
        }

        if (newPage !== currentPage) {
            setCurrentPage(newPage);
            setTimeout(() => {
                if (resultsRef.current) {
                    const yOffset = -100; 
                    const element = resultsRef.current;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 50);
        }
    };

    // --- DIGITAL BOARD LOGIC ---
    const getBoardBuses = useMemo(() => {
        if (!boardStop) return [];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const boardKeywords = getSearchKeywords(boardStop);

        const upcomingRaw = buses
            .filter(bus => {
                if (!bus.detailedStops) return false;
                const stop = bus.detailedStops.find(s => 
                    boardKeywords.some(k => s.name.toLowerCase().includes(k))
                );
                if (!stop || stop.time === 'TBD') return false;
                const busMins = getMinutesFromMidnight(stop.time);
                return busMins !== -1 && busMins >= currentMinutes;
            })
            .map(bus => {
                const stop = bus.detailedStops.find(s => 
                     boardKeywords.some(k => s.name.toLowerCase().includes(k))
                );
                return { ...bus, boardTime: stop.time, boardMins: getMinutesFromMidnight(stop.time) };
            });

        const seen = new Set();
        const uniqueBuses = [];
        for (const bus of upcomingRaw) {
            const uniqueKey = `${bus.name}-${bus.route}-${bus.boardTime}`;
            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                uniqueBuses.push(bus);
            }
        }

        return uniqueBuses.sort((a, b) => a.boardMins - b.boardMins).slice(0, 10);
    }, [buses, boardStop]);

    const openBoard = () => {
        if (boardStop) {
            navigate(`/board/${encodeURIComponent(boardStop)}`);
        } else {
            showToast("Please select a stop first", "error");
        }
    };

    let userLevel = "Newbie";
    if (userPoints >= 100) userLevel = "Explorer";
    if (userPoints >= 500) userLevel = "Guide";
    if (userPoints >= 1000) userLevel = "Expert";

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-gray-700 pb-20 relative">
            {/* --- ADMIN DOWNLOAD BUTTON (Use this once quota resets to get buses.json) --- */}
            {/* UNCOMMENT THE LINE BELOW TOMORROW TO DOWNLOAD YOUR DATA */}
            {/* <AdminDownloadButton db={db} /> */}

            {/* --- BOARD VIEW --- */}
            {view === 'board' && (
                <div className={`fixed inset-0 z-50 p-6 md:p-10 flex flex-col font-mono overflow-hidden transition-colors duration-500 ${boardDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
                    <div className={`flex justify-between items-start border-b-4 pb-6 mb-6 ${boardDarkMode ? 'border-teal-900' : 'border-teal-600'}`}>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-teal-600 text-white font-black px-4 py-1 rounded text-sm uppercase shadow-sm">Live Station Board</div>
                                <div className="flex items-center gap-2 text-teal-500 text-xs animate-pulse font-bold">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> LIVE
                                </div>
                            </div>
                            <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter truncate max-w-2xl ${boardDarkMode ? 'text-white' : 'text-gray-900'}`}>{boardStop}</h1>
                            <p className={`text-lg uppercase tracking-widest mt-1 ${boardDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Upcoming Departures</p>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="flex gap-2">
                                <button onClick={() => setBoardDarkMode(!boardDarkMode)} className={`p-2 rounded-lg transition-colors ${boardDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                                    {boardDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                                </button>
                                <button onClick={() => navigate('/')} className={`p-2 rounded-lg transition-colors ${boardDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}>
                                    <X size={24} />
                                </button>
                            </div>
                            <LiveClock darkMode={boardDarkMode} />
                        </div>
                    </div>

                    <div className={`grid grid-cols-12 gap-4 uppercase text-sm font-bold tracking-widest px-4 mb-4 ${boardDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <div className="col-span-2">Time</div>
                        <div className="col-span-4">Service / Bus Name</div>
                        <div className="col-span-4">Route / Destination</div>
                        <div className="col-span-2 text-right">Type</div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {getBoardBuses.length > 0 ? getBoardBuses.map((bus, i) => (
                            <div key={bus.id} className={`grid grid-cols-12 gap-4 border-l-4 p-4 items-center rounded-r-lg transition-all group ${boardDarkMode
                                    ? 'bg-gray-900 border-teal-500 hover:bg-gray-800'
                                    : 'bg-white border-teal-600 shadow-sm hover:bg-teal-50/30'
                                }`}>
                                <div className={`col-span-2 text-2xl md:text-3xl font-bold ${boardDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>{bus.boardTime}</div>
                                <div className="col-span-4">
                                    <div className={`font-bold text-xl truncate ${boardDarkMode ? 'text-white group-hover:text-teal-200' : 'text-gray-900 group-hover:text-teal-800'}`}>{bus.name}</div>
                                </div>
                                <div className={`col-span-4 font-medium truncate text-lg ${boardDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{bus.route}</div>
                                <div className="col-span-2 text-right">
                                    <span className={`px-3 py-1 rounded font-bold text-xs uppercase ${bus.type === 'KSRTC' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {bus.type}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className={`h-full flex flex-col items-center justify-center ${boardDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                                <Bus size={64} className="mb-4 opacity-20" />
                                <p className="text-xl font-bold">No upcoming buses scheduled soon.</p>
                                <p className="text-sm">Check back later or verify stop name.</p>
                            </div>
                        )}
                    </div>

                    <div className={`mt-6 pt-4 border-t flex justify-between items-center text-xs uppercase tracking-wider ${boardDarkMode ? 'border-gray-900 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                        <div>Powered by evidebus.com</div>
                        <div>Data relies on community contribution. Verify locally.</div>
                    </div>
                </div>
            )}

            <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Poppins', sans-serif; }
          .animate-marquee { animation: marquee 15s linear infinite; }
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
          .goog-te-gadget-simple {
              background-color: transparent !important;
              border: none !important;
              padding: 0 !important;
              font-size: 12px !important;
              display: flex !important;
              align-items: center !important;
              cursor: pointer !important;
          }
          .goog-te-gadget-simple img { display: none !important; }
          .goog-te-menu-value { color: #555 !important; }
          .goog-te-banner-frame { display: none !important; }
          body { top: 0px !important; }
        `}</style>

            <ToastContainer toasts={toasts} />
            {view !== 'board' && <Navbar toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />}
            <MobileMenu isOpen={isMenuOpen} closeMenu={() => setIsMenuOpen(false)} />

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${view === 'board' ? 'hidden' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-8 space-y-5">
                        <div className="lg:hidden bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600">
                                    <Trophy size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">My Contribution</span>
                                    <span className="text-[10px] text-gray-500 font-medium">{userPoints} pts • {userLevel}</span>
                                </div>
                            </div>
                            <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400" style={{ width: `${Math.min(userPoints % 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {(view === 'home' || view === 'ksrtc' || view === 'private') && (
                            <>
                                <ImageCarousel />
                                <NewsTicker />
                                <div className="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 relative z-10">
                                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-base">
                                        <Search className="text-teal-700" size={20} />
                                        {view === 'ksrtc' ? 'Search KSRTC Buses' : view === 'private' ? 'Search Private Buses' : 'Search Bus Routes'}
                                    </div>

                                    <div className="flex bg-gray-50 p-1 rounded-lg mb-4 border border-gray-100">
                                        {['all', 'ksrtc', 'private'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase tracking-wide ${filterType === type ? 'bg-white text-teal-800 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {type === 'all' ? 'All Buses' : type === 'ksrtc' ? 'KSRTC / Swift' : 'Private Bus'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 relative">
                                        <div className="w-full relative group">
                                            <MapPin className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={16} />
                                            <input
                                                type="text"
                                                value={searchFrom}
                                                onChange={(e) => handleInputChange(e, 'from')}
                                                placeholder="Departing From..."
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10 transition-all"
                                            />
                                            {suggestionsFrom.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                                                    {suggestionsFrom.map((s, i) => (
                                                        <div key={i} onClick={() => selectSuggestion(s, 'from')} className="px-4 py-2.5 hover:bg-teal-50 hover:text-teal-800 cursor-pointer text-xs font-medium border-b border-gray-50 last:border-0">{s}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-center -my-2 relative z-10">
                                            <button onClick={handleSwap} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-teal-700 shadow-sm hover:bg-teal-50 hover:rotate-180 transition-all duration-300">
                                                <ArrowRightLeft size={14} />
                                            </button>
                                        </div>

                                        <div className="w-full relative group">
                                            <MapPin className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={16} />
                                            <input
                                                type="text"
                                                value={searchTo}
                                                onChange={(e) => handleInputChange(e, 'to')}
                                                placeholder="Going To..."
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10 transition-all"
                                            />
                                            {suggestionsTo.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                                                    {suggestionsTo.map((s, i) => (
                                                        <div key={i} onClick={() => selectSuggestion(s, 'to')} className="px-4 py-2.5 hover:bg-teal-50 hover:text-teal-800 cursor-pointer text-xs font-medium border-b border-gray-50 last:border-0">{s}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button onClick={() => { setSearchFrom(''); setSearchTo(''); }} className="px-5 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg text-xs hover:bg-gray-200 transition-colors">Clear</button>
                                        <button onClick={handleFindBus} className="flex-1 py-3 bg-teal-700 text-white font-bold rounded-lg shadow-md hover:bg-teal-800 hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wider">
                                            Find My Bus
                                        </button>
                                    </div>
                                </div>

                                {(view === 'ksrtc' || view === 'private') && (
                                    <div className="animate-fade-in" ref={resultsRef}>
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                                <Bus size={18} className="text-teal-600" />
                                                {view === 'ksrtc' ? 'KSRTC Fleet' : 'Private Buses'}
                                            </h3>
                                            <div className="flex bg-gray-100 p-1 rounded-md">
                                                <button onClick={() => setResultFilter('all')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'all' ? 'bg-white shadow text-teal-800' : 'text-gray-400'}`}>All</button>
                                                <button onClick={() => setResultFilter('upcoming')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'upcoming' ? 'bg-white shadow text-teal-800' : 'text-gray-400'}`}>Upcoming</button>
                                            </div>
                                        </div>

                                        {loading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-3">
                                                    {paginatedBuses.length > 0 ? paginatedBuses.map((bus, idx) => {
                                                        let displayTime = bus.time;
                                                        let isIntermediate = false;
                                                        if (searchFrom && bus.detailedStops) {
                                                            const fromKeywords = getSearchKeywords(searchFrom);
                                                            const stop = bus.detailedStops.find(s => 
                                                                fromKeywords.some(k => s.name.toLowerCase().includes(k))
                                                            );
                                                            if (stop && stop.time !== 'TBD') {
                                                                displayTime = stop.time;
                                                                isIntermediate = true;
                                                            }
                                                        }
                                                        const estimatedFare = calculateFare(bus.distance, bus.type);
                                                        const isKSRTC = bus.type === 'KSRTC' || bus.type === 'Swift';

                                                        return (
                                                            <div key={bus.id} onClick={() => handleBusClick(bus)} className="relative bg-white rounded-xl sm:rounded-2xl border border-teal-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer overflow-hidden group">
                                                                <div className="absolute top-1/2 -translate-y-1/2 right-[-10px] sm:right-[-20px] font-black text-6xl sm:text-8xl text-gray-50 italic pointer-events-none select-none z-0 tracking-tighter opacity-50 sm:opacity-80">
                                                                    {isKSRTC ? 'KSRTC' : 'PRIVATE'}
                                                                </div>
                                                                <div className="relative z-10 flex justify-between items-start mb-3">
                                                                    <div className="min-w-0 pr-2">
                                                                        <h4 className="font-bold text-lg sm:text-xl text-teal-900 leading-tight truncate">{bus.name}</h4>
                                                                        <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5 truncate">{bus.route}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        {bus.votes > 0 && (
                                                                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-green-100 shadow-sm">
                                                                                <Star size={10} className="fill-green-700" /> {bus.votes}
                                                                            </div>
                                                                        )}
                                                                        <ChevronRight size={20} className="text-gray-300 sm:w-6 sm:h-6" />
                                                                    </div>
                                                                </div>
                                                                <div className="relative z-10 border-t border-dashed border-gray-200 my-3"></div>
                                                                <div className="relative z-10 flex items-center gap-3 sm:gap-5">
                                                                    <div className="bg-gray-50 rounded-xl p-2 sm:p-3 w-20 sm:w-24 shrink-0 text-center border border-gray-100 flex flex-col justify-center">
                                                                        <span className="block text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{displayTime.split(' ')[0]}</span>
                                                                        <span className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-1">{displayTime.split(' ')[1]}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${isKSRTC ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                                                {bus.type}
                                                                            </span>
                                                                            {isIntermediate && (
                                                                                <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                                    Via {searchFrom}
                                                                                </span>
                                                                            )}
                                                                            <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                                Crowd: {bus.crowdLevel || "Low"}
                                                                            </span>
                                                                            <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                                Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                                                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                                <Bus size={32} className="text-gray-400" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-800 mb-2">No buses found for this route</h3>
                                                            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                                                                We couldn't find any buses running from <span className="font-bold">{searchFrom}</span> to <span className="font-bold">{searchTo || 'your destination'}</span>.
                                                            </p>
                                                            <div className="grid gap-3 w-full max-w-sm">
                                                                <button onClick={() => navigate('/add-bus')} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                                    <PlusCircle size={18} /> Add Bus For This Route
                                                                </button>
                                                                {buses.length === 0 && (
                                                                    <button onClick={seedDatabase} className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition-all">
                                                                        Load Sample Data
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {filteredBuses.length > itemsPerPage && (
                                                    <div className="flex flex-col items-center mt-8 gap-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                            Showing Page {currentPage} of {totalPages}
                                                        </span>
                                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                                                            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1} className={`p-3 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-200 ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-teal-700 hover:bg-teal-50 hover:shadow-md active:scale-95'}`}>
                                                                <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
                                                            </button>
                                                            <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-black text-teal-800 min-w-[3rem] text-center">
                                                                {currentPage}
                                                            </div>
                                                            <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages} className={`p-3 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-200 ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-teal-700 hover:bg-teal-50 hover:shadow-md active:scale-95'}`}>
                                                                <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                                                    <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-xl p-5 shadow-md text-white relative overflow-hidden group flex flex-col justify-between">
                                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                                        <div>
                                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                                                                <Star className="text-yellow-300 fill-yellow-300" size={18} />
                                                                <span>Contribute Data</span>
                                                            </h3>
                                                            <p className="text-teal-100 text-xs sm:text-sm max-w-md leading-relaxed mb-4">
                                                                Know a bus route or timing we missed? <span className="text-white font-bold">Your single contribution can help thousands of travelers</span> reach their destination on time.
                                                            </p>
                                                        </div>
                                                        <button onClick={() => navigate('/add-bus')} className="w-full bg-white/10 hover:bg-white text-white hover:text-teal-900 border border-white/20 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2">
                                                            <PlusCircle size={16} /> Add Missing Bus
                                                        </button>
                                                    </div>

                                                    <div className="bg-gradient-to-r from-indigo-800 to-slate-900 rounded-xl p-5 shadow-md text-white relative overflow-hidden group flex flex-col justify-between">
                                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                                        <div>
                                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                                                                <Monitor className="text-blue-300" size={18} />
                                                                <span>Live Bus Stand</span>
                                                            </h3>
                                                            <p className="text-indigo-100 text-xs leading-relaxed mb-4">
                                                                Turn your shop TV or phone into a real-time departure board for any stop.
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => { setShowBoardInput(true); setTimeout(() => quickLinksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                                                            className="w-full bg-white/10 hover:bg-white text-white hover:text-indigo-900 border border-white/20 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Maximize2 size={16} /> Launch Display
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div ref={quickLinksRef} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wide">Quick Links</h4>
                                        <div className="space-y-1">
                                            <button onClick={() => setShowBoardInput(!showBoardInput)} className="w-full flex items-center gap-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0 text-left">
                                                <Monitor size={14} /> Digital Bus Stand Display
                                            </button>

                                            {showBoardInput && (
                                                <div className="p-3 bg-gray-50 rounded-lg animate-fade-in border border-gray-200 mb-2 relative">
                                                    <input
                                                        className="w-full p-2 border border-gray-200 rounded text-xs mb-2 outline-none focus:border-teal-500"
                                                        placeholder="Enter Stop Name (e.g. Pandikkad)"
                                                        value={boardStop}
                                                        onChange={(e) => {
                                                            setBoardStop(e.target.value);
                                                            updateSuggestions(e.target.value, 'board');
                                                        }}
                                                    />
                                                    {suggestionsBoard.length > 0 && (
                                                        <div className="bg-white border border-gray-200 rounded text-xs mb-2 max-h-32 overflow-y-auto absolute z-20 w-full left-0 top-12 shadow-lg">
                                                            {suggestionsBoard.map((s, i) => (
                                                                <div key={i} onClick={() => { setBoardStop(s); setSuggestionsBoard([]); }} className="p-2 hover:bg-teal-50 cursor-pointer border-b border-gray-50">{s}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <button onClick={openBoard} className="w-full bg-teal-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 hover:bg-teal-700">
                                                        <Maximize2 size={12} /> Open Board View
                                                    </button>
                                                </div>
                                            )}

                                            <button onClick={() => navigate('/add-bus')} className="w-full flex items-center gap-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0 text-left">
                                                <PlusCircle size={14} /> Add Missing Bus
                                            </button>
                                            <button onClick={() => navigate('/depot')} className="w-full flex items-center gap-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0 text-left">
                                                <Phone size={14} /> Depot Enquiry Numbers
                                            </button>
                                            <button onClick={() => navigate('/stands')} className="w-full flex items-center gap-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0 text-left">
                                                <MapPin size={14} /> Bus Stand List
                                            </button>
                                            {[
                                                { t: "Official KSRTC Booking", l: "https://online.keralartc.com" },
                                                { t: "Student Concession", l: "https://concessionksrtc.com/school-register" },
                                                { t: "Sabarimala Bus Pass", l: "https://sabarimala.onlineksrtcswift.com/" },
                                                { t: "Check Fare Rates (MVD)", l: "https://mvd.kerala.gov.in" },
                                                { t: "Live Traffic Status", l: "https://google.com/maps" }
                                            ].map((item, i) => (
                                                <a key={i} href={item.l} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-700 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0">
                                                    <ChevronRight size={12} className="text-gray-300" /> {item.t}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    <FareCalculator />
                                </div>

                                <div className="lg:hidden mt-4 flex items-center justify-center bg-gray-100 p-2 rounded-lg">
                                    <div id="google_translate_element" className="scale-90 origin-center"></div>
                                </div>
                                <SeoContent onQuickSearch={handleQuickSearch} />
                            </>
                        )}

                        {view === 'add-bus' && (
                            <AddBusForm
                                onCancel={() => navigate('/')}
                                onAdd={addNewBus}
                                showToast={showToast}
                                existingBuses={buses}
                            />
                        )}

                        {view === 'depot' && <DepotEnquiry />}
                        {view === 'bus-stands' && <BusStandList onBack={() => navigate('/')} />}

                        {['about', 'contact', 'privacy', 'terms', 'disclaimer', 'cookies'].includes(view) && (
                            <FooterPage type={view} onBack={() => navigate('/')} />
                        )}

                        {view === 'results' && (
                            <div className="animate-fade-in" ref={resultsRef}>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                                <Search size={20} className="text-teal-600" />
                                                <span className="capitalize">{searchFrom}</span>
                                                <ArrowRightLeft size={14} className="text-gray-400" />
                                                <span className="capitalize">{searchTo || 'Anywhere'}</span>
                                            </h3>
                                            <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-teal-600 font-medium mt-1">
                                                ← Back to Search
                                            </button>
                                        </div>
                                        {searchFrom && searchTo && searchTo !== '-' && (
                                            <button
                                                onClick={() => {
                                                    navigate(`/search/${encodeURIComponent(searchTo)}/${encodeURIComponent(searchFrom)}/${filterType}`);
                                                }}
                                                className="flex items-center justify-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-xs font-bold border border-teal-100 hover:bg-teal-100 transition-colors"
                                            >
                                                <ArrowRightLeft size={14} /> Check Return Trip ({searchTo} → {searchFrom})
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => setResultFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${resultFilter === 'all' ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>All Buses</button>
                                        <button onClick={() => setResultFilter('upcoming')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${resultFilter === 'upcoming' ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Upcoming Only</button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {paginatedBuses.length > 0 ? paginatedBuses.map((bus, idx) => {
                                                let displayTime = bus.time;
                                                let isIntermediate = false;
                                                if (searchFrom && bus.detailedStops) {
                                                    const fromKeywords = getSearchKeywords(searchFrom);
                                                    const stop = bus.detailedStops.find(s => 
                                                        fromKeywords.some(k => s.name.toLowerCase().includes(k))
                                                    );
                                                    if (stop && stop.time !== 'TBD') {
                                                        displayTime = stop.time;
                                                        isIntermediate = true;
                                                    }
                                                }
                                                const estimatedFare = calculateFare(bus.distance, bus.type);
                                                const isKSRTC = bus.type === 'KSRTC' || bus.type === 'Swift';

                                                return (
                                                    <div key={bus.id} onClick={() => handleBusClick(bus)} className="relative bg-white rounded-xl sm:rounded-2xl border border-teal-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer overflow-hidden group">
                                                        <div className="absolute top-1/2 -translate-y-1/2 right-[-10px] sm:right-[-20px] font-black text-6xl sm:text-8xl text-gray-50 italic pointer-events-none select-none z-0 tracking-tighter opacity-50 sm:opacity-80">
                                                            {isKSRTC ? 'KSRTC' : 'PRIVATE'}
                                                        </div>
                                                        <div className="relative z-10 flex justify-between items-start mb-3">
                                                            <div className="min-w-0 pr-2">
                                                                <h4 className="font-bold text-lg sm:text-xl text-teal-900 leading-tight truncate">{bus.name}</h4>
                                                                <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5 truncate">{bus.route}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {bus.votes > 0 && (
                                                                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-green-100 shadow-sm">
                                                                        <Star size={10} className="fill-green-700" /> {bus.votes}
                                                                    </div>
                                                                )}
                                                                <ChevronRight size={20} className="text-gray-300 sm:w-6 sm:h-6" />
                                                            </div>
                                                        </div>
                                                        <div className="relative z-10 border-t border-dashed border-gray-200 my-3"></div>
                                                        <div className="relative z-10 flex items-center gap-3 sm:gap-5">
                                                            <div className="bg-gray-50 rounded-xl p-2 sm:p-3 w-20 sm:w-24 shrink-0 text-center border border-gray-100 flex flex-col justify-center">
                                                                <span className="block text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{displayTime.split(' ')[0]}</span>
                                                                <span className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-1">{displayTime.split(' ')[1]}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${isKSRTC ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                                        {bus.type}
                                                                    </span>
                                                                    {isIntermediate && (
                                                                        <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                            Via {searchFrom}
                                                                        </span>
                                                                    )}
                                                                    <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                        Crowd: {bus.crowdLevel || "Low"}
                                                                    </span>
                                                                    <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                        Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                                                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                        <Bus size={32} className="text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-800 mb-2">No buses found for this route</h3>
                                                    <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                                                        We couldn't find any buses running from <span className="font-bold">{searchFrom}</span> to <span className="font-bold">{searchTo || 'your destination'}</span>.
                                                    </p>
                                                    <div className="grid gap-3 w-full max-w-sm">
                                                        <button onClick={() => navigate('/add-bus')} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                            <PlusCircle size={18} /> Add Bus For This Route
                                                        </button>
                                                        {buses.length === 0 && (
                                                            <button onClick={seedDatabase} className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition-all">
                                                                Load Sample Data
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {filteredBuses.length > itemsPerPage && (
                                            <div className="flex flex-col items-center mt-8 gap-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Showing Page {currentPage} of {totalPages}
                                                </span>
                                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                                                    <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1} className={`p-3 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-200 ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-teal-700 hover:bg-teal-50 hover:shadow-md active:scale-95'}`}>
                                                        <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
                                                    </button>
                                                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-black text-teal-800 min-w-[3rem] text-center">
                                                        {currentPage}
                                                    </div>
                                                    <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages} className={`p-3 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-200 ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-teal-700 hover:bg-teal-50 hover:shadow-md active:scale-95'}`}>
                                                        <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                                            <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-xl p-5 shadow-md text-white relative overflow-hidden group flex flex-col justify-between">
                                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                                <div>
                                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                                                        <Star className="text-yellow-300 fill-yellow-300" size={18} />
                                                        <span>Contribute Data</span>
                                                    </h3>
                                                    <p className="text-teal-100 text-xs sm:text-sm max-w-md leading-relaxed mb-4">
                                                        Know a bus route or timing we missed? <span className="text-white font-bold">Your single contribution can help thousands of travelers</span> reach their destination on time.
                                                    </p>
                                                </div>
                                                <button onClick={() => navigate('/add-bus')} className="w-full bg-white/10 hover:bg-white text-white hover:text-teal-900 border border-white/20 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2">
                                                    <PlusCircle size={16} /> Add Missing Bus
                                                </button>
                                            </div>

                                            <div className="bg-gradient-to-r from-indigo-800 to-slate-900 rounded-xl p-5 shadow-md text-white relative overflow-hidden group flex flex-col justify-between">
                                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                                <div>
                                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                                                        <Monitor className="text-blue-300" size={18} />
                                                        <span>Live Bus Stand</span>
                                                    </h3>
                                                    <p className="text-indigo-100 text-xs leading-relaxed mb-4">
                                                        Turn your shop TV or phone into a real-time departure board for any stop.
                                                    </p>
                                                </div>
                                                <button onClick={() => { setShowBoardInput(true); setTimeout(() => quickLinksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }} className="w-full bg-white/10 hover:bg-white text-white hover:text-indigo-900 border border-white/20 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2">
                                                    <Maximize2 size={16} /> Launch Display
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {view === 'detail' && selectedBus && (
                            <div ref={resultsRef}>
                                <BusPost
                                    bus={selectedBus}
                                    onBack={() => {
                                        if (searchFrom) {
                                            const toParam = searchTo.trim() || '-';
                                            navigate(`/search/${encodeURIComponent(searchFrom)}/${encodeURIComponent(toParam)}/${filterType}`);
                                        } else {
                                            navigate('/');
                                        }
                                    }}
                                    addComment={addComment}
                                    updateBusDetails={updateBusDetails}
                                    onVote={handleVote}
                                    reportLate={reportLate}
                                    updateCrowd={updateCrowd}
                                    toggleFavorite={toggleFavorite}
                                    isFavorite={favorites.some(f => f.id === selectedBus.id)}
                                    showToast={showToast}
                                />
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:block lg:col-span-4">
                        <div className="mb-4 flex justify-end">
                            <div id="google_translate_element" className="bg-white px-2 py-1 rounded shadow-sm border border-gray-200"></div>
                        </div>
                        <Sidebar setView={(v) => navigate(`/${v}`)} onSeed={seedDatabase} favorites={favorites} onSelectFavorite={handleSelectFavorite} points={userPoints} />
                    </div>
                </div>

                {view !== 'board' && <Footer setView={(v) => navigate(`/${v}`)} onQuickSearch={handleQuickSearch} />}
            </div>
        </div>
    );
};