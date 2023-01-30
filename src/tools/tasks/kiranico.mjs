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
    defaultJewelItem,
    defaultEnhanceItem,
    defaultSkillItem,
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
    jewels: 'data/decorations',
    enhances: 'data/rampage-skills',
    skills: 'data/skills'
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
        let mappingKey = null

        let langKeyMapping = {}

        // Fetch List Page
        fetchPageUrl = getFullUrl('zhTW', urls.weapons[weaponType])
        fetchPageName = `weapons:${weaponType}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
            let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(1).find('a').text().trim())

            mappingKey = `${weaponType}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultWeaponItem)
            }

            mapping[mappingKey].series = {
                zhTW: null,
                jaJP: null,
                enUS: null
            }
            mapping[mappingKey].name = {
                zhTW: name,
                jaJP: null,
                enUS: null
            }
            mapping[mappingKey].type = weaponType

            // Slots
            let slotNode = rowNode.find('td').eq(1).find('img')

            if (0 !== slotNode.length) {
                slotNode.each((index, node) => {
                    if ('https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco3.png' === listDom(node).attr('src')) {
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

            // Element
            if ('heavyBowgun' !== weaponType
                && 'lightBowgun' !== weaponType
                && 0 !== rowNode.find('td').eq(4).find('img').length
            ) {
                rowNode.find('td').eq(4).find('img').each((index, node) => {
                    switch (listDom(node).attr('src')) {
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType1.png':
                        mapping[mappingKey].element.attack.type = 'fire'
                        mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType2.png':
                        mapping[mappingKey].element.attack.type = 'water'
                        mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType3.png':
                        mapping[mappingKey].element.attack.type = 'thunder'
                        mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType4.png':
                        mapping[mappingKey].element.attack.type = 'ice'
                        mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType5.png':
                        mapping[mappingKey].element.attack.type = 'dragon'
                        mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType6.png':
                        mapping[mappingKey].element.status.type = 'poison'
                        mapping[mappingKey].element.status.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType7.png':
                        mapping[mappingKey].element.status.type = 'sleep'
                        mapping[mappingKey].element.status.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType8.png':
                        mapping[mappingKey].element.status.type = 'paralysis'
                        mapping[mappingKey].element.status.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType9.png':
                        mapping[mappingKey].element.status.type = 'blast'
                        mapping[mappingKey].element.status.minValue = parseFloat(listDom(node)[0].next.data.trim())

                        break
                    }
                })
            }

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
                rowNode.find('td').eq(5).find('div.flex div.flex').eq(0).find('div').each((index, node) => {
                    let value = parseFloat(listDom(node).css('width').replace('px', '')) * 5

                    if (0 === value) {
                        return
                    }

                    if (Helper.isEmpty(mapping[mappingKey].sharpness.minValue)) {
                        mapping[mappingKey].sharpness.minValue = 0
                    }

                    mapping[mappingKey].sharpness.minValue += value
                })

                // maximum sharpness
                rowNode.find('td').eq(5).find('div.flex div.flex').eq(1).find('div').each((index, node) => {
                    let value = parseFloat(listDom(node).css('width').replace('px', '')) * 5

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

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(1).find('a').attr('href')
            fetchPageName = `weapons:${weaponType}:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(weaponDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Set Lang Mapping
            let uniqueKey = fetchPageUrl.split('/').pop()
            langKeyMapping[uniqueKey] = mappingKey

            let rare = weaponDom('dl.grid dd').eq(2).text().trim()
            let attack = weaponDom('dl.grid dd').eq(6).text().trim()
            let criticalRate = weaponDom('dl.grid dd').eq(7).text().trim()
            let defense = weaponDom('dl.grid dd').eq(8).text().trim()

            mapping[mappingKey].rare = parseFloat(rare) + 1 // special fix
            mapping[mappingKey].attack = parseFloat(attack)
            mapping[mappingKey].criticalRate = (0 !== parseFloat(criticalRate))
                ? parseFloat(criticalRate) : null
            mapping[mappingKey].defense = (0 !== parseFloat(defense))
                ? parseFloat(defense) : null

            // Enhances
            weaponDom('table.min-w-full tbody.bg-white').eq(0).find('tr.bg-white').each((index, node) => {
                let enhanceName = normalizeText(weaponDom(node).find('td').eq(1).find('a').text())

                mapping[mappingKey].enhance.list.push({
                    name: enhanceName
                })
            })
        }

        // Get Other Lang
        for (let lang of ['jaJP', 'enUS']) {
            fetchPageUrl = getFullUrl(lang, urls.weapons[weaponType])
            fetchPageName = `weapons:${weaponType}:${lang}`

            console.log(fetchPageUrl, fetchPageName)

            listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(listDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
                let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

                // Set Lang Mapping
                let uniqueKey = rowNode.find('td').eq(1).find('a').attr('href').split('/').pop()
                let mappingKey = langKeyMapping[uniqueKey]

                mapping[mappingKey].name[lang] = normalizeText(rowNode.find('td').eq(1).find('a').text().trim())
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/weapons/${weaponType}.csv`, list)
    }
}

export const fetchArmorsAction = async (targetArmorRare = null) => {
    let fetchPageUrl = null
    let fetchPageName = null

    for (let armorRare of Object.keys(urls.armors)) {
        if (Helper.isNotEmpty(targetArmorRare) && targetArmorRare !== armorRare) {
            continue
        }

        let mapping = {}
        let mappingKey = null

        let langKeyMapping = {}

        // Fetch List Page
        fetchPageUrl = getFullUrl('zhTW', urls.armors[armorRare])
        fetchPageName = `armors:${armorRare}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
            let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

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

            let series = normalizeText(armorDom('dl.grid dd').eq(2).text().trim())

            mappingKey = `${series}:${name}`

            // Set Lang Mapping
            let uniqueKey = fetchPageUrl.split('/').pop()
            langKeyMapping[uniqueKey] = mappingKey

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
            }

            mapping[mappingKey].series = {
                zhTW: null,
                jaJP: null,
                enUS: null
            }
            mapping[mappingKey].name = {
                zhTW: name,
                jaJP: null,
                enUS: null
            }
            mapping[mappingKey].gender = null

            let rare = armorDom('dl.grid dd').eq(5).text().trim()
            let minDefense = armorDom('dl.grid dd').eq(11).text().trim()
            let resistanceFire = armorDom('dl.grid dd').eq(12).text().trim()
            let resistanceWater = armorDom('dl.grid dd').eq(13).text().trim()
            let resistanceIce = armorDom('dl.grid dd').eq(14).text().trim()
            let resistanceThunder = armorDom('dl.grid dd').eq(15).text().trim()
            let resistanceDragon = armorDom('dl.grid dd').eq(16).text().trim()
            let type = guessArmorType(name)

            mapping[mappingKey].type = type // special fix
            mapping[mappingKey].rare = parseFloat(rare) + 1 // special fix
            mapping[mappingKey].minDefense = parseFloat(minDefense)
            mapping[mappingKey].resistance.fire = parseFloat(resistanceFire)
            mapping[mappingKey].resistance.water = parseFloat(resistanceWater)
            mapping[mappingKey].resistance.thunder = parseFloat(resistanceThunder)
            mapping[mappingKey].resistance.ice = parseFloat(resistanceIce)
            mapping[mappingKey].resistance.dragon = parseFloat(resistanceDragon)

            // Slots
            JSON.parse(armorDom('dl.grid dd').eq(19).text()).forEach((slotCount, index) => {
                if (0 === slotCount) {
                    return
                }

                let size = index + 1

                for (let count = 0; count < slotCount; count++) {
                    mapping[mappingKey].slots.push({
                        size: size
                    })
                }
            })

            // Skills
            armorDom('table.min-w-full tbody.bg-white').eq(0).find('tr.bg-white').each((index, node) => {
                let skillName = normalizeText(armorDom(node).find('td').eq(0).find('a').text())

                mapping[mappingKey].skills.push({
                    name: skillName,
                    level: null
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

        // Get Other Lang
        for (let lang of ['jaJP', 'enUS']) {
            fetchPageUrl = getFullUrl(lang, urls.armors[armorRare])
            fetchPageName = `armors:${armorRare}:${lang}`

            console.log(fetchPageUrl, fetchPageName)

            listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(listDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
                let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

                // Set Lang Mapping
                let uniqueKey = rowNode.find('td').eq(2).find('a').attr('href').split('/').pop()
                let mappingKey = langKeyMapping[uniqueKey]

                mapping[mappingKey].name[lang] = normalizeText(rowNode.find('td').eq(2).find('a').text().trim())
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/armors/${armorRare}.csv`, list)
    }
}

export const fetchJewelsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    let langKeyMapping = {}

    // Fetch List Page
    fetchPageUrl = getFullUrl('zhTW', urls.jewels)
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
        let name = normalizeText(rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(\d+)】$/)[1])
        let size = rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(\d+)】$/)[2]
        let skillName = normalizeText(rowNode.find('td').eq(1).find('a').text().trim())

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultJewelItem)
        }

        // Set Lang Mapping
        let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()
        langKeyMapping[uniqueKey] = mappingKey

        mapping[mappingKey].name = {
            zhTW: name,
            jaJP: null,
            enUS: null
        }
        mapping[mappingKey].rare = null
        mapping[mappingKey].size = parseFloat(size)
        mapping[mappingKey].skills.push({
            name: skillName,
            level: 1
        })
    }

    // Get Other Lang
    for (let lang of ['jaJP', 'enUS']) {
        fetchPageUrl = getFullUrl(lang, urls.jewels)
        fetchPageName = `jewels:${lang}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
            let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

            // Get Data
            let name = ('enUS' === lang)
                ? normalizeText(rowNode.find('td').eq(0).text().trim().match(/^(.*?)( \d+)$/)[1])
                : normalizeText(rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(.+)】$/)[1])

            // Set Lang Mapping
            let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()
            let mappingKey = langKeyMapping[uniqueKey]

            mapping[mappingKey].name[lang] = name
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/jewels.csv`, Object.values(mapping))
}

