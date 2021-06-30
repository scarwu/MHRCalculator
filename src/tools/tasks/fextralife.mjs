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
    // defaultPetalace,
    defaultJewel,
    defaultEnhance,
    defaultSkill,
    autoExtendListQuantity,
    normalizeText,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const fileRoot = 'temp/crawler/fextralife'

const urls = {
    domain: 'https://monsterhunterrise.wiki.fextralife.com',
    weapons: { // https://monsterhunterrise.wiki.fextralife.com/Weapons
        greatSword: 'https://monsterhunterrise.wiki.fextralife.com/Great+Sword',
        swordAndShield: 'https://monsterhunterrise.wiki.fextralife.com/Sword+&+Shield',
        dualBlades: 'https://monsterhunterrise.wiki.fextralife.com/Dual+Blades',
        longSword: 'https://monsterhunterrise.wiki.fextralife.com/Long+Sword',
        hammer: 'https://monsterhunterrise.wiki.fextralife.com/Hammer',
        huntingHorn: 'https://monsterhunterrise.wiki.fextralife.com/Hunting+Horn',
        lance: 'https://monsterhunterrise.wiki.fextralife.com/Lance',
        gunlance: 'https://monsterhunterrise.wiki.fextralife.com/Gunlance',
        switchAxe: 'https://monsterhunterrise.wiki.fextralife.com/Switch+Axe',
        chargeBlade: 'https://monsterhunterrise.wiki.fextralife.com/Charge+Blade',
        insectGlaive: 'https://monsterhunterrise.wiki.fextralife.com/Insect+Glaive',
        bow: 'https://monsterhunterrise.wiki.fextralife.com/Bow',
        heavyBowgun: 'https://monsterhunterrise.wiki.fextralife.com/Heavy+Bowgun',
        lightBowgun: 'https://monsterhunterrise.wiki.fextralife.com/Light+Bowgun'
    },
    armors: 'https://monsterhunterrise.wiki.fextralife.com/Armor',
    // charms: 'https://monsterhunterrise.wiki.fextralife.com/Talismans',
    // petalaces: 'https://monsterhunterrise.wiki.fextralife.com/Petalace',
    jewels: 'https://monsterhunterrise.wiki.fextralife.com/Decorations',
    enhances: 'https://monsterhunterrise.wiki.fextralife.com/Ramp-Up+Skills',
    skills: 'https://monsterhunterrise.wiki.fextralife.com/Skills'
}

// async function fetchWeapons() {
//     let fetchPageUrl = null
//     let fetchPageName = null

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

//                 let name = normalizeText(itemNode.text().trim())

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

//                 let series = normalizeText(weaponDom('h3#hm_1').text().replace('の性能まとめ', ''))

//                 for (let subIndex = 0; subIndex < weaponDom('.a-table').length; subIndex++) {
//                     let subNode = weaponDom('.a-table').eq(subIndex)

//                     if ('レア度' !== subNode.find('tbody tr').eq(0).find('th').eq(0).text()) {
//                         continue
//                     }

//                     let subName = normalizeText(subNode.find('b.a-bold').text())

//                     if (name !== subName) {
//                         continue
//                     }

//                     mappingKey = `${series}:${name}`

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
//                             name: normalizeText(weaponDom(node).text())
//                         })
//                     })

//                     mapping[mappingKey].series = {
//                         enUS: series
//                     }
//                     mapping[mappingKey].name = {
//                         enUS: name
//                     }
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

//         let list = autoExtendListQuantity(Object.values(mapping))

//         Helper.saveJSONAsCSV(`${fileRoot}/weapons/${weaponType}.csv`, list)
//     }
// }

