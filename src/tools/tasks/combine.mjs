/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

import Helper from '../liberaries/helper.mjs'
import {
    autoExtendListQuantity,
    weaponTypeList,
    rareList,
    sizeList,
    crawlerNameList
} from '../liberaries/mh.mjs'

const crawlerRoot = 'temp/crawler'
const combineRoot = 'temp/combine'

const mergeNormalValue = (major, minor, keys ) => {
    for (let key of keys) {
        if (Helper.isEmpty(major[key])
            && Helper.isNotEmpty(minor[key])
        ) {
            major[key] = minor[key]
        }
    }

    return major
}

const mergeTranslateValue = (major, minor, lang, keys) => {
    for (let key of keys) {
        if (Helper.isEmpty(major[key])) {
            major[key] = {}
        }

        if (Helper.isEmpty(major[key][lang])
            && Helper.isNotEmpty(minor[key])
            && Helper.isNotEmpty(minor[key][lang])
        ) {
            major[key][lang] = minor[key][lang]
        }
    }

    return major
}

const mergeSlotsValue = (major, minor) => {
    let slotMaxIndex = 0

    if (Helper.isNotEmpty(major.slots)) {
        slotMaxIndex = (major.slots.length > slotMaxIndex) ? major.slots.length : slotMaxIndex
    }

    if (Helper.isNotEmpty(minor.slots)) {
        slotMaxIndex = (minor.slots.length > slotMaxIndex) ? minor.slots.length : slotMaxIndex
    }

    if (0 !== slotMaxIndex) {
        if (Helper.isEmpty(major.slots)) {
            major.slots = []
        }

        if (Helper.isEmpty(minor.slots)) {
            minor.slots = []
        }

        for (let index = 0; index < slotMaxIndex; index++) {
            if (Helper.isEmpty(major.slots[index])) {
                major.slots[index] = {}
            }

            if (Helper.isEmpty(minor.slots[index])) {
                minor.slots[index] = {}
            }

            if (Helper.isEmpty(major.slots[index].size)
                && Helper.isNotEmpty(minor.slots[index].size)
            ) {
                major.slots[index].size = minor.slots[index].size
            }
        }
    }

    return major
}

const mergeSkillsValue = (major, minor) => {
    let skillMaxIndex = 0

    if (Helper.isNotEmpty(major.skills)) {
        skillMaxIndex = (major.skills.length > skillMaxIndex) ? major.skills.length : skillMaxIndex
    }

    if (Helper.isNotEmpty(minor.skills)) {
        skillMaxIndex = (minor.skills.length > skillMaxIndex) ? minor.skills.length : skillMaxIndex
    }

    if (0 !== skillMaxIndex) {
        if (Helper.isEmpty(major.skills)) {
            major.skills = []
        }

        if (Helper.isEmpty(minor.skills)) {
            minor.skills = []
        }

        for (let index = 0; index < skillMaxIndex; index++) {
            if (Helper.isEmpty(major.skills[index])) {
                major.skills[index] = {}
            }

            if (Helper.isEmpty(minor.skills[index])) {
                minor.skills[index] = {}
            }

            if (Helper.isEmpty(major.skills[index].name)
                && Helper.isNotEmpty(minor.skills[index].name)
            ) {
                major.skills[index].name = minor.skills[index].name
            }

            if (Helper.isEmpty(major.skills[index].level)
                && Helper.isNotEmpty(minor.skills[index].level)
            ) {
                major.skills[index].level = minor.skills[index].level
            }
        }
    }

    return major
}

