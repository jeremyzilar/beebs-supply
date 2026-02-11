// =============================================================================
// COMBAT.JS — Canvas-based real-time particle battle system
// =============================================================================
// This file implements the probe vs. drifter combat system (Phase 3).
// Battles are rendered on a 310×150 HTML5 canvas as a 2D particle simulation.
//
// Architecture:
//   - Battle() constructor creates a canvas animation loop at ~60fps (16ms)
//   - Ships are 2×2 pixel dots that flock, seek enemies, and fight
//   - A grid-based spatial partitioning system (31×15 cells) enables efficient
//     neighbor lookup for combat and movement calculations
//   - Each canvas dot represents `unitSize` actual probes/drifters
//   - Combat deaths reduce actual probeCount/drifterCount by unitSize per dot
//
// Flow: checkForBattles() → createBattle() → Battle() → Update loop →
//       DoCombat() + MoveShips() → checkForBattleEnd() → endBattle()
// =============================================================================

// -----------------------------------------------------------------------------
// CONSTANTS & CONFIGURATION
// -----------------------------------------------------------------------------

var battleWIDTH = 310;
var battleHEIGHT = 150;
var battleGRID_WIDTH = 31; //number of grid cells
var battleGRID_HEIGHT = 15;
var battleINV_GRID_WIDTH = 1 / (battleWIDTH / battleGRID_WIDTH);
var battleINV_GRID_HEIGHT = 1 / (battleHEIGHT / battleGRID_HEIGHT);

var battleLEFTSHIPS = 200; // Number of player (probe) dots on canvas
var battleRIGHTSHIPS = 200; // Number of enemy (drifter) dots on canvas

var battleMAXSPEED = 2; // Max pixels/frame ship movement speed
var battleDEATH_THRESHOLD = 0.5; // Base chance-to-kill threshold (reset each combat check)
var battleLEFTCOLOR = "#ffffff"; // Player ships: white
var battleRIGHTCOLOR = "#000000"; // Enemy ships: black
var battleEXPLODECOLOR = "#ffffff"; // Explosion flash: white

// --- Ship & Grid State ---
var ships = new Array(); // Array of all Ship objects on canvas
var numShips = 0; // Total ships (alive + dead)
var grid = new Array(battleGRID_HEIGHT); // 2D grid for spatial partitioning
var numLeftShips = 0; // Living player ships on canvas
var numRightShips = 0; // Living enemy ships on canvas

// --- Combat Variables ---
var probeCombat = 0; // Player combat stat (from probe trust allocation)
var probeCombatBaseRate = 0.15; // Base multiplier for combat effectiveness
var attackSpeed = 0.2; // Attack speed modifier
var battleSpeed = 0.2; // Battle speed (affects old non-canvas system)
var attackSpeedFlag = 0; // Whether OODA Loop bonus is active (project120)
var attackSpeedMod = 0.1; // Speed modifier constant
var battles = []; // Array of active battle objects
var battleID = 0; // Incrementing battle ID counter
var battleName = "foo"; // Current battle name (for display)
var battleNameFlag = 0; // Whether to use Napoleonic battle names (project121)
var maxBattles = 1; // Max concurrent battles
var battleClock = 0; // Stalemate clock (forces end at 2000)
var battleAlarm = 10; // Alarm threshold (unused)
var outcomeTimer = 150; // Frames to show result before cleanup (old system)
var drifterCombat = 1.75; // Enemy combat strength (fixed; higher than player base)
var warTrigger = 1000000; // Drifter count needed before wars can trigger

// --- Battle Scaling ---
var unitSize = 0; // How many real probes/drifters each canvas dot represents
var driftersKilled = 0; // Lifetime drifters killed
var battleEndDelay = 0; // Delay counter after battle ends (for result display)
var battleEndTimer = 100; // Frames to show victory/defeat before cleanup
var masterBattleClock = 0; // Master timeout: forces battle end at 8000 frames

