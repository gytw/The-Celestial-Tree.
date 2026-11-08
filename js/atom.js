addLayer("atom", {
  name: "atoms", // 層級顯示名稱
  symbol: "AO", // 圖示符號
  position: 2, // 在第二行（row 1）的位置
  branches: ["p"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "#51efba", // 綠色行星代表色
  requires: new Decimal(1e90), // 需要 2e47 Star 才能解鎖重置
  resource: "atoms", // 產出的資源名稱
  baseResource: "points", // 消耗的基礎資源名稱（來自 Star 層級 'p'）
  baseAmount() {
    return player.points;
  }, // 抓取 Star 層級的點數
  type: "normal", // 標準重置類型
  exponent: 0.05, // 獲取 Planet 的指數公式
  gainMult() {
    let mult = new Decimal(1);
    if (hasUpgrade("atom", "12")) mult = mult.times(3);
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
    },
  },
});
