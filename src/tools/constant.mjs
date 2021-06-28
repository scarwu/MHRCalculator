/**
 * Constant
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

export const defaultWeapon = {
    serial: null,
    name: null,
    rare: null,
    type: null,
    attack: null,
    criticalRate: null,
    defense: null,
    element: {
        attack: {
            type: null,
            minValue: null,
            maxValue: null
        },
        status: {
            type: null,
            minValue: null,
            maxValue: null
        }
    },
    sharpness: {
        red: null,
        orange: null,
        yellow: null,
        green: null,
        blue: null,
        white: null,
        purple: null
    },
    slots: [
        // {
        //     size: null
        // }
    ],
    enhances: [
        // {
        //     name: null
        // }
    ]
}

export const defaultArmor = {
    serial: null,
    name: null,
    rare: null,
    type: null,
    gender: null,
    defense: null,
    resistence: {
        fire: null,
        water: null,
        tunder: null,
        ice: null,
        dragon: null
    },
    slots: [
        // {
        //     size: null
        // }
    ],
    skills: [
        // {
        //     name: null,
        //     level: null
        // }
    ]
}

export const defaultJewel = {
    name: null,
    rare: null,
    slot: {
        size: null
    },
    skill: {
        name: null,
        level: null
    }
}

export const defaultPetalace = {
    name: null,
    rare: null,
    health: {
        increment: null,
        obtain: null
    },
    stamina: {
        increment: null,
        obtain: null
    },
    attack: {
        increment: null,
        obtain: null
    },
    defense: {
        increment: null,
        obtain: null
    }
}

export const defaultEnhance = {
    name: null,
    description: null
}

export const defaultSkill = {
    name: null,
    description: null,
    level: null,
    effect: null
}

export const weaponTypeList = [
    'greatSword', 'longSword', 'swordAndShield', 'dualBlades',
    'hammer', 'huntingHorn', 'lance', 'gunlance',
    'chargeBlade', 'switchAxe', 'insectGlaive',
    'bow', 'lightBowgun', 'heavyBowgun'
]
