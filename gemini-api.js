/* gemini-api.js - Gemini API Structured Client & High-Fidelity Indian Sandbox Itineraries */


// Structured response schema to request from Gemini 1.5 Flash
const GEMINI_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    tripName: { type: "STRING" },
    destination: { type: "STRING" },
    fromCity: { type: "STRING" },
    budgetLevel: { type: "STRING" },
    budgetINR: { type: "INTEGER" },
    durationDays: { type: "INTEGER" },
    travelersCount: { type: "INTEGER" },
    travelStyle: { type: "STRING" },
    costPerDayEstimate: { type: "STRING" },
    weather: {
      type: "OBJECT",
      properties: {
        tempCelsius: { type: "STRING" },
        condition: { type: "STRING" },
        humidity: { type: "STRING" },
        bestTime: { type: "STRING" }
      },
      required: ["tempCelsius", "condition"]
    },
    bestTimeToVisit: {
      type: "OBJECT",
      properties: {
        idealMonths: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        peakSeason: { type: "STRING" },
        offSeason: { type: "STRING" },
        summary: { type: "STRING" }
      },
      required: ["idealMonths", "peakSeason", "offSeason", "summary"]
    },
    departureConnection: {
      type: "OBJECT",
      properties: {
        mode: { type: "STRING" },
        details: { type: "STRING" },
        estimatedCost: { type: "STRING" },
        scheduleAlert: { type: "STRING" }
      },
      required: ["mode", "details", "estimatedCost"]
    },
    transportGuide: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          mode: { type: "STRING" },
          cost: { type: "STRING" },
          description: { type: "STRING" }
        }
      }
    },
    dayWiseItinerary: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "INTEGER" },
          title: { type: "STRING" },
          description: { type: "STRING" },
          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                time: { type: "STRING" },
                activity: { type: "STRING" },
                location: { type: "STRING" },
                description: { type: "STRING" },
                cost: { type: "STRING" }
              }
            }
          }
        }
      }
    },
    hotels: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          rating: { type: "STRING" },
          priceRange: { type: "STRING" },
          description: { type: "STRING" },
          whyChoose: { type: "STRING" }
        }
      }
    },
    attractions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          duration: { type: "STRING" },
          cost: { type: "STRING" },
          description: { type: "STRING" }
        }
      }
    },
    food: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          dishName: { type: "STRING" },
          type: { type: "STRING" },
          recommendedPlace: { type: "STRING" },
          cost: { type: "STRING" },
          description: { type: "STRING" }
        }
      }
    },
    packingList: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    budgetBreakdown: {
      type: "OBJECT",
      properties: {
        accommodation: { type: "INTEGER" },
        activities: { type: "INTEGER" },
        food: { type: "INTEGER" },
        transport: { type: "INTEGER" },
        shopping: { type: "INTEGER" },
        miscellaneous: { type: "INTEGER" },
        currency: { type: "STRING" }
      }
    },
    emergencyCard: {
      type: "OBJECT",
      properties: {
        numbers: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              label: { type: "STRING" },
              value: { type: "STRING" }
            }
          }
        },
        hospitals: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        touristHelpline: { type: "STRING" },
        localSafetyTips: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["numbers", "hospitals", "touristHelpline", "localSafetyTips"]
    },
    safetyTips: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    hiddenGems: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          location: { type: "STRING" },
          description: { type: "STRING" },
          whySpecial: { type: "STRING" }
        }
      }
    }
  },
  required: [
    "tripName", "destination", "fromCity", "budgetLevel", "budgetINR", "durationDays", 
    "travelersCount", "travelStyle", "costPerDayEstimate", "weather", "bestTimeToVisit",
    "departureConnection", "transportGuide", "dayWiseItinerary", "hotels", "attractions", 
    "food", "packingList", "budgetBreakdown", "emergencyCard", "safetyTips", "hiddenGems"
  ]
};

