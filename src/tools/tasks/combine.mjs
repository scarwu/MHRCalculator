/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

import Helper from '../liberaries/helper.mjs'
import {
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

const mergeEnhancesValue = (major, minor) => {
    let enhanceMaxIndex = 0

    if (Helper.isNotEmpty(major.enhances)) {
        enhanceMaxIndex = (major.enhances.length > enhanceMaxIndex) ? major.enhances.length : enhanceMaxIndex
    }

    if (Helper.isNotEmpty(minor.enhances)) {
        enhanceMaxIndex = (minor.enhances.length > enhanceMaxIndex) ? minor.enhances.length : enhanceMaxIndex
    }

    if (0 !== enhanceMaxIndex) {
        if (Helper.isEmpty(major.enhances)) {
            major.enhances = []
        }

        if (Helper.isEmpty(minor.enhances)) {
            minor.enhances = []
        }

        for (let index = 0; index < enhanceMaxIndex; index++) {
            if (Helper.isEmpty(major.enhances[index])) {
                major.enhances[index] = {}
            }

            if (Helper.isEmpty(minor.enhances[index])) {
                minor.enhances[index] = {}
            }

            if (Helper.isEmpty(major.enhances[index].name)
                && Helper.isNotEmpty(minor.enhances[index].name)
            ) {
                major.enhances[index].name = minor.enhances[index].name
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
        major = mergeEnhancesValue(major, minor)

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

function arrange() {

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
    let minorCrawlers = ['gameqb', 'game8']
    let supportLang = {
        kiranico: ['zhTW', 'jaJP', 'enUS'],
        gameqb: ['zhTW'],
        game8: ['jaJP']
    }

    const specialReplaceText = (text, lang) => {
        let replacementList = [

            // kiranico
            {lang: 'jaJP', searchValue: '風雷合一', replaceValue: '風雷の合一'},
            {lang: 'zhTW', searchValue: '龍姬的斬擊斧', replaceValue: '龍姬的劍斧'},

            // gameqb
            {lang: 'zhTW', searchValue: '倪泰裡【面具】', replaceValue: '倪泰裡【蒙面】'},
            {lang: 'zhTW', searchValue: '鎌鼬龍', replaceValue: '鐮鼬龍'},

            // game8
            {lang: 'jaJP', searchValue: 'デスタ', replaceValue: 'テスタ'},
            {lang: 'jaJP', searchValue: 'ブール', replaceValue: 'ブーツ'},
            {lang: 'jaJP', searchValue: 'ウツシ表・覇【覆面】', replaceValue: 'ウツシ表【覆面】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ表・覇【上衣】', replaceValue: 'ウツシ表【上衣】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ表・覇【手甲】', replaceValue: 'ウツシ表【手甲】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ表・覇【腰巻】', replaceValue: 'ウツシ表【腰巻】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ表・覇【脚絆】', replaceValue: 'ウツシ表【脚絆】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ裏・覇【御面】', replaceValue: 'ウツシ裏【御面】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ裏・覇【上衣】', replaceValue: 'ウツシ裏【上衣】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ裏・覇【手甲】', replaceValue: 'ウツシ裏【手甲】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ裏・覇【腰巻】', replaceValue: 'ウツシ裏【腰巻】覇'},
            {lang: 'jaJP', searchValue: 'ウツシ裏・覇【脚絆】', replaceValue: 'ウツシ裏【脚絆】覇'},
            {lang: 'jaJP', searchValue: '切れ味', replaceValue: '斬れ味'},
            {lang: 'jaJP', searchValue: '速射対応【火炎弾】', replaceValue: '速射対応【火炎】'},
            {lang: 'jaJP', searchValue: '速射対応【水冷弾】', replaceValue: '速射対応【水冷】'},
            {lang: 'jaJP', searchValue: '速射対応【電撃弾】', replaceValue: '速射対応【電撃】'},
            {lang: 'jaJP', searchValue: '速射対応【氷結弾】', replaceValue: '速射対応【氷結】'},
            {lang: 'jaJP', searchValue: '速射対応【滅龍弾】', replaceValue: '速射対応【滅龍】'},
            {lang: 'jaJP', searchValue: '龍天盾剣斧ロスドナータ', replaceValue: '龍天剣斧ロスドナータ'},
            {lang: 'jaJP', searchValue: '龍天盾斧棍スカルテバト', replaceValue: '龍天盾斧スカルテバト'},
            {lang: 'jaJP', searchValue: '神源ノ神貫キ', replaceValue: '神源ノ雷貫キ'},
            {lang: 'jaJP', searchValue: '金剛盾斧イカズチ', replaceValue: '金剛盾斧イカヅチ'},
            {lang: 'jaJP', searchValue: 'すがのねの薙刀の巴', replaceValue: 'すがのねの長薙の巴'},
            {lang: 'jaJP', searchValue: 'リムズバルラム', replaceValue: 'リムズパルラム'},
            {lang: 'jaJP', searchValue: 'カーマヒトパーレ', replaceValue: 'カーマヒトバーレ'}
        ]

        for (let item of replacementList) {
            if (lang !== item.lang) {
                continue
            }

            if (-1 !== text.indexOf(item.searchValue)) {
                text = text.replace(item.searchValue, item.replaceValue)
            }
        }

        return text
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


                    item[key][lang] = specialReplaceText(item[key][lang], lang)
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

                        item[key][lang] = specialReplaceText(item[key][lang], lang)
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

function statistics() {

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
    arrange,
    statistics
}
