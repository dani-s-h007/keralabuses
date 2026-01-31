// --- CONSTANTS ---
export const BUS_STOPS_RAW = [
  "THIRUVANANTHAPURAM","KOTTAYAM","ALUVA","VYTILLA HUB","THRISSUR","ERNAKULAM","ALAPPUZHA","KOTTARAKKARA","CHANGANASSERY","KOLLAM","THIRUVALLA","CHERTHALA","KOZHIKKODE","KAYAMKULAM","CHALAKUDY","KARUNAGAPPALLY","MUVATTUPUZHA","ANKAMALY","ATTINGAL","NEYYATTINKARA","THRIPPUNITHURA","NEDUMANGAD","ADOOR","ETTUMANOOR","TRIVANDRUM","PUTHUKKAD","VENJARAMOODU","CHENGANNUR","PALA","KATTAKKADA","PERUMBAVOOR","KANIYAPURAM","KILIMANOOR","PUNALUR","PATHANAMTHITTA","OACHIRA","PALAKKAD","NORTH PARAVOOR","HARIPPAD","KANJIRAPALLY","CHATHANNOOR","CHADAYAMANGALAM","PAPPANAMCODE","AYOOR","BALARAMAPURAM","PANDALAM","MANANTHAVADY","KALPETTA","KOTTIYAM","KUNNAMKULAM","AMBALAPPUZHA","KOOTHATTUKULAM","THAMARASSERY","BANGALORE","PARASSALA","EDAPPAL","MEDICAL COLLEGE THIRUVANANTHAPURAM","MUNDAKKAYAM","THODUPUZHA","PONKUNNAM","KAZHAKKOOTTAM","KASARAGOD","KOTTAKKAL","KALIYIKKAVILA","CHAVARA","KUNDARA","KODUNGALLUR","GURUVAYOOR","EAST FORT","POOVAR","KUNNAMANGALAM","CHINNAKKADA","AROOR","KUTTIPPURAM","ERAMALLOOR","THURAVOOR","VAIKKOM","ERNAKULAM JETTY","PATTOM","VIZHINJAM","PATHANAPURAM","EDAPALLI BYE-PASS JN","ERATTUPETTA","ATHANI","CALICUT UNIVERSITY","PEROORKADA","KOZHENCHERRY","THALAYOLAPARAMBU","VARAPPUZHA","KOONAMMAVU","ADIVAARAM","PERINTHALMANNA","SREEKARYAM","VADANAPPALLY","KUTHIYATHODE","KOLENCHERY","KARICODE","ERUMELY","KANHANGAD","KANNUR","EZHUKONE","KARAKULAM","AMBALLUR","PUTHENKURISH","CHAVAKKAD","SULTAN BATHERY","PEYAD","POTHENCODE","PUTHENPALAM","THIRUMALA","KARETTU","VALANCHERY","KALAMASSERY","VELLARADA","VADAKKENCHERRY","KUNDANOOR","VANDANAM MEDICAL COLLEGE","PARIPPALLY","PIRAVOM","MARAMPALLY","KODAKARA","CHINGAVANAM","ANCHAL","THRIPRAYAR","KODUVALLY","VELLANAD","KARAKONAM","MATHILAKAM","MOONUPEEDIKA","CHULLIMANOOR","ARYANAD","UDIYANKULANGARA","KOTHAMANGALAM","ALAMCODE","MANGALAPURAM","VEMBAYAM","KALLAMBALAM","MUKKOLA","KUTTIKKANAM","PAMPADY","ALATHUR","EDATHUVA","VALAKOM","KUZHALMANNAM","OLLUR","VADAKARA","THALASSERY","ANGAMALY","THIRUVALLOM","RAMANATTUKARA","BHARANAMGANAM","KATTAPPANA","KUNNIKODE","KONNI","PANAMARAM","RANNY","THIRUVANKULAM","ENGAPUZHA","KOVALAM","PALODE","K.CHAPPATH","AZHAKULAM","KOZHIKODE","KARUKACHAL","MARANALLOOR","KUMILY","MALAYINKEEZH","KALLARA","POOVACHAL","KALLUVATHUKKAL","KURAVILANGAD","VYTHIRI","MAVELIKKARA","MALAPPURAM","CHAKKULATHUKAVU","THACHOTTU KAVU","RAMANKARI","KOILANDI","VITHURA","KAKKANAD","THOTTAPPALLY","MONCOMBU","KANJIKKUZHY","KORATTY","KALOOR","KANJIRAMKULAM","NILAMEL","NEDUMUDY","MANNARKAD","MALLAPPALLY","THENMALA","KOTTAPURAM","PONNANI","KARUKUTTY","KALAVOOR","NILAMBUR","PATTAMBI","KIDANGARA","LAKKIDI","MEENANGADI","KONDOTTY","PANACHAMOODU","KADUTHURUTHY","VAMANAPURAM","ELANTHOOR","MANNUTHY","KAMBALAKKAD","THOPPUMPADY","MYSORE","BHARANIKKAVU","KUTTICHAL","VANDIPERIYAR","MUHAMMA","PUTHIYATHURA","MANGALORE","KADAKKAL","PEERMEDU","KANJIRAMATTOM","KULATHUPUZHA","UCHAKADA","KIDANGOOR","MAHE","POOTHOTTA","PATTIKKAD","PUTHUKAD","CHARUMMOODU","ELAMBAL","VATTAPPARA","OLATHANI","MADATHARA","THALAPPAADI","WALAYAR","COIMBATORE","MUTTOM","KALLADIKODE","PAYYANNUR","ENATH","THOTTILPALAM","THAKAZHY","UZHAMALAKKAL","KESAVADASAPURAM","MALA","OTTASEKHARAMANGALAM","PAZHAYAKADA","MANJESHWAR","TIRUR","THALIPARAMBA","UPPALA","NELLIMOODU","ARANMULA","THANNEERMUKKOM","KURUPPANTHARA","KUMBLA","KUTTIADY","OORUTTAMBALAM","KALLISSERY","MANNANCHERY","MANJERI","MANDAPATHINKADAVU","KURAMPALA","MUNDUR","CHERUVATHOOR","EDAKOCHI","CHETTIKULANGARA","MARTHANDAM","ELAPPARA","ULLIYERI","UZHAVOOR","THATTATHUMALA","THEKKADA","TVM GENERAL HOSPITAL","IRINJALAKUDA","UCHAKKADA","SASTHAMKOTTA","KALLIKKAD","NEELESWARAM","KURUPPAMPADY","NAGERCOVIL","MARAKKULAM","CHAKKA","CHENGANNUR RS","OORAMBU","KARAKKAD","MOOLAMATTOM","VARKALA","MANOOR","PERUMATHURA","CHENKAVILA","CHAMRAVATTOM","MUNNAR","VAZHIKKADAVU","NERIAMANGALAM","KUTTIPURAM","THENKASI","POOYAPPALLY","PULLAD","THIRUVAMBADY","MURUKKUMPUZHA","KALAYAPURAM","KUMARAKOM","KARUNAGAPPALLI","ERAVIPEROOR","RAMAPURAM","AMBALAPUZHA","VENJARAMMOODU","ARYANKAVU","PERAMBRA","CHIRAYINKEEZHU","NEDUMKANDAM","NANNIYODE","ADIMALY","PUTHUKURICHY","ANCHALUMMOODU","ARAKKUNNAM","PAIKA","COIMBATORE UKKADAM","KATTANAM","THOLICODE","CHERAI","CHERUTHONI","KUMARAMPUTHUR","THANNEERMUKKOM","NADAKKAVU","MUKKAM","NATTUKAL","NOORANADU","VYPIN","PAZHAKULAM","DHANUVACHAPURAM","NJARACKAL","SHENKOTTAI","MUNDELA","PARIYAARAM","HARIPAD","KOTTAYAM MCH","VILAPPILSALA","ATHIKKATTUKULANGARA","ARUMANOOR","KARIVELLUR","BEKAL","MAKKARAPARAMBA","OYOOR","MANNAR","NELLIKUNNAM","SASTHAMANGALAM","PALLIKKAL","HIGH COURT","OTTAPALAM","VATTIYOORKAVU","CHEMBOOR","ATHOLI","PUTHUPPALLY","CHITTUMALA","MARAYAMUTTOM","VENNIKULAM","THALAYAZHAM","KADAMPANAD","MANIMALA","CHAMPAKULAM","ELATHUR","PUTHOOR","PUTHANANGADY","ERUTHAVOOR","THALAPPUZHA","PULPALLY","IRINCHAYAM","POLLACHI","ANCHALPETTY","CHUNGATHARA","VENGANOOR","YEROOR","ELANJI","KALLODY","MUKKOOTTUTHARA","KOKKADU","KURUMASSERY","KIZHAKKAMBALAM","KATTIKULAM","PAYYOLI","AIMS HOSPITAL","VARANAD","PARAMBATH","EDAKKARA","KARAVALOOR","ARUVIKKARA","KOZHIKODE UNIVERSITY","NAGAROOR","KAVALAM","PARAPPANANGADI","PATHIRIPPALA","URAKAM","PAPPINISSERI","PERAYAM","THEKKUMBHAGAM","NADUVANNUR","CHANGARAMKULAM","THEMPAMMOODU","VEEYAPURAM","KANNANALLOOR","VELLAMUNDA","PATTAZHY","TANUR","PERUMKADAVILA","BALUSSERY","THEVARA","CHITHARA","ODANAVATTOM","PATTIMATTOM","NEYYAR DAM","KOOTTANAD","VELIYAM","KARUNAGAPALLY","PULINKUNNU","VELLANGALLUR","HMT KALAMASSERY","KALLAR","IRITTY","PADAPPANAL","VAZHICHAL","MITHIRMALA","KOZHINJAMPARA","MANNAMKONAM","CHOONDY","ANNAMANADA","KADINAMKULAM","MUTHUVILA","PANAVOOR","PEREKONAM","EDAVANNA","OONNUKAL","KOOVAPPALLY","MONIPPALLY","KOLLAM CIVIL STATION","KUNNATHUR","CHOTTANIKARA","MOOZHY","PERINGAMMALA","KAMUKINCODE","THALACHIRA","WANDOOR","PUNNAMOODU","KOZHIKKODE MCH","POZHIYOOR","ANDOORKONAM","PAKALKURI","POONJAR","ANACHAL","AYATHIL","ASHTAMICHIRA","NIRAVILPUZHA","KUTTAMASSERY","EDAMON","THAMARAKULAM","AMBALAMKUNNU","CHALAKKUDY","PERUVA","AROOKUTTY","GOPALAPURAM","VAZHAKULAM","ELAVUMTHITTA","AREACODE","AMBOORI","KAROOR","CHITTOOR","MEEYANNOOR","NEDUMBASSERY AIRPORT","CHERKALA","NIT CALICUT","KADAPUZHA","ELAMKADU","POONOOR","ILLIKKAL","OLAVAKODE","EDAKKAD","ALUR","NADAVAYAL","OMASSERY","PAMBAVALLEY","PANDIKKAD","CHALLIMUKKU","MEPPADI","KAVANATTINKARA","KALADY","MARANGATTUPALLY","THOTTAKKAD","CHELACHUVADU","PUDUNAGARAM","SHORNUR","KOOTTAPPU","VELI","VALLUVAMBRAM","BEENACHI","MANJANIKKARA","ARYANCODE","CHERUPUZHA","VADASSERIKKARA","PLAMOOTTUKADA","KULAMAVU","ANAKKAMPOYIL","TEEKOY","UPPUTHARA","THOOKKUPALAM","NELLAD","PANGODU","GUNDULPET","POOVATHUSSERY","PAIPAD","KUDAPPANAMOODU","MARYKULAM","ANAYADI","KULATHOOR HS","CHATHANAD","MARAPPALAM","CHUNKAPPARA","NANJANGUD","KENGERI","KOODAL","KUNNAMTHANAM","PULLURAMPARA","POOCHAKKAL","CHERIYAKONNI","PARA","MOOLITHODU","KUTTA COORG","KODunGOOR","UPPUKANDAM","THOLPETTY","KAYAMKULAM RS","KANJAR","VALAT","MEENKUNNAM","AYIRAMTHENGU","THAMARAKUDY","KOZHIKKOD UNIVERSITY","ALL SAINTS COLLEGE","CHOZHIYAKODU","NELLIMATTOM","KALLOOPPARA","MANDYA","KAKKATTIL","KOTTOOR","PERINGAMALA","CHAKKUVARAKKAL","NADAPURAM","AZHEEKKAL","CHUNAKKARA","PALAPPETTY","KORUTHODU","KOLLAPALLY","CHERIAZHEEKKAL","VALLIKKUNNU","PALLICKATHODU","PERUMBALAM","DASANAKKARA","PAKKOM","PAINGOTTOOR","PUTHUSSERY","SALEM","VELIYANNOOR","KENICHIRA","KANJIRAPPALLY","UMMANNOOR","KUZHIMAVU","PADINJARETHARA","MUTHUKULAM","BHAGAVATHIPURAM","ANAPPARA","ARATTUPUZHA","VLATHANKARA","WADAKKANCHERY","POOZHIKUNNU","NARUVAMOODU","ARTHUNKAL","PUTHUPPADY","RAMANAGARA","KOTTIYOOR","CHANNAPATTANA","SRIRANGAPATNA","KRISHNAN KOTTA","KRISHNAPURAM","AMBAYATHODE","KATTILKADAVU","MADDUR","MEDICAL COLLEGE ERNAKULAM","THRIKKUNNAPPUZHA","THUMPODU","KIDANGANNOOR","PERAVOOR","PARAVUR","VALLIKKAVU","KOOTHUPARAMBA","BHARATHANOOR","VAGAMON","KAZHUTHURUTTY","KARIMBAN","POOZHANADU","KOLLAKADAVU","KEEZHAROOR","KAINAKARY","KOODARANJI","CHENAPPADY","MULLERIA","NENMARA","PALIYODU","PARAYAKADAVU","CHELLANAM","PATHARAM","KOCHEEDA JETTY","SULLIA","PUTHentHOPE","THULAPPALLY","PALLITHURA","NANMINDA","MALAYALAPUZHA","THIRUVANIYOOR","VALAVOOR","KAKKAYANGAD","CHEPRA","EZHUMATTOOR","AYARKUNNAM","JALSOOR","MEENANKAL","VETTIKKAL","KODALY","THADIYAMPAD","PALANI","MATTANNUR","MANEED","POYYA","VYTTILA HUB","ERATTAYAR","INFOPARK","KUMBALAM","ANDHAKARANAZHY","LABBAKKADA","MALIANKARA","MAKKIYAD","MULAYARA","MEENAKSHIPURAM","ARAYANKAVU","TALIPARAMBA","KARIMUGHAL","PAYYANUR","ERUMELI","VELLIKULANGARA","CALICUT AIRPORT","ALAKKODE","KOLLENGODE","ARUVIPPURAM","KONGAD","THENNOOR","MARAYOOR","OTHERA","PAVUMBA","KOZHUVALLOOR","KAKKODI","KANICHUKULANGARA","CHITTAR","CHERPULASSERY","BADIYADKA","CHOORALMALA","PRAKKULAM","MURIKKASSERY","MANARCADU","NADUKANI","MULAGUNNATHUKAVU","ALUMKADAVU","AANAPPARA","HOSUR","CHEMPAZHANTHY","THAMBALAKKADU","GUDALLUR","VENKODE","ADIMALI","PUNALAL","SULTHAN BATHERY","PERLA","ORKKATTERI","KOTTAVASAL","PANAYAMUTTAM","SEETHATHODE","VILAKKUPARA","MUPLIYAM","CHITTARIKKAL","ERAVATHOOR","MELATTUMOOZHY","VELLARIKUND","PERIKKALLOOR","PUTTUR","POTHANICAD","PUTHUKKULAM","EDAKKUNNAM","PUNCHAVAYAL","THENGAMAM","PUTHUVELI","PANACODE","CHENNAI","VENMONY","SHORANUR","KOOMBARA","POINACHY","KOLOTH JETTY","ANGAMOOZHY","PAMBA","VETTICHIRA","CUMBUMMETTU","UDUMALPET","THACHAMPARA","SARADKA","PERUNAD","PADAPPAKKARA","KOLAHALAMEDU","THURUTHIPURAM","GUDALUR","VECHOOCHIRA","PANNIYODE","CHELAKKARA","THIRUVANVANDOOR","KAPPIL","ADIMALATHURA","KURUVILANGADU","POREDAM","THENI","ALAKODE","KOORACHUNDU","FEROKE","KOTTAVATTOM","THOPRAMKUDY","KANNAMMOOLA","KARAVUR","NEDUMPOIL","KRISHNAN KOTTA","BALAGRAM","DEVIKULAM","NEDUMBASSERY","NEDUMANKAVU","VANNAPURAM","PARAVOOR NORTH","KUNNAMKERY","POOVATTOOR","RAJAKKAD","MUTHAPPANPUZHA","VENGODE","KASARGODE","CHEMBAKAPPARA","BAVALI","KARITHOTTA","KUTTAMALA","VADUVANCHAL","KOPPAM","PAYYAVOOR","PARUTHIKUZHY","HUNSUR","VELIYANAD","PARAPPIL","MUTTAR","POOPPARA","VAZHITHALA","TVM CIVIL STATION","KODUVAYUR","SECRETARIAT","NEDUVANNOOR","MALAMPUZHA","KURUTHANCODE","KAMUKUMCHERY","VELLUMANNADI","MOONNANAKUZHY","PANAMBUKADU","MOOKKANNUR","VANDANMEDU","TECHNOPARK","KOTHAD FERRY","CHEEKKAL KADAVU","THATHAPPILLY","SENKOTTAI","GONIKOPPAL","MYLACHAL","KADAMMANITTA","KAVUMANNAM","TV PURAM","KOOTTALIDA","KADALUNDI","CHETTACHAL","KONNAKUZHY","UDUPI","THOLANUR","VELLANATHURUTHU","CHAMAMPATHAL","VENPAKAL","THADICADU","BHEEMANADY","PANTHA","PARUMALA","MANNADY","EDAVA","PUNKULAM","THYCATTUSSERY","NALANCHIRA","CHOONAD","PERUMON","THIDANAD","KODENCHERY","THERTHALLY","POOMALA","ORAVACKAL","PACHAMALA","THURAYIL KADAVU","PARANDODE","MOOTHEDATHUKAVU","PUNNAKULAM","KOOROPPADA","NALKAVALA","KOYILANDY","MADURAI","ADIVARAM","PAINAVU","PERUVANTHANAM","UNDAPPARA","VETTILAPPARA","CHULLIYODE","NARIKKUNNI","ASHTAMUDI","CVR PURAM","CHANNAPETTA","VALIAZHEEKAL","KANYAKUMARI","ATTUKAL TEMPLE","MANAVARY","MULANTHURUTHY","VENNIYODE","VALLIKUNNAM","VENMANY","504 COLONY","KODANKARA","KARIMBIL","PARIPPU","MUTHOLY","CHERAMBADI","KOKKUNNU","KAVALAM","KOLLADU BOAT JETTY","KUTTIYANI","KULATHOORMOZHY","THEKKADY","KUMMALLOOR","OOTY","VELIYATHUNADU","THAYAMKARI","ERODE","NILAKKAL","CHANGUVETTY","KARUVANCHAL","VALIYAPERUMPUZHA","PONMUDI","THANKAMANI","POOVAMPALLY","THADIYOOR","POOKKATTUPADY","ELOOR","MAYAM","AGRIFARM","KAPPUKAD","KONGORPILLY","THANDIRIKKAL","KALLARKUTTY","CHEPPILODE","VELLARIKUNDU","CHEMBIRIKA","DEVALA","ERNAKULAM SOUTH","THIRUVILWAMALA","GOVINDAPURAM","BAIRAKUPPA","SHANTINAGAR","THADICADU","KAREEPRA","THIRUNELLI TEMPLE","IDUKKI","KEERUKUZHI","ULLOOR","LAHA","RAJAKUMARI","KALADY PLANTATION","VARKALA SIVAGIRI","ADIVAD","MANJAPRA","VADAKKANCHERY","KUZHITHOLU","PANDAPILLY","GOKULAM MCH","THALOOR","SREEKANDAPURAM","PUTHANATHAANI","MANNATHOOR","PADANILAM","EDAPPALLY","MADIWALA ST JOHN","AGALY","VELIYAMCODE","THAVALAM","KAMBISSERY", "KUTHIRAVATTOM", "PANDIKKAD", "PERINTHALMANNA","CHANDAKUNNU"
];

