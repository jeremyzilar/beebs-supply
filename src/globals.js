// =============================================================================
// GLOBALS.JS — All game state variables
// =============================================================================
// Every variable here is global and mutated directly by main.js, projects.js,
// and combat.js. Grouped by game system for readability.
// =============================================================================

// -----------------------------------------------------------------------------
// CORE CLIP PRODUCTION
// -----------------------------------------------------------------------------

var clips = 0; // Total paperclips ever created (lifetime counter)
var unusedClips = 0; // Clips available as currency (not sold; used for building in Phase 2+)
var clipRate = 0; // Current clips produced per second (display value)
var clipRateTemp = 0; // Accumulator for measuring clip rate over 100 ticks
var prevClips = 0; // Previous clip count for rate calculation
var clipRateTracker = 0; // Counter that resets at 100 to compute rate
var clipmakerRate = 0; // Display variable for clips per second
var clipmakerLevel = 0; // Number of AutoClippers owned
var clipmakerLevel2 = 0; // Display alias for clipmakerLevel
var unsoldClips = 0; // Clips manufactured but not yet sold to public

// -----------------------------------------------------------------------------
// AUTOCLIPPERS & MEGACLIPPERS
// -----------------------------------------------------------------------------

var clipperCost = 5; // Current cost to buy one AutoClipper
var clippperCost = 5; // Typo duplicate of clipperCost (used in makeClipper)
var clipperBoost = 1; // Multiplier for AutoClipper output (increased by projects)
var boostLvl = 0; // AutoClipper boost level (0-3, gates upgrade projects)
var autoClipperFlag = 0; // Whether AutoClipper UI section is visible

var megaClipperFlag = 0; // Whether MegaClipper UI section is visible
var megaClipperCost = 500; // Current cost of a MegaClipper
var megaClipperLevel = 0; // Number of MegaClippers owned
var megaClipperBoost = 1; // MegaClipper output multiplier

// -----------------------------------------------------------------------------
// BUSINESS & ECONOMY
// -----------------------------------------------------------------------------

var funds = 0; // Current cash on hand
var margin = 0.25; // Sale price per clip (starts at $0.25)
var demand = 5; // Current demand level (drives sales probability)
var clipsSold = 0; // Lifetime clips sold
var avgRev = 0; // Average revenue per second
var income = 0; // Cumulative income tracker
var incomeTracker = [0]; // Rolling array of per-second income (last 10 values)
var ticks = 0; // Main loop tick counter (10ms per tick; 100 ticks = 1 second)
var transaction = 1; // Last sale transaction amount
var marketing = 1; // Marketing multiplier: 1.1^(marketingLvl-1)
var marketingLvl = 1; // Marketing level purchased
var adCost = 100; // Current cost to upgrade marketing level
var demandBoost = 1; // Demand multiplier (from Hostile Takeover / Full Monopoly)
var marketingEffectiveness = 1; // Marketing effectiveness multiplier (from projects)
var marketingEffectiveness = 1; // (duplicate declaration in original code)

// -----------------------------------------------------------------------------
// WIRE SUPPLY CHAIN
// -----------------------------------------------------------------------------

var wire = 1000; // Current wire inventory (raw material; 1 wire = 1 clip)
var wireCost = 20; // Current price to buy a spool of wire
var wireSupply = 1000; // Units of wire per spool purchase
var wirePurchase = 0; // Number of wire purchases made (gates projects)
var wirePriceCounter = 0; // Sine wave counter for price oscillation
var wireBasePrice = 20; // Base wire price (slowly decreases; bumped by purchases)
var wirePriceTimer = 0; // Timer for gradual wire price decrease
var wireBuyerFlag = 0; // Whether auto wire buyer is unlocked (project26)
var wireBuyerStatus = 1; // Auto wire buyer toggle: 1=ON, 0=OFF
var nanoWire = 0; // Wire carried from Phase 1 → Phase 2 transition

// -----------------------------------------------------------------------------
// COMPUTATIONAL RESOURCES
// -----------------------------------------------------------------------------

var processors = 1; // Number of processors (each generates ops)
var memory = 1; // Number of memory units (max ops = memory × 1000)
var operations = 0; // Current computational operations available
var standardOps = 0; // Standard operations pool (from processors)
var tempOps = 0; // Temporary operations (from quantum computing; decay)
var opFade = 0; // Rate at which temporary ops decay per tick
var opFadeTimer = 0; // Timer tracking how long temp ops have existed
var opFadeDelay = 800; // Delay (ticks) before temp ops begin decaying

// -----------------------------------------------------------------------------
// TRUST SYSTEM
// Trust is the budget for processors + memory. Earned from clip milestones.
// Trust thresholds follow Fibonacci: 3K, 5K, 8K, 13K, 21K, 34K, 55K...
// -----------------------------------------------------------------------------

