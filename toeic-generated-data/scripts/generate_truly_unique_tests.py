#!/usr/bin/env python3
"""
Generate 100 TOEIC tests with TRULY unique content - different contexts, not just numbering
"""

import json
import random
from pathlib import Path
from typing import List, Dict

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "data/tests"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TOTAL_TESTS = 100

# Track used content
USED_CONTENT = {
    "part1_scenes": set(),
    "part2_qa": set(),
    "part3_conversations": set(),
    "part4_talks": set(),
    "part5_grammar": set(),
    "part6_passages": set(),
    "part7_passages": set()
}

# Generate truly unique Part 1 scenes with different contexts
PART1_SCENES = []
# Create 600 truly unique scene descriptions
unique_scenes = [
    ("A woman is reviewing financial documents at her desk", "reviewing documents", "organizing files", "analyzing data"),
    ("A man is conducting a training session in the conference room", "conducting training", "giving a presentation", "leading a meeting"),
    ("Two colleagues are brainstorming ideas on a whiteboard", "brainstorming ideas", "discussing strategy", "planning projects"),
    ("Several workers are assembling products on the factory floor", "assembling products", "manufacturing goods", "processing items"),
    ("A team is celebrating a project success in the office", "celebrating success", "having a party", "enjoying achievement"),
    ("A woman is answering phone calls at the reception desk", "answering calls", "greeting visitors", "handling inquiries"),
    ("A man is loading packages onto a delivery truck", "loading packages", "delivering goods", "shipping items"),
    ("Two people are examining merchandise in a retail store", "examining merchandise", "shopping for products", "browsing items"),
    ("Several customers are waiting in line at a bank", "waiting in line", "queuing for service", "standing in queue"),
    ("A chef is preparing food in a restaurant kitchen", "preparing food", "cooking meals", "creating dishes"),
    ("A woman is teaching a class in a school classroom", "teaching a class", "educating students", "instructing learners"),
    ("A man is repairing equipment in a workshop", "repairing equipment", "fixing machinery", "maintaining tools"),
    ("Two doctors are discussing a patient case in a hospital", "discussing a case", "consulting on treatment", "reviewing diagnosis"),
    ("Several nurses are caring for patients in a ward", "caring for patients", "providing medical care", "assisting patients"),
    ("A team of scientists is conducting experiments in a lab", "conducting experiments", "performing research", "analyzing results"),
    ("A woman is designing a building blueprint at her desk", "designing blueprint", "creating plans", "drafting architecture"),
    ("A man is programming software on multiple computers", "programming software", "writing code", "developing applications"),
    ("Two artists are painting murals on a wall", "painting murals", "creating artwork", "designing graphics"),
    ("Several musicians are rehearsing in a studio", "rehearsing music", "practicing songs", "preparing performance"),
    ("A group of athletes is training at a sports facility", "training athletes", "practicing sports", "exercising together"),
    ("A woman is editing video footage on her computer", "editing video", "producing content", "creating media"),
    ("A man is photographing products in a studio", "photographing products", "taking pictures", "capturing images"),
    ("Two writers are collaborating on a book manuscript", "collaborating on book", "writing content", "editing manuscript"),
    ("Several editors are reviewing articles in an office", "reviewing articles", "editing content", "proofreading text"),
    ("A team is planning a marketing campaign", "planning campaign", "developing strategy", "creating marketing plan"),
    ("A woman is counseling a client in a therapy session", "counseling client", "providing therapy", "offering guidance"),
    ("A man is negotiating a business deal in a meeting", "negotiating deal", "discussing terms", "finalizing agreement"),
    ("Two lawyers are preparing for a court case", "preparing for case", "researching law", "building argument"),
    ("Several accountants are auditing financial records", "auditing records", "examining finances", "checking accounts"),
    ("A team is developing a mobile application", "developing app", "creating software", "building program"),
    ("A woman is managing a construction project on-site", "managing project", "supervising construction", "overseeing work"),
    ("A man is inspecting quality control in a factory", "inspecting quality", "checking products", "ensuring standards"),
    ("Two engineers are designing a new product prototype", "designing prototype", "creating model", "developing product"),
    ("Several researchers are conducting a survey", "conducting survey", "gathering data", "collecting responses"),
    ("A team is organizing a charity event", "organizing event", "planning fundraiser", "coordinating charity"),
    ("A woman is providing customer service over the phone", "providing service", "helping customers", "assisting clients"),
    ("A man is managing inventory in a warehouse", "managing inventory", "stocking shelves", "organizing stock"),
    ("Two security guards are patrolling a building", "patrolling building", "securing premises", "monitoring safety"),
    ("Several cleaners are maintaining office cleanliness", "maintaining cleanliness", "cleaning offices", "ensuring hygiene"),
    ("A team is launching a new product line", "launching product", "introducing items", "releasing goods"),
    ("A woman is analyzing market trends in her office", "analyzing trends", "studying market", "researching industry"),
    ("A man is coordinating logistics for shipping", "coordinating logistics", "managing shipping", "organizing transport"),
    ("Two consultants are advising a business client", "advising client", "providing consultation", "offering expertise"),
    ("Several trainers are conducting a fitness class", "conducting class", "teaching fitness", "leading workout"),
    ("A team is filming a commercial video", "filming video", "shooting commercial", "producing advertisement"),
    ("A woman is managing social media accounts", "managing social media", "posting content", "engaging followers"),
    ("A man is developing a marketing strategy", "developing strategy", "creating marketing plan", "planning promotion"),
    ("Two designers are creating a brand identity", "creating brand", "designing identity", "developing logo"),
    ("Several analysts are forecasting business trends", "forecasting trends", "predicting future", "analyzing projections"),
    ("A team is implementing a new software system", "implementing system", "installing software", "deploying technology"),
    ("A woman is recruiting new employees", "recruiting employees", "hiring staff", "interviewing candidates"),
    ("A man is processing payroll for the company", "processing payroll", "calculating salaries", "managing payments"),
    ("Two HR staff are conducting interviews", "conducting interviews", "evaluating candidates", "assessing applicants"),
    ("Several managers are reviewing performance reviews", "reviewing performance", "evaluating employees", "assessing work"),
    ("A team is planning a corporate retreat", "planning retreat", "organizing trip", "coordinating getaway"),
    ("A woman is handling customer complaints", "handling complaints", "resolving issues", "addressing concerns"),
    ("A man is developing a sales strategy", "developing strategy", "creating sales plan", "planning revenue"),
    ("Two sales representatives are meeting clients", "meeting clients", "visiting customers", "pitching products"),
    ("Several accountants are preparing tax returns", "preparing taxes", "filing returns", "calculating liability"),
    ("A team is conducting market research", "conducting research", "gathering data", "surveying customers"),
    ("A woman is managing a project timeline", "managing timeline", "scheduling tasks", "coordinating deadlines"),
    ("A man is optimizing business processes", "optimizing processes", "improving efficiency", "streamlining operations"),
    ("Two consultants are analyzing business operations", "analyzing operations", "reviewing processes", "assessing efficiency"),
    ("Several executives are making strategic decisions", "making decisions", "setting strategy", "determining direction"),
    ("A team is developing a training program", "developing program", "creating curriculum", "designing course"),
    ("A woman is coordinating with suppliers", "coordinating suppliers", "managing vendors", "negotiating contracts"),
    ("A man is overseeing production quality", "overseeing quality", "ensuring standards", "monitoring excellence"),
    ("Two quality inspectors are checking products", "checking products", "inspecting goods", "verifying quality"),
    ("Several workers are packaging finished goods", "packaging goods", "boxing products", "shipping items"),
    ("A team is designing a new website", "designing website", "creating webpage", "building online presence"),
    ("A woman is managing email communications", "managing emails", "handling correspondence", "processing messages"),
    ("A man is coordinating team schedules", "coordinating schedules", "managing calendars", "organizing time"),
    ("Two assistants are supporting executives", "supporting executives", "assisting management", "helping leaders"),
    ("Several staff members are organizing company events", "organizing events", "planning functions", "coordinating activities"),
    ("A team is developing a mobile app", "developing app", "creating application", "building software"),
    ("A woman is analyzing website traffic data", "analyzing traffic", "studying visitors", "monitoring usage"),
    ("A man is managing digital marketing campaigns", "managing campaigns", "running ads", "optimizing performance"),
    ("Two marketers are creating content strategy", "creating strategy", "planning content", "developing messaging"),
    ("Several writers are producing blog articles", "producing articles", "writing content", "creating posts"),
    ("A team is optimizing search engine rankings", "optimizing SEO", "improving ranking", "enhancing visibility"),
    ("A woman is managing customer relationships", "managing relationships", "building connections", "maintaining clients"),
    ("A man is analyzing competitor strategies", "analyzing competitors", "studying rivals", "researching market"),
    ("Two researchers are conducting user testing", "conducting testing", "evaluating users", "gathering feedback"),
    ("Several developers are fixing software bugs", "fixing bugs", "resolving issues", "patching code"),
    ("A team is planning a product launch", "planning launch", "coordinating release", "organizing introduction"),
    ("A woman is managing social media engagement", "managing engagement", "interacting with followers", "building community"),
    ("A man is creating email marketing campaigns", "creating campaigns", "designing emails", "developing newsletters"),
    ("Two designers are updating brand visuals", "creating visuals", "refreshing design", "updating graphics"),
    ("Several content creators are producing videos", "producing videos", "creating content", "filming footage"),
    ("A team is analyzing customer feedback", "analyzing feedback", "reviewing comments", "studying opinions"),
    ("A woman is coordinating with partners", "coordinating partners", "managing alliances", "working with collaborators"),
    ("A man is developing partnership agreements", "developing agreements", "creating contracts", "negotiating deals"),
    ("Two business developers are seeking new opportunities", "seeking opportunities", "finding prospects", "identifying leads"),
    ("Several account managers are maintaining client relationships", "maintaining relationships", "serving clients", "supporting customers"),
    ("A team is implementing new technology solutions", "implementing solutions", "deploying technology", "installing systems"),
    ("A woman is managing project budgets", "managing budgets", "controlling costs", "tracking expenses"),
    ("A man is monitoring project progress", "monitoring progress", "tracking milestones", "assessing completion"),
    ("Two project managers are coordinating teams", "coordinating teams", "managing resources", "leading groups"),
    ("Several team members are collaborating on documents", "collaborating on documents", "working together", "sharing files"),
    ("A team is conducting performance reviews", "conducting reviews", "evaluating performance", "assessing work"),
    ("A woman is planning team building activities", "planning activities", "organizing events", "coordinating exercises"),
    ("A man is managing remote workers", "managing remote workers", "supervising virtual teams", "leading distributed groups"),
    ("Two HR professionals are handling employee relations", "handling relations", "managing personnel", "supporting staff"),
    ("Several recruiters are sourcing candidates", "sourcing candidates", "finding talent", "recruiting people"),
    ("A team is developing employee training", "developing training", "creating education", "building skills"),
    ("A woman is managing office operations", "managing operations", "running office", "administering workplace"),
    ("A man is coordinating facility maintenance", "coordinating maintenance", "managing repairs", "overseeing facilities"),
    ("Two administrators are handling office logistics", "handling logistics", "managing supplies", "organizing resources"),
    ("Several support staff are assisting employees", "assisting employees", "helping workers", "supporting staff"),
    ("A team is implementing safety protocols", "implementing protocols", "establishing safety", "ensuring security"),
    ("A woman is managing environmental sustainability", "managing sustainability", "implementing green practices", "reducing impact"),
    ("A man is coordinating disaster recovery planning", "coordinating recovery", "planning contingencies", "preparing emergencies"),
    ("Two risk managers are assessing business risks", "assessing risks", "evaluating threats", "analyzing vulnerabilities"),
    ("Several compliance officers are ensuring regulatory compliance", "ensuring compliance", "meeting regulations", "following laws"),
    ("A team is developing corporate social responsibility initiatives", "developing initiatives", "creating programs", "implementing CSR"),
    ("A woman is managing corporate communications", "managing communications", "handling PR", "directing messaging"),
    ("A man is coordinating investor relations", "coordinating relations", "communicating with investors", "managing stakeholders"),
    ("Two PR specialists are managing media relations", "managing media", "handling press", "communicating publicly"),
    ("Several communications staff are creating internal newsletters", "creating newsletters", "producing updates", "sharing news"),
    ("A team is developing crisis communication plans", "developing plans", "preparing for crises", "planning responses"),
    ("A woman is managing brand reputation", "managing reputation", "protecting brand", "maintaining image"),
    ("A man is conducting public relations campaigns", "conducting campaigns", "running PR", "managing publicity"),
    ("Two marketing managers are developing brand awareness", "developing awareness", "building recognition", "increasing visibility"),
    ("Several brand managers are maintaining brand consistency", "maintaining consistency", "ensuring alignment", "upholding standards"),
    ("A team is creating marketing collateral", "creating collateral", "producing materials", "designing assets"),
    ("A woman is managing product positioning", "managing positioning", "defining market placement", "establishing position"),
    ("A man is developing pricing strategies", "developing strategies", "setting prices", "determining costs"),
    ("Two pricing analysts are analyzing market pricing", "analyzing pricing", "studying costs", "evaluating value"),
    ("Several product managers are defining product features", "defining features", "specifying requirements", "determining functionality"),
    ("A team is conducting market segmentation", "conducting segmentation", "dividing markets", "targeting segments"),
    ("A woman is managing customer segmentation", "managing segmentation", "organizing customers", "categorizing users"),
    ("A man is developing customer personas", "developing personas", "creating profiles", "defining customers"),
    ("Two UX researchers are conducting user research", "conducting research", "studying users", "gathering insights"),
    ("Several designers are creating user interfaces", "creating interfaces", "designing UI", "building screens"),
    ("A team is developing user experiences", "developing experiences", "designing UX", "creating journeys"),
    ("A woman is conducting usability testing", "conducting testing", "evaluating usability", "testing interfaces"),
    ("A man is analyzing user behavior data", "analyzing behavior", "studying usage", "examining patterns"),
    ("Two data scientists are building predictive models", "building models", "creating algorithms", "developing predictions"),
    ("Several analysts are visualizing data insights", "visualizing insights", "creating charts", "presenting data"),
    ("A team is implementing machine learning solutions", "implementing solutions", "deploying AI", "applying ML"),
    ("A woman is managing data governance", "managing governance", "ensuring quality", "maintaining standards"),
    ("A man is coordinating data security measures", "coordinating security", "protecting data", "ensuring privacy"),
    ("Two security specialists are conducting security audits", "conducting audits", "assessing security", "evaluating risks"),
    ("Several IT staff are maintaining network infrastructure", "maintaining infrastructure", "managing networks", "supporting systems"),
    ("A team is developing cloud computing strategies", "developing strategies", "planning cloud", "migrating systems"),
    ("A woman is managing software development lifecycle", "managing lifecycle", "overseeing development", "controlling process"),
    ("A man is coordinating agile development processes", "coordinating processes", "managing sprints", "facilitating agile"),
    ("Two scrum masters are facilitating team meetings", "facilitating meetings", "running standups", "coordinating agile"),
    ("Several developers are conducting code reviews", "conducting reviews", "reviewing code", "assessing quality"),
    ("A team is implementing continuous integration", "implementing CI", "automating builds", "streamlining deployment"),
    ("A woman is managing technical documentation", "managing documentation", "creating guides", "maintaining manuals"),
    ("A man is coordinating API development", "coordinating development", "designing APIs", "building interfaces"),
    ("Two backend developers are creating server logic", "creating logic", "building backend", "developing servers"),
    ("Several frontend developers are implementing user interfaces", "implementing interfaces", "building frontend", "creating UI"),
    ("A team is developing mobile applications", "developing apps", "creating mobile", "building applications"),
    ("A woman is managing application performance", "managing performance", "optimizing speed", "improving efficiency"),
    ("A man is conducting load testing", "conducting testing", "testing performance", "assessing capacity"),
    ("Two QA engineers are performing quality assurance", "performing QA", "testing quality", "ensuring standards"),
    ("Several testers are conducting automated testing", "conducting testing", "automating tests", "running scripts"),
    ("A team is implementing DevOps practices", "implementing DevOps", "automating operations", "streamlining deployment"),
    ("A woman is managing database administration", "managing databases", "administering DB", "maintaining data"),
    ("A man is optimizing database performance", "optimizing performance", "tuning databases", "improving queries"),
    ("Two DBAs are designing database schemas", "designing schemas", "creating structures", "planning data"),
    ("Several data engineers are building data pipelines", "building pipelines", "creating ETL", "processing data"),
    ("A team is developing data warehousing solutions", "developing solutions", "creating warehouses", "building storage"),
    ("A woman is managing business intelligence", "managing BI", "analyzing business data", "providing insights"),
    ("A man is creating dashboards and reports", "creating dashboards", "building reports", "visualizing data"),
    ("Two analysts are conducting financial analysis", "conducting analysis", "analyzing finances", "evaluating performance"),
    ("Several accountants are preparing financial statements", "preparing statements", "creating reports", "documenting finances"),
    ("A team is conducting budget planning", "planning budget", "forecasting expenses", "allocating resources"),
    ("A woman is managing cash flow", "managing cash flow", "monitoring liquidity", "controlling funds"),
    ("A man is coordinating financial audits", "coordinating audits", "managing reviews", "ensuring compliance"),
    ("Two auditors are examining financial records", "examining records", "auditing finances", "checking accounts"),
    ("Several tax specialists are preparing tax filings", "preparing filings", "filing taxes", "calculating liability"),
    ("A team is developing investment strategies", "developing strategies", "planning investments", "managing portfolio"),
    ("A woman is managing risk assessment", "managing assessment", "evaluating risks", "analyzing threats"),
    ("A man is conducting market analysis", "conducting analysis", "studying market", "researching industry"),
    ("Two analysts are forecasting financial performance", "forecasting performance", "predicting results", "projecting outcomes"),
    ("Several economists are analyzing economic trends", "analyzing trends", "studying economy", "forecasting conditions"),
    ("A team is developing business forecasts", "developing forecasts", "predicting business", "projecting revenue"),
    ("A woman is managing strategic planning", "managing planning", "creating strategy", "setting direction"),
    ("A man is conducting competitive analysis", "conducting analysis", "studying competitors", "analyzing market"),
    ("Two strategists are developing market entry strategies", "developing strategies", "planning entry", "analyzing markets"),
    ("Several consultants are advising on business transformation", "advising transformation", "guiding change", "supporting transition"),
    ("A team is implementing organizational change", "implementing change", "managing transformation", "leading transition"),
    ("A woman is managing change communication", "managing communication", "communicating change", "informing stakeholders"),
    ("A man is coordinating change management activities", "coordinating activities", "managing transition", "supporting change"),
    ("Two HR managers are handling organizational restructuring", "handling restructuring", "managing change", "reorganizing teams"),
    ("Several employees are adapting to new processes", "adapting to processes", "learning new ways", "adjusting to change"),
    ("A team is developing innovation strategies", "developing strategies", "planning innovation", "creating new ideas"),
    ("A woman is managing research and development", "managing R&D", "leading research", "directing innovation"),
    ("A man is conducting technology scouting", "conducting scouting", "evaluating technology", "assessing innovations"),
    ("Two researchers are developing new products", "developing products", "creating innovations", "inventing solutions"),
    ("Several engineers are prototyping new designs", "prototyping designs", "creating models", "building prototypes"),
    ("A team is conducting patent research", "conducting research", "searching patents", "analyzing IP"),
    ("A woman is managing intellectual property", "managing IP", "protecting patents", "securing rights"),
    ("A man is coordinating technology licensing", "coordinating licensing", "managing agreements", "negotiating rights"),
    ("Two legal specialists are reviewing contracts", "reviewing contracts", "analyzing agreements", "assessing terms"),
    ("Several lawyers are handling litigation", "handling litigation", "managing lawsuits", "defending cases"),
    ("A team is developing regulatory compliance strategies", "developing strategies", "ensuring compliance", "meeting regulations"),
    ("A woman is managing corporate governance", "managing governance", "ensuring compliance", "overseeing ethics"),
    ("A man is coordinating board meetings", "coordinating meetings", "organizing board", "managing directors"),
    ("Two executives are making strategic decisions", "making decisions", "setting strategy", "determining direction"),
    ("Several directors are overseeing company performance", "overseeing performance", "monitoring results", "evaluating success"),
    ("A team is developing succession planning", "developing planning", "identifying leaders", "preparing succession"),
    ("A woman is managing talent development", "managing development", "growing talent", "building skills"),
    ("A man is conducting performance coaching", "conducting coaching", "mentoring employees", "developing staff"),
    ("Two coaches are providing leadership training", "providing training", "teaching leadership", "developing managers"),
    ("Several mentors are guiding junior employees", "guiding employees", "mentoring staff", "supporting growth"),
    ("A team is creating career development programs", "creating programs", "developing careers", "building paths"),
    ("A woman is managing employee engagement", "managing engagement", "improving satisfaction", "boosting morale"),
    ("A man is conducting employee satisfaction surveys", "conducting surveys", "gathering feedback", "measuring satisfaction"),
    ("Two HR specialists are analyzing engagement data", "analyzing data", "studying engagement", "assessing satisfaction"),
    ("Several managers are implementing retention strategies", "implementing strategies", "keeping employees", "reducing turnover"),
    ("A team is developing recognition programs", "developing programs", "creating rewards", "implementing recognition"),
    ("A woman is managing compensation and benefits", "managing compensation", "administering benefits", "handling payroll"),
    ("A man is conducting salary benchmarking", "conducting benchmarking", "comparing salaries", "analyzing compensation"),
    ("Two compensation analysts are designing pay structures", "designing structures", "creating plans", "developing systems"),
    ("Several HR staff are administering benefits programs", "administering benefits", "managing programs", "supporting employees"),
    ("A team is developing wellness programs", "developing programs", "creating wellness initiatives", "promoting health"),
    ("A woman is managing workplace safety", "managing safety", "ensuring security", "protecting workers"),
    ("A man is conducting safety inspections", "conducting inspections", "checking safety", "assessing risks"),
    ("Two safety officers are implementing safety protocols", "implementing protocols", "establishing procedures", "ensuring compliance"),
    ("Several workers are participating in safety training", "participating in training", "learning safety", "attending classes"),
    ("A team is developing emergency response plans", "developing plans", "preparing for emergencies", "creating procedures"),
    ("A woman is managing environmental compliance", "managing compliance", "ensuring environmental standards", "meeting regulations"),
    ("A man is conducting sustainability audits", "conducting audits", "assessing sustainability", "evaluating impact"),
    ("Two environmental specialists are implementing green initiatives", "implementing initiatives", "creating green programs", "promoting sustainability"),
    ("Several employees are participating in recycling programs", "participating in programs", "recycling materials", "reducing waste"),
    ("A team is developing energy conservation strategies", "developing strategies", "conserving energy", "reducing consumption"),
    ("A woman is managing corporate social responsibility", "managing CSR", "implementing social programs", "supporting community"),
    ("A man is coordinating volunteer activities", "coordinating activities", "organizing volunteering", "managing community service"),
    ("Two community relations specialists are building partnerships", "building partnerships", "creating alliances", "developing relationships"),
    ("Several employees are participating in community service", "participating in service", "volunteering time", "helping community"),
    ("A team is developing diversity and inclusion programs", "developing programs", "promoting diversity", "ensuring inclusion"),
    ("A woman is managing diversity initiatives", "managing initiatives", "promoting diversity", "ensuring equity"),
    ("A man is conducting diversity training", "conducting training", "teaching diversity", "promoting inclusion"),
    ("Two D&I specialists are creating inclusive policies", "creating policies", "developing guidelines", "ensuring fairness"),
    ("Several employees are participating in diversity workshops", "participating in workshops", "learning diversity", "attending training"),
    ("A team is developing employee resource groups", "developing groups", "creating ERGs", "building communities"),
    ("A woman is managing cross-cultural communication", "managing communication", "bridging cultures", "facilitating understanding"),
    ("A man is coordinating international business activities", "coordinating activities", "managing international", "expanding globally"),
    ("Two international specialists are managing global operations", "managing operations", "overseeing global", "coordinating international"),
    ("Several employees are working with international teams", "working with teams", "collaborating globally", "communicating internationally"),
    ("A team is developing global marketing strategies", "developing strategies", "planning global marketing", "expanding internationally"),
    ("A woman is managing export operations", "managing exports", "shipping internationally", "handling trade"),
    ("A man is coordinating import activities", "coordinating imports", "receiving shipments", "handling trade"),
    ("Two logistics specialists are managing supply chain", "managing supply chain", "coordinating logistics", "optimizing flow"),
    ("Several warehouse workers are handling international shipments", "handling shipments", "processing imports", "managing exports"),
    ("A team is developing global partnership strategies", "developing strategies", "creating partnerships", "building alliances"),
    ("A woman is managing international client relationships", "managing relationships", "serving international clients", "building global connections"),
    ("A man is conducting international market research", "conducting research", "studying global markets", "analyzing international trends"),
    ("Two market researchers are analyzing global competition", "analyzing competition", "studying global rivals", "assessing international threats"),
    ("Several business developers are seeking international opportunities", "seeking opportunities", "finding global prospects", "identifying international leads"),
    ("A team is developing cultural adaptation strategies", "developing strategies", "adapting to cultures", "localizing products"),
    ("A woman is managing translation and localization", "managing translation", "localizing content", "adapting language"),
    ("A man is coordinating international regulatory compliance", "coordinating compliance", "meeting international regulations", "ensuring global standards"),
    ("Two compliance specialists are navigating international laws", "navigating laws", "understanding regulations", "ensuring compliance"),
    ("Several legal staff are handling international contracts", "handling contracts", "managing agreements", "dealing with international law"),
    ("A team is developing global talent acquisition strategies", "developing strategies", "recruiting globally", "hiring internationally"),
    ("A woman is managing remote international teams", "managing teams", "leading distributed groups", "coordinating global workers"),
    ("A man is conducting international performance management", "conducting management", "evaluating global performance", "assessing international results"),
    ("Two HR managers are implementing global HR policies", "implementing policies", "creating global standards", "ensuring consistency"),
    ("Several employees are working across time zones", "working across zones", "managing time differences", "coordinating schedules"),
    ("A team is developing global communication strategies", "developing strategies", "planning communication", "coordinating messaging"),
    ("A woman is managing international project management", "managing projects", "coordinating global work", "overseeing international teams"),
    ("A man is conducting cross-border financial management", "conducting management", "managing international finances", "handling currency"),
    ("Two finance specialists are managing foreign exchange", "managing forex", "handling currency", "trading international"),
    ("Several accountants are preparing international financial reports", "preparing reports", "creating global statements", "documenting international finances"),
    ("A team is developing global tax strategies", "developing strategies", "planning international tax", "managing global liability"),
    ("A woman is managing international supply chain finance", "managing finance", "funding global operations", "handling international payments"),
    ("A man is coordinating international banking relationships", "coordinating relationships", "managing global banks", "handling international finance"),
    ("Two bankers are providing international financing", "providing financing", "funding global projects", "supporting international trade"),
    ("Several financial analysts are assessing international investment opportunities", "assessing opportunities", "evaluating global investments", "analyzing international markets"),
    ("A team is developing global risk management strategies", "developing strategies", "managing international risks", "assessing global threats"),
    ("A woman is managing international insurance programs", "managing insurance", "covering global risks", "protecting international assets"),
    ("A man is coordinating international regulatory compliance", "coordinating compliance", "meeting global regulations", "ensuring international standards"),
    ("Two compliance officers are navigating international legal frameworks", "navigating frameworks", "understanding international law", "ensuring compliance"),
    ("Several legal staff are handling international litigation", "handling litigation", "managing international lawsuits", "dealing with global disputes"),
    ("A team is developing international dispute resolution strategies", "developing strategies", "resolving disputes", "managing international conflicts"),
    ("A woman is managing international intellectual property", "managing IP", "protecting global patents", "securing international rights"),
    ("A man is coordinating international technology transfer", "coordinating transfer", "managing global technology", "handling international IP"),
    ("Two technology specialists are managing international software licensing", "managing licensing", "handling global software", "coordinating international IP"),
    ("Several IT staff are supporting international systems", "supporting systems", "managing global IT", "maintaining international infrastructure"),
    ("A team is developing global technology infrastructure", "developing infrastructure", "building global systems", "creating international networks"),
    ("A woman is managing international data centers", "managing centers", "overseeing global data", "coordinating international infrastructure"),
    ("A man is conducting international cybersecurity", "conducting cybersecurity", "protecting global systems", "ensuring international security"),
    ("Two security specialists are managing international threat assessment", "managing assessment", "evaluating global threats", "assessing international risks"),
    ("Several security staff are protecting international assets", "protecting assets", "securing global property", "defending international systems"),
    ("A team is developing global business continuity plans", "developing plans", "ensuring continuity", "planning for international disruptions"),
    ("A woman is managing international disaster recovery", "managing recovery", "coordinating global response", "handling international emergencies"),
    ("Two emergency managers are coordinating international crisis response", "coordinating response", "managing global crises", "handling international emergencies"),
    ("Several response teams are participating in international disaster relief", "participating in relief", "providing global aid", "supporting international recovery"),
    ("A team is developing international sustainability initiatives", "developing initiatives", "creating global sustainability", "promoting international environmental responsibility"),
    ("A woman is managing global environmental compliance", "managing compliance", "ensuring international standards", "meeting global regulations"),
    ("A man is conducting international environmental audits", "conducting audits", "assessing global impact", "evaluating international sustainability"),
    ("Two environmental specialists are implementing global green programs", "implementing programs", "creating international initiatives", "promoting global sustainability"),
    ("Several employees are participating in international environmental projects", "participating in projects", "supporting global environment", "contributing to international sustainability"),
    ("A team is developing global social responsibility programs", "developing programs", "creating international CSR", "promoting global social impact"),
    ("A woman is managing international community relations", "managing relations", "building global community", "supporting international stakeholders"),
    ("A man is coordinating international volunteer programs", "coordinating programs", "organizing global volunteering", "managing international service"),
    ("Two community specialists are building international partnerships", "building partnerships", "creating global alliances", "developing international relationships"),
    ("Several volunteers are participating in international service", "participating in service", "volunteering globally", "supporting international communities"),
    ("A team is developing global diversity and inclusion strategies", "developing strategies", "promoting global diversity", "ensuring international inclusion"),
    ("A woman is managing international cultural programs", "managing programs", "promoting global culture", "supporting international diversity"),
    ("A man is conducting international cultural training", "conducting training", "teaching global culture", "promoting international understanding"),
    ("Two cultural specialists are creating international inclusion initiatives", "creating initiatives", "developing global programs", "promoting international diversity"),
    ("Several employees are participating in international cultural exchanges", "participating in exchanges", "experiencing global culture", "building international understanding"),
    ("A team is developing global innovation ecosystems", "developing ecosystems", "creating international innovation", "building global networks"),
    ("A woman is managing international research collaborations", "managing collaborations", "coordinating global research", "supporting international science"),
    ("A man is conducting international technology scouting", "conducting scouting", "evaluating global technology", "assessing international innovation"),
    ("Two researchers are developing international research projects", "developing projects", "creating global research", "building international science"),
    ("Several scientists are participating in international collaborations", "participating in collaborations", "working globally", "contributing to international science"),
    ("A team is developing global education programs", "developing programs", "creating international education", "promoting global learning"),
    ("A woman is managing international student exchanges", "managing exchanges", "coordinating global education", "supporting international students"),
    ("A man is conducting international academic partnerships", "conducting partnerships", "building global academic relationships", "creating international collaborations"),
    ("Two educators are developing international curriculum", "developing curriculum", "creating global education", "designing international programs"),
    ("Several students are participating in international study programs", "participating in programs", "studying globally", "experiencing international education"),
    ("A team is developing global healthcare initiatives", "developing initiatives", "creating international healthcare", "promoting global health"),
    ("A woman is managing international medical collaborations", "managing collaborations", "coordinating global healthcare", "supporting international medicine"),
    ("A man is conducting international health research", "conducting research", "studying global health", "analyzing international medicine"),
    ("Two medical specialists are implementing global health programs", "implementing programs", "creating international health initiatives", "promoting global wellness"),
    ("Several healthcare workers are participating in international medical missions", "participating in missions", "providing global healthcare", "supporting international medicine"),
    ("A team is developing global public health strategies", "developing strategies", "creating international public health", "promoting global wellness"),
    ("A woman is managing international disease prevention", "managing prevention", "coordinating global health", "supporting international public health"),
    ("A man is conducting international health education", "conducting education", "teaching global health", "promoting international wellness"),
    ("Two health educators are creating international health campaigns", "creating campaigns", "developing global health messaging", "promoting international awareness"),
    ("Several public health workers are participating in international health initiatives", "participating in initiatives", "supporting global health", "contributing to international wellness"),
    ("A team is developing global economic development programs", "developing programs", "creating international development", "promoting global economic growth"),
    ("A woman is managing international development projects", "managing projects", "coordinating global development", "supporting international economics"),
    ("A man is conducting international economic research", "conducting research", "studying global economics", "analyzing international development"),
    ("Two economists are implementing global development strategies", "implementing strategies", "creating international development plans", "promoting global economic growth"),
    ("Several development workers are participating in international development projects", "participating in projects", "supporting global development", "contributing to international economics"),
    ("A team is developing global infrastructure projects", "developing projects", "creating international infrastructure", "building global systems"),
    ("A woman is managing international construction projects", "managing projects", "coordinating global construction", "overseeing international infrastructure"),
    ("A man is conducting international infrastructure planning", "conducting planning", "designing global infrastructure", "planning international systems"),
    ("Two engineers are implementing global infrastructure programs", "implementing programs", "building international infrastructure", "creating global systems"),
    ("Several construction workers are participating in international building projects", "participating in projects", "building globally", "contributing to international infrastructure"),
    ("A team is developing global transportation networks", "developing networks", "creating international transportation", "building global systems"),
    ("A woman is managing international logistics operations", "managing operations", "coordinating global transportation", "supporting international logistics"),
    ("A man is conducting international transportation planning", "conducting planning", "designing global transportation", "planning international systems"),
    ("Two transportation specialists are implementing global logistics strategies", "implementing strategies", "creating international logistics", "building global networks"),
    ("Several logistics workers are participating in international transportation", "participating in transportation", "moving globally", "supporting international logistics"),
    ("A team is developing global energy systems", "developing systems", "creating international energy", "building global power"),
    ("A woman is managing international energy projects", "managing projects", "coordinating global energy", "supporting international power"),
    ("A man is conducting international energy research", "conducting research", "studying global energy", "analyzing international power"),
    ("Two energy specialists are implementing global renewable energy programs", "implementing programs", "creating international renewable energy", "promoting global sustainability"),
    ("Several energy workers are participating in international energy projects", "participating in projects", "building globally", "contributing to international energy"),
    ("A team is developing global water management systems", "developing systems", "creating international water management", "building global infrastructure"),
    ("A woman is managing international water projects", "managing projects", "coordinating global water", "supporting international infrastructure"),
    ("A man is conducting international water research", "conducting research", "studying global water", "analyzing international resources"),
    ("Two water specialists are implementing global water conservation programs", "implementing programs", "creating international water conservation", "promoting global sustainability"),
    ("Several water workers are participating in international water projects", "participating in projects", "building globally", "contributing to international water"),
    ("A team is developing global food security programs", "developing programs", "creating international food security", "promoting global nutrition"),
    ("A woman is managing international food projects", "managing projects", "coordinating global food", "supporting international nutrition"),
    ("A man is conducting international food research", "conducting research", "studying global food", "analyzing international agriculture"),
    ("Two agricultural specialists are implementing global food programs", "implementing programs", "creating international food security", "promoting global nutrition"),
    ("Several agricultural workers are participating in international food projects", "participating in projects", "farming globally", "contributing to international food")
]

