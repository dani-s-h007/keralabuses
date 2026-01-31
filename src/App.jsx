import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRightLeft, ChevronRight, Clock, Bus, Trophy, Star, Monitor, X, Maximize2, Sun, Moon, PlusCircle, Phone } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion, query, orderBy, increment } from "firebase/firestore";

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

// --- HELPER: GENERATE SEO SLUG ---
// Creates a URL like: /bus/manjeri-to-kozhikode-0830-am-private
const generateBusSlug = (bus) => {
    const clean = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '-') : '';
    const timeClean = bus.time ? bus.time.toLowerCase().replace(' ', '-').replace(':', '') : '0000';
    return `${clean(bus.from)}-to-${clean(bus.to)}-${timeClean}-${clean(bus.type)}`;
};

// --- HELPER: LIVE CLOCK COMPONENT ---
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

// --- DEPOT ENQUIRY COMPONENT ---
const DepotEnquiry = () => {
    const [activeAccordion, setActiveAccordion] = useState(null);
    const toggleAccordion = (index) => setActiveAccordion(activeAccordion === index ? null : index);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="text-teal-600" size={24}/> Kerala RTC General Enquiry
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
  
  // Board State
  const [boardStop, setBoardStop] = useState('');
  const [showBoardInput, setShowBoardInput] = useState(false);
  const [boardDarkMode, setBoardDarkMode] = useState(false);

  // Routing Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const resultsRef = useRef(null);

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

  // Load Persistence
  useEffect(() => {
      const savedFavs = localStorage.getItem('evidebusFavs');
      if(savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedPoints = localStorage.getItem('evidebusPoints');
      if(savedPoints) setUserPoints(parseInt(savedPoints));
  }, []);

  // SEO Injection & Router Logic
  useEffect(() => {
      const path = location.pathname;
      const params = path.split('/'); 

      // 1. Bus Detail URL: /bus/manjeri-to-kozhikode-0830-am-private
      if (path.startsWith('/bus/')) {
          const busSlug = params[2]; // Get the human-readable slug
          if (buses.length > 0) {
              // Find the bus by regenerating the slug for each bus and matching
              const bus = buses.find(b => generateBusSlug(b) === busSlug);
              
              if (bus) {
                  setSelectedBus(bus);
                  setView('detail');
              } else {
                  // Fallback: Check if it's an old ID link just in case
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
          if(station) {
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
      } else if (['/about', '/contact', '/privacy', '/terms', '/disclaimer'].includes(path)) {
          setView(path.substring(1));
      } else {
          setView('home');
      }

      // SEO Titles
      let title = "evidebus.com - Find Private & KSRTC Bus Timings";
      if (view === 'detail' && selectedBus) title = `${selectedBus.route} ${selectedBus.time} Bus Timing - evidebus.com`;
      if (view === 'depot') title = "Kerala KSRTC Depot Contact Numbers - evidebus.com";
      if (view === 'bus-stands') title = "Kerala Bus Stand List - evidebus.com";
      if (view === 'board') title = `${boardStop} Live Bus Stand Status - evidebus.com`;
      document.title = title;
      
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

  }, [location, buses, loading, view, selectedBus, boardStop]);

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
      // Sync selected bus details in real-time
      if(selectedBus) {
        const updatedSelected = busData.find(b => b.id === selectedBus.id);
        if(updatedSelected) setSelectedBus(updatedSelected);
      }
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [selectedBus]);

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
          navigate('/'); 
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
      const toParam = searchTo.trim() || '-';
      navigate(`/search/${encodeURIComponent(searchFrom)}/${encodeURIComponent(toParam)}/${filterType}`);
  };

  const handleQuickSearch = (term) => {
      const toParam = term.trim() || '-';
      navigate(`/search/-/${encodeURIComponent(toParam)}/all`);
  };

  // UPDATED: Navigates using the readable slug
  const handleBusClick = (bus) => {
      const slug = generateBusSlug(bus);
      navigate(`/bus/${slug}`);
  };

  const handleSelectFavorite = (favBus) => {
      const liveBus = buses.find(b => b.id === favBus.id);
      if(liveBus) {
          handleBusClick(liveBus);
      } else {
          showToast("Bus not found in live list", "error");
      }
  };

  // Filter Logic - OPTIMIZED
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      const sFrom = searchFrom.toLowerCase().trim();
      const sTo = searchTo.toLowerCase().trim();
      const stopsStr = (bus.stops || bus.route || "").toLowerCase();
      const fullPath = `${(bus.from || "").toLowerCase()} ${stopsStr} ${(bus.to || "").toLowerCase()}`;
      
      const hasFrom = !sFrom || fullPath.includes(sFrom);
      const hasTo = !sTo || fullPath.includes(sTo);
      
      let isDirectionCorrect = true;
      if (sFrom && sTo && hasFrom && hasTo) {
          if (fullPath.indexOf(sFrom) >= fullPath.indexOf(sTo)) isDirectionCorrect = false; 
      }

      if (view === 'ksrtc' && bus.type !== 'KSRTC') return false; 
      if (view === 'private' && bus.type !== 'Private') return false;
      
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
  }, [buses, searchFrom, searchTo, view, resultFilter, filterType]);

  // --- DIGITAL BOARD LOGIC ---
  const getBoardBuses = useMemo(() => {
    if (!boardStop) return [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

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
      if(boardStop) {
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
                            <button onClick={() => navigate('/')} className={`p-2 rounded-lg transition-colors ${boardDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}>
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
                    {getBoardBuses.length > 0 ? getBoardBuses.map((bus, i) => (
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
        `}</style>

        <ToastContainer toasts={toasts} />
        {/* Hide Nav on Board View */}
        {view !== 'board' && <Navbar setView={(v) => navigate(`/${v === 'home' ? '' : v}`)} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />}
        <MobileMenu isOpen={isMenuOpen} setView={(v) => navigate(`/${v === 'home' ? '' : v}`)} closeMenu={() => setIsMenuOpen(false)} />

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
                                        <div className="space-y-3">
                                            {[1,2,3,4,5].map(i => <SkeletonCard key={i}/>)}
                                        </div>
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
                                                <div 
                                                    key={bus.id} 
                                                    onClick={() => handleBusClick(bus)} 
                                                    className="relative bg-white rounded-2xl border border-teal-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                                                >
                                                    
                                                    {/* WATERMARK BACKGROUND */}
                                                    <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] font-black text-8xl text-gray-100 italic pointer-events-none select-none z-0 tracking-tighter opacity-80">
                                                        {isKSRTC ? 'KSRTC' : 'PRIVATE'}
                                                    </div>

                                                    <div className="flex items-center gap-4 relative z-10">
                                                        {/* TIME BOX */}
                                                        <div className="bg-gray-50 rounded-xl p-3 min-w-[80px] text-center border border-gray-100">
                                                            {/* INCREASED FONT SIZE */}
                                                            <span className="block text-3xl font-bold text-gray-900 leading-none">{displayTime.split(' ')[0]}</span>
                                                            <span className="block text-xs font-bold text-gray-400 uppercase mt-1">{displayTime.split(' ')[1]}</span>
                                                        </div>

                                                        {/* DETAILS */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Header: Name + Rating */}
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    {/* INCREASED FONT SIZE */}
                                                                    <h4 className="font-bold text-xl text-teal-900 leading-tight">{bus.name}</h4>
                                                                    {/* INCREASED FONT SIZE */}
                                                                    <p className="text-sm font-bold text-gray-600 mt-0.5">{bus.route}</p>
                                                                </div>
                                                                
                                                                {/* Rating Badge */}
                                                                {bus.votes > 0 && (
                                                                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-green-100 shadow-sm">
                                                                        <Star size={10} className="fill-green-700" /> {bus.votes}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Tags Row */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                                {/* Type Tag */}
                                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                                                    isKSRTC ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                }`}>
                                                                    {bus.type}
                                                                </span>

                                                                {isIntermediate && (
                                                                    <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                        Via {searchFrom}
                                                                    </span>
                                                                )}

                                                                {/* Crowd Tag */}
                                                                <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                    Crowd: {bus.crowdLevel || "Low"}
                                                                </span>

                                                                {/* Fare Tag */}
                                                                <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                    Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* ARROW */}
                                                        <div className="text-gray-300 pl-2">
                                                            <ChevronRight size={24} />
                                                        </div>
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
                                                        updateSuggestions(e.target.value, 'board'); 
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
                            <SeoContent onQuickSearch={handleQuickSearch} />
                        </>
                    )}

                    {view === 'add-bus' && (
                        <AddBusForm onCancel={() => navigate('/')} onAdd={addNewBus} showToast={showToast} />
                    )}

                    {view === 'depot' && (
                        <DepotEnquiry />
                    )}

                    {view === 'bus-stands' && (
                        <BusStandList onBack={() => navigate('/')} />
                    )}

                    {/* FOOTER PAGES */}
                    {['about', 'contact', 'privacy', 'terms', 'disclaimer'].includes(view) && (
                        <FooterPage type={view} onBack={() => navigate('/')} />
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
                                    <button onClick={() => navigate('/')} className="text-[10px] text-gray-400 hover:text-teal-600 underline mt-1">
                                        Back to Search
                                    </button>
                                </div>
                                
                                <div className="flex bg-gray-100 p-1 rounded-md">
                                    <button onClick={() => setResultFilter('all')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'all' ? 'bg-white shadow text-teal-800' : 'text-gray-400'}`}>All</button>
                                    <button onClick={() => setResultFilter('upcoming')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${resultFilter === 'upcoming' ? 'bg-white shadow text-teal-800' : 'text-gray-400'}`}>Upcoming</button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1,2,3,4,5].map(i => <SkeletonCard key={i}/>)}
                                </div>
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
                                        <div key={bus.id} onClick={() => handleBusClick(bus)} className="relative bg-white rounded-2xl border border-teal-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                                            
                                            {/* WATERMARK BACKGROUND */}
                                            <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] font-black text-8xl text-gray-100 italic pointer-events-none select-none z-0 tracking-tighter opacity-80">
                                                {isKSRTC ? 'KSRTC' : 'PRIVATE'}
                                            </div>

                                            <div className="flex items-center gap-4 relative z-10">
                                                {/* TIME BOX */}
                                                <div className="bg-gray-50 rounded-xl p-3 min-w-[80px] text-center border border-gray-100">
                                                    {/* INCREASED FONT SIZE */}
                                                    <span className="block text-3xl font-bold text-gray-900 leading-none">{displayTime.split(' ')[0]}</span>
                                                    <span className="block text-xs font-bold text-gray-400 uppercase mt-1">{displayTime.split(' ')[1]}</span>
                                                </div>

                                                {/* DETAILS */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Header: Name + Rating */}
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            {/* INCREASED FONT SIZE */}
                                                            <h4 className="font-bold text-xl text-teal-900 leading-tight">{bus.name}</h4>
                                                            {/* INCREASED FONT SIZE */}
                                                            <p className="text-sm font-bold text-gray-600 mt-0.5">{bus.route}</p>
                                                        </div>
                                                        
                                                        {/* Rating Badge */}
                                                        {bus.votes > 0 && (
                                                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-green-100 shadow-sm">
                                                                <Star size={10} className="fill-green-700" /> {bus.votes}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Tags Row */}
                                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                                        {/* Type Tag */}
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                                            isKSRTC ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                        }`}>
                                                            {bus.type}
                                                        </span>

                                                        {isIntermediate && (
                                                            <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                                Via {searchFrom}
                                                            </span>
                                                        )}

                                                        {/* Crowd Tag */}
                                                        <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                            Crowd: {bus.crowdLevel || "Low"}
                                                        </span>

                                                        {/* Fare Tag */}
                                                        <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                                                            Est. Fare: {estimatedFare ? `₹${estimatedFare}` : 'Check'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* ARROW */}
                                                <div className="text-gray-300 pl-2">
                                                    <ChevronRight size={24} />
                                                </div>
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

                    {/* DETAIL VIEW */}
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

                {/* --- RIGHT COLUMN --- */}
                <div className="hidden lg:block lg:col-span-4">
                    <Sidebar setView={(v) => navigate(`/${v}`)} onSeed={seedDatabase} favorites={favorites} onSelectFavorite={handleSelectFavorite} points={userPoints} />
                </div>
            </div>
            
            {view !== 'board' && <Footer setView={(v) => navigate(`/${v}`)} onQuickSearch={handleQuickSearch} />}
        </div>
    </div>
  );
}