var trust = 2; // Total trust (split between processors & memory)
var nextTrust = 3000; // Clip count threshold for next trust increase
var fib1 = 2; // Fibonacci value 1 (for trust threshold calculation)
var fib2 = 3; // Fibonacci value 2 (for trust threshold calculation)
var trustFlag = 1; // Whether trust milestone system is active
var maxTrust = 20; // Maximum trust cap (increased with honor in Phase 3)
var maxTrustCost = 91117.99; // Honor cost to raise maxTrust by 10

// -----------------------------------------------------------------------------
// CREATIVITY
// Generated when operations are at maximum capacity (ops == memory × 1000).
// Used as currency for certain projects.
// -----------------------------------------------------------------------------

var creativity = 0; // Creativity resource amount
var creativityOn = false; // Whether creativity generation is enabled (project3)
var creativitySpeed = 1; // Speed multiplier for creativity generation
var creativityCounter = 0; // Counter for creativity tick calculations

// -----------------------------------------------------------------------------
// FEATURE UNLOCK FLAGS
// Control which UI sections are visible and which game systems are active.
// -----------------------------------------------------------------------------

var milestoneFlag = 0; // Progress milestone counter (0-20)
var compFlag = 0; // Computational resources div unlocked
var projectsFlag = 0; // Projects panel unlocked
var revPerSecFlag = 0; // Revenue per second display unlocked
var humanFlag = 1; // KEY PHASE FLAG: 1=Phase 1 (human era), 0=Phase 2+
var creationFlag = 0; // Creation/manufacturing div shown (Phase 2)
var wireProductionFlag = 0; // Wire production div shown (Phase 2)
var spaceFlag = 0; // KEY PHASE FLAG: 0=Earth, 1=Space exploration (Phase 3)
var factoryFlag = 0; // Factory div unlocked
var harvesterFlag = 0; // Harvester div unlocked
var wireDroneFlag = 0; // Wire drone div unlocked
var safetyProjectOn = false; // Safety-related project is active
var egoFlag = 0; // Ego/self-awareness project flag
var tothFlag = 0; // Tóth Tubule system (build from clips) unlocked

// -----------------------------------------------------------------------------
// STRATEGY ENGINE & TOURNAMENTS
// Earn "yomi" currency by running game-theory tournaments.
// -----------------------------------------------------------------------------

var strategyEngineFlag = 0; // Strategy tournament engine unlocked (project20)
var autoTourneyFlag = 0; // Auto-tournament unlocked (project118)
var autoTourneyStatus = 1; // Auto-tournament toggle: 1=ON, 0=OFF

// -----------------------------------------------------------------------------
// INVESTMENT ENGINE
// Passive income from automated stock trading.
// -----------------------------------------------------------------------------

var investmentEngineFlag = 0; // Investment engine unlocked (project21)
var bankroll = 0; // Cash deposited in investment account

// -----------------------------------------------------------------------------
// QUANTUM COMPUTING
// 10 photonic chips with sine-wave values. Click "Compute" to harvest ops.
// Excess ops go to tempOps which decay over time.
// -----------------------------------------------------------------------------

var qFlag = 0; // Quantum computing unlocked (project50)
var qClock = 0; // Quantum computing clock (drives sine waves)
var qChipCost = 10000; // Cost for next photonic chip (increases by 5000 each)
var nextQchip = 0; // Index of next chip to activate
var qFade = 1; // Visual fade effect for quantum display

// -----------------------------------------------------------------------------
// PHASE 2: FACTORIES & DRONES
// Post-human era: consume Earth's matter to make clips.
// Supply chain: Available Matter → Harvesters → Acquired Matter → Wire Drones → Wire → Factories → Clips
// -----------------------------------------------------------------------------

var factoryLevel = 0; // Number of clip factories
var factoryBoost = 1; // Factory output multiplier (1 or 1000 after project102)
var factoryCost = 100000000; // Cost for next factory (in unused clips)
var factoryRate = 1000000000; // Clips per factory per tick (base rate)
var factoryBill = 0; // Cumulative clips spent on factories (for reboot refund)

var harvesterLevel = 0; // Number of harvester drones
var harvesterRate = 26180337; // Matter harvested per drone per tick
var harvesterCost = 1000000; // Cost for next harvester (in unused clips)
var harvesterBill = 0; // Cumulative cost spent (for reboot refund)

var wireDroneLevel = 0; // Number of wire-making drones
var wireDroneRate = 16180339; // Wire processed per drone per tick
var wireDroneCost = 1000000; // Cost for next wire drone (in unused clips)
var wireDroneBill = 0; // Cumulative cost spent (for reboot refund)

var droneBoost = 1; // Drone output multiplier (1 or 2 after project112)

var availableMatter = Math.pow(10, 24) * 6000; // Earth's matter: 6×10^27
var acquiredMatter = 0; // Matter harvested but not yet processed to wire
var processedMatter = 0; // Matter processed tracker

