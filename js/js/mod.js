let modInfo = {
  name: "The Celestial Tree",
  author: "gytw",
  pointsName: "points",
  modFiles: ["layers.js", "tree.js", "planet.js", "atom.js", "galaxy.js"],

  discordName: "",
  discordLink: "",
  initialStartPoints: new Decimal(10), // Used for hard resets and new players
  offlineLimit: 1, // In hours
};

// Set your version in num and name
let VERSION = {
  num: "1.14.3",
  name: "Upgrades Balance.",
};

let changelog = `<h1>Changelog:</h1><br>
<h3>v1.14.3 Upgrades Balance.</h3><br>
	  - Improved 'Atoms boost star' and 'Atoms boost star again?' upgrades formula.<br>
    - Reduced 'Atom free?' upgrade cost.<br>
<h3>v1.14.2 Planet is too small. New layer is coming.</h3><br>
	  - more upgrades and buyables.<br>
    - Added a new layer(Unfinished).<br>
<h3>v1.14.1 A big layer 'Planet' bug fix</h3><br>
	  - Fixed 'The booster V3' upgrade doesn't light up.<br>
    - Adjusted the requirements and effects for certain planet upgrades and milestones.<br>
    - Reduced the points required to unlock Atom.<br>
    - endgame - 1e13 planets.<br>

<h3>v1.14 A big layer 'Planet' Part 2</h3><br>
		- Added a new layer.(Unfinished).<br>
    - more upgrades.<br>

<h3>v1.1 A big layer 'Planet' Part 1</h3><br>
		- Added a new layer.<br>
    - more upgrades and buyables.<br>
    - Improved Star Upgrade"The booster V2" effect.<br>

	<h3>v1.05</h3><br>
		- more upgrades and buyables.<br>

    <h3>v0.87</h3><br>
		- added things.<br>
		- Added stuff.`;

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"];

function getStartPoints() {
  return new Decimal(modInfo.initialStartPoints);
}

// Determines if it should show points/sec
function canGenPoints() {
  return true;
}

// Calculate points/sec!
function getPointGen() {
  if (!canGenPoints()) return new Decimal(0);

  let gain = new Decimal(1);

  // Upgrade 加成
  if (hasUpgrade("p", "11")) gain = gain.times(upgradeEffect("p", "11"));
  if (hasUpgrade("p", "12")) gain = gain.times(upgradeEffect("p", "12"));
  if (hasUpgrade("p", "14")) gain = gain.times(3);
  if (hasUpgrade("p", "21")) gain = gain.times(upgradeEffect("p", "21"));
  if (hasUpgrade("p", "31")) gain = gain.times(1e7);
  if (hasUpgrade("p", "32")) gain = gain.times(1e4);
  if (hasUpgrade("p", "33")) gain = gain.times(1e9);
  if (hasUpgrade("p", "23")) gain = gain.times(upgradeEffect("p", "23"));
  if (hasUpgrade("p", "34")) gain = gain.times(1e4);
  if (hasUpgrade("p", "24")) gain = gain.times(upgradeEffect("p", "24"));
  if (hasUpgrade("p", "25")) gain = gain.times(upgradeEffect("p", "25"));
  if (hasUpgrade("planet", "11")) gain = gain.pow(1.06);
  if (hasMilestone("planet", "5")) gain = gain.pow(1.025);
  if (hasUpgrade("planet", "13"))
    gain = gain.times(upgradeEffect("planet", "13"));
  if (hasUpgrade("p", "44")) gain = gain.pow(1.05);
  if (hasUpgrade("planet", "14"))
    gain = gain.times(upgradeEffect("planet", "14"));
  if (hasUpgrade("p", "51")) gain = gain.times(2);
  if (hasUpgrade("p", "52")) gain = gain.times(8);
  if (hasMilestone("planet", "7")) gain = gain.times(1e6);
  if (hasMilestone("planet", "8")) gain = gain.pow(0.98);
  if (hasUpgrade("p", "53")) gain = gain.times(75);
  if (hasUpgrade("p", "54")) gain = gain.times(100);
  if (hasUpgrade("planet", "21"))
    gain = gain.times(upgradeEffect("planet", "21"));
  if (hasUpgrade("p", "55")) gain = gain.times(400);
  if (hasUpgrade("p", "72")) gain = gain.pow(1.005);
  if (hasUpgrade("p", "73")) gain = gain.pow(1.001);
  if (hasUpgrade("planet", "22"))
    gain = gain.times(upgradeEffect("planet", "22"));
  if (hasUpgrade("atom", "21")) gain = gain.times(upgradeEffect("atom", "21"));
  if (hasUpgrade("atom", "32")) gain = gain.times(1e4);
  if (hasUpgrade("atom", "35")) gain = gain.times(1e7);
  if (hasUpgrade("galaxy", "11")) gain = gain.times(2.5);
  if (player.atom && player.atom.buyables && player.atom.buyables[11]) {
    let eff = buyableEffect("atom", 11);
    if (eff) {
      // 判斷 eff 是不是物件，如果是物件就拿 .first，否則直接用 eff
      let mult = eff.first !== undefined ? eff.first : eff;
      gain = gain.times(mult);
    }
  }

  // Buyable 加成（改用 buyableEffect('p', 11).first 來正確提取數值）
  if (player.p && player.p.buyables && player.p.buyables[11]) {
    let eff = buyableEffect("p", 11);
    if (eff) {
      // 判斷 eff 是不是物件，如果是物件就拿 .first，否則直接用 eff
      let mult = eff.first !== undefined ? eff.first : eff;
      gain = gain.times(mult);
    }
  }

  if (player.p && player.p.buyables && player.p.buyables[14]) {
    let eff = buyableEffect("p", 14);
    if (eff) {
      // 判斷 eff 是不是物件，如果是物件就拿 .first，否則直接用 eff
      let mult = eff.first !== undefined ? eff.first : eff;
      gain = gain.times(mult);
    }
  }

  return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {};
}

// Display extra things at the top of the page
var displayThings = [];

// Determines when the game "ends"
function isEndgame() {
  return player.points.gte(new Decimal("e280000000"));
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {};

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
  return 3600; // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {}
