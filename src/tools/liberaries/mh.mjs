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
    name: null,
    description: null
}

export const defaultSkillItem = {
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
    return text.trim()
        .replace(/ /g, ' ')
        .replace(/(│|├|└)*/g, '').replace(/(┃|┣|┗|　)*/g, '')

        .replace(/Ⅰ/g, 'I').replace(/Ⅱ/g, 'II').replace(/Ⅲ/g, 'III').replace(/Ⅳ/g, 'IV').replace(/Ⅴ/g, 'V')

        .replace(/Ａ/g, 'A').replace(/Ｂ/g, 'B').replace(/Ｃ/g, 'C').replace(/Ｄ/g, 'D').replace(/Ｅ/g, 'E')
        .replace(/Ｆ/g, 'F').replace(/Ｇ/g, 'G').replace(/Ｈ/g, 'H').replace(/Ｉ/g, 'I').replace(/Ｊ/g, 'J')
        .replace(/Ｋ/g, 'K').replace(/Ｌ/g, 'L').replace(/Ｍ/g, 'M').replace(/Ｎ/g, 'N').replace(/Ｏ/g, 'O')
        .replace(/Ｐ/g, 'P').replace(/Ｑ/g, 'Q').replace(/Ｒ/g, 'R').replace(/Ｓ/g, 'S').replace(/Ｔ/g, 'T')
        .replace(/Ｕ/g, 'U').replace(/Ｖ/g, 'V').replace(/Ｗ/g, 'W').replace(/Ｘ/g, 'X').replace(/Ｙ/g, 'Y')
        .replace(/Ｚ/g, 'Z')

        .replace(/ａ/g, 'a').replace(/ｂ/g, 'b').replace(/ｃ/g, 'c').replace(/ｄ/g, 'd').replace(/ｅ/g, 'e')
        .replace(/ｆ/g, 'f').replace(/ｇ/g, 'g').replace(/ｈ/g, 'h').replace(/ｉ/g, 'i').replace(/ｊ/g, 'j')
        .replace(/ｋ/g, 'k').replace(/ｌ/g, 'l').replace(/ｍ/g, 'm').replace(/ｎ/g, 'n').replace(/ｏ/g, 'o')
        .replace(/ｐ/g, 'p').replace(/ｑ/g, 'q').replace(/ｒ/g, 'r').replace(/ｓ/g, 's').replace(/ｔ/g, 't')
        .replace(/ｕ/g, 'u').replace(/ｖ/g, 'v').replace(/ｗ/g, 'w').replace(/ｘ/g, 'x').replace(/ｙ/g, 'y')
        .replace(/ｚ/g, 'z')

        .replace(/１/g, '1').replace(/２/g, '2').replace(/３/g, '3').replace(/４/g, '4').replace(/５/g, '5')
        .replace(/６/g, '6').replace(/７/g, '7').replace(/８/g, '8').replace(/９/g, '9').replace(/０/g, '0')
        .replace(/＋/g, '+').replace(/(－|−)/g, '-').replace(/＝/g, '=').replace(/％/g, '%')
        .replace(/．/g, '.').replace(/･/g, '・').replace(/（/g, '(').replace(/）/g, ')')
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