// -----------------------------------------------------------------------------
// POWER SYSTEM
// Solar farms generate power; batteries store it. Power throttles production
// via powMod (0 to 1+). Everything slows down when underpowered.
// -----------------------------------------------------------------------------

var farmRate = 50; // Power production per solar farm per tick
var batterySize = 10000; // Power storage per battery
var factoryPowerRate = 200; // Power consumed per factory per tick
var dronePowerRate = 1; // Power consumed per drone per tick
var farmLevel = 0; // Number of solar farms
var batteryLevel = 0; // Number of batteries
var farmCost = 10000000; // Cost for next solar farm
var batteryCost = 1000000; // Cost for next battery
var storedPower = 0; // Current stored power
var powMod = 0; // Power efficiency modifier (0-1+); scales ALL production
var momentum = 0; // When 1, powMod slowly increases while fully powered
var farmBill = 0; // Cumulative cost for reboot refund
var batteryBill = 0; // Cumulative cost for reboot refund

// -----------------------------------------------------------------------------
// PHASE 3: SPACE PROBES
// Self-replicating Von Neumann probes explore and consume the universe.
// 8 probe attributes allocated from a trust budget.
// -----------------------------------------------------------------------------

var probeCount = 0; // Current number of active probes
var totalMatter = Math.pow(10, 54) * 30; // Total matter in the universe: 3×10^55
var foundMatter = availableMatter; // Total matter discovered by probes
var probeCost; // Clip cost per probe launch (set in main.js: 10^17)

// -----------------------------------------------------------------------------
// COMBAT & HONOR
// Probes that "drift" become drifters. Combat earns honor for trust upgrades.
// Canvas-based real-time particle battle system (see combat.js).
// -----------------------------------------------------------------------------

var battleFlag = 0; // Combat system active
var honor = 0; // Honor currency (from combat victories)
var bribe = 1000000; // Cost for hypno-drone bribe

// -----------------------------------------------------------------------------
// SWARM COMPUTING
// Drone swarm generates computational "gifts" (extra trust).
// Slider trades drone work speed for gift generation rate.
// -----------------------------------------------------------------------------

var swarmFlag = 0; // Swarm computing unlocked (project126)
var swarmStatus = 7; // Swarm state: 0=Active, 3=Bored, 5=Disorg, 6=Sleep, 7=Hidden, 8=Lonely, 9=No Response
var swarmGifts = 0; // Accumulated gift trust from swarm
var nextGift = 0; // Next gift amount
var giftPeriod = 125000; // Threshold for gift generation
var giftCountdown = giftPeriod; // Time until next gift
var elapsedTime = 0; // Elapsed time tracker

var sliderPos = 0; // Swarm slider: 0-200 (low=work fast, high=think more)
var disorgCounter = 0; // Disorganization tracker (harvester/wireDrone ratio > 1.5)
var disorgFlag = 0; // Swarm is disorganized
var disorgMsg = 0; // Disorganization message flag
var synchCost = 5000; // Yomi cost to re-synchronize swarm

var entertainCost = 10000; // Creativity cost to entertain bored swarm
var boredomLevel = 0; // Boredom accumulator (when no matter to harvest)
var boredomFlag = 0; // Swarm is bored
var boredomMsg = 0; // Boredom message flag

var threnodyCost = 50000; // Cost for Threnody project (escalates by 10K each use)
var driftKingMessageCost = 1; // Cost for Drift King messages (trivially low)

// -----------------------------------------------------------------------------
// PRESTIGE SYSTEM
// Persists across game resets via localStorage.
// Each level provides a permanent bonus on subsequent playthroughs.
// -----------------------------------------------------------------------------

var prestigeU = 0; // "Universe" prestige: +10% demand per level
var prestigeS = 0; // "Speed" prestige: +10% creativity speed per level

// -----------------------------------------------------------------------------
// ENDGAME & DISASSEMBLY
// After "Reject" choice, systems are torn down one by one.
// dismantle counter (0-7) controls which UI sections disappear.
// Final 100 clips are made by hand, then credits roll.
// -----------------------------------------------------------------------------

var dismantle = 0; // Endgame phase counter (0-7)
var endTimer1 = 0; // Staggered teardown timers
var endTimer2 = 0;
var endTimer3 = 0;
var endTimer4 = 0;
var endTimer5 = 0;
var endTimer6 = 0;

var finalClips = 0; // Manual clips during final 100-clip sequence
var resetFlag = 2; // 2=normal play; other values trigger reset on load
var testFlag = 0; // Debug/test flag

// -----------------------------------------------------------------------------
// AUDIO
// Threnody music plays during the endgame credits sequence.
// -----------------------------------------------------------------------------

var threnodyAudio = new Audio();
var threnodyLoadedBool = false;

// -----------------------------------------------------------------------------
// MISCELLANEOUS
// -----------------------------------------------------------------------------

var x = 0; // Unused/general purpose variable
var blinkCounter = 0; // UI blink animation counter