export const fetchEnhancesAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    let langKeyMapping = {}

    // Fetch List Page
    fetchPageUrl = getFullUrl('zhTW', urls.enhances)
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
        let name = normalizeText(rowNode.find('a p').eq(0).text().trim())
        let description = normalizeText(rowNode.find('a p').eq(1).text().trim())

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultEnhanceItem)
        }

        // Set Lang Mapping
        let uniqueKey = rowNode.find('a').attr('href').split('/').pop()
        langKeyMapping[uniqueKey] = mappingKey

        mapping[mappingKey].name = {
            zhTW: name,
            jaJP: null,
            enUS: null
        }
        mapping[mappingKey].description = {
            zhTW: description,
            jaJP: null,
            enUS: null
        }
    }

    // Get Other Lang
    for (let lang of ['jaJP', 'enUS']) {
        fetchPageUrl = getFullUrl(lang, urls.enhances)
        fetchPageName = `enhances:${lang}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('ul.relative li.bg-white').length; rowIndex++) {
            let rowNode = listDom('ul.relative li.bg-white').eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('a p').eq(0).text().trim())
            let description = normalizeText(rowNode.find('a p').eq(1).text().trim())

            // Set Lang Mapping
            let uniqueKey = rowNode.find('a').attr('href').split('/').pop()
            let mappingKey = langKeyMapping[uniqueKey]

            mapping[mappingKey].name[lang] = name
            mapping[mappingKey].description[lang] = description
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/enhances.csv`, Object.values(mapping))
}

