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

export const workerRoles = [
    { id: "1", name: "Security / Police" },
    { id: "2", name: "Medical Staff" },
    { id: "3", name: "Volunteers" },
    { id: "4", name: "Queue Managers" },
    { id: "5", name: "Lost & Found Staff" },
    { id: "6", name: "Traffic & Parking Staff" },
    { id: "7", name: "Fire & Disaster Team" },
    { id: "8", name: "Supervisor" },
];

export type WorkerRole = typeof workerRoles[0];
