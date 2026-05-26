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
  const WORLD_W = 112;
  const WORLD_H = 112;
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
    "Vitality",
    "Ranged",
    "Magic",
    "Resolve",
    "Mining",
    "Smithing",
    "Fishing",
    "Cooking",
    "Woodcutting",
    "Firemaking",
    "Crafting",
    "Pilfering",
    "Agility",
    "Fletching",
    "Sigilcraft",
    "Farming",
    "Herbalism",
    "Vigilance",
  ];

  const SKILL_GUIDES = {
    Attack: ["1 Bronze sword", "5 Iron sword", "10 Accurate stance", "20 Iron oathbreakers", "30 Hollow wight attempts"],
    Strength: ["1 Bread-fueled bravery", "10 Higher melee hits", "20 Moss brute training", "35 Fiend-worthy swings"],
    Defence: ["1 Wooden shield", "5 Bronze helm", "10 Leather body", "25 Oathbreaker helm", "40 Concord mantle"],
    Vitality: ["10 Starting health", "15 Safer graveyard trips", "25 Survive skitterers", "40 Stand near fiends"],
    Ranged: ["1 Shortbow", "5 Bronze arrows", "15 Ward arrows", "30 Kite mire skitterers"],
    Magic: ["1 Home Teleport", "1 Gale Poke", "5 Coin Spark", "13 Cinder Bolt", "20 Bone Rattle", "25 Staff boosts"],
    Resolve: ["1 Bury bones", "4 Thick Skin", "7 Burst Strength", "10 Sharp Eye", "15 Rapid Heal"],
    Mining: ["1 Copper/Tin", "15 Iron ore", "30 Gold ore", "35 Better clue odds in mine"],
    Smithing: ["1 Bronze bar/sword", "15 Iron bars/sword", "20 Gold bars", "25 Efficient furnace work"],
    Fishing: ["1 Shrimp spots", "20 Trout at Lake Mollusk", "35 Redclaws on Saffron Cay"],
    Cooking: ["1 Shrimp/Beef", "15 Fewer burns", "20 Trout", "35 Redclaws"],
    Woodcutting: ["1 Normal trees", "15 Oak trees", "25 Better firemaking supplies"],
    Firemaking: ["1 Logs", "15 Oak logs", "30 Town warmth and diary credit"],
    Crafting: ["1 Cowhide work", "5 Leather body / gold rings", "12 Cut gems", "20 Prism pendants"],
    Pilfering: ["1 Cake stall", "5 Silk stall rolls", "15 Better odds", "25 Ashlands pockets someday"],
    Agility: ["1 Balance log", "5 Rope swing", "12 Stepping stones", "20 Faster run recovery", "35 Shortcut stamina"],
    Fletching: ["1 Arrow shafts", "1 Bronze arrows", "5 Shortbows", "15 Oak shortbows", "25 Ward arrow wisdom"],
    Sigilcraft: ["1 Gale sigils", "2 Whisper sigils", "15 Rift sigils", "25 Oath sigils", "35 Multiple sigil whispers"],
    Farming: ["1 Potato patch", "5 Mirthleaf herbs", "10 Better yields", "20 Lower disease chance", "35 Farmhands nod politely"],
    Herbalism: ["1 Clean mirthleaf", "1 Mix attack potions", "5 Antipoison", "8 Energy mixtures", "15 Stronger brews someday"],
    Vigilance: ["1 Rat/imp contracts", "10 Bone/skitterer contracts", "20 Keening shades need silence hoods", "30 Hollow wight", "35 Miasma wraiths need mire charms", "38 Rift fiends"],
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
    leather_gloves: { name: "Leather gloves", color: "#8a5a36", icon: "lg", value: 18 },
    vigil_helm: {
      name: "Vigil helm",
      slot: "helm",
      color: "#26313a",
      icon: "vh",
      value: 450,
      attack: 4,
      strength: 4,
      defence: 6,
      vigilBoost: true,
      vigilProtectAll: true,
      requirements: { Defence: 10, Vigilance: 15 },
    },
    silence_hood: {
      name: "Silence hood",
      slot: "helm",
      color: "#c8c5b5",
      icon: "sh",
      value: 55,
      defence: 1,
      vigilProtection: "keening_shade",
    },
    mire_charm: {
      name: "Mire charm",
      slot: "helm",
      color: "#d8ccb8",
      icon: "mc",
      value: 75,
      defence: 1,
      vigilProtection: "miasma_wraith",
    },
    surestrike_pendant: {
      name: "Surestrike pendant",
      slot: "amulet",
      color: "#55b8ff",
      icon: "aa",
      value: 180,
      attack: 5,
    },
    ward_arrow: {
      name: "Ward arrow",
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
    spider_silk: { name: "Spider silk", stackable: true, color: "#dfe7d3", icon: "ss", value: 18 },
    fur: { name: "Fur", color: "#8f6848", icon: "fr", value: 28 },
    limpwurt_root: { name: "Limpwurt root", stackable: true, color: "#d1b560", icon: "lr", value: 26 },
    scorpion_tail: { name: "Scorpion tail", stackable: true, color: "#d48a36", icon: "st", value: 22 },
    attack_potion: { name: "Attack potion", color: "#8b4dcc", icon: "ap", value: 42, boostSkill: "Attack", boostFlat: 3, boostPct: 0.1 },
    strength_potion: { name: "Strength potion", color: "#d65d4c", icon: "sp", value: 54, boostSkill: "Strength", boostFlat: 3, boostPct: 0.1 },
    defence_potion: { name: "Defence potion", color: "#6b8fd9", icon: "dp", value: 50, boostSkill: "Defence", boostFlat: 3, boostPct: 0.1 },
    ranging_potion: { name: "Ranging potion", color: "#5dbb62", icon: "rp", value: 70, boostSkill: "Ranged", boostFlat: 4, boostPct: 0.1 },
    magic_potion: { name: "Magic potion", color: "#57a9e8", icon: "mp", value: 74, boostSkill: "Magic", boostFlat: 4, boostPct: 0.08 },
    energy_potion: { name: "Energy potion", color: "#f0d85b", icon: "ep", value: 36, runRestore: 35 },
    antipoison: { name: "Antipoison", color: "#79d473", icon: "ap", value: 46, poisonCure: true },
    potato_seed: { name: "Potato seed", stackable: true, color: "#9f7a3f", icon: "ps", value: 3 },
    mirthleaf_seed: { name: "Mirthleaf seed", stackable: true, color: "#6cbf5f", icon: "ms", value: 9 },
    potato: { name: "Potato", color: "#cfa866", icon: "pt", value: 8, food: 3 },
    grimy_mirthleaf: { name: "Grimy mirthleaf", color: "#5f8f46", icon: "gh", value: 18 },
    clean_mirthleaf: { name: "Mirthleaf", color: "#7fd76b", icon: "mh", value: 28 },
    vial_of_water: { name: "Vial of water", color: "#7fd7ff", icon: "vw", value: 8 },
    empty_vial: { name: "Empty vial", color: "#cfdfff", icon: "ev", value: 4 },
    compost: { name: "Compost", color: "#6a4a2d", icon: "cp", value: 10 },
    achievement_cape: {
      name: "Concord mantle",
      slot: "body",
      color: "#4d8be8",
      icon: "ac",
      value: 1200,
      attack: 3,
      strength: 3,
      defence: 8,
    },
    sigilist_cap: { name: "Sigilist cap", slot: "helm", color: "#2a58a8", icon: "wh", value: 120, attack: 2, requirements: { Magic: 5 } },
    oathbreaker_helm: { name: "Oathbreaker helm", slot: "helm", color: "#1d1d21", icon: "bh", value: 210, defence: 5, requirements: { Defence: 10 } },
    iron_platelegs: { name: "Iron platelegs", slot: "legs", color: "#aeb5b9", icon: "pl", value: 130, defence: 4, requirements: { Defence: 5 } },
    team_cape: { name: "Team cape", slot: "body", color: "#b63232", icon: "tc", value: 160, attack: 1, defence: 3 },
    spider_cape: { name: "Spider silk cape", slot: "body", color: "#dfe7d3", icon: "sp", value: 540, attack: 2, defence: 4, poisonResist: true, requirements: { Crafting: 12 } },
    ghostly_robe: { name: "Ghostly robe", slot: "body", color: "#bcd6dc", icon: "gr", value: 680, attack: 2, defence: 6, magicBoost: true, requirements: { Defence: 15, Magic: 10 } },
    banner_token: { name: "Bannerfall token", stackable: true, color: "#e0c45b", icon: "bt", value: 12 },
    banner_bandage: { name: "Banner bandage", color: "#f2e7c7", icon: "cb", value: 8, food: 9 },
    banner_helm: { name: "Banner helm", slot: "helm", color: "#d8d0a8", icon: "dh", value: 520, defence: 4, requirements: { Defence: 10 } },
    banner_sword: {
      name: "Banner sword",
      slot: "weapon",
      color: "#ddd5a6",
      icon: "ds",
      value: 820,
      attack: 13,
      strength: 12,
      requirements: { Attack: 20 },
    },
    banner_shield: { name: "Banner shield", slot: "shield", color: "#c8b75b", icon: "cw", value: 640, defence: 8, requirements: { Defence: 20 } },
    banner_platebody: { name: "Banner platebody", slot: "body", color: "#c7c0a0", icon: "dp", value: 1120, defence: 12, requirements: { Defence: 25 } },
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
    giant_club: {
      name: "Giant club",
      slot: "weapon",
      color: "#83613d",
      icon: "gc",
      value: 760,
      attack: 8,
      strength: 22,
      requirements: { Attack: 20, Strength: 30 },
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
    mystic_wand: { name: "Mystic wand", slot: "weapon", color: "#78bff0", icon: "mw", value: 720, attack: 12, strength: 3, magicBoost: true, requirements: { Magic: 20 } },
    aurel_sabre: {
      name: "Aurel sabre",
      slot: "weapon",
      color: "#58bfd0",
      icon: "sc",
      value: 950,
      attack: 22,
      strength: 20,
      requirements: { Attack: 40 },
    },
    gale_staff: {
      name: "Gale staff",
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
    redclaw_cage: { name: "Redclaw cage", color: "#d6c18f", icon: "lp", value: 28 },
    raw_redclaw: {
      name: "Raw redclaw",
      color: "#a6474b",
      icon: "rl",
      value: 55,
      cookTo: "redclaw",
      burnTo: "burnt_fish",
      cookingXp: 120,
      burnLevel: 42,
      noBurnLevel: 45,
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
    prism_pendant: { name: "Prism pendant", color: "#65e8d2", icon: "pa", value: 360, slot: "amulet", attack: 3, strength: 3, defence: 3, requirements: { Crafting: 20 } },
    vigil_glass: { name: "Vigil glass", color: "#65d6ff", icon: "vg", value: 1 },
    brine_charm: { name: "Brine charm", stackable: true, color: "#f3eee0", icon: "sa", value: 5 },
    tower_key: { name: "Tower key", color: "#b8a25a", icon: "tk", value: 90 },
    ectoplasm: { name: "Ectoplasm", stackable: true, color: "#9be8d2", icon: "ec", value: 22 },
    glimmer_shard: { name: "Glimmer shard", stackable: true, color: "#d9d2ff", icon: "gl", value: 5 },
    sigil_satchel: { name: "Sigil satchel", color: "#57406f", icon: "ss", value: 120 },
    gale_focus: { name: "Gale focus", color: "#dcecff", icon: "gf", value: 45 },
    whisper_focus: { name: "Whisper focus", color: "#efc0ff", icon: "wf", value: 58 },
    rift_focus: { name: "Rift focus", color: "#7d59d8", icon: "rf", value: 180 },
    oath_focus: { name: "Oath focus", color: "#f0dc68", icon: "of", value: 260 },
    gale_sigil: { name: "Gale sigil", stackable: true, color: "#e9f0ff", icon: "ga", value: 4 },
    whisper_sigil: { name: "Whisper sigil", stackable: true, color: "#efc0ff", icon: "wh", value: 3 },
    rift_sigil: { name: "Rift sigil", stackable: true, color: "#6146b4", icon: "ri", value: 48 },
    oath_sigil: { name: "Oath sigil", stackable: true, color: "#d8c75a", icon: "oa", value: 90 },
    grave_sigil: { name: "Grave sigil", stackable: true, color: "#2e2b33", icon: "gv", value: 120 },
    banana: { name: "Banana", color: "#edd45a", icon: "bn", value: 6, food: 3 },
    redclaw: { name: "Redclaw", color: "#d23e36", icon: "lb", value: 95, food: 12 },
    pirate_cutlass: {
      name: "Pirate cutlass",
      slot: "weapon",
      color: "#cfd2d0",
      icon: "pc",
      value: 420,
      attack: 16,
      strength: 13,
      requirements: { Attack: 20 },
    },
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
    areaName: "Briarfall",
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
      lunchLedger: {
        title: "Lunch Ledger",
        state: "not-started",
        text: "The hall cook wants a cooked shrimp and ordinary logs.",
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
        text: "Huntwarden Mara wants proof that the Hollow wight can be put down.",
      },
      fletchersOrder: {
        title: "Fletcher's Order",
        state: "not-started",
        text: "Fletcher Rowan needs 15 bronze arrows for the town guard.",
      },
      sigilMysteries: {
        title: "Sigil Mysteries",
        state: "not-started",
        text: "Sigilist Elric wants proof that essence can be shaped into sigils.",
      },
      gardenTrouble: {
        title: "Garden Trouble",
        state: "not-started",
        text: "Gardener Bess wants a harvested crop and a homemade potion.",
      },
      islandRun: {
        title: "Island Supply Run",
        state: "not-started",
        text: "Trader Kojo wants bananas and a redclaw from Saffron Cay.",
      },
      towerWhispers: {
        title: "Tower of Whispers",
        state: "not-started",
        text: "Huntwarden Mara wants a key from the north Gloamspire.",
      },
      frontierLedger: {
        title: "The Frontier Ledger",
        state: "not-started",
        text: "Southport's sailor wants proof that the outer roads are open again.",
      },
    },
    stats: {
      bankUses: 0,
      bonesBuried: 0,
      casketsOpened: 0,
      cluesSolved: 0,
      cowhidesCrafted: 0,
      duskConjurersSlain: 0,
      hollowWightsSlain: 0,
      ferriesTaken: 0,
      firesLit: 0,
      fishCaught: 0,
      agilityObstacles: 0,
      arrowsFletched: 0,
      bowsFletched: 0,
      chickensSlain: 0,
      cropsHarvested: 0,
      farmingContractsCompleted: 0,
      fieldImpsSlain: 0,
      gemsCut: 0,
      herbsCleaned: 0,
      herbsHarvested: 0,
      jewelryCrafted: 0,
      riftFiendsSlain: 0,
      logsCut: 0,
      bananasPicked: 0,
      islandTrips: 0,
      jungleSpidersSlain: 0,
      redclawsCaught: 0,
      redclawsCooked: 0,
      keeningShadesSlain: 0,
      graspingClawsSlain: 0,
      desertScorpionsSlain: 0,
      highwaymenSlain: 0,
      hillGiantsSlain: 0,
      miasmaWraithsSlain: 0,
      towerChestsOpened: 0,
      mapsOpened: 0,
      oresMined: 0,
      potionsDrunk: 0,
      potionsMixed: 0,
      poisonsCured: 0,
      randomEventsCompleted: 0,
      essenceMined: 0,
      sigilsCrafted: 0,
      galeSigilsCrafted: 0,
      whisperSigilsCrafted: 0,
      riftSigilsCrafted: 0,
      oathSigilsCrafted: 0,
      cryptWightsDefeated: 0,
      cryptChestsOpened: 0,
      bannerfallPlayed: 0,
      bannerfallWon: 0,
      bannersCaptured: 0,
      vigilTasksCompleted: 0,
      stallsStolen: 0,
      visitedSouthport: false,
      visitedAshlands: false,
      websCut: 0,
    },
    vigil: { task: null, streak: 0, points: 0 },
    sigilPouch: { essence: 0, capacity: 12 },
    crypt: { awakened: [], defeated: [], chestsOpened: 0, lastReward: null },
    bannerfall: { active: false, score: 0, enemyScore: 0, flagHeld: false, endsAt: 0, nextEnemyScore: 0, supplyReadyAt: 0, lastReward: null },
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
      resolveMode: "none",
      resolvePoints: 10,
      boosts: {},
      boostDecay: 60,
      runEnergy: 100,
      hp: 100,
      poisonDamage: 0,
      poisonTick: 0,
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
    state.player.skills[skill] = { xp: skill === "Vitality" ? xpForLevel(10) : 0 };
  }

  const DIARY_TASKS = [
    { id: "bank", label: "Use a bank booth", done: () => state.stats.bankUses > 0 },
    { id: "bones", label: "Bury bones", done: () => state.stats.bonesBuried > 0 },
    { id: "fire", label: "Light a fire", done: () => state.stats.firesLit > 0 },
    { id: "fish", label: "Catch fish", done: () => state.stats.fishCaught > 0 },
    { id: "redclaw", label: "Catch a redclaw", done: () => state.stats.redclawsCaught > 0 },
    { id: "ore", label: "Mine ore", done: () => state.stats.oresMined > 0 },
    { id: "potion", label: "Drink a potion", done: () => state.stats.potionsDrunk > 0 },
    { id: "craft", label: "Craft leather", done: () => state.stats.cowhidesCrafted > 0 },
    { id: "jewellery", label: "Cut a gem or craft jewellery", done: () => state.stats.gemsCut > 0 || state.stats.jewelryCrafted > 0 },
    { id: "thieving", label: "Steal from a market stall", done: () => state.stats.stallsStolen > 0 },
    { id: "agility", label: "Clear an agility obstacle", done: () => state.stats.agilityObstacles > 0 },
    { id: "fletching", label: "Fletch bronze arrows", done: () => state.stats.arrowsFletched > 0 },
    { id: "sigilcraft", label: "Craft sigils at an altar", done: () => state.stats.sigilsCrafted > 0 },
    { id: "farming", label: "Harvest a farm patch", done: () => state.stats.cropsHarvested > 0 },
    { id: "banana", label: "Pick island bananas", done: () => state.stats.bananasPicked > 0 },
    { id: "web", label: "Cut an island spider web", done: () => state.stats.websCut > 0 },
    { id: "tower", label: "Open the Gloamspire chest", done: () => state.stats.towerChestsOpened > 0 },
    { id: "keening_shade", label: "Defeat a keening shade", done: () => state.stats.keeningShadesSlain > 0 },
    { id: "herblore", label: "Mix a potion", done: () => state.stats.potionsMixed > 0 },
    { id: "antipoison", label: "Cure poison", done: () => state.stats.poisonsCured > 0 },
    { id: "contract", label: "Complete a farming contract", done: () => state.stats.farmingContractsCompleted > 0 },
    { id: "vigil", label: "Finish a Vigil contract", done: () => state.stats.vigilTasksCompleted > 0 },
    { id: "clue", label: "Solve a clue scroll", done: () => state.stats.cluesSolved > 0 },
    { id: "map", label: "Open the world map", done: () => state.stats.mapsOpened > 0 },
    { id: "event", label: "Claim a random event", done: () => state.stats.randomEventsCompleted > 0 },
    { id: "low_ash", label: "Step into Low Ash", done: () => Boolean(state.stats.visitedAshlands) },
    { id: "southport", label: "Reach Southport docks", done: () => Boolean(state.stats.visitedSouthport) },
    { id: "giant", label: "Defeat a hill giant", done: () => state.stats.hillGiantsSlain > 0 },
    { id: "scorpion", label: "Defeat a desert scorpion", done: () => state.stats.desertScorpionsSlain > 0 },
    { id: "banner_flag", label: "Capture a banner", done: () => state.stats.bannersCaptured > 0 },
    { id: "crypt", label: "Loot the crypt chest", done: () => state.stats.cryptChestsOpened > 0 },
    { id: "wight", label: "Defeat the Hollow wight", done: () => state.stats.hollowWightsSlain > 0 },
  ];

  const MAP_DESTINATIONS = [
    { id: "briarfall", label: "Briarfall", x: 39, y: 39, note: "bank, shops, quests", color: "#ffd86b" },
    { id: "vigil", label: "Vigil Lodge", x: 60, y: 38, note: "assignments and rewards", color: "#74f1ff" },
    { id: "sigilist", label: "Sigilist Spire", x: 52, y: 25, note: "essence and sigilcraft", color: "#d5c7ff" },
    { id: "mine", label: "Greyrock Mine", x: 62, y: 18, note: "ore and furnace road", color: "#cfd3d6" },
    { id: "graveyard", label: "Old Graveyard", x: 55, y: 52, note: "skeletons and bones", color: "#e7dec4" },
    { id: "crypts", label: "Oath Crypts", x: 58, y: 54, note: "wights and chest loot", color: "#b9c7c6" },
    { id: "bannerfall", label: "Bannerfall", x: 72, y: 30, note: "capture flags for tokens", color: "#f0d25d" },
    { id: "lake", label: "Lake Mollusk", x: 64, y: 64, note: "fish and ferry", color: "#7fd7ff" },
    { id: "saffron", label: "Saffron Cay", x: 73, y: 72, note: "30gp ferry, redclaws", color: "#ffe36a", ferryCost: 30 },
    { id: "agility", label: "Agility Yard", x: 31, y: 24, note: "obstacles and run training", color: "#9dff8a" },
    { id: "farm", label: "Bess's Patches", x: 28, y: 44, note: "farming and herbs", color: "#b9e46a" },
    { id: "hollow", label: "Mire Hollow", x: 68, y: 43, note: "skitterers and wight", color: "#a0a8ff" },
    { id: "tower", label: "Gloamspire", x: 72, y: 12, note: "silence hoods, keys, miasma wraiths", color: "#a8f5ff" },
    { id: "mosswood", label: "Mosswood", x: 16, y: 18, note: "brutes and oaks", color: "#9bd36f" },
    { id: "ash", label: "Low Ash", x: 11, y: 12, note: "rift altar, danger", color: "#ff8e77" },
    { id: "cowfield", label: "Cow Field", x: 23, y: 53, note: "hides and beef", color: "#fff0c5" },
    { id: "southport", label: "Southport", x: 64, y: 93, note: "docks, sailors, coast road", color: "#7fd7ff" },
    { id: "eastdunes", label: "East Dunes", x: 97, y: 45, note: "scorpions and tollmen", color: "#eac76f" },
    { id: "northridge", label: "North Ridge", x: 95, y: 13, note: "ore, giants, cold roads", color: "#d4d7d4" },
    { id: "westwood", label: "Westwood", x: 19, y: 85, note: "oaks and big bones", color: "#9bd36f" },
  ];

  const BESTIARY = [
    { type: "chicken", name: "Chicken", level: 1, location: "Cow Field", drops: "feathers, raw chicken", tip: "reliable arrow supply" },
    { type: "giant_rat", name: "Giant rat", level: 2, location: "Cow Field", drops: "bones, coins", tip: "safe novice task" },
    { type: "pasture_cow", name: "Pasture cow", level: 2, location: "Cow Field", drops: "cowhide, beef", tip: "crafting starter" },
    { type: "field_imp", name: "Field imp", level: 5, location: "West fields", drops: "sigils, talismans, potato seeds", tip: "weak to melee" },
    { type: "grave_skeleton", name: "Grave skeleton", level: 12, location: "Old Graveyard", drops: "bones, iron sword", tip: "Resolve fuel" },
    { type: "brine_leech", name: "Brine leech", level: 18, location: "Mire Hollow", drops: "gems, salt", tip: "finish with salt" },
    { type: "mire_skitterer", name: "Mire skitterer", level: 16, location: "Mire Hollow", drops: "gems, coins", tip: "bring food" },
    { type: "grasping_claw", name: "Grasping claw", level: 8, location: "Gloamspire", drops: "tower keys, gloves", tip: "entry tower task" },
    { type: "keening_shade", name: "Keening shade", level: 23, location: "Gloamspire", drops: "keys, ectoplasm", tip: "wear a silence hood" },
    { type: "jungle_spider", name: "Jungle spider", level: 24, location: "Saffron Cay", drops: "bananas, herbs, silk", tip: "poisons; pack antipoison" },
    { type: "desert_scorpion", name: "Desert scorpion", level: 14, location: "East Dunes", drops: "tails, antipoison", tip: "poisons lightly" },
    { type: "highwayman", name: "Highwayman", level: 18, location: "East Dunes", drops: "coins, cake, clues", tip: "thinly spaced ambushes" },
    { type: "hill_giant", name: "Hill giant", level: 28, location: "Westwood / North Ridge", drops: "big bones, roots, club", tip: "slow heavy target" },
    { type: "miasma_wraith", name: "Miasma wraith", level: 46, location: "Gloamspire", drops: "herbs, mystic loot", tip: "wear a mire charm" },
    { type: "dusk_conjurer", name: "Dusk conjurer", level: 20, location: "Low Ash", drops: "rift, talismans, staff", tip: "keep Resolve ready" },
    { type: "moss_brute", name: "Moss brute", level: 28, location: "Mosswood", drops: "mirthleaf seeds, steel", tip: "slow but heavy" },
    { type: "iron_oathbreaker", name: "Iron oathbreaker", level: 33, location: "Low Ash", drops: "oathbreaker helm, legs", tip: "armoured target" },
    { type: "hollow_wight", name: "Hollow wight", level: 34, location: "Mire Hollow", drops: "clues, amulet", tip: "Vigilance quest prey" },
    { type: "crypt_brother", name: "Oath warden", level: 38, location: "Oath Crypts", drops: "chest charge, grave sigils", tip: "wake three, loot once" },
    { type: "rift_fiend", name: "Rift fiend", level: 42, location: "Low Ash", drops: "Aurel sabre", tip: "endgame task" },
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

  const SIGILCRAFT_RECIPES = {
    gale: { name: "Gale", sigil: "gale_sigil", talisman: "gale_focus", level: 1, xp: 5, multipleEvery: 11, color: "#e9f0ff" },
    whisper: { name: "Whisper", sigil: "whisper_sigil", talisman: "whisper_focus", level: 2, xp: 6, multipleEvery: 14, color: "#efc0ff" },
    rift: { name: "Rift", sigil: "rift_sigil", talisman: "rift_focus", level: 15, xp: 10, multipleEvery: 18, color: "#9b75ff" },
    oath: { name: "Oath", sigil: "oath_sigil", talisman: "oath_focus", level: 25, xp: 12, multipleEvery: 22, color: "#f0dc68" },
  };

  const CRYPT_BROTHERS = {
    mord: { name: "Mord the Splitter", type: "crypt_brother_mord", level: 30, hp: 82, attack: 19, strength: 23, defence: 14, x: 53, y: 53, weakness: "Resolve" },
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

  function rectsOverlap(a, b, pad = 0) {
    return a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
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
    return getLevel("Vitality") * 10;
  }

  function maxResolve() {
    return Math.max(10, getLevel("Resolve") * 10);
  }

  function isPoisoned() {
    return (state.player.poisonDamage || 0) > 0;
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

  function resolveBoost(kind) {
    if (state.player.resolvePoints <= 0) return 1;
    if (kind === "strength" && state.player.resolveMode === "burstStrength") return 1.12;
    if (kind === "defence" && state.player.resolveMode === "thickSkin") return 1.15;
    if (kind === "attack" && state.player.resolveMode === "sharpEye") return 1.1;
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
    if (data.poisonCure) {
      const wasPoisoned = isPoisoned();
      state.player.poisonDamage = 0;
      state.player.poisonTick = 0;
      removeSlot(state.player.inventory, slot, 1);
      state.stats.potionsDrunk += 1;
      if (wasPoisoned) state.stats.poisonsCured += 1;
      addChat(wasPoisoned ? "You drink the antipoison. The poison fades." : "You drink the antipoison. It tastes aggressively green.");
      return;
    }
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

  function usingVigilanceBoost(enemy) {
    const helm = state.player.equipment.helm;
    const task = state.vigil.task;
    return Boolean(helm && ITEMS[helm]?.vigilBoost && task && enemy && task.type === enemy.vigilType);
  }

  function vigilProtectionName(kind) {
    if (kind === "keening_shade") return "a silence hood";
    if (kind === "miasma_wraith") return "a mire charm";
    return "proper Vigil gear";
  }

  function hasVigilanceProtection(enemy) {
    if (!enemy?.requiredProtection) return true;
    const helmId = state.player.equipment.helm;
    const helm = ITEMS[helmId];
    if (!helm) return false;
    return Boolean(helm.vigilProtectAll || helm.vigilProtection === enemy.requiredProtection);
  }

  function gainXp(skill, amount) {
    if (!state.player.skills[skill]) return;
    const before = getLevel(skill);
    state.player.skills[skill].xp += amount;
    const after = getLevel(skill);
    if (after > before) {
      addChat(`Congratulations, your ${skill} level is now ${after}.`);
      playSfx("level");
      if (skill === "Vitality") state.player.hp = Math.min(maxHp(), state.player.hp + 10);
      if (skill === "Resolve") state.player.resolvePoints = maxResolve();
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
    if (state.resources.some((resource) => resource.x === x && resource.y === y)) return null;
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
      vigilType: stats.vigilType || type,
      xp: stats.xp || stats.hp * 3,
      aggro: stats.aggro || 4,
      respawn: stats.respawn || 7,
      respawnTimer: 0,
      attackTimer: random() * 2,
      hitFlash: 0,
      wanderTimer: random() * 2,
      wanderDx: 0,
      wanderDy: 0,
      wanderRadius: stats.wanderRadius || 4,
      wanderSpeed: stats.wanderSpeed || 0.55,
      poisonDamage: stats.poisonDamage || 0,
      poisonChance: stats.poisonChance || 0,
      requiredProtection: stats.requiredProtection || null,
      warningCooldown: 0,
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
    setRect(66, 6, 14, 14, "stone");
    setRect(68, 8, 10, 10, "dirt");
    setRect(72, 13, 5, 4, "swamp");
    drawRoad(63, 18, 72, 13, 1);
    setRect(69, 68, 10, 10, "sand");
    setRect(71, 70, 6, 5, "field");
    setRect(74, 68, 4, 4, "stone");
    setRect(71, 75, 6, 2, "dirt");
    drawRoad(72, 75, 75, 70, 1);
    setRect(66, 24, 13, 13, "field");
    setRect(66, 24, 5, 5, "stone");
    setRect(74, 32, 5, 5, "stone");
    setRect(69, 28, 7, 5, "dirt");
    drawRoad(64, 36, 72, 30, 1);

    for (let y = 0; y < WORLD_H; y += 1) {
      for (let x = 0; x < WORLD_W; x += 1) {
        const eastDune = Math.hypot((x - 98) / 1.25, y - 46);
        const westwood = Math.hypot((x - 20) / 1.15, y - 86);
        const ridge = Math.hypot((x - 96) / 1.45, y - 14);
        const southCoast = y > 99 + Math.sin(x * 0.19) * 2;
        if (southCoast) setTile(x, y, "water");
        else if (y > 94 && mapAt(x, y) === "grass") setTile(x, y, "sand");
        if (eastDune < 17) setTile(x, y, eastDune < 8 ? "sand" : mapAt(x, y) === "grass" ? "sand" : mapAt(x, y));
        if (westwood < 15 && mapAt(x, y) === "grass") setTile(x, y, "field");
        if (ridge < 15) setTile(x, y, ridge < 9 ? "stone" : "dirt");
      }
    }
    setRect(57, 88, 17, 8, "town");
    setRect(60, 96, 12, 3, "sand");
    setRect(62, 88, 5, 4, "stone");
    setRect(88, 34, 20, 24, "sand");
    setRect(93, 41, 10, 7, "dirt");
    setRect(101, 49, 4, 3, "water");
    setRect(84, 5, 24, 17, "stone");
    setRect(91, 10, 9, 5, "dirt");
    setRect(8, 75, 27, 22, "field");
    setRect(16, 82, 8, 5, "dirt");
    drawRoad(64, 61, 64, 94, 1);
    drawRoad(64, 93, 97, 45, 1);
    drawRoad(72, 30, 97, 45, 1);
    drawRoad(72, 13, 95, 13, 1);
    drawRoad(23, 53, 19, 85, 1);
    drawRoad(19, 85, 64, 93, 1);

    addScenery("bank_booth", "Bank booth", 34, 30, { width: 4, height: 1, action: "bank" });
    addScenery("chest", "Bank chest", 37, 30, { action: "bank" });
    addScenery("shop_counter", "General store counter", 45, 31, { action: "shop" });
    addScenery("range", "Hall range", 33, 44, { action: "cook" });
    addScenery("altar", "Stone altar", 49, 46, { action: "pray" });
    addScenery("furnace", "Furnace", 53, 29, { action: "smelt" });
    addScenery("anvil", "Anvil", 55, 30, { action: "smith" });
    addScenery("vigil_board", "Vigilance board", 59, 37, { action: "vigil" });
    addScenery("cave", "Damp cave entrance", 68, 43, { action: "cave" });
    addScenery("well", "Town well", 40, 39, { action: "water" });
    addScenery("quest_sign", "Quest noticeboard", 37, 38, { action: "quests" });
    addScenery("market_stall", "Market stall", 44, 36, { action: "steal", level: 1 });
    addScenery("fletching_table", "Fletching table", 43, 34, { action: "fletch" });
    addScenery("sigilist_tower", "Sigilist spire", 52, 25, { action: "examine", interactRange: 2.5 });
    addScenery("gale_altar", "Gale altar", 50, 25, { action: "sigilcraft", sigil: "gale", interactRange: 2.5 });
    addScenery("whisper_altar", "Whisper altar", 54, 25, { action: "sigilcraft", sigil: "whisper", interactRange: 2.5 });
    addScenery("vegetable_patch", "Vegetable patch", 26, 44, { action: "farm", patchId: "vegetable", interactRange: 2.4 });
    addScenery("herb_patch", "Herb patch", 29, 44, { action: "farm", patchId: "herb", interactRange: 2.4 });
    addScenery("compost_bin", "Compost bin", 24, 42, { action: "compost", interactRange: 2.3 });
    addScenery("scarecrow", "Suspicious scarecrow", 31, 42, { action: "examine" });
    addScenery("seed_sacks", "Seed sacks", 27, 41, { action: "examine" });
    addScenery("balance_log", "Balance log", 31, 24, { action: "agility", level: 1, xp: 34, restore: 7, failDamage: 3, cooldown: 2.2 });
    addScenery("rope_swing", "Rope swing", 34, 23, { action: "agility", level: 5, xp: 58, restore: 10, failDamage: 5, cooldown: 3.0 });
    addScenery("stepping_stones", "Stepping stones", 29, 26, { action: "agility", level: 12, xp: 86, restore: 13, failDamage: 7, cooldown: 3.4 });
    addScenery("dock", "Fishing dock", 55, 61, { action: "fish" });
    addScenery("vigil_tower", "Gloamspire door", 71, 12, { action: "tower_door", interactRange: 2.8 });
    addScenery("tower_chest", "Gloamspire chest", 74, 13, { action: "tower_chest", interactRange: 2.5 });
    addScenery("tower_notice", "Tower warning", 69, 10, { action: "examine", interactRange: 2.2 });
    addScenery("island_dock", "Saffron dock", 72, 75, { action: "fish_redclaw", interactRange: 2.8 });
    addScenery("banana_tree", "Banana tree", 72, 71, { action: "banana", interactRange: 2.4, readyAt: 0 });
    addScenery("banana_tree", "Banana tree", 75, 74, { action: "banana", interactRange: 2.4, readyAt: 0 });
    addScenery("volcano_entrance", "Volcano mouth", 75, 70, { action: "examine", interactRange: 2.8 });
    addScenery("spider_web", "Jungle web", 76, 72, { action: "web", interactRange: 2.1, readyAt: 0 });
    addScenery("spider_web", "Jungle web", 78, 73, { action: "web", interactRange: 2.1, readyAt: 0 });
    addScenery("island_stall", "Island supply stall", 73, 73, { action: "island_shop", interactRange: 2.4 });
    addScenery("range", "Island cookfire", 75, 73, { action: "cook" });
    addScenery("oath_altar", "Oath altar", 64, 61, { action: "sigilcraft", sigil: "oath", interactRange: 2.5 });
    addScenery("crypt_mound", "Mord's crypt", 53, 53, { action: "crypt", brother: "mord", interactRange: 2.7 });
    addScenery("crypt_mound", "Vell's crypt", 58, 52, { action: "crypt", brother: "vell", interactRange: 2.7 });
    addScenery("crypt_mound", "Kael's crypt", 61, 55, { action: "crypt", brother: "kael", interactRange: 2.7 });
    addScenery("crypt_chest", "Crypt chest", 58, 55, { action: "crypt_chest", interactRange: 2.7 });
    addScenery("banner_portal", "Bannerfall portal", 69, 36, { action: "bannerfall", interactRange: 3.0 });
    addScenery("banner_flag", "Briar flag", 68, 27, { action: "banner_flag", team: "home", interactRange: 2.5 });
    addScenery("banner_flag", "Rival flag", 76, 34, { action: "banner_flag", team: "enemy", interactRange: 2.5 });
    addScenery("banner_supply", "Bannerfall supply table", 71, 30, { action: "banner_supply", interactRange: 2.4 });
    addScenery("banner_scoreboard", "Bannerfall scoreboard", 72, 31, { action: "banner_scoreboard", interactRange: 2.4 });
    addScenery("ditch", "Ash boundary", 24, 31, { action: "ash" });
    addScenery("rift_altar", "Rift altar", 11, 12, { action: "rift_altar" });
    addScenery("rift_font", "Rift font", 14, 14, { action: "sigilcraft", sigil: "rift", interactRange: 2.7 });
    addScenery("ruins", "Burnt ruins", 17, 20, { action: "examine" });
    addScenery("dock", "Southport jetty", 64, 97, { action: "fish", interactRange: 2.8 });
    addScenery("island_dock", "Southport redclaw pier", 70, 97, { action: "fish_redclaw", interactRange: 2.8 });
    addScenery("quest_sign", "Southport ledger board", 60, 90, { action: "quests" });
    addScenery("market_stall", "Southport fish stall", 70, 90, { action: "steal", level: 8 });
    addScenery("range", "Southport cookfire", 67, 91, { action: "cook" });
    addScenery("well", "Southport well", 59, 92, { action: "water" });
    addScenery("quest_sign", "Westwood trail sign", 19, 85, { action: "examine" });
    addScenery("ruins", "Giant's broken table", 23, 88, { action: "examine" });
    addScenery("quest_sign", "Dunes warning sign", 90, 37, { action: "examine" });
    addScenery("ruins", "Desert waystone", 97, 45, { action: "examine" });
    addScenery("quest_sign", "North ridge sign", 89, 12, { action: "examine" });
    addScenery("ruins", "Ridge cairn", 95, 13, { action: "examine" });

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
    for (const spot of [
      [70, 75],
      [73, 77],
      [77, 75],
    ]) {
      addResource("redclaw_spot", spot[0], spot[1]);
    }
    for (let i = 0; i < 72; i += 1) {
      const x = 7 + Math.floor(hash(i, 203) * 29);
      const y = 74 + Math.floor(hash(i, 211) * 24);
      if (mapAt(x, y) === "grass" || mapAt(x, y) === "field") {
        addResource(hash(i, 227) > 0.48 ? "oak_tree" : "tree", x, y);
      }
    }
    for (let i = 0; i < 58; i += 1) {
      const x = 84 + Math.floor(hash(i, 251) * 24);
      const y = 5 + Math.floor(hash(i, 271) * 20);
      if (mapAt(x, y) === "stone" || mapAt(x, y) === "dirt") {
        const roll = hash(i, 283);
        addResource(roll > 0.62 ? "gold_rock" : roll > 0.36 ? "iron_rock" : roll > 0.18 ? "tin_rock" : "copper_rock", x, y);
      }
    }
    for (const spot of [
      [59, 98],
      [63, 99],
      [68, 99],
      [74, 98],
    ]) {
      addResource("fishing_spot", spot[0], spot[1]);
    }
    for (const spot of [
      [65, 101],
      [71, 101],
      [75, 100],
    ]) {
      addResource("redclaw_spot", spot[0], spot[1]);
    }

    addNpc("banker", "Banker Niles", "banker", 35, 31);
    addNpc("shopkeeper", "Shopkeeper Marnie", "shop", 45, 32);
    addNpc("cook", "Hall Cook", "cook", 32, 45);
    addNpc("priest", "Brother Alden", "priest", 49, 48);
    addNpc("smith", "Furnace Keeper Brigg", "smith", 52, 30);
    addNpc("vigil_master", "Huntwarden Mara", "vigil", 60, 38);
    addNpc("guide", "Town Guide", "guide", 39, 38);
    addNpc("fisher", "Old Ferryman", "fisher", 54, 61);
    addNpc("apothecary", "Apothecary Herwin", "apothecary", 47, 45);
    addNpc("fletcher", "Fletcher Rowan", "fletcher", 43, 35);
    addNpc("sigilist", "Sigilist Elric", "sigilist", 52, 27);
    addNpc("gardener", "Gardener Bess", "gardener", 27, 42);
    addNpc("banner_marshal", "Banner Marshal", "squire", 70, 36);
    addNpc("island_trader", "Trader Kojo", "island_trader", 73, 72);
    addNpc("tower_keeper", "Keeper Maev", "tower_keeper", 70, 11);
    addNpc("guard", "Town Guard", "guard", 41, 37, { patrol: true });
    addNpc("border_guard", "Border Guard", "guard", 25, 32);
    addNpc("southport_sailor", "Sailor Ren", "sailor", 64, 91);
    addNpc("ridge_prospector", "Prospector Gale", "guard", 92, 12);

    for (const [i, spot] of [
      [22, 56],
      [25, 57],
      [28, 56],
      [21, 59],
      [24, 60],
      [27, 59],
      [30, 60],
    ].entries()) {
      addEnemy("chicken", "Chicken", spot[0], spot[1], {
        level: 1,
        hp: 12,
        attack: 1,
        strength: 1,
        defence: 0,
        xp: 12,
        aggro: 0.15,
        respawn: 5,
        wanderRadius: 1.4,
        vigilType: "chicken",
      }, [["feather", 8 + (i % 3) * 2, 0.95], ["raw_chicken", 1, 0.8], ["bones", 1, 0.4]]);
    }

    for (const spot of [
      [15, 48],
      [19, 48],
      [23, 49],
      [16, 52],
      [20, 53],
      [24, 52],
    ]) {
      addEnemy("giant_rat", "Giant rat", spot[0], spot[1], {
        level: 2,
        hp: 18,
        attack: 2,
        strength: 2,
        defence: 1,
        xp: 18,
        aggro: 0.45,
        wanderRadius: 1.6,
        vigilType: "giant_rat",
      }, [["bones", 1, 0.6], ["coins", 3, 0.35]]);
    }
    for (const spot of [
      [19, 55],
      [23, 54],
      [27, 55],
      [21, 58],
      [25, 58],
      [29, 57],
    ]) {
      addEnemy("pasture_cow", "Pasture cow", spot[0], spot[1], {
        level: 2,
        hp: 22,
        attack: 1,
        strength: 2,
        defence: 1,
        xp: 20,
        aggro: 0.2,
        wanderRadius: 1.7,
        vigilType: "pasture_cow",
      }, [["bones", 1, 0.95], ["cowhide", 1, 0.9], ["raw_beef", 1, 0.65]]);
    }
    for (const spot of [
      [14, 33],
      [18, 35],
      [22, 33],
      [15, 39],
      [20, 40],
      [24, 38],
    ]) {
      addEnemy("field_imp", "Field imp", spot[0], spot[1], {
        level: 5,
        hp: 25,
        attack: 4,
        strength: 4,
        defence: 2,
        xp: 30,
        aggro: 1.8,
        wanderRadius: 1.8,
        vigilType: "field_imp",
      }, [["coins", 8, 0.5], ["whisper_sigil", 4, 0.25], ["gale_sigil", 6, 0.25], ["gale_focus", 1, 0.07], ["potato_seed", 2, 0.18]]);
    }
    for (const spot of [
      [6, 16],
      [11, 15],
      [16, 17],
      [7, 22],
      [13, 23],
      [18, 25],
    ]) {
      addEnemy("dusk_conjurer", "Dusk conjurer", spot[0], spot[1], {
        level: 20,
        hp: 58,
        attack: 19,
        strength: 13,
        defence: 8,
        xp: 95,
        aggro: 3.2,
        respawn: 12,
        wanderRadius: 2.0,
        vigilType: "dusk_conjurer",
      }, [["bones", 1, 0.7], ["rift_sigil", 2, 0.35], ["oath_sigil", 1, 0.08], ["rift_focus", 1, 0.06], ["whisper_focus", 1, 0.08], ["magic_potion", 1, 0.1], ["sigilist_cap", 1, 0.07], ["gale_staff", 1, 0.04]]);
    }
    for (const spot of [
      [13, 9],
      [18, 11],
      [11, 15],
      [17, 18],
    ]) {
      addEnemy("iron_oathbreaker", "Iron oathbreaker", spot[0], spot[1], {
        level: 33,
        hp: 92,
        attack: 21,
        strength: 22,
        defence: 20,
        xp: 170,
        aggro: 3.1,
        respawn: 17,
        wanderRadius: 1.8,
        vigilType: "iron_oathbreaker",
      }, [["big_bones", 1, 0.8], ["coins", 65, 0.55], ["defence_potion", 1, 0.12], ["oathbreaker_helm", 1, 0.08], ["iron_platelegs", 1, 0.07], ["steel_sword", 1, 0.06]]);
    }
    addEnemy("rift_fiend", "Rift fiend", 10, 11, {
      level: 42,
      hp: 125,
      attack: 25,
      strength: 28,
      defence: 22,
      xp: 310,
      aggro: 5.2,
      respawn: 35,
      wanderRadius: 2.2,
      vigilType: "rift_fiend",
    }, [["big_bones", 1, 1], ["rift_sigil", 8, 0.55], ["oath_sigil", 2, 0.18], ["clue_scroll", 1, 0.28], ["strength_potion", 1, 0.16], ["aurel_sabre", 1, 0.035], ["vigil_helm", 1, 0.03]]);
    for (const spot of [
      [51, 54],
      [56, 56],
      [61, 55],
      [50, 60],
      [55, 61],
      [57, 58],
    ]) {
      addEnemy("grave_skeleton", "Grave skeleton", spot[0], spot[1], {
        level: 12,
        hp: 42,
        attack: 8,
        strength: 8,
        defence: 6,
        xp: 65,
        aggro: 2.4,
        wanderRadius: 1.7,
        vigilType: "grave_skeleton",
      }, [["bones", 1, 0.95], ["coins", 18, 0.4], ["attack_potion", 1, 0.08], ["iron_sword", 1, 0.06]]);
    }
    for (const spot of [
      [64, 46],
      [69, 48],
      [74, 41],
      [72, 51],
      [66, 52],
    ]) {
      addEnemy("mire_skitterer", "Mire skitterer", spot[0], spot[1], {
        level: 16,
        hp: 50,
        attack: 10,
        strength: 9,
        defence: 7,
        xp: 80,
        aggro: 1.15,
        respawn: 10,
        wanderRadius: 1.7,
        vigilType: "mire_skitterer",
      }, [["bones", 1, 0.7], ["uncut_gem", 1, 0.08], ["energy_potion", 1, 0.1], ["coins", 24, 0.5]]);
    }
    for (const spot of [
      [76, 43],
      [78, 48],
      [72, 52],
      [63, 51],
    ]) {
      addEnemy("brine_leech", "Brine leech", spot[0], spot[1], {
        level: 18,
        hp: 54,
        attack: 9,
        strength: 11,
        defence: 12,
        xp: 90,
        aggro: 1.0,
        respawn: 12,
        wanderRadius: 1.6,
        vigilType: "brine_leech",
        finisher: "brine_charm",
      }, [["bones", 1, 0.55], ["coins", 32, 0.5], ["uncut_gem", 1, 0.1], ["brine_charm", 1, 0.2]]);
    }
    for (const spot of [
      [67, 9],
      [69, 17],
      [75, 9],
      [78, 17],
    ]) {
      addEnemy("grasping_claw", "Grasping claw", spot[0], spot[1], {
        level: 8,
        hp: 32,
        attack: 5,
        strength: 6,
        defence: 4,
        xp: 45,
        aggro: 1.4,
        respawn: 9,
        wanderRadius: 1.2,
        vigilType: "grasping_claw",
      }, [["bones", 1, 0.35], ["tower_key", 1, 0.12], ["ectoplasm", 1, 0.22], ["coins", 16, 0.45], ["leather_gloves", 1, 0.08]]);
    }
    for (const spot of [
      [72, 9],
      [77, 12],
    ]) {
      addEnemy("keening_shade", "Keening shade", spot[0], spot[1], {
        level: 23,
        hp: 64,
        attack: 15,
        strength: 16,
        defence: 10,
        xp: 120,
        aggro: 2.1,
        respawn: 13,
        wanderRadius: 1.3,
        requiredProtection: "keening_shade",
        vigilType: "keening_shade",
      }, [["bones", 1, 0.55], ["tower_key", 1, 0.18], ["ectoplasm", 2, 0.55], ["grave_sigil", 1, 0.12], ["ghostly_robe", 1, 0.035]]);
    }
    for (const spot of [
      [75, 16],
    ]) {
      addEnemy("miasma_wraith", "Miasma wraith", spot[0], spot[1], {
        level: 46,
        hp: 118,
        attack: 27,
        strength: 30,
        defence: 20,
        xp: 280,
        aggro: 2.7,
        respawn: 22,
        wanderRadius: 1.2,
        requiredProtection: "miasma_wraith",
        poisonDamage: 3,
        poisonChance: 0.18,
        vigilType: "miasma_wraith",
      }, [["grimy_mirthleaf", 2, 0.45], ["tower_key", 1, 0.22], ["ectoplasm", 3, 0.7], ["mystic_wand", 1, 0.035], ["clue_scroll", 1, 0.18]]);
    }
    addEnemy("hollow_wight", "Hollow wight", 72, 48, {
      level: 34,
      hp: 115,
      attack: 20,
      strength: 21,
      defence: 18,
      xp: 240,
      aggro: 0.95,
      respawn: 28,
      wanderRadius: 1.2,
      vigilType: "hollow_wight",
    }, [["bones", 1, 1], ["coins", 120, 0.7], ["clue_scroll", 1, 0.35], ["ranging_potion", 1, 0.14], ["surestrike_pendant", 1, 0.08], ["team_cape", 1, 0.06], ["steel_sword", 1, 0.05]]);
    for (const spot of [
      [12, 15],
      [17, 13],
      [20, 18],
      [14, 22],
    ]) {
      addEnemy("moss_brute", "Moss brute", spot[0], spot[1], {
        level: 28,
        hp: 80,
        attack: 16,
        strength: 17,
        defence: 14,
        xp: 130,
        aggro: 3.1,
        respawn: 14,
        wanderRadius: 1.8,
        vigilType: "moss_brute",
      }, [["bones", 1, 0.9], ["coins", 55, 0.55], ["mirthleaf_seed", 2, 0.18], ["strength_potion", 1, 0.12], ["steel_sword", 1, 0.04]]);
    }
    for (const spot of [
      [77, 68],
      [78, 67],
      [78, 69],
      [77, 71],
      [78, 72],
      [77, 73],
    ]) {
      addEnemy("jungle_spider", "Jungle spider", spot[0], spot[1], {
        level: 24,
        hp: 68,
        attack: 14,
        strength: 15,
        defence: 12,
        xp: 115,
        aggro: 0.1,
        wanderRadius: 1.35,
        wanderSpeed: 0.28,
        poisonDamage: 4,
        poisonChance: 0.28,
        respawn: 15,
        vigilType: "jungle_spider",
      }, [["bones", 1, 0.45], ["banana", 1, 0.45], ["spider_silk", 2, 0.62], ["grimy_mirthleaf", 1, 0.12], ["coins", 42, 0.5], ["clue_scroll", 1, 0.08]]);
    }
    addEnemy("rift_fiend", "Volcano fiend", 76, 68, {
      level: 42,
      hp: 125,
      attack: 25,
      strength: 28,
      defence: 22,
      xp: 310,
      aggro: 0.1,
      wanderRadius: 1.0,
      wanderSpeed: 0.2,
      respawn: 36,
      vigilType: "rift_fiend",
    }, [["big_bones", 1, 1], ["rift_sigil", 7, 0.48], ["oath_sigil", 2, 0.16], ["raw_redclaw", 1, 0.24], ["aurel_sabre", 1, 0.035]]);
    for (const spot of [
      [13, 88],
      [22, 83],
      [30, 91],
      [91, 14],
      [101, 18],
    ]) {
      addEnemy("hill_giant", "Hill giant", spot[0], spot[1], {
        level: 28,
        hp: 96,
        attack: 17,
        strength: 23,
        defence: 14,
        xp: 155,
        aggro: 0.85,
        respawn: 20,
        wanderRadius: 1.45,
        wanderSpeed: 0.42,
        vigilType: "hill_giant",
      }, [["big_bones", 1, 1], ["coins", 72, 0.6], ["limpwurt_root", 1, 0.32], ["strength_potion", 1, 0.08], ["giant_club", 1, 0.035]]);
    }
    for (const spot of [
      [90, 41],
      [98, 42],
      [104, 48],
      [94, 55],
      [101, 57],
    ]) {
      addEnemy("desert_scorpion", "Desert scorpion", spot[0], spot[1], {
        level: 14,
        hp: 44,
        attack: 10,
        strength: 9,
        defence: 10,
        xp: 72,
        aggro: 0.7,
        respawn: 12,
        wanderRadius: 1.9,
        wanderSpeed: 0.46,
        poisonDamage: 2,
        poisonChance: 0.14,
        vigilType: "desert_scorpion",
      }, [["bones", 1, 0.45], ["coins", 24, 0.45], ["scorpion_tail", 1, 0.6], ["antipoison", 1, 0.12], ["uncut_gem", 1, 0.06]]);
    }
    for (const spot of [
      [87, 35],
      [103, 38],
      [91, 58],
      [106, 54],
    ]) {
      addEnemy("highwayman", "Highwayman", spot[0], spot[1], {
        level: 18,
        hp: 56,
        attack: 14,
        strength: 13,
        defence: 9,
        xp: 92,
        aggro: 1.2,
        respawn: 14,
        wanderRadius: 2.0,
        vigilType: "highwayman",
      }, [["bones", 1, 0.6], ["coins", 48, 0.72], ["cake", 1, 0.16], ["silk", 1, 0.12], ["clue_scroll", 1, 0.08], ["iron_sword", 1, 0.035]]);
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

  function normalizeBannerfallState() {
    const cw = state.bannerfall || {};
    state.bannerfall = {
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

  function legacyKey(...parts) {
    return parts.join("");
  }

  const LEGACY_ITEM_IDS = new Map([
    [legacyKey("slay", "er_helm"), "vigil_helm"],
    [legacyKey("slay", "er_gem"), "vigil_glass"],
    [legacyKey("ear", "muffs"), "silence_hood"],
    [legacyKey("nose", "_peg"), "mire_charm"],
    [legacyKey("broad", "_arrow"), "ward_arrow"],
    [legacyKey("ru", "ne_scimitar"), "aurel_sabre"],
    [legacyKey("ru", "ne_essence"), "glimmer_shard"],
    [legacyKey("ru", "ne_pouch"), "sigil_satchel"],
    [legacyKey("ai", "r_ru", "ne"), "gale_sigil"],
    [legacyKey("mi", "nd_ru", "ne"), "whisper_sigil"],
    [legacyKey("cha", "os_ru", "ne"), "rift_sigil"],
    [legacyKey("la", "w_ru", "ne"), "oath_sigil"],
    [legacyKey("dea", "th_ru", "ne"), "grave_sigil"],
    [legacyKey("ai", "r_talis", "man"), "gale_focus"],
    [legacyKey("mi", "nd_talis", "man"), "whisper_focus"],
    [legacyKey("cha", "os_talis", "man"), "rift_focus"],
    [legacyKey("la", "w_talis", "man"), "oath_focus"],
    [legacyKey("staff", "_of_", "ai", "r"), "gale_staff"],
    [legacyKey("wiz", "ard_hat"), "sigilist_cap"],
    [legacyKey("bla", "ck_helm"), "oathbreaker_helm"],
    [legacyKey("decor", "ative_helm"), "banner_helm"],
    [legacyKey("decor", "ative_shield"), "banner_shield"],
    [legacyKey("decor", "ative_sword"), "banner_sword"],
    [legacyKey("decor", "ative_platebody"), "banner_platebody"],
    [legacyKey("cast", "le_to", "ken"), "banner_token"],
    [legacyKey("cast", "le_tic", "ket"), "banner_token"],
    [legacyKey("lob", "ster_cage"), "redclaw_cage"],
    [legacyKey("raw_", "lob", "ster"), "raw_redclaw"],
    [legacyKey("lob", "ster"), "redclaw"],
  ]);

  const LEGACY_VIGIL_TYPES = new Map([
    [legacyKey("dark", "_wiz", "ard"), "dusk_conjurer"],
    [legacyKey("bla", "ck_knight"), "iron_oathbreaker"],
    [legacyKey("less", "er_demon"), "rift_fiend"],
    [legacyKey("cave", "_crawler"), "mire_skitterer"],
    [legacyKey("salt", "_slug"), "brine_leech"],
    [legacyKey("crawl", "ing_hand"), "grasping_claw"],
    [legacyKey("ban", "shee"), "keening_shade"],
    [legacyKey("aberr", "ant_spec", "ter"), "miasma_wraith"],
    [legacyKey("deep", "_wight"), "hollow_wight"],
  ]);

  const VIGIL_TYPE_LABELS = {
    dusk_conjurer: "dusk conjurers",
    iron_oathbreaker: "iron oathbreakers",
    rift_fiend: "rift fiends",
    mire_skitterer: "mire skitterers",
    brine_leech: "brine leeches",
    grasping_claw: "grasping claws",
    keening_shade: "keening shades",
    miasma_wraith: "miasma wraiths",
    hollow_wight: "hollow wights",
  };

  function migrateLegacyItemId(itemId) {
    return LEGACY_ITEM_IDS.get(itemId) || itemId;
  }

  function migrateLegacyItemContainer(container) {
    if (!Array.isArray(container)) return;
    for (const item of container) {
      if (item?.id) item.id = migrateLegacyItemId(item.id);
    }
  }

  function migrateLegacyEquipment(equipment) {
    if (!equipment || typeof equipment !== "object") return;
    for (const slot of Object.keys(equipment)) {
      if (equipment[slot]) equipment[slot] = migrateLegacyItemId(equipment[slot]);
    }
  }

  function migrateLegacyCollection(collection) {
    const next = {};
    for (const [itemId, qty] of Object.entries(collection || {})) {
      const migratedId = migrateLegacyItemId(itemId);
      next[migratedId] = Math.max(Number(next[migratedId]) || 0, Number(qty) || 0);
    }
    return next;
  }

  function copyLegacySkill(skills, oldSkill, newSkill) {
    if (!skills?.[oldSkill]) return;
    if (!skills[newSkill] || (skills[oldSkill].xp || 0) > (skills[newSkill].xp || 0)) {
      skills[newSkill] = skills[oldSkill];
    }
  }

  function copyLegacyStat(stats, oldKey, newKey) {
    const oldValue = Number(stats?.[oldKey]);
    if (!Number.isFinite(oldValue)) return;
    stats[newKey] = Math.max(Number(stats[newKey]) || 0, oldValue);
  }

  function migrateLegacyPlayerData(player) {
    if (!player) return;
    migrateLegacyItemContainer(player.inventory);
    migrateLegacyItemContainer(player.bank);
    migrateLegacyEquipment(player.equipment);
    if (player[legacyKey("pray", "erMode")] && !player.resolveMode) player.resolveMode = player[legacyKey("pray", "erMode")];
    if (Number.isFinite(player[legacyKey("pray", "erPoints")]) && !Number.isFinite(player.resolvePoints)) player.resolvePoints = player[legacyKey("pray", "erPoints")];
    copyLegacySkill(player.skills, legacyKey("Hit", "points"), "Vitality");
    copyLegacySkill(player.skills, legacyKey("Pr", "ay", "er"), "Resolve");
    copyLegacySkill(player.skills, legacyKey("Thiev", "ing"), "Pilfering");
    copyLegacySkill(player.skills, legacyKey("Ru", "ne", "crafting"), "Sigilcraft");
    copyLegacySkill(player.skills, legacyKey("Her", "b", "lore"), "Herbalism");
    copyLegacySkill(player.skills, legacyKey("Sl", "ay", "er"), "Vigilance");
  }

  function migrateLegacyStats(stats) {
    copyLegacyStat(stats, legacyKey("gob", "linsSlain"), "fieldImpsSlain");
    copyLegacyStat(stats, legacyKey("dark", "Wiz", "ardsSlain"), "duskConjurersSlain");
    copyLegacyStat(stats, legacyKey("deep", "WightsSlain"), "hollowWightsSlain");
    copyLegacyStat(stats, legacyKey("less", "erDe", "monsSlain"), "riftFiendsSlain");
    copyLegacyStat(stats, legacyKey("crawl", "ingHandsSlain"), "graspingClawsSlain");
    copyLegacyStat(stats, legacyKey("ban", "sheesSlain"), "keeningShadesSlain");
    copyLegacyStat(stats, legacyKey("spec", "tersSlain"), "miasmaWraithsSlain");
    copyLegacyStat(stats, legacyKey("ru", "nesCrafted"), "sigilsCrafted");
    copyLegacyStat(stats, legacyKey("ai", "rRu", "nesCrafted"), "galeSigilsCrafted");
    copyLegacyStat(stats, legacyKey("mi", "ndRu", "nesCrafted"), "whisperSigilsCrafted");
    copyLegacyStat(stats, legacyKey("cha", "osRu", "nesCrafted"), "riftSigilsCrafted");
    copyLegacyStat(stats, legacyKey("la", "wRu", "nesCrafted"), "oathSigilsCrafted");
    copyLegacyStat(stats, legacyKey("ai", "rSigilsCrafted"), "galeSigilsCrafted");
    copyLegacyStat(stats, legacyKey("mi", "ndSigilsCrafted"), "whisperSigilsCrafted");
    copyLegacyStat(stats, legacyKey("cha", "osSigilsCrafted"), "riftSigilsCrafted");
    copyLegacyStat(stats, legacyKey("la", "wSigilsCrafted"), "oathSigilsCrafted");
    copyLegacyStat(stats, legacyKey("cast", "leFlagsCaptured"), "bannersCaptured");
  }

  function migrateLegacyQuests(quests) {
    const oldLunchKey = legacyKey("cooks", "Errand");
    if (quests?.[oldLunchKey] && !quests.lunchLedger) quests.lunchLedger = quests[oldLunchKey];
  }

  function migrateLegacyVigil(vigil) {
    if (!vigil?.task) return vigil;
    vigil.task.type = LEGACY_VIGIL_TYPES.get(vigil.task.type) || vigil.task.type;
    if (VIGIL_TYPE_LABELS[vigil.task.type]) vigil.task.label = VIGIL_TYPE_LABELS[vigil.task.type];
    return vigil;
  }

  function normalizePlayerState() {
    ensureSlots(state.player.inventory, 28);
    ensureSlots(state.player.bank, 48);
    normalizeFarmingPatches();
    normalizeCryptState();
    normalizeBannerfallState();
    state.sigilPouch = {
      essence: clamp(Number(state.sigilPouch?.essence) || 0, 0, Number(state.sigilPouch?.capacity) || 12),
      capacity: Number(state.sigilPouch?.capacity) || 12,
    };
    state.player.boosts = state.player.boosts || {};
    state.player.boostDecay = state.player.boostDecay || 60;
    state.player.poisonDamage = Math.max(0, Number(state.player.poisonDamage) || 0);
    state.player.poisonTick = Math.max(0, Number(state.player.poisonTick) || 0);
    for (const skill of skillNames) {
      if (!state.player.skills[skill]) state.player.skills[skill] = { xp: skill === "Vitality" ? xpForLevel(10) : 0 };
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
      addChat("The Briarfall diary is not complete.");
      return;
    }
    state.diaryRewardClaimed = true;
    addInventory("achievement_cape", 1);
    addInventory("oath_sigil", 8);
    gainXp("Crafting", 250);
    gainXp("Vigilance", 250);
    addChat("Briarfall Diary complete. Concord mantle unlocked!", "loot");
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
      ? ["aurel_sabre", 1]
      : roll > 0.965
        ? [choice(["crypt_helm", "ancient_page", "mystic_wand"]), 1]
        : roll > 0.92
          ? [choice(["team_cape", "ghostly_robe"]), 1]
          : roll > 0.82
            ? ["clue_scroll", 1]
            : roll > 0.66
              ? [choice(["uncut_gem", "cut_gem", "gold_bar", "raw_redclaw"]), 1]
              : roll > 0.5
                ? [choice(["attack_potion", "strength_potion", "defence_potion", "energy_potion"]), 1]
                : roll > 0.32
                  ? [choice(["oath_sigil", "grave_sigil"]), 2 + Math.floor(random() * 3)]
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
    if (state.bannerfall.active) return;
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
    const hp = getLevel("Vitality");
    const mag = getLevel("Magic");
    const rng = getLevel("Ranged");
    return Math.floor((def + hp + Math.floor((atk + str) * 1.3) + Math.floor(Math.max(mag, rng) * 0.5)) / 4);
  }

  function initInventory() {
    addInventory("bread", 3, true);
    addInventory("coins", 45, true);
    addInventory("knife", 1, true);
    addInventory("chisel", 1, true);
    addInventory("vigil_glass", 1, true);
    addInventory("gale_sigil", 20, true);
    addInventory("whisper_sigil", 10, true);
    addInventory("gale_focus", 1, true);
    addInventory("potato_seed", 2, true);
    addInventory("empty_vial", 1, true);
    addInventory("grimy_mirthleaf", 1, true);
    addBank("logs", 8);
    addBank("feather", 30);
    addBank("bow_string", 2);
    addBank("glimmer_shard", 10);
    addBank("whisper_focus", 1);
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
    updateBannerfall(dt);
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
    if (player.resolveMode !== "none") {
      player.resolvePoints = Math.max(0, player.resolvePoints - dt * 1.25);
      if (player.resolvePoints <= 0) {
        player.resolveMode = "none";
        addChat("You have run out of Resolve points.");
      }
    }
    if (player.resolveMode === "rapidHeal" && player.resolvePoints > 0 && player.hp < maxHp()) {
      player.hp = Math.min(maxHp(), player.hp + dt * 1.8);
    }
    updatePoison(dt);
    updateBoosts(dt);
    if (state.musicOn && state.time >= state.nextMusic) {
      state.nextMusic = state.time + 9 + random() * 7;
      playJingle([220, 277, 330, 277], 0.12, "triangle", 0.025);
    }
    const nextArea = areaAt(player.x, player.y);
    if (nextArea !== state.areaName && state.time > 2) addChat(`Now entering ${nextArea}.`);
    state.areaName = nextArea;
    if (nextArea === "Low Ash" && !state.stats.visitedAshlands) {
      state.stats.visitedAshlands = true;
      addChat("Warning! Low Ash is dangerous.", "danger");
    }
    if (nextArea === "Southport" && !state.stats.visitedSouthport) {
      state.stats.visitedSouthport = true;
      addChat("Southport's docks smell like salt, tar, and side quests.");
    }
    const cryptPressure = Math.max(0, (state.crypt?.awakened?.length || 0) - (state.crypt?.defeated?.length || 0));
    if (nextArea === "Old Graveyard" && cryptPressure > 0 && player.resolvePoints > 0) {
      player.resolvePoints = Math.max(0, player.resolvePoints - dt * (0.18 + cryptPressure * 0.08));
    }
  }

  function areaAt(x, y) {
    if (x < 22 && y < 28) return "Low Ash";
    if (x > 52 && x < 79 && y > 84) return "Southport";
    if (x > 84 && y > 30 && y < 62) return "East Dunes";
    if (x > 82 && y < 25) return "North Ridge";
    if (x < 36 && y > 72) return "Westwood";
    if (x > 66 && y > 7 && y < 19) return "Gloamspire";
    if (x > 64 && y > 22 && y < 39) return "Bannerfall";
    if (x > 68 && x < 82 && y > 67 && y < 82) return "Saffron Cay";
    if (Math.hypot(x - 60, y - 38) < 5) return "Vigil Lodge";
    if (Math.hypot(x - 66, y - 43) < 11) return "Mire Hollow";
    if (Math.hypot(x - 62, y - 18) < 12) return "Greyrock Mine";
    if (Math.hypot(x - 52, y - 25) < 7) return "Sigilist Spire";
    if (Math.hypot(x - 31, y - 24) < 7) return "Agility Yard";
    if (Math.hypot(x - 55, y - 52) < 12) return "Old Graveyard";
    if (Math.hypot(x - 28, y - 44) < 7) return "Bess's Patches";
    if (Math.hypot(x - 23, y - 53) < 9) return "Cow Field";
    if (x > 30 && x < 56 && y > 27 && y < 48) return "Briarfall";
    if (Math.hypot(x - 64, y - 64) < 11) return "Lake Mollusk";
    if (Math.hypot(x - 16, y - 18) < 10) return "Mosswood";
    return "Outer Road";
  }

  function isMultiCombatArea(name) {
    return name === "Low Ash";
  }

  function singleCombatAggressorId() {
    if (state.player.combatTarget) return state.player.combatTarget;
    let best = null;
    let bestD = Infinity;
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      if (isMultiCombatArea(areaAt(enemy.x, enemy.y))) continue;
      const d = dist(enemy, state.player);
      if (d < enemy.aggro && d < bestD) {
        best = enemy.id;
        bestD = d;
      }
    }
    return best;
  }

  function updatePoison(dt) {
    const player = state.player;
    if (!isPoisoned()) return;
    player.poisonTick -= dt;
    if (player.poisonTick > 0) return;
    player.poisonTick = 18;
    const hit = Math.max(1, Math.ceil(player.poisonDamage));
    player.hp = Math.max(1, player.hp - hit);
    player.damageFlash = 0.4;
    addFloatingText(player.x, player.y, `${hit}`, "#58d35b");
    player.poisonDamage = Math.max(0, player.poisonDamage - 1);
    if (!isPoisoned()) addChat("The poison wears off.");
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
    } else if (resource.type === "redclaw_spot") {
      if (getLevel("Fishing") < 35) {
        addChat("You need Fishing level 35 to catch redclaws.");
        return;
      }
      if (inventoryCount("redclaw_cage") <= 0) {
        addChat("You need a redclaw pot.");
        return;
      }
      state.player.action = {
        kind: "redclaw_fishing",
        resourceId: resource.id,
        progress: 0,
        duration: 4.1,
      };
      addChat("You lower the redclaw pot.");
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
      if (!addInventory("glimmer_shard")) return;
      gainXp("Mining", 12);
      gainXp("Sigilcraft", 4);
      state.stats.essenceMined += 1;
      resource.depleted = state.time + 2.2;
    } else if (action.kind === "fishing") {
      const trout = Math.hypot(resource.x - 64, resource.y - 64) < 7;
      const item = trout ? "raw_trout" : "raw_shrimp";
      if (!addInventory(item)) return;
      gainXp("Fishing", trout ? 60 : 25);
      state.stats.fishCaught += 1;
      resource.depleted = state.time + 1.5;
    } else if (action.kind === "redclaw_fishing") {
      if (!addInventory("raw_redclaw")) return;
      gainXp("Fishing", 110);
      state.stats.fishCaught += 1;
      state.stats.redclawsCaught += 1;
      resource.depleted = state.time + 2.3;
    }
  }

  function actionSkill(kind) {
    if (kind === "woodcutting") return "Woodcutting";
    if (kind === "mining") return "Mining";
    if (kind === "essence") return "Mining";
    if (kind === "fishing") return "Fishing";
    if (kind === "redclaw_fishing") return "Fishing";
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
      const ammo = inventoryCount("ward_arrow") > 0 ? "ward_arrow" : inventoryCount("bronze_arrow") > 0 ? "bronze_arrow" : null;
      if (usingRanged && !ammo) {
        addChat("You are out of arrows.");
        player.combatTarget = null;
        return;
      }
      if (usingRanged) removeItem(state.player.inventory, ammo, 1);
      const offensiveLevel = (usingRanged ? effectiveLevel("Ranged") : effectiveLevel("Attack")) * resolveBoost("attack");
      const powerLevel = (usingRanged ? effectiveLevel("Ranged") : effectiveLevel("Strength")) * resolveBoost("strength");
      const vigilBonus = usingVigilanceBoost(enemy) ? 1.16 : 1;
      const protectedGear = hasVigilanceProtection(enemy);
      const protectionPenalty = protectedGear ? 1 : 0.52;
      if (!protectedGear) warnVigilanceProtection(enemy);
      const attackRoll = (offensiveLevel + equipmentBonus("attack")) * vigilBonus * protectionPenalty + random() * 12;
      const defenceRoll = enemy.defence + random() * 15;
      const maxHit = Math.max(1, Math.floor(((powerLevel + equipmentBonus("strength")) * vigilBonus * protectionPenalty) / 3) + (ammo === "ward_arrow" ? 2 : 1));
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
        gainXp("Vitality", Math.max(1, hit * 1.33));
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

  function poisonPlayer(amount, sourceName) {
    const body = ITEMS[state.player.equipment.body];
    if (body?.poisonResist && random() < 0.45) {
      addFloatingText(state.player.x, state.player.y, "resist", "#b8ffb2");
      return;
    }
    if ((state.player.poisonDamage || 0) >= amount) return;
    state.player.poisonDamage = amount;
    state.player.poisonTick = 8;
    addChat(`${sourceName} poisons you.`, "danger");
  }

  function warnVigilanceProtection(enemy) {
    if (!enemy?.requiredProtection) return;
    if (enemy.warningCooldown > 0) return;
    enemy.warningCooldown = 7;
    if (enemy.requiredProtection === "keening_shade") {
      addChat("The keening shade shrieks through your skull. A silence hood would help.", "danger");
    } else if (enemy.requiredProtection === "miasma_wraith") {
      addChat("The miasma wraith chokes you with swamp stink. A mire charm would help.", "danger");
    } else {
      addChat(`You need ${vigilProtectionName(enemy.requiredProtection)} for this task.`, "danger");
    }
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
    state.stats.fieldImpsSlain += enemy.type === "field_imp" ? 1 : 0;
    state.stats.duskConjurersSlain += enemy.type === "dusk_conjurer" ? 1 : 0;
    state.stats.hollowWightsSlain += enemy.type === "hollow_wight" ? 1 : 0;
    state.stats.jungleSpidersSlain += enemy.type === "jungle_spider" ? 1 : 0;
    state.stats.riftFiendsSlain += enemy.type === "rift_fiend" ? 1 : 0;
    state.stats.graspingClawsSlain += enemy.type === "grasping_claw" ? 1 : 0;
    state.stats.keeningShadesSlain += enemy.type === "keening_shade" ? 1 : 0;
    state.stats.miasmaWraithsSlain += enemy.type === "miasma_wraith" ? 1 : 0;
    state.stats.hillGiantsSlain += enemy.type === "hill_giant" ? 1 : 0;
    state.stats.desertScorpionsSlain += enemy.type === "desert_scorpion" ? 1 : 0;
    state.stats.highwaymenSlain += enemy.type === "highwayman" ? 1 : 0;
    for (const [itemId, qty, chance] of enemy.loot) {
      if (random() < chance) dropGroundItem(itemId, qty, enemy.x, enemy.y);
    }
    if (random() < 0.025 + enemy.level * 0.001) dropGroundItem("clue_scroll", 1, enemy.x, enemy.y);
    handleCryptWightDefeat(enemy);
    handleVigilanceKill(enemy);
    if (enemy.type === "grave_skeleton" && state.quests.restlessBones.state === "started") addChat("The priest will like those bones.");
    if (enemy.type === "keening_shade" && state.quests.towerWhispers.state === "started") addChat("Mara wanted proof from the tower. Find a key and report back.");
  }

  function handleVigilanceKill(enemy) {
    const task = state.vigil.task;
    if (!task || task.type !== enemy.vigilType) return;
    task.remaining -= 1;
    gainXp("Vigilance", Math.max(15, enemy.level * 4));
    addChat(`Vigil contract: ${task.remaining} ${task.label} left.`);
    if (task.remaining <= 0) {
      state.vigil.streak += 1;
      state.stats.vigilTasksCompleted += 1;
      state.vigil.points += 2 + Math.floor(state.vigil.streak / 5);
      const coins = 50 + state.vigil.streak * 15;
      addInventory("coins", coins);
      if (random() < 0.35) addInventory("clue_scroll", 1);
      gainXp("Vigilance", 80 + enemy.level * 6);
      addChat(`Task complete. Vigil streak ${state.vigil.streak}.`);
      state.vigil.task = null;
    }
  }

  function updateEnemies(dt) {
    const singleAggressorId = singleCombatAggressorId();
    for (const enemy of state.enemies) {
      if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
      if (enemy.warningCooldown > 0) enemy.warningCooldown -= dt;
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
      const playerTargetingEnemy = state.player.combatTarget === enemy.id;
      const allowedToEngage = playerTargetingEnemy || isMultiCombatArea(areaAt(enemy.x, enemy.y)) || enemy.id === singleAggressorId;
      if ((d < enemy.aggro || playerTargetingEnemy) && allowedToEngage) {
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
          const defence = effectiveLevel("Defence") * resolveBoost("defence") + equipmentBonus("defence");
          const wildBoost = areaAt(enemy.x, enemy.y) === "Low Ash" ? 1.12 : 1;
          const missingProtection = !hasVigilanceProtection(enemy);
          const protectionPressure = missingProtection ? 1.2 : 1;
          const roll = enemy.attack * wildBoost * protectionPressure + random() * 12;
          const block = defence + random() * 16;
          const baseHit = roll > block ? Math.floor(random() * (enemy.strength * wildBoost * protectionPressure / 2 + 3)) : 0;
          const gearHit = missingProtection ? 2 + Math.floor(random() * 5) : 0;
          const hit = Math.max(baseHit, gearHit);
          if (missingProtection) {
            state.player.resolvePoints = Math.max(0, state.player.resolvePoints - 4);
            warnVigilanceProtection(enemy);
          }
          if (hit > 0) {
            state.player.hp = Math.max(0, state.player.hp - hit);
            state.player.damageFlash = 0.4;
            addFloatingText(state.player.x, state.player.y, `${hit}`, "#ff5858");
            if (enemy.poisonDamage && random() < enemy.poisonChance) poisonPlayer(enemy.poisonDamage, `The ${enemy.name}`);
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
        if (homeD > enemy.wanderRadius) {
          dx = enemy.spawnX - enemy.x;
          dy = enemy.spawnY - enemy.y;
        }
        const l = Math.hypot(dx, dy) || 1;
        const nx = enemy.x + (dx / l) * dt * enemy.wanderSpeed;
        const ny = enemy.y + (dy / l) * dt * enemy.wanderSpeed;
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
          vigil: ["Tasks build character.", "Bring me proof, not excuses."],
          guide: ["Roads are safer. Mostly."],
          fisher: ["The trout know your name."],
          apothecary: ["Freshly labelled. Mostly.", "Drink responsibly, then irresponsibly."],
          fletcher: ["Straight shafts, straight profit."],
          gardener: ["Water once. Wait forever.", "Compost cures many sins."],
          sigilist: ["Essence hums. So do unpaid apprentices.", "Keep clear of the altar sparks."],
          squire: ["Take the flag. Bring it back. Simple until it isn't.", "Tokens buy lovely pointless armour."],
          island_trader: ["Bananas stack badly. Profit stacks nicely.", "Volcano spiders make poor customers."],
          tower_keeper: ["Silence hood for shrieks. Mire charms for stink.", "The tower pays in keys and bruises."],
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
    state.player.poisonDamage = 0;
    state.player.poisonTick = 0;
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
    } else if (npc.role === "vigil") {
      vigilDialogue(npc);
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
    } else if (npc.role === "sigilist") {
      sigilistDialogue(npc);
    } else if (npc.role === "squire") {
      bannerMarshalDialogue(npc);
    } else if (npc.role === "island_trader") {
      islandTraderDialogue(npc);
    } else if (npc.role === "sailor") {
      sailorDialogue(npc);
    } else if (npc.role === "tower_keeper") {
      towerKeeperDialogue(npc);
    } else if (npc.role === "fisher") {
      openDialogue(npc.name, ["Small net for shrimp by the bridge. Higher levels can fish trout at the lake. I also row shortcuts for coin."], [
        { label: "To Lake Mollusk - 12gp", action: () => travelTo(63.5, 62.5, 12, "Lake Mollusk") },
        {
          label: "To Saffron Cay - 30gp",
          action: () => {
            const canPay = inventoryCount("coins") >= 30;
            travelTo(73.5, 72.5, 30, "Saffron Cay");
            if (canPay) state.stats.islandTrips += 1;
          },
        },
        { label: "To Southport - 22gp", action: () => travelTo(64.5, 92.5, 22, "Southport") },
        {
          label: "Buy redclaw pot - 20gp",
          action: () => {
            if (!spendCoins(20)) addChat("You need 20 coins for a redclaw pot.");
            else addInventory("redclaw_cage", 1);
            closeModal();
          },
        },
        { label: "To Greyrock Mine - 18gp", action: () => travelTo(60.5, 20.5, 18, "Greyrock Mine") },
        { label: "To Ash boundary - 25gp", action: () => travelTo(25.5, 32.5, 25, "the Ash boundary") },
        { label: "Close", action: () => closeModal() },
      ]);
    } else if (npc.role === "guide") {
      openDialogue(npc.name, [
        "Click the ground to walk. Click creatures to fight. Skills are slow, numbers go up, and everyone pretends this is healthy.",
      ], [
        { label: "Where do I start?", action: () => addChat("Try Lunch Ledger, mine ore, or ask the Huntwarden for a task.") },
        { label: "Open world map", action: () => openWorldMap() },
        { label: "Close", action: () => closeModal() },
      ]);
    } else {
      openDialogue(npc.name, ["Stay on the roads and keep an eye on your Vitality."], [{ label: "Close", action: () => closeModal() }]);
    }
  }

  function towerKeeperDialogue(npc) {
    openDialogue(npc.name, ["Claws below, keening shades above, miasma wraiths in the damp room. Bring the right nonsense or leave with fewer thoughts."], [
      {
        label: "Buy silence hood - 45gp",
        action: () => {
          if (!spendCoins(45)) addChat("You need 45 coins for a silence hood.");
          else addInventory("silence_hood", 1);
          closeModal();
        },
      },
      {
        label: "Buy mire charm - 65gp",
        action: () => {
          if (!spendCoins(65)) addChat("You need 65 coins for a mire charm.");
          else addInventory("mire_charm", 1);
          closeModal();
        },
      },
      { label: "Ask about keys", action: () => addChat("Maev says: tower keys fall from the things that should not have hands, throats, or manners.") },
      { label: "Close", action: () => closeModal() },
    ]);
  }

  function bannerMarshalDialogue(npc) {
    const cw = state.bannerfall;
    const lines = cw.active
      ? [`Match running: Briar ${cw.score} - Rival ${cw.enemyScore}.`, cw.flagHeld ? "You have their flag. Bring it home." : "Steal the rival flag and return to yours."]
      : [`Tokens owned: ${inventoryCount("banner_token")}.`, "Fancy a game of flags, bandages, and selective memory?"];
    openDialogue(npc.name, lines, [
      { label: cw.active ? "Return to battlements" : "Join Bannerfall", action: () => startBannerfall() },
      { label: "Rewards shop", action: () => openBannerfallShop() },
      { label: "How does this work?", action: () => addChat("Marshal says: take the rival flag, click your flag to score, first to three wins.") },
      { label: "Close", action: () => closeModal() },
    ]);
  }

  function islandTraderDialogue(npc) {
    const quest = state.quests.islandRun;
    const choices = [
      { label: "Trade island supplies", action: () => openIslandShop() },
      { label: "Ask about the island", action: () => addChat("Kojo says: pot redclaws at the dock, pick bananas inland, cut webs with a knife, and pack antipoison.") },
      { label: "Close", action: () => closeModal() },
    ];
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["Mainlanders keep ordering food and forgetting boats exist. Bring me three bananas and one cooked redclaw."], [
        {
          label: "Start Island Supply Run",
          action: () => {
            quest.state = "started";
            addInventory("redclaw_cage", 1);
            addChat("Quest started: Island Supply Run.");
            closeModal();
          },
        },
        ...choices,
      ]);
      return;
    }
    if (quest.state === "started") {
      const ready = inventoryCount("banana") >= 3 && inventoryCount("redclaw") >= 1;
      openDialogue(npc.name, [ready ? "That is a proper island crate." : `Supplies: ${inventoryCount("banana")}/3 bananas, ${inventoryCount("redclaw")}/1 redclaw.`], [
        {
          label: ready ? "Complete quest" : "Keep gathering",
          action: () => {
            if (ready) {
              removeItem(state.player.inventory, "banana", 3);
              removeItem(state.player.inventory, "redclaw", 1);
              quest.state = "completed";
              addInventory("pirate_cutlass", 1);
              addInventory("coins", 180);
              gainXp("Fishing", 220);
              gainXp("Cooking", 180);
              addChat("Quest complete: Island Supply Run.");
            }
            closeModal();
          },
        },
        ...choices.slice(0, 2),
      ]);
      return;
    }
    openDialogue(npc.name, ["Saffron Cay exports fish, fruit, and questionable confidence."], choices);
  }

  function sailorDialogue(npc) {
    const quest = state.quests.frontierLedger;
    const travelChoices = [
      { label: "To Briarfall dock - 20gp", action: () => travelTo(54.5, 61.5, 20, "Briarfall dock") },
      {
        label: "To Saffron Cay - 28gp",
        action: () => {
          const canPay = inventoryCount("coins") >= 28;
          travelTo(73.5, 72.5, 28, "Saffron Cay");
          if (canPay) state.stats.islandTrips += 1;
        },
      },
      { label: "Trade dock supplies", action: () => openSouthportShop() },
      { label: "Ask about the roads", action: () => addChat("Ren says: Westwood has giants, East Dunes has scorpions, and North Ridge has enough ore to ruin backs.") },
      { label: "Close", action: () => closeModal() },
    ];
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The frontier ledger is blank. Bring me a scorpion tail and a giant's big bones so traders believe the roads are open."], [
        {
          label: "Start The Frontier Ledger",
          action: () => {
            quest.state = "started";
            addChat("Quest started: The Frontier Ledger.");
            closeModal();
          },
        },
        ...travelChoices,
      ]);
      return;
    }
    if (quest.state === "started") {
      const ready = inventoryCount("scorpion_tail") >= 1 && inventoryCount("big_bones") >= 1;
      openDialogue(npc.name, [ready ? "That is enough proof for any dock ledger." : `Ledger proof: ${inventoryCount("scorpion_tail")}/1 scorpion tail, ${inventoryCount("big_bones")}/1 big bones.`], [
        {
          label: ready ? "Complete quest" : "Keep exploring",
          action: () => {
            if (ready) {
              removeItem(state.player.inventory, "scorpion_tail", 1);
              removeItem(state.player.inventory, "big_bones", 1);
              quest.state = "completed";
              addInventory("coins", 260);
              addInventory("redclaw_cage", 1);
              addInventory("energy_potion", 1);
              gainXp("Vigilance", 180);
              gainXp("Fishing", 120);
              addChat("Quest complete: The Frontier Ledger.");
            }
            closeModal();
          },
        },
        ...travelChoices.slice(0, 4),
      ]);
      return;
    }
    openDialogue(npc.name, ["Southport has room, roads, and a worrying number of things with claws."], travelChoices);
  }

  function sigilistDialogue(npc) {
    const quest = state.quests.sigilMysteries;
    const choices = [
      { label: "Trade sigil supplies", action: () => openSigilistShop() },
      { label: "Ask about essence", action: () => addChat("Elric says: mine essence in the tower, carry a talisman, then use an altar.") },
      { label: "Close", action: () => closeModal() },
    ];
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The stones are humming again. Craft ten sigils and I will admit that you are minimally mystical."], [
        {
          label: "Start Sigil Mysteries",
          action: () => {
            quest.state = "started";
            addInventory("glimmer_shard", 10);
            addInventory("gale_focus", 1);
            addChat("Quest started: Sigil Mysteries.");
            closeModal();
          },
        },
        ...choices,
      ]);
    } else if (quest.state === "started") {
      const ready = state.stats.sigilsCrafted >= 10;
      openDialogue(npc.name, [ready ? "Those sigils are crude, but undeniably sigils." : `Sigils crafted: ${state.stats.sigilsCrafted}/10.`], [
        {
          label: ready ? "Complete quest" : "Keep crafting",
          action: () => {
            if (ready) {
              quest.state = "completed";
              addInventory("sigil_satchel", 1);
              addInventory("whisper_focus", 1);
              addInventory("glimmer_shard", 12);
              gainXp("Sigilcraft", 160);
              gainXp("Magic", 80);
              addChat("Quest complete: Sigil Mysteries.");
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
              gainXp("Herbalism", 120);
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
    const quest = state.quests.lunchLedger;
    if (quest.state === "not-started") {
      openDialogue(npc.name, ["The banquet is ruined. I need cooked shrimp and logs for the range."], [
        {
          label: "Start Lunch Ledger",
          action: () => {
            quest.state = "started";
            addChat("Quest started: Lunch Ledger.");
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
              addChat("Quest complete: Lunch Ledger.");
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
              gainXp("Resolve", 220);
              addChat("Quest complete: Restless Bones.");
            }
            closeModal();
          },
        },
      ]);
    } else {
      openDialogue(npc.name, ["The graveyard is quieter now. The crypts, less so."], [
        { label: "Ask about crypts", action: () => addChat(`Brother Alden says: wake each oath warden, survive, then loot the chest. ${cryptStatusText()}.`) },
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

  function vigilDialogue(npc) {
    const task = state.vigil.task;
    const wightQuest = state.quests.wightHunt;
    const towerQuest = state.quests.towerWhispers;
    const lines = task
      ? [`Your task is to kill ${task.remaining} more ${task.label}.`, `Streak: ${state.vigil.streak}. Points: ${state.vigil.points}.`]
      : ["No task. That means you are currently wasting perfectly good violence."];
    const choices = [
      {
        label: task ? "Ask about task" : "Get Vigilance assignment",
        action: () => {
          if (!state.vigil.task) assignVigilanceTask();
          else addChat(`The Vigil glass hums: ${task.remaining} ${task.label} left.`);
          closeModal();
        },
      },
      {
        label: "Cancel task for 1 point",
        action: () => {
          if (state.vigil.points >= 1 && state.vigil.task) {
            state.vigil.points -= 1;
            state.vigil.task = null;
            addChat("Your Vigil contract is cancelled.");
          } else addChat("You cannot cancel right now.");
          closeModal();
        },
      },
      {
        label: "Rewards shop",
        action: () => openVigilanceShop(),
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
          state.stats.hollowWightsSlain = 0;
          addChat("Quest started: Wight in the Hollow.");
          closeModal();
        },
      });
    } else if (wightQuest.state === "started") {
      choices.push({
        label: state.stats.hollowWightsSlain > 0 ? "Claim wight reward" : "Ask about wight",
        action: () => {
          if (state.stats.hollowWightsSlain > 0) {
            wightQuest.state = "completed";
            state.vigil.points += 3;
            addInventory("clue_scroll", 1);
            gainXp("Vigilance", 300);
            addChat("Quest complete: Wight in the Hollow.");
          } else addChat("Mara points toward Mire Hollow: kill the Hollow wight.");
          closeModal();
        },
      });
    }
    if (towerQuest.state === "not-started") {
      choices.push({
        label: "Tower whispers",
        action: () => {
          towerQuest.state = "started";
          addInventory("silence_hood", 1);
          addChat("Quest started: Tower of Whispers.");
          closeModal();
        },
      });
    } else if (towerQuest.state === "started") {
      const ready = state.stats.keeningShadesSlain > 0 && inventoryCount("tower_key") > 0;
      choices.push({
        label: ready ? "Claim tower reward" : "Ask about tower",
        action: () => {
          if (ready) {
            removeItem(state.player.inventory, "tower_key", 1);
            towerQuest.state = "completed";
            state.vigil.points += 2;
            addInventory("mire_charm", 1);
            addInventory("grave_sigil", 3);
            gainXp("Vigilance", 260);
            addChat("Quest complete: Tower of Whispers.");
          } else {
            addChat("Mara says: wear a silence hood, defeat a keening shade, and bring me a tower key.");
          }
          closeModal();
        },
      });
    }
    choices.push({ label: "Close", action: () => closeModal() });
    openDialogue(npc.name, lines, choices);
  }

  function openVigilanceShop() {
    state.modal = {
      type: "shop",
      title: "Vigil Rewards",
      currency: "vigil",
      rects: [],
      stock: [
        { id: "ward_arrow", price: 1, qty: 35 },
        { id: "brine_charm", price: 1, qty: 20 },
        { id: "silence_hood", price: 1 },
        { id: "mire_charm", price: 2 },
        { id: "antipoison", price: 1 },
        { id: "clue_scroll", price: 2 },
        { id: "surestrike_pendant", price: 3 },
        { id: "vigil_helm", price: 5 },
      ],
    };
  }

  function assignVigilanceTask() {
    const vigil = getLevel("Vigilance");
    const combat = combatLevel();
    const pool = [
      { type: "giant_rat", label: "giant rats", amount: 6, minCombat: 1, xp: 30 },
      { type: "chicken", label: "chickens", amount: 6, minCombat: 1, xp: 22 },
      { type: "pasture_cow", label: "pasture cows", amount: 6, minCombat: 1, xp: 28 },
      { type: "field_imp", label: "field imps", amount: 6, minCombat: 4, xp: 45 },
      { type: "grave_skeleton", label: "grave skeletons", amount: 6, minCombat: 10, xp: 75 },
      { type: "grasping_claw", label: "grasping claws", amount: 5, minCombat: 8, xp: 60 },
      { type: "brine_leech", label: "brine leeches", amount: 5, minCombat: 12, xp: 80 },
      { type: "mire_skitterer", label: "mire skitterers", amount: 6, minCombat: 12, xp: 95 },
      { type: "desert_scorpion", label: "desert scorpions", amount: 5, minCombat: 14, xp: 85 },
      { type: "highwayman", label: "highwaymen", amount: 5, minCombat: 16, xp: 95 },
      { type: "jungle_spider", label: "jungle spiders", amount: 8, minCombat: 16, xp: 105 },
      { type: "dusk_conjurer", label: "dusk conjurers", amount: 6, minCombat: 18, xp: 110 },
      { type: "keening_shade", label: "keening shades", amount: 4, minCombat: 20, xp: 115 },
      { type: "moss_brute", label: "moss brutes", amount: 4, minCombat: 24, xp: 140 },
      { type: "hill_giant", label: "hill giants", amount: 4, minCombat: 24, xp: 145 },
      { type: "iron_oathbreaker", label: "iron oathbreakers", amount: 4, minCombat: 28, xp: 175 },
      { type: "hollow_wight", label: "hollow wights", amount: 3, minCombat: 30, xp: 220 },
      { type: "miasma_wraith", label: "miasma wraiths", amount: 2, minCombat: 42, xp: 260 },
      { type: "rift_fiend", label: "rift fiends", amount: 2, minCombat: 38, xp: 260 },
    ].filter((task) => combat >= task.minCombat || vigil >= Math.floor(task.minCombat / 2));
    const task = choice(pool);
    state.vigil.task = { ...task, remaining: task.amount + Math.floor(random() * 4) };
    gainXp("Vigilance", Math.max(5, Math.floor(task.xp / 4)));
    addChat(`New Vigil contract: kill ${state.vigil.task.remaining} ${state.vigil.task.label}.`);
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
        { id: "redclaw_cage", price: 28 },
        { id: "brine_charm", price: 6, qty: 10 },
        { id: "feather", price: 15, qty: 30 },
        { id: "bow_string", price: 24 },
        { id: "wooden_shield", price: 24 },
        { id: "leather_body", price: 80 },
        { id: "raw_shrimp", price: 5 },
        { id: "gale_sigil", price: 5, qty: 10 },
        { id: "whisper_sigil", price: 4, qty: 10 },
        { id: "rift_sigil", price: 55, qty: 3 },
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
        { id: "antipoison", price: 48 },
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

  function openSigilistShop() {
    state.modal = {
      type: "shop",
      title: "Sigilist Spire",
      rects: [],
      stock: [
        { id: "glimmer_shard", price: 18, qty: 8 },
        { id: "gale_focus", price: 55 },
        { id: "whisper_focus", price: 70 },
        { id: "rift_focus", price: 260 },
        { id: "oath_focus", price: 360 },
        { id: "gale_sigil", price: 5, qty: 20 },
        { id: "whisper_sigil", price: 4, qty: 20 },
      ],
    };
  }

  function openIslandShop() {
    state.modal = {
      type: "shop",
      title: "Saffron Trader",
      rects: [],
      stock: [
        { id: "redclaw_cage", price: 25 },
        { id: "banana", price: 7, qty: 3 },
        { id: "raw_redclaw", price: 72 },
        { id: "redclaw", price: 118 },
        { id: "antipoison", price: 52 },
        { id: "energy_potion", price: 42 },
      ],
    };
  }

  function openSouthportShop() {
    state.modal = {
      type: "shop",
      title: "Southport Supplies",
      rects: [],
      stock: [
        { id: "redclaw_cage", price: 24 },
        { id: "raw_shrimp", price: 7, qty: 3 },
        { id: "raw_trout", price: 26 },
        { id: "bread", price: 9 },
        { id: "energy_potion", price: 38 },
        { id: "antipoison", price: 48 },
      ],
    };
  }

  function openBannerfallShop() {
    state.modal = {
      type: "shop",
      title: "Bannerfall Spoils",
      currency: "banner",
      rects: [],
      stock: [
        { id: "banner_bandage", price: 1, qty: 3 },
        { id: "banner_helm", price: 3 },
        { id: "banner_shield", price: 4 },
        { id: "banner_sword", price: 5 },
        { id: "banner_platebody", price: 7 },
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
      state.player.resolvePoints = maxResolve();
      addChat("You restore your Resolve points.");
    } else if (action === "smelt") smelt();
    else if (action === "smith") smith();
    else if (action === "vigil") {
      const master = state.npcs.find((npc) => npc.role === "vigil");
      vigilDialogue(master);
    } else if (action === "cave") addChat("A chill rises from the cave. The Hollow wight waits beyond the skitterers.");
    else if (action === "quests") {
      state.tab = "quests";
      addChat("The noticeboard lists the town's problems.");
    } else if (action === "fish") {
      const spot = nearestResource("fishing_spot");
      if (spot) resourceAction(spot);
    } else if (action === "fish_redclaw") {
      const spot = nearestResource("redclaw_spot");
      if (spot) resourceAction(spot);
    } else if (action === "banana") {
      pickBanana(obj);
    } else if (action === "web") {
      cutSpiderWeb(obj);
    } else if (action === "island_shop") {
      openIslandShop();
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
    } else if (action === "sigilcraft") {
      craftSigils(obj);
    } else if (action === "tower_door") {
      addChat("The Gloamspire door groans open. Inside: hands, shrieks, and damp mistakes.");
    } else if (action === "tower_chest") {
      openTowerChest();
    } else if (action === "crypt") {
      summonCryptBrother(obj);
    } else if (action === "crypt_chest") {
      openCryptChest();
    } else if (action === "bannerfall") {
      startBannerfall();
    } else if (action === "banner_flag") {
      handleBannerFlag(obj);
    } else if (action === "banner_supply") {
      useBannerSupply();
    } else if (action === "banner_scoreboard") {
      addChat(bannerfallScoreText());
    } else if (action === "ash") {
      addChat("The ditch marks Low Ash. Everything there hits harder.", "danger");
    } else if (action === "rift_altar") {
      state.player.resolvePoints = maxResolve();
      state.player.hp = Math.min(maxHp(), state.player.hp + 15);
      addChat("Rift energy restores your Resolve.");
    } else addChat(`You examine the ${obj.name}.`);
  }

  function nearestResource(type) {
    return state.resources
      .filter((r) => r.type === type)
      .sort((a, b) => dist(a, state.player) - dist(b, state.player))[0];
  }

  function pickBanana(obj) {
    if (obj.readyAt && obj.readyAt > state.time) {
      addChat("The banana tree needs a moment.");
      return;
    }
    if (!addInventory("banana", 1)) return;
    obj.readyAt = state.time + 24;
    state.stats.bananasPicked += 1;
    gainXp("Farming", 12);
    addChat("You pick a banana.", "loot");
  }

  function cutSpiderWeb(obj) {
    if (obj.readyAt && obj.readyAt > state.time) {
      addChat("The web needs time to thicken again.");
      return;
    }
    if (inventoryCount("knife") <= 0) {
      addChat("You need a knife to cut spider silk.");
      return;
    }
    if (!addInventory("spider_silk", 2, true)) return;
    obj.readyAt = state.time + 28;
    state.stats.websCut += 1;
    gainXp("Crafting", 22);
    addChat("You cut strands of spider silk.", "loot");
  }

  function bannerfallScoreText() {
    const cw = state.bannerfall;
    if (!cw.active) return `Bannerfall idle. Tokens: ${inventoryCount("banner_token")}.`;
    const seconds = Math.max(0, Math.ceil(cw.endsAt - state.time));
    return `Bannerfall ${cw.score}-${cw.enemyScore}, ${seconds}s left${cw.flagHeld ? ", rival flag held" : ""}.`;
  }

  function startBannerfall() {
    normalizeBannerfallState();
    if (!state.bannerfall.active) {
      state.bannerfall = {
        active: true,
        score: 0,
        enemyScore: 0,
        flagHeld: false,
        endsAt: state.time + 150,
        nextEnemyScore: state.time + 45,
        supplyReadyAt: 0,
        lastReward: null,
      };
      state.stats.bannerfallPlayed += 1;
      gainXp("Agility", 35);
      gainXp("Vitality", 25);
      addChat("Bannerfall begins. Capture three flags or outscore the rival team.", "loot");
    } else {
      addChat(bannerfallScoreText());
    }
    state.player.x = 68.5;
    state.player.y = 28.5;
    state.player.path = [];
    state.player.pending = null;
    state.player.combatTarget = null;
    closeModal();
  }

  function updateBannerfall() {
    const cw = state.bannerfall;
    if (!cw.active) return;
    if (state.time >= cw.nextEnemyScore) {
      cw.enemyScore += 1;
      cw.nextEnemyScore = state.time + 45 + random() * 18;
      addChat(`Rival team scores. ${bannerfallScoreText()}`, "danger");
    }
    if (cw.score >= 3 || cw.enemyScore >= 3 || state.time >= cw.endsAt) {
      endBannerfall(cw.score > cw.enemyScore ? "win" : cw.score === cw.enemyScore ? "draw" : "loss");
    }
  }

  function endBannerfall(result) {
    const cw = state.bannerfall;
    if (!cw.active) return;
    const tokens = Math.max(1, cw.score * 2 + (result === "win" ? 3 : result === "draw" ? 2 : 1));
    addInventory("banner_token", tokens);
    if (result === "win") state.stats.bannerfallWon += 1;
    cw.lastReward = `${tokens} tokens`;
    cw.active = false;
    cw.flagHeld = false;
    cw.endsAt = 0;
    cw.nextEnemyScore = 0;
    gainXp("Agility", 70 + cw.score * 35);
    gainXp("Defence", 55 + cw.score * 20);
    addChat(`Bannerfall ${result}. You earn ${tokens} tokens.`, "loot");
  }

  function handleBannerFlag(obj) {
    const cw = state.bannerfall;
    if (!cw.active) {
      addChat("Talk to the Banner Marshal or use the portal to join a match.");
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
    state.stats.bannersCaptured += 1;
    gainXp("Agility", 90);
    gainXp("Defence", 60);
    addFloatingText(state.player.x, state.player.y, "Flag captured!", "#f0d25d");
    addChat(`Flag captured. ${bannerfallScoreText()}`, "loot");
  }

  function useBannerSupply() {
    const cw = state.bannerfall;
    if (!cw.active) {
      addChat("Bannerfall supplies are only handed out during a match.");
      return;
    }
    if (state.time < cw.supplyReadyAt) {
      addChat("The supply table is being restocked.");
      return;
    }
    if (!addInventory("banner_bandage", 3)) return;
    state.player.runEnergy = Math.min(100, state.player.runEnergy + 15);
    cw.supplyReadyAt = state.time + 22;
    addChat("You grab bandages and catch your breath.");
  }

  function sigilPouchText() {
    return `${state.sigilPouch?.essence || 0}/${state.sigilPouch?.capacity || 12} essence`;
  }

  function handleSigilPouch() {
    normalizePlayerState();
    if (state.sigilPouch.essence > 0 && inventoryCount("glimmer_shard") === 0) {
      const amount = state.sigilPouch.essence;
      if (addInventory("glimmer_shard", amount)) {
        state.sigilPouch.essence = 0;
        addChat(`You empty ${formatItem("glimmer_shard", amount)} from the pouch.`);
      }
      return;
    }
    const space = state.sigilPouch.capacity - state.sigilPouch.essence;
    if (space <= 0) {
      addChat(`Your sigil pouch is full (${sigilPouchText()}).`);
      return;
    }
    const amount = Math.min(space, inventoryCount("glimmer_shard"));
    if (amount <= 0) {
      addChat(`Sigil satchel: ${sigilPouchText()}.`);
      return;
    }
    removeItem(state.player.inventory, "glimmer_shard", amount);
    state.sigilPouch.essence += amount;
    addChat(`You store ${formatItem("glimmer_shard", amount)} in the pouch.`);
  }

  function hasTalisman(recipe) {
    return inventoryCount(recipe.talisman) > 0;
  }

  function craftSigils(obj) {
    const recipe = SIGILCRAFT_RECIPES[obj.sigil];
    if (!recipe) return;
    if (getLevel("Sigilcraft") < recipe.level) {
      addChat(`You need Sigilcraft level ${recipe.level} for ${recipe.name.toLowerCase()} sigils.`);
      return;
    }
    if (!hasTalisman(recipe)) {
      addChat(`You need a ${ITEMS[recipe.talisman].name.toLowerCase()} to use this altar.`);
      return;
    }
    normalizePlayerState();
    const carried = inventoryCount("glimmer_shard");
    const pouch = inventoryCount("sigil_satchel") > 0 ? state.sigilPouch.essence : 0;
    const essence = carried + pouch;
    if (essence <= 0) {
      addChat("You need sigil essence.");
      return;
    }
    const hasSigilSlot = state.player.inventory.some((item) => !item || item.id === recipe.sigil);
    if (!hasSigilSlot && carried === 0) {
      addChat("You need a free inventory slot for the sigils.");
      return;
    }
    if (carried > 0) removeItem(state.player.inventory, "glimmer_shard", carried);
    if (pouch > 0) state.sigilPouch.essence = 0;
    const multiplier = Math.max(1, 1 + Math.floor(Math.max(0, effectiveLevel("Sigilcraft") - recipe.level) / recipe.multipleEvery));
    const qty = essence * multiplier;
    addInventory(recipe.sigil, qty);
    gainXp("Sigilcraft", recipe.xp * essence);
    state.stats.sigilsCrafted += qty;
    const statKey = `${obj.sigil}SigilsCrafted`;
    if (typeof state.stats[statKey] === "number") state.stats[statKey] += qty;
    addFloatingText(state.player.x, state.player.y, `+${qty} ${ITEMS[recipe.sigil].icon}`, recipe.color);
    addChat(`You bind ${formatItem(recipe.sigil, qty)} from ${formatItem("glimmer_shard", essence)}.`, "loot");
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
        vigilType: "crypt_brother",
        cryptBrother: key,
        despawnOnDeath: true,
      },
      [["big_bones", 1, 1], ["grave_sigil", 2 + Math.floor(random() * 3), 0.72], ["ancient_page", 1, 0.08]]
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
    gainXp("Resolve", 55);
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
    const graveSigils = 3 + Math.floor(random() * 7);
    const riftSigils = 5 + Math.floor(random() * 10);
    addInventory("coins", coins);
    addInventory("grave_sigil", graveSigils);
    addInventory("rift_sigil", riftSigils);
    if (random() > 0.55) addInventory("oath_sigil", 1 + Math.floor(random() * 3));
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
    gainXp("Resolve", 120);
    gainXp("Magic", 90);
    state.crypt.chestsOpened += 1;
    state.crypt.lastReward = rare ? ITEMS[rare].name : `${coins} coins`;
    state.stats.cryptChestsOpened += 1;
    state.crypt.awakened = [];
    state.crypt.defeated = [];
    state.enemies = state.enemies.filter((enemy) => !enemy.cryptBrother || enemy.hp > 0);
    addChat(`You loot the crypt chest: ${coins} coins, sigils${rare ? `, and ${ITEMS[rare].name}` : ""}.`, "loot");
    playSfx("loot");
  }

  function openTowerChest() {
    if (inventoryCount("tower_key") < 1) {
      addChat("The Gloamspire chest needs a tower key.");
      return;
    }
    removeItem(state.player.inventory, "tower_key", 1);
    const coins = 90 + Math.floor(random() * 190);
    addInventory("coins", coins);
    addInventory("ectoplasm", 1 + Math.floor(random() * 3), true);
    const roll = random();
    let rare = null;
    if (roll > 0.94) rare = "mystic_wand";
    else if (roll > 0.84) rare = "ghostly_robe";
    else if (roll > 0.68) addInventory("grave_sigil", 2 + Math.floor(random() * 4));
    else if (roll > 0.48) addInventory("clue_scroll", 1);
    else if (roll > 0.3) addInventory("antipoison", 1);
    if (rare) addInventory(rare, 1);
    state.stats.towerChestsOpened += 1;
    gainXp("Vigilance", 90);
    addChat(`You open the Gloamspire chest: ${coins} coins, ectoplasm${rare ? `, and ${ITEMS[rare].name}` : ""}.`, "loot");
    playSfx("loot");
  }

  function isUndeadEnemy(enemy) {
    return Boolean(enemy && (enemy.type.includes("wight") || enemy.type.includes("skeleton") || enemy.vigilType === "crypt_brother"));
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
    if (getLevel("Herbalism") < 1) {
      addChat("You need Herbalism level 1 to clean that herb.");
      return;
    }
    removeSlot(state.player.inventory, slot, 1);
    addInventory("clean_mirthleaf", 1);
    gainXp("Herbalism", 12);
    state.stats.herbsCleaned += 1;
    addChat("You clean the grimy mirthleaf.");
  }

  function mixHerbalismPotion() {
    if (getLevel("Herbalism") < 1) {
      addChat("You need Herbalism level 1 to mix this potion.");
      return;
    }
    if (inventoryCount("clean_mirthleaf") < 1 || inventoryCount("vial_of_water") < 1) {
      addChat("You need mirthleaf and a vial of water.");
      return;
    }
    if (getLevel("Herbalism") >= 5 && inventoryCount("spider_silk") > 0) {
      removeItem(state.player.inventory, "clean_mirthleaf", 1);
      removeItem(state.player.inventory, "vial_of_water", 1);
      removeItem(state.player.inventory, "spider_silk", 1);
      addInventory("antipoison", 1);
      gainXp("Herbalism", 58);
      state.stats.potionsMixed += 1;
      addChat("You mix an antipoison.", "loot");
      return;
    }
    if (getLevel("Herbalism") >= 8 && inventoryCount("potato") > 0) {
      removeItem(state.player.inventory, "clean_mirthleaf", 1);
      removeItem(state.player.inventory, "vial_of_water", 1);
      removeItem(state.player.inventory, "potato", 1);
      addInventory("energy_potion", 1);
      gainXp("Herbalism", 62);
      state.stats.potionsMixed += 1;
      addChat("You mix a lumpy energy potion.", "loot");
      return;
    }
    removeItem(state.player.inventory, "clean_mirthleaf", 1);
    removeItem(state.player.inventory, "vial_of_water", 1);
    addInventory("attack_potion", 1);
    gainXp("Herbalism", 48);
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
    if (getLevel("Pilfering") < level) {
      addChat(`You need Pilfering level ${level} for that stall.`);
      return;
    }
    if (obj.depletedUntil && obj.depletedUntil > state.time) {
      addChat("The stall owner is watching it closely.");
      return;
    }
    const success = random() < clamp(0.42 + effectiveLevel("Pilfering") * 0.025, 0.42, 0.9);
    obj.depletedUntil = state.time + 5;
    if (!success) {
      const hit = 4 + Math.floor(random() * 10);
      state.player.hp = Math.max(1, state.player.hp - hit);
      state.player.damageFlash = 0.35;
      addFloatingText(state.player.x, state.player.y, `${hit}`, "#ff5858");
      gainXp("Pilfering", 8);
      addChat("A guard clips you for trying that.");
      return;
    }
    const roll = random();
    const reward = roll > 0.82 ? ["silk", 1] : roll > 0.6 ? ["fur", 1] : roll > 0.28 ? ["cake", 1] : ["coins", 12 + Math.floor(random() * 24)];
    addInventory(reward[0], reward[1]);
    gainXp("Pilfering", reward[0] === "silk" ? 38 : reward[0] === "fur" ? 32 : 24);
    state.stats.stallsStolen += 1;
    addChat(`You steal ${formatItem(reward[0], reward[1])}.`, "loot");
  }

  function cookBestRawFish() {
    const itemId = inventoryCount("raw_redclaw") > 0 ? "raw_redclaw" : inventoryCount("raw_trout") > 0 ? "raw_trout" : inventoryCount("raw_beef") > 0 ? "raw_beef" : inventoryCount("raw_chicken") > 0 ? "raw_chicken" : inventoryCount("raw_shrimp") > 0 ? "raw_shrimp" : null;
    if (!itemId) {
      addChat("You need raw food to cook.");
      return;
    }
    const data = ITEMS[itemId];
    removeItem(state.player.inventory, itemId, 1);
    const burnChance = data.noBurnLevel && effectiveLevel("Cooking") >= data.noBurnLevel
      ? 0
      : clamp(0.45 - effectiveLevel("Cooking") * 0.018 + data.burnLevel * 0.01, 0.04, 0.6);
    if (random() < burnChance) {
      addInventory(data.burnTo || "burnt_fish");
      addChat("You burn the food.");
    } else {
      addInventory(data.cookTo);
      gainXp("Cooking", data.cookingXp);
      if (data.cookTo === "redclaw") state.stats.redclawsCooked += 1;
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

  function weaveSpiderCape() {
    if (getLevel("Crafting") < 12) {
      addChat("You need Crafting level 12 to weave a spider silk cape.");
      return;
    }
    if (inventoryCount("spider_silk") < 6) {
      addChat("You need six spider silk.");
      return;
    }
    removeItem(state.player.inventory, "spider_silk", 6);
    addInventory("spider_cape", 1);
    gainXp("Crafting", 145);
    addChat("You weave a spider silk cape.", "loot");
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
      addInventory("prism_pendant", 1);
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
      if (state.modal.currency === "vigil") {
        addChat("The Huntwarden only takes points.");
        return;
      }
      if (state.modal.currency === "banner") {
        addChat("The squire only takes tokens.");
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
      mixHerbalismPotion();
    } else if (item.id === "sigil_satchel") {
      handleSigilPouch();
    } else if (item.id === "ancient_page") {
      addChat(`Ancient page: wake the brothers, keep your Resolve close, loot once. ${cryptStatusText()}.`);
    } else if (item.id === "empty_vial") {
      const nearWell = state.scenery.some((obj) => obj.action === "water" && dist(obj, state.player) < 3);
      if (nearWell) fillEmptyVial();
      else addChat("Use the empty vial at a well.");
    } else if (item.id === "uncut_gem" || item.id === "chisel") {
      cutGem(slot);
    } else if (item.id === "gold_bar" || item.id === "cut_gem") {
      craftJewellery();
    } else if (data.boostSkill || data.runRestore || data.poisonCure) {
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
      gainXp("Resolve", item.id === "big_bones" ? 135 : 45);
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
    } else if (item.id === "spider_silk") {
      weaveSpiderCape();
    } else if (item.id === "raw_shrimp" || item.id === "raw_trout" || item.id === "raw_beef" || item.id === "raw_chicken" || item.id === "raw_redclaw") {
      const nearRange = state.scenery.some((obj) => obj.action === "cook" && dist(obj, state.player) < 3);
      const nearFire = state.fires.some((fire) => dist(fire, state.player) < 2.5);
      if (nearRange || nearFire) cookBestRawFish();
      else addChat("Find a range or fire to cook that.");
    } else if (item.id === "vigil_glass") {
      if (state.vigil.task) addChat(`Vigil glass: ${state.vigil.task.remaining} ${state.vigil.task.label} left.`);
      else addChat("Vigil glass: no task assigned.");
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
        { id: "tower", hint: "Where a northern tower whispers through wool and rotten air.", x: 72, y: 12, radius: 3.2, xp: 170 },
        { id: "moss", hint: "The green brutes guard a quiet western wood.", x: 15, y: 17, radius: 4.8, xp: 180 },
        { id: "rift", hint: "Where purple stone hums beyond the ditch.", x: 11, y: 12, radius: 4.2, xp: 210 },
        { id: "southport", hint: "At the far south, tarred planks count every fish tale.", x: 64, y: 97, radius: 4.2, xp: 190 },
        { id: "dunes", hint: "A dry waystone watches claws and toll roads.", x: 97, y: 45, radius: 4.2, xp: 205 },
        { id: "ridge", hint: "Cold stones stack where the north road runs out.", x: 95, y: 13, radius: 3.8, xp: 220 },
        { id: "westwood", hint: "Where the oaks thicken and the tables are giant-sized.", x: 23, y: 88, radius: 4.4, xp: 200 },
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
    if (roll > 0.985) addInventory(choice(["aurel_sabre", "giant_club"]), 1);
    else if (roll > 0.94) addInventory("team_cape", 1);
    else if (roll > 0.92) addInventory("vigil_helm", 1);
    else if (roll > 0.88) addInventory(choice(["ghostly_robe", "mystic_wand"]), 1);
    else if (roll > 0.78) addInventory(choice(["surestrike_pendant", "prism_pendant", "pirate_cutlass"]), 1);
    else if (roll > 0.62) addInventory(choice(["uncut_gem", "cut_gem", "gold_bar", "raw_redclaw", "limpwurt_root", "scorpion_tail"]), 1);
    else if (roll > 0.46) addInventory(choice(["attack_potion", "strength_potion", "defence_potion", "ranging_potion", "magic_potion", "bow_string"]), 1);
    else if (roll > 0.28) addInventory("grave_sigil", 2 + Math.floor(random() * 5));
    else addInventory("ward_arrow", 20 + Math.floor(random() * 25));
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
      if (inventoryCount("gale_sigil") < 1 || inventoryCount("whisper_sigil") < 1) {
        addChat("You need gale and whisper sigils.");
        return;
      }
      removeItem(state.player.inventory, "gale_sigil", 1);
      removeItem(state.player.inventory, "whisper_sigil", 1);
      const hit = Math.floor(random() * (effectiveLevel("Magic") / 2 + 4));
      enemy.hp = Math.max(0, enemy.hp - hit);
      enemy.hitFlash = 0.4;
      playSfx("spell");
      gainXp("Magic", 14 + hit * 2);
      addFloatingText(enemy.x, enemy.y, `${hit}`, "#9ee8ff");
      addChat(`You cast Gale Poke on the ${enemy.name}.`);
      if (enemy.hp <= 0) killEnemy(enemy);
    } else if (spell === "fire") {
      const enemy = nearestAliveEnemy(7);
      if (!enemy) {
        addChat("No nearby target.");
        return;
      }
      if (inventoryCount("gale_sigil") < 2 || inventoryCount("rift_sigil") < 1) {
        addChat("You need 2 gale sigils and 1 rift sigil.");
        return;
      }
      removeItem(state.player.inventory, "gale_sigil", 2);
      removeItem(state.player.inventory, "rift_sigil", 1);
      const staffBoost = ITEMS[state.player.equipment.weapon]?.magicBoost ? 2 : 0;
      const hit = Math.floor(random() * (effectiveLevel("Magic") / 2 + 8 + staffBoost));
      enemy.hp = Math.max(0, enemy.hp - hit);
      enemy.hitFlash = 0.45;
      playSfx("spell");
      gainXp("Magic", 28 + hit * 2.2);
      addFloatingText(enemy.x, enemy.y, `${hit}`, "#ff9d4d");
      addChat(`You cast Cinder Bolt on the ${enemy.name}.`);
      if (enemy.hp <= 0) killEnemy(enemy);
    } else if (spell === "crumble") {
      if (getLevel("Magic") < 20) {
        addChat("You need Magic level 20 to rattle bones.");
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
      if (inventoryCount("rift_sigil") < 1 || inventoryCount("grave_sigil") < 1) {
        addChat("You need 1 rift sigil and 1 grave sigil.");
        return;
      }
      removeItem(state.player.inventory, "rift_sigil", 1);
      removeItem(state.player.inventory, "grave_sigil", 1);
      const staffBoost = ITEMS[state.player.equipment.weapon]?.magicBoost ? 3 : 0;
      const hit = 2 + Math.floor(random() * (effectiveLevel("Magic") / 2 + 10 + staffBoost));
      enemy.hp = Math.max(0, enemy.hp - hit);
      enemy.hitFlash = 0.5;
      state.player.resolvePoints = Math.min(maxResolve(), state.player.resolvePoints + 1.5);
      playSfx("spell");
      gainXp("Magic", 35 + hit * 2.4);
      addFloatingText(enemy.x, enemy.y, `${hit}`, "#d6f0ee");
      addChat(`You rattle the bones of the ${enemy.name}.`);
      if (enemy.hp <= 0) killEnemy(enemy);
    } else if (spell === "alchemy") {
      const slot = state.player.inventory.findIndex((item) => item && !["coins", "gale_sigil", "whisper_sigil", "rift_sigil", "oath_sigil", "grave_sigil"].includes(item.id));
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
    state.enemyLabelBoxes = [];
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
    } else if (resource.type === "redclaw_spot") {
      const bob = Math.sin(state.time * 3 + resource.id) * 2;
      ctx.strokeStyle = "#ffded1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 4 + bob, 17, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#d24d4d";
      ctx.beginPath();
      ctx.arc(screen.x - 7, screen.y - 9 + bob, 4, 0, Math.PI * 2);
      ctx.arc(screen.x + 7, screen.y - 9 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
      drawText("pots", screen.x, screen.y - 22, { size: 10, color: "#fff4d6", outline: "#6e231f", align: "center" });
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
    } else if (obj.type === "vigil_board") {
      drawBox(screen.x, screen.y - 42, 62, 54, "#4f301f", "#1c0e08");
      drawText("SLAYER", screen.x, screen.y - 44, { color: "#8ff0ff", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "vigil_tower") {
      drawBox(screen.x, screen.y - 56, 76, 92, "#5a5d5f", "#17191a");
      ctx.fillStyle = "#303234";
      ctx.fillRect(screen.x - 20, screen.y - 34, 40, 70);
      ctx.strokeStyle = "#a9b2b4";
      ctx.strokeRect(screen.x - 20, screen.y - 34, 40, 70);
      ctx.fillStyle = "#95dbe0";
      ctx.fillRect(screen.x - 29, screen.y - 50, 13, 12);
      ctx.fillRect(screen.x + 16, screen.y - 50, 13, 12);
      drawText("TOWER", screen.x, screen.y - 75, { color: "#a8f5ff", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "tower_chest") {
      drawBox(screen.x, screen.y - 22, 58, 34, "#4a3420", "#130b05");
      ctx.fillStyle = "#a3915b";
      ctx.fillRect(screen.x - 25, screen.y - 33, 50, 8);
      ctx.strokeStyle = "#17100a";
      ctx.strokeRect(screen.x - 25, screen.y - 33, 50, 8);
      drawText("KEY", screen.x, screen.y - 45, { color: "#e7d479", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "tower_notice") {
      drawBox(screen.x, screen.y - 38, 58, 48, "#5a3a20", "#1b0e06");
      drawText("!", screen.x, screen.y - 42, { color: "#a8f5ff", outline: "#000", size: 22, align: "center" });
      drawText("SLAY", screen.x, screen.y - 18, { color: "#f1d98b", outline: "#000", size: 8, align: "center" });
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
    } else if (obj.type === "banner_portal") {
      drawBox(screen.x, screen.y - 22, 68, 46, "#5c4226", "#1c1008");
      ctx.fillStyle = "#243c8f";
      ctx.beginPath();
      ctx.arc(screen.x - 16, screen.y - 26, 9 + Math.sin(state.time * 4) * 2, 0, Math.PI * 2);
      ctx.arc(screen.x + 16, screen.y - 26, 9 + Math.cos(state.time * 4) * 2, 0, Math.PI * 2);
      ctx.fill();
      drawText("CW", screen.x, screen.y - 50, { color: "#f0d25d", outline: "#000", size: 12, align: "center" });
    } else if (obj.type === "banner_flag") {
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
      if (state.bannerfall.flagHeld && home) drawText("SCORE", screen.x, screen.y - 70, { color: "#f0d25d", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "banner_supply") {
      drawBox(screen.x, screen.y - 18, 72, 28, "#7c5532", "#231309");
      ctx.fillStyle = "#efe0c0";
      ctx.fillRect(screen.x - 22, screen.y - 36, 18, 10);
      ctx.fillStyle = "#d24d4d";
      ctx.fillRect(screen.x + 5, screen.y - 35, 22, 8);
      drawText("SUPPLY", screen.x, screen.y - 48, { color: "#f0d25d", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "banner_scoreboard") {
      drawBox(screen.x, screen.y - 36, 72, 50, "#3c2a18", "#150c05");
      drawText("CASTLE", screen.x, screen.y - 53, { color: "#f0d25d", outline: "#000", size: 9, align: "center" });
      drawText(`${state.bannerfall.score}-${state.bannerfall.enemyScore}`, screen.x, screen.y - 30, { color: "#ffffff", outline: "#000", size: 14, align: "center" });
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
    } else if (obj.type === "sigilist_tower") {
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
    } else if (obj.action === "sigilcraft") {
      drawSigilcraftAltar(obj, screen);
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
    } else if (obj.type === "island_dock") {
      drawBox(screen.x, screen.y - 8, 92, 16, "#8b5c32", "#3f2412");
      drawText("LOBSTER", screen.x, screen.y - 26, { color: "#ffd6c6", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "banana_tree") {
      ctx.fillStyle = "#6b4825";
      ctx.fillRect(screen.x - 5, screen.y - 32, 10, 34);
      ctx.fillStyle = "#2f7a34";
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(screen.x + Math.cos(i * 1.25) * 13, screen.y - 48 + Math.sin(i * 1.25) * 8, 20, 7, i * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!obj.readyAt || obj.readyAt <= state.time) drawText("BAN", screen.x, screen.y - 68, { color: "#ffe36a", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "volcano_entrance") {
      ctx.fillStyle = "#3d332b";
      ctx.beginPath();
      ctx.moveTo(screen.x - 38, screen.y - 5);
      ctx.lineTo(screen.x, screen.y - 72);
      ctx.lineTo(screen.x + 38, screen.y - 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a100b";
      ctx.stroke();
      ctx.fillStyle = "#ff6b24";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 58, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      drawText("VOLCANO", screen.x, screen.y - 82, { color: "#ffb06a", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "spider_web") {
      ctx.strokeStyle = obj.readyAt && obj.readyAt > state.time ? "rgba(210,220,210,0.35)" : "#dfe7d3";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(screen.x - 24 + i * 16, screen.y - 48);
        ctx.lineTo(screen.x + 24 - i * 16, screen.y - 10);
        ctx.moveTo(screen.x - 24, screen.y - 12 - i * 9);
        ctx.lineTo(screen.x + 24, screen.y - 42 + i * 9);
        ctx.stroke();
      }
      drawText("WEB", screen.x, screen.y - 58, { color: "#edf5e7", outline: "#000", size: 9, align: "center" });
    } else if (obj.type === "island_stall") {
      drawBox(screen.x, screen.y - 18, 78, 30, "#9b6a35", "#2b160d");
      ctx.fillStyle = "#edd45a";
      ctx.fillRect(screen.x - 24, screen.y - 35, 13, 13);
      ctx.fillStyle = "#d24d4d";
      ctx.fillRect(screen.x + 5, screen.y - 35, 20, 11);
      drawText("ISLE", screen.x, screen.y - 43, { color: "#ffe36a", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "ditch") {
      drawBox(screen.x, screen.y - 8, 90, 16, "#2b1a10", "#080604");
      drawText("WILDY", screen.x, screen.y - 22, { color: "#ff8a6b", outline: "#000", size: 10, align: "center" });
    } else if (obj.type === "rift_altar") {
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

  function drawSigilcraftAltar(obj, screen) {
    const recipe = SIGILCRAFT_RECIPES[obj.sigil] || SIGILCRAFT_RECIPES.gale;
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
    const color = npc.role === "vigil" ? "#243c44" : npc.role === "banker" ? "#273b68" : npc.role === "priest" ? "#e8e2c7" : npc.role === "apothecary" ? "#365c3c" : npc.role === "fletcher" ? "#80512d" : npc.role === "gardener" ? "#5f7b34" : npc.role === "sigilist" ? "#513b8f" : npc.role === "squire" ? "#7b6a35" : npc.role === "island_trader" ? "#a0712d" : npc.role === "sailor" ? "#315f75" : npc.role === "tower_keeper" ? "#4a5960" : "#7f5231";
    drawHumanoid(screen.x, screen.y, color, "#f0c69b");
    drawText(npc.name, screen.x, screen.y - 58, { color: "#ffeaaa", outline: "#000", size: 10, align: "center" });
    if (npc.role === "vigil") drawText("!", screen.x + 16, screen.y - 45, { color: "#6feaff", outline: "#000", size: 18, align: "center" });
    if (npc.role === "gardener") drawText("*", screen.x + 15, screen.y - 45, { color: "#d8ff77", outline: "#000", size: 15, align: "center" });
    if (npc.role === "sigilist") drawText("*", screen.x + 15, screen.y - 45, { color: "#d9d2ff", outline: "#000", size: 16, align: "center" });
    if (npc.role === "squire") drawText("cw", screen.x + 17, screen.y - 45, { color: "#f0d25d", outline: "#000", size: 10, align: "center" });
    if (npc.role === "island_trader") drawText("gp", screen.x + 17, screen.y - 45, { color: "#ffe36a", outline: "#000", size: 10, align: "center" });
    if (npc.role === "sailor") drawText("ship", screen.x + 20, screen.y - 45, { color: "#7fd7ff", outline: "#000", size: 8, align: "center" });
    if (npc.role === "tower_keeper") drawText("tk", screen.x + 17, screen.y - 45, { color: "#a8f5ff", outline: "#000", size: 10, align: "center" });
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
      dusk_conjurer: "#1f3d86",
      iron_oathbreaker: "#1e1e22",
      grave_skeleton: "#dfd8bd",
      mire_skitterer: "#3f6051",
      brine_leech: "#7d8f75",
      grasping_claw: "#7b665a",
      keening_shade: "#b9d5dc",
      miasma_wraith: "#73a08c",
      jungle_spider: "#2f2f28",
      hollow_wight: "#5860a8",
      rift_fiend: "#8e2f32",
      moss_brute: "#557b3e",
      hill_giant: "#786143",
      desert_scorpion: "#b87938",
      highwayman: "#4d3b28",
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
    } else if (enemy.type === "dusk_conjurer") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#c7b08f", 0.95);
      ctx.fillStyle = "#18306f";
      ctx.beginPath();
      ctx.moveTo(screen.x - 14, screen.y - 48);
      ctx.lineTo(screen.x, screen.y - 67);
      ctx.lineTo(screen.x + 14, screen.y - 48);
      ctx.closePath();
      ctx.fill();
      drawText("*", screen.x + 18, screen.y - 39, { color: "#9cd8ff", outline: "#000", size: 14, align: "center" });
    } else if (enemy.type === "iron_oathbreaker") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#c5a276", 1.12);
      ctx.strokeStyle = "#cfd2d6";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screen.x + 16, screen.y - 32);
      ctx.lineTo(screen.x + 32, screen.y - 50);
      ctx.stroke();
    } else if (enemy.type === "moss_brute") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#7b9f58", 1.25);
    } else if (enemy.type === "hill_giant") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#b7966b", 1.38);
      ctx.strokeStyle = "#5c3a21";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(screen.x + 17, screen.y - 22);
      ctx.lineTo(screen.x + 39, screen.y - 54);
      ctx.stroke();
      drawText("big", screen.x + 20, screen.y - 62, { color: "#f1d98b", outline: "#000", size: 8, align: "center" });
    } else if (enemy.type === "desert_scorpion") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 15, 22, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6a3d1d";
      ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(screen.x + i * 7, screen.y - 9);
        ctx.lineTo(screen.x + i * 11, screen.y + 3);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(screen.x - 8, screen.y - 23);
      ctx.quadraticCurveTo(screen.x - 3, screen.y - 47, screen.x + 14, screen.y - 41);
      ctx.stroke();
      drawText("*", screen.x + 17, screen.y - 43, { color: "#ffcf74", outline: "#000", size: 13, align: "center" });
    } else if (enemy.type === "highwayman") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#c7a174", 0.98);
      drawText("Stand!", screen.x, screen.y - 63, { color: "#ffe0a0", outline: "#000", size: 8, align: "center" });
    } else if (enemy.type === "mire_skitterer") {
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
    } else if (enemy.type === "brine_leech") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 13, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d8d8cf";
      ctx.beginPath();
      ctx.moveTo(screen.x + 12, screen.y - 19);
      ctx.lineTo(screen.x + 18, screen.y - 30);
      ctx.moveTo(screen.x + 16, screen.y - 18);
      ctx.lineTo(screen.x + 24, screen.y - 29);
      ctx.stroke();
    } else if (enemy.type === "grasping_claw") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 11, 16, 8, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2a211d";
      ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(screen.x + i * 5, screen.y - 15);
        ctx.lineTo(screen.x + i * 7, screen.y - 28 - Math.abs(i) * 2);
        ctx.stroke();
      }
      drawText("h", screen.x, screen.y - 35, { color: "#d9c2aa", outline: "#000", size: 11, align: "center" });
    } else if (enemy.type === "keening_shade") {
      ctx.save();
      ctx.globalAlpha *= 0.86 + Math.sin(state.time * 5 + enemy.id.length) * 0.08;
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#e8f7f7", 1.05);
      ctx.strokeStyle = "#e4fbff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y - 42, 23 + Math.sin(state.time * 7) * 2, 0.4, Math.PI - 0.4);
      ctx.stroke();
      drawText("w", screen.x + 18, screen.y - 52, { color: "#e4fbff", outline: "#000", size: 14, align: "center" });
      ctx.restore();
    } else if (enemy.type === "miasma_wraith") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#acd7c9", 1.12);
      ctx.fillStyle = "rgba(122, 196, 162, 0.42)";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 25, 33 + Math.sin(state.time * 4) * 3, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      drawText("stink", screen.x, screen.y - 64, { color: "#b8ffd6", outline: "#000", size: 8, align: "center" });
    } else if (enemy.type === "jungle_spider") {
      ctx.fillStyle = colors[enemy.type];
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - 18, 21, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#141410";
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(screen.x + i * 5, screen.y - 13);
        ctx.lineTo(screen.x + i * 10, screen.y + 3 + Math.abs(i));
        ctx.stroke();
      }
      ctx.fillStyle = "#9dff65";
      ctx.beginPath();
      ctx.arc(screen.x + 7, screen.y - 22, 2, 0, Math.PI * 2);
      ctx.arc(screen.x + 13, screen.y - 21, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === "hollow_wight") {
      drawHumanoid(screen.x, screen.y, colors[enemy.type], "#95a0e8", 1.18);
      ctx.strokeStyle = "#b7c3ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screen.x - 18, screen.y - 48);
      ctx.lineTo(screen.x + 18, screen.y - 18);
      ctx.stroke();
      drawText("*", screen.x + 19, screen.y - 48, { color: "#dce6ff", outline: "#000", size: 18, align: "center" });
    } else if (enemy.vigilType === "crypt_brother") {
      drawHumanoid(screen.x, screen.y, "#4f5a5a", "#b9c7c6", 1.2);
      ctx.strokeStyle = "#d6f0ee";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screen.x - 20, screen.y - 22);
      ctx.lineTo(screen.x + 18, screen.y - 52);
      ctx.stroke();
      drawText("!", screen.x + 19, screen.y - 49, { color: "#d6f0ee", outline: "#000", size: 16, align: "center" });
    } else if (enemy.type === "rift_fiend") {
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
    const label = `${enemy.name} (${enemy.level})`;
    const labelBox = { x: screen.x - Math.min(128, label.length * 5.8) / 2, y: screen.y - 84, w: Math.min(128, label.length * 5.8), h: 14 };
    const important = state.player.combatTarget === enemy.id || dist(enemy, state.player) < 2.8;
    if (important || !state.enemyLabelBoxes.some((box) => rectsOverlap(box, labelBox, 4))) {
      state.enemyLabelBoxes.push(labelBox);
      drawText(label, screen.x, screen.y - 72, { color: "#ffd6d6", outline: "#000", size: 10, align: "center" });
    }
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
    drawText(`Briarbound - ${state.areaName}`, 24, 29, { color: "#ffd86b", outline: "#000", size: 17, align: "left" });
    const task = state.vigil.task ? `${state.vigil.task.remaining} ${state.vigil.task.label}` : "No task";
    const boosts = activeBoosts().map(([skill, amount]) => `${skill.slice(0, 3)}+${amount}`).join(" ");
    const poison = isPoisoned() ? `  Poison ${Math.ceil(state.player.poisonDamage)}` : "";
    drawText(`Combat ${combatLevel()}  HP ${Math.ceil(state.player.hp)}/${maxHp()}  Resolve ${resolveLabel(state.player.resolveMode)}  Vigilance: ${task}${boosts ? `  Boosts ${boosts}` : ""}${poison}`, 24, 50, {
      color: "#f6e5bd",
      outline: "#000",
      size: 11,
      align: "left",
    });
    if (state.bannerfall.active) {
      drawText(`Bannerfall ${state.bannerfall.score}-${state.bannerfall.enemyScore}${state.bannerfall.flagHeld ? "  FLAG!" : ""}`, VIEW.w - 18, 29, {
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
        const color = terrain === "water" ? "#1f6ca0" : terrain === "path" ? "#a17a45" : terrain === "town" ? "#b4a68c" : terrain === "stone" ? "#787871" : terrain === "swamp" ? "#506c3f" : terrain === "field" ? "#827934" : terrain === "dirt" ? "#735534" : terrain === "sand" ? "#b9a561" : "#39702c";
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
    drawOrb(x + 86, y + 26, 22, state.player.resolvePoints / maxResolve(), "#d9d2b2", `${Math.floor(state.player.resolvePoints)}`);
    drawOrb(x + 142, y + 26, 22, getLevel("Magic") / 99, "#5ea1ff", `${getLevel("Magic")}`);
    drawOrb(x + 198, y + 26, 22, state.player.runEnergy / 100, "#65d06d", `${Math.floor(state.player.runEnergy)}`);
    drawText("HP", x + 30, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    drawText("Res", x + 86, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    drawText("Mage", x + 142, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    drawText("Run", x + 198, y + 55, { size: 10, color: "#f2dab0", outline: "#000", align: "center" });
    if (isPoisoned()) drawText("Poison", x + 30, y + 9, { size: 10, color: "#79e068", outline: "#000", align: "center" });
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
      const color = skill === "Vigilance" ? "#69e7ff" : skill === "Sigilcraft" ? "#d5c7ff" : skill === "Farming" || skill === "Herbalism" ? "#a9ff8f" : "#ffe7a8";
      drawText(skillShortName(skill), sx, sy, { color, outline: "#000", size: 10, align: "left" });
      drawText(boost ? `${level}+${boost}` : `${level}`, sx + colW - 36, sy, { color: boost ? "#77ff77" : "#ffffff", outline: "#000", size: 11, align: "right" });
      drawText(`${xpToNext(skill)}`, sx + colW - 4, sy, { color: "#cdbb8a", outline: "#000", size: 8, align: "right" });
    });
    const taskText = state.vigil.task ? `${state.vigil.task.remaining} ${state.vigil.task.label}` : "Ask Mara for work";
    drawText(`Vigilance: ${taskText}`, x, y + h - 22, { color: "#83efff", outline: "#000", size: 12, align: "left" });
  }

  function skillShortName(skill) {
    return {
      Vitality: "Hits",
      Woodcutting: "Woodcut",
      Firemaking: "Firemake",
      Fletching: "Fletch",
      Sigilcraft: "Sigilcraft",
      Herbalism: "Herb",
    }[skill] || skill;
  }

  function drawQuests(x, y, w, h) {
    drawText("Quests", x, y + 10, { color: "#f6e1a5", outline: "#000", size: 14, align: "left" });
    let yy = y + 34;
    for (const quest of Object.values(state.quests)) {
      const color = quest.state === "completed" ? "#78e05f" : quest.state === "started" ? "#ffe46b" : "#d0c0a0";
      drawText(`${quest.title}`, x, yy, { color, outline: "#000", size: 10, align: "left" });
      drawText(`${quest.state}`, x + w, yy, { color, outline: "#000", size: 8, align: "right" });
      drawText(fitLine(quest.text, w, 8), x, yy + 12, { color: "#cdbb8a", outline: "#000", size: 8, align: "left" });
      yy += 27;
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
    drawText(`Briarfall Diary ${done}/${DIARY_TASKS.length}`, x, diaryY, { color: "#6feaff", outline: "#000", size: 12, align: "left" });
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
      { id: "wind", name: "Gale Poke", note: "1 gale + 1 whisper" },
      { id: "fire", name: "Cinder Bolt", note: "2 gale + 1 rift" },
      { id: "crumble", name: "Bone Rattle", note: "undead: rift + grave" },
      { id: "alchemy", name: "Coin Spark", note: "turn item to coins" },
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
    const sigilY = y + h - 74;
    drawText(`Sigils: gale ${inventoryCount("gale_sigil")}  whisper ${inventoryCount("whisper_sigil")}`, x, sigilY, { color: "#dcecff", outline: "#000", size: 11, align: "left" });
    drawText(`rift ${inventoryCount("rift_sigil")}  oath ${inventoryCount("oath_sigil")}  grave ${inventoryCount("grave_sigil")}`, x, sigilY + 17, { color: "#dcecff", outline: "#000", size: 11, align: "left" });
    drawText(`Pouch: ${sigilPouchText()}`, x, sigilY + 34, { color: "#d5c7ff", outline: "#000", size: 11, align: "left" });
  }

  function drawSettings(x, y, w, h) {
    drawText("Options", x, y + 12, { color: "#f6e1a5", outline: "#000", size: 14, align: "left" });
    const buttons = [
      { id: "run", label: `Run: ${state.player.run ? "On" : "Off"} (${Math.floor(state.player.runEnergy)}%)` },
      { id: "style", label: `Style: ${state.player.combatStyle}` },
      { id: "resolve", label: `Resolve: ${resolveLabel(state.player.resolveMode)}` },
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

  function resolveLabel(mode) {
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
        const primary = item.role === "banker" ? "Bank" : item.role === "shop" || item.role === "fletcher" || item.role === "sigilist" || item.role === "tower_keeper" ? "Trade" : item.role === "squire" ? "Join / Rewards" : item.role === "vigil" ? "Talk-to / Assignment" : "Talk-to";
        options.push({ label: `${primary} ${item.name}`, action: () => moveAdjacentTo(item, { kind: "npc", id: item.id }) });
      } else if (picked.kind === "enemy") {
        options.push({ label: `Attack ${item.name} (level ${item.level})`, action: () => approachOrAttackEnemy(item) });
      } else if (picked.kind === "resource") {
        const label = item.type.includes("tree") ? "Chop" : item.type === "essence_rock" ? "Mine-essence" : item.type.includes("rock") ? "Mine" : item.type === "redclaw_spot" ? "Cage" : "Net";
        options.push({ label: `${label} ${resourceName(item)}`, action: () => moveAdjacentTo(item, { kind: "resource", id: item.id }) });
      } else if (picked.kind === "scenery") {
        const label = item.action === "steal" ? "Steal-from" : item.action === "agility" ? "Cross" : item.action === "fletch" ? "Fletch-at" : item.action === "farm" ? "Tend" : item.action === "water" ? "Fill-at" : item.action === "fish_redclaw" ? "Cage-at" : item.action === "banana" ? "Pick-from" : item.action === "web" ? "Cut" : item.action === "island_shop" ? "Trade-at" : item.action === "sigilcraft" ? "Craft-sigil-at" : item.action === "tower_door" ? "Enter" : item.action === "tower_chest" ? "Open" : item.action === "crypt" ? "Open" : item.action === "crypt_chest" ? "Loot" : item.action === "bannerfall" ? "Enter" : item.action === "banner_flag" ? "Use-flag" : item.action === "banner_supply" ? "Take-from" : item.action === "banner_scoreboard" ? "Read" : item.action === "examine" ? "Look-at" : "Use";
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
    if (resource.type === "essence_rock") return "Glimmer shard";
    if (resource.type === "fishing_spot") return "Fishing spot";
    if (resource.type === "redclaw_spot") return "Redclaw spot";
    return resource.type;
  }

  function contextName(kind, item) {
    if (kind === "groundItem") return ITEMS[item.itemId].name;
    if (kind === "resource") return resourceName(item);
    return item.name;
  }

  function examineText(kind, item) {
    if (kind === "groundItem") return `It's ${formatItem(item.itemId, item.qty)} on the ground.`;
    if (kind === "enemy") return `A level ${item.level} ${item.name}. ${item.requiredProtection ? `Needs ${vigilProtectionName(item.requiredProtection)}.` : item.finisher ? `Needs ${ITEMS[item.finisher].name.toLowerCase()} at the end.` : "It looks grindable."}`;
    if (kind === "npc") return `${item.name} seems ready to repeat the same line forever.`;
    if (kind === "resource") return `A ${resourceName(item).toLowerCase()} waiting to become experience.`;
    if (kind === "scenery" && item.action === "agility") return `A very official-looking shortcut for Agility level ${item.level || 1}.`;
    if (kind === "scenery" && item.action === "fletch") return "A table covered in arrow shafts, curls of wood, and bad business margins.";
    if (kind === "scenery" && item.action === "farm") return `${item.name}: ${farmPatchStatus(item.patchId)}.`;
    if (kind === "scenery" && item.action === "compost") return "A wooden bin where spare crops become useful dirt.";
    if (kind === "scenery" && item.action === "water") return "A town well. Excellent for vials and rumours.";
    if (kind === "scenery" && item.action === "fish_redclaw") return "A dock for redclaw pots and better food.";
    if (kind === "scenery" && item.action === "banana") return `${item.name}: ${item.readyAt && item.readyAt > state.time ? "bare for now" : "heavy with yellow supplies"}.`;
    if (kind === "scenery" && item.action === "web") return `${item.name}: ${item.readyAt && item.readyAt > state.time ? "thin strands regrowing" : "thick enough to cut for silk"}.`;
    if (kind === "scenery" && item.action === "island_shop") return "A stall with prices set by someone who owns the only boat.";
    if (kind === "scenery" && item.action === "tower_door") return "A cold Gloamspire door. The notice says silence hoods, mire charms, and keys are strongly advised.";
    if (kind === "scenery" && item.action === "tower_chest") return "A locked chest from the Gloamspire, scratched by hands and wet with ectoplasm.";
    if (kind === "scenery" && item.type === "tower_notice") return "The notice reads: keening shades shriek, miasma wraiths reek, and grasping claws steal keys badly.";
    if (kind === "scenery" && item.action === "sigilcraft") return `${item.name}: ${SIGILCRAFT_RECIPES[item.sigil].name} sigils require Sigilcraft ${SIGILCRAFT_RECIPES[item.sigil].level}.`;
    if (kind === "scenery" && item.action === "crypt") return `${item.name}: a slab for one of the oath wardens. ${cryptStatusText()}.`;
    if (kind === "scenery" && item.action === "crypt_chest") return `The crypt chest is sealed by old combat nonsense. ${cryptStatusText()}.`;
    if (kind === "scenery" && item.action?.startsWith("banner")) return `${item.name}: ${bannerfallScoreText()}`;
    if (kind === "scenery" && item.type === "sigilist_tower") return "A squat tower full of essence dust, glowing circles, and bad robes.";
    if (kind === "scenery" && item.type === "scarecrow") return "It has the posture of a moderator and the wardrobe of a farmer.";
    if (kind === "scenery" && item.type === "seed_sacks") return "Seed sacks stacked with absolute dial-up confidence.";
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
    const lines = state.modal?.type === "dialogue" ? state.chat.slice(-2) : state.chat.slice(-6);
    let y = CHAT.y + 36;
    drawText("Game", CHAT.x + 24, CHAT.y + 25, { color: "#ffd86b", outline: "#000", size: 12, align: "left" });
    for (const line of lines) {
      const color = line.tone === "danger" ? "#ff8e8e" : line.tone === "loot" ? "#ffe86b" : "#f0d8aa";
      drawText(line.text, CHAT.x + 24, y, { color, outline: "#000", size: 13, align: "left" });
      y += 19;
    }
    if (state.modal?.type === "dialogue") {
      const minX = CHAT.x + 24;
      const maxX = CHAT.x + CHAT.w - 24;
      let x = minX;
      y = CHAT.y + CHAT.h - 34;
      state.modal.rects = [];
      for (const choiceItem of state.modal.choices) {
        ctx.font = "12px Verdana, Tahoma, sans-serif";
        const width = Math.min(188, Math.max(104, ctx.measureText(choiceItem.label).width + 30));
        if (x + width > maxX && x > minX) {
          x = minX;
          y -= 34;
        }
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
    drawText("Briarfall Vault", x + 18, y + 28, { color: "#ffd86b", outline: "#000", size: 18, align: "left" });
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
    const currencyLabel = state.modal.currency === "vigil" ? `Vigil marks: ${state.vigil.points}` : state.modal.currency === "banner" ? `Tokens: ${inventoryCount("banner_token")}` : `Coins: ${inventoryCount("coins")}`;
    const suffix = state.modal.currency === "vigil" ? "pts" : state.modal.currency === "banner" ? "tok" : "gp";
    drawText(currencyLabel, x + 18, y + 52, { color: "#f8df78", outline: "#000", size: 12, align: "left" });
    const close = { kind: "modalClose", x: x + w - 38, y: y + 12, w: 26, h: 26 };
    state.modal.rects.push(close);
    drawButton(close, "x");
    state.modal.stock.forEach((stock, i) => {
      const rect = { kind: "shopBuy", stock, x: x + 24, y: y + 76 + i * 44, w: 250, h: 34 };
      state.modal.rects.push(rect);
      drawButton(rect, `${stock.qty || 1} ${ITEMS[stock.id].name} - ${stock.price}${suffix}`);
    });
    drawText(state.modal.currency === "vigil" ? "Spend points from tasks." : state.modal.currency === "banner" ? "Tokens come from flag matches." : "Click inventory items to sell.", x + 336, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
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
      ["Combat", ["bronze_sword", "iron_sword", "steel_sword", "aurel_sabre", "pirate_cutlass", "wight_blade", "giant_club", "shortbow", "bronze_arrow", "ward_arrow", "wooden_shield", "bronze_helm", "silence_hood", "mire_charm", "leather_gloves", "sigilist_cap", "oathbreaker_helm", "iron_platelegs", "team_cape", "spider_cape", "ghostly_robe", "banner_helm", "banner_shield", "banner_sword", "banner_platebody", "crypt_helm", "crypt_platebody", "crypt_platelegs", "gale_staff", "crypt_staff", "mystic_wand"]],
      ["Skilling", ["logs", "oak_logs", "copper_ore", "tin_ore", "iron_ore", "gold_ore", "bronze_bar", "iron_bar", "gold_bar", "cowhide", "leather_body", "silk", "fur", "limpwurt_root"]],
      ["Food", ["bread", "cake", "spinach_roll", "banana", "raw_shrimp", "cooked_shrimp", "raw_trout", "cooked_trout", "raw_redclaw", "redclaw", "raw_beef", "cooked_beef", "burnt_fish", "burnt_meat"]],
      ["Potions", ["attack_potion", "strength_potion", "defence_potion", "ranging_potion", "magic_potion", "energy_potion", "antipoison"]],
      ["Treasure", ["vigil_glass", "brine_charm", "tower_key", "ectoplasm", "spider_silk", "scorpion_tail", "redclaw_cage", "banner_token", "clue_scroll", "reward_casket", "mystery_box", "antique_lamp", "chisel", "uncut_gem", "cut_gem", "gold_ring", "prism_pendant", "ancient_page", "surestrike_pendant", "vigil_helm", "achievement_cape"]],
      ["Sigils", ["gale_sigil", "whisper_sigil", "rift_sigil", "oath_sigil", "grave_sigil"]],
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
    drawText("Click a labelled place to plot a walk or book a ferry.", x + 20, y + 54, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
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
    let listY = y + 78;
    const rowH = 21;
    for (const destination of MAP_DESTINATIONS) {
      const rect = { kind: "mapDestination", destination, x: listX, y: listY - 8, w: 202, h: 19 };
      state.modal.rects.push(rect);
      ctx.fillStyle = "#2d2013";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "#70552d";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      drawText(destination.label, listX + 8, listY, { color: destination.color, outline: "#000", size: 9, align: "left" });
      drawText(destination.note, listX + 8, listY + 9, { color: "#cdbb8a", outline: "#000", size: 6, align: "left" });
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
    drawText("Beast Ledger", x + 20, y + 30, { color: "#6feaff", outline: "#000", size: 20, align: "left" });
    drawText("Locations, drops, and the kind of questionable advice every task needs.", x + 20, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const activeType = state.vigil.task?.type;
    BESTIARY.forEach((entry, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const rect = { x: x + 18 + col * 222, y: y + 84 + row * 74, w: 208, h: 60 };
      const active = activeType === entry.type;
      ctx.fillStyle = active ? "#243c44" : "#2a1c10";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = active ? "#6feaff" : "#6c5129";
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      drawText(fitLine(`${entry.name} (${entry.level})`, rect.w - 18, 10), rect.x + 9, rect.y + 14, { color: active ? "#8ff0ff" : "#ffe9a8", outline: "#000", size: 10, align: "left" });
      drawText(fitLine(entry.location, rect.w - 18, 8), rect.x + 9, rect.y + 28, { color: "#cdbb8a", outline: "#000", size: 8, align: "left" });
      drawText(fitLine(`Drops: ${entry.drops}`, rect.w - 18, 8), rect.x + 9, rect.y + 43, { color: "#f2dfb4", outline: "#000", size: 8, align: "left" });
      drawText(fitLine(entry.tip, rect.w - 18, 8), rect.x + 9, rect.y + 55, { color: "#9fb894", outline: "#000", size: 8, align: "left" });
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
    drawText("Briarfall Diary", x + 20, y + 30, { color: "#6feaff", outline: "#000", size: 20, align: "left" });
    drawText(`${done}/${DIARY_TASKS.length} tasks complete`, x + 20, y + 58, { color: "#f2dfb4", outline: "#000", size: 12, align: "left" });
    const taskColW = (w - 56) / 2;
    DIARY_TASKS.forEach((task, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rowX = x + 20 + col * (taskColW + 16);
      const rowY = y + 88 + row * 27;
      ctx.fillStyle = i % 2 ? "#25180d" : "#2c1d10";
      ctx.fillRect(rowX, rowY - 13, taskColW, 22);
      ctx.strokeStyle = "#4d3a20";
      ctx.strokeRect(rowX, rowY - 13, taskColW, 22);
      drawText(task.done() ? "*" : "-", rowX + 12, rowY - 2, { color: task.done() ? "#78e05f" : "#a89468", outline: "#000", size: 10, align: "left" });
      drawText(fitLine(task.label, taskColW - 40, 9), rowX + 30, rowY - 2, { color: task.done() ? "#ffe9a8" : "#cdbb8a", outline: "#000", size: 9, align: "left" });
    });
    if (done === DIARY_TASKS.length && !state.diaryRewardClaimed) {
      const claim = { kind: "diaryClaim", x: x + 154, y: y + h - 52, w: 212, h: 32 };
      state.modal.rects.push(claim);
      drawButton(claim, "Claim diary reward");
    } else {
      drawText(state.diaryRewardClaimed ? "Reward claimed: Concord mantle." : "Reward: Concord mantle, oath sigils, XP.", x + 20, y + h - 34, {
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
    if (rect.kind === "shopBuy") return hoverLinesForItem({ id: rect.stock.id, qty: rect.stock.qty || 1 }).concat([`Price: ${rect.stock.price}${state.modal?.currency === "vigil" ? " pts" : state.modal?.currency === "banner" ? " tokens" : " gp"}`]);
    if (rect.kind === "spell") return [`Cast ${rect.spell}`];
    if (rect.kind === "skillGuide") return [`${rect.skill} guide`, `${xpToNext(rect.skill)} XP to next`];
    if (rect.kind === "setting") return [tabLabels.settings, rect.setting];
    if (rect.kind === "mapDestination") return [rect.destination.label, rect.destination.note];
    if (rect.kind === "lampSkill") return [`Rub lamp on ${rect.skill}`];
    if (rect.kind === "diaryOpen") return ["Briarfall Diary", `${diaryCompletedCount()}/${DIARY_TASKS.length}`];
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
    if (data.poisonCure) lines.push("Cures poison");
    if (data.poisonResist) lines.push("Resists poison");
    if (data.vigilProtection) lines.push(`Protects vs ${vigilProtectionName(data.vigilProtection)}`);
    if (data.vigilProtectAll) lines.push("Protects vs Vigil hazards");
    if (item.id === "sigil_satchel") lines.push(sigilPouchText());
    if (data.requirements) lines.push(`Requires ${requirementText(data.requirements)}`);
    if (data.value) lines.push(`Value ${data.value} gp`);
    return lines;
  }

  function hoverLinesForWorld(picked) {
    const item = picked.item;
    if (picked.kind === "groundItem") return hoverLinesForItem({ id: item.itemId, qty: item.qty });
    if (picked.kind === "enemy") return [`${item.name} level ${item.level}`, item.vigilType ? `Vigilance: ${item.vigilType.replaceAll("_", " ")}` : "Attack", item.requiredProtection ? (hasVigilanceProtection(item) ? `${vigilProtectionName(item.requiredProtection)} covered` : `Needs ${vigilProtectionName(item.requiredProtection)}`) : null, item.poisonDamage ? "Poisonous" : null, item.finisher ? `Finish with ${ITEMS[item.finisher].name}` : null].filter(Boolean);
    if (picked.kind === "npc") return [item.name, item.role.replaceAll("_", " ")];
    if (picked.kind === "resource") return [resourceName(item)];
    if (picked.kind === "scenery") {
      if (item.action === "agility") return [item.name, `Agility ${item.level || 1}`, `Run +${item.restore || 0}%`];
      if (item.action === "fletch") return [item.name, "Fletch supplies"];
      if (item.action === "farm") return farmPatchLines(item);
      if (item.action === "compost") return [item.name, "Turns potatoes into compost"];
      if (item.action === "water") return [item.name, "Fill empty vials"];
      if (item.action === "sigilcraft") {
        const recipe = SIGILCRAFT_RECIPES[item.sigil];
        return [item.name, `Sigilcraft ${recipe.level}`, `${inventoryCount("glimmer_shard") + (inventoryCount("sigil_satchel") > 0 ? state.sigilPouch.essence : 0)} essence`];
      }
      if (item.action === "crypt") {
        const brother = CRYPT_BROTHERS[item.brother];
        return [item.name, brother ? brother.name : "Oath warden", cryptStatusText()];
      }
      if (item.action === "crypt_chest") return [item.name, cryptStatusText(), state.crypt?.lastReward ? `Last: ${state.crypt.lastReward}` : "Wake all brothers"];
      if (item.action === "bannerfall") return [item.name, "Join match", bannerfallScoreText()];
      if (item.action === "banner_flag") return [item.name, item.team === "enemy" ? "Steal flag" : "Score here", bannerfallScoreText()];
      if (item.action === "banner_supply") return [item.name, "Bandages and run energy", bannerfallScoreText()];
      if (item.action === "banner_scoreboard") return [item.name, bannerfallScoreText()];
      if (item.action === "tower_door") return [item.name, "Enter Gloamspire", "Wear protection gear"];
      if (item.action === "tower_chest") return [item.name, "Open with tower key"];
      if (item.action === "fish_redclaw") return [item.name, "Cage redclaws", "Requires Fishing 35 and redclaw pot"];
      if (item.action === "banana") return [item.name, item.readyAt && item.readyAt > state.time ? "Growing back" : "Pick banana"];
      if (item.action === "web") return [item.name, item.readyAt && item.readyAt > state.time ? "Regrowing" : "Cut spider silk", "Requires knife"];
      if (item.action === "island_shop") return [item.name, "Trade island supplies"];
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
      if (rect.destination.ferryCost) {
        if (!spendCoins(rect.destination.ferryCost)) {
          addChat(`You need ${rect.destination.ferryCost} coins for the ferry.`);
          closeModal();
          return;
        }
        state.stats.ferriesTaken += 1;
        state.stats.islandTrips += 1;
        travelTo(rect.destination.x + 0.5, rect.destination.y + 0.5, 0, rect.destination.label);
        return;
      }
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
      if (state.modal?.currency === "vigil") {
        if (state.vigil.points < total) addChat("You need more Vigil marks.");
        else if (addInventory(rect.stock.id, qty)) {
          state.vigil.points -= total;
          addChat(`You buy ${formatItem(rect.stock.id, qty)}.`);
        }
      } else if (state.modal?.currency === "banner") {
        if (inventoryCount("banner_token") < total) addChat("You need more Bannerfall tokens.");
        else if (addInventory(rect.stock.id, qty)) {
          removeItem(state.player.inventory, "banner_token", total);
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
    } else if (setting === "resolve") {
      const order = ["none", "thickSkin", "burstStrength", "sharpEye", "rapidHeal"];
      state.player.resolveMode = order[(order.indexOf(state.player.resolveMode) + 1) % order.length];
      if (state.player.resolvePoints <= 0) state.player.resolveMode = "none";
      addChat(`Resolve: ${resolveLabel(state.player.resolveMode)}.`);
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
        poisonDamage: state.player.poisonDamage || 0,
        poisonTick: state.player.poisonTick || 0,
        inventory: state.player.inventory,
        bank: state.player.bank,
        equipment: state.player.equipment,
        skills: state.player.skills,
        combatStyle: state.player.combatStyle,
        resolveMode: state.player.resolveMode,
        resolvePoints: state.player.resolvePoints,
        boosts: state.player.boosts,
        boostDecay: state.player.boostDecay,
        runEnergy: state.player.runEnergy,
        run: state.player.run,
      },
      quests: state.quests,
      stats: state.stats,
      vigil: state.vigil,
      sigilPouch: state.sigilPouch,
      crypt: state.crypt,
      bannerfall: state.bannerfall,
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
    localStorage.setItem("briarbound-save", JSON.stringify(payload));
    addChat("Game saved.");
  }

  function loadGame() {
    const raw = localStorage.getItem("briarbound-save") || localStorage.getItem(legacyKey("boon", "scape-save"));
    if (!raw) {
      addChat("No save found.");
      return;
    }
    try {
      const payload = JSON.parse(raw);
      migrateLegacyPlayerData(payload.player);
      Object.assign(state.player, payload.player || {});
      normalizePlayerState();
      state.quests = { ...state.quests, ...(payload.quests || {}) };
      migrateLegacyQuests(state.quests);
      state.stats = { ...blankStats(), ...(payload.stats || {}) };
      migrateLegacyStats(state.stats);
      state.vigil = migrateLegacyVigil(payload.vigil || payload[legacyKey("sl", "ay", "er")] || state.vigil);
      state.sigilPouch = payload.sigilPouch || payload[legacyKey("ru", "nePouch")] || state.sigilPouch;
      state.crypt = payload.crypt || state.crypt;
      state.bannerfall = payload.bannerfall || payload[legacyKey("cast", "leWars")] || state.bannerfall;
      normalizePlayerState();
      state.farmingContract = payload.farmingContract || null;
      state.clue = payload.clue || null;
      state.randomEvent = null;
      state.nextRandomEvent = payload.nextRandomEvent || state.time + 95;
      state.collection = migrateLegacyCollection(payload.collection);
      state.diaryRewardClaimed = Boolean(payload.diaryRewardClaimed);
      state.groundItems = payload.groundItems || [];
      for (const item of state.groundItems) {
        if (item?.itemId) item.itemId = migrateLegacyItemId(item.itemId);
      }
      state.farmingPatches = payload.farmingPatches || state.farmingPatches;
      normalizeFarmingPatches();
      const savedAtTime = Number.isFinite(payload.farmingSavedAtTime) ? payload.farmingSavedAtTime : state.time;
      const offlineSeconds = Number.isFinite(payload.farmingSavedAtWall) ? Math.min(600, Math.max(0, (Date.now() - payload.farmingSavedAtWall) / 1000)) : 0;
      for (const patch of Object.values(state.farmingPatches)) {
        if (!patch.crop) continue;
        const savedAge = Math.max(0, savedAtTime - patch.plantedAt);
        patch.plantedAt = state.time - savedAge - offlineSeconds;
      }
      state.player.resolvePoints = Math.min(state.player.resolvePoints ?? maxResolve(), maxResolve());
      state.player.runEnergy = clamp(state.player.runEnergy ?? 100, 0, 100);
      addChat("Game loaded.");
    } catch (error) {
      addChat("Save file could not be loaded.");
    }
  }

  function renderGameToText() {
    const renderSingleAggressorId = singleCombatAggressorId();
    const nearbyEnemies = state.enemies
      .filter((enemy) => enemy.hp > 0 && dist(enemy, state.player) < 8)
      .map((enemy) => {
        const screen = screenOf(enemy);
        const area = areaAt(enemy.x, enemy.y);
        const distance = dist(enemy, state.player);
        return { id: enemy.id, name: enemy.name, type: enemy.type, vigilType: enemy.vigilType, requiredProtection: enemy.requiredProtection || null, protected: hasVigilanceProtection(enemy), cryptBrother: enemy.cryptBrother || null, finisher: enemy.finisher || null, poisonDamage: enemy.poisonDamage || 0, aggro: enemy.aggro, distance: Number(distance.toFixed(2)), engaging: state.player.combatTarget === enemy.id || isMultiCombatArea(area) || enemy.id === renderSingleAggressorId, x: Number(enemy.x.toFixed(1)), y: Number(enemy.y.toFixed(1)), screenX: Math.round(screen.x), screenY: Math.round(screen.y), hp: enemy.hp, level: enemy.level };
      });
    const nearbyNpcs = state.npcs
      .filter((npc) => dist(npc, state.player) < 7)
      .map((npc) => {
        const screen = screenOf(npc);
        return { id: npc.id, name: npc.name, role: npc.role, x: Number(npc.x.toFixed(1)), y: Number(npc.y.toFixed(1)), screenX: Math.round(screen.x), screenY: Math.round(screen.y) };
      });
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
      .map((obj) => {
        const screen = screenOf(obj);
        return {
          id: obj.id,
          name: obj.name,
          type: obj.type,
          action: obj.action,
          level: obj.level || null,
          patch: obj.patchId ? farmPatchStatus(obj.patchId) : null,
          sigil: obj.sigil || null,
          brother: obj.brother || null,
          team: obj.team || null,
          ready: obj.readyAt ? obj.readyAt <= state.time : null,
          x: obj.x,
          y: obj.y,
          screenX: Math.round(screen.x),
          screenY: Math.round(screen.y),
        };
      });
    const nearbyGroundItems = state.groundItems
      .filter((item) => dist(item, state.player) < 8)
      .map((item) => ({ id: item.id, itemId: item.itemId, name: ITEMS[item.itemId].name, qty: item.qty, x: Number(item.x.toFixed(1)), y: Number(item.y.toFixed(1)) }));
    const inventory = state.player.inventory
      .map((item, slot) => (item ? { slot, id: item.id, name: ITEMS[item.id].name, qty: item.qty } : null))
      .filter(Boolean);
    const collection = collectionCount();
    return JSON.stringify({
      coordinateSystem: "World tiles: x increases southeast, y increases southwest. Canvas origin is top-left.",
      world: { width: WORLD_W, height: WORLD_H },
      mode: state.modal?.type || "playing",
      player: {
        x: Number(state.player.x.toFixed(2)),
        y: Number(state.player.y.toFixed(2)),
        hp: state.player.hp,
        maxHp: maxHp(),
        poisonDamage: state.player.poisonDamage || 0,
        resolvePoints: Number(state.player.resolvePoints.toFixed(1)),
        resolveMode: state.player.resolveMode,
        runEnergy: Number(state.player.runEnergy.toFixed(1)),
        area: state.areaName,
        moving: state.player.path.length,
        action: state.player.action?.kind || null,
        combatTarget: state.player.combatTarget,
        combatLevel: combatLevel(),
        equipment: { ...state.player.equipment },
      },
      skills: Object.fromEntries(skillNames.map((skill) => [skill, getLevel(skill)])),
      effectiveSkills: Object.fromEntries(skillNames.map((skill) => [skill, effectiveLevel(skill)])),
      boosts: Object.fromEntries(activeBoosts()),
      vigil: state.vigil.task
        ? { task: state.vigil.task.label, remaining: state.vigil.task.remaining, streak: state.vigil.streak, points: state.vigil.points }
        : { task: null, streak: state.vigil.streak, points: state.vigil.points },
      sigilPouch: { essence: state.sigilPouch.essence, capacity: state.sigilPouch.capacity },
      crypt: { awakened: state.crypt.awakened, defeated: state.crypt.defeated, chestsOpened: state.crypt.chestsOpened, lastReward: state.crypt.lastReward },
      bannerfall: {
        active: state.bannerfall.active,
        score: state.bannerfall.score,
        enemyScore: state.bannerfall.enemyScore,
        flagHeld: state.bannerfall.flagHeld,
        secondsLeft: state.bannerfall.active ? Math.max(0, Math.ceil(state.bannerfall.endsAt - state.time)) : 0,
        tokens: inventoryCount("banner_token"),
        lastReward: state.bannerfall.lastReward,
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
        poisonsCured: state.stats.poisonsCured,
        stallsStolen: state.stats.stallsStolen,
        agilityObstacles: state.stats.agilityObstacles,
        arrowsFletched: state.stats.arrowsFletched,
        bowsFletched: state.stats.bowsFletched,
        cropsHarvested: state.stats.cropsHarvested,
        farmingContractsCompleted: state.stats.farmingContractsCompleted,
        visitedSouthport: state.stats.visitedSouthport,
        essenceMined: state.stats.essenceMined,
        sigilsCrafted: state.stats.sigilsCrafted,
        galeSigilsCrafted: state.stats.galeSigilsCrafted,
        whisperSigilsCrafted: state.stats.whisperSigilsCrafted,
        riftSigilsCrafted: state.stats.riftSigilsCrafted,
        oathSigilsCrafted: state.stats.oathSigilsCrafted,
        cryptWightsDefeated: state.stats.cryptWightsDefeated,
        cryptChestsOpened: state.stats.cryptChestsOpened,
        bannerfallPlayed: state.stats.bannerfallPlayed,
        bannerfallWon: state.stats.bannerfallWon,
        bannersCaptured: state.stats.bannersCaptured,
        gemsCut: state.stats.gemsCut,
        jewelryCrafted: state.stats.jewelryCrafted,
        redclawsCaught: state.stats.redclawsCaught,
        redclawsCooked: state.stats.redclawsCooked,
        bananasPicked: state.stats.bananasPicked,
        islandTrips: state.stats.islandTrips,
        jungleSpidersSlain: state.stats.jungleSpidersSlain,
        graspingClawsSlain: state.stats.graspingClawsSlain,
        keeningShadesSlain: state.stats.keeningShadesSlain,
        miasmaWraithsSlain: state.stats.miasmaWraithsSlain,
        hillGiantsSlain: state.stats.hillGiantsSlain,
        desertScorpionsSlain: state.stats.desertScorpionsSlain,
        highwaymenSlain: state.stats.highwaymenSlain,
        towerChestsOpened: state.stats.towerChestsOpened,
        websCut: state.stats.websCut,
        herbsHarvested: state.stats.herbsHarvested,
        herbsCleaned: state.stats.herbsCleaned,
        potionsMixed: state.stats.potionsMixed,
        chickensSlain: state.stats.chickensSlain,
        randomEventsCompleted: state.stats.randomEventsCompleted,
        vigilTasksCompleted: state.stats.vigilTasksCompleted,
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
    addChat("Welcome to Briarbound.");
    addChat("Click to walk, fight, gather, trade, bank, quest, and grind Vigilance.");
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
