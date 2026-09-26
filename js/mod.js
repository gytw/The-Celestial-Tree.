let modInfo = {
	name: "The Celestial Tree",
	author: "nobody",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "V1.05",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.05</h3><br>
		- 更多升級與可購買.<br>

    <h3>v0.87</h3><br>
		- 做了一坨大便升級.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
    if (!canGenPoints())
        return new Decimal(0)

    let gain = new Decimal(1)

    // Upgrade 加成
    if (hasUpgrade('p', '11')) gain = gain.times(upgradeEffect('p', '11'))
    if (hasUpgrade('p', '12')) gain = gain.times(upgradeEffect('p', '12'))
    if (hasUpgrade('p', '14')) gain = gain.times(3)
    if (hasUpgrade('p', '17')) gain = gain.times(upgradeEffect('p', '17'))
    // Buyable 加成（改用 buyableEffect('p', 11).first 來正確提取數值）
    if (player.p && player.p.buyables && player.p.buyables[11]) {
        let eff = buyableEffect('p', 11)
        if (eff) {
            // 判斷 eff 是不是物件，如果是物件就拿 .first，否則直接用 eff
            let mult = eff.first !== undefined ? eff.first : eff
            gain = gain.times(mult)
        }
    }

    return gain
}


// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}