export const fetchSkillsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    let langKeyMapping = {}

    // Fetch List Page
    fetchPageUrl = getFullUrl('zhTW', urls.skills)
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
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
        let description = null

        rowNode.find('td').eq(2).find('div').each((index, node) => {
            if (0 === index) {
                description = normalizeText(listDom(node).text())

                return
            }

            let level = listDom(node).text().trim().match(/^(\d+)\: (.*)$/)[1]
            let effect = normalizeText(listDom(node).text().trim().match(/^(\d+)\: (.*)$/)[2])

            mappingKey = `${name}:${level}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultSkillItem)
            }

            // Set Lang Mapping
            let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()
            langKeyMapping[`${uniqueKey}:${level}`] = mappingKey

            mapping[mappingKey].name = {
                zhTW: name,
                jaJP: null,
                enUS: null
            }
            mapping[mappingKey].description = {
                zhTW: description,
                jaJP: null,
                enUS: null
            }
            mapping[mappingKey].level = parseFloat(level)
            mapping[mappingKey].effect = {
                zhTW: effect,
                jaJP: null,
                enUS: null
            }
        })
    }

    // Get Other Lang
    for (let lang of ['jaJP', 'enUS']) {
        fetchPageUrl = getFullUrl(lang, urls.skills)
        fetchPageName = `skills:${lang}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.min-w-full tbody.bg-white tr.bg-white').length; rowIndex++) {
            let rowNode = listDom('table.min-w-full tbody.bg-white tr.bg-white').eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let description = null

            rowNode.find('td').eq(2).find('div').each((index, node) => {
                if (0 === index) {
                    description = normalizeText(listDom(node).text())

                    return
                }

                let level = listDom(node).text().trim().match(/^(\d+)\: (.*)$/)[1]
                let effect = normalizeText(listDom(node).text().trim().match(/^(\d+)\: (.*)$/)[2])

                let uniqueKey = rowNode.find('td').eq(0).find('a').attr('href').split('/').pop()
                let mappingKey = langKeyMapping[`${uniqueKey}:${level}`]

                mapping[mappingKey].name[lang] = name
                mapping[mappingKey].description[lang] = description
                mapping[mappingKey].effect[lang] = effect
            })
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/skills.csv`, Object.values(mapping))
}

export const infoAction = () => {

    // Generate Result Format
    let result = {
        weapons: {},
        armors: {},
        jewels: {},
        enhances: {},
        skills: {}
    }

    result.weapons.all = null
    result.armors.all = null
    result.jewels.all = null

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
        result.jewels[size] = null
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

    // Jewels
    let jewelList = Helper.loadCSVAsJSON(`${tempRoot}/jewels.csv`)

    if (Helper.isNotEmpty(jewelList)) {
        result.jewels.all = jewelList.length

        for (let item of jewelList) {
            if (Helper.isNotEmpty(item.size)) {
                let size = `size${item.size}`

                if (Helper.isEmpty(result.jewels[size])) {
                    result.jewels[size] = 0
                }

                result.jewels[size] += 1
            }
        }
    }

    // Enhances & Skills
    for (let target of ['enhances', 'skills']) {
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
        fetchJewelsAction(),
        fetchEnhancesAction(),
        fetchSkillsAction()
    ]).then(() => {
        infoAction()
    })
}

export default {
    fetchAllAction,
    fetchWeaponsAction,
    fetchArmorsAction,
    fetchJewelsAction,
    fetchEnhancesAction,
    fetchSkillsAction,
    infoAction
}
