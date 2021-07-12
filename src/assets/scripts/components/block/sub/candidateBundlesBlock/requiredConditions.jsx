/**
 * Candidate Bundles: Required Conditions
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
import ArmorDataset from 'libraries/dataset/armor'
import SkillDataset from 'libraries/dataset/skill'
import SetDataset from 'libraries/dataset/set'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

export default function RequiredConditions (props) {
    const {data} = props

    /**
     * Hooks
     */
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> RequiredConditions')

        if (Helper.isEmpty(data)) {
            return false
        }

        // Required Ids
        const requiredEquipIds = Object.keys(stateRequiredConditions.equips).map((equipType) => {
            if (Helper.isEmpty(stateRequiredConditions.equips[equipType])) {
                return false
            }

            return stateRequiredConditions.equips[equipType].id
        })
        const requiredSetIds = stateRequiredConditions.sets.map((setData) => {
            return setData.id
        })
        const requiredSkillIds = stateRequiredConditions.skills.map((skillData) => {
            return skillData.id
        })

        // Current Required
        const currentRequiredConditionsEquips = Object.keys(data.equips).filter((equipType) => {
            return Helper.isNotEmpty(data.equips[equipType]) && Helper.isNotEmpty(data.equips[equipType].id)
        }).map((equipType) => {
            return Object.assign({}, data.equips[equipType], {
                type: equipType
            })
        })
        const currentRequiredConditionsSets = data.sets.sort((setDataA, setDataB) => {
            return setDataB.step - setDataA.step
        })
        const currentRequiredConsitionsSkills = data.skills.sort((skillDataA, skillDataB) => {
            return skillDataB.level - skillDataA.level
        })

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('conditions')}</span>
                </div>

                {0 !== currentRequiredConditionsEquips.length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('equip')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {currentRequiredConditionsEquips.map((currentEquipData) => {
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

                                let currentEquipItem = Misc.getEquipItem(currentEquipData.type, currentEquipData)

                                return Helper.isNotEmpty(currentEquipItem) ? (
                                    <div key={currentEquipData.type} className="col-6 mhrc-value">
                                        <span>{_(currentEquipItem.name)}</span>

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
                ) : false}

                {0 !== currentRequiredConditionsSets.length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('set')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {currentRequiredConditionsSets.map((setData) => {
                                let setItem = SetDataset.getItem(setData.id)

                                return (
                                    <div key={setData.id} className="col-6 mhrc-value">
                                        <span>{_(setItem.name)} x {setData.count}</span>

                                        {(-1 === requiredSetIds.indexOf(setItem.id)) ? (
                                            <div className="mhrc-icons_bundle">
                                                <IconButton
                                                    iconName="arrow-left" altName={_('include')}
                                                    onClick={() => {
                                                        States.setter.addRequiredConditionsSet(setItem.id)
                                                    }} />
                                            </div>
                                        ) : false}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : false}

                {0 !== currentRequiredConsitionsSkills.length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('skill')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {currentRequiredConsitionsSkills.map((skillData) => {
                                let skillItem = SkillDataset.getItem(skillData.id)

                                return (Helper.isNotEmpty(skillItem)) ? (
                                    <div key={skillItem.id} className="col-6 mhrc-value">
                                        <span>{`${_(skillItem.name)} Lv.${skillData.level}`}</span>

                                        {(-1 === requiredSkillIds.indexOf(skillItem.id)) ? (
                                            <div className="mhrc-icons_bundle">
                                                <IconButton
                                                    iconName="arrow-left" altName={_('include')}
                                                    onClick={() => {
                                                        States.setter.addRequiredConditionsSkill(skillItem.id)
                                                    }} />
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
    }, [
        data,
        stateRequiredConditions
    ])
}
