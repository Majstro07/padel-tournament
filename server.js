import express from 'express';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLAYTOMIC_VENUES = [
  {
    id: 'padel-club-spoje',
    name: 'Padel Club Spoje',
    tenantId: '61e73f55-98c6-405f-ac6b-e2677af5905f',
    url: 'https://playtomic.io/clubs/padel-club-spoje',
  },
  {
    id: 'tenis-pisecna',
    name: 'Tenis & Padel Písečná',
    tenantId: '33257960-acca-4aa4-9f77-b6e5ab56f3e5',
    url: 'https://playtomic.io/clubs/tenis-a-padel-klub-pisecna',
  },
];

async function fetchPlaytomic(venue, date) {
  const url =
    `https://api.playtomic.io/v1/availability` +
    `?user_id=me&sport_id=PADEL` +
    `&start_min=${date}T00:00:00&start_max=${date}T23:59:59` +
    `&tenant_id=${venue.tenantId}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`Playtomic HTTP ${res.status}`);
  const data = await res.json();

  // Flatten slots from all resources, keep unique time+duration combos (cheapest price)
  const slotMap = new Map();
  for (const resource of data) {
    for (const slot of resource.slots) {
      const key = `${slot.start_time}-${slot.duration}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          time: slot.start_time.slice(0, 5),
          duration: slot.duration,
          price: slot.price,
          available: true,
        });
      }
    }
  }
  const slots = Array.from(slotMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  return { ...venue, slots };
}

const PADEL_POWERS_SMICHOV = {
  id: 'padel-powers-smichov',
  name: 'Padel Powers Smíchov',
  url: 'https://www.padelpowers.com/rezervace/court-booking/reservation/?location=Sm%C3%ADchov',
  organisationId: '48c8d621-a469-4645-17ee-08db9da35083',
  federationId:   '30c6ef06-0a88-4ed7-a0ba-23352869c8a1',
  locationId:     '205c6c05-c583-4d1f-b10d-1b3c3ff47bac',
  reservationTypeId: 85,
};

async function fetchPadelPowers(venue, date, duration) {
  const url =
    `https://api.foys.io/court-booking/public/api/v1/locations/search` +
    `?date=${date}&duration=${duration}&reservationTypeId=${venue.reservationTypeId}&locationId=${venue.locationId}`;

  const res = await fetch(url, {
    headers: {
      'X-OrganisationId': venue.organisationId,
      'X-FederationID':   venue.federationId,
      'User-Agent': 'Mozilla/5.0',
    },
  });
  if (!res.ok) throw new Error(`Padel Powers HTTP ${res.status}`);
  const locations = await res.json();

  // Collect available slots across all courts, deduplicated by start time
  const slotMap = new Map();
  for (const loc of locations) {
    for (const court of (loc.inventoryItemsTimeSlots || [])) {
      for (const slot of (court.timeSlots || [])) {
        if (!slot.isAvailable) continue;
        if (slot.duration !== duration) continue; // only collect slots for the requested duration
        const time = slot.startTime.slice(11, 16);
        if (!slotMap.has(time)) {
          slotMap.set(time, {
            time,
            duration: slot.duration,
            price: `${Math.round(slot.price)} CZK`,
            available: true,
            courts: 1,
          });
        } else {
          slotMap.get(time).courts += 1;
        }
      }
    }
  }

  const slots = Array.from(slotMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  return { ...venue, slots };
}

async function fetchSlavia() {
  const res = await fetch('https://rezervace.padelslavia.cz/cs/rezervace', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`Slavia HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const slots = [];
  $('tbody tr').each((_, row) => {
    const timeTd = $(row).find('td').filter((_, td) => $(td).hasClass('bg-hlavni_barva')).first();
    const time = timeTd.text().trim();
    if (!/^\d{2}:\d{2}$/.test(time)) return;

    const freeCourts = $(row).find('td.volno').length;
    if (freeCourts > 0) {
      slots.push({ time, duration: 30, courts: freeCourts, available: true });
    }
  });

  return {
    id: 'slavia',
    name: 'SK Slavia Praha Padel',
    url: 'https://rezervace.padelslavia.cz/cs/rezervace',
    todayOnly: true,
    slots,
  };
}

app.get('/api/availability', async (req, res) => {
  const date     = req.query.date     || new Date().toISOString().slice(0, 10);
  const duration = Number(req.query.duration) || 90;

  const fetchers = [
    ...PLAYTOMIC_VENUES.map(v => fetchPlaytomic(v, date)),
    fetchPadelPowers(PADEL_POWERS_SMICHOV, date, duration),
    fetchSlavia(),
  ];
  const names = [
    ...PLAYTOMIC_VENUES.map(v => v.name),
    PADEL_POWERS_SMICHOV.name,
    'SK Slavia Praha Padel',
  ];

  const results = await Promise.allSettled(fetchers);

  const venues = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`Failed to fetch ${names[i]}:`, r.reason?.message);
    return null;
  }).filter(Boolean);

  res.json(venues);
});

// Serve the built React app in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
