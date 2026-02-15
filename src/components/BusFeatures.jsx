import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Edit3, Clock, Trash2, Save, X, Maximize2, 
  MessageCircle, AlertTriangle, MessageSquare, ThumbsUp, 
  BarChart3, Map, Monitor, Info, ChevronRight, Star, Share2, 
  ArrowUpCircle, ArrowDownCircle, PlusSquare, Phone, CheckSquare, 
  Loader2, AlertOctagon, HelpCircle, ShieldAlert, GitMerge, Link as LinkIcon,
  GitBranch, ArrowRight
} from 'lucide-react';
import { formatTime, DEPOT_DATA, BUS_STOPS_RAW } from '../utils';

// --- SKELETON: BUS DETAIL ---
export const BusDetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-100 rounded w-3/4"></div>
    <div className="h-32 bg-gray-100 rounded-xl"></div>
    <div className="h-20 bg-gray-100 rounded-xl"></div>
    <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>)}
    </div>
  </div>
);

// ==========================================
// 1. ROBUST TIME ALGORITHMS
// ==========================================

// Convert "10:30 PM" to minutes (0 - 1439)
const getMinutesFromTime = (timeStr) => {
    if (!timeStr || timeStr === 'TBD') return -1;
    try {
        let hours = 0, minutes = 0;
        const cleanStr = timeStr.toUpperCase().replace(/\./g, '').trim();
        if (cleanStr.includes('M')) { 
            const [time, modifier] = cleanStr.split(' ');
            let [h, m] = time.split(':');
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
        } else if (cleanStr.includes(':')) { 
            const [h, m] = cleanStr.split(':');
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
        }
        return (hours * 60) + minutes;
    } catch (e) { return -1; }
};

// Calculates minutes relative to Anchor Time. Handles Midnight Crossover.
const getEffectiveMinutes = (stopTime, originTime) => {
    const stopMin = getMinutesFromTime(stopTime);
    const originMin = getMinutesFromTime(originTime);
    if (stopMin === -1 || originMin === -1) return stopMin;
    if (stopMin < originMin) return stopMin + 1440; 
    return stopMin;
};

// Returns circular time difference (e.g. 23:55 to 00:05 is 10 mins)
const getCircularTimeDiff = (timeA, timeB) => {
    const minA = getMinutesFromTime(timeA);
    const minB = getMinutesFromTime(timeB);
    if (minA === -1 || minB === -1) return 9999;
    const diff = Math.abs(minA - minB);
    return Math.min(diff, 1440 - diff);
};

const normalizeStr = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