// High-Fidelity Pre-designed Sandbox Demo Itineraries
const SANDBOX_DEMO_TRIPS = {
  goa: {
    tripName: "Goa Sunny Adventure Escape",
    destination: "Goa, India",
    fromCity: "Kolkata",
    budgetLevel: "Adventure Budget",
    budgetINR: 20000,
    durationDays: 4,
    travelersCount: 2,
    travelStyle: "Adventure",
    costPerDayEstimate: "₹3,500 per traveler",
    weather: {
      tempCelsius: "28°C",
      condition: "Sunny Beaches",
      humidity: "70%",
      bestTime: "November to March"
    },
    bestTimeToVisit: {
      idealMonths: ["November", "December", "January", "February"],
      peakSeason: "Winter (Nov-Feb), ideal for beach shacks, Sunburn, and scuba diving.",
      offSeason: "Monsoons (Jun-Sep), high-tides, scenic waterfalls, lush green groves.",
      summary: "Golden sun, soft sea breezes, and cool evening beach stroll temperatures."
    },
    departureConnection: {
      mode: "Direct Flight (IndiGo)",
      details: "CCU (Netaji Subhash) to GOI (Manohar Goa Airport). Round-trip tickets pre-estimated.",
      estimatedCost: "₹7,200 roundtrip",
      scheduleAlert: "Daily direct flight departs CCU at 08:15 AM, landing in Goa by 11:00 AM."
    },
    transportGuide: [
      { mode: "Scooter Rental", cost: "₹450 / day", description: "Standard Activa. Essential for dynamic beach hopping in North/South Goa." },
      { mode: "Self-Drive Thar", cost: "₹2,500 / day", description: "Open-top jeep experience, perfect for coastal roads and sandy paths." },
      { mode: "Local Auto", cost: "₹150 - ₹400 / ride", description: "Convenient for short transit between markets and hotel doors." }
    ],
    dayWiseItinerary: [
      {
        day: 1,
        title: "North Goa Beach Landings & Cliffs",
        description: "Arrive in Goa, rent scooters, check into a vibrant beach stay, and catch a classic cliff sunset.",
        activities: [
          { time: "09:30 AM", activity: "Breakfast at German Bakery", location: "Anjuna", description: "A gorgeous open garden café serving fresh croissants, pancakes, and organic tea.", cost: "₹350" },
          { time: "11:30 AM", activity: "Vagator Beach Stroll & Ruins", location: "Vagator Red Cliffs", description: "Explore the cliffs and walk up the historic Chapora Fort ruins looking down at the coastline.", cost: "Free" },
          { time: "03:00 PM", activity: "Water Sports & Jet Skiing", location: "Baga Beach", description: "Thrill-filled speed rides and parasailing guided by licensed operators on Baga's sands.", cost: "₹1,500" },
          { time: "06:00 PM", activity: "Sunset Drinks at Curlies Shack", location: "Anjuna Beach", description: "Classic sunset view with chilled beverages, upbeat lounge tracks, and dynamic ocean vibes.", cost: "₹600" }
        ]
      },
      {
        day: 2,
        title: "Island Snorkeling & Hidden Blue Lagoons",
        description: "Embark on an ocean cruise to spot dolphins, snorkel in crystal bays, and dine on a private beach.",
        activities: [
          { time: "08:00 AM", activity: "Grand Island Boat Cruise & Snorkeling", location: "Coco Beach Jetty", description: "Enjoy a scenic boat cruise with dolphin spotting, bottom-fishing, and reef snorkeling.", cost: "₹1,800" },
          { time: "01:30 PM", activity: "Monkey Beach BBQ Lunch", location: "Monkey Island", description: "Feast on a freshly prepared grilled fish (or vegetarian) buffet lunch right on a hidden sand cove.", cost: "Included in Cruise" },
          { time: "05:30 PM", activity: "Explore Miramar Beach sunset walk", location: "Panaji", description: "Walk along the broad beach where the majestic Mandovi River joins the Arabian Sea.", cost: "Free" },
          { time: "08:00 PM", activity: "Dinner at Fisherman's Wharf", location: "Panaji Estuary", description: "Premium atmospheric dining beside the river waters with live Konkani acoustic bands.", cost: "₹900" }
        ]
      },
      {
        day: 3,
        title: "Hidden Beaches Trek & Offroad Waterfalls",
        description: "Explore South Goa's absolute best hidden gems: a freshwater lagoon and a secret beach cove trek.",
        activities: [
          { time: "09:00 AM", activity: "Trek to Butterfly Beach", location: "Palolem", description: "A brief, beautiful jungle walk opening up to a quiet, butterfly-shaped pristine sand cove.", cost: "Free" },
          { time: "12:30 PM", activity: "Swim in Kakolem Beach Lagoon", location: "Kakolem", description: "Explore the dramatic cliffs of Kakolem Beach where a cool freshwater stream drops directly onto the sand.", cost: "Free" },
          { time: "03:00 PM", activity: "Jeep Safari to Dudhsagar Falls", location: "Mollem Forest Reserve", description: "A bumpy offroad jungle jeep safari leading to the spectacular 4-tiered cascading waterfall.", cost: "₹950" },
          { time: "07:30 PM", activity: "Dinner at Thalassa Greek Tavern", location: "Siolim", description: "Savor premium Greek souvlakis overlooking the river mouth with fire dances and sunset decor.", cost: "₹1,200" }
        ]
      },
      {
        day: 4,
        title: "Portuguese Latin Quarters & Departure",
        description: "Soak in the colorful colonial heritage of Panaji, buy souvenirs, and catch your flight home.",
        activities: [
          { time: "09:30 AM", activity: "Colonial Walk in Fontainhas", location: "Panaji Quarter", description: "Walk through narrow lanes lined with bright yellow, purple, and green 18th-century houses.", cost: "Free" },
          { time: "11:30 AM", activity: "Visit Basilica of Bom Jesus", location: "Old Goa", description: "Pay respects at the UNESCO World Heritage site holding the preserved remains of St. Francis Xavier.", cost: "Free" },
          { time: "01:00 PM", activity: "Goan Fish Thali Feast", location: "Ritz Classic, Panaji", description: "Indulge in a premium authentic thali containing rawa-fried kingfish, crab curry, rice, and kismoor.", cost: "₹350" },
          { time: "03:00 PM", activity: "Cashew & Feni Shopping", location: "Panaji Market", description: "Pick up authentic local cashew nuts, Bebinca cake, and spice extracts to carry home.", cost: "₹500" }
        ]
      }
    ],
    hotels: [
      { name: "Pappi Chulo Hostel & Bungalows", rating: "4.4★", priceRange: "₹900 - ₹1,400 / night", description: "Vibrant beachside hostel located right above Vagator beach cliffs, featuring colorful murals, graffiti, and a lively bar.", whyChoose: "Best budget community hub for solo and group adventure seekers." },
      { name: "Sandalwood Hotel & Retreat", rating: "4.5★", priceRange: "₹3,500 - ₹5,000 / night", description: "Premium boutique resort steps away from Vainguinim beach, offering a beautiful pool, sea views, and lush gardens.", whyChoose: "High comfort rooms close to serene beaches." }
    ],
    attractions: [
      { name: "Chapora Fort Ruins", duration: "1 hour", cost: "Free", description: "Famous hilltop ruins overlooking the sea, immortalized in Bollywood films." },
      { name: "Dudhsagar Waterfall", duration: "4 hours", cost: "₹950", description: "Lush national park sanctuary housing the towering milky white cascades." }
    ],
    food: [
      { dishName: "Traditional Goan Fish Curry", type: "Main Course", recommendedPlace: "Viva Panjim, Panaji", cost: "₹320", description: "Fresh kingfish cooked in rich, spiced coconut milk gravy paired with warm red rice." },
      { dishName: "Bebinca Cake with Vanilla Ice Cream", type: "Dessert", recommendedPlace: "Ritz Classic, Panaji", cost: "₹180", description: "Indo-Portuguese multi-layered warm pudding baked with rich coconut ghee." }
    ],
    packingList: [
      "Light linen and cotton outfits",
      "Flip-flops and strap-on sandals",
      "High factor SPF sunscreen and sunglasses",
      "Dry-bag for electronic safety on boat rides",
      "Rehydrating salts / ORS sachets"
    ],
    budgetBreakdown: {
      accommodation: 4500,
      activities: 4000,
      food: 4200,
      transport: 3000,
      shopping: 3000,
      miscellaneous: 1300,
      currency: "INR"
    },
    emergencyCard: {
      numbers: [
        { label: "Goa Police Helpline", value: "112" },
        { label: "Tourist Protection Force", value: "+91-832-2425555" },
        { label: "Manipal Hospital Goa", value: "+91-832-3041999" }
      ],
      hospitals: ["Manipal Hospital, Panaji", "Vintage Hospital, Panaji"],
      touristHelpline: "1800-233-5060",
      localSafetyTips: [
        "Wear dual helmets on scooters strictly; Goa Police enforces high fines.",
        "Ensure lifesaver rings/jackets are present when boarding grand island ferries.",
        "Never drive rented scooters directly onto the beach sand; they get stuck and fineable."
      ]
    },
    safetyTips: [
      "Wear double helmets on scooters. Police check strictly.",
      "Check life jackets on sea cruises.",
      "Avoid remote rocky beach stretches after dark."
    ],
    hiddenGems: [
      { name: "Butterfly Beach Cove", location: "Palolem, South Goa", description: "A gorgeous, secluded butterfly-shaped sand beach accessible only via a brief forest walk or motor boat.", whySpecial: "Absolute serene sands, zero commercial shacks, and dolphins playing close to the shore." },
      { name: "Kakolem Beach Lagoon", location: "Kakolem, South Goa", description: "A highly dramatic wild beach flanked by rocky cliffs where a fresh stream crashes down onto the sand.", whySpecial: "Includes a natural cold-water beach shower pool completely hidden from tourist guides." }
    ]
  },
  
  manali: {
    tripName: "Manali Alpine Adventure Peak",
    destination: "Manali, Himachal Pradesh",
    fromCity: "Delhi",
    budgetLevel: "Moderate Adventure",
    budgetINR: 18000,
    durationDays: 5,
    travelersCount: 2,
    travelStyle: "Adventure",
    costPerDayEstimate: "₹3,200 per traveler",
    weather: {
      tempCelsius: "14°C",
      condition: "Cool & Pleasant",
      humidity: "58%",
      bestTime: "October to June"
    },
    bestTimeToVisit: {
      idealMonths: ["October", "November", "December", "January", "March", "April"],
      peakSeason: "Winters (Dec-Jan) for snow, paragliding, and skiing; Summers (Mar-Jun) for escaping plains heat.",
      offSeason: "Monsoons (Jul-Sep) for high landslide risk, river-rafting shut, low hotel rates.",
      summary: "Chilly high-altitude mountain winds, clear snowy peak vistas, and cozy fireplace nights."
    },
    departureConnection: {
      mode: "Volvo AC Sleeper Bus (HRTC)",
      details: "Delhi ISBT Kashmiri Gate to Manali Private Bus Stand. Overnight comfortable semi-sleeper seats.",
      estimatedCost: "₹2,400 roundtrip",
      scheduleAlert: "Buses depart Delhi daily between 06:00 PM - 09:00 PM, arriving in Manali by 08:30 AM next day."
    },
    transportGuide: [
      { mode: "Royal Enfield Rental", cost: "₹1,200 / day", description: "Enfield Classic 350. The definitive mountain cruiser for Solang and Sethan curves." },
      { mode: "Local SUV Taxi", cost: "₹2,500 / day", description: "Safe and reliable driving through snowy roads and Atal Tunnel." },
      { mode: "Local Bus network", cost: "₹40 - ₹120 / ticket", description: "Connects Manali base to Kullu, Naggar, and Solang affordable." }
    ],
    dayWiseItinerary: [
      {
        day: 1,
        title: "Old Manali Cedar Woods & Rushing Rivers",
        description: "Arrive in Manali, rent cruisers, check into your cottage, and dine next to the icy Beas River.",
        activities: [
          { time: "10:00 AM", activity: "Walk through Hadimba Forest", location: "Hadimba Temple", description: "Visit the iconic 16th-century wooden pagoda temple surrounded by massive ancient deodar pines.", cost: "Free" },
          { time: "01:00 PM", activity: "Lunch at Café 1947", location: "Old Manali Village", description: "Manali's legendary riverfront cafe. Savor delicious hand-rolled Italian pizzas next to rushing glacier water.", cost: "₹650" },
          { time: "03:30 PM", activity: "Stroll Old Manali Village", location: "Old Manali", description: "Explore traditional wooden houses, organic honey shops, and cozy handloom apparel stalls.", cost: "Free" }
        ]
      },
      {
        day: 2,
        title: "Solang Valley Snow Glides & High Flights",
        description: "A day of high-adrenaline adventure sports in Solang Valley flanked by mighty snowy ridges.",
        activities: [
          { time: "09:00 AM", activity: "Solang Paragliding High Flight", location: "Solang Valley Peak", description: "Soar high over Solang's pine valleys with an experienced tandem pilot.", cost: "₹2,200" },
          { time: "12:30 PM", activity: "Zorbing and Quad Biking", location: "Solang Meadows", description: "Roll down grassy slopes inside a massive inflatable ball, followed by an offroad quad run.", cost: "₹700" },
          { time: "03:30 PM", activity: "Anjani Mahadev Ice Temple Hike", location: "Solang", description: "Scenic 2km walk to a massive waterfall that freezes into an ice column in cold seasons.", cost: "Free" }
        ]
      },
      {
        day: 3,
        title: "Sethan Snow Village Igloos & Boulder Treks",
        description: "Drive to the quiet Buddhist hamlet of Sethan, explore offbeat igloos, and try rock bouldering.",
        activities: [
          { time: "09:00 AM", activity: "Sethan Village Cruiser Drive", location: "Sethan (Hampta Pass Route)", description: "Negotiate 38 sweeping switchback curves up to the serene village at 9,000 feet.", cost: "Free" },
          { time: "11:30 AM", activity: "Igloo Village walk & Snow boarding", location: "Sethan Valley", description: "Stroll through the stunning eco-friendly winter igloos and try basic snowboard balance slides.", cost: "₹1,200" },
          { time: "03:00 PM", activity: "Explore Buddhist Monasteries", location: "Sethan Village", description: "Soak in absolute spiritual peace at the small, colorful local gompa decorated with prayer flags.", cost: "Free" }
        ]
      },
      {
        day: 4,
        title: "Jogini Waterfall Trek & Hot Springs",
        description: "Trek through pine woods to a spectacular cliff waterfall and bathe in sacred hot springs.",
        activities: [
          { time: "09:30 AM", activity: "Trek to Jogini Waterfalls", location: "Vashisht Woods", description: "A gorgeous pine-shaded forest trail leading up to the giant cliff-side waterfall sprays.", cost: "Free" },
          { time: "01:00 PM", activity: "Bathe in Vashisht Sulphur Springs", location: "Vashisht Village", description: "Rejuvenate tired muscles in the natural thermal hot springs inside the ancient Vashisht temple complex.", cost: "Free" },
          { time: "03:00 PM", activity: "Himachali Dham Traditional Lunch", location: "Vashisht Market", description: "Savor a local celebratory feast containing split peas, slow-cooked curd gravies, and sweet rice.", cost: "₹250" }
        ]
      },
      {
        day: 5,
        title: "Atal Tunnel Drive & Delhi Departure",
        description: "Drive through the engineering marvel of Atal Tunnel to Lahaul Valley before boarding the evening sleeper bus.",
        activities: [
          { time: "09:00 AM", activity: "Drive through Atal Tunnel to Lahaul", location: "Sissu, Lahaul", description: "Cross the 9.02km engineering marvel to Sissu village. Capture high waterfalls and snowy high valleys.", cost: "Free" },
          { time: "02:00 PM", activity: "Shopping at Mall Road", location: "Manali Mall Road", description: "Buy pure saffron, sea buckthorn tea, hand-knitted woolen Kullu shawls, and wooden spoons.", cost: "₹800" }
        ]
      }
    ],
    hotels: [
      { name: "The Johnson's Lodge & Spa", rating: "4.5★", priceRange: "₹3,500 - ₹5,500 / night", description: "Cozy rooms with stone fireplaces, warm wood panelling, and a famous lawn bar serving trout.", whyChoose: "Legendary trout culinary dishes and outstanding warm mountain fireplace comfort." },
      { name: "Sethan Alpine Eco-Hostel", rating: "4.6★", priceRange: "₹1,000 - ₹1,800 / night", description: "Authentic rustic hostel looking out at Hampta Pass, famous for organizing snow igloo camping and treks.", whyChoose: "Perfect base for high altitude snow bouldering and peace." }
    ],
    attractions: [
      { name: "Hadimba Temple", duration: "1 hour", cost: "Free", description: "Ancient pagodastyle wooden temple dedicated to Hadimba Devi, surrounded by deodar pine giants." },
      { name: "Atal Tunnel & Sissu Sights", duration: "5 hours", cost: "Free", description: "9.02km tunnel leading into the spectacular dry mountains of Lahaul Valley." }
    ],
    food: [
      { dishName: "Wood-Fired Himalayan Rainbow Trout", type: "Main Course", recommendedPlace: "Johnson's Café, Manali", cost: "₹650", description: "Freshly caught mountain trout marinated in mild garlic butter and roasted over wood embers." },
      { dishName: "Siddu with ghee", type: "Local Bread", recommendedPlace: "Chopsticks, Mall Road", cost: "₹150", description: "Steamed fermented wheat bread stuffed with local walnuts, poppy seeds, and spices, served hot with liquid ghee." }
    ],
    packingList: [
      "Heavy fleece jacket or windcheater",
      "Thermal inner wear sets",
      "Sturdy waterproof high-grip trekking boots",
      "Warm woolen cap, gloves, and thick socks",
      "Cold cream and lip balm"
    ],
    budgetBreakdown: {
      accommodation: 5500,
      activities: 4200,
      food: 3800,
      transport: 2000,
      shopping: 1500,
      miscellaneous: 1000,
      currency: "INR"
    },
    emergencyCard: {
      numbers: [
        { label: "Manali Police Station", value: "+91-1902-252326" },
        { label: "Himalayan Mountain Rescue", value: "108" },
        { label: "Lady Willingdon Hospital", value: "+91-1902-252379" }
      ],
      hospitals: ["Lady Willingdon Mission Hospital, Manali", "Civil Hospital, Left Bank Road"],
      touristHelpline: "+91-1902-252116",
      localSafetyTips: [
        "Inquire about Solang and Rohtang weather conditions daily before driving up; routes close instantly on heavy snowfall.",
        "Always carry motion sickness pills; winding mountain roads can cause severe nausea.",
        "Dress in layers. High valleys have high windchill factors."
      ]
    },
    safetyTips: [
      "Check high-altitude road blocks before traveling.",
      "Stay hydrated to counter mountain sickness.",
      "Rent certified safety suits for paragliding/snowboarding."
    ],
    hiddenGems: [
      { name: "Sethan Igloo Village", location: "Sethan Hamlet, Hampta Road", description: "An offbeat, quiet Buddhist settlement at 9,000 feet that transforms into an igloo camping dreamscape in winters.", whySpecial: "Completely crowd-free snow boarding, deodar pine forests, and dramatic Hampta peak views." }
    ]
  },
  
  jaipur: {
    tripName: "Jaipur Heritage Royale",
    destination: "Jaipur, Rajasthan",
    fromCity: "Kolkata",
    budgetLevel: "Moderate Heritage",
    budgetINR: 15000,
    durationDays: 3,
    travelersCount: 2,
    travelStyle: "Heritage & Culture",
    costPerDayEstimate: "₹2,800 per traveler",
    weather: {
      tempCelsius: "22°C",
      condition: "Sunny / Pleasant",
      humidity: "40%",
      bestTime: "October to March"
    },
    bestTimeToVisit: {
      idealMonths: ["October", "November", "December", "January", "February", "March"],
      peakSeason: "Winters (Oct-Mar), ideal for palace sightseeing, desert safaris, and camel festival fairs.",
      offSeason: "Summers (Apr-Jun), extreme dry desert heat, high hotel discounts.",
      summary: "Cool pleasant nights, mild afternoon sunlight, and colorful local winter festival pageantry."
    },
    departureConnection: {
      mode: "Direct Flight (Air India Express)",
      details: "CCU (Kolkata) to JAI (Jaipur). Fast and comfortable round-trip connectivity.",
      estimatedCost: "₹6,800 roundtrip",
      scheduleAlert: "Departs CCU at 12:45 PM, reaching Jaipur by 03:00 PM."
    },
    transportGuide: [
      { mode: "E-Rickshaw", cost: "₹80 - ₹150 / ride", description: "Standard silent transport inside the narrow lanes of Jaipur's Pink City market." },
      { mode: "Local Auto-rickshaw", cost: "₹150 - ₹300 / ride", description: "Convenient point-to-point transit from downtown hotels to palace doors." },
      { mode: "Self-Drive Cab / Uber", cost: "₹1,800 / day", description: "Comfortable air-conditioned private hatchbacks, ideal for climbing Nahargarh Aravalli hills." }
    ],
    dayWiseItinerary: [
      {
        day: 1,
        title: "Historic Pink City Palace & Bazaars",
        description: "Arrive in Jaipur, check into a boutique heritage stay, and explore the royal City Palace and markets.",
        activities: [
          { time: "09:30 AM", activity: "Breakfast at Tapri The Tea House", location: "C-Scheme", description: "Rooftop café serving hot tea with delicious local snacks like bun-muska and poha.", cost: "₹250" },
          { time: "11:30 AM", activity: "Visit City Palace & Museum", location: "Chogan", description: "Explore the residence of Jaipur's royal family, showcasing grand courtyards and weaponry.", cost: "₹200" },
          { time: "02:30 PM", activity: "Photograph Hawa Mahal Front", location: "Pink City Market", description: "Capture the magnificent honeycombed screen wall built for royal ladies.", cost: "₹50" },
          { time: "04:30 PM", activity: "Explore colorful Bapu Bazaar", location: "Bapu Bazaar", description: "Shop for traditional leather footwear (juttis), cotton bedsheets, and lac bangles.", cost: "₹500" }
        ]
      },
      {
        day: 2,
        title: "Hilltop Fortresses & Hand-Block Print Curation",
        description: "Scale magnificent mountain ramparts and learn about Rajasthan's world-famous textile crafts.",
        activities: [
          { time: "09:00 AM", activity: "Scale Amer Fort & Palace", location: "Amer Town", description: "Walk through grand courtyards and admire the breathtaking mirror work in the Sheesh Mahal (Hall of Mirrors).", cost: "₹100" },
          { time: "01:00 PM", activity: "Jaigarh Fort & Cannon Forge", location: "Cheel ka Teela Hills", description: "Behold the massive Jaivana Cannon, once the world's largest cannon on wheels, and explore underground armories.", cost: "₹150" },
          { time: "03:30 PM", activity: "Hand Block Printing workshop", location: "Anokhi Museum, Amer", description: "Witness live block-printing demonstrations and try stamping your own organic cotton scarf using natural dyes.", cost: "₹250" },
          { time: "05:30 PM", activity: "Sunset over Nahargarh Fort", location: "Nahargarh Hills", description: "Watch the sunset paint the entire Jaipur cityscape in pink and golden hues from the fort's stone ramparts.", cost: "₹50" }
        ]
      },
      {
        day: 3,
        title: "Artistic Stepwells, Gem Markets & Departure",
        description: "Discover hidden architectural symmetry and shop for exquisite jewelry and handicrafts.",
        activities: [
          { time: "08:30 AM", activity: "Panna Meena ka Kund Stepwell", location: "Amer Road", description: "Photograph the beautifully symmetrical geometric stepwell, an engineering feat of ancient water harvesting.", cost: "Free" },
          { time: "10:30 AM", activity: "Heritage stroll through Albert Hall Museum", location: "Ram Niwas Garden", description: "Explore Rajasthan's oldest state museum housing Persian carpets, miniature paintings, and a genuine Egyptian mummy.", cost: "₹400" },
          { time: "02:00 PM", activity: "Shopping at Johari & Bapu Bazaar", location: "Pink City Markets", description: "Shop for lac bangles, hand-embroidered leather juttis, blue pottery items, and authentic silver jewelry.", cost: "₹800" }
        ]
      }
    ],
    hotels: [
      { name: "Pearl Palace Heritage Hotel", rating: "4.7★", priceRange: "₹2,500 - ₹4,000 / night", description: "Stunning heritage boutique hotel featuring unique, elaborately themed rooms showcasing different Indian artistic styles.", whyChoose: "Incredible artistic aesthetics and highly personalized service for culture lovers." },
      { name: "The Rambagh Palace", rating: "4.9★", priceRange: "₹28,000 - ₹45,000 / night", description: "A legendary heritage palace resort, formerly the actual residence of the Maharaja of Jaipur, featuring lush peacock-filled gardens.", whyChoose: "The absolute pinnacle of luxury royalty and world-class hospitality." }
    ],
    attractions: [
      { name: "Amer Fort", duration: "3 hours", cost: "₹100", description: "Hilltop fort displaying majestic red sandstone walls, Hindu-Rajput architectural elements, and scenic lake vistas." },
      { name: "Hawa Mahal", duration: "1 hour", cost: "₹50", description: "Built in 1799, this unique five-story screen wall palace allowed royal women to observe street festivals undetected." }
    ],
    food: [
      { dishName: "Dal Baati Churma", type: "Traditional Meal", recommendedPlace: "Chokhi Dhani, Tonk Road", description: "Baked round wheat dumplings (baati) crushed and drenched in pure ghee, served with spicy mixed lentil soup (dal) and sweet crumbled wheat (churma)." },
      { dishName: "Pyaaz Kachori", type: "Street Food", recommendedPlace: "Rawat Mishthan Bhandar", description: "Crisp, flaky deep-fried pastry stuffed with a highly spiced, piping hot onion-and-potato mash filling." }
    ],
    packingList: [
      "Breathable, lightweight linen outfits (for dry heat)",
      "Wide-brimmed sun hat or traditional turban scarf",
      "Comfortable slip-on shoes (many temples require removing shoes)",
      "High protection sunscreen and moist wipes",
      "Hand sanitizer and rehydration salts",
      "Sturdy shoulder camera strap"
    ],
    budgetBreakdown: {
      accommodation: 6000,
      activities: 2500,
      food: 4000,
      transport: 2000,
      miscellaneous: 2500,
      currency: "INR"
    },
    safetyTips: [
      "Hire only government-approved guides carrying official ID badges at Amer Fort.",
      "Politely but firmly decline unsolicited shopping detours suggested by local auto-rickshaw drivers.",
      "Drink only bottled, sealed mineral water to prevent digestive upsets.",
      "Beware of aggressive monkeys around Nahargarh Fort; keep food items securely packed."
    ],
    hiddenGems: [
      { name: "Panna Meena ka Kund", location: "Near Amer Fort", description: "An 8-tier symmetrical stepwell built in the 16th century with geometric staircases and a historic community pool.", whySpecial: "A breathtaking masterpiece of ancient water engineering and incredible geometric symmetry." },
      { name: "Galtaji Monkey Temple", location: "Galta Mountain Pass", description: "An ancient, sacred Hindu pilgrimage site nestled inside a mountain pass, featuring deep natural spring pools and thousands of friendly monkeys.", whySpecial: "Incredibly atmospheric architecture carved directly into sheer mountain rocks." }
    ]
  },
  
  kerala: {
    tripName: "Kerala Nature & Backwaters",
    destination: "Kerala, India",
    budgetLevel: "Moderate",
    durationDays: 6,
    travelersCount: 4,
    travelStyle: "Nature & Backwaters",
    costPerDayEstimate: "₹4,000 - ₹6,000 per traveler",
    weather: {
      tempCelsius: "28°C",
      condition: "Humid / Tropical",
      humidity: "80%",
      bestTime: "September to March"
    },
    transportGuide: [
      { mode: "Innova Rental with Driver", cost: "₹3,500 / day", description: "Highly recommended for families traversing winding hill stations and backwater canals comfortably." },
      { mode: "Public Ferry (SWTD)", cost: "₹10 - ₹40 / ticket", description: "Spectacular budget-friendly way to cross backwater channels side-by-side with local commuters." },
      { mode: "KSRTC Local Buses", cost: "₹40 - ₹120 / ticket", description: "Affordable connecting buses between Kochi, Munnar, and Alleppey." }
    ],
    dayWiseItinerary: [
      {
        day: 1,
        title: "Kochi Colonial Heritage & Chinese Fishing Nets",
        description: "Explore the ancient port town of Fort Kochi, rich with Portuguese, Dutch, and Jewish history.",
        activities: [
          { time: "09:30 AM", activity: "Fort Kochi Walking Curation", location: "Fort Kochi", description: "See the massive iconic Chinese Fishing Nets operating along the shore, and visit the historic St. Francis Church.", cost: "Free" },
          { time: "01:00 PM", activity: "Seafood lunch at Kashi Art Café", location: "Fort Kochi", description: "Dine inside a beautiful tree-canopied courtyard gallery café. Try their grilled fish in local spices.", cost: "₹500" },
          { time: "03:30 PM", activity: "Explore Mattancherry Palace", location: "Mattancherry", description: "Also known as the Dutch Palace, it contains outstanding murals depicting Hindu mythological epics.", cost: "₹10" },
          { time: "06:00 PM", activity: "Kathakali Classical Dance show", location: "Kerala Kathakali Centre", description: "Witness the intense makeup application ritual followed by a dramatic storytelling performance through ancient mudras.", cost: "₹400" }
        ]
      },
      {
        day: 2,
        title: "Climbing to Munnar: Waterfalls & Tea Estates",
        description: "Drive up the Western Ghats past rushing waterfalls into rolling hills blanketed in emerald green tea leaves.",
        activities: [
          { time: "08:30 AM", activity: "Drive to Munnar & Cheeyappara Falls", location: "Kochi-Munnar Highway", description: "A gorgeous scenic mountain drive with a stop to witness the majestic seven-tiered Cheeyappara Waterfall.", cost: "Free" },
          { time: "02:00 PM", activity: "Munnar Tea Museum Tour", location: "Nallathanni Estate", description: "Trace the history of tea production in Munnar, see old tea rollers, and enjoy a premium CTC tea tasting session.", cost: "₹150" },
          { time: "04:30 PM", activity: "Walk through Tata Tea Gardens", location: "Munnar", description: "Stroll through the misty, manicured green terraces of tea estates. Perfect spot for family photographs.", cost: "Free" }
        ]
      },
      {
        day: 3,
        title: "Highest Peaks & Spice Gardens",
        description: "Breathe in pure high-altitude mountain air and experience exotic spice agricultural cultivation.",
        activities: [
          { time: "09:00 AM", activity: "Eravikulam National Park Safari", location: "Rajamalai Hills", description: "Board a park bus to spot the highly endangered Nilgiri Tahr (mountain goat) roaming high grasslands.", cost: "₹200" },
          { time: "02:00 PM", activity: "Organic Spice Plantation Tour", location: "Munnar Rural", description: "A guided educational walk to smell and touch growing cardamom, pepper, vanilla, cinnamon, and nutmeg.", cost: "₹200" },
          { time: "05:00 PM", activity: "Sunset at Mattupetty Dam", location: "Munnar", description: "A serene reservoir lake surrounded by dark pine forests. Enjoy a tranquil family boat ride.", cost: "₹300" }
        ]
      },
      {
        day: 4,
        title: "Thekkady Wilderness & Lake Cruise",
        description: "Travel to the Periyar Tiger Reserve to search for wild elephants and indulge in authentic wellness massage.",
        activities: [
          { time: "09:30 AM", activity: "Drive to Thekkady via Cardamom Hills", location: "Western Ghats", description: "Enjoy a breathtakingly scenic drive through endless hills loaded with rubber and cardamom crops.", cost: "Free" },
          { time: "01:30 PM", activity: "Periyar Lake Boat Safari", location: "Periyar National Park", description: "Cruise the artificial lake to spot herds of wild elephants, bisons, and rare marsh birds drinking at the banks.", cost: "₹450" },
          { time: "05:00 PM", activity: "Rejuvenating Ayurvedic Massage", location: "Thekkady Wellness Centre", description: "Indulge in a relaxing, traditional full-body massage using warm herbal medicated oils.", cost: "₹1,200" }
        ]
      },
      {
        day: 5,
        title: "Alleppey Houseboat Cruising (Kettuvallam)",
        description: "Embark on the ultimate Kerala experience: boarding a luxury traditional thatch-roofed houseboat.",
        activities: [
          { time: "11:30 AM", activity: "Board Luxury Houseboat", location: "Alleppey Jetty", description: "Check in to a private, luxury wood-and-bamboo houseboat. Sail past narrow palm-shaded canals and villages.", cost: "₹8,000 (Group split)" },
          { time: "01:30 PM", activity: "Traditional Karimeen lunch on board", location: "Houseboat", description: "Feast on freshly cooked pearl spot fish fry, brown rice, avial, and local coconut delicacies.", cost: "Included in Cruise" },
          { time: "05:00 PM", activity: "Sunset over Vembanad Lake", location: "Alleppey Backwaters", description: "Relax on the open deck as the sun sets over the vast, calm waters. Listen to gentle bird calls.", cost: "Included" }
        ]
      },
      {
        day: 6,
        title: "Marari Beach Relaxation & Departure",
        description: "Wind down on a pristine white-sand beach before taking your flight back home.",
        activities: [
          { time: "09:00 AM", activity: "Marari Beach Leisure stroll", location: "Mararikulam", description: "Walk along a clean, quiet beach shaded by endless rows of towering coconut palms.", cost: "Free" },
          { time: "12:00 PM", activity: "Lunch at Marari Beach Shack", location: "Marari", description: "Enjoy fresh tender coconut water and spicy prawns prepared in traditional clay pots.", cost: "₹400" },
          { time: "03:00 PM", activity: "Departure transfer to Cochin Airport", location: "Kochi", description: "Head to the airport loaded with fresh spices, tea packets, and local banana chips.", cost: "₹1,500" }
        ]
      }
    ],
    hotels: [
      { name: "Deshadan Mountain Resort", rating: "4.5★", priceRange: "₹3,500 - ₹5,000 / night", description: "Munnar's highest resort, offering stunning mist-clad cottages perched on hills overlooking tea valleys.", whyChoose: "Perfect family resort offering high altitude views and cool climate comfort." },
      { name: "Spice Coast Houseboats", rating: "4.8★", priceRange: "₹9,000 - ₹14,000 / night", description: "Authentic Kettuvallam houseboats powered by eco-friendly solar systems and professional local chefs on board.", whyChoose: "The definitive luxury backwater experience." }
    ],
    attractions: [
      { name: "Periyar Tiger Reserve", duration: "3 hours", cost: "₹450", description: "A famous wildlife sanctuary offering scenic lake boat safaris and guided jungle treks." },
      { name: "Alleppey Backwaters", duration: "1 day", cost: "₹8,000", description: "An intricate network of brackish lagoons, lakes, and canals winding past local villages." }
    ],
    food: [
      { dishName: "Kerala Karimeen Pollichathu", type: "Main Course", recommendedPlace: "Alleppey Houseboat", description: "Pearl Spot fish marinated in rich red spicy paste, wrapped in fresh banana leaves, and pan-seared to tender perfection." },
      { dishName: "Puttu and Kadala Curry", type: "Breakfast staple", recommendedPlace: "Aryas, Fort Kochi", description: "Steamed cylinders of ground rice and grated coconut layers, paired with a highly spiced black-chickpea curry." }
    ],
    packingList: [
      "Lightweight, loose-fitting cotton garments",
      "Comfortable waterproof walking shoes",
      "Heavy umbrella or rain poncho (monsoons are sudden)",
      "Strong mosquito repellent cream and vaporizers",
      "Modest clothing for traditional temples",
      "High power powerbank for houseboat trips"
    ],
    budgetBreakdown: {
      accommodation: 18000,
      activities: 5000,
      food: 9000,
      transport: 12000,
      miscellaneous: 4000,
      currency: "INR"
    },
    safetyTips: [
      "Keep high-strength insect repellents handy. Monsoonal backwaters are mosquito prone.",
      "Check boarding certificates and standard life jackets when embarking on local ferries.",
      "Be prepared for winding mountain roads up to Munnar; keep motion sickness tablets.",
      "Respect local temple dress codes (men usually require dhotis/veshtis, women sarees/salwars)."
    ],
    hiddenGems: [
      { name: "Vagamon Meadows & Pine Valley", location: "Idukki District Border", description: "A tranquil, offbeat hill station offering rolling green meadows, mist-covered pine forests, and cool mountain breezes.", whySpecial: "A serene, crowd-free alternative to Munnar with breathtakingly quiet walking trails." },
      { name: "Munroe Island Canal Tour", location: "Kollam Backwaters", description: "A cluster of beautiful tiny islands in Ashtamudi Lake where you can experience canoe tours under low-hanging mangrove canopies.", whySpecial: "Narrower and much more intimate than the broad Alleppey backwater routes." }
    ]
  }
};

