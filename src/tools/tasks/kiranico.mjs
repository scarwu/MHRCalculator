/**
 * Kiranico Crawler
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../liberaries/helper.mjs'
import {
    defaultWeaponItem,
    defaultArmorItem,
    // defaultPetalaceItem,
    defaultDecorationItem,
    defaultSkillItem,
    defaultRampageDecorationItem,
    defaultRampageSkillItem,
    autoExtendListQuantity,
    normalizeText,
    guessArmorType,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const tempRoot = 'temp/crawler/kiranico'

const urls = {
    langs: {
        zhTW: 'https://mhrise.kiranico.com/zh-Hant',
        jaJP: 'https://mhrise.kiranico.com/ja',
        enUS: 'https://mhrise.kiranico.com'
    },
    weapons: {
        greatSword: 'data/weapons?view=0',
        swordAndShield: 'data/weapons?view=1',
        dualBlades: 'data/weapons?view=2',
        longSword: 'data/weapons?view=3',
        hammer: 'data/weapons?view=4',
        huntingHorn: 'data/weapons?view=5',
        lance: 'data/weapons?view=6',
        gunlance: 'data/weapons?view=7',
        switchAxe: 'data/weapons?view=8',
        chargeBlade: 'data/weapons?view=9',
        insectGlaive: 'data/weapons?view=10',
        bow: 'data/weapons?view=11',
        heavyBowgun: 'data/weapons?view=12',
        lightBowgun: 'data/weapons?view=13'
    },
    armors: {
        rare1: 'data/armors?view=0',
        rare2: 'data/armors?view=1',
        rare3: 'data/armors?view=2',
        rare4: 'data/armors?view=3',
        rare5: 'data/armors?view=4',
        rare6: 'data/armors?view=5',
        rare7: 'data/armors?view=6',
        rare8: 'data/armors?view=7',
        rare9: 'data/armors?view=8',
        rare10: 'data/armors?view=9'
    },
    // charms: null,
    // petalaces: null,
    decorations: 'data/decorations',
    skills: 'data/skills',
    rampageDecorations: 'data/rampage-decorations',
    rampageSkills: 'data/rampage-skills',
}

const getFullUrl = (lang, url) => {
    return `${urls.langs[lang]}/${url}`
}

export const fetchWeaponsAction = async (targetWeaponType = null) => {
    let fetchPageUrl = null
    let fetchPageName = null

    for (let weaponType of Object.keys(urls.weapons)) {
        if (Helper.isNotEmpty(targetWeaponType) && targetWeaponType !== weaponType) {
            continue
        }

        let mapping = {}
        let langKeyMapping = {}

        // Fetch List Page
        for (let lang of ['zhTW', 'jaJP', 'enUS']) {
            fetchPageUrl = getFullUrl(lang, urls.weapons[weaponType])
            fetchPageName = `weapons:${weaponType}`

            console.log(fetchPageUrl, fetchPageName)

            let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(listDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let rowIndex = 0; rowIndex < listDom('[x-data=categoryFilter]').find('tbody tr').length; rowIndex++) {
                let rowNode = listDom('[x-data=categoryFilter]').find('tbody tr').eq(rowIndex)

                // Get Data
                let name = normalizeText(rowNode.find('td').eq(1).find('a').text().trim())

                let uniqueKey = rowNode.find('td').eq(1).find('a').attr('href').split('/').pop()

                if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                    langKeyMapping[uniqueKey] = `${weaponType}:${name}`
                }

                let mappingKey = langKeyMapping[uniqueKey]

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(defaultWeaponItem)
                    mapping[mappingKey].series = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].name = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].description = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].type = weaponType

                    // Decoration Slots
                    let slotNode = rowNode.find('td').eq(2).find('span').eq(0).find('img')

                    if (0 !== slotNode.length) {
                        slotNode.each((index, node) => {
                            if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco4.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].slots.push({
                                    size: 4
                                })
                            } else if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco3.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].slots.push({
                                    size: 3
                                })
                            } else if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco2.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].slots.push({
                                    size: 2
                                })
                            } else if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco1.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].slots.push({
                                    size: 1
                                })
                            }
                        })
                    }

                    // Rampage Decoration Slots
                    let rampageSlotNode = rowNode.find('td').eq(2).find('span').eq(1).find('img')

                    if (0 !== rampageSlotNode.length) {
                        rampageSlotNode.each((index, node) => {
                            if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco4.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 4
                                }
                            } else if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco3.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 3
                                }
                            } else if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco2.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 2
                                }
                            } else if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco1.png' === listDom(node).attr('src')) {
                                mapping[mappingKey].rampageSlot = {
                                    size: 1
                                }
                            }
                        })
                    }

                    // Element
                    if ('heavyBowgun' !== weaponType
                        && 'lightBowgun' !== weaponType
                        && 0 !== rowNode.find('td').eq(4).find('img').length
                    ) {
                        rowNode.find('td').eq(4).find('span').each((index, node) => {
                            switch (listDom(node).find('img').attr('src')) {
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType1.png':
                                mapping[mappingKey].element.attack.type = 'fire'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType2.png':
                                mapping[mappingKey].element.attack.type = 'water'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType3.png':
                                mapping[mappingKey].element.attack.type = 'thunder'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType4.png':
                                mapping[mappingKey].element.attack.type = 'ice'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType5.png':
                                mapping[mappingKey].element.attack.type = 'dragon'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType6.png':
                                mapping[mappingKey].element.status.type = 'poison'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType7.png':
                                mapping[mappingKey].element.status.type = 'sleep'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType8.png':
                                mapping[mappingKey].element.status.type = 'paralysis'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType9.png':
                                mapping[mappingKey].element.status.type = 'blast'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            }
                        })
                    }

                    let rare = rowNode.find('td').eq(7).text().trim().replace('Rare', '')
                    let attack = rowNode.find('td').eq(3).text().trim()

                    mapping[mappingKey].rare = parseFloat(rare)
                    mapping[mappingKey].attack = parseFloat(attack)

                    rowNode.find('td').eq(4).find('div').each((index, node) => {
                        let text = listDom(node).eq(0).text()

                        if (-1 !== text.indexOf('會心率')) {
                            let criticalRate = text.replace('會心率', '').replace('+', '').replace('%', '').trim()

                            mapping[mappingKey].criticalRate = (0 !== parseFloat(criticalRate))
                                ? parseFloat(criticalRate) : null

                        } else if (-1 !== text.indexOf('防禦力加成')) {
                            let defense = text.replace('防禦力加成', '').replace('+', '').trim()

                            mapping[mappingKey].defense = (0 !== parseFloat(defense))
                                ? parseFloat(defense) : null
                        }
                    })

                    // Sharpness
                    if ('bow' !== weaponType
                        && 'heavyBowgun' !== weaponType
                        && 'lightBowgun' !== weaponType
                    ) {
                        let sharpnessList = [
                            'red',
                            'orange',
                            'yellow',
                            'green',
                            'blue',
                            'white',
                            'purple'
                        ]

                        // minimum sharpness
                        rowNode.find('td').eq(5).find('svg').eq(0).find('rect').each((index, node) => {
                            let value = parseFloat(listDom(node).attr('width')) * 5

                            if (0 === value) {
                                return
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.minValue)) {
                                mapping[mappingKey].sharpness.minValue = 0
                            }

                            mapping[mappingKey].sharpness.minValue += value
                        })

                        // maximum sharpness
                        rowNode.find('td').eq(5).find('svg').eq(1).find('rect').each((index, node) => {
                            let value = parseFloat(listDom(node).attr('width')) * 5

                            if (0 === value) {
                                return
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.maxValue)) {
                                mapping[mappingKey].sharpness.maxValue = 0
                            }

                            mapping[mappingKey].sharpness.maxValue += value
                            mapping[mappingKey].sharpness.steps[sharpnessList[index]] = value
                        })
                    }
                }

                // Fetch Detail Page
                fetchPageUrl = rowNode.find('td').eq(1).find('a').attr('href')
                fetchPageName = `weapons:${weaponType}:${name}`

                console.log(fetchPageUrl, fetchPageName)

                let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(weaponDom)) {
                    console.log(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                if ('zhTW' === lang) {

                    // RampageSkills
                    weaponDom('table.min-w-full tbody.bg-white').eq(0).find('tr.bg-white').each((index, node) => {
                        let rampageSkillName = normalizeText(weaponDom(node).find('td').eq(1).find('a').text())

                        mapping[mappingKey].rampageSkill.list.push({
                            name: rampageSkillName
                        })
                    })
                }

                let description = weaponDom('.mb-9.space-y-1 > p').eq(1).text()

                mapping[mappingKey].name[lang] = name
                mapping[mappingKey].description[lang] = description
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/weapons/${weaponType}.csv`, list)
    }
}

export const fetchArmorsAction = async (targetArmorRare = null) => {
    for (let armorRare of Object.keys(urls.armors)) {
        if (Helper.isNotEmpty(targetArmorRare) && targetArmorRare !== armorRare) {
            continue
        }

        let mapping = {}
        let langKeyMapping = {}

        // Fetch List Page
        for (let lang of ['zhTW', 'jaJP', 'enUS']) {
            let fetchPageUrl = getFullUrl(lang, urls.armors[armorRare])
            let fetchPageName = `armors:${armorRare}`

            console.log(fetchPageUrl, fetchPageName)

            let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(listDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let rowIndex = 0; rowIndex < listDom('[x-data=categoryFilter]').find('tbody tr').length; rowIndex++) {
                let rowNode = listDom('[x-data=categoryFilter]').find('tbody tr').eq(rowIndex)

                // Get Data
                let name = normalizeText(rowNode.find('td').eq(2).find('a').text().trim())

                // Fetch Detail Page
                fetchPageUrl = rowNode.find('td').eq(2).find('a').attr('href')
                fetchPageName = `armors:${armorRare}:${name}`

                console.log(fetchPageUrl, fetchPageName)

                let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(armorDom)) {
                    console.log(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                let description = armorDom('.mb-9.space-y-1 > p').eq(1).text()

                let uniqueKey = rowNode.find('td').eq(2).find('a').attr('href').split('/').pop()

                if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                    langKeyMapping[uniqueKey] = name
                }

                let mappingKey = langKeyMapping[uniqueKey]

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
                    mapping[mappingKey].series = {}
                    mapping[mappingKey].name = {}
                    mapping[mappingKey].description = {}
                    mapping[mappingKey].gender = null

                    let type = guessArmorType(name)
                    let rare = armorRare.replace('rare', '')
                    let minDefense = rowNode.find('td').eq(4).find('div').eq(0).text().trim()
                    let resistanceFire = rowNode.find('td').eq(4).find('div').eq(1).text().trim()
                    let resistanceWater = rowNode.find('td').eq(4).find('div').eq(2).text().trim()
                    let resistanceIce = rowNode.find('td').eq(5).find('div').eq(0).text().trim()
                    let resistanceThunder = rowNode.find('td').eq(5).find('div').eq(1).text().trim()
                    let resistanceDragon = rowNode.find('td').eq(5).find('div').eq(2).text().trim()

                    mapping[mappingKey].type = type
                    mapping[mappingKey].rare = parseFloat(rare)
                    mapping[mappingKey].minDefense = parseFloat(minDefense)
                    mapping[mappingKey].resistance.fire = parseFloat(resistanceFire)
                    mapping[mappingKey].resistance.water = parseFloat(resistanceWater)
                    mapping[mappingKey].resistance.ice = parseFloat(resistanceIce)
                    mapping[mappingKey].resistance.thunder = parseFloat(resistanceThunder)
                    mapping[mappingKey].resistance.dragon = parseFloat(resistanceDragon)

                    // Slots
                    rowNode.find('td').eq(3).find('img').each((index, node) => {
                        switch(listDom(node).attr('src')) {
                        case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco1.png':
                            mapping[mappingKey].slots.push({
                                size: 1
                            })

                            break
                        case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco2.png':
                            mapping[mappingKey].slots.push({
                                size: 2
                            })

                            break
                        case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco3.png':
                            mapping[mappingKey].slots.push({
                                size: 3
                            })

                            break
                        case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco4.png':
                            mapping[mappingKey].slots.push({
                                size: 4
                            })

                            break
                        }
                    })

                    // Skills
                    rowNode.find('td').eq(6).find('div').each((index, node) => {
                        let skillName = normalizeText(listDom(node).find('a').text())
                        let skillLevel = normalizeText(listDom(node).text()).match(/^(?:.*)(?:Lv|Ｌｖ)(.*)$/)[1].trim()

                        mapping[mappingKey].skills.push({
                            name: skillName,
                            level: parseFloat(skillLevel)
                        })
                    })

                    if (0 < mapping[mappingKey].skills.length) {
                        let skillMapping = {}

                        mapping[mappingKey].skills.forEach((skillItem) => {
                            skillMapping[skillItem.name] = skillItem
                        })

                        mapping[mappingKey].skills = Object.values(skillMapping)
                    }
                }

                mapping[mappingKey].name[lang] = name
                mapping[mappingKey].description[lang] = description
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/armors/${armorRare}.csv`, list)
    }
}

export const fetchDecorationsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, urls.decorations)
        let fetchPageName = 'decorations'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('[x-data=categoryFilter]').find('tbody tr').length; rowIndex++) {
            let rowNode = listDom('[x-data=categoryFilter]').find('tbody tr').eq(rowIndex)

            let matches = ('enUS' === lang)
                ? normalizeText(rowNode.find('td').eq(0).text().trim()).match(/^(.*?)(\d+)$/)
                : normalizeText(rowNode.find('td').eq(0).text().trim()).match(/^(.*?)【(\d+)】$/)

            if (null === matches) {
                continue
            }

            // Get Data
            let name = normalizeText(matches[1].trim())
            let size = matches[2].trim()

            let skillName = normalizeText(rowNode.find('td').eq(1).find('a').text().trim())
            let skillLevel = normalizeText(rowNode.find('td').eq(1).text().trim()).match(/^(?:.*)(?:Lv|Ｌｖ)(.*)$/)[1].trim()

            let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()

            if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                langKeyMapping[uniqueKey] = name
            }

            let mappingKey = langKeyMapping[uniqueKey]

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultDecorationItem)
                mapping[mappingKey].name = {}
                mapping[mappingKey].rare = null
                mapping[mappingKey].size = parseFloat(size)
                mapping[mappingKey].skills.push({
                    name: skillName,
                    level: parseFloat(skillLevel)
                })
            }

            mapping[mappingKey].name[lang] = name
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/decorations.csv`, Object.values(mapping))
}

export const fetchSkillsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, urls.skills)
        let fetchPageName = 'skills'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('[x-data=categoryFilter]').find('tbody tr').length; rowIndex++) {
            let rowNode = listDom('[x-data=categoryFilter]').find('tbody tr').eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let description = null

            rowNode.find('td').eq(1).find('p').each((index, node) => {
                if (0 === index) {
                    description = normalizeText(listDom(node).text())

                    return
                }

                let matches = listDom(node).text().trim().match(/^(?:Lv|Ｌｖ)( ?\d+)(.*)$/)

                if (null === matches) {
                    return
                }

                let level = matches[1].trim()
                let effect = normalizeText(matches[2].trim())

                let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()

                if (Helper.isEmpty(langKeyMapping[`${uniqueKey}:${level}`])) {
                    langKeyMapping[`${uniqueKey}:${level}`] = `${name}:${level}`
                }

                let mappingKey = langKeyMapping[`${uniqueKey}:${level}`]

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(defaultSkillItem)
                    mapping[mappingKey].name = {}
                    mapping[mappingKey].description = {}
                    mapping[mappingKey].level = parseFloat(level)
                    mapping[mappingKey].effect = {}
                }

                mapping[mappingKey].name[lang] = name
                mapping[mappingKey].description[lang] = description
                mapping[mappingKey].effect[lang] = effect
            })
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/skills.csv`, Object.values(mapping))
}

export const fetchRampageDecorationsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, urls.rampageDecorations)
        let fetchPageName = 'rampageDecorations'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('[x-data=categoryFilter]').find('tbody tr').length; rowIndex++) {
            let rowNode = listDom('[x-data=categoryFilter]').find('tbody tr').eq(rowIndex)

            let matches = ('enUS' === lang)
                ? normalizeText(rowNode.find('td').eq(0).text().trim()).match(/^(.*?)(\d+)$/)
                : normalizeText(rowNode.find('td').eq(0).text().trim()).match(/^(.*?)【(\d+)】$/)

            if (null === matches) {
                continue
            }

            // Get Data
            let name = normalizeText(matches[1].trim())
            let size = matches[2].trim()

            let skillName = normalizeText(rowNode.find('td').eq(1).find('a').text().trim())

            let uniqueKey = rowNode.find('td').eq(1).find('a').attr('href').split('/').pop()

            if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                langKeyMapping[uniqueKey] = name
            }

            let mappingKey = langKeyMapping[uniqueKey]

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultRampageDecorationItem)
                mapping[mappingKey].name = {}
                mapping[mappingKey].rare = null
                mapping[mappingKey].size = parseFloat(size)
                mapping[mappingKey].skill = {
                    name: skillName
                }
            }

            mapping[mappingKey].name[lang] = name
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/rampageDecorations.csv`, Object.values(mapping))
}

export const fetchRampageSkillsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, urls.rampageSkills)
        let fetchPageName = 'rampageSkills'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('[x-data=categoryFilter]').find('tbody tr').length; rowIndex++) {
            let rowNode = listDom('[x-data=categoryFilter]').find('tbody tr').eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).text().trim())
            let description = normalizeText(rowNode.find('td').eq(1).text().trim())

            let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()

            if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                langKeyMapping[uniqueKey] = name
            }

            let mappingKey = langKeyMapping[uniqueKey]

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultRampageSkillItem)
                mapping[mappingKey].name = {}
                mapping[mappingKey].description = {}
            }

            mapping[mappingKey].name[lang] = name
            mapping[mappingKey].description[lang] = description
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/rampageSkills.csv`, Object.values(mapping))
}

export const infoAction = () => {

    // Generate Result Format
    let result = {
        weapons: {},
        armors: {},
        decorations: {},
        skills: {},
        rampageDecorations: {},
        rampageSkills: {}
    }

    result.weapons.all = null
    result.armors.all = null
    result.decorations.all = null

    for (let weaponType of weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = null

        for (let rare of rareList) {
            result.weapons[weaponType][rare] = null
        }
    }

    for (let rare of rareList) {
        result.armors[rare] = null
    }

    for (let size of sizeList) {
        result.decorations[size] = null
    }

    // Weapons
    for (let weaponType of weaponTypeList) {
        let weaponList = Helper.loadCSVAsJSON(`${tempRoot}/weapons/${weaponType}.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            if (Helper.isEmpty(result.weapons.all)) {
                result.weapons.all = 0
            }

            if (Helper.isEmpty(result.weapons[weaponType].all)) {
                result.weapons[weaponType].all = 0
            }

            result.weapons.all += weaponList.length
            result.weapons[weaponType].all += weaponList.length

            for (let item of weaponList) {
                if (Helper.isNotEmpty(item.rare)) {
                    let rare = `rare${item.rare}`

                    if (Helper.isEmpty(result.weapons[weaponType][rare])) {
                        result.weapons[weaponType][rare] = 0
                    }

                    result.weapons[weaponType][rare] += 1
                }
            }
        }
    }

    // Armors
    for (let rare of rareList) {
        let armorList = Helper.loadCSVAsJSON(`${tempRoot}/armors/${rare}.csv`)

        if (Helper.isNotEmpty(armorList)) {
            if (Helper.isEmpty(result.armors.all)) {
                result.armors.all = 0
            }

            result.armors.all += armorList.length
            result.armors[rare] = armorList.length
        }
    }

    // Decorations
    let decorationList = Helper.loadCSVAsJSON(`${tempRoot}/decorations.csv`)

    if (Helper.isNotEmpty(decorationList)) {
        result.decorations.all = decorationList.length

        for (let item of decorationList) {
            if (Helper.isNotEmpty(item.size)) {
                let size = `size${item.size}`

                if (Helper.isEmpty(result.decorations[size])) {
                    result.decorations[size] = 0
                }

                result.decorations[size] += 1
            }
        }
    }

    // Skills, RampageDecorations & RampageSkills
    for (let target of ['skills', 'rampageDecorations', 'rampageSkills']) {
        let targetList = Helper.loadCSVAsJSON(`${tempRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target] = targetList.length
        }
    }

    // Result
    console.log(result)
}

export const fetchAllAction = () => {
    Promise.all([
        fetchWeaponsAction(),
        fetchArmorsAction(),
        fetchDecorationsAction(),
        fetchSkillsAction(),
        fetchRampageDecorationsAction(),
        fetchRampageSkillsAction()
    ]).then(() => {
        infoAction()
    })
}

export default {
    fetchAllAction,
    fetchWeaponsAction,
    fetchArmorsAction,
    fetchDecorationsAction,
    fetchSkillsAction,
    fetchRampageDecorationsAction,
    fetchRampageSkillsAction,
    infoAction
}
