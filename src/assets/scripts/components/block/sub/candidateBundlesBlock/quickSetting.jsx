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
// import CharmDataset from 'libraries/dataset/charm'
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import BasicSelector from 'components/common/basicSelector'

// Load States
import States from 'states'

const levelMapping = [ 'I', 'II', 'III', 'IV', 'V' ]

export default function QuickSetting(props) {
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
        let charmSeriesMapping = {}
        let jewelMapping = {}
        let skillLevelMapping = {}

        const equipTypes = Object.keys(stateRequiredConditions.equips).filter((equipType) => {
            if ('weapon' === equipType || 'charm' === equipType) {
                return false
            }

            return Helper.isEmpty(stateRequiredConditions.equips[equipType])
        })
        // const setIds = stateRequiredConditions.sets.map((set) => {
        //     return set.id
        // })
        const skillIds = stateRequiredConditions.skills.map((skill) => {
            skillLevelMapping[skill.id] = skill.level

            return skill.id
        })

        ArmorDataset.typesIs(equipTypes).getItems().forEach((armorInfo) => {
            if (false === stateAlgorithmParams.usingFactor.armor['rare' + armorInfo.rare]) {
                return
            }

            let isSkip = false

            armorInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skill.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorInfo.rare])) {
                armorSeriesMapping[armorInfo.rare] = {}
            }

            armorSeriesMapping[armorInfo.rare][armorInfo.seriesId] = {
                name: armorInfo.series
            }
        })

        ArmorDataset.typesIs(equipTypes).hasSkills(skillIds).getItems().forEach((armorInfo) => {
            if (false === stateAlgorithmParams.usingFactor.armor['rare' + armorInfo.rare]) {
                return
            }

            let isSkip = false

            armorInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skill.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorInfo.rare])) {
                armorSeriesMapping[armorInfo.rare] = {}
            }

            armorSeriesMapping[armorInfo.rare][armorInfo.seriesId] = {
                name: armorInfo.series
            }
        })

        // if (Helper.isEmpty(stateRequiredConditions.equips.charm)) {
        //     CharmDataset.hasSkills(skillIds).getItems().forEach((charmInfo) => {
        //         let isSkip = false

        //         charmInfo.skills.forEach((skill) => {
        //             if (true === isSkip) {
        //                 return
        //             }

        //             if (0 === skillLevelMapping[skill.id]) {
        //                 isSkip = true

        //                 return
        //             }
        //         })

        //         if (true === isSkip) {
        //             return
        //         }

        //         if (Helper.isEmpty(charmSeriesMapping[charmInfo.seriesId])) {
        //             charmSeriesMapping[charmInfo.seriesId] = {
        //                 series: charmInfo.series,
        //                 min: 1,
        //                 max: 1
        //             }
        //         }

        //         if (charmSeriesMapping[charmInfo.seriesId].max < charmInfo.level) {
        //             charmSeriesMapping[charmInfo.seriesId].max = charmInfo.level
        //         }
        //     })
        // }

        JewelDataset.hasSkills(skillIds, true).getItems().forEach((jewelInfo) => {
            let isSkip = false

            jewelInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skill.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(jewelMapping[jewelInfo.size])) {
                jewelMapping[jewelInfo.size] = {}
            }

            if (Helper.isEmpty(jewelMapping[jewelInfo.size][jewelInfo.id])) {
                jewelMapping[jewelInfo.size][jewelInfo.id] = {
                    name: jewelInfo.name,
                    min: 1,
                    max: 1
                }
            }

            jewelInfo.skills.forEach((skill) => {
                let skillInfo = SkillDataset.getInfo(skill.id)

                if (jewelMapping[jewelInfo.size][jewelInfo.id].max < skillInfo.list.length) {
                    jewelMapping[jewelInfo.size][jewelInfo.id].max = skillInfo.list.length
                }
            })
        })

        let armorFactor = stateAlgorithmParams.usingFactor.armor
        let charmFactor = stateAlgorithmParams.usingFactor.charm
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

                {0 !== Object.keys(charmSeriesMapping).length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('charmFactor')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {Object.keys(charmSeriesMapping).sort((seriesIdA, seriesIdB) => {
                                return _(seriesIdA) > _(seriesIdB) ? 1 : -1
                            }).map((seriesId) => {
                                let selectLevel = Helper.isNotEmpty(charmFactor[seriesId])
                                    ? charmFactor[seriesId] : -1
                                let levelList = [
                                    { key: -1, value: _('all') },
                                    { key: 0, value: _('exclude') }
                                ]
                                let countableEmptyArray = [...Array(charmSeriesMapping[seriesId].max - charmSeriesMapping[seriesId].min + 1).keys()]

                                countableEmptyArray.forEach((data, index) => {
                                    levelList.push({ key: index + 1, value: levelMapping[index] })
                                })

                                return (
                                    <div key={seriesId} className="col-6 mhrc-value">
                                        <span>{_(charmSeriesMapping[seriesId].series)}</span>
                                        <div className="mhrc-icons_bundle">
                                            <BasicSelector
                                                iconName="sort-numeric-asc"
                                                defaultValue={selectLevel}
                                                options={levelList} onChange={(event) => {
                                                    States.setter.setAlgorithmParamsUsingFactor('charm', seriesId, parseInt(event.target.value))
                                                }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : false}

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
