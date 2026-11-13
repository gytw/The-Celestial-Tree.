addLayer("atom", {
  name: "atoms", // 層級顯示名稱
  symbol: "AO", // 圖示符號
  position: 2, // 在第二行（row 1）的位置
  branches: ["p"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      buyables: {
        11: new Decimal(0), // ⭐️ 記得把 11 也補回 startData 裡！
      },
    };
  },
  color: "#51efba", // 綠色行星代表色
  requires: new Decimal(1e86), // 需要 2e47 Star 才能解鎖重置
  resource: "atoms", // 產出的資源名稱
  baseResource: "points", // 消耗的基礎資源名稱（來自 Star 層級 'p'）
  baseAmount() {
    return player.points;
  }, // 抓取 Star 層級的點數
  type: "normal", // 標準重置類型
  exponent: 0.03, // 獲取 Planet 的指數公式
  gainMult() {
    let mult = new Decimal(1);
    if (hasUpgrade("atom", "12")) mult = mult.times(3);
    if (hasUpgrade("planet", "25")) mult = mult.times(3);
    if (hasUpgrade("planet", "25")) {
      mult = mult.times(upgradeEffect("planet", "25"));
    }
    if (hasUpgrade("atom", "13")) mult = mult.div(1.25);
    if (hasUpgrade("atom", "14")) mult = mult.div(1.25);
    if (hasUpgrade("atom", "22")) mult = mult.times(1e4);
    if (hasUpgrade("atom", "23")) mult = mult.times(1e5);
    if (hasUpgrade("atom", "24")) mult = mult.times(1e10);
    if (hasUpgrade("atom", "43")) mult = mult.times(1e8);
    if (hasUpgrade("atom", "31")) {
      mult = mult.times(upgradeEffect("atom", "31"));
    }
    if (hasMilestone("galaxy", "0")) mult = mult.times(5);
    if (player.atom && player.atom.buyables && player.atom.buyables[11]) {
      let eff = buyableEffect("atom", 11);
      if (eff) {
        let effVal = eff.first !== undefined ? eff.first : eff;
        mult = mult.times(effVal);
      }
    }
    return mult;
  },
  gainExp() {
    return new Decimal(1);
  },
  row: 0, // 出現在第二行
  hotkeys: [
    {
      key: "ao",
      description: "",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],

  // 顯示條件：必須購買了 Star 層級（id 為 'p'）的 Upgrade 41
  layerShown() {
    return hasUpgrade("p", 63) || player[this.layer].unlocked;
  },

  // 真正能重置的條件：必須達到 2e47 Star 且買了 41 號升級
  canReset() {
    return player.points.gte(this.requires) && hasUpgrade("p", 63);
  },
  doReset(resettingLayer) {
    if (resettingLayer == this.layer) {
      if (player.p) {
        player.p.upgrades = []; // 直接清空所有 buyables
      }
    }
  },

  passiveGeneration() {
    if (hasUpgrade("atom", 15)) return 3;
    return 0;
  },

  tabFormat: {
    Upgrades: {
      content: [
        "main-display",
        "prestige-button",
        "blank",
        "upgrades",
        // ⭐️ 關鍵：把單純的 "upgrades" 改成陣列，限制主畫面只顯示第 1 和第 2 行
      ],
    },
    Buyables: {
      content: ["main-display", "prestige-button", "blank", "buyables"],
    },
  },

  // 重置邏輯：Planet 重置會同時重置 Star 層級的所有 upgrades、buyables 與 points
  upgrades: {
    11: {
      title: "Atoms are important",
      description: "Autobuy Star 1~7 rows Upgrades",
      cost: new Decimal(1),
    },
    12: {
      title: "Atoms are very important",
      description: "Mult atom gain by 3 and Star^1.03",
      cost: new Decimal(3),
      unlocked() {
        return hasUpgrade("atom", "11");
      },
    },
    13: {
      title: "Atoms boost star",
      description: "Mult star gain based on atom but atom /1.25",
      cost: new Decimal(1e3),
      unlocked() {
        return hasUpgrade("planet", "25");
      },
      effect() {
        let atom = player.atom.points ? player.atom.points : new Decimal(0);
        if (atom.lt(1)) return new Decimal(1);
        let excess = atom.sub(1);
        return excess.div(1000).add(1).pow(0.1).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    14: {
      title: "Atoms boost star again?",
      description: "Mult star gain based on atom but atom /1.25",
      cost: new Decimal(2e3),
      unlocked() {
        return hasUpgrade("atom", "13");
      },
      effect() {
        let atom = player.atom.points ? player.atom.points : new Decimal(0);
        if (atom.lt(1)) return new Decimal(1);
        let excess = atom.sub(1);
        return excess.div(250).add(1).pow(0.05).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    15: {
      title: "Not timewall, it's atom wall.",
      description: "Gain 300% of atom reset gain per second.",
      cost: new Decimal(2.25e3),
      unlocked() {
        return hasUpgrade("atom", "14");
      },
    },
    21: {
      title: "Points?",
      description: "Mult points gain based on atom.",
      cost: new Decimal(2e4),
      unlocked() {
        return hasUpgrade("atom", "15");
      },
      effect() {
        let atom = player.atom.points ? player.atom.points : new Decimal(0);
        if (atom.lt(1e4)) return new Decimal(1);
        let excess = atom.sub(4);
        return excess.div(1e4).add(1).pow(0.08).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    22: {
      title: "Atom energy",
      description: "Mult atom gain by 1e4",
      cost: new Decimal(1e5),
      unlocked() {
        return hasUpgrade("atom", "21");
      },
    },
    23: {
      title: "Atom energy^2?",
      description: "Mult atom gain by 1e5",
      cost: new Decimal(2e8),
      unlocked() {
        return hasUpgrade("atom", "22");
      },
    },
    24: {
      title: "Atom energy^10?",
      description: "Mult atom gain by 1e10",
      cost: new Decimal(1e13),
      unlocked() {
        return hasUpgrade("atom", "23");
      },
    },
    25: {
      title: "planet energy?",
      description: "Mult planet gain by 1e5",
      cost: new Decimal(2e23),
      unlocked() {
        return hasUpgrade("atom", "24");
      },
    },
    31: {
      title: "Where is planet boost atom??",
      description: "Mult atom gain based on planet.",
      cost: new Decimal(4e23),
      unlocked() {
        return hasUpgrade("atom", "25");
      },
      effect() {
        let planet = player.planet.points
          ? player.planet.points
          : new Decimal(0);
        if (planet.lt(1e18)) return new Decimal(1);
        let excess = planet.sub(18);
        return excess.div(1e18).add(1).pow(0.5).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    32: {
      title: "points energy",
      description: "Mult points gain by 1e4",
      cost: new Decimal(1.3e24),
      unlocked() {
        return hasUpgrade("atom", "31");
      },
    },
    33: {
      title: "star energy",
      description: "Mult star gain by 40",
      cost: new Decimal(7e24),
      unlocked() {
        return hasUpgrade("atom", "32");
      },
    },
    34: {
      title: "Buyable energy???",
      description: "Unlock a atom buyable",
      cost: new Decimal(3e25),
      unlocked() {
        return hasUpgrade("atom", "33");
      },
    },
    35: {
      title: "points energy again",
      description: "Mult points gain by 1e7",
      cost: new Decimal(3e29),
      unlocked() {
        return hasUpgrade("atom", "34");
      },
    },
    41: {
      title: "Auto max",
      description: "Auto buy max star buyables 1~4",
      cost: new Decimal(5e32),
      unlocked() {
        return hasUpgrade("atom", "35");
      },
    },
    42: {
      title: "galaxy?",
      description: "Mult planet gain by 1e11",
      cost: new Decimal(8e32),
      unlocked() {
        return hasUpgrade("atom", "41");
      },
    },
    43: {
      title: "New layer when",
      description: "Mult atom gain by 1e8",
      cost: new Decimal(2e47),
      unlocked() {
        return hasUpgrade("atom", "42");
      },
    },
    44: {
      title: "Reset again and again",
      description: "Unlock a new layer",
      cost: new Decimal(2e63),
      unlocked() {
        return hasUpgrade("atom", "43");
      },
    },
    45: {
      title: "Galaxy power",
      description: "Mult planet gain by 14",
      cost: new Decimal(5e64),
      unlocked() {
        hasUpgrade("atom", "44");
        return hasMilestone("galaxy", "0") && hasUpgrade("atom", "44");
      },
    },
  },
  buyables: {
    11: {
      title: "atom Booster",
      cost(x) {
        // 如果傳進來的 x 是 undefined 或空的，安全轉成 Decimal(0)
        let amount = new Decimal(x || 0);
        let cost = Decimal.pow(1.5, amount.pow(1.2)).mul(1e25);
        return cost.floor();
      },
      effect(x = player[this.layer].buyables[this.id]) {
        let eff = {};
        eff.first = Decimal.pow(1.5, x);
        return eff;
      },
      display() {
        let data = tmp[this.layer].buyables[this.id];
        let amount = player[this.layer].buyables[this.id];
        return (
          "Cost: " +
          formatWhole(data.cost) +
          " atom\n" +
          "Amount: " +
          formatWhole(player[this.layer].buyables[this.id]) +
          "\n" +
          "Boosts atom and points gain by " +
          format(data.effect.first) +
          "x"
        );
      },
      unlocked() {
        return hasUpgrade("atom", "34");
      },
      canAfford() {
        return player.atom.points.gte(tmp[this.layer].buyables[this.id].cost);
      },
      canBuy() {
        return this.canAfford();
      },
      buy() {
        let cost = tmp[this.layer].buyables[this.id].cost;
        if (player.atom.points.gte(cost))
          player.atom.points = player.atom.points.sub(cost);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: { height: "150px", width: "200px" },
    },
  },
});
