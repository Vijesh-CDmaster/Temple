
export const temples = [
    { id: "1", name: "Somnath Temple", location: "Gujarat, India", crowd: "Medium", imageId: "temple-1", lat: 20.8880, lng: 70.4012 },
    { id: "2", name: "Dwarkadhish Temple", location: "Gujarat, India", crowd: "Low", imageId: "temple-2", lat: 22.2375, lng: 68.9675 },
    { id: "3", name: "Ambaji Temple", location: "Gujarat, India", crowd: "High", imageId: "temple-3", lat: 24.3312, lng: 72.8525 },
    { id: "4", name: "Pavagadh Temple", location: "Gujarat, India", crowd: "Medium", imageId: "temple-4", lat: 22.4607, lng: 73.5185 },
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
