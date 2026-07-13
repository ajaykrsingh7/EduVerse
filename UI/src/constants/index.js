export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  COURSES: "/courses",
  COURSE: "/courses/:id",
  MENTORS: "/mentors",
  MENTOR: "/mentors/:id",
  SHOP: "/shop",
  PRICING: "/pricing",
  BECOME_MENTOR: "/become-a-mentor",
  PROFILE: "/profile",
};

export const COURSE_CATEGORIES = [
  { label: "All Courses", value: "" },
  { label: "Kindergarten", value: "Kindergarten" },
  { label: "High School", value: "High School" },
  { label: "College", value: "College" },
  { label: "Computer", value: "Computer" },
  { label: "Science", value: "Science" },
  { label: "Engineering", value: "Engineering" },
];

export const MENTOR_CATEGORIES = [
  { label: "All Mentors", value: "" },
  { label: "Kindergarten", value: "Kindergarten" },
  { label: "For High School", value: "High School" },
  { label: "For College", value: "College" },
  { label: "For Technology", value: "Technology" },
];

export const BOOK_CATEGORIES = [
  { label: "All Books", value: "" },
  { label: "Kindergarten", value: "Kindergarten" },
  { label: "High School", value: "High School" },
  { label: "College", value: "College" },
];

export const NAV_ITEMS = [
  { label: "BookShop", href: "/shop" },
  { label: "Mentors", href: "/mentors" },
  { label: "See Plans", href: "/pricing" },
  // {label: "For College", href: "/courses?category=College",hasDropdown: true,},
  { label: "Find Courses", href: "/courses"},
  { label: "Free Courses", href: "/learn" },
];