// Ensure unique stops for suggestions
export const BUS_STOPS = [...new Set(BUS_STOPS_RAW)];

// --- SEED DATA (EMPTY AS REQUESTED) ---
export const SEED_BUSES = [];

// --- DEPOT DATA ---
export const DEPOT_DATA = [
    {
        district: "Alappuzha",
        depots: [
            { name: "Alappuzha", phone: "9188933748" },
            { name: "Chengannur", phone: "9188933750" },
            { name: "Cherthala", phone: "9188933751" },
            { name: "Kayamkulam", phone: "9188933754" },
            { name: "Mavelikkara", phone: "9188933756" },
            { name: "Edathua", phone: "9188933752" },
            { name: "Haripad", phone: "9188933753" }
        ]
    },
    {
        district: "Ernakulam",
        depots: [
            { name: "Aluva", phone: "9188933776" },
            { name: "Ernakulam", phone: "9188933779" },
            { name: "Koothattukulam", phone: "9188933782" },
            { name: "Muvattupuzha", phone: "9188933785" },
            { name: "Perumbavoor", phone: "9188933788" },
            { name: "Piravom", phone: "9188933790" },
            { name: "Angamaly", phone: "9188933778" },
            { name: "Ernakulam Jetty", phone: "9188933780" },
            { name: "Kothamangalam", phone: "9188933784" },
            { name: "North Paravur", phone: "9188933787" },
            { name: "Vyttila Hub", phone: "9188933781" }
        ]
    },
    {
        district: "Idukki",
        depots: [
            { name: "Moolamattom", phone: "9188933770" },
            { name: "Munnar", phone: "9188933771" },
            { name: "Thodupuzha", phone: "9188933775" },
            { name: "Adimali", phone: "9188933772" },
            { name: "Kattappana", phone: "9188933766" },
            { name: "Kumily Town", phone: "9188933769" },
            { name: "Nedumkandam", phone: "9188933774" }
        ]
    },
    {
        district: "Kannur",
        depots: [
            { name: "Kannur", phone: "9188933822" },
            { name: "Thalassery", phone: "9188933824" },
            { name: "Payyanur", phone: "9188933823" }
        ]
    },
    {
        district: "Kasaragod",
        depots: [
            { name: "Kanhangad", phone: "9188933825" },
            { name: "Kasaragod", phone: "9188933826" }
        ]
    },
    {
        district: "Kollam",
        depots: [
            { name: "Kollam", phone: "9188933739" },
            { name: "Kottarakkara", phone: "9188933732" },
            { name: "Punalur", phone: "9188933730" },
            { name: "Karunagappalli", phone: "9188933736" },
            { name: "Chadayamangalam", phone: "9188933728" }
        ]
    },
    {
        district: "Kottayam",
        depots: [
            { name: "Kottayam", phone: "9188933760" },
            { name: "Changanassery", phone: "9188933757" },
            { name: "Pala", phone: "9188933762" },
            { name: "Eerattupetta", phone: "9188933758" },
            { name: "Vaikom", phone: "9188933765" }
        ]
    },
    {
        district: "Kozhikode",
        depots: [
            { name: "Kozhikode", phone: "9188933809" },
            { name: "Thamarassery", phone: "9188933811" },
            { name: "Vadakara", phone: "9188933814" },
            { name: "Thiruvambadi", phone: "9188933812" }
        ]
    },
    {
        district: "Malappuram",
        depots: [
            { name: "Malappuram", phone: "9188933803" },
            { name: "Perinthalmanna", phone: "9188933806" },
            { name: "Nilambur", phone: "9188933805" },
            { name: "Ponnani", phone: "9188933807" },
            { name: "Tirur", phone: "9188933808" }
        ]
    },
    {
        district: "Palakkad",
        depots: [
            { name: "Palakkad", phone: "9188933800" },
            { name: "Mannarkkad", phone: "9188933799" },
            { name: "Vadakkencherry", phone: "9188933802" },
            { name: "Chittur", phone: "9188933798" }
        ]
    },
    {
        district: "Pathanamthitta",
        depots: [
            { name: "Pathanamthitta", phone: "9188933744" },
            { name: "Adoor", phone: "9188933740" },
            { name: "Thiruvalla", phone: "9188933746" },
            { name: "Pamba", phone: "9497024092" }
        ]
    },
    {
        district: "Thiruvananthapuram",
        depots: [
            { name: "TVM Central", phone: "9188933716" },
            { name: "Neyyattinkara", phone: "9188933708" },
            { name: "Nedumangad", phone: "9188933702" },
            { name: "Attingal", phone: "9188933701" },
            { name: "Vizhinjam", phone: "9188933725" }
        ]
    },
    {
        district: "Thrissur",
        depots: [
            { name: "Thrissur", phone: "9188933797" },
            { name: "Guruvayoor", phone: "9188933792" },
            { name: "Chalakudy", phone: "9188933791" },
            { name: "Kodungallur", phone: "9188933794" }
        ]
    },
    {
        district: "Wayanad",
        depots: [
            { name: "Sultan Bathery", phone: "9188933819" },
            { name: "Kalpetta", phone: "9188933817" },
            { name: "Mananthavady", phone: "9188933818" }
        ]
    },
    {
        district: "Outside Kerala",
        depots: [
            { name: "Bangalore", phone: "9188933820" },
            { name: "Mysore", phone: "9188933821" },
            { name: "Coimbatore", phone: "9188933801" },
            { name: "Mangalore", phone: "9188933827" }
        ]
    }
];

// --- HELPER FUNCTIONS ---
export const formatTime = (timeStr) => {
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

export const getMinutesFromMidnight = (timeStr) => {
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
export const calculateFare = (distance, type = 'Private') => {
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
export const generateSchema = (pageType, data = {}) => {
  if (pageType === 'home') {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "evidebus.com",
      "url": "https://evidebus.com",
      "description": "Find accurate bus timings for Kerala Private and KSRTC buses.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://evidebus.com/search/{search_term_string}",
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