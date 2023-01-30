/**
 * Condition Options
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useCallback } from 'react'

// Load Core Libraries
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconTab from '@/scripts/components/common/iconTab'

import EquipList from '@/scripts/components/block/sub/requiredConditionsBlock/equipList'
import SetList from '@/scripts/components/block/sub/requiredConditionsBlock/setList'
import SkillList from '@/scripts/components/block/sub/requiredConditionsBlock/skillList'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleRequireConditionRefresh = () => {
    States.setter.cleanRequiredConditions()
}

const handleSwitchDataStore = (index) => {
    States.setter.switchDataStore('requiredConditions', index)
}

export default function RequiredConditionsBlock (props) {

    /**
     * Hooks
     */
    const [stateDataStore, updateDataStore] = useState(States.getter.getDataStore())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateDataStore(States.getter.getDataStore())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <div className="col mhrc-conditions">
            <div className="mhrc-panel">
                <span className="mhrc-title">{_('requireCondition')}</span>

                <div className="mhrc-icons_bundle-left">
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 1'}
                        isActive={0 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(0)}} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 2'}
                        isActive={1 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(1)}} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 3'}
                        isActive={2 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(2)}} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 4'}
                        isActive={3 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(3)}} />
                </div>

                <div className="mhrc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleRequireConditionRefresh} />
                </div>
            </div>

            <div className="mhrc-list">
                <EquipList />
                <SetList />
                <SkillList />
            </div>
        </div>
    )
}
