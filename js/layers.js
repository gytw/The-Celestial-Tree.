addLayer("p", {
    name: "Star", 
    symbol: "S", 
    position: 0, 
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        buyables: {
            11: new Decimal(0), // ⭐️ 記得把 11 也補回 startData 裡！
            12: new Decimal(0),
        },
    }},
    color: "#e2ff08",
    requires: new Decimal(10), 
    resource: "Star", 
    baseResource: "points", 
    baseAmount() { return player.points }, 
    type: "normal", 
    exponent: 0.5, 

    // ⭐️ 修正後的 gainMult：統一用 mult 變數累積所有 Star 的加成
    gainMult() { 
        let mult = new Decimal(1)

        // Upgrade 加成
        if (hasUpgrade('p', '13')) mult = mult.times(upgradeEffect('p', '13'))
        if (hasUpgrade('p', '14')) mult = mult.times(1.5)
        if (hasUpgrade('p', '16')) mult = mult.times(upgradeEffect('p', '16'))


        // Buyable 12 的 Star 加成
        if (player.p && player.p.buyables && player.p.buyables[12]) {
            let eff = buyableEffect('p', 12)
            if (eff) {
                let effVal = eff.first !== undefined ? eff.first : eff
                mult = mult.times(effVal)
            }
        }

        return mult
    },

    // ⭐️ gainExp 必須獨立出來，不能塞在 gainMult 裡面！
    gainExp() {
        return new Decimal(1)
    },

    row: 0, 
    hotkeys: [
        { key: "p", description: "P: Reset for prestige points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return true },

    tabFormat: {
        "upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "upgrades",
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "buyables",
            ],
        },
    },

    upgrades: {
        '11': {
            title: "Start the game",
            description: "Points gain Based on Star",
            cost: new Decimal(1),
            effect() {
                let Star = (player.p && player.p.points) ? player.p.points : new Decimal(0)
                return Star.add(1).log(2).plus(1).max(1)
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
        },
        '12': {
            title: "Lets Start!",
            description: "Points gain Based on Star again!",
            cost: new Decimal(50),
            effect() {
                let Star = (player.p && player.p.points) ? player.p.points : new Decimal(0)
                return Star.add(1).log(7.5).plus(1).max(1)
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
           unlocked() {
    return hasUpgrade('p', '15')
      },
        },
        '13': {
    title: "Faster!",
    description: "Star gain Based on Star",
    cost: new Decimal(100),
    effect() {
        let Star = (player.p && player.p.points) ? player.p.points : new Decimal(0)
        
        // 1. 先計算基礎效果並存進 eff 變數（注意這裡不能先 return！）
        let eff = Star.add(1).log(3).plus(1).max(1)

        // 2. 檢查是否有買升級 18，有買就進行乘算
        if (hasUpgrade('p', '18')) {
            let rawBoost = tmp.p && tmp.p.upgrades && tmp.p.upgrades[18] ? tmp.p.upgrades[18].effect : upgradeEffect('p', '18')
            let boost = new Decimal(rawBoost || 1)
            
            eff = eff.times(boost)
        }

        // 3. 算完加成後，最後才 return eff！
        return eff
    },
    effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id))
    },
    unlocked() {
        return hasUpgrade('p', '12')
    },
},
        '14': {
            title: "Enjoy!",
            description: "Mult Star gain by 1.5 and point gain by 3.",
            cost: new Decimal(500),
            unlocked() {
             return hasUpgrade('p', '13')
            },
        },
        '15':{
            title: "Mult Star Now!",
            description: "Unlock second buyable",
            cost: new Decimal(1e4),
            unlocked(){
                return hasUpgrade('p', '14')
            },
        },
        '16':{
            title: "More love, more luck",
            description: "Mult Star gain based on points",
            cost: new Decimal(1e6),
            effect() {
    let points = player.points ? player.points : new Decimal(0)
    if (points.lt(1e7)) return new Decimal(1)
    let excess = points.sub(1e7)
    return excess.div(1e6).add(1).log(2).plus(1).max(1)
},
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked(){
                return hasUpgrade('p', '15')
        },
      },
      '17':{
        title: "More luck, more love",
        description: "Mult points gain based on points",
        cost: new Decimal(2e8),
        effect(){
        let points = player.points ? player.points : new Decimal(0)
    if (points.lt(1e8)) return new Decimal(1)
    let excess = points.sub(8)
    return excess.div(1e7).add(1).log(5).plus(1).max(1)
         },
         effectDisplay(){
            return "x" + format(upgradeEffect(this.layer, this.id))
         },
         unlocked(){
            return hasUpgrade('p', '16')
         },
        },
        '18': {
      title: "MORE CELESTIAL WHEN",
      description: " 'Faster!' effect mult based on Star",
      cost: new Decimal(1e10),
      effect() {
        // ⭐️ 如果還沒買升級 18，強制回傳 1 倍（不影響原本效果）
        if (!hasUpgrade('p', 18)) return new Decimal(1)

        let Star = (player.p && player.p.points) ? player.p.points : new Decimal(0)
        
        // ⭐️ 加上 .max(1)，確保計算結果絕對不會小於 1 倍
        return Star.add(1).log10().plus(1).max(1)
    },
      effectDisplay(){
            return "x" + format(upgradeEffect(this.layer, this.id))
      },
    unlocked() {
        return hasUpgrade('p', '17')
    },
    },
      },

    buyables: {
        11: {
            title: "Points Booster",
            cost(x = player[this.layer].buyables[this.id]) {
                let cost = Decimal.pow(1.75, x.pow(1.55)).mul(10)
                return cost.floor()
            },
            effect(x = player[this.layer].buyables[this.id]) {
                let eff = {}
                eff.first = Decimal.pow(3, x)
                return eff
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Stars\n" +
                       "Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "\n" +
                       "Boosts point gain by " + format(data.effect.first) + "x"
            },
            unlocked() { return true }, 
            canAfford() {
                return player.p.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            canBuy() {
                return this.canAfford()
            },
            buy() { 
                let cost = tmp[this.layer].buyables[this.id].cost
                player.p.points = player.p.points.sub(cost) 
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            style: { 'height': '150px', 'width': '200px' },
        },
        12: {
    title: "Star Booster",
    cost(x = player[this.layer].buyables[this.id]) {
        let cost = Decimal.pow(3, x.pow(1.05)).mul(1000)
        return cost.floor()
    },
    effect(x = player[this.layer].buyables[this.id]) {
        let eff = {}

        // ⭐️ 情況 A：購買次數小於等於 20 次
        if (x.lte(20)) {
            eff.first = Decimal.pow(2, x)
        } 
        // ⭐️ 情況 B：購買次數超過 20 次（啟用收益遞減/Softcap）
        else {
            let baseEff = Decimal.pow(2, 20)              // 前 20 次累積的 2^20 倍
            let extraAmount = x.sub(20)                  // 超過 20 次的數量
            let extraEff = Decimal.pow(1.5, extraAmount) // 超過的部分每次只乘 1.5
            
            eff.first = baseEff.times(extraEff)
        }

        return eff
    },
    display() {
        let data = tmp[this.layer].buyables[this.id]
        let amount = player[this.layer].buyables[this.id]
        
        // 額外加上 Softcap 提醒標示（超過 20 次時提示玩家）
        let softcapText = amount.gt(20) ? "\n(Softcapped: 2x -> 1.5x)" : ""

        return "Cost: " + formatWhole(data.cost) + " Stars\n" +
               "Amount: " + formatWhole(amount) + "\n" +
               "Boosts Star gain by " + format(data.effect.first) + "x" + softcapText
    },
    unlocked() { 
        return hasUpgrade('p', '15') 
    }, 
    canAfford() {
        return player.p.points.gte(tmp[this.layer].buyables[this.id].cost)
    },
    canBuy() {
        return this.canAfford()
    },
    buy() { 
        let cost = tmp[this.layer].buyables[this.id].cost
        player.p.points = player.p.points.sub(cost) 
        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
    },
    style: { 'height': '150px', 'width': '200px' },
        },
    },
})
    