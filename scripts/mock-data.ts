/**
 * Clearly labeled mock records for testing the ingestion pipeline in local development mode.
 * Configured with real address locations in Pune, India to verify geocoding bias and map centering.
 */
export const MOCK_RECORDS = [
  {
    post_title: "Large pothole on Karve Road [MOCK]",
    description_text: "There is a deep pothole near Karve Road in Kothrud that is damaging two-wheelers.",
    image_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2",
    timestamp: new Date().toISOString(),
    location_text: "Kothrud, Pune, India",
    source_url: "https://civicaudit.example/issue/mock-pune-101",
  },
  {
    post_title: "Overflowing trash bins at Kalyani Nagar [MOCK]",
    description_text: "Garbage container at Kalyani Nagar junction is overflowing onto the main road.",
    image_url: null,
    timestamp: new Date().toISOString(),
    location_text: "Kalyani Nagar, Pune, India",
    source_url: "https://civicaudit.example/issue/mock-pune-102",
  },
  {
    post_title: "Streetlight out near Amanora Town [MOCK]",
    description_text: "Streetlights along the approach road in Hadapsar have been offline for three days.",
    image_url: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d",
    timestamp: new Date().toISOString(),
    location_text: "Hadapsar, Pune, India",
    source_url: "https://civicaudit.example/issue/mock-pune-103",
  },
];
