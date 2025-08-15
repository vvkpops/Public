const TAF_CACHE_MS = 600000; // 10 minutes
const METAR_CACHE_MS = 60000; // 1 minute

const weatherCache = {};
const corsProxy = "https://corsproxy.io/?";

export async function fetchTAF(icao) {
  if (!icao) return "";
  
  const cached = weatherCache[icao]?.taf;
  if (cached && (Date.now() - cached.time < TAF_CACHE_MS)) return cached.data;
  
  const res = await fetch(`${corsProxy}https://aviationweather.gov/cgi-bin/data/taf.php?ids=${icao}&format=raw`);
  const text = (await res.text()).trim();
  weatherCache[icao] = weatherCache[icao] || {};
  weatherCache[icao].taf = { data: text, time: Date.now() };
  return text;
}

export async function fetchMETAR(icao) {
  if (!icao) return "";
  
  const cached = weatherCache[icao]?.metar;
  if (cached && (Date.now() - cached.time < METAR_CACHE_MS)) return cached.data;
  
  const res = await fetch(`${corsProxy}https://aviationweather.gov/cgi-bin/data/metar.php?ids=${icao}&format=raw`);
  const text = (await res.text()).trim();
  weatherCache[icao] = weatherCache[icao] || {};
  weatherCache[icao].metar = { data: text, time: Date.now() };
  return text;
}

export function parseLine(line) {
  let ceiling = Infinity, visMiles = Infinity, isGreater = false;
  
  const cloud = line.match(/(BKN|OVC|VV)(\d{3})/);
  if (cloud) ceiling = parseInt(cloud[2]) * 100;
  
  const vis = line.match(/(P?\d{1,2})SM/);
  if (vis) {
    if (vis[1].startsWith("P")) { 
      visMiles = parseInt(vis[1].slice(1)); 
      isGreater = true; 
    } else {
      visMiles = parseInt(vis[1]);
    }
  }
  
  return { ceiling, visMiles, isGreater };
}

export function parseTAFSegments(rawTAF, etaDate) {
  const valid = rawTAF.match(/\b\d{4}\/\d{4}\b/);
  let startDay, startHour, endDay, endHour;
  
  if (valid) {
    startDay = parseInt(valid[0].substr(0,2));
    startHour = parseInt(valid[0].substr(2,2));
    endDay = parseInt(valid[0].substr(5,2));
    endHour = parseInt(valid[0].substr(7,2));
  }
  
  function getDate(day, hour, minute=0) {
    let d = new Date(Date.UTC(etaDate.getUTCFullYear(), etaDate.getUTCMonth(), day, hour, minute));
    if (startDay && endDay && endDay < startDay && day <= endDay) d.setUTCMonth(d.getUTCMonth() + 1);
    return d;
  }
  
  let segments = [];
  const lines = rawTAF.split('\n').map(l=>l.trim()).filter(Boolean);
  
  lines.forEach(line => {
    if (line.startsWith("TAF")) {
      const idx = line.search(/\d{4}\/\d{4}/);
      if (idx >= 0) line = line.substring(idx + 9).trim();
    }
    
    line.split(/(?=FM\d{6})|(?=TEMPO)|(?=BECMG)|(?=PROB\d{2})/).forEach(seg => {
      seg = seg.trim();
      if (!seg) return;
      
      if (seg.startsWith("FM")) {
        const m = seg.match(/FM(\d{2})(\d{2})(\d{2})/);
        if (!m) return;
        const d = parseInt(m[1]), h = parseInt(m[2]), mi = parseInt(m[3]);
        const start = getDate(d, h, mi);
        segments.push({ type: "FM", start, cond: seg.substring(8).trim() });
      } else if (seg.startsWith("BECMG")) {
        const m = seg.match(/(\d{2})(\d{2})\/(\d{2})(\d{2})/);
        if (!m) return;
        const sDay = parseInt(m[1]), sHour = parseInt(m[2]);
        const eDay = parseInt(m[3]), eHour = parseInt(m[4]);
        const start = getDate(sDay, sHour);
        const end = getDate(eDay, eHour);
        const cond = seg.substring(m[0].length).trim();
        segments.push({ type: "BECMG", start, end, cond });
      } else if (seg.startsWith("TEMPO") || seg.startsWith("PROB")) {
        const probMatch = seg.match(/PROB(\d{2})/);
        if (seg.startsWith("PROB") && probMatch && parseInt(probMatch[1]) < 30) return;
        
        const m = seg.match(/(\d{2})(\d{2})\/(\d{2})(\d{2})/);
        if (!m) return;
        const sDay = parseInt(m[1]), sHour = parseInt(m[2]);
        const eDay = parseInt(m[3]), eHour = parseInt(m[4]);
        const start = getDate(sDay, sHour);
        const end = getDate(eDay, eHour);
        const cond = seg.substring(m[0].length).trim();
        segments.push({ type: seg.startsWith("TEMPO") ? "TEMPO" : "PROB", start, end, cond });
      } else {
        if (valid) {
          const start = getDate(startDay, startHour);
          const end = getDate(endDay, endHour);
          segments.push({ type: "INITIAL", start, end, cond: seg.trim() });
        }
      }
    });
  });
  
  for (let i=0; i<segments.length; i++) {
    if (segments[i].type === "FM") {
      let j = i+1;
      while (j < segments.length && segments[j].type !== "FM") j++;
      segments[i].end = j < segments.length ? segments[j].start : (valid ? getDate(endDay, endHour) : null);
    }
  }
  
  return segments;
}

