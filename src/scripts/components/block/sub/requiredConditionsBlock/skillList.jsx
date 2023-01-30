/**
 * Condition Options: Skill List
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
// import SetDataset from '@/scripts/libraries/dataset/set'
import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'

// Load States
import States from '@/scripts/states'

/**
 * Render Functions
 */
const renderSkillItem = (skillData) => {
    let skillItem = SkillDataset.getItem(skillData.id)

    if (Helper.isEmpty(skillItem)) {
        return false
    }

    return (
        <div key={skillItem.id} className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_(skillItem.name)} Lv.{skillData.level} / {skillItem.list.length}</span>

                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {
                            States.setter.decreaseRequiredConditionsSkillLevel(skillItem.id)
                        }} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {
                            States.setter.increaseRequiredConditionsSkillLevel(skillItem.id)
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.setter.removeRequiredConditionsSkill(skillItem.id)
                        }} />
                </div>
            </div>
            <div className="col-12 mhrc-value mhrc-description">
                <span>
                    {(0 !== skillData.level)
                        ? _(skillItem.list[skillData.level - 1].effect)
                        : _('skillLevelZero')}
                </span>
            </div>
        </div>
    )
}

export default function SkillList (props) {

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
        Helper.debug('Component: ConditionOptions -> SkillList')

        const showModal = () => {
            States.setter.showModal('skillSelector', {
                target: 'requiredConditions'
            })
        }

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('skill')}</span>
                    <div className="mhrc-icons_bundle">
                        <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                    </div>
                </div>

                {stateRequiredConditions.skills.map((skillData) => {
                    return renderSkillItem(skillData)
                })}
             </div>
        )
    }, [
        stateRequiredConditions
    ])
}
