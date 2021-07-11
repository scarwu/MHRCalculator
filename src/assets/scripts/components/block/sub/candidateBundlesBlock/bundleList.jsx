/**
 * Candidate Bundles: Bundle List
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import WeaponDataset from 'libraries/dataset/weapon'
import ArmorDataset from 'libraries/dataset/armor'
// import CharmDataset from 'libraries/dataset/charm'
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'
// import SetDataset from 'libraries/dataset/set'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSwitch from 'components/common/iconSwitch'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleBundlePickUp = (bundle, required) => {
    let currentEquips = Helper.deepCopy(States.getter.getCurrentEquips())
    let slotMap = {
        1: [],
        2: [],
        3: []
    }

    Object.keys(bundle.equipIdMapping).forEach((equipType) => {
        if (Helper.isEmpty(bundle.equipIdMapping[equipType])) {
            return
        }

        if (Helper.isEmpty(currentEquips[equipType])) {
            currentEquips[equipType] = {}
        }

        currentEquips[equipType].id = bundle.equipIdMapping[equipType]
        currentEquips[equipType].slotIds = []

        let equipItem = null

        if ('weapon' === equipType) {
            if (Helper.isNotEmpty(required.equips.weapon.customWeapon)) {
                States.setter.replaceCustomWeapon(required.equips.weapon.customWeapon)
            }

            if (Helper.isNotEmpty(required.equips.weapon.enhances)) {
                currentEquips.weapon.enhances = required.equips.weapon.enhances // Restore Enhance
            }

            equipItem = Misc.getAppliedWeaponInfo(currentEquips.weapon)
        } else if ('helm' === equipType
            || 'chest' === equipType
            || 'arm' === equipType
            || 'waist' === equipType
            || 'leg' === equipType
        ) {
            equipItem = Misc.getAppliedArmorInfo(currentEquips[equipType])
        }

        if (Helper.isEmpty(equipItem)) {
            return
        }

        equipItem.slots.forEach((data, index) => {
            slotMap[data.size].push({
                type: equipType,
                index: index
            })
        })
    })

    let jewelPackageIndex = Helper.isNotEmpty(bundle.jewelPackageIndex)
        ? bundle.jewelPackageIndex : 0

    if (Helper.isNotEmpty(bundle.jewelPackages[jewelPackageIndex])) {
        Object.keys(bundle.jewelPackages[jewelPackageIndex]).sort((jewelIdA, jewelIdB) => {
            let jewelItemA = JewelDataset.getItem(jewelIdA)
            let jewelItemB = JewelDataset.getItem(jewelIdB)

            if (Helper.isEmpty(jewelItemA) || Helper.isEmpty(jewelItemB)) {
                return 0
            }

            return jewelItemA.size - jewelItemB.size
        }).forEach((jewelId) => {
            let jewelItem = JewelDataset.getItem(jewelId)

            if (Helper.isEmpty(jewelItem)) {
                return
            }

            let currentSize = jewelItem.size

            let jewelCount = bundle.jewelPackages[jewelPackageIndex][jewelId]
            let data = null

            let jewelIndex = 0

            while (jewelIndex < jewelCount) {
                if (0 === slotMap[currentSize].length) {
                    currentSize++

                    continue
                }

                data = slotMap[currentSize].shift()

                currentEquips[data.type].slotIds[data.index] = jewelId

                jewelIndex++
            }
        })
    }

    States.setter.replacePlayerEquips(currentEquips)
}

export default function BundleList (props) {

    /**
     * Hooks
     */
    const [stateCandidateBundles, updateCandidateBundles] = useState(States.getter.getCandidateBundles())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateCandidateBundles(States.getter.getCandidateBundles())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleJewelPackageChange = useCallback((bundleIndex, packageIndex) => {
        let computedResult = Helper.deepCopy(stateCandidateBundles)

        computedResult.list[bundleIndex].jewelPackageIndex = packageIndex

        States.setter.saveCandidateBundles(computedResult)
    }, [stateCandidateBundles])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> BundleList')

        if (Helper.isEmpty(stateCandidateBundles)
            || Helper.isEmpty(stateCandidateBundles.requiredConditions)
            || Helper.isEmpty(stateCandidateBundles.list)
        ) {
            return false
        }

        if (0 === stateCandidateBundles.list.length) {
            return (
                <div className="mhrc-item mhrc-item-3-step">
                    <div className="col-12 mhrc-name">
                        <span>{_('noResult')}</span>
                    </div>
                </div>
            )
        }

        let bundleList = stateCandidateBundles.list
        let bundleRequiredConditions = stateCandidateBundles.requiredConditions

        // Required Ids
        const requiredEquipIds = Object.keys(stateRequiredConditions.equips).map((equipType) => {
            if (Helper.isEmpty(stateRequiredConditions.equips[equipType])) {
                return false
            }

            return stateRequiredConditions.equips[equipType].id
        })
        const requiredSetIds = stateRequiredConditions.sets.map((set) => {
            return set.id
        })
        const requiredSkillIds = stateRequiredConditions.skills.map((skill) => {
            return skill.id
        })

        // Current Required Ids
        const currentRequiredSetIds = bundleRequiredConditions.sets.map((set) => {
            return set.id
        })
        const currentRequiredSkillIds = bundleRequiredConditions.skills.map((skill) => {
            return skill.id
        })

        return bundleList.map((bundle, bundleIndex) => {
            const jewelPackageCount = bundle.jewelPackages.length
            const jewelPackageIndex = Helper.isNotEmpty(bundle.jewelPackageIndex)
                ? bundle.jewelPackageIndex : 0

            // Remaining Slot Count Mapping
            let remainingSlotCountMapping = {
                1: 0,
                2: 0,
                3: 0,
                all: 0
            }

            Object.keys(bundle.slotCountMapping).forEach((slotSize) => {
                remainingSlotCountMapping.all += bundle.slotCountMapping[slotSize]
                remainingSlotCountMapping[slotSize] += bundle.slotCountMapping[slotSize]
            })

            // Bundle Equips & Jewels
            const bundleEquips = Object.keys(bundle.equipIdMapping).filter((equipType) => {
                return Helper.isNotEmpty(bundle.equipIdMapping[equipType])
            }).map((equipType) => {
                if ('weapon' === equipType) {
                    return Object.assign({}, bundleRequiredConditions.equips[equipType], {
                        type: equipType
                    })
                }

                return {
                    id: bundle.equipIdMapping[equipType],
                    type: equipType
                }
            })

            let bundleJewels = []

            if (Helper.isNotEmpty(bundle.jewelPackages[jewelPackageIndex])) {
                bundleJewels = Object.keys(bundle.jewelPackages[jewelPackageIndex]).map((jewelId) => {
                    let jewelItem = JewelDataset.getItem(jewelId)
                    let jewelCount = bundle.jewelPackages[jewelPackageIndex][jewelId]

                    for (let slotSize = jewelItem.size; slotSize <= 4; slotSize++) {
                        if (0 === remainingSlotCountMapping[slotSize]) {
                            continue
                        }

                        if (remainingSlotCountMapping[slotSize] < jewelCount) {
                            jewelCount -= remainingSlotCountMapping[slotSize]
                            remainingSlotCountMapping.all -= remainingSlotCountMapping[slotSize]
                            remainingSlotCountMapping[slotSize] = 0

                            continue
                        }

                        remainingSlotCountMapping.all -= jewelCount
                        remainingSlotCountMapping[slotSize] -= jewelCount

                        break
                    }

                    return {
                        id: jewelId,
                        count: bundle.jewelPackages[jewelPackageIndex][jewelId]
                    }
                }).sort((jewelA, jewelB) => {
                    let jewelItemA = JewelDataset.getItem(jewelA.id)
                    let jewelItemB = JewelDataset.getItem(jewelB.id)

                    return jewelItemA.size < jewelItemB.size ? 1 : -1
                })
            }

            // Additional Sets & Skills
            // const additionalSets = Object.keys(bundle.setCountMapping).map((setId) => {
            //     let setInfo = SetDataset.getItem(setId)

            //     if (Helper.isEmpty(setInfo)) {
            //         return false
            //     }

            //     let setStep = setInfo.skills.filter((skill) => {
            //         return skill.require <= bundle.setCountMapping[setId]
            //     }).length

            //     return {
            //         id: setId,
            //         step: setStep
            //     }
            // }).filter((set) => {
            //     if (false === set) {
            //         return false
            //     }

            //     if (-1 !== currentRequiredSetIds.indexOf(set.id)) {
            //         return false
            //     }

            //     if (0 === set.step) {
            //         return false
            //     }

            //     return true
            // }).sort((setA, setB) => {
            //     return setB.step - setA.step
            // })

            const additionalSkills = Object.keys(bundle.skillLevelMapping).map((skillId) => {
                return {
                    id: skillId,
                    level: bundle.skillLevelMapping[skillId]
                }
            }).filter((skill) => {
                return -1 === currentRequiredSkillIds.indexOf(skill.id)
            }).sort((skillA, skillB) => {
                return skillB.level - skillA.level
            })

            return (
                <div key={bundle.hash} className="mhrc-item mhrc-item-3-step">
                    <div className="col-12 mhrc-name">
                        <span>{_('bundle')}: {bundleIndex + 1} / {bundleList.length}</span>
                        <div className="mhrc-icons_bundle">
                            <IconButton
                                iconName="check" altName={_('equip')}
                                onClick={() => {handleBundlePickUp(bundle, bundleRequiredConditions)}} />
                        </div>
                    </div>

                    {Helper.isNotEmpty(bundle.meta.sortBy) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-4 mhrc-name">
                                <span>{_(bundle.meta.sortBy.key + 'Sort')}</span>
                            </div>
                            <div className="col-8 mhrc-value">
                                <span>{bundle.meta.sortBy.value}</span>
                            </div>
                        </div>
                    ) : false}

                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('requiredEquips')}</span>
                        </div>
                        <div className="col-12 mhrc-content">
                            {bundleEquips.map((currentEquipData) => {
                                let requiredEquipData = stateRequiredConditions.equips[currentEquipData.type]

                                // Can Add to Required Contditions
                                let isNotRequire = true

                                if (('weapon' === currentEquipData.type || 'charm' === currentEquipData.type)
                                    && 'custom' === currentEquipData.id
                                    && 'custom' === requiredEquipData.id
                                ) {
                                    isNotRequire = Helper.jsonHash(currentEquipData.custom) !== Helper.jsonHash(requiredEquipData.custom)
                                } else {
                                    isNotRequire = currentEquipData.id !== requiredEquipData.id
                                }

                                let equipItem = Misc.getEquipItem(currentEquipData.type)

                                return Helper.isNotEmpty(equipItem) ? (
                                    <div key={equip.type} className="col-6 mhrc-value">
                                        <span>{_(equipItem.name)}</span>

                                        <div className="mhrc-icons_bundle">
                                            {isNotRequire ? (
                                                <IconButton
                                                    iconName="arrow-left" altName={_('include')}
                                                    onClick={() => {
                                                        States.setter.setRequiredConditionsEquip(currentEquipData.type, currentEquipData.id)
                                                    }} />
                                            ) : false}
                                        </div>
                                    </div>
                                ) : false
                            })}
                        </div>
                    </div>

                    {(0 !== bundleJewels.length) ? (
                        <div key={bundleIndex + '_' + jewelPackageIndex} className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('requiredJewels')}</span>
                                {1 < jewelPackageCount ? (
                                    <div className="mhrc-icons_bundle">
                                        <IconSwitch
                                            defaultValue={jewelPackageIndex}
                                            options={bundle.jewelPackages.map((jewelMapping, packageIndex) => {
                                                return {
                                                    key: packageIndex,
                                                    value: `${packageIndex + 1} / ${jewelPackageCount}`
                                                }
                                            })}
                                            onChange={(packageIndex) => {
                                                handleJewelPackageChange(bundleIndex, parseInt(packageIndex), 10)
                                            }} />
                                    </div>
                                ) : false}
                            </div>
                            <div className="col-12 mhrc-content">
                                {bundleJewels.map((jewel) => {
                                    let jewelItem = JewelDataset.getItem(jewel.id)

                                    return (Helper.isNotEmpty(jewelItem)) ? (
                                        <div key={jewel.id} className="col-6 mhrc-value">
                                            <span>{`[${jewelItem.size}] ${_(jewelItem.name)} x ${jewel.count}`}</span>
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== remainingSlotCountMapping.all) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('remainingSlot')}</span>
                            </div>
                            <div className="col-12 mhrc-content">
                                {Object.keys(remainingSlotCountMapping).map((slotSize) => {
                                    if ('all' === slotSize) {
                                        return
                                    }

                                    let slotCount = remainingSlotCountMapping[slotSize]

                                    return (slotCount > 0) ? (
                                        <div key={slotSize} className="col-4 mhrc-value">
                                            <span>{`[${slotSize}] x ${slotCount}`}</span>
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}

                    {/* {(0 !== additionalSets.length) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('additionalSets')}</span>
                            </div>
                            <div className="col-12 mhrc-content">
                                {additionalSets.map((set) => {
                                    let setInfo = SetDataset.getItem(set.id)

                                    return (
                                        <div key={set.id} className="col-6 mhrc-value">
                                            <span>
                                                {`${_(setInfo.name)}`}{setInfo.skills.slice(0, set.step).map((skill) => {
                                                    return ` (${skill.require})`
                                                })}
                                            </span>
                                            {(-1 === requiredSetIds.indexOf(setInfo.id)) ? (
                                                <div className="mhrc-icons_bundle">
                                                    <IconButton
                                                        iconName="arrow-left" altName={_('include')}
                                                        onClick={() => {States.setter.addRequiredSet(setInfo.id)}} />
                                                </div>
                                            ) : false}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : false} */}

                    {(0 !== additionalSkills.length) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('additionalSkills')}</span>
                            </div>
                            <div className="col-12 mhrc-content">
                                {additionalSkills.map((skill) => {
                                    let skillInfo = SkillDataset.getItem(skill.id)

                                    return (Helper.isNotEmpty(skillInfo)) ? (
                                        <div key={skill.id} className="col-6 mhrc-value">
                                            <span>{`${_(skillInfo.name)} Lv.${skill.level}`}</span>
                                            {(-1 === requiredSkillIds.indexOf(skillInfo.id)) ? (
                                                <div className="mhrc-icons_bundle">
                                                    <IconButton
                                                        iconName="arrow-left" altName={_('include')}
                                                        onClick={() => {States.setter.addRequiredSkill(skillInfo.id)}} />
                                                </div>
                                            ) : false}
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}
                </div>
            )
        })
    }, [
        stateCandidateBundles,
        stateRequiredConditions
    ])
}
