import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ArrowRightLeft, ChevronRight, Clock, Bus, Trophy, Star, Monitor, X, Maximize2, Sun, Moon, PlusCircle } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion, query, orderBy, increment } from "firebase/firestore";

// --- IMPORTS FROM OTHER FILES ---
import { BUS_STOPS, getMinutesFromMidnight, calculateFare, generateSchema, SEED_BUSES } from './utils';
import { ToastContainer, Navbar, MobileMenu, Footer, FooterPage } from './components/Layout';
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

// --- HELPER: LIVE CLOCK COMPONENT ---
const LiveClock = ({ darkMode }) => {
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
  
  // Board State
  const [boardStop, setBoardStop] = useState('');
  const [showBoardInput, setShowBoardInput] = useState(false);
  const [boardDarkMode, setBoardDarkMode] = useState(false);

  // Ref for auto-scrolling to results
  const resultsRef = useRef(null);

  // Search State
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [suggestionsFrom, setSuggestionsFrom] = useState([]);
  const [suggestionsTo, setSuggestionsTo] = useState([]);
  const [suggestionsBoard, setSuggestionsBoard] = useState([]); 

  const showToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Load Favorites & Points
  useEffect(() => {
      const savedFavs = localStorage.getItem('evidebusFavs');
      if(savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedPoints = localStorage.getItem('evidebusPoints');
      if(savedPoints) setUserPoints(parseInt(savedPoints));
  }, []);

  // SEO Injection
  useEffect(() => {
      document.title = view === 'detail' && selectedBus 
          ? `${selectedBus.route} Bus Timing - evidebus.in`
          : "evidebus.in - Find Private & KSRTC Bus Timings";
      
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

  // Firebase Listener
  useEffect(() => {
    if (!db) {
        setLoading(false); 
        return;
    }
    const q = query(collection(db, "buses"), orderBy("time"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const busData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBuses(busData);
      setLoading(false);
      if(selectedBus) {
        const updatedSelected = busData.find(b => b.id === selectedBus.id);
        if(updatedSelected) setSelectedBus(updatedSelected);
      }
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [selectedBus]);

  // Scroll to results when view changes to 'results'
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
      if(localStorage.getItem(storageKey)) {
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
      if(localStorage.getItem(storageKey)) return;
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
      if(!val) { 
          if(type === 'from') setSuggestionsFrom([]);
          else if(type === 'to') setSuggestionsTo([]);
          else if(type === 'board') setSuggestionsBoard([]);
          return; 
      }
      const filtered = BUS_STOPS.filter(stop => stop.toLowerCase().startsWith(val.toLowerCase())).slice(0, 8);
      
      if(type === 'from') setSuggestionsFrom(filtered);
      else if(type === 'to') setSuggestionsTo(filtered);
      else if(type === 'board') setSuggestionsBoard(filtered);
  };

  const handleInputChange = (e, type) => {
      const val = e.target.value;
      if(type === 'from') setSearchFrom(val);
      else if(type === 'to') setSearchTo(val);
      updateSuggestions(val, type);
  };

  const selectSuggestion = (val, type) => {
      if(type === 'from') { setSearchFrom(val); setSuggestionsFrom([]); }
      else if(type === 'to') { setSearchTo(val); setSuggestionsTo([]); }
  };

  const handleFindBus = () => {
      window.location.hash = `#/search/${encodeURIComponent(searchFrom)}/${encodeURIComponent(searchTo)}/${filterType}`;
  };

  const handleQuickSearch = (term) => {
      setSearchTo(term);
      setSearchFrom(''); 
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
              if (!['ksrtc', 'private', 'add-bus', 'about', 'contact', 'privacy', 'terms', 'disclaimer', 'board'].includes(view)) {
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

  // Filter Logic
  const filteredBuses = buses.filter(bus => {
    const sFrom = searchFrom.toLowerCase().trim();
    const sTo = searchTo.toLowerCase().trim();
    const stopsStr = (bus.stops || bus.route || "").toLowerCase();
    const fullPath = `${(bus.from || "").toLowerCase()} ${stopsStr} ${(bus.to || "").toLowerCase()}`;
    
    // 1. Check if both keywords exist
    const hasFrom = !sFrom || fullPath.includes(sFrom);
    const hasTo = !sTo || fullPath.includes(sTo);
    
    // 2. Check Direction (From index < To index)
    let isDirectionCorrect = true;
    if (sFrom && sTo && hasFrom && hasTo) {
        if (fullPath.indexOf(sFrom) >= fullPath.indexOf(sTo)) isDirectionCorrect = false; 
    }

    if (view === 'ksrtc' && bus.type !== 'KSRTC') return false; 
    if (view === 'private' && bus.type !== 'Private') return false;
    
    // Filter based on Time (Live/Upcoming)
    if (resultFilter === 'upcoming') {
        const currentTime = new Date();
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        let checkTime = bus.time;
        if (searchFrom && bus.detailedStops) {
            const stop = bus.detailedStops.find(s => s.name.toLowerCase() === searchFrom.toLowerCase());
            if (stop && stop.time !== 'TBD') checkTime = stop.time;
        }
        if (getMinutesFromMidnight(checkTime) !== -1 && getMinutesFromMidnight(checkTime) < currentMinutes) return false;
    }

    const matchesType = filterType === 'all' || (bus.type && bus.type.toLowerCase() === filterType.toLowerCase());
    return hasFrom && hasTo && isDirectionCorrect && matchesType;
  });

  // --- DIGITAL BOARD LOGIC (FIXED: Deduplication) ---
  const getBoardBuses = () => {
    if (!boardStop) return [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Map to raw upcoming buses
    const upcomingRaw = buses
        .filter(bus => {
            if (!bus.detailedStops) return false;
            const stop = bus.detailedStops.find(s => s.name.toLowerCase() === boardStop.toLowerCase());
            if (!stop || stop.time === 'TBD') return false;
            const busMins = getMinutesFromMidnight(stop.time);
            return busMins !== -1 && busMins >= currentMinutes; 
        })
        .map(bus => {
            const stop = bus.detailedStops.find(s => s.name.toLowerCase() === boardStop.toLowerCase());
            return { ...bus, boardTime: stop.time, boardMins: getMinutesFromMidnight(stop.time) };
        });

    // 2. Remove Duplicates based on (Name + Route + Time)
    const seen = new Set();
    const uniqueBuses = [];
    for (const bus of upcomingRaw) {
        const uniqueKey = `${bus.name}-${bus.route}-${bus.boardTime}`;
        if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            uniqueBuses.push(bus);
        }
    }

    // 3. Sort by time and slice
    return uniqueBuses.sort((a, b) => a.boardMins - b.boardMins).slice(0, 10);
  };

  const openBoard = () => {
      if(boardStop) {
          setView('board');
          setShowBoardInput(false);
      } else {
          showToast("Please select a stop first", "error");
      }
  };

  // Calculate Level for mobile header
  let userLevel = "Newbie";
  if (userPoints >= 100) userLevel = "Explorer";
  if (userPoints >= 500) userLevel = "Guide";
  if (userPoints >= 1000) userLevel = "Expert";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-700 pb-20">
        {/* --- FULLSCREEN DIGITAL BOARD VIEW --- */}
        {view === 'board' && (
             <div className={`fixed inset-0 z-50 p-6 md:p-10 flex flex-col font-mono overflow-hidden transition-colors duration-500 ${boardDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
                {/* Board Header */}
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
                            <button onClick={() => setView('home')} className={`p-2 rounded-lg transition-colors ${boardDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}>
                                <X size={24} />
                            </button>
                        </div>
                        <LiveClock darkMode={boardDarkMode} />
                    </div>
                </div>

                {/* Bus List Header */}
                <div className={`grid grid-cols-12 gap-4 uppercase text-sm font-bold tracking-widest px-4 mb-4 ${boardDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-4">Service / Bus Name</div>
                    <div className="col-span-4">Route / Destination</div>
                    <div className="col-span-2 text-right">Type</div>
                </div>

                {/* Board Content */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {getBoardBuses().length > 0 ? getBoardBuses().map((bus, i) => (
                        <div key={bus.id} className={`grid grid-cols-12 gap-4 border-l-4 p-4 items-center rounded-r-lg transition-all group ${
                            boardDarkMode 
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
                            <Bus size={64} className="mb-4 opacity-20"/>
                            <p className="text-xl font-bold">No upcoming buses scheduled soon.</p>
                            <p className="text-sm">Check back later or verify stop name.</p>
                        </div>
                    )}
                </div>
                
                {/* Board Footer */}
                <div className={`mt-6 pt-4 border-t flex justify-between items-center text-xs uppercase tracking-wider ${boardDarkMode ? 'border-gray-900 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                    <div>Powered by evidebus.in</div>
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
        `}</style>

        <ToastContainer toasts={toasts} />
        {/* Hide Nav on Board View */}
        {view !== 'board' && <Navbar setView={setView} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />}
        <MobileMenu isOpen={isMenuOpen} setView={setView} closeMenu={() => setIsMenuOpen(false)} />

        {/* --- MAIN CONTENT (Hidden if Board View) --- */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${view === 'board' ? 'hidden' : ''}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-8 space-y-5">
                    
                    {/* MOBILE CONTRIBUTION BAR */}
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
                            {/* HERO SEARCH */}
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
                                    <button onClick={() => {setSearchFrom(''); setSearchTo('');}} className="px-5 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg text-xs hover:bg-gray-200 transition-colors">Clear</button>
                                    <button onClick={handleFindBus} className="flex-1 py-3 bg-teal-700 text-white font-bold rounded-lg shadow-md hover:bg-teal-800 hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wider">
                                        Find My Bus
                                    </button>
                                </div>
                            </div>
                            
                            {/* RESULTS LIST */}
                            {(view === 'ksrtc' || view === 'private') && (
                                <div className="animate-fade-in" ref={resultsRef}>
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                            <Bus size={18} className="text-teal-600"/> 
                                            {view === 'ksrtc' ? 'KSRTC Fleet' : 'Private Buses'}
                                        </h3>
                                        <div className="flex bg-gray-100 p-1 rounded-md">
                                            <button onClick={() => setResultFilter('all')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'all' ? 'bg-white shadow text-teal-800' : 'text-gray-400'}`}>All</button>
                                            <button onClick={() => setResultFilter('upcoming')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'upcoming' ? 'bg-white shadow text-teal-800' : 'text-gray-400'}`}>Upcoming</button>
                                        </div>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="py-12 text-center text-gray-400 text-xs">Fetching live schedule...</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredBuses.length > 0 ? filteredBuses.map((bus, idx) => {
                                                let displayTime = bus.time;
                                                let isIntermediate = false;
                                                if (searchFrom && bus.detailedStops) {
                                                    const stop = bus.detailedStops.find(s => s.name.toLowerCase() === searchFrom.toLowerCase());
                                                    if (stop && stop.time !== 'TBD') {
                                                        displayTime = stop.time;
                                                        isIntermediate = true;
                                                    }
                                                }
                                                const estimatedFare = calculateFare(bus.distance, bus.type);
                                                const isKSRTC = bus.type === 'KSRTC' || bus.type === 'Swift';

                                                return (
                                                <div key={bus.id} onClick={() => handleBusClick(bus)} className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer group transition-all relative overflow-hidden ${isKSRTC ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-blue-600'}`}>
                                                    <div className="flex gap-4 items-center">
                                                        <div className={`flex flex-col items-center justify-center rounded-lg p-2 min-w-[60px] border ${isKSRTC ? 'bg-red-50 border-red-100 text-red-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                                                            <span className="text-lg font-bold leading-none">{displayTime.split(' ')[0]}</span>
                                                            <span className="text-[10px] font-bold uppercase mt-1">{displayTime.split(' ')[1]}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0"> 
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-sm text-gray-900 truncate pr-2">{bus.name}</h4>
                                                                {bus.votes > 0 && (
                                                                    <span className="flex items-center gap-1 text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 font-bold shrink-0">
                                                                       <Star size={8} className="fill-green-600"/> {bus.votes}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 font-medium truncate mb-2">{bus.route}</p>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* TYPE BADGE - SOLID ICON */}
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${isKSRTC ? 'bg-red-600' : 'bg-blue-600'}`}>
                                                                    <Bus size={12} />
                                                                </div>
                                                                
                                                                <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${isKSRTC ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                                    {bus.type}
                                                                </span>
                                                                {isIntermediate && (
                                                                    <span className="text-[9px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                                                        Via {searchFrom}
                                                                    </span>
                                                                )}
                                                                <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    Crowd: {bus.crowdLevel || "Low"}
                                                                </span>
                                                                <span className="text-[9px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-600 shrink-0" />
                                                    </div>
                                                </div>
                                                );}) : (
                                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                                                    No buses found matching your search.
                                                    {buses.length === 0 && (
                                                        <div className="mt-3">
                                                            <button onClick={seedDatabase} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-bold hover:bg-blue-100 border border-blue-100">
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
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wide">Quick Links</h4>
                                    <div className="space-y-1">
                                        <button onClick={() => setShowBoardInput(!showBoardInput)} className="w-full flex items-center gap-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0 text-left">
                                            <Monitor size={14} /> Digital Bus Stand Display
                                        </button>
                                        
                                        {/* Board Input Dropdown */}
                                        {showBoardInput && (
                                            <div className="p-3 bg-gray-50 rounded-lg animate-fade-in border border-gray-200 mb-2 relative">
                                                <input 
                                                    className="w-full p-2 border border-gray-200 rounded text-xs mb-2 outline-none focus:border-teal-500" 
                                                    placeholder="Enter Stop Name (e.g. Pandikkad)"
                                                    value={boardStop}
                                                    onChange={(e) => {
                                                        setBoardStop(e.target.value);
                                                        updateSuggestions(e.target.value, 'board'); // Use distinct 'board' type
                                                    }}
                                                />
                                                {/* Suggestions Specific to Board */}
                                                {suggestionsBoard.length > 0 && (
                                                    <div className="bg-white border border-gray-200 rounded text-xs mb-2 max-h-32 overflow-y-auto absolute z-20 w-full left-0 top-12 shadow-lg">
                                                        {suggestionsBoard.map((s, i) => (
                                                            <div key={i} onClick={() => { setBoardStop(s); setSuggestionsBoard([]); }} className="p-2 hover:bg-teal-50 cursor-pointer border-b border-gray-50">{s}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                <button onClick={openBoard} className="w-full bg-teal-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 hover:bg-teal-700">
                                                    <Maximize2 size={12}/> Open Board View
                                                </button>
                                            </div>
                                        )}

                                        <button onClick={() => setView('add-bus')} className="w-full flex items-center gap-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0 text-left">
                                            <PlusCircle size={14} /> Add Missing Bus
                                        </button>

                                        {[
                                            { t: "Official KSRTC Booking", l: "https://www.keralartc.com/" },
                                            { t: "Student Concession", l: "https://concessionksrtc.com/school-register" },
                                            { t: "Check Fare Rates (MVD)", l: "https://mvd.kerala.gov.in" },
                                            { t: "Live Traffic Status", l: "https://google.com/maps" }
                                        ].map((item, i) => (
                                            <a key={i} href={item.l} target="_blank" className="flex items-center gap-2 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-700 hover:pl-2 rounded transition-all border-b border-gray-50 last:border-0">
                                                <ChevronRight size={12} className="text-gray-300" /> {item.t}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <FareCalculator />
                            </div>
                            <SeoContent onQuickSearch={handleQuickSearch} />
                        </>
                    )}

                    {view === 'add-bus' && (
                        <AddBusForm onCancel={() => setView('home')} onAdd={addNewBus} showToast={showToast} />
                    )}

                    {/* FOOTER PAGES */}
                    {['about', 'contact', 'privacy', 'terms', 'disclaimer'].includes(view) && (
                        <FooterPage type={view} onBack={() => setView('home')} />
                    )}

                    {/* RESULTS VIEW */}
                    {view === 'results' && (
                        <div className="animate-fade-in" ref={resultsRef}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                        <Search size={16} className="text-teal-600"/> 
                                        {searchFrom ? `Results: ${searchFrom}` : "All"} {searchTo && `to ${searchTo}`}
                                    </h3>
                                    <button onClick={() => {window.location.hash = ''; setView('home');}} className="text-[10px] text-gray-400 hover:text-teal-600 underline mt-1">
                                        Back to Search
                                    </button>
                                </div>
                                
                                <div className="flex bg-gray-100 p-1 rounded-md">
                                    <button onClick={() => setResultFilter('all')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'all' ? 'bg-white shadow text-teal-800' : 'text-gray-500'}`}>All</button>
                                    <button onClick={() => setResultFilter('upcoming')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'upcoming' ? 'bg-white shadow text-teal-800' : 'text-gray-500'}`}>Upcoming</button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-12 text-center text-gray-400 text-xs">Loading data...</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredBuses.length > 0 ? filteredBuses.map((bus, idx) => {
                                        let displayTime = bus.time;
                                        let isIntermediate = false;
                                        if (searchFrom && bus.detailedStops) {
                                            const stop = bus.detailedStops.find(s => s.name.toLowerCase() === searchFrom.toLowerCase());
                                            if (stop && stop.time !== 'TBD') {
                                                displayTime = stop.time;
                                                isIntermediate = true;
                                            }
                                        }
                                        const estimatedFare = calculateFare(bus.distance, bus.type);
                                        const isKSRTC = bus.type === 'KSRTC' || bus.type === 'Swift';

                                        return (
                                        <div key={bus.id} onClick={() => handleBusClick(bus)} className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer group transition-all relative overflow-hidden ${isKSRTC ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-blue-600'}`}>
                                            <div className="flex gap-4 items-center">
                                                <div className={`flex flex-col items-center justify-center rounded-lg p-2 min-w-[60px] border ${isKSRTC ? 'bg-red-50 border-red-100 text-red-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                                                    <span className="text-lg font-bold leading-none">{displayTime.split(' ')[0]}</span>
                                                    <span className="text-[10px] font-bold uppercase mt-1">{displayTime.split(' ')[1]}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-sm text-gray-900 truncate pr-2">{bus.name}</h4>
                                                        {bus.votes > 0 && (
                                                            <span className="flex items-center gap-1 text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 font-bold shrink-0">
                                                                <Star size={8} className="fill-green-600"/> {bus.votes}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 font-medium truncate mb-2">{bus.route}</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* TYPE BADGE - SOLID ICON */}
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${isKSRTC ? 'bg-red-600' : 'bg-blue-600'}`}>
                                                            <Bus size={12} />
                                                        </div>
                                                        
                                                        <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${isKSRTC ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                            {bus.type}
                                                        </span>
                                                        {isIntermediate && (
                                                            <span className="text-[9px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                                                Via {searchFrom}
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                            Crowd: {bus.crowdLevel || "Low"}
                                                        </span>
                                                        <span className="text-[9px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                            Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-600 shrink-0" />
                                            </div>
                                        </div>
                                        );}) : (
                                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                                            No buses found matching your search.
                                            {buses.length === 0 && (
                                                <div className="mt-3">
                                                    <button onClick={seedDatabase} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-bold hover:bg-blue-100 border border-blue-100">
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
                        <div ref={resultsRef}>
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
                        </div>
                    )}
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="hidden lg:block lg:col-span-4">
                    <Sidebar setView={setView} onSeed={seedDatabase} favorites={favorites} onSelectFavorite={handleSelectFavorite} points={userPoints} />
                </div>
            </div>
            
            {view !== 'board' && <Footer setView={setView} onQuickSearch={handleQuickSearch} />}
        </div>
    </div>
  );
}