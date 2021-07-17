/**
 * Fitting Algorithm
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

// Load Core
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import ArmorDataset from 'libraries/dataset/armor'
import SetDataset from 'libraries/dataset/set'
import JewelDataset from 'libraries/dataset/jewel'

/**
 * Variables
 */
const defaultBundle = {
    equipIdMapping: {
        weapon: null,
        helm: null,
        chest: null,
        arm: null,
        waist: null,
        leg: null,
        petalace: null,
        charm: null
    },
    skillLevelMapping: {},
    setCountMapping: {},
    slotCountMapping: {
        1: 0,
        2: 0,
        3: 0
    },
    jewelPackages: [],
    meta: {
        equipCount: 0,
        defense: 0,
        resistance: {
            fire: 0,
            water: 0,
            thunder: 0,
            ice: 0,
            dragon: 0
        },
        completedSkills: {},
        completedSets: {},
        remainingSlotCountMapping: {
            1: 0,
            2: 0,
            3: 0,
            all: 0
        },
        totalExpectedValue: 0,
        totalExpectedLevel: 0,
        skillExpectedValue: 0,
        skillExpectedLevel: 0
    }
}

const defaultCandidateEquipItem = {
    id: null,
    type: null,
    defense: 0,
    resistance: {
        fire: 0,
        water: 0,
        thunder: 0,
        ice: 0,
        dragon: 0
    },
    skillLevelMapping: {},
    setId: null,
    slotCountMapping: {
        1: 0,
        2: 0,
        3: 0
    },
    totalExpectedValue: 0,
    totalExpectedLevel: 0,
    skillExpectedValue: 0,
    skillExpectedLevel: 0
}

/**
 * Functions
 */
const getBundleHash = (bundle) => {
    let equipMapping = {}

    Object.keys(bundle.equipIdMapping).forEach((equipType) => {
        if (Helper.isEmpty(bundle.equipIdMapping[equipType])) {
            return
        }

        equipMapping[equipType] = bundle.equipIdMapping[equipType]
    })

    return md5(JSON.stringify(equipMapping))
}

const getBundleJewelHash = (bundle) => {
    let jewelMapping = {}

    Object.keys(bundle.jewelMapping).sort().forEach((jewelId) => {
        if (0 === bundle.jewelMapping[jewelId]) {
            return
        }

        jewelMapping[jewelId] = bundle.jewelMapping[jewelId]
    })

    return md5(JSON.stringify(jewelMapping))
}

class FittingAlgorithm {

    /**
     * Search
     */
    search = (requiredConditions, algorithmParams, callback) => {
        if (Helper.isEmpty(requiredConditions.sets) && Helper.isEmpty(requiredConditions.skills)) {
            return []
        }

        if (0 === requiredConditions.sets.length && 0 === requiredConditions.skills.length) {
            return []
        }

        Helper.log('FA: Input: Required Conditions: Equips', requiredConditions.equips)
        Helper.log('FA: Input: Required Conditions: Sets', requiredConditions.sets)
        Helper.log('FA: Input: Required Conditions: Skills', requiredConditions.skills)
        Helper.log('FA: Input: Algorithm Params', algorithmParams)

        // Set Properties
        this.callback = callback

        this.setMetaMapping = {}
        this.skillMetaMapping = {}
        this.slotMetaMapping = {
            1: { expectedValue: 0, expectedLevel: 0 },
            2: { expectedValue: 0, expectedLevel: 0 },
            3: { expectedValue: 0, expectedLevel: 0 }
        }

        this.candidateEquipMapping = {}
        this.candidateJewelMapping = {
            1: [], 2: [], 3: []
        }

        this.skillTotalExpectedValue = 0
        this.skillTotalExpectedLevel = 0
        this.equipTypeMaxExpectedValue = {}
        this.equipTypeMaxExpectedLevel = {}
        this.equipTypeFutureExpectedValue = {}
        this.equipTypeFutureExpectedLevel = {}

        this.firstBundle = {}

        // Init Condtions
        this.isInitFailed = false

        this.initialize(requiredConditions, algorithmParams)

        if (this.isInitFailed) {
            Helper.log('FA: Init: Failed')

            return []
        }

        this.currentEquipCount = Object.keys(this.candidateEquipMapping).length
        this.currentSetCount = Object.keys(this.setMetaMapping).length
        this.currentSkillCount = Object.keys(this.skillMetaMapping).length

        // Print Init
        Helper.log('FA: Global: Set Meta Mapping:', this.setMetaMapping)
        Helper.log('FA: Global: Skill Meta Mapping:', this.skillMetaMapping)
        Helper.log('FA: Global: Slot Meta Mapping:', this.slotMetaMapping)

        Helper.log('FA: Global: Candidate Equip Mapping:', this.candidateEquipMapping)
        Helper.log('FA: Global: Candidate Jewel Mapping:', this.candidateJewelMapping)

        Helper.log('FA: Global: Skill Total Expected Value:', this.skillTotalExpectedValue)
        Helper.log('FA: Global: Skill Total Expected Level:', this.skillTotalExpectedLevel)

        Helper.log('FA: Global: EquipType Max Expected Value:', this.equipTypeMaxExpectedValue)
        Helper.log('FA: Global: EquipType Max Expected Level:', this.equipTypeMaxExpectedLevel)
        Helper.log('FA: Global: EquipType Future Expected Value:', this.equipTypeFutureExpectedValue)
        Helper.log('FA: Global: EquipType Future Expected Level:', this.equipTypeFutureExpectedLevel)

        Helper.log('FA: Global: First Bundle:', this.firstBundle)

        if (0 === this.currentSetCount && 0 === this.currentSkillCount) {
            return []
        }

        // Save StartTime
        this.startTime = parseInt(Math.floor(Date.now() / 1000), 10)

        // Create Bundles with Equips
        let bundleList = this.createBundleListWithEquips(this.firstBundle, algorithmParams)

        this.callback({
            bundleCount: bundleList.length,
            searchPercent: 100,
            timeRemaining: 0
        })

        // Sort Bundle List & Clean up
        return this.sortBundleList(bundleList, algorithmParams).map((bundle) => {
            Object.keys(bundle.equipIdMapping).forEach((equipType) => {
                if ('empty' === bundle.equipIdMapping[equipType]) {
                    bundle.equipIdMapping[equipType] = null
                }
            })

            delete bundle.meta.completedSets
            delete bundle.meta.completedSkills
            delete bundle.meta.remainingSlotCountMapping
            delete bundle.meta.totalExpectedValue
            delete bundle.meta.totalExpectedLevel
            delete bundle.meta.skillExpectedValue
            delete bundle.meta.skillExpectedLevel

            bundle.hash = getBundleHash(bundle)

            return bundle
        })
    }

    initialize = (requiredConditions, algorithmParams) => {
        let armorList = Misc.getArmorListByRequiredConditions(requiredConditions)
        let jewelList = Misc.getJewelListByRequiredConditions(requiredConditions)

        let requiredSkillIds = []

        // 計算技能的期望數值
        requiredConditions.skills.sort((skillDataA, skillDataB) => {
            return skillDataB.level - skillDataA.level
        }).forEach((skillData) => {
            this.skillMetaMapping[skillData.id] = {
                level: skillData.level,
                jewelSize: 0
            }

            // 不允許出現的技能
            if (0 === this.skillMetaMapping[skillData.id].level) {
                return
            }

            requiredSkillIds.push(skillData.id)

            JewelDataset.hasSkill(skillData.id).getList().forEach((jewelItem) => {
                this.skillMetaMapping[skillData.id].jewelSize = jewelItem.size
            })

            // Increase Expected Value & Level
            this.skillTotalExpectedValue += skillData.level * this.skillMetaMapping[skillData.id].jewelSize
            this.skillTotalExpectedLevel += skillData.level
        })

        jewelList.forEach((jewelItem) => {
            if (false === algorithmParams.usingFactor['jewel:size:' + jewelItem.size]) {
                return
            }

            if (Helper.isEmpty(algorithmParams.usingFactor['jewel:id:' + jewelItem.id])) {
                algorithmParams.usingFactor['jewel:id:' + jewelItem.id] = -1
            }

            // 限制可用裝飾珠數量
            if (0 === algorithmParams.usingFactor['jewel:id:' + jewelItem.id]) {
                return
            }

            let candidateJewelItem = this.getCandidateJewelItem(jewelItem, algorithmParams)

            if (Helper.isEmpty(candidateJewelItem)) {
                return
            }

            this.candidateJewelMapping[jewelItem.size].push(candidateJewelItem)
        })

        Object.keys(this.slotMetaMapping).forEach((size) => {
            size = parseInt(size, 10)

            if (1 === size) {
                return
            }

            if (Helper.isNotEmpty(this.slotMetaMapping[size])) {
                return
            }

            this.slotMetaMapping[size] = this.slotMetaMapping[size - 1]
        })

        // 計算指定套裝裝備數量
        requiredConditions.sets.sort((setDataA, setDataB) => {
            let setItemA = SetDataset.getItem(setDataA.id)
            let setItemB = SetDataset.getItem(setDataB.id)

            if (Helper.isEmpty(setItemA) || Helper.isEmpty(setItemB)) {
                return 0
            }

            return setItemB.items.length - setItemA.items.length
        }).forEach((setData) => {
            let setItem = SetDataset.getItem(setData.id)

            if (Helper.isEmpty(setItem)) {
                return
            }

            this.setMetaMapping[setData.id] = {
                count: setData.count
            }
        })

        // Create First Bundle
        let bundle = Helper.deepCopy(defaultBundle)
        let currentEquipTypes = []

        Object.keys(this.skillMetaMapping).forEach((skillId) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillId])) {
                bundle.skillLevelMapping[skillId] = 0
            }
        })

        for (let equipType of ['weapon', 'helm', 'chest', 'arm', 'waist', 'leg', 'charm']) {
            if (Helper.isEmpty(requiredConditions.equips[equipType]) || Helper.isEmpty(requiredConditions.equips[equipType].id)) {
                if ('weapon' !== equipType && 'charm' !== equipType) {
                    currentEquipTypes.push(equipType)

                    // Set Default Value
                    this.candidateEquipMapping[equipType] = []
                    this.equipTypeMaxExpectedValue[equipType] = 0
                    this.equipTypeMaxExpectedLevel[equipType] = 0
                    this.equipTypeFutureExpectedValue[equipType] = 0
                    this.equipTypeFutureExpectedLevel[equipType] = 0
                }

                continue
            }

            // Get Equip Item
            let equipItem = Misc.getEquipItem(equipType, requiredConditions.equips[equipType])

            // Check Equip Item
            if (Helper.isEmpty(equipItem)) {
                continue
            }

            // Convert Equip to Candidate Equip
            let candidateEquipItem = this.getCandidateEquipItem(equipType, equipItem)

            if (false === candidateEquipItem) {
                continue
            }

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquipItem)

            if (false === bundle) {
                this.isInitFailed = true

                return
            }
        }

        // Reset Equip Count
        bundle.meta.equipCount = 0

        this.firstBundle = bundle

        // Create Current Equip Mapping
        armorList.forEach((armorItem) => {
            if (false === algorithmParams.usingFactor['armor:rare:' + armorItem.rare]) {
                return
            }

            if (Helper.isNotEmpty(algorithmParams.usingFactor['armor:series' + armorItem.seriesId])
                && false === algorithmParams.usingFactor['armor:series' + armorItem.seriesId]
            ) {
                return
            }

            let equipType = armorItem.type

            // Get Equip Item
            let equipItem = Misc.getEquipItem(equipType, {
                id: armorItem.id
            })

            // Check Equip Item
            if (Helper.isEmpty(equipItem)) {
                return
            }

            // Convert Equip to Candidate Equip
            let candidateEquipItem = this.getCandidateEquipItem(equipType, equipItem)

            if (false === candidateEquipItem) {
                return
            }

            // Set Current Equip Mapping
            this.candidateEquipMapping[equipType].push(candidateEquipItem)

            // Set EquipMaxExpectedValue & EquipMaxExpectedLevel
            if (this.equipTypeMaxExpectedValue[equipType] < candidateEquipItem.totalExpectedValue) {
                this.equipTypeMaxExpectedValue[equipType] = candidateEquipItem.totalExpectedValue
            }

            if (this.equipTypeMaxExpectedLevel[equipType] < candidateEquipItem.totalExpectedLevel) {
                this.equipTypeMaxExpectedLevel[equipType] = candidateEquipItem.totalExpectedLevel
            }
        })

        // Set Empty Candidate Equip Item
        currentEquipTypes.forEach((equipType) => {
            this.candidateEquipMapping[equipType].push(this.getEmptyCandidateEquipItem(equipType))
        })

        // Create Equip Future Expected Value & Expected Level
        currentEquipTypes.forEach((equipTypeA, equipTypeIndex) => {
            currentEquipTypes.forEach((equipTypeB) => {
                if (-1 !== currentEquipTypes.slice(0, equipTypeIndex + 1).indexOf(equipTypeB)) {
                    return
                }

                this.equipTypeFutureExpectedValue[equipTypeA] += this.equipTypeMaxExpectedValue[equipTypeB]
                this.equipTypeFutureExpectedLevel[equipTypeA] += this.equipTypeMaxExpectedLevel[equipTypeB]
            })
        })
    }

    /**
     * Create Bundle List with Equips
     */
    createBundleListWithEquips = (bundle, algorithmParams) => {
        let traversalCount = 0
        let traversalPercent = 0
        let totalTraversalCount = 1

        const candidateEquipTypes = Object.keys(this.candidateEquipMapping)
        const candidateEquipList = Object.values(this.candidateEquipMapping).map((candidateEquipList) => {
            totalTraversalCount *= candidateEquipList.length

            return candidateEquipList.sort((candidateEquipItemA, candidateEquipItemB) => {
                return candidateEquipItemB.totalExpectedValue - candidateEquipItemA.totalExpectedValue
            })
        })

        let lastBundleMapping = {}

        // Special Case: 1
        if (1 === totalTraversalCount) {
            if (0 < this.currentSkillCount
                && false === this.isBundleSkillsCompleted(bundle)
            ) {
                let tempBundle = this.createBundleWithJewels(bundle)

                if (false !== tempBundle) {
                    lastBundleMapping[getBundleHash(tempBundle)] = tempBundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })
                }
            }

            return Object.values(lastBundleMapping)
        }

        // Special Case: 2
        if (0 < this.currentSetCount && this.isBundleSetsCompleted(bundle)) {
            if ( 0 < this.currentSkillCount
                && false === this.isBundleSkillsCompleted(bundle)
            ) {
                // Create Bundle With Jewels
                let tempBundle = this.createBundleWithJewels(bundle)

                if (false !== tempBundle) {
                    lastBundleMapping[getBundleHash(tempBundle)] = tempBundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })
                }
            }
        }

        let stackIndex = 0
        let statusStack = []
        let equipTypeIndex = null
        let equipItemIndex = null
        let candidateEquipItem = null

        // Push Root Bundle
        statusStack.push({
            bundle: bundle,
            equipTypeIndex: 0,
            equipItemIndex: 0
        })

        const calculateTraversalCount = () => {
            traversalCount = 1

            Object.keys(candidateEquipList).forEach((equipTypeIndex) => {
                let equipCount = candidateEquipList[equipTypeIndex].length

                traversalCount *= (equipTypeIndex <= stackIndex)
                    ? statusStack[equipTypeIndex].equipItemIndex + 1 : equipCount
            })

            let precent = traversalCount / totalTraversalCount

            if (parseInt(precent * 100) <= traversalPercent) {
                return
            }

            traversalPercent = parseInt(precent * 100)

            Helper.log(`FA: Equips: Traversal Count: ${traversalCount} / ${totalTraversalCount}`)

            let diffTime = parseInt(Math.floor(Date.now() / 1000), 10) - this.startTime

            this.callback({
                searchPercent: traversalPercent,
                timeRemaining: parseInt(diffTime / precent - diffTime)
            })
        }

        const findPrevEquipTypeAndNextEquipItem = () => {
            while (true) {
                stackIndex--
                statusStack.pop()

                if (0 === statusStack.length) {
                    break
                }

                equipTypeIndex = statusStack[stackIndex].equipTypeIndex
                equipItemIndex = statusStack[stackIndex].equipItemIndex

                if (Helper.isNotEmpty(candidateEquipList[equipTypeIndex][equipItemIndex + 1])) {
                    statusStack[equipTypeIndex].equipItemIndex++

                    calculateTraversalCount()

                    break
                }
            }
        }

        const findNextEquipItem = () => {
            equipTypeIndex = statusStack[stackIndex].equipTypeIndex

            if (Helper.isNotEmpty(candidateEquipList[equipTypeIndex][equipItemIndex + 1])) {
                statusStack[stackIndex].equipItemIndex++

                calculateTraversalCount()
            } else {
                findPrevEquipTypeAndNextEquipItem()
            }
        }

        const findNextEquipType = () => {
            equipTypeIndex = statusStack[stackIndex].equipTypeIndex

            if (Helper.isNotEmpty(candidateEquipList[equipTypeIndex + 1])) {
                stackIndex++
                statusStack.push({
                    bundle: bundle,
                    equipTypeIndex: equipTypeIndex + 1,
                    equipItemIndex: 0
                })
            } else {
                findNextEquipItem()
            }
        }

        // Helper.log('FA: CreateBundlesWithEquips: Root Bundle:', bundle)

        while (true) {
            if (0 === statusStack.length) {
                break
            }

            bundle = statusStack[stackIndex].bundle
            equipTypeIndex = statusStack[stackIndex].equipTypeIndex
            equipItemIndex = statusStack[stackIndex].equipItemIndex
            candidateEquipItem = candidateEquipList[equipTypeIndex][equipItemIndex]

            Helper.log(`FA: Equips: Stack Progress: ${equipTypeIndex} / ${equipItemIndex}`)

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquipItem)

            // If Add Candidate Equip Failed
            if (false === bundle) {
                findNextEquipItem()

                continue
            }

            // Check Bundle Sets
            if (this.isBundleSetsCompleted(bundle)) {

                // Check Bundle Skills
                if (this.isBundleSkillsCompleted(bundle)) {
                    lastBundleMapping[getBundleHash(bundle)] = bundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })

                    Helper.log('FA: Last Bundle Count:', Object.keys(lastBundleMapping).length)

                    if (algorithmParams.limit <= Object.keys(lastBundleMapping).length) {
                        break
                    }

                    findNextEquipItem()

                    continue
                }

                // Check Bundle Reach Expected
                if (this.isBundleReachExpected(bundle)) {

                    // Create Bundle With Jewels
                    bundle = this.createBundleWithJewels(bundle)

                    if (false !== bundle) {
                        lastBundleMapping[getBundleHash(bundle)] = bundle

                        this.callback({
                            bundleCount: Object.keys(lastBundleMapping).length
                        })

                        Helper.log('FA: Last Bundle Count:', Object.keys(lastBundleMapping).length)

                        if (algorithmParams.limit <= Object.keys(lastBundleMapping).length) {
                            break
                        }
                    }

                    findNextEquipItem()

                    continue
                }

                // Check Bundle Have a Future
                if (false === this.isBundleHaveFuture(bundle, candidateEquipTypes[equipTypeIndex])) {
                    findNextEquipItem()

                    continue
                }
            }

            findNextEquipType()
        }

        calculateTraversalCount()

        Helper.log('FA: Last Bundle Result:', lastBundleMapping)

        return Object.values(lastBundleMapping)
    }

    /**
     * Create Bundle with Jewels
     */
    createBundleWithJewels = (bundle) => {
        if (this.isBundleSkillsCompleted(bundle)) {
            return bundle
        }

        if (0 === bundle.meta.remainingSlotCountMapping.all) {
            return false
        }

        let lastBundle = null
        let jewelPackageMapping = []

        // Create Current Skill Ids and Convert Correspond Jewel Pool
        let currentCandidateJewelMapping = {}
        let slotMapping = {}

        for (let size of [1, 2, 3]) {
            currentCandidateJewelMapping[size] = []
            slotMapping[size] = null

            if (Helper.isNotEmpty(this.candidateJewelMapping[size])) {
                currentCandidateJewelMapping[size] = this.candidateJewelMapping[size].filter((jewelData) => {
                    let isSkip = false

                    jewelData.skills.forEach((skillData) => {
                        if (true === isSkip) {
                            return
                        }

                        if (Helper.isNotEmpty(bundle.meta.completedSkills[skillData.id])) {
                            isSkip = true

                            return
                        }
                    })

                    if (true === isSkip) {
                        return false
                    }

                    if (Helper.isEmpty(slotMapping[size])) {
                        slotMapping[size] = {
                            expectedValue: 0,
                            expectedLevel: 0
                        }
                    }

                    if (slotMapping[size].expectedValue < jewelData.expectedValue) {
                        slotMapping[size].expectedValue = jewelData.expectedValue
                    }

                    if (slotMapping[size].expectedLevel < jewelData.expectedLevel) {
                        slotMapping[size].expectedLevel = jewelData.expectedLevel
                    }

                    return true
                })
            }

            if (Helper.isEmpty(slotMapping[size]) && Helper.isNotEmpty(slotMapping[size - 1])) {
                slotMapping[size] = slotMapping[size - 1]
            }

            if (Helper.isEmpty(slotMapping[size])) {
                slotMapping[size] = {
                    expectedValue: 0,
                    expectedLevel: 0
                }
            }

            if (Helper.isNotEmpty(currentCandidateJewelMapping[size - 1])) {
                currentCandidateJewelMapping[size] = currentCandidateJewelMapping[size].concat(currentCandidateJewelMapping[size - 1])
            }
        }

        let slotSizeList = []

        for (let size = 3; size > 0; size--) {
            if (0 === bundle.meta.remainingSlotCountMapping[size]) {
                continue
            }

            for (let index = 0; index < bundle.meta.remainingSlotCountMapping[size]; index++) {
                slotSizeList.push(size)
            }
        }

        let stackIndex = 0
        let statusStack = []
        let slotIndex = null
        let slotSize = null
        let jewelIndex = null
        let candidateJewelItem = null

        // Push Root Bundle
        statusStack.push({
            bundle: bundle,
            slotIndex: 0,
            jewelIndex: 0
        })

        const findPrevSkillAndNextJewel = () => {
            while (true) {
                stackIndex--
                statusStack.pop()

                if (0 === statusStack.length) {
                    break
                }

                slotIndex = statusStack[stackIndex].slotIndex
                slotSize = slotSizeList[slotIndex]
                jewelIndex = statusStack[stackIndex].jewelIndex

                if (Helper.isNotEmpty(currentCandidateJewelMapping[slotSize][jewelIndex + 1])) {
                    statusStack[stackIndex].jewelIndex++

                    break
                }
            }
        }

        const findNextJewel = () => {
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            jewelIndex = statusStack[stackIndex].jewelIndex

            if (Helper.isNotEmpty(currentCandidateJewelMapping[slotSize][jewelIndex + 1])) {
                statusStack[stackIndex].jewelIndex++
            } else {
                findPrevSkillAndNextJewel()
            }
        }

        const findNextSlot = () => {
            slotIndex = statusStack[stackIndex].slotIndex

            if (Helper.isNotEmpty(slotSizeList[slotIndex + 1])) {
                stackIndex++
                statusStack.push({
                    bundle: bundle,
                    slotIndex: slotIndex + 1,
                    jewelIndex: 0
                })
            } else {
                findNextJewel()
            }
        }

        // Helper.log('FA: CreateBundlesWithJewels: Root Bundle:', bundle)

        while (true) {
            if (0 === statusStack.length) {
                break
            }

            bundle = statusStack[stackIndex].bundle
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            jewelIndex = statusStack[stackIndex].jewelIndex
            candidateJewelItem = currentCandidateJewelMapping[slotSize][jewelIndex]

            if (0 === bundle.meta.remainingSlotCountMapping.all) {
                findPrevSkillAndNextJewel()

                continue
            }

            if (0 === bundle.meta.remainingSlotCountMapping[slotSize]) {
                findNextSlot()

                continue
            }

            // Add Jewel To Bundle
            bundle = this.addCandidateJewelToBundle(bundle, slotSize, candidateJewelItem, true)

            if (false === bundle) {
                findNextJewel()

                continue
            }

            // Check Bundle Skills
            if (this.isBundleSkillsCompleted(bundle)) {
                if (Helper.isEmpty(lastBundle)) {
                    lastBundle = Helper.deepCopy(bundle)

                    delete lastBundle.jewelMapping
                }

                jewelPackageMapping[getBundleJewelHash(bundle)] = bundle.jewelMapping

                // Helper.log('FA: Last Package Count:', Object.keys(jewelPackageMapping).length)

                findPrevSkillAndNextJewel()

                continue
            }

            // Check Bundle Jewel Have a Future
            if (false === this.isBundleJewelHaveFuture(bundle, slotMapping)) {
                findNextJewel()

                continue
            }

            findNextSlot()
        }

        if (Helper.isEmpty(lastBundle)) {
            return false
        }

        // Replace Jewel Packages
        lastBundle.jewelPackages = Object.values(jewelPackageMapping)

        return lastBundle
    }

    /**
     * Create Sorted Bundle List
     */
    sortBundleList = (bundleList, algorithmParams) => {
        switch (algorithmParams.sort) {
        case 'complex':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = (8 - bundleA.meta.equipCount) * 1000 + bundleA.meta.defense
                let valueB = (8 - bundleB.meta.equipCount) * 1000 + bundleB.meta.defense

                return ('asc' === algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: algorithmParams.sort,
                    value: (8 - bundle.meta.equipCount) * 1000 + bundle.meta.defense
                }

                return bundle
            })
        case 'amount':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.equipCount
                let valueB = bundleB.meta.equipCount

                return ('asc' === algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: algorithmParams.sort,
                    value: bundle.meta.equipCount
                }

                return bundle
            })
        case 'defense':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.defense
                let valueB = bundleB.meta.defense

                return ('asc' === algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: algorithmParams.sort,
                    value: bundle.meta.defense
                }

                return bundle
            })
        case 'fire':
        case 'water':
        case 'thunder':
        case 'ice':
        case 'dragon':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.resistance[algorithmParams.sort]
                let valueB = bundleB.meta.resistance[algorithmParams.sort]

                return ('asc' === algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: algorithmParams.sort,
                    value: bundle.meta.resistance[algorithmParams.sort]
                }

                return bundle
            })
        default:
            return bundleList
        }
    }

    /**
     * Get Candidate Equip Item
     */
     getCandidateEquipItem = (equipType, equipItem) => {
        let candidateEquipItem = Helper.deepCopy(defaultCandidateEquipItem)

        // Set Id, Type & Defense
        candidateEquipItem.id = equipItem.id
        candidateEquipItem.type = ('charm' !== equipType && 'weapon' !== equipType) ? equipItem.type : equipType
        candidateEquipItem.defense = Helper.isNotEmpty(equipItem.defense) ? equipItem.defense : 0
        candidateEquipItem.resistance = Helper.isNotEmpty(equipItem.resistance) ? equipItem.resistance : candidateEquipItem.resistance
        candidateEquipItem.setId = equipItem.seriesId // SeriesId is SetId

        if (Helper.isEmpty(equipItem.skills)) {
            equipItem.skills = []
        }

        if (Helper.isEmpty(equipItem.slots)) {
            equipItem.slots = []
        }

        equipItem.skills.forEach((skillData) => {

            // Increase Skill Level
            candidateEquipItem.skillLevelMapping[skillData.id] = skillData.level

            if (Helper.isEmpty(this.skillMetaMapping[skillData.id])) {
                return
            }

            // Increase Expected Value & Level
            let expectedValue = skillData.level * this.skillMetaMapping[skillData.id].jewelSize
            let expectedLevel = skillData.level

            candidateEquipItem.totalExpectedValue += expectedValue
            candidateEquipItem.totalExpectedLevel += expectedLevel
            candidateEquipItem.skillExpectedValue += expectedValue
            candidateEquipItem.skillExpectedLevel += expectedLevel
        })

        equipItem.slots.forEach((slotData) => {
            candidateEquipItem.slotCountMapping[slotData.size] += 1

            // Increase Expected Value & Level
            candidateEquipItem.totalExpectedValue += this.slotMetaMapping[slotData.size].expectedValue
            candidateEquipItem.totalExpectedLevel += this.slotMetaMapping[slotData.size].expectedLevel
        })

        return candidateEquipItem
    }

    /**
     * Get Empty Candidate Equip Item
     */
    getEmptyCandidateEquipItem = (equipType) => {
        let candidateEquipItem = Helper.deepCopy(defaultCandidateEquipItem)

        candidateEquipItem.id = 'empty'
        candidateEquipItem.type = equipType

        return candidateEquipItem
    }

    /**
     * Add Candidate Equip To Bundle
     */
    addCandidateEquipToBundle = (bundle, candidateEquipItem) => {
        if (Helper.isEmpty(candidateEquipItem.id)) {
            return false
        }

        if (Helper.isNotEmpty(bundle.equipIdMapping[candidateEquipItem.type])) {
            return false
        }

        bundle = Helper.deepCopy(bundle)
        bundle.equipIdMapping[candidateEquipItem.type] = candidateEquipItem.id

        // Increase Skill Level
        let isSkillLevelOverflow = false

        Object.keys(candidateEquipItem.skillLevelMapping).forEach((skillId) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillId])) {
                bundle.skillLevelMapping[skillId] = 0
            }

            bundle.skillLevelMapping[skillId] += candidateEquipItem.skillLevelMapping[skillId]

            if (Helper.isNotEmpty(this.skillMetaMapping[skillId])) {
                if (this.skillMetaMapping[skillId].level < bundle.skillLevelMapping[skillId]) {
                    isSkillLevelOverflow = true
                }

                if (this.skillMetaMapping[skillId].level === bundle.skillLevelMapping[skillId]) {
                    bundle.meta.completedSkills[skillId] = true
                }
            }
        })

        if (true === isSkillLevelOverflow) {
            return false
        }

        // Increase Set Count
        let isSetRequireOverflow = false

        if (Helper.isNotEmpty(candidateEquipItem.setId)) {
            if (Helper.isEmpty(bundle.setCountMapping[candidateEquipItem.setId])) {
                bundle.setCountMapping[candidateEquipItem.setId] = 0
            }

            bundle.setCountMapping[candidateEquipItem.setId] += 1

            if (Helper.isNotEmpty(this.setMetaMapping[candidateEquipItem.setId])) {
                if (this.setMetaMapping[candidateEquipItem.setId].count < bundle.setCountMapping[candidateEquipItem.setId]) {
                    isSetRequireOverflow = true
                }

                if (this.setMetaMapping[candidateEquipItem.setId].count === bundle.setCountMapping[candidateEquipItem.setId]) {
                    bundle.meta.completedSets[candidateEquipItem.setId] = true
                }
            }
        }

        if (true === isSetRequireOverflow) {
            return false
        }

        // Increase Slot Count
        for (let size = 1; size <= 3; size++) {
            bundle.slotCountMapping[size] += candidateEquipItem.slotCountMapping[size]

            bundle.meta.remainingSlotCountMapping[size] += candidateEquipItem.slotCountMapping[size]
            bundle.meta.remainingSlotCountMapping.all += candidateEquipItem.slotCountMapping[size]
        }

        // Increase Defense & Resistances
        bundle.meta.defense += candidateEquipItem.defense
        bundle.meta.resistance.fire += candidateEquipItem.resistance.fire
        bundle.meta.resistance.water += candidateEquipItem.resistance.water
        bundle.meta.resistance.thunder += candidateEquipItem.resistance.thunder
        bundle.meta.resistance.ice += candidateEquipItem.resistance.ice
        bundle.meta.resistance.dragon += candidateEquipItem.resistance.dragon

        // Increase Equip Count
        bundle.meta.equipCount += 1

        // Increase Expected Value & Level
        bundle.meta.totalExpectedValue += candidateEquipItem.totalExpectedValue
        bundle.meta.totalExpectedLevel += candidateEquipItem.totalExpectedLevel
        bundle.meta.skillExpectedValue += candidateEquipItem.skillExpectedValue
        bundle.meta.skillExpectedLevel += candidateEquipItem.skillExpectedLevel

        return bundle
    }

    /**
     * Get Candidate Jewel Item
     */
    getCandidateJewelItem = (jewelItem, algorithmParams) => {

        // Create Infos
        let expectedValue = 0
        let expectedLevel = 0

        let jewelSkills = jewelItem.skills.map((skillData) => {
            if (Helper.isNotEmpty(this.skillMetaMapping[skillData.id])) {
                expectedValue += skillData.level * this.skillMetaMapping[skillData.id].jewelSize
                expectedLevel += skillData.level
            }

            return {
                id: skillData.id,
                level: skillData.level
            }
        })

        if (this.slotMetaMapping[jewelItem.size].expectedValue < expectedValue) {
            this.slotMetaMapping[jewelItem.size].expectedValue = expectedValue
        }

        if (this.slotMetaMapping[jewelItem.size].expectedLevel < expectedLevel) {
            this.slotMetaMapping[jewelItem.size].expectedLevel = expectedLevel
        }

        let jewelCountLimit = null

        if (-1 !== algorithmParams.usingFactor['jewel:id:' + jewelItem.id]) {
            jewelCountLimit = algorithmParams.usingFactor['jewel:id:' + jewelItem.id]
        }

        return {
            id: jewelItem.id,
            size: jewelItem.size,
            skills: jewelSkills,
            countLimit: jewelCountLimit,
            expectedValue: expectedValue,
            expectedLevel: expectedLevel
        }
    }

    /**
     * Add Jewel to Bundle
     */
    addCandidateJewelToBundle = (bundle, slotSize, candidateJewelItem, hasJewelCountLimit = false) => {

        // Check Correspond Jewel
        if (Helper.isEmpty(candidateJewelItem)) {
            return false
        }

        // Check Jewel Limit
        if (Helper.isNotEmpty(bundle.jewelMapping)
            && Helper.isNotEmpty(bundle.jewelMapping[candidateJewelItem.id])
            && candidateJewelItem.countLimit === bundle.jewelMapping[candidateJewelItem.id]
        ) {
            return false
        }

        // Check Jewel Count
        let isSkip = false
        let jewelCount = bundle.meta.remainingSlotCountMapping[slotSize]

        candidateJewelItem.skills.forEach((skillData) => {
            if (true === isSkip) {
                return
            }

            if (Helper.isNotEmpty(bundle.meta.completedSkills[skillData.id])) {
                isSkip = true

                return
            }

            let diffSkillLevel = this.skillMetaMapping[skillData.id].level - bundle.skillLevelMapping[skillData.id]
            let diffJewelCount = parseInt(diffSkillLevel / skillData.level, 10)

            if (jewelCount > diffJewelCount) {
                jewelCount = diffJewelCount
            }
        })

        if (true === isSkip) {
            return false
        }

        if (null !== candidateJewelItem.countLimit && jewelCount > candidateJewelItem.countLimit) {
            jewelCount = candidateJewelItem.countLimit
        }

        if (0 === jewelCount) {
            return false
        }

        // If jewel count force set 1, then will show all combination
        if (hasJewelCountLimit) {
            jewelCount = 1
        }

        // Increase Jewels
        bundle = Helper.deepCopy(bundle)

        if (Helper.isEmpty(bundle.jewelMapping)) {
            bundle.jewelMapping = {}
        }

        if (Helper.isEmpty(bundle.jewelMapping[candidateJewelItem.id])) {
            bundle.jewelMapping[candidateJewelItem.id] = 0
        }

        bundle.jewelMapping[candidateJewelItem.id] += jewelCount

        // Increase Skill Level
        candidateJewelItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillData.id])) {
                return
            }

            bundle.skillLevelMapping[skillData.id] += jewelCount * skillData.level

            if (this.skillMetaMapping[skillData.id].level === bundle.skillLevelMapping[skillData.id]) {
                bundle.meta.completedSkills[skillData.id] = true
            }
        })

        // Decrease Slot Counts
        bundle.meta.remainingSlotCountMapping[slotSize] -= jewelCount
        bundle.meta.remainingSlotCountMapping.all -= jewelCount

        // Increase Expected Value & Level
        let expectedValue = jewelCount * candidateJewelItem.expectedValue
        let expectedLevel = jewelCount * candidateJewelItem.expectedLevel

        bundle.meta.skillExpectedValue += expectedValue
        bundle.meta.skillExpectedLevel += expectedLevel

        return bundle
    }

    /**
     * Is Bundle Equips Full
     */
    isBundleEquipsFull = (bundle) => {
        return this.currentEquipCount === bundle.meta.equipCount
    }

    /**
     * Is Bundle Set Compeleted
     */
    isBundleSetsCompleted = (bundle) => {
        return this.currentSetCount === Object.keys(bundle.meta.completedSets).length
    }

    /**
     * Is Bundle Skill Compeleted
     */
    isBundleSkillsCompleted = (bundle) => {
        return this.currentSkillCount === Object.keys(bundle.meta.completedSkills).length
    }

    /**
     * Is Bundle Reach Expected
     */
    isBundleReachExpected = (bundle) => {
        return this.skillTotalExpectedValue <= bundle.meta.totalExpectedValue
            && this.skillTotalExpectedLevel <= bundle.meta.totalExpectedLevel
    }

    /**
     * Is Bundle Have Future
     *
     * This is magic function, which is see through the future,
     * maybe will lost some results.
     */
    isBundleHaveFuture = (bundle, equipType) => {
        let expectedValue = bundle.meta.totalExpectedValue + this.equipTypeFutureExpectedValue[equipType]
        let expectedLevel = bundle.meta.totalExpectedLevel + this.equipTypeFutureExpectedLevel[equipType]

        return this.skillTotalExpectedValue <= expectedValue
            && this.skillTotalExpectedLevel <= expectedLevel
    }

    /**
     * Is Bundle Jewel Have Future
     *
     * This is magic function, which is see through the future,
     * maybe will lost some results.
     */
    isBundleJewelHaveFuture = (bundle, slotMapping) => {
        let expectedValue = bundle.meta.skillExpectedValue
        let expectedLevel = bundle.meta.skillExpectedLevel

        for (let size of [3, 2, 1]) {
            let slotCount = bundle.meta.remainingSlotCountMapping[size]

            if (0 === bundle.meta.remainingSlotCountMapping[size]) {
                continue
            }

            expectedValue += slotCount * slotMapping[size].expectedValue
            expectedLevel += slotCount * slotMapping[size].expectedLevel
        }

        return this.skillTotalExpectedValue <= expectedValue
            && this.skillTotalExpectedLevel <= expectedLevel
    }
}

export default new FittingAlgorithm()
