addLayer("galaxy", {
  name: "galaxy",
  symbol: "GA",
  position: 0,
  color: "#6e4ac2",

  // 資源與消耗設定
  resource: "galaxy",
  baseResource: "planet",
  baseAmount() {
    return player.planet.points;
  },
  type: "static",
  branches: ["planet"],

  // 🛠️ 防呆版 base 與 exponent，防止底層呼叫時 NaN 或崩潰
  exponent() {
    return new Decimal(1);
  },
  base() {
    return new Decimal(10);
  },

  // 🎯 核心需求動態計算（帶有嚴格的防呆檢查）
  requires() {
    if (!player.galaxy || !player.galaxy.points) return new Decimal(1e46);
    let currentGalaxy = new Decimal(player.galaxy.points);
    let cost = new Decimal(1e46);
    let i = new Decimal(0);

    while (i.lt(currentGalaxy)) {
      let stepMult = new Decimal(10).times(Decimal.pow(2, i));
      cost = cost.times(stepMult);
      i = i.add(1);
    }
    return cost;
  },

  gainMult() {
    return new Decimal(1);
  },

  row: 2,
  hotkeys: [
    {
      key: "ga",
      description: "Press GA to reset for a Galaxy",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasUpgrade("atom", 44) || (player.galaxy && player.galaxy.unlocked);
  },

  // 🛡️ 確保 startData 裡的點數絕對是 Decimal，從根本解決未初始化就呼叫的方法錯亂
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
    };
  },

  // 當你按下 Galaxy 重置時觸發的清理邏輯
  onReset(resettingLayer) {
    // 確保只有當 Galaxy 自己重置時才清空下屬層級
    if (resettingLayer === this.layer) {
      if (player.planet) {
        player.planet.points = new Decimal(0);
        player.planet.upgrades = [];
        player.planet.buyables = {};
        player.planet.milestones = [];
      }
      if (player.atom) {
        player.atom.points = new Decimal(0);
        player.atom.upgrades = [];
        player.atom.buyables = {};
      }
      if (player.p) {
        player.p.points = new Decimal(0);
        player.p.upgrades = [];
        player.p.buyables = {};
      }
    }
  },
  milestones: {
    0: {
      requirementDescription: "1 total galaxy",
      effectDescription:
        "Mult planet gain by 1.5, atom gain by 5 and unlock one more atom upgrade",
      done() {
        return player.galaxy?.points?.gte(1) ?? false;
      },
    },
    1: {
      requirementDescription: "2 total galaxy",
      effectDescription: "Coming soon!(V1.14.3 endgame)",
      done() {
        return player.galaxy?.total?.gte(2) ?? false;
      },
    },
  },
  upgrades: {
    11: {
      title: "Booster",
      description: "Mult points and star gain by 2.5 ",
      cost: new Decimal(0),
    },
    12: {
      title: "The galaxy upgrade 2",
      description: "Mult planet gain by 2.5 ",
      cost: new Decimal(1),
      unlocked() {
        return hasUpgrade("galaxy", "11") && hasMilestone("galaxy", "1");
      },
    },
  },
});
