/**
 * Algorithm Setting: Decoration Factors
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useMemo } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/misc'
import DecorationDataset from '@/scripts/libraries/dataset/decoration'
import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import BasicSelector from '@/scripts/components/common/basicSelector'

// Load States
import States from '@/scripts/states'

export default function DecorationFactors (props) {
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
        Helper.debug('Component: AlgorithmSetting -> DecorationFactors')

        let decorationList = (true === byRequiredConditions)
            ? Misc.getDecorationListByRequiredConditions(stateRequiredConditions)
            : DecorationDataset.getList()
        let decorationSizeMapping = {}

        decorationList.filter((decorationItem) => {
            let text = _(decorationItem.name)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((decorationItem) => {
            if (false === stateAlgorithmParams.usingFactor['decoration:size:' + decorationItem.size]) {
                return false
            }

            if (Helper.isEmpty(decorationSizeMapping[decorationItem.size])) {
                decorationSizeMapping[decorationItem.size] = {}
            }

            if (Helper.isEmpty(decorationSizeMapping[decorationItem.size][decorationItem.id])) {
                decorationSizeMapping[decorationItem.size][decorationItem.id] = {
                    name: decorationItem.name,
                    min: 1,
                    max: 1
                }
            }

            decorationItem.skills.forEach((skillData) => {
                let skillItem = SkillDataset.getItem(skillData.id)

                if (decorationSizeMapping[decorationItem.size][decorationItem.id].max < skillItem.list.length) {
                    decorationSizeMapping[decorationItem.size][decorationItem.id].max = skillItem.list.length
                }
            })
        })

        if (0 === Object.keys(decorationSizeMapping).length) {
            return false
        }

        return Object.keys(decorationSizeMapping).sort((sizeA, sizeB) => {
            return sizeA > sizeB ? 1 : -1
        }).map((size) => {
            let decorationIds = Object.keys(decorationSizeMapping[size]).sort((decorationIdA, decorationIdB) => {
                return _(decorationIdA) > _(decorationIdB) ? 1 : -1
            })

            if (0 === decorationIds.length) {
                return false
            }

            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(decorationIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={size + '_' + blockIndex} className="mhrc-item mhrc-item-2-step">
                        <div className="col-12 mhrc-name">
                            <span>{_('decorationFactor')}: [{size}]</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {decorationIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((decorationId) => {
                                let selectLevel = Helper.isNotEmpty(stateAlgorithmParams.usingFactor['decoration:id:' + decorationId])
                                    ? stateAlgorithmParams.usingFactor['decoration:id:' + decorationId] : -1
                                let diffLevel = decorationSizeMapping[size][decorationId].max - decorationSizeMapping[size][decorationId].min + 1
                                let levelList = [
                                    { key: -1, value: _('unlimited') },
                                    { key: 0, value: _('exclude') }
                                ]
                                let countableEmptyArray = [...Array(diffLevel).keys()]

                                countableEmptyArray.forEach((data, index) => {
                                    levelList.push({ key: index + 1, value: index + 1 })
                                })

                                return (
                                    <div key={decorationId} className="col-6 mhrc-value">
                                        <span>{_(decorationSizeMapping[size][decorationId].name)}</span>

                                        <div className="mhrc-icons_bundle">
                                            <BasicSelector
                                                iconName="sort-numeric-asc" defaultValue={selectLevel} options={levelList}
                                                onChange={(event) => {
                                                    States.setter.setAlgorithmParamsUsingFactor('decoration:id:' + decorationId, parseInt(event.target.value))
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
