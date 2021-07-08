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
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
// import SetDataset from 'libraries/dataset/set'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleShowSkillItemSelector = () => {
    States.setter.showConditionItemSelector({
        mode: 'skill'
    })
}

/**
 * Render Functions
 */
const renderSkillItem = (skill, enableSkillIdList) => {
    let skillInfo = SkillDataset.getInfo(skill.id)

    if (Helper.isEmpty(skillInfo)) {
        return false
    }

    let currentSkillLevel = 0
    let totalSkillLevel = 0

    skillInfo.list.forEach((item) => {
        if (false === item.isHidden || -1 !== enableSkillIdList.indexOf(skillInfo.id)) {
            currentSkillLevel++
        }

        totalSkillLevel++
    })

    return (
        <div key={skillInfo.id} className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                {(currentSkillLevel === totalSkillLevel) ? (
                    <span>{_(skillInfo.name)} Lv.{skill.level} / {currentSkillLevel}</span>
                ) : (
                    <span>{_(skillInfo.name)} Lv.{skill.level} / {currentSkillLevel} ({totalSkillLevel})</span>
                )}

                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {
                            States.setter.decreaseRequiredConditionsSkillLevel(skill.id)
                        }} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {
                            States.setter.increaseRequiredConditionsSkillLevel(skill.id)
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.setter.removeRequiredConditionsSkill(skill.id)
                        }} />
                </div>
            </div>
            <div className="col-12 mhrc-value mhrc-description">
                <span>
                    {(0 !== skill.level)
                        ? _(skillInfo.list[skill.level - 1].description)
                        : _('skillLevelZero')}
                </span>
            </div>
        </div>
    )
}

export default function SkillList(props) {

    /**
     * Hooks
     */
    // const [stateRequiredSets, updateRequiredSets] = useState(States.getter.getRequiredSets())
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

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('skill')}</span>
                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={handleShowSkillItemSelector} />
                    </div>
                </div>

                {stateRequiredConditions.skills.map((skill) => {
                    return renderSkillItem(skill, enableSkillIdList)
                })}
             </div>
        )
    }, [
        stateRequiredConditions
    ])
}
