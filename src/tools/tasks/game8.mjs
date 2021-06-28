/**
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import Helper from '../helper.mjs'
import {
    defaultWeapon,
    defaultArmor,
    defaultJewel,
    defaultPetalace,
    defaultEnhance,
    defaultSkill,
    weaponTypeList
} from '../constant.mjs'

const crawlerRoot = 'temp/crawler/game8'

const urls = {
    weapons: {
        bow: 'https://game8.jp/mhrise/369836',
        chargeBlade: 'https://game8.jp/mhrise/369832',
        dualBlades: 'https://game8.jp/mhrise/369826',
        greatSword: 'https://game8.jp/mhrise/369823',
        gunlance: 'https://game8.jp/mhrise/369830',
        hammer: 'https://game8.jp/mhrise/369827',
        heavyBowgun: 'https://game8.jp/mhrise/369835',
        huntingHorn: 'https://game8.jp/mhrise/369828',
        insectGlaive: 'https://game8.jp/mhrise/369833',
        lance: 'https://game8.jp/mhrise/369829',
        lightBowgun: 'https://game8.jp/mhrise/369834',
        longSword: 'https://game8.jp/mhrise/369824',
        switchAxe: 'https://game8.jp/mhrise/369831',
        swordAndShield: 'https://game8.jp/mhrise/369825'
    },
    armors: 'https://game8.jp/mhrise/363845',
    skills: 'https://game8.jp/mhrise/363848',
    sets: null,
    jewels: 'https://game8.jp/mhrise/363846',
    charms: null,
    petalaces: null,
    enhances: 'https://game8.jp/mhrise/382391'
}

const autoExtendCols = (list) => {
    let slotCount = 0
    let skillCount = 0
    let enhanceCount = 0

    list.forEach((row) => {
        if (Helper.isNotEmpty(row.slots) && slotCount < row.slots.length) {
            slotCount = row.slots.length
        }

        if (Helper.isNotEmpty(row.skills) && skillCount < row.skills.length) {
            skillCount = row.skills.length
        }

        if (Helper.isNotEmpty(row.enhances) && enhanceCount < row.enhances.length) {
            enhanceCount = row.enhances.length
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

        if (Helper.isNotEmpty(row.enhances)) {
            for (let index = 0; index < enhanceCount; index++) {
                if (Helper.isNotEmpty(row.enhances[index])) {
                    continue
                }

                row.enhances[index] = {
                    name: null
                }
            }
        }

        return row
    })
}

const cleanName = (text) => {
    return text
        .replace(/(│|├|└)*/g, '').replace(/(┃|┣|┗|　)*/g, '')
        .replace('Ⅰ', 'I').replace('Ⅱ', 'II').replace('Ⅲ', 'III').replace('Ⅳ', 'IV').replace('Ⅴ', 'V')
}

let fetchPageUrl = null
let fetchPageName = null

