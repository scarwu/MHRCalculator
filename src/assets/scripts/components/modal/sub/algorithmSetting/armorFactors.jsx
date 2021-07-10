/**
 * Algorithm Setting: Armor Factors
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

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

export default function ArmorFactors (props) {
    const {segment, byRequiredConditions} = props

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
        Helper.debug('Component: AlgorithmSetting -> ArmorFactors')

        let armorSeriesMapping = {}
        let skillLevelMapping = {}
        let dataset = ArmorDataset
        let armorFactor = stateAlgorithmParams.usingFactor.armor

        const equipTypes = Object.keys(stateRequiredConditions.equips).filter((equipType) => {
            if ('weapon' === equipType || 'charm' === equipType) {
                return false
            }

            return Helper.isEmpty(stateRequiredConditions.equips[equipType])
        })

        if (true === byRequiredConditions) {
            const setIds = stateRequiredConditions.sets.map((set) => {
                return set.id
            })

            dataset = dataset.typesIs(equipTypes).setsIs(setIds)
        }

        dataset.getList().filter((armorItem) => {
            let text = _(armorItem.series)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((armorItem) => {
            if (false === stateAlgorithmParams.usingFactor.armor['rare' + armorItem.rare]) {
                return
            }

            let isSkip = false

            armorItem.skills.forEach((skill) => {
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

            if (Helper.isEmpty(armorSeriesMapping[armorItem.rare])) {
                armorSeriesMapping[armorItem.rare] = {}
            }

            armorSeriesMapping[armorItem.rare][armorItem.seriesId] = {
                name: armorItem.series
            }
        })

        if (true === byRequiredConditions) {
            const skillIds = stateRequiredConditions.skills.map((skill) => {
                skillLevelMapping[skill.id] = skill.level

                return skill.id
            })

            dataset = dataset.typesIs(equipTypes).hasSkills(skillIds)
        }

        dataset.getList().filter((armorItem) => {
            let text = _(armorItem.series)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((armorItem) => {
            if (false === armorFactor['rare' + armorItem.rare]) {
                return
            }

            if (true === byRequiredConditions) {
                let isSkip = false

                armorItem.skills.forEach((skill) => {
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
            }

            if (Helper.isEmpty(armorSeriesMapping[armorItem.rare])) {
                armorSeriesMapping[armorItem.rare] = {}
            }

            armorSeriesMapping[armorItem.rare][armorItem.seriesId] = {
                name: armorItem.series
            }
        })

        if (0 === Object.keys(armorSeriesMapping).length) {
            return false
        }

        return Object.keys(armorSeriesMapping).sort((rareA, rareB) => {
            return rareA > rareB ? 1 : -1
        }).map((rare) => {
            let seriesIds = Object.keys(armorSeriesMapping[rare]).sort((seriesIdA, seriesIdB) => {
                return _(seriesIdA) > _(seriesIdB) ? 1 : -1
            })

            if (0 === seriesIds.length) {
                return false
            }


            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(seriesIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={rare + '_' + blockIndex} className="mhrc-item mhrc-item-2-step">
                        <div className="col-12 mhrc-name">
                            <span>{_('armorFactor')}: R{rare}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {seriesIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((seriesId) => {
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
            }

            return blocks
        })
    }, [
        segment,
        byRequiredConditions,
        stateAlgorithmParams,
        stateRequiredConditions
    ])
}