// --- Honor & Rewards ---
var honorCount = 0; // Flag to prevent double-counting honor per battle
var threnodyTitle = "Durenstein 1"; // Last battle name (used for Threnody project)
var bonusHonor = 0; // Cumulative win-streak bonus (from project134 "Glory")
var honorReward = 0; // Honor awarded for current battle

// -----------------------------------------------------------------------------
// BATTLE TRIGGER
// Called each tick from war() in main.js. Checks if conditions are met to
// start a new battle: enough drifters, probes exist, under max battle count.
// 50% random chance per check.
// -----------------------------------------------------------------------------

function checkForBattles() {
  if (
    drifterCount > warTrigger &&
    probeCount > 0 &&
    battles.length < maxBattles
  ) {
    var r = Math.random() * 100;
    if (r >= 50) {
      if (battleFlag == 0) {
        battleFlag = 1;
      }
      createBattle();
    }
  }
}

// Napoleonic battle names for flavor (unlocked by project121 "Name the Battles")
var battleNames = [
  "Aboukir",
  "Abensberg",
  "Acre",
  "Alba de Tormes",
  "la Albuera",
  "Algeciras Bay",
  "Amstetten",
  "Arcis-sur-Aube",
  "Aspern-Essling",
  "Jena-Auerstedt",
  "Arcole",
  "Austerlitz",
  "Badajoz",
  "Bailen",
  "la Barrosa",
  "Bassano",
  "Bautzen",
  "Berezina",
  "Bergisel",
  "Borodino",
  "Burgos",
  "Bucaco",
  "Cadiz",
  "Caldiero",
  "Castiglione",
  "Castlebar",
  "Champaubert",
  "Chateau-Thierry",
  "Copenhagen",
  "Corunna",
  "Craonne",
  "Dego",
  "Dennewitz",
  "Dresden",
  "Durenstein",
  "Eckmuhl",
  "Elchingen",
  "Espinosa de los Monteros",
  "Eylau",
  "Cape Finisterre",
  "Friedland",
  "Fuentes de Onoro",
  "Gevora River",
  "Gerona",
  "Hamburg",
  "Haslach-Jungingen",
  "Heilsberg",
  "Hohenlinden",
  "Jena-Auerstedt",
  "Kaihona",
  "Kolberg",
  "Landshut",
  "Leipzig",
  "Ligny",
  "Lodi",
  "Lubeck",
  "Lutzen",
  "Marengo",
  "Maria",
  "Medellin",
  "Medina de Rioseco",
  "Millesimo",
  "Mincio River",
  "Mondovi",
  "Montebello",
  "Montenotte",
  "Montmirail",
  "Mount Tabor",
  "The Nile",
  "Novi",
  "Ocana",
  "Cape Ortegal",
  "Orthez",
  "Pancorbo",
  "Piave River",
  "The Pyramids",
  "Quatre Bras",
  "Raab",
  "Raszyn",
  "Rivoli",
  "Rolica",
  "La Rothiere",
  "Rovereto",
  "Saalfeld",
  "Schongrabern",
  "Salamanca",
  "Smolensk",
  "Somosierra",
  "Talavera",
  "Tamames",
  "Trafalgar",
  "Trebbia",
  "Tudela",
  "Ulm",
  "Valls",
  "Valmaseda",
  "Valutino",
  "Vauchamps",
  "Vimeiro",
  "Vitoria",
  "Wagram",
  "Waterloo",
  "Wavre",
  "Wertingen",
  "Zaragoza",
];

var battleNumbers = []; // Tracks how many times each battle name has been used

for (i = 0; i < battleNames.length; i++) {
  battleNumbers.push(1);
}

// Generate a unique battle name: random Napoleonic name + incrementing number
function generateBattleName() {
  var x = Math.floor(Math.random() * battleNames.length);
  var name = battleNames[x] + " " + battleNumbers[x];
  battleNumbers[x] = battleNumbers[x] + 1;
  return name;
}

