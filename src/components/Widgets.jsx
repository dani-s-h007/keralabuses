import React, { useState, useEffect } from 'react';
import { 
  Trophy, MessageCircle, Star, Phone, Heart, Shield, HelpCircle, 
  Ticket, PlusCircle
} from 'lucide-react';
import { calculateFare } from '../utils';

// --- ASSET IMPORTS ---
import busImg1 from '../assets/bus/keralabuses.png';
import busImg2 from '../assets/bus/keralabuses_ksrtc.png';
import busImg3 from '../assets/bus/keralabuses_private_bus.png';
import busImg4 from '../assets/bus/keralabuses_ksrtc_volvo.png';

// 0.1 IMAGE CAROUSEL
export const ImageCarousel = () => {
  const images = [busImg1, busImg2, busImg3, busImg4];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-36 md:h-52 rounded-xl overflow-hidden mb-5 shadow-sm group bg-gray-200">
       {images.map((img, index) => (
         <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
           <img src={img} alt="Kerala Bus" className="w-full h-full object-cover" />
         </div>
       ))}
       {/* Overlay Gradient */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
       <div className="absolute bottom-4 left-4 text-white max-w-lg z-10">
          <h2 className="text-xl font-bold mb-0.5 drop-shadow-sm">Kerala Bus Timings & Live Status</h2>
          <p className="text-xs opacity-90 drop-shadow-sm font-medium">Search KSRTC, Swift & Private Bus Routes Instantly.</p>
       </div>
       {/* Dots */}
       <div className="absolute bottom-3 right-4 flex justify-center gap-1.5 z-10">
         {images.map((_, idx) => (
           <button 
             key={idx} 
             onClick={() => setCurrentIndex(idx)}
             className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} 
           />
         ))}
       </div>
    </div>
  );
};

