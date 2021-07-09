/**
 * Set Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core Libraries
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import SetDataset from 'libraries/dataset/set'
import ArmorDataset from 'libraries/dataset/armor'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
import IconInput from 'components/common/iconInput'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, action, bypassData) => {
    if ('requiredConditions' === bypassData.target) {
        if ('add' === action) {
            States.setter.addRequiredConditionsSet(itemId)
        }

        if ('remove' === action) {
            States.setter.removeRequiredConditionsSet(itemId)
        }
    }

    States.setter.hideModal('petalaceSelector')
}

/**
 * Render Functions
 */
const renderSetItem = (setItem, modalData) => {
    return (
        <div key={setItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(setItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(modalData.bypass) ? (
                        (-1 === modalData.ids.indexOf(setItem.id)) ? (
                            <IconButton
                                iconName="plus" altName={_('add')}
                                onClick={() => {
                                    handleItemPickUp(setItem.id, 'add', modalData.bypass)
                                }} />
                        ) : (
                            <IconButton
                                iconName="minus" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(setItem.id, 'remove', modalData.bypass)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-2 mhrc-name">
                    <span>{_('rare')}</span>
                </div>
                <div className="col-4 mhrc-value">
                    <span>{setItem.rare}</span>
                </div>

                {setItem.items.map((armorData, index) => {
                    let armorItem = ArmorDataset.getItem(armorData.id)

                    return Helper.isNotEmpty(armorItem) ? (
                        <Fragment key={index}>
                            <div className="col-2 mhrc-name">
                                <span>{_(armorItem.type)}</span>
                            </div>
                            <div className="col-4 mhrc-value">
                                <span>{_(armorItem.name)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

export default function SetSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('setSelector'))
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let selectedList = []
        let unselectedList = []

        SetDataset.getList().forEach((setItem) => {
            if (-1 !== stateModalData.ids.indexOf(setItem.id)) {
                selectedList.push(setItem)
            } else {
                unselectedList.push(setItem)
            }
        })

        updateSortedList(selectedList.concat(unselectedList))
    }, [
        stateModalData
    ])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('setSelector'))
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('setSelector')
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateModalData)) {
            return false
        }

        let modalData = Helper.deepCopy(stateModalData)

        return stateSortedList.filter((item) => {

            // Create Text
            let text = _(item.name)

            // Search Nameword
            if (Helper.isNotEmpty(stateSegment)
                && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.rare) > _(itemB.rare) ? 1 : -1
        }).map((item) => {
            return renderSetItem(item, modalData)
        })
    }, [
        stateModalData,
        stateSortedList,
        stateSegment
    ])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('setList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateSegment} onChange={handleSegmentInput} />
                        {/* <IconSelector
                            iconName="globe" defaultValue={stateMode}
                            options={getModeList()} onChange={handleModeChange} /> */}
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('setSelector')
                            }} />
                    </div>
                </div>
                <div className="mhrc-list">
                    <div className="mhrc-wrapper">
                        {getContent}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
