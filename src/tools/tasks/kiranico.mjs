/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../liberaries/helper.mjs'
import {
    defaultWeapon,
    defaultArmor,
    defaultJewel,
    defaultPetalace,
    defaultEnhance,
    defaultSkill,
    autoExtendCols,
    formatName
} from '../liberaries/mh.mjs'

const crawlerRoot = 'temp/crawler/kiranico'

const urls = {
    weapons: {
        greatSword: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=0',
        swordAndShield: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=1',
        dualBlades: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=2',
        longSword: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=3',
        hammer: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=4',
        huntingHorn: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=5',
        lance: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=6',
        gunlance: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=7',
        switchAxe: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=8',
        chargeBlade: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=9',
        insectGlaive: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=10',
        bow: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=11',
        heavyBowgun: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=12',
        lightBowgun: 'https://mhrise.kiranico.com/zh-Hant/data/weapons?scope=wp&value=13'
    },
    armors: {
        rare1: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=0',
        rare2: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=1',
        rare3: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=2',
        rare4: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=3',
        rare5: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=4',
        rare6: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=5',
        rare7: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=6',
        rare8: 'https://mhrise.kiranico.com/zh-Hant/data/armors?scope=rarity&value=7',
    },
    skills: 'https://mhrise.kiranico.com/zh-Hant/data/skills',
    jewels: 'https://mhrise.kiranico.com/zh-Hant/data/decorations',
    charms: null,
    petalaces: null,
    enhances: 'https://mhrise.kiranico.com/zh-Hant/data/rampage-skills'
}

let fetchPageUrl = null
let fetchPageName = null

// async function fetchWeapons() {
//     let targetWeaponType = null

//     if (Helper.isNotEmpty(process.argv[4]) && Helper.isNotEmpty(urls.weapons[process.argv[4]])) {
//         targetWeaponType = process.argv[4]
//     }

//     for (let weaponType of Object.keys(urls.weapons)) {
//         if (Helper.isNotEmpty(targetWeaponType) && targetWeaponType !== weaponType) {
//             continue
//         }

//         let mapping = {}
//         let mappingKey = null

//         // Fetch List Page
//         fetchPageUrl = urls.weapons[weaponType]
//         fetchPageName = `weapons:${weaponType}`

//         console.log(fetchPageUrl, fetchPageName)

//         let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

//         if (Helper.isEmpty(listDom)) {
//             console.log(fetchPageUrl, fetchPageName, 'Err')

//             return
//         }

//         // Get Exists Header Ids
//         let mhIds = []

//         listDom('h3.a-header--3').each((index, node) => {
//             let mhId = listDom(node).attr('id')

//             if (Helper.isNotEmpty(mhId) && '' !== mhId) {
//                 mhIds.push(mhId)
//             }
//         })

//         for (let mdId of mhIds) {
//             console.log(listDom(`#${mdId}`).text())

//             for (let itemIndex = 0; itemIndex < listDom(`#${mdId} + table tbody tr`).find('.a-link').length; itemIndex++) {
//                 let itemNode = listDom(`#${mdId} + table tbody tr`).find('.a-link').eq(itemIndex)

//                 let name = formatName(itemNode.text().trim())

//                 // Fetch Detail Page
//                 fetchPageUrl = itemNode.attr('href')
//                 fetchPageName = `weapons:${weaponType}:${name}`

//                 // Fix Path Url
//                 if (/^\/mhrise\d+$/.test(fetchPageUrl)) {
//                     fetchPageUrl = fetchPageUrl.replace('/mhrise', '/mhrise/')
//                 }

//                 if (/^\/mhrise\/\d+$/.test(fetchPageUrl)) {
//                     fetchPageUrl = `https://game8.jp${fetchPageUrl}`
//                 }

//                 console.log(fetchPageUrl, fetchPageName)

//                 let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

//                 if (Helper.isEmpty(weaponDom)) {
//                     console.log(fetchPageUrl, fetchPageName, 'Err')

