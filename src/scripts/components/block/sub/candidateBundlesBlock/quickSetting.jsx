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
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/misc'
import ArmorDataset from '@/scripts/libraries/dataset/armor'
import SetDataset from '@/scripts/libraries/dataset/set'
import DecorationDataset from '@/scripts/libraries/dataset/decoration'
import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import BasicSelector from '@/scripts/components/common/basicSelector'

// Load States
import States from '@/scripts/states'

export default function QuickSetting (props) {

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

        let armorList = Misc.getArmorListByRequiredConditions(stateRequiredConditions)
        let decorationList = Misc.getDecorationListByRequiredConditions(stateRequiredConditions)

        let armorSeriesMapping = {}
        let decorationSizeMapping = {}

        armorList.forEach((armorItem) => {
            if (false === stateAlgorithmParams.usingFactor['armor:rare:' + armorItem.rare]) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorItem.rare])) {
                armorSeriesMapping[armorItem.rare] = {}
            }

            armorSeriesMapping[armorItem.rare][armorItem.seriesId] = {
                name: armorItem.series
            }
        })

        decorationList.forEach((decorationItem) => {
            if (false === stateAlgorithmParams.usingFactor['decoration:size:' + decorationItem.size]) {
                return
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
                                    let isInclude = Helper.isNotEmpty(stateAlgorithmParams.usingFactor['armor:series:' + seriesId])
                                        ? stateAlgorithmParams.usingFactor['armor:series:' + seriesId] : true

                                    return (
                                        <div key={seriesId} className="col-6 mhrc-value">
                                            <span>{_(armorSeriesMapping[rare][seriesId].name)}</span>
                                            <div className="mhrc-icons_bundle">
                                                {isInclude ? (
                                                    <IconButton
                                                        iconName="star" altName={_('exclude')}
                                                        onClick={() => {
                                                            States.setter.setAlgorithmParamsUsingFactor('armor:series:' + seriesId, false)
                                                        }} />
                                                ) : (
                                                    <IconButton
                                                        iconName="star-o" altName={_('include')}
                                                        onClick={() => {
                                                            States.setter.setAlgorithmParamsUsingFactor('armor:series:' + seriesId, true)
                                                        }} />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }) : false}

                {0 !== Object.keys(decorationSizeMapping).length ? Object.keys(decorationSizeMapping).sort((sizeA, sizeB) => {
                    return sizeA > sizeB ? 1 : -1
                }).map((size) => {
                    return (
                        <div key={size} className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('decorationFactor')}: [{size}]</span>
                            </div>

                            <div className="col-12 mhrc-content">
                                {Object.keys(decorationSizeMapping[size]).sort((decorationIdA, decorationIdB) => {
                                    return _(decorationIdA) > _(decorationIdB) ? 1 : -1
                                }).map((decorationId) => {
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
                }) : false}
            </div>
        )
    }, [
        stateAlgorithmParams,
        stateRequiredConditions
    ])
}
