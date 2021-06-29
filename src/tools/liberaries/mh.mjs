/**
 * Constant
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from './helper.mjs'

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
    minDefense: null,
    maxDefense: null,
    resistence: {
        fire: null,
        water: null,
        thunder: null,
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

export const autoExtendCols = (list) => {
    let slotCount = 0
    let skillCount = 0
    let enhanceCount = 0

    list.forEach((row) => {
        if (Helper.isNotEmpty(row.slots) && slotCount < row.slots.length) {
            slotCount = row.slots.length
        }

        if (Helper.isNotEmpty(row.skills) && skillCount < row.skills.length) {
            skillCount = row.skills.length
        }

        if (Helper.isNotEmpty(row.enhances) && enhanceCount < row.enhances.length) {
            enhanceCount = row.enhances.length
        }
    })

    return list.map((row) => {
        if (Helper.isNotEmpty(row.slots)) {
            for (let index = 0; index < slotCount; index++) {
                if (Helper.isNotEmpty(row.slots[index])) {
                    continue
                }

                row.slots[index] = {
                    size: null
                }
            }
        }

        if (Helper.isNotEmpty(row.skills)) {
            for (let index = 0; index < skillCount; index++) {
                if (Helper.isNotEmpty(row.skills[index])) {
                    continue
                }

                row.skills[index] = {
                    name: null,
                    level: null
                }
            }
        }

        if (Helper.isNotEmpty(row.enhances)) {
            for (let index = 0; index < enhanceCount; index++) {
                if (Helper.isNotEmpty(row.enhances[index])) {
                    continue
                }

                row.enhances[index] = {
                    name: null
                }
            }
        }

        return row
    })
}

export const formatName = (text) => {
    return text
        .replace(/(│|├|└)*/g, '')
        .replace(/(┃|┣|┗|　)*/g, '')
        .replace('Ⅰ', 'I')
        .replace('Ⅱ', 'II')
        .replace('Ⅲ', 'III')
        .replace('Ⅳ', 'IV')
        .replace('Ⅴ', 'V')
}