//                     return
//                 }

//                 let serial = weaponDom('h3#hm_1').text().replace('の性能まとめ', '')

//                 for (let subIndex = 0; subIndex < weaponDom('.a-table').length; subIndex++) {
//                     let subNode = weaponDom('.a-table').eq(subIndex)

//                     if ('レア度' !== subNode.find('tbody tr').eq(0).find('th').eq(0).text()) {
//                         continue
//                     }

//                     let subName = formatName(subNode.find('b.a-bold').text())

//                     if (name !== subName) {
//                         continue
//                     }

//                     mappingKey = `${serial}:${name}`

//                     if (Helper.isEmpty(mapping[mappingKey])) {
//                         mapping[mappingKey] = Helper.deepCopy(defaultWeapon)
//                     }

//                     let rare = subNode.find('tbody tr').eq(1).find('td').eq(0).text()
//                     let attack = subNode.find('tbody tr').eq(1).find('td').eq(1).text()
//                     let criticalRate = subNode.find('tbody tr').eq(1).find('td').eq(2).text()
//                     let element = subNode.find('tbody tr').eq(3).find('td').eq(0).text()
//                     let defense = subNode.find('tbody tr').eq(3).find('td').eq(2).text()

//                     // Element
//                     if ('--' !== element) {
//                         let elements = []
//                         let match = null

//                         match = element.match(/^(.+?)\/(.+?)(\d+)\/(\d+)/)

//                         if (Helper.isNotEmpty(match)) {
//                             elements.push({
//                                 type: match[1],
//                                 value: match[3],
//                                 match: match
//                             })

//                             elements.push({
//                                 type: match[2],
//                                 value: match[4],
//                                 match: match
//                             })
//                         } else {
//                             match = element.match(/^(.+?)((?:\-|\+)?\d+)/)

//                             if (Helper.isNotEmpty(match)) {
//                                 elements.push({
//                                     type: match[1],
//                                     value: match[2],
//                                     match: match
//                                 })
//                             }
//                         }

//                         elements.forEach((element) => {
//                             switch (element.type) {
//                             case '火':
//                                 mapping[mappingKey].element.attack.type = 'fire'
//                                 mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

//                                 break
//                             case '水':
//                                 mapping[mappingKey].element.attack.type = 'water'
//                                 mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

//                                 break
//                             case '雷':
//                                 mapping[mappingKey].element.attack.type = 'thunder'
//                                 mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

//                                 break
//                             case '氷':
//                                 mapping[mappingKey].element.attack.type = 'ice'
//                                 mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

//                                 break
//                             case '龍':
//                                 mapping[mappingKey].element.attack.type = 'dragon'
//                                 mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

//                                 break
//                             case '睡眠':
//                                 mapping[mappingKey].element.status.type = 'sleep'
//                                 mapping[mappingKey].element.status.minValue = parseFloat(element.value)

//                                 break
//                             case '麻痹':
//                             case '麻痺':
//                                 mapping[mappingKey].element.status.type = 'paralysis'
//                                 mapping[mappingKey].element.status.minValue = parseFloat(element.value)

//                                 break
//                             case '爆破':
//                                 mapping[mappingKey].element.status.type = 'blast'
//                                 mapping[mappingKey].element.status.minValue = parseFloat(element.value)

//                                 break
//                             case '毒':
//                                 mapping[mappingKey].element.status.type = 'poison'
//                                 mapping[mappingKey].element.status.minValue = parseFloat(element.value)

//                                 break
//                             default:
//                                 console.log('no match property', match)

//                                 break
//                             }
//                         })
//                     }

//                     // Slot
//                     subNode.find('tbody tr').eq(3).find('td').eq(1).text().split('').forEach((slotSize) => {
//                         if ('③' === slotSize) {
//                             mapping[mappingKey].slots.push({
//                                 size: 3
//                             })
//                         } else if ('②' === slotSize) {
//                             mapping[mappingKey].slots.push({
//                                 size: 2
//                             })
//                         } else if ('①' === slotSize) {
//                             mapping[mappingKey].slots.push({
//                                 size: 1
//                             })
//                         }
//                     })