const mergeEnhanceValue = (major, minor) => {
    if (Helper.isEmpty(major.enhance.limit)
        && Helper.isNotEmpty(minor.enhance.limit)
    ) {
        major.enhance.limit = minor.enhance.limit
    }

    let enhanceMaxIndex = 0

    if (Helper.isNotEmpty(major.enhance.list)) {
        enhanceMaxIndex = (major.enhance.list.length > enhanceMaxIndex) ? major.enhance.list.length : enhanceMaxIndex
    }

    if (Helper.isNotEmpty(minor.enhance.list)) {
        enhanceMaxIndex = (minor.enhance.list.length > enhanceMaxIndex) ? minor.enhance.list.length : enhanceMaxIndex
    }

    if (0 !== enhanceMaxIndex) {
        if (Helper.isEmpty(major.enhance.list)) {
            major.enhance.list = []
        }

        if (Helper.isEmpty(minor.enhance.list)) {
            minor.enhance.list = []
        }

        for (let index = 0; index < enhanceMaxIndex; index++) {
            if (Helper.isEmpty(major.enhance.list[index])) {
                major.enhance.list[index] = {}
            }

            if (Helper.isEmpty(minor.enhance.list[index])) {
                minor.enhance.list[index] = {}
            }

            if (Helper.isEmpty(major.enhance.list[index].name)
                && Helper.isNotEmpty(minor.enhance.list[index].name)
            ) {
                major.enhance.list[index].name = minor.enhance.list[index].name
            }
        }
    }

    return major
}

const mergeItem = (target, major, minor, lang) => {
    switch (target) {
    case 'weapons':
        // Format: {
        //     series: { lang },
        //     name: { lang },
        //     rare: null,
        //     type: null,
        //     attack: null,
        //     criticalRate: null,
        //     defense: null,
        //     element: {
        //         attack: {
        //             type: null,
        //             minValue: null,
        //             maxValue: null
        //         },
        //         status: {
        //             type: null,
        //             minValue: null,
        //             maxValue: null
        //         }
        //     },
        //     sharpness: {
        //         red: null,
        //         orange: null,
        //         yellow: null,
        //         green: null,
        //         blue: null,
        //         white: null,
        //         purple: null
        //     },
        //     slots: [
        //         // {
        //         //     size: null
        //         // }
        //     ],
        //     enhances: [
        //         // {
        //         //     name: null
        //         // }
        //     ]
        // }
        major = mergeNormalValue(major, minor, ['rare', 'type', 'attack', 'criticalRate', 'defense'])
        major = mergeTranslateValue(major, minor, lang, ['series', 'name'])
        major = mergeSlotsValue(major, minor)
        major = mergeEnhanceValue(major, minor)

        // Element Attack & Status Value
        for (let key of ['attack', 'status']) {
            if (Helper.isEmpty(major.element[key].type)
                && Helper.isNotEmpty(minor.element[key].type)
            ) {
                major.element[key].type = minor.element[key].type
            }

            if (Helper.isEmpty(major.element[key].minValue)
                && Helper.isNotEmpty(minor.element[key].minValue)
            ) {
                major.element[key].minValue = minor.element[key].minValue
            }

            if (Helper.isEmpty(major.element[key].maxValue)
                && Helper.isNotEmpty(minor.element[key].maxValue)
            ) {
                major.element[key].maxValue = minor.element[key].maxValue
            }
        }

        // Sharpness Value
        for (let key of ['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple']) {
            if (Helper.isEmpty(major.sharpness[key])
                && Helper.isNotEmpty(minor.sharpness[key])
            ) {
                major.sharpness[key] = minor.sharpness[key]
            }
        }

        return Helper.deepCopy(major)
    case 'armors':
        // Format: {
        //     series: { lang },
        //     name: { lang },
        //     rare: null,
        //     type: null,
        //     gender: null,
        //     minDefense: null,
        //     maxDefense: null,
        //     resistence: {
        //         fire: null,
        //         water: null,
        //         thunder: null,
        //         ice: null,
        //         dragon: null
        //     },
        //     slots: [
        //         // {
        //         //     size: null
        //         // }
        //     ],
        //     skills: [
        //         // {
        //         //     name: null,
        //         //     level: null
        //         // }
        //     ]
        // }
        major = mergeNormalValue(major, minor, ['rare', 'type', 'gender', 'minDefense', 'maxDefense'])
        major = mergeTranslateValue(major, minor, lang, ['series', 'name'])
        major = mergeSlotsValue(major, minor)
        major = mergeSkillsValue(major, minor)

        // Resistence Value
        for (let key of ['fire', 'water', 'thunder', 'ice', 'dragon']) {
            if (Helper.isEmpty(major.resistence[key])
                && Helper.isNotEmpty(minor.resistence[key])
            ) {
                major.resistence[key] = minor.resistence[key]
            }
        }

        return Helper.deepCopy(major)
    case 'jewels':
        // Format: {
        //     name: { lang },
        //     rare: null,
        //     size: null,
        //     skills: [
        //         // {
        //         //     name: null,
        //         //     level: null
        //         // }
        //     ]
        // }
        major = mergeNormalValue(major, minor, ['rare', 'size'])
        major = mergeTranslateValue(major, minor, lang, ['name'])
        major = mergeSlotsValue(major, minor)

        return Helper.deepCopy(major)
    case 'petalaces':
        // Format: {
        //     name: { lang },
        //     rare: null,
        //     health: {
        //         increment: null,
        //         obtain: null
        //     },
        //     stamina: {
        //         increment: null,
        //         obtain: null
        //     },
        //     attack: {
        //         increment: null,
        //         obtain: null
        //     },
        //     defense: {
        //         increment: null,
        //         obtain: null
        //     }
        // }
        major = mergeNormalValue(major, minor, ['rare'])
        major = mergeTranslateValue(major, minor, lang, ['name'])

        // Increment & Obtain Value
        for (let key of ['health', 'stamina', 'attack', 'defense']) {
            if (Helper.isEmpty(major[key].increment)
                && Helper.isNotEmpty(minor[key].increment)
            ) {
                major[key].increment = minor[key].increment
            }

            if (Helper.isEmpty(major[key].obtain)
                && Helper.isNotEmpty(minor[key].obtain)
            ) {
                major[key].obtain = minor[key].obtain
            }
        }

        return Helper.deepCopy(major)
    case 'enhances':
        // Format: {
        //     name: { lang },
        //     description: { lang }
        // }
        major = mergeTranslateValue(major, minor, lang, ['name', 'description'])

        return Helper.deepCopy(major)
    case 'skills':
        // Format: {
        //     name: { lang },
        //     description: { lang },
        //     level: null,
        //     effect: { lang }
        // }
        major = mergeNormalValue(major, minor, ['level'])
        major = mergeTranslateValue(major, minor, lang, ['name', 'description', 'effect'])

        return Helper.deepCopy(major)
    default:
        throw 'wrong target'
    }
}

