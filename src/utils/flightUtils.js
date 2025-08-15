export function shortTime(s) {
  const d = new Date(s);
  return d.toISOString().slice(11, 16) + "Z";
}

export function calculateProgress(std, eta) {
  const now = new Date();
  const start = new Date(std);
  const end = new Date(eta);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  return ((now - start) / (end - start) * 100).toFixed(1);
}

export async function loadFlights(csvUrl) {
  const res = await fetch(csvUrl + "&" + Date.now());
  const txt = await res.text();
  const [header, ...lines] = txt.trim().split("\n");
  const keys = header.split(",").map(k => k.trim().toLowerCase());
  const flights = [];
  
  lines.forEach(line => {
    const values = line.split(",");
    const obj = {};
    keys.forEach((k, i) => obj[k] = values[i]?.trim());
    
    flights.push({
      callsign: obj.callsign,
      depicao: obj.departureicao,
      alticao: obj.alternateicao,
      std: obj.departuretime.endsWith("Z") ? obj.departuretime : obj.departuretime + "Z",
      sta: obj.arrivaltime.endsWith("Z") ? obj.arrivaltime : obj.arrivaltime + "Z",
      eta: obj.eta.endsWith("Z") ? obj.eta : obj.eta + "Z",
      arricao: obj.arrivalicao
    });
  });
  
  return flights;
}