//                     // Enhances
//                     let enhanceRowIndex = 4

//                     if ('lightBowgun' === weaponType || 'heavyBowgun' === weaponType) {
//                         enhanceRowIndex = 7
//                     }

//                     subNode.find('tbody tr').eq(enhanceRowIndex).find('a').each((index, node) => {
//                         mapping[mappingKey].enhances.push({
//                             name: formatName(weaponDom(node).text())
//                         })
//                     })

//                     mapping[mappingKey].serial = serial
//                     mapping[mappingKey].name = name
//                     mapping[mappingKey].type = weaponType
//                     mapping[mappingKey].rare = parseFloat(rare)
//                     mapping[mappingKey].attack = parseFloat(attack)
//                     mapping[mappingKey].defense = ('-' !== defense)
//                         ? parseFloat(defense) : null
//                     mapping[mappingKey].criticalRate = (0 !== parseFloat(criticalRate))
//                         ? parseFloat(criticalRate) : null
//                 }
//             }
//         }

//         let list = autoExtendCols(Object.values(mapping))

//         Helper.saveJSONAsCSV(`${crawlerRoot}/weapons/${weaponType}.csv`, list)
//     }
// }

// async function fetchArmors() {
//     let mapping = {}
//     let mappingKey = null

//     // Fetch List Page
//     fetchPageUrl = urls.armors
//     fetchPageName = 'armors'

//     console.log(fetchPageUrl, fetchPageName)

//     let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

//     if (Helper.isEmpty(listDom)) {
//         console.log(fetchPageUrl, fetchPageName, 'Err')

//         return
//     }

//     const replaceName = (text) => {
//         let specialWordMapping = {
//             'スカルダ/スパイオS': 'スカルダS/スパイオS',
//             'スカルダ/スパイオSテスタ': 'スカルダSテスタ/スパイオSテスタ',
//             'スカルダ/スパイオSペット': 'スカルダSペット/スパイオSペット',
//             'スカルダ/スパイオSマーノ': 'スカルダSマーノ/スパイオSマーノ',
//             'スカルダ/スパイオSアンカ': 'スカルダSアンカ/スパイオSアンカ',
//             'スカルダ/スパイオSガンバ': 'スカルダSガンバ/スパイオSガンバ',
//         }

//         if (Helper.isNotEmpty(specialWordMapping[text])) {
//             text = specialWordMapping[text]
//         }

//         return text.replace('デスタ', 'テスタ')
//     }

//     for (let tableIndex = 1; tableIndex <= 2; tableIndex++) {
//         for (let rowIndex = 0; rowIndex < listDom(`#hm_${tableIndex} + table tbody td`).length; rowIndex++) {
//             let rowNode = listDom(`#hm_${tableIndex} + table tbody td`).eq(rowIndex)

//             // Get Data
//             let serials = replaceName(rowNode.eq(0).find('a').text().trim()).split('/')

//             for (let entry of Object.entries(serials)) {
//                 let serialIndex = parseFloat(entry[0])
//                 let serial = entry[1]
//                 let gender = 'general'

//                 if (2 === serials.length) {
//                     if (0 === serialIndex) {
//                         gender = 'male'
//                     }

//                     if (1 === serialIndex) {
//                         gender = 'female'
//                     }
//                 }

//                 // Fetch Detail Page
//                 fetchPageUrl = rowNode.eq(0).find('a').attr('href')
//                 fetchPageName = serial

//                 console.log(fetchPageUrl, fetchPageName)

//                 let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

//                 if (Helper.isEmpty(armorDom)) {
//                     console.log(fetchPageUrl, fetchPageName, 'Err')

//                     return
//                 }