const specialReplaceText = (text, lang, rare) => {
    let replacementList = [

        // kiranico
        { lang: 'zhTW', searchValue: '龍姬的斬擊斧', replaceValue: '龍姬的劍斧' },
        { lang: 'jaJP', searchValue: '風雷合一', replaceValue: '風雷の合一' },
        { lang: 'enUS', searchValue: 'Utsushi Mask (V)', replaceValue: 'Utsushi Mask (Visible)' },
        { lang: 'enUS', searchValue: 'Utsushi Chest (V)', replaceValue: 'Utsushi Chest (Visible)' },
        { lang: 'enUS', searchValue: 'Utsushi Braces (V)', replaceValue: 'Utsushi Braces (Visible)' },
        { lang: 'enUS', searchValue: 'Utsushi Tassets (V)', replaceValue: 'Utsushi Tassets (Visible)' },
        { lang: 'enUS', searchValue: 'Utsushi Greaves (V)', replaceValue: 'Utsushi Greaves (Visible)' },
        { lang: 'enUS', searchValue: 'Utsushi Mask (H)', replaceValue: 'Utsushi Mask (Hidden)' },
        { lang: 'enUS', searchValue: 'Utsushi Chest (H)', replaceValue: 'Utsushi Chest (Hidden)' },
        { lang: 'enUS', searchValue: 'Utsushi Braces (H)', replaceValue: 'Utsushi Braces (Hidden)' },
        { lang: 'enUS', searchValue: 'Utsushi Tassets (H)', replaceValue: 'Utsushi Tassets (Hidden)' },
        { lang: 'enUS', searchValue: 'Utsushi Greaves (H)', replaceValue: 'Utsushi Greaves (Hidden)' },
        { lang: 'enUS', searchValue: 'S. Studded', replaceValue: 'Shell-Studded' },
        { lang: 'enUS', searchValue: 'Shelled', replaceValue: 'Shell-Studded' },
        { lang: 'enUS', searchValue: 'Kadachi Braces S', replaceValue: 'Tobi-Kadachi Braces S' },
        { lang: 'enUS', searchValue: 'Tobi-Tobi-Kadachi Braces S', replaceValue: 'Tobi-Kadachi Braces S' },

        { lang: 'enUS', searchValue: 'Pukei Greaves', replaceValue: 'Pukei-Pukei Greaves' },
        { lang: 'enUS', searchValue: 'Pukei-Pukei-Pukei Greaves', replaceValue: 'Pukei-Pukei Greaves' },

        // gameqb
        { lang: 'zhTW', searchValue: '倪泰裡【面具】', replaceValue: '倪泰裡【蒙面】' },
        { lang: 'zhTW', searchValue: '鎌鼬龍', replaceValue: '鐮鼬龍' },

        // game8
        { lang: 'jaJP', searchValue: 'デスタ', replaceValue: 'テスタ' },
        { lang: 'jaJP', searchValue: 'ブール', replaceValue: 'ブーツ' },
        { lang: 'jaJP', searchValue: 'ウツシ表・覇【覆面】', replaceValue: 'ウツシ表【覆面】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ表・覇【上衣】', replaceValue: 'ウツシ表【上衣】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ表・覇【手甲】', replaceValue: 'ウツシ表【手甲】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ表・覇【腰巻】', replaceValue: 'ウツシ表【腰巻】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ表・覇【脚絆】', replaceValue: 'ウツシ表【脚絆】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ裏・覇【御面】', replaceValue: 'ウツシ裏【御面】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ裏・覇【上衣】', replaceValue: 'ウツシ裏【上衣】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ裏・覇【手甲】', replaceValue: 'ウツシ裏【手甲】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ裏・覇【腰巻】', replaceValue: 'ウツシ裏【腰巻】覇' },
        { lang: 'jaJP', searchValue: 'ウツシ裏・覇【脚絆】', replaceValue: 'ウツシ裏【脚絆】覇' },
        { lang: 'jaJP', searchValue: '切れ味', replaceValue: '斬れ味' },
        { lang: 'jaJP', searchValue: '速射対応【火炎弾】', replaceValue: '速射対応【火炎】' },
        { lang: 'jaJP', searchValue: '速射対応【水冷弾】', replaceValue: '速射対応【水冷】' },
        { lang: 'jaJP', searchValue: '速射対応【電撃弾】', replaceValue: '速射対応【電撃】' },
        { lang: 'jaJP', searchValue: '速射対応【氷結弾】', replaceValue: '速射対応【氷結】' },
        { lang: 'jaJP', searchValue: '速射対応【滅龍弾】', replaceValue: '速射対応【滅龍】' },
        { lang: 'jaJP', searchValue: '龍天盾剣斧ロスドナータ', replaceValue: '龍天剣斧ロスドナータ' },
        { lang: 'jaJP', searchValue: '龍天盾斧棍スカルテバト', replaceValue: '龍天盾斧スカルテバト' },
        { lang: 'jaJP', searchValue: '神源ノ神貫キ', replaceValue: '神源ノ雷貫キ' },
        { lang: 'jaJP', searchValue: '金剛盾斧イカズチ', replaceValue: '金剛盾斧イカヅチ' },
        { lang: 'jaJP', searchValue: 'すがのねの薙刀の巴', replaceValue: 'すがのねの長薙の巴' },
        { lang: 'jaJP', searchValue: 'リムズバルラム', replaceValue: 'リムズパルラム' },
        { lang: 'jaJP', searchValue: 'カーマヒトパーレ', replaceValue: 'カーマヒトバーレ' },

        // fextralife
        { lang: 'enUS', searchValue: 'Visor', replaceValue: 'Vizor' },
        { lang: 'enUS', searchValue: 'Bowwgun', replaceValue: 'Bowgun' },
        { lang: 'enUS', searchValue: 'Wyvern Exploit (Dragon Exploit)', replaceValue: 'Wyvern Exploit' },
        { lang: 'enUS', searchValue: 'Fire Resistance Skill', replaceValue: 'Fire Resistance' },
        { lang: 'enUS', searchValue: 'Ice Resistance Skill', replaceValue: 'Ice Resistance' },
        { lang: 'enUS', searchValue: 'Dragon Resistance Skill', replaceValue: 'Dragon Resistance' },
        { lang: 'enUS', searchValue: 'Water Resistance Skill', replaceValue: 'Water Resistance' },
        { lang: 'enUS', searchValue: 'Thunder Resistance Skill', replaceValue: 'Thunder Resistance' },
        { lang: 'enUS', searchValue: 'Utsushi Mask S (Visible)', replaceValue: 'Utsushi Mask (Visible) S' },
        { lang: 'enUS', searchValue: 'Utsushi Chest S (Visible)', replaceValue: 'Utsushi Chest (Visible) S' },
        { lang: 'enUS', searchValue: 'Utsushi Braces S (Visible)', replaceValue: 'Utsushi Braces (Visible) S' },
        { lang: 'enUS', searchValue: 'Utsushi Tassets S (Visible)', replaceValue: 'Utsushi Tassets (Visible) S' },
        { lang: 'enUS', searchValue: 'Utsushi Greaves S (Visible)', replaceValue: 'Utsushi Greaves (Visible) S' },
        { lang: 'enUS', searchValue: 'Utsushi Mask S (Hidden)', replaceValue: 'Utsushi Mask (Hidden) S' },
        { lang: 'enUS', searchValue: 'Utsushi Chest S (Hidden)', replaceValue: 'Utsushi Chest (Hidden) S' },
        { lang: 'enUS', searchValue: 'Utsushi Braces S (Hidden)', replaceValue: 'Utsushi Braces (Hidden) S' },
        { lang: 'enUS', searchValue: 'Utsushi Tassets S (Hidden)', replaceValue: 'Utsushi Tassets (Hidden) S' },
        { lang: 'enUS', searchValue: 'Utsushi Greaves S (Hidden)', replaceValue: 'Utsushi Greaves (Hidden) S' },
        { lang: 'enUS', searchValue: 'Narwa Breastplate', replaceValue: 'Narwa\'s Breastplate' },
        { lang: 'enUS', searchValue: 'Tetranadon Helm s', replaceValue: 'Tetranadon Helm S' },
        { lang: 'enUS', searchValue: 'Kamura Leggins', replaceValue: 'Kamura Leggings' },
        { lang: 'enUS', searchValue: 'Kamura Niuja Sword', replaceValue: 'Kamura Ninja Sword' },
        { lang: 'enUS', searchValue: 'Royal Ludroth Claw Sword & Shield', replaceValue: 'Royal Ludroth Claw' },
        { lang: 'enUS', searchValue: 'Antecka Rack', replaceValue: 'Anteka Rack' },
        { lang: 'enUS', searchValue: 'Frilled Slah', replaceValue: 'Frilled Slash' },
        { lang: 'enUS', searchValue: 'Azure Elder Long sword', replaceValue: 'Azure Elder Long Sword' },
        { lang: 'enUS', searchValue: 'Yet Hammer', replaceValue: 'Yeti Hammer' },
        { lang: 'enUS', searchValue: 'Teostra\'s Orphee', replaceValue: 'Teostra\'s Orphée' },
        { lang: 'enUS', searchValue: 'Rhenoshasta', replaceValue: 'Rhenohasta' },
        { lang: 'enUS', searchValue: 'Striker\'s Ggunlance', replaceValue: 'Striker\'s Gunlance' },
        { lang: 'enUS', searchValue: 'Admiralls Arbalance', replaceValue: 'Admirall\'s Arbalance' },
        { lang: 'enUS', searchValue: 'Arknalance', replaceValue: 'Araknalance' },
        { lang: 'enUS', searchValue: 'Bone Sgrongarm', replaceValue: 'Bone Strongarm' },
        { lang: 'enUS', searchValue: 'Bone Blade I Charge Blade', replaceValue: 'Bone Blade I' },
        { lang: 'enUS', searchValue: 'Hunter\'s Prodbow', replaceValue: 'Hunter\'s Proudbow' },
        { lang: 'enUS', searchValue: 'Flammenbongen II', replaceValue: 'Flammenbogen II' },
        { lang: 'enUS', searchValue: 'Porifero Bow', replaceValue: 'Porifera Bow' },
        { lang: 'enUS', searchValue: 'Sinsiter Shadow Bolt', replaceValue: 'Sinister Shadow Bolt' },
        { lang: 'enUS', searchValue: 'Arachnid Silversting', replaceValue: 'Arachnid Silverstring' },
        { lang: 'enUS', searchValue: 'Arko Nulu Black', replaceValue: 'Arko Nulo Black' },
        { lang: 'enUS', searchValue: 'Paladire Charge Blade', replaceValue: 'Paladire' },
        { lang: 'enUS', searchValue: 'Grior\'s Landmaker', replaceValue: 'Gríðr\'s Landmaker' },
        { lang: 'enUS', searchValue: 'Admirall\'s Arbalance', replaceValue: 'Admiral\'s Arbalance' },
        { lang: 'enUS', searchValue: 'Rampage C.Blade S', replaceValue: 'Rampage C. Blade S' },
        { lang: 'enUS', searchValue: 'Rampage L.Bowgun S', replaceValue: 'Rampage L. Bowgun S' },

        { lang: 'enUS', searchValue: 'Ibushi\'s Breastplate', replaceValue: 'Ibushi\'s Breastplate S' },
        { lang: 'enUS', searchValue: 'Ibushi\'s Breastplate S S', replaceValue: 'Ibushi\'s Breastplate S' },
        { lang: 'enUS', searchValue: 'Narwa\'s Breastplate', replaceValue: 'Narwa\'s Breastplate S' },
        { lang: 'enUS', searchValue: 'Narwa\'s Breastplate S S', replaceValue: 'Narwa\'s Breastplate S' },
        { lang: 'enUS', searchValue: 'Redwing Glaive', replaceValue: 'Redwing Glaive I' },
        { lang: 'enUS', searchValue: 'Redwing Glaive I I', replaceValue: 'Redwing Glaive I' },
        { lang: 'enUS', searchValue: 'Flammenkanone I Heavy Bowgun', replaceValue: 'Flammenkanone I' },
        { lang: 'enUS', searchValue: 'Flammenkanone II Heavy Bowgun', replaceValue: 'Flammenkanone II' },
        { lang: 'enUS', searchValue: 'Ladybug Morta', replaceValue: 'Ladybug Mortar' },
        { lang: 'enUS', searchValue: 'Ladybug Mortarr', replaceValue: 'Ladybug Mortar' },
        { lang: 'enUS', searchValue: 'Daora\'s Delphinidae', replaceValue: 'Daora\'s Delphinidae I' },
        { lang: 'enUS', searchValue: 'Daora\'s Delphinidae I I', replaceValue: 'Daora\'s Delphinidae I' },

        { lang: 'enUS', searchValue: 'Flammenschild', replaceValue: 'Flammenschild I', rare: 3 },
        { lang: 'enUS', searchValue: 'Flammenschild I I', replaceValue: 'Flammenschild I', rare: 3 },
        { lang: 'enUS', searchValue: 'Flammenschild', replaceValue: 'Flammenschild II', rare: 5 },
        { lang: 'enUS', searchValue: 'Flammenschild II II', replaceValue: 'Flammenschild II', rare: 5 },
        { lang: 'enUS', searchValue: 'Arko Nulo Black', replaceValue: 'Arko Nulo Black I', rare: 6 }
    ]

    for (let item of replacementList) {
        if (lang !== item.lang) {
            continue
        }

        if (-1 !== text.indexOf(item.searchValue)) {
            if (Helper.isNotEmpty(item.rare) && rare !== item.rare) {
                continue
            }

            text = text.replace(item.searchValue, item.replaceValue)
        }
    }

    return text
}

