// Ported from zinongli/KeyCopier (key_formats.c) — all lengths in inches, angle in degrees.
// sides: 1 = single-sided cuts, 2 = double-sided (same depth cut into both edges of the blade)
// stop: 1 = shoulder-stop key, 2 = tip-stop key (drawn with a wall at the tip instead)
// country: where the format/manufacturer originates, used to group the manufacturer picker

export const KEY_FORMATS = [
  { manufacturer: "Kwikset", formatName: "KW1", formatLink: "https://lsamichigan.org/Tech/Kwikset_KeySpecs.pdf",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.247, lastPinIn: 0.847, pinIncrementIn: 0.15, pinNum: 5,
    pinWidthIn: 0.084, elbowIn: 0.15, drillAngle: 90, uncutDepthIn: 0.329, deepestDepthIn: 0.191,
    depthStepIn: 0.023, minDepthInd: 1, maxDepthInd: 7, macs: 4, clearance: 3 },

  { manufacturer: "Schlage", formatName: "SC4", formatLink: "https://lsamichigan.org/Tech/SCHLAGE_KeySpecs.pdf",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.231, lastPinIn: 1.012, pinIncrementIn: 0.1562, pinNum: 6,
    pinWidthIn: 0.031, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.335, deepestDepthIn: 0.2,
    depthStepIn: 0.015, minDepthInd: 0, maxDepthInd: 9, macs: 7, clearance: 8 },

  { manufacturer: "Arrow", formatName: "AR4", formatLink: "C2",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.265, lastPinIn: 1.040, pinIncrementIn: 0.155, pinNum: 6,
    pinWidthIn: 0.060, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.312, deepestDepthIn: 0.186,
    depthStepIn: 0.014, minDepthInd: 0, maxDepthInd: 9, macs: 6, clearance: 7 },

  { manufacturer: "Master Lock", formatName: "M1", formatLink: "C35",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.185, lastPinIn: 0.689, pinIncrementIn: 0.126, pinNum: 5,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.276, deepestDepthIn: 0.171,
    depthStepIn: 0.015, minDepthInd: 0, maxDepthInd: 7, macs: 7, clearance: 6 },

  { manufacturer: "American", formatName: "AM7", formatLink: "C80",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.157, lastPinIn: 0.781, pinIncrementIn: 0.125, pinNum: 6,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.283, deepestDepthIn: 0.173,
    depthStepIn: 0.016, minDepthInd: 1, maxDepthInd: 8, macs: 7, clearance: 5 },

  { manufacturer: "Yale", formatName: "Y2", formatLink: "C57",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.200, lastPinIn: 1.025, pinIncrementIn: 0.165, pinNum: 6,
    pinWidthIn: 0.054, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.320, deepestDepthIn: 0.149,
    depthStepIn: 0.019, minDepthInd: 0, maxDepthInd: 9, macs: 9, clearance: 4 },

  { manufacturer: "Yale", formatName: "Y11", formatLink: "CX55",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.124, lastPinIn: 0.502, pinIncrementIn: 0.095, pinNum: 5,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.246, deepestDepthIn: 0.167,
    depthStepIn: 0.020, minDepthInd: 1, maxDepthInd: 5, macs: 7, clearance: 3 },

  { manufacturer: "Sargent", formatName: "S22", formatLink: "C44",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.216, lastPinIn: 0.996, pinIncrementIn: 0.156, pinNum: 6,
    pinWidthIn: 0.063, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.328, deepestDepthIn: 0.148,
    depthStepIn: 0.020, minDepthInd: 1, maxDepthInd: 10, macs: 7, clearance: 5 },

  { manufacturer: "National", formatName: "NA25", formatLink: "C40",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.250, lastPinIn: 0.874, pinIncrementIn: 0.156, pinNum: 5,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.304, deepestDepthIn: 0.191,
    depthStepIn: 0.012, minDepthInd: 0, maxDepthInd: 9, macs: 7, clearance: 8 },

  { manufacturer: "Corbin", formatName: "CO88", formatLink: "C14",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.250, lastPinIn: 1.030, pinIncrementIn: 0.156, pinNum: 6,
    pinWidthIn: 0.047, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.343, deepestDepthIn: 0.217,
    depthStepIn: 0.014, minDepthInd: 1, maxDepthInd: 10, macs: 7, clearance: 8 },

  { manufacturer: "Lockwood", formatName: "LW4", formatLink: "",
    country: "Australia",
    sides: 1, stop: 1, firstPinIn: 0.245, lastPinIn: 0.870, pinIncrementIn: 0.1562, pinNum: 5,
    pinWidthIn: 0.031, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.344, deepestDepthIn: 0.203,
    depthStepIn: 0.014, minDepthInd: 0, maxDepthInd: 9, macs: 9, clearance: 8 },

  { manufacturer: "Lockwood", formatName: "LW5", formatLink: "",
    country: "Australia",
    sides: 1, stop: 1, firstPinIn: 0.245, lastPinIn: 1.0262, pinIncrementIn: 0.1562, pinNum: 6,
    pinWidthIn: 0.031, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.344, deepestDepthIn: 0.203,
    depthStepIn: 0.014, minDepthInd: 0, maxDepthInd: 9, macs: 9, clearance: 8 },

  { manufacturer: "National", formatName: "NA12", formatLink: "C39",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.150, lastPinIn: 0.710, pinIncrementIn: 0.140, pinNum: 5,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.270, deepestDepthIn: 0.157,
    depthStepIn: 0.013, minDepthInd: 0, maxDepthInd: 9, macs: 7, clearance: 8 },

  { manufacturer: "Russwin", formatName: "RU45", formatLink: "CX6",
    country: "United States",
    sides: 1, stop: 1, firstPinIn: 0.250, lastPinIn: 1.030, pinIncrementIn: 0.156, pinNum: 6,
    pinWidthIn: 0.053, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.343, deepestDepthIn: 0.203,
    depthStepIn: 0.028, minDepthInd: 1, maxDepthInd: 6, macs: 5, clearance: 3 },

  { manufacturer: "Weiser", formatName: "WR3", formatLink: "https://www.lockwiki.com/index.php/Weiser_Classic",
    country: "Canada",
    sides: 1, stop: 1, firstPinIn: 0.237, lastPinIn: 0.861, pinIncrementIn: 0.156, pinNum: 5,
    pinWidthIn: 0.090, elbowIn: 0.150, drillAngle: 90, uncutDepthIn: 0.315, deepestDepthIn: 0.153,
    depthStepIn: 0.018, minDepthInd: 0, maxDepthInd: 10, macs: 6, clearance: 3 },

  { manufacturer: "Ford", formatName: "H75", formatLink: "CX101",
    country: "United States",
    sides: 2, stop: 2, firstPinIn: 0.201, lastPinIn: 0.845, pinIncrementIn: 0.092, pinNum: 8,
    pinWidthIn: 0.039, elbowIn: 0.201, drillAngle: 90, uncutDepthIn: 0.354, deepestDepthIn: 0.254,
    depthStepIn: 0.025, minDepthInd: 1, maxDepthInd: 5, macs: 5, clearance: 2 },

  { manufacturer: "Chevrolet", formatName: "B102", formatLink: "",
    country: "United States",
    sides: 2, stop: 2, firstPinIn: 0.205, lastPinIn: 1.037, pinIncrementIn: 0.093, pinNum: 10,
    pinWidthIn: 0.039, elbowIn: 0.205, drillAngle: 90, uncutDepthIn: 0.315, deepestDepthIn: 0.161,
    depthStepIn: 0.026, minDepthInd: 1, maxDepthInd: 4, macs: 5, clearance: 2 },

  { manufacturer: "Dodge", formatName: "Y159", formatLink: "CX102",
    country: "United States",
    sides: 2, stop: 2, firstPinIn: 0.297, lastPinIn: 0.941, pinIncrementIn: 0.092, pinNum: 8,
    pinWidthIn: 0.039, elbowIn: 0.297, drillAngle: 90, uncutDepthIn: 0.339, deepestDepthIn: 0.197,
    depthStepIn: 0.047, minDepthInd: 1, maxDepthInd: 4, macs: 5, clearance: 1 },

  { manufacturer: "Kawasaki", formatName: "KA14", formatLink: "CMC50",
    country: "Japan",
    sides: 2, stop: 1, firstPinIn: 0.098, lastPinIn: 0.591, pinIncrementIn: 0.098, pinNum: 6,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.258, deepestDepthIn: 0.198,
    depthStepIn: 0.020, minDepthInd: 1, maxDepthInd: 4, macs: 4, clearance: 3 },

  { manufacturer: "Suzuki", formatName: "SUZ18", formatLink: "X241",
    country: "Japan",
    sides: 2, stop: 1, firstPinIn: 0.16, lastPinIn: 0.73, pinIncrementIn: 0.095, pinNum: 7,
    pinWidthIn: 0.045, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.28, deepestDepthIn: 0.22,
    depthStepIn: 0.020, minDepthInd: 1, maxDepthInd: 4, macs: 4, clearance: 3 },

  { manufacturer: "Yamaha", formatName: "YM63", formatLink: "CMC71",
    country: "Japan",
    sides: 2, stop: 1, firstPinIn: 0.157, lastPinIn: 0.748, pinIncrementIn: 0.098, pinNum: 7,
    pinWidthIn: 0.039, elbowIn: 0.1, drillAngle: 90, uncutDepthIn: 0.295, deepestDepthIn: 0.236,
    depthStepIn: 0.020, minDepthInd: 1, maxDepthInd: 4, macs: 4, clearance: 3 },

  { manufacturer: "Best (A2)", formatName: "SFIC", formatLink: "C3",
    country: "United States",
    sides: 1, stop: 2, firstPinIn: 0.250, lastPinIn: 0.998, pinIncrementIn: 0.149, pinNum: 6,
    pinWidthIn: 0.051, elbowIn: 0.081, drillAngle: 90, uncutDepthIn: 0.318, deepestDepthIn: 0.206,
    depthStepIn: 0.025, minDepthInd: 0, maxDepthInd: 9, macs: 5, clearance: 3 },

  { manufacturer: "RV (FIC,GL,Bauer)", formatName: "RV", formatLink: "Card",
    country: "United States",
    sides: 2, stop: 1, firstPinIn: 0.126, lastPinIn: 0.504, pinIncrementIn: 0.094, pinNum: 5,
    pinWidthIn: 0.039, elbowIn: 0.126, drillAngle: 90, uncutDepthIn: 0.260, deepestDepthIn: 0.181,
    depthStepIn: 0.040, minDepthInd: 1, maxDepthInd: 3, macs: 3, clearance: 1 },
];