//                 for (let h3Index = 0; h3Index < armorDom('h3.a-header--3').length; h3Index++) {
//                     let header = armorDom('h3.a-header--3').eq(h3Index).text().trim()
//                     let hmId = armorDom('h3.a-header--3').eq(h3Index).attr('id')

//                     if ('スキル・スロット' === header) {
//                         for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length; armorIndex++) {
//                             let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

//                             // Get Data
//                             let name = replaceName(armorNode.find('td').eq(0).text().trim())

//                             if (2 === serials.length) {
//                                 name = name.split('/')[serialIndex]
//                             }

//                             mappingKey = `${serial}:${name}`

//                             if (Helper.isEmpty(mapping[mappingKey])) {
//                                 mapping[mappingKey] = Helper.deepCopy(defaultArmor)
//                             }

//                             mapping[mappingKey].serial = serial
//                             mapping[mappingKey].name = name
//                             mapping[mappingKey].gender = gender

//                             armorNode.find('td').eq(1).find('a').each((index, node) => {
//                                 let skillName = armorDom(node).text()
//                                 let skillLevel = armorDom(node)[0].next.data.replace('Lv.', '')

//                                 mapping[mappingKey].skills.push({
//                                     name: skillName,
//                                     level: parseFloat(skillLevel)
//                                 })
//                             })

//                             // Slots
//                             armorNode.find('td').eq(2).text().trim().split('').forEach((slotSize) => {
//                                 if ('③' === slotSize) {
//                                     mapping[mappingKey].slots.push({
//                                         size: 3
//                                     })
//                                 } else if ('②' === slotSize) {
//                                     mapping[mappingKey].slots.push({
//                                         size: 2
//                                     })
//                                 } else if ('①' === slotSize) {
//                                     mapping[mappingKey].slots.push({
//                                         size: 1
//                                     })
//                                 }
//                             })
//                         }
//                     }

//                     if ('防御力' === header) {
//                         for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
//                             let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

//                             // Get Data
//                             let type = armorNode.find('td').eq(0).find('.align').text().trim()
//                             let name = replaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim())
//                             let minDefense = armorNode.find('td').eq(1).text().trim()
//                             let maxDefense = (3 === armorNode.find('td').length)
//                                 ? armorNode.find('td').eq(2).text().trim() : null

//                             if (2 === serials.length) {
//                                 name = name.split('/')[serialIndex]
//                             }

//                             switch (type) {
//                             case '頭':
//                                 type = 'helm'

//                                 break
//                             case '胴':
//                                 type = 'chest'

//                                 break
//                             case '腕':
//                                 type = 'arm'

//                                 break
//                             case '腰':
//                                 type = 'waist'

//                                 break
//                             case '脚':
//                                 type = 'leg'

//                                 break
//                             }

//                             mappingKey = `${serial}:${name}`

//                             if (Helper.isEmpty(mapping[mappingKey])) {
//                                 mapping[mappingKey] = Helper.deepCopy(defaultArmor)
//                             }

//                             mapping[mappingKey].type = type
//                             mapping[mappingKey].minDefense = parseFloat(minDefense)
//                             mapping[mappingKey].maxDefense = Helper.isNotEmpty(maxDefense)
//                                 ? parseFloat(maxDefense) : null
//                         }
//                     }

//                     if ('属性耐性' === header) {
//                         for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
//                             let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

//                             // Get Data
//                             let type = armorNode.find('td').eq(0).find('.align').text().trim()
//                             let name = replaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim())
//                             let resistenceFire = armorNode.find('td').eq(1).text().trim()
//                             let resistenceWater = armorNode.find('td').eq(2).text().trim()
//                             let resistenceThunder = armorNode.find('td').eq(3).text().trim()
//                             let resistenceIce = armorNode.find('td').eq(4).text().trim()
//                             let resistenceDragon = armorNode.find('td').eq(5).text().trim()

//                             if (2 === serials.length) {
//                                 name = name.split('/')[serialIndex]
//                             }

