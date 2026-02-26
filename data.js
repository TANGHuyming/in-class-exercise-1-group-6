const data = [
  {
    id: "unique_string", // Use Date.now() or a UUID
    name: "Blue Wallet",
    description: "Leather wallet with student ID",
    location: "Library Hall B",
    date: "2023-10-25",
    contact: "student@univ.edu",
    imagePath: "/uploads/filename.jpg",
    status: "Lost", // Default: Lost. Others: Found, Closed.
  },
];

module.exports = { data };
