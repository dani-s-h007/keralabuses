import fs from 'fs';
import { BUS_STOPS_RAW } from '../src/utils.js'; // Ensure utils.js exports BUS_STOPS_RAW

const BASE_URL = "https://evidebus.com";
const currentDate = new Date().toISOString().split('T')[0];

// 1. STATIC PAGES
const staticPaths = [
    { path: "", priority: "1.0", changefreq: "daily" },
    { path: "ksrtc", priority: "0.9", changefreq: "weekly" },
    { path: "private", priority: "0.9", changefreq: "weekly" },
    { path: "depot", priority: "0.8", changefreq: "monthly" },
    { path: "stands", priority: "0.8", changefreq: "monthly" },
    { path: "add-bus", priority: "0.7", changefreq: "monthly" },
    { path: "about", priority: "0.5", changefreq: "monthly" },
    { path: "contact", priority: "0.5", changefreq: "monthly" },
    { path: "privacy", priority: "0.3", changefreq: "monthly" },
    { path: "terms", priority: "0.3", changefreq: "monthly" },
    { path: "disclaimer", priority: "0.3", changefreq: "monthly" }
];

// 2. POPULAR ROUTES (Manual High-Traffic Selection from BUS_STOPS_RAW)
// These generate: /search/FROM/TO/all
const popularRoutes = [
    // Major Inter-City
    { from: "THIRUVANANTHAPURAM", to: "ERNAKULAM" },
    { from: "ERNAKULAM", to: "THIRUVANANTHAPURAM" },
    { from: "ERNAKULAM", to: "KOZHIKODE" },
    { from: "KOZHIKODE", to: "ERNAKULAM" },
    { from: "THIRUVANANTHAPURAM", to: "KOZHIKODE" },
    { from: "KOZHIKODE", to: "THIRUVANANTHAPURAM" },
    { from: "ERNAKULAM", to: "BANGALORE" },
    { from: "BANGALORE", to: "ERNAKULAM" },
    { from: "THIRUVANANTHAPURAM", to: "BANGALORE" },
    
    // Malabar Region
    { from: "KOZHIKODE", to: "KANNUR" },
    { from: "KANNUR", to: "KOZHIKODE" },
    { from: "KOZHIKODE", to: "MANJERI" },
    { from: "MANJERI", to: "KOZHIKODE" },
    { from: "KOZHIKODE", to: "MALAPPURAM" },
    { from: "MALAPPURAM", to: "KOZHIKODE" },
    { from: "PERINTHALMANNA", to: "MANJERI" },
    { from: "MANJERI", to: "PERINTHALMANNA" },
    { from: "PERINTHALMANNA", to: "KOZHIKODE" },
    { from: "PANDIKKAD", to: "PERINTHALMANNA" },
    { from: "PANDIKKAD", to: "MANJERI" },
    { from: "NILAMBUR", to: "PERINTHALMANNA" },
    { from: "PALAKKAD", to: "THRISSUR" },
    { from: "THRISSUR", to: "PALAKKAD" },
    { from: "SULTAN BATHERY", to: "KOZHIKODE" },
    { from: "KALPETTA", to: "KOZHIKODE" },

    // Central Kerala
    { from: "THRISSUR", to: "ERNAKULAM" },
    { from: "ERNAKULAM", to: "THRISSUR" },
    { from: "THRISSUR", to: "GURUVAYOOR" },
    { from: "GURUVAYOOR", to: "THRISSUR" },
    { from: "ALUVA", to: "ERNAKULAM" },
    { from: "KOTTAYAM", to: "ERNAKULAM" },
    { from: "ERNAKULAM", to: "KOTTAYAM" },
    { from: "THODUPUZHA", to: "ERNAKULAM" },
    { from: "MUVATTUPUZHA", to: "ERNAKULAM" },
    { from: "PALA", to: "KOTTAYAM" },
    { from: "PALA", to: "ERNAKULAM" },

    // South Kerala
    { from: "KOLLAM", to: "THIRUVANANTHAPURAM" },
    { from: "THIRUVANANTHAPURAM", to: "KOLLAM" },
    { from: "ALAPPUZHA", to: "ERNAKULAM" },
    { from: "ERNAKULAM", to: "ALAPPUZHA" },
    { from: "KOTTARAKKARA", to: "THIRUVANANTHAPURAM" },
    { from: "PATHANAMTHITTA", to: "THIRUVANANTHAPURAM" },
    { from: "NEDUMANGAD", to: "THIRUVANANTHAPURAM" },
    { from: "ATTINGAL", to: "THIRUVANANTHAPURAM" }
];

const generateSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Static Pages
    staticPaths.forEach(item => {
        const loc = item.path === "" ? BASE_URL : `${BASE_URL}/${item.path}`;
        xml += `  <url>\n`;
        xml += `    <loc>${loc}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
        xml += `    <priority>${item.priority}</priority>\n`;
        xml += `  </url>\n`;
    });

    // 2. Bus Stand Boards (From your raw list)
    // Generates: /board/STATION
    const uniqueStops = [...new Set(BUS_STOPS_RAW)].sort();
    
    uniqueStops.forEach(stop => {
        if (!stop) return;
        const safeStop = encodeURIComponent(stop)
            .replace(/&/g, '&amp;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;');

        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/board/${safeStop}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
    });

    // 3. Popular Route Search Results
    // Generates: /search/FROM/TO/all
    popularRoutes.forEach(route => {
        const safeFrom = encodeURIComponent(route.from).replace(/&/g, '&amp;');
        const safeTo = encodeURIComponent(route.to).replace(/&/g, '&amp;');
        
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/search/${safeFrom}/${safeTo}/all</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    if (!fs.existsSync('./public')) {
        fs.mkdirSync('./public');
    }

    fs.writeFileSync('public/sitemap.xml', xml);
    console.log(`Success: Sitemap generated at /public/sitemap.xml`);
    console.log(`Stats:`);
    console.log(`   - Static Pages: ${staticPaths.length}`);
    console.log(`   - Bus Boards:   ${uniqueStops.length}`);
    console.log(`   - Popular Routes: ${popularRoutes.length}`);
    console.log(`   - Total URLs:   ${staticPaths.length + uniqueStops.length + popularRoutes.length}`);
};

generateSitemap();