//                             switch (type) {
//                             case '頭':
//                                 type = 'helm'

//                                 break
//                             case '胴':
//                                 type = 'chest'

//                                 break
//                             case '腕':
//                                 type = 'arm'

//                                 break
//                             case '腰':
//                                 type = 'waist'

//                                 break
//                             case '脚':
//                                 type = 'leg'

//                                 break
//                             }

//                             mappingKey = `${serial}:${name}`

//                             if (Helper.isEmpty(mapping[mappingKey])) {
//                                 mapping[mappingKey] = Helper.deepCopy(defaultArmor)
//                             }

//                             mapping[mappingKey].type = type
//                             mapping[mappingKey].resistence.fire = parseFloat(resistenceFire)
//                             mapping[mappingKey].resistence.water = parseFloat(resistenceWater)
//                             mapping[mappingKey].resistence.thunder = parseFloat(resistenceThunder)
//                             mapping[mappingKey].resistence.ice = parseFloat(resistenceIce)
//                             mapping[mappingKey].resistence.dragon = parseFloat(resistenceDragon)
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     let list = autoExtendCols(Object.values(mapping))

//     Helper.saveJSONAsCSV(`${crawlerRoot}/armors.csv`, list)
// }

async function fetchJewels() {
    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.jewels
    fetchPageName = 'jewels'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
        let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

        // Get Data
        let name = rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(\d+)】$/)[1]
        let slotSize = rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(\d+)】$/)[2]
        let skillName = rowNode.find('td').eq(1).find('a').text().trim()

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultJewel)
        }

        mapping[mappingKey].name = name
        mapping[mappingKey].rare = null
        mapping[mappingKey].slot.size = parseFloat(slotSize)
        mapping[mappingKey].skill.name = skillName
        mapping[mappingKey].skill.level = 1
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/jewels.csv`, Object.values(mapping))
}

async function fetchSkills() {
    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.skills
    fetchPageName = 'skills'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
        let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

        // Get Data
        let name = rowNode.find('td').eq(0).text().trim()
        let description = null

        rowNode.find('td').eq(2).find('div').each((index, node) => {
            if (0 === index) {
                description = listDom(node).text()

                return
            }

            let level = listDom(node).text().split(' ')[0].trim()
            let effect = listDom(node).text().split(' ')[1].trim()

            mappingKey = `${name}:${level}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultSkill)
            }

            mapping[mappingKey].name = name
            mapping[mappingKey].description = description
            mapping[mappingKey].level = parseFloat(level)
            mapping[mappingKey].effect = effect
        })
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/skills.csv`, Object.values(mapping))
}

async function fetchEnhances() {
    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.enhances
    fetchPageName = 'enhances'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('ul.relative li.bg-white').length; rowIndex++) {
        let rowNode = listDom('ul.relative li.bg-white').eq(rowIndex)

        // Get Data
        let name = formatName(rowNode.find('a p').eq(0).text().trim())
        let description = rowNode.find('a p').eq(1).text().trim()

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultEnhance)
        }

        mapping[mappingKey].name = name
        mapping[mappingKey].description = description
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/enhances.csv`, Object.values(mapping))
}

function statistics() {
    for (let weaponType of Object.keys(urls.weapons)) {
        let list = Helper.loadCSVAsJSON(`${crawlerRoot}/weapons/${weaponType}.csv`)

        console.log(`weapons:${weaponType} (${list.length})`)
    }

    for (let target of ['armors', 'jewels', 'skills', 'enhances']) {
        let list = Helper.loadCSVAsJSON(`${crawlerRoot}/${target}.csv`)

        console.log(`${target} (${list.length})`)
    }
}

function fetchAll() {
    // fetchWeapons()
    // fetchArmors()
    fetchJewels()
    fetchSkills()
    fetchEnhances()
}

export default {
    fetchAll,
    // fetchWeapons,
    // fetchArmors,
    fetchJewels,
    fetchSkills,
    fetchEnhances,
    statistics
}
