(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const CANVAS_W = 1152;
  const CANVAS_H = 768;
  const PANEL_W = 276;
  const CHAT_H = 168;
  const VIEW = { x: 0, y: 0, w: CANVAS_W - PANEL_W, h: CANVAS_H - CHAT_H };
  const PANEL = { x: VIEW.w, y: 0, w: PANEL_W, h: CANVAS_H };
  const CHAT = { x: 0, y: VIEW.h, w: VIEW.w, h: CHAT_H };
  const TILE_W = 48;
  const TILE_H = 24;
  const HALF_W = TILE_W / 2;
  const HALF_H = TILE_H / 2;
  const WORLD_W = 80;
  const WORLD_H = 80;
  const MAX_CHAT = 10;

  const tabs = ["inventory", "skills", "quests", "equipment", "magic", "settings"];
  const tabLabels = {
    inventory: "Backpack",
    skills: "Skills",
    quests: "Quests",
    equipment: "Worn Gear",
    magic: "Spells",
    settings: "Options",
  };

  const skillNames = [
    "Attack",
    "Strength",
    "Defence",
    "Hitpoints",
    "Ranged",
    "Magic",
    "Prayer",
    "Mining",
    "Smithing",
    "Fishing",
    "Cooking",
    "Woodcutting",
    "Firemaking",
    "Crafting",
    "Thieving",
    "Agility",
    "Fletching",
    "Runecrafting",
    "Farming",
    "Herblore",
    "Slayer",
  ];

  const SKILL_GUIDES = {
    Attack: ["1 Bronze sword", "5 Iron sword", "10 Accurate stance", "20 Black knights", "30 Deep wight attempts"],
    Strength: ["1 Bread-fueled bravery", "10 Higher melee hits", "20 Moss brute training", "35 Demon-worthy swings"],
    Defence: ["1 Wooden shield", "5 Bronze helm", "10 Leather body", "25 Black helm", "40 Achievement cape"],
    Hitpoints: ["10 Starting health", "15 Safer graveyard trips", "25 Survive crawlers", "40 Stand near demons"],
    Ranged: ["1 Shortbow", "5 Bronze arrows", "15 Broad arrows", "30 Kite cave crawlers"],
    Magic: ["1 Home Teleport", "1 Wind Poke", "5 Low Alchemy", "13 Fire Bolt", "20 Crumble undead", "25 Staff boosts"],
    Prayer: ["1 Bury bones", "4 Thick Skin", "7 Burst Strength", "10 Sharp Eye", "15 Rapid Heal"],
    Mining: ["1 Copper/Tin", "15 Iron ore", "30 Gold ore", "35 Better clue odds in mine"],
    Smithing: ["1 Bronze bar/sword", "15 Iron bars/sword", "20 Gold bars", "25 Efficient furnace work"],
    Fishing: ["1 Shrimp spots", "20 Trout at Lake Mollusk"],
    Cooking: ["1 Shrimp/Beef", "15 Fewer burns", "20 Trout"],
    Woodcutting: ["1 Normal trees", "15 Oak trees", "25 Better firemaking supplies"],
    Firemaking: ["1 Logs", "15 Oak logs", "30 Town warmth and diary credit"],
    Crafting: ["1 Cowhide work", "5 Leather body / gold rings", "12 Cut gems", "20 Power amulets"],
    Thieving: ["1 Cake stall", "5 Silk stall rolls", "15 Better odds", "25 Wilderness pockets someday"],
    Agility: ["1 Balance log", "5 Rope swing", "12 Stepping stones", "20 Faster run recovery", "35 Shortcut stamina"],
    Fletching: ["1 Arrow shafts", "1 Bronze arrows", "5 Shortbows", "15 Oak shortbows", "25 Broad arrow wisdom"],
    Runecrafting: ["1 Air runes", "2 Mind runes", "15 Chaos runes", "25 Law runes", "35 Multiple rune whispers"],
    Farming: ["1 Potato patch", "5 Mirthleaf herbs", "10 Better yields", "20 Lower disease chance", "35 Farmhands nod politely"],
    Herblore: ["1 Clean mirthleaf", "1 Mix attack potions", "8 Energy mixtures", "15 Stronger brews someday"],
    Slayer: ["1 Rat/Imp tasks", "10 Skeleton/Crawler tasks", "25 Moss brutes", "30 Deep wight", "38 Lesser demons"],
  };

  const terrainColors = {
    grass: ["#4b8f35", "#3f7d30", "#2f6429"],
    path: ["#9f8150", "#8c7043", "#705532"],
    dirt: ["#7d6139", "#6d5432", "#533d25"],
    sand: ["#c8b675", "#aa985f", "#806f45"],
    water: ["#236692", "#174e78", "#103d62"],
    town: ["#a79b80", "#8d816a", "#675e4d"],
    stone: ["#73736d", "#5d5d59", "#444442"],
    swamp: ["#546c3c", "#40562f", "#2d3f25"],
    field: ["#857b37", "#736b32", "#584f26"],
  };

  const ITEMS = {
    coins: { name: "Coins", stackable: true, color: "#f5c84c", icon: "gp", value: 1 },
    bronze_sword: {
      name: "Bronze sword",
      slot: "weapon",
      color: "#c98048",
      icon: "sw",
      value: 28,
      attack: 3,
      strength: 2,
    },
    iron_sword: {
      name: "Iron sword",
      slot: "weapon",
      color: "#b9c1c4",
      icon: "sw",
      value: 95,
      attack: 7,
      strength: 5,
      requirements: { Attack: 5 },
    },
    steel_sword: {
      name: "Steel sword",
      slot: "weapon",
      color: "#d8e0df",
      icon: "sw",
      value: 220,
      attack: 12,
      strength: 9,
      requirements: { Attack: 20 },
    },
    shortbow: {
      name: "Shortbow",
      slot: "weapon",
      color: "#9b6b36",
      icon: "bw",
      value: 55,
      attack: 4,
      strength: 3,
      ranged: true,
      range: 5.5,
    },
    bronze_arrow: {
      name: "Bronze arrow",
      stackable: true,
      color: "#c58d47",
      icon: "ar",
      value: 2,
    },
    knife: { name: "Knife", color: "#d9d9d4", icon: "kn", value: 12 },
    feather: { name: "Feather", stackable: true, color: "#f5f0dc", icon: "ft", value: 1 },
    arrow_shaft: { name: "Arrow shaft", stackable: true, color: "#b47a3f", icon: "as", value: 1 },
    bronze_arrowtips: { name: "Bronze arrowtips", stackable: true, color: "#c98548", icon: "bt", value: 2 },
    bow_string: { name: "Bow string", color: "#e8dcc0", icon: "bs", value: 14 },
    oak_shortbow: {
      name: "Oak shortbow",
      slot: "weapon",
      color: "#b47a3f",
      icon: "ob",
      value: 135,
      attack: 7,
      strength: 6,
      ranged: true,
      range: 6,
      requirements: { Ranged: 10, Fletching: 15 },
    },
    wooden_shield: {
      name: "Wooden shield",
      slot: "shield",
      color: "#9b6437",
      icon: "sh",
      value: 22,
      defence: 3,
    },
    bronze_helm: {
      name: "Bronze helm",
      slot: "helm",
      color: "#b87342",
      icon: "hm",
      value: 35,
      defence: 2,
    },
    leather_body: {
      name: "Leather body",
      slot: "body",
      color: "#7f4f2f",
      icon: "lb",
      value: 60,
      defence: 4,
      requirements: { Defence: 5 },
    },
    slayer_helm: {
      name: "Slayer helm",
      slot: "helm",
      color: "#26313a",
      icon: "sl",
      value: 450,
      attack: 4,
      strength: 4,
      defence: 6,
      slayerBoost: true,
      requirements: { Defence: 10, Slayer: 15 },
    },
    amulet_of_accuracy: {
      name: "Amulet of accuracy",
      slot: "amulet",
      color: "#55b8ff",
      icon: "aa",
      value: 180,
      attack: 5,
    },
    broad_arrow: {
      name: "Broad arrow",
      stackable: true,
      color: "#5fba79",
      icon: "ba",
      value: 5,
      broad: true,
    },
    clue_scroll: { name: "Clue scroll", color: "#d7c48d", icon: "cl", value: 35 },
    reward_casket: { name: "Reward casket", color: "#a87538", icon: "cs", value: 65 },
    antique_lamp: { name: "Antique lamp", color: "#d7b55d", icon: "xp", value: 20 },
    mystery_box: { name: "Mystery box", color: "#7f5136", icon: "mb", value: 30 },
    spinach_roll: { name: "Spinach roll", color: "#4f9f49", icon: "sr", value: 12, food: 6 },
    cake: { name: "Cake", color: "#e8c56b", icon: "ck", value: 24, food: 7 },
    silk: { name: "Silk", color: "#efe4b0", icon: "sk", value: 34 },
    fur: { name: "Fur", color: "#8f6848", icon: "fr", value: 28 },
    attack_potion: { name: "Attack potion", color: "#8b4dcc", icon: "ap", value: 42, boostSkill: "Attack", boostFlat: 3, boostPct: 0.1 },
    strength_potion: { name: "Strength potion", color: "#d65d4c", icon: "sp", value: 54, boostSkill: "Strength", boostFlat: 3, boostPct: 0.1 },
    defence_potion: { name: "Defence potion", color: "#6b8fd9", icon: "dp", value: 50, boostSkill: "Defence", boostFlat: 3, boostPct: 0.1 },
    ranging_potion: { name: "Ranging potion", color: "#5dbb62", icon: "rp", value: 70, boostSkill: "Ranged", boostFlat: 4, boostPct: 0.1 },
    magic_potion: { name: "Magic potion", color: "#57a9e8", icon: "mp", value: 74, boostSkill: "Magic", boostFlat: 4, boostPct: 0.08 },
    energy_potion: { name: "Energy potion", color: "#f0d85b", icon: "ep", value: 36, runRestore: 35 },
    potato_seed: { name: "Potato seed", stackable: true, color: "#9f7a3f", icon: "ps", value: 3 },
    mirthleaf_seed: { name: "Mirthleaf seed", stackable: true, color: "#6cbf5f", icon: "ms", value: 9 },
    potato: { name: "Potato", color: "#cfa866", icon: "pt", value: 8, food: 3 },
    grimy_mirthleaf: { name: "Grimy mirthleaf", color: "#5f8f46", icon: "gh", value: 18 },
    clean_mirthleaf: { name: "Mirthleaf", color: "#7fd76b", icon: "mh", value: 28 },
    vial_of_water: { name: "Vial of water", color: "#7fd7ff", icon: "vw", value: 8 },
    empty_vial: { name: "Empty vial", color: "#cfdfff", icon: "ev", value: 4 },
    compost: { name: "Compost", color: "#6a4a2d", icon: "cp", value: 10 },
    achievement_cape: {
      name: "Achievement cape",
      slot: "body",
      color: "#4d8be8",
      icon: "ac",
      value: 1200,
      attack: 3,
      strength: 3,
      defence: 8,
    },
    wizard_hat: { name: "Wizard hat", slot: "helm", color: "#2a58a8", icon: "wh", value: 120, attack: 2, requirements: { Magic: 5 } },
    black_helm: { name: "Black helm", slot: "helm", color: "#1d1d21", icon: "bh", value: 210, defence: 5, requirements: { Defence: 10 } },
    iron_platelegs: { name: "Iron platelegs", slot: "legs", color: "#aeb5b9", icon: "pl", value: 130, defence: 4, requirements: { Defence: 5 } },
    team_cape: { name: "Team cape", slot: "body", color: "#b63232", icon: "tc", value: 160, attack: 1, defence: 3 },
    castle_ticket: { name: "Castle wars ticket", stackable: true, color: "#e0c45b", icon: "ct", value: 12 },
    castle_bandage: { name: "Castle bandage", color: "#f2e7c7", icon: "cb", value: 8, food: 9 },
    decorative_helm: { name: "Decorative helm", slot: "helm", color: "#d8d0a8", icon: "dh", value: 520, defence: 4, requirements: { Defence: 10 } },
    decorative_sword: {
      name: "Decorative sword",
      slot: "weapon",
      color: "#ddd5a6",
      icon: "ds",
      value: 820,
      attack: 13,
      strength: 12,
      requirements: { Attack: 20 },
    },
    decorative_shield: { name: "Decorative shield", slot: "shield", color: "#c8b75b", icon: "cw", value: 640, defence: 8, requirements: { Defence: 20 } },
    decorative_platebody: { name: "Decorative platebody", slot: "body", color: "#c7c0a0", icon: "dp", value: 1120, defence: 12, requirements: { Defence: 25 } },
    crypt_helm: { name: "Crypt helm", slot: "helm", color: "#4d5a5c", icon: "ch", value: 760, defence: 7, requirements: { Defence: 25 } },
    crypt_platebody: { name: "Crypt platebody", slot: "body", color: "#5b6768", icon: "cp", value: 1450, defence: 15, requirements: { Defence: 30 } },
    crypt_platelegs: { name: "Crypt platelegs", slot: "legs", color: "#687374", icon: "cl", value: 980, defence: 10, requirements: { Defence: 25 } },
    wight_blade: {
      name: "Wight blade",
      slot: "weapon",
      color: "#93d0d6",
      icon: "wb",
      value: 1650,
      attack: 18,
      strength: 24,
      requirements: { Attack: 30, Strength: 25 },
    },
    crypt_staff: {
      name: "Crypt staff",
      slot: "weapon",
      color: "#7a68b2",
      icon: "cs",
      value: 1280,
      attack: 10,
      strength: 5,
      magicBoost: true,
      requirements: { Magic: 25 },
    },
    ancient_page: { name: "Ancient page", color: "#bba66d", icon: "pg", value: 210 },
    rune_scimitar: {
      name: "Rune scimitar",
      slot: "weapon",
      color: "#58bfd0",
      icon: "sc",
      value: 950,
      attack: 22,
      strength: 20,
      requirements: { Attack: 40 },
    },
    staff_of_air: {
      name: "Staff of air",
      slot: "weapon",
      color: "#d9f1ff",
      icon: "st",
      value: 320,
      attack: 8,
      strength: 3,
      magicBoost: true,
      requirements: { Magic: 10 },
    },
    bread: { name: "Bread", color: "#d8a74f", icon: "br", value: 7, food: 5 },
    raw_shrimp: {
      name: "Raw shrimp",
      color: "#d89078",
      icon: "rs",
      value: 4,
      cookTo: "cooked_shrimp",
      cookingXp: 30,
      burnLevel: 8,
    },
    cooked_shrimp: {
      name: "Shrimp",
      color: "#f2aa88",
      icon: "sh",
      value: 9,
      food: 4,
    },
    burnt_fish: { name: "Burnt fish", color: "#1f1d19", icon: "bf", value: 1 },
    burnt_meat: { name: "Burnt meat", color: "#1f1d19", icon: "bm", value: 1 },
    raw_trout: {
      name: "Raw trout",
      color: "#b47d73",
      icon: "rt",
      value: 18,
      cookTo: "cooked_trout",
      cookingXp: 55,
      burnLevel: 22,
    },
    cooked_trout: {
      name: "Trout",
      color: "#e2a16f",
      icon: "tr",
      value: 30,
      food: 8,
    },
    raw_beef: {
      name: "Raw beef",
      color: "#b85f55",
      icon: "rb",
      value: 8,
      cookTo: "cooked_beef",
      burnTo: "burnt_meat",
      cookingXp: 35,
      burnLevel: 10,
    },
    cooked_beef: {
      name: "Cooked beef",
      color: "#9a4d32",
      icon: "cb",
      value: 16,
      food: 5,
    },
    raw_chicken: {
      name: "Raw chicken",
      color: "#d69b85",
      icon: "rc",
      value: 7,
      cookTo: "cooked_chicken",
      burnTo: "burnt_meat",
      cookingXp: 32,
      burnLevel: 9,
    },
    cooked_chicken: {
      name: "Cooked chicken",
      color: "#d78c48",
      icon: "cc",
      value: 15,
      food: 5,
    },
    logs: { name: "Logs", color: "#8b5a32", icon: "lg", value: 5, log: true },
    oak_logs: { name: "Oak logs", color: "#a16b35", icon: "ok", value: 14, log: true },
    copper_ore: { name: "Copper ore", color: "#c26a35", icon: "co", value: 6, ore: true },
    tin_ore: { name: "Tin ore", color: "#b7b6a3", icon: "to", value: 6, ore: true },
    iron_ore: { name: "Iron ore", color: "#8f8174", icon: "io", value: 18, ore: true },
    bronze_bar: { name: "Bronze bar", color: "#c98548", icon: "bb", value: 26, bar: true },
    iron_bar: { name: "Iron bar", color: "#b5b8b9", icon: "ib", value: 60, bar: true },
    bones: { name: "Bones", color: "#e6dfc5", icon: "bn", value: 4 },
    big_bones: { name: "Big bones", color: "#f2e8ca", icon: "bb", value: 18 },
    cowhide: { name: "Cowhide", color: "#9d6a41", icon: "ch", value: 20 },
    uncut_gem: { name: "Uncut gem", color: "#72e0c3", icon: "gm", value: 75 },
    chisel: { name: "Chisel", color: "#d8d8d0", icon: "cz", value: 18 },
    cut_gem: { name: "Cut gem", color: "#48dcc8", icon: "cg", value: 115 },
    gold_ore: { name: "Gold ore", color: "#d2a846", icon: "go", value: 42, ore: true },
    gold_bar: { name: "Gold bar", color: "#e0bd55", icon: "gb", value: 88, bar: true },
    gold_ring: { name: "Gold ring", color: "#dfc35b", icon: "gr", value: 120, slot: "amulet", attack: 1 },
    power_amulet: { name: "Power amulet", color: "#65e8d2", icon: "pa", value: 360, slot: "amulet", attack: 3, strength: 3, defence: 3, requirements: { Crafting: 20 } },
    slayer_gem: { name: "Slayer gem", color: "#65d6ff", icon: "sg", value: 1 },
    bag_of_salt: { name: "Bag of salt", stackable: true, color: "#f3eee0", icon: "sa", value: 5 },
    rune_essence: { name: "Rune essence", stackable: true, color: "#d9d2ff", icon: "re", value: 5 },
    rune_pouch: { name: "Rune pouch", color: "#57406f", icon: "rp", value: 120 },
    air_talisman: { name: "Air talisman", color: "#dcecff", icon: "at", value: 45 },
    mind_talisman: { name: "Mind talisman", color: "#efc0ff", icon: "mt", value: 58 },
    chaos_talisman: { name: "Chaos talisman", color: "#7d59d8", icon: "ct", value: 180 },
    law_talisman: { name: "Law talisman", color: "#f0dc68", icon: "lt", value: 260 },
    air_rune: { name: "Air rune", stackable: true, color: "#e9f0ff", icon: "ar", value: 4 },
    mind_rune: { name: "Mind rune", stackable: true, color: "#efc0ff", icon: "mr", value: 3 },
    chaos_rune: { name: "Chaos rune", stackable: true, color: "#6146b4", icon: "cr", value: 48 },
    law_rune: { name: "Law rune", stackable: true, color: "#d8c75a", icon: "lr", value: 90 },
    death_rune: { name: "Death rune", stackable: true, color: "#2e2b33", icon: "dr", value: 120 },
    lobster: { name: "Lobster", color: "#d23e36", icon: "lb", value: 95, food: 12 },
  };

  const state = {
    time: 0,
    rng: 1337,
    camera: { x: 0, y: 0 },
    hover: null,
    tab: "inventory",
    modal: null,
    clickMarker: null,
    musicOn: false,
    nextMusic: 0,
    run: false,
    clue: null,
    randomEvent: null,
    nextRandomEvent: 95,
    areaName: "Boonshire",
    map: [],
    resources: [],
    scenery: [],
    npcs: [],
    enemies: [],
    groundItems: [],
    fires: [],
    barks: [],
    chat: [],
    contextMenu: null,
    collection: {},
    diaryRewardClaimed: false,
    quests: {
      cooksErrand: {
        title: "Cook's Errand",
        state: "not-started",
        text: "The castle cook wants a cooked shrimp and ordinary logs.",
      },
      restlessBones: {
        title: "Restless Bones",
        state: "not-started",
        text: "A nervous priest wants five sets of bones buried.",
      },
      copperPromise: {
        title: "The Copper Promise",
        state: "not-started",
        text: "Smith a bronze bar for the furnace keeper.",
      },
      wightHunt: {
        title: "Wight in the Hollow",
        state: "not-started",
        text: "Slayer Master Vann wants proof that the Deep wight can be put down.",
      },
      fletchersOrder: {
        title: "Fletcher's Order",
        state: "not-started",
        text: "Fletcher Rowan needs 15 bronze arrows for the town guard.",
      },
      runeMysteries: {
        title: "Rune Mysteries",
        state: "not-started",
        text: "Wizard Elric wants proof that essence can be shaped into runes.",
      },
      gardenTrouble: {
        title: "Garden Trouble",
        state: "not-started",
        text: "Gardener Bess wants a harvested crop and a homemade potion.",
      },
    },
    stats: {
      bankUses: 0,
      bonesBuried: 0,
      casketsOpened: 0,
      cluesSolved: 0,
      cowhidesCrafted: 0,
      darkWizardsSlain: 0,
      deepWightsSlain: 0,
      ferriesTaken: 0,
      firesLit: 0,
      fishCaught: 0,
      agilityObstacles: 0,
      arrowsFletched: 0,
      bowsFletched: 0,
      chickensSlain: 0,
      cropsHarvested: 0,
      farmingContractsCompleted: 0,
      goblinsSlain: 0,
      gemsCut: 0,
      herbsCleaned: 0,
      herbsHarvested: 0,
      jewelryCrafted: 0,
      lesserDemonsSlain: 0,
      logsCut: 0,
      mapsOpened: 0,
      oresMined: 0,
      potionsDrunk: 0,
      potionsMixed: 0,
      randomEventsCompleted: 0,
      essenceMined: 0,
      runesCrafted: 0,
      airRunesCrafted: 0,
      mindRunesCrafted: 0,
      chaosRunesCrafted: 0,
      lawRunesCrafted: 0,
      cryptWightsDefeated: 0,
      cryptChestsOpened: 0,
      castleWarsPlayed: 0,
      castleWarsWon: 0,
      castleFlagsCaptured: 0,
      slayerTasksCompleted: 0,
      stallsStolen: 0,
      visitedWilderness: false,
    },
    slayer: { task: null, streak: 0, points: 0 },
    runePouch: { essence: 0, capacity: 12 },
    crypt: { awakened: [], defeated: [], chestsOpened: 0, lastReward: null },
    castleWars: { active: false, score: 0, enemyScore: 0, flagHeld: false, endsAt: 0, nextEnemyScore: 0, supplyReadyAt: 0, lastReward: null },
    farmingContract: null,
    farmingPatches: {
      vegetable: { crop: null, plantedAt: 0, watered: false, diseased: false },
      herb: { crop: null, plantedAt: 0, watered: false, diseased: false },
    },
    player: {
      name: "Adventurer",
      x: 39,
      y: 39,
      path: [],
      targetTile: null,
      pending: null,
      action: null,
      combatTarget: null,
      attackTimer: 0,
      damageFlash: 0,
      respawnFlash: 0,
      combatStyle: "balanced",
      prayerMode: "none",
      prayerPoints: 10,
      boosts: {},
      boostDecay: 60,
      runEnergy: 100,
      hp: 100,
      inventory: Array.from({ length: 28 }, () => null),
      bank: Array.from({ length: 48 }, () => null),
      equipment: {
        weapon: "bronze_sword",
        shield: "wooden_shield",
        helm: null,
        body: null,
        legs: null,
        amulet: null,
      },
      skills: {},
    },
    uiRects: [],
  };

  for (const skill of skillNames) {
    state.player.skills[skill] = { xp: skill === "Hitpoints" ? xpForLevel(10) : 0 };
  }

  const DIARY_TASKS = [
    { id: "bank", label: "Use a bank booth", done: () => state.stats.bankUses > 0 },
    { id: "bones", label: "Bury bones", done: () => state.stats.bonesBuried > 0 },
    { id: "fire", label: "Light a fire", done: () => state.stats.firesLit > 0 },
    { id: "fish", label: "Catch fish", done: () => state.stats.fishCaught > 0 },
    { id: "ore", label: "Mine ore", done: () => state.stats.oresMined > 0 },
    { id: "potion", label: "Drink a potion", done: () => state.stats.potionsDrunk > 0 },
    { id: "craft", label: "Craft leather", done: () => state.stats.cowhidesCrafted > 0 },
    { id: "jewellery", label: "Cut a gem or craft jewellery", done: () => state.stats.gemsCut > 0 || state.stats.jewelryCrafted > 0 },
    { id: "thieving", label: "Steal from a market stall", done: () => state.stats.stallsStolen > 0 },
    { id: "agility", label: "Clear an agility obstacle", done: () => state.stats.agilityObstacles > 0 },
    { id: "fletching", label: "Fletch bronze arrows", done: () => state.stats.arrowsFletched > 0 },
    { id: "runecrafting", label: "Craft runes at an altar", done: () => state.stats.runesCrafted > 0 },
    { id: "farming", label: "Harvest a farm patch", done: () => state.stats.cropsHarvested > 0 },
    { id: "herblore", label: "Mix a potion", done: () => state.stats.potionsMixed > 0 },
    { id: "contract", label: "Complete a farming contract", done: () => state.stats.farmingContractsCompleted > 0 },
    { id: "slayer", label: "Finish a Slayer task", done: () => state.stats.slayerTasksCompleted > 0 },
    { id: "clue", label: "Solve a clue scroll", done: () => state.stats.cluesSolved > 0 },
    { id: "map", label: "Open the world map", done: () => state.stats.mapsOpened > 0 },
    { id: "event", label: "Claim a random event", done: () => state.stats.randomEventsCompleted > 0 },
    { id: "wilderness", label: "Step into Low Wilderness", done: () => Boolean(state.stats.visitedWilderness) },
    { id: "castle_flag", label: "Capture a castle flag", done: () => state.stats.castleFlagsCaptured > 0 },
    { id: "crypt", label: "Loot the crypt chest", done: () => state.stats.cryptChestsOpened > 0 },
    { id: "wight", label: "Defeat the Deep wight", done: () => state.stats.deepWightsSlain > 0 },
  ];

  const MAP_DESTINATIONS = [
    { id: "boonshire", label: "Boonshire", x: 39, y: 39, note: "bank, shops, quests", color: "#ffd86b" },
    { id: "slayer", label: "Slayer Lodge", x: 60, y: 38, note: "assignments and rewards", color: "#74f1ff" },
    { id: "wizard", label: "Wizard Tower", x: 52, y: 25, note: "essence and runecrafting", color: "#d5c7ff" },
    { id: "mine", label: "Greyrock Mine", x: 62, y: 18, note: "ore and furnace road", color: "#cfd3d6" },
    { id: "graveyard", label: "Old Graveyard", x: 55, y: 52, note: "skeletons and bones", color: "#e7dec4" },
    { id: "crypts", label: "Brother Crypts", x: 58, y: 54, note: "wights and chest loot", color: "#b9c7c6" },
    { id: "castlewars", label: "Castle Wars", x: 72, y: 30, note: "capture flags for tickets", color: "#f0d25d" },
    { id: "lake", label: "Lake Mollusk", x: 64, y: 64, note: "fish and ferry", color: "#7fd7ff" },
    { id: "agility", label: "Agility Yard", x: 31, y: 24, note: "obstacles and run training", color: "#9dff8a" },
    { id: "farm", label: "Bess's Patches", x: 28, y: 44, note: "farming and herbs", color: "#b9e46a" },
    { id: "hollow", label: "Crawler Hollow", x: 68, y: 43, note: "crawlers and wight", color: "#a0a8ff" },
    { id: "mosswood", label: "Mosswood", x: 16, y: 18, note: "brutes and oaks", color: "#9bd36f" },
    { id: "wildy", label: "Low Wilderness", x: 11, y: 12, note: "chaos altar, danger", color: "#ff8e77" },
    { id: "cowfield", label: "Cow Field", x: 23, y: 53, note: "hides and beef", color: "#fff0c5" },
  ];

  const BESTIARY = [
    { type: "chicken", name: "Chicken", level: 1, location: "Cow Field", drops: "feathers, raw chicken", tip: "classic arrow supply" },
    { type: "giant_rat", name: "Giant rat", level: 2, location: "Cow Field", drops: "bones, coins", tip: "safe novice task" },
    { type: "pasture_cow", name: "Pasture cow", level: 2, location: "Cow Field", drops: "cowhide, beef", tip: "crafting starter" },
    { type: "field_imp", name: "Field imp", level: 5, location: "West fields", drops: "runes, talismans, potato seeds", tip: "weak to melee" },
    { type: "grave_skeleton", name: "Grave skeleton", level: 12, location: "Old Graveyard", drops: "bones, iron sword", tip: "prayer fuel" },
    { type: "salt_slug", name: "Salt slug", level: 18, location: "Crawler Hollow", drops: "gems, salt", tip: "finish with salt" },
    { type: "cave_crawler", name: "Cave crawler", level: 16, location: "Crawler Hollow", drops: "gems, coins", tip: "bring food" },
    { type: "dark_wizard", name: "Dark wizard", level: 20, location: "Low Wilderness", drops: "chaos, talismans, staff", tip: "keep prayer ready" },
    { type: "moss_brute", name: "Moss brute", level: 28, location: "Mosswood", drops: "mirthleaf seeds, steel", tip: "slow but heavy" },
    { type: "black_knight", name: "Black knight", level: 33, location: "Low Wilderness", drops: "black helm, legs", tip: "armoured target" },
    { type: "deep_wight", name: "Deep wight", level: 34, location: "Crawler Hollow", drops: "clues, amulet", tip: "Slayer quest prey" },
    { type: "crypt_brother", name: "Crypt brother", level: 38, location: "Brother Crypts", drops: "chest charge, death runes", tip: "wake three, loot once" },
    { type: "lesser_demon", name: "Lesser demon", level: 42, location: "Low Wilderness", drops: "rune scimitar", tip: "endgame task" },
  ];

  const FARM_CROPS = {
    potato: {
      name: "Potatoes",
      seed: "potato_seed",
      product: "potato",
      patch: "vegetable",
      level: 1,
      plantXp: 8,
      harvestXp: 42,
      growTime: 22,
      minYield: 3,
      maxYield: 6,
    },
    mirthleaf: {
      name: "Mirthleaf",
      seed: "mirthleaf_seed",
      product: "grimy_mirthleaf",
      patch: "herb",
      level: 5,
      plantXp: 14,
      harvestXp: 72,
      growTime: 32,
      minYield: 2,
      maxYield: 4,
    },
  };

  function defaultFarmingPatches() {
    return {
      vegetable: { crop: null, plantedAt: 0, watered: false, diseased: false },
      herb: { crop: null, plantedAt: 0, watered: false, diseased: false },
    };
  }

  const RUNECRAFTING_RECIPES = {
    air: { name: "Air", rune: "air_rune", talisman: "air_talisman", level: 1, xp: 5, multipleEvery: 11, color: "#e9f0ff" },
    mind: { name: "Mind", rune: "mind_rune", talisman: "mind_talisman", level: 2, xp: 6, multipleEvery: 14, color: "#efc0ff" },
    chaos: { name: "Chaos", rune: "chaos_rune", talisman: "chaos_talisman", level: 15, xp: 10, multipleEvery: 18, color: "#9b75ff" },
    law: { name: "Law", rune: "law_rune", talisman: "law_talisman", level: 25, xp: 12, multipleEvery: 22, color: "#f0dc68" },
  };

  const CRYPT_BROTHERS = {
    mord: { name: "Mord the Splitter", type: "crypt_brother_mord", level: 30, hp: 82, attack: 19, strength: 23, defence: 14, x: 53, y: 53, weakness: "Prayer" },
    vell: { name: "Vell the Hollow", type: "crypt_brother_vell", level: 34, hp: 76, attack: 24, strength: 16, defence: 12, x: 58, y: 52, weakness: "Ranged" },
    kael: { name: "Kael the Still", type: "crypt_brother_kael", level: 38, hp: 94, attack: 20, strength: 22, defence: 19, x: 61, y: 55, weakness: "Magic" },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function tileKey(x, y) {
    return `${x},${y}`;
  }

  function hash(x, y, salt = 0) {
    let n = x * 374761393 + y * 668265263 + salt * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }

  function random() {
    state.rng = (state.rng * 1664525 + 1013904223) >>> 0;
    return state.rng / 4294967296;
  }

  function choice(items) {
    return items[Math.floor(random() * items.length)];
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function xpForLevel(level) {
    if (level <= 1) return 0;
    let points = 0;
    for (let i = 1; i < level; i += 1) {
      points += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.floor(points / 4);
  }

  function getLevel(skill) {
    const xp = state.player.skills[skill]?.xp || 0;
    let level = 1;
    while (level < 99 && xp >= xpForLevel(level + 1)) level += 1;
    return level;
  }

  function xpToNext(skill) {
    const level = getLevel(skill);
    if (level >= 99) return 0;
    return xpForLevel(level + 1) - (state.player.skills[skill]?.xp || 0);
  }

  function effectiveLevel(skill) {
    return getLevel(skill) + (state.player.boosts?.[skill] || 0);
  }

  function activeBoosts() {
    return Object.entries(state.player.boosts || {}).filter(([, amount]) => amount > 0);
  }

  function maxHp() {
    return getLevel("Hitpoints") * 10;
  }

  function maxPrayer() {
    return Math.max(10, getLevel("Prayer") * 10);
  }

  function agilityRunBonus() {
    return Math.max(0, effectiveLevel("Agility") - 1);
  }

  function runDrainRate() {
    return 5.5 * (1 - Math.min(0.38, agilityRunBonus() * 0.006));
  }

  function runRestoreRate(base) {
    return base * (1 + Math.min(0.5, agilityRunBonus() * 0.01));
  }

  function prayerBoost(kind) {
    if (state.player.prayerPoints <= 0) return 1;
    if (kind === "strength" && state.player.prayerMode === "burstStrength") return 1.12;
    if (kind === "defence" && state.player.prayerMode === "thickSkin") return 1.15;
    if (kind === "attack" && state.player.prayerMode === "sharpEye") return 1.1;
    return 1;
  }

  function requirementText(requirements = {}) {
    return Object.entries(requirements)
      .map(([skill, level]) => `${skill} ${level}`)
      .join(", ");
  }

  function meetsRequirements(requirements = {}) {
    return Object.entries(requirements).every(([skill, level]) => getLevel(skill) >= level);
  }

  function drinkPotion(slot) {
    const item = state.player.inventory[slot];
    if (!item) return;
    const data = ITEMS[item.id];
    if (data.runRestore) {
      state.player.runEnergy = Math.min(100, state.player.runEnergy + data.runRestore);
      removeSlot(state.player.inventory, slot, 1);
      state.stats.potionsDrunk += 1;
      addChat(`You drink the ${data.name}. Run energy restored.`);
      return;
    }
    if (!data.boostSkill) return;
    const skill = data.boostSkill;
    const boost = Math.max(1, Math.floor(getLevel(skill) * (data.boostPct || 0)) + (data.boostFlat || 0));
    state.player.boosts[skill] = Math.max(state.player.boosts[skill] || 0, boost);
    state.player.boostDecay = Math.min(state.player.boostDecay || 60, 60);
    removeSlot(state.player.inventory, slot, 1);
    state.stats.potionsDrunk += 1;
    addChat(`You drink the ${data.name}. ${skill} is boosted by ${boost}.`);
  }

  function usingSlayerBoost(enemy) {
    const helm = state.player.equipment.helm;
    const task = state.slayer.task;
    return Boolean(helm && ITEMS[helm]?.slayerBoost && task && enemy && task.type === enemy.slayerType);
  }

  function gainXp(skill, amount) {
    if (!state.player.skills[skill]) return;
    const before = getLevel(skill);
    state.player.skills[skill].xp += amount;
    const after = getLevel(skill);
    if (after > before) {
      addChat(`Congratulations, your ${skill} level is now ${after}.`);
      playSfx("level");
      if (skill === "Hitpoints") state.player.hp = Math.min(maxHp(), state.player.hp + 10);
      if (skill === "Prayer") state.player.prayerPoints = maxPrayer();
    }
  }

  function addChat(text, tone = "game") {
    state.chat.push({ text, tone, time: state.time });
    if (state.chat.length > MAX_CHAT) state.chat.shift();
  }

  let audioContext = null;

  function getAudioContext() {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      if (!audioContext) audioContext = new AudioCtor();
      if (audioContext.state === "suspended") audioContext.resume();
      return audioContext;
    } catch (error) {
      return null;
    }
  }

  function playTone(freq, duration = 0.08, type = "square", gain = 0.035, delay = 0) {
    const audio = getAudioContext();
    if (!audio) return;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    const start = audio.currentTime + delay;
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playJingle(notes, duration = 0.08, type = "square", gain = 0.03) {
    notes.forEach((note, i) => playTone(note, duration, type, gain, i * duration * 0.85));
  }

  function playSfx(kind) {
    if (kind === "click") playTone(330, 0.035, "square", 0.02);
    else if (kind === "hit") playTone(120, 0.06, "sawtooth", 0.025);
    else if (kind === "loot") playJingle([523, 659, 784], 0.07, "square", 0.025);
    else if (kind === "level") playJingle([392, 523, 659, 784], 0.09, "triangle", 0.04);
    else if (kind === "spell") playJingle([440, 660, 880], 0.06, "sine", 0.025);
  }

  function mapAt(x, y) {
    if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return "water";
    return state.map[y][x];
  }

  function setTile(x, y, terrain) {
    if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return;
    state.map[y][x] = terrain;
  }

  function setRect(x, y, w, h, terrain) {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) setTile(xx, yy, terrain);
    }
  }

  function lineTiles(x0, y0, x1, y1) {
    const tiles = [];
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    while (true) {
      tiles.push({ x, y });
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
    return tiles;
  }

  function drawRoad(x0, y0, x1, y1, width = 1) {
    for (const tile of lineTiles(x0, y0, x1, y1)) {
      for (let oy = -width; oy <= width; oy += 1) {
        for (let ox = -width; ox <= width; ox += 1) {
          if (Math.abs(ox) + Math.abs(oy) <= width + 1) setTile(tile.x + ox, tile.y + oy, "path");
        }
      }
    }
  }

  function addResource(type, x, y, extra = {}) {
    const resource = {
      id: `${type}-${state.resources.length}`,
      type,
      x,
      y,
      depleted: 0,
      wobble: random() * Math.PI * 2,
      ...extra,
    };
    state.resources.push(resource);
    return resource;
  }

  function addScenery(type, name, x, y, extra = {}) {
    const obj = { id: `${type}-${state.scenery.length}`, type, name, x, y, ...extra };
    state.scenery.push(obj);
    return obj;
  }

  function addNpc(id, name, role, x, y, extra = {}) {
    state.npcs.push({ id, name, role, x, y, face: 1, wander: 0, ...extra });
  }

  function addEnemy(type, name, x, y, stats, loot = []) {
    const enemy = {
      id: `${type}-${state.enemies.length}`,
      type,
      name,
      x,
      y,
      spawnX: x,
      spawnY: y,
      hp: stats.hp,
      maxHp: stats.hp,
      level: stats.level,
      attack: stats.attack,
      strength: stats.strength,
      defence: stats.defence,
      slayerType: stats.slayerType || type,
      xp: stats.xp || stats.hp * 3,
      aggro: stats.aggro || 4,
      respawn: stats.respawn || 7,
      respawnTimer: 0,
      attackTimer: random() * 2,
      hitFlash: 0,
      wanderTimer: random() * 2,
      wanderDx: 0,
      wanderDy: 0,
      cryptBrother: stats.cryptBrother || null,
      despawnOnDeath: Boolean(stats.despawnOnDeath),
      finisher: stats.finisher || null,
      loot,
    };
    state.enemies.push(enemy);
    return enemy;
  }

  function buildWorld() {
    state.map = Array.from({ length: WORLD_H }, () => Array.from({ length: WORLD_W }, () => "grass"));

    for (let x = 0; x < WORLD_W; x += 1) {
      const center = 58 + Math.round(Math.sin(x * 0.17) * 4 + Math.sin(x * 0.51) * 1.5);
      for (let dy = -2; dy <= 2; dy += 1) setTile(x, center + dy, "water");
      for (let dy of [-4, -3, 3, 4]) {
        if (mapAt(x, center + dy) === "grass") setTile(x, center + dy, "sand");
      }
    }

    for (let y = 0; y < WORLD_H; y += 1) {
      for (let x = 0; x < WORLD_W; x += 1) {
        const lake = Math.hypot(x - 64, y - 64);
        const mine = Math.hypot(x - 62, y - 18);
        const swamp = Math.hypot(x - 66, y - 43);
        const field = Math.hypot(x - 26, y - 50);
        if (lake < 8) setTile(x, y, "water");
        else if (lake < 10 && mapAt(x, y) === "grass") setTile(x, y, "sand");
        if (mine < 11) setTile(x, y, mine < 8 ? "stone" : "dirt");
        if (swamp < 10 && mapAt(x, y) === "grass") setTile(x, y, "swamp");
        if (field < 8 && mapAt(x, y) === "grass") setTile(x, y, "field");
      }
    }

    drawRoad(8, 38, 70, 38, 1);
    drawRoad(39, 22, 39, 69, 1);
    drawRoad(39, 35, 59, 20, 1);
    drawRoad(38, 42, 23, 49, 1);
    drawRoad(47, 40, 66, 44, 1);
    drawRoad(40, 56, 54, 62, 1);
    drawRoad(39, 27, 31, 24, 1);
    drawRoad(49, 46, 58, 54, 1);
    drawRoad(64, 36, 72, 30, 1);

    setRect(31, 27, 9, 7, "town");
    setRect(42, 28, 8, 7, "town");
    setRect(29, 42, 8, 6, "town");
    setRect(45, 43, 8, 7, "town");
    setRect(55, 34, 9, 8, "town");
    setRect(36, 36, 8, 5, "town");
    setRect(50, 27, 7, 5, "town");
    setRect(24, 41, 8, 7, "field");
    setRect(49, 22, 8, 6, "town");
    setRect(51, 23, 4, 3, "stone");
    setRect(27, 21, 10, 7, "dirt");
    setRect(5, 8, 19, 20, "dirt");
    setRect(8, 10, 6, 5, "stone");
    setRect(16, 16, 6, 6, "swamp");
    setRect(51, 49, 14, 8, "dirt");
    setRect(54, 51, 8, 5, "stone");
    setRect(62, 59, 5, 4, "stone");
    drawRoad(58, 58, 64, 61, 1);
    setRect(66, 24, 13, 13, "field");
    setRect(66, 24, 5, 5, "stone");
    setRect(74, 32, 5, 5, "stone");
    setRect(69, 28, 7, 5, "dirt");
    drawRoad(64, 36, 72, 30, 1);

    addScenery("bank_booth", "Bank booth", 34, 30, { width: 4, height: 1, action: "bank" });
    addScenery("chest", "Bank chest", 37, 30, { action: "bank" });
    addScenery("shop_counter", "General store counter", 45, 31, { action: "shop" });
    addScenery("range", "Castle range", 33, 44, { action: "cook" });
    addScenery("altar", "Stone altar", 49, 46, { action: "pray" });
    addScenery("furnace", "Furnace", 53, 29, { action: "smelt" });
    addScenery("anvil", "Anvil", 55, 30, { action: "smith" });
    addScenery("slayer_board", "Slayer board", 59, 37, { action: "slayer" });
    addScenery("cave", "Damp cave entrance", 68, 43, { action: "cave" });
    addScenery("well", "Town well", 40, 39, { action: "water" });
    addScenery("quest_sign", "Quest noticeboard", 37, 38, { action: "quests" });
    addScenery("market_stall", "Market stall", 44, 36, { action: "steal", level: 1 });
    addScenery("fletching_table", "Fletching table", 43, 34, { action: "fletch" });
    addScenery("wizard_tower", "Wizard tower", 52, 25, { action: "examine", interactRange: 2.5 });
    addScenery("air_altar", "Air altar", 50, 25, { action: "runecraft", rune: "air", interactRange: 2.5 });
    addScenery("mind_altar", "Mind altar", 54, 25, { action: "runecraft", rune: "mind", interactRange: 2.5 });
    addScenery("vegetable_patch", "Vegetable patch", 26, 44, { action: "farm", patchId: "vegetable", interactRange: 2.4 });
    addScenery("herb_patch", "Herb patch", 29, 44, { action: "farm", patchId: "herb", interactRange: 2.4 });
    addScenery("compost_bin", "Compost bin", 24, 42, { action: "compost", interactRange: 2.3 });
    addScenery("scarecrow", "Suspicious scarecrow", 31, 42, { action: "examine" });
    addScenery("seed_sacks", "Seed sacks", 27, 41, { action: "examine" });
    addScenery("balance_log", "Balance log", 31, 24, { action: "agility", level: 1, xp: 34, restore: 7, failDamage: 3, cooldown: 2.2 });
    addScenery("rope_swing", "Rope swing", 34, 23, { action: "agility", level: 5, xp: 58, restore: 10, failDamage: 5, cooldown: 3.0 });
    addScenery("stepping_stones", "Stepping stones", 29, 26, { action: "agility", level: 12, xp: 86, restore: 13, failDamage: 7, cooldown: 3.4 });
    addScenery("dock", "Fishing dock", 55, 61, { action: "fish" });
    addScenery("law_altar", "Law altar", 64, 61, { action: "runecraft", rune: "law", interactRange: 2.5 });
    addScenery("crypt_mound", "Mord's crypt", 53, 53, { action: "crypt", brother: "mord", interactRange: 2.7 });
    addScenery("crypt_mound", "Vell's crypt", 58, 52, { action: "crypt", brother: "vell", interactRange: 2.7 });
    addScenery("crypt_mound", "Kael's crypt", 61, 55, { action: "crypt", brother: "kael", interactRange: 2.7 });
    addScenery("crypt_chest", "Crypt chest", 58, 55, { action: "crypt_chest", interactRange: 2.7 });
    addScenery("castle_portal", "Castle Wars portal", 69, 36, { action: "castle_wars", interactRange: 3.0 });
    addScenery("castle_flag", "Boon flag", 68, 27, { action: "castle_flag", team: "home", interactRange: 2.5 });
    addScenery("castle_flag", "Rival flag", 76, 34, { action: "castle_flag", team: "enemy", interactRange: 2.5 });
    addScenery("castle_supply", "Castle supply table", 71, 30, { action: "castle_supply", interactRange: 2.4 });
    addScenery("castle_scoreboard", "Castle Wars scoreboard", 72, 31, { action: "castle_scoreboard", interactRange: 2.4 });
    addScenery("ditch", "Wilderness ditch", 24, 31, { action: "wildy" });
    addScenery("chaos_altar", "Chaos altar", 11, 12, { action: "chaos_altar" });
    addScenery("chaos_rift", "Chaos rift", 14, 14, { action: "runecraft", rune: "chaos", interactRange: 2.7 });
    addScenery("ruins", "Burnt ruins", 17, 20, { action: "examine" });

    for (let i = 0; i < 85; i += 1) {
      const x = 7 + Math.floor(hash(i, 3) * 23);
      const y = 17 + Math.floor(hash(i, 8) * 31);
      if (mapAt(x, y) === "grass" || mapAt(x, y) === "field") {
        addResource(hash(i, 1) > 0.82 ? "oak_tree" : "tree", x, y);
      }
    }
    for (let i = 0; i < 42; i += 1) {
      const x = 55 + Math.floor(hash(i, 31) * 16);
      const y = 10 + Math.floor(hash(i, 41) * 19);
      if (mapAt(x, y) === "stone" || mapAt(x, y) === "dirt") {
        const roll = hash(i, 99);
        addResource(roll > 0.44 ? "gold_rock" : roll > 0.32 ? "iron_rock" : roll > 0.16 ? "tin_rock" : "copper_rock", x, y);
      }
    }
    for (const spot of [
      [52, 23],
      [53, 23],
      [52, 24],
    ]) {
      addResource("essence_rock", spot[0], spot[1]);
    }
    for (const spot of [
      [47, 58],
      [50, 60],
      [53, 62],
      [58, 62],
      [63, 58],
      [68, 63],
    ]) {
      addResource("fishing_spot", spot[0], spot[1]);
    }

    addNpc("banker", "Banker Niles", "banker", 35, 31);
    addNpc("shopkeeper", "Shopkeeper Marnie", "shop", 45, 32);
    addNpc("cook", "Castle Cook", "cook", 32, 45);
    addNpc("priest", "Brother Alden", "priest", 49, 48);
    addNpc("smith", "Furnace Keeper Brigg", "smith", 52, 30);
    addNpc("slayer_master", "Slayer Master Vann", "slayer", 60, 38);
    addNpc("guide", "Town Guide", "guide", 39, 38);
    addNpc("fisher", "Old Ferryman", "fisher", 54, 61);
    addNpc("apothecary", "Apothecary Herwin", "apothecary", 47, 45);
    addNpc("fletcher", "Fletcher Rowan", "fletcher", 43, 35);
    addNpc("wizard", "Wizard Elric", "wizard", 52, 27);
    addNpc("gardener", "Gardener Bess", "gardener", 27, 42);
    addNpc("castle_squire", "Castle Squire", "squire", 70, 36);
    addNpc("guard", "Town Guard", "guard", 41, 37, { patrol: true });
    addNpc("border_guard", "Border Guard", "guard", 25, 32);

    for (let i = 0; i < 8; i += 1) {
      addEnemy("chicken", "Chicken", 23 + (i % 4) * 2, 57 + Math.floor(i / 4) * 2, {
        level: 1,
        hp: 12,
        attack: 1,
        strength: 1,
        defence: 0,
        xp: 12,
        aggro: 0.5,
        respawn: 5,
        slayerType: "chicken",
      }, [["feather", 8 + (i % 3) * 2, 0.95], ["raw_chicken", 1, 0.8], ["bones", 1, 0.4]]);
    }

    for (let i = 0; i < 9; i += 1) {
      addEnemy("giant_rat", "Giant rat", 18 + (i % 3) * 2, 49 + Math.floor(i / 3) * 2, {
        level: 2,
        hp: 18,
        attack: 2,
        strength: 2,
        defence: 1,
        xp: 18,
        aggro: 0.7,
        slayerType: "giant_rat",
      }, [["bones", 1, 0.6], ["coins", 3, 0.35]]);
    }
    for (let i = 0; i < 8; i += 1) {
      addEnemy("pasture_cow", "Pasture cow", 20 + (i % 4) * 2, 53 + Math.floor(i / 4) * 2, {
        level: 2,
        hp: 22,
        attack: 1,
        strength: 2,
        defence: 1,
        xp: 20,
        aggro: 1.5,
        slayerType: "pasture_cow",
      }, [["bones", 1, 0.95], ["cowhide", 1, 0.9], ["raw_beef", 1, 0.65]]);
    }
    for (let i = 0; i < 8; i += 1) {
      addEnemy("field_imp", "Field imp", 17 + (i % 4) * 2, 34 + Math.floor(i / 4) * 3, {
        level: 5,
        hp: 25,
        attack: 4,
        strength: 4,
        defence: 2,
        xp: 30,
        aggro: 3,
        slayerType: "field_imp",
      }, [["coins", 8, 0.5], ["mind_rune", 4, 0.25], ["air_rune", 6, 0.25], ["air_talisman", 1, 0.07], ["potato_seed", 2, 0.18]]);
    }
    for (let i = 0; i < 7; i += 1) {
      addEnemy("dark_wizard", "Dark wizard", 8 + (i % 3) * 3, 18 + Math.floor(i / 3) * 3, {
        level: 20,
        hp: 58,
        attack: 19,
        strength: 13,
        defence: 8,
        xp: 95,
        aggro: 5,
        respawn: 12,
        slayerType: "dark_wizard",
      }, [["bones", 1, 0.7], ["chaos_rune", 2, 0.35], ["law_rune", 1, 0.08], ["chaos_talisman", 1, 0.06], ["mind_talisman", 1, 0.08], ["magic_potion", 1, 0.1], ["wizard_hat", 1, 0.07], ["staff_of_air", 1, 0.04]]);
    }
    for (let i = 0; i < 4; i += 1) {
      addEnemy("black_knight", "Black knight", 15 + (i % 2) * 3, 10 + Math.floor(i / 2) * 3, {
        level: 33,
        hp: 92,
        attack: 21,
        strength: 22,
        defence: 20,
        xp: 170,
        aggro: 4.5,
        respawn: 17,
        slayerType: "black_knight",
      }, [["big_bones", 1, 0.8], ["coins", 65, 0.55], ["defence_potion", 1, 0.12], ["black_helm", 1, 0.08], ["iron_platelegs", 1, 0.07], ["steel_sword", 1, 0.06]]);
    }
    addEnemy("lesser_demon", "Lesser demon", 10, 11, {
      level: 42,
      hp: 125,
      attack: 25,
      strength: 28,
      defence: 22,
      xp: 310,
      aggro: 7,
      respawn: 35,
      slayerType: "lesser_demon",
    }, [["big_bones", 1, 1], ["chaos_rune", 8, 0.55], ["law_rune", 2, 0.18], ["clue_scroll", 1, 0.28], ["strength_potion", 1, 0.16], ["rune_scimitar", 1, 0.035], ["slayer_helm", 1, 0.03]]);
    for (let i = 0; i < 7; i += 1) {
      addEnemy("grave_skeleton", "Grave skeleton", 55 + (i % 3) * 3, 49 + Math.floor(i / 3) * 3, {
        level: 12,
        hp: 42,
        attack: 8,
        strength: 8,
        defence: 6,
        xp: 65,
        aggro: 4,
        slayerType: "grave_skeleton",
      }, [["bones", 1, 0.95], ["coins", 18, 0.4], ["attack_potion", 1, 0.08], ["iron_sword", 1, 0.06]]);
    }
    for (let i = 0; i < 9; i += 1) {
      addEnemy("cave_crawler", "Cave crawler", 64 + (i % 4) * 2, 39 + Math.floor(i / 4) * 2, {
        level: 16,
        hp: 50,
        attack: 10,
        strength: 9,
        defence: 7,
        xp: 80,
        aggro: 4.5,
        respawn: 10,
        slayerType: "cave_crawler",
      }, [["bones", 1, 0.7], ["uncut_gem", 1, 0.08], ["energy_potion", 1, 0.1], ["coins", 24, 0.5]]);
    }
    for (let i = 0; i < 6; i += 1) {
      addEnemy("salt_slug", "Salt slug", 72 + (i % 3) * 2, 41 + Math.floor(i / 3) * 2, {
        level: 18,
        hp: 54,
        attack: 9,
        strength: 11,
        defence: 12,
        xp: 90,
        aggro: 3.6,
        respawn: 12,
        slayerType: "salt_slug",
        finisher: "bag_of_salt",
      }, [["bones", 1, 0.55], ["coins", 32, 0.5], ["uncut_gem", 1, 0.1], ["bag_of_salt", 1, 0.2]]);
    }
    addEnemy("deep_wight", "Deep wight", 69, 46, {
      level: 34,
      hp: 115,
      attack: 20,
      strength: 21,
      defence: 18,
      xp: 240,
      aggro: 6,
      respawn: 28,
      slayerType: "deep_wight",
    }, [["bones", 1, 1], ["coins", 120, 0.7], ["clue_scroll", 1, 0.35], ["ranging_potion", 1, 0.14], ["amulet_of_accuracy", 1, 0.08], ["team_cape", 1, 0.06], ["steel_sword", 1, 0.05]]);
    for (let i = 0; i < 5; i += 1) {
      addEnemy("moss_brute", "Moss brute", 14 + (i % 3) * 3, 16 + Math.floor(i / 3) * 3, {
        level: 28,
        hp: 80,
        attack: 16,
        strength: 17,
        defence: 14,
        xp: 130,
        aggro: 5,
        respawn: 14,
        slayerType: "moss_brute",
      }, [["bones", 1, 0.9], ["coins", 55, 0.55], ["mirthleaf_seed", 2, 0.18], ["strength_potion", 1, 0.12], ["steel_sword", 1, 0.04]]);
    }
  }

  function walkable(x, y) {
    const terrain = mapAt(x, y);
    if (terrain === "water") return false;
    if (x < 1 || y < 1 || x >= WORLD_W - 1 || y >= WORLD_H - 1) return false;
    return true;
  }

  function nearestWalkable(x, y, maxRadius = 4) {
    const tx = Math.round(x);
    const ty = Math.round(y);
    if (walkable(tx, ty)) return { x: tx, y: ty };
    for (let r = 1; r <= maxRadius; r += 1) {
      let best = null;
      let bestD = Infinity;
      for (let yy = ty - r; yy <= ty + r; yy += 1) {
        for (let xx = tx - r; xx <= tx + r; xx += 1) {
          if (Math.abs(xx - tx) !== r && Math.abs(yy - ty) !== r) continue;
          if (!walkable(xx, yy)) continue;
          const d = Math.hypot(xx - x, yy - y);
          if (d < bestD) {
            best = { x: xx, y: yy };
            bestD = d;
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  function findPath(startX, startY, endX, endY) {
    const start = nearestWalkable(startX, startY, 1);
    const end = nearestWalkable(endX, endY, 5);
    if (!start || !end) return [];
    const open = [{ x: start.x, y: start.y, g: 0, f: 0, parent: null }];
    const seen = new Map();
    const closed = new Set();
    const goalKey = tileKey(end.x, end.y);
    seen.set(tileKey(start.x, start.y), open[0]);
    const dirs = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, 1.4],
      [1, -1, 1.4],
      [-1, 1, 1.4],
      [-1, -1, 1.4],
    ];

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const node = open.shift();
      const key = tileKey(node.x, node.y);
      if (closed.has(key)) continue;
      if (key === goalKey) {
        const path = [];
        let cursor = node;
        while (cursor.parent) {
          path.unshift({ x: cursor.x + 0.5, y: cursor.y + 0.5 });
          cursor = cursor.parent;
        }
        return path;
      }
      closed.add(key);
      for (const [dx, dy, cost] of dirs) {
        const nx = node.x + dx;
        const ny = node.y + dy;
        const nKey = tileKey(nx, ny);
        if (closed.has(nKey) || !walkable(nx, ny)) continue;
        if (Math.abs(dx) && Math.abs(dy) && (!walkable(node.x + dx, node.y) || !walkable(node.x, node.y + dy))) continue;
        const g = node.g + cost + (mapAt(nx, ny) === "path" ? -0.1 : 0);
        const h = Math.hypot(end.x - nx, end.y - ny);
        const existing = seen.get(nKey);
        if (!existing || g < existing.g) {
          const next = { x: nx, y: ny, g, f: g + h, parent: node };
          seen.set(nKey, next);
          open.push(next);
        }
      }
    }
    return [];
  }

  function moveToTile(x, y, pending = null) {
    const target = nearestWalkable(x, y, 7);
    if (!target) {
      addChat("I can't reach that.");
      return false;
    }
    state.player.path = findPath(Math.floor(state.player.x), Math.floor(state.player.y), target.x, target.y);
    state.player.targetTile = target;
    state.player.pending = pending;
    state.player.action = null;
    if (!pending) state.player.combatTarget = null;
    state.clickMarker = { x: target.x + 0.5, y: target.y + 0.5, time: 0.8 };
    return state.player.path.length > 0 || Math.hypot(state.player.x - target.x - 0.5, state.player.y - target.y - 0.5) < 0.8;
  }

  function moveAdjacentTo(entity, pending) {
    const candidates = [
      { x: Math.floor(entity.x), y: Math.floor(entity.y) - 1 },
      { x: Math.floor(entity.x), y: Math.floor(entity.y) + 1 },
      { x: Math.floor(entity.x) - 1, y: Math.floor(entity.y) },
      { x: Math.floor(entity.x) + 1, y: Math.floor(entity.y) },
      { x: Math.floor(entity.x) - 1, y: Math.floor(entity.y) - 1 },
      { x: Math.floor(entity.x) + 1, y: Math.floor(entity.y) + 1 },
    ];
    candidates.sort((a, b) => Math.hypot(a.x + 0.5 - state.player.x, a.y + 0.5 - state.player.y) - Math.hypot(b.x + 0.5 - state.player.x, b.y + 0.5 - state.player.y));
    const spot = candidates.find((c) => walkable(c.x, c.y));
    if (!spot) {
      addChat("There is no room to get close.");
      return false;
    }
    return moveToTile(spot.x, spot.y, pending);
  }

  function inventoryCount(itemId) {
    return state.player.inventory.reduce((sum, item) => sum + (item?.id === itemId ? item.qty : 0), 0);
  }

  function bankCount(itemId) {
    return state.player.bank.reduce((sum, item) => sum + (item?.id === itemId ? item.qty : 0), 0);
  }

  function addItem(container, itemId, qty = 1) {
    const data = ITEMS[itemId];
    if (!data) return false;
    if (data.stackable) {
      const stack = container.find((slot) => slot && slot.id === itemId);
      if (stack) {
        stack.qty += qty;
        return true;
      }
    }
    for (let i = 0; i < container.length; i += 1) {
      if (!container[i]) {
        container[i] = { id: itemId, qty };
        return true;
      }
    }
    return false;
  }

  function ensureSlots(container, size) {
    while (container.length < size) container.push(null);
  }

  function normalizeFarmingPatches() {
    const defaults = defaultFarmingPatches();
    const current = state.farmingPatches || {};
    state.farmingPatches = {};
    for (const [patchId, patch] of Object.entries(defaults)) {
      const saved = current[patchId] || {};
      state.farmingPatches[patchId] = {
        ...patch,
        ...saved,
        crop: FARM_CROPS[saved.crop] ? saved.crop : null,
        plantedAt: Number.isFinite(saved.plantedAt) ? saved.plantedAt : 0,
        watered: Boolean(saved.watered),
        diseased: Boolean(saved.diseased),
      };
    }
  }

  function normalizeCryptState() {
    const valid = Object.keys(CRYPT_BROTHERS);
    const crypt = state.crypt || {};
    state.crypt = {
      awakened: Array.isArray(crypt.awakened) ? crypt.awakened.filter((id) => valid.includes(id)) : [],
      defeated: Array.isArray(crypt.defeated) ? crypt.defeated.filter((id) => valid.includes(id)) : [],
      chestsOpened: Number(crypt.chestsOpened) || 0,
      lastReward: crypt.lastReward || null,
    };
  }

  function normalizeCastleWarsState() {
    const cw = state.castleWars || {};
    state.castleWars = {
      active: Boolean(cw.active),
      score: Number(cw.score) || 0,
      enemyScore: Number(cw.enemyScore) || 0,
      flagHeld: Boolean(cw.flagHeld),
      endsAt: Number(cw.endsAt) || 0,
      nextEnemyScore: Number(cw.nextEnemyScore) || 0,
      supplyReadyAt: Number(cw.supplyReadyAt) || 0,
      lastReward: cw.lastReward || null,
    };
  }

  function blankStats() {
    return Object.fromEntries(Object.entries(state.stats).map(([key, value]) => [key, typeof value === "boolean" ? false : 0]));
  }

  function normalizePlayerState() {
    ensureSlots(state.player.inventory, 28);
    ensureSlots(state.player.bank, 48);
    normalizeFarmingPatches();
    normalizeCryptState();
    normalizeCastleWarsState();
    state.runePouch = {
      essence: clamp(Number(state.runePouch?.essence) || 0, 0, Number(state.runePouch?.capacity) || 12),
      capacity: Number(state.runePouch?.capacity) || 12,
    };
    state.player.boosts = state.player.boosts || {};
    state.player.boostDecay = state.player.boostDecay || 60;
    for (const skill of skillNames) {
      if (!state.player.skills[skill]) state.player.skills[skill] = { xp: skill === "Hitpoints" ? xpForLevel(10) : 0 };
    }
    for (const [slot, itemId] of Object.entries(state.player.equipment)) {
      if (!itemId) continue;
      const item = ITEMS[itemId];
      if (item?.requirements && !meetsRequirements(item.requirements)) {
        state.player.equipment[slot] = null;
        if (!addInventory(itemId, 1, true)) addBank(itemId, 1);
        addChat(`${item.name} is unequipped until you meet its requirements.`);
      }
    }
  }

  function removeItem(container, itemId, qty = 1) {
    let remaining = qty;
    for (let i = 0; i < container.length; i += 1) {
      const item = container[i];
      if (!item || item.id !== itemId) continue;
      const take = Math.min(item.qty, remaining);
      item.qty -= take;
      remaining -= take;
      if (item.qty <= 0) container[i] = null;
      if (remaining <= 0) return true;
    }
    return false;
  }

  function removeSlot(container, slot, qty = 1) {
    const item = container[slot];
    if (!item) return null;
    const take = Math.min(qty, item.qty);
    const removed = { id: item.id, qty: take };
    item.qty -= take;
    if (item.qty <= 0) container[slot] = null;
    return removed;
  }

  function moveItem(from, to, slot, qty = 1) {
    const item = from[slot];
    if (!item) return false;
    const data = ITEMS[item.id];
    const amount = data.stackable ? item.qty : qty;
    if (to === state.player.inventory) ensureSlots(to, 28);
    if (to === state.player.bank) ensureSlots(to, 48);
    if (!addItem(to, item.id, amount)) {
      addChat("There is not enough room.");
      return false;
    }
    removeSlot(from, slot, amount);
    return true;
  }

  function addInventory(itemId, qty = 1, silent = false) {
    if (!addItem(state.player.inventory, itemId, qty)) {
      addChat("Your inventory is full.");
      return false;
    }
    if (!silent || state.time > 0.01) recordItem(itemId);
    if (!silent) addChat(`You receive ${formatItem(itemId, qty)}.`);
    return true;
  }

  function addBank(itemId, qty = 1) {
    ensureSlots(state.player.bank, 48);
    if (!addItem(state.player.bank, itemId, qty)) return false;
    return true;
  }

  function depositInventoryAll() {
    ensureSlots(state.player.bank, 48);
    let moved = 0;
    for (let i = 0; i < state.player.inventory.length; i += 1) {
      if (state.player.inventory[i] && moveItem(state.player.inventory, state.player.bank, i, state.player.inventory[i].qty)) moved += 1;
    }
    addChat(moved ? "You deposit your backpack." : "There is nothing to deposit.");
  }

  function sortBank() {
    ensureSlots(state.player.bank, 48);
    const stacks = new Map();
    const singles = [];
    for (const item of state.player.bank) {
      if (!item) continue;
      if (ITEMS[item.id]?.stackable) {
        stacks.set(item.id, (stacks.get(item.id) || 0) + item.qty);
      } else {
        singles.push({ id: item.id, qty: item.qty });
      }
    }
    const sorted = [
      ...Array.from(stacks.entries()).map(([id, qty]) => ({ id, qty })),
      ...singles,
    ].sort((a, b) => (ITEMS[a.id]?.name || a.id).localeCompare(ITEMS[b.id]?.name || b.id));
    state.player.bank = sorted.concat(Array.from({ length: Math.max(0, 48 - sorted.length) }, () => null)).slice(0, 48);
    addChat("You tidy the bank.");
  }

  function formatItem(itemId, qty = 1) {
    const name = ITEMS[itemId]?.name || itemId;
    if (qty === 1) return name;
    return `${qty} x ${name}`;
  }

  function recordItem(itemId) {
    if (!ITEMS[itemId] || itemId === "coins") return;
    if (!state.collection[itemId]) {
      state.collection[itemId] = 0;
      addChat(`Collection log: ${ITEMS[itemId].name}.`, "loot");
    }
    state.collection[itemId] += 1;
  }

  function collectionCount() {
    const tracked = Object.keys(ITEMS).filter((id) => id !== "coins");
    const found = tracked.filter((id) => state.collection[id]).length;
    return { found, total: tracked.length };
  }

  function diaryCompletedCount() {
    return DIARY_TASKS.filter((task) => task.done()).length;
  }

  function claimDiaryReward() {
    if (state.diaryRewardClaimed) {
      addChat("You have already claimed the diary reward.");
      return;
    }
    if (diaryCompletedCount() < DIARY_TASKS.length) {
      addChat("The Boonshire diary is not complete.");
      return;
    }
    state.diaryRewardClaimed = true;
    addInventory("achievement_cape", 1);
    addInventory("law_rune", 8);
    gainXp("Crafting", 250);
    gainXp("Slayer", 250);
    addChat("Boonshire Diary complete. Achievement cape unlocked!", "loot");
  }

  function openWorldMap() {
    state.stats.mapsOpened += 1;
    state.modal = { type: "worldMap", rects: [] };
  }

  function openBestiary() {
    state.modal = { type: "bestiary", rects: [] };
  }

  function openDiary() {
    state.modal = { type: "diary", rects: [] };
  }

  function travelTo(x, y, cost, label) {
    if (cost > 0 && !spendCoins(cost)) {
      addChat(`You need ${cost} coins for that trip.`);
      return;
    }
    state.player.x = x;
    state.player.y = y;
    state.player.path = [];
    state.player.pending = null;
    state.player.action = null;
    state.player.combatTarget = null;
    state.clickMarker = null;
    state.stats.ferriesTaken += cost > 0 ? 1 : 0;
    closeModal();
    updateCamera();
    addChat(`You travel to ${label}.`);
  }

  function openLamp(slot) {
    state.modal = { type: "lamp", itemSlot: slot, rects: [] };
  }

  function rubLamp(slot, skill) {
    const item = state.player.inventory[slot];
    if (!item || item.id !== "antique_lamp") {
      closeModal();
      return;
    }
    removeSlot(state.player.inventory, slot, 1);
    gainXp(skill, 140 + getLevel(skill) * 12);
    addChat(`The antique lamp grants ${skill} experience.`, "loot");
    closeModal();
  }

  function openMysteryBox(slot) {
    const item = state.player.inventory[slot];
    if (!item || item.id !== "mystery_box") return;
    removeSlot(state.player.inventory, slot, 1);
    const roll = random();
    const reward = roll > 0.992
      ? ["rune_scimitar", 1]
      : roll > 0.965
        ? [choice(["crypt_helm", "ancient_page"]), 1]
        : roll > 0.92
        ? ["team_cape", 1]
        : roll > 0.82
          ? ["clue_scroll", 1]
          : roll > 0.66
            ? [choice(["uncut_gem", "cut_gem", "gold_bar"]), 1]
            : roll > 0.5
              ? [choice(["attack_potion", "strength_potion", "defence_potion", "energy_potion"]), 1]
              : roll > 0.32
                ? [choice(["law_rune", "death_rune"]), 2 + Math.floor(random() * 3)]
                : roll > 0.16
                  ? [choice(["spinach_roll", "bow_string"]), 1]
                  : ["coins", 80 + Math.floor(random() * 220)];
    addInventory(reward[0], reward[1]);
    gainXp("Crafting", 35);
    addChat(`The mystery box contains ${formatItem(reward[0], reward[1])}.`, "loot");
  }

  function scheduleNextRandomEvent() {
    state.nextRandomEvent = state.time + 85 + random() * 150;
  }

  function updateRandomEvents() {
    if (state.randomEvent || state.modal || state.time < state.nextRandomEvent) return;
    if (state.castleWars.active) return;
    if (state.player.combatTarget || state.player.path.length) return;
    const events = [
      {
        id: "old_man",
        name: "Mysterious Old Man",
        lines: ["You look like someone who appreciates a very official interruption."],
        reward: ["mystery_box", 1],
        xp: null,
      },
      {
        id: "genie",
        name: "Blue Genie",
        lines: ["A tiny puff of smoke curls over your backpack. A lamp appears in your hands."],
        reward: ["antique_lamp", 1],
        xp: null,
      },
      {
        id: "sandwich_lady",
        name: "Sandwich Lady",
        lines: ["Correct answer: yes, you do want a snack."],
        reward: ["spinach_roll", 1],
        xp: ["Cooking", 60],
      },
    ];
    state.randomEvent = choice(events);
    openRandomEventDialogue();
  }

  function openRandomEventDialogue() {
    const event = state.randomEvent;
    if (!event) return;
    openDialogue(event.name, event.lines, [
      { label: "Claim reward", action: () => claimRandomEvent() },
      { label: "Dismiss", action: () => dismissRandomEvent() },
    ]);
    addChat(`${event.name} wants your attention.`, "loot");
  }

  function claimRandomEvent() {
    const event = state.randomEvent;
    if (!event) return;
    const [itemId, qty] = event.reward;
    if (!addInventory(itemId, qty)) dropGroundItem(itemId, qty, state.player.x, state.player.y);
    if (event.xp) gainXp(event.xp[0], event.xp[1]);
    state.stats.randomEventsCompleted += 1;
    state.randomEvent = null;
    scheduleNextRandomEvent();
    closeModal();
  }

  function dismissRandomEvent() {
    state.randomEvent = null;
    scheduleNextRandomEvent();
    closeModal();
    addChat("The interruption fades away.");
  }

  function spendCoins(amount) {
    if (inventoryCount("coins") < amount) return false;
    return removeItem(state.player.inventory, "coins", amount);
  }

  function equipmentBonus(kind) {
    let total = 0;
    for (const itemId of Object.values(state.player.equipment)) {
      if (!itemId) continue;
      total += ITEMS[itemId][kind] || 0;
    }
    return total;
  }

  function combatLevel() {
    const atk = getLevel("Attack");
    const str = getLevel("Strength");
    const def = getLevel("Defence");
    const hp = getLevel("Hitpoints");
    const mag = getLevel("Magic");
    const rng = getLevel("Ranged");
    return Math.floor((def + hp + Math.floor((atk + str) * 1.3) + Math.floor(Math.max(mag, rng) * 0.5)) / 4);
  }

  function initInventory() {
    addInventory("bread", 3, true);
    addInventory("coins", 45, true);
    addInventory("knife", 1, true);
    addInventory("chisel", 1, true);
    addInventory("slayer_gem", 1, true);
    addInventory("air_rune", 20, true);
    addInventory("mind_rune", 10, true);
    addInventory("air_talisman", 1, true);
    addInventory("potato_seed", 2, true);
    addInventory("empty_vial", 1, true);
    addInventory("grimy_mirthleaf", 1, true);
    addBank("logs", 8);
    addBank("feather", 30);
    addBank("bow_string", 2);
    addBank("rune_essence", 10);
    addBank("mind_talisman", 1);
    addBank("potato_seed", 4);
    addBank("mirthleaf_seed", 3);
    addBank("empty_vial", 3);
    addBank("compost", 1);
    addBank("copper_ore", 4);
    addBank("tin_ore", 4);
    addBank("gold_ore", 2);
    addBank("uncut_gem", 1);
    addBank("cooked_shrimp", 4);
  }

  function project(x, y) {
    return { x: (x - y) * HALF_W, y: (x + y) * HALF_H };
  }

  function unproject(screenX, screenY) {
    const isoX = screenX + state.camera.x - VIEW.x;
    const isoY = screenY + state.camera.y - VIEW.y;
    const a = isoX / HALF_W;
    const b = isoY / HALF_H;
    return { x: (a + b) / 2, y: (b - a) / 2 };
  }

  function screenOf(entity) {
    const p = project(entity.x, entity.y);
    return { x: VIEW.x + p.x - state.camera.x, y: VIEW.y + p.y - state.camera.y };
  }

  function updateCamera() {
    const p = project(state.player.x, state.player.y);
    state.camera.x = p.x - VIEW.w * 0.5;
    state.camera.y = p.y - VIEW.h * 0.48;
  }

  function update(dt) {
    state.time += dt;
    if (state.clickMarker) {
      state.clickMarker.time -= dt;
      if (state.clickMarker.time <= 0) state.clickMarker = null;
    }
    if (state.player.damageFlash > 0) state.player.damageFlash -= dt;
    if (state.player.respawnFlash > 0) state.player.respawnFlash -= dt;
    updateMovement(dt);
    updatePendingInteraction();
    updateAction(dt);
    updateCombat(dt);
    updateEnemies(dt);
    updateVitals(dt);
    updateGroundItems(dt);
    updateFires(dt);
    updateNpcs(dt);
    updateBarks(dt);
    updateCastleWars(dt);
    updateRandomEvents();
    updateCamera();
  }

  function updateMovement(dt) {
    const player = state.player;
    if (!player.path.length) return;
    const target = player.path[0];
    const canRun = player.run && player.runEnergy > 0;
    const speed = canRun ? 6.0 + Math.min(0.35, agilityRunBonus() * 0.008) : 3.3;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.03) {
      player.x = target.x;
      player.y = target.y;
      player.path.shift();
      return;
    }
    const step = Math.min(d, speed * dt);
    player.x += (dx / d) * step;
    player.y += (dy / d) * step;
    if (canRun) {
      player.runEnergy = Math.max(0, player.runEnergy - dt * runDrainRate());
      if (player.runEnergy <= 0) {
        player.run = false;
        addChat("You are too tired to run.");
      }
    }
  }

  function updatePendingInteraction() {
    const pending = state.player.pending;
    if (!pending || state.player.path.length) return;
    const target = getPendingTarget(pending);
    if (!target) {
      state.player.pending = null;
      return;
    }
    const range = pending.kind === "enemy" ? 1.55 : pending.kind === "scenery" ? target.interactRange || (target.width ? 2.8 : 2.05) : pending.kind === "npc" ? 2.35 : pending.kind === "resource" ? 2.35 : 1.75;
    if (dist(state.player, target) <= range) {
      state.player.pending = null;
      interactWith(pending.kind, target);
    }
  }

  function getPendingTarget(pending) {
    if (pending.kind === "npc") return state.npcs.find((npc) => npc.id === pending.id);
    if (pending.kind === "enemy") return state.enemies.find((enemy) => enemy.id === pending.id && enemy.hp > 0);
    if (pending.kind === "resource") return state.resources.find((resource) => resource.id === pending.id);
    if (pending.kind === "scenery") return state.scenery.find((obj) => obj.id === pending.id);
    if (pending.kind === "groundItem") return state.groundItems.find((item) => item.id === pending.id);
    return null;
  }

  function updateAction(dt) {
    const action = state.player.action;
    if (!action) return;
    action.progress += dt;
    if (action.progress < action.duration) return;
    finishAction(action);
  }

  function updateVitals(dt) {
    const player = state.player;
    if (!player.path.length && !player.action && !player.combatTarget) {
      player.runEnergy = Math.min(100, player.runEnergy + dt * runRestoreRate(2.4));
    } else if (!player.run) {
      player.runEnergy = Math.min(100, player.runEnergy + dt * runRestoreRate(0.6));
    }
    if (player.prayerMode !== "none") {
      player.prayerPoints = Math.max(0, player.prayerPoints - dt * 1.25);
      if (player.prayerPoints <= 0) {
        player.prayerMode = "none";
        addChat("You have run out of Prayer points.");
      }
    }
    if (player.prayerMode === "rapidHeal" && player.prayerPoints > 0 && player.hp < maxHp()) {
      player.hp = Math.min(maxHp(), player.hp + dt * 1.8);
    }
    updateBoosts(dt);
    if (state.musicOn && state.time >= state.nextMusic) {
      state.nextMusic = state.time + 9 + random() * 7;
      playJingle([220, 277, 330, 277], 0.12, "triangle", 0.025);
    }
    const nextArea = areaAt(player.x, player.y);
    if (nextArea !== state.areaName && state.time > 2) addChat(`Now entering ${nextArea}.`);
    state.areaName = nextArea;
    if (nextArea === "Low Wilderness" && !state.stats.visitedWilderness) {
      state.stats.visitedWilderness = true;
      addChat("Warning! Low Wilderness is dangerous.", "danger");
    }
    const cryptPressure = Math.max(0, (state.crypt?.awakened?.length || 0) - (state.crypt?.defeated?.length || 0));
    if (nextArea === "Old Graveyard" && cryptPressure > 0 && player.prayerPoints > 0) {
      player.prayerPoints = Math.max(0, player.prayerPoints - dt * (0.18 + cryptPressure * 0.08));
    }
  }

  function areaAt(x, y) {
    if (x < 22 && y < 28) return "Low Wilderness";
    if (x > 64 && y > 22 && y < 39) return "Castle Wars";
    if (Math.hypot(x - 66, y - 43) < 11) return "Crawler Hollow";
    if (Math.hypot(x - 62, y - 18) < 12) return "Greyrock Mine";
    if (Math.hypot(x - 52, y - 25) < 7) return "Wizard Tower";
    if (Math.hypot(x - 31, y - 24) < 7) return "Agility Yard";
    if (Math.hypot(x - 55, y - 52) < 12) return "Old Graveyard";
    if (Math.hypot(x - 28, y - 44) < 7) return "Bess's Patches";
    if (Math.hypot(x - 23, y - 53) < 9) return "Cow Field";
    if (x > 30 && x < 56 && y > 27 && y < 48) return "Boonshire";
    if (Math.hypot(x - 64, y - 64) < 11) return "Lake Mollusk";
    if (Math.hypot(x - 16, y - 18) < 10) return "Mosswood";
    return "Wilderness Road";
  }

  function updateBoosts(dt) {
    if (!activeBoosts().length) {
      state.player.boostDecay = 60;
      return;
    }
    state.player.boostDecay -= dt;
    if (state.player.boostDecay > 0) return;
    state.player.boostDecay += 60;
    for (const skill of Object.keys(state.player.boosts)) {
      if (state.player.boosts[skill] > 0) state.player.boosts[skill] -= 1;
      if (state.player.boosts[skill] <= 0) delete state.player.boosts[skill];
    }
    if (!activeBoosts().length) addChat("Your boosted stats return to normal.");
  }

  function resourceAction(resource) {
    if (resource.depleted > state.time) {
      addChat("That resource needs a moment to come back.");
      return;
    }
    if (resource.type === "essence_rock") {
      state.player.action = {
        kind: "essence",
        resourceId: resource.id,
        progress: 0,
        duration: 1.9,
      };
      addChat("You chip at the glowing essence.");
    } else if (resource.type === "tree" || resource.type === "oak_tree") {
      const level = resource.type === "oak_tree" ? 15 : 1;
      if (getLevel("Woodcutting") < level) {
        addChat(`You need Woodcutting level ${level} to cut that.`);
        return;
      }
      state.player.action = {
        kind: "woodcutting",
        resourceId: resource.id,
        progress: 0,
        duration: resource.type === "oak_tree" ? 3.0 : 2.1,
      };
      addChat(`You swing at the ${resource.type === "oak_tree" ? "oak" : "tree"}.`);
    } else if (resource.type.endsWith("_rock")) {
      const mineLevels = { copper_rock: 1, tin_rock: 1, iron_rock: 15, gold_rock: 30 };
      const level = mineLevels[resource.type] || 1;
      if (getLevel("Mining") < level) {
        addChat(`You need Mining level ${level} to mine that.`);
        return;
      }
      state.player.action = {
        kind: "mining",
        resourceId: resource.id,
        progress: 0,
        duration: resource.type === "gold_rock" ? 4.1 : resource.type === "iron_rock" ? 3.4 : 2.4,
      };
      addChat("You swing your pickaxe.");
    } else if (resource.type === "fishing_spot") {
      const level = Math.hypot(resource.x - 64, resource.y - 64) < 7 ? 20 : 1;
      if (getLevel("Fishing") < level) {
        addChat(`You need Fishing level ${level} to fish there.`);
        return;
      }
      state.player.action = {
        kind: "fishing",
        resourceId: resource.id,
        progress: 0,
        duration: level >= 20 ? 3.6 : 2.7,
      };
      addChat("You cast a small net.");
    }
  }

  function finishAction(action) {
    const resource = state.resources.find((r) => r.id === action.resourceId);
    state.player.action = null;
    if (!resource) return;
    const levelBonus = 1 + effectiveLevel(actionSkill(action.kind)) * 0.025;
    const success = random() < clamp(0.62 * levelBonus, 0.25, 0.95);
    if (!success) {
      addChat("You fail to get anything useful.");
      return;
    }
    if (action.kind === "woodcutting") {
      const oak = resource.type === "oak_tree";
      const item = oak ? "oak_logs" : "logs";
      if (!addInventory(item)) return;
      gainXp("Woodcutting", oak ? 65 : 25);
      state.stats.logsCut += 1;
      resource.depleted = state.time + (oak ? 10 : 6);
    } else if (action.kind === "mining") {
      const item = resource.type === "gold_rock" ? "gold_ore" : resource.type === "iron_rock" ? "iron_ore" : resource.type === "tin_rock" ? "tin_ore" : "copper_ore";
      if (!addInventory(item)) return;
      gainXp("Mining", item === "gold_ore" ? 80 : item === "iron_ore" ? 60 : 28);
      state.stats.oresMined += 1;
      resource.depleted = state.time + (item === "gold_ore" ? 15 : item === "iron_ore" ? 12 : 7);
    } else if (action.kind === "essence") {
      if (!addInventory("rune_essence")) return;
      gainXp("Mining", 12);
      gainXp("Runecrafting", 4);
      state.stats.essenceMined += 1;
      resource.depleted = state.time + 2.2;
    } else if (action.kind === "fishing") {
      const trout = Math.hypot(resource.x - 64, resource.y - 64) < 7;
      const item = trout ? "raw_trout" : "raw_shrimp";
      if (!addInventory(item)) return;
      gainXp("Fishing", trout ? 60 : 25);
      state.stats.fishCaught += 1;
      resource.depleted = state.time + 1.5;
    }
  }

  function actionSkill(kind) {
    if (kind === "woodcutting") return "Woodcutting";
    if (kind === "mining") return "Mining";
    if (kind === "essence") return "Mining";
    if (kind === "fishing") return "Fishing";
    return "Attack";
  }

  function updateCombat(dt) {
    const player = state.player;
    if (player.attackTimer > 0) player.attackTimer -= dt;
    if (!player.combatTarget) return;
    const enemy = state.enemies.find((e) => e.id === player.combatTarget && e.hp > 0);
    if (!enemy) {
      player.combatTarget = null;
      return;
    }
    const weapon = ITEMS[player.equipment.weapon] || {};
    const usingRanged = Boolean(weapon.ranged);
    const attackRange = usingRanged ? weapon.range || 5 : 1.75;
    if (dist(player, enemy) > attackRange) {
      moveAdjacentTo(enemy, { kind: "enemy", id: enemy.id });
      return;
    }
    player.path = [];
    if (player.attackTimer <= 0) {
      player.attackTimer = 1.8;
      const ammo = inventoryCount("broad_arrow") > 0 ? "broad_arrow" : inventoryCount("bronze_arrow") > 0 ? "bronze_arrow" : null;
      if (usingRanged && !ammo) {
        addChat("You are out of arrows.");
        player.combatTarget = null;
        return;
      }
      if (usingRanged) removeItem(state.player.inventory, ammo, 1);
      const offensiveLevel = (usingRanged ? effectiveLevel("Ranged") : effectiveLevel("Attack")) * prayerBoost("attack");
      const powerLevel = (usingRanged ? effectiveLevel("Ranged") : effectiveLevel("Strength")) * prayerBoost("strength");
      const slayerBonus = usingSlayerBoost(enemy) ? 1.16 : 1;
      const attackRoll = (offensiveLevel + equipmentBonus("attack")) * slayerBonus + random() * 12;
      const defenceRoll = enemy.defence + random() * 15;
      const maxHit = Math.max(1, Math.floor(((powerLevel + equipmentBonus("strength")) * slayerBonus) / 3) + (ammo === "broad_arrow" ? 2 : 1));
      const hit = attackRoll > defenceRoll ? Math.floor(random() * (maxHit + 1)) : 0;
      if (hit > 0) {
        enemy.hp = Math.max(0, enemy.hp - hit);
        enemy.hitFlash = 0.35;
        playSfx("hit");
        addFloatingText(enemy.x, enemy.y, `${hit}`, usingRanged ? "#a8ff9f" : "#ffdf60");
        const combatXp = Math.max(4, hit * 4);
        if (usingRanged) {
          gainXp("Ranged", combatXp);
        } else if (player.combatStyle === "balanced") {
          gainXp("Attack", combatXp / 3);
          gainXp("Strength", combatXp / 3);
          gainXp("Defence", combatXp / 3);
        } else {
          gainXp(player.combatStyle, combatXp);
        }
        gainXp("Hitpoints", Math.max(1, hit * 1.33));
      } else {
        addFloatingText(enemy.x, enemy.y, "0", "#d6d6d6");
      }
      if (enemy.hp <= 0) killEnemy(enemy);
    }
  }

  const floatingText = [];

  function addFloatingText(x, y, text, color) {
    floatingText.push({ x, y, text, color, age: 0 });
  }

  function killEnemy(enemy) {
    if (enemy.finisher) {
      if (inventoryCount(enemy.finisher) <= 0) {
        enemy.hp = Math.max(1, Math.ceil(enemy.maxHp * 0.08));
        state.player.combatTarget = null;
        addFloatingText(enemy.x, enemy.y, ITEMS[enemy.finisher].icon || "!", "#ffffff");
        addChat(`The ${enemy.name} needs ${ITEMS[enemy.finisher].name.toLowerCase()} to finish it.`);
        return;
      }
      removeItem(state.player.inventory, enemy.finisher, 1);
      addChat(`You use ${ITEMS[enemy.finisher].name.toLowerCase()} to finish the ${enemy.name}.`);
    }
    addChat(`You defeat the ${enemy.name}.`);
    enemy.respawnTimer = enemy.respawn;
    enemy.hp = 0;
    state.player.combatTarget = null;
    state.stats.chickensSlain += enemy.type === "chicken" ? 1 : 0;
    state.stats.goblinsSlain += enemy.type === "field_imp" ? 1 : 0;
    state.stats.darkWizardsSlain += enemy.type === "dark_wizard" ? 1 : 0;
    state.stats.deepWightsSlain += enemy.type === "deep_wight" ? 1 : 0;
    state.stats.lesserDemonsSlain += enemy.type === "lesser_demon" ? 1 : 0;
    for (const [itemId, qty, chance] of enemy.loot) {
      if (random() < chance) dropGroundItem(itemId, qty, enemy.x, enemy.y);
    }
    if (random() < 0.025 + enemy.level * 0.001) dropGroundItem("clue_scroll", 1, enemy.x, enemy.y);
    handleCryptWightDefeat(enemy);
    handleSlayerKill(enemy);
    if (enemy.type === "grave_skeleton" && state.quests.restlessBones.state === "started") addChat("The priest will like those bones.");
  }

  function handleSlayerKill(enemy) {
    const task = state.slayer.task;
    if (!task || task.type !== enemy.slayerType) return;
    task.remaining -= 1;
    gainXp("Slayer", Math.max(15, enemy.level * 4));
    addChat(`Slayer task: ${task.remaining} ${task.label} left.`);
    if (task.remaining <= 0) {
      state.slayer.streak += 1;
      state.stats.slayerTasksCompleted += 1;
      state.slayer.points += 2 + Math.floor(state.slayer.streak / 5);
      const coins = 50 + state.slayer.streak * 15;
      addInventory("coins", coins);
      if (random() < 0.35) addInventory("clue_scroll", 1);
      gainXp("Slayer", 80 + enemy.level * 6);
      addChat(`Task complete. Slayer streak ${state.slayer.streak}.`);
      state.slayer.task = null;
    }
  }

  function updateEnemies(dt) {
    for (const enemy of state.enemies) {
      if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
      if (enemy.hp <= 0) {
        enemy.respawnTimer -= dt;
        if (enemy.respawnTimer <= 0) {
          enemy.x = enemy.spawnX;
          enemy.y = enemy.spawnY;
          enemy.hp = enemy.maxHp;
          enemy.attackTimer = random() * 1.5;
        }
        continue;
      }
      enemy.attackTimer -= dt;
      const d = dist(enemy, state.player);
      if (d < enemy.aggro || state.player.combatTarget === enemy.id) {
        if (d > 1.4) {
          const dx = (state.player.x - enemy.x) / d;
          const dy = (state.player.y - enemy.y) / d;
          const nx = enemy.x + dx * dt * 1.25;
          const ny = enemy.y + dy * dt * 1.25;
          if (walkable(Math.floor(nx), Math.floor(ny))) {
            enemy.x = nx;
            enemy.y = ny;
          }
        } else if (enemy.attackTimer <= 0) {
          enemy.attackTimer = 2.2;
          const defence = effectiveLevel("Defence") * prayerBoost("defence") + equipmentBonus("defence");
          const wildBoost = areaAt(enemy.x, enemy.y) === "Low Wilderness" ? 1.12 : 1;
          const roll = enemy.attack * wildBoost + random() * 12;
          const block = defence + random() * 16;
          const hit = roll > block ? Math.floor(random() * (enemy.strength * wildBoost / 2 + 3)) : 0;
          if (hit > 0) {
            state.player.hp = Math.max(0, state.player.hp - hit);
            state.player.damageFlash = 0.4;
            addFloatingText(state.player.x, state.player.y, `${hit}`, "#ff5858");
            if (state.player.hp <= 0) playerDeath();
          } else {
            addFloatingText(state.player.x, state.player.y, "0", "#efefef");
          }
        }
      } else {
        enemy.wanderTimer -= dt;
        if (enemy.wanderTimer <= 0) {
          enemy.wanderTimer = 1.5 + random() * 4;
          enemy.wanderDx = random() * 2 - 1;
          enemy.wanderDy = random() * 2 - 1;
        }
        const homeD = Math.hypot(enemy.x - enemy.spawnX, enemy.y - enemy.spawnY);
        let dx = enemy.wanderDx;
        let dy = enemy.wanderDy;
        if (homeD > 4) {
          dx = enemy.spawnX - enemy.x;
          dy = enemy.spawnY - enemy.y;
        }
        const l = Math.hypot(dx, dy) || 1;
        const nx = enemy.x + (dx / l) * dt * 0.55;
        const ny = enemy.y + (dy / l) * dt * 0.55;
        if (walkable(Math.floor(nx), Math.floor(ny))) {
          enemy.x = nx;
          enemy.y = ny;
        }
      }
    }
    for (let i = floatingText.length - 1; i >= 0; i -= 1) {
      floatingText[i].age += dt;
      if (floatingText[i].age > 1.2) floatingText.splice(i, 1);
    }
  }

  function updateNpcs(dt) {
    for (const npc of state.npcs) {
      if (dist(npc, state.player) < 7 && random() < dt * 0.004) {
        const lines = {
          banker: ["No refunds on lost dignity.", "Bank space is character."],
          shop: ["Fresh bread, stale prices.", "Coins first, questions later."],
          cook: ["Nothing says feast like shrimp."],
          priest: ["Bones remember.", "Mind the graveyard."],
          smith: ["Hot metal and poor decisions."],
          slayer: ["Tasks build character.", "Bring me proof, not excuses."],
          guide: ["Roads are safer. Mostly."],
          fisher: ["The trout know your name."],
          apothecary: ["Freshly labelled. Mostly.", "Drink responsibly, then irresponsibly."],
          fletcher: ["Straight shafts, straight profit."],
          gardener: ["Water once. Wait forever.", "Compost cures many sins."],
          wizard: ["Essence hums. So do unpaid apprentices.", "Mind the altar sparks."],
          squire: ["Take the flag. Bring it back. Simple until it isn't.", "Tickets buy lovely pointless armour."],
          guard: ["Keep the peace."],
        };
        addBark(npc, choice(lines[npc.role] || ["Lovely weather."]));
      }
      if (!npc.patrol) continue;
      npc.wander -= dt;
      if (npc.wander <= 0) {
        npc.wander = 2 + random() * 4;
        const target = choice([
          { x: 39, y: 37 },
          { x: 43, y: 39 },
          { x: 37, y: 39 },
          { x: 40, y: 41 },
        ]);
        npc.path = findPath(Math.floor(npc.x), Math.floor(npc.y), target.x, target.y);
      }
      if (npc.path?.length) {
        const target = npc.path[0];
        const dx = target.x - npc.x;
        const dy = target.y - npc.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.04) npc.path.shift();
        else {
          npc.x += (dx / d) * Math.min(d, dt * 1.2);
          npc.y += (dy / d) * Math.min(d, dt * 1.2);
        }
      }
    }
  }

  function addBark(actor, text) {
    state.barks = state.barks.filter((bark) => bark.actorId !== actor.id);
    state.barks.push({ actorId: actor.id, text, ttl: 3.2 });
  }

  function updateBarks(dt) {
    for (let i = state.barks.length - 1; i >= 0; i -= 1) {
      state.barks[i].ttl -= dt;
      if (state.barks[i].ttl <= 0) state.barks.splice(i, 1);
    }
  }

  function updateGroundItems(dt) {
    for (let i = state.groundItems.length - 1; i >= 0; i -= 1) {
      const item = state.groundItems[i];
      item.ttl -= dt;
      if (item.ttl <= 0) state.groundItems.splice(i, 1);
    }
  }

  function updateFires(dt) {
    for (let i = state.fires.length - 1; i >= 0; i -= 1) {
      state.fires[i].ttl -= dt;
      if (state.fires[i].ttl <= 0) state.fires.splice(i, 1);
    }
  }

  function dropGroundItem(itemId, qty, x, y) {
    const data = ITEMS[itemId];
    if (!data) return;
    const tileX = Math.floor(x) + 0.5 + (random() - 0.5) * 0.45;
    const tileY = Math.floor(y) + 0.5 + (random() - 0.5) * 0.45;
    const stack = data.stackable
      ? state.groundItems.find((item) => item.itemId === itemId && Math.hypot(item.x - tileX, item.y - tileY) < 0.8)
      : null;
    if (stack) {
      stack.qty += qty;
      stack.ttl = 160;
    } else {
      state.groundItems.push({
        id: `ground-${state.time.toFixed(2)}-${state.groundItems.length}-${Math.floor(random() * 9999)}`,
        itemId,
        qty,
        x: tileX,
        y: tileY,
        ttl: 160,
      });
    }
    playSfx("loot");
    addChat(`${formatItem(itemId, qty)} drops to the ground.`, "loot");
  }

  function pickupGroundItem(item) {
    if (dist(state.player, item) > 1.65) {
      moveToTile(Math.floor(item.x), Math.floor(item.y), { kind: "groundItem", id: item.id });
      return;
    }
    if (!addInventory(item.itemId, item.qty, true)) return;
    state.groundItems = state.groundItems.filter((ground) => ground.id !== item.id);
    addChat(`You pick up ${formatItem(item.itemId, item.qty)}.`, "loot");
  }

  function playerDeath() {
    addChat("Oh dear, you are dead.");
    state.player.x = 39;
    state.player.y = 39;
    state.player.path = [];
    state.player.pending = null;
    state.player.action = null;
    state.player.combatTarget = null;
    state.player.hp = maxHp();
    state.player.respawnFlash = 1.5;
    if (state.crypt?.awakened?.length) {
      state.crypt.awakened = [];
      state.crypt.defeated = [];
      state.enemies = state.enemies.filter((enemy) => !enemy.cryptBrother);
      addChat("The crypt seals reset while you recover.");
    }
  }

  function interactWith(kind, target) {
    if (kind === "npc") openNpc(target);
    else if (kind === "enemy") {
      state.modal = null;
      state.player.action = null;
      state.player.combatTarget = target.id;
      addChat(`You attack the ${target.name}.`);
    } else if (kind === "resource") {
      state.modal = null;
      resourceAction(target);
    } else if (kind === "scenery") {
      useScenery(target);
    } else if (kind === "groundItem") {
      pickupGroundItem(target);
    }
  }

  function approachOrAttackEnemy(enemy) {
    const weapon = ITEMS[state.player.equipment.weapon] || {};
    if (weapon.ranged && dist(state.player, enemy) <= (weapon.range || 5)) {
      interactWith("enemy", enemy);
    } else {
      moveAdjacentTo(enemy, { kind: "enemy", id: enemy.id });
    }
  }

  function openNpc(npc) {
    state.player.combatTarget = null;
    if (npc.role === "banker") {
      openDialogue(npc.name, ["Good day. Your dusty valuables are safe with us."], [
        { label: "Access bank", action: () => openBank() },
        { label: "Never mind", action: () => closeModal() },
      ]);
    } else if (npc.role === "shop") {
      openDialogue(npc.name, ["Buying? Selling? Pretending to be rich? All welcome."], [
        { label: "Trade", action: () => openShop() },
        { label: "Ask about the town", action: () => addChat("The shopkeeper points at every grindable activity in sight.") },
        { label: "Close", action: () => closeModal() },
      ]);
    } else if (npc.role === "cook") {
      cookDialogue(npc);
    } else if (npc.role === "priest") {
      priestDialogue(npc);
    } else if (npc.role === "smith") {
      smithDialogue(npc);
    } else if (npc.role === "slayer") {
      slayerDialogue(npc);
    } else if (npc.role === "apothecary") {
      openDialogue(npc.name, ["Potions for short-lived heroism. Side effects include confidence."], [
        { label: "Buy potions", action: () => openPotionShop() },
        { label: "Ask about boosts", action: () => addChat("Potion boosts decay slowly. Bring one before scary tasks.") },
        { label: "Close", action: () => closeModal() },
      ]);
    } else if (npc.role === "fletcher") {
      fletcherDialogue(npc);
    } else if (npc.role === "gardener") {
      gardenerDialogue(npc);
    } else if (npc.role === "wizard") {
      wizardDialogue(npc);
    } else if (npc.role === "squire") {
      castleSquireDialogue(npc);
    } else if (npc.role === "fisher") {
      openDialogue(npc.name, ["Small net for shrimp by the bridge. Higher levels can fish trout at the lake. I also row shortcuts for coin."], [
        { label: "To Lake Mollusk - 12gp", action: () => travelTo(63.5, 62.5, 12, "Lake Mollusk") },
        { label: "To Greyrock Mine - 18gp", action: () => travelTo(60.5, 20.5, 18, "Greyrock Mine") },
        { label: "To Wilderness ditch - 25gp", action: () => travelTo(25.5, 32.5, 25, "the Wilderness ditch") },
        { label: "Close", action: () => closeModal() },
      ]);
    } else if (npc.role === "guide") {
      openDialogue(npc.name, [
        "Click the ground to walk. Click creatures to fight. Skills are slow, numbers go up, and everyone pretends this is healthy.",
      ], [
        { label: "Where do I start?", action: () => addChat("Try Cook's Errand, mine ore, or ask the Slayer Master for a task.") },
        { label: "Open world map", action: () => openWorldMap() },
        { label: "Close", action: () => closeModal() },
      ]);
    } else {
      openDialogue(npc.name, ["Stay on the roads and keep an eye on your Hitpoints."], [{ label: "Close", action: () => closeModal() }]);
    }
  }

  function castleSquireDialogue(npc) {
    const cw = state.castleWars;
    const lines = cw.active
      ? [`Match running: Boon ${cw.score} - Rival ${cw.enemyScore}.`, cw.flagHeld ? "You have their flag. Bring it home." : "Steal the rival flag and return to yours."]
      : [`Tickets owned: ${inventoryCount("castle_ticket")}.`, "Fancy a game of flags, bandages, and selective memory?"];
    openDialogue(npc.name, lines, [
      { label: cw.active ? "Return to battlements" : "Join Castle Wars", action: () => startCastleWars() },
      { label: "Rewards shop", action: () => openCastleShop() },
      { label: "How does this work?", action: () => addChat("Squire says: take the rival flag, click your flag to score, first to three wins.") },
      { label: "Close", action: () => closeModal() },
    ]);
  }

  function wizardDialogue(npc) {
    const quest = state.quests.runeMysteries;
    const choices = [
      { label: "Trade rune supplies", action: () => openWizardShop() },
      { label: "Ask about essence", action: () => addChat("Elric says: mine essence in the tower, carry a talisman, then use an altar.") },
      { label: "Close", action: () => closeModal() },
    ];
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The stones are humming again. Craft ten runes and I will admit that you are minimally mystical."], [
        {
          label: "Start Rune Mysteries",
          action: () => {
            quest.state = "started";
            addInventory("rune_essence", 10);
            addInventory("air_talisman", 1);
            addChat("Quest started: Rune Mysteries.");
            closeModal();
          },
        },
        ...choices,
      ]);
    } else if (quest.state === "started") {
      const ready = state.stats.runesCrafted >= 10;
      openDialogue(npc.name, [ready ? "Those runes are crude, but undeniably runes." : `Runes crafted: ${state.stats.runesCrafted}/10.`], [
        {
          label: ready ? "Complete quest" : "Keep crafting",
          action: () => {
            if (ready) {
              quest.state = "completed";
              addInventory("rune_pouch", 1);
              addInventory("mind_talisman", 1);
              addInventory("rune_essence", 12);
              gainXp("Runecrafting", 160);
              gainXp("Magic", 80);
              addChat("Quest complete: Rune Mysteries.");
            }
            closeModal();
          },
        },
        ...choices.slice(0, 2),
      ]);
    } else {
      openDialogue(npc.name, ["The tower hums, your pouch hums, and nobody has filed a safety report."], choices);
    }
  }

  function gardenerDialogue(npc) {
    const quest = state.quests.gardenTrouble;
    const supplyChoices = [
      { label: state.farmingContract ? "Deliver farming contract" : "Ask for farming contract", action: () => handleFarmingContract() },
      { label: "Trade gardening supplies", action: () => openGardenerShop() },
      { label: "Ask about patches", action: () => addChat("Bess says: plant seeds, water once, wait, then harvest. Compost cures disease.") },
      { label: "Close", action: () => closeModal() },
    ];
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["My patches are cursed by neglect. Harvest any crop and mix your own potion so I know you can follow instructions."], [
        {
          label: "Start Garden Trouble",
          action: () => {
            quest.state = "started";
            addChat("Quest started: Garden Trouble.");
            closeModal();
          },
        },
        ...supplyChoices,
      ]);
    } else if (quest.state === "started") {
      const ready = state.stats.cropsHarvested > 0 && state.stats.potionsMixed > 0;
      openDialogue(npc.name, [
        ready ? "You smell like earth and bottled ambition. Perfect." : `Harvested crops: ${state.stats.cropsHarvested}. Potions mixed: ${state.stats.potionsMixed}.`,
      ], [
        {
          label: ready ? "Complete quest" : "Keep gardening",
          action: () => {
            if (ready) {
              quest.state = "completed";
              addInventory("coins", 180);
              addInventory("mirthleaf_seed", 3);
              addInventory("compost", 2);
              gainXp("Farming", 180);
              gainXp("Herblore", 120);
              addChat("Quest complete: Garden Trouble.");
            }
            closeModal();
          },
        },
        ...supplyChoices.slice(0, 3),
      ]);
    } else {
      openDialogue(npc.name, ["The patches are still needy, but at least now they respect you."], supplyChoices);
    }
  }

  function handleFarmingContract() {
    if (!state.farmingContract) {
      const canHerb = getLevel("Farming") >= FARM_CROPS.mirthleaf.level;
      const cropId = canHerb && random() > 0.45 ? "mirthleaf" : "potato";
      const crop = FARM_CROPS[cropId];
      const amount = cropId === "mirthleaf" ? 2 + Math.floor(random() * 3) : 4 + Math.floor(random() * 4);
      state.farmingContract = { crop: cropId, product: crop.product, amount, label: ITEMS[crop.product].name };
      addChat(`Bess contract: bring ${formatItem(crop.product, amount)}.`);
      closeModal();
      return;
    }
    const contract = state.farmingContract;
    if (inventoryCount(contract.product) < contract.amount) {
      addChat(`Farming contract: bring ${formatItem(contract.product, contract.amount)}.`);
      closeModal();
      return;
    }
    removeItem(state.player.inventory, contract.product, contract.amount);
    const herbContract = contract.crop === "mirthleaf";
    addInventory("coins", herbContract ? 95 : 45);
    addInventory(herbContract ? "mirthleaf_seed" : "potato_seed", herbContract ? 2 : 4);
    if (random() > 0.45) addInventory("compost", 1);
    gainXp("Farming", herbContract ? 90 : 45);
    state.stats.farmingContractsCompleted += 1;
    state.farmingContract = null;
    addChat("Farming contract complete.", "loot");
    closeModal();
  }

  function cookDialogue(npc) {
    const quest = state.quests.cooksErrand;
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The banquet is ruined. I need cooked shrimp and logs for the range."], [
        {
          label: "Start Cook's Errand",
          action: () => {
            quest.state = "started";
            addChat("Quest started: Cook's Errand.");
            closeModal();
          },
        },
        { label: "Maybe later", action: () => closeModal() },
      ]);
    } else if (quest.state === "started") {
      const ready = inventoryCount("cooked_shrimp") >= 1 && inventoryCount("logs") >= 1;
      openDialogue(npc.name, [ready ? "That smells edible. Hand it over." : "Cook shrimp on a range and cut a normal log."], [
        {
          label: ready ? "Complete quest" : "I'll return",
          action: () => {
            if (ready) {
              removeItem(state.player.inventory, "cooked_shrimp", 1);
              removeItem(state.player.inventory, "logs", 1);
              addInventory("coins", 90);
              gainXp("Cooking", 150);
              gainXp("Woodcutting", 80);
              quest.state = "completed";
              addChat("Quest complete: Cook's Errand.");
            }
            closeModal();
          },
        },
      ]);
    } else {
      openDialogue(npc.name, ["Still not burnt. A miracle."], [{ label: "Close", action: () => closeModal() }]);
    }
  }

  function priestDialogue(npc) {
    const quest = state.quests.restlessBones;
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The graveyard rattles. Bury five sets of bones and I may sleep again."], [
        {
          label: "Start Restless Bones",
          action: () => {
            quest.state = "started";
            state.stats.bonesBuried = 0;
            addChat("Quest started: Restless Bones.");
            closeModal();
          },
        },
        { label: "Close", action: () => closeModal() },
      ]);
    } else if (quest.state === "started") {
      const ready = state.stats.bonesBuried >= 5;
      openDialogue(npc.name, [`Bones buried: ${state.stats.bonesBuried}/5.`], [
        {
          label: ready ? "Claim reward" : "Keep burying",
          action: () => {
            if (ready) {
              quest.state = "completed";
              addInventory("coins", 120);
              gainXp("Prayer", 220);
              addChat("Quest complete: Restless Bones.");
            }
            closeModal();
          },
        },
      ]);
    } else {
      openDialogue(npc.name, ["The graveyard is quieter now. The crypts, less so."], [
        { label: "Ask about crypts", action: () => addChat(`Brother Alden says: wake each crypt brother, survive, then loot the chest. ${cryptStatusText()}.`) },
        { label: "Close", action: () => closeModal() },
      ]);
    }
  }

  function smithDialogue(npc) {
    const quest = state.quests.copperPromise;
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["Bring me one bronze bar and I'll certify you as dangerously competent."], [
        {
          label: "Start The Copper Promise",
          action: () => {
            quest.state = "started";
            addChat("Quest started: The Copper Promise.");
            closeModal();
          },
        },
        { label: "Use furnace", action: () => useScenery({ action: "smelt", name: "Furnace" }) },
        { label: "Close", action: () => closeModal() },
      ]);
    } else if (quest.state === "started") {
      const ready = inventoryCount("bronze_bar") >= 1;
      openDialogue(npc.name, [ready ? "That bar is almost rectangular. Excellent." : "Copper plus tin at the furnace. Do not eat it."], [
        {
          label: ready ? "Complete quest" : "Close",
          action: () => {
            if (ready) {
              removeItem(state.player.inventory, "bronze_bar", 1);
              addInventory("bronze_helm", 1);
              gainXp("Smithing", 180);
              quest.state = "completed";
              addChat("Quest complete: The Copper Promise.");
            }
            closeModal();
          },
        },
      ]);
    } else {
      openDialogue(npc.name, ["The anvil misses you."], [
        { label: "Use anvil", action: () => useScenery({ action: "smith", name: "Anvil" }) },
        { label: "Close", action: () => closeModal() },
      ]);
    }
  }

  function fletcherDialogue(npc) {
    const quest = state.quests.fletchersOrder;
    const supplyChoices = [
      { label: "Trade fletching supplies", action: () => openFletcherShop() },
      { label: "Ask about arrows", action: () => addChat("Use a knife on logs for shafts. Hammer bronze bars near the anvil for tips.") },
      { label: "Close", action: () => closeModal() },
    ];
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The guard ordered arrows, then forgot to pay me. Bring 15 bronze arrows and I will make it worth your while."], [
        {
          label: "Start Fletcher's Order",
          action: () => {
            quest.state = "started";
            addChat("Quest started: Fletcher's Order.");
            closeModal();
          },
        },
        ...supplyChoices,
      ]);
    } else if (quest.state === "started") {
      const ready = inventoryCount("bronze_arrow") >= 15;
      openDialogue(npc.name, [ready ? "Those arrows are straight enough for guard work." : "Shafts, feathers, bronze tips. Fifteen arrows will do."], [
        {
          label: ready ? "Complete quest" : "Keep fletching",
          action: () => {
            if (ready) {
              removeItem(state.player.inventory, "bronze_arrow", 15);
              addInventory("coins", 160);
              addInventory("bow_string", 2);
              gainXp("Fletching", 220);
              quest.state = "completed";
              addChat("Quest complete: Fletcher's Order.");
            }
            closeModal();
          },
        },
        ...supplyChoices.slice(0, 2),
      ]);
    } else {
      openDialogue(npc.name, ["The guard now has arrows and still no aim. Such is public service."], supplyChoices);
    }
  }

  function slayerDialogue(npc) {
    const task = state.slayer.task;
    const wightQuest = state.quests.wightHunt;
    const lines = task
      ? [`Your task is to kill ${task.remaining} more ${task.label}.`, `Streak: ${state.slayer.streak}. Points: ${state.slayer.points}.`]
      : ["No task. That means you are currently wasting perfectly good violence."];
    const choices = [
      {
        label: task ? "Ask about task" : "Get Slayer assignment",
        action: () => {
          if (!state.slayer.task) assignSlayerTask();
          else addChat(`The Slayer gem hums: ${task.remaining} ${task.label} left.`);
          closeModal();
        },
      },
      {
        label: "Cancel task for 1 point",
        action: () => {
          if (state.slayer.points >= 1 && state.slayer.task) {
            state.slayer.points -= 1;
            state.slayer.task = null;
            addChat("Your Slayer task is cancelled.");
          } else addChat("You cannot cancel right now.");
          closeModal();
        },
      },
      {
        label: "Rewards shop",
        action: () => openSlayerShop(),
      },
      {
        label: "Monster codex",
        action: () => openBestiary(),
      },
    ];
    if (wightQuest.state === "not-started") {
      choices.push({
        label: "Wight hunt",
        action: () => {
          wightQuest.state = "started";
          state.stats.deepWightsSlain = 0;
          addChat("Quest started: Wight in the Hollow.");
          closeModal();
        },
      });
    } else if (wightQuest.state === "started") {
      choices.push({
        label: state.stats.deepWightsSlain > 0 ? "Claim wight reward" : "Ask about wight",
        action: () => {
          if (state.stats.deepWightsSlain > 0) {
            wightQuest.state = "completed";
            state.slayer.points += 3;
            addInventory("clue_scroll", 1);
            gainXp("Slayer", 300);
            addChat("Quest complete: Wight in the Hollow.");
          } else addChat("Vann points toward Crawler Hollow: kill the Deep wight.");
          closeModal();
        },
      });
    }
    choices.push({ label: "Close", action: () => closeModal() });
    openDialogue(npc.name, lines, choices);
  }

  function openSlayerShop() {
    state.modal = {
      type: "shop",
      title: "Slayer Rewards",
      currency: "slayer",
      rects: [],
      stock: [
        { id: "broad_arrow", price: 1, qty: 35 },
        { id: "bag_of_salt", price: 1, qty: 20 },
        { id: "clue_scroll", price: 2 },
        { id: "amulet_of_accuracy", price: 3 },
        { id: "slayer_helm", price: 5 },
      ],
    };
  }

  function assignSlayerTask() {
    const slayer = getLevel("Slayer");
    const combat = combatLevel();
    const pool = [
      { type: "giant_rat", label: "giant rats", amount: 6, minCombat: 1, xp: 30 },
      { type: "chicken", label: "chickens", amount: 7, minCombat: 1, xp: 22 },
      { type: "pasture_cow", label: "pasture cows", amount: 6, minCombat: 1, xp: 28 },
      { type: "field_imp", label: "field imps", amount: 8, minCombat: 4, xp: 45 },
      { type: "grave_skeleton", label: "grave skeletons", amount: 8, minCombat: 10, xp: 75 },
      { type: "salt_slug", label: "salt slugs", amount: 8, minCombat: 12, xp: 80 },
      { type: "cave_crawler", label: "cave crawlers", amount: 10, minCombat: 12, xp: 95 },
      { type: "dark_wizard", label: "dark wizards", amount: 7, minCombat: 18, xp: 110 },
      { type: "moss_brute", label: "moss brutes", amount: 6, minCombat: 24, xp: 140 },
      { type: "black_knight", label: "black knights", amount: 5, minCombat: 28, xp: 175 },
      { type: "deep_wight", label: "deep wights", amount: 3, minCombat: 30, xp: 220 },
      { type: "lesser_demon", label: "lesser demons", amount: 2, minCombat: 38, xp: 260 },
    ].filter((task) => combat >= task.minCombat || slayer >= Math.floor(task.minCombat / 2));
    const task = choice(pool);
    state.slayer.task = { ...task, remaining: task.amount + Math.floor(random() * 4) };
    gainXp("Slayer", Math.max(5, Math.floor(task.xp / 4)));
    addChat(`New Slayer task: kill ${state.slayer.task.remaining} ${state.slayer.task.label}.`);
  }

  function openDialogue(name, lines, choices) {
    state.modal = { type: "dialogue", name, lines, choices, rects: [] };
  }

  function openBank() {
    ensureSlots(state.player.bank, 48);
    state.modal = { type: "bank", rects: [] };
    state.tab = "inventory";
    state.stats.bankUses += 1;
  }

  function openShop() {
    state.modal = {
      type: "shop",
      title: "General Store",
      rects: [],
      stock: [
        { id: "bread", price: 8 },
        { id: "bronze_sword", price: 30 },
        { id: "shortbow", price: 58 },
        { id: "bronze_arrow", price: 22, qty: 25 },
        { id: "knife", price: 13 },
        { id: "chisel", price: 18 },
        { id: "bag_of_salt", price: 6, qty: 10 },
        { id: "feather", price: 15, qty: 30 },
        { id: "bow_string", price: 24 },
        { id: "wooden_shield", price: 24 },
        { id: "leather_body", price: 80 },
        { id: "raw_shrimp", price: 5 },
        { id: "air_rune", price: 5, qty: 10 },
        { id: "mind_rune", price: 4, qty: 10 },
        { id: "chaos_rune", price: 55, qty: 3 },
        { id: "energy_potion", price: 38 },
      ],
    };
  }

  function openPotionShop() {
    state.modal = {
      type: "shop",
      title: "Apothecary",
      rects: [],
      stock: [
        { id: "attack_potion", price: 48 },
        { id: "strength_potion", price: 58 },
        { id: "defence_potion", price: 54 },
        { id: "energy_potion", price: 36 },
        { id: "ranging_potion", price: 88 },
        { id: "magic_potion", price: 94 },
        { id: "empty_vial", price: 12, qty: 2 },
      ],
    };
  }

  function openFletcherShop() {
    state.modal = {
      type: "shop",
      title: "Fletcher's Stall",
      rects: [],
      stock: [
        { id: "knife", price: 12 },
        { id: "feather", price: 14, qty: 30 },
        { id: "bow_string", price: 24 },
        { id: "bronze_arrowtips", price: 24, qty: 15 },
        { id: "shortbow", price: 58 },
        { id: "bronze_arrow", price: 20, qty: 25 },
      ],
    };
  }

  function openGardenerShop() {
    state.modal = {
      type: "shop",
      title: "Bess's Barrow",
      rects: [],
      stock: [
        { id: "potato_seed", price: 12, qty: 4 },
        { id: "mirthleaf_seed", price: 28, qty: 3 },
        { id: "compost", price: 18, qty: 2 },
        { id: "empty_vial", price: 12, qty: 3 },
        { id: "vial_of_water", price: 16, qty: 2 },
        { id: "potato", price: 10, qty: 2 },
      ],
    };
  }

  function openWizardShop() {
    state.modal = {
      type: "shop",
      title: "Wizard Tower",
      rects: [],
      stock: [
        { id: "rune_essence", price: 18, qty: 8 },
        { id: "air_talisman", price: 55 },
        { id: "mind_talisman", price: 70 },
        { id: "chaos_talisman", price: 260 },
        { id: "law_talisman", price: 360 },
        { id: "air_rune", price: 5, qty: 20 },
        { id: "mind_rune", price: 4, qty: 20 },
      ],
    };
  }

  function openCastleShop() {
    state.modal = {
      type: "shop",
      title: "Castle Wars Rewards",
      currency: "castle",
      rects: [],
      stock: [
        { id: "castle_bandage", price: 1, qty: 3 },
        { id: "decorative_helm", price: 3 },
        { id: "decorative_shield", price: 4 },
        { id: "decorative_sword", price: 5 },
        { id: "decorative_platebody", price: 7 },
      ],
    };
  }

  function openCollectionLog() {
    state.modal = { type: "collection", rects: [] };
  }

  function openSkillGuide(skill) {
    state.modal = { type: "skillGuide", skill, rects: [] };
  }

  function closeModal() {
    if (state.modal?.type === "dialogue" && state.randomEvent) {
      state.randomEvent = null;
      scheduleNextRandomEvent();
    }
    state.modal = null;
  }

  function useScenery(obj) {
    const action = obj.action;
    if (action === "bank") openBank();
    else if (action === "shop") openShop();
    else if (action === "cook") cookBestRawFish();
    else if (action === "pray") {
      state.player.hp = maxHp();
      state.player.prayerPoints = maxPrayer();
      addChat("You restore your Prayer points.");
    } else if (action === "smelt") smelt();
    else if (action === "smith") smith();
    else if (action === "slayer") {
      const master = state.npcs.find((npc) => npc.role === "slayer");
      slayerDialogue(master);
    } else if (action === "cave") addChat("A chill rises from the cave. The Deep wight waits beyond the crawlers.");
    else if (action === "quests") {
      state.tab = "quests";
      addChat("The noticeboard lists the town's problems.");
    } else if (action === "fish") {
      const spot = nearestResource("fishing_spot");
      if (spot) resourceAction(spot);
    } else if (action === "steal") {
      stealFromStall(obj);
    } else if (action === "agility") {
      attemptAgility(obj);
    } else if (action === "fletch") {
      fletchBest(true);
    } else if (action === "farm") {
      useFarmPatch(obj);
    } else if (action === "compost") {
      useCompostBin();
    } else if (action === "water") {
      fillEmptyVial();
    } else if (action === "runecraft") {
      craftRunes(obj);
    } else if (action === "crypt") {
      summonCryptBrother(obj);
    } else if (action === "crypt_chest") {
      openCryptChest();
    } else if (action === "castle_wars") {
      startCastleWars();
    } else if (action === "castle_flag") {
      handleCastleFlag(obj);
    } else if (action === "castle_supply") {
      useCastleSupply();
    } else if (action === "castle_scoreboard") {
      addChat(castleWarsScoreText());
    } else if (action === "wildy") {
      addChat("The ditch marks Low Wilderness. Everything there hits harder.", "danger");
    } else if (action === "chaos_altar") {
      state.player.prayerPoints = maxPrayer();
      state.player.hp = Math.min(maxHp(), state.player.hp + 15);
      addChat("Chaotic energy restores your Prayer.");
    } else addChat(`You examine the ${obj.name}.`);
  }

  function nearestResource(type) {
    return state.resources
      .filter((r) => r.type === type)
      .sort((a, b) => dist(a, state.player) - dist(b, state.player))[0];
  }

  function castleWarsScoreText() {
    const cw = state.castleWars;
    if (!cw.active) return `Castle Wars idle. Tickets: ${inventoryCount("castle_ticket")}.`;
    const seconds = Math.max(0, Math.ceil(cw.endsAt - state.time));
    return `Castle Wars ${cw.score}-${cw.enemyScore}, ${seconds}s left${cw.flagHeld ? ", rival flag held" : ""}.`;
  }

  function startCastleWars() {
    normalizeCastleWarsState();
    if (!state.castleWars.active) {
      state.castleWars = {
        active: true,
        score: 0,
        enemyScore: 0,
        flagHeld: false,
        endsAt: state.time + 150,
        nextEnemyScore: state.time + 45,
        supplyReadyAt: 0,
        lastReward: null,
      };
      state.stats.castleWarsPlayed += 1;
      gainXp("Agility", 35);
      gainXp("Hitpoints", 25);
      addChat("Castle Wars begins. Capture three flags or outscore the rival team.", "loot");
    } else {
      addChat(castleWarsScoreText());
    }
    state.player.x = 68.5;
    state.player.y = 28.5;
    state.player.path = [];
    state.player.pending = null;
    state.player.combatTarget = null;
    closeModal();
  }

  function updateCastleWars() {
    const cw = state.castleWars;
    if (!cw.active) return;
    if (state.time >= cw.nextEnemyScore) {
      cw.enemyScore += 1;
      cw.nextEnemyScore = state.time + 45 + random() * 18;
      addChat(`Rival team scores. ${castleWarsScoreText()}`, "danger");
    }
    if (cw.score >= 3 || cw.enemyScore >= 3 || state.time >= cw.endsAt) {
      endCastleWars(cw.score > cw.enemyScore ? "win" : cw.score === cw.enemyScore ? "draw" : "loss");
    }
  }

  function endCastleWars(result) {
    const cw = state.castleWars;
    if (!cw.active) return;
    const tickets = Math.max(1, cw.score * 2 + (result === "win" ? 3 : result === "draw" ? 2 : 1));
    addInventory("castle_ticket", tickets);
    if (result === "win") state.stats.castleWarsWon += 1;
    cw.lastReward = `${tickets} tickets`;
    cw.active = false;
    cw.flagHeld = false;
    cw.endsAt = 0;
    cw.nextEnemyScore = 0;
    gainXp("Agility", 70 + cw.score * 35);
    gainXp("Defence", 55 + cw.score * 20);
    addChat(`Castle Wars ${result}. You earn ${tickets} tickets.`, "loot");
  }

  function handleCastleFlag(obj) {
    const cw = state.castleWars;
    if (!cw.active) {
      addChat("Talk to the Castle Squire or use the portal to join a match.");
      return;
    }
    if (obj.team === "enemy") {
      if (cw.flagHeld) addChat("You are already lugging the rival flag.");
      else {
        cw.flagHeld = true;
        cw.nextEnemyScore += 8;
        state.player.runEnergy = Math.max(0, state.player.runEnergy - 12);
        addChat("You steal the rival flag. Run it home.", "loot");
      }
      return;
    }
    if (!cw.flagHeld) {
      addChat("Your flag stands ready. Bring the rival flag here.");
      return;
    }
    cw.flagHeld = false;
    cw.score += 1;
    cw.nextEnemyScore = Math.max(cw.nextEnemyScore, state.time + 28);
    state.stats.castleFlagsCaptured += 1;
    gainXp("Agility", 90);
    gainXp("Defence", 60);
    addFloatingText(state.player.x, state.player.y, "Flag captured!", "#f0d25d");
    addChat(`Flag captured. ${castleWarsScoreText()}`, "loot");
  }

  function useCastleSupply() {
    const cw = state.castleWars;
    if (!cw.active) {
      addChat("Castle supplies are only handed out during a match.");
      return;
    }
    if (state.time < cw.supplyReadyAt) {
      addChat("The supply table is being restocked.");
      return;
    }
    if (!addInventory("castle_bandage", 3)) return;
    state.player.runEnergy = Math.min(100, state.player.runEnergy + 15);
    cw.supplyReadyAt = state.time + 22;
    addChat("You grab bandages and catch your breath.");
  }

  function runePouchText() {
    return `${state.runePouch?.essence || 0}/${state.runePouch?.capacity || 12} essence`;
  }

  function handleRunePouch() {
    normalizePlayerState();
    if (state.runePouch.essence > 0 && inventoryCount("rune_essence") === 0) {
      const amount = state.runePouch.essence;
      if (addInventory("rune_essence", amount)) {
        state.runePouch.essence = 0;
        addChat(`You empty ${formatItem("rune_essence", amount)} from the pouch.`);
      }
      return;
    }
    const space = state.runePouch.capacity - state.runePouch.essence;
    if (space <= 0) {
      addChat(`Your rune pouch is full (${runePouchText()}).`);
      return;
    }
    const amount = Math.min(space, inventoryCount("rune_essence"));
    if (amount <= 0) {
      addChat(`Rune pouch: ${runePouchText()}.`);
      return;
    }
    removeItem(state.player.inventory, "rune_essence", amount);
    state.runePouch.essence += amount;
    addChat(`You store ${formatItem("rune_essence", amount)} in the pouch.`);
  }

  function hasTalisman(recipe) {
    return inventoryCount(recipe.talisman) > 0;
  }

  function craftRunes(obj) {
    const recipe = RUNECRAFTING_RECIPES[obj.rune];
    if (!recipe) return;
    if (getLevel("Runecrafting") < recipe.level) {
      addChat(`You need Runecrafting level ${recipe.level} for ${recipe.name.toLowerCase()} runes.`);
      return;
    }
    if (!hasTalisman(recipe)) {
      addChat(`You need a ${ITEMS[recipe.talisman].name.toLowerCase()} to use this altar.`);
      return;
    }
    normalizePlayerState();
    const carried = inventoryCount("rune_essence");
    const pouch = inventoryCount("rune_pouch") > 0 ? state.runePouch.essence : 0;
    const essence = carried + pouch;
    if (essence <= 0) {
      addChat("You need rune essence.");
      return;
    }
    const hasRuneSlot = state.player.inventory.some((item) => !item || item.id === recipe.rune);
    if (!hasRuneSlot && carried === 0) {
      addChat("You need a free inventory slot for the runes.");
      return;
    }
    if (carried > 0) removeItem(state.player.inventory, "rune_essence", carried);
    if (pouch > 0) state.runePouch.essence = 0;
    const multiplier = Math.max(1, 1 + Math.floor(Math.max(0, effectiveLevel("Runecrafting") - recipe.level) / recipe.multipleEvery));
    const qty = essence * multiplier;
    addInventory(recipe.rune, qty);
    gainXp("Runecrafting", recipe.xp * essence);
    state.stats.runesCrafted += qty;
    const statKey = `${obj.rune}RunesCrafted`;
    if (typeof state.stats[statKey] === "number") state.stats[statKey] += qty;
    addFloatingText(state.player.x, state.player.y, `+${qty} ${ITEMS[recipe.rune].icon}`, recipe.color);
    addChat(`You bind ${formatItem(recipe.rune, qty)} from ${formatItem("rune_essence", essence)}.`, "loot");
    playSfx("spell");
  }

  function cryptStatusText() {
    normalizeCryptState();
    return `${state.crypt.defeated.length}/${Object.keys(CRYPT_BROTHERS).length} brothers defeated`;
  }

  function summonCryptBrother(obj) {
    normalizeCryptState();
    const key = obj.brother;
    const brother = CRYPT_BROTHERS[key];
    if (!brother) return;
    if (state.crypt.defeated.includes(key)) {
      addChat(`${brother.name} is quiet for this chest run.`);
      return;
    }
    const living = state.enemies.find((enemy) => enemy.cryptBrother === key && enemy.hp > 0);
    if (living) {
      state.player.combatTarget = living.id;
      addChat(`${brother.name} is already awake.`);
      return;
    }
    if (!state.crypt.awakened.includes(key)) state.crypt.awakened.push(key);
    const tile = nearestWalkable(obj.x, obj.y + 1, 2) || { x: obj.x, y: obj.y + 1 };
    const enemy = addEnemy(
      brother.type,
      brother.name,
      tile.x + 0.5,
      tile.y + 0.5,
      {
        level: brother.level,
        hp: brother.hp,
        attack: brother.attack,
        strength: brother.strength,
        defence: brother.defence,
        xp: brother.hp * 3,
        aggro: 7,
        respawn: 9999,
        slayerType: "crypt_brother",
        cryptBrother: key,
        despawnOnDeath: true,
      },
      [["big_bones", 1, 1], ["death_rune", 2 + Math.floor(random() * 3), 0.72], ["ancient_page", 1, 0.08]]
    );
    state.player.combatTarget = enemy.id;
    addChat(`${brother.name} rises from the slab. Weakness: ${brother.weakness}.`, "danger");
    playSfx("spell");
  }

  function handleCryptWightDefeat(enemy) {
    if (!enemy.cryptBrother) return;
    normalizeCryptState();
    if (!state.crypt.defeated.includes(enemy.cryptBrother)) state.crypt.defeated.push(enemy.cryptBrother);
    state.stats.cryptWightsDefeated += 1;
    gainXp("Prayer", 55);
    addChat(`Crypt progress: ${cryptStatusText()}.`);
    if (state.crypt.defeated.length >= Object.keys(CRYPT_BROTHERS).length) {
      addChat("The crypt chest clicks open somewhere below the graveyard.", "loot");
    }
    if (enemy.despawnOnDeath) enemy.respawnTimer = 9999;
  }

  function openCryptChest() {
    normalizeCryptState();
    const needed = Object.keys(CRYPT_BROTHERS).length;
    if (state.crypt.defeated.length < needed) {
      addChat(`The chest is sealed: ${cryptStatusText()}.`);
      return;
    }
    const coins = 140 + Math.floor(random() * 220) + state.crypt.chestsOpened * 12;
    const deathRunes = 3 + Math.floor(random() * 7);
    const chaosRunes = 5 + Math.floor(random() * 10);
    addInventory("coins", coins);
    addInventory("death_rune", deathRunes);
    addInventory("chaos_rune", chaosRunes);
    if (random() > 0.55) addInventory("law_rune", 1 + Math.floor(random() * 3));
    if (random() > 0.7) addInventory("reward_casket", 1);
    let rare = null;
    const rareRoll = random();
    if (rareRoll > 0.975) rare = "wight_blade";
    else if (rareRoll > 0.945) rare = "crypt_platebody";
    else if (rareRoll > 0.91) rare = "crypt_staff";
    else if (rareRoll > 0.87) rare = "crypt_platelegs";
    else if (rareRoll > 0.82) rare = "crypt_helm";
    else if (rareRoll > 0.7) rare = "ancient_page";
    if (rare) addInventory(rare, 1);
    gainXp("Prayer", 120);
    gainXp("Magic", 90);
    state.crypt.chestsOpened += 1;
    state.crypt.lastReward = rare ? ITEMS[rare].name : `${coins} coins`;
    state.stats.cryptChestsOpened += 1;
    state.crypt.awakened = [];
    state.crypt.defeated = [];
    state.enemies = state.enemies.filter((enemy) => !enemy.cryptBrother || enemy.hp > 0);
    addChat(`You loot the crypt chest: ${coins} coins, runes${rare ? `, and ${ITEMS[rare].name}` : ""}.`, "loot");
    playSfx("loot");
  }

  function isUndeadEnemy(enemy) {
    return Boolean(enemy && (enemy.type.includes("wight") || enemy.type.includes("skeleton") || enemy.slayerType === "crypt_brother"));
  }

  function cropAge(patch) {
    return Math.max(0, state.time - (patch.plantedAt || 0));
  }

  function cropProgress(patch) {
    const crop = FARM_CROPS[patch.crop];
    if (!crop) return 0;
    return clamp(cropAge(patch) / crop.growTime, 0, 1);
  }

  function cropReady(patch) {
    const crop = FARM_CROPS[patch.crop];
    return Boolean(crop && cropAge(patch) >= crop.growTime);
  }

  function farmPatchStatus(patchId) {
    const patch = state.farmingPatches?.[patchId];
    if (!patch?.crop) return "empty";
    const crop = FARM_CROPS[patch.crop];
    if (patch.diseased) return `${crop.name} diseased`;
    if (cropReady(patch)) return `${crop.name} ready`;
    if (!patch.watered) return `${crop.name} dry`;
    const pct = Math.floor(cropProgress(patch) * 100);
    return `${crop.name} ${pct}%`;
  }

  function farmPatchLines(obj) {
    const patch = state.farmingPatches?.[obj.patchId];
    if (!patch?.crop) return [obj.name, obj.patchId === "herb" ? "Empty herb patch" : "Empty vegetable patch"];
    const crop = FARM_CROPS[patch.crop];
    const remaining = Math.max(0, Math.ceil(crop.growTime - cropAge(patch)));
    if (patch.diseased) return [obj.name, `${crop.name} diseased`, "Use compost"];
    if (cropReady(patch)) return [obj.name, `${crop.name} ready`, "Harvest"];
    return [obj.name, patch.watered ? `${crop.name}: ${remaining}s` : `${crop.name}: dry`, patch.watered ? "Growing" : "Water"];
  }

  function useFarmPatch(obj) {
    normalizeFarmingPatches();
    const patchId = obj.patchId;
    const patch = state.farmingPatches[patchId];
    if (!patch) return;
    if (!patch.crop) {
      const cropId = patchId === "herb" ? "mirthleaf" : "potato";
      const crop = FARM_CROPS[cropId];
      if (getLevel("Farming") < crop.level) {
        addChat(`You need Farming level ${crop.level} to plant ${crop.name.toLowerCase()}.`);
        return;
      }
      if (inventoryCount(crop.seed) < 1) {
        addChat(`You need ${ITEMS[crop.seed].name.toLowerCase()} for this patch.`);
        return;
      }
      removeItem(state.player.inventory, crop.seed, 1);
      Object.assign(patch, { crop: cropId, plantedAt: state.time, watered: false, diseased: false });
      gainXp("Farming", crop.plantXp);
      addChat(`You plant ${ITEMS[crop.seed].name.toLowerCase()} in the ${obj.name.toLowerCase()}.`);
      return;
    }

    const crop = FARM_CROPS[patch.crop];
    const diseaseChance = clamp(0.36 - effectiveLevel("Farming") * 0.012, 0.08, 0.34);
    if (!patch.watered && !patch.diseased && cropAge(patch) > crop.growTime * 0.55 && random() < diseaseChance) {
      patch.diseased = true;
      addChat(`${crop.name} look diseased. Compost should save them.`, "danger");
      return;
    }
    if (patch.diseased) {
      if (inventoryCount("compost") < 1) {
        addChat("The patch is diseased. Bring compost.");
        return;
      }
      removeItem(state.player.inventory, "compost", 1);
      patch.diseased = false;
      patch.watered = true;
      gainXp("Farming", 10);
      addChat("You work compost into the patch and save the crop.");
      return;
    }
    if (!cropReady(patch)) {
      if (!patch.watered) {
        patch.watered = true;
        gainXp("Farming", 5);
        addChat(`You water the ${crop.name.toLowerCase()}.`);
      } else {
        const remaining = Math.max(1, Math.ceil(crop.growTime - cropAge(patch)));
        addChat(`The ${crop.name.toLowerCase()} need about ${remaining} more seconds.`);
      }
      return;
    }
    const levelYield = Math.floor(effectiveLevel("Farming") / 18);
    const waterYield = patch.watered ? 1 : 0;
    const yieldQty = crop.minYield + Math.floor(random() * (crop.maxYield - crop.minYield + 1)) + levelYield + waterYield;
    if (!addInventory(crop.product, yieldQty, true)) return;
    gainXp("Farming", crop.harvestXp);
    state.stats.cropsHarvested += 1;
    if (patchId === "herb") state.stats.herbsHarvested += yieldQty;
    Object.assign(patch, { crop: null, plantedAt: 0, watered: false, diseased: false });
    addChat(`You harvest ${formatItem(crop.product, yieldQty)}.`, "loot");
    playSfx("loot");
  }

  function useCompostBin() {
    if (inventoryCount("potato") < 1) {
      addChat("The compost bin wants spare potatoes.");
      return;
    }
    removeItem(state.player.inventory, "potato", 1);
    addInventory("compost", 1);
    gainXp("Farming", 8);
    addChat("You turn a potato into questionably fresh compost.");
  }

  function fillEmptyVial() {
    if (inventoryCount("empty_vial") < 1) {
      addChat("You need an empty vial to fill from the well.");
      return;
    }
    removeItem(state.player.inventory, "empty_vial", 1);
    addInventory("vial_of_water", 1);
    addChat("You fill a vial with water.");
  }

  function cleanHerb(slot) {
    const item = state.player.inventory[slot];
    if (!item || item.id !== "grimy_mirthleaf") return;
    if (getLevel("Herblore") < 1) {
      addChat("You need Herblore level 1 to clean that herb.");
      return;
    }
    removeSlot(state.player.inventory, slot, 1);
    addInventory("clean_mirthleaf", 1);
    gainXp("Herblore", 12);
    state.stats.herbsCleaned += 1;
    addChat("You clean the grimy mirthleaf.");
  }

  function mixHerblorePotion() {
    if (getLevel("Herblore") < 1) {
      addChat("You need Herblore level 1 to mix this potion.");
      return;
    }
    if (inventoryCount("clean_mirthleaf") < 1 || inventoryCount("vial_of_water") < 1) {
      addChat("You need mirthleaf and a vial of water.");
      return;
    }
    if (getLevel("Herblore") >= 8 && inventoryCount("potato") > 0) {
      removeItem(state.player.inventory, "clean_mirthleaf", 1);
      removeItem(state.player.inventory, "vial_of_water", 1);
      removeItem(state.player.inventory, "potato", 1);
      addInventory("energy_potion", 1);
      gainXp("Herblore", 62);
      state.stats.potionsMixed += 1;
      addChat("You mix a lumpy energy potion.", "loot");
      return;
    }
    removeItem(state.player.inventory, "clean_mirthleaf", 1);
    removeItem(state.player.inventory, "vial_of_water", 1);
    addInventory("attack_potion", 1);
    gainXp("Herblore", 48);
    state.stats.potionsMixed += 1;
    addChat("You mix a murky attack potion.", "loot");
  }

  function attemptAgility(obj) {
    const level = obj.level || 1;
    if (getLevel("Agility") < level) {
      addChat(`You need Agility level ${level} for that obstacle.`);
      return;
    }
    if (obj.depletedUntil && obj.depletedUntil > state.time) {
      addChat("Catch your breath before trying that again.");
      return;
    }
    const chance = clamp(0.55 + (effectiveLevel("Agility") - level) * 0.028, 0.35, 0.94);
    obj.depletedUntil = state.time + (obj.cooldown || 2.5);
    if (random() > chance) {
      const hit = obj.failDamage || 4;
      state.player.hp = Math.max(1, state.player.hp - hit);
      state.player.damageFlash = 0.35;
      addFloatingText(state.player.x, state.player.y, `${hit}`, "#ff5858");
      gainXp("Agility", Math.max(6, Math.floor((obj.xp || 32) * 0.22)));
      addChat(`You slip on the ${obj.name.toLowerCase()}.`);
      return;
    }
    state.stats.agilityObstacles += 1;
    state.player.runEnergy = Math.min(100, state.player.runEnergy + (obj.restore || 7));
    gainXp("Agility", obj.xp || 34);
    addFloatingText(state.player.x, state.player.y, "+run", "#77ff77");
    addChat(`You clear the ${obj.name.toLowerCase()} and feel lighter on your feet.`);
    playSfx("loot");
  }

  function fletchBest(fromTable = false) {
    if (!fromTable && inventoryCount("knife") < 1) {
      addChat("You need a knife to fletch.");
      return;
    }
    if (inventoryCount("arrow_shaft") >= 15 && inventoryCount("feather") >= 15 && inventoryCount("bronze_arrowtips") >= 15) {
      removeItem(state.player.inventory, "arrow_shaft", 15);
      removeItem(state.player.inventory, "feather", 15);
      removeItem(state.player.inventory, "bronze_arrowtips", 15);
      addInventory("bronze_arrow", 15);
      gainXp("Fletching", 42);
      state.stats.arrowsFletched += 15;
      addChat("You fletch a tidy batch of bronze arrows.", "loot");
      return;
    }
    if (inventoryCount("oak_logs") > 0 && inventoryCount("bow_string") > 0 && getLevel("Fletching") >= 15) {
      removeItem(state.player.inventory, "oak_logs", 1);
      removeItem(state.player.inventory, "bow_string", 1);
      addInventory("oak_shortbow", 1);
      gainXp("Fletching", 92);
      state.stats.bowsFletched += 1;
      addChat("You carve and string an oak shortbow.", "loot");
      return;
    }
    if (inventoryCount("logs") > 0 && inventoryCount("bow_string") > 0 && getLevel("Fletching") >= 5) {
      removeItem(state.player.inventory, "logs", 1);
      removeItem(state.player.inventory, "bow_string", 1);
      addInventory("shortbow", 1);
      gainXp("Fletching", 62);
      state.stats.bowsFletched += 1;
      addChat("You carve and string a shortbow.", "loot");
      return;
    }
    if (inventoryCount("oak_logs") > 0 && getLevel("Fletching") >= 15) {
      removeItem(state.player.inventory, "oak_logs", 1);
      addInventory("arrow_shaft", 30);
      gainXp("Fletching", 36);
      addChat("You cut oak logs into arrow shafts.");
      return;
    }
    if (inventoryCount("logs") > 0) {
      removeItem(state.player.inventory, "logs", 1);
      addInventory("arrow_shaft", 15);
      gainXp("Fletching", 18);
      addChat("You cut the logs into arrow shafts.");
      return;
    }
    addChat("Bring logs, feathers, tips, or bow strings to fletch.");
  }

  function makeBronzeArrowtips(slot) {
    const nearAnvil = state.scenery.some((obj) => obj.action === "smith" && dist(obj, state.player) < 3);
    if (!nearAnvil) {
      addChat("Use bronze bars near an anvil to make arrowtips.");
      return;
    }
    removeSlot(state.player.inventory, slot, 1);
    addInventory("bronze_arrowtips", 15);
    gainXp("Smithing", 34);
    addChat("You hammer the bronze bar into arrowtips.");
  }

  function stealFromStall(obj) {
    const level = obj.level || 1;
    if (getLevel("Thieving") < level) {
      addChat(`You need Thieving level ${level} for that stall.`);
      return;
    }
    if (obj.depletedUntil && obj.depletedUntil > state.time) {
      addChat("The stall owner is watching it closely.");
      return;
    }
    const success = random() < clamp(0.42 + effectiveLevel("Thieving") * 0.025, 0.42, 0.9);
    obj.depletedUntil = state.time + 5;
    if (!success) {
      const hit = 4 + Math.floor(random() * 10);
      state.player.hp = Math.max(1, state.player.hp - hit);
      state.player.damageFlash = 0.35;
      addFloatingText(state.player.x, state.player.y, `${hit}`, "#ff5858");
      gainXp("Thieving", 8);
      addChat("A guard clips you for trying that.");
      return;
    }
    const roll = random();
    const reward = roll > 0.82 ? ["silk", 1] : roll > 0.6 ? ["fur", 1] : roll > 0.28 ? ["cake", 1] : ["coins", 12 + Math.floor(random() * 24)];
    addInventory(reward[0], reward[1]);
    gainXp("Thieving", reward[0] === "silk" ? 38 : reward[0] === "fur" ? 32 : 24);
    state.stats.stallsStolen += 1;
    addChat(`You steal ${formatItem(reward[0], reward[1])}.`, "loot");
  }

  function cookBestRawFish() {
    const itemId = inventoryCount("raw_trout") > 0 ? "raw_trout" : inventoryCount("raw_beef") > 0 ? "raw_beef" : inventoryCount("raw_chicken") > 0 ? "raw_chicken" : inventoryCount("raw_shrimp") > 0 ? "raw_shrimp" : null;
    if (!itemId) {
      addChat("You need raw food to cook.");
      return;
    }
    const data = ITEMS[itemId];
    removeItem(state.player.inventory, itemId, 1);
    const burnChance = clamp(0.45 - effectiveLevel("Cooking") * 0.018 + data.burnLevel * 0.01, 0.04, 0.6);
    if (random() < burnChance) {
      addInventory(data.burnTo || "burnt_fish");
      addChat("You burn the food.");
    } else {
      addInventory(data.cookTo);
      gainXp("Cooking", data.cookingXp);
      addChat(`You cook the ${ITEMS[data.cookTo].name}.`);
    }
  }

  function smelt() {
    if (inventoryCount("copper_ore") > 0 && inventoryCount("tin_ore") > 0) {
      removeItem(state.player.inventory, "copper_ore", 1);
      removeItem(state.player.inventory, "tin_ore", 1);
      addInventory("bronze_bar");
      gainXp("Smithing", 62);
      addChat("You smelt a bronze bar.");
    } else if (inventoryCount("iron_ore") > 0) {
      removeItem(state.player.inventory, "iron_ore", 1);
      if (random() < clamp(0.45 + effectiveLevel("Smithing") * 0.02, 0.45, 0.9)) {
        addInventory("iron_bar");
        gainXp("Smithing", 85);
        addChat("You smelt an iron bar.");
      } else addChat("The iron ore is ruined in the furnace.");
    } else if (inventoryCount("gold_ore") > 0) {
      if (getLevel("Smithing") < 20) {
        addChat("You need Smithing level 20 to smelt gold.");
        return;
      }
      removeItem(state.player.inventory, "gold_ore", 1);
      addInventory("gold_bar");
      gainXp("Smithing", 90);
      addChat("You smelt a gold bar.");
    } else if (inventoryCount("gold_bar") > 0) {
      craftJewellery();
    } else {
      addChat("You need ores, or a gold bar for jewellery.");
    }
  }

  function cutGem(slot) {
    if (getLevel("Crafting") < 12) {
      addChat("You need Crafting level 12 to cut gems.");
      return;
    }
    if (inventoryCount("chisel") <= 0) {
      addChat("You need a chisel to cut that.");
      return;
    }
    const clicked = state.player.inventory[slot];
    if (clicked?.id === "uncut_gem") {
      removeSlot(state.player.inventory, slot, 1);
    } else if (!removeItem(state.player.inventory, "uncut_gem", 1)) {
      addChat("You need an uncut gem.");
      return;
    }
    if (!addInventory("cut_gem", 1, true)) {
      addInventory("uncut_gem", 1, true);
      return;
    }
    gainXp("Crafting", 85);
    state.stats.gemsCut += 1;
    addChat("You cut the gem into a bright little wedge.", "loot");
  }

  function craftJewellery() {
    const nearFurnace = state.scenery.some((obj) => obj.action === "smelt" && dist(obj, state.player) < 3.2);
    if (!nearFurnace) {
      addChat("Work gold bars at a furnace.");
      return;
    }
    if (inventoryCount("gold_bar") <= 0) {
      addChat("You need a gold bar.");
      return;
    }
    if (inventoryCount("cut_gem") > 0) {
      if (getLevel("Crafting") < 20) {
        addChat("You need Crafting level 20 to craft a power amulet.");
        return;
      }
      removeItem(state.player.inventory, "gold_bar", 1);
      removeItem(state.player.inventory, "cut_gem", 1);
      addInventory("power_amulet", 1);
      gainXp("Crafting", 135);
      state.stats.jewelryCrafted += 1;
      addChat("You craft a power amulet.", "loot");
      return;
    }
    if (getLevel("Crafting") < 5) {
      addChat("You need Crafting level 5 to craft a gold ring.");
      return;
    }
    removeItem(state.player.inventory, "gold_bar", 1);
    addInventory("gold_ring", 1);
    gainXp("Crafting", 70);
    state.stats.jewelryCrafted += 1;
    addChat("You craft a gold ring.", "loot");
  }

  function smith() {
    if (inventoryCount("iron_bar") > 1 && getLevel("Smithing") >= 15) {
      removeItem(state.player.inventory, "iron_bar", 2);
      addInventory("iron_sword");
      gainXp("Smithing", 120);
      addChat("You smith an iron sword.");
    } else if (inventoryCount("bronze_bar") > 0) {
      removeItem(state.player.inventory, "bronze_bar", 1);
      addInventory("bronze_sword");
      gainXp("Smithing", 55);
      addChat("You hammer a bronze sword into existence.");
    } else {
      addChat("You need bars to smith equipment.");
    }
  }

  function useInventorySlot(slot) {
    const item = state.player.inventory[slot];
    if (!item) return;
    const data = ITEMS[item.id];
    if (state.modal?.type === "bank") {
      moveItem(state.player.inventory, state.player.bank, slot, data.stackable ? item.qty : 1);
      return;
    }
    if (state.modal?.type === "shop") {
      if (state.modal.currency === "slayer") {
        addChat("The Slayer Master only takes points.");
        return;
      }
      if (state.modal.currency === "castle") {
        addChat("The squire only takes tickets.");
        return;
      }
      const value = Math.max(1, Math.floor((data.value || 1) * 0.45));
      removeSlot(state.player.inventory, slot, 1);
      addInventory("coins", value);
      addChat(`You sell ${data.name} for ${value} coins.`);
      return;
    }
    if (item.id === "grimy_mirthleaf") {
      cleanHerb(slot);
    } else if (item.id === "clean_mirthleaf" || item.id === "vial_of_water") {
      mixHerblorePotion();
    } else if (item.id === "rune_pouch") {
      handleRunePouch();
    } else if (item.id === "ancient_page") {
      addChat(`Ancient page: wake the brothers, keep your Prayer close, loot once. ${cryptStatusText()}.`);
    } else if (item.id === "empty_vial") {
      const nearWell = state.scenery.some((obj) => obj.action === "water" && dist(obj, state.player) < 3);
      if (nearWell) fillEmptyVial();
      else addChat("Use the empty vial at a well.");
    } else if (item.id === "uncut_gem" || item.id === "chisel") {
      cutGem(slot);
    } else if (item.id === "gold_bar" || item.id === "cut_gem") {
      craftJewellery();
    } else if (data.boostSkill || data.runRestore) {
      drinkPotion(slot);
    } else if (data.food) {
      const before = state.player.hp;
      state.player.hp = Math.min(maxHp(), state.player.hp + data.food * 10);
      removeSlot(state.player.inventory, slot, 1);
      addChat(`You eat the ${data.name}. It heals ${Math.round((state.player.hp - before) / 10)}.`);
    } else if (data.slot) {
      equip(slot);
    } else if (item.id === "bones" || item.id === "big_bones") {
      removeSlot(state.player.inventory, slot, 1);
      gainXp("Prayer", item.id === "big_bones" ? 135 : 45);
      if (state.quests.restlessBones.state === "started") state.stats.bonesBuried += 1;
      addChat("You bury the bones.");
    } else if (item.id === "knife") {
      fletchBest();
    } else if (item.id === "bronze_bar") {
      makeBronzeArrowtips(slot);
    } else if (data.log) {
      lightFire(slot);
    } else if (item.id === "cowhide") {
      if (inventoryCount("cowhide") < 2) {
        addChat("You need two cowhides to craft a leather body.");
      } else {
        removeItem(state.player.inventory, "cowhide", 2);
        addInventory("leather_body");
        gainXp("Crafting", 90);
        state.stats.cowhidesCrafted += 1;
        addChat("You stitch the cowhides into a leather body.");
      }
    } else if (item.id === "raw_shrimp" || item.id === "raw_trout" || item.id === "raw_beef" || item.id === "raw_chicken") {
      const nearRange = state.scenery.some((obj) => obj.action === "cook" && dist(obj, state.player) < 3);
      const nearFire = state.fires.some((fire) => dist(fire, state.player) < 2.5);
      if (nearRange || nearFire) cookBestRawFish();
      else addChat("Find a range or fire to cook that.");
    } else if (item.id === "slayer_gem") {
      if (state.slayer.task) addChat(`Slayer gem: ${state.slayer.task.remaining} ${state.slayer.task.label} left.`);
      else addChat("Slayer gem: no task assigned.");
      openBestiary();
    } else if (item.id === "clue_scroll") {
      readClueScroll(slot);
    } else if (item.id === "reward_casket") {
      openRewardCasket(slot);
    } else if (item.id === "antique_lamp") {
      openLamp(slot);
    } else if (item.id === "mystery_box") {
      openMysteryBox(slot);
    } else {
      addChat(`Nothing interesting happens with the ${data.name}.`);
    }
  }

  function readClueScroll(slot) {
    if (!state.clue) {
      state.clue = choice([
        { id: "well", hint: "Where town water sleeps under a wooden roof.", x: 40, y: 39, radius: 2.4, xp: 80 },
        { id: "altar", hint: "A pale cross waits where old bones settle.", x: 49, y: 46, radius: 2.8, xp: 90 },
        { id: "dock", hint: "Cast your eyes south where fish ripple near planks.", x: 55, y: 61, radius: 3.2, xp: 100 },
        { id: "mine", hint: "Grey stone remembers the bite of iron.", x: 62, y: 18, radius: 4.2, xp: 120 },
        { id: "hollow", hint: "Under the damp cave mouth, legs skitter in the dark.", x: 68, y: 43, radius: 4.2, xp: 150 },
        { id: "moss", hint: "The green brutes guard a quiet western wood.", x: 15, y: 17, radius: 4.8, xp: 180 },
        { id: "chaos", hint: "Where purple stone hums beyond the ditch.", x: 11, y: 12, radius: 4.2, xp: 210 },
      ]);
      addChat(`Clue scroll: ${state.clue.hint}`);
      return;
    }
    if (Math.hypot(state.player.x - state.clue.x, state.player.y - state.clue.y) <= state.clue.radius) {
      removeSlot(state.player.inventory, slot, 1);
      addInventory("reward_casket", 1);
      gainXp("Crafting", state.clue.xp / 2);
      gainXp("Magic", state.clue.xp / 3);
      state.stats.cluesSolved += 1;
      addChat("You solve the clue and find a reward casket.", "loot");
      state.clue = null;
    } else {
      addChat(`Clue scroll: ${state.clue.hint}`);
    }
  }

  function openRewardCasket(slot) {
    removeSlot(state.player.inventory, slot, 1);
    state.stats.casketsOpened += 1;
    const coins = 70 + Math.floor(random() * 180);
    addInventory("coins", coins);
    const roll = random();
    if (roll > 0.985) addInventory("rune_scimitar", 1);
    else if (roll > 0.94) addInventory("team_cape", 1);
    else if (roll > 0.92) addInventory("slayer_helm", 1);
    else if (roll > 0.78) addInventory(choice(["amulet_of_accuracy", "power_amulet"]), 1);
    else if (roll > 0.62) addInventory(choice(["uncut_gem", "cut_gem", "gold_bar"]), 1);
    else if (roll > 0.46) addInventory(choice(["attack_potion", "strength_potion", "defence_potion", "ranging_potion", "magic_potion", "bow_string"]), 1);
    else if (roll > 0.28) addInventory("death_rune", 2 + Math.floor(random() * 5));
    else addInventory("broad_arrow", 20 + Math.floor(random() * 25));
    gainXp("Crafting", 60);
    addChat(`You open the casket and find ${coins} coins and treasure.`, "loot");
  }

  function equip(slot) {
    const item = state.player.inventory[slot];
    if (!item) return;
    const data = ITEMS[item.id];
    if (!data.slot) return;
    if (!meetsRequirements(data.requirements)) {
      addChat(`You need ${requirementText(data.requirements)} to equip that.`);
      return;
    }
    const old = state.player.equipment[data.slot];
    state.player.equipment[data.slot] = item.id;
    state.player.inventory[slot] = null;
    if (old) addInventory(old, 1, true);
    addChat(`You equip the ${data.name}.`);
  }

  function unequip(slotName) {
    const itemId = state.player.equipment[slotName];
    if (!itemId) return;
    if (addInventory(itemId, 1, true)) {
      state.player.equipment[slotName] = null;
      addChat(`You remove the ${ITEMS[itemId].name}.`);
    }
  }

  function lightFire(slot) {
    const item = state.player.inventory[slot];
    if (!item || !ITEMS[item.id].log) return;
    const tile = nearestWalkable(Math.floor(state.player.x), Math.floor(state.player.y), 1);
    if (!tile) return;
    removeSlot(state.player.inventory, slot, 1);
    state.fires.push({ x: tile.x + 0.5, y: tile.y + 0.5, ttl: 35, age: 0 });
    gainXp("Firemaking", item.id === "oak_logs" ? 70 : 40);
    state.stats.firesLit += 1;
    addChat("You light a fire.");
  }

  function castSpell(spell) {
    if (spell === "home") {
      state.player.x = 39;
      state.player.y = 39;
      state.player.path = [];
      state.player.pending = null;
      state.player.combatTarget = null;
      gainXp("Magic", 20);
      addChat("You teleport home.");
    } else if (spell === "wind") {
      const enemy = nearestAliveEnemy(6);
      if (!enemy) {
        addChat("No nearby target.");
        return;
      }
      if (inventoryCount("air_rune") < 1 || inventoryCount("mind_rune") < 1) {
        addChat("You need air and mind runes.");
        return;
      }
      removeItem(state.player.inventory, "air_rune", 1);
      removeItem(state.player.inventory, "mind_rune", 1);
      const hit = Math.floor(random() * (effectiveLevel("Magic") / 2 + 4));
      enemy.hp = Math.max(0, enemy.hp - hit);
      enemy.hitFlash = 0.4;
      playSfx("spell");
      gainXp("Magic", 14 + hit * 2);
      addFloatingText(enemy.x, enemy.y, `${hit}`, "#9ee8ff");
      addChat(`You cast Wind Poke on the ${enemy.name}.`);
      if (enemy.hp <= 0) killEnemy(enemy);
    } else if (spell === "fire") {
      const enemy = nearestAliveEnemy(7);
      if (!enemy) {
        addChat("No nearby target.");
        return;
      }
      if (inventoryCount("air_rune") < 2 || inventoryCount("chaos_rune") < 1) {
        addChat("You need 2 air runes and 1 chaos rune.");
        return;
      }
      removeItem(state.player.inventory, "air_rune", 2);
      removeItem(state.player.inventory, "chaos_rune", 1);
      const staffBoost = ITEMS[state.player.equipment.weapon]?.magicBoost ? 2 : 0;
      const hit = Math.floor(random() * (effectiveLevel("Magic") / 2 + 8 + staffBoost));
      enemy.hp = Math.max(0, enemy.hp - hit);
      enemy.hitFlash = 0.45;
      playSfx("spell");
      gainXp("Magic", 28 + hit * 2.2);
      addFloatingText(enemy.x, enemy.y, `${hit}`, "#ff9d4d");
      addChat(`You cast Fire Bolt on the ${enemy.name}.`);
      if (enemy.hp <= 0) killEnemy(enemy);
    } else if (spell === "crumble") {
      if (getLevel("Magic") < 20) {
        addChat("You need Magic level 20 to crumble undead.");
        return;
      }
      const enemy = nearestAliveEnemy(7);
      if (!enemy) {
        addChat("No nearby target.");
        return;
      }
      if (!isUndeadEnemy(enemy)) {
        addChat("That spell only bites undead things.");
        return;
      }
      if (inventoryCount("chaos_rune") < 1 || inventoryCount("death_rune") < 1) {
        addChat("You need 1 chaos rune and 1 death rune.");
        return;
      }
      removeItem(state.player.inventory, "chaos_rune", 1);
      removeItem(state.player.inventory, "death_rune", 1);
      const staffBoost = ITEMS[state.player.equipment.weapon]?.magicBoost ? 3 : 0;
      const hit = 2 + Math.floor(random() * (effectiveLevel("Magic") / 2 + 10 + staffBoost));
      enemy.hp = Math.max(0, enemy.hp - hit);
      enemy.hitFlash = 0.5;
      state.player.prayerPoints = Math.min(maxPrayer(), state.player.prayerPoints + 1.5);
      playSfx("spell");
      gainXp("Magic", 35 + hit * 2.4);
      addFloatingText(enemy.x, enemy.y, `${hit}`, "#d6f0ee");
      addChat(`You crumble the ${enemy.name}.`);
      if (enemy.hp <= 0) killEnemy(enemy);
    } else if (spell === "alchemy") {
      const slot = state.player.inventory.findIndex((item) => item && !["coins", "air_rune", "mind_rune", "chaos_rune", "law_rune", "death_rune"].includes(item.id));
      if (slot < 0) {
        addChat("Nothing suitable to alchemise.");
        return;
      }
      const item = state.player.inventory[slot];
      const value = Math.max(2, Math.floor((ITEMS[item.id].value || 1) * 0.6));
      removeSlot(state.player.inventory, slot, 1);
      addInventory("coins", value);
      gainXp("Magic", 40);
      addChat(`You turn ${ITEMS[item.id].name} into ${value} coins.`);
    }
  }

  function nearestAliveEnemy(range) {
    return state.enemies
      .filter((enemy) => enemy.hp > 0 && dist(enemy, state.player) <= range)
      .sort((a, b) => dist(a, state.player) - dist(b, state.player))[0];
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawWorld();
    drawPanel();
    drawChat();
    drawModal();
    drawContextMenu();
    drawHoverTooltip();
  }

  function drawWorld() {
    ctx.save();
    ctx.beginPath();
    ctx.rect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    ctx.clip();
    ctx.fillStyle = "#203a24";
    ctx.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    const centerTile = unproject(VIEW.w / 2, VIEW.h / 2);
    const radius = 31;
    const minX = clamp(Math.floor(centerTile.x - radius), 0, WORLD_W - 1);
    const maxX = clamp(Math.ceil(centerTile.x + radius), 0, WORLD_W - 1);
    const minY = clamp(Math.floor(centerTile.y - radius), 0, WORLD_H - 1);
    const maxY = clamp(Math.ceil(centerTile.y + radius), 0, WORLD_H - 1);

    for (let sum = minX + minY; sum <= maxX + maxY; sum += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const y = sum - x;
        if (y < minY || y > maxY) continue;
        const screen = screenOf({ x, y });
        if (screen.x < -TILE_W || screen.x > VIEW.w + TILE_W || screen.y < -TILE_H || screen.y > VIEW.h + TILE_H) continue;
        drawTile(x, y, screen.x, screen.y);
      }
    }

    const drawables = [];
    for (const fire of state.fires) drawables.push({ kind: "fire", ySort: fire.x + fire.y, data: fire });
    for (const item of state.groundItems) drawables.push({ kind: "groundItem", ySort: item.x + item.y - 0.2, data: item });
    for (const obj of state.scenery) drawables.push({ kind: "scenery", ySort: obj.x + obj.y, data: obj });
    for (const resource of state.resources) {
      if (resource.depleted <= state.time) drawables.push({ kind: "resource", ySort: resource.x + resource.y, data: resource });
    }
    for (const npc of state.npcs) drawables.push({ kind: "npc", ySort: npc.x + npc.y, data: npc });
    for (const enemy of state.enemies) {
      if (enemy.hp > 0) drawables.push({ kind: "enemy", ySort: enemy.x + enemy.y, data: enemy });
    }
    drawables.push({ kind: "player", ySort: state.player.x + state.player.y, data: state.player });
    drawables.sort((a, b) => a.ySort - b.ySort);
    for (const drawable of drawables) {
      if (drawable.kind === "resource") drawResource(drawable.data);
      else if (drawable.kind === "scenery") drawScenery(drawable.data);
      else if (drawable.kind === "npc") drawNpc(drawable.data);
      else if (drawable.kind === "enemy") drawEnemy(drawable.data);
      else if (drawable.kind === "groundItem") drawGroundItem(drawable.data);
      else if (drawable.kind === "player") drawPlayer();
      else if (drawable.kind === "fire") drawFire(drawable.data);
    }

    drawBarks();

    if (state.clickMarker) {
      const screen = screenOf(state.clickMarker);
      ctx.strokeStyle = `rgba(255,255,255,${state.clickMarker.time})`;
      ctx.lineWidth = 2;
      drawDiamond(screen.x, screen.y, TILE_W * 0.65, TILE_H * 0.65, null, ctx.strokeStyle);
    }

    for (const text of floatingText) {
      const screen = screenOf({ x: text.x, y: text.y });
      const alpha = 1 - text.age / 1.2;
      drawText(text.text, screen.x, screen.y - 48 - text.age * 24, {
        color: text.color,
        outline: "#000",
        size: 16,
        align: "center",
        alpha,
      });
    }

    if (state.player.damageFlash > 0) {
      ctx.fillStyle = `rgba(120,0,0,${state.player.damageFlash * 0.25})`;
      ctx.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    }
    if (state.player.respawnFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${state.player.respawnFlash * 0.2})`;
      ctx.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    }

    drawTopWorldLabels();
    ctx.restore();
  }

  function drawTile(x, y, sx, sy) {
    const terrain = mapAt(x, y);
    const palette = terrainColors[terrain] || terrainColors.grass;
    const n = hash(x, y, 5);
    const fill = palette[n > 0.75 ? 0 : n > 0.25 ? 1 : 2];
    drawDiamond(sx, sy, TILE_W, TILE_H, fill, "rgba(0,0,0,0.16)");
    if (terrain === "water") {
      ctx.strokeStyle = `rgba(156,217,255,${0.18 + hash(x, y, 6) * 0.18})`;
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy + 1 + Math.sin(state.time * 2 + x) * 1.5);
      ctx.lineTo(sx + 12, sy + 1 + Math.sin(state.time * 2 + y) * 1.5);
      ctx.stroke();
    } else if (terrain === "field" && hash(x, y, 7) > 0.5) {
      ctx.strokeStyle = "rgba(245,222,119,0.25)";
      ctx.beginPath();
      ctx.moveTo(sx, sy - 8);
      ctx.lineTo(sx, sy + 8);
      ctx.stroke();
    } else if (terrain === "path" && hash(x, y, 8) > 0.72) {
      ctx.fillStyle = "rgba(64,44,28,0.22)";
      ctx.fillRect(sx - 2, sy - 2, 4, 3);
    }
  }

  function drawDiamond(cx, cy, w, h, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy);
    ctx.lineTo(cx, cy + h / 2);
    ctx.lineTo(cx - w / 2, cy);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function drawResource(resource) {
    const screen = screenOf(resource);
    if (screen.x < -80 || screen.x > VIEW.w + 80 || screen.y < -80 || screen.y > VIEW.h + 90) return;
    if (resource.type === "tree" || resource.type === "oak_tree") {
      const oak = resource.type === "oak_tree";
      ctx.fillStyle = "#5a351d";
      ctx.fillRect(screen.x - 4, screen.y - 24, 8, 26);
      ctx.fillStyle = oak ? "#315b28" : "#2f742b";
      ctx.beginPath();
      ctx.arc(screen.x, screen.y - 34, oak ? 20 : 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.arc(screen.x - 6, screen.y - 42, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (resource.type === "essence_rock") {
      const pulse = 0.5 + Math.sin(state.time * 3 + resource.id) * 0.5;
      ctx.fillStyle = "#6f63a7";
      ctx.beginPath();
      ctx.moveTo(screen.x - 18, screen.y - 2);
      ctx.lineTo(screen.x - 8, screen.y - 20);
      ctx.lineTo(screen.x + 10, screen.y - 18);
      ctx.lineTo(screen.x + 18, screen.y - 1);
      ctx.lineTo(screen.x + 6, screen.y + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d7ccff";
      ctx.stroke();
      ctx.fillStyle = `rgba(236,230,255,${0.22 + pulse * 0.18})`;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y - 10, 9 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      drawText("ess", screen.x, screen.y - 30, { color: "#f2eeff", outline: "#1e1830", size: 9, align: "center" });
    } else if (resource.type.endsWith("_rock")) {
      ctx.fillStyle = resource.type === "copper_rock" ? "#b86137" : resource.type === "tin_rock" ? "#a9a795" : resource.type === "gold_rock" ? "#cfa942" : "#81776b";
      ctx.beginPath();
      ctx.moveTo(screen.x - 16, screen.y - 4);
      ctx.lineTo(screen.x - 6, screen.y - 18);
      ctx.lineTo(screen.x + 9, screen.y - 16);
      ctx.lineTo(screen.x + 17, screen.y - 2);
      ctx.lineTo(screen.x + 5, screen.y + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.stroke();
    } else if (resource.type === "fishing_spot") {
      ctx.strokeStyle = "#d5f3ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 4, 15 + Math.sin(state.time * 4) * 2, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawText("fish", screen.x, screen.y - 18, { size: 10, color: "#e8fbff", outline: "#06384e", align: "center" });
    }
  }

  function drawGroundItem(item) {
    const screen = screenOf(item);
    if (screen.x < -60 || screen.x > VIEW.w + 60 || screen.y < -80 || screen.y > VIEW.h + 60) return;
    const data = ITEMS[item.itemId];
    drawShadow(screen.x, screen.y);
    if (item.itemId === "coins") {
      ctx.fillStyle = "#f5c84c";
      for (let i = 0; i < Math.min(5, item.qty); i += 1) {
        ctx.beginPath();
        ctx.arc(screen.x - 8 + i * 4, screen.y - 12 + (i % 2) * 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = data.color || "#ddd";
      ctx.fillRect(screen.x - 10, screen.y - 22, 20, 16);
      ctx.strokeStyle = "#111";
      ctx.strokeRect(screen.x - 10, screen.y - 22, 20, 16);
      drawText(data.icon || item.itemId.slice(0, 2), screen.x, screen.y - 14, { size: 9, color: "#fff", outline: "#000", align: "center" });
    }
    const label = item.qty > 1 ? `${data.name} (${compactNumber(item.qty)})` : data.name;
    drawText(label, screen.x, screen.y - 34, { color: "#fff0a8", outline: "#000", size: 10, align: "center" });
  }

  function drawScenery(obj) {
    const screen = screenOf(obj);
    if (screen.x < -120 || screen.x > VIEW.w + 120 || screen.y < -120 || screen.y > VIEW.h + 120) return;
    if (obj.type === "bank_booth") {
      drawBox(screen.x, screen.y - 26, 100, 38, "#7a4b2e", "#26150d");
      drawText("BANK", screen.x, screen.y - 33, { color: "#ffe39b", outline: "#000", size: 12, align: "center" });
    } else if (obj.type === "shop_counter") {
      drawBox(screen.x, screen.y - 22, 92, 32, "#95633b", "#2b160d");
      drawText("SHOP", screen.x, screen.y - 28, { color: "#ffe39b", outline: "#000", size: 12, align: "center" });
    } else if (obj.type === "range") {
      drawBox(screen.x, screen.y - 30, 42, 46, "#4d4c45", "#171714");
      ctx.fillStyle = "#ff8a2a";
      ctx.fillRect(screen.x - 8, screen.y - 26, 16, 14);
    } else if (obj.type === "altar") {
      drawBox(screen.x, screen.y - 21, 56, 27, "#c8c0b0", "#5a5145");
      drawText("+", screen.x, screen.y - 28, { color: "#fff6d8", outline: "#000", size: 18, align: "center" });
    } else if (obj.type === "furnace") {
      drawBox(screen.x, screen.y - 38, 46, 56, "#5a5a56", "#20201e");
      ctx.fillStyle = "#ff5c22";
      ctx.beginPath();
      ctx.arc(screen.x, screen.y - 23, 11, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.type === "anvil") {
      ctx.fillStyle = "#6f7378";
      ctx.fillRect(screen.x - 20, screen.y - 18, 40, 10);
      ctx.fillRect(screen.x - 8, screen.y - 10, 16, 15);
      ctx.fillRect(screen.x - 18, screen.y + 2, 36, 8);
    } else if (obj.type === "slayer_board") {
      drawBox(screen.x, screen.y - 42, 62, 54, "#4f301f", "#1c0e08");
      drawText("SLAYER", screen.x, screen.y - 44, { color: "#8ff0ff", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "cave") {
      ctx.fillStyle = "#1e1b1b";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 13, 34, 25, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5b5851";
      ctx.stroke();
    } else if (obj.type === "crypt_mound") {
      drawBox(screen.x, screen.y - 18, 64, 28, "#4b4944", "#191815");
      ctx.fillStyle = "#2c2925";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 24, 34, 14, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#aeb7b6";
      ctx.stroke();
      drawText("CRYPT", screen.x, screen.y - 43, { color: "#c9d2d1", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "crypt_chest") {
      drawBox(screen.x, screen.y - 24, 54, 36, "#4f3a28", "#160e08");
      ctx.fillStyle = "#a48a58";
      ctx.fillRect(screen.x - 23, screen.y - 35, 46, 8);
      ctx.strokeStyle = "#1a120a";
      ctx.strokeRect(screen.x - 23, screen.y - 35, 46, 8);
      drawText(`${state.crypt?.defeated?.length || 0}/3`, screen.x, screen.y - 45, { color: "#ffd86b", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "castle_portal") {
      drawBox(screen.x, screen.y - 22, 68, 46, "#5c4226", "#1c1008");
      ctx.fillStyle = "#243c8f";
      ctx.beginPath();
      ctx.arc(screen.x - 16, screen.y - 26, 9 + Math.sin(state.time * 4) * 2, 0, Math.PI * 2);
      ctx.arc(screen.x + 16, screen.y - 26, 9 + Math.cos(state.time * 4) * 2, 0, Math.PI * 2);
      ctx.fill();
      drawText("CW", screen.x, screen.y - 50, { color: "#f0d25d", outline: "#000", size: 12, align: "center" });
    } else if (obj.type === "castle_flag") {
      const home = obj.team === "home";
      ctx.strokeStyle = "#2b1a0a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y - 4);
      ctx.lineTo(screen.x, screen.y - 58);
      ctx.stroke();
      ctx.fillStyle = home ? "#3867d6" : "#b83432";
      ctx.fillRect(screen.x + 2, screen.y - 58, 34, 20);
      ctx.strokeStyle = "#111";
      ctx.strokeRect(screen.x + 2, screen.y - 58, 34, 20);
      drawText(home ? "BOON" : "RIVAL", screen.x + 19, screen.y - 44, { color: "#fff4c6", outline: "#000", size: 8, align: "center" });
      if (state.castleWars.flagHeld && home) drawText("SCORE", screen.x, screen.y - 70, { color: "#f0d25d", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "castle_supply") {
      drawBox(screen.x, screen.y - 18, 72, 28, "#7c5532", "#231309");
      ctx.fillStyle = "#efe0c0";
      ctx.fillRect(screen.x - 22, screen.y - 36, 18, 10);
      ctx.fillStyle = "#d24d4d";
      ctx.fillRect(screen.x + 5, screen.y - 35, 22, 8);
      drawText("SUPPLY", screen.x, screen.y - 48, { color: "#f0d25d", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "castle_scoreboard") {
      drawBox(screen.x, screen.y - 36, 72, 50, "#3c2a18", "#150c05");
      drawText("CASTLE", screen.x, screen.y - 53, { color: "#f0d25d", outline: "#000", size: 9, align: "center" });
      drawText(`${state.castleWars.score}-${state.castleWars.enemyScore}`, screen.x, screen.y - 30, { color: "#ffffff", outline: "#000", size: 14, align: "center" });
    } else if (obj.type === "well") {
      drawBox(screen.x, screen.y - 26, 42, 34, "#767065", "#2c2925");
      ctx.strokeStyle = "#5c321e";
      ctx.beginPath();
      ctx.moveTo(screen.x - 18, screen.y - 24);
      ctx.lineTo(screen.x, screen.y - 45);
      ctx.lineTo(screen.x + 18, screen.y - 24);
      ctx.stroke();
    } else if (obj.type === "quest_sign") {
      drawBox(screen.x, screen.y - 42, 54, 46, "#76502c", "#1c0e08");
      drawText("!", screen.x, screen.y - 43, { color: "#ffe459", outline: "#000", size: 22, align: "center" });
    } else if (obj.type === "market_stall") {
      drawBox(screen.x, screen.y - 18, 74, 30, "#8e5b33", "#2b160d");
      ctx.fillStyle = "#e8c56b";
      ctx.fillRect(screen.x - 24, screen.y - 34, 16, 12);
      ctx.fillStyle = "#efe4b0";
      ctx.fillRect(screen.x - 3, screen.y - 35, 18, 10);
      ctx.fillStyle = "#8f6848";
      ctx.fillRect(screen.x + 20, screen.y - 34, 13, 11);
      drawText("STALL", screen.x, screen.y - 42, { color: "#ffe39b", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "fletching_table") {
      drawBox(screen.x, screen.y - 16, 70, 24, "#7b4b2b", "#241209");
      ctx.strokeStyle = "#e7dcc0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screen.x - 22, screen.y - 20);
      ctx.lineTo(screen.x + 18, screen.y - 29);
      ctx.moveTo(screen.x - 18, screen.y - 11);
      ctx.lineTo(screen.x + 20, screen.y - 14);
      ctx.stroke();
      drawText("FLETCH", screen.x, screen.y - 38, { color: "#ffe39b", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "wizard_tower") {
      drawBox(screen.x, screen.y - 34, 48, 62, "#57506d", "#1e1830");
      ctx.fillStyle = "#2e254a";
      ctx.beginPath();
      ctx.moveTo(screen.x - 28, screen.y - 63);
      ctx.lineTo(screen.x, screen.y - 93);
      ctx.lineTo(screen.x + 28, screen.y - 63);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#bfb5ff";
      ctx.stroke();
      drawText("MAGIC", screen.x, screen.y - 101, { color: "#d9d2ff", outline: "#000", size: 9, align: "center" });
    } else if (obj.action === "runecraft") {
      drawRunecraftingAltar(obj, screen);
    } else if (obj.type === "vegetable_patch" || obj.type === "herb_patch") {
      drawFarmPatch(obj, screen);
    } else if (obj.type === "compost_bin") {
      drawBox(screen.x, screen.y - 15, 48, 30, "#6c4528", "#221108");
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(screen.x - 20, screen.y - 28, 40, 8);
      drawText("COMPOST", screen.x, screen.y - 39, { color: "#d9c47e", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "scarecrow") {
      ctx.strokeStyle = "#5c321e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y - 8);
      ctx.lineTo(screen.x, screen.y - 48);
      ctx.moveTo(screen.x - 20, screen.y - 34);
      ctx.lineTo(screen.x + 20, screen.y - 34);
      ctx.stroke();
      drawBox(screen.x, screen.y - 24, 24, 22, "#7b5b2f", "#2c190b");
      drawText("?", screen.x, screen.y - 55, { color: "#ffe39b", outline: "#000", size: 12, align: "center" });
    } else if (obj.type === "seed_sacks") {
      drawBox(screen.x - 8, screen.y - 10, 24, 24, "#9c7a3c", "#3c2910");
      drawBox(screen.x + 10, screen.y - 8, 26, 22, "#8a6935", "#3c2910");
      drawText("SEED", screen.x, screen.y - 31, { color: "#f1d98b", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "balance_log") {
      ctx.save();
      ctx.translate(screen.x, screen.y - 13);
      ctx.rotate(-0.25);
      drawBox(0, 0, 82, 12, "#7a4a27", "#251309");
      ctx.restore();
      drawText("AGI", screen.x, screen.y - 33, { color: "#a9ff8f", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "rope_swing") {
      ctx.strokeStyle = "#5c321e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screen.x - 26, screen.y - 8);
      ctx.lineTo(screen.x - 26, screen.y - 58);
      ctx.lineTo(screen.x + 26, screen.y - 58);
      ctx.lineTo(screen.x + 26, screen.y - 8);
      ctx.stroke();
      ctx.strokeStyle = "#d7c08a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y - 58);
      ctx.lineTo(screen.x + 7, screen.y - 19);
      ctx.stroke();
      drawBox(screen.x + 7, screen.y - 14, 22, 8, "#9b6335", "#28160b");
    } else if (obj.type === "stepping_stones") {
      for (let i = 0; i < 4; i += 1) {
        ctx.fillStyle = i % 2 ? "#8b8b82" : "#a19d91";
        ctx.beginPath();
        ctx.ellipse(screen.x - 30 + i * 20, screen.y - 10 - (i % 2) * 4, 11, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#393730";
        ctx.stroke();
      }
    } else if (obj.type === "dock") {
      drawBox(screen.x, screen.y - 8, 80, 16, "#8b5c32", "#3f2412");
    } else if (obj.type === "ditch") {
      drawBox(screen.x, screen.y - 8, 90, 16, "#2b1a10", "#080604");
      drawText("WILDY", screen.x, screen.y - 22, { color: "#ff8a6b", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "chaos_altar") {
      drawBox(screen.x, screen.y - 24, 54, 34, "#4d3857", "#190d1f");
      drawText("*", screen.x, screen.y - 38, { color: "#c18cff", outline: "#000", size: 20, align: "center" });
    } else if (obj.type === "ruins") {
      drawBox(screen.x, screen.y - 14, 62, 22, "#51463d", "#1b1714");
    } else if (obj.type === "chest") {
      drawBox(screen.x, screen.y - 18, 40, 24, "#5e3924", "#20110a");
      ctx.strokeStyle = "#d9b45f";
      ctx.beginPath();
      ctx.moveTo(screen.x - 18, screen.y - 10);
      ctx.lineTo(screen.x + 18, screen.y - 10);
      ctx.stroke();
    }
  }

  function drawRunecraftingAltar(obj, screen) {
    const recipe = RUNECRAFTING_RECIPES[obj.rune] || RUNECRAFTING_RECIPES.air;
    const pulse = 0.5 + Math.sin(state.time * 3 + obj.x) * 0.15;
    drawDiamond(screen.x, screen.y - 3, 74, 38, "#3a3147", "#191326");
    ctx.fillStyle = recipe.color;
    ctx.globalAlpha = 0.45 + pulse * 0.28;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y - 18, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = recipe.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y - 18, 22, 0, Math.PI * 2);
    ctx.stroke();
    drawText(recipe.name.toUpperCase(), screen.x, screen.y - 48, { color: recipe.color, outline: "#000", size: 10, align: "center" });
  }

  function drawFarmPatch(obj, screen) {
    const patch = state.farmingPatches?.[obj.patchId] || {};
    drawDiamond(screen.x, screen.y - 4, 86, 42, "#604326", "#211307");
    drawDiamond(screen.x, screen.y - 7, 70, 32, patch.watered ? "#4c3d26" : "#795536", "#2b1a0f");
    for (let i = 0; i < 5; i += 1) {
      const ox = -24 + i * 12;
      ctx.strokeStyle = "rgba(33,19,9,0.5)";
      ctx.beginPath();
      ctx.moveTo(screen.x + ox - 8, screen.y - 7);
      ctx.lineTo(screen.x + ox + 8, screen.y - 7);
      ctx.stroke();
    }
    if (!patch.crop) {
      drawText(obj.patchId === "herb" ? "HERB" : "PATCH", screen.x, screen.y - 28, { color: "#d9c47e", outline: "#000", size: 9, align: "center" });
      return;
    }
    const progress = cropProgress(patch);
    const crop = FARM_CROPS[patch.crop];
    const sproutCount = patch.crop === "mirthleaf" ? 4 : 5;
    const plantColor = patch.diseased ? "#8b6b35" : patch.crop === "mirthleaf" ? "#69ce63" : "#8bd15a";
    for (let i = 0; i < sproutCount; i += 1) {
      const ox = -24 + i * (48 / Math.max(1, sproutCount - 1));
      const height = 7 + progress * (patch.crop === "mirthleaf" ? 22 : 15) + (i % 2) * 2;
      ctx.strokeStyle = plantColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screen.x + ox, screen.y - 11);
      ctx.lineTo(screen.x + ox, screen.y - 11 - height);
      ctx.stroke();
      ctx.fillStyle = plantColor;
      ctx.beginPath();
      ctx.ellipse(screen.x + ox - 4, screen.y - 18 - height * 0.5, 5, 3, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screen.x + ox + 4, screen.y - 22 - height * 0.45, 5, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (cropReady(patch) && !patch.diseased) drawText("READY", screen.x, screen.y - 45, { color: "#eaff82", outline: "#000", size: 9, align: "center" });
    else if (patch.diseased) drawText("SICK", screen.x, screen.y - 45, { color: "#ff9b64", outline: "#000", size: 9, align: "center" });
    else drawText(crop.name.toUpperCase().slice(0, 10), screen.x, screen.y - 45, { color: "#c9ef9a", outline: "#000", size: 8, align: "center" });
  }

  function drawBox(cx, cy, w, h, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  }

  function drawNpc(npc) {
    const screen = screenOf(npc);
    if (screen.x < -80 || screen.x > VIEW.w + 80 || screen.y < -100 || screen.y > VIEW.h + 80) return;
    const color = npc.role === "slayer" ? "#243c44" : npc.role === "banker" ? "#273b68" : npc.role === "priest" ? "#e8e2c7" : npc.role === "apothecary" ? "#365c3c" : npc.role === "fletcher" ? "#80512d" : npc.role === "gardener" ? "#5f7b34" : npc.role === "wizard" ? "#513b8f" : npc.role === "squire" ? "#7b6a35" : "#7f5231";
    drawHumanoid(screen.x, screen.y, color, "#f0c69b");
    drawText(npc.name, screen.x, screen.y - 58, { color: "#ffeaaa", outline: "#000", size: 10, align: "center" });
    if (npc.role === "slayer") drawText("!", screen.x + 16, screen.y - 45, { color: "#6feaff", outline: "#000", size: 18, align: "center" });
    if (npc.role === "gardener") drawText("*", screen.x + 15, screen.y - 45, { color: "#d8ff77", outline: "#000", size: 15, align: "center" });
    if (npc.role === "wizard") drawText("*", screen.x + 15, screen.y - 45, { color: "#d9d2ff", outline: "#000", size: 16, align: "center" });
    if (npc.role === "squire") drawText("cw", screen.x + 17, screen.y - 45, { color: "#f0d25d", outline: "#000", size: 10, align: "center" });
  }

  function drawBarks() {
    for (const bark of state.barks) {
      const npc = state.npcs.find((candidate) => candidate.id === bark.actorId);
      if (!npc) continue;
      const screen = screenOf(npc);
      const alpha = clamp(bark.ttl / 0.5, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "10px Verdana, Tahoma, sans-serif";
      const width = Math.min(190, Math.max(70, ctx.measureText(bark.text).width + 18));
      const x = clamp(screen.x - width / 2, 8, VIEW.w - width - 8);
      const y = screen.y - 88;
      ctx.fillStyle = "rgba(26,18,10,0.92)";
      ctx.fillRect(x, y, width, 24);
      ctx.strokeStyle = "#b8934e";
      ctx.strokeRect(x, y, width, 24);
      drawText(bark.text, x + width / 2, y + 13, { color: "#f8e7ba", outline: "#000", size: 10, align: "center" });
      ctx.restore();
    }
  }

  function drawEnemy(enemy) {
    const screen = screenOf(enemy);
    if (screen.x < -80 || screen.x > VIEW.w + 80 || screen.y < -100 || screen.y > VIEW.h + 80) return;
    const colors = {
      chicken: "#f5f0dc",
      giant_rat: "#67513b",
      pasture_cow: "#f0e8d2",
      field_imp: "#b64c48",
      dark_wizard: "#1f3d86",
      black_knight: "#1e1e22",
      grave_skeleton: "#dfd8bd",
      cave_crawler: "#3f6051",
      deep_wight: "#5860a8",
      lesser_demon: "#8e2f32",
      moss_brute: "#557b3e",
    };
    ctx.save();
    if (enemy.hitFlash > 0) ctx.globalAlpha = 0.5 + Math.sin(state.time * 80) * 0.25;
    if (enemy.type === "chicken") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 17, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f0c94d";
      ctx.beginPath();
      ctx.moveTo(screen.x + 13, screen.y - 19);
      ctx.lineTo(screen.x + 24, screen.y - 16);
      ctx.lineTo(screen.x + 13, screen.y - 13);
      ctx.fill();
      ctx.fillStyle = "#d43a33";
      ctx.beginPath();
      ctx.arc(screen.x - 2, screen.y - 31, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d0c2a4";
      ctx.beginPath();
      ctx.moveTo(screen.x - 6, screen.y - 7);
      ctx.lineTo(screen.x - 9, screen.y + 2);
      ctx.moveTo(screen.x + 5, screen.y - 7);
      ctx.lineTo(screen.x + 7, screen.y + 2);
      ctx.stroke();
    } else if (enemy.type === "giant_rat") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 15, 19, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1b1510";
      ctx.beginPath();
      ctx.arc(screen.x + 7, screen.y - 18, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d6c6aa";
      ctx.beginPath();
      ctx.moveTo(screen.x - 16, screen.y - 13);
      ctx.lineTo(screen.x - 30, screen.y - 11);
      ctx.stroke();
    } else if (enemy.type === "pasture_cow") {
      ctx.fillStyle = "#efe3c7";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 20, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b2119";
      ctx.fillRect(screen.x - 15, screen.y - 27, 9, 8);
      ctx.fillRect(screen.x + 4, screen.y - 17, 11, 8);
      ctx.fillStyle = "#d8c8aa";
      ctx.beginPath();
      ctx.ellipse(screen.x + 21, screen.y - 24, 9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2b2119";
      ctx.beginPath();
      ctx.moveTo(screen.x - 17, screen.y - 8);
      ctx.lineTo(screen.x - 19, screen.y + 3);
      ctx.moveTo(screen.x + 4, screen.y - 8);
      ctx.lineTo(screen.x + 3, screen.y + 3);
      ctx.moveTo(screen.x + 24, screen.y - 29);
      ctx.lineTo(screen.x + 31, screen.y - 36);
      ctx.stroke();
    } else if (enemy.type === "grave_skeleton") {
      drawHumanoid(screen.x, screen.y, "#d8d0ba", "#efe8cd");
      drawText("x", screen.x, screen.y - 44, { color: "#1f1f1f", size: 10, align: "center" });
    } else if (enemy.type === "dark_wizard") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#c7b08f", 0.95);
      ctx.fillStyle = "#18306f";
      ctx.beginPath();
      ctx.moveTo(screen.x - 14, screen.y - 48);
      ctx.lineTo(screen.x, screen.y - 67);
      ctx.lineTo(screen.x + 14, screen.y - 48);
      ctx.closePath();
      ctx.fill();
      drawText("*", screen.x + 18, screen.y - 39, { color: "#9cd8ff", outline: "#000", size: 14, align: "center" });
    } else if (enemy.type === "black_knight") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#c5a276", 1.12);
      ctx.strokeStyle = "#cfd2d6";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screen.x + 16, screen.y - 32);
      ctx.lineTo(screen.x + 32, screen.y - 50);
      ctx.stroke();
    } else if (enemy.type === "moss_brute") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#7b9f58", 1.25);
    } else if (enemy.type === "cave_crawler") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 17, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#233b31";
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(screen.x + i * 8, screen.y - 10);
        ctx.lineTo(screen.x + i * 11, screen.y + 3);
        ctx.stroke();
      }
    } else if (enemy.type === "deep_wight") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#95a0e8", 1.18);
      ctx.strokeStyle = "#b7c3ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screen.x - 18, screen.y - 48);
      ctx.lineTo(screen.x + 18, screen.y - 18);
      ctx.stroke();
      drawText("*", screen.x + 19, screen.y - 48, { color: "#dce6ff", outline: "#000", size: 18, align: "center" });
    } else if (enemy.slayerType === "crypt_brother") {
      drawHumanoid(screen.x, screen.y, "#4f5a5a", "#b9c7c6", 1.2);
      ctx.strokeStyle = "#d6f0ee";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screen.x - 20, screen.y - 22);
      ctx.lineTo(screen.x + 18, screen.y - 52);
      ctx.stroke();
      drawText("!", screen.x + 19, screen.y - 49, { color: "#d6f0ee", outline: "#000", size: 16, align: "center" });
    } else if (enemy.type === "lesser_demon") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#b85b52", 1.35);
      ctx.fillStyle = "#5b171a";
      ctx.beginPath();
      ctx.moveTo(screen.x - 15, screen.y - 53);
      ctx.lineTo(screen.x - 30, screen.y - 69);
      ctx.lineTo(screen.x - 7, screen.y - 61);
      ctx.moveTo(screen.x + 15, screen.y - 53);
      ctx.lineTo(screen.x + 30, screen.y - 69);
      ctx.lineTo(screen.x + 7, screen.y - 61);
      ctx.fill();
    } else {
      drawHumanoid(screen.x, screen.y, colors[enemy.type] || "#99505a", "#cc817b", 0.8);
    }
    ctx.restore();
    drawHpBar(screen.x, screen.y - 60, 44, enemy.hp / enemy.maxHp);
    drawText(`${enemy.name} (${enemy.level})`, screen.x, screen.y - 72, { color: "#ffd6d6", outline: "#000", size: 10, align: "center" });
  }

  function drawPlayer() {
    const screen = screenOf(state.player);
    drawShadow(screen.x, screen.y);
    drawHumanoid(screen.x, screen.y, "#3f65a8", "#f0c69b");
    const weapon = state.player.equipment.weapon;
    if (weapon) {
      ctx.strokeStyle = ITEMS[weapon].color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screen.x + 13, screen.y - 31);
      ctx.lineTo(screen.x + 30, screen.y - 47);
      ctx.stroke();
    }
    drawText(state.player.name, screen.x, screen.y - 58, { color: "#ffffff", outline: "#000", size: 11, align: "center" });
    if (state.player.action) {
      drawProgress(screen.x, screen.y - 72, 54, state.player.action.progress / state.player.action.duration);
    }
  }

  function drawHumanoid(x, y, body, skin, scale = 1) {
    drawShadow(x, y);
    ctx.fillStyle = body;
    ctx.fillRect(x - 9 * scale, y - 35 * scale, 18 * scale, 24 * scale);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(x, y - 45 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#202020";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8 * scale, y - 11 * scale);
    ctx.lineTo(x - 13 * scale, y);
    ctx.moveTo(x + 8 * scale, y - 11 * scale);
    ctx.lineTo(x + 13 * scale, y);
    ctx.moveTo(x - 9 * scale, y - 26 * scale);
    ctx.lineTo(x - 20 * scale, y - 21 * scale);
    ctx.moveTo(x + 9 * scale, y - 26 * scale);
    ctx.lineTo(x + 20 * scale, y - 21 * scale);
    ctx.stroke();
  }

  function drawShadow(x, y) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 19, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFire(fire) {
    const screen = screenOf(fire);
    const flicker = Math.sin(state.time * 16 + fire.x) * 4;
    ctx.fillStyle = "#6a381c";
    ctx.fillRect(screen.x - 17, screen.y - 8, 34, 7);
    ctx.fillStyle = "#ffcf4a";
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y - 35 - flicker);
    ctx.lineTo(screen.x + 12, screen.y - 8);
    ctx.lineTo(screen.x - 12, screen.y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff5a2b";
    ctx.beginPath();
    ctx.moveTo(screen.x + 4, screen.y - 29 + flicker);
    ctx.lineTo(screen.x + 8, screen.y - 8);
    ctx.lineTo(screen.x - 6, screen.y - 8);
    ctx.closePath();
    ctx.fill();
  }

  function drawHpBar(x, y, w, pct) {
    ctx.fillStyle = "#2b0b0b";
    ctx.fillRect(x - w / 2, y, w, 6);
    ctx.fillStyle = pct > 0.5 ? "#59d14f" : pct > 0.25 ? "#e0b540" : "#c43b32";
    ctx.fillRect(x - w / 2 + 1, y + 1, Math.max(0, (w - 2) * pct), 4);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x - w / 2, y, w, 6);
  }

  function drawProgress(x, y, w, pct) {
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(x - w / 2, y, w, 7);
    ctx.fillStyle = "#efd36e";
    ctx.fillRect(x - w / 2 + 1, y + 1, (w - 2) * clamp(pct, 0, 1), 5);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x - w / 2, y, w, 7);
  }

  function drawTopWorldLabels() {
    ctx.fillStyle = "rgba(28,20,10,0.85)";
    ctx.fillRect(12, 10, 520, 52);
    ctx.strokeStyle = "#7c622d";
    ctx.strokeRect(12, 10, 520, 52);
    drawText(`BoonScape 2005 - ${state.areaName}`, 24, 29, { color: "#ffd86b", outline: "#000", size: 17, align: "left" });
    const task = state.slayer.task ? `${state.slayer.task.remaining} ${state.slayer.task.label}` : "No task";
    const boosts = activeBoosts().map(([skill, amount]) => `${skill.slice(0, 3)}+${amount}`).join(" ");
    drawText(`Combat ${combatLevel()}  HP ${Math.ceil(state.player.hp)}/${maxHp()}  Prayer ${prayerLabel(state.player.prayerMode)}  Slayer: ${task}${boosts ? `  Boosts ${boosts}` : ""}`, 24, 50, {
      color: "#f6e5bd",
      outline: "#000",
      size: 11,
      align: "left",
    });
    if (state.castleWars.active) {
      drawText(`Castle Wars ${state.castleWars.score}-${state.castleWars.enemyScore}${state.castleWars.flagHeld ? "  FLAG!" : ""}`, VIEW.w - 18, 29, {
        color: "#f0d25d",
        outline: "#000",
        size: 12,
        align: "right",
      });
    }
  }

  function drawPanel() {
    state.uiRects = [];
    ctx.fillStyle = "#4d341c";
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.fillStyle = "#2f2114";
    ctx.fillRect(PANEL.x + 8, PANEL.y + 8, PANEL.w - 16, PANEL.h - 16);
    ctx.strokeStyle = "#947437";
    ctx.lineWidth = 3;
    ctx.strokeRect(PANEL.x + 8, PANEL.y + 8, PANEL.w - 16, PANEL.h - 16);

    drawMinimap(PANEL.x + 20, PANEL.y + 18, PANEL.w - 40, 156);
    drawPlayerOrbs(PANEL.x + 20, PANEL.y + 182, PANEL.w - 40, 52);
    drawTabs(PANEL.x + 16, PANEL.y + 242, PANEL.w - 32, 44);
    drawTabContent(PANEL.x + 18, PANEL.y + 294, PANEL.w - 36, PANEL.h - 310);
  }

  function drawMinimap(x, y, w, h) {
    pushRect({ kind: "minimap", x, y, w, h });
    ctx.fillStyle = "#111b12";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#b4974d";
    ctx.strokeRect(x, y, w, h);
    const scale = Math.min(w / WORLD_W, h / WORLD_H);
    const mapW = WORLD_W * scale;
    const mapH = WORLD_H * scale;
    const ox = x + (w - mapW) / 2;
    const oy = y + (h - mapH) / 2;
    for (let yy = 0; yy < WORLD_H; yy += 1) {
      for (let xx = 0; xx < WORLD_W; xx += 1) {
        const terrain = mapAt(xx, yy);
        const color = terrain === "water" ? "#1f6ca0" : terrain === "path" ? "#a17a45" : terrain === "town" ? "#b4a68c" : terrain === "stone" ? "#787871" : terrain === "swamp" ? "#506c3f" : "#39702c";
        ctx.fillStyle = color;
        ctx.fillRect(ox + xx * scale, oy + yy * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }
    for (const npc of state.npcs) {
      ctx.fillStyle = "#fff067";
      ctx.fillRect(ox + npc.x * scale - 1, oy + npc.y * scale - 1, 3, 3);
    }
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      ctx.fillStyle = "#ff5050";
      ctx.fillRect(ox + enemy.x * scale - 1, oy + enemy.y * scale - 1, 2, 2);
    }
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ox + state.player.x * scale, oy + state.player.y * scale, 3, 0, Math.PI * 2);
    ctx.fill();
    drawText("Map", x + 8, y + 16, { size: 11, color: "#f7df9a", outline: "#000", align: "left" });
  }

  function drawPlayerOrbs(x, y, w, h) {
    const hpPct = state.player.hp / maxHp();
    drawOrb(x + 30, y + 26, 22, hpPct, "#c83b33", `${Math.ceil(state.player.hp)}`);
    drawOrb(x + 86, y + 26, 22, state.player.prayerPoints / maxPrayer(), "#d9d2b2", `${Math.floor(state.player.prayerPoints)}`);
    drawOrb(x + 142, y + 26, 22, getLevel("Magic") / 99, "#5ea1ff", `${getLevel("Magic")}`);
    drawOrb(x + 198, y + 26, 22, state.player.runEnergy / 100, "#65d06d", `${Math.floor(state.player.runEnergy)}`);
    drawText("HP", x + 30, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    drawText("Pray", x + 86, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    drawText("Mage", x + 142, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    drawText("Run", x + 198, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
  }

  function drawOrb(x, y, r, pct, color, label) {
    ctx.fillStyle = "#18110b";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r - 3, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#3b2a1c";
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = color;
    ctx.fillRect(x - r, y + r - pct * r * 2, r * 2, pct * r * 2);
    ctx.restore();
    ctx.strokeStyle = "#c3a55b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    drawText(label, x, y + 4, { size: 12, color: "#fff", outline: "#000", align: "center" });
  }

  function drawTabs(x, y, w, h) {
    const tabW = Math.floor(w / tabs.length);
    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      const rect = { kind: "tab", tab, x: x + i * tabW, y, w: tabW - 2, h };
      pushRect(rect);
      ctx.fillStyle = state.tab === tab ? "#84602e" : "#3b2a19";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "#a68a4a";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      const icon = ["bag", "sk", "qu", "eq", "sp", "op"][i];
      drawText(icon, rect.x + rect.w / 2, rect.y + 18, { size: 11, color: "#ffe7a4", outline: "#000", align: "center" });
      drawText(tabLabels[tab].split(" ")[0], rect.x + rect.w / 2, rect.y + 34, { size: 8, color: "#f2dcaa", outline: "#000", align: "center" });
    }
  }

  function drawTabContent(x, y, w, h) {
    ctx.fillStyle = "#20150d";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#725a2e";
    ctx.strokeRect(x, y, w, h);
    if (state.tab === "inventory") drawInventory(x + 10, y + 12, false);
    else if (state.tab === "skills") drawSkills(x + 10, y + 10, w - 20, h - 20);
    else if (state.tab === "quests") drawQuests(x + 10, y + 12, w - 20, h - 20);
    else if (state.tab === "equipment") drawEquipment(x + 10, y + 12, w - 20, h - 20);
    else if (state.tab === "magic") drawMagic(x + 10, y + 12, w - 20, h - 20);
    else if (state.tab === "settings") drawSettings(x + 10, y + 12, w - 20, h - 20);
  }

  function drawInventory(x, y, bankMode) {
    const cell = 50;
    const gap = 4;
    for (let i = 0; i < state.player.inventory.length; i += 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const rect = { kind: bankMode ? "bankInventorySlot" : "inventorySlot", slot: i, x: x + col * (cell + gap), y: y + row * (cell + gap), w: cell, h: cell };
      pushRect(rect);
      drawItemSlot(rect, state.player.inventory[i]);
    }
  }

  function drawItemSlot(rect, item) {
    ctx.fillStyle = "#3a2817";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "#7a5d30";
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (!item) return;
    const data = ITEMS[item.id];
    ctx.fillStyle = data.color || "#ddd";
    ctx.fillRect(rect.x + 10, rect.y + 10, rect.w - 20, rect.h - 20);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(rect.x + 10, rect.y + 10, rect.w - 20, rect.h - 20);
    drawText(data.icon || item.id.slice(0, 2), rect.x + rect.w / 2, rect.y + rect.h / 2 + 4, { size: 12, color: "#fff", outline: "#000", align: "center" });
    if (item.qty > 1) {
      drawText(compactNumber(item.qty), rect.x + 4, rect.y + 12, { size: 10, color: "#ffe46b", outline: "#000", align: "left" });
    }
  }

  function compactNumber(value) {
    if (value >= 1000000) return `${Math.floor(value / 1000000)}m`;
    if (value >= 1000) return `${Math.floor(value / 1000)}k`;
    return String(value);
  }

  function drawSkills(x, y, w, h) {
    drawText("Level / XP left", x, y + 12, { color: "#f6e1a5", outline: "#000", size: 12, align: "left" });
    const colW = w / 2;
    skillNames.forEach((skill, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = x + col * colW;
      const sy = y + 28 + row * 28;
      const level = getLevel(skill);
      const boost = state.player.boosts?.[skill] || 0;
      pushRect({ kind: "skillGuide", skill, x: sx - 2, y: sy - 10, w: colW - 6, h: 22 });
      const color = skill === "Slayer" ? "#69e7ff" : skill === "Runecrafting" ? "#d5c7ff" : skill === "Farming" || skill === "Herblore" ? "#a9ff8f" : "#ffe7a8";
      drawText(skillShortName(skill), sx, sy, { color, outline: "#000", size: 10, align: "left" });
      drawText(boost ? `${level}+${boost}` : `${level}`, sx + colW - 36, sy, { color: boost ? "#77ff77" : "#ffffff", outline: "#000", size: 11, align: "right" });
      drawText(`${xpToNext(skill)}`, sx + colW - 4, sy, { color: "#cdbb8a", outline: "#000", size: 8, align: "right" });
    });
    const taskText = state.slayer.task ? `${state.slayer.task.remaining} ${state.slayer.task.label}` : "Ask Vann for work";
    drawText(`Slayer: ${taskText}`, x, y + h - 22, { color: "#83efff", outline: "#000", size: 12, align: "left" });
  }

  function skillShortName(skill) {
    return {
      Hitpoints: "Hits",
      Woodcutting: "Woodcut",
      Firemaking: "Firemake",
      Fletching: "Fletch",
      Runecrafting: "Runecraft",
      Herblore: "Herb",
    }[skill] || skill;
  }

  function drawQuests(x, y, w, h) {
    drawText("Quests", x, y + 10, { color: "#f6e1a5", outline: "#000", size: 14, align: "left" });
    let yy = y + 34;
    for (const quest of Object.values(state.quests)) {
      const color = quest.state === "completed" ? "#78e05f" : quest.state === "started" ? "#ffe46b" : "#d0c0a0";
      drawText(`${quest.title}`, x, yy, { color, outline: "#000", size: 12, align: "left" });
      drawText(`${quest.state}`, x + w, yy, { color, outline: "#000", size: 10, align: "right" });
      drawText(fitLine(quest.text, w, 10), x, yy + 14, { color: "#cdbb8a", outline: "#000", size: 10, align: "left" });
      yy += 42;
    }
    if (state.clue) {
      drawText("Active Clue", x, yy, { color: "#83efff", outline: "#000", size: 12, align: "left" });
      wrapText(state.clue.hint, x, yy + 14, w, 11, "#cdbb8a");
      yy += 48;
    }
    if (state.farmingContract) {
      drawText("Farming Contract", x, yy, { color: "#a9ff8f", outline: "#000", size: 12, align: "left" });
      drawText(`${state.farmingContract.amount} x ${state.farmingContract.label}`, x, yy + 14, { color: "#cdbb8a", outline: "#000", size: 10, align: "left" });
      yy += 38;
    }
    const diaryY = Math.min(yy + 8, y + h - 156);
    const done = diaryCompletedCount();
    drawText(`Boonshire Diary ${done}/${DIARY_TASKS.length}`, x, diaryY, { color: "#6feaff", outline: "#000", size: 12, align: "left" });
    const visibleDiaryTasks = DIARY_TASKS.slice(0, 4);
    visibleDiaryTasks.forEach((task, i) => {
      drawText(`${task.done() ? "*" : "-"} ${task.label}`, x, diaryY + 18 + i * 15, {
        color: task.done() ? "#78e05f" : "#cdbb8a",
        outline: "#000",
        size: 10,
        align: "left",
      });
    });
    if (DIARY_TASKS.length > visibleDiaryTasks.length) {
      drawText(`...and ${DIARY_TASKS.length - visibleDiaryTasks.length} more tasks`, x, diaryY + 18 + visibleDiaryTasks.length * 15, {
        color: "#9fb894",
        outline: "#000",
        size: 10,
        align: "left",
      });
    }
    if (done === DIARY_TASKS.length && !state.diaryRewardClaimed) {
      const rect = { kind: "diaryClaim", x, y: diaryY + 122, w, h: 28 };
      pushRect(rect);
      drawButton(rect, "Claim diary reward");
    } else {
      drawText(state.diaryRewardClaimed ? "Diary reward claimed." : "Open the Collection Log in Options.", x, y + h - 58, { color: "#f0d8a0", outline: "#000", size: 10, align: "left" });
    }
    const diaryOpen = { kind: "diaryOpen", x, y: y + h - 40, w, h: 28 };
    pushRect(diaryOpen);
    drawButton(diaryOpen, "View full diary");
  }

  function drawEquipment(x, y, w, h) {
    drawText(`Combat level ${combatLevel()}`, x, y + 12, { color: "#f6e1a5", outline: "#000", size: 14, align: "left" });
    const slots = [
      ["helm", x + 92, y + 42],
      ["weapon", x + 28, y + 112],
      ["body", x + 92, y + 112],
      ["shield", x + 156, y + 112],
      ["legs", x + 92, y + 182],
      ["amulet", x + 156, y + 42],
    ];
    for (const [slot, sx, sy] of slots) {
      const rect = { kind: "equipSlot", slot, x: sx, y: sy, w: 54, h: 54 };
      pushRect(rect);
      drawItemSlot(rect, state.player.equipment[slot] ? { id: state.player.equipment[slot], qty: 1 } : null);
      drawText(slot, sx + 27, sy + 68, { color: "#cdbb8a", outline: "#000", size: 10, align: "center" });
    }
    drawText(`Attack bonus ${equipmentBonus("attack")}`, x, y + h - 72, { color: "#fff1ba", outline: "#000", size: 12, align: "left" });
    drawText(`Strength bonus ${equipmentBonus("strength")}`, x, y + h - 50, { color: "#fff1ba", outline: "#000", size: 12, align: "left" });
    drawText(`Defence bonus ${equipmentBonus("defence")}`, x, y + h - 28, { color: "#fff1ba", outline: "#000", size: 12, align: "left" });
  }

  function drawMagic(x, y, w, h) {
    drawText("Spellbook", x, y + 12, { color: "#f6e1a5", outline: "#000", size: 14, align: "left" });
    const spells = [
      { id: "home", name: "Home Teleport", note: "Back to town" },
      { id: "wind", name: "Wind Poke", note: "1 air + 1 mind" },
      { id: "fire", name: "Fire Bolt", note: "2 air + 1 chaos" },
      { id: "crumble", name: "Crumble", note: "undead: chaos + death" },
      { id: "alchemy", name: "Low Alchemy", note: "turn item to coins" },
    ];
    spells.forEach((spell, i) => {
      const rect = { kind: "spell", spell: spell.id, x, y: y + 36 + i * 58, w, h: 46 };
      pushRect(rect);
      ctx.fillStyle = "#24364d";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "#6c8cb8";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      drawText(spell.name, rect.x + 10, rect.y + 18, { color: "#cfe6ff", outline: "#000", size: 12, align: "left" });
      drawText(spell.note, rect.x + 10, rect.y + 36, { color: "#a8c0d8", outline: "#000", size: 10, align: "left" });
    });
    const runeY = y + h - 74;
    drawText(`Runes: air ${inventoryCount("air_rune")}  mind ${inventoryCount("mind_rune")}`, x, runeY, { color: "#dcecff", outline: "#000", size: 11, align: "left" });
    drawText(`chaos ${inventoryCount("chaos_rune")}  law ${inventoryCount("law_rune")}  death ${inventoryCount("death_rune")}`, x, runeY + 17, { color: "#dcecff", outline: "#000", size: 11, align: "left" });
    drawText(`Pouch: ${runePouchText()}`, x, runeY + 34, { color: "#d5c7ff", outline: "#000", size: 11, align: "left" });
  }

  function drawSettings(x, y, w, h) {
    drawText("Options", x, y + 12, { color: "#f6e1a5", outline: "#000", size: 14, align: "left" });
    const buttons = [
      { id: "run", label: `Run: ${state.player.run ? "On" : "Off"} (${Math.floor(state.player.runEnergy)}%)` },
      { id: "style", label: `Style: ${state.player.combatStyle}` },
      { id: "prayer", label: `Prayer: ${prayerLabel(state.player.prayerMode)}` },
      { id: "music", label: `Music: ${state.musicOn ? "On" : "Off"}` },
      { id: "collection", label: "Collection log" },
      { id: "worldMap", label: "World map" },
      { id: "save", label: "Save game" },
      { id: "load", label: "Load game" },
      { id: "fullscreen", label: "Fullscreen" },
    ];
    buttons.forEach((button, i) => {
      const rect = { kind: "setting", setting: button.id, x, y: y + 36 + i * 36, w, h: 29 };
      pushRect(rect);
      drawButton(rect, button.label);
    });
    wrapText("Keys: 1-6 tabs, WASD walk, M map, F fullscreen, Esc closes panels.", x, y + h - 38, w, 12, "#cdbb8a");
  }

  function prayerLabel(mode) {
    if (mode === "thickSkin") return "Thick Skin";
    if (mode === "burstStrength") return "Burst Str";
    if (mode === "sharpEye") return "Sharp Eye";
    if (mode === "rapidHeal") return "Rapid Heal";
    return "Off";
  }

  function openContextMenu(screenX, screenY) {
    if (screenX >= VIEW.w || screenY >= VIEW.h) {
      state.contextMenu = null;
      return;
    }
    const world = unproject(screenX, screenY);
    const picked = pickWorld(screenX, screenY);
    const options = [];
    if (picked) {
      const item = picked.item;
      if (picked.kind === "groundItem") {
        options.push({
          label: `Take ${ITEMS[item.itemId].name}`,
          action: () => moveToTile(Math.floor(item.x), Math.floor(item.y), { kind: "groundItem", id: item.id }),
        });
      } else if (picked.kind === "npc") {
        const primary = item.role === "banker" ? "Bank" : item.role === "shop" || item.role === "fletcher" || item.role === "wizard" ? "Trade" : item.role === "squire" ? "Join / Rewards" : item.role === "slayer" ? "Talk-to / Assignment" : "Talk-to";
        options.push({ label: `${primary} ${item.name}`, action: () => moveAdjacentTo(item, { kind: "npc", id: item.id }) });
      } else if (picked.kind === "enemy") {
        options.push({ label: `Attack ${item.name} (level ${item.level})`, action: () => approachOrAttackEnemy(item) });
      } else if (picked.kind === "resource") {
        const label = item.type.includes("tree") ? "Chop" : item.type === "essence_rock" ? "Mine-essence" : item.type.includes("rock") ? "Mine" : "Net";
        options.push({ label: `${label} ${resourceName(item)}`, action: () => moveAdjacentTo(item, { kind: "resource", id: item.id }) });
      } else if (picked.kind === "scenery") {
        const label = item.action === "steal" ? "Steal-from" : item.action === "agility" ? "Cross" : item.action === "fletch" ? "Fletch-at" : item.action === "farm" ? "Tend" : item.action === "water" ? "Fill-at" : item.action === "runecraft" ? "Craft-rune-at" : item.action === "crypt" ? "Open" : item.action === "crypt_chest" ? "Loot" : item.action === "castle_wars" ? "Enter" : item.action === "castle_flag" ? "Use-flag" : item.action === "castle_supply" ? "Take-from" : item.action === "castle_scoreboard" ? "Read" : item.action === "examine" ? "Look-at" : "Use";
        options.push({ label: `${label} ${item.name}`, action: () => moveAdjacentTo(item, { kind: "scenery", id: item.id }) });
      }
      options.push({ label: `Examine ${contextName(picked.kind, item)}`, action: () => addChat(examineText(picked.kind, item)) });
    }
    options.push({ label: "Walk here", action: () => moveToTile(Math.floor(world.x), Math.floor(world.y)) });
    options.push({ label: "Cancel", action: () => {} });
    ctx.font = "12px Verdana, Tahoma, sans-serif";
    const width = Math.min(260, Math.max(132, ...options.map((option) => ctx.measureText(option.label).width + 24)));
    const height = options.length * 23 + 8;
    state.contextMenu = {
      x: clamp(screenX, 6, CANVAS_W - width - 6),
      y: clamp(screenY, 6, CANVAS_H - height - 6),
      w: width,
      h: height,
      options,
      rects: [],
    };
  }

  function resourceName(resource) {
    if (resource.type === "oak_tree") return "Oak tree";
    if (resource.type === "tree") return "Tree";
    if (resource.type === "copper_rock") return "Copper rock";
    if (resource.type === "tin_rock") return "Tin rock";
    if (resource.type === "iron_rock") return "Iron rock";
    if (resource.type === "gold_rock") return "Gold rock";
    if (resource.type === "essence_rock") return "Rune essence";
    if (resource.type === "fishing_spot") return "Fishing spot";
    return resource.type;
  }

  function contextName(kind, item) {
    if (kind === "groundItem") return ITEMS[item.itemId].name;
    if (kind === "resource") return resourceName(item);
    return item.name;
  }

  function examineText(kind, item) {
    if (kind === "groundItem") return `It's ${formatItem(item.itemId, item.qty)} on the ground.`;
    if (kind === "enemy") return `A level ${item.level} ${item.name}. ${item.finisher ? `Needs ${ITEMS[item.finisher].name.toLowerCase()} at the end.` : "It looks grindable."}`;
    if (kind === "npc") return `${item.name} seems ready to repeat the same line forever.`;
    if (kind === "resource") return `A ${resourceName(item).toLowerCase()} waiting to become experience.`;
    if (kind === "scenery" && item.action === "agility") return `A very official-looking shortcut for Agility level ${item.level || 1}.`;
    if (kind === "scenery" && item.action === "fletch") return "A table covered in arrow shafts, curls of wood, and bad business margins.";
    if (kind === "scenery" && item.action === "farm") return `${item.name}: ${farmPatchStatus(item.patchId)}.`;
    if (kind === "scenery" && item.action === "compost") return "A wooden bin where spare crops become useful dirt.";
    if (kind === "scenery" && item.action === "water") return "A town well. Excellent for vials and rumours.";
    if (kind === "scenery" && item.action === "runecraft") return `${item.name}: ${RUNECRAFTING_RECIPES[item.rune].name} runes require Runecrafting ${RUNECRAFTING_RECIPES[item.rune].level}.`;
    if (kind === "scenery" && item.action === "crypt") return `${item.name}: a slab for one of the crypt brothers. ${cryptStatusText()}.`;
    if (kind === "scenery" && item.action === "crypt_chest") return `The crypt chest is sealed by old combat nonsense. ${cryptStatusText()}.`;
    if (kind === "scenery" && item.action?.startsWith("castle")) return `${item.name}: ${castleWarsScoreText()}`;
    if (kind === "scenery" && item.type === "wizard_tower") return "A squat tower full of essence dust, glowing circles, and bad robes.";
    if (kind === "scenery" && item.type === "scarecrow") return "It has the posture of a moderator and the wardrobe of a farmer.";
    if (kind === "scenery" && item.type === "seed_sacks") return "Seed sacks stacked with absolute 2005 confidence.";
    return `You examine the ${item.name}.`;
  }

  function drawContextMenu() {
    const menu = state.contextMenu;
    if (!menu) return;
    menu.rects = [];
    ctx.fillStyle = "rgba(26, 18, 10, 0.98)";
    ctx.fillRect(menu.x, menu.y, menu.w, menu.h);
    ctx.strokeStyle = "#c3a35d";
    ctx.lineWidth = 2;
    ctx.strokeRect(menu.x, menu.y, menu.w, menu.h);
    drawText("Choose Option", menu.x + 10, menu.y + 14, { color: "#ffd86b", outline: "#000", size: 11, align: "left" });
    for (let i = 0; i < menu.options.length; i += 1) {
      const rect = { ...menu.options[i], x: menu.x + 4, y: menu.y + 24 + i * 23, w: menu.w - 8, h: 21 };
      menu.rects.push(rect);
      ctx.fillStyle = i % 2 ? "#2c1e11" : "#372616";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      drawText(menu.options[i].label, rect.x + 7, rect.y + 11, { color: "#f6e5bd", outline: "#000", size: 11, align: "left" });
    }
  }

  function hitContextMenu(x, y) {
    if (!state.contextMenu) return null;
    return state.contextMenu.rects.find((rect) => pointIn(rect, x, y));
  }

  function drawButton(rect, label) {
    ctx.fillStyle = "#6e4e26";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "#c4a866";
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    drawText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 4, { color: "#fff0ba", outline: "#000", size: 12, align: "center" });
  }

  function drawChat() {
    ctx.fillStyle = "#2a1a0e";
    ctx.fillRect(CHAT.x, CHAT.y, CHAT.w, CHAT.h);
    ctx.strokeStyle = "#9e7a39";
    ctx.lineWidth = 3;
    ctx.strokeRect(CHAT.x + 4, CHAT.y + 4, CHAT.w - 8, CHAT.h - 8);
    ctx.fillStyle = "#18100a";
    ctx.fillRect(CHAT.x + 12, CHAT.y + 12, CHAT.w - 24, CHAT.h - 24);
    const lines = state.chat.slice(-6);
    let y = CHAT.y + 36;
    drawText("Game", CHAT.x + 24, CHAT.y + 25, { color: "#ffd86b", outline: "#000", size: 12, align: "left" });
    for (const line of lines) {
      const color = line.tone === "danger" ? "#ff8e8e" : line.tone === "loot" ? "#ffe86b" : "#f0d8aa";
      drawText(line.text, CHAT.x + 24, y, { color, outline: "#000", size: 13, align: "left" });
      y += 19;
    }
    if (state.modal?.type === "dialogue") {
      let x = CHAT.x + 24;
      y = CHAT.y + CHAT.h - 34;
      state.modal.rects = [];
      for (const choiceItem of state.modal.choices) {
        ctx.font = "12px Verdana, Tahoma, sans-serif";
        const width = Math.max(104, ctx.measureText(choiceItem.label).width + 30);
        const rect = { kind: "dialogueChoice", choice: choiceItem, x, y: y - 20, w: width, h: 28 };
        state.modal.rects.push(rect);
        drawButton(rect, choiceItem.label);
        x += width + 10;
      }
    }
  }

  function drawModal() {
    if (!state.modal) return;
    if (state.modal.type === "dialogue") {
      const x = 90;
      const y = 78;
      const w = 700;
      const h = 132;
      ctx.fillStyle = "rgba(33,22,12,0.94)";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#b38f4f";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      drawText(state.modal.name, x + 18, y + 28, { color: "#ffd86b", outline: "#000", size: 16, align: "left" });
      let yy = y + 56;
      for (const line of state.modal.lines) {
        wrapText(line, x + 18, yy, w - 36, 15, "#f2dfb4");
        yy += 38;
      }
    } else if (state.modal.type === "bank") {
      drawBankModal();
    } else if (state.modal.type === "shop") {
      drawShopModal();
    } else if (state.modal.type === "collection") {
      drawCollectionModal();
    } else if (state.modal.type === "skillGuide") {
      drawSkillGuideModal();
    } else if (state.modal.type === "worldMap") {
      drawWorldMapModal();
    } else if (state.modal.type === "lamp") {
      drawLampModal();
    } else if (state.modal.type === "bestiary") {
      drawBestiaryModal();
    } else if (state.modal.type === "diary") {
      drawDiaryModal();
    }
  }

  function drawBankModal() {
    const x = 94;
    const y = 54;
    const w = 690;
    const h = 498;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(35,25,15,0.97)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    drawText("Bank of BoonScape", x + 18, y + 28, { color: "#ffd86b", outline: "#000", size: 18, align: "left" });
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    drawText("Withdraw", x + 20, y + 62, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const sortButton = { kind: "bankSort", x: x + 286, y: y + 48, w: 82, h: 26 };
    state.modal.rects.push(sortButton);
    drawButton(sortButton, "Sort");
    drawText("Deposit from inventory", x + 390, y + 62, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const cell = 46;
    for (let i = 0; i < 48; i += 1) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      const rect = { kind: "bankSlot", slot: i, x: x + 20 + col * (cell + 4), y: y + 76 + row * (cell + 4), w: cell, h: cell };
      state.modal.rects.push(rect);
      drawItemSlot(rect, state.player.bank[i] || null);
    }
    const invX = x + 390;
    const invY = y + 78;
    for (let i = 0; i < state.player.inventory.length; i += 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const rect = { kind: "bankInventorySlot", slot: i, x: invX + col * 50, y: invY + row * 50, w: 46, h: 46 };
      state.modal.rects.push(rect);
      drawItemSlot(rect, state.player.inventory[i]);
    }
    const depositAll = { kind: "bankDepositAll", x: invX, y: y + h - 46, w: 196, h: 30 };
    state.modal.rects.push(depositAll);
    drawButton(depositAll, "Deposit all inventory");
  }

  function drawShopModal() {
    const x = 126;
    const y = 74;
    const w = 610;
    const h = 430;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(36,24,14,0.97)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    drawText(state.modal.title, x + 18, y + 28, { color: "#ffd86b", outline: "#000", size: 18, align: "left" });
    const currencyLabel = state.modal.currency === "slayer" ? `Slayer points: ${state.slayer.points}` : state.modal.currency === "castle" ? `Tickets: ${inventoryCount("castle_ticket")}` : `Coins: ${inventoryCount("coins")}`;
    const suffix = state.modal.currency === "slayer" ? "pts" : state.modal.currency === "castle" ? "tk" : "gp";
    drawText(currencyLabel, x + 18, y + 52, { color: "#f8df78", outline: "#000", size: 12, align: "left" });
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    state.modal.stock.forEach((stock, i) => {
      const rect = { kind: "shopBuy", stock, x: x + 24, y: y + 76 + i * 44, w: 250, h: 34 };
      state.modal.rects.push(rect);
      drawButton(rect, `${stock.qty || 1} ${ITEMS[stock.id].name} - ${stock.price}${suffix}`);
    });
    drawText(state.modal.currency === "slayer" ? "Spend points from tasks." : state.modal.currency === "castle" ? "Tickets come from flag matches." : "Click inventory items to sell.", x + 336, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    for (let i = 0; i < state.player.inventory.length; i += 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const rect = { kind: "shopInventorySlot", slot: i, x: x + 334 + col * 50, y: y + 76 + row * 48, w: 44, h: 44 };
      state.modal.rects.push(rect);
      drawItemSlot(rect, state.player.inventory[i]);
    }
  }

  function drawCollectionModal() {
    const x = 116;
    const y = 58;
    const w = 650;
    const h = 500;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(32,22,13,0.98)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    const totals = collectionCount();
    drawText("Collection Log", x + 18, y + 28, { color: "#ffd86b", outline: "#000", size: 18, align: "left" });
    drawText(`${totals.found}/${totals.total} discoveries`, x + 18, y + 52, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    const groups = [
      ["Combat", ["bronze_sword", "iron_sword", "steel_sword", "rune_scimitar", "wight_blade", "shortbow", "bronze_arrow", "broad_arrow", "wooden_shield", "bronze_helm", "wizard_hat", "black_helm", "iron_platelegs", "decorative_helm", "decorative_shield", "decorative_sword", "decorative_platebody", "crypt_helm", "crypt_platebody", "crypt_platelegs", "staff_of_air", "crypt_staff"]],
      ["Skilling", ["logs", "oak_logs", "copper_ore", "tin_ore", "iron_ore", "gold_ore", "bronze_bar", "iron_bar", "gold_bar", "cowhide", "leather_body", "silk", "fur"]],
      ["Food", ["bread", "cake", "spinach_roll", "raw_shrimp", "cooked_shrimp", "raw_trout", "cooked_trout", "raw_beef", "cooked_beef", "burnt_fish", "burnt_meat", "lobster"]],
      ["Potions", ["attack_potion", "strength_potion", "defence_potion", "ranging_potion", "magic_potion", "energy_potion"]],
      ["Treasure", ["slayer_gem", "bag_of_salt", "castle_ticket", "clue_scroll", "reward_casket", "mystery_box", "antique_lamp", "chisel", "uncut_gem", "cut_gem", "gold_ring", "power_amulet", "ancient_page", "amulet_of_accuracy", "slayer_helm", "team_cape", "achievement_cape"]],
      ["Runes", ["air_rune", "mind_rune", "chaos_rune", "law_rune", "death_rune"]],
    ];
    let yy = y + 82;
    let column = 0;
    for (const [groupName, ids] of groups) {
      const itemCols = 3;
      const rowGap = 17;
      const needed = 22 + Math.ceil(ids.length / itemCols) * rowGap + 12;
      if (yy + needed > y + h - 20 && column === 0) {
        column = 1;
        yy = y + 82;
      }
      const gx = x + 18 + column * 318;
      drawText(groupName, gx, yy, { color: "#83efff", outline: "#000", size: 13, align: "left" });
      yy += 22;
      ids.forEach((id, index) => {
        const col = index % itemCols;
        const row = Math.floor(index / itemCols);
        const sx = gx + col * 104;
        const sy = yy + row * rowGap;
        const found = state.collection[id];
        drawText(`${found ? "*" : "-"} ${ITEMS[id].name}`, sx, sy, { color: found ? "#ffe9a8" : "#6f6250", outline: "#000", size: 9, align: "left" });
      });
      yy += Math.ceil(ids.length / itemCols) * rowGap + 12;
    }
  }

  function drawSkillGuideModal() {
    const x = 232;
    const y = 108;
    const w = 420;
    const h = 330;
    const skill = state.modal.skill;
    const guide = SKILL_GUIDES[skill] || [];
    state.modal.rects = [];
    ctx.fillStyle = "rgba(32,22,13,0.98)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    drawText(`${skill} Guide`, x + 20, y + 30, { color: "#ffd86b", outline: "#000", size: 18, align: "left" });
    drawText(`Current level ${getLevel(skill)} - ${xpToNext(skill)} XP to next`, x + 20, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    guide.forEach((line, i) => {
      drawText(line, x + 28, y + 96 + i * 32, { color: "#ffe9a8", outline: "#000", size: 13, align: "left" });
    });
    wrapText("Skill guides are intentionally terse, just like a manual you read beside the family computer.", x + 20, y + h - 46, w - 40, 12, "#cdbb8a");
  }

  function drawWorldMapModal() {
    const x = 82;
    const y = 42;
    const w = 728;
    const h = 520;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(46,32,18,0.98)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    drawText("World Map", x + 20, y + 28, { color: "#ffd86b", outline: "#000", size: 20, align: "left" });
    drawText("Click a labelled place to plot a walk there.", x + 20, y + 54, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");

    const mapX = x + 24;
    const mapY = y + 76;
    const mapW = 438;
    const mapH = 398;
    ctx.fillStyle = "#1a2514";
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = "#927338";
    ctx.strokeRect(mapX, mapY, mapW, mapH);
    const scale = Math.min(mapW / WORLD_W, mapH / WORLD_H);
    const ox = mapX + (mapW - WORLD_W * scale) / 2;
    const oy = mapY + (mapH - WORLD_H * scale) / 2;
    for (let yy = 0; yy < WORLD_H; yy += 1) {
      for (let xx = 0; xx < WORLD_W; xx += 1) {
        const terrain = mapAt(xx, yy);
        ctx.fillStyle = terrain === "water" ? "#226b96" : terrain === "path" ? "#a17a45" : terrain === "town" ? "#b4a68c" : terrain === "stone" ? "#777873" : terrain === "swamp" ? "#506c3f" : terrain === "field" ? "#827934" : terrain === "dirt" ? "#735534" : terrain === "sand" ? "#b9a561" : "#39702c";
        ctx.fillRect(ox + xx * scale, oy + yy * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }
    for (const destination of MAP_DESTINATIONS) {
      const px = ox + destination.x * scale;
      const py = oy + destination.y * scale;
      const rect = { kind: "mapDestination", destination, x: px - 9, y: py - 9, w: 18, h: 18 };
      state.modal.rects.push(rect);
      ctx.fillStyle = destination.color;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#101010";
      ctx.stroke();
      drawText(destination.label, px + 8, py - 8, { color: destination.color, outline: "#000", size: 9, align: "left" });
    }
    const playerX = ox + state.player.x * scale;
    const playerY = oy + state.player.y * scale;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 6, 0, Math.PI * 2);
    ctx.fill();
    drawText("You", playerX + 9, playerY + 8, { color: "#ffffff", outline: "#000", size: 10, align: "left" });

    const listX = x + 488;
    let listY = y + 88;
    const rowH = 33;
    for (const destination of MAP_DESTINATIONS) {
      const rect = { kind: "mapDestination", destination, x: listX, y: listY - 12, w: 202, h: 29 };
      state.modal.rects.push(rect);
      ctx.fillStyle = "#2d2013";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "#70552d";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      drawText(destination.label, listX + 10, listY, { color: destination.color, outline: "#000", size: 12, align: "left" });
      drawText(destination.note, listX + 10, listY + 13, { color: "#cdbb8a", outline: "#000", size: 8, align: "left" });
      listY += rowH;
    }
  }

  function drawLampModal() {
    const x = 216;
    const y = 92;
    const w = 458;
    const h = 394;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(34,24,14,0.98)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    drawText("Antique Lamp", x + 20, y + 30, { color: "#ffd86b", outline: "#000", size: 18, align: "left" });
    drawText("Choose a skill for the experience reward.", x + 20, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    skillNames.forEach((skill, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const rect = { kind: "lampSkill", skill, slot: state.modal.itemSlot, x: x + 20 + col * 138, y: y + 88 + row * 48, w: 126, h: 34 };
      state.modal.rects.push(rect);
      drawButton(rect, `${skillShortName(skill)} ${getLevel(skill)}`);
    });
  }

  function drawBestiaryModal() {
    const x = 92;
    const y = 34;
    const w = 700;
    const h = 548;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(31,22,13,0.98)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    drawText("Slayer Codex", x + 20, y + 30, { color: "#6feaff", outline: "#000", size: 20, align: "left" });
    drawText("Locations, drops, and the kind of questionable advice every task needs.", x + 20, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const activeType = state.slayer.task?.type;
    BESTIARY.forEach((entry, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rect = { x: x + 20 + col * 332, y: y + 88 + row * 70, w: 312, h: 56 };
      const active = activeType === entry.type;
      ctx.fillStyle = active ? "#243c44" : "#2a1c10";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = active ? "#6feaff" : "#6c5129";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      drawText(`${entry.name} (${entry.level})`, rect.x + 10, rect.y + 15, { color: active ? "#8ff0ff" : "#ffe9a8", outline: "#000", size: 12, align: "left" });
      drawText(entry.location, rect.x + rect.w - 10, rect.y + 15, { color: "#cdbb8a", outline: "#000", size: 10, align: "right" });
      drawText(`Drops: ${entry.drops}`, rect.x + 10, rect.y + 35, { color: "#f2dfb4", outline: "#000", size: 10, align: "left" });
      drawText(entry.tip, rect.x + 10, rect.y + 50, { color: "#9fb894", outline: "#000", size: 10, align: "left" });
    });
  }

  function drawDiaryModal() {
    const x = 180;
    const y = 34;
    const w = 520;
    const h = 550;
    state.modal.rects = [];
    ctx.fillStyle = "rgba(31,22,13,0.98)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c4a15a";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    const done = diaryCompletedCount();
    drawText("Boonshire Diary", x + 20, y + 30, { color: "#6feaff", outline: "#000", size: 20, align: "left" });
    drawText(`${done}/${DIARY_TASKS.length} tasks complete`, x + 20, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const taskColW = (w - 56) / 2;
    DIARY_TASKS.forEach((task, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rowX = x + 20 + col * (taskColW + 16);
      const rowY = y + 92 + row * 32;
      ctx.fillStyle = i % 2 ? "#25180d" : "#2c1d10";
      ctx.fillRect(rowX, rowY - 14, taskColW, 24);
      ctx.strokeStyle = "#4d3a20";
      ctx.strokeRect(rowX, rowY - 14, taskColW, 24);
      drawText(task.done() ? "*" : "-", rowX + 12, rowY - 2, { color: task.done() ? "#78e05f" : "#a89468", outline: "#000", size: 11, align: "left" });
      drawText(task.label, rowX + 30, rowY - 2, { color: task.done() ? "#ffe9a8" : "#cdbb8a", outline: "#000", size: 10, align: "left" });
    });
    if (done === DIARY_TASKS.length && !state.diaryRewardClaimed) {
      const claim = { kind: "diaryClaim", x: x + 154, y: y + h - 52, w: 212, h: 32 };
      state.modal.rects.push(claim);
      drawButton(claim, "Claim diary reward");
    } else {
      drawText(state.diaryRewardClaimed ? "Reward claimed: Achievement cape." : "Reward: Achievement cape, law runes, XP.", x + 20, y + h - 34, {
        color: "#f0d8a0",
        outline: "#000",
        size: 12,
        align: "left",
      });
    }
  }

  function fitLine(text, maxWidth, size = 11) {
    ctx.font = `${size}px Verdana, Tahoma, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return text;
    let clipped = text;
    while (clipped.length > 3 && ctx.measureText(`${clipped}...`).width > maxWidth) clipped = clipped.slice(0, -1);
    return `${clipped.trimEnd()}...`;
  }

  function wrapText(text, x, y, maxWidth, lineHeight, color) {
    ctx.font = "11px Verdana, Tahoma, sans-serif";
    const words = text.split(" ");
    let line = "";
    let yy = y;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        drawText(line, x, yy, { color, outline: "#000", size: 11, align: "left" });
        line = word;
        yy += lineHeight;
      } else line = test;
    }
    if (line) drawText(line, x, yy, { color, outline: "#000", size: 11, align: "left" });
  }

  function drawText(text, x, y, options = {}) {
    const size = options.size || 12;
    ctx.save();
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.font = `${size}px Verdana, Tahoma, sans-serif`;
    ctx.textAlign = options.align || "left";
    ctx.textBaseline = "middle";
    if (options.outline) {
      ctx.lineWidth = Math.max(2, Math.floor(size / 4));
      ctx.strokeStyle = options.outline;
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = options.color || "#fff";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function pushRect(rect) {
    state.uiRects.push(rect);
  }

  function pointIn(rect, x, y) {
    return x >= rect.x && y >= rect.y && x <= rect.x + rect.w && y <= rect.y + rect.h;
  }

  function pickWorld(screenX, screenY) {
    const candidates = [];
    const add = (kind, item, radius) => {
      const screen = screenOf(item);
      const d = Math.hypot(screen.x - screenX, screen.y - screenY);
      if (d <= radius) candidates.push({ kind, item, d });
    };
    for (const item of state.groundItems) add("groundItem", item, 28);
    for (const npc of state.npcs) add("npc", npc, 40);
    for (const enemy of state.enemies) if (enemy.hp > 0) add("enemy", enemy, 32);
    for (const resource of state.resources) if (resource.depleted <= state.time) add("resource", resource, resource.type.includes("tree") ? 34 : 28);
    for (const obj of state.scenery) add("scenery", obj, 36);
    candidates.sort((a, b) => a.d - b.d);
    return candidates[0] || null;
  }

  function onPointerDown(event) {
    const pos = eventToCanvas(event);
    playSfx("click");
    render();
    if (event.button === 2) {
      event.preventDefault();
      openContextMenu(pos.x, pos.y);
      return;
    }
    if (state.contextMenu) {
      const menuHit = hitContextMenu(pos.x, pos.y);
      if (menuHit) menuHit.action();
      state.contextMenu = null;
      return;
    }
    const modalHit = hitModal(pos.x, pos.y);
    if (modalHit) {
      handleUiRect(modalHit);
      return;
    }
    if (state.modal) return;
    const hit = state.uiRects.find((rect) => pointIn(rect, pos.x, pos.y));
    if (hit) {
      handleUiRect(hit, pos.x, pos.y);
      return;
    }
    if (pos.x < VIEW.w && pos.y < VIEW.h) {
      const picked = pickWorld(pos.x, pos.y);
      if (picked) {
        if (picked.kind === "groundItem") moveToTile(Math.floor(picked.item.x), Math.floor(picked.item.y), { kind: "groundItem", id: picked.item.id });
        else if (picked.kind === "enemy") approachOrAttackEnemy(picked.item);
        else moveAdjacentTo(picked.item, { kind: picked.kind, id: picked.item.id });
      } else {
        const world = unproject(pos.x, pos.y);
        moveToTile(Math.floor(world.x), Math.floor(world.y));
      }
    }
  }

  function onPointerMove(event) {
    const pos = eventToCanvas(event);
    state.hover = null;
    const modalHit = hitModal(pos.x, pos.y);
    const uiHit = !state.modal ? state.uiRects.find((rect) => pointIn(rect, pos.x, pos.y)) : null;
    const rect = modalHit || uiHit;
    if (rect) {
      const lines = hoverLinesForRect(rect);
      if (lines.length) state.hover = { x: pos.x, y: pos.y, lines };
      return;
    }
    if (!state.modal && pos.x < VIEW.w && pos.y < VIEW.h) {
      const picked = pickWorld(pos.x, pos.y);
      if (picked) state.hover = { x: pos.x, y: pos.y, lines: hoverLinesForWorld(picked) };
    }
  }

  function hoverLinesForRect(rect) {
    if (rect.kind === "inventorySlot" || rect.kind === "shopInventorySlot" || rect.kind === "bankInventorySlot") {
      return hoverLinesForItem(state.player.inventory[rect.slot]);
    }
    if (rect.kind === "bankSlot") return hoverLinesForItem(state.player.bank[rect.slot]);
    if (rect.kind === "equipSlot") {
      const itemId = state.player.equipment[rect.slot];
      return itemId ? hoverLinesForItem({ id: itemId, qty: 1 }) : [`${rect.slot} slot`];
    }
    if (rect.kind === "shopBuy") return hoverLinesForItem({ id: rect.stock.id, qty: rect.stock.qty || 1 }).concat([`Price: ${rect.stock.price}${state.modal?.currency === "slayer" ? " pts" : state.modal?.currency === "castle" ? " tickets" : " gp"}`]);
    if (rect.kind === "spell") return [`Cast ${rect.spell}`];
    if (rect.kind === "skillGuide") return [`${rect.skill} guide`, `${xpToNext(rect.skill)} XP to next`];
    if (rect.kind === "setting") return [tabLabels.settings, rect.setting];
    if (rect.kind === "mapDestination") return [rect.destination.label, rect.destination.note];
    if (rect.kind === "lampSkill") return [`Rub lamp on ${rect.skill}`];
    if (rect.kind === "diaryOpen") return ["Boonshire Diary", `${diaryCompletedCount()}/${DIARY_TASKS.length}`];
    if (rect.kind === "diaryClaim") return ["Claim diary reward"];
    if (rect.kind === "bankSort") return ["Sort bank", "Tidy and stack items"];
    return [];
  }

  function hoverLinesForItem(item) {
    if (!item) return [];
    const data = ITEMS[item.id];
    if (!data) return [];
    const lines = [item.qty > 1 ? `${data.name} x${compactNumber(item.qty)}` : data.name];
    if (data.food) lines.push(`Heals ${data.food}`);
    if (data.boostSkill) lines.push(`Boosts ${data.boostSkill}`);
    if (data.runRestore) lines.push(`Restores ${data.runRestore}% run`);
    if (item.id === "rune_pouch") lines.push(runePouchText());
    if (data.requirements) lines.push(`Requires ${requirementText(data.requirements)}`);
    if (data.value) lines.push(`Value ${data.value} gp`);
    return lines;
  }

  function hoverLinesForWorld(picked) {
    const item = picked.item;
    if (picked.kind === "groundItem") return hoverLinesForItem({ id: item.itemId, qty: item.qty });
    if (picked.kind === "enemy") return [`${item.name} level ${item.level}`, item.slayerType ? `Slayer: ${item.slayerType.replaceAll("_", " ")}` : "Attack", item.finisher ? `Finish with ${ITEMS[item.finisher].name}` : null].filter(Boolean);
    if (picked.kind === "npc") return [item.name, item.role.replaceAll("_", " ")];
    if (picked.kind === "resource") return [resourceName(item)];
    if (picked.kind === "scenery") {
      if (item.action === "agility") return [item.name, `Agility ${item.level || 1}`, `Run +${item.restore || 0}%`];
      if (item.action === "fletch") return [item.name, "Fletch supplies"];
      if (item.action === "farm") return farmPatchLines(item);
      if (item.action === "compost") return [item.name, "Turns potatoes into compost"];
      if (item.action === "water") return [item.name, "Fill empty vials"];
      if (item.action === "runecraft") {
        const recipe = RUNECRAFTING_RECIPES[item.rune];
        return [item.name, `Runecrafting ${recipe.level}`, `${inventoryCount("rune_essence") + (inventoryCount("rune_pouch") > 0 ? state.runePouch.essence : 0)} essence`];
      }
      if (item.action === "crypt") {
        const brother = CRYPT_BROTHERS[item.brother];
        return [item.name, brother ? brother.name : "Crypt brother", cryptStatusText()];
      }
      if (item.action === "crypt_chest") return [item.name, cryptStatusText(), state.crypt?.lastReward ? `Last: ${state.crypt.lastReward}` : "Wake all brothers"];
      if (item.action === "castle_wars") return [item.name, "Join match", castleWarsScoreText()];
      if (item.action === "castle_flag") return [item.name, item.team === "enemy" ? "Steal flag" : "Score here", castleWarsScoreText()];
      if (item.action === "castle_supply") return [item.name, "Bandages and run energy", castleWarsScoreText()];
      if (item.action === "castle_scoreboard") return [item.name, castleWarsScoreText()];
      if (item.action === "examine") return [item.name, "Examine"];
      return [item.name, item.action === "steal" ? "Steal-from" : "Use"];
    }
    return [];
  }

  function drawHoverTooltip() {
    if (!state.hover || !state.hover.lines?.length) return;
    ctx.save();
    ctx.font = "11px Verdana, Tahoma, sans-serif";
    const lines = state.hover.lines.slice(0, 4);
    const width = Math.min(240, Math.max(86, ...lines.map((line) => ctx.measureText(line).width + 18)));
    const height = 12 + lines.length * 17;
    const x = clamp(state.hover.x + 14, 6, CANVAS_W - width - 6);
    const y = clamp(state.hover.y + 18, 6, CANVAS_H - height - 6);
    ctx.fillStyle = "rgba(24,16,9,0.96)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#c3a35d";
    ctx.strokeRect(x, y, width, height);
    lines.forEach((line, i) => {
      drawText(line, x + 9, y + 13 + i * 17, { color: i === 0 ? "#ffe9a8" : "#cdbb8a", outline: "#000", size: 11, align: "left" });
    });
    ctx.restore();
  }

  function hitModal(x, y) {
    if (!state.modal) return null;
    const rects = state.modal.rects || [];
    return rects.find((rect) => pointIn(rect, x, y));
  }

  function handleUiRect(rect, x = 0, y = 0) {
    if (rect.kind === "tab") state.tab = rect.tab;
    else if (rect.kind === "inventorySlot" || rect.kind === "shopInventorySlot" || rect.kind === "bankInventorySlot") useInventorySlot(rect.slot);
    else if (rect.kind === "equipSlot") unequip(rect.slot);
    else if (rect.kind === "spell") castSpell(rect.spell);
    else if (rect.kind === "skillGuide") openSkillGuide(rect.skill);
    else if (rect.kind === "setting") handleSetting(rect.setting);
    else if (rect.kind === "modalClose") closeModal();
    else if (rect.kind === "mapDestination") {
      moveToTile(rect.destination.x, rect.destination.y);
      addChat(`World map destination: ${rect.destination.label}.`);
      closeModal();
    } else if (rect.kind === "lampSkill") {
      rubLamp(rect.slot, rect.skill);
    } else if (rect.kind === "diaryOpen") {
      openDiary();
    } else if (rect.kind === "diaryClaim") claimDiaryReward();
    else if (rect.kind === "dialogueChoice") rect.choice.action();
    else if (rect.kind === "bankDepositAll") depositInventoryAll();
    else if (rect.kind === "bankSort") sortBank();
    else if (rect.kind === "bankSlot") {
      if (state.player.bank[rect.slot]) moveItem(state.player.bank, state.player.inventory, rect.slot, ITEMS[state.player.bank[rect.slot].id].stackable ? state.player.bank[rect.slot].qty : 1);
    } else if (rect.kind === "shopBuy") {
      const qty = rect.stock.qty || 1;
      const total = rect.stock.price;
      if (state.modal?.currency === "slayer") {
        if (state.slayer.points < total) addChat("You need more Slayer points.");
        else if (addInventory(rect.stock.id, qty)) {
          state.slayer.points -= total;
          addChat(`You buy ${formatItem(rect.stock.id, qty)}.`);
        }
      } else if (state.modal?.currency === "castle") {
        if (inventoryCount("castle_ticket") < total) addChat("You need more Castle wars tickets.");
        else if (addInventory(rect.stock.id, qty)) {
          removeItem(state.player.inventory, "castle_ticket", total);
          addChat(`You buy ${formatItem(rect.stock.id, qty)}.`);
        }
      } else if (!spendCoins(total)) addChat("You do not have enough coins.");
      else if (addInventory(rect.stock.id, qty)) addChat(`You buy ${formatItem(rect.stock.id, qty)}.`);
      else addInventory("coins", total, true);
    } else if (rect.kind === "minimap") {
      const scale = Math.min(rect.w / WORLD_W, rect.h / WORLD_H);
      const mapW = WORLD_W * scale;
      const mapH = WORLD_H * scale;
      const ox = rect.x + (rect.w - mapW) / 2;
      const oy = rect.y + (rect.h - mapH) / 2;
      moveToTile(Math.floor((x - ox) / scale), Math.floor((y - oy) / scale));
    }
  }

  function handleSetting(setting) {
    if (setting === "run") {
      state.player.run = !state.player.run && state.player.runEnergy > 0;
      addChat(`Run ${state.player.run ? "enabled" : "disabled"}.`);
    } else if (setting === "style") {
      const order = ["balanced", "Attack", "Strength", "Defence"];
      state.player.combatStyle = order[(order.indexOf(state.player.combatStyle) + 1) % order.length];
      addChat(`Combat style: ${state.player.combatStyle}.`);
    } else if (setting === "prayer") {
      const order = ["none", "thickSkin", "burstStrength", "sharpEye", "rapidHeal"];
      state.player.prayerMode = order[(order.indexOf(state.player.prayerMode) + 1) % order.length];
      if (state.player.prayerPoints <= 0) state.player.prayerMode = "none";
      addChat(`Prayer: ${prayerLabel(state.player.prayerMode)}.`);
    } else if (setting === "music") {
      state.musicOn = !state.musicOn;
      state.nextMusic = state.time;
      playJingle(state.musicOn ? [262, 330, 392, 523] : [392, 330, 262], 0.08, "triangle", 0.035);
      addChat(`Music ${state.musicOn ? "enabled" : "disabled"}.`);
    } else if (setting === "collection") {
      openCollectionLog();
    } else if (setting === "worldMap") {
      openWorldMap();
    } else if (setting === "save") saveGame();
    else if (setting === "load") loadGame();
    else if (setting === "fullscreen") toggleFullscreen();
  }

  function eventToCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (state.modal) closeModal();
      else if (document.fullscreenElement) document.exitFullscreen();
    } else if (event.key >= "1" && event.key <= "6") {
      state.tab = tabs[Number(event.key) - 1];
    } else if (event.key.toLowerCase() === "f") {
      toggleFullscreen();
    } else if (event.key.toLowerCase() === "m") {
      openWorldMap();
    } else if (event.key.toLowerCase() === "r") {
      state.player.run = !state.player.run;
    } else if (event.key === " ") {
      if (state.modal?.type === "dialogue" && state.modal.choices[0]) state.modal.choices[0].action();
    } else if (["w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(event.key)) {
      const dx = event.key === "a" || event.key === "ArrowLeft" ? -1 : event.key === "d" || event.key === "ArrowRight" ? 1 : 0;
      const dy = event.key === "w" || event.key === "ArrowUp" ? -1 : event.key === "s" || event.key === "ArrowDown" ? 1 : 0;
      moveToTile(Math.floor(state.player.x) + dx, Math.floor(state.player.y) + dy);
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else canvas.requestFullscreen?.();
  }

  function saveGame() {
    const payload = {
      player: {
        x: state.player.x,
        y: state.player.y,
        hp: state.player.hp,
        inventory: state.player.inventory,
        bank: state.player.bank,
        equipment: state.player.equipment,
        skills: state.player.skills,
        combatStyle: state.player.combatStyle,
        prayerMode: state.player.prayerMode,
        prayerPoints: state.player.prayerPoints,
        boosts: state.player.boosts,
        boostDecay: state.player.boostDecay,
        runEnergy: state.player.runEnergy,
        run: state.player.run,
      },
      quests: state.quests,
      stats: state.stats,
      slayer: state.slayer,
      runePouch: state.runePouch,
      crypt: state.crypt,
      castleWars: state.castleWars,
      farmingContract: state.farmingContract,
      clue: state.clue,
      nextRandomEvent: state.nextRandomEvent,
      collection: state.collection,
      diaryRewardClaimed: state.diaryRewardClaimed,
      groundItems: state.groundItems,
      farmingPatches: state.farmingPatches,
      farmingSavedAtTime: state.time,
      farmingSavedAtWall: Date.now(),
    };
    localStorage.setItem("boonscape-save", JSON.stringify(payload));
    addChat("Game saved.");
  }

  function loadGame() {
    const raw = localStorage.getItem("boonscape-save");
    if (!raw) {
      addChat("No save found.");
      return;
    }
    try {
      const payload = JSON.parse(raw);
      Object.assign(state.player, payload.player);
      normalizePlayerState();
      state.quests = { ...state.quests, ...(payload.quests || {}) };
      state.stats = { ...blankStats(), ...(payload.stats || {}) };
      state.slayer = payload.slayer || state.slayer;
      state.runePouch = payload.runePouch || state.runePouch;
      state.crypt = payload.crypt || state.crypt;
      state.castleWars = payload.castleWars || state.castleWars;
      normalizePlayerState();
      state.farmingContract = payload.farmingContract || null;
      state.clue = payload.clue || null;
      state.randomEvent = null;
      state.nextRandomEvent = payload.nextRandomEvent || state.time + 95;
      state.collection = payload.collection || {};
      state.diaryRewardClaimed = Boolean(payload.diaryRewardClaimed);
      state.groundItems = payload.groundItems || [];
      state.farmingPatches = payload.farmingPatches || state.farmingPatches;
      normalizeFarmingPatches();
      const savedAtTime = Number.isFinite(payload.farmingSavedAtTime) ? payload.farmingSavedAtTime : state.time;
      const offlineSeconds = Number.isFinite(payload.farmingSavedAtWall) ? Math.min(600, Math.max(0, (Date.now() - payload.farmingSavedAtWall) / 1000)) : 0;
      for (const patch of Object.values(state.farmingPatches)) {
        if (!patch.crop) continue;
        const savedAge = Math.max(0, savedAtTime - patch.plantedAt);
        patch.plantedAt = state.time - savedAge - offlineSeconds;
      }
      state.player.prayerPoints = Math.min(state.player.prayerPoints ?? maxPrayer(), maxPrayer());
      state.player.runEnergy = clamp(state.player.runEnergy ?? 100, 0, 100);
      addChat("Game loaded.");
    } catch (error) {
      addChat("Save file could not be loaded.");
    }
  }

  function renderGameToText() {
    const nearbyEnemies = state.enemies
      .filter((enemy) => enemy.hp > 0 && dist(enemy, state.player) < 8)
      .map((enemy) => {
        const screen = screenOf(enemy);
        return { id: enemy.id, name: enemy.name, type: enemy.type, slayerType: enemy.slayerType, cryptBrother: enemy.cryptBrother || null, finisher: enemy.finisher || null, x: Number(enemy.x.toFixed(1)), y: Number(enemy.y.toFixed(1)), screenX: Math.round(screen.x), screenY: Math.round(screen.y), hp: enemy.hp, level: enemy.level };
      });
    const nearbyNpcs = state.npcs
      .filter((npc) => dist(npc, state.player) < 7)
      .map((npc) => ({ id: npc.id, name: npc.name, role: npc.role, x: Number(npc.x.toFixed(1)), y: Number(npc.y.toFixed(1)) }));
    const nearbyResources = state.resources
      .filter((resource) => resource.depleted <= state.time && dist(resource, state.player) < 7)
      .slice(0, 20)
      .map((resource) => {
        const screen = screenOf(resource);
        return { id: resource.id, type: resource.type, x: resource.x, y: resource.y, screenX: Math.round(screen.x), screenY: Math.round(screen.y) };
      });
    const nearbyScenery = state.scenery
      .filter((obj) => dist(obj, state.player) < 7)
      .slice(0, 12)
      .map((obj) => ({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        action: obj.action,
        level: obj.level || null,
        patch: obj.patchId ? farmPatchStatus(obj.patchId) : null,
        rune: obj.rune || null,
        brother: obj.brother || null,
        team: obj.team || null,
        x: obj.x,
        y: obj.y,
      }));
    const nearbyGroundItems = state.groundItems
      .filter((item) => dist(item, state.player) < 8)
      .map((item) => ({ id: item.id, itemId: item.itemId, name: ITEMS[item.itemId].name, qty: item.qty, x: Number(item.x.toFixed(1)), y: Number(item.y.toFixed(1)) }));
    const inventory = state.player.inventory
      .map((item, slot) => (item ? { slot, id: item.id, name: ITEMS[item.id].name, qty: item.qty } : null))
      .filter(Boolean);
    const collection = collectionCount();
    return JSON.stringify({
      coordinateSystem: "World tiles: x increases southeast, y increases southwest. Canvas origin is top-left.",
      mode: state.modal?.type || "playing",
      player: {
        x: Number(state.player.x.toFixed(2)),
        y: Number(state.player.y.toFixed(2)),
        hp: state.player.hp,
        maxHp: maxHp(),
        prayerPoints: Number(state.player.prayerPoints.toFixed(1)),
        prayerMode: state.player.prayerMode,
        runEnergy: Number(state.player.runEnergy.toFixed(1)),
        area: state.areaName,
        moving: state.player.path.length,
        action: state.player.action?.kind || null,
        combatTarget: state.player.combatTarget,
        combatLevel: combatLevel(),
      },
      skills: Object.fromEntries(skillNames.map((skill) => [skill, getLevel(skill)])),
      effectiveSkills: Object.fromEntries(skillNames.map((skill) => [skill, effectiveLevel(skill)])),
      boosts: Object.fromEntries(activeBoosts()),
      slayer: state.slayer.task
        ? { task: state.slayer.task.label, remaining: state.slayer.task.remaining, streak: state.slayer.streak, points: state.slayer.points }
        : { task: null, streak: state.slayer.streak, points: state.slayer.points },
      runePouch: { essence: state.runePouch.essence, capacity: state.runePouch.capacity },
      crypt: { awakened: state.crypt.awakened, defeated: state.crypt.defeated, chestsOpened: state.crypt.chestsOpened, lastReward: state.crypt.lastReward },
      castleWars: {
        active: state.castleWars.active,
        score: state.castleWars.score,
        enemyScore: state.castleWars.enemyScore,
        flagHeld: state.castleWars.flagHeld,
        secondsLeft: state.castleWars.active ? Math.max(0, Math.ceil(state.castleWars.endsAt - state.time)) : 0,
        tickets: inventoryCount("castle_ticket"),
        lastReward: state.castleWars.lastReward,
      },
      farmingContract: state.farmingContract,
      clue: state.clue ? { hint: state.clue.hint, targetX: state.clue.x, targetY: state.clue.y } : null,
      diary: { completed: diaryCompletedCount(), total: DIARY_TASKS.length, rewardClaimed: state.diaryRewardClaimed },
      collection,
      farmingPatches: Object.fromEntries(Object.entries(state.farmingPatches).map(([id, patch]) => [id, { crop: patch.crop, status: farmPatchStatus(id), watered: patch.watered, diseased: patch.diseased, progress: Number(cropProgress(patch).toFixed(2)) }])),
      stats: {
        mapsOpened: state.stats.mapsOpened,
        ferriesTaken: state.stats.ferriesTaken,
        potionsDrunk: state.stats.potionsDrunk,
        stallsStolen: state.stats.stallsStolen,
        agilityObstacles: state.stats.agilityObstacles,
        arrowsFletched: state.stats.arrowsFletched,
        bowsFletched: state.stats.bowsFletched,
        cropsHarvested: state.stats.cropsHarvested,
        farmingContractsCompleted: state.stats.farmingContractsCompleted,
        essenceMined: state.stats.essenceMined,
        runesCrafted: state.stats.runesCrafted,
        airRunesCrafted: state.stats.airRunesCrafted,
        mindRunesCrafted: state.stats.mindRunesCrafted,
        chaosRunesCrafted: state.stats.chaosRunesCrafted,
        lawRunesCrafted: state.stats.lawRunesCrafted,
        cryptWightsDefeated: state.stats.cryptWightsDefeated,
        cryptChestsOpened: state.stats.cryptChestsOpened,
        castleWarsPlayed: state.stats.castleWarsPlayed,
        castleWarsWon: state.stats.castleWarsWon,
        castleFlagsCaptured: state.stats.castleFlagsCaptured,
        gemsCut: state.stats.gemsCut,
        jewelryCrafted: state.stats.jewelryCrafted,
        herbsHarvested: state.stats.herbsHarvested,
        herbsCleaned: state.stats.herbsCleaned,
        potionsMixed: state.stats.potionsMixed,
        chickensSlain: state.stats.chickensSlain,
        randomEventsCompleted: state.stats.randomEventsCompleted,
        slayerTasksCompleted: state.stats.slayerTasksCompleted,
      },
      randomEvent: state.randomEvent ? state.randomEvent.name : null,
      worldMapDestinations: state.modal?.type === "worldMap" ? MAP_DESTINATIONS.map((dest) => ({ label: dest.label, x: dest.x, y: dest.y })) : null,
      bestiary: state.modal?.type === "bestiary" ? BESTIARY.map((entry) => ({ name: entry.name, level: entry.level, location: entry.location, drops: entry.drops })) : null,
      inventory,
      nearbyEnemies,
      nearbyNpcs,
      nearbyResources,
      nearbyScenery,
      nearbyGroundItems,
      modal: state.modal?.type || null,
      chat: state.chat.slice(-4).map((line) => line.text),
    });
  }

  function bootstrap() {
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    buildWorld();
    initInventory();
    normalizePlayerState();
    addChat("Welcome to BoonScape 2005.");
    addChat("Click to walk, fight, gather, trade, bank, quest, and grind Slayer.");
    state.player.hp = maxHp();
    updateCamera();
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", () => {
      state.hover = null;
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("keydown", onKeyDown);
    window.render_game_to_text = renderGameToText;
    window.advanceTime = (ms) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i += 1) update(1 / 60);
      render();
    };
    requestAnimationFrame(loop);
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  bootstrap();
})();
