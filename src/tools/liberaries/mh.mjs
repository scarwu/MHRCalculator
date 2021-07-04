/**
 * Constant
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from './helper.mjs'

export const defaultWeaponItem = {
    id: null,
    series: null,
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
    enhance: {
        amount: null,
        list: [
            // {
            //     name: null
            // }
        ]
    }
}

export const defaultArmorItem = {
    id: null,
    series: null,
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

export const defaultJewelItem = {
    id: null,
    name: null,
    rare: null,
    size: null,
    skills: [
        // {
        //     name: null,
        //     level: null
        // }
    ]
}

export const defaultPetalaceItem = {
    id: null,
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

export const defaultEnhanceItem = {
    id: null,
    name: null,
    description: null
}

export const defaultSkillItem = {
    id: null,
    name: null,
    description: null,
    level: null,
    effect: null
}

export const autoExtendListQuantity = (list) => {
    let slotCount = 0
    let skillCount = 0
    let enhanceCount = 0

    list.forEach((row) => {
        if (Helper.isNotEmpty(row.slots)
            && slotCount < row.slots.length
        ) {
            slotCount = row.slots.length
        }

        if (Helper.isNotEmpty(row.skills)
            && skillCount < row.skills.length
        ) {
            skillCount = row.skills.length
        }

        if (Helper.isNotEmpty(row.enhance) && Helper.isNotEmpty(row.enhance.list)
            && enhanceCount < row.enhance.list.length
        ) {
            enhanceCount = row.enhance.list.length
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

        if (Helper.isNotEmpty(row.enhance) && Helper.isNotEmpty(row.enhance.list)) {
            for (let index = 0; index < enhanceCount; index++) {
                if (Helper.isNotEmpty(row.enhance.list[index])) {
                    continue
                }

                row.enhance.list[index] = {
                    name: null
                }
            }
        }

        return row
    })
}

export const normalizeText = (text) => {
    return text
        .replace(/ /g, ' ')
        .replace(/(│|├|└)*/g, '').replace(/(┃|┣|┗|　)*/g, '')

        .replace('Ⅰ', 'I').replace('Ⅱ', 'II').replace('Ⅲ', 'III').replace('Ⅳ', 'IV').replace('Ⅴ', 'V')

        .replace('Ａ', 'A').replace('Ｂ', 'B').replace('Ｃ', 'C').replace('Ｄ', 'D').replace('Ｅ', 'E')
        .replace('Ｆ', 'F').replace('Ｇ', 'G').replace('Ｈ', 'H').replace('Ｉ', 'I').replace('Ｊ', 'J')
        .replace('Ｋ', 'K').replace('Ｌ', 'L').replace('Ｍ', 'M').replace('Ｎ', 'N').replace('Ｏ', 'O')
        .replace('Ｐ', 'P').replace('Ｑ', 'Q').replace('Ｒ', 'R').replace('Ｓ', 'S').replace('Ｔ', 'T')
        .replace('Ｕ', 'U').replace('Ｖ', 'V').replace('Ｗ', 'W').replace('Ｘ', 'X').replace('Ｙ', 'Y')
        .replace('Ｚ', 'Z')

        .replace('ａ', 'a').replace('ｂ', 'b').replace('ｃ', 'c').replace('ｄ', 'd').replace('ｅ', 'e')
        .replace('ｆ', 'f').replace('ｇ', 'g').replace('ｈ', 'h').replace('ｉ', 'i').replace('ｊ', 'j')
        .replace('ｋ', 'k').replace('ｌ', 'l').replace('ｍ', 'm').replace('ｎ', 'n').replace('ｏ', 'o')
        .replace('ｐ', 'p').replace('ｑ', 'q').replace('ｒ', 'r').replace('ｓ', 's').replace('ｔ', 't')
        .replace('ｕ', 'u').replace('ｖ', 'v').replace('ｗ', 'w').replace('ｘ', 'x').replace('ｙ', 'y')
        .replace('ｚ', 'z')

        .replace('＝', '=').replace('･', '・')
}

export const weaponTypeList = [
    'greatSword', 'swordAndShield', 'dualBlades', 'longSword',
    'hammer', 'huntingHorn', 'lance', 'gunlance', 'switchAxe', 'chargeBlade',
    'insectGlaive', 'bow', 'heavyBowgun', 'lightBowgun'
]

export const rareList = [
    'rare1', 'rare2', 'rare3', 'rare4', 'rare5', 'rare6', 'rare7'
]

export const sizeList = [
    'size1', 'size2', 'size3'
]
