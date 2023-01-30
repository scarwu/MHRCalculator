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
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
// import SetDataset from '@/scripts/libraries/dataset/set'
import SetDataset from '@/scripts/libraries/dataset/set'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'

// Load States
import States from '@/scripts/states'

/**
 * Render Functions
 */
const renderSetItem = (setData) => {
    let setItem = SetDataset.getItem(setData.id)

    if (Helper.isEmpty(setItem)) {
        return false
    }

    return (
        <div key={setItem.id} className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_(setItem.name)} x {setData.count} / {setItem.items.length}</span>

                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {
                            States.setter.decreaseRequiredConditionsSetCount(setItem.id)
                        }} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {
                            States.setter.increaseRequiredConditionsSetCount(setItem.id)
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.setter.removeRequiredConditionsSet(setItem.id)
                        }} />
                </div>
            </div>
        </div>
    )
}

export default function SetList (props) {

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
        Helper.debug('Component: ConditionOptions -> SetList')

        const showModal = () => {
            States.setter.showModal('setSelector', {
                target: 'requiredConditions'
            })
        }

        return (
            <div className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_('set')}</span>
                    <div className="mhrc-icons_bundle">
                        {(0 === stateRequiredConditions.sets.length) ? (
                            <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                        ) : (
                            <IconButton iconName = "exchange" altName={ _('change') } onClick = { showModal } />
                        )}
                    </div>
                </div>

                {stateRequiredConditions.sets.map((setData) => {
                    return renderSetItem(setData)
                })}
             </div>
        )
    }, [
        stateRequiredConditions
    ])
}