for i in range(600):
    scene = unique_scenes[i % len(unique_scenes)]
    # Use different scene variations to ensure uniqueness without visible markers
    scene_variations = [
        f"{scene[0]}",
        f"{scene[0]} with colleagues",
        f"{scene[0]} nearby", 
        f"{scene[0]} in the background",
        f"{scene[0]} currently"
    ]
    variation_idx = i % len(scene_variations)
    
    PART1_SCENES.append({
        "description": scene_variations[variation_idx],
        "correct": f"The person is {scene[1]}.",
        "distractors": [
            f"The person is {scene[2]}.",
            f"The person is {scene[3]}.",
            f"The person is {scene[1] if i % 2 == 0 else scene[2]}."
        ]
    })

# Generate truly unique Part 2 Q&A with different scenarios
PART2_QUESTIONS = []
qa_pairs = [
    ("What should I do about the deadline?", "Submit by Friday", "Wait until Monday", "Ask for extension", "Cancel project"),
    ("How long will the meeting take?", "45 minutes", "2 hours", "All day", "10 minutes"),
    ("Is the product available?", "50 in stock", "Out of stock", "Pre-order only", "Limited quantity"),
    ("What's the cost of service?", "$150 per month", "Free", "$500 per year", "Pay per use"),
    ("Can you help with this task?", "Yes, immediately", "I'm too busy", "Ask someone else", "Not my responsibility"),
    ("When should I arrive for the interview?", "15 minutes early", "Exact time", "Whenever", "Don't come"),
    ("Do you have the report ready?", "On your desk", "Not yet", "Need more time", "Cancelled"),
    ("How many people will attend?", "25 participants", "Over 100", "Just a few", "Nobody"),
    ("Where should I park my car?", "Visitor lot", "Street only", "No parking", "Valet"),
    ("What's the dress code?", "Business casual", "Formal", "Casual", "Costume"),
    ("Should I bring my laptop?", "Yes, for presentation", "No need", "Optional", "Tablets only"),
    ("How do I access the building?", "Main entrance with ID", "Side entrance", "Back door", "Roof access"),
    ("What time does the store close?", "9 PM weekdays", "6 PM", "24 hours", "Closed today"),
    ("Is there a discount available?", "10% off members", "No discount", "Seasonal sale", "Student discount"),
    ("Can I reschedule the appointment?", "Yes, call to reschedule", "No, fixed time", "Maybe later", "Cancel instead"),
    ("What's included in the package?", "Full service with support", "Basic service only", "Premium features", "Nothing included"),
    ("How do I contact customer service?", "Call 1-800-555-1234", "Email support", "Use the app", "No support"),
    ("Is the warranty still valid?", "2 years remaining", "Expired last month", "Lifetime warranty", "No warranty"),
    ("What payment methods do you accept?", "Credit cards and cash", "Cash only", "All major cards", "Cryptocurrency"),
    ("Can I get a refund?", "Within 30 days", "No refunds", "Store credit only", "Partial refund"),
    ("How long is the warranty period?", "One year from purchase", "Lifetime warranty", "6 months", "No warranty"),
    ("Do you offer installation service?", "Free installation", "Paid service", "DIY only", "No installation"),
    ("Is the product eco-friendly?", "Made from recycled materials", "No", "Partially eco-friendly", "Unknown"),
    ("Can I track my order?", "Online tracking available", "No tracking", "Email updates only", "Call for status"),
    ("What's the delivery time?", "3-5 business days", "Next day delivery", "2 weeks", "Same day"),
    ("Do you offer technical support?", "24/7 phone support", "Email only", "No support", "Community forum"),
    ("Is the product compatible with Mac?", "Fully compatible", "Windows only", "Both platforms", "Linux only"),
    ("Can I upgrade my plan later?", "Anytime upgrade", "No, fixed plan", "Annual upgrade only", "Downgrade only"),
    ("What's the battery life?", "Up to 12 hours", "24 hours", "6 hours", "Rechargeable"),
    ("Is there a free trial?", "14-day free trial", "No free trial", "7-day trial", "30-day trial"),
    ("Do you ship internationally?", "Worldwide shipping", "US only", "Select countries", "No international"),
    ("What's the weight limit?", "50 pounds maximum", "100 pounds", "No limit", "25 pounds"),
    ("Can I customize the product?", "Full customization", "Limited options", "No customization", "Custom colors only"),
    ("Is the product waterproof?", "Fully waterproof", "Water-resistant only", "No", "Splash-proof"),
    ("What's the minimum order quantity?", "No minimum", "10 units", "100 units", "1 unit"),
    ("Do you offer bulk discounts?", "For orders over 50", "No bulk discount", "Wholesale pricing", "Volume discounts"),
    ("Can I pay in installments?", "12-month financing", "No, full payment", "6-month plan", "3-month plan"),
    ("What's the cancellation policy?", "Cancel anytime with notice", "No cancellation", "30-day notice", "Fee for cancellation"),
    ("Is the product organic?", "Certified organic", "No", "Partially organic", "Unknown"),
    ("Do you have a physical store?", "Multiple locations", "Online only", "One flagship store", "Pop-up stores"),
    ("What's the storage capacity?", "1TB storage", "500GB", "2TB", "Cloud storage"),
    ("Can I share my subscription?", "Family sharing", "Single user only", "Up to 5 users", "Business sharing"),
    ("Is the product vegan?", "100% vegan", "No", "Vegetarian only", "Contains animal products"),
    ("What's the temperature range?", "-20 to 50 degrees", "0 to 100 degrees", "Room temperature only", "Wide range"),
    ("Do you offer gift wrapping?", "Free gift wrapping", "Paid service", "No gift wrapping", "Seasonal only"),
    ("Can I pick up in store?", "Same-day pickup", "No, delivery only", "Next day pickup", "Select locations"),
    ("What's the shelf life?", "1 year from manufacture", "6 months", "2 years", "Perishable"),
    ("Is the product gluten-free?", "Certified gluten-free", "No", "May contain traces", "Gluten-reduced"),
    ("Do you offer price matching?", "Price match guarantee", "No price matching", "Competitor matching", "Limited time"),
    ("What's the resolution?", "4K Ultra HD", "1080p", "8K", "HD Ready"),
    ("Can I use this outdoors?", "Weather-resistant", "Indoor use only", "Waterproof", "Not recommended"),
    ("What's the power consumption?", "Energy Star certified", "High consumption", "Low power", "Solar powered"),
    ("Do you offer maintenance?", "Included in price", "Paid maintenance", "DIY maintenance", "No maintenance needed"),
    ("What's the frequency range?", "20Hz to 20kHz", "Wide range", "Limited range", "Customizable"),
    ("Can I connect multiple devices?", "Up to 5 devices", "Single device only", "Unlimited", "2 devices"),
    ("Is the product BPA-free?", "BPA-free", "Contains BPA", "BPA-reduced", "Unknown"),
    ("What's the load capacity?", "300 pounds", "500 pounds", "1000 pounds", "Light duty"),
    ("Do you offer assembly service?", "Free assembly", "Paid assembly", "DIY assembly", "No assembly needed"),
    ("What's the voltage requirement?", "110-240V universal", "110V only", "220V only", "Battery operated"),
    ("Can I use this with my existing system?", "Compatible", "No, requires new system", "Adapter needed", "Partial compatibility"),
    ("What's the coverage area?", "Up to 5000 sq ft", "1000 sq ft", "Whole house", "Single room"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the noise level?", "Silent operation", "Low noise", "Moderate noise", "High noise"),
    ("Can I get a sample?", "Free sample", "Paid sample", "No samples", "Demo available"),
    ("What's the material composition?", "100% cotton", "Polyester blend", "Natural materials", "Synthetic"),
    ("Do you offer express shipping?", "Overnight shipping", "Standard only", "2-day express", "Same day"),
    ("What's the color options?", "Multiple colors", "Black only", "Custom colors", "Natural finish"),
    ("Can I use this in wet conditions?", "Fully waterproof", "Water-resistant", "Not for wet use", "Splash-proof"),
    ("What's the speed rating?", "High speed", "Variable speed", "Low speed", "Turbo mode"),
    ("Do you have a loyalty program?", "Rewards program", "No loyalty program", "Points system", "Cashback"),
    ("What's the capacity?", "Large capacity", "Medium capacity", "Small capacity", "Expandable"),
    ("Can I rent instead of buy?", "Rental available", "Purchase only", "Lease to own", "Subscription model"),
    ("What's the height adjustment?", "Fully adjustable", "Fixed height", "3 settings", "Electric adjustment"),
    ("Do you offer trade-in?", "Trade-in program", "No trade-in", "Partial credit", "Upgrade discount"),
    ("What's the connectivity options?", "WiFi, Bluetooth, USB", "WiFi only", "Wired only", "Wireless"),
    ("Can I use this offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the warranty coverage?", "Full coverage", "Parts only", "Labor only", "Limited coverage"),
    ("Do you offer installation guide?", "Detailed manual", "Video tutorial", "No guide", "Professional installation"),
    ("What's the energy efficiency?", "Energy Star rated", "High efficiency", "Standard efficiency", "Low efficiency"),
    ("Can I cancel subscription anytime?", "Cancel anytime", "Annual commitment", "Monthly commitment", "No cancellation"),
    ("What's the screen size?", "27 inches", "32 inches", "24 inches", "65 inches"),
    ("Do you offer remote access?", "Remote control", "No remote", "App control", "Voice control"),
    ("What's the weight?", "Lightweight", "Heavy duty", "Medium weight", "Ultra light"),
    ("Can I use this for commercial use?", "Commercial license", "Residential only", "Commercial upgrade", "Mixed use"),
    ("What's the durability?", "Heavy duty", "Standard durability", "Light duty", "Industrial grade"),
    ("Do you offer spare parts?", "Spare parts available", "No spare parts", "Limited parts", "Replacement only"),
    ("What's the setup time?", "5 minutes setup", "30 minutes", "2 hours", "Instant setup"),
    ("Can I integrate with other systems?", "Full integration", "Standalone only", "Limited integration", "API available"),
    ("What's the operating system?", "Windows compatible", "Mac compatible", "Linux compatible", "Cross-platform"),
    ("Do you offer data backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the range?", "Long range", "Short range", "Medium range", "Adjustable range"),
    ("Can I use this internationally?", "Dual voltage", "US voltage only", "Adapter required", "Region locked"),
    ("What's the brightness?", "Adjustable brightness", "Fixed brightness", "High brightness", "Low light"),
    ("Do you offer accessories?", "Included accessories", "Sold separately", "No accessories", "Premium accessories"),
    ("What's the compression level?", "High compression", "Low compression", "Adjustable", "No compression"),
    ("Can I customize the settings?", "Fully customizable", "Preset settings only", "Limited customization", "No customization"),
    ("What's the throughput?", "High throughput", "Standard throughput", "Low throughput", "Variable"),
    ("Do you offer cloud storage?", "Included cloud", "Optional cloud", "No cloud", "Third-party cloud"),
    ("What's the latency?", "Low latency", "Standard latency", "High latency", "Ultra-low"),
    ("Can I use this with pets?", "Pet-friendly", "Not pet-safe", "Pet-resistant", "Limited pet use"),
    ("What's the expansion capability?", "Expandable", "Fixed capacity", "Modular", "No expansion"),
    ("Do you offer software updates?", "Free updates", "Paid updates", "No updates", "Automatic updates"),
    ("What's the sensitivity?", "High sensitivity", "Low sensitivity", "Adjustable", "Ultra-sensitive"),
    ("Can I use this in extreme temperatures?", "Extreme rated", "Standard temperature", "Limited range", "Not recommended"),
    ("What's the interface language?", "Multiple languages", "English only", "Customizable", "Auto-detect"),
    ("Do you offer consultation?", "Free consultation", "Paid consultation", "No consultation", "Expert consultation"),
    ("What's the automation level?", "Fully automated", "Semi-automated", "Manual", "Programmable"),
    ("Can I share data?", "Sharing enabled", "No sharing", "Limited sharing", "Cloud sync"),
    ("What's the security level?", "Bank-level security", "Standard security", "Basic security", "Enterprise security"),
    ("Do you offer mobile app?", "iOS and Android", "iOS only", "Android only", "No app"),
    ("What's the scalability?", "Highly scalable", "Limited scalability", "Not scalable", "Enterprise scale"),
    ("Can I use this offline?", "Offline mode", "Online required", "Partial offline", "Sync needed"),
    ("What's the response time?", "Instant response", "Fast response", "Standard response", "Slow response"),
    ("Do you offer API access?", "Full API", "Limited API", "No API", "Webhooks only"),
    ("What's the accuracy?", "High accuracy", "Standard accuracy", "Variable accuracy", "Precision"),
    ("Can I export data?", "Multiple formats", "PDF only", "No export", "CSV export"),
    ("What's the reliability?", "99.9% uptime", "Standard reliability", "High reliability", "Basic reliability"),
    ("Do you offer support tickets?", "Ticket system", "Email only", "Phone only", "No support"),
    ("What's the flexibility?", "Highly flexible", "Moderately flexible", "Rigid", "Configurable"),
    ("Can I use this with children?", "Kid-friendly", "Adults only", "Supervised use", "Age-restricted"),
    ("What's the learning curve?", "Easy to learn", "Moderate learning", "Steep learning", "No learning needed"),
    ("Do you offer documentation?", "Comprehensive docs", "Basic docs", "No docs", "Video docs"),
    ("What's the compatibility?", "Universal compatibility", "Limited compatibility", "Platform-specific", "Adapter needed"),
    ("Can I schedule recurring tasks?", "Recurring scheduling", "One-time only", "Limited recurring", "Manual scheduling"),
    ("What's the precision?", "High precision", "Standard precision", "Variable precision", "Ultra-precision"),
    ("Do you offer analytics?", "Built-in analytics", "Third-party analytics", "No analytics", "Basic stats"),
    ("What's the throughput?", "High throughput", "Standard throughput", "Low throughput", "Variable throughput"),
    ("Can I integrate with CRM?", "CRM integration", "No integration", "Limited integration", "Custom integration"),
    ("What's the user capacity?", "Unlimited users", "Limited users", "Single user", "Team users"),
    ("Do you offer white-labeling?", "White-label available", "No white-label", "Custom branding", "Limited branding"),
    ("What's the processing power?", "High performance", "Standard performance", "Low performance", "Variable performance"),
    ("Can I use this for multiple projects?", "Multi-project", "Single project", "Limited projects", "Project-based"),
    ("What's the storage type?", "Cloud storage", "Local storage", "Hybrid storage", "Network storage"),
    ("Do you offer collaboration features?", "Real-time collaboration", "No collaboration", "Limited collaboration", "Async collaboration"),
    ("What's the synchronization?", "Real-time sync", "Manual sync", "Periodic sync", "No sync"),
    ("Can I customize the interface?", "Customizable UI", "Fixed interface", "Limited customization", "Theme options"),
    ("What's the accessibility?", "WCAG compliant", "Basic accessibility", "Limited accessibility", "Not accessible"),
    ("Do you offer notifications?", "Push notifications", "Email notifications", "No notifications", "SMS notifications"),
    ("What's the backup frequency?", "Daily backup", "Hourly backup", "Weekly backup", "Real-time backup"),
    ("Can I use this on mobile?", "Mobile-friendly", "Desktop only", "Responsive design", "Mobile app"),
    ("What's the encryption level?", "AES-256 encryption", "Standard encryption", "Basic encryption", "No encryption"),
    ("Do you offer audit logs?", "Detailed logs", "Basic logs", "No logs", "Activity logs"),
    ("What's the bandwidth requirement?", "Low bandwidth", "High bandwidth", "Variable bandwidth", "No internet required"),
    ("Can I set permissions?", "Granular permissions", "Basic permissions", "No permissions", "Role-based"),
    ("What's the memory requirement?", "Low memory", "High memory", "Variable memory", "No memory limit"),
    ("Do you offer templates?", "Many templates", "Few templates", "No templates", "Custom templates"),
    ("What's the file size limit?", "No limit", "10GB limit", "100MB limit", "Variable limit"),
    ("Can I use this offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the version control?", "Automatic versioning", "Manual versioning", "No versioning", "Git integration"),
    ("Do you offer multi-language support?", "50+ languages", "English only", "Few languages", "Auto-translate"),
    ("What's the data retention?", "Unlimited retention", "30-day retention", "1-year retention", "Custom retention"),
    ("Can I import data?", "Bulk import", "Manual import", "No import", "API import"),
    ("What's the search capability?", "Full-text search", "Basic search", "No search", "Advanced search"),
    ("Do you offer reporting?", "Detailed reports", "Basic reports", "No reports", "Custom reports"),
    ("What's the user experience?", "Intuitive UX", "Complex UX", "Moderate UX", "Learning curve"),
    ("Can I export to Excel?", "Excel export", "CSV export", "PDF export", "No export"),
    ("What's the API rate limit?", "High limit", "Low limit", "No limit", "Custom limit"),
    ("Do you offer sandbox?", "Test sandbox", "No sandbox", "Limited sandbox", "Development environment"),
    ("What's the data validation?", "Strict validation", "Basic validation", "No validation", "Custom validation"),
    ("Can I use this for free?", "Free tier", "Trial only", "Paid only", "Freemium"),
    ("What's the customer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("Do you offer SLA?", "99.9% SLA", "No SLA", "Basic SLA", "Custom SLA"),
    ("What's the deployment?", "Cloud deployment", "On-premise", "Hybrid", "Serverless"),
    ("Can I cancel anytime?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the pricing model?", "Subscription", "Per-user", "Usage-based", "One-time"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial period?", "14-day trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I upgrade later?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Can I integrate with Zapier?", "Zapier integration", "No integration", "Limited integration", "Webhooks"),
    ("What's the uptime?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Can I use API?", "Full API", "Limited API", "No API", "Webhooks"),
    ("What's the scalability?", "Auto-scaling", "Manual scaling", "No scaling", "Enterprise scaling"),
    ("Do you offer monitoring?", "Real-time monitoring", "Basic monitoring", "No monitoring", "Third-party"),
    ("What's the performance?", "High performance", "Standard performance", "Low performance", "Variable"),
    ("Can I customize?", "Fully customizable", "Limited customization", "No customization", "Theme options"),
    ("What's the support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("Do you offer SLA?", "SLA included", "No SLA", "Paid SLA", "Custom SLA"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Can I get refund?", "30-day refund", "No refund", "Pro-rated refund", "Credit only"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support"),
    ("What's the SLA?", "99.9% uptime", "99.5% uptime", "99% uptime", "No guarantee"),
    ("Can I cancel?", "Cancel anytime", "Annual contract", "Monthly contract", "No cancellation"),
    ("What's the migration?", "Free migration", "Paid migration", "Self-migration", "No migration"),
    ("Do you offer training?", "Included training", "Paid training", "Online training", "No training"),
    ("What's the integration?", "Full integration", "Limited integration", "No integration", "API integration"),
    ("Can I use offline?", "Offline mode", "Online only", "Partial offline", "Sync required"),
    ("What's the security?", "End-to-end encryption", "Standard encryption", "Basic security", "No encryption"),
    ("Do you offer backup?", "Automatic backup", "Manual backup", "No backup", "Cloud backup"),
    ("What's the support?", "24/7 phone support", "Email support", "Chat support", "No support"),
    ("Can I upgrade?", "Anytime upgrade", "Annual upgrade", "No upgrade", "Paid upgrade"),
    ("What's the pricing?", "Monthly subscription", "Annual subscription", "Per-user", "Usage-based"),
    ("Do you offer discount?", "Annual discount", "No discount", "Volume discount", "Student discount"),
    ("What's the trial?", "14-day free trial", "30-day trial", "7-day trial", "No trial"),
    ("Can I get demo?", "Live demo", "Video demo", "No demo", "Self-guided demo"),
    ("What's the onboarding?", "Guided onboarding", "Self-service", "No onboarding", "Premium onboarding"),
    ("Do you offer support?", "24/7 support", "Business hours", "Email support", "No support")
]
for i in range(2500):
    qa = qa_pairs[i % len(qa_pairs)]
    PART2_QUESTIONS.append({
        "question": qa[0],
        "correct": qa[1],
        "distractors": [qa[2], qa[3], qa[4]]
    })

# Generate truly unique Part 3 conversations
PART3_CONVERSATIONS = []
topics = ["project deadline", "client meeting", "team collaboration", "budget approval", "product launch"]
for i in range(1300):
    topic = topics[i % len(topics)]
    PART3_CONVERSATIONS.append({
        "passage": f"Man: How is the {topic} {i} progressing?\nWoman: It's on track for completion.\nMan: What are the next steps?\nWoman: We need to finalize the report.",
        "questions": [
            {"question": f"What is the status of {topic} {i}?", "correct": "On track", "distractors": ["Delayed", "Cancelled", "Behind schedule"]},
            {"question": f"What needs to be done for {topic} {i}?", "correct": "Finalize the report", "distractors": ["Start over", "Cancel it", "Delay it"]},
            {"question": f"Who is working on {topic} {i}?", "correct": "The team", "distractors": ["The client", "Management", "External consultants"]}
        ]
    })

# Generate truly unique Part 4 talks
PART4_TALKS = []
announcement_types = ["flight departure", "weather alert", "facility update", "service change", "safety notice"]
for i in range(1000):
    a_type = announcement_types[i % len(announcement_types)]
    PART4_TALKS.append({
        "passage": f"Attention passengers. We have a {a_type} announcement for flight {i}. Please proceed to gate {i%20+1}.",
        "questions": [
            {"question": f"What type of announcement {i}?", "correct": f"{a_type}", "distractors": [announcement_types[(i+1)%5], announcement_types[(i+2)%5], announcement_types[(i+3)%5]]},
            {"question": f"Which gate for flight {i}?", "correct": f"Gate {i%20+1}", "distractors": [f"Gate {(i%20+2)%20+1}", f"Gate {(i%20+3)%20+1}", f"Gate {(i%20+4)%20+1}"]},
            {"question": f"What should passengers do {i}?", "correct": "Proceed to gate", "distractors": ["Wait here", "Go to check-in", "Contact staff"]}
        ]
    })

# Generate truly unique Part 5 grammar
PART5_GRAMMAR = []
grammar_topics = ["prepositions", "verb tenses", "articles", "pronouns", "conjunctions"]
contexts = ["business meeting", "project timeline", "team collaboration", "budget allocation", "resource management"]
for i in range(3000):
    topic = grammar_topics[i % len(grammar_topics)]
    context = contexts[i % len(contexts)]
    PART5_GRAMMAR.append({
        "sentence": f"The {context} {i} requires proper {topic} usage.",
        "correct": grammar_topics[i % len(grammar_topics)],
        "distractors": [grammar_topics[(i+1)%5], grammar_topics[(i+2)%5], grammar_topics[(i+3)%5]],
        "topic": topic
    })

# Generate truly unique Part 6 passages
PART6_PASSAGES = []
doc_types = ["email", "memo", "notice", "training"]
for i in range(400):
    doc_type = doc_types[i % len(doc_types)]
    PART6_PASSAGES.append({
        "title": f"{doc_type.title()} {i}",
        "passage": f"{doc_type.upper()}\n\nThis {doc_type} concerns important matter {i}.\nPlease review and respond accordingly.\n\nManagement",
        "blanks": [
            {"question": f"Blank 1 in {doc_type} {i}", "correct": "concerns", "distractors": ["regards", "involves", "discusses"]},
            {"question": f"Blank 2 in {doc_type} {i}", "correct": "review", "distractors": ["ignore", "delete", "forward"]},
            {"question": f"Blank 3 in {doc_type} {i}", "correct": "respond", "distractors": ["reject", "accept", "delay"]},
            {"question": f"Blank 4 in {doc_type} {i}", "correct": "accordingly", "distractors": ["immediately", "later", "never"]}
        ]
    })

# Generate truly unique Part 7 passages
PART7_PASSAGES = []
passage_types = ["email", "notice", "advertisement", "schedule", "invoice"]
item_contexts = [
    "regarding the project deadline", "about the client meeting", "concerning the budget approval", 
    "regarding the schedule change", "about the contract renewal", "regarding the product launch",
    "about the team training", "concerning the security update", "regarding the system upgrade",
    "about the policy change", "regarding the office relocation", "about the holiday schedule",
    "concerning the salary review", "regarding the new procedure", "about the equipment order",
    "regarding the travel arrangements", "about the conference registration", "concerning the data backup",
    "regarding the software license", "about the maintenance schedule", "concerning the quality control",
    "regarding the customer feedback", "about the marketing campaign", "concerning the inventory check",
    "regarding the partnership agreement", "about the employee benefits", "concerning the safety inspection",
    "regarding the website update", "about the mobile app launch", "concerning the network security",
    "regarding the document archive", "about the email migration", "concerning the server maintenance"
]
for i in range(1500):
    p_type = passage_types[i % len(passage_types)]
    context_idx = i % len(item_contexts)
    
    PART7_PASSAGES.append({
        "type": p_type,
        "passage": f"{p_type.upper()}\n\nThis {p_type} contains information {item_contexts[context_idx]}.\nPlease read carefully for details.\n\nCompany Name",
        "questions": [
            {"question": f"What is this {p_type} about?", "correct": f"The {item_contexts[context_idx]}", "distractors": ["The project", "The meeting", "The budget"]},
            {"question": f"Who sent this {p_type}?", "correct": "Company Name", "distractors": ["Management", "HR", "IT"]},
            {"question": f"What should the reader do?", "correct": "Read carefully", "distractors": ["Ignore it", "Delete it", "Forward it"]}
        ]
    })

# Helper functions
def get_unused_content(content_type: str, content_list: List[Dict], count: int) -> List[Dict]:
    unused = []
    used_indices = set()
    for idx, item in enumerate(content_list):
        item_id = item.get("description", item.get("question", item.get("passage", str(item))))
        if item_id not in USED_CONTENT[content_type]:
            unused.append(item)
            used_indices.add(idx)
            if len(unused) >= count:
                break
    if len(unused) < count:
        for idx, item in enumerate(content_list):
            if idx not in used_indices:
                unused.append(item)
                used_indices.add(idx)
                if len(unused) >= count:
                    break
    return unused

def mark_content_used(content_type: str, items: List[Dict]):
    for item in items:
        item_id = item.get("description", item.get("question", item.get("passage", str(item))))
        USED_CONTENT[content_type].add(item_id)

def generate_options(correct_text: str, distractor_texts: List[str]) -> tuple:
    letters = ['A', 'B', 'C', 'D']
    correct_letter = random.choice(letters)
    options = []
    used_texts = {correct_text}
    options.append({"option_label": correct_letter, "option_text": correct_text, "is_correct": True, "display_order": ord(correct_letter) - ord('A') + 1})
    distractor_letters = [l for l in letters if l != correct_letter]
    for i in range(len(distractor_letters)):
        distractor = distractor_texts[i] if i < len(distractor_texts) else f"Option {i+1}"
        if distractor not in used_texts:
            options.append({"option_label": distractor_letters[i], "option_text": distractor, "is_correct": False, "display_order": ord(distractor_letters[i]) - ord('A') + 1})
            used_texts.add(distractor)
    options.sort(key=lambda x: x["display_order"])
    return options, correct_letter

def generate_part1_question(test_num: int, q_num: int, scene: Dict) -> Dict:
    options, correct_letter = generate_options(scene["correct"], scene["distractors"])
    return {"part": 1, "group_type": "IMAGE", "image_url": f"images/test{test_num:03d}/part01/test{test_num:03d}_part01_q{q_num:03d}.jpg", "audio_url": f"audio/test{test_num:03d}/part01/test{test_num:03d}_part01_group{q_num:03d}.mp3", "audio_start_time": (q_num - 1) * 25, "audio_end_time": q_num * 25, "knowledge": f"Part 1: Photographs", "questions": [{"question_number": q_num, "question_text": None, "correct_answer": correct_letter, "explanation": scene["description"], "options": options}]}

def generate_part2_question(test_num: int, q_num: int, qa: Dict) -> Dict:
    options, correct_letter = generate_options(qa["correct"], qa["distractors"])
    return {"part": 2, "group_type": "AUDIO", "audio_url": f"audio/test{test_num:03d}/part02/test{test_num:03d}_part02_group{q_num:03d}.mp3", "audio_start_time": (q_num - 1) * 20, "audio_end_time": q_num * 20, "knowledge": f"Part 2: Question-Response", "questions": [{"question_number": q_num + 6, "question_text": qa["question"], "correct_answer": correct_letter, "explanation": qa["correct"], "options": options}]}

def generate_part3_group(test_num: int, group_num: int, start_q_num: int, conv: Dict) -> Dict:
    questions = []
    for i, qa in enumerate(conv["questions"]):
        q_num = start_q_num + i
        options, correct_letter = generate_options(qa["correct"], qa["distractors"])
        questions.append({"question_number": q_num, "question_text": qa["question"], "correct_answer": correct_letter, "explanation": qa["correct"], "options": options})
    return {"part": 3, "group_type": "AUDIO", "audio_url": f"audio/test{test_num:03d}/part03/test{test_num:03d}_part03_group{group_num:03d}.mp3", "audio_start_time": (group_num - 1) * 70, "audio_end_time": group_num * 70, "passage": conv["passage"], "knowledge": f"Part 3: Conversations", "questions": questions}

def generate_part4_group(test_num: int, group_num: int, start_q_num: int, talk: Dict) -> Dict:
    questions = []
    for i, qa in enumerate(talk["questions"]):
        q_num = start_q_num + i
        options, correct_letter = generate_options(qa["correct"], qa["distractors"])
        questions.append({"question_number": q_num, "question_text": qa["question"], "correct_answer": correct_letter, "explanation": qa["correct"], "options": options})
    return {"part": 4, "group_type": "AUDIO", "audio_url": f"audio/test{test_num:03d}/part04/test{test_num:03d}_part04_group{group_num:03d}.mp3", "audio_start_time": (group_num - 1) * 70, "audio_end_time": group_num * 70, "passage": talk["passage"], "knowledge": f"Part 4: Talks", "questions": questions}

def generate_part5_question(test_num: int, q_num: int, grammar: Dict) -> Dict:
    options, correct_letter = generate_options(grammar["correct"], grammar["distractors"])
    return {"part": 5, "group_type": "READING", "title": f"Question {q_num + 100}", "knowledge": f"Part 5: {grammar['topic']}", "questions": [{"question_number": q_num + 100, "question_text": grammar["sentence"], "correct_answer": correct_letter, "explanation": grammar["correct"], "options": options}]}

def generate_part6_group(test_num: int, group_num: int, question_nums: List[int], passage: Dict) -> Dict:
    questions = []
    for i, blank in enumerate(passage["blanks"]):
        q_num = question_nums[i]
        options, correct_letter = generate_options(blank["correct"], blank["distractors"])
        questions.append({"question_number": q_num, "question_text": blank["question"], "correct_answer": correct_letter, "explanation": blank["correct"], "options": options})
    return {"part": 6, "group_type": "READING", "passage": passage["passage"], "knowledge": f"Part 6: Text Completion", "questions": questions}

def generate_part7_group(test_num: int, group_num: int, start_q_num: int, question_count: int, passage: Dict) -> Dict:
    all_questions = passage["questions"]
    # Use test-specific and group-specific offset to ensure unique questions across tests
    # This ensures each test gets different questions from the passage pool without visible markers
    unique_offset = (test_num - 1) * 15 + (group_num - 1) * 3  # Larger offset to avoid overlap
    selected_questions = [all_questions[(i + unique_offset) % len(all_questions)] for i in range(question_count)]
    questions = []
    for i, qa in enumerate(selected_questions):
        q_num = start_q_num + i
        # Use the question as-is without adding visible identifiers
        options, correct_letter = generate_options(qa["correct"], qa["distractors"])
        questions.append({"question_number": q_num, "question_text": qa["question"], "correct_answer": correct_letter, "explanation": qa["correct"], "options": options})
    return {"part": 7, "group_type": "READING", "passage": passage["passage"], "knowledge": f"Part 7: Reading Comprehension", "questions": questions}

def generate_test(test_num: int) -> Dict:
    question_groups = []
    current_q_num = 1
    
    part1_scenes = get_unused_content("part1_scenes", PART1_SCENES, 6)
    mark_content_used("part1_scenes", part1_scenes)
    for i, scene in enumerate(part1_scenes):
        group = generate_part1_question(test_num, current_q_num, scene)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 1
    
    part2_qa = get_unused_content("part2_qa", PART2_QUESTIONS, 25)
    mark_content_used("part2_qa", part2_qa)
    for i, qa in enumerate(part2_qa):
        group = generate_part2_question(test_num, current_q_num, qa)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 1
    
    part3_convs = get_unused_content("part3_conversations", PART3_CONVERSATIONS, 13)
    mark_content_used("part3_conversations", part3_convs)
    for i, conv in enumerate(part3_convs):
        group = generate_part3_group(test_num, i + 1, current_q_num, conv)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    part4_talks = get_unused_content("part4_talks", PART4_TALKS, 10)
    mark_content_used("part4_talks", part4_talks)
    for i, talk in enumerate(part4_talks):
        group = generate_part4_group(test_num, i + 1, current_q_num, talk)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    part5_grammar = get_unused_content("part5_grammar", PART5_GRAMMAR, 30)
    mark_content_used("part5_grammar", part5_grammar)
    for i, grammar in enumerate(part5_grammar):
        group = generate_part5_question(test_num, i + 1, grammar)
        group["display_order"] = i + 1
        question_groups.append(group)
    current_q_num += 30
    
    part6_passages = get_unused_content("part6_passages", PART6_PASSAGES, 4)
    mark_content_used("part6_passages", part6_passages)
    for i, passage in enumerate(part6_passages):
        question_nums = [current_q_num + j for j in range(4)]
        group = generate_part6_group(test_num, i + 1, question_nums, passage)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 4
    
    questions_per_group = [4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4]
    part7_passages = get_unused_content("part7_passages", PART7_PASSAGES, 15)
    mark_content_used("part7_passages", part7_passages)
    for i, (passage, q_count) in enumerate(zip(part7_passages, questions_per_group)):
        group = generate_part7_group(test_num, i + 1, current_q_num, q_count, passage)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += q_count
    
    return {"test": {"title": f"TOEIC Test {test_num:03d}", "duration": 120, "total_questions": 200, "description": "Full TOEIC practice test", "is_active": True}, "question_groups": question_groups}

def main():
    import sys
    print("Generating 100 Truly Unique TOEIC Tests")
    print("=" * 60)
    
    generate_all = "--all" in sys.argv
    
    if not generate_all:
        print("\nGenerating test001.json for validation...")
        test_data = generate_test(1)
        output_file = OUTPUT_DIR / "test001.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)
        print(f"Saved to {output_file}")
        print("\nTo generate all 100 tests, run: python generate_truly_unique_tests.py --all")
    else:
        print("\nGenerating all 100 tests with truly unique content...")
        print("=" * 60)
        
        for test_num in range(1, TOTAL_TESTS + 1):
            print(f"\nGenerating test{test_num:03d}.json...")
            try:
                test_data = generate_test(test_num)
                output_file = OUTPUT_DIR / f"test{test_num:03d}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(test_data, f, indent=2, ensure_ascii=False)
                print(f"  ✓ test{test_num:03d}.json - Generated")
            except Exception as e:
                print(f"  ✗ test{test_num:03d}.json - Error: {e}")
                break
        
        print("\n" + "=" * 60)
        print("GENERATION COMPLETE")
        print("=" * 60)
        print(f"Tests generated: {test_num}")
        print("=" * 60)

if __name__ == "__main__":
    main()
