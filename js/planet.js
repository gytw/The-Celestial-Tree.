addLayer("planet", {
  name: "Planet", // 層級顯示名稱
  symbol: "P", // 圖示符號
  position: 0, // 在第二行（row 1）的位置
  branches: ["p", "atom"],
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
  exponent: 0.15, // 獲取 Planet 的指數公式
  gainMult() {
    let mult = new Decimal(1);
    if (hasUpgrade("p", "42")) mult = mult.times(1.5);
    if (hasUpgrade("p", "43")) mult = mult.times(2);
    if (hasUpgrade("p", "44")) mult = mult.times(2);
    if (hasUpgrade("p", "61")) mult = mult.times(3);
    if (hasUpgrade("p", "62")) mult = mult.times(2.5);
    if (hasUpgrade("atom", "25")) mult = mult.times(1e5);
    if (hasUpgrade("atom", "42")) mult = mult.times(1e11);
    if (hasMilestone("galaxy", "0")) mult = mult.times(1.5);
    if (hasUpgrade("atom", "45")) mult = mult.times(14);
    if (hasUpgrade("galaxy", "12")) mult = mult.times(2.5);

    if (player.p && player.p.buyables && player.p.buyables[13]) {
      let eff = buyableEffect("p", 13);
      if (eff) {
        // 提取 Buyable 的效果數值
        let buyableEff = eff.first !== undefined ? eff.first : eff;

        // ⭐️ 關鍵：必須把算出來的效果「乘」進去你的總倍率 mult 裡！
        mult = mult.times(buyableEff);
      }
    }
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
      if (player.atom) {
        player.atom.points = new Decimal(0);
      }
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
    1: {
      requirementDescription: "2 Planet",
      effectDescription: "Gain 200% of Star reset gain per second.",
      done() {
        return player.planet.points.gte(2);
      },
      effect() {
        // 用 Decimal 包起來，或者直接用數學乘法
        let gain = new Decimal(tmp.planet.resetGain);
        return gain.times(2.0);
      },
      effectDisplay() {
        return format(this.effect()) + " Stars/sec";
      },
    },
    2: {
      requirementDescription: "14 Planet",
      effectDescription: "Unlock More Star Upgrades",
      done() {
        return player.planet.points.gte(14);
      },
    },
    3: {
      requirementDescription: "30 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "Autobuy Star booster and Point booster buyables",
      done() {
        return player.planet.points.gte(30);
      }, // 換成你的解鎖門檻
    },
    4: {
      requirementDescription: "125 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "Star^1.025",
      done() {
        return player.planet.points.gte(125);
      }, // 換成你的解鎖門檻
    },
    5: {
      requirementDescription: "300 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "Point^1.025",
      done() {
        return player.planet.points.gte(300);
      }, // 換成你的解鎖門檻
    },
    6: {
      requirementDescription: "600 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "mult Star gain by 5",
      done() {
        return player.planet.points.gte(600);
      }, // 換成你的解鎖門檻
    },
    7: {
      requirementDescription: "1500 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "mult Star gain by 3 and mult points gain by 1e6",
      done() {
        return player.planet.points.gte(1500);
      }, // 換成你的解鎖門檻
    },
    8: {
      requirementDescription: "5e4 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "Star^1.03 but points^0.98",
      done() {
        return player.planet.points.gte(5e4);
      }, // 換成你的解鎖門檻
    },
    9: {
      requirementDescription: "5e7 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "Star gain based on planets",
      done() {
        return player.planet.points.gte(5e7);
      },
      effect() {
        let planet = player.planet.points
          ? player.planet.points
          : new Decimal(0);

        // 如果點數還沒達到 1e75，效果就是 1（不加成）
        if (planet.lt(1e6)) return new Decimal(1);

        // 計算超出 1e75 的溢出量 (用 sub(1e75) 而不是 75)
        let excess = planet.sub(1e6);

        // 計算最終加成，並確保最後一定有 .max(1) 保底
        return excess.div(1e6).add(1).pow(0.1).max(1);
      },
      effectDescription() {
        // 直接抓取當前暫存計算好的數值
        let eff = tmp[this.layer].milestones[this.id].effect;
        return "Star gain based on planet (effects: x" + format(eff) + ")";
      },
    },
    10: {
      requirementDescription: "5e9 Planet", // 依照你的需求設定解鎖條件
      effectDescription: "Autobuy planet booster and Points booster^2 buyables",
      done() {
        return player.planet.points.gte(5e9);
      }, // 換成你的解鎖門檻
    },
  },
  upgrades: {
    11: {
      title: "Planet Upgrades 1",
      description: "Mult Star by 5 and Points^1.06",
      cost: new Decimal(1),
    },
    12: {
      title: "Planet Upgrades 2",
      description: "Mult Star gain based on planet",
      cost: new Decimal(1),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        // ⭐️ 關鍵：這裡改抓 Planet 層級的點數 (player.P.points)
        let planet =
          player.planet && player.planet.points
            ? player.planet.points
            : new Decimal(0);

        // 計算加成公式（用 log 避免數值太爆炸，也可以改成 .pow()）
        return planet.add(1).log(2).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "11"); // 依據你的解鎖條件調整
      },
    },
    13: {
      title: "Planet Upgrades 3",
      description: "Mult Points gain based on planet",
      cost: new Decimal(20),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        // ⭐️ 關鍵：這裡改抓 Planet 層級的點數 (player.P.points)
        let planet =
          player.planet && player.planet.points
            ? player.planet.points
            : new Decimal(0);

        // 計算加成公式（用 log 避免數值太爆炸，也可以改成 .pow()）
        return planet.add(1).log(10).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "12"); // 依據你的解鎖條件調整
      },
    },
    14: {
      title: "points boost points",
      description: "Mult Points gain based on points",
      cost: new Decimal(1500),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        let points = player.points ? player.points : new Decimal(0);
        if (points.lt(1e52)) return new Decimal(1);
        let excess = points.sub(52);
        return excess.div(1e52).add(1).pow(0.3).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "13"); // 依據你的解鎖條件調整
      },
    },
    15: {
      title: "Star boost Star",
      description: "Mult Star gain based on Star",
      cost: new Decimal(1e6),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        let Star = player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e70)) return new Decimal(1);
        let excess = Star.sub(70);
        return excess.div(1e70).add(1).pow(0.02).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "14"); // 依據你的解鎖條件調整
      },
    },
    21: {
      title: "Star boost points",
      description: "Mult points gain based on Star",
      cost: new Decimal(2.5e8),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        let Star = player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e75)) return new Decimal(1);
        let excess = Star.sub(75);
        return excess.div(1e75).add(1).pow(0.15).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "15"); // 依據你的解鎖條件調整
      },
    },
    22: {
      title: "Star boost points^2",
      description: "Mult points gain based on Star again",
      cost: new Decimal(1e9),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        let Star = player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e70)) return new Decimal(1);
        let excess = Star.sub(70);
        return excess.div(1e70).add(1).pow(0.07).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "21"); // 依據你的解鎖條件調整
      },
    },
    23: {
      title: "points boost Star",
      description: "Mult Star gain based on points ",
      cost: new Decimal(9.5e9),
      // 抓取 Planet 的點數（或者抓 player.points，看你要用哪種資源來加成）
      effect() {
        let points = player.points ? player.points : new Decimal(0);
        if (points.lt(1e85)) return new Decimal(1);
        let excess = points.sub(70);
        return excess.div(1e85).add(1).pow(0.095).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("planet", "22"); // 依據你的解鎖條件調整
      },
    },
    24: {
      title: "Auto free",
      description: "buy first four stars buyables doesn't comsume resorces",
      cost: new Decimal(3.5e10),
      unlocked() {
        return hasUpgrade("planet", "23"); // 依據你的解鎖條件調整
      },
    },
    25: {
      title: "Atom free?",
      description:
        "Mult atom gain by 3, boost atom gain based on star and unlock more atom upgrades.",
      cost: new Decimal(1e12),
      unlocked() {
        return hasUpgrade("planet", "24"); // 依據你的解鎖條件調整
      },
      effect() {
        let Star = player.p.points ? player.p.points : new Decimal(0);
        if (Star.lt(1e102)) return new Decimal(1);
        let excess = Star.sub(102);
        return excess.div(1e102).add(1).pow(0.05).log(1.5).plus(1).max(1);
      },
      effectDisplay() {
        // 在按鈕上顯示目前這顆升級提供了多少倍加成
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
    },
  },
});