const to24Hour = (time12h) => {
    if (!time12h || time12h === "TBD") return "";
    if (!time12h.includes("M")) return time12h;
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const generateDefaultStops = (bus) => {
    return [
        { name: bus.from || "Origin", time: bus.time || "00:00 AM" },
        { name: bus.to || "Destination", time: bus.endTime || "00:00 AM" }
    ];
};

// ==========================================
// 6. ADD BUS FORM (ADVANCED ALGORITHM)
// ==========================================
export const AddBusForm = ({ onCancel, onAdd, showToast, existingBuses = [] }) => {
    const navigate = useNavigate();
    
    // --- STATE ---
    const [formData, setFormData] = useState({
        name: '', type: 'Private', from: '', to: '', time: '', endTime: '', distance: ''
    });
    const [intermediateStops, setIntermediateStops] = useState([]); 
    
    const [mode, setMode] = useState('full'); // 'full' | 'stop'
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- AUTO-MERGE & ORPHAN STATE ---
    const [detectedOrphans, setDetectedOrphans] = useState([]);
    const [mergedOrphans, setMergedOrphans] = useState(new Set()); 
    const [selectedParent, setSelectedParent] = useState(null); 

    // Modals
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [isStrictDuplicate, setIsStrictDuplicate] = useState(false);
    const [duplicateList, setDuplicateList] = useState([]);
    
    const [suggestions, setSuggestions] = useState({ from: [], to: [], stop: null });
    const [activeStopIndex, setActiveStopIndex] = useState(null); 
    const [nameMatches, setNameMatches] = useState([]); 

    // ---------------------------------------------------------
    // 🧠 1. AUTO-MERGE SCANNER (When creating FULL route)
    // ---------------------------------------------------------
    useEffect(() => {
        if (mode === 'full' && formData.name.length > 2 && formData.time) {
            const inputName = normalizeStr(formData.name);
            const inputStartMins = getMinutesFromTime(formatTime(formData.time));

            // Find "Skeleton" or "Partial" buses with same name
            const orphans = existingBuses.filter(b => {
                const isSkeleton = b.isSkeleton || (b.route && b.route.includes("(Partial)"));
                const nameMatch = normalizeStr(b.name).includes(inputName);
                if (!isSkeleton || !nameMatch) return false;

                // Time Check: Orphan time must be AFTER route start
                const orphanMins = getMinutesFromTime(b.time);
                let adjustedOrphan = orphanMins;
                if (orphanMins < inputStartMins) adjustedOrphan += 1440;

                const diff = adjustedOrphan - inputStartMins;
                return diff > 0 && diff < 600; // Orphan must be within 10 hours after start
            });

            setDetectedOrphans(orphans);
        } else {
            setDetectedOrphans([]);
        }
    }, [formData.name, formData.time, mode, existingBuses]);

    const handleAutoMerge = () => {
        if (detectedOrphans.length === 0) return;
        const newStops = [...intermediateStops];
        const newMergedSet = new Set(mergedOrphans);

        detectedOrphans.forEach(orphan => {
            if (newMergedSet.has(orphan.id)) return;
            const stopName = orphan.from;
            const stopTime = to24Hour(orphan.time);
            newStops.push({ name: stopName, time: stopTime });
            newMergedSet.add(orphan.id);
        });

        // Sort by time string roughly
        newStops.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        setIntermediateStops(newStops);
        setMergedOrphans(newMergedSet);
        showToast(`Merged ${detectedOrphans.length} orphan stop(s)!`, "success");
    };

    // ---------------------------------------------------------
    // 🧠 2. PARENT SCANNER (When adding STOP)
    // ---------------------------------------------------------
    const potentialParentBuses = useMemo(() => {
        if (mode === 'full' || !formData.time) return [];
        const inputMinutes = getMinutesFromTime(formatTime(formData.time));
        const inputNameRaw = normalizeStr(formData.name);
        if (inputMinutes === -1) return [];

        return existingBuses.filter(bus => {
            if (bus.isSkeleton) return false; // Don't attach to another skeleton
            const busStartMinutes = getMinutesFromTime(bus.time);
            
            // Name Filter (Loose)
            if (inputNameRaw.length > 0 && !normalizeStr(bus.name).includes(inputNameRaw)) return false;

            let adjustedInputMinutes = inputMinutes;
            if (inputMinutes < busStartMinutes) adjustedInputMinutes += 1440;

            const minutesSinceStart = adjustedInputMinutes - busStartMinutes;
            return minutesSinceStart > -15 && minutesSinceStart < 600; 
        }).sort((a, b) => getMinutesFromTime(a.time) - getMinutesFromTime(b.time)).slice(0, 5);
    }, [mode, formData.time, formData.name, existingBuses]);

    // ---------------------------------------------------------
    // 🧠 3. SWITCH MODE: "CONVERT TO PARENT"
    // ---------------------------------------------------------
    const handleConvertToMainRoute = () => {
        setMode('full');
        setFormData(prev => ({
            ...prev,
            from: prev.from, // Stop Name becomes Origin
            to: '', // Clear dest, ask user to fill it
            time: prev.time
        }));
        showToast("Switched to New Route. Please enter Destination.", "info");
    };

    // --- STANDARD HANDLERS ---
    const handleLocationChange = (e, field) => {
        const val = e.target.value;
        setFormData({ ...formData, [field]: val });
        if (val.length > 1) {
            const filtered = BUS_STOPS_RAW.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
            setSuggestions(prev => ({ ...prev, [field]: filtered }));
        } else {
            setSuggestions(prev => ({ ...prev, [field]: [] }));
        }
    };

    const selectSuggestion = (val, field) => {
        setFormData({ ...formData, [field]: val });
        setSuggestions(prev => ({ ...prev, [field]: [] }));
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, name: val });
        if (mode === 'full' && val.length > 2) {
            const matches = existingBuses.filter(b => normalizeStr(b.name).includes(normalizeStr(val)));
            setNameMatches(matches.slice(0, 5));
        } else {
            setNameMatches([]);
        }
    };

    const selectNameMatch = (busName) => {
        setFormData({ ...formData, name: busName });
        setNameMatches([]);
    };

    const addStopRow = () => setIntermediateStops([...intermediateStops, { name: '', time: '' }]);
    const removeStopRow = (index) => {
        const newStops = [...intermediateStops];
        newStops.splice(index, 1);
        setIntermediateStops(newStops);
    };

    const handleStopChange = (index, field, value) => {
        const newStops = [...intermediateStops];
        newStops[index][field] = value;
        setIntermediateStops(newStops);
        if (field === 'name') {
            setActiveStopIndex(index);
            if (value.length > 1) {
                const filtered = BUS_STOPS_RAW.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
                setSuggestions(prev => ({ ...prev, stop: filtered }));
            } else {
                setSuggestions(prev => ({ ...prev, stop: [] }));
            }
        }
    };

    const selectStopSuggestion = (val, index) => {
        const newStops = [...intermediateStops];
        newStops[index].name = val;
        setIntermediateStops(newStops);
        setSuggestions(prev => ({ ...prev, stop: [] }));
        setActiveStopIndex(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if(!formData.from || !formData.time || (mode === 'full' && !formData.to)) {
            showToast("Please fill all required fields", "info");
            return;
        }

        // DUPLICATE CHECK
        if (mode === 'full' || selectedParent) {
            const inputName = normalizeStr(formData.name);
            const inputFrom = normalizeStr(formData.from);
            
            const strictMatches = [];
            const softMatches = [];

            existingBuses.forEach(bus => {
                const timeDiff = getCircularTimeDiff(bus.time, formData.time);
                const busFrom = normalizeStr(bus.from);
                const busName = normalizeStr(bus.name);

                if (busName === inputName && busFrom === inputFrom && timeDiff <= 5) {
                    strictMatches.push(bus);
                }
                else if (timeDiff <= 15 && busFrom === inputFrom) { 
                    softMatches.push(bus);
                }
            });

            if (strictMatches.length > 0) {
                setDuplicateList(strictMatches);
                setIsStrictDuplicate(true);
                setShowDuplicateWarning(true);
                return;
            }

            if (softMatches.length > 0) {
                setDuplicateList(softMatches);
                setIsStrictDuplicate(false);
                setShowDuplicateWarning(true);
                return;
            }
        }

        setShowConfirmModal(true);
    };

    const confirmAndSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        
        const displayTime = formatTime(formData.time);
        
        // --- CASE: ORPHAN CREATION ---
        const isSkeleton = mode === 'stop' && !selectedParent;
        
        const destTime = formData.endTime ? formatTime(formData.endTime) : (isSkeleton ? 'TBD' : '00:00 AM');
        const route = isSkeleton ? `${formData.from} (Partial Route)` : `${formData.from} - ${formData.to}`;
        
        const formattedIntermediate = intermediateStops
            .filter(s => s.name.trim() !== '')
            .map(s => ({ name: s.name, time: s.time ? formatTime(s.time) : 'TBD' }));
        
        let initialStops = [];
        if (isSkeleton) {
            initialStops = [{ name: formData.from, time: displayTime }];
        } else {
            initialStops = [{ name: formData.from, time: displayTime }, ...formattedIntermediate, { name: formData.to, time: destTime }];
        }

        initialStops.sort((a, b) => {
            const minA = getEffectiveMinutes(a.time, displayTime);
            const minB = getEffectiveMinutes(b.time, displayTime);
            return minA - minB;
        });

        const stopsString = initialStops.map(s => s.name).join(', ');

        onAdd({ 
            ...formData, 
            to: isSkeleton ? '(Unknown)' : formData.to, 
            time: displayTime, route, stops: stopsString, 
            votes: 0, comments: [], detailedStops: initialStops, 
            status: 'On Time', crowd: 'Low',
            isSkeleton: isSkeleton
        });
    };

    const getSlug = (bus) => {
        const clean = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '-') : '';
        const timeClean = bus.time ? bus.time.toLowerCase().replace(' ', '-').replace(':', '') : '0000';
        return `${clean(bus.from)}-to-${clean(bus.to)}-${timeClean}-${clean(bus.type)}`;
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-2xl mx-auto relative">
            
            {/* DUPLICATE WARNING MODAL */}
            {showDuplicateWarning && (
                 <div className="absolute inset-0 bg-white/95 z-50 rounded-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <div className={`p-3 rounded-full mb-3 ${isStrictDuplicate ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isStrictDuplicate ? <ShieldAlert size={32} /> : <HelpCircle size={32} />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {isStrictDuplicate ? "Spam Restriction" : "Similar Bus Found"}
                    </h3>
                    <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto leading-relaxed">
                        {isStrictDuplicate 
                            ? "This record already exists."
                            : <span>We found buses at <strong>{formData.from}</strong> around <strong>{formatTime(formData.time)}</strong>. Is it one of these?</span>
                        }
                    </p>
                    <div className="w-full max-w-sm max-h-48 overflow-y-auto border border-gray-200 rounded-lg mb-4 bg-gray-50 text-left">
                        {duplicateList.map((bus, idx) => (
                            <div key={idx} className="p-3 border-b border-gray-200 last:border-0 bg-white flex justify-between items-center group hover:bg-teal-50 transition-colors">
                                <div>
                                    <div className="font-bold text-sm text-gray-800">{bus.name || "Bus Service"}</div>
                                    <div className="text-[10px] text-gray-500">{bus.route}</div>
                                </div>
                                <button onClick={() => navigate(`/bus/${getSlug(bus)}`)} className="bg-teal-100 text-teal-700 p-2 rounded-lg hover:bg-teal-200 font-bold text-[10px]">Open</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 w-full max-w-xs">
                        <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-200">Cancel</button>
                        {!isStrictDuplicate && <button onClick={() => { setShowDuplicateWarning(false); setShowConfirmModal(true); }} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-lg text-xs shadow-sm">Create Anyway</button>}
                    </div>
                 </div>
            )}

            {/* CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="absolute inset-0 bg-white/95 z-50 rounded-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <div className="bg-teal-50 p-4 rounded-full text-teal-600 mb-4">
                        <AlertOctagon size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {mode === 'stop' && !selectedParent ? "Create Orphan Entry?" : "Verify Information"}
                    </h3>
                    <p className="text-xs text-gray-600 mb-6 max-w-xs leading-relaxed">
                        {mode === 'stop' && !selectedParent 
                            ? <span>No parent bus selected. This will create a <strong>Partial Record</strong>. It will be <strong>automatically merged</strong> when the main bus is added later.</span>
                            : <span>Please confirm that <strong>{formData.from}</strong> to <strong>{formData.to}</strong> at <strong>{formatTime(formData.time)}</strong> is accurate.</span>
                        }
                    </p>
                    <div className="flex gap-3 w-full max-w-xs">
                        <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-200">Go Back</button>
                        <button onClick={confirmAndSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-lg text-xs hover:bg-teal-700 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <CheckSquare size={14}/>} {mode === 'stop' && !selectedParent ? "Create Partial" : "Confirm & Post"}
                        </button>
                    </div>
                </div>
            )}

            {/* --- TOP TABS --- */}
            <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setMode('full')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'full' ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <PlusCircle size={14} /> New Main Route
                </button>
                <button onClick={() => setMode('stop')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'stop' ? 'bg-white text-indigo-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <GitMerge size={14} /> Add Intermediate Stop
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- SMART DISCOVERY FOR INTERMEDIATE STOPS (THE NEW ALGORITHM) --- */}
                {mode === 'stop' && (
                    <div className={`p-4 rounded-xl border mb-4 animate-fade-in ${potentialParentBuses.length > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'}`}>
                        <h4 className={`text-xs font-bold mb-2 flex items-center gap-2 ${potentialParentBuses.length > 0 ? 'text-indigo-900' : 'text-orange-800'}`}>
                            <HelpCircle size={14}/> {potentialParentBuses.length > 0 ? "Select Parent Bus" : "No Parent Bus Found"}
                        </h4>
                        
                        {potentialParentBuses.length > 0 ? (
                            <div className="space-y-2">
                                {potentialParentBuses.map((bus, i) => (
                                    <div key={i} className={`bg-white p-3 rounded-lg border shadow-sm flex justify-between items-center cursor-pointer transition-all ${selectedParent?.id === bus.id ? 'border-teal-500 ring-1 ring-teal-500' : 'border-indigo-100'}`} onClick={() => setSelectedParent(bus)}>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">{bus.name}</div>
                                            <div className="text-[10px] text-gray-500">{bus.route}</div>
                                            <div className="text-[10px] font-bold text-teal-600 mt-0.5">Start: {bus.time}</div>
                                        </div>
                                        {selectedParent?.id === bus.id && <CheckSquare size={16} className="text-teal-600"/>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-[10px] text-orange-800 leading-relaxed">
                                    We couldn't find a bus named <strong>"{formData.name}"</strong> passing <strong>{formData.from}</strong> around <strong>{formatTime(formData.time)}</strong>.
                                </p>
                                
                                <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-gray-600 mb-2">Is this actually the START of a new bus route?</p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={handleConvertToMainRoute} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-[10px] font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1">
                                            <GitBranch size={12}/> Yes, It's the Start
                                        </button>
                                        <button type="button" disabled className="flex-1 bg-orange-50 text-orange-400 py-2 rounded-lg text-[10px] font-bold border border-orange-100 cursor-default flex items-center justify-center gap-1">
                                            <ArrowRight size={12}/> No, It's a Stop
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-2 italic text-center">
                                        (If you choose "No", we'll save it as a partial stop and merge it later.)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- AUTO MERGE NOTIFICATION (FULL MODE) --- */}
                {mode === 'full' && detectedOrphans.length > 0 && (
                    <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 mb-4 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-xs font-bold text-teal-800 flex items-center gap-2">
                                    <LinkIcon size={14}/> Found {detectedOrphans.length} Orphan Stop(s)
                                </h4>
                                <p className="text-[10px] text-teal-600 mt-1">
                                    We found orphaned stops (e.g. {detectedOrphans[0].from}) that match this bus.
                                </p>
                            </div>
                            <button type="button" onClick={handleAutoMerge} disabled={mergedOrphans.size > 0} className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-teal-700 disabled:opacity-50">
                                {mergedOrphans.size > 0 ? "Merged!" : "Auto-Merge"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{mode === 'full' ? 'From *' : 'Stop Name *'}</label>
                        <input className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" placeholder={mode === 'full' ? "Origin" : "Where is the stop?"} value={formData.from} onChange={e => handleLocationChange(e, 'from')} required />
                        {suggestions.from.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-40 overflow-y-auto">
                                {suggestions.from.map((s,i) => (
                                    <div key={i} onClick={() => selectSuggestion(s, 'from')} className="p-2 hover:bg-teal-50 text-xs cursor-pointer">{s}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {mode === 'full' && (
                        <div className="relative">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">To *</label>
                            <input className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" placeholder="Destination" value={formData.to} onChange={e => handleLocationChange(e, 'to')} required />
                            {suggestions.to.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-40 overflow-y-auto">
                                    {suggestions.to.map((s,i) => (
                                        <div key={i} onClick={() => selectSuggestion(s, 'to')} className="p-2 hover:bg-teal-50 text-xs cursor-pointer">{s}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{mode === 'full' ? 'Start Time *' : 'Stop Time *'}</label>
                        <input type="time" className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" onChange={e => setFormData({...formData, time: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">End Time (Opt)</label>
                        <input type="time" className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Bus Type</label>
                        <select className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none bg-white" onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="Private">Private Bus</option>
                            <option value="KSRTC">KSRTC</option>
                            <option value="Swift">KSRTC Swift</option>
                        </select>
                    </div>
                </div>
                
                {mode === 'full' && (
                    <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Distance (KM) <span className="text-gray-400 font-normal normal-case">(For Fare)</span></label>
                          <input type="number" className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" placeholder="e.g. 45" onChange={e => setFormData({...formData, distance: e.target.value})} />
                    </div>
                )}
                
                {/* BUS NAME FIELD */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Bus Name (Optional)</label>
                    <input 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" 
                        placeholder={mode === 'stop' ? "Filter by Bus Name..." : "e.g. Sreehari Motors"} 
                        value={formData.name}
                        onChange={handleNameChange} 
                    />
                    
                    {nameMatches.length > 0 && mode === 'full' && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-40 overflow-y-auto">
                            <div className="p-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200 sticky top-0">Existing Buses</div>
                            {nameMatches.map((bus, idx) => (
                                <div key={idx} className="p-2 hover:bg-teal-50 border-b border-gray-50 last:border-0 cursor-pointer group" onClick={() => selectNameMatch(bus.name)}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">{bus.name}</div>
                                            <div className="text-[10px] text-gray-500">{bus.route}</div>
                                        </div>
                                        <div className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{bus.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* DYNAMIC STOPS LIST */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Intermediate Stops & Times</label>
                    <div className="space-y-2 mb-3">
                        {intermediateStops.map((stop, index) => (
                            <div key={index} className="flex gap-2 relative">
                                <div className="flex-1 relative">
                                    <input 
                                        className="w-full p-2 border border-gray-200 rounded text-xs focus:border-teal-500 outline-none"
                                        placeholder="Stop Name"
                                        value={stop.name}
                                        onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                                    />
                                    {activeStopIndex === index && suggestions.stop && suggestions.stop.length > 0 && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-32 overflow-y-auto">
                                            {suggestions.stop.map((s, i) => (
                                                <div key={i} onClick={() => selectStopSuggestion(s, index)} className="p-2 hover:bg-teal-50 text-xs cursor-pointer">{s}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="time" 
                                    className="w-24 p-2 border border-gray-200 rounded text-xs focus:border-teal-500 outline-none"
                                    value={stop.time}
                                    onChange={(e) => handleStopChange(index, 'time', e.target.value)}
                                />
                                <button type="button" onClick={() => removeStopRow(index)} className="text-red-400 hover:bg-red-50 p-2 rounded"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addStopRow} className="w-full py-2 bg-white border border-dashed border-teal-300 text-teal-600 rounded-lg text-xs font-bold hover:bg-teal-50 flex items-center justify-center gap-1">
                        <PlusCircle size={14}/> Add Stop
                    </button>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors">Cancel</button>
                    <button 
                        type="submit" 
                        className={`flex-1 px-5 py-2.5 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${mode === 'full' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        disabled={isSubmitting}
                    >
                         {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : (mode === 'full' ? <CheckSquare size={14}/> : <GitMerge size={14}/>)}
                         {mode === 'full' ? " Create Route" : " Create New Entry"}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ==========================================
// 7. BUS POST COMPONENT (FULL)
// ==========================================
export const BusPost = ({ bus, onBack, addComment, updateBusDetails, onVote, reportLate, updateCrowd, toggleFavorite, isFavorite, showToast }) => {
  const navigate = useNavigate();

  if (!bus) return <BusDetailSkeleton />;

  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  
  // --- SELF-HEALING DATA LOGIC ---
  const displayStops = (bus.detailedStops && bus.detailedStops.length > 0) 
      ? bus.detailedStops 
      : generateDefaultStops(bus);
  
  // --- ALGORITHM: SORT STOPS ---
  const sortedDisplayStops = useMemo(() => {
      const stops = [...displayStops];
      const originTime = bus.time; 

      return stops.sort((a, b) => {
          const minA = getEffectiveMinutes(a.time, originTime);
          const minB = getEffectiveMinutes(b.time, originTime);
          return minA - minB;
      });
  }, [displayStops, bus.time]);

  const stopsToRender = sortedDisplayStops; 

  // Edit States
  const [editName, setEditName] = useState(bus.name);
  const [editRoute, setEditRoute] = useState(bus.route);
  const [editTime, setEditTime] = useState(bus.time); 
  const [editType, setEditType] = useState(bus.type);
  const [editDesc, setEditDesc] = useState(bus.description);
  
  const [newStopName, setNewStopName] = useState("");
  const [newStopTime, setNewStopTime] = useState("");

  const findDepot = (location) => {
      if(!location) return null;
      const loc = location.toLowerCase();
      for(const district of DEPOT_DATA) {
          for(const depot of district.depots) {
              if(loc.includes(depot.name.toLowerCase()) || depot.name.toLowerCase().includes(loc)) {
                  return depot;
              }
          }
      }
      return null;
  };

  const isKSRTC = bus.type === 'KSRTC' || bus.type === 'Swift';
  const originDepot = isKSRTC ? findDepot(bus.from) : null;
  const destDepot = isKSRTC ? findDepot(bus.to) : null;

  const updateRouteNameFromStops = (stops) => {
      if (stops && stops.length > 0) {
          const start = stops[0].name;
          const end = stops[stops.length - 1].name;
          setEditRoute(`${start} - ${end}`); 
      }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `*${bus.name}* (${bus.type})
Route: ${bus.route}
Time: ${bus.time}

Check stops, live crowd status & updates here:
${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if(!newComment.trim() || !userName.trim()) return;
    addComment(bus.id, { 
      user: userName, 
      text: newComment, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toDateString() 
    });
    setNewComment("");
  };

  const handleSaveDetails = () => {
      const displayTime = editTime.includes(":") && !editTime.includes("M") ? formatTime(editTime) : editTime;
      const stopsToSave = (bus.detailedStops && bus.detailedStops.length > 0) ? bus.detailedStops : displayStops;
      
      stopsToSave.sort((a, b) => {
          const minA = getEffectiveMinutes(a.time, displayTime);
          const minB = getEffectiveMinutes(b.time, displayTime);
          return minA - minB;
      });

      updateBusDetails(bus.id, {
          name: editName,
          route: editRoute,
          time: displayTime,
          type: editType,
          description: editDesc,
          detailedStops: stopsToSave
      });
      setIsEditing(false);
  };

  const handleAddStop = (position) => {
      if(!newStopName) return;
      const stopDisplayTime = newStopTime ? formatTime(newStopTime) : "TBD"; 
      
      let updatedStops = [...displayStops];
      const newStop = { name: newStopName, time: stopDisplayTime };

      if (position === 'start') {
          updatedStops.unshift(newStop);
      } else if (position === 'end') {
          updatedStops.push(newStop);
      } else {
          updatedStops.push(newStop);
      }

      updatedStops.sort((a, b) => {
          const minA = getEffectiveMinutes(a.time, bus.time);
          const minB = getEffectiveMinutes(b.time, bus.time);
          return minA - minB;
      });

      const stopsString = updatedStops.map(s => s.name).join(', ');
      
      let newRouteName = bus.route;
      if (updatedStops.length > 0) {
          newRouteName = `${updatedStops[0].name} - ${updatedStops[updatedStops.length - 1].name}`;
      }

      updateBusDetails(bus.id, {
          detailedStops: updatedStops,
          stops: stopsString,
          route: newRouteName
      });
      setNewStopName("");
      setNewStopTime("");
  };

  const handleEditStop = (index, field, value) => {
      const updatedStops = [...displayStops];
      let finalValue = value;
      if (field === 'time' && value.includes(':') && !value.includes('M') && !value.includes('T')) {
           finalValue = formatTime(value);
      }
      updatedStops[index] = { ...updatedStops[index], [field]: finalValue };
      
      const stopsString = updatedStops.map(s => s.name).join(', ');
      
      if (field === 'name' && (index === 0 || index === updatedStops.length - 1)) {
          updateRouteNameFromStops(updatedStops);
      }

      updateBusDetails(bus.id, {
          detailedStops: updatedStops,
          stops: stopsString
      });
  };

  const handleDeleteStop = (index) => {
      const updatedStops = [...displayStops];
      updatedStops.splice(index, 1);
      const stopsString = updatedStops.map(s => s.name).join(', ');
      
      updateRouteNameFromStops(updatedStops);

      updateBusDetails(bus.id, {
          detailedStops: updatedStops,
          stops: stopsString
      });
  };

  return (
    <div className="animate-fade-in pb-8">
      
      {/* FULLSCREEN MAP OVERLAY */}
      {showFullMap && (
        <div className="fixed inset-0 z-[100] bg-white animate-fade-in flex flex-col">
            <div className="bg-teal-700 text-white px-4 py-3 flex justify-between items-center shadow-md">
                <div>
                    <h2 className="text-base font-bold">Route: {bus.route}</h2>
                    <p className="text-xs opacity-80">{bus.name} | {bus.time}</p>
                </div>
                <button onClick={() => setShowFullMap(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-2 bg-gray-50 p-3 border-b border-gray-200">
                        <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Stop Name</span>
                        <span className="font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Time</span>
                    </div>
                    {stopsToRender.map((stop, i) => {
                        const isStart = i === 0;
                        const isEnd = i === stopsToRender.length - 1;
                        return (
                        <div key={i} className="grid grid-cols-2 p-4 border-b border-gray-50 last:border-0 hover:bg-teal-50/50 transition-colors items-center group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${isStart ? 'bg-teal-600 text-white' : isEnd ? 'bg-indigo-600 text-white' : 'bg-teal-100 text-teal-700'}`}>
                                    {i + 1}
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-sm font-bold text-gray-800 truncate">{stop.name}</span>
                                    {isStart && <span className="text-[9px] font-black text-teal-600 uppercase tracking-wide">ORIGIN</span>}
                                    {isEnd && <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide">DESTINATION</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100">{stop.time}</span>
                            </div>
                        </div>
                    )})}
                </div>
                <div className="text-center mt-6">
                    <button onClick={() => setShowFullMap(false)} className="bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* Back Button */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center text-teal-700 font-bold text-xs cursor-pointer sticky top-0 z-20 shadow-sm hover:bg-gray-50 transition-colors" onClick={onBack}>
        <ChevronRight className="rotate-180 mr-1.5" size={16} /> Back to Results
      </div>
      
      <div className="p-0 md:p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5 mt-4 md:mt-0 relative">
            
            {/* Edit & Favorite Buttons */}
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => toggleFavorite(bus)} className={`p-2 rounded-lg border transition-all shadow-sm flex items-center gap-1.5 ${isFavorite ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-200 text-gray-500 hover:text-yellow-500 hover:border-yellow-200'}`}>
                    <Star size={14} className={isFavorite ? "fill-yellow-500" : ""} />
                    <span className="text-[10px] font-bold uppercase">{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-teal-700 flex items-center gap-1.5 text-[10px] uppercase font-bold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 transition-all">
                        <Edit3 size={14} /> Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                /* EDIT FORM */
                <div className="space-y-4">
                    <h3 className="font-bold text-base text-gray-800 border-b pb-3">Edit Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Route (Auto)</label>
                            <input className="w-full p-2.5 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 cursor-not-allowed" value={editRoute} readOnly />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Time</label>
                            <input 
                                type="time" 
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" 
                                value={to24Hour(editTime)}
                                onChange={e => setEditTime(e.target.value)} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Name</label>
                            <input className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Type</label>
                            <select className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none bg-white" value={editType} onChange={e => setEditType(e.target.value)}>
                                <option value="KSRTC">KSRTC</option>
                                <option value="Private">Private</option>
                                <option value="Swift">Swift</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* MANAGE STOPS */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-3">Stops & Route Order</label>
                        <div className="mb-3 space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                            {displayStops.map((stop, i) => {
                                const isStart = i === 0;
                                const isEnd = i === displayStops.length - 1;
                                return (
                                <div key={i} className={`flex gap-2 items-center bg-white p-2 border rounded-md shadow-sm ${isStart ? 'border-teal-300 bg-teal-50/30' : isEnd ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
                                    <div className="min-w-[20px] flex justify-center">
                                         {isStart && <span className="text-[9px] font-black text-teal-600 uppercase rotate-180 writing-vertical-lr">ORIGIN</span>}
                                         {isEnd && <span className="text-[9px] font-black text-indigo-600 uppercase rotate-180 writing-vertical-lr">DEST</span>}
                                         {!isStart && !isEnd && <span className="text-gray-300 text-[10px] font-bold">{i+1}</span>}
                                    </div>
                                    <input 
                                        className="flex-1 p-1 border-b border-transparent focus:border-teal-500 focus:outline-none text-xs font-medium text-gray-700 bg-transparent" 
                                        value={stop.name} 
                                        onChange={(e) => handleEditStop(i, 'name', e.target.value)}
                                    />
                                    <div className="flex items-center gap-1 border-l pl-2">
                                        <Clock size={10} className="text-gray-400"/>
                                        <input 
                                            type="time" 
                                            className="w-20 p-1 border-b border-transparent focus:border-teal-500 focus:outline-none text-right text-[10px] text-gray-500 bg-transparent" 
                                            value={to24Hour(stop.time)} 
                                            onChange={(e) => handleEditStop(i, 'time', e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => handleDeleteStop(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={14}/></button>
                                </div>
                            )})}
                        </div>

                        {/* Add New Stop (Edit Mode) */}
                        <div className="pt-3 border-t border-slate-200">
                            <div className="flex gap-2 mb-2">
                                <input className="flex-1 p-2 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" placeholder="New Stop Name" value={newStopName} onChange={e => setNewStopName(e.target.value)} />
                                <input type="time" className="w-24 p-2 border border-gray-200 rounded-lg text-xs focus:border-teal-500 outline-none" value={newStopTime} onChange={e => setNewStopTime(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAddStop('start')} className="flex-1 bg-teal-100 text-teal-700 py-2 rounded-lg text-[10px] font-bold hover:bg-teal-200 flex items-center justify-center gap-1 border border-teal-200 transition-colors">
                                    <ArrowUpCircle size={12}/> Set Start
                                </button>
                                <button onClick={() => handleAddStop('intermediate')} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-[10px] font-bold hover:bg-gray-200 flex items-center justify-center gap-1 border border-gray-200 transition-colors">
                                    <PlusSquare size={12}/> Add Stop
                                </button>
                                <button onClick={() => handleAddStop('end')} className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-lg text-[10px] font-bold hover:bg-indigo-200 flex items-center justify-center gap-1 border border-indigo-200 transition-colors">
                                    <ArrowDownCircle size={12}/> Set End
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button onClick={handleSaveDetails} className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"><Save size={14}/> Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="bg-white text-gray-600 px-5 py-2.5 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                </div>
            ) : (
                /* VIEW MODE */
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-5 gap-3">
                        <div className="w-full">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-800 leading-tight mb-2 truncate">{bus.name || "Bus Service"}</h1>
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-lg md:text-xl text-gray-700 font-bold truncate max-w-full">{bus.route}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${bus.type === 'KSRTC' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {bus.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-100 flex flex-col sm:flex-row gap-6 mb-6 shadow-sm">
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <Clock size={32} className="text-teal-600 shrink-0" />
                                <div>
                                    <span className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-none">{bus.time}</span>
                                    <p className="text-xs text-teal-800 font-bold mt-1 uppercase tracking-wide">Scheduled Departure</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={() => onVote(bus.id)} className="flex-1 sm:flex-none flex flex-col items-center justify-center gap-1 bg-white px-5 py-3 rounded-xl border border-teal-100 text-teal-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm group min-w-[80px]">
                                <ThumbsUp size={20} className={`mb-0.5 transition-transform group-hover:scale-110 ${bus.votes > 0 ? "fill-teal-100 group-hover:fill-white/20" : ""}`} />
                                <span className="text-xs font-bold">{bus.votes || 0} Votes</span>
                            </button>
                            
                             {/* Crowd */}
                             <div className="flex-1 sm:flex-none bg-white p-3 rounded-xl border border-teal-100 shadow-sm flex flex-col justify-center">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center justify-center gap-1"><BarChart3 size={12}/> Crowd</div>
                                <div className="flex gap-1.5 justify-center">
                                    <button onClick={() => updateCrowd(bus.id, "Low")} className={`w-9 py-1.5 rounded-lg text-xs font-bold transition-colors ${bus.crowdLevel === 'Low' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>L</button>
                                    <button onClick={() => updateCrowd(bus.id, "Medium")} className={`w-9 py-1.5 rounded-lg text-xs font-bold transition-colors ${bus.crowdLevel === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>M</button>
                                    <button onClick={() => updateCrowd(bus.id, "High")} className={`w-9 py-1.5 rounded-lg text-xs font-bold transition-colors ${bus.crowdLevel === 'High' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>H</button>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* STATUS ALERT */}
                    {bus.status === 'Late' && bus.statusDate === new Date().toDateString() && (
                        <div className="mb-6 bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 flex items-start gap-3 shadow-sm">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-xs">Reported Late Today</h4>
                                <p className="text-[10px] opacity-80 mt-0.5">Delays reported by users.</p>
                            </div>
                        </div>
                    )}

                    {/* TIMELINE */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2"><Map size={14} className="text-gray-400"/> Schedule</h4>
                            {stopsToRender.length > 0 && (
                                <button onClick={() => setShowFullMap(true)} className="text-teal-600 font-bold text-[10px] flex items-center gap-1 hover:bg-teal-50 px-2 py-1 rounded transition-colors">
                                    <Maximize2 size={12}/> Full Map
                                </button>
                            )}
                        </div>
                        <div className="relative border-l-2 border-teal-100 ml-3 space-y-6 pb-2">
                            {/* USING SORTED STOPS HERE */}
                            {stopsToRender.map((stop, i) => {
                                const isStart = i === 0;
                                const isEnd = i === stopsToRender.length - 1;
                                return (
                                <div key={i} className="ml-6 relative group">
                                    <span className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-[3px] shadow-sm group-hover:scale-110 transition-transform ${isStart ? 'bg-teal-500 border-teal-200' : isEnd ? 'bg-indigo-500 border-indigo-200' : 'bg-white border-teal-500'}`}></span>
                                    <div 
                                        className="flex justify-between items-start p-3 -mt-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer gap-3"
                                        onClick={() => navigate(`/board/${encodeURIComponent(stop.name)}`)}
                                    >
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-lg font-bold text-gray-900 break-words leading-tight hover:text-teal-700 transition-colors pr-2">{stop.name}</span>
                                            {isStart && <span className="text-xs font-black text-teal-600 uppercase tracking-wide mt-0.5">ORIGIN</span>}
                                            {isEnd && <span className="text-xs font-black text-indigo-600 uppercase tracking-wide mt-0.5">DESTINATION</span>}
                                        </div>
                                        <div className="shrink-0 pt-0.5">
                                            <span className="text-sm font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded border border-teal-100 whitespace-nowrap block text-center">{stop.time}</span>
                                        </div>
                                    </div>
                                </div>
                            )})}
                            
                            {/* Inline Add Stop (Position Controls) */}
                            <div className="ml-6 relative group pt-2">
                                <span className="absolute -left-[31px] top-4 w-3 h-3 bg-gray-200 rounded-full border-[3px] border-white shadow-sm"></span>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 border-dashed flex flex-col gap-2">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Add Missing Stop</p>
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 p-2 border border-gray-200 rounded-md text-xs focus:border-teal-500 outline-none" 
                                            placeholder="Stop Name" 
                                            value={newStopName} 
                                            onChange={e => setNewStopName(e.target.value)} 
                                        />
                                        <input 
                                            type="time" 
                                            className="w-20 p-2 border border-gray-200 rounded-md text-xs focus:border-teal-500 outline-none" 
                                            value={newStopTime} 
                                            onChange={e => setNewStopTime(e.target.value)} 
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAddStop('start')} title="Set as Origin" className="flex-1 bg-white border border-gray-200 text-teal-600 py-1.5 rounded-md text-[10px] font-bold hover:bg-teal-50 hover:border-teal-200 flex items-center justify-center gap-1 transition-colors">
                                            <ArrowUpCircle size={12}/> Start
                                        </button>
                                        <button onClick={() => handleAddStop('intermediate')} title="Add Stop" className="flex-1 bg-teal-600 text-white py-1.5 rounded-md text-[10px] font-bold hover:bg-teal-700 flex items-center justify-center gap-1 shadow-sm transition-colors">
                                            <PlusSquare size={12}/> Add
                                        </button>
                                        <button onClick={() => handleAddStop('end')} title="Set as Destination" className="flex-1 bg-white border border-gray-200 text-indigo-600 py-1.5 rounded-md text-[10px] font-bold hover:bg-indigo-200 flex items-center justify-center gap-1 border border-indigo-200 transition-colors">
                                            <ArrowDownCircle size={12}/> End
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KSRTC DEPOT HELP INFO */}
                    {(originDepot || destDepot) && (
                        <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            <h4 className="font-bold text-blue-900 text-xs uppercase mb-3 flex items-center gap-2">
                                <Phone size={14}/> KSRTC Depot Enquiry
                            </h4>
                            <div className="flex flex-col gap-3">
                                {originDepot && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 font-medium">Start: <span className="font-bold text-gray-800">{originDepot.name}</span></span>
                                        <a href={`tel:${originDepot.phone}`} className="flex items-center gap-1 font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                                            <Phone size={10} /> {originDepot.phone}
                                        </a>
                                    </div>
                                )}
                                {destDepot && destDepot.name !== originDepot?.name && (
                                    <div className="flex justify-between items-center text-xs border-t border-blue-100 pt-3">
                                        <span className="text-gray-600 font-medium">End: <span className="font-bold text-gray-800">{destDepot.name}</span></span>
                                        <a href={`tel:${destDepot.phone}`} className="flex items-center gap-1 font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                                            <Phone size={10} /> {destDepot.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Real-time Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-xl mb-6 shadow-md flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-sm flex items-center gap-2"><Map size={16}/> Live Tracking</h4>
                            <p className="text-[10px] opacity-90">Track at major stations.</p>
                        </div>
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Monitor size={18} />
                        </div>
                    </div>

                    {/* OVERVIEW */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 text-xs text-gray-600 leading-relaxed shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide"><Info size={14} className="text-blue-500"/> Overview</h4>
                        <p>
                            This <strong>{bus.type}</strong> bus service, known as <em>{bus.name}</em>, departs at <strong>{bus.time}</strong>. 
                            It operates on the <strong>{bus.route}</strong> route. 
                            {bus.stops ? `Major stops include ${bus.stops}. ` : ''} 
                            Passengers looking for reliable travel between these destinations can choose this service for a comfortable journey.
                        </p>
                        {bus.description && <p className="mt-3 text-[10px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">Operator Note: {bus.description}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                        {/* GENERATED WHATSAPP SHARE */}
                        <button onClick={handleShare} className="bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-green-600 transition-colors shadow-sm text-xs">
                            <Share2 size={16} /> Share Link
                        </button>
                        <button onClick={() => reportLate(bus.id)} className="bg-amber-50 text-amber-700 border border-amber-100 py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors text-xs">
                            <AlertTriangle size={16} /> Report Late
                        </button>
                    </div>
                </>
            )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-teal-50 p-1.5 rounded-lg text-teal-600"><MessageSquare size={16} /></div>
            Live Updates
          </h3>

          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Post Update</h4>
            <form onSubmit={handleCommentSubmit}>
              <input 
                type="text" 
                placeholder="Name (Opt)"
                className="w-full mb-2 p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-teal-500 bg-white"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <textarea 
                placeholder="Bus late? Changed route? Share info..."
                className="w-full mb-3 p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-teal-500 h-16 resize-none bg-white"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button type="submit" className="w-full bg-teal-700 text-white font-bold py-2.5 rounded-lg hover:bg-teal-800 transition text-xs shadow-sm">
                Post
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {bus.comments && bus.comments.filter(c => c.date === new Date().toDateString()).length > 0 ? (
              bus.comments
                  .filter(c => c.date === new Date().toDateString())
                  .slice().reverse().map((comment, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                    {comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h5 className="font-bold text-gray-900 text-xs truncate">{comment.user || "User"}</h5>
                      <span className="text-[9px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{comment.time}</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed break-words">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs mb-1">No updates today.</p>
                  <p className="text-[10px] text-gray-300">Help others by posting!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ); 
};