async function fetchArmors() {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.armors
    fetchPageName = 'armors'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('div.tabcontent h4 a.wiki_link.wiki_tooltip').length; rowIndex++) {
        let rowNode = listDom('div.tabcontent h4 a.wiki_link.wiki_tooltip').eq(rowIndex)

        let series = rowNode.text()

        // Fetch Detail Page
        fetchPageUrl = urls.domain + rowNode.attr('href')
        fetchPageName = `armors:${series}`

        console.log(fetchPageUrl, fetchPageName)

        let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(armorDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        let rare = armorDom('table.wiki_table').eq(0).find('tbody tr').eq(2).find('td').eq(1).text().replace('Rarity ', '')

        for (let rowIndex = 0; rowIndex < armorDom('table.wiki_table').eq(1).find('tbody tr').length; rowIndex++) {
            let rowNode = armorDom('table.wiki_table').eq(1).find('tbody tr').eq(rowIndex)

            let name = rowNode.find('td').eq(0).find('a').text()
            let minDefense = rowNode.find('td').eq(1).text()
            let resistenceFire = rowNode.find('td').eq(3).text()
            let resistenceWater = rowNode.find('td').eq(4).text()
            let resistenceThunder = rowNode.find('td').eq(5).text()
            let resistenceIce = rowNode.find('td').eq(6).text()
            let resistenceDragon = rowNode.find('td').eq(7).text()

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
            }

            mapping[mappingKey].series = {
                enUS: series
            }
            mapping[mappingKey].name = {
                enUS: name
            }
            mapping[mappingKey].gender = null
            mapping[mappingKey].rare = parseFloat(rare)
            mapping[mappingKey].minDefense = parseFloat(minDefense)
            mapping[mappingKey].resistence.fire = parseFloat(resistenceFire)
            mapping[mappingKey].resistence.water = parseFloat(resistenceWater)
            mapping[mappingKey].resistence.thunder = parseFloat(resistenceThunder)
            mapping[mappingKey].resistence.ice = parseFloat(resistenceIce)
            mapping[mappingKey].resistence.dragon = parseFloat(resistenceDragon)

            rowNode.find('td').eq(2).find('img').each((index, node) => {
                if ('/file/Monster-Hunter-Rise/gem_level_3_icon_monster_hunter_rise_wiki_guide_24px.png' === armorDom(node).attr('img')) {
                    mapping[mappingKey].slots.push({
                        size: 3
                    })
                } else if ('/file/Monster-Hunter-Rise/gem_level_2_icon_monster_hunter_rise_wiki_guide_24px.png' === armorDom(node).attr('img')) {
                    mapping[mappingKey].slots.push({
                        size: 2
                    })
                } else if ('/file/Monster-Hunter-Rise/gem_level_1_icon_monster_hunter_rise_wiki_guide_24px.png' === armorDom(node).attr('img')) {
                    mapping[mappingKey].slots.push({
                        size: 1
                    })
                }
            })

            let typeImgSrc = armorDom('table.wiki_table').eq(0).find('tbody tr').eq(7 + rowIndex).find('td').eq(0).find('img').attr('src')

            if ('/file/Monster-Hunter-Rise/helm-headgear-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'helm'
            } else if ('/file/Monster-Hunter-Rise/torso-chest-plate-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'chest'
            } else if ('/file/Monster-Hunter-Rise/arms-gauntlets-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'arm'
            } else if ('/file/Monster-Hunter-Rise/waist-belt-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'waist'
            } else if ('/file/Monster-Hunter-Rise/feet-boots-greaves-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'leg'
            }

            armorDom('table.wiki_table').eq(0).find('tbody tr').eq(7 + rowIndex).find('td').eq(1).find('a').each((index, node) => {
                console.log(name, armorDom(node).text())
                // console.log(armorDom(node))

                mapping[mappingKey].skills.push({
                    name: armorDom(node).text(),
                    level: parseInt(armorDom(node)[0].next.data.replace('x', ''))
                })
            })
        }
    }

    let list = autoExtendListQuantity(Object.values(mapping))

    Helper.saveJSONAsCSV(`${fileRoot}/armors.csv`, list)
}

async function fetchJewels() {
    let fetchPageUrl = null
    let fetchPageName = null

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

    for (let rowIndex = 1; rowIndex < listDom('table.wiki_table tbody tr').length; rowIndex++) {
        let rowNode = listDom('table.wiki_table tbody tr').eq(rowIndex)

        // Get Data
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim()).match(/^(.*?) \d$/)[1]
        let size = rowNode.find('td').eq(1).text().trim().match(/^\((\d)\)$/)[1]
        let rare = rowNode.find('td').eq(2).text().trim().replace('Rarity ', '')
        let skillName = normalizeText(rowNode.find('td').eq(3).find('a').text().trim())

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultJewel)
        }

        mapping[mappingKey].name = {
            enUS: name
        }
        mapping[mappingKey].rare = parseFloat(rare)
        mapping[mappingKey].size = parseFloat(size)
        mapping[mappingKey].skills.push({
            name: skillName,
            level: 1
        })
    }

    Helper.saveJSONAsCSV(`${fileRoot}/jewels.csv`, Object.values(mapping))
}

async function fetchEnhances() {
    let fetchPageUrl = null
    let fetchPageName = null

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

    for (let rowIndex = 1; rowIndex < listDom('table.wiki_table tbody tr').length; rowIndex++) {
        let rowNode = listDom('table.wiki_table tbody tr').eq(rowIndex)

        // Get Data
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
        let description = rowNode.find('td').eq(1).text().trim()

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultEnhance)
        }

        mapping[mappingKey].name = {
            enUS: name
        }
        mapping[mappingKey].description = {
            enUS: description
        }
    }

    Helper.saveJSONAsCSV(`${fileRoot}/enhances.csv`, Object.values(mapping))
}

async function fetchSkills() {
    let fetchPageUrl = null
    let fetchPageName = null

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

    for (let rowIndex = 1; rowIndex < listDom('table.wiki_table tbody tr').length; rowIndex++) {
        let rowNode = listDom('table.wiki_table tbody tr').eq(rowIndex)

        // Get Data
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
        let description = rowNode.find('td').eq(1).text().trim()

        for (let skillIndex = 0; skillIndex < rowNode.find('td').eq(3).find('li').length; skillIndex++) {
            let skillNode = rowNode.find('td').eq(3).find('li').eq(skillIndex)

            // Get Data
            let tempText = skillNode.text().trim().replace(/ /g, ' ')

            let level = tempText.match(/^Level (\d)\: (.*?)$/)[1]
            let effect = tempText.match(/^Level (\d)\: (.*?)$/)[2]

            mappingKey = `${name}:${level}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultSkill)
            }

            mapping[mappingKey].name = {
                enUS: name
            }
            mapping[mappingKey].description = {
                enUS: description
            }
            mapping[mappingKey].level = parseFloat(level)
            mapping[mappingKey].effect = {
                enUS: effect
            }
        }
    }

    Helper.saveJSONAsCSV(`${fileRoot}/skills.csv`, Object.values(mapping))
}

// function statistics() {

//     // Generate Result Format
//     let result = {
//         weapons: {},
//         armors: {},
//         petalaces: {},
//         jewels: {},
//         enhances: {},
//         skills: {}
//     }

//     result.weapons.all = null
//     result.armors.all = null
//     result.jewels.all = null

//     for (let weaponType of weaponTypeList) {
//         result.weapons[weaponType] = {}
//         result.weapons[weaponType].all = null

//         for (let rare of rareList) {
//             result.weapons[weaponType][rare] = null
//         }
//     }

//     for (let rare of rareList) {
//         result.armors[rare] = null
//     }

//     for (let size of sizeList) {
//         result.jewels[size] = null
//     }

//     // Weapons
//     let weaponList = Helper.loadCSVAsJSON(`${fileRoot}/weapons.csv`)

//     if (Helper.isNotEmpty(weaponList)) {
//         result.weapons.all = weaponList.length

//         for (let item of weaponList) {
//             let weaponType = item.type

//             if (Helper.isEmpty(result.weapons[weaponType].all)) {
//                 result.weapons[weaponType].all = 0
//             }

//             result.weapons[weaponType].all += 1

//             if (Helper.isNotEmpty(item.rare)) {
//                 let rare = `rare${item.rare}`

//                 if (Helper.isEmpty(result.weapons[weaponType][rare])) {
//                     result.weapons[weaponType][rare] = 0
//                 }

//                 result.weapons[weaponType][rare] += 1
//             }
//         }
//     } else {
//         for (let weaponType of weaponTypeList) {
//             let weaponList = Helper.loadCSVAsJSON(`${fileRoot}/weapons/${weaponType}.csv`)

//             if (Helper.isNotEmpty(weaponList)) {
//                 if (Helper.isEmpty(result.weapons.all)) {
//                     result.weapons.all = 0
//                 }

//                 if (Helper.isEmpty(result.weapons[weaponType].all)) {
//                     result.weapons[weaponType].all = 0
//                 }

//                 result.weapons.all += weaponList.length
//                 result.weapons[weaponType].all += weaponList.length

//                 for (let item of weaponList) {
//                     if (Helper.isNotEmpty(item.rare)) {
//                         let rare = `rare${item.rare}`

//                         if (Helper.isEmpty(result.weapons[weaponType][rare])) {
//                             result.weapons[weaponType][rare] = 0
//                         }

//                         result.weapons[weaponType][rare] += 1
//                     }
//                 }
//             }
//         }
//     }

//     // Armors
//     let armorList = Helper.loadCSVAsJSON(`${fileRoot}/armors.csv`)

//     if (Helper.isNotEmpty(armorList)) {
//         result.armors.all = armorList.length

//         for (let item of armorList) {
//             if (Helper.isNotEmpty(item.rare)) {
//                 let rare = `rare${item.rare}`

//                 if (Helper.isEmpty(result.armors[rare])) {
//                     result.armors[rare] = 0
//                 }

//                 result.armors[rare] += 1
//             }
//         }
//     } else {
//         for (let rare of rareList) {
//             let armorList = Helper.loadCSVAsJSON(`${fileRoot}/armors/${rare}.csv`)

//             if (Helper.isNotEmpty(armorList)) {
//                 if (Helper.isEmpty(result.armors.all)) {
//                     result.armors.all = 0
//                 }

//                 result.armors.all += armorList.length
//                 result.armors[rare] = armorList.length
//             }
//         }
//     }

//     // Jewels
//     let jewelList = Helper.loadCSVAsJSON(`${fileRoot}/jewels.csv`)

//     if (Helper.isNotEmpty(jewelList)) {
//         result.jewels.all = jewelList.length

//         for (let item of jewelList) {
//             if (Helper.isNotEmpty(item.size)) {
//                 let size = `size${item.size}`

//                 if (Helper.isEmpty(result.jewels[size])) {
//                     result.jewels[size] = 0
//                 }

//                 result.jewels[size] += 1
//             }
//         }
//     }

//     // Petalaces, Enhances & Skills
//     for (let target of ['petalaces', 'enhances', 'skills']) {
//         let targetList = Helper.loadCSVAsJSON(`${fileRoot}/${target}.csv`)

//         if (Helper.isNotEmpty(targetList)) {
//             result[target] = targetList.length
//         }
//     }

//     // Result
//     console.log(result)
// }

function fetchAll() {
    Promise.all([
        // fetchWeapons(),
        fetchArmors(),
        fetchJewels(),
        fetchEnhances(),
        fetchSkills()
    ]).then(() => {
        // statistics()
    })
}

export default {
    fetchAll,
    // fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchEnhances,
    fetchSkills,
    // statistics
}
