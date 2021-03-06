/**
 * Constant
 *
 * @package     Monster Hunter Rise - Calculator
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
        minValue: null,
        maxValue: null,
        steps: {
            red: null,
            orange: null,
            yellow: null,
            green: null,
            blue: null,
            white: null,
            purple: null
        }
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
    resistance: {
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
        .replace(/??/g, ' ')
        .replace(/(???|???|???)*/g, '').replace(/(???|???|???|???)*/g, '')

        .replace(/???/g, 'I').replace(/???/g, 'II').replace(/???/g, 'III').replace(/???/g, 'IV').replace(/???/g, 'V')

        .replace(/???/g, 'A').replace(/???/g, 'B').replace(/???/g, 'C').replace(/???/g, 'D').replace(/???/g, 'E')
        .replace(/???/g, 'F').replace(/???/g, 'G').replace(/???/g, 'H').replace(/???/g, 'I').replace(/???/g, 'J')
        .replace(/???/g, 'K').replace(/???/g, 'L').replace(/???/g, 'M').replace(/???/g, 'N').replace(/???/g, 'O')
        .replace(/???/g, 'P').replace(/???/g, 'Q').replace(/???/g, 'R').replace(/???/g, 'S').replace(/???/g, 'T')
        .replace(/???/g, 'U').replace(/???/g, 'V').replace(/???/g, 'W').replace(/???/g, 'X').replace(/???/g, 'Y')
        .replace(/???/g, 'Z')

        .replace(/???/g, 'a').replace(/???/g, 'b').replace(/???/g, 'c').replace(/???/g, 'd').replace(/???/g, 'e')
        .replace(/???/g, 'f').replace(/???/g, 'g').replace(/???/g, 'h').replace(/???/g, 'i').replace(/???/g, 'j')
        .replace(/???/g, 'k').replace(/???/g, 'l').replace(/???/g, 'm').replace(/???/g, 'n').replace(/???/g, 'o')
        .replace(/???/g, 'p').replace(/???/g, 'q').replace(/???/g, 'r').replace(/???/g, 's').replace(/???/g, 't')
        .replace(/???/g, 'u').replace(/???/g, 'v').replace(/???/g, 'w').replace(/???/g, 'x').replace(/???/g, 'y')
        .replace(/???/g, 'z')

        .replace(/???/g, '1').replace(/???/g, '2').replace(/???/g, '3').replace(/???/g, '4').replace(/???/g, '5')
        .replace(/???/g, '6').replace(/???/g, '7').replace(/???/g, '8').replace(/???/g, '9').replace(/???/g, '0')
        .replace(/???/g, '+').replace(/(???|???)/g, '-').replace(/???/g, '=').replace(/???/g, '%')
        .replace(/???/g, '.').replace(/???/g, '???').replace(/???/g, '(').replace(/???/g, ')')
}

export const guessArmorType = (name) => {
    let type = null
    let typeKeywordMapping = {
        helm: [
            '??????', '??????', '????????????', '??????', '??????', '????????????', '???????????????', '????????????', '??????',
            '??????', '??????', '???', '??????', '??????', '??????',
            '?????????', '??????', '??????', '????????????', '????????????', '??????', '??????'
        ],
        chest: [
            '??????', '??????', '????????????', '??????', '??????', '????????????', '????????????', '????????????', '??????',
            '??????', '??????', '??????', '??????', '??????', '??????',
            '??????', '??????', '??????'
        ],
        arm: [
            '??????', '??????', '????????????', '??????', '??????', '????????????', '????????????', '????????????', '??????',
            '??????', '??????', '??????', '???', '??????', '??????'
        ],
        waist: [
            '??????', '?????????', '????????????', '??????', '??????', '????????????', '????????????', '????????????', '??????',
            '???', '?????????', '??????', '??????', '??????', '??????'
        ],
        leg: [
            '??????', '??????', '????????????', '??????', '??????', '????????????', '????????????', '????????????', '??????',
            '??????', '???', '???', '??????', '??????', '???'
        ]
    }

    for (let entry of Object.entries(typeKeywordMapping)) {
        let typeName = entry[0]
        let keywords = entry[1]

        for (let keyword of keywords) {
            if (-1 === name.indexOf(keyword)) {
                continue
            }

            type = typeName

            break
        }

        if (Helper.isNotEmpty(type)) {
            break
        }
    }

    return type
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

export const crawlerList = [
    'gameqb', 'game8', 'kiranico', 'fextralife'
]

export const targetList = [
    'weapons',
    'armors',
    'petalaces',
    'jewels',
    'enhances',
    'skills'
]

export const langList = [
    'zhTW', 'jaJP', 'enUS'
]
