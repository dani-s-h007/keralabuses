import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // NEW IMPORT
import { 
  Bus, Menu, PlusSquare, ChevronRight, CheckCircle, AlertCircle, Info, 
  FileText, Lock, AlertTriangle, MapPin, Search 
} from 'lucide-react';
import { BUS_STOPS_RAW } from '../utils';

// --- SKELETON LOADING COMPONENT ---
export const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse">
    <div className="flex gap-4 items-center">
      <div className="bg-gray-100 rounded-xl w-[80px] h-[60px]"></div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-10"></div>
        </div>
        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
        <div className="flex gap-2 pt-1">
            <div className="h-5 bg-gray-100 rounded w-12"></div>
            <div className="h-5 bg-gray-100 rounded w-16"></div>
            <div className="h-5 bg-gray-100 rounded w-10"></div>
        </div>
      </div>
      <div className="w-5 h-5 bg-gray-100 rounded-full"></div>
    </div>
  </div>
);

// 0. TOAST NOTIFICATION COMPONENT
export const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-[90vw] sm:max-w-sm">
    {toasts.map((toast, index) => (
      <div 
        key={`${toast.id}-${index}`} 
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-slide-up ${toast.type === 'success' ? 'bg-teal-900 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}
      >
        {toast.type === 'success' ? <CheckCircle size={16} className="text-teal-400" /> : 
         toast.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} className="text-blue-500"/>}
        <span className="text-xs font-bold">{toast.message}</span>
      </div>
    ))}
  </div>
);

