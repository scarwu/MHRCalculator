/**
 * Constant
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

export const langs = {
    zhTW: '正體中文',
    jaJP: '日本語',
    enUS: 'English'
}

export const equipTypes = [
    'weapons',
    'helm',
    'chest',
    'arm',
    'waist',
    'leg',
    'petalace',
    'charm'
]

export const weaponTypes = [
    'greatSword',
    'longSword',
    'swordAndShield',
    'dualBlades',
    'hammer',
    'huntingHorn',
    'lance',
    'gunlance',
    'switchAxe',
    'chargeBlade',
    'insectGlaive',
    'lightBowgun',
    'heavyBowgun',
    'bow'
]

export const armorTypes = [
    'helm',
    'chest',
    'arm',
    'waist',
    'leg'
]

export const sharpnessSteps = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'white',
    'purple'
]

export const resistanceTypes = [
    'fire',
    'water',
    'thunder',
    'ice',
    'dragon'
]

export const sharpnessMultiple = {
    physical: {
        red: 0.50,
        orange: 0.75,
        yellow: 1.00,
        green: 1.05,
        blue: 1.2,
        white: 1.32,
        purple: 1.39
    },
    element: {
        red: 0.25,
        orange: 0.50,
        yellow: 0.75,
        green: 1.00,
        blue: 1.0625,
        white: 1.125,
        purple: 1.2
    }
}

export const elementCriticalMultiple ={
    attack: {
        greatSword: [1.50, 1.70],
        longSword: [1.35, 1.55],
        swordAndShield: [1.35, 1.55],
        dualBlades: [1.35, 1.55],
        hammer: [1.50, 1.70],
        huntingHorn: [1.50, 1.70],
        lance: [1.35, 1.55],
        gunlance: [1.35, 1.55],
        switchAxe: [1.35, 1.55],
        chargeBlade: [1.35, 1.55],
        insectGlaive: [1.35, 1.55],
        lightBowgun: [1.25, 1.40],
        heavyBowgun: [1.50, 1.70],
        bow: [1.35, 1.55]
    },
    status: {
        greatSword: [1.40, 1.60],
        longSword: [1.20, 1.40],
        swordAndShield: [1.20, 1.40],
        dualBlades: [1.20, 1.40],
        hammer: [1.40, 1.60],
        huntingHorn: [1.40, 1.60],
        lance: [1.20, 1.40],
        gunlance: [1.20, 1.40],
        switchAxe: [1.20, 1.40],
        chargeBlade: [1.20, 1.40],
        insectGlaive: [1.20, 1.40],
        lightBowgun: [1.20, 1.40],
        heavyBowgun: [1.40, 1.60],
        bow: [1.20, 1.40]
    }
}

export const defaultLang = 'zhTW'

export const defaultAlgorithmParams = {
    limit: 10,
    sort: 'complex', // complex | defense | amount | slot | expectedValue | expectedLevel
    order: 'desc', // asc | desc
    usingFactor: {

        // Armor Rare
        'armor:rare:7': true,
        'armor:rare:6': true,
        'armor:rare:5': false,
        'armor:rare:4': false,
        'armor:rare:3': false,
        'armor:rare:2': false,
        'armor:rare:1': false,

        // Jewel Size
        'jewel:size:3': true,
        'jewel:size:2': true,
        'jewel:size:1': true
    }
}

export const defaultCustomWeapon = {
    id: 'customWeapon',
    rare: 7,
    type: 'greatSword',
    series: null,
    name: 'customWeapon',
    attack: 100,
    criticalRate: 0,
    defense: 0,
    sharpness: {
        value: 350,
        steps: {
            red: 0,
            orange: 0,
            yellow: 0,
            green: 0,
            blue: 0,
            white: 400,
            purple: 0
        }
    },
    element: {
        attack: {
            type: null,
            value: null
        },
        status: {
            type: null,
            value: null
        }
    },
    slots: [
        {
            size: null
        },
        {
            size: null
        },
        {
            size: null
        }
    ],
    enhance: {
        amount: 3
    }
}

export const defaultCustomCharm = {
    id: 'customCharm',
    name: 'customCharm',
    slots: [
        {
            size: null
        },
        {
            size: null
        },
        {
            size: null
        }
    ],
    skills: [
        {
            id: null,
            level: null
        },
        {
            id: null,
            level: null
        }
    ]
}

export const defaultPlayerEquips = {
    weapon: {
        id: null,
        jewelIds: [],
        enhanceIds: [],
        custom: defaultCustomWeapon
    },
    helm: {
        id: null,
        jewelIds: []
    },
    chest: {
        id: null,
        jewelIds: []
    },
    arm: {
        id: null,
        jewelIds: []
    },
    waist: {
        id: null,
        jewelIds: []
    },
    leg: {
        id: null,
        jewelIds: []
    },
    petalace: {
        id: null
    },
    charm: {
        id: null,
        jewelIds: [],
        custom: defaultCustomCharm
    }
}

export const defaultPlayerStatus = {
    usingItem: {
        'powerCharm': true, // 力量護符
        'powerTalon': true, // 力量之爪
        'armorCharm': true, // 守護護符
        'armorTalon': true // 守護之爪
    }
}

export const defaultStatus = {
    health: 100,
    stamina: 100,
    attack: 0,
    critical: {
        rate: 0,
        multiple: {
            positive: 1.25,
            nagetive: 0.75
        }
    },
    sharpness: null,
    element: {
        attack: null,
        status: null
    },
    elementCriticalMultiple: {
        attack: 1,
        status: 1
    },
    defense: 1,
    resistance: {
        fire: 0,
        water: 0,
        thunder: 0,
        ice: 0,
        dragon: 0
    },
    sets: [],
    skills: []
}

export const defaultBenefitAnalysis = {
    physicalAttack: 0,
    physicalCriticalAttack: 0,
    physicalExpectedValue: 0,
    elementAttack: 0,
    elementExpectedValue: 0,
    expectedValue: 0,
    perNRawAttackExpectedValue: 0,
    perNRawCriticalRateExpectedValue: 0,
    perNRawCriticalMultipleExpectedValue: 0,
    perNElementAttackExpectedValue: 0
}

export const defaultRequiredConditions = {
    equips: defaultPlayerEquips,
    sets: [],
    skills: []
}

export default {
    langs,
    equipTypes,
    weaponTypes,
    armorTypes,
    sharpnessSteps,
    resistanceTypes,
    sharpnessMultiple,
    elementCriticalMultiple,
    defaultLang,
    defaultAlgorithmParams,
    defaultCustomWeapon,
    defaultCustomCharm,
    defaultPlayerEquips,
    defaultPlayerStatus,
    defaultStatus,
    defaultBenefitAnalysis,
    defaultRequiredConditions
}