export function findTAFAtETA(segments, etaDate) {
  for (const seg of segments) {
    if ((seg.type === "TEMPO" || seg.type === "PROB") && etaDate >= seg.start && etaDate <= seg.end) {
      return { cond: seg.cond, index: segments.indexOf(seg) };
    }
  }
  
  let last = null, lastIndex = -1;
  segments.forEach((seg, i) => {
    if ((seg.type === "FM" || seg.type === "BECMG" || seg.type === "INITIAL") && 
        etaDate >= seg.start && (!seg.end || etaDate < seg.end)) {
      last = seg.cond;
      lastIndex = i;
    }
  });
  
  return { cond: last, index: lastIndex };
}

export function checkTAFMinimaAtETA(rawTAF, minCeiling, minVis, eta) {
  const etaDate = new Date(eta);
  const segments = parseTAFSegments(rawTAF, etaDate);
  const { cond, index } = findTAFAtETA(segments, etaDate);
  
  if (!cond) return { below: false, condStr: null, etaIndex: -1, segments };
  
  const parsed = parseLine(cond);
  const visOk = parsed.isGreater ? true : parsed.visMiles >= minVis;
  const ceilOk = parsed.ceiling >= minCeiling;
  
  return { below: !(visOk && ceilOk), condStr: cond, etaIndex: index, segments };
}

export function highlightTAFAtETA(raw, minC, minV, eta) {
  const check = checkTAFMinimaAtETA(raw, minC, minV, eta);
  const lines = raw.split('\n');
  let highlightIdx = -1;
  
  if (check.etaIndex !== -1) {
    let segCount = -1;
    for (let i=0; i<lines.length; i++) {
      let l = lines[i].trim();
      if (l === "") continue;
      if (/^(TAF|FM|BECMG|TEMPO|PROB)/.test(l) || i === 0) segCount++;
      if (segCount === check.etaIndex) { highlightIdx = i; break; }
    }
  }
  
  const html = lines.map((line, i) =>
    `<div class="${i === highlightIdx && check.below ? 'text-red-400 font-bold' : ''}">${line}</div>`
  ).join("");
  
  return { html, below: check.below };
}

export function highlightTAFAllBelow(raw, minC, minV) {
  return raw.split("\n").map(line => {
    const p = parseLine(line);
    const visOk = p.isGreater ? true : (p.visMiles >= minV);
    const ceilOk = p.ceiling >= minC;
    return `<div class="${!(visOk && ceilOk) ? "text-red-400 font-bold" : ""}">${line}</div>`;
  }).join("");
}