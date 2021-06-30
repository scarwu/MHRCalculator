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
    autoExtendCols,
    normalizeText,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const fileRoot = 'temp/crawler/game8'

const urls = {
    weapons: {
        greatSword: 'https://game8.jp/mhrise/369823',
        swordAndShield: 'https://game8.jp/mhrise/369825',
        dualBlades: 'https://game8.jp/mhrise/369826',
        longSword: 'https://game8.jp/mhrise/369824',
        hammer: 'https://game8.jp/mhrise/369827',
        huntingHorn: 'https://game8.jp/mhrise/369828',
        lance: 'https://game8.jp/mhrise/369829',
        gunlance: 'https://game8.jp/mhrise/369830',
        switchAxe: 'https://game8.jp/mhrise/369831',
        chargeBlade: 'https://game8.jp/mhrise/369832',
        insectGlaive: 'https://game8.jp/mhrise/369833',
        bow: 'https://game8.jp/mhrise/369836',
        heavyBowgun: 'https://game8.jp/mhrise/369835',
        lightBowgun: 'https://game8.jp/mhrise/369834'
    },
    armors: 'https://game8.jp/mhrise/363845',
    // charms: null,
    // petalaces: null,
    jewels: 'https://game8.jp/mhrise/363846',
    enhances: 'https://game8.jp/mhrise/382391',
    skills: 'https://game8.jp/mhrise/363848'
}