// 2. SIDEBAR
export const Sidebar = ({ setView, onSeed, favorites, onSelectFavorite, points }) => {
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
        <div className="space-y-4">
            {/* User Stats / Gamification */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                         <Trophy size={18} />
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Your Contribution</h4>
                         <p className="text-[10px] text-teal-600 font-bold">Level: {level}</p>
                     </div>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2 mt-2 mb-1">
                     <div className="bg-yellow-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-[9px] text-gray-400 text-right">{points} / {nextLevel} Points</p>
            </div>

            {/* WhatsApp Widget */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageCircle size={60} className="text-green-600"/>
                </div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                    <div className="bg-green-500 text-white p-2 rounded-full shadow-md">
                        <MessageCircle size={16} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">Join Community</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed relative z-10">
                    Get live bus updates, strike alerts, and timing changes directly on WhatsApp.
                </p>
                <a href="https://chat.whatsapp.com/KhSr7LeSW503yXSGqJW8YZ" target="_blank" className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg shadow hover:bg-green-700 transition-all text-xs relative z-10">
                    <span>Join Group</span>
                </a>
            </div>

            {/* Saved/Favorite Buses */}
            {favorites && favorites.length > 0 && (
                 <div className="bg-white border border-yellow-200 bg-yellow-50/50 rounded-xl p-4 shadow-sm">
                    <h4 className="font-bold text-yellow-800 text-xs mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <Star size={14} className="fill-yellow-500 text-yellow-500"/> Saved Buses
                    </h4>
                    <div className="space-y-2">
                        {favorites.map(bus => (
                            <div key={bus.id} onClick={() => onSelectFavorite(bus)} className="bg-white p-2.5 rounded-lg border border-yellow-100 cursor-pointer hover:shadow-sm hover:border-yellow-300 transition-all text-xs group">
                                <div className="font-bold text-gray-800 group-hover:text-yellow-700 transition-colors truncate">{bus.route}</div>
                                <div className="text-gray-500 text-[10px] mt-0.5 flex justify-between">
                                    <span className="font-mono">{bus.time}</span>
                                    <span className="text-yellow-600 font-medium truncate max-w-[80px] text-right">{bus.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 text-xs mb-3 pb-2 border-b border-gray-50 flex items-center gap-2 uppercase tracking-wide">
                    <Phone size={14} className="text-teal-600"/> Emergency & Help
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: "Women", icon: Heart, color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-100", num: "1091" },
                        { label: "Police", icon: Shield, color: "text-blue-700", bg: "bg-blue-50 hover:bg-blue-100 border-blue-100", num: "100" },
                        { label: "Ambulance", icon: PlusCircle, color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-100", num: "108" },
                        { label: "Support", icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-100", num: "+918086616247" },
                    ].map((item, i) => (
                        <a key={i} href={item.num.includes('+') ? `tel:${item.num}` : `tel:${item.num}`} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all duration-200 ${item.bg} no-underline group`}>
                            <item.icon size={18} className={`${item.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 3. NEWS TICKER
export const NewsTicker = () => (
  <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-2.5 flex items-center gap-3 rounded-xl mb-5 shadow-sm overflow-hidden border border-teal-700/50">
    <span className="bg-amber-400 text-black px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm">
      LIVE UPDATES
    </span>
    <div className="flex-1 overflow-hidden relative h-4">
      <div className="absolute whitespace-nowrap animate-marquee font-medium text-xs tracking-wide top-0">
        New KSRTC Swift AC Services to Bangalore & Mysore • Private Bus Strike in Kozhikode withdrawn • Check updated monsoon timings for Idukki routes.
      </div>
    </div>
  </div>
);

// 4. FARE CALCULATOR
export const FareCalculator = () => {
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
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-full">
            <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wide flex items-center gap-2">
                <Ticket size={14} className="text-teal-600"/> Fare Calculator (Approx)
            </h4>
            <div className="flex gap-2 mb-3">
                <input 
                    type="number" 
                    placeholder="Enter KM" 
                    className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-teal-500 bg-gray-50 focus:bg-white transition-all"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                />
                <button onClick={calculate} className="bg-teal-700 text-white px-3 rounded-lg text-xs font-bold hover:bg-teal-800 shadow-sm">Check</button>
            </div>
            {result ? (
                <div className="bg-teal-50 p-3 rounded-lg text-xs space-y-1 text-teal-900 border border-teal-100">
                    <div className="flex justify-between border-b border-teal-100 pb-1"><span>Ordinary:</span> <span className="font-bold">₹{result.ord}</span></div>
                    <div className="flex justify-between pt-1"><span>Fast / Swift:</span> <span className="font-bold">₹{result.fast}</span></div>
                </div>
            ) : (
                <p className="text-[10px] text-gray-400 italic">Enter distance to see prices.</p>
            )}
        </div>
    );
};

// 5. SEO CONTENT
export const SeoContent = ({ onQuickSearch }) => (
    <div className="pb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-50">Kerala Bus Timings & Route Planner - KSRTC & Private</h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-2 mb-3">
                <p>
                    Find the most accurate and up-to-date <strong>Kerala Bus Timings</strong>. Whether you are looking for <strong>KSRTC Super Fast</strong>, <strong>Low Floor AC</strong>, <strong>Swift Deluxe</strong>, or <strong>Private Bus</strong> schedules, evidebus.in is your ultimate travel companion. We cover all major districts including Malappuram, Kozhikode, Wayanad, Palakkad, Thrissur, Ernakulam, and Thiruvananthapuram.
                </p>
                <p>
                    Plan your journey from <strong>Pandikkad to Perinthalmanna</strong>, <strong>Manjeri to Kozhikode</strong>, or any other route with our easy-to-use search engine. Get live updates, report delays, and contribute to the community.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {['KSRTC Timing', 'Private Bus Stand', 'Kerala Bus Route', 'Malappuram Bus', 'Kozhikode Bus', 'Swift Bus Time', 'Limited Stop', 'Ordinary Bus'].map(tag => (
                    <span key={tag} onClick={() => onQuickSearch(tag)} className="bg-gray-50 text-gray-600 text-[10px] px-3 py-1.5 rounded-full border border-gray-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 cursor-pointer transition-colors font-medium">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);