/**
 * Clearly labeled mock records for testing the ingestion pipeline in local development mode.
 */
export const MOCK_RECORDS = [
  {
    post_title: "Large pothole on Elm Street [MOCK]",
    description_text: "There is a deep pothole near the intersection of Elm and 4th Street that is damaging tires.",
    image_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2",
    timestamp: new Date().toISOString(),
    location_text: "Elm St and 4th St, Springfield",
    source_url: "https://springfieldgrievances.example/issue/mock-101",
  },
  {
    post_title: "Overflowing trash bins at Pine Park [MOCK]",
    description_text: "Trash cans in the playground area have not been emptied for days. Garbage is flying everywhere.",
    image_url: null,
    timestamp: new Date().toISOString(),
    location_text: "Pine Street Park, Springfield",
    source_url: "https://springfieldgrievances.example/issue/mock-102",
  },
  {
    post_title: "Streetlight out on Maple Avenue [MOCK]",
    description_text: "The streetlight post #42 is completely dead. The street is extremely dark at night.",
    image_url: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d",
    timestamp: new Date().toISOString(),
    location_text: "Maple Ave near 15th St, Springfield",
    source_url: "https://springfieldgrievances.example/issue/mock-103",
  },
];
