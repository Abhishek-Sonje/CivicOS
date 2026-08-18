/**
 * Clearly labeled mock records for testing the ingestion pipeline in local development mode.
 * Configured with real address locations in Nashik, India to verify geocoding bias and map centering.
 */
export const MOCK_RECORDS = [
  {
    post_title: "Large pothole on College Road [MOCK]",
    description_text: "There is a deep pothole near College Road that is damaging two-wheelers.",
    image_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2",
    timestamp: new Date().toISOString(),
    location_text: "College Road, Nashik, India",
    source_url: "https://civicaudit.example/issue/mock-india-101",
  },
  {
    post_title: "Overflowing trash bins at Canada Corner [MOCK]",
    description_text: "Garbage container at Canada Corner junction is overflowing onto the main road.",
    image_url: null,
    timestamp: new Date().toISOString(),
    location_text: "Canada Corner, Nashik, India",
    source_url: "https://civicaudit.example/issue/mock-india-102",
  },
  {
    post_title: "Streetlight out near Gangapur Dam [MOCK]",
    description_text: "Streetlights along the dam approach road have been offline for three days.",
    image_url: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d",
    timestamp: new Date().toISOString(),
    location_text: "Invalid Nonexistent Location Name Nashik 999999",
    source_url: "https://civicaudit.example/issue/mock-india-103",
  },
];
