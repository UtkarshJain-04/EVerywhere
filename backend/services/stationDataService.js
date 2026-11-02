const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Station = require('../models/Station');

// Load static fallback dataset
const initialStationsPath = path.resolve(__dirname, '..', 'data', 'initialStations.json');
let initialStations = [];

try {
  if (fs.existsSync(initialStationsPath)) {
    initialStations = JSON.parse(fs.readFileSync(initialStationsPath, 'utf-8'));
  }
} catch (err) {
  console.error('Failed to load initialStations.json:', err.message);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0; // km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
  const c = 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
  return R * c;
}

/**
 * Seeds or syncs the 15 stations into MongoDB idempotently.
 * Safe to call multiple times without creating duplicates.
 */
async function seedStations() {
  if (mongoose.connection.readyState !== 1) {
    return {
      success: false,
      message: 'MongoDB is not connected. Seed operation skipped; operating with in-memory dataset.',
      count: initialStations.length,
    };
  }

  try {
    let upsertedCount = 0;
    for (const stationData of initialStations) {
      await Station.findOneAndUpdate(
        { uid: String(stationData.uid) },
        {
          uid: String(stationData.uid),
          name: stationData.name || 'Charging Station',
          vendor_name: stationData.vendor_name || '',
          address: stationData.address || '',
          city: stationData.city || 'New Delhi',
          country: stationData.country || 'India',
          latitude: Number(stationData.latitude),
          longitude: Number(stationData.longitude),
          capacity: Number(stationData.capacity || 0),
          cost_per_unit: String(stationData.cost_per_unit || ''),
          available: Number(stationData.available || 0),
          total: Number(stationData.total || 0),
          power_type: String(stationData.power_type || 'AC'),
          charger_type: String(stationData.type || stationData.charger_type || ''),
          vehicle_type: String(stationData.vehicle_type || "['4W']"),
          open: String(stationData.open || '00:00:00'),
          close: String(stationData.close || '23:59:59'),
          logo_url: String(stationData.logo_url || ''),
          staff: String(stationData.staff || ''),
          payment_modes: String(stationData.payment_modes || ''),
          contact_numbers: String(stationData.contact_numbers || ''),
          zone: String(stationData.zone || ''),
          postal_code: String(stationData.postal_code || ''),
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      upsertedCount++;
    }

    console.log(`✅ Seeded/synced ${upsertedCount} stations into MongoDB.`);
    return { success: true, count: upsertedCount };
  } catch (err) {
    console.error('Error seeding stations into MongoDB:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves stations with filtering support.
 * Checks MongoDB first; falls back seamlessly to in-memory JSON.
 */
async function getStations(query = {}) {
  const {
    city,
    minSpeed,
    availableOnly,
    powerType,
    vehicleType,
    search,
    limit = 50,
  } = query;

  // Try MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (city) filter.city = new RegExp(city, 'i');
      if (minSpeed) filter.capacity = { $gte: Number(minSpeed) };
      if (availableOnly === 'true' || availableOnly === true) filter.available = { $gt: 0 };
      if (powerType) filter.power_type = new RegExp(powerType, 'i');
      if (vehicleType) filter.vehicle_type = new RegExp(vehicleType, 'i');
      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { vendor_name: new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') },
        ];
      }

      const stations = await Station.find(filter).limit(Number(limit)).lean();
      if (stations.length > 0) {
        return stations;
      }
    } catch (err) {
      console.warn('MongoDB query failed, falling back to in-memory dataset:', err.message);
    }
  }

  // Fallback: in-memory dataset
  let results = [...initialStations];

  if (city) {
    results = results.filter((s) => s.city && s.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (minSpeed) {
    const minS = Number(minSpeed);
    results = results.filter((s) => Number(s.capacity) >= minS);
  }
  if (availableOnly === 'true' || availableOnly === true) {
    results = results.filter((s) => Number(s.available) > 0);
  }
  if (powerType) {
    results = results.filter(
      (s) => s.power_type && s.power_type.toLowerCase().includes(powerType.toLowerCase())
    );
  }
  if (vehicleType) {
    results = results.filter(
      (s) => s.vehicle_type && s.vehicle_type.toLowerCase().includes(vehicleType.toLowerCase())
    );
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.vendor_name && s.vendor_name.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
    );
  }

  return results.slice(0, Number(limit));
}

/**
 * Retrieves a station by its uid or MongoDB _id.
 */
async function getStationById(id) {
  if (mongoose.connection.readyState === 1) {
    try {
      const station = await Station.findOne({
        $or: [{ uid: String(id) }, ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])],
      }).lean();
      if (station) return station;
    } catch {
      // fallback
    }
  }

  return initialStations.find((s) => String(s.uid) === String(id)) || null;
}

module.exports = {
  seedStations,
  getStations,
  getStationById,
  haversineDistance,
  initialStations,
};