async function fetchWeapons() {
    let fetchPageUrl = null
    let fetchPageName = null

    let targetWeaponType = null

    if (Helper.isNotEmpty(process.argv[4]) && Helper.isNotEmpty(urls.weapons[process.argv[4]])) {
        targetWeaponType = process.argv[4]
    }

    for (let weaponType of Object.keys(urls.weapons)) {
        if (Helper.isNotEmpty(targetWeaponType) && targetWeaponType !== weaponType) {
            continue
        }

        let mapping = {}
        let mappingKey = null

        // Fetch List Page
        fetchPageUrl = urls.weapons[weaponType]
        fetchPageName = `weapons:${weaponType}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        // Get Exists Header Ids
        let mhIds = []

        listDom('h3.a-header--3').each((index, node) => {
            let mhId = listDom(node).attr('id')

            if (Helper.isNotEmpty(mhId) && '' !== mhId) {
                mhIds.push(mhId)
            }
        })

        for (let mdId of mhIds) {
            console.log(listDom(`#${mdId}`).text())

            for (let itemIndex = 0; itemIndex < listDom(`#${mdId} + table tbody tr`).find('.a-link').length; itemIndex++) {
                let itemNode = listDom(`#${mdId} + table tbody tr`).find('.a-link').eq(itemIndex)

                let name = normalizeText(itemNode.text().trim())

                // Fetch Detail Page
                fetchPageUrl = itemNode.attr('href')
                fetchPageName = `weapons:${weaponType}:${name}`

                // Fix Path Url
                if (/^\/mhrise\d+$/.test(fetchPageUrl)) {
                    fetchPageUrl = fetchPageUrl.replace('/mhrise', '/mhrise/')
                }

                if (/^\/mhrise\/\d+$/.test(fetchPageUrl)) {
                    fetchPageUrl = `https://game8.jp${fetchPageUrl}`
                }

                console.log(fetchPageUrl, fetchPageName)

                let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(weaponDom)) {
                    console.log(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                let series = normalizeText(weaponDom('h3#hm_1').text().replace('の性能まとめ', ''))

                for (let subIndex = 0; subIndex < weaponDom('.a-table').length; subIndex++) {
                    let subNode = weaponDom('.a-table').eq(subIndex)

                    if ('レア度' !== subNode.find('tbody tr').eq(0).find('th').eq(0).text()) {
                        continue
                    }

                    let subName = normalizeText(subNode.find('b.a-bold').text())

                    if (name !== subName) {
                        continue
                    }

                    mappingKey = `${series}:${name}`

                    if (Helper.isEmpty(mapping[mappingKey])) {
                        mapping[mappingKey] = Helper.deepCopy(defaultWeapon)
                    }

                    let rare = subNode.find('tbody tr').eq(1).find('td').eq(0).text()
                    let attack = subNode.find('tbody tr').eq(1).find('td').eq(1).text()
                    let criticalRate = subNode.find('tbody tr').eq(1).find('td').eq(2).text()
                    let element = subNode.find('tbody tr').eq(3).find('td').eq(0).text()
                    let defense = subNode.find('tbody tr').eq(3).find('td').eq(2).text()

                    // Element
                    if ('--' !== element) {
                        let elements = []
                        let match = null

                        match = element.match(/^(.+?)\/(.+?)(\d+)\/(\d+)/)

                        if (Helper.isNotEmpty(match)) {
                            elements.push({
                                type: match[1],
                                value: match[3],
                                match: match
                            })

                            elements.push({
                                type: match[2],
                                value: match[4],
                                match: match
                            })
                        } else {
                            match = element.match(/^(.+?)((?:\-|\+)?\d+)/)

                            if (Helper.isNotEmpty(match)) {
                                elements.push({
                                    type: match[1],
                                    value: match[2],
                                    match: match
                                })
                            }
                        }

                        elements.forEach((element) => {
                            switch (element.type) {
                            case '火':
                                mapping[mappingKey].element.attack.type = 'fire'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '水':
                                mapping[mappingKey].element.attack.type = 'water'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '雷':
                                mapping[mappingKey].element.attack.type = 'thunder'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '氷':
                                mapping[mappingKey].element.attack.type = 'ice'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '龍':
                                mapping[mappingKey].element.attack.type = 'dragon'
                                mapping[mappingKey].element.attack.minValue = parseFloat(element.value)

                                break
                            case '睡眠':
                                mapping[mappingKey].element.status.type = 'sleep'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            case '麻痹':
                            case '麻痺':
                                mapping[mappingKey].element.status.type = 'paralysis'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            case '爆破':
                                mapping[mappingKey].element.status.type = 'blast'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            case '毒':
                                mapping[mappingKey].element.status.type = 'poison'
                                mapping[mappingKey].element.status.minValue = parseFloat(element.value)

                                break
                            default:
                                console.log('no match property', match)

                                break
                            }
                        })
                    }

                    // Slot
                    subNode.find('tbody tr').eq(3).find('td').eq(1).text().split('').forEach((slotSize) => {
                        if ('③' === slotSize) {
                            mapping[mappingKey].slots.push({
                                size: 3
                            })
                        } else if ('②' === slotSize) {
                            mapping[mappingKey].slots.push({
                                size: 2
                            })
                        } else if ('①' === slotSize) {
                            mapping[mappingKey].slots.push({
                                size: 1
                            })
                        }
                    })

                    // Enhances
                    let enhanceRowIndex = 4

                    if ('lightBowgun' === weaponType || 'heavyBowgun' === weaponType) {
                        enhanceRowIndex = 7
                    }

                    subNode.find('tbody tr').eq(enhanceRowIndex).find('a').each((index, node) => {
                        mapping[mappingKey].enhances.push({
                            name: normalizeText(weaponDom(node).text())
                        })
                    })

                    mapping[mappingKey].series = {
                        jaJP: series
                    }
                    mapping[mappingKey].name = {
                        jaJP: name
                    }
                    mapping[mappingKey].type = weaponType
                    mapping[mappingKey].rare = parseFloat(rare)
                    mapping[mappingKey].attack = parseFloat(attack)
                    mapping[mappingKey].defense = ('-' !== defense)
                        ? parseFloat(defense) : null
                    mapping[mappingKey].criticalRate = (0 !== parseFloat(criticalRate))
                        ? parseFloat(criticalRate) : null
                }
            }
        }

        let list = autoExtendCols(Object.values(mapping))

        Helper.saveJSONAsCSV(`${fileRoot}/weapons/${weaponType}.csv`, list)
    }
}

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

    const specialReplaceName = (text) => {
        let specialWordMapping = {
            'スカルダ/スパイオS': 'スカルダS/スパイオS',
            'スカルダ/スパイオSテスタ': 'スカルダSテスタ/スパイオSテスタ',
            'スカルダ/スパイオSペット': 'スカルダSペット/スパイオSペット',
            'スカルダ/スパイオSマーノ': 'スカルダSマーノ/スパイオSマーノ',
            'スカルダ/スパイオSアンカ': 'スカルダSアンカ/スパイオSアンカ',
            'スカルダ/スパイオSガンバ': 'スカルダSガンバ/スパイオSガンバ',
        }

        if (Helper.isNotEmpty(specialWordMapping[text])) {
            text = specialWordMapping[text]
        }

        return text
    }

    for (let tableIndex = 1; tableIndex <= 2; tableIndex++) {
        for (let rowIndex = 0; rowIndex < listDom(`#hm_${tableIndex} + table tbody td`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody td`).eq(rowIndex)

            // Get Data
            let seriesList = normalizeText(specialReplaceName(rowNode.eq(0).find('a').text().trim())).split('/')

            for (let entry of Object.entries(seriesList)) {
                let seriesIndex = parseFloat(entry[0])
                let series = entry[1]
                let gender = 'general'

                if (2 === seriesList.length) {
                    if (0 === seriesIndex) {
                        gender = 'male'
                    }

                    if (1 === seriesIndex) {
                        gender = 'female'
                    }
                }

                // Fetch Detail Page
                fetchPageUrl = rowNode.eq(0).find('a').attr('href')
                fetchPageName = `armors:${series}`

                console.log(fetchPageUrl, fetchPageName)

                let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

                if (Helper.isEmpty(armorDom)) {
                    console.log(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                for (let h3Index = 0; h3Index < armorDom('h3.a-header--3').length; h3Index++) {
                    let header = armorDom('h3.a-header--3').eq(h3Index).text().trim()
                    let hmId = armorDom('h3.a-header--3').eq(h3Index).attr('id')

                    if ('スキル・スロット' === header) {
                        for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length; armorIndex++) {
                            let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                            // Get Data
                            let name = normalizeText(specialReplaceName(armorNode.find('td').eq(0).text().trim()))

                            if (2 === seriesList.length) {
                                name = name.split('/')[seriesIndex]
                            }

                            mappingKey = `${series}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].series = {
                                jaJP: series
                            }
                            mapping[mappingKey].name = {
                                jaJP: name
                            }
                            mapping[mappingKey].gender = gender

                            armorNode.find('td').eq(1).find('a').each((index, node) => {
                                let skillName = normalizeText(armorDom(node).text())
                                let skillLevel = armorDom(node)[0].next.data.replace('Lv.', '')

                                mapping[mappingKey].skills.push({
                                    name: skillName,
                                    level: parseFloat(skillLevel)
                                })
                            })

                            // Slots
                            armorNode.find('td').eq(2).text().trim().split('').forEach((slotSize) => {
                                if ('③' === slotSize) {
                                    mapping[mappingKey].slots.push({
                                        size: 3
                                    })
                                } else if ('②' === slotSize) {
                                    mapping[mappingKey].slots.push({
                                        size: 2
                                    })
                                } else if ('①' === slotSize) {
                                    mapping[mappingKey].slots.push({
                                        size: 1
                                    })
                                }
                            })
                        }
                    }

                    if ('防御力' === header) {
                        for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
                            let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                            // Get Data
                            let type = armorNode.find('td').eq(0).find('.align').text().trim()
                            let name = normalizeText(specialReplaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim()))
                            let minDefense = armorNode.find('td').eq(1).text().trim()
                            let maxDefense = (3 === armorNode.find('td').length)
                                ? armorNode.find('td').eq(2).text().trim() : null

                            if (2 === seriesList.length) {
                                name = name.split('/')[seriesIndex]
                            }

                            switch (type) {
                            case '頭':
                                type = 'helm'

                                break
                            case '胴':
                                type = 'chest'

                                break
                            case '腕':
                                type = 'arm'

                                break
                            case '腰':
                                type = 'waist'

                                break
                            case '脚':
                                type = 'leg'

                                break
                            }

                            mappingKey = `${series}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].type = type
                            mapping[mappingKey].minDefense = parseFloat(minDefense)
                            mapping[mappingKey].maxDefense = Helper.isNotEmpty(maxDefense)
                                ? parseFloat(maxDefense) : null
                        }
                    }

                    if ('属性耐性' === header) {
                        for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
                            let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                            // Get Data
                            let type = armorNode.find('td').eq(0).find('.align').text().trim()
                            let name = normalizeText(specialReplaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim()))
                            let resistenceFire = armorNode.find('td').eq(1).text().trim()
                            let resistenceWater = armorNode.find('td').eq(2).text().trim()
                            let resistenceThunder = armorNode.find('td').eq(3).text().trim()
                            let resistenceIce = armorNode.find('td').eq(4).text().trim()
                            let resistenceDragon = armorNode.find('td').eq(5).text().trim()

                            if (2 === seriesList.length) {
                                name = name.split('/')[seriesIndex]
                            }

                            switch (type) {
                            case '頭':
                                type = 'helm'

                                break
                            case '胴':
                                type = 'chest'

                                break
                            case '腕':
                                type = 'arm'

                                break
                            case '腰':
                                type = 'waist'

                                break
                            case '脚':
                                type = 'leg'

                                break
                            }

                            mappingKey = `${series}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].type = type
                            mapping[mappingKey].resistence.fire = parseFloat(resistenceFire)
                            mapping[mappingKey].resistence.water = parseFloat(resistenceWater)
                            mapping[mappingKey].resistence.thunder = parseFloat(resistenceThunder)
                            mapping[mappingKey].resistence.ice = parseFloat(resistenceIce)
                            mapping[mappingKey].resistence.dragon = parseFloat(resistenceDragon)
                        }
                    }
                }
            }
        }
    }

    let list = autoExtendCols(Object.values(mapping))

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

    for (let tableIndex = 1; tableIndex <= 3; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let skillName = normalizeText(rowNode.find('td').eq(1).text().trim())

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = `jewels:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let jewelDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(jewelDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Get Data
            let rare = jewelDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(0).text().trim()
            let size = jewelDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(1).text().trim()

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultJewel)
            }

            mapping[mappingKey].name = {
                jaJP: name
            }
            mapping[mappingKey].rare = parseFloat(rare)
            mapping[mappingKey].size = parseFloat(size)
            mapping[mappingKey].skills.push({
                name: skillName,
                level: 1
            })
        }
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

    for (let tableIndex = 1; tableIndex <= 10; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).text().trim())
            let description = rowNode.find('td').eq(1).text().trim()

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultEnhance)
            }

            mapping[mappingKey].name = {
                jaJP: name
            }
            mapping[mappingKey].description = {
                jaJP: description
            }
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

    for (let tableIndex = 1; tableIndex <= 10; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
            let description = rowNode.find('td').eq(1).text().trim()

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = `skills:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let skillDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(skillDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let skillIndex = 3; skillIndex < skillDom(`#hm_1 + table tbody tr`).length; skillIndex++) {
                let skillNode = skillDom(`#hm_1 + table tbody tr`).eq(skillIndex)

                // Get Data
                let level = skillNode.find('td').eq(0).text().trim()
                let effect = skillNode.find('td').eq(1).text().trim()

                mappingKey = `${name}:${level}`

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(defaultSkill)
                }

                mapping[mappingKey].name = {
                    jaJP: name
                }
                mapping[mappingKey].description = {
                    jaJP: description
                }
                mapping[mappingKey].level = parseFloat(level)
                mapping[mappingKey].effect = {
                    jaJP: effect
                }
            }
        }
    }

    Helper.saveJSONAsCSV(`${fileRoot}/skills.csv`, Object.values(mapping))
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
    let weaponList = Helper.loadCSVAsJSON(`${fileRoot}/weapons.csv`)

    if (Helper.isNotEmpty(weaponList)) {
        result.weapons.all = weaponList.length

        for (let item of weaponList) {
            let weaponType = item.type

            if (Helper.isEmpty(result.weapons[weaponType].all)) {
                result.weapons[weaponType].all = 0
            }

            result.weapons[weaponType].all += 1

            if (Helper.isNotEmpty(item.rare)) {
                let rare = `rare${item.rare}`

                if (Helper.isEmpty(result.weapons[weaponType][rare])) {
                    result.weapons[weaponType][rare] = 0
                }

                result.weapons[weaponType][rare] += 1
            }
        }
    } else {
        for (let weaponType of weaponTypeList) {
            let weaponList = Helper.loadCSVAsJSON(`${fileRoot}/weapons/${weaponType}.csv`)

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
    }

    // Armors
    let armorList = Helper.loadCSVAsJSON(`${fileRoot}/armors.csv`)

    if (Helper.isNotEmpty(armorList)) {
        result.armors.all = armorList.length

        for (let item of armorList) {
            if (Helper.isNotEmpty(item.rare)) {
                let rare = `rare${item.rare}`

                if (Helper.isEmpty(result.armors[rare])) {
                    result.armors[rare] = 0
                }

                result.armors[rare] += 1
            }
        }
    } else {
        for (let rare of rareList) {
            let armorList = Helper.loadCSVAsJSON(`${fileRoot}/armors/${rare}.csv`)

            if (Helper.isNotEmpty(armorList)) {
                if (Helper.isEmpty(result.armors.all)) {
                    result.armors.all = 0
                }

                result.armors.all += armorList.length
                result.armors[rare] = armorList.length
            }
        }
    }

    // Jewels
    let jewelList = Helper.loadCSVAsJSON(`${fileRoot}/jewels.csv`)

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

    // Petalaces, Enhances & Skills
    for (let target of ['petalaces', 'enhances', 'skills']) {
        let targetList = Helper.loadCSVAsJSON(`${fileRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target] = targetList.length
        }
    }

    // Result
    console.log(result)
}

function fetchAll() {
    Promise.all([
        fetchWeapons(),
        fetchArmors(),
        fetchJewels(),
        fetchEnhances(),
        fetchSkills()
    ]).then(() => {
        statistics()
    })
}

export default {
    fetchAll,
    fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchEnhances,
    fetchSkills,
    statistics
}
