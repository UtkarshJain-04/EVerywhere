const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const ChargingVisit = require('../models/ChargingVisit');
const { updateStationReviewStats } = require('../controllers/reviewController');

async function seedInitialReviews() {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const existingCount = await Review.countDocuments();
    if (existingCount > 0) {
      return; // Already seeded
    }

    // Find or create a demo community user for seed reviews
    let demoUser = await User.findOne({ email: 'community.ev@chargenav.com' });
    if (!demoUser) {
      demoUser = new User({
        name: 'Arjun Mehta',
        email: 'community.ev@chargenav.com',
        password: 'Password123!',
        vehicleModel: 'Tata Nexon EV Max',
        batteryCapacity: 40.5,
        vehicle: {
          brand: 'Tata',
          model: 'Nexon EV Max',
          batteryCapacity: 40.5,
          rangeKm: 312,
          vehicleType: 'Electric Car',
          maxChargingSpeed: 50,
          connectorType: 'CCS2',
        },
      });
      await demoUser.save();
    }

    let demoUser2 = await User.findOne({ email: 'priya.ev@chargenav.com' });
    if (!demoUser2) {
      demoUser2 = new User({
        name: 'Priya Nair',
        email: 'priya.ev@chargenav.com',
        password: 'Password123!',
        vehicleModel: 'MG ZS EV',
        batteryCapacity: 50.3,
        vehicle: {
          brand: 'MG',
          model: 'ZS EV',
          batteryCapacity: 50.3,
          rangeKm: 340,
          vehicleType: 'Electric Car',
          maxChargingSpeed: 50,
          connectorType: 'CCS2',
        },
      });
      await demoUser2.save();
    }

    let demoUser3 = await User.findOne({ email: 'rohit.ev@chargenav.com' });
    if (!demoUser3) {
      demoUser3 = new User({
        name: 'Rohit Verma',
        email: 'rohit.ev@chargenav.com',
        password: 'Password123!',
        vehicleModel: 'Mahindra XUV400',
        batteryCapacity: 39.4,
        vehicle: {
          brand: 'Mahindra',
          model: 'XUV400',
          batteryCapacity: 39.4,
          rangeKm: 290,
          vehicleType: 'Electric Car',
          maxChargingSpeed: 50,
          connectorType: 'CCS2',
        },
      });
      await demoUser3.save();
    }

    // Record verified visits
    await ChargingVisit.create([
      {
        user: demoUser._id,
        stationId: 'EESL428',
        stationName: 'EESL Charging Station',
        verifiedVia: 'chargenav_journey',
      },
      {
        user: demoUser2._id,
        stationId: 'EESL428',
        stationName: 'EESL Charging Station',
        verifiedVia: 'chargenav_journey',
      },
      {
        user: demoUser._id,
        stationId: 'EESL429',
        stationName: 'EESL Fast Charger',
        verifiedVia: 'chargenav_journey',
      },
      {
        user: demoUser3._id,
        stationId: 'DL01',
        stationName: 'Tata Power Charging Station',
        verifiedVia: 'chargenav_journey',
      },
    ]);

    // Initial Community Reviews
    const sampleReviews = [
      {
        stationId: 'EESL428',
        user: demoUser._id,
        userName: demoUser.name,
        userEmail: demoUser.email,
        rating: 5,
        reviewText:
          'Excellent fast charging experience! Routed here via ChargeNav when driving from Connaught Place. Plugged into the 25 kW DC CCS2 charger and went from 24% to 80% in 35 minutes. Dedicated parking slot was clear and well-lit.',
        evFeedback: {
          chargingSpeed: 'Blazing Fast (24-25 kW sustained)',
          stationCondition: 'All Chargers Working',
          connectorAvailability: 'Immediately Available',
          waitTime: 'No Wait',
          cleanlinessSafety: 'Safe & Well-Lit',
          pricingExperience: 'Standard Tariff (Good Value)',
        },
        helpfulVotes: [demoUser2._id, demoUser3._id],
        helpfulCount: 14,
        isVerifiedVisit: true,
      },
      {
        stationId: 'EESL428',
        user: demoUser2._id,
        userName: demoUser2.name,
        userEmail: demoUser2.email,
        rating: 4,
        reviewText:
          'Very solid location in Central Delhi. Easy access right off Rafi Marg. Staff on-site was polite and helped with cable connection. One bay was busy so had to wait ~5 mins, but once plugged in the charging curve was smooth.',
        evFeedback: {
          chargingSpeed: 'Expected Speed',
          stationCondition: 'All Chargers Working',
          connectorAvailability: 'Waited for Plug (< 5m)',
          waitTime: '< 15 mins',
          cleanlinessSafety: 'Safe & Well-Lit',
          pricingExperience: 'Standard Tariff',
        },
        helpfulVotes: [demoUser._id],
        helpfulCount: 8,
        isVerifiedVisit: true,
      },
      {
        stationId: 'EESL429',
        user: demoUser._id,
        userName: demoUser.name,
        userEmail: demoUser.email,
        rating: 5,
        reviewText:
          'Fast and dependable. Clean surroundings and reliable power supply. The ChargeNav intermediate stop navigation routed me right to the charging bay entrance.',
        evFeedback: {
          chargingSpeed: 'Blazing Fast',
          stationCondition: 'All Chargers Working',
          connectorAvailability: 'Immediately Available',
          waitTime: 'No Wait',
          cleanlinessSafety: 'Safe & Well-Lit',
          pricingExperience: 'Great Value',
        },
        helpfulVotes: [demoUser3._id],
        helpfulCount: 6,
        isVerifiedVisit: true,
      },
      {
        stationId: 'DL01',
        user: demoUser3._id,
        userName: demoUser3.name,
        userEmail: demoUser3.email,
        rating: 5,
        reviewText:
          'Smooth 30 kW DC fast charging experience. Plugged in, scanned RFID, and was up and running. Good cafe options nearby while the EV topped up.',
        evFeedback: {
          chargingSpeed: 'Blazing Fast',
          stationCondition: 'All Chargers Working',
          connectorAvailability: 'Immediately Available',
          waitTime: 'No Wait',
          cleanlinessSafety: 'Safe & Well-Lit',
          pricingExperience: 'Standard Tariff',
        },
        helpfulVotes: [demoUser._id, demoUser2._id],
        helpfulCount: 11,
        isVerifiedVisit: true,
      },
    ];

    await Review.insertMany(sampleReviews);

    // Update stats on station documents
    await updateStationReviewStats('EESL428');
    await updateStationReviewStats('EESL429');
    await updateStationReviewStats('DL01');

    console.log('✅ Seeded initial verified community reviews.');
  } catch (err) {
    console.warn('Review seed notice:', err.message);
  }
}

module.exports = { seedInitialReviews };