// Generates a mock high-quality itinerary for ANY destination if no API key is set
function generateMockCustomTrip(dest, budget, days, travelers, style) {
  const normalizedDest = dest.trim();
  
  // Basic structures
  return {
    tripName: `${normalizedDest} Custom Getaway`,
    destination: normalizedDest,
    budgetLevel: budget || "Moderate",
    durationDays: parseInt(days) || 3,
    travelersCount: parseInt(travelers) || 2,
    travelStyle: style || "Exploration",
    costPerDayEstimate: budget === "Budget" ? "₹2,000 - ₹3,000 per traveler" : "₹4,500 - ₹6,500 per traveler",
    weather: {
      tempCelsius: "26°C",
      condition: "Pleasant & Calm",
      humidity: "55%",
      bestTime: "September to April"
    },
    transportGuide: [
      { mode: "Auto / Local Cabs", cost: "₹500 - ₹1,000 / day", description: "Easily available for point-to-point transit." },
      { mode: "Public Rail / Metro", cost: "₹50 - ₹150 / ride", description: "Best way to beat peak rush hour traffic in major hubs." }
    ],
    dayWiseItinerary: Array.from({ length: parseInt(days) || 3 }, (_, i) => ({
      day: i + 1,
      title: `Exploring the Landmarks of ${normalizedDest}`,
      description: `A carefully designed day diving into the local history, top sights, and famous cuisine of ${normalizedDest}.`,
      activities: [
        { time: "09:00 AM", activity: "Breakfast at a Popular Local Diner", location: "Downtown", description: `Indulge in the regional breakfast specialties that ${normalizedDest} is famous for.`, cost: "₹300" },
        { time: "11:00 AM", activity: "Guided Landmark Discovery", location: "Heritage Quarter", description: `Explore the most significant cultural monument and capture classic photographs.`, cost: "₹250" },
        { time: "03:00 PM", activity: "Local Market Curation", location: "Central Bazaar", description: `Stroll through colorful local markets to shop for handmade crafts and traditional souvenirs.`, cost: "₹400" },
        { time: "06:30 PM", activity: "Panoramic Sunset Spotting", location: "City Viewpoint", description: `Unwind with stunning panoramic sunset views and enjoy delicious local street bites.`, cost: "₹150" }
      ]
    })),
    hotels: [
      { name: `${normalizedDest} Grand Central Hotel`, rating: "4.5★", priceRange: budget === "Budget" ? "₹1,200 - ₹2,000 / night" : "₹4,000 - ₹6,500 / night", description: "Comfortable and beautifully designed guest house in a safe, central neighborhood.", whyChoose: "Top location, cozy rooms, and exceptional friendly local staff." }
    ],
    attractions: [
      { name: `Central Heritage Museum of ${normalizedDest}`, duration: "2 hours", cost: "₹150", description: "Showcasing the historic artifacts, regional folklore, and unique arts of the town." }
    ],
    food: [
      { dishName: `Signature ${normalizedDest} Platter`, type: "Regional Speciality", recommendedPlace: "Legendary Local Diner", description: "A delicious combination of sweet, savory, and spicy regional delicacies." }
    ],
    packingList: [
      "Comfortable walking shoes",
      "Polarized sunglasses and UV sunscreen",
      "Refillable insulated water bottle",
      "Powerbank and universal travel charger"
    ],
    budgetBreakdown: {
      accommodation: (budget === "Budget" ? 1500 : 4000) * (parseInt(days) || 3),
      activities: 1500 * (parseInt(days) || 3),
      food: 1200 * (parseInt(days) || 3),
      transport: 1000 * (parseInt(days) || 3),
      miscellaneous: 800 * (parseInt(days) || 3),
      currency: "INR"
    },
    safetyTips: [
      "Keep important identity cards and emergency cash stored securely in a slim neck-pouch.",
      "Always inquire and confirm taxi/rickshaw fares prior to boarding."
    ],
    hiddenGems: [
      { name: "The Quiet Ridge Lookout", description: "A peaceful forest trail completely skipped by tour buses.", whySpecial: "Gorgeous bird's-eye views and absolute quiet." }
    ]
  };
}

