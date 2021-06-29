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
    langs: {
        zhTW: 'https://mhrise.kiranico.com/zh-Hant',
        jaJP: 'https://mhrise.kiranico.com/ja',
        enUS: 'https://mhrise.kiranico.com'
    },
    weapons: {
        greatSword: 'data/weapons?scope=wp&value=0',
        swordAndShield: 'data/weapons?scope=wp&value=1',
        dualBlades: 'data/weapons?scope=wp&value=2',
        longSword: 'data/weapons?scope=wp&value=3',
        hammer: 'data/weapons?scope=wp&value=4',
        huntingHorn: 'data/weapons?scope=wp&value=5',
        lance: 'data/weapons?scope=wp&value=6',
        gunlance: 'data/weapons?scope=wp&value=7',
        switchAxe: 'data/weapons?scope=wp&value=8',
        chargeBlade: 'data/weapons?scope=wp&value=9',
        insectGlaive: 'data/weapons?scope=wp&value=10',
        bow: 'data/weapons?scope=wp&value=11',
        heavyBowgun: 'data/weapons?scope=wp&value=12',
        lightBowgun: 'data/weapons?scope=wp&value=13'
    },
    armors: {
        rare1: 'data/armors?scope=rarity&value=0',
        rare2: 'data/armors?scope=rarity&value=1',
        rare3: 'data/armors?scope=rarity&value=2',
        rare4: 'data/armors?scope=rarity&value=3',
        rare5: 'data/armors?scope=rarity&value=4',
        rare6: 'data/armors?scope=rarity&value=5',
        rare7: 'data/armors?scope=rarity&value=6'
    },
    skills: 'data/skills',
    jewels: 'data/decorations',
    charms: null,
    petalaces: null,
    enhances: 'data/rampage-skills'
}

const getFullUrl = (lang, url) => {
    return `${urls.langs[lang]}/${url}`
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
            let name = formatName(rowNode.find('td').eq(1).find('a').text().trim())

            mappingKey = `${weaponType}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultWeapon)
            }

            mapping[mappingKey].series = null
            mapping[mappingKey].name = {
                zhTW: name
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

                rowNode.find('td').eq(5).find('div.flex div.flex').eq(1).find('div').each((index, node) => {
                    let value = parseFloat(listDom(node).css('width').replace('px', '')) * 5

                    if (0 === value) {
                        return
                    }

                    mapping[mappingKey].sharpness[sharpnessList[index]] = value
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
                let enhanceName = formatName(weaponDom(node).find('td').eq(1).find('a').text())

                mapping[mappingKey].enhances.push({
                    name: enhanceName
                })
            })
        }

        let list = autoExtendCols(Object.values(mapping))

        Helper.saveJSONAsCSV(`${crawlerRoot}/weapons/${weaponType}.csv`, list)
    }
}

async function fetchArmors() {
    let fetchPageUrl = null
    let fetchPageName = null

    let targetArmorRare = null

    if (Helper.isNotEmpty(process.argv[4]) && Helper.isNotEmpty(urls.armors[process.argv[4]])) {
        targetArmorRare = process.argv[4]
    }

    for (let armorRare of Object.keys(urls.armors)) {
        if (Helper.isNotEmpty(targetArmorRare) && targetArmorRare !== armorRare) {
            continue
        }

        let mapping = {}
        let mappingKey = null

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
            let name = rowNode.find('td').eq(2).find('a').text().trim()

            // Fetch Detail Page
            fetchPageUrl = rowNode.find('td').eq(2).find('a').attr('href')
            fetchPageName = `armors:${armorRare}:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(armorDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            let series = armorDom('dl.grid dd').eq(2).text().trim()

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultArmor)
            }

            mapping[mappingKey].series = null
            mapping[mappingKey].name = {
                zhTW: name
            }
            mapping[mappingKey].gender = null

            let rare = armorDom('dl.grid dd').eq(5).text().trim()
            let minDefense = armorDom('dl.grid dd').eq(11).text().trim()
            let resistenceFire = armorDom('dl.grid dd').eq(12).text().trim()
            let resistenceWater = armorDom('dl.grid dd').eq(13).text().trim()
            let resistenceThunder = armorDom('dl.grid dd').eq(14).text().trim()
            let resistenceIce = armorDom('dl.grid dd').eq(15).text().trim()
            let resistenceDragon = armorDom('dl.grid dd').eq(16).text().trim()

            let type = null
            let typeKeywordMapping = {
                helm: [
                    '頭盔', '頭部', '【蒙面】', '綻放', '頭飾', '【頭巾】', '【武士盔】', '【元結】', '首腦',
                    '毛髮', '護頭', '帽', '兜帽', '之首', '禮帽',
                    '包頭', '偽裝', '羽飾'
                ],
                chest: [
                    '鎧甲', '服飾', '【上衣】', '枝幹', '衣裝', '【上衣】', '【胸甲】', '【白衣】', '肌肉',
                    '羽織', '上身', '戰衣', '洋裝', '胸甲', '服裝',
                    '鎧', '披風'
                ],
                arm: [
                    '腕甲', '拳套', '【手甲】', '枝葉', '手套', '【手甲】', '【臂甲】', '【花袖】', '雙手',
                    '臂甲', '護袖', '腕甲', '袖', '之臂', '護手'
                ],
                waist: [
                    '腰甲', '纏腰布', '【腰卷】', '葉片', '腰帶', '【腰卷】', '【腰具】', '【腰卷】', '臍帶',
                    '帶', '護腰具', '腰甲', '腰甲', '之腰', '腰甲'
                ],
                leg: [
                    '護腿', '涼鞋', '【綁腿】', '紮根', '鞋子', '【綁腿】', '【腿甲】', '【緋袴】', '腳跟',
                    '下裳', '腳', '靴', '長褲', '之足', '靴'
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

            mapping[mappingKey].type = type // special fix
            mapping[mappingKey].rare = parseFloat(rare) + 1 // special fix
            mapping[mappingKey].minDefense = parseFloat(minDefense)
            mapping[mappingKey].resistence.fire = parseFloat(resistenceFire)
            mapping[mappingKey].resistence.water = parseFloat(resistenceWater)
            mapping[mappingKey].resistence.thunder = parseFloat(resistenceThunder)
            mapping[mappingKey].resistence.ice = parseFloat(resistenceIce)
            mapping[mappingKey].resistence.dragon = parseFloat(resistenceDragon)

            // Slots
            JSON.parse(armorDom('dl.grid dd').eq(19).text()).forEach((slotSize) => {
                if (0 === slotSize) {
                    return
                }

                mapping[mappingKey].slots.push({
                    size: slotSize
                })
            })

            // Skills
            armorDom('table.min-w-full tbody.bg-white').eq(0).find('tr.bg-white').each((index, node) => {
                let skillName = armorDom(node).find('td').eq(0).find('a').text()

                mapping[mappingKey].skills.push({
                    name: skillName,
                    level: null
                })
            })
        }

        let list = autoExtendCols(Object.values(mapping))

        Helper.saveJSONAsCSV(`${crawlerRoot}/armors/${armorRare}.csv`, list)
    }
}

