addLayer("p", {
    name: "Star", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#e2ff08",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Star", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade('p', '13')) mult = mult.times(upgradeEffect('p', '13'))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    upgrades: {
        '11':{
            title: "Start the game",
            description: "Points gain Based on Star",
            cost: new Decimal(1),
            effect() {
            let Star = (player.p && player.p.points) ? player.p.points : new Decimal(0)
            return Star.add(1).log(3).plus(1).max(1)
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
        },
        '12':{
            title: "Lets Start!",
        description: "Points gain Based on Star again!",
        cost: new Decimal(50),
        effect(){
            let Star = (player.p && player.p.points) ? player.p.points : new Decimal(0)
            return Star.add(1).log(7.5).plus(1).max(1)
        },
        effectDisplay() {
            return "x" + format(upgradeEffect(this.layer, this.id))
        },
        },
        '13':{
            title: "Faster!",
            description: "Star gain Based on Star",
            cost: new Decimal(100),
            effect(){
            let Star =(player.p && player.p.points) ? player.p.points : new Decimal(0)
            return Star.add(1).log(3).plus(1).max(1)
            },
            effectDisplay(){
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
        },
    }
})
