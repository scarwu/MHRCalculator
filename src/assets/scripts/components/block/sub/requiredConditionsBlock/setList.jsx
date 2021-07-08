/**
 * Condition Options: Set List
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
import SetDataset from 'libraries/dataset/set'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

/**
 * Render Functions
 */
const renderSetItem = (set, enableSetIdList) => {
    let setInfo = SetDataset.getInfo(set.id)

    if (Helper.isEmpty(setInfo)) {
        return false
    }

    let currentSetCount = 0

    setInfo.list.forEach((item) => {
        if (false === item.isHidden || -1 !== enableSetIdList.indexOf(setInfo.id)) {
            currentSetCount++
        }
    })

    return (
        <div key={setInfo.id} className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_(setInfo.name)} x {currentSetCount}</span>

                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {
                            States.setter.decreaseRequiredConditionsSetCount(set.id)
                        }} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {
                            States.setter.increaseRequiredConditionsSetCount(set.id)
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.setter.removeRequiredConditionsSet(set.id)
                        }} />
                </div>
            </div>
        </div>
    )
}

export default function SetList(props) {

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
        Helper.debug('Component: ConditionOptions -> SetList')

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('set')}</span>
                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {
                                States.setter.showModal('setSelector', {
                                    target: 'requiredConditions'
                                })
                            }} />
                    </div>
                </div>

                {stateRequiredConditions.sets.map((set) => {
                    return renderSetItem(set, enableSetIdList)
                })}
             </div>
        )
    }, [
        stateRequiredConditions
    ])
}