async function fetchJewels() {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

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
        let name = rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(\d+)】$/)[1]
        let slotSize = rowNode.find('td').eq(0).text().trim().match(/^(.*?)【(\d+)】$/)[2]
        let skillName = rowNode.find('td').eq(1).find('a').text().trim()

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultJewel)
        }

        mapping[mappingKey].name = {
            zhTW: name
        }
        mapping[mappingKey].rare = null
        mapping[mappingKey].slot.size = parseFloat(slotSize)
        mapping[mappingKey].skill.name = skillName
        mapping[mappingKey].skill.level = 1
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/jewels.csv`, Object.values(mapping))
}

async function fetchSkills() {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

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

            mapping[mappingKey].name = {
                zhTW: name
            }
            mapping[mappingKey].description = description
            mapping[mappingKey].level = parseFloat(level)
            mapping[mappingKey].effect = effect
        })
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/skills.csv`, Object.values(mapping))
}

async function fetchEnhances() {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

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
        let name = formatName(rowNode.find('a p').eq(0).text().trim())
        let description = rowNode.find('a p').eq(1).text().trim()

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultEnhance)
        }

        mapping[mappingKey].name = {
            zhTW: name
        }
        mapping[mappingKey].description = description
    }

    Helper.saveJSONAsCSV(`${crawlerRoot}/enhances.csv`, Object.values(mapping))
}

function statistics() {
    for (let weaponType of Object.keys(urls.weapons)) {
        let list = Helper.loadCSVAsJSON(`${crawlerRoot}/weapons/${weaponType}.csv`)

        console.log(`weapons:${weaponType} (${list.length})`)
    }

    for (let armorRare of Object.keys(urls.armors)) {
        let list = Helper.loadCSVAsJSON(`${crawlerRoot}/armors/${armorRare}.csv`)

        console.log(`armors:${armorRare} (${list.length})`)
    }

    for (let target of ['jewels', 'skills', 'enhances']) {
        let list = Helper.loadCSVAsJSON(`${crawlerRoot}/${target}.csv`)

        console.log(`${target} (${list.length})`)
    }
}

function fetchAll() {
    Promise.all([
        fetchWeapons(),
        fetchArmors(),
        fetchJewels(),
        fetchSkills(),
        fetchEnhances()
    ]).then(() => {
        statistics()
    })
}

export default {
    fetchAll,
    fetchWeapons,
    fetchArmors,
    fetchJewels,
    fetchSkills,
    fetchEnhances,
    statistics
}
