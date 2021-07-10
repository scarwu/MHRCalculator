/**
 * Candidate Bundles: Quick Setting
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useMemo } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import ArmorDataset from 'libraries/dataset/armor'
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import BasicSelector from 'components/common/basicSelector'

// Load States
import States from 'states'

export default function QuickSetting (props) {
    const {data} = props

    /**
     * Hooks
     */
    const [stateAlgorithmParams, updateAlgorithmParams] = useState(States.getter.getAlgorithmParams())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateAlgorithmParams(States.getter.getAlgorithmParams())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> QuickFactorSetting')

        let armorSeriesMapping = {}
        let jewelMapping = {}
        let skillLevelMapping = {}

        const equipTypes = Object.keys(stateRequiredConditions.equips).filter((equipType) => {
            if ('weapon' === equipType || 'charm' === equipType || 'petalace' === equipType) {
                return false
            }

            return Helper.isEmpty(stateRequiredConditions.equips[equipType])
        })
        const setIds = stateRequiredConditions.sets.map((setData) => {
            return setData.id
        })
        const skillIds = stateRequiredConditions.skills.map((skillData) => {
            skillLevelMapping[skillData.id] = skillData.level

            return skillData.id
        })

        ArmorDataset.typesIs(equipTypes).getList().forEach((armorItem) => {
            if (false === stateAlgorithmParams.usingFactor.armor['rare' + armorItem.rare]) {
                return
            }

            let isSkip = false

            armorItem.skills.forEach((skillData) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skillData.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorItem.rare])) {
                armorSeriesMapping[armorItem.rare] = {}
            }

            armorSeriesMapping[armorItem.rare][armorItem.seriesId] = {
                name: armorItem.series
            }
        })

        ArmorDataset.typesIs(equipTypes).hasSkills(skillIds).getList().forEach((armorItem) => {
            if (false === stateAlgorithmParams.usingFactor.armor['rare' + armorItem.rare]) {
                return
            }

            let isSkip = false

            armorItem.skills.forEach((skillData) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skillData.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorItem.rare])) {
                armorSeriesMapping[armorItem.rare] = {}
            }

            armorSeriesMapping[armorItem.rare][armorItem.seriesId] = {
                name: armorItem.series
            }
        })

        JewelDataset.hasSkills(skillIds, true).getList().forEach((jewelItem) => {
            let isSkip = false

            jewelItem.skills.forEach((skillData) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skillData.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(jewelMapping[jewelItem.size])) {
                jewelMapping[jewelItem.size] = {}
            }

            if (Helper.isEmpty(jewelMapping[jewelItem.size][jewelItem.id])) {
                jewelMapping[jewelItem.size][jewelItem.id] = {
                    name: jewelItem.name,
                    min: 1,
                    max: 1
                }
            }

            jewelItem.skills.forEach((skillData) => {
                let skillItem = SkillDataset.getItem(skillData.id)

                if (jewelMapping[jewelItem.size][jewelItem.id].max < skillItem.list.length) {
                    jewelMapping[jewelItem.size][jewelItem.id].max = skillItem.list.length
                }
            })
        })

        let armorFactor = stateAlgorithmParams.usingFactor.armor
        let jewelFactor = stateAlgorithmParams.usingFactor.jewel

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('quickSetting')}</span>
                </div>

                {0 !== Object.keys(armorSeriesMapping).length ? Object.keys(armorSeriesMapping).sort((rareA, rareB) => {
                    return rareA > rareB ? 1 : -1
                }).map((rare) => {
                    return (
                        <div key={rare} className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('armorFactor')}: R{rare}</span>
                            </div>

                            <div className="col-12 mhrc-content">
                                {Object.keys(armorSeriesMapping[rare]).sort((seriesIdA, seriesIdB) => {
                                    return _(seriesIdA) > _(seriesIdB) ? 1 : -1
                                }).map((seriesId) => {
                                    let isInclude = Helper.isNotEmpty(armorFactor[seriesId])
                                        ? armorFactor[seriesId] : true

                                    return (
                                        <div key={seriesId} className="col-6 mhrc-value">
                                            <span>{_(armorSeriesMapping[rare][seriesId].name)}</span>
                                            <div className="mhrc-icons_bundle">
                                                {isInclude ? (
                                                    <IconButton
                                                        iconName="star"
                                                        altName={_('exclude')}
                                                        onClick={() => {States.setter.setAlgorithmParamsUsingFactor('armor', seriesId, false)}} />
                                                ) : (
                                                    <IconButton
                                                        iconName="star-o"
                                                        altName={_('include')}
                                                        onClick={() => {States.setter.setAlgorithmParamsUsingFactor('armor', seriesId, true)}} />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }) : false}

                {0 !== Object.keys(jewelMapping).length ? Object.keys(jewelMapping).sort((sizeA, sizeB) => {
                    return sizeA > sizeB ? 1 : -1
                }).map((size) => {
                    return (
                        <div key={size} className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('jewelFactor')}: [{size}]</span>
                            </div>

                            <div className="col-12 mhrc-content">
                                {Object.keys(jewelMapping[size]).sort((jewelIdA, jewelIdB) => {
                                    return _(jewelIdA) > _(jewelIdB) ? 1 : -1
                                }).map((jewelId) => {
                                    let selectLevel = Helper.isNotEmpty(jewelFactor[jewelId])
                                        ? jewelFactor[jewelId] : -1
                                    let diffLevel = jewelMapping[size][jewelId].max - jewelMapping[size][jewelId].min + 1
                                    let levelList = [
                                        { key: -1, value: _('unlimited') },
                                        { key: 0, value: _('exclude') }
                                    ]
                                    let countableEmptyArray = [...Array(diffLevel).keys()]

                                    countableEmptyArray.forEach((data, index) => {
                                        levelList.push({ key: index + 1, value: index + 1 })
                                    })

                                    return (
                                        <div key={jewelId} className="col-6 mhrc-value">
                                            <span>{_(jewelMapping[size][jewelId].name)}</span>

                                            <div className="mhrc-icons_bundle">
                                                <BasicSelector
                                                    iconName="sort-numeric-asc"
                                                    defaultValue={selectLevel}
                                                    options={levelList} onChange={(event) => {
                                                        States.setter.setAlgorithmParamsUsingFactor('jewel', jewelId, parseInt(event.target.value))
                                                    }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }) : false}
            </div>
        )
    }, [
        data,
        stateAlgorithmParams,
        stateRequiredConditions
    ])
}
