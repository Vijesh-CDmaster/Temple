
export const temples = [
    { 
        id: "1", 
        name: "Somnath Temple", 
        location: "Gujarat, India", 
        crowd: "Medium", 
        imageId: "temple-1", 
        lat: 20.8880, 
        lng: 70.4012,
        history: "One of the twelve Jyotirlinga shrines of Shiva, the Somnath temple has a history of being destroyed and rebuilt multiple times by various invaders and kings. It stands as a symbol of resilience and devotion.",
        mythology: "According to mythology, the temple was originally built by Soma, the Moon God, in gold, as a tribute to Lord Shiva who cured his illness. It was subsequently rebuilt by Ravana in silver, by Krishna in sandalwood, and by Bhimdev in stone.",
        mysteries: [
            "The temple's location is unique; an inscription on the Baan Stambh (Arrow Pillar) states that there is no land in a straight line between the temple and Antarctica.",
            "An ancient treasure, the Syamantaka jewel, is believed to be hidden within the temple's foundation, protected by mystical forces."
        ],
        architecture: "The temple is built in the Chalukya style of architecture, also known as 'Kailash Mahameru Prasad' style. It features a towering shikhara (spire), a grand sabha mandap (assembly hall), and intricate carvings depicting Hindu deities and epics."
    },
    { 
        id: "2", 
        name: "Dwarkadhish Temple", 
        location: "Gujarat, India", 
        crowd: "Low", 
        imageId: "temple-2", 
        lat: 22.2375, 
        lng: 68.9675,
        history: "Also known as Jagat Mandir, the Dwarkadhish Temple is a Hindu temple dedicated to Lord Krishna. The main shrine of the 5-storied building, supported by 72 pillars, is said to be 2,200 - 2,500 years old.",
        mythology: "It is believed that the original temple was built by Krishna's grandson, Vajranabha, over the hari-griha (Lord Krishna's residential place).",
        mysteries: [
            "The flag atop the temple, known as the Dhwaja, is changed five times a day, and it is a great honor to sponsor a new flag.",
            "The temple has two entrances: 'Swarga Dwar' (gate to heaven) for entry and 'Moksha Dwar' (gate to salvation) for exit."
        ],
        architecture: "The temple is constructed of limestone and sand. The intricate sculptural detailing on the exterior and interior is a testament to the skill of the artisans of its time."
    },
    { 
        id: "3", 
        name: "Ambaji Temple", 
        location: "Gujarat, India", 
        crowd: "High", 
        imageId: "temple-3", 
        lat: 24.3312, 
        lng: 72.8525,
        history: "A major Shakti Peeth of India, it is believed that the heart of Goddess Sati fell here. The temple is one of the 51 Shakti Peethas.",
        mythology: "There is no idol in the temple; the 'Vishwa Yantra' is worshiped instead. It is believed that the tonsure ceremony of Lord Krishna took place here.",
        mysteries: [
            "The original seat of Ambaji is on Gabbar hilltop. A lamp is always lit on this hill, and its flame can be seen from the main temple.",
            "It is forbidden to view the Yantra with the naked eye."
        ],
        architecture: "The temple is made of white marble with golden cones. It has a main entrance and another small door on the side. The open square, called 'chachar chowk', is where ceremonial sacrifices called 'havan' are performed."
    },
    { 
        id: "4", 
        name: "Pavagadh Temple", 
        location: "Gujarat, India", 
        crowd: "Medium", 
        imageId: "temple-4", 
        lat: 22.4607, 
        lng: 73.5185,
        history: "The Mahakali temple at Pavagadh is a revered Hindu pilgrimage site and one of the 51 Shakti Peethas. The temple complex is part of the Champaner-Pavagadh Archaeological Park, a UNESCO World Heritage Site.",
        mythology: "It is believed that the right toe of Goddess Sati fell at this location. The temple is also associated with the sage Vishwamitra, who is said to have installed the idol of Kalika Mata here.",
        mysteries: [
            "The temple is situated on a cliff, and pilgrims traditionally had to climb over 2000 steps to reach it, though a ropeway is now available.",
            "The site has a unique syncretic nature, with a dargah (tomb) of a Muslim saint also present within the temple complex."
        ],
        architecture: "The temple is an example of a fortress-temple, reflecting its strategic location on a hilltop. The architecture is a blend of Hindu and Islamic styles, a characteristic of the region's history."
    },
];

export const visitHistory = [
    { id: 1, temple: "Somnath Temple", date: "2024-05-12", status: "Completed" },
    { id: 2, temple: "Dwarkadhish Temple", date: "2024-03-20", status: "Completed" },
    { id: 3, temple: "Ambaji Temple", date: "2023-11-05", status: "Completed" },
];