async function fetchWeapons() {
    let targetWeaponType = null

    if (Helper.isNotEmpty(process.argv[4]) && -1 !== weaponTypeList.indexOf(process.argv[4])) {
        targetWeaponType = process.argv[4]
    }

    for (let weaponType of weaponTypeList) {
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

                let name = cleanName(itemNode.text().trim())

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

                let serial = weaponDom('h3#hm_1').text().replace('の性能まとめ', '')

                for (let subIndex = 0; subIndex < weaponDom('.a-table + .a-table').length; subIndex++) {
                    let subNode = weaponDom('.a-table + .a-table').eq(subIndex)
                    let subName = cleanName(subNode.find('b.a-bold').text())

                    if (name !== subName) {
                        continue
                    }

                    mappingKey = `${serial}:${name}`

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
                                mapping[mappingKey].element.attack.minValue = parseInt(element.value, 10)

                                break
                            case '水':
                                mapping[mappingKey].element.attack.type = 'water'
                                mapping[mappingKey].element.attack.minValue = parseInt(element.value, 10)

                                break
                            case '雷':
                                mapping[mappingKey].element.attack.type = 'thunder'
                                mapping[mappingKey].element.attack.minValue = parseInt(element.value, 10)

                                break
                            case '氷':
                                mapping[mappingKey].element.attack.type = 'ice'
                                mapping[mappingKey].element.attack.minValue = parseInt(element.value, 10)

                                break
                            case '龍':
                                mapping[mappingKey].element.attack.type = 'dragon'
                                mapping[mappingKey].element.attack.minValue = parseInt(element.value, 10)

                                break
                            case '睡眠':
                                mapping[mappingKey].element.status.type = 'sleep'
                                mapping[mappingKey].element.status.minValue = parseInt(element.value, 10)

                                break
                            case '麻痹':
                            case '麻痺':
                                mapping[mappingKey].element.status.type = 'paralysis'
                                mapping[mappingKey].element.status.minValue = parseInt(element.value, 10)

                                break
                            case '爆破':
                                mapping[mappingKey].element.status.type = 'blast'
                                mapping[mappingKey].element.status.minValue = parseInt(element.value, 10)

                                break
                            case '毒':
                                mapping[mappingKey].element.status.type = 'poison'
                                mapping[mappingKey].element.status.minValue = parseInt(element.value, 10)

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
                            name: cleanName(weaponDom(node).text())
                        })
                    })

                    mapping[mappingKey].serial = serial
                    mapping[mappingKey].name = name
                    mapping[mappingKey].type = weaponType
                    mapping[mappingKey].rare = parseInt(rare, 10)
                    mapping[mappingKey].attack = parseInt(attack, 10)
                    mapping[mappingKey].defense = ('-' !== defense)
                        ? parseInt(defense, 10) : null
                    mapping[mappingKey].criticalRate = (0 !== parseInt(criticalRate, 10))
                        ? parseInt(criticalRate, 10) : null
                }
            }
        }

        let list = autoExtendCols(Object.values(mapping))

        Helper.saveJSONAsCSV(`${crawlerRoot}/weapons/${weaponType}.csv`, list)
    }
}

