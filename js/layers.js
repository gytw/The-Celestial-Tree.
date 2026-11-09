addLayer("p", {
  //:備用 player.points = player.points.add(1e25)
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
        13: new Decimal(0),
        14: new Decimal(0),
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
    if (hasUpgrade("planet", "11")) mult = mult.times(5);
    if (hasUpgrade("planet", "12")) {
      mult = mult.times(upgradeEffect("planet", "12"));
    }
    if (hasMilestone("planet", "6")) {
      mult = mult.times(5);
    }

    if (hasMilestone("planet", "7")) {
      mult = mult.times(3);
    }

    if (hasUpgrade("p", "72")) mult = mult.times(29);
    if (hasMilestone("planet", 9)) {
      // 必須用 tmp.P.milestones[3].effect 來抓取數值
      let milestoneEff = tmp.planet.milestones[9].effect;
      mult = mult.times(milestoneEff ? milestoneEff : 1);
    }

    // Buyable 12 的 Star 加成
    if (player.p && player.p.buyables && player.p.buyables[12]) {
      let eff = buyableEffect("p", 12);
      if (eff) {
        let effVal = eff.first !== undefined ? eff.first : eff;
        mult = mult.times(effVal);
      }
    }
    if (hasUpgrade("p", "73")) mult = mult.times(4);
    if (hasUpgrade("p", "62")) mult = mult.times(4);
    if (hasUpgrade("p", "64")) mult = mult.times(67);
    if (hasUpgrade("planet", "23")) {
      mult = mult.times(upgradeEffect("planet", "23"));
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

    if (hasMilestone("planet", "4")) {
      exp = exp.times(1.025);
    }

    if (hasUpgrade("p", "52")) {
      exp = exp.times(0.97);
    }

    if (hasMilestone("planet", "8")) {
      exp = exp.times(1.03);
    }

    if (hasUpgrade("p", "53")) {
      exp = exp.times(0.973);
    }

    if (hasUpgrade("p", "54")) {
      exp = exp.times(0.99);
    }

    if (hasUpgrade("p", "55")) {
      exp = exp.times(1.01);
    }

    if (hasUpgrade("atom", "12")) {
      exp = exp.times(1.05);
    }

    return exp;
  },

  passiveGeneration() {
    if (hasMilestone("planet", 1)) return 2;
    if (hasMilestone("planet", 0)) return 0.1;
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

  autoUpgradeTimer: 0,

  update(diff) {
    // 1️⃣ 如果擁有星星自己的 13 號升級，自動買星星層級的升級（第 1 到 7 行）
    if (hasUpgrade("atom", 11)) {
      for (let r = 1; r <= 7; r++) {
        for (let c = 1; c <= 7; c++) {
          let id = r * 10 + c;
          if (
            this.upgrades[id] !== undefined &&
            !hasUpgrade(this.layer, id) &&
            canAffordUpgrade(this.layer, id)
          ) {
            buyUpgrade(this.layer, id);
          }
        }
      }
    }

    // 2️⃣ 檢查 Planet 的里程碑 3，自動購買星星層級 ("S") 的 11、12 號 Buyables
    // （這裡的大小寫 "P" 請依你的 Planet 實際代碼為主，確保是大寫或小寫一致）
    if (hasMilestone("planet", 3)) {
      buyBuyable("p", 11);
      buyBuyable("p", 12);
    }

    // 3️⃣ 檢查 Planet 的里程碑 10，自動購買星星層級 ("S") 的 13、14 號 Buyables
    if (hasMilestone("planet", 10)) {
      buyBuyable("p", 13);
      buyBuyable("p", 14);
    }
  },

  tabFormat: {
    Main: {
      content: [
        "main-display",
        "prestige-button",
        "blank",
        // ⭐️ 關鍵：把單純的 "upgrades" 改成陣列，限制主畫面只顯示第 1 和第 2 行
        ["upgrades", [1, 2, 4, 6]],
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
        ["upgrades", [3, 5, 7]],
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
      description: "Mult point gain by 1e7 but Star^0.97",
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
      description: "Mult point gain by 1e4 but Star^0.95",
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
      // ⭐️ 告訴 TMT 這個升級要扣除的是全域的 points，而不是當前 layer 的資源
      currencyLocation() {
        return player;
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",

      // ⭐️ 讓 TMT 框架自動根據 cost 和 currencyInternalName 來判斷能不能買、要不要發光
      canAfford() {
        return player.points.gte(this.cost);
      },

      // ⭐️ 扣款邏輯
      pay() {
        player.points = player.points.sub(this.cost);
      },

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
      currencyInternalName: "points",
      currencyDisplayName: "Points",
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
    42: {
      title: "Planet energy",
      description: "Mult Planet gain by 1.5",
      cost: new Decimal(1e53),
      unlocked() {
        return hasMilestone("planet", "2");
      },
    },
    43: {
      title: "Sky",
      description: "Mult Planet gain by 2 and Unlock next Star Buyable",
      cost: new Decimal(1e55),
      unlocked() {
        return hasUpgrade("p", "42");
      },
    },
    44: {
      title: "Points Ahh energy",
      description: "points^1.05 and Unlock more points Upgrades",
      cost: new Decimal(1e58),
      unlocked() {
        return hasUpgrade("p", "43");
      },
    },
    45: {
      title: "Planet Ahh energy",
      description: "mult planet gain by 2 ",
      cost: new Decimal(1e72),
      unlocked() {
        return hasUpgrade("p", "44");
      },
    },
    51: {
      title: "The booster V5",
      description: "mult points gain by 2",
      cost: new Decimal(4e56),
      unlocked() {
        return hasUpgrade("p", "44");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    52: {
      title: "The booster V6",
      description: "mult points gain by 8 but Star gain^0.97",
      cost: new Decimal(1e64),
      unlocked() {
        return hasUpgrade("p", "51");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    53: {
      title: "The booster V7",
      description: "mult points gain by 75 but Star gain^0.973",
      cost: new Decimal(3e70),
      unlocked() {
        return hasUpgrade("p", "52");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    54: {
      title: "The booster V8",
      description: "mult points gain by 100 but Star gain^0.99",
      cost: new Decimal(1e73),
      unlocked() {
        return hasUpgrade("p", "53");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    55: {
      title: "The booster V9?????",
      description: "mult points gain by 400 but Star gain^1.01",
      cost: new Decimal(2e76),
      unlocked() {
        return hasUpgrade("p", "54");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    61: {
      title: "Celestial?",
      description: "mult planet gain by 3",
      cost: new Decimal(1e75),
      unlocked() {
        return hasUpgrade("p", "55");
      },
    },
    71: {
      title: "Celestial now?",
      description: "Unlock next buyable",
      cost: new Decimal(2e80),
      unlocked() {
        return hasUpgrade("p", "55");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    72: {
      title: "The booster?",
      description: "Mult Star gain by 29 and Points^1.005",
      cost: new Decimal(1e81),
      unlocked() {
        return hasUpgrade("p", "71");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    73: {
      title: "The Star booster!",
      description: "Mult Star gain by 4 and Points^1.001",
      cost: new Decimal(1e82),
      unlocked() {
        return hasUpgrade("p", "72");
      },
      currencyInternalName: "points",
      currencyDisplayName: "Points",
    },
    62: {
      title: "Planet Planet",
      description: "Mult Star gain by 4 and mult planet gain by 2.5 ",
      cost: new Decimal(7e78),
      unlocked() {
        return hasUpgrade("p", "61");
      },
    },
    63: {
      title: "atom are points",
      description: "Unlock a new layer ",
      cost: new Decimal(1e81),
      unlocked() {
        return hasUpgrade("p", "62");
      },
    },
    64: {
      title: "Star come first? ",
      description: "points gain based on atoms and mult Star gain by 67  ",
      cost: new Decimal(5e84),
      unlocked() {
        return hasUpgrade("p", "63");
      },
      effect() {
        let atom =
          player.atom && player.atom.points
            ? player.atom.points
            : new Decimal(0);
        if (atom.lt(2)) return new Decimal(1);
        let excess = atom.sub(1);
        return excess.div(1).add(1).log(1.5).plus(1).max(1);
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
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

        if (hasUpgrade("planet", 24)) {
          // 如果有免費效果：直接加等級，完全不扣點數！
          setBuyableAmount(
            this.layer,
            this.id,
            getBuyableAmount(this.layer, this.id).add(1),
          );
        } else {
          // 正常情況：檢查點數並扣款
          if (player.p.points.gte(cost)) {
            player.p.points = player.p.points.sub(cost);
            setBuyableAmount(
              this.layer,
              this.id,
              getBuyableAmount(this.layer, this.id).add(1),
            );
          }
        }
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

        if (hasUpgrade("planet", 24)) {
          // 如果有免費效果：直接加等級，完全不扣點數！
          setBuyableAmount(
            this.layer,
            this.id,
            getBuyableAmount(this.layer, this.id).add(1),
          );
        } else {
          // 正常情況：檢查點數並扣款
          if (player.p.points.gte(cost)) {
            player.p.points = player.p.points.sub(cost);
            setBuyableAmount(
              this.layer,
              this.id,
              getBuyableAmount(this.layer, this.id).add(1),
            );
          }
        }
      },
      style: { height: "150px", width: "200px" },
    },
    13: {
      title: "planet Booster",
      cost(x = player[this.layer].buyables[this.id]) {
        let cost = Decimal.pow(2.3, x.pow(1.103034)).mul(1e53);
        return cost.floor();
      },
      effect(x = player[this.layer].buyables[this.id]) {
        let eff = {};

        // ⭐️ 情況 A：購買次數小於等於 20 次
        if (x.lte(35)) {
          eff.first = Decimal.pow(1.05, x);
        }
        // ⭐️ 情況 B：購買次數超過 20 次（啟用收益遞減/Softcap）
        else {
          let baseEff = Decimal.pow(1.05, 35); // 前 20 次累積的 2^20 倍
          let extraAmount = x.sub(35); // 超過 20 次的數量
          let extraEff = Decimal.pow(1.025, extraAmount); // 超過的部分每次只乘 1.5

          eff.first = baseEff.times(extraEff);
        }

        return eff;
      },
      display() {
        let data = tmp[this.layer].buyables[this.id];
        let amount = player[this.layer].buyables[this.id];

        // 額外加上 Softcap 提醒標示（超過 20 次時提示玩家）
        let softcapText = amount.gt(35)
          ? "\n(Softcapped: 1.05x -> 1.025x)"
          : "";

        return (
          "Cost: " +
          formatWhole(data.cost) +
          " Stars\n" +
          "Amount: " +
          formatWhole(amount) +
          "\n" +
          "Boosts planet gain by " +
          format(data.effect.first) +
          "x" +
          softcapText
        );
      },
      unlocked() {
        return hasUpgrade("p", "43");
      },
      canAfford() {
        return player.p.points.gte(tmp[this.layer].buyables[this.id].cost);
      },
      canBuy() {
        return this.canAfford();
      },
      buy() {
        let cost = tmp[this.layer].buyables[this.id].cost;

        if (hasUpgrade("planet", 24)) {
          // 如果有免費效果：直接加等級，完全不扣點數！
          setBuyableAmount(
            this.layer,
            this.id,
            getBuyableAmount(this.layer, this.id).add(1),
          );
        } else {
          // 正常情況：檢查點數並扣款
          if (player.p.points.gte(cost)) {
            player.p.points = player.p.points.sub(cost);
            setBuyableAmount(
              this.layer,
              this.id,
              getBuyableAmount(this.layer, this.id).add(1),
            );
          }
        }
      },
      style: { height: "150px", width: "200px" },
    },
    14: {
      title: "Points Booster^2",
      cost(x = player[this.layer].buyables[this.id]) {
        let cost = Decimal.pow(1.25, x.pow(1.05)).mul(1e80);
        return cost.floor();
      },
      effect(x = player[this.layer].buyables[this.id]) {
        let eff = {};

        // ⭐️ 情況 A：購買次數小於等於 20 次
        if (x.lte(50)) {
          eff.first = Decimal.pow(1.1, x);
        }
        // ⭐️ 情況 B：購買次數超過 20 次（啟用收益遞減/Softcap）
        else {
          let baseEff = Decimal.pow(1.1, 50); // 前 20 次累積的 2^20 倍
          let extraAmount = x.sub(50); // 超過 20 次的數量
          let extraEff = Decimal.pow(1.02, extraAmount); // 超過的部分每次只乘 1.5

          eff.first = baseEff.times(extraEff);
        }

        return eff;
      },
      display() {
        let data = tmp[this.layer].buyables[this.id];
        let amount = player[this.layer].buyables[this.id];

        // 額外加上 Softcap 提醒標示（超過 20 次時提示玩家）
        let softcapText = amount.gt(50) ? "\n(Softcapped: 1.1x -> 1.02x)" : "";

        return (
          "Cost: " +
          formatWhole(data.cost) +
          " Points\n" +
          "Amount: " +
          formatWhole(amount) +
          "\n" +
          "Boosts Points gain by " +
          format(data.effect.first) +
          "x" +
          softcapText
        );
      },
      unlocked() {
        return hasUpgrade("p", "71");
      },
      canAfford() {
        return player.points.gte(tmp[this.layer].buyables[this.id].cost);
      },
      canBuy() {
        return this.canAfford();
      },
      buy() {
        let cost = tmp[this.layer].buyables[this.id].cost;

        if (hasUpgrade("planet", 24)) {
          // 如果有免費效果：直接加等級，完全不扣點數！
          setBuyableAmount(
            this.layer,
            this.id,
            getBuyableAmount(this.layer, this.id).add(1),
          );
        } else {
          // 正常情況：檢查點數並扣款
          if (player.points.gte(cost)) {
            player.points = player.points.sub(cost);
            setBuyableAmount(
              this.layer,
              this.id,
              getBuyableAmount(this.layer, this.id).add(1),
            );
          }
        }
      },
      style: { height: "150px", width: "200px" },
    },
  },
});