export const userProfileData = {
    name: "Pilgrim Devotee",
    email: "pilgrim.devotee@example.com",
    phone: "+91 98765 43210",
    language: "English",
    avatar: "https://github.com/shadcn.png",
    dob: "1990-01-01",
    gender: "Male",
    address: "123, Bhakti Marg",
    city: "Devnagar",
    state: "Gujarat",
    pincode: "362268",
    emergencyContact: {
        name: "Krishna Sharma",
        phone: "+91 98765 12345"
    }
};

export type UserProfile = typeof userProfileData;


export const adminStats = {
    liveFootfall: "12,483",
    activeStaff: "215",
    activeAlerts: "3",
    sosRequests: "1",
};

export const timeSlots = [
    { value: "10:00 - 11:00 AM", label: "10:00 - 11:00 AM" },
    { value: "11:00 - 12:00 PM", label: "11:00 - 12:00 PM" },
    { value: "02:00 - 03:00 PM", label: "02:00 - 03:00 PM" },
];

export const liveStatus = {
    waitingTime: {
        value: "~45 mins",
        description: "For general darshan queue"
    },
    templeStatus: {
        value: "Open",
        description: "Closes at 9:00 PM"
    }
};

export const liveAlert = {
    title: "Live Alert",
    description: "High crowd density expected near Gate 3 between 4 PM - 6 PM. Please use alternate routes."
};

export const workerRoleGroups = [
  {
    group: "Security (Inside Temple)",
    roles: [
      { id: "sec-in-1", name: "Inner Security Guards" },
      { id: "sec-in-2", name: "Metal Detector Operators" },
      { id: "sec-in-3", name: "Hand-held Scanner Staff" },
      { id: "sec-in-4", name: "CCTV Monitoring Staff" },
      { id: "sec-in-5", name: "Plain-clothes Security" },
      { id: "sec-in-6", name: "Emergency Evacuation Staff" },
    ],
  },
  {
    group: "Common Areas (Inside Temple)",
    roles: [
        { id: "ca-1", name: "Floor Cleaners (continuous duty)" },
        { id: "ca-2", name: "Flower Waste Collection Staff" },
        { id: "ca-3", name: "Lamp / Oil Maintenance Staff" },
        { id: "ca-4", name: "Water Distribution Staff" },
        { id: "ca-5", name: "Donation Box (Hundi) Monitoring Staff" },
        { id: "ca-6", name: "Information Desk Staff (inside)" },
    ]
  },
  {
    group: "Guidance (Inside Temple)",
    roles: [
        { id: "guide-1", name: "Public Address System Operator" },
        { id: "guide-2", name: "Pilgrim Guidance Volunteers" },
        { id: "guide-3", name: "Lost & Found Counter Staff" },
    ]
  },
  {
    group: "Parking Control & Traffic Flow",
    roles: [
        { id: "park-ctrl-1", name: "Parking Supervisors" },
        { id: "park-ctrl-2", name: "Vehicle Entry & Exit Controllers" },
        { id: "park-ctrl-3", name: "Token / Ticket Issuing Staff" },
        { id: "park-ctrl-4", name: "Two-wheeler / Car / Bus Section Staff" },
        { id: "park-ctrl-5", name: "VIP / Emergency Vehicle Coordinator" },
    ]
  },
  {
    group: "Security (Parking Area)",
    roles: [
        { id: "park-sec-1", name: "Parking Security Guards" },
        { id: "park-sec-2", name: "CCTV Surveillance Staff" },
        { id: "park-sec-3", name: "Night Watchmen" },
        { id: "park-sec-4", name: "Anti-theft Monitoring Staff" },
    ]
  },
  {
    group: "Transport Assistance (Parking Area)",
    roles: [
        { id: "trans-1", name: "Battery Vehicle / E-Cart Drivers" },
        { id: "trans-2", name: "Wheelchair Assistance Staff" },
        { id: "trans-3", name: "Temple Shuttle / Bus Coordinators" },
    ]
  },
  {
    group: "Maintenance (Parking Area)",
    roles: [
        { id: "maint-1", name: "Sweeping & Cleaning Staff" },
        { id: "maint-2", name: "Drainage & Rainwater Clearing Staff" },
        { id: "maint-3", name: "Lighting Maintenance Electricians" },
        { id: "maint-4", name: "Signboard & Marking Maintenance Staff" },
    ]
  },
  {
    group: "Public Help & Safety (Parking Area)",
    roles: [
        { id: "help-1", name: "Help Desk Staff" },
        { id: "help-2", name: "Lost Vehicle Assistance Staff" },
        { id: "help-3", name: "First-Aid / Emergency Response Staff" },
        { id: "help-4", name: "Fire Safety Staff" },
    ]
  },
];

export const workerRoles = workerRoleGroups.flatMap(group => group.roles);

export type WorkerRole = typeof workerRoles[0];