async function fetchArmors() {
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

    const replaceName = (text) => {
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

        return text.replace('デスタ', 'テスタ')
    }

    for (let tableIndex = 1; tableIndex <= 2; tableIndex++) {
        for (let rowIndex = 0; rowIndex < listDom(`#hm_${tableIndex} + table tbody td`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody td`).eq(rowIndex)

            // Get Data
            let serials = replaceName(rowNode.eq(0).find('a').text().trim()).split('/')

            for (let entry of Object.entries(serials)) {
                let serialIndex = parseInt(entry[0])
                let serial = entry[1]
                let gender = 'general'

                if (2 === serials.length) {
                    if (0 === serialIndex) {
                        gender = 'male'
                    }

                    if (1 === serialIndex) {
                        gender = 'female'
                    }
                }

                // Fetch Detail Page
                fetchPageUrl = rowNode.eq(0).find('a').attr('href')
                fetchPageName = serial

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
                            let name = replaceName(armorNode.find('td').eq(0).text().trim())

                            if (2 === serials.length) {
                                name = name.split('/')[serialIndex]
                            }

                            mappingKey = `${serial}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].serial = serial
                            mapping[mappingKey].name = name
                            mapping[mappingKey].gender = gender

                            armorNode.find('td').eq(1).find('a').each((index, node) => {
                                let skillName = armorDom(node).text()
                                let skillLevel = armorDom(node)[0].next.data.replace('Lv.', '')

                                mapping[mappingKey].skills.push({
                                    name: skillName,
                                    level: parseInt(skillLevel, 10)
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
                            let name = replaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim())
                            let minDefense = armorNode.find('td').eq(1).text().trim()
                            let maxDefense = (3 === armorNode.find('td').length)
                                ? armorNode.find('td').eq(2).text().trim() : null

                            if (2 === serials.length) {
                                name = name.split('/')[serialIndex]
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

                            mappingKey = `${serial}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].type = type
                            mapping[mappingKey].minDefense = parseInt(minDefense, 10)
                            mapping[mappingKey].maxDefense = Helper.isNotEmpty(maxDefense)
                                ? parseInt(maxDefense, 10) : null
                        }
                    }

                    if ('属性耐性' === header) {
                        for (let armorIndex = 1; armorIndex < armorDom(`#${hmId} + table tbody tr`).length - 1; armorIndex++) {
                            let armorNode = armorDom(`#${hmId} + table tbody tr`).eq(armorIndex)

                            // Get Data
                            let type = armorNode.find('td').eq(0).find('.align').text().trim()
                            let name = replaceName(armorNode.find('td').eq(0).find('.align')[0].next.data.trim())
                            let resistenceFire = armorNode.find('td').eq(1).text().trim()
                            let resistenceWater = armorNode.find('td').eq(2).text().trim()
                            let resistenceThunder = armorNode.find('td').eq(3).text().trim()
                            let resistenceIce = armorNode.find('td').eq(4).text().trim()
                            let resistenceDragon = armorNode.find('td').eq(5).text().trim()

                            if (2 === serials.length) {
                                name = name.split('/')[serialIndex]
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

                            mappingKey = `${serial}:${name}`

                            if (Helper.isEmpty(mapping[mappingKey])) {
                                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
                            }

                            mapping[mappingKey].type = type
                            mapping[mappingKey].resistence.fire = parseInt(resistenceFire, 10)
                            mapping[mappingKey].resistence.water = parseInt(resistenceWater, 10)
                            mapping[mappingKey].resistence.thunder = parseInt(resistenceThunder, 10)
                            mapping[mappingKey].resistence.ice = parseInt(resistenceIce, 10)
                            mapping[mappingKey].resistence.dragon = parseInt(resistenceDragon, 10)
                        }
                    }
                }
            }
        }
    }

    let list = autoExtendCols(Object.values(mapping))

    Helper.saveJSONAsCSV(`${crawlerRoot}/armors.csv`, list)
}

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

    for (let tableIndex = 1; tableIndex <= 3; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = rowNode.find('td').eq(0).find('a').text().trim()
            let skillName = rowNode.find('td').eq(1).text().trim()

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = rowNode.find('td').eq(0).find('a').text().trim()

            console.log(fetchPageUrl, fetchPageName)

            let jewelDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(jewelDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Get Data
            let rare = jewelDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(0).text().trim()
            let slotSize = jewelDom(`#hm_1 + table tbody tr`).eq(1).find('td').eq(1).text().trim()

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultJewel)
            }

            mapping[mappingKey].name = name
            mapping[mappingKey].rare = rare
            mapping[mappingKey].slot.size = parseInt(slotSize, 10)
            mapping[mappingKey].skill.name = skillName
            mapping[mappingKey].skill.level = 1
        }
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

    for (let tableIndex = 1; tableIndex <= 10; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = rowNode.find('td').eq(0).find('a').text().trim()
            let description = rowNode.find('td').eq(1).text().trim()

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = rowNode.find('td').eq(0).find('a').text().trim()

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

                mapping[mappingKey].name = name
                mapping[mappingKey].description = description
                mapping[mappingKey].level = parseInt(level, 10)
                mapping[mappingKey].effect = effect
            }
        }
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

    for (let tableIndex = 1; tableIndex <= 10; tableIndex++) {
        for (let rowIndex = 1; rowIndex < listDom(`#hm_${tableIndex} + table tbody tr`).length; rowIndex++) {
            let rowNode = listDom(`#hm_${tableIndex} + table tbody tr`).eq(rowIndex)

            // Get Data
            let name = cleanName(rowNode.find('td').eq(0).text().trim())
            let description = rowNode.find('td').eq(1).text().trim()

            mappingKey = name

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultEnhance)
            }

            mapping[mappingKey].name = name
            mapping[mappingKey].description = description
        }
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/enhances.csv`, Object.values(mapping))
}

function fetchAll() {
    fetchWeapons()
    fetchArmors()
    fetchJewels()
    fetchSkills()
    fetchEnhances()
}

export default {
    fetchAll,
    fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchSkills,
    fetchEnhances
}
