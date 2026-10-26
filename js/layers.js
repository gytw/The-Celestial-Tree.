addLayer("p", {
  name: "Star",
  symbol: "S",
  position: 0,
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      buyables: {
        11: new Decimal(0), // ⭐️ 記得把 11 也補回 startData 裡！
        12: new Decimal(0),
      },
    };
  },
  color: "#e2ff08",
  requires: new Decimal(10),
  resource: "Star",
  baseResource: "points",
  baseAmount() {
    return player.points;
  },
  type: "normal",
  exponent: 0.5,

  // ⭐️ 修正後的 gainMult：統一用 mult 變數累積所有 Star 的加成
  gainMult() {
    let mult = new Decimal(1);

    // Upgrade 加成
    if (hasUpgrade("p", "13")) mult = mult.times(upgradeEffect("p", "13"));
    if (hasUpgrade("p", "14")) mult = mult.times(1.5);
    if (hasUpgrade("p", "16")) mult = mult.times(upgradeEffect("p", "16"));

    // Buyable 12 的 Star 加成
    if (player.p && player.p.buyables && player.p.buyables[12]) {
      let eff = buyableEffect("p", 12);
      if (eff) {
        let effVal = eff.first !== undefined ? eff.first : eff;
        mult = mult.times(effVal);
      }
    }

    return mult;
  },

  // ⭐️ gainExp 必須獨立出來，不能塞在 gainMult 裡面！
  gainExp() {
    let exp = new Decimal(1);

    // ⭐️ 如果買了 31 號升級，Star 獲取量開 0.97 次方
    if (hasUpgrade("p", "31")) {
      exp = exp.times(0.97);
    }

    if (hasUpgrade("p", "32")) {
      exp = exp.times(0.95);
    }

    if (hasUpgrade("p", "33")) {
      exp = exp.times(1.005);
    }

    if (hasUpgrade("p", "23")) {
      exp = exp.times(0.94);
    }

    if (hasUpgrade("p", "34")) {
      exp = exp.times(0.99);
    }

    if (hasUpgrade("p", "24")) {
      exp = exp.times(0.88);
    }

    if (hasUpgrade("p", "25")) {
      exp = exp.times(1.06);
    }

    if (hasUpgrade("p", "41")) {
      exp = exp.times(1.25);
    }

    return exp;
  },

  passiveGeneration() {
    if (hasMilestone("planet", 0)) return 0.1; // 擁有 Planet 第一個里程碑時，每秒獲得 10% 重置產量
    return 0;
  },

  row: 0,
  hotkeys: [
    {
      key: "p",
      description: "P: Reset for prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },

  tabFormat: {
    Main: {
      content: [
        "main-display",
        "prestige-button",
        "blank",
        // ⭐️ 關鍵：把單純的 "upgrades" 改成陣列，限制主畫面只顯示第 1 和第 2 行
        ["upgrades", [1, 2, 4]],
      ],
    },
    Buyables: {
      content: ["main-display", "prestige-button", "blank", "buyables"],
    },
    "Point Upgrades": {
      unlocked() {
        return hasUpgrade("p", "22");
      },
      content: [
        "blank",
        // 這裡維持只顯示第 3 行（31 號升級）
        ["upgrades", [3]],
      ],
    },
  },

  upgrades: {
    11: {
      title: "Start the game",
      description: "Points gain Based on Star",
      cost: new Decimal(1),
      effect() {
        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);
        return Star.add(1).log(2).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    12: {
      title: "Lets Start!",
      description: "Points gain Based on Star again!",
      cost: new Decimal(50),
      effect() {
        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);
        return Star.add(1).log(7.5).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("p", "11");
      },
    },
    13: {
      title: "Faster!",
      description: "Star gain Based on Star",
      cost: new Decimal(100),
      effect() {
        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);

        // 1. 先計算基礎效果並存進 eff 變數（注意這裡不能先 return！）
        let eff = Star.add(1).log(3).plus(1).max(1);

        // 2. 檢查是否有買升級 18，有買就進行乘算
        if (hasUpgrade("p", "22")) {
          let rawBoost =
            tmp.p && tmp.p.upgrades && tmp.p.upgrades[22]
              ? tmp.p.upgrades[22].effect
              : upgradeEffect("p", "22");
          let boost = new Decimal(rawBoost || 1);

          eff = eff.times(boost);
        }

        // 3. 算完加成後，最後才 return eff！
        return eff;
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("p", "12");
      },
    },
    14: {
      title: "Enjoy!",
      description: "Mult Star gain by 1.5 and point gain by 3.",
      cost: new Decimal(500),
      unlocked() {
        return hasUpgrade("p", "13");
      },
    },
    15: {
      title: "Mult Star Now!",
      description: "Unlock second buyable",
      cost: new Decimal(1e4),
      unlocked() {
        return hasUpgrade("p", "14");
      },
    },
    16: {
      title: "More love, more luck",
      description: "Mult Star gain based on points",
      cost: new Decimal(1e6),
      effect() {
        let points = player.points ? player.points : new Decimal(0);
        if (points.lt(1e7)) return new Decimal(1);
        let excess = points.sub(1e7);
        return excess.div(1e6).add(1).log(2).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("p", "15");
      },
    },
    21: {
      title: "More luck, more love",
      description: "Mult points gain based on points",
      cost: new Decimal(2e8),
      effect() {
        let points = player.points ? player.points : new Decimal(0);
        if (points.lt(1e8)) return new Decimal(1);
        let excess = points.sub(8);
        return excess.div(1e7).add(1).log(5).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("p", "16");
      },
    },
    22: {
      title: "MORE CELESTIAL WHEN",
      description: " 'Faster!' effect mult based on Star",
      cost: new Decimal(1e10),
      effect() {
        // ⭐️ 如果還沒買升級 18，強制回傳 1 倍（不影響原本效果）
        if (!hasUpgrade("p", 22)) return new Decimal(1);

        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);

        // ⭐️ 加上 .max(1)，確保計算結果絕對不會小於 1 倍
        return Star.add(1).log10().plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("p", "21");
      },
    },
    31: {
      title: "A booster",
      description: "Mult point gain by 380 but Star^0.97",
      cost: new Decimal(1e14),
      unlocked() {
        return hasUpgrade("p", "22");
      },
      currencyDisplayName: "Points",
      // ⭐️ 檢查玩家的 Points 是否大於或等於成本
      canAfford() {
        return player.points.gte(this.cost);
      },
      // ⭐️ 點擊購買時，直接從 player.points 扣除成本
      pay() {
        player.points = player.points.sub(this.cost);
      },
      // ⭐️ （選填）讓按鈕上顯示的文字清楚告訴玩家這需要花費 Points
      costDisplay() {
        return format(this.cost) + " Points";
      },
    },
    32: {
      title: "The booster V2",
      description: "Mult point gain by 1e6 but Star^0.95",
      cost: new Decimal(3e22),
      unlocked() {
        return hasUpgrade("p", "31");
      },
      currencyDisplayName: "Points",
      // ⭐️ 檢查玩家的 Points 是否大於或等於成本
      canAfford() {
        return player.points.gte(this.cost);
      },
      // ⭐️ 點擊購買時，直接從 player.points 扣除成本
      pay() {
        player.points = player.points.sub(this.cost);
      },
      // ⭐️ （選填）讓按鈕上顯示的文字清楚告訴玩家這需要花費 Points
      costDisplay() {
        return format(this.cost) + " Points";
      },
    },
    33: {
      title: "The booster V3",
      description: "Mult point gain by 1e9 but Star^1.005",
      cost: new Decimal(2e26),
      unlocked() {
        return hasUpgrade("p", "32");
      },
      currencyDisplayName: "Points",
      // ⭐️ 檢查玩家的 Points 是否大於或等於成本
      canAfford() {
        return player.points.gte(this.cost);
      },
      // ⭐️ 點擊購買時，直接從 player.points 扣除成本
      pay() {
        player.points = player.points.sub(this.cost);
      },
      // ⭐️ （選填）讓按鈕上顯示的文字清楚告訴玩家這需要花費 Points
      costDisplay() {
        return format(this.cost) + " Points";
      },
    },
    34: {
      title: "The booster V4",
      description:
        "Mult point gain by 1e4 but Star^0.99 and Unlock new Star Upgrades",
      cost: new Decimal(7e36),
      unlocked() {
        return hasUpgrade("p", "33");
      },
      currencyDisplayName: "Points",
      // ⭐️ 檢查玩家的 Points 是否大於或等於成本
      canAfford() {
        return player.points.gte(this.cost);
      },
      // ⭐️ 點擊購買時，直接從 player.points 扣除成本
      pay() {
        player.points = player.points.sub(this.cost);
      },
      // ⭐️ （選填）讓按鈕上顯示的文字清楚告訴玩家這需要花費 Points
      costDisplay() {
        return format(this.cost) + " Points";
      },
    },

    23: {
      title: "New layer when",
      description: "Points gain based on Star again and Star gain^0.94",
      cost: new Decimal(6e32),
      unlocked() {
        return hasUpgrade("p", "34");
      },
      effect() {
        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e27)) return new Decimal(1);
        let excess = Star.sub(1e27);
        return excess.div(1e26).add(1).log(5).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    24: {
      title: "Pls give me a new layer",
      description: "Points gain based on Star again and Star gain^0.88",
      cost: new Decimal(1.4e33),
      unlocked() {
        return hasUpgrade("p", "23");
      },
      effect() {
        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e27)) return new Decimal(1);
        let excess = Star.sub(1e24);
        return excess.div(1e23).add(1).log(1.3).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    25: {
      title: "New layer?",
      description: "Points gain based on Star again and Star gain^1.06",
      cost: new Decimal(1e30),
      unlocked() {
        return hasUpgrade("p", "24");
      },
      effect() {
        let Star =
          player.p && player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e7)) return new Decimal(1);
        let excess = Star.sub(1e7);
        return excess.div(1e6).add(1).log(1.2).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
    41: {
      title: "New Layer!",
      description: "Unlock planet and Star^1.25",
      cost: new Decimal(1e33),
      unlocked() {
        return hasUpgrade("p", "25");
      },
    },
  },

  buyables: {
    11: {
      title: "Points Booster",
      cost(x = player[this.layer].buyables[this.id]) {
        let cost = Decimal.pow(1.75, x.pow(1.55)).mul(10);
        return cost.floor();
      },
      effect(x = player[this.layer].buyables[this.id]) {
        let eff = {};

        // ⭐️ 情況 A：購買次數小於等於 20 次
        if (x.lte(25)) {
          eff.first = Decimal.pow(3, x);
        }
        // ⭐️ 情況 B：購買次數超過 20 次（啟用收益遞減/Softcap）
        else {
          let baseEff = Decimal.pow(3, 25); // 前 20 次累積的 2^20 倍
          let extraAmount = x.sub(25); // 超過 20 次的數量
          let extraEff = Decimal.pow(1.4, extraAmount); // 超過的部分每次只乘 1.5

          eff.first = baseEff.times(extraEff);
        }

        return eff;
      },
      display() {
        let data = tmp[this.layer].buyables[this.id];
        let amount = player[this.layer].buyables[this.id];
        let softcapText = amount.gt(25) ? "\n(Softcapped: 3x -> 1.4x)" : "";
        return (
          "Cost: " +
          formatWhole(data.cost) +
          " Stars\n" +
          "Amount: " +
          formatWhole(player[this.layer].buyables[this.id]) +
          "\n" +
          "Boosts point gain by " +
          format(data.effect.first) +
          "x" +
          softcapText
        );
      },
      unlocked() {
        return true;
      },
      canAfford() {
        return player.p.points.gte(tmp[this.layer].buyables[this.id].cost);
      },
      canBuy() {
        return this.canAfford();
      },
      buy() {
        let cost = tmp[this.layer].buyables[this.id].cost;
        player.p.points = player.p.points.sub(cost);
        player[this.layer].buyables[this.id] =
          player[this.layer].buyables[this.id].add(1);
      },
      style: { height: "150px", width: "200px" },
    },
    12: {
      title: "Star Booster",
      cost(x = player[this.layer].buyables[this.id]) {
        let cost = Decimal.pow(3, x.pow(1.05)).mul(1000);
        return cost.floor();
      },
      effect(x = player[this.layer].buyables[this.id]) {
        let eff = {};

        // ⭐️ 情況 A：購買次數小於等於 20 次
        if (x.lte(20)) {
          eff.first = Decimal.pow(2, x);
        }
        // ⭐️ 情況 B：購買次數超過 20 次（啟用收益遞減/Softcap）
        else {
          let baseEff = Decimal.pow(2, 20); // 前 20 次累積的 2^20 倍
          let extraAmount = x.sub(20); // 超過 20 次的數量
          let extraEff = Decimal.pow(1.5, extraAmount); // 超過的部分每次只乘 1.5

          eff.first = baseEff.times(extraEff);
        }

        return eff;
      },
      display() {
        let data = tmp[this.layer].buyables[this.id];
        let amount = player[this.layer].buyables[this.id];

        // 額外加上 Softcap 提醒標示（超過 20 次時提示玩家）
        let softcapText = amount.gt(20) ? "\n(Softcapped: 2x -> 1.5x)" : "";

        return (
          "Cost: " +
          formatWhole(data.cost) +
          " Stars\n" +
          "Amount: " +
          formatWhole(amount) +
          "\n" +
          "Boosts Star gain by " +
          format(data.effect.first) +
          "x" +
          softcapText
        );
      },
      unlocked() {
        return hasUpgrade("p", "15");
      },
      canAfford() {
        return player.p.points.gte(tmp[this.layer].buyables[this.id].cost);
      },
      canBuy() {
        return this.canAfford();
      },
      buy() {
        let cost = tmp[this.layer].buyables[this.id].cost;
        player.p.points = player.p.points.sub(cost);
        player[this.layer].buyables[this.id] =
          player[this.layer].buyables[this.id].add(1);
      },
      style: { height: "150px", width: "200px" },
    },
  },
});
addLayer("planet", {
  name: "Planet", // 層級顯示名稱
  symbol: "P", // 圖示符號
  position: 0, // 在第二行（row 1）的位置
  branches: ["p"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "#1e9ae8", // 綠色行星代表色
  requires: new Decimal(4e46), // 需要 2e47 Star 才能解鎖重置
  resource: "Planets", // 產出的資源名稱
  baseResource: "Stars", // 消耗的基礎資源名稱（來自 Star 層級 'p'）
  baseAmount() {
    return player.p.points;
  }, // 抓取 Star 層級的點數
  type: "normal", // 標準重置類型
  exponent: 0.5, // 獲取 Planet 的指數公式
  gainMult() {
    let mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    return new Decimal(1);
  },
  row: 1, // 出現在第二行
  hotkeys: [
    {
      key: "p",
      description: "P: 重置並獲得 Planet",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],

  // 顯示條件：必須購買了 Star 層級（id 為 'p'）的 Upgrade 41
  layerShown() {
    return hasUpgrade("p", 41) || player[this.layer].unlocked;
  },

  // 真正能重置的條件：必須達到 2e47 Star 且買了 41 號升級
  canReset() {
    return player.p.points.gte(this.requires) && hasUpgrade("p", 41);
  },

  // 重置邏輯：Planet 重置會同時重置 Star 層級的所有 upgrades、buyables 與 points
  doReset(resettingLayer) {
    if (resettingLayer == this.layer) {
      // 清空 Star 層級 (id: "p") 的所有數據
      if (player.p) {
        player.p.points = new Decimal(0);
        player.p.upgrades = [];
        player.p.buyables = {}; // 直接清空所有 buyables
      }
    }
  },
  milestones: {
    0: {
      requirementDescription: "1 Planet",
      effectDescription: "Gain 10% of Star reset gain per second.",
      done() {
        return player.planet.points.gte(1);
      },
      effect() {
        // 用 Decimal 包起來，或者直接用數學乘法
        let gain = new Decimal(tmp.planet.resetGain);
        return gain.times(0.1);
      },
      effectDisplay() {
        return format(this.effect()) + " Stars/sec";
      },
    },
  },
});
