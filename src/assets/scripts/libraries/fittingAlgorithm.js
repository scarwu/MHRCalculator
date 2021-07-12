/**
 * Fitting Algorithm
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import md5 from 'md5'

// Load Constant
import Constant from 'constant'

// Load Core
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import ArmorDataset from 'libraries/dataset/armor'
import SetDataset from 'libraries/dataset/set'
import JewelDataset from 'libraries/dataset/jewel'

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

        Helper.log('FA: Input: Required Equips', requiredConditions.equips)
        Helper.log('FA: Input: Required Sets', requiredConditions.sets)
        Helper.log('FA: Input: Required Skills', requiredConditions.skills)
        Helper.log('FA: Input: Algorithm Params', algorithmParams)

        // Set Properties
        this.algorithmParams = Helper.deepCopy(algorithmParams)
        this.callback = callback

        this.currentEquipTypes = []
        this.currentSetMapping = {}
        this.currentSkillMapping = {}
        this.currentSlotMapping = {
            1: { expectedValue: 0, expectedLevel: 0 },
            2: { expectedValue: 0, expectedLevel: 0 },
            3: { expectedValue: 0, expectedLevel: 0 }
        }
        this.totalExpectedValue = 0
        this.totalExpectedLevel = 0

        this.correspondJewels = {}
        this.firstBundle = {}
        this.usedEquipIds = {}

        this.equipMaxExpectedValue = {}
        this.equipMaxExpectedLevel = {}
        this.equipFutureExpectedValue = {}
        this.equipFutureExpectedLevel = {}

        // Init Condtions
        this.isInitFailed = false

        this.initConditionSkills(requiredConditions.skills)
        this.initConditionSets(requiredConditions.sets)
        this.initConditionEquips(requiredConditions.equips)

        if (this.isInitFailed) {
            Helper.log('FA: Init: Failed')

            return []
        }

        this.currentEquipCount = this.currentEquipTypes.length
        this.currentSetCount = Object.keys(this.currentSetMapping).length
        this.currentSkillCount = Object.keys(this.currentSkillMapping).length

        // Print Init
        Helper.log('FA: Global: Current Equip Types:', this.currentEquipTypes)
        Helper.log('FA: Global: Current Set Mapping:', this.currentSetMapping)
        Helper.log('FA: Global: Current Skill Mapping:', this.currentSkillMapping)
        Helper.log('FA: Global: Current Slot Mapping:', this.currentSlotMapping)
        Helper.log('FA: Global: Correspond Jewels:', this.correspondJewels)
        Helper.log('FA: Global: Total Expected Value:', this.totalExpectedValue)
        Helper.log('FA: Global: Total Expected Level:', this.totalExpectedLevel)
        Helper.log('FA: Global: First Bundle:', this.firstBundle)

        if (0 === this.currentSetCount && 0 === this.currentSkillCount) {
            return []
        }

        // Save StartTime
        this.startTime = parseInt(Math.floor(Date.now() / 1000), 10)

        // Create Bundles with Equips
        let bundleList = this.createBundleListWithEquips(this.firstBundle)

        this.callback({
            bundleCount: bundleList.length,
            searchPercent: 100,
            timeRemaining: 0
        })

        // Sort Bundle List & Clean up
        return this.sortBundleList(bundleList).map((bundle) => {
            delete bundle.meta.completedSets
            delete bundle.meta.completedSkills
            delete bundle.meta.remainingSlotCountMapping
            delete bundle.meta.totalExpectedValue
            delete bundle.meta.totalExpectedLevel
            delete bundle.meta.skillExpectedValue
            delete bundle.meta.skillExpectedLevel

            bundle.hash = this.getBundleHash(bundle)

            return bundle
        })
    }

    /**
     * Generate Bundle Hash
     */
    getBundleHash = (bundle) => {
        let equipMapping = {}

        Object.keys(bundle.equipIdMapping).forEach((equipType) => {
            if (Helper.isEmpty(bundle.equipIdMapping[equipType])) {
                return
            }

            equipMapping[equipType] = bundle.equipIdMapping[equipType]
        })

        return md5(JSON.stringify(equipMapping))
    }

    /**
     * Generate Bundle Jewel Hash
     */
    getBundleJewelHash = (bundle) => {
        let jewelMapping = {}

        Object.keys(bundle.jewelMapping).sort().forEach((jewelId) => {
            if (0 === bundle.jewelMapping[jewelId]) {
                return
            }

            jewelMapping[jewelId] = bundle.jewelMapping[jewelId]
        })

        return md5(JSON.stringify(jewelMapping))
    }

    /**
     * Init Condition Skills
     */
    initConditionSkills = (requiredSkills) => {
        let requiredSkillIds = []

        requiredSkills.sort((skillA, skillB) => {
            return skillB.level - skillA.level
        }).forEach((skill) => {
            this.currentSkillMapping[skill.id] = {
                level: skill.level,
                jewelSize: 0
            }

            if (0 === this.currentSkillMapping[skill.id].level) {
                return
            }

            requiredSkillIds.push(skill.id)

            JewelDataset.hasSkill(skill.id).getList().forEach((jewelItem) => {
                if (4 === jewelItem.size) {
                    return
                }

                this.currentSkillMapping[skill.id].jewelSize = jewelItem.size
            })

            // Increase Expected Value & Level
            this.totalExpectedValue += skill.level * this.currentSkillMapping[skill.id].jewelSize
            this.totalExpectedLevel += skill.level
        })

        JewelDataset.hasSkills(requiredSkillIds, true).getList().forEach((jewelItem) => {
            let isSkip = false

            jewelItem.skills.forEach((skillData) => {
                if (true === isSkip) {
                    return
                }

                if (0 === this.currentSkillMapping[skillData.id].level) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            // Check is Using Factor Jewel
            if (false === this.algorithmParams.usingFactor['jewel:size:' + jewelItem.size]) {
                return
            }

            if (Helper.isEmpty(this.algorithmParams.usingFactor['jewel:id:' + jewelItem.id])) {
                this.algorithmParams.usingFactor['jewel:id:' + jewelItem.id] = -1
            }

            if (0 === this.algorithmParams.usingFactor['jewel:id:' + jewelItem.id]) {
                return
            }

            // Create Infos
            let expectedValue = 0
            let expectedLevel = 0

            let jewelSkills = jewelItem.skills.map((skill) => {
                expectedValue += skill.level * this.currentSkillMapping[skill.id].jewelSize
                expectedLevel += skill.level

                return {
                    id: skill.id,
                    level: skill.level
                }
            })

            if (this.currentSlotMapping[jewelItem.size].expectedValue < expectedValue) {
                this.currentSlotMapping[jewelItem.size].expectedValue = expectedValue
            }

            if (this.currentSlotMapping[jewelItem.size].expectedLevel < expectedLevel) {
                this.currentSlotMapping[jewelItem.size].expectedLevel = expectedLevel
            }

            if (Helper.isEmpty(this.correspondJewels[jewelItem.size])) {
                this.correspondJewels[jewelItem.size] = []
            }

            let jewelCountLimit = null

            if (-1 !== this.algorithmParams.usingFactor['jewel:id:' + jewelItem.id]) {
                jewelCountLimit = this.algorithmParams.usingFactor['jewel:id:' + jewelItem.id]
            }

            this.correspondJewels[jewelItem.size].push({
                id: jewelItem.id,
                size: jewelItem.size,
                skills: jewelSkills,
                countLimit: jewelCountLimit,
                expectedValue: expectedValue,
                expectedLevel: expectedLevel
            })
        })

        Object.keys(this.currentSlotMapping).forEach((size) => {
            size = parseInt(size, 10)

            if (1 === size) {
                return
            }

            if (Helper.isNotEmpty(this.currentSlotMapping[size])) {
                return
            }

            this.currentSlotMapping[size] = this.currentSlotMapping[size - 1]
        })
    }

    /**
     * Init Condition Sets
     */
    initConditionSets = (requiredSets) => {
        requiredSets.sort((setDataA, setDataB) => {
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

            this.currentSetMapping[setData.id] = {
                count: setData.count
            }
        })
    }

    /**
     * Init Condition Equips
     */
    initConditionEquips = (requiredEquips) => {
        if (this.isInitFailed) {
            return
        }

        let bundle = Helper.deepCopy(Constant.defaultBundle)

        // Create First Bundle
        for (let equipType of ['weapon', 'helm', 'chest', 'arm', 'waist', 'leg', 'charm']) {
            if (this.isInitFailed) {
                continue
            }

            if (Helper.isEmpty(requiredEquips[equipType]) || Helper.isEmpty(requiredEquips[equipType].id)) {
                if ('weapon' !== equipType && 'charm' !== equipType) {
                    this.currentEquipTypes.push(equipType)
                }

                continue
            }

            // Get Equip Info
            let equipExtendItem = Misc.getEquipExtendItem(equipType, requiredEquips[equipType])

            // Check Equip Info
            if (Helper.isEmpty(equipExtendItem)) {
                continue
            }

            // Convert Equip to Candidate Equip
            let candidateEquipItem = this.convertEquipItemToCandidateEquipItem(equipExtendItem, equipType)

            if (false === candidateEquipItem) {
                continue
            }

            // Set Used Candidate Equip
            this.usedEquipIds[candidateEquipItem.id] = true

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquipItem)

            if (false === bundle) {
                this.isInitFailed = true

                continue
            }
        }

        if (this.isInitFailed) {
            return
        }

        // Reset Equip Count
        bundle.meta.equipCount = 0

        Object.keys(this.currentSkillMapping).forEach((skillId) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillId])) {
                bundle.skillLevelMapping[skillId] = 0
            }
        })

        this.firstBundle = bundle
    }

    /**
     * Create Bundle List with Equips
     */
    createBundleListWithEquips = (bundle) => {
        let candidateEquipItemPool = {}
        let lastBundleMapping = {}

        this.currentEquipTypes.forEach((equipType) => {
            if (Helper.isEmpty(candidateEquipItemPool[equipType])) {
                candidateEquipItemPool[equipType] = {}
            }

            // Create Set Equips
            Object.keys(this.currentSetMapping).forEach((setId) => {
                let setItem = SetDataset.getItem(setId)

                setItem.items.forEach((armorData) => {
                    if (armorData.type !== equipType) {
                        return
                    }

                    let equipItem = ArmorDataset.getItem(armorData.id)

                    // Merge Candidate Equips
                    candidateEquipItemPool[equipType] = Object.assign(
                        candidateEquipItemPool[equipType],
                        this.createCandidateEquips([equipItem], equipType)
                    )
                })
            })

            // Create Skill Equips
            Object.keys(this.currentSkillMapping).forEach((skillId) => {
                let equipItems = null

                // Armor with Skills
                equipItems = ArmorDataset.typeIs(equipType).hasSkill(skillId).getList()

                // Merge Candidate Equips
                candidateEquipItemPool[equipType] = Object.assign(
                    candidateEquipItemPool[equipType],
                    this.createCandidateEquips(equipItems, equipType)
                )

                // Empty Armors
                equipItems = ArmorDataset.typeIs(equipType).rareIs(0).getList()

                // Merge Candidate Equips
                candidateEquipItemPool[equipType] = Object.assign(
                    candidateEquipItemPool[equipType],
                    this.createCandidateEquips(equipItems, equipType)
                )
            })

            // Append Empty Candidate Equip
            candidateEquipItemPool[equipType]['empty'] = this.getEmptyCandidateEquip(equipType)

            Helper.log('FA: Candidate Equip Pool:', equipType, Object.keys(candidateEquipItemPool[equipType]).length, candidateEquipItemPool[equipType])
        })

        // Create Current Equip Types and Convert Candidate Equip Pool
        // Create Equip Max Expected Value & Expected Level
        let currentEquipTypes = []
        let traversalCount = 0
        let traversalPercent = 0
        let totalTraversalCount = 1

        for (const [equipType, candidateEquipItems] of Object.entries(candidateEquipItemPool)) {
            if (Helper.isEmpty(this.equipMaxExpectedValue[equipType])) {
                this.equipMaxExpectedValue[equipType] = 0
            }

            if (Helper.isEmpty(this.equipMaxExpectedLevel[equipType])) {
                this.equipMaxExpectedLevel[equipType] = 0
            }

            Object.values(candidateEquipItems).forEach((candidateEquipItem) => {
                if (this.equipMaxExpectedValue[equipType] < candidateEquipItem.totalExpectedValue) {
                    this.equipMaxExpectedValue[equipType] = candidateEquipItem.totalExpectedValue
                }

                if (this.equipMaxExpectedLevel[equipType] < candidateEquipItem.totalExpectedLevel) {
                    this.equipMaxExpectedLevel[equipType] = candidateEquipItem.totalExpectedLevel
                }
            })

            currentEquipTypes.push(equipType)
            candidateEquipItemPool[equipType] = Object.values(candidateEquipItems)
            totalTraversalCount *= candidateEquipItemPool[equipType].length
        }

        candidateEquipItemPool = Object.values(candidateEquipItemPool)

        let candidateEquipItemPoolCount = candidateEquipItemPool.map((equips) => {
            return equips.length
        })

        Helper.log('FA: Global: Equip Max Expected Value:', this.equipMaxExpectedValue)
        Helper.log('FA: Global: Equip Max Expected Level:', this.equipMaxExpectedLevel)

        // Create Equip Future Expected Value & Expected Level
        currentEquipTypes.forEach((equipTypeA, typeIndex) => {
            this.equipFutureExpectedValue[equipTypeA] = 0
            this.equipFutureExpectedLevel[equipTypeA] = 0

            currentEquipTypes.forEach((equipTypeB) => {
                if (-1 !== currentEquipTypes.slice(0, typeIndex +1).indexOf(equipTypeB)) {
                    return
                }

                this.equipFutureExpectedValue[equipTypeA] += this.equipMaxExpectedValue[equipTypeB]
                this.equipFutureExpectedLevel[equipTypeA] += this.equipMaxExpectedLevel[equipTypeB]
            })
        })

        Helper.log('FA: Global: Equip Future Expected Value:', this.equipFutureExpectedValue)
        Helper.log('FA: Global: Equip Future Expected Level:', this.equipFutureExpectedLevel)

        // Special Case: 1
        if (1 === totalTraversalCount) {
            if (0 < this.currentSkillCount
                && false === this.isBundleSkillsCompleted(bundle)
            ) {
                let tempBundle = this.createBundleWithJewels(bundle)

                if (false !== tempBundle) {
                    lastBundleMapping[this.getBundleHash(tempBundle)] = tempBundle

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
                    lastBundleMapping[this.getBundleHash(tempBundle)] = tempBundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })
                }
            }
        }

        let lastTypeIndex = Object.keys(candidateEquipItemPoolCount).length - 1
        let lastEquipIndex = candidateEquipItemPoolCount[lastTypeIndex].length -1

        let stackIndex = 0
        let statusStack = []
        let typeIndex = null
        let equipIndex = null
        let candidateEquipItem = null

        // Push Root Bundle
        statusStack.push({
            bundle: bundle,
            typeIndex: 0,
            equipIndex: 0
        })

        const calculateTraversalCount = () => {
            traversalCount = 1

            candidateEquipItemPoolCount.forEach((equipCount, index) => {
                traversalCount *= (index <= stackIndex)
                    ? statusStack[index].equipIndex + 1 : equipCount
            })

            let precent = traversalCount / totalTraversalCount

            if (parseInt(precent * 100) <= traversalPercent) {
                return
            }

            traversalPercent = parseInt(precent * 100)

            // Helper.log('FA: Skill Equips: Traversal Count:', traversalCount)

            let diffTime = parseInt(Math.floor(Date.now() / 1000), 10) - this.startTime

            this.callback({
                searchPercent: traversalPercent,
                timeRemaining: parseInt(diffTime / precent - diffTime)
            })
        }

        const findPrevTypeAndNextEquip = () => {
            while (true) {
                stackIndex--
                statusStack.pop()

                if (0 === statusStack.length) {
                    break
                }

                typeIndex = statusStack[stackIndex].typeIndex
                equipIndex = statusStack[stackIndex].equipIndex

                if (Helper.isNotEmpty(candidateEquipItemPool[typeIndex][equipIndex + 1])) {
                    statusStack[typeIndex].equipIndex++

                    calculateTraversalCount()

                    break
                }
            }
        }

        const findNextEquip = () => {
            typeIndex = statusStack[stackIndex].typeIndex

            if (Helper.isNotEmpty(candidateEquipItemPool[typeIndex][equipIndex + 1])) {
                statusStack[stackIndex].equipIndex++

                calculateTraversalCount()
            } else {
                findPrevTypeAndNextEquip()
            }
        }

        const findNextType = () => {
            typeIndex = statusStack[stackIndex].typeIndex

            if (Helper.isNotEmpty(candidateEquipItemPool[typeIndex + 1])) {
                stackIndex++
                statusStack.push({
                    bundle: bundle,
                    typeIndex: typeIndex + 1,
                    equipIndex: 0
                })
            } else {
                findNextEquip()
            }
        }

        // Helper.log('FA: CreateBundlesWithEquips: Root Bundle:', bundle)

        while (true) {
            if (0 === statusStack.length) {
                break
            }

            bundle = statusStack[stackIndex].bundle
            typeIndex = statusStack[stackIndex].typeIndex
            equipIndex = statusStack[stackIndex].equipIndex
            candidateEquipItem = candidateEquipItemPool[typeIndex][equipIndex]

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquipItem)

            // If Add Candidate Equip Failed
            if (false === bundle) {

                // Termination condition
                if (lastTypeIndex === typeIndex && lastEquipIndex === equipIndex) {
                    break
                }

                findNextEquip()

                continue
            }

            // Check Bundle Sets
            if (this.isBundleSetsCompleted(bundle)) {

                // Check Bundle Skills
                if (this.isBundleSkillsCompleted(bundle)) {
                    lastBundleMapping[this.getBundleHash(bundle)] = bundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })

                    Helper.log('FA: Last Bundle Count:', Object.keys(lastBundleMapping).length)

                    if (this.algorithmParams.limit <= Object.keys(lastBundleMapping).length) {
                        break
                    }

                    findNextEquip()

                    continue
                }

                // Check Bundle Reach Expected
                if (this.isBundleReachExpected(bundle)) {

                    // Create Bundle With Jewels
                    bundle = this.createBundleWithJewels(bundle)

                    if (false !== bundle) {
                        lastBundleMapping[this.getBundleHash(bundle)] = bundle

                        this.callback({
                            bundleCount: Object.keys(lastBundleMapping).length
                        })

                        Helper.log('FA: Last Bundle Count:', Object.keys(lastBundleMapping).length)

                        if (this.algorithmParams.limit <= Object.keys(lastBundleMapping).length) {
                            break
                        }
                    }

                    findNextEquip()

                    continue
                }

                // Check Bundle Have a Future
                if (false === this.isBundleHaveFuture(bundle, currentEquipTypes[typeIndex])) {
                    findNextEquip()

                    continue
                }
            }

            // Termination condition
            if (lastTypeIndex === typeIndex && lastEquipIndex === equipIndex) {
                break
            }

            findNextType()
        }

        calculateTraversalCount()

        Helper.log('FA: Last Bundle Result:', lastBundleMapping)

        return Object.values(lastBundleMapping)
    }

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
        let correspondJewelPool = {}
        let slotMapping = {}

        for (let size of [1, 2, 3]) {
            correspondJewelPool[size] = Helper.isNotEmpty(this.correspondJewels[size])
                ? this.correspondJewels[size] : []
            slotMapping[size] = null

            correspondJewelPool[size] = correspondJewelPool[size].filter((jewel) => {
                let isSkip = false

                jewel.skills.forEach((skillData) => {
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

                if (slotMapping[size].expectedValue < jewel.expectedValue) {
                    slotMapping[size].expectedValue = jewel.expectedValue
                }

                if (slotMapping[size].expectedLevel < jewel.expectedLevel) {
                    slotMapping[size].expectedLevel = jewel.expectedLevel
                }

                return true
            })

            if (Helper.isEmpty(slotMapping[size]) && Helper.isNotEmpty(slotMapping[size - 1])) {
                slotMapping[size] = slotMapping[size - 1]
            }

            if (Helper.isEmpty(slotMapping[size])) {
                slotMapping[size] = {
                    expectedValue: 0,
                    expectedLevel: 0
                }
            }

            if (Helper.isNotEmpty(correspondJewelPool[size - 1])) {
                correspondJewelPool[size] = correspondJewelPool[size].concat(correspondJewelPool[size - 1])
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

        let lastSlotIndex = slotSizeList.length - 1
        let lastJewelIndex = correspondJewelPool[slotSizeList[lastSlotIndex]].length - 1

        let stackIndex = 0
        let statusStack = []
        let slotIndex = null
        let slotSize = null
        let jewelIndex = null
        let correspondJewel = null

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

                if (Helper.isNotEmpty(correspondJewelPool[slotSize][jewelIndex + 1])) {
                    statusStack[stackIndex].jewelIndex++

                    break
                }
            }
        }

        const findNextJewel = () => {
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            jewelIndex = statusStack[stackIndex].jewelIndex

            if (Helper.isNotEmpty(correspondJewelPool[slotSize][jewelIndex + 1])) {
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
            correspondJewel = correspondJewelPool[slotSize][jewelIndex]

            if (0 === bundle.meta.remainingSlotCountMapping.all) {
                findPrevSkillAndNextJewel()

                continue
            }

            if (0 === bundle.meta.remainingSlotCountMapping[slotSize]) {
                findNextSlot()

                continue
            }

            // Add Jewel To Bundle
            bundle = this.addJewelToBundle(bundle, slotSize, correspondJewel, true)

            if (false === bundle) {

                // Termination condition
                if (lastSlotIndex === slotIndex && lastJewelIndex === jewelIndex) {
                    break
                }

                findNextJewel()

                continue
            }

            // Check Bundle Skills
            if (this.isBundleSkillsCompleted(bundle)) {
                if (Helper.isEmpty(lastBundle)) {
                    lastBundle = Helper.deepCopy(bundle)

                    delete lastBundle.jewelMapping
                }

                jewelPackageMapping[this.getBundleJewelHash(bundle)] = bundle.jewelMapping

                // Helper.log('FA: Last Package Count:', Object.keys(jewelPackageMapping).length)

                findPrevSkillAndNextJewel()

                continue
            }

            // Check Bundle Jewel Have a Future
            if (false === this.isBundleJewelHaveFuture(bundle, slotMapping)) {
                findNextJewel()

                continue
            }

            // Termination condition
            if (lastSlotIndex === slotIndex && lastJewelIndex === jewelIndex) {
                break
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
    sortBundleList = (bundleList) => {
        switch (this.algorithmParams.sort) {
        case 'complex':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = (8 - bundleA.meta.equipCount) * 1000 + bundleA.meta.defense
                let valueB = (8 - bundleB.meta.equipCount) * 1000 + bundleB.meta.defense

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: (8 - bundle.meta.equipCount) * 1000 + bundle.meta.defense
                }

                return bundle
            })
        case 'amount':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.equipCount
                let valueB = bundleB.meta.equipCount

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: bundle.meta.equipCount
                }

                return bundle
            })
        case 'defense':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.defense
                let valueB = bundleB.meta.defense

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
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
                let valueA = bundleA.meta.resistance[this.algorithmParams.sort]
                let valueB = bundleB.meta.resistance[this.algorithmParams.sort]

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: bundle.meta.resistance[this.algorithmParams.sort]
                }

                return bundle
            })
        default:
            return bundleList
        }
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

            if (Helper.isNotEmpty(this.currentSkillMapping[skillId])) {
                if (this.currentSkillMapping[skillId].level < bundle.skillLevelMapping[skillId]) {
                    isSkillLevelOverflow = true
                }

                if (this.currentSkillMapping[skillId].level === bundle.skillLevelMapping[skillId]) {
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

            if (Helper.isNotEmpty(this.currentSetMapping[candidateEquipItem.setId])) {
                if (this.currentSetMapping[candidateEquipItem.setId].count < bundle.setCountMapping[candidateEquipItem.setId]) {
                    isSetRequireOverflow = true
                }

                if (this.currentSetMapping[candidateEquipItem.setId].count === bundle.setCountMapping[candidateEquipItem.setId]) {
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
     * Create Candidate Equips
     */
    createCandidateEquips = (equipItems, equipType) => {
        let candidateEquipItemPool = {}

        equipItems.forEach((equipItem) => {

            // Check is Using Factor
            if (false === this.algorithmParams.usingFactor['armor:rare:' + equipItem.rare]) {
                return
            }

            if (Helper.isNotEmpty(this.algorithmParams.usingFactor['armor:series' + equipItem.seriesId])
                && false === this.algorithmParams.usingFactor['armor:series' + equipItem.seriesId]
            ) {
                return
            }

            // Convert Equip to Candidate Equip
            let candidateEquipItem = this.convertEquipItemToCandidateEquipItem(equipItem, equipType)

            if (false === candidateEquipItem) {
                return
            }

            // Check is Skip Equips
            if (true === this.isCandidateEquipSkip(candidateEquipItem)) {
                return
            }

            // Set Used Candidate Equip Id
            this.usedEquipIds[candidateEquipItem.id] = true

            // Set Candidate Equip
            candidateEquipItemPool[candidateEquipItem.id] = candidateEquipItem
        })

        return candidateEquipItemPool
    }

    /**
     * Convert Equip Info To Candidate Equip
     */
    convertEquipItemToCandidateEquipItem = (equipItem, equipType) => {
        let candidateEquipItem = Helper.deepCopy(Constant.defaultCandidateEquipItem)

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

            if (Helper.isEmpty(this.currentSkillMapping[skillData.id])) {
                return
            }

            // Increase Expected Value & Level
            let expectedValue = skillData.level * this.currentSkillMapping[skillData.id].jewelSize
            let expectedLevel = skillData.level

            candidateEquipItem.totalExpectedValue += expectedValue
            candidateEquipItem.totalExpectedLevel += expectedLevel
            candidateEquipItem.skillExpectedValue += expectedValue
            candidateEquipItem.skillExpectedLevel += expectedLevel
        })

        equipItem.slots.forEach((slotData) => {
            candidateEquipItem.slotCountMapping[slotData.size] += 1

            // Increase Expected Value & Level
            candidateEquipItem.totalExpectedValue += this.currentSlotMapping[slotData.size].expectedValue
            candidateEquipItem.totalExpectedLevel += this.currentSlotMapping[slotData.size].expectedLevel
        })

        return candidateEquipItem
    }

    /**
     * Get Empty Candidate Equip
     */
    getEmptyCandidateEquip = (equipType) => {
        let candidateEquipItem = Helper.deepCopy(Constant.defaultCandidateEquipItem)

        candidateEquipItem.type = equipType

        return candidateEquipItem
    }

    /**
     * Add Jewel to Bundle
     */
    addJewelToBundle = (bundle, slotSize, correspondJewel, hasJewelCountLimit = false) => {

        // Check Correspond Jewel
        if (Helper.isEmpty(correspondJewel)) {
            return false
        }

        // Check Jewel Limit
        if (Helper.isNotEmpty(bundle.jewelMapping)
            && Helper.isNotEmpty(bundle.jewelMapping[correspondJewel.id])
            && correspondJewel.countLimit === bundle.jewelMapping[correspondJewel.id]
        ) {
            return false
        }

        // Check Jewel Count
        let isSkip = false
        let jewelCount = bundle.meta.remainingSlotCountMapping[slotSize]

        correspondJewel.skills.forEach((skillData) => {
            if (true === isSkip) {
                return
            }

            if (Helper.isNotEmpty(bundle.meta.completedSkills[skillData.id])) {
                isSkip = true

                return
            }

            let diffSkillLevel = this.currentSkillMapping[skillData.id].level - bundle.skillLevelMapping[skillData.id]
            let diffJewelCount = parseInt(diffSkillLevel / skillData.level, 10)

            if (jewelCount > diffJewelCount) {
                jewelCount = diffJewelCount
            }
        })

        if (true === isSkip) {
            return false
        }

        if (null !== correspondJewel.countLimit && jewelCount > correspondJewel.countLimit) {
            jewelCount = correspondJewel.countLimit
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

        if (Helper.isEmpty(bundle.jewelMapping[correspondJewel.id])) {
            bundle.jewelMapping[correspondJewel.id] = 0
        }

        bundle.jewelMapping[correspondJewel.id] += jewelCount

        // Increase Skill Level
        correspondJewel.skills.forEach((skill) => {
            bundle.skillLevelMapping[skill.id] += jewelCount * skill.level

            if (this.currentSkillMapping[skill.id].level === bundle.skillLevelMapping[skill.id]) {
                bundle.meta.completedSkills[skill.id] = true
            }
        })

        // Decrease Slot Counts
        bundle.meta.remainingSlotCountMapping[slotSize] -= jewelCount
        bundle.meta.remainingSlotCountMapping.all -= jewelCount

        // Increase Expected Value & Level
        let expectedValue = jewelCount * correspondJewel.expectedValue
        let expectedLevel = jewelCount * correspondJewel.expectedLevel

        bundle.meta.skillExpectedValue += expectedValue
        bundle.meta.skillExpectedLevel += expectedLevel

        return bundle
    }

    /**
     * Is Skip Candidate Equip
     */
    isCandidateEquipSkip = (candidateEquipItem) => {

        // Check Used Equip Ids
        if (true === this.usedEquipIds[candidateEquipItem.id]) {
            return
        }

        let isSkip = false

        Object.keys(candidateEquipItem.skillLevelMapping).forEach((skillId) => {
            if (true === isSkip) {
                return
            }

            if (Helper.isNotEmpty(this.currentSkillMapping[skillId])
                && 0 === this.currentSkillMapping[skillId].level
            ) {
                isSkip = true
            }
        })

        return isSkip
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
        return this.totalExpectedValue <= bundle.meta.totalExpectedValue
            && this.totalExpectedLevel <= bundle.meta.totalExpectedLevel
    }

    /**
     * Is Bundle Have Future
     *
     * This is magic function, which is see through the future,
     * maybe will lost some results.
     */
    isBundleHaveFuture = (bundle, equipType) => {
        let expectedValue = bundle.meta.totalExpectedValue + this.equipFutureExpectedValue[equipType]
        let expectedLevel = bundle.meta.totalExpectedLevel + this.equipFutureExpectedLevel[equipType]

        return this.totalExpectedValue <= expectedValue
            && this.totalExpectedLevel <= expectedLevel
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

        return this.totalExpectedValue <= expectedValue
            && this.totalExpectedLevel <= expectedLevel
    }
}

export default new FittingAlgorithm()
