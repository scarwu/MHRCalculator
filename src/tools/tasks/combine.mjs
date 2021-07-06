/**
 * Combine Handler
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

import Helper from '../liberaries/helper.mjs'
import {
    defaultWeaponItem,
    defaultArmorItem,
    defaultPetalaceItem,
    defaultJewelItem,
    defaultEnhanceItem,
    defaultSkillItem,
    autoExtendListQuantity,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const tempCrawlerRoot = 'temp/crawler'
const tempCombineRoot = 'temp/combine'

const crawlerList = [
    'gameqb', 'game8', 'kiranico', 'fextralife'
]

const targetList = [
    'weapons',
    'armors',
    'petalaces',
    'jewels',
    'enhances',
    'skills'
]

const langList = [
    'zhTW',
    'jaJP',
    'enUS'
]

const specialReplaceItemName = (text, lang, rare) => {
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
        { lang: 'enUS', searchValue: 'D. Stench', replaceValue: 'Death Stench' },
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

const specialReplaceSkillPropertyName = (text) => {
    let replacementList = [

        // gameqb
        { searchValue: '冰属性攻撃強化', replaceValue: '冰屬性攻擊強化' },

        // fextralife
        { searchValue: 'Agilator', replaceValue: 'Agitator' },
        { searchValue: 'Chamaleos Blessing', replaceValue: 'Chameleos Blessing' },
        { searchValue: 'Aim Booster', replaceValue: 'Ballistics' },
        // { searchValue: 'Agilator', replaceValue: 'Agitator' },
        // { searchValue: 'Agilator', replaceValue: 'Agitator' },
        // { searchValue: 'Agilator', replaceValue: 'Agitator' },
        // { searchValue: 'Agilator', replaceValue: 'Agitator' },
    ]

    for (let item of replacementList) {
        if (text === item.searchValue) {
            return item.replaceValue
        }
    }

    return text
}

const specialReplaceEnhancePropertyName = (text, itemName = null) => {
    let replacementList = [

        // kiranico
        // { searchValue: '龍姬的斬擊斧', replaceValue: '龍姬的劍斧' },

        // gameqb
        // { searchValue: '倪泰裡【面具】', replaceValue: '倪泰裡【蒙面】' },

        // game8
        // { searchValue: 'デスタ', replaceValue: 'テスタ' },

        // fextralife
        { searchValue: 'Affinty Boost I', replaceValue: 'Affinity Boost I' },
        { searchValue: 'Affiinity Boost I', replaceValue: 'Affinity Boost I' },
        { searchValue: 'Affiinity Boost I', replaceValue: 'Affinity Boost I' },
        { searchValue: 'Affinity I', replaceValue: 'Affinity Boost I' },
        { searchValue: 'Affinty Boost II', replaceValue: 'Affinity Boost II' },
        { searchValue: 'Affiinity Boost II', replaceValue: 'Affinity Boost II' },
        { searchValue: 'Affinity Bonus II', replaceValue: 'Affinity Boost II' },
        { searchValue: 'Affiinity Boost II', replaceValue: 'Affinity Boost II' },
        { searchValue: 'Affinity II', replaceValue: 'Affinity Boost II' },
        { searchValue: 'Affinty Boost III', replaceValue: 'Affinity Boost III' },
        { searchValue: 'Atack Boost I', replaceValue: 'Attack Boost I' },
        { searchValue: 'Atttack Boost II', replaceValue: 'Attack Boost II' },
        { searchValue: 'Defense Boost', replaceValue: 'Defense Boost I' }, // Azure Elder Sword I
        { searchValue: 'Defesnse Boost I', replaceValue: 'Defense Boost I' },
        { searchValue: 'Defemse Boost II', replaceValue: 'Defense Boost II' },
        { searchValue: 'Defense Boost IV', replaceValue: 'Defense Boost II' }, // For "Keen Edge I"
        { searchValue: 'Poiston Boost I', replaceValue: 'Poison Boost I' },
        { searchValue: 'Poiston Boost II', replaceValue: 'Poison Boost II' },
        { searchValue: 'Boost Boost I', replaceValue: 'Blast Boost I' },
        { searchValue: 'Ice Bloost II', replaceValue: 'Ice Boost II' },
        { searchValue: 'Anti-aquatic Species', replaceValue: 'Anti-Aquatic Species' },
        { searchValue: 'Anti-aquatic Species', replaceValue: 'Anti-Aquatic Species' },
        { searchValue: 'Anti-Aquatic', replaceValue: 'Anti-Aquatic Species' },
        { searchValue: 'Anti Aerial Species', replaceValue: 'Anti-Aerial Species' },
        { searchValue: 'Fireblight Eploit', replaceValue: 'Fireblight Exploit' },
        { searchValue: 'Smaill Monster Exploit', replaceValue: 'Small Monster Exploit' },
        { searchValue: 'Fire Blight Exploit', replaceValue: 'Fireblight Exploit' },
        { searchValue: 'Dragon Exploit', replaceValue: 'Wyvern Exploit' },
        { searchValue: 'Burtal Strike', replaceValue: 'Brutal Strike' },
        { searchValue: 'Spiribird Double', replaceValue: 'Spiribird Doubled' },
        { searchValue: 'Brutal Strke', replaceValue: 'Brutal Strike' },
        { searchValue: 'Lasting Arch Shot', replaceValue: 'Lasting Arc Shot' },
        { searchValue: 'Silkbing Boost', replaceValue: 'Silkbind Boost' },
        { searchValue: 'Silk Boost', replaceValue: 'Silkbind Boost' },
        { searchValue: 'Silkbing Boost', replaceValue: 'Silkbind Boost' },
        { searchValue: 'SilkBind Boost', replaceValue: 'Silkbind Boost' }
    ]

    text = text.replace(/x1$/, 'I').replace(/x2$/, 'II').replace(/x3$/, 'III').replace(/x4$/, 'IV')

    for (let item of replacementList) {
        if (text === item.searchValue) {
            return item.replaceValue
        }
    }

    return text
}

export const runAction = () => {
    let rawDataMapping = {}
    let metaDataMapping = {}
    let arrangeDataMapping = {}

    let untrackDataMapping = {}
    let untrackMergeMapping = {}
    let duplicateValueMapping = {}

    let idNameMapping = {}
    let translateIdMapping = {}

    let crawlerInfo = {
        major: {
            name: 'kiranico',
            langs: ['zhTW', 'jaJP', 'enUS']
        },
        minors: [
            {
                name: 'gameqb',
                lang: 'zhTW'
            },
            {
                name: 'game8',
                lang: 'jaJP'
            },
            {
                name: 'fextralife',
                lang: 'enUS'
            }
        ]
    }

    // Load Raw Data
    Object.values(targetList).forEach((target) => {
        rawDataMapping[target] = {}

        Object.values(crawlerList).forEach((crawler) => {
            rawDataMapping[target][crawler] = []
        })
    })

    for (let target of Object.keys(rawDataMapping)) {
        console.log(`concat:${target}`)

        for (let crawler of Object.keys(rawDataMapping[target])) {
            console.log(`concat:${target}:${crawler}`)

            if ('weapons' === target) {
                let weaponList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/weapons.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    rawDataMapping.weapons[crawler] = weaponList

                    continue
                }

                for (let weaponType of weaponTypeList) {
                    let weaponList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/weapons/${weaponType}.csv`)

                    if (Helper.isNotEmpty(weaponList)) {
                        rawDataMapping.weapons[crawler] = rawDataMapping.weapons[crawler].concat(weaponList)
                    }
                }

                continue
            }

            if ('armors' === target) {
                let armorList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/armors.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    rawDataMapping.armors[crawler] = armorList

                    continue
                }

                for (let rare of rareList) {
                    let armorList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/armors/${rare}.csv`)

                    if (Helper.isNotEmpty(armorList)) {
                        rawDataMapping.armors[crawler] = rawDataMapping.armors[crawler].concat(armorList)
                    }
                }

                continue
            }

            let targetList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                rawDataMapping[target][crawler] = targetList
            }
        }
    }

    // Generate Meta Data
    for (let target of Object.keys(rawDataMapping)) {
        console.log(`meta:${target}`)

        // Major Crawler Handle
        let majorCrawler = crawlerInfo.major

        rawDataMapping[target][majorCrawler.name].forEach((item) => {

            // Special Replace Name
            majorCrawler.langs.forEach((lang) => {
                item.name[lang] = specialReplaceItemName(item.name[lang], lang, item.rare)
            })

            // Create Item Id By zhTW Name
            let itemId = null
            let itemIdWithoutLevel = null

            if ('skills' === target) {
                itemId = `${target}:id:${md5(item.name.zhTW)}:${item.level}`
                idNameMapping[itemId] = item.name.zhTW

                itemIdWithoutLevel = `${target}:id:${md5(item.name.zhTW)}`
                idNameMapping[itemIdWithoutLevel] = item.name.zhTW
            } else {
                itemId = `${target}:id:${md5(item.name.zhTW)}`
                idNameMapping[itemId] = item.name.zhTW
            }

            // Create Translate Id
            majorCrawler.langs.forEach((lang) => {
                let translateId = null
                let translateIdWithoutLevel = null

                if ('skills' === target) {
                    translateId = `${target}:name:${md5(item.name[lang])}:${item.level}`
                    translateIdMapping[translateId] = itemId

                    translateIdWithoutLevel = `${target}:name:${md5(item.name[lang])}`
                    translateIdMapping[translateIdWithoutLevel] = itemIdWithoutLevel
                } else {
                    translateId = `${target}:name:${md5(item.name[lang])}`
                    translateIdMapping[translateId] = itemId
                }
            })

            if (Helper.isEmpty(metaDataMapping[target])) {
                metaDataMapping[target] = {}
            }

            if (Helper.isEmpty(metaDataMapping[target][itemId])) {
                metaDataMapping[target][itemId] = {}
            }

            metaDataMapping[target][itemId][majorCrawler.name] = item
        })

        // Minor Crawlers Handle
        crawlerInfo.minors.forEach((minorCrawler) => {
            rawDataMapping[target][minorCrawler.name].forEach((item) => {
                let lang = minorCrawler.lang

                item.name[lang] = specialReplaceItemName(item.name[lang], lang, item.rare)

                let translateId = null

                if ('skills' === target) {
                    translateId = `${target}:name:${md5(item.name[lang])}:${item.level}`
                } else {
                    translateId = `${target}:name:${md5(item.name[lang])}`
                }

                // Record UntrackDataMapping
                if (Helper.isEmpty(translateIdMapping[translateId])) {
                    if (Helper.isEmpty(untrackDataMapping[target])) {
                        untrackDataMapping[target] = {}
                    }

                    if (Helper.isEmpty(untrackDataMapping[target][minorCrawler.name])) {
                        untrackDataMapping[target][minorCrawler.name] = []
                    }

                    untrackDataMapping[target][minorCrawler.name].push(item)

                    return
                }

                let itemId = translateIdMapping[translateId]

                if (Helper.isEmpty(metaDataMapping[target])) {
                    metaDataMapping[target] = {}
                }

                if (Helper.isEmpty(metaDataMapping[target][itemId])) {
                    metaDataMapping[target][itemId] = {}
                }

                metaDataMapping[target][itemId][minorCrawler.name] = item
            })
        })
    }

    const getPropertySkillTranslateName = (name) => {
        name = specialReplaceSkillPropertyName(name)

        let translateId = `skills:name:${md5(name)}`

        if (Helper.isEmpty(translateIdMapping[translateId])) {
            return null
        }

        if (Helper.isEmpty(idNameMapping[translateIdMapping[translateId]])) {
            return null
        }

        return idNameMapping[translateIdMapping[translateId]]
    }

    const getPropertyEnhanceTranslateName = (name) => {
        name = specialReplaceEnhancePropertyName(name)

        let translateId = `enhances:name:${md5(name)}`

        if (Helper.isEmpty(translateIdMapping[translateId])) {
            return null
        }

        if (Helper.isEmpty(idNameMapping[translateIdMapping[translateId]])) {
            return null
        }

        return idNameMapping[translateIdMapping[translateId]]
    }

    const mergeItem = (target, itemId, crawlerMapping) => {
        let item = null

        switch (target) {
        case 'weapons':
            item = Helper.deepCopy(defaultWeaponItem)
            item = mergeNormalValue(target, itemId, item, crawlerMapping, ['rare', 'type', 'attack', 'criticalRate', 'defense'])
            item = mergeTranslateValue(target, itemId, item, crawlerMapping, ['series', 'name'])
            item = mergeElementValue(target, itemId, item, crawlerMapping)
            item = mergeSharpnessValue(target, itemId, item, crawlerMapping)
            item = mergeSlotsValue(target, itemId, item, crawlerMapping)
            item = mergeEnhanceValue(target, itemId, item, crawlerMapping)

            return Helper.deepCopy(item)
        case 'armors':
            item = Helper.deepCopy(defaultArmorItem)
            item = mergeNormalValue(target, itemId, item, crawlerMapping, ['rare', 'type', 'gender', 'minDefense', 'maxDefense'])
            item = mergeTranslateValue(target, itemId, item, crawlerMapping, ['series', 'name'])
            item = mergeResistenceValue(target, itemId, item, crawlerMapping)
            item = mergeSlotsValue(target, itemId, item, crawlerMapping)
            item = mergeSkillsValue(target, itemId, item, crawlerMapping)

            return Helper.deepCopy(item)
        case 'jewels':
            item = Helper.deepCopy(defaultJewelItem)
            item = mergeNormalValue(target, itemId, item, crawlerMapping, ['rare', 'size'])
            item = mergeTranslateValue(target, itemId, item, crawlerMapping, ['name'])
            item = mergeSkillsValue(target, itemId, item, crawlerMapping)

            return Helper.deepCopy(item)
        case 'petalaces':
            item = Helper.deepCopy(defaultPetalaceItem)
            item = mergeNormalValue(target, itemId, item, crawlerMapping, ['rare'])
            item = mergeTranslateValue(target, itemId, item, crawlerMapping, ['name'])
            item = mergeIncrementAndObtainValue(target, itemId, item, crawlerMapping, ['name'])

            return Helper.deepCopy(item)
        case 'enhances':
            item = Helper.deepCopy(defaultEnhanceItem)
            item = mergeTranslateValue(target, itemId, item, crawlerMapping, ['name', 'description'])

            return Helper.deepCopy(item)
        case 'skills':
            item = Helper.deepCopy(defaultSkillItem)
            item = mergeNormalValue(target, itemId, item, crawlerMapping, ['level'])
            item = mergeTranslateValue(target, itemId, item, crawlerMapping, ['name', 'description', 'effect'])

            return Helper.deepCopy(item)
        default:
            throw 'wrong target'
        }
    }

    const mergeNormalValue = (target, itemId, item, crawlerMapping, keys) => {
        for (let key of keys) {
            let voteMapping = {}
            let valueMapping = {}

            for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                if (Helper.isEmpty(crawlerItem[key])) {
                    continue
                }

                // Set Default Value
                if (Helper.isEmpty(item[key])) {
                    item[key] = crawlerItem[key]
                }

                // Set Count & Value
                if (Helper.isEmpty(voteMapping[crawlerItem[key]])) {
                    voteMapping[crawlerItem[key]] = {
                        count: 0,
                        value: crawlerItem[key]
                    }
                }

                voteMapping[crawlerItem[key]].count++
                valueMapping[crawlerName] = crawlerItem[key]
            }

            // Dosen't need Copy
            if (0 === Object.keys(voteMapping).length) {
                continue
            }

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count
                    item[key] = voteItem.value
                }
            }

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.normal)) {
                    duplicateValueMapping.normal = []
                }

                duplicateValueMapping.normal.push({
                    target: target,
                    name: idNameMapping[itemId],
                    key: key,
                    valueMapping: valueMapping
                })
            }
        }

        return item
    }

    const mergeTranslateValue = (target, itemId, item, crawlerMapping, keys) => {
        for (let key of keys) {
            for (let lang of langList) {
                let voteMapping = {}
                let valueMapping = {}

                for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                    if (Helper.isEmpty(crawlerItem[key])
                        || Helper.isEmpty(crawlerItem[key][lang])
                    ) {
                        continue
                    }

                    // Special Append Char
                    if (('description' === key || 'effect' === key)
                        && ('jaJP' === lang || 'zhTW' === lang)
                        && false === /。$/.test(crawlerItem[key][lang])
                    ) {
                        crawlerItem[key][lang] = crawlerItem[key][lang] + '。'
                    }

                    // Set Default Value
                    if (Helper.isEmpty(item[key])) {
                        item[key] = {}
                    }

                    if (Helper.isEmpty(item[key][lang])) {
                        item[key][lang] = crawlerItem[key][lang]
                    }

                    // Set Count & Value
                    if (Helper.isEmpty(voteMapping[crawlerItem[key][lang]])) {
                        voteMapping[crawlerItem[key][lang]] = {
                            count: 0,
                            value: crawlerItem[key][lang]
                        }
                    }

                    voteMapping[crawlerItem[key][lang]].count++
                    valueMapping[crawlerName] = crawlerItem[key][lang]
                }

                // Dosen't need Copy
                if (0 === Object.keys(voteMapping).length) {
                    continue
                }

                // Assign Final Value by Max Count
                let maxCount = 0

                for (let voteItem of Object.values(voteMapping)) {
                    if (maxCount < voteItem.count) {
                        maxCount = voteItem.count
                        item[key][lang] = voteItem.value
                    }
                }

                // Record DuplicationValueMapping
                if (Object.keys(voteMapping).length > 1) {
                    if (Helper.isEmpty(duplicateValueMapping.translate)) {
                        duplicateValueMapping.translate = []
                    }

                    duplicateValueMapping.translate.push({
                        target: target,
                        name: idNameMapping[itemId],
                        key: key,
                        lang: lang,
                        valueMapping: valueMapping
                    })
                }
            }
        }

        return item
    }

    const mergeElementValue = (target, itemId, item, crawlerMapping) => {
        for (let key of ['attack', 'status']) {
            for (let property of ['type', 'minValue', 'maxValue']) {
                let voteMapping = {}
                let valueMapping = {}

                for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                    if (Helper.isEmpty(crawlerItem.element[key])
                        || Helper.isEmpty(crawlerItem.element[key][property])
                    ) {
                        continue
                    }

                    // Set Default Value
                    if (Helper.isEmpty(item.element[key])) {
                        item.element[key] = {}
                    }

                    if (Helper.isEmpty(item.element[key][property])) {
                        item.element[key][property] = crawlerItem.element[key][property]
                    }

                    // Set Count & Value
                    if (Helper.isEmpty(voteMapping[crawlerItem.element[key][property]])) {
                        voteMapping[crawlerItem.element[key][property]] = {
                            count: 0,
                            value: crawlerItem.element[key][property]
                        }
                    }

                    voteMapping[crawlerItem.element[key][property]].count++
                    valueMapping[crawlerName] = crawlerItem.element[key][property]
                }

                // Dosen't need Copy
                if (0 === Object.keys(voteMapping).length) {
                    continue
                }

                // Assign Final Value by Max Count
                let maxCount = 0

                for (let voteItem of Object.values(voteMapping)) {
                    if (maxCount < voteItem.count) {
                        maxCount = voteItem.count
                        item.element[key][property] = voteItem.value
                    }
                }

                // Record DuplicationValueMapping
                if (Object.keys(voteMapping).length > 1) {
                    if (Helper.isEmpty(duplicateValueMapping.element)) {
                        duplicateValueMapping.element = []
                    }

                    duplicateValueMapping.element.push({
                        target: target,
                        name: idNameMapping[itemId],
                        rare: item.rare,
                        key: key,
                        property: property,
                        valueMapping: valueMapping
                    })
                }
            }
        }

        return item
    }

    const mergeSharpnessValue = (target, itemId, item, crawlerMapping) => {
        for (let key of ['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple']) {
            let voteMapping = {}
            let valueMapping = {}

            for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                if (Helper.isEmpty(crawlerItem.sharpness[key])) {
                    continue
                }

                // Set Default Value
                if (Helper.isEmpty(item.sharpness[key])) {
                    item.sharpness[key] = crawlerItem.sharpness[key]
                }

                // Set Count & Value
                if (Helper.isEmpty(voteMapping[crawlerItem.sharpness[key]])) {
                    voteMapping[crawlerItem.sharpness[key]] = {
                        count: 0,
                        value: crawlerItem.sharpness[key]
                    }
                }

                voteMapping[crawlerItem.sharpness[key]].count++
                valueMapping[crawlerName] = crawlerItem.sharpness[key]
            }

            // Dosen't need Copy
            if (0 === Object.keys(voteMapping).length) {
                continue
            }

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count
                    item.sharpness[key] = voteItem.value
                }
            }

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.sharpness)) {
                    duplicateValueMapping.sharpness = []
                }

                duplicateValueMapping.sharpness.push({
                    target: target,
                    name: idNameMapping[itemId],
                    rare: item.rare,
                    key: key,
                    valueMapping: valueMapping
                })
            }
        }

        return item
    }

    const mergeResistenceValue = (target, itemId, item, crawlerMapping) => {
        for (let key of ['fire', 'water', 'thunder', 'ice', 'dragon']) {
            let voteMapping = {}
            let valueMapping = {}

            for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                if (Helper.isEmpty(crawlerItem.resistence[key])) {
                    continue
                }

                // Set Default Value
                if (Helper.isEmpty(item.resistence[key])) {
                    item.resistence[key] = crawlerItem.resistence[key]
                }

                // Set Count & Value
                if (Helper.isEmpty(voteMapping[crawlerItem.resistence[key]])) {
                    voteMapping[crawlerItem.resistence[key]] = {
                        count: 0,
                        value: crawlerItem.resistence[key]
                    }
                }

                voteMapping[crawlerItem.resistence[key]].count++
                valueMapping[crawlerName] = crawlerItem.resistence[key]
            }

            // Dosen't need Copy
            if (0 === Object.keys(voteMapping).length) {
                continue
            }

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count
                    item.resistence[key] = voteItem.value
                }
            }

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.resistence)) {
                    duplicateValueMapping.resistence = []
                }

                duplicateValueMapping.resistence.push({
                    target: target,
                    name: idNameMapping[itemId],
                    rare: item.rare,
                    key: key,
                    valueMapping: valueMapping
                })
            }
        }

        return item
    }

    const mergeIncrementAndObtainValue = (target, itemId, item, crawlerMapping) => {
        for (let key of ['health', 'stamina', 'attack', 'defense']) {
            for (let property of ['increment', 'obtain']) {
                let voteMapping = {}
                let valueMapping = {}

                for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                    if (Helper.isEmpty(crawlerItem[key])
                        || Helper.isEmpty(crawlerItem[key][lang])
                    ) {
                        continue
                    }

                    // Set Default Value
                    if (Helper.isEmpty(item[key])) {
                        item[key] = {}
                    }

                    if (Helper.isEmpty(item[key][property])) {
                        item[key][property] = crawlerItem[key][property]
                    }

                    // Set Count & Value
                    if (Helper.isEmpty(voteMapping[crawlerItem[key][property]])) {
                        voteMapping[crawlerItem[key][property]] = {
                            count: 0,
                            value: crawlerItem[key][property]
                        }
                    }

                    voteMapping[crawlerItem[key][property]].count++
                    valueMapping[crawlerName] = crawlerItem[key][property]
                }

                // Dosen't need Copy
                if (0 === Object.keys(voteMapping).length) {
                    continue
                }

                // Assign Final Value by Max Count
                let maxCount = 0

                for (let voteItem of Object.values(voteMapping)) {
                    if (maxCount < voteItem.count) {
                        maxCount = voteItem.count
                        item[key][property] = voteItem.value
                    }
                }

                // Record DuplicationValueMapping
                if (Object.keys(voteMapping).length > 1) {
                    if (Helper.isEmpty(duplicateValueMapping.iao)) {
                        duplicateValueMapping.iao = []
                    }

                    duplicateValueMapping.iao.push({
                        target: target,
                        name: idNameMapping[itemId],
                        key: key,
                        property: property,
                        valueMapping: valueMapping
                    })
                }
            }
        }

        return item
    }

    const mergeSlotsValue = (target, itemId, item, crawlerMapping) => {
        let voteMapping = {}
        let valueMapping = {}

        for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
            if (Helper.isEmpty(crawlerItem.slots)) {
                continue
            }

            crawlerItem.slots = crawlerItem.slots.filter(function (slotItem) {
                return Helper.isNotEmpty(slotItem.size)
            }).sort(function (slotItemA, slotItemB) {
                return slotItemB.size - slotItemA.size // Desc
            })

            if (0 === crawlerItem.slots.length) {
                continue
            }

            // Set Default Value
            if (Helper.isEmpty(item.slots)) {
                item.slots = crawlerItem.slots
            }

            let value = JSON.stringify(crawlerItem.slots)

            // Set Count & Value
            if (Helper.isEmpty(voteMapping[value])) {
                voteMapping[value] = {
                    count: 0,
                    value: value
                }
            }

            voteMapping[value].count++
            valueMapping[crawlerName] = crawlerItem.slots.map((slotItem) => {
                return slotItem.size
            }).join(',')
        }

        // Need Copy
        if (0 !== Object.keys(voteMapping).length) {

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count
                    item.slots = JSON.parse(voteItem.value)
                }
            }

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.slots)) {
                    duplicateValueMapping.slots = []
                }

                duplicateValueMapping.slots.push({
                    target: target,
                    name: idNameMapping[itemId],
                    rare: item.rare,
                    valueMapping: valueMapping
                })
            }
        }

        return item
    }

    const mergeSkillsValue = (target, itemId, item, crawlerMapping) => {
        let voteMapping = {}
        let valueMapping = {}

        // Generate Skill Mapping
        for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
            if (Helper.isEmpty(crawlerItem.skills)) {
                continue
            }

            let skillList = []

            crawlerItem.skills.forEach((skillItem) => {
                if (Helper.isEmpty(skillItem.name)) {
                    return
                }

                let skillName = getPropertySkillTranslateName(skillItem.name)

                // Record untrackMergeMapping
                if (Helper.isEmpty(skillName)) {
                    if (Helper.isEmpty(untrackMergeMapping.skills)) {
                        untrackMergeMapping.skills = []
                    }

                    untrackMergeMapping.skills.push({
                        target: target,
                        name: idNameMapping[itemId],
                        crawlerName: crawlerName,
                        orignalName: crawlerItem.name,
                        skillName: skillItem.name
                    })

                    return
                }

                skillList.push(skillName)
            })

            skillList.sort()

            let value = JSON.stringify(skillList)

            // Set Count & Value
            if (Helper.isEmpty(voteMapping[value])) {
                voteMapping[value] = {
                    count: 0,
                    value: value
                }
            }

            voteMapping[value].count++
            valueMapping[crawlerName] = skillList.join(',')
        }

        // Need Copy
        if (0 !== Object.keys(voteMapping).length) {

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count

                    item.skills = {}

                    JSON.parse(voteItem.value).forEach((skillName) => {
                        item.skills[skillName] = null
                    })
                }
            }

            // Filling
            for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                if (Helper.isEmpty(crawlerItem.skills)) {
                    continue
                }

                crawlerItem.skills.forEach((skillItem) => {
                    if (Helper.isEmpty(skillItem.name)) {
                        return
                    }

                    let skillName = getPropertySkillTranslateName(skillItem.name)

                    // Just Skipped
                    if (Helper.isEmpty(skillName)) {
                        return
                    }

                    skillItem.name = skillName

                    if (Helper.isEmpty(item.skills[skillItem.name])) {
                        item.skills[skillItem.name] = skillItem
                    }

                    if (Helper.isEmpty(item.skills[skillItem.name].level)
                        && Helper.isNotEmpty(skillItem.level)
                    ) {
                        item.skills[skillItem.name].level = skillItem.level
                    }
                })
            }

            item.skills = Object.values(item.skills)

            // Find Lost Level
            item.skills.forEach((skillItem) => {
                if (Helper.isNotEmpty(skillItem.level)) {
                    return
                }

                if (Helper.isEmpty(untrackMergeMapping.skillLevel)) {
                    untrackMergeMapping.skillLevel = []
                }

                untrackMergeMapping.skillLevel.push({
                    target: target,
                    name: idNameMapping[itemId],
                    crawlerName: crawlerName,
                    orignalName: crawlerItem.name,
                    skillName: skillItem.name
                })
            })

            // Sorting
            item.skills = item.skills.sort(function (aItem, bItem) {
                if (Helper.isEmpty(aItem.level)) {
                    aItem.level = 0
                }

                if (Helper.isEmpty(bItem.level)) {
                    bItem.level = 0
                }

                return bItem.level - aItem.level // Desc
            })

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.skills)) {
                    duplicateValueMapping.skills = []
                }

                duplicateValueMapping.skills.push({
                    target: target,
                    name: idNameMapping[itemId],
                    rare: item.rare,
                    valueMapping: valueMapping
                })
            }
        }

        return item
    }

    const mergeEnhanceValue = (target, itemId, item, crawlerMapping) => {
        let voteMapping = null
        let valueMapping = null

        // For Enhance Amount
        voteMapping = {}
        valueMapping = {}

        for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
            if (Helper.isEmpty(crawlerItem.enhance.amount)) {
                continue
            }

            // Set Default Value
            if (Helper.isEmpty(item.enhance.amount)) {
                item.enhance.amount = crawlerItem.enhance.amount
            }

            // Set Count & Value
            if (Helper.isEmpty(voteMapping[crawlerItem.enhance.amount])) {
                voteMapping[crawlerItem.enhance.amount] = {
                    count: 0,
                    value: crawlerItem.enhance.amount
                }
            }

            voteMapping[crawlerItem.enhance.amount].count++
            valueMapping[crawlerName] = crawlerItem.enhance.amount
        }

        // Need Copy
        if (0 !== Object.keys(voteMapping).length) {

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count
                    item.enhance.amount = voteItem.value
                }
            }

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.enhanceAmount)) {
                    duplicateValueMapping.enhanceAmount = []
                }

                duplicateValueMapping.enhanceAmount.push({
                    target: target,
                    name: idNameMapping[itemId],
                    rare: item.rare,
                    valueMapping: valueMapping
                })
            }
        }

        // For Enhance List
        voteMapping = {}
        valueMapping = {}

        // Generate Enhance Mapping
        for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
            if (Helper.isEmpty(crawlerItem.enhance.list)) {
                continue
            }

            let enhanceList = []

            crawlerItem.enhance.list.forEach((enhanceItem) => {
                if (Helper.isEmpty(enhanceItem.name)) {
                    return
                }

                let enhanceName = getPropertyEnhanceTranslateName(enhanceItem.name)

                // Record untrackMergeMapping
                if (Helper.isEmpty(enhanceName)) {
                    if (Helper.isEmpty(untrackMergeMapping.enhanceList)) {
                        untrackMergeMapping.enhanceList = []
                    }

                    untrackMergeMapping.enhanceList.push({
                        target: target,
                        name: idNameMapping[itemId],
                        crawlerName: crawlerName,
                        orignalName: crawlerItem.name,
                        enhanceName: enhanceItem.name
                    })

                    return
                }

                enhanceList.push(enhanceName)
            })

            enhanceList.sort()

            let value = JSON.stringify(enhanceList)

            // Set Count & Value
            if (Helper.isEmpty(voteMapping[value])) {
                voteMapping[value] = {
                    count: 0,
                    value: value
                }
            }

            voteMapping[value].count++
            valueMapping[crawlerName] = enhanceList.join(',')
        }

        // Need Copy
        if (0 !== Object.keys(voteMapping).length) {

            // Assign Final Value by Max Count
            let maxCount = 0

            for (let voteItem of Object.values(voteMapping)) {
                if (maxCount < voteItem.count) {
                    maxCount = voteItem.count

                    item.enhance.list = {}

                    JSON.parse(voteItem.value).forEach((enhanceName) => {
                        item.enhance.list[enhanceName] = null
                    })
                }
            }

            // Filling
            for (let [crawlerName, crawlerItem] of Object.entries(crawlerMapping)) {
                if (Helper.isEmpty(crawlerItem.enhance.list)) {
                    continue
                }

                crawlerItem.enhance.list.forEach((enhanceItem) => {
                    if (Helper.isEmpty(enhanceItem.name)) {
                        return
                    }

                    let enhanceName = getPropertyEnhanceTranslateName(enhanceItem.name)

                    // Just Skipped
                    if (Helper.isEmpty(enhanceName)) {
                        return
                    }

                    enhanceItem.name = enhanceName

                    if (Helper.isEmpty(item.enhance.list[enhanceItem.name])) {
                        item.enhance.list[enhanceItem.name] = enhanceItem
                    }
                })
            }

            item.enhance.list = Object.values(item.enhance.list)

            // Record DuplicationValueMapping
            if (Object.keys(voteMapping).length > 1) {
                if (Helper.isEmpty(duplicateValueMapping.enhanceList)) {
                    duplicateValueMapping.enhanceList = []
                }

                duplicateValueMapping.enhanceList.push({
                    target: target,
                    name: idNameMapping[itemId],
                    rare: item.rare,
                    valueMapping: valueMapping
                })
            }
        }

        return item
    }

    // Generate Arrange Data
    for (let target of Object.keys(metaDataMapping)) {
        console.log(`arrange:${target}`)

        arrangeDataMapping[target] = {}

        for (let itemId of Object.keys(metaDataMapping[target])) {
            arrangeDataMapping[target][itemId] = mergeItem(target, itemId, metaDataMapping[target][itemId])
        }
    }

    // Save Data
    Helper.cleanFolder(tempCombineRoot)

    Object.keys(arrangeDataMapping).forEach((target) => {
        let list = autoExtendListQuantity(Object.values(arrangeDataMapping[target]))

        Helper.saveJSONAsCSV(`${tempCombineRoot}/arrangeData/${target}.csv`, list)
    })

    Object.keys(untrackDataMapping).forEach((target) => {
        Object.keys(untrackDataMapping[target]).forEach((crawler) => {
            if (0 === untrackDataMapping[target][crawler].length) {
                return
            }

            Helper.saveJSONAsCSV(`${tempCombineRoot}/untrackData/${crawler}/${target}.csv`, untrackDataMapping[target][crawler])
        })
    })

    Object.keys(untrackMergeMapping).forEach((target) => {
        let list = Object.values(untrackMergeMapping[target])

        if (0 === list.length) {
            return
        }

        Helper.saveJSONAsCSV(`${tempCombineRoot}/untrackMerge/${target}.csv`, list)
    })

    Object.keys(duplicateValueMapping).forEach((target) => {
        Helper.saveJSONAsCSV(`${tempCombineRoot}/duplicateValue/${target}.csv`, duplicateValueMapping[target])
    })
}

export const infoAction = () => {

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
    for (let crawler of crawlerList) {
        console.log(`count:${crawler}`)

        for (let target of targetList) {
            console.log(`count:${crawler}:${target}`)

            if ('weapons' === target) {
                let weaponList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/weapons.csv`)

                if (Helper.isNotEmpty(weaponList)) {
                    result.weapons.all[crawler] = weaponList.length

                    for (let item of weaponList) {
                        let weaponType = item.type

                        if (Helper.isEmpty(result.weapons[weaponType].all[crawler])) {
                            result.weapons[weaponType].all[crawler] = 0
                        }

                        result.weapons[weaponType].all[crawler] += 1

                        if (Helper.isNotEmpty(item.rare)) {
                            let rare = `rare${item.rare}`

                            if (Helper.isEmpty(result.weapons[weaponType][rare][crawler])) {
                                result.weapons[weaponType][rare][crawler] = 0
                            }

                            result.weapons[weaponType][rare][crawler] += 1
                        }
                    }

                    continue
                }

                for (let weaponType of weaponTypeList) {
                    let weaponList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/weapons/${weaponType}.csv`)

                    if (Helper.isNotEmpty(weaponList)) {
                        if (Helper.isEmpty(result.weapons.all[crawler])) {
                            result.weapons.all[crawler] = 0
                        }

                        if (Helper.isEmpty(result.weapons[weaponType].all[crawler])) {
                            result.weapons[weaponType].all[crawler] = 0
                        }

                        result.weapons.all[crawler] += weaponList.length
                        result.weapons[weaponType].all[crawler] += weaponList.length

                        for (let item of weaponList) {
                            if (Helper.isNotEmpty(item.rare)) {
                                let rare = `rare${item.rare}`

                                if (Helper.isEmpty(result.weapons[weaponType][rare])) {
                                    console.log(item)
                                }

                                if (Helper.isEmpty(result.weapons[weaponType][rare][crawler])) {
                                    result.weapons[weaponType][rare][crawler] = 0
                                }

                                result.weapons[weaponType][rare][crawler] += 1
                            }
                        }
                    }
                }

                continue
            }

            if ('armors' === target) {
                let armorList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/armors.csv`)

                if (Helper.isNotEmpty(armorList)) {
                    result.armors.all[crawler] = armorList.length

                    for (let item of armorList) {
                        if (Helper.isNotEmpty(item.rare)) {
                            let rare = `rare${item.rare}`

                            if (Helper.isEmpty(result.armors[rare])) {
                                console.log(item)
                            }

                            if (Helper.isEmpty(result.armors[rare][crawler])) {
                                result.armors[rare][crawler] = 0
                            }

                            result.armors[rare][crawler] += 1
                        }
                    }

                    continue
                }

                for (let rare of rareList) {
                    let armorList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/armors/${rare}.csv`)

                    if (Helper.isNotEmpty(armorList)) {
                        if (Helper.isEmpty(result.armors.all[crawler])) {
                            result.armors.all[crawler] = 0
                        }

                        result.armors.all[crawler] += armorList.length
                        result.armors[rare][crawler] = armorList.length
                    }
                }

                continue
            }

            if ('jewels' === target) {
                let jewelList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/jewels.csv`)

                if (Helper.isNotEmpty(jewelList)) {
                    result.jewels.all[crawler] = jewelList.length

                    for (let item of jewelList) {
                        if (Helper.isNotEmpty(item.size)) {
                            let size = `size${item.size}`

                            if (Helper.isEmpty(result.jewels[size][crawler])) {
                                result.jewels[size][crawler] = 0
                            }

                            result.jewels[size][crawler] += 1
                        }
                    }
                }

                continue
            }

            let targetList = Helper.loadCSVAsJSON(`${tempCrawlerRoot}/${crawler}/${target}.csv`)

            if (Helper.isNotEmpty(targetList)) {
                result[target][crawler] = targetList.length
            }
        }
    }

    // Result
    for (let target of Object.keys(result)) {
        console.log(target, '=', result[target])
    }
}

export default {
    runAction,
    infoAction
}