export const arrangeAction = () => {

    // Load Data
    let crawlerDataMapping = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    Object.keys(crawlerDataMapping).forEach((target) => {
        crawlerNameList.forEach((crawlerName) => {
            crawlerDataMapping[target][crawlerName] = []
        })
    })

    for (let crawlerName of crawlerNameList) {
        console.log(`concat:${crawlerName}`)

        // Weapons
        console.log(`concat:${crawlerName}:weapons`)

        let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            crawlerDataMapping.weapons[crawlerName] = weaponList
        } else {
            for (let weaponType of weaponTypeList) {
                let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons/${weaponType}.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    crawlerDataMapping.weapons[crawlerName] = crawlerDataMapping.weapons[crawlerName].concat(weaponList)
                }
            }
        }

        // Armors
        console.log(`concat:${crawlerName}:armors`)

        let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors.csv`)

        if (Helper.isNotEmpty(armorList)) {
            crawlerDataMapping.armors[crawlerName] = armorList
        } else {
            for (let rare of rareList) {
                let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors/${rare}.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    crawlerDataMapping.armors[crawlerName] = crawlerDataMapping.armors[crawlerName].concat(armorList)
                }
            }
        }

        // Others
        for (let target of ['petalaces', 'jewels', 'enhances', 'skills']) {
            console.log(`concat:${crawlerName}:${target}`)

            let targetList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                crawlerDataMapping[target][crawlerName] = targetList
            }
        }
    }

    // Transform Data
    let translateIdMapping = {}
    let arrangeDataMapping = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }
    let untrackDataMapping = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    let majorCrawler = 'kiranico'
    let minorCrawlers = ['gameqb', 'game8', 'fextralife']
    let supportLang = {
        kiranico: ['zhTW', 'jaJP', 'enUS'],
        gameqb: ['zhTW'],
        game8: ['jaJP'],
        fextralife: ['enUS']
    }

    for (let target of Object.keys(arrangeDataMapping)) {

        // Major Crawler Data Init
        console.log(`arrange:${target}:majorCrawler:${majorCrawler}`)

        crawlerDataMapping[target][majorCrawler].forEach((item) => {

            // Special Replace Text
            supportLang[majorCrawler].forEach((lang) => {
                ['series', 'name', 'description', 'effect'].forEach((key) => {
                    if (Helper.isEmpty(item[key]) || Helper.isEmpty(item[key][lang])) {
                        return
                    }

                    item[key][lang] = specialReplaceText(item[key][lang], lang, item.rare)
                })
            })

            let itemId = `${target}:id:${md5(item.name.zhTW)}` // Using zhTW as ID

            supportLang[majorCrawler].forEach((lang) => {
                let translateId = `${target}:name:${lang}:${md5(item.name[lang])}`

                translateIdMapping[translateId] = itemId
            })

            arrangeDataMapping[target][itemId] = item
        })

        // Minor Crawler Data Merge
        minorCrawlers.forEach((minorCrawler) => {
            console.log(`arrange:${target}:minorCrawler:${minorCrawler}`)

            if (Helper.isEmpty(untrackDataMapping[target][minorCrawler])) {
                untrackDataMapping[target][minorCrawler] = []
            }

            crawlerDataMapping[target][minorCrawler].forEach((item) => {

                // Special Replace Text
                supportLang[minorCrawler].forEach((lang) => {
                    ['series', 'name', 'description', 'effect'].forEach((key) => {
                        if (Helper.isEmpty(item[key]) || Helper.isEmpty(item[key][lang])) {
                            return
                        }

                        item[key][lang] = specialReplaceText(item[key][lang], lang, item.rare)
                    })
                })

                supportLang[minorCrawler].forEach((lang) => {
                    let translateId = `${target}:name:${lang}:${md5(item.name[lang])}`

                    if (Helper.isEmpty(translateIdMapping[translateId])) {
                        untrackDataMapping[target][minorCrawler].push(item)

                        return
                    }

                    let itemId = translateIdMapping[translateId]

                    arrangeDataMapping[target][itemId] = mergeItem(target, arrangeDataMapping[target][itemId], item, lang)
                })
            })
        })
    }

    // Save Data
    Helper.cleanFolder(combineRoot)

    Object.keys(arrangeDataMapping).forEach((target) => {
        Helper.saveJSONAsCSV(`${combineRoot}/arrange/${target}.csv`, Object.values(arrangeDataMapping[target]))
    })

    Object.keys(untrackDataMapping).forEach((target) => {
        Object.keys(untrackDataMapping[target]).forEach((crawlerName) => {
            if (0 === untrackDataMapping[target][crawlerName].length) {
                return
            }

            Helper.saveJSONAsCSV(`${combineRoot}/untrack/${crawlerName}/${target}.csv`, untrackDataMapping[target][crawlerName])
        })
    })
}

export const statisticsAction = () => {

    // Generate Result Format
    let result = {
        weapons: {},
        armors: {},
        petalaces: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    result.weapons.all = {}
    result.armors.all = {}
    result.jewels.all = {}

    for (let weaponType of weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = {}

        for (let rare of rareList) {
            result.weapons[weaponType][rare] = {}
        }
    }

    for (let rare of rareList) {
        result.armors[rare] = {}
    }

    for (let size of sizeList) {
        result.jewels[size] = {}
    }

    // Load All Crawler Data
    for (let crawlerName of crawlerNameList) {
        console.log(`count:${crawlerName}`)

        // Weapons
        console.log(`count:${crawlerName}:weapons`)

        let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            result.weapons.all[crawlerName] = weaponList.length

            for (let item of weaponList) {
                let weaponType = item.type

                if (Helper.isEmpty(result.weapons[weaponType].all[crawlerName])) {
                    result.weapons[weaponType].all[crawlerName] = 0
                }

                result.weapons[weaponType].all[crawlerName] += 1

                if (Helper.isNotEmpty(item.rare)) {
                    let rare = `rare${item.rare}`

                    if (Helper.isEmpty(result.weapons[weaponType][rare][crawlerName])) {
                        result.weapons[weaponType][rare][crawlerName] = 0
                    }

                    result.weapons[weaponType][rare][crawlerName] += 1
                }
            }
        } else {
            for (let weaponType of weaponTypeList) {
                let weaponList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/weapons/${weaponType}.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    if (Helper.isEmpty(result.weapons.all[crawlerName])) {
                        result.weapons.all[crawlerName] = 0
                    }

                    if (Helper.isEmpty(result.weapons[weaponType].all[crawlerName])) {
                        result.weapons[weaponType].all[crawlerName] = 0
                    }

                    result.weapons.all[crawlerName] += weaponList.length
                    result.weapons[weaponType].all[crawlerName] += weaponList.length

                    for (let item of weaponList) {
                        if (Helper.isNotEmpty(item.rare)) {
                            let rare = `rare${item.rare}`

                            if (Helper.isEmpty(result.weapons[weaponType][rare])) {
                                console.log(item)
                            }

                            if (Helper.isEmpty(result.weapons[weaponType][rare][crawlerName])) {
                                result.weapons[weaponType][rare][crawlerName] = 0
                            }

                            result.weapons[weaponType][rare][crawlerName] += 1
                        }
                    }
                }
            }
        }

        // Armors
        console.log(`count:${crawlerName}:armors`)

        let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors.csv`)

        if (Helper.isNotEmpty(armorList)) {
            result.armors.all[crawlerName] = armorList.length

            for (let item of armorList) {
                if (Helper.isNotEmpty(item.rare)) {
                    let rare = `rare${item.rare}`

                    if (Helper.isEmpty(result.armors[rare])) {
                        console.log(item)
                    }

                    if (Helper.isEmpty(result.armors[rare][crawlerName])) {
                        result.armors[rare][crawlerName] = 0
                    }

                    result.armors[rare][crawlerName] += 1
                }
            }
        } else {
            for (let rare of rareList) {
                let armorList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/armors/${rare}.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    if (Helper.isEmpty(result.armors.all[crawlerName])) {
                        result.armors.all[crawlerName] = 0
                    }

                    result.armors.all[crawlerName] += armorList.length
                    result.armors[rare][crawlerName] = armorList.length
                }
            }
        }

        // Jewels
        console.log(`count:${crawlerName}:jewels`)

        let jewelList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/jewels.csv`)

        if (Helper.isNotEmpty(jewelList)) {
            result.jewels.all[crawlerName] = jewelList.length

            for (let item of jewelList) {
                if (Helper.isNotEmpty(item.size)) {
                    let size = `size${item.size}`

                    if (Helper.isEmpty(result.jewels[size][crawlerName])) {
                        result.jewels[size][crawlerName] = 0
                    }

                    result.jewels[size][crawlerName] += 1
                }
            }
        }

        // Petalaces, Enhances & Skills
        for (let target of ['petalaces', 'enhances', 'skills']) {
            console.log(`count:${crawlerName}:${target}`)

            let targetList = Helper.loadCSVAsJSON(`${crawlerRoot}/${crawlerName}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                result[target][crawlerName] = targetList.length
            }
        }
    }

    // Result
    for (let target of Object.keys(result)) {
        console.log(target, '=', result[target], '\n')
    }
}

export default {
    arrangeAction,
    statisticsAction
}
