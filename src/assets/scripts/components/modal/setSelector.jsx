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
const handleModeChange = (event) => {
    States.setter.showConditionItemSelector({
        mode: event.target.value
    })
}

/**
 * Render Functions
 */
const renderSetItem = (setItem) => {
    return (
        <div key={setItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(setItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {setItem.isSelect ? (
                        <IconButton
                            iconName="minus" altName={_('remove')}
                            onClick={() => { States.setter.removeRequiredSet(setItem.id)}} />
                    ) : (
                        <IconButton
                            iconName="plus" altName={_('add')}
                                onClick={() => { States.setter.addRequiredSet(setItem.id)}} />
                    )}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-2 mhrc-name">
                    <span>{_('rare')}</span>
                </div>
                <div className="col-4 mhrc-value">
                    <span>{setItem.rare}</span>
                </div>

                {setItem.items.map((armorItem, index) => {
                    let armorInfo = ArmorDataset.getInfo(armorItem.id)

                    return Helper.isNotEmpty(armorInfo) ? (
                        <Fragment key={index}>
                            <div className="col-2 mhrc-name">
                                <span>{_(armorInfo.type)}</span>
                            </div>
                            <div className="col-4 mhrc-value">
                                <span>{_(armorInfo.name)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

/**
 * Sub Components
 */
const SetList = (props) => {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: ConditionItemSelector -> SetList')

        return data.map(renderSetItem)
    }, [data])
}

export default function SetSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('setSelector'))
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let idList = []
        let selectedList = []
        let unselectedList = []

        idList = stateRequiredConditions.sets.map((set) => {
            return set.id
        })

        SetDataset.getItems().forEach((setInfo) => {
            if (-1 !== idList.indexOf(setInfo.id)) {
                setInfo.isSelect = true

                selectedList.push(setInfo)
            } else {
                setInfo.isSelect = false

                unselectedList.push(setInfo)
            }
        })

        updateSortedList(selectedList.concat(unselectedList))
    }, [
        stateModalData,
        stateRequiredConditions
    ])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('setSelector'))
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Variables
     */
    const getModeList = () => {
        return [
            { key: 'set',   value: _('set') },
            { key: 'skill', value: _('skill') }
        ]
    }

    /**
     * Handle Functions
     */
    const handleFastClose = useCallback((event) => {
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

    const getContent = useCallback(() => {
        return (
            <SetList data={stateSortedList.filter((set) => {

                // Create Text
                let text = _(set.name)

                // Search Nameword
                if (Helper.isNotEmpty(stateSegment)
                    && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                ) {
                    return false
                }

                return true
            }).sort((dataA, dataB) => {
                return _(dataA.rare) > _(dataB.rare) ? 1 : -1
            })} />
        )
    }, [
        stateSortedList,
        stateSegment
    ])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastClose}>
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
                        {getContent()}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
