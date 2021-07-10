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
import ArmorDataset from 'libraries/dataset/armor'
// import CharmDataset from 'libraries/dataset/charm'
import SkillDataset from 'libraries/dataset/skill'
// import SetDataset from 'libraries/dataset/set'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

export default function RequiredConditions (props) {
    const {data} = props

    /**
     * Hooks
     */
    const [stateRequiredEquips, updateRequiredEquips] = useState(States.getter.getRequiredEquips())
    const [stateRequiredSets, updateRequiredSets] = useState(States.getter.getRequiredSets())
    const [stateRequiredSkills, updateRequiredSkills] = useState(States.getter.getRequiredSkills())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateRequiredEquips(States.getter.getRequiredEquips())
            updateRequiredSets(States.getter.getRequiredSets())
            updateRequiredSkills(States.getter.getRequiredSkills())
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
        const requiredEquipIds = Object.keys(stateRequiredEquips).map((equipType) => {
            if (Helper.isEmpty(stateRequiredEquips[equipType])) {
                return false
            }

            return stateRequiredEquips[equipType].id
        })
        const requiredSetIds = stateRequiredSets.map((set) => {
            return set.id
        })
        const requiredSkillIds = stateRequiredSkills.map((skill) => {
            return skill.id
        })

        // Current Required
        const currentRequiredEquips = Object.keys(data.equips).filter((equipType) => {
            return Helper.isNotEmpty(data.equips[equipType])
        }).map((equipType) => {
            return Object.assign({}, data.equips[equipType], {
                type: equipType
            })
        })
        const currentRequiredSets = data.sets.sort((setA, setB) => {
            return setB.step - setA.step
        })
        const currentRequiredSkills = data.skills.sort((skillA, skillB) => {
            return skillB.level - skillA.level
        })

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('conditions')}</span>
                </div>

                {0 !== currentRequiredEquips.length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('equip')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {currentRequiredEquips.map((equip) => {
                                let isNotRequire = true

                                if (Helper.isNotEmpty(stateRequiredEquips[equip.type])) {
                                    if ('weapon' === equip.type) {
                                        if ('customWeapon' === equip.id) {
                                            isNotRequire = Helper.jsonHash({
                                                customWeapon: equip.customWeapon,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                customWeapon: stateRequiredEquips[equip.type].customWeapon,
                                                enhances: stateRequiredEquips[equip.type].enhances
                                            })
                                        } else {
                                            isNotRequire = Helper.jsonHash({
                                                id: equip.id,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                id: stateRequiredEquips[equip.type].id,
                                                enhances: stateRequiredEquips[equip.type].enhances
                                            })
                                        }
                                    } else {
                                        isNotRequire = equip.id !== stateRequiredEquips[equip.type].id
                                    }
                                }

                                let equipItem = null

                                if ('weapon' === equip.type) {
                                    if ('customWeapon' === equip.id) {
                                        equipItem = equip.customWeapon

                                        return Helper.isNotEmpty(equipItem) ? (
                                            <div key={equip.type} className="col-6 mhrc-value">
                                                <span>{_(equipItem.name)}: {_(equipItem.type)}</span>

                                                <div className="mhrc-icons_bundle">
                                                    {isNotRequire ? (
                                                        <IconButton
                                                            iconName="arrow-left" altName={_('include')}
                                                            onClick={() => {States.setter.setRequiredEquips(equip.type, equipItem)}} />
                                                    ) : false}
                                                </div>
                                            </div>
                                        ) : false
                                    }

                                    equipItem = WeaponDataset.getItem(equip.id)
                                } else if ('helm' === equip.type
                                    || 'chest' === equip.type
                                    || 'arm' === equip.type
                                    || 'waist' === equip.type
                                    || 'leg' === equip.type
                                ) {
                                    equipItem = ArmorDataset.getItem(equip.id)
                                } else if ('charm' === equip.type) {
                                    // equipItem = CharmDataset.getItem(equip.id)
                                }

                                return Helper.isNotEmpty(equipItem) ? (
                                    <div key={equip.type} className="col-6 mhrc-value">
                                        <span>{_(equipItem.name)}</span>

                                        <div className="mhrc-icons_bundle">
                                            {isNotRequire ? (
                                                <IconButton
                                                    iconName="arrow-left" altName={_('include')}
                                                    onClick={() => {States.setter.setRequiredEquips(equip.type, equipItem)}} />
                                            ) : false}
                                        </div>
                                    </div>
                                ) : false
                            })}
                        </div>
                    </div>
                ) : false}

                {/* {0 !== currentRequiredSets.length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('set')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {currentRequiredSets.map((set) => {
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

                {0 !== currentRequiredSkills.length ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('skill')}</span>
                        </div>

                        <div className="col-12 mhrc-content">
                            {currentRequiredSkills.map((skill) => {
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
    }, [data, stateRequiredEquips, stateRequiredSets, stateRequiredSkills])
}