// =============================================================================
// OLD NON-CANVAS BATTLE SYSTEM (COMMENTED OUT)
// This was the original text-based battle system that ran as pure math.
// It was replaced by the canvas particle simulation below but left in the code.
// =============================================================================

/*

function battleWrite(newBattle){
    
    var element = document.getElementById("battleReportsDiv"); 
    var reference = document.getElementById("battleListTop");
    
    var newBattleReport = document.createElement("div");
    newBattleReport.setAttribute("id", "battleReport"+newBattle.id);
    
    var battleNameP = document.createElement("p");
    battleNameP.setAttribute("class", "clean");
    
    if (battleNameFlag == 0){
        battleName = document.createTextNode("Battle "+newBattle.id);

        }
    
    if (battleNameFlag == 1){
        battleName = document.createTextNode(generateBattleName());
        }
    
    battleNameP.appendChild(battleName);
    
    newBattleReport.appendChild(battleNameP);
    
    var battleDetailsP = document.createElement("p");
    battleDetailsP.setAttribute("class", "clean");
    
    var clipsLabelSpan = document.createElement("span");
    clipsLabelSpan.style.fontWeight = "bold";
    
    var clipsLabel = document.createTextNode("Clips: ");
    clipsLabelSpan.appendChild(clipsLabel);
    
    battleDetailsP.appendChild(clipsLabelSpan);
    
    var clipProbeCountSpan = document.createElement("span");
    clipProbeCountSpan.setAttribute("id", "battle"+newBattle.id+"clipCount")
    var clipProbeCount = document.createTextNode(numberCruncher(newBattle.clipProbes));
    clipProbeCountSpan.appendChild(clipProbeCount);
    battleDetailsP.appendChild(clipProbeCountSpan);
    
    var driftersLabelSpan = document.createElement("span");
    driftersLabelSpan.style.fontWeight = "bold";
    
    var driftersLabel = document.createTextNode(" Drifters: ");
    driftersLabelSpan.appendChild(driftersLabel);
    
    battleDetailsP.appendChild(driftersLabelSpan);
    
    var drifterProbeCountSpan = document.createElement("span");
    drifterProbeCountSpan.setAttribute("id", "battle"+newBattle.id+"drifterCount")    
    var drifterProbeCount = document.createTextNode(numberCruncher(newBattle.drifterProbes));
    drifterProbeCountSpan.appendChild(drifterProbeCount);
    battleDetailsP.appendChild(drifterProbeCountSpan);
    
    newBattleReport.appendChild(battleDetailsP);
    
    var territoryP = document.createElement("p");
    territoryP.setAttribute("class", "clean");
    var t = (newBattle.territory/availableMatter);
    var territoryDisplay = document.createTextNode("Territory at stake: "+Math.ceil(t*100)+"% of available matter");
    territoryP.appendChild(territoryDisplay);
    
    newBattleReport.appendChild(territoryP);
   
    var line = document.createElement("hr");
    newBattleReport.appendChild(line);
    
    reference.insertBefore(newBattleReport, reference.childNodes[0]);
        
    }

function updateBattles(){
    
    var combatEffectiveness = probeCombatBaseRate;
    
    if (battleNameFlag == 1) {
        combatEffectiveness = combatEffectiveness*2
    }
    
    if (attackSpeedFlag == 1){
        battleSpeed = attackSpeed * .85;
        if (battleSpeed > .99){
            battleSpeed = .99;
        }
    }
    
    for(var i = 0; i < battles.length; i++){
        r = Math.random();
        if (r>=battleSpeed) {
            var clipCasualties = battles[i].drifterProbes * drifterCombat * (1-battleSpeed);
                if (clipCasualties>battles[i].clipProbes){
                    clipCasualties=battles[i].clipProbes;
                    }
            
            battles[i].clipProbes = battles[i].clipProbes - clipCasualties;
            probeCount = probeCount - clipCasualties;
            probesLostCombat = probesLostCombat + clipCasualties;
            document.getElementById('probesLostCombatDisplay').innerHTML = numberCruncher(probesLostCombat);
            
//            document.getElementById('battle'+battles[i].id+"clipCount").innerHTML = numberCruncher(battles[i].clipProbes);
            
            } else {
            var drifterCasualties = battles[i].clipProbes * Math.pow(probeCombat, 1.7) * combatEffectiveness;
                if (drifterCasualties>battles[i].drifterProbes){
                    drifterCasualties=battles[i].drifterProbes;
                    }
            
                battles[i].drifterProbes = battles[i].drifterProbes - drifterCasualties;
                drifterCount = drifterCount - drifterCasualties;
                
//                document.getElementById('battle'+battles[i].id+"drifterCount").innerHTML = numberCruncher(battles[i].drifterProbes);
            }
        
        if (battles[i].drifterProbes < 1){
            battles[i].victory = true;
        }
    
        if (battles[i].clipProbes < 1 && battles[i].victory == false){
            battles[i].loss = true;
        }

        if (battles[i].loss == true && battles[i].whiteFlag == 0){
            availableMatter = availableMatter - battles[i].territory;
            battles[i].whiteFlag = 1;
        }     
        
        if (battles[i].loss == true){
            
//            document.getElementById("battleReport"+battles[i].id).style.backgroundColor = "LightGrey";
            
            battles[i].reportCount++;
            if (battles[i].reportCount > outcomeTimer){
                battles[i].garbageFlag = 1;
            }
        }
        
        if (battles[i].victory == true){
            battles[i].reportCount++;
            if (battles[i].reportCount > outcomeTimer){
                battles[i].garbageFlag = 1;
            }
        }
    }
}

function battleCleanUp(){
    for(var i = battles.length-1; i >= 0; i--){
        if (battles[i].garbageFlag == 1){
            var element = document.getElementById('battleReport'+battles[i].id);
            element.parentNode.removeChild(element);
            battles.splice(i,1);
        }
    }
    
}



function updateBattleDisplay(battle){
    
    

 var element = document.getElementById("battleListTop"); 
    
    var newBattle = document.createElement("div");
    newBattle.setAttribute("id", battle.id);
    element.appendChild(newBattle, element.firstChild);
    
    var span = document.createElement("span");
    span.setAttribute("class", "clean");    
    span.style.fontWeight = "bold";
    newBattle.appendChild(span);
    
    var hed = document.createTextNode("Combatants");
    span.appendChild(hed);    
    
    var clipsCount = document.createElement("span");
    clipsCount = battle.clipProbes;
    element.appendChild(span);
    
}

*/

