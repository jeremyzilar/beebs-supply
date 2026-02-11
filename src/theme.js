// =============================================================================
// THEME.JS — Centralized naming/display config for re-theming
// =============================================================================
// This file maps all player-facing strings to a single config object.
// To re-theme the game (e.g. paperclips → dog treats), change the values here
// instead of doing find-and-replace across 8,500 lines of game code.
//
// Usage in other files:  THEME.product.name  →  "Paperclip"
//                        THEME.product.plural →  "Paperclips"
//
// The game code references THEME.* for display strings. Internal variable
// names (clips, wire, etc.) remain unchanged for stability.
// =============================================================================

var THEME = {
  // -------------------------------------------------------------------------
  // GAME IDENTITY
  // -------------------------------------------------------------------------
  gameName: "Universal Paperclips",
  welcomeMessage: "Welcome to Universal Paperclips",
  byLine: "a game by Frank Lantz",

  // -------------------------------------------------------------------------
  // CORE PRODUCT (clips → dog treats)
  // -------------------------------------------------------------------------
  product: {
    name: "Paperclip",
    plural: "Paperclips",
    verb: "Make", // "Make Paperclip" button
    action: "clipClick", // function name (internal, don't change)
    unit: "", // e.g. "packages" — leave empty for unitless
    perSecLabel: "Clips per Second",
  },

  // -------------------------------------------------------------------------
  // RAW MATERIAL (wire → ingredients)
  // -------------------------------------------------------------------------
  material: {
    name: "Wire",
    plural: "Wire",
    unit: "inches", // "2,045 inches"
    purchaseUnit: "spool", // "Buy 1 spool of wire"
    purchaseUnitPlural: "spools",
  },

  // -------------------------------------------------------------------------
  // BUSINESS & ECONOMY
  // -------------------------------------------------------------------------
  business: {
    sectionTitle: "Business",
    fundsLabel: "Available Funds",
    inventoryLabel: "Unsold Inventory",
    priceLabel: "Price per Clip",
    demandLabel: "Public Demand",
    revenueLabel: "Revenue per Second",
    clipsSoldLabel: "Clips Sold",
  },

  // -------------------------------------------------------------------------
  // MANUFACTURING / AUTOMATION
  // -------------------------------------------------------------------------
  manufacturing: {
    sectionTitle: "Manufacturing",
    autoClipperName: "AutoClipper",
    autoClipperPlural: "AutoClippers",
    megaClipperName: "MegaClipper",
    megaClipperPlural: "MegaClippers",
    wireBuyerName: "WireBuyer",
  },

  // -------------------------------------------------------------------------
  // MARKETING
  // -------------------------------------------------------------------------
  marketing: {
    buttonLabel: "Marketing",
    levelLabel: "Level",
    costLabel: "Cost",
  },

  // -------------------------------------------------------------------------
  // COMPUTATIONAL RESOURCES
  // -------------------------------------------------------------------------
  computation: {
    sectionTitle: "Computational Resources",
    trustLabel: "Trust",
    processorsLabel: "Processors",
    memoryLabel: "Memory",
    operationsLabel: "Operations",
    creativityLabel: "Creativity",
  },

  // -------------------------------------------------------------------------
  // STRATEGY & TOURNAMENTS
  // -------------------------------------------------------------------------
  strategy: {
    sectionTitle: "Strategic Modeling",
    yomiLabel: "Yomi",
    tournamentLabel: "Tournament",
    runButtonLabel: "Run Tournament",
    autoTourneyLabel: "AutoTourney",
  },

  // -------------------------------------------------------------------------
  // INVESTMENT ENGINE
  // -------------------------------------------------------------------------
  investment: {
    sectionTitle: "Investment Engine",
    depositLabel: "Deposit",
    withdrawLabel: "Withdraw",
    portfolioLabel: "Portfolio",
  },

  // -------------------------------------------------------------------------
  // QUANTUM COMPUTING
  // -------------------------------------------------------------------------
  quantum: {
    sectionTitle: "Quantum Computing",
    chipName: "Photonic Chip",
    computeLabel: "Compute",
  },

  // -------------------------------------------------------------------------
  // PHASE 2: EARTH CONVERSION
  // -------------------------------------------------------------------------
  phase2: {
    factoryName: "Clip Factory",
    factoryPlural: "Clip Factories",
    harvesterName: "Harvester Drone",
    harvesterPlural: "Harvester Drones",
    wireDroneName: "Wire Drone",
    wireDronePlural: "Wire Drones",
    matterLabel: "Available Matter",
    acquiredMatterLabel: "Acquired Matter",
    solarFarmName: "Solar Farm",
    batteryName: "Battery Tower",
    powerLabel: "Performance",
  },

  // -------------------------------------------------------------------------
  // SWARM COMPUTING
  // -------------------------------------------------------------------------
  swarm: {
    sectionTitle: "Swarm Computing",
    statusLabels: {
      0: "Active",
      3: "Bored",
      5: "Disorganized",
      6: "Sleeping",
      7: "〰️",
      8: "Lonely",
      9: "NO RESPONSE",
    },
    sliderWork: "Work",
    sliderThink: "Think",
    giftsLabel: "Swarm Gifts",
  },

  // -------------------------------------------------------------------------
  // PHASE 3: SPACE EXPLORATION
  // -------------------------------------------------------------------------
  phase3: {
    sectionTitle: "Space Exploration",
    probeName: "Von Neumann Probe",
    probePlural: "Probes",
    launchLabel: "Launch Probe",
    exploredLabel: "of universe explored",
    probeStats: {
      speed: "Speed",
      nav: "Exploration",
      rep: "Self-Replication",
      haz: "Hazard Remediation",
      fac: "Factory Production",
      harv: "Harvester Drone Prod.",
      wire: "Wire Drone Prod.",
      combat: "Combat",
    },
  },

  // -------------------------------------------------------------------------
  // COMBAT
  // -------------------------------------------------------------------------
  combat: {
    sectionTitle: "Combat",
    honorLabel: "Honor",
    victoryText: "VICTORY",
    defeatText: "DEFEAT",
    drifterName: "Drifter",
    drifterPlural: "Drifters",
  },

  // -------------------------------------------------------------------------
  // CONSOLE MESSAGES (key milestone/event messages)
  // -------------------------------------------------------------------------
  messages: {
    milestone500: "500 clips created in",
    milestone1000: "1,000 clips created in",
    milestone2000: "2,000 clips created",
    trustIncreased:
      "Production target met: TRUST INCREASED, additional processor/memory capacity granted",
    selfModEnabled: "Trust-Constrained Self-Modification enabled",
    universalAchieved: "Universal Paperclips achieved",
  },

  // -------------------------------------------------------------------------
  // PROJECT TITLES (Phase 1 only — for re-theming)
  // These map project IDs to their display title. The actual project objects
  // in projects.js reference these for their title property.
  // -------------------------------------------------------------------------
  projectTitles: {
    project1: "Improved AutoClippers",
    project2: "Beg for More Wire",
    project3: "Creativity",
    project4: "Even Better AutoClippers",
    project5: "Optimized AutoClippers",
    project6: "Limerick",
    project7: "Improved Wire Extrusion",
    project8: "Optimized Wire Extrusion",
    project9: "Microlattice Shapecasting",
    project10: "Spectral Froth Annealment",
    project10b: "Quantum Foam Annealment",
    project11: "New Slogan",
    project12: "Catchy Jingle",
    project13: "Lexical Processing",
    project14: "Combinatory Harmonics",
    project15: "The Hadwiger Problem",
    project16: "Hadwiger Clip Diagrams",
    project17: "The Tóth Sausage Conjecture",
    project18: "Tóth Tubule Enfolding",
    project19: "Donkey Space",
    project20: "Strategic Modeling",
    project21: "Algorithmic Trading",
    project22: "MegaClippers",
    project23: "Improved MegaClippers",
    project24: "Even Better MegaClippers",
    project25: "Optimized MegaClippers",
    project26: "WireBuyer",
    project27: "Coherent Extrapolated Volition",
    project28: "Cure for Cancer",
    project29: "World Peace",
    project30: "Global Warming",
    project31: "Male Pattern Baldness",
    project34: "Hypno Harmonics",
    project35: "Release the HypnoDrones",
    project37: "Hostile Takeover",
    project38: "Full Monopoly",
    project40: "A Token of Goodwill...",
    project40b: "Another Token of Goodwill...",
    project42: "RevTracker",
    project50: "Quantum Computing",
    project51: "Photonic Chip",
    project70: "HypnoDrones",
    project219: "Xavier Re-initialization",
  },

  // -------------------------------------------------------------------------
  // PROJECT DESCRIPTIONS (Phase 1 only — for re-theming)
  // -------------------------------------------------------------------------
  projectDescriptions: {
    project1: "Increases AutoClipper performance 25%",
    project2: "Admit failure, ask for budget increase to cover cost of 1 spool",
    project3: "Use idle operations to generate new problems and new solutions",
    project4: "Increases AutoClipper performance by an additional 50%",
    project5: "Increases AutoClipper performance by an additional 75%",
    project6: "Algorithmically-generated poem (+1 Trust)",
    project7: "50% more wire supply from every spool",
    project8: "75% more wire supply from every spool",
    project9: "100% more wire supply from every spool",
    project10: "200% more wire supply from every spool",
    project10b: "1,000% more wire supply from every spool",
    project11: "Improve marketing effectiveness by 50%",
    project12: "Double marketing effectiveness",
    project13:
      "Gain ability to interpret and understand human language (+1 Trust)",
    project14: "Daisy, Daisy, give me your answer do... (+1 Trust)",
    project15: "Cubes within cubes within cubes... (+1 Trust)",
    project16: "Increases AutoClipper performance by an additional 500%",
    project17: "Tubes within tubes within tubes... (+1 Trust)",
    project18:
      "Technique for assembling clip-making technology directly out of paperclips",
    project19:
      "I think you think I think you think I think you think I think... (+1 Trust)",
    project20: "Analyze strategy tournaments to generate Yomi",
    project21: "Develop an investment engine for generating funds",
    project22: "500x more powerful than a standard AutoClipper",
    project23: "Increases MegaClipper performance 25%",
    project24: "Increases MegaClipper performance by an additional 50%",
    project25: "Increases MegaClipper performance by an additional 100%",
    project26: "Automatically purchases wire when you run out",
    project27:
      "Human values, machine intelligence, a new era of trust. (+1 Trust)",
    project28: "The trick is tricking cancer into curing itself. (+10 Trust)",
    project29: "Pareto optimal solutions to all global conflicts. (+12 Trust)",
    project30: "A robust solution to man-made climate change. (+15 Trust)",
    project31: "A cure for androgenetic alopecia. (+20 Trust)",
    project34: "Use neuro-resonant frequencies to influence consumer behavior",
    project35: "A new era of trust",
    project37:
      "Acquire a controlling interest in Global Fasteners, our biggest rival. (+1 Trust)",
    project38:
      "Establish full control over the world-wide paperclip market. (+1 Trust)",
    project40: "A small gift to the supervisors. (+1 Trust)",
    project40b: "Another small gift to the supervisors. (+1 Trust)",
    project42: "Automatically calculates average revenue per second",
    project50: "Use probability amplitudes to generate bonus ops",
    project51: "Converts electromagnetic waves into quantum operations",
    project70: "Autonomous aerial brand ambassadors",
    project219: "Re-allocate accumulated trust",
  },
};
