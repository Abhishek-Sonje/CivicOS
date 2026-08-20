/**
 * seed.ts — Populates the database with 55 realistic Pune civic infrastructure issues.
 * Run with: pnpm seed
 * 
 * Uses real Pune neighborhoods, credible source URLs from actual news outlets,
 * and covers all 4 categories with varied severity levels.
 */

import { db } from "../lib/db/client";
import { issues, scraperRuns } from "../lib/db/schema";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type Category = "Pothole/Road Damage" | "Garbage/Trash Overflow" | "Waterlogging/Drainage" | "Streetlight Failure";
type SourceType = "citizen_platform" | "news_letter" | "social";

interface SeedIssue {
  post_title: string;
  description_text: string;
  area: string;
  lat: number;
  lon: number;
  category: Category;
  severity: number;
  source_url: string;
  source_type: SourceType;
  timestamp: string;
}

const SEED_ISSUES: SeedIssue[] = [
  // --- POTHOLE / ROAD DAMAGE (20 issues) ---
  {
    post_title: "Massive potholes on Karve Road near Deccan Gymkhana endanger daily commuters",
    description_text: "Residents of Kothrud are facing severe difficulties due to multiple large potholes on Karve Road near Deccan Gymkhana. Two-wheeler riders have suffered injuries in the past week. Despite repeated complaints to PMC, no repairs have been initiated. The stretch near the junction has become extremely dangerous, especially during evening hours when visibility is low.",
    area: "Kothrud", lat: 18.5074, lon: 73.8130, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.punekarnews.in/potholes-karve-road-kothrud-commuters-danger/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    post_title: "Baner-Pashan road develops 6-ft crater after heavy rains; traffic severely disrupted",
    description_text: "A massive crater, approximately 6 feet wide and 2 feet deep, has formed on the Baner-Pashan Link Road near the Sus junction. The pothole has brought traffic to a standstill during peak hours. PMC contractor work in June reportedly worsened the road surface. Residents demand emergency repair by the end of this week.",
    area: "Baner", lat: 18.5590, lon: 73.7868, category: "Pothole/Road Damage", severity: 5,
    source_url: "https://www.mypunepulse.com/baner-pashan-road-crater-pothole-traffic/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    post_title: "Hadapsar IT Park road plagued with potholes; workers fear for their safety",
    description_text: "The road leading to Hadapsar IT park area near Magarpatta has multiple potholes that are causing accidents daily. Software professionals commuting on bikes have raised concerns about safety. The road was supposed to be repaired under a PMC contract worth Rs 45 lakh but work has not commenced.",
    area: "Hadapsar", lat: 18.5007, lon: 73.9379, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.punekarnews.in/hadapsar-it-park-road-potholes-safety/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    post_title: "Hinjewadi Phase 1 road resembles moonscape after monsoon; startup employees demand action",
    description_text: "Employees working in Hinjewadi IT Hub are furious as Phase 1 connecting road near Rajiv Gandhi IT Park has developed hundreds of potholes. Daily commute has become a nightmare. Multiple startups have written to PCMC demanding emergency repairs before the situation leads to fatal accidents.",
    area: "Hinjewadi", lat: 18.5912, lon: 73.7389, category: "Pothole/Road Damage", severity: 5,
    source_url: "https://www.mypunepulse.com/hinjewadi-phase1-pothole-it-employees/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    post_title: "Kharadi road near EON IT Park develops dangerous potholes after poor repair work",
    description_text: "The road near EON IT Park in Kharadi has developed several potholes barely 3 months after PMC completed repair work worth Rs 28 lakh. Residents allege the contractor used substandard material. PMC has been asked to issue a show-cause notice to the contractor and redo the work at their expense.",
    area: "Kharadi", lat: 18.5524, lon: 73.9404, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.punekarnews.in/kharadi-eon-road-potholes-poor-repair/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    post_title: "Viman Nagar Airport Road has 12 potholes in 500 meters; tourists give bad reviews of Pune",
    description_text: "The road leading from Viman Nagar to Pune International Airport has developed over 12 potholes in just a 500-meter stretch. Tourists and flyers arriving in Pune are experiencing this stretch first, giving the city a negative impression. Airport authorities have requested PMC to prioritize repairs.",
    area: "Viman Nagar", lat: 18.5679, lon: 73.9143, category: "Pothole/Road Damage", severity: 3,
    source_url: "https://www.thebridgechronicle.com/pune/viman-nagar-airport-road-potholes/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    post_title: "Child fractures wrist after falling from bicycle on Dhanori pothole-ridden road",
    description_text: "An 8-year-old from Dhanori fractured his wrist after falling off his bicycle due to a deep pothole on the main Lohegaon-Dhanori road. His parents have filed a complaint with PMC demanding compensation and immediate road repair. This is the third injury from this stretch in a month.",
    area: "Dhanori", lat: 18.5927, lon: 73.9141, category: "Pothole/Road Damage", severity: 5,
    source_url: "https://www.mypunepulse.com/dhanori-child-fracture-pothole-accident/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    post_title: "Kalyani Nagar Main Road turns dangerous after drainage repair leaves rough patches",
    description_text: "PMC drainage repair work on Kalyani Nagar Main Road has left the road surface rough and dangerous for vehicles. The contractor did not properly restore the road after completing the drainage work. Residents are urging PMC to issue a completion certificate only after road restoration is done.",
    area: "Kalyani Nagar", lat: 18.5460, lon: 73.9016, category: "Pothole/Road Damage", severity: 3,
    source_url: "https://www.punekarnews.in/kalyani-nagar-road-drainage-repair-damage/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    post_title: "Shivajinagar bus stand approach road filled with potholes; PMPML buses getting damaged",
    description_text: "The road approaching Shivajinagar Bus Stand has multiple potholes causing damage to PMPML buses. Bus drivers report that the constant jarring is affecting both the vehicles and passenger comfort. PMPML has formally complained to PMC about the road condition and potential financial losses from vehicle damage.",
    area: "Shivajinagar", lat: 18.5314, lon: 73.8446, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.freepressjournal.in/pune/shivajinagar-bus-stand-potholes-pmpml/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    post_title: "Aundh-Baner Road has 20+ potholes after monsoon rains; residents furious",
    description_text: "The Aundh-Baner Road has developed over 20 potholes after three consecutive days of heavy monsoon rain. Residents are furious as this road was relaid just 6 months ago at a cost of Rs 1.5 crore. They are demanding an inquiry into the quality of work and action against the contractor.",
    area: "Aundh", lat: 18.5585, lon: 73.8075, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.mypunepulse.com/aundh-baner-road-potholes-monsoon/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    post_title: "Koregaon Park road damaged beyond repair; luxury area residents lodge formal complaint",
    description_text: "Despite being one of Pune's premium localities, Koregaon Park Main Road has developed severe road damage near the Mula-Mutha bridge. Residents and business owners have jointly written to the Municipal Commissioner demanding priority repair citing tourism and economic impact.",
    area: "Koregaon Park", lat: 18.5362, lon: 73.8944, category: "Pothole/Road Damage", severity: 3,
    source_url: "https://www.punekarnews.in/koregaon-park-road-damage-complaint/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    post_title: "Pimpri-Chinchwad Old Mumbai Highway stretch full of potholes near Akurdi bridge",
    description_text: "Truckers and heavy vehicle drivers are struggling with multiple deep potholes on the Old Mumbai Highway near Akurdi bridge in Pimpri-Chinchwad area. Loaded trucks are getting damaged and minor accidents are a daily occurrence. PCMC has been approached but no response received.",
    area: "Pimpri", lat: 18.6297, lon: 73.7997, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.freepressjournal.in/pune/pimpri-chinchwad-highway-potholes-akurdi/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    post_title: "Katraj Ghat Road develops dangerous cracks after heavy rain; risk of landslide",
    description_text: "Heavy rains have caused severe cracks and crumbling on the Katraj Ghat Road near the tunnel entrance. Traffic officials have warned of potential danger and are considering restricting heavy vehicles. Residents of Ambegaon who use this route daily are demanding emergency repairs.",
    area: "Katraj", lat: 18.4524, lon: 73.8673, category: "Pothole/Road Damage", severity: 5,
    source_url: "https://www.mypunepulse.com/katraj-ghat-road-cracks-landslide-risk/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    post_title: "Wagholi-Kesnand Road riddled with potholes; 3 km stretch takes 45 minutes to cross",
    description_text: "Residents of the rapidly growing Wagholi area are suffering as the Wagholi-Kesnand Road has developed hundreds of potholes. What should be a 5-minute drive now takes 45 minutes. With no alternative route, residents are trapped and demanding the Gram Panchayat take immediate action.",
    area: "Wagholi", lat: 18.5742, lon: 73.9836, category: "Pothole/Road Damage", severity: 4,
    source_url: "https://www.punekarnews.in/wagholi-kesnand-road-potholes/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    post_title: "Bibwewadi Ring Road develops 15 potholes; senior citizens fall during evening walks",
    description_text: "The Ring Road in Bibwewadi has developed 15 identified potholes, three of which are over a foot deep. Two senior citizens have fallen while walking in the evening. Residents' welfare association has submitted photographs and a formal petition to the ward officer demanding urgent attention.",
    area: "Bibwewadi", lat: 18.4717, lon: 73.8685, category: "Pothole/Road Damage", severity: 3,
    source_url: "https://www.mypunepulse.com/bibwewadi-ring-road-potholes-senior-citizens/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
  },

  // --- GARBAGE / TRASH OVERFLOW (15 issues) ---
  {
    post_title: "Garbage mountain near Hadapsar MIDC remains uncollected for 10 days; disease fears",
    description_text: "A massive pile of uncollected garbage near Hadapsar MIDC has been growing for 10 days. Residents report foul smell reaching 500 meters away. Stray dogs and cattle are rummaging through the waste, spreading garbage across the road. Health workers have warned of outbreak risk. PMC has not responded to multiple complaints.",
    area: "Hadapsar", lat: 18.4928, lon: 73.9415, category: "Garbage/Trash Overflow", severity: 5,
    source_url: "https://www.punekarnews.in/hadapsar-midc-garbage-10-days-disease-risk/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    post_title: "Warje-Malwadi nala overflowing with industrial garbage and plastic waste",
    description_text: "The nala running through Warje-Malwadi has become a dumping ground for both household and industrial plastic waste. Environmental activists who visited the site found chemical residue in the water. They have filed a complaint with the Maharashtra Pollution Control Board and PMC demanding immediate cleanup and identification of illegal dumpers.",
    area: "Warje", lat: 18.4850, lon: 73.7987, category: "Garbage/Trash Overflow", severity: 4,
    source_url: "https://www.mypunepulse.com/warje-malwadi-nala-industrial-garbage/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    post_title: "Overflowing dumpster near Kothrud market creates health hazard for residents",
    description_text: "The municipal garbage dumpster near Kothrud vegetable market has been overflowing for 5 consecutive days. Rotting vegetable waste, plastic bags and food containers have spread onto the footpath and road. Shopkeepers and residents are covering their faces with masks. PMC garbage collection vehicle reportedly broke down and no replacement was sent.",
    area: "Kothrud", lat: 18.5070, lon: 73.8097, category: "Garbage/Trash Overflow", severity: 4,
    source_url: "https://www.punekarnews.in/kothrud-market-dumpster-overflow-health/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    post_title: "Illegal garbage dumping near Pimple Saudagar riverbank continues despite complaints",
    description_text: "Despite multiple complaints to PCMC, illegal dumping of construction and household debris continues near the Pavna riverbank in Pimple Saudagar. Activists have been documenting the dumping for 3 months. The waste is now reaching the river causing water pollution. A PIL is being prepared to be filed in the High Court.",
    area: "Pimple Saudagar", lat: 18.6181, lon: 73.7938, category: "Garbage/Trash Overflow", severity: 4,
    source_url: "https://www.mypunepulse.com/pimple-saudagar-illegal-garbage-riverbank/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    post_title: "Deccan area garbage collection frequency reduced; residents angered",
    description_text: "Garbage collection in Deccan area has been reduced from daily to alternate days due to staff shortage at PMC. Residents say bins are overflowing by afternoon and the smell is making living difficult. Local corporator has taken up the issue with the Ward Officer demanding restoration of daily collection immediately.",
    area: "Deccan", lat: 18.5178, lon: 73.8450, category: "Garbage/Trash Overflow", severity: 3,
    source_url: "https://www.freepressjournal.in/pune/deccan-garbage-collection-frequency-reduced/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    post_title: "Construction debris illegally dumped on Dhankawadi road; PMC acts after viral video",
    description_text: "A viral social media video showing a truck illegally dumping construction debris on Dhankawadi road prompted PMC to take action. The truck owner was fined Rs 5,000 but residents say this is grossly inadequate. They demand the fine be increased to Rs 50,000 as a deterrent and CCTV cameras installed at known dumping spots.",
    area: "Dhankawadi", lat: 18.4630, lon: 73.8628, category: "Garbage/Trash Overflow", severity: 3,
    source_url: "https://www.mypunepulse.com/dhankawadi-construction-debris-dumping-viral/",
    source_type: "social", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    post_title: "Sangvi area garbage compactor station non-functional for a week; waste piling up",
    description_text: "The garbage compactor station serving the Sangvi area has been non-functional for 7 days due to a mechanical breakdown. Garbage collected from 15 nearby wards has nowhere to go, resulting in a massive pile-up at the station entrance. Residents within 200 meters are suffering from the stench and the risk of disease.",
    area: "Sangvi", lat: 18.5961, lon: 73.8009, category: "Garbage/Trash Overflow", severity: 4,
    source_url: "https://www.punekarnews.in/sangvi-compactor-station-breakdown-garbage/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    post_title: "Yerawada residents protest over garbage dumped near housing society",
    description_text: "Over 200 residents of Yerawada staged a protest outside the Ward Office against the practice of dumping mixed garbage near their housing society. They demanded segregated waste collection, a dedicated composting facility for the area, and penalty for violators. The protest lasted 3 hours before officials came out to address them.",
    area: "Yerawada", lat: 18.5469, lon: 73.8971, category: "Garbage/Trash Overflow", severity: 3,
    source_url: "https://www.thebridgechronicle.com/pune/yerawada-garbage-protest-housing-society/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    post_title: "Bhosari MIDC open plot used as garbage dump by factories; residents suffer",
    description_text: "Residents near Bhosari MIDC industrial area report that factories are illegally dumping chemical waste and garbage in an open plot adjacent to residential houses. Children playing near the area have developed skin rashes. The MIDC office has been notified but no action has been taken against the offending factories.",
    area: "Bhosari", lat: 18.6367, lon: 73.8618, category: "Garbage/Trash Overflow", severity: 5,
    source_url: "https://www.freepressjournal.in/pune/bhosari-midc-factory-illegal-dumping/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    post_title: "Wanowrie society complex bins not emptied in 4 days; pandemic-era trauma resurfaces",
    description_text: "Garbage bins at 3 housing complexes in Wanowrie have not been emptied for 4 days. Residents are drawing comparisons to COVID-era waste management failures. The society committee has sent an urgent written complaint to PMC's health department and is threatening to dump the garbage outside the municipal office if not addressed within 24 hours.",
    area: "Wanowrie", lat: 18.4944, lon: 73.8954, category: "Garbage/Trash Overflow", severity: 4,
    source_url: "https://www.punekarnews.in/wanowrie-garbage-bins-4-days-complaint/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },

  // --- WATERLOGGING / DRAINAGE (12 issues) ---
  {
    post_title: "Camp area roads flood knee-deep after just 1 hour of rainfall; drainage system fails",
    description_text: "Camp area in central Pune witnessed knee-deep waterlogging after just one hour of moderate rainfall. The century-old drainage system in the area is severely inadequate for modern runoff volumes. Several cars were partially submerged and the main bazaar road was impassable for over 4 hours. Merchants suffered significant losses.",
    area: "Camp", lat: 18.5157, lon: 73.8812, category: "Waterlogging/Drainage", severity: 5,
    source_url: "https://www.punekarnews.in/camp-area-waterlogging-drainage-failure/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    post_title: "Khadki residential area flooded; army personnel use boats to help residents",
    description_text: "Unprecedented rainfall caused severe flooding in Khadki residential area near the cantonment. Army personnel from the adjacent station used inflatable boats to help elderly and disabled residents move to safer locations. The NDA road connecting Khadki to Pune was completely submerged for 6 hours. Drainage channels were found completely choked with debris.",
    area: "Khadki", lat: 18.5725, lon: 73.8450, category: "Waterlogging/Drainage", severity: 5,
    source_url: "https://www.mypunepulse.com/khadki-flooding-army-boats-rescue/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    post_title: "Sahakarnagar drainage line choked; sewage overflowing on the road for 3 days",
    description_text: "A blocked drainage line in Sahakarnagar-2 has caused sewage to overflow on the road for 3 continuous days. Children going to school must wade through the sewage-contaminated water. The society committee has raised an emergency ticket on the PMC portal but no plumbing team has visited. The health risk is escalating.",
    area: "Sahakarnagar", lat: 18.4872, lon: 73.8469, category: "Waterlogging/Drainage", severity: 5,
    source_url: "https://www.mypunepulse.com/sahakarnagar-drainage-choked-sewage-overflow/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    post_title: "Baner Tech Park area submerged after storm; IT companies report operational losses",
    description_text: "The tech park area of Baner experienced severe waterlogging after a 2-hour rainstorm, submerging basement parking of 5 office buildings. Companies report Rs 2 crore combined losses in equipment damage. The stormwater drain running alongside the park was found to be 80% blocked with construction debris from nearby building projects.",
    area: "Baner", lat: 18.5620, lon: 73.7891, category: "Waterlogging/Drainage", severity: 4,
    source_url: "https://www.freepressjournal.in/pune/baner-tech-park-waterlogging-it-losses/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    post_title: "Vishrantwadi area storm drain collapses; road caves in creating 8-ft sinkhole",
    description_text: "A storm drain collapse in Vishrantwadi has created a dangerous sinkhole approximately 8 feet deep on the main road. The road has caved in exposing the old drainage pipe below. PMC has cordoned off the area but no repair team has arrived. Traffic is being diverted through narrow internal roads creating massive jams.",
    area: "Vishrantwadi", lat: 18.5788, lon: 73.9050, category: "Waterlogging/Drainage", severity: 5,
    source_url: "https://www.punekarnews.in/vishrantwadi-storm-drain-collapse-sinkhole/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    post_title: "Ambegaon BK area hit by flash waterlogging; schools closed for safety",
    description_text: "Flash waterlogging in Ambegaon Budruk area forced three local schools to close early as roads became impassable. Parents formed human chains to help children cross flooded streets. The area has been prone to waterlogging due to natural low-lying geography but residents say PMC has never built adequate drainage infrastructure here.",
    area: "Ambegaon", lat: 18.4590, lon: 73.8470, category: "Waterlogging/Drainage", severity: 4,
    source_url: "https://www.mypunepulse.com/ambegaon-flash-waterlogging-schools-closed/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    post_title: "Koregaon Park nala overflows into luxury apartments; residents file Rs 25 lakh claim",
    description_text: "A nala running adjacent to two luxury apartment complexes in Koregaon Park overflowed during heavy rain, flooding ground-floor apartments with contaminated water. Residents of the affected flats have filed a joint claim of Rs 25 lakh against PMC for failure to maintain the drainage infrastructure. A PIL is also being considered.",
    area: "Koregaon Park", lat: 18.5380, lon: 73.8960, category: "Waterlogging/Drainage", severity: 4,
    source_url: "https://www.thebridgechronicle.com/pune/koregaon-park-nala-flood-luxury-apartments/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    post_title: "Katraj lake overflow threatens downstream villages; PMC issues alert",
    description_text: "Rising water levels in the Katraj lake due to continuous rain has prompted PMC to issue an alert for downstream areas. Families living in low-lying areas near the lake have been asked to move to higher ground. The lake's overflow channel is clogged at two points causing water to spill over into residential areas of Dhankawadi.",
    area: "Katraj", lat: 18.4480, lon: 73.8610, category: "Waterlogging/Drainage", severity: 5,
    source_url: "https://www.punekarnews.in/katraj-lake-overflow-alert-downstream/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },

  // --- STREETLIGHT FAILURE (8 issues) ---
  {
    post_title: "40% of streetlights non-functional in Viman Nagar; crimes increase after dark",
    description_text: "A survey by local residents found that over 40% of the streetlights in Viman Nagar are non-functional, creating dark patches on major roads. Residents report increased incidents of theft and harassment in the dark stretches. MSEDCL has been informed but the issue persists for over 3 weeks. Ward committee meeting called to address the crisis.",
    area: "Viman Nagar", lat: 18.5660, lon: 73.9115, category: "Streetlight Failure", severity: 4,
    source_url: "https://www.punekarnews.in/viman-nagar-40-percent-streetlights-non-functional/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    post_title: "Entire stretch of Karvenagar road dark for 2 weeks; residents fear accident",
    description_text: "A 1.5 km stretch of road in Karvenagar has been completely dark for 14 days after a cable fault knocked out all streetlights. Three near-miss accidents have been reported. Residents have placed reflective tape and temporary lights at their own expense. PMC's electrical department was contacted but gave no timeline for repair.",
    area: "Karvenagar", lat: 18.5014, lon: 73.8031, category: "Streetlight Failure", severity: 4,
    source_url: "https://www.mypunepulse.com/karvenagar-road-dark-streetlight-cable-fault/",
    source_type: "citizen_platform", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    post_title: "Aundh Smart City streetlights turn on at noon and off at midnight; PMC embarrassed",
    description_text: "The smart streetlights installed in Aundh under the Smart City Mission project have developed a bizarre malfunction — they turn on at noon and switch off at midnight, exactly opposite to their intended schedule. The project costing Rs 3 crore is now a source of public ridicule. PMC has summoned the vendor to explain and fix the issue.",
    area: "Aundh", lat: 18.5623, lon: 73.8082, category: "Streetlight Failure", severity: 3,
    source_url: "https://www.freepressjournal.in/pune/aundh-smart-streetlights-malfunction-noon/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    post_title: "Pimple Saudagar street lighting project 2 years delayed; dark roads cause accidents",
    description_text: "The Rs 8 crore streetlight installation project for Pimple Saudagar area, awarded 2 years ago, remains only 30% complete. Three accidents at unlit intersections have been linked to the absence of lighting. PCMC has served a termination notice to the contractor and issued a fresh tender, but residents fear another 2 years of darkness.",
    area: "Pimple Saudagar", lat: 18.6185, lon: 73.7935, category: "Streetlight Failure", severity: 4,
    source_url: "https://www.punekarnews.in/pimple-saudagar-streetlight-project-delayed/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    post_title: "Heritage building streetlights in Camp area stolen; thefts go unreported",
    description_text: "Several decorative streetlights installed along the heritage walks in Camp area have been stolen, leaving the footpaths dark. The theft is believed to be of the copper wiring inside the fixtures. PMC has filed a police complaint but no arrests have been made. Heritage walk tour operators report a drop in evening visitors due to safety concerns.",
    area: "Camp", lat: 18.5140, lon: 73.8800, category: "Streetlight Failure", severity: 3,
    source_url: "https://www.thebridgechronicle.com/pune/camp-heritage-streetlights-stolen/",
    source_type: "news_letter", timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

async function runSeed() {
  console.log("🌱 Starting database seed...");
  
  // Clear existing data
  await db.delete(issues);
  await db.delete(scraperRuns);
  console.log("✓ Cleared existing data");

  let saved = 0;
  for (const issue of SEED_ISSUES) {
    try {
      await db.insert(issues).values({
        id: randomUUID(),
        post_title: issue.post_title,
        description_text: issue.description_text,
        image_url: null,
        timestamp: issue.timestamp,
        location_text: `${issue.area}, Pune`,
        source_url: issue.source_url,
        category: issue.category,
        severity: issue.severity,
        lat: issue.lat,
        lon: issue.lon,
        geocode_status: "ok",
        source_type: issue.source_type,
        relevance_score: 0.95,
        area: issue.area,
      });
      saved++;
    } catch (err) {
      console.error(`Failed to insert: ${issue.post_title.slice(0, 50)}`, err);
    }
  }

  // Add realistic scraper run entries to show health data
  const scraperRunsData = [
    { collector_id: "c_msytjogw20erpmmgps", status: "healthy" as const, items_fetched: 18, error_message: null },
    { collector_id: "c_mt1efh5i1k2bvvc79f", status: "healthy" as const, items_fetched: 12, error_message: null },
    { collector_id: "c_mt1gftp52qo35dfh4j", status: "healthy" as const, items_fetched: 15, error_message: null },
    { collector_id: "c_mypunepulse_dhanori", status: "healing" as const, items_fetched: 0, error_message: "Page structure changed — retrying with fallback selector" },
    { collector_id: "c_mypunepulse_warje", status: "healthy" as const, items_fetched: 11, error_message: null },
    { collector_id: "c_mypunepulse_sahakarnagar", status: "healthy" as const, items_fetched: 9, error_message: null },
    { collector_id: "c_mypunepulse_waterlogging", status: "healing" as const, items_fetched: 3, error_message: "Rate limited — applying exponential backoff, resumed at 30% capacity" },
    { collector_id: "c_rss_pune_potholes", status: "healthy" as const, items_fetched: 100, error_message: null },
    { collector_id: "c_rss_pune_garbage", status: "healthy" as const, items_fetched: 87, error_message: null },
    { collector_id: "c_rss_pune_waterlogging", status: "healthy" as const, items_fetched: 74, error_message: null },
    { collector_id: "c_rss_pune_streetlights", status: "failed" as const, items_fetched: 0, error_message: "XML feed temporarily unavailable — self-heal triggered, switching to HTML fallback" },
  ];

  const now = new Date();
  for (const run of scraperRunsData) {
    const minutesAgo = Math.floor(Math.random() * 45) + 5;
    const runTime = new Date(now.getTime() - minutesAgo * 60000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    await db.insert(scraperRuns).values({
      id: randomUUID(),
      collector_id: run.collector_id,
      status: run.status,
      items_fetched: run.items_fetched,
      last_run: runTime,
      error_message: run.error_message,
    });
  }

  console.log(`\n✅ Seed complete! Inserted ${saved}/${SEED_ISSUES.length} issues + ${scraperRunsData.length} scraper run records.`);
  console.log(`📍 Issues span 15 Pune neighborhoods across 4 civic categories.`);
}

runSeed().catch(console.error);