// Generate the itinerary using Gemini 1.5 Flash (with Offline Sandbox Auto-Interceptor)
async function generateItinerary(dest, budget, days, travelers, style) {
  const normDest = dest.toLowerCase().trim();
  const settings = getSettings();

  // 1. Sandbox Interception
  // Check if we can map to a premium pre-designed sandbox trip
  if (!settings.geminiKey) {
    console.log("No Gemini API Key found. Checking pre-designed sandbox databases...");
    
    let demoKey = null;
    if (normDest.includes("goa")) demoKey = "goa";
    else if (normDest.includes("manali")) demoKey = "manali";
    else if (normDest.includes("jaipur")) demoKey = "jaipur";
    else if (normDest.includes("kerala")) demoKey = "kerala";

    // Simulate network latency (1.5 seconds) for high-fidelity realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (demoKey && SANDBOX_DEMO_TRIPS[demoKey]) {
      console.log(`Matching pre-designed itinerary found for: ${demoKey}`);
      // Clone the object to prevent mutations
      return JSON.parse(JSON.stringify(SANDBOX_DEMO_TRIPS[demoKey]));
    } else {
      console.log("No matching premium pre-designed trip. Generating custom simulated trip plan...");
      return generateMockCustomTrip(dest, budget, days, travelers, style);
    }
  }

  // 2. Live API Call to Gemini 1.5 Flash
  console.log("Gemini API Key detected. Commencing live AI generation...");
  const prompt = `
    You are an expert travel planner curation system. Generate a highly personalized and extremely detailed travel itinerary.
    
    Destination: ${dest}
    Duration: ${days} Days
    Budget Level: ${budget} (Scale currency and activities to match this budget level. If destination is in India, express costs primarily in Indian Rupees (INR) using ₹ symbol)
    Travelers: ${travelers} traveler(s)
    Travel Style: ${style}
    
    Ensure you include:
    - An exciting day-wise itinerary with precisely timed activities (Morning, Afternoon, Evening, etc.)
    - Weather section (temp, condition, humidity, best travel month)
    - Transport options (modes, cost ranges, descriptions)
    - Premium local hotels (budget/luxury depending on input)
    - Key tourist attractions
    - Local regional food recommendations (dish name, type, and specific place to try)
    - Detailed packing list
    - Realistic budget breakdown (Accommodation, Activities, Food, Transport, Misc) in numbers
    - Essential local safety tips
    - 2 highly specific "Hidden Gems" or off-beat local secrets.
    
    Generate the response in strict JSON matching the requested schema. Return ONLY valid raw JSON.
  `;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.geminiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_JSON_SCHEMA
        }
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errTxt}`);
    }

    const resJson = await response.json();
    const rawText = resJson.candidates[0].content.parts[0].text;
    
    console.log("Raw Gemini API Output successfully retrieved.");
    const parsedData = JSON.parse(rawText);
    
    // Safety check - make sure parsedData is a proper object
    if (parsedData && parsedData.destination) {
      return parsedData;
    } else {
      throw new Error("Invalid format returned from Gemini.");
    }

  } catch (e) {
    console.error("Live Gemini generation failed. Falling back to local custom generator.", e);
    // Dynamic fallback so the app never crashes
    return generateMockCustomTrip(dest, budget, days, travelers, style);
  }
}

// Retrieve direct pre-designed trip data for direct link triggers
function getDemoTripData(demoKey) {
  const key = demoKey.toLowerCase().trim();
  if (SANDBOX_DEMO_TRIPS[key]) {
    return JSON.parse(JSON.stringify(SANDBOX_DEMO_TRIPS[key]));
  }
  return null;
}
