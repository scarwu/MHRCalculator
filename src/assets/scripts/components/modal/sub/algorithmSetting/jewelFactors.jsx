/**
 * Algorithm Setting: Jewel Factors
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
import Misc from 'libraries/misc'
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import BasicSelector from 'components/common/basicSelector'

// Load States
import States from 'states'

export default function JewelFactors (props) {
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
        Helper.debug('Component: AlgorithmSetting -> JewelFactors')

        let jewelList = (true === byRequiredConditions)
            ? Misc.getJewelListByRequiredConditions(stateRequiredConditions)
            : JewelDataset.getList()
        let jewelSizeMapping = {}

        jewelList.filter((jewelItem) => {
            let text = _(jewelItem.name)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((jewelItem) => {
            if (false === stateAlgorithmParams.usingFactor['jewel:size:' + jewelItem.size]) {
                return false
            }

            if (Helper.isEmpty(jewelSizeMapping[jewelItem.size])) {
                jewelSizeMapping[jewelItem.size] = {}
            }

            if (Helper.isEmpty(jewelSizeMapping[jewelItem.size][jewelItem.id])) {
                jewelSizeMapping[jewelItem.size][jewelItem.id] = {
                    name: jewelItem.name,
                    min: 1,
                    max: 1
                }
            }

            jewelItem.skills.forEach((skillData) => {
                let skillItem = SkillDataset.getItem(skillData.id)

                if (jewelSizeMapping[jewelItem.size][jewelItem.id].max < skillItem.list.length) {
                    jewelSizeMapping[jewelItem.size][jewelItem.id].max = skillItem.list.length
                }
            })
        })

        if (0 === Object.keys(jewelSizeMapping).length) {
            return false
        }

        return Object.keys(jewelSizeMapping).sort((sizeA, sizeB) => {
            return sizeA > sizeB ? 1 : -1
        }).map((size) => {
            let jewelIds = Object.keys(jewelSizeMapping[size]).sort((jewelIdA, jewelIdB) => {
                return _(jewelIdA) > _(jewelIdB) ? 1 : -1
            })

            if (0 === jewelIds.length) {
                return false
            }

            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(jewelIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={size + '_' + blockIndex} className="mhrc-item mhrc-item-2-step">
                        <div className="col-12 mhrc-name">
                            <span>{_('jewelFactor')}: [{size}]</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {jewelIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((jewelId) => {
                                let selectLevel = Helper.isNotEmpty(stateAlgorithmParams.usingFactor['jewel:id:' + jewelId])
                                    ? stateAlgorithmParams.usingFactor['jewel:id:' + jewelId] : -1
                                let diffLevel = jewelSizeMapping[size][jewelId].max - jewelSizeMapping[size][jewelId].min + 1
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
                                        <span>{_(jewelSizeMapping[size][jewelId].name)}</span>

                                        <div className="mhrc-icons_bundle">
                                            <BasicSelector
                                                iconName="sort-numeric-asc" defaultValue={selectLevel} options={levelList}
                                                onChange={(event) => {
                                                    States.setter.setAlgorithmParamsUsingFactor('jewel:id:' + jewelId, parseInt(event.target.value))
                                                }} />
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
