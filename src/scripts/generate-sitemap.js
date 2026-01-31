import fs from 'fs';
import { BUS_STOPS_RAW } from '../src/utils.js';

const BASE_URL = "https://evidebus.com";
const currentDate = new Date().toISOString().split('T')[0];

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

const generateSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Static Paths
    staticPaths.forEach(item => {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/${item.path}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
        xml += `    <priority>${item.priority}</priority>\n`;
        xml += `  </url>\n`;
    });

    // 2. Add Dynamic Bus Stand Paths (SEO Goldmine)
    const uniqueStops = [...new Set(BUS_STOPS_RAW)].sort();
    
    uniqueStops.forEach(stop => {
        // XML requires special characters to be escaped (e.g., & to &amp;)
        const safeStop = encodeURIComponent(stop).replace(/&/g, '&amp;');
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/board/${safeStop}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    // Ensure the public directory exists
    if (!fs.existsSync('./public')) {
        fs.mkdirSync('./public');
    }

    fs.writeFileSync('public/sitemap.xml', xml);
    console.log(`Success: Sitemap generated at /public/sitemap.xml`);
    console.log(`Total URLs: ${uniqueStops.length + staticPaths.length}`);
};

generateSitemap();