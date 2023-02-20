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
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/misc'
import ArmorDataset from '@/scripts/libraries/dataset/armor'
import SetDataset from '@/scripts/libraries/dataset/set'
import DecorationDataset from '@/scripts/libraries/dataset/decoration'

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
        3: 0,
        4: 0
    },
    decorationPackages: [],
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
            4: 0,
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
        3: 0,
        4: 0
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

const getBundleDecorationHash = (bundle) => {
    let decorationMapping = {}

    Object.keys(bundle.decorationMapping).sort().forEach((decorationId) => {
        if (0 === bundle.decorationMapping[decorationId]) {
            return
        }

        decorationMapping[decorationId] = bundle.decorationMapping[decorationId]
    })

    return md5(JSON.stringify(decorationMapping))
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
            3: { expectedValue: 0, expectedLevel: 0 },
            4: { expectedValue: 0, expectedLevel: 0 }
        }

        this.candidateEquipMapping = {}
        this.candidateDecorationMapping = {
            1: [], 2: [], 3: [], 4: []
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
        Helper.log('FA: Global: Candidate Decoration Mapping:', this.candidateDecorationMapping)

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
        let decorationList = Misc.getDecorationListByRequiredConditions(requiredConditions)

        let requiredSkillIds = []

        // 計算技能的期望數值
        requiredConditions.skills.sort((skillDataA, skillDataB) => {
            return skillDataB.level - skillDataA.level
        }).forEach((skillData) => {
            this.skillMetaMapping[skillData.id] = {
                level: skillData.level,
                decorationSize: 0
            }

            // 不允許出現的技能
            if (0 === this.skillMetaMapping[skillData.id].level) {
                return
            }

            requiredSkillIds.push(skillData.id)

            DecorationDataset.hasSkill(skillData.id).getList().forEach((decorationItem) => {
                this.skillMetaMapping[skillData.id].decorationSize = decorationItem.size
            })

            // Increase Expected Value & Level
            this.skillTotalExpectedValue += skillData.level * this.skillMetaMapping[skillData.id].decorationSize
            this.skillTotalExpectedLevel += skillData.level
        })

        decorationList.forEach((decorationItem) => {
            if (false === algorithmParams.usingFactor['decoration:size:' + decorationItem.size]) {
                return
            }

            if (Helper.isEmpty(algorithmParams.usingFactor['decoration:id:' + decorationItem.id])) {
                algorithmParams.usingFactor['decoration:id:' + decorationItem.id] = -1
            }

            // 限制可用裝飾珠數量
            if (0 === algorithmParams.usingFactor['decoration:id:' + decorationItem.id]) {
                return
            }

            let candidateDecorationItem = this.getCandidateDecorationItem(decorationItem, algorithmParams)

            if (Helper.isEmpty(candidateDecorationItem)) {
                return
            }

            this.candidateDecorationMapping[decorationItem.size].push(candidateDecorationItem)
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
                let tempBundle = this.createBundleWithDecorations(bundle)

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
                // Create Bundle With Decorations
                let tempBundle = this.createBundleWithDecorations(bundle)

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

                    // Create Bundle With Decorations
                    bundle = this.createBundleWithDecorations(bundle)

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
     * Create Bundle with Decorations
     */
    createBundleWithDecorations = (bundle) => {
        if (this.isBundleSkillsCompleted(bundle)) {
            return bundle
        }

        if (0 === bundle.meta.remainingSlotCountMapping.all) {
            return false
        }

        let lastBundle = null
        let decorationPackageMapping = []

        // Create Current Skill Ids and Convert Correspond Decoration Pool
        let currentCandidateDecorationMapping = {}
        let slotMapping = {}

        for (let size of [ 1, 2, 3, 4 ]) {
            currentCandidateDecorationMapping[size] = []
            slotMapping[size] = null

            if (Helper.isNotEmpty(this.candidateDecorationMapping[size])) {
                currentCandidateDecorationMapping[size] = this.candidateDecorationMapping[size].filter((decorationData) => {
                    let isSkip = false

                    decorationData.skills.forEach((skillData) => {
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

                    if (slotMapping[size].expectedValue < decorationData.expectedValue) {
                        slotMapping[size].expectedValue = decorationData.expectedValue
                    }

                    if (slotMapping[size].expectedLevel < decorationData.expectedLevel) {
                        slotMapping[size].expectedLevel = decorationData.expectedLevel
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

            if (Helper.isNotEmpty(currentCandidateDecorationMapping[size - 1])) {
                currentCandidateDecorationMapping[size] = currentCandidateDecorationMapping[size].concat(currentCandidateDecorationMapping[size - 1])
            }
        }

        let slotSizeList = []

        for (let size = 4; size > 0; size--) {
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
        let decorationIndex = null
        let candidateDecorationItem = null

        // Push Root Bundle
        statusStack.push({
            bundle: bundle,
            slotIndex: 0,
            decorationIndex: 0
        })

        const findPrevSkillAndNextDecoration = () => {
            while (true) {
                stackIndex--
                statusStack.pop()

                if (0 === statusStack.length) {
                    break
                }

                slotIndex = statusStack[stackIndex].slotIndex
                slotSize = slotSizeList[slotIndex]
                decorationIndex = statusStack[stackIndex].decorationIndex

                if (Helper.isNotEmpty(currentCandidateDecorationMapping[slotSize][decorationIndex + 1])) {
                    statusStack[stackIndex].decorationIndex++

                    break
                }
            }
        }

        const findNextDecoration = () => {
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            decorationIndex = statusStack[stackIndex].decorationIndex

            if (Helper.isNotEmpty(currentCandidateDecorationMapping[slotSize][decorationIndex + 1])) {
                statusStack[stackIndex].decorationIndex++
            } else {
                findPrevSkillAndNextDecoration()
            }
        }

        const findNextSlot = () => {
            slotIndex = statusStack[stackIndex].slotIndex

            if (Helper.isNotEmpty(slotSizeList[slotIndex + 1])) {
                stackIndex++
                statusStack.push({
                    bundle: bundle,
                    slotIndex: slotIndex + 1,
                    decorationIndex: 0
                })
            } else {
                findNextDecoration()
            }
        }

        // Helper.log('FA: CreateBundlesWithDecorations: Root Bundle:', bundle)

        while (true) {
            if (0 === statusStack.length) {
                break
            }

            bundle = statusStack[stackIndex].bundle
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            decorationIndex = statusStack[stackIndex].decorationIndex
            candidateDecorationItem = currentCandidateDecorationMapping[slotSize][decorationIndex]

            if (0 === bundle.meta.remainingSlotCountMapping.all) {
                findPrevSkillAndNextDecoration()

                continue
            }

            if (0 === bundle.meta.remainingSlotCountMapping[slotSize]) {
                findNextSlot()

                continue
            }

            // Add Decoration To Bundle
            bundle = this.addCandidateDecorationToBundle(bundle, slotSize, candidateDecorationItem, true)

            if (false === bundle) {
                findNextDecoration()

                continue
            }

            // Check Bundle Skills
            if (this.isBundleSkillsCompleted(bundle)) {
                if (Helper.isEmpty(lastBundle)) {
                    lastBundle = Helper.deepCopy(bundle)

                    delete lastBundle.decorationMapping
                }

                decorationPackageMapping[getBundleDecorationHash(bundle)] = bundle.decorationMapping

                // Helper.log('FA: Last Package Count:', Object.keys(decorationPackageMapping).length)

                findPrevSkillAndNextDecoration()

                continue
            }

            // Check Bundle Decoration Have a Future
            if (false === this.isBundleDecorationHaveFuture(bundle, slotMapping)) {
                findNextDecoration()

                continue
            }

            findNextSlot()
        }

        if (Helper.isEmpty(lastBundle)) {
            return false
        }

        // Replace Decoration Packages
        lastBundle.decorationPackages = Object.values(decorationPackageMapping)

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
            let expectedValue = skillData.level * this.skillMetaMapping[skillData.id].decorationSize
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
        for (let size = 1; size <= 4; size++) {
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
     * Get Candidate Decoration Item
     */
    getCandidateDecorationItem = (decorationItem, algorithmParams) => {

        // Create Infos
        let expectedValue = 0
        let expectedLevel = 0

        let decorationSkills = decorationItem.skills.map((skillData) => {
            if (Helper.isNotEmpty(this.skillMetaMapping[skillData.id])) {
                expectedValue += skillData.level * this.skillMetaMapping[skillData.id].decorationSize
                expectedLevel += skillData.level
            }

            return {
                id: skillData.id,
                level: skillData.level
            }
        })

        if (this.slotMetaMapping[decorationItem.size].expectedValue < expectedValue) {
            this.slotMetaMapping[decorationItem.size].expectedValue = expectedValue
        }

        if (this.slotMetaMapping[decorationItem.size].expectedLevel < expectedLevel) {
            this.slotMetaMapping[decorationItem.size].expectedLevel = expectedLevel
        }

        let decorationCountLimit = null

        if (-1 !== algorithmParams.usingFactor['decoration:id:' + decorationItem.id]) {
            decorationCountLimit = algorithmParams.usingFactor['decoration:id:' + decorationItem.id]
        }

        return {
            id: decorationItem.id,
            size: decorationItem.size,
            skills: decorationSkills,
            countLimit: decorationCountLimit,
            expectedValue: expectedValue,
            expectedLevel: expectedLevel
        }
    }

    /**
     * Add Decoration to Bundle
     */
    addCandidateDecorationToBundle = (bundle, slotSize, candidateDecorationItem, hasDecorationCountLimit = false) => {

        // Check Correspond Decoration
        if (Helper.isEmpty(candidateDecorationItem)) {
            return false
        }

        // Check Decoration Limit
        if (Helper.isNotEmpty(bundle.decorationMapping)
            && Helper.isNotEmpty(bundle.decorationMapping[candidateDecorationItem.id])
            && candidateDecorationItem.countLimit === bundle.decorationMapping[candidateDecorationItem.id]
        ) {
            return false
        }

        // Check Decoration Count
        let isSkip = false
        let decorationCount = bundle.meta.remainingSlotCountMapping[slotSize]

        candidateDecorationItem.skills.forEach((skillData) => {
            if (true === isSkip) {
                return
            }

            if (Helper.isNotEmpty(bundle.meta.completedSkills[skillData.id])) {
                isSkip = true

                return
            }

            let diffSkillLevel = this.skillMetaMapping[skillData.id].level - bundle.skillLevelMapping[skillData.id]
            let diffDecorationCount = parseInt(diffSkillLevel / skillData.level, 10)

            if (decorationCount > diffDecorationCount) {
                decorationCount = diffDecorationCount
            }
        })

        if (true === isSkip) {
            return false
        }

        if (null !== candidateDecorationItem.countLimit && decorationCount > candidateDecorationItem.countLimit) {
            decorationCount = candidateDecorationItem.countLimit
        }

        if (0 === decorationCount) {
            return false
        }

        // If decoration count force set 1, then will show all combination
        if (hasDecorationCountLimit) {
            decorationCount = 1
        }

        // Increase Decorations
        bundle = Helper.deepCopy(bundle)

        if (Helper.isEmpty(bundle.decorationMapping)) {
            bundle.decorationMapping = {}
        }

        if (Helper.isEmpty(bundle.decorationMapping[candidateDecorationItem.id])) {
            bundle.decorationMapping[candidateDecorationItem.id] = 0
        }

        bundle.decorationMapping[candidateDecorationItem.id] += decorationCount

        // Increase Skill Level
        candidateDecorationItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillData.id])) {
                return
            }

            bundle.skillLevelMapping[skillData.id] += decorationCount * skillData.level

            if (this.skillMetaMapping[skillData.id].level === bundle.skillLevelMapping[skillData.id]) {
                bundle.meta.completedSkills[skillData.id] = true
            }
        })

        // Decrease Slot Counts
        bundle.meta.remainingSlotCountMapping[slotSize] -= decorationCount
        bundle.meta.remainingSlotCountMapping.all -= decorationCount

        // Increase Expected Value & Level
        let expectedValue = decorationCount * candidateDecorationItem.expectedValue
        let expectedLevel = decorationCount * candidateDecorationItem.expectedLevel

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
     * Is Bundle Decoration Have Future
     *
     * This is magic function, which is see through the future,
     * maybe will lost some results.
     */
    isBundleDecorationHaveFuture = (bundle, slotMapping) => {
        let expectedValue = bundle.meta.skillExpectedValue
        let expectedLevel = bundle.meta.skillExpectedLevel

        for (let size of [ 4, 3, 2, 1 ]) {
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