// =============================================================================
// CANVAS BATTLE DISPLAY — Real-time particle combat simulation
// =============================================================================
// The Battle() constructor creates a self-contained animation loop on the
// HTML5 canvas. It runs at ~60fps (16ms interval) and simulates:
//
// 1. Ship MOVEMENT: Flocking behavior (seek centroid, match teammates,
//    separate from teammates, attract to enemies)
// 2. Ship COMBAT: Grid-based neighbor lookup; weighted dice rolls determine
//    kills based on combat stats and force ratios
// 3. EXPLOSIONS: 10-frame death animation (flash + expanding fragments)
// 4. VICTORY/DEFEAT: When one side is eliminated, honor is awarded/lost
//
// Player ships (team 0) are white, spawn on left 20% of canvas
// Enemy ships (team 1) are black, spawn on right 20% of canvas
// =============================================================================

function Battle() {
  var canvas;
  var context;
  var interval;
  var sign;

  battleRestart();

  this.initialize = function () {
    canvas = document.getElementById("canvas");

    context = canvas.getContext("2d");

    canvas.width = battleWIDTH;
    canvas.height = battleHEIGHT;

    var interval = setInterval(Update, 16);

    battleRestart();
  };

  var Update = function () {
    ClearFrame();
    UpdateGrid();
    MoveShips();
    DoCombat();
  };

  // Check if the current battle has ended (one side eliminated, stalemate, or timeout)
  function checkForBattleEnd() {
    if (battles.length > 0) {
      if (numLeftShips == 0 || numRightShips == 0) {
        if (project121.flag == 1) {
          document.getElementById("victoryDiv").style.visibility = "visible";

          if (numLeftShips == 0) {
            if (honorCount == 0) {
              bonusHonor = 0;
              honor = honor - battleLEFTSHIPS;
              honorCount = 1;
            }
            document.getElementById("battleResult").innerHTML = "DEFEAT";
            document.getElementById("battleResultSign").innerHTML = "-";
            document.getElementById("honorAmount").innerHTML = battleLEFTSHIPS;
            document.getElementById("honorDisplay").innerHTML =
              Math.round(honor).toLocaleString();
            threnodyTitle = battleName;
          }

          if (numRightShips == 0) {
            if (honorCount == 0) {
              honorReward = battleRIGHTSHIPS + bonusHonor;
              document.getElementById("honorAmount").innerHTML = honorReward;
              honor = honor + honorReward;

              if (project134.flag == 1) {
                bonusHonor = bonusHonor + 10;
              }

              honorCount = 1;
            }

            document.getElementById("battleResult").innerHTML = "VICTORY";
            document.getElementById("battleResultSign").innerHTML = "+";
            document.getElementById("honorDisplay").innerHTML =
              Math.round(honor).toLocaleString();
          }
        }

        battleEndDelay++;
      } else if (numLeftShips <= 4 || numRightShips <= 4) {
        battleClock = battleClock + 1;
        if (battleClock > 2000) {
          endBattle();
        }
      }

      if (battleEndDelay >= battleEndTimer) {
        endBattle();
      }

      masterBattleClock++;
      if (masterBattleClock >= 8000) {
        endBattle();
      }
    }
  }

  // Clean up after a battle: hide victory display, reset timers, remove battle from array
  function endBattle() {
    document.getElementById("victoryDiv").style.visibility = "hidden";
    honorCount = 0;
    battleClock = 0;
    masterBattleClock = 0;
    battleEndDelay = 0;
    battles.splice(0, 1);
  }

  // Reset the canvas battle: clear ships, rebuild grid, spawn new ships for both sides
  function battleRestart() {
    numLeftShips = 0;
    numRightShips = 0;
    numShips = 0;
    ships = new Array();
    grid = new Array(battleGRID_HEIGHT);

    //reset the grid

    var row, col;
    for (row = 0; row < battleGRID_HEIGHT; row++) {
      grid[row] = new Array();
      for (col = 0; col < battleGRID_WIDTH; col++) {
        grid[row][col] = new Cell();
      }
    }

    //create ships... alternate left team and right team so there's no advantage
    //for array position

    var leftShipTurn = false;
    var i = 0;
    while (numLeftShips < battleLEFTSHIPS || numRightShips < battleRIGHTSHIPS) {
      if (leftShipTurn) {
        ships[i] = new Ship(0);
        numLeftShips++;
        numShips++;
        if (numRightShips < battleRIGHTSHIPS) leftShipTurn = false;
      } else {
        ships[i] = new Ship(1);
        numRightShips++;
        numShips++;
        if (numLeftShips < battleLEFTSHIPS) leftShipTurn = true;
      }
      i++;
    }
  }

  var UpdateGrid = function () {
    //First clear grid out

    var p;
    var row, col;
    for (row = 0; row < battleGRID_HEIGHT; row++) {
      for (col = 0; col < battleGRID_WIDTH; col++) {
        grid[row][col].ships.length = 0;
        grid[row][col].numShips = 0;
      }
    }

    //Update Grid cells with ships in each cell

    for (i = 0; i < numShips; i++) {
      p = ships[i];
      if (!ships[i].alive) continue;

      //figure out which grid cell the ship is in

      p.gx = Math.floor(p.x * battleINV_GRID_WIDTH);
      p.gy = Math.floor(p.y * battleINV_GRID_HEIGHT);

      if (p.gx < 0) {
        p.gx = 0;
      }
      if (p.gy < 0) {
        p.gy = 0;
      }
      if (p.gx > battleGRID_WIDTH - 1) {
        p.gx = battleGRID_WIDTH - 1;
      }
      if (p.gy > battleGRID_HEIGHT - 1) {
        p.gy = battleGRID_HEIGHT - 1;
      }

      grid[p.gy][p.gx].add(p); //add ship to this grid cell
    }
  };

  var DoCombat = function () {
    var pX = probeCombat * probeCombatBaseRate;

    //        if (battleNameFlag == 1){
    //        pX = pX*2;
    //        }

    var dX = drifterCombat;

    var p;
    var row, col, i;
    var numLeftTeam, numRightTeam;
    var diceRoll;
    var ooda = 0;

    if (attackSpeedFlag == 1) {
      ooda = probeSpeed * 0.2;
    }

    for (row = 0; row < battleGRID_HEIGHT; row++) {
      for (col = 0; col < battleGRID_WIDTH; col++) {
        //First Check if there are enough ships in this cell to do combat

        if (grid[row][col].numShips < 2) continue;

        numLeftTeam = 0;
        numRightTeam = 0;

        //Now count how many ships for each team in this cell;

        for (i = 0; i < grid[row][col].numShips; i++) {
          p = grid[row][col].ships[i];
          if (!p.alive) continue;
          if (p.team == 0) numLeftTeam++;
          else numRightTeam++;
        }

        if (numLeftTeam == 0 || numRightTeam == 0) continue;

        //now we have at least one ship of each team in this cell.
        //roll a weighted die to see if each ship gets killed

        for (i = 0; i < grid[row][col].numShips; i++) {
          p = grid[row][col].ships[i];
          if (p.team == 0) {
            diceRoll =
              Math.random() * dX * ((numRightTeam / numLeftTeam) * 0.5);
            battleDEATH_THRESHOLD = battleDEATH_THRESHOLD + ooda;
            // console.log("Probe Death Check. dX = "+dX+". diceRoll = "+diceRoll+". deathThreshold = "+battleDEATH_THRESHOLD);
          } else {
            diceRoll =
              (Math.random() * pX + probeCombat * 0.1) *
              ((numLeftTeam / numRightTeam) * 0.5);
            // console.log("Drifter Death Check. pX = "+pX+". diceRoll = "+diceRoll+". deathThreshold = "+battleDEATH_THRESHOLD);
          }
          if (diceRoll > battleDEATH_THRESHOLD) {
            p.alive = false;
            if (p.team == 0) {
              numLeftShips--;
              if (unitSize > probeCount) {
                unitSize = probeCount;
              }
              probeCount = probeCount - unitSize;
              probesLostCombat = probesLostCombat + unitSize;
              document.getElementById("probesLostCombatDisplay").innerHTML =
                numberCruncher(probesLostCombat);
            } else {
              numRightShips--;
              if (unitSize > drifterCount) {
                unitSize = drifterCount;
              }
              drifterCount = drifterCount - unitSize;
              driftersKilled = driftersKilled + unitSize;
              document.getElementById("driftersKilled").innerHTML =
                numberCruncher(driftersKilled);
              document.getElementById("drifterCount").innerHTML =
                numberCruncher(drifterCount);
            }
          }

          battleDEATH_THRESHOLD = 0.5;
        }
      }
    }

    checkForBattleEnd();
  };

  var MoveShips = function () {
    var i, p;
    var centroid = FindCentroid();

    for (i = 0; i < numShips; i++) {
      p = ships[i];
      if (!p.alive) {
        if (p.framesDead < 10) {
          //draw explosion
          context.fillStyle = battleEXPLODECOLOR;
          if (p.framesDead < 1) {
            context.fillRect(p.x - 3, p.y - 3, 7, 7); //big square for one frame
          } else if (p.framesDead < 2) {
            context.fillRect(p.x - 1, p.y - 1, 3, 3); //little square for 1 frame
          }
          //4 little pixel squares moving out from the point of explosion
          context.fillRect(p.x + p.framesDead, p.y + p.framesDead, 1, 1);
          context.fillRect(p.x - p.framesDead, p.y + p.framesDead, 1, 1);
          context.fillRect(p.x + p.framesDead, p.y - p.framesDead, 1, 1);
          context.fillRect(p.x - p.framesDead, p.y - p.framesDead, 1, 1);
          p.framesDead++;
        }
      } else {
        MoveSingleShip(p, centroid);
        context.fillStyle = p.color;
        context.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
    }
  };

  var FindCentroid = function () {
    //find the statistical center of all the ships

    var i, p;
    var centroid = { x: 0, y: 0 };
    var shipsAlive = 0;

    for (i = 0; i < numShips; i++) {
      if (!ships[i].alive) continue;
      centroid.x += ships[i].x;
      centroid.y += ships[i].y;
      shipsAlive++;
    }

    centroid.x /= shipsAlive;
    centroid.y /= shipsAlive;

    //give some tendency to center, so they bunch in the middle
    centroid.x = centroid.x * 0.8 + (battleWIDTH / 2) * 0.2;
    centroid.y = centroid.y * 0.8 + (battleHEIGHT / 2) * 0.2;
    return centroid;
  };

  var MoveSingleShip = function (p, centroid) {
    //accelerate to group centroid
    p.vx += (centroid.x - p.x) * 0.001;
    p.vy += (centroid.y - p.y) * 0.001;

    //accelerate to enemy ships in adjacent grid cells
    var row, col, i;
    var othership;
    var teammatesConsidered = 0;
    for (
      row = Math.max(p.gy - 1, 0);
      row < Math.min(p.gy + 2, battleGRID_HEIGHT);
      row++
    ) {
      for (
        col = Math.max(p.gx - 1, 0);
        col < Math.min(p.gx + 2, battleGRID_WIDTH);
        col++
      ) {
        if (grid[row][col].ships.length < 2) continue;
        for (i = 0; i < grid[row][col].ships.length; i++) {
          othership = grid[row][col].ships[i];
          if (!othership.alive) continue; //ignore dead ships
          if (othership.team == p.team) {
            teammatesConsidered++;

            if (teammatesConsidered > 3) continue; //don't fixate on teammates

            //mild acceleration to match teammates
            p.vx += othership.vx * 0.01;
            p.vy += othership.vy * 0.01;

            //mild acceleration to get space from teammates
            p.vx -= (othership.x - p.x) * 0.1;
            p.vy -= (othership.y - p.y) * 0.1;
          } else {
            p.vx += othership.vx * 0.2;
            p.vy += othership.vy * 0.2;
            p.vx += (othership.x - p.x) * 0.2; // acceleration toward enemies
            p.vy += (othership.y - p.y) * 0.2;
          }
        }
      }
    }

    //limit speed to max
    if (Math.abs(p.vx) > battleMAXSPEED)
      p.vx = p.vx < 0 ? -battleMAXSPEED : battleMAXSPEED;
    if (Math.abs(p.vy) > battleMAXSPEED)
      p.vy = p.vy < 0 ? -battleMAXSPEED : battleMAXSPEED;

    //move the ship
    /*p.vx += Math.random() * .1;
    p.vx += Math.random() * .1;
    p.vx -= Math.random() * .1;
    p.vx -= Math.random() * .1;*/

    p.x += p.vx;
    p.y += p.vy;

    //bounce off edges
    if (p.x > battleWIDTH) {
      p.x = battleWIDTH;
      p.vx = -battleMAXSPEED;
    } else if (p.x < 0) {
      p.x = 0;
      p.vx = battleMAXSPEED;
    }
    if (p.y > battleHEIGHT) {
      p.y = battleHEIGHT;
      p.vy = -battleMAXSPEED;
    } else if (p.y < 0) {
      p.y = 0;
      p.vy = battleMAXSPEED;
    }
  };

  //Clear the screen,
  //	var MouseDown = function(e) {
  //		e.preventDefault();
  //		battleRestart();
  //	}

  var ClearFrame = function () {
    canvas.width = canvas.width;

    //        var ctx = canvas.getContext("2d");
    //        ctx.font = "16px Times";
    //        ctx.fillStyle="white";
    //        ctx.fillText("Combat",10,20);
  };
}

// -----------------------------------------------------------------------------
// DATA STRUCTURES
// -----------------------------------------------------------------------------

// Grid Cell: spatial partition bucket. Each cell tracks which ships are in it.
function Cell() {
  this.ships = new Array();
  this.numShips = 0;
  this.add = function (ship) {
    this.ships[this.numShips++] = ship;
  };
}

// Ship: a single combat unit on the canvas.
// Team 0 (player/probes): spawn left 20%, move right, white
// Team 1 (drifters): spawn right 20%, move left, black
function Ship(team) {
  this.alive = true;
  this.color;
  this.team = team;
  this.framesDead = 0;
  //grid cell coord - we'll set this later
  this.gx = 0;
  this.gy = 0;

  switch (team) {
    case 0:
      this.x = Math.random() * 0.2 * battleWIDTH;
      this.y = Math.random() * battleHEIGHT;
      this.vx = Math.random() * battleMAXSPEED;
      this.vy = Math.random() - 0.5;
      this.color = battleLEFTCOLOR;
      break;
    case 1:
      this.x = (Math.random() * 0.2 + 0.8) * battleWIDTH;
      this.y = Math.random() * battleHEIGHT;
      this.vx = -1 * Math.random() * battleMAXSPEED;
      this.vy = Math.random() - 0.5;
      this.color = battleRIGHTCOLOR;
      break;
  }
}

// -----------------------------------------------------------------------------
// BATTLE CREATION
// Called when checkForBattles() succeeds. Determines how many real probes/drifters
// are committed, scales them to canvas dots (max 200 per side), names the battle,
// and triggers the Battle() animation.
// -----------------------------------------------------------------------------
function createBattle() {
  unitSize = 0;

  if (drifterCount >= probeCount) {
    unitSize = probeCount / 100;
  } else {
    unitSize = drifterCount / 100;
  }

  if (unitSize < 1) {
    unitSize = 1;
  }
  document.getElementById("battleScale").innerHTML = numberCruncher(
    unitSize,
    0,
  );

  var rr = Math.random() * drifterCount;
  if (rr < 1) {
    rr = 1;
  }
  var ss = Math.random() * probeCount;
  if (ss < 1) {
    ss = 1;
  }
  var tt = Math.random() * availableMatter;

  battleID++;

  var newBattle = {
    id: battleID,
    clipProbes: ss,
    drifterProbes: rr,
    victory: false,
    loss: false,
    whiteFlag: 0,
    territory: tt,
    reportCount: 0,
    garbageFlag: 0,
  };

  battleLEFTSHIPS = Math.ceil(ss / 1000000);
  if (battleLEFTSHIPS > 200) {
    battleLEFTSHIPS = 200;
  }
  if (battleLEFTSHIPS == 200) {
    var hinder = Math.random();
    if (hinder < 0.5) {
      battleLEFTSHIPS = Math.ceil(Math.random() * 175);
    }
  }

  battleRIGHTSHIPS = Math.ceil(rr / 1000000);
  if (battleRIGHTSHIPS > 200) {
    battleRIGHTSHIPS = 200;
  }

  Battle();

  battleName = "Drifter Attack " + newBattle.id;

  if (battleNameFlag == 1) {
    battleName = generateBattleName();
  }

  document.getElementById("battleName").innerHTML = battleName;

  battles.push(newBattle);

  //  battleWrite(newBattle);
}

// -----------------------------------------------------------------------------
// INITIALIZATION
// Create and start the canvas battle renderer immediately on script load.
// The animation runs continuously; actual game battles are triggered by
// createBattle() which resets ship counts and pushes to the battles array.
// -----------------------------------------------------------------------------
var app = new Battle();
app.initialize();