// 1. NAVBAR
export const Navbar = ({ toggleMenu }) => {
    const navigate = useNavigate();
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 items-center">
                    <div className="flex items-center cursor-pointer gap-2" onClick={() => navigate('/')}>
                        <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-1.5 rounded-lg text-white shadow-sm transform hover:scale-105 transition-transform">
                            <Bus size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-extrabold text-gray-800 tracking-tight leading-none">
                                evidebus<span className="text-teal-600">.com</span>
                            </span>
                            <span className="text-[9px] text-gray-500 font-bold tracking-wide uppercase">Community Network</span>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex space-x-1">
                        <button onClick={() => navigate('/')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all">Home</button>
                        <button onClick={() => navigate('/ksrtc')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all">KSRTC</button>
                        <button onClick={() => navigate('/private')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all">Private</button>
                        <a href="https://blog.evidebus.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all">Blog</a>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/add-bus')} className="bg-teal-600 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-teal-700 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 hidden sm:flex">
                            <PlusSquare size={14} /> <span className="hidden sm:inline">Add Bus</span>
                        </button>
                        <button className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={toggleMenu}>
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// 1.5 MOBILE MENU
export const MobileMenu = ({ isOpen, closeMenu }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden animate-fade-in">
            <div className="flex flex-col gap-3">
                <button onClick={() => { navigate('/'); closeMenu(); }} className="text-left text-sm font-bold text-gray-800 py-3 border-b border-gray-100">Home</button>
                <button onClick={() => { navigate('/ksrtc'); closeMenu(); }} className="text-left text-sm font-bold text-gray-800 py-3 border-b border-gray-100">KSRTC Timings</button>
                <button onClick={() => { navigate('/private'); closeMenu(); }} className="text-left text-sm font-bold text-gray-800 py-3 border-b border-gray-100">Private Stand</button>
                <button onClick={() => { navigate('/stands'); closeMenu(); }} className="text-left text-sm font-bold text-gray-800 py-3 border-b border-gray-100 flex items-center gap-2"><MapPin size={16}/> Bus Stands</button>
                <a href="https://blog.evidebus.com" className="text-left text-sm font-bold text-gray-800 py-3 border-b border-gray-100">Blog</a>
                <button onClick={() => { navigate('/add-bus'); closeMenu(); }} className="bg-teal-600 text-white py-3 rounded-xl font-bold mt-2 flex justify-center items-center gap-2 text-sm shadow-md">
                    <PlusSquare size={16} /> Add Bus
                </button>
            </div>
        </div>
    );
};

// 1.6 BUS STAND LIST PAGE
export const BusStandList = ({ onBack }) => {
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();
    const stops = [...new Set(BUS_STOPS_RAW)].sort().filter(s => s.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="animate-fade-in bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[60vh]">
            <button onClick={onBack} className="text-teal-600 font-bold text-xs flex items-center gap-1 mb-6 hover:underline">
                <ChevronRight className="rotate-180" size={14}/> Back to Home
            </button>
            
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Kerala Bus Stands</h1>
            <p className="text-xs text-gray-500 mb-6">Directory of all major bus stops. Click any station to view the live Digital Board.</p>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                <input 
                    type="text" 
                    placeholder="Search bus stand..." 
                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stops.length > 0 ? stops.map((stop, index) => (
                    <div 
                        key={index} 
                        onClick={() => navigate(`/board/${encodeURIComponent(stop)}`)}
                        className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg hover:border-teal-200 hover:shadow-sm transition-all group cursor-pointer"
                    >
                        <div className="bg-teal-50 text-teal-600 p-1.5 rounded-md group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            <MapPin size={12} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 truncate group-hover:text-teal-700">{stop}</span>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-10 text-gray-400 text-xs">No bus stands found matching "{filter}"</div>
                )}
            </div>
        </div>
    );
};

// 0.2 FOOTER PAGES COMPONENT
export const FooterPage = ({ type, onBack }) => {
    const content = {
        about: { 
            title: "About Us", 
            body: (
                <>
                    <p className="mb-3">evidebus.com is a pioneering community-driven platform dedicated to digitizing the public transport network of Kerala.</p>
                    <h4 className="font-bold text-sm text-gray-800 mt-4 mb-2">Our Mission</h4>
                    <p className="mb-3">To bridge the gap between passengers and bus schedules by providing a reliable, user-updated database of KSRTC and Private bus timings.</p>
                    <h4 className="font-bold text-sm text-gray-800 mt-4 mb-2">Who We Are</h4>
                    <p className="mb-3">We are a team of passionate developers and transport enthusiasts who believe that information should be accessible to everyone.</p>
                </>
            )
        },
        contact: { 
            title: "Contact Support", 
            body: (
                <>
                    <p className="mb-4">We value your feedback and are here to assist you with any queries.</p>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-teal-700 mb-1 text-xs uppercase">General Inquiries</h5>
                            <p className="text-xs">Email: <a href="mailto:dalsc.dev@gmail.com" className="text-blue-600 hover:underline">dalsc.dev@gmail.com</a></p>
                            <p className="text-xs">Phone: +91 80866 16247</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                            <h5 className="font-bold text-green-700 mb-1 text-xs uppercase">WhatsApp Support</h5>
                            <p className="text-xs">Join community: <span className="font-mono font-bold">+91 80866 16247</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-gray-700 mb-1 text-xs uppercase">Location</h5>
                            <p className="text-xs text-gray-600">Evidebus, Malappuram, Kerala</p>
                        </div>
                    </div>
                </>
            )
        },
        privacy: { 
            title: "Privacy Policy", 
            body: (
                <div className="space-y-4 text-xs leading-relaxed text-gray-600 text-justify">
                    <p>This privacy notice for <strong>evidebus</strong> ("we," "us," or "our") describes how and why we might collect, store, use, and/or share ("process") your information when you use our services ("Services").</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Visit our website at <a href="https://evidebus.com" className="text-blue-600 hover:underline">https://evidebus.com</a></li>
                        <li>Engage with us in other related ways, including any sales, marketing, or events</li>
                    </ul>
                    <h4 className="font-bold text-gray-800 mt-4">1. WHAT INFORMATION DO WE COLLECT?</h4>
                    <p><strong>Personal information you disclose to us:</strong> We collect personal information that you provide to us voluntarily.</p>
                    <p><strong>Information automatically collected:</strong> Some information — such as your Internet Protocol (IP) address — is collected automatically.</p>
                    <h4 className="font-bold text-gray-800 mt-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h4>
                    <p>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
                    <h4 className="font-bold text-gray-800 mt-4">3. SHARING PERSONAL INFORMATION</h4>
                    <p>We may share your personal information in specific situations and with certain types of parties, such as data analytics services.</p>
                    <h4 className="font-bold text-gray-800 mt-4">4. COOKIES</h4>
                    <p>We use cookies and other tracking technologies to collect and store your information.</p>
                    <h4 className="font-bold text-gray-800 mt-4">10. CONTACT US</h4>
                    <p>If you have questions about this notice, email us at <a href="mailto:dalsc.dev@gmail.com" className="text-blue-600 hover:underline">dalsc.dev@gmail.com</a></p>
                </div>
            )
        },
        terms: { 
            title: "Terms and Conditions", 
            body: (
                <div className="space-y-4 text-xs leading-relaxed text-gray-600 text-justify">
                    <p><strong>Welcome to evidebus.com!</strong> These Terms and Conditions ("Terms") govern your use of our website and services.</p>
                    <h4 className="font-bold text-gray-800 mt-4">1. Our Service</h4>
                    <p>evidebus.com acts as a referral platform for seat reservations and bus information. We <strong>do not</strong> directly process bookings.</p>
                    <h4 className="font-bold text-gray-800 mt-4">2. External Websites</h4>
                    <p>When you click on a link to reserve a seat, you will be redirected to an external third-party website.</p>
                    <h4 className="font-bold text-gray-800 mt-4">3. No Liability</h4>
                    <p>evidebus.com shall not be liable for any issues arising from your reservation made on an external website.</p>
                    <h4 className="font-bold text-gray-800 mt-4">4. Accuracy</h4>
                    <p>We strive for accuracy but do not guarantee completeness of data provided by third parties.</p>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="italic text-[10px]">Last Updated: June 18, 2025</p>
                    </div>
                </div>
            )
        },
        disclaimer: { 
            title: "Disclaimer", 
            body: (
                <>
                   <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-4">
                        <h5 className="font-bold text-red-700 flex items-center gap-2 mb-1 text-xs"><AlertTriangle size={14}/> Not a Government Website</h5>
                        <p className="text-red-600 text-[10px] leading-relaxed">evidebus.com is privately maintained. We are <strong>NOT</strong> affiliated with KSRTC or MVD.</p>
                   </div>
                   <h4 className="font-bold text-sm text-gray-800 mt-4 mb-2">Data Accuracy</h4>
                   <p className="mb-2 text-xs">Timings are based on user contributions. Schedules change due to traffic/strikes.</p>
                   <h4 className="font-bold text-sm text-gray-800 mt-4 mb-2">Liability</h4>
                   <p className="text-xs">We recommend verifying critical travel details with the respective bus stations. We are not liable for any damages.</p>
                </>
            )
        }
    };

    const data = content[type] || content.about;

    return (
        <div className="animate-fade-in bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[60vh]">
            <button onClick={onBack} className="text-teal-600 font-bold text-xs flex items-center gap-1 mb-6 hover:underline">
                <ChevronRight className="rotate-180" size={14}/> Back to Home
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 mb-4">{data.title}</h1>
            <div className="prose prose-sm text-xs text-gray-600 leading-relaxed">
                {data.body}
            </div>
        </div>
    );
};

// 2.5 FOOTER COMPONENT
export const Footer = ({ onQuickSearch }) => {
    const navigate = useNavigate();
    return (
        <footer className="bg-white border-t border-gray-100 mt-8 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-teal-600 text-white p-1 rounded-md"><Bus size={14} /></div>
                            <span className="text-sm font-bold text-gray-800">evidebus.com</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                            Kerala's largest community-driven public transport network. Find KSRTC and Private bus timings, stops, and routes easily.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-gray-800 text-xs mb-3 uppercase tracking-wide">Quick Links</h4>
                        <ul className="space-y-1.5 text-[10px] text-gray-500 font-medium">
                            <li onClick={() => navigate('/about')} className="hover:text-teal-600 cursor-pointer transition-colors">About Us</li>
                            <li onClick={() => navigate('/contact')} className="hover:text-teal-600 cursor-pointer transition-colors">Contact Support</li>
                            <li className="hover:text-teal-600 cursor-pointer transition-colors"><a href="https://chat.whatsapp.com/KhSr7LeSW503yXSGqJW8YZ" target="_blank">Join WhatsApp</a></li>
                            <li onClick={() => navigate('/contact')} className="hover:text-teal-600 cursor-pointer transition-colors">Report Issue</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 text-xs mb-3 uppercase tracking-wide">Legal</h4>
                        <ul className="space-y-1.5 text-[10px] text-gray-500 font-medium">
                            <li onClick={() => navigate('/terms')} className="hover:text-teal-600 cursor-pointer flex items-center gap-1 transition-colors"><FileText size={10}/> Terms</li>
                            <li onClick={() => navigate('/privacy')} className="hover:text-teal-600 cursor-pointer flex items-center gap-1 transition-colors"><Lock size={10}/> Privacy</li>
                            <li onClick={() => navigate('/disclaimer')} className="hover:text-teal-600 cursor-pointer flex items-center gap-1 transition-colors"><AlertCircle size={10}/> Disclaimer</li>
                            <li onClick={() => navigate('/privacy')} className="hover:text-teal-600 cursor-pointer transition-colors">Cookie Policy</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 text-xs mb-3 uppercase tracking-wide">Popular</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {['Kozhikode', 'Manjeri', 'Thrissur', 'Palakkad', 'Kannur', 'Aluva'].map(city => (
                                <span key={city} onClick={() => onQuickSearch(city)} className="text-[9px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-100 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 cursor-pointer transition-all">
                                    {city}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-3">
                    <p className="text-[10px] text-gray-400 font-medium">
                        © 2026 evidebus.com. Not affiliated with KSRTC.
                    </p>
                    <p className="text-[9px] text-gray-300 max-w-sm text-center md:text-right">
                        Timings based on user contributions.
                    </p>
                </div>
            </div>
        </footer>
    );
};