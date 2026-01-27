
export const temples = [
    { id: "1", name: "Somnath Temple", location: "Gujarat, India", crowd: "Medium", imageId: "temple-1" },
    { id: "2", name: "Dwarkadhish Temple", location: "Gujarat, India", crowd: "Low", imageId: "temple-2" },
    { id: "3", name: "Ambaji Temple", location: "Gujarat, India", crowd: "High", imageId: "temple-3" },
    { id: "4", name: "Pavagadh Temple", location: "Gujarat, India", crowd: "Medium", imageId: "temple-4" },
];

export const visitHistory = [
    { id: 1, temple: "Somnath Temple", date: "2024-05-12", status: "Completed" },
    { id: 2, temple: "Dwarkadhish Temple", date: "2024-03-20", status: "Completed" },
    { id: 3, temple: "Ambaji Temple", date: "2023-11-05", status: "Completed" },
];

export const userProfile = {
    name: "Pilgrim Devotee",
    email: "pilgrim.devotee@example.com",
    phone: "+91 98765 43210",
    language: "English",
    avatar: "https://github.com/shadcn.png",
    avatarFallback: "PD"
};

export const activeToken = {
    temple: "Somnath Temple",
    date: "2024-10-28",
    timeSlot: "02:00 - 03:00 PM",
    pilgrims: "2 Adults",
    tokenId: "TCN-SMN-8A3D5F",
    gate: "Gate 3"
};

export const adminStats = {
    liveFootfall: "12,483",
    activeStaff: "215",
    activeAlerts: "3",
    sosRequests: "1",
};

export const workerTasks = [
    { id: 1, title: "Clear congestion at Gate 3", priority: "High" },
    { id: 2, title: "Verify QR tokens at Priority Lane", priority: "Medium" },
    { id: 3, title: "Patrol South Corridor", priority: "Low" },
];

export const workerZone = {
    name: "North Complex",
    crowdDensity: "Medium",
    pilgrimFlow: "Pilgrim flow is steady."
};
