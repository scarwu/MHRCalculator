/**
 * Enhance Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import EnhanceDataset from 'libraries/dataset/enhance'

// Load Components
import IconButton from 'components/common/iconButton'
import IconInput from 'components/common/iconInput'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleItemPickUp = (modalData, itemId) => {
    if (Helper.isNotEmpty(modalData.enhanceIndex)) {
        modalData.enhanceId = itemId
    } else if (Helper.isNotEmpty(modalData.slotIndex)) {
        modalData.jewelId = itemId
    } else {
        modalData.equipId = itemId
    }

    States.setter.setCurrentEquip(modalData)
    States.setter.hideEquipItemSelector()
}

/**
 * Render Functions
 */
const renderEnhanceItem = (enhance, modalData) => {
    return (
        <div key={enhance.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(enhance.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(false === enhance.isSelect) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleItemPickUp(modalData, enhance.id)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {enhance.list.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="col-2 mhrc-name">
                                <span>Lv.{item.level}</span>
                            </div>
                            <div className="col-10 mhrc-value mhrc-description">
                                <span>{_(item.description)}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default function EnhanceSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('enhanceSelector'))
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let sortedList = []

        sortedList = EnhanceDataset.getItems().map((enhanceInfo) => {
            enhanceInfo.isSelect = (stateModalData.enhanceId === enhanceInfo.id)

            return enhanceInfo
        })

        updateSortedList(sortedList)
    }, [stateModalData])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('enhanceSelector'))
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('enhanceSelector')
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

        return stateSortedList.filter((data) => {

            // Create Text
            let text = _(data.name)

            data.list.forEach((data) => {
                text += _(data.description)
            })

            // Search Nameword
            if (Helper.isNotEmpty(stateSegment)
                && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
            ) {
                return false
            }

            return true
        }).filter((data) => {
            return -1 !== data.allowRares.indexOf(modalData.equipRare)
                && -1 === modalData.enhanceIds.indexOf(data.id)
        }).sort((dataA, dataB) => {
            return _(dataA.id) > _(dataB.id) ? 1 : -1
        }).map((data) => {
            return renderEnhanceItem(data, modalData)
        })
    }, [
        stateModalData,
        stateSortedList,
        stateSegment
    ])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastClose}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_(stateMode + 'List')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                             defaultValue={stateSegment} onChange={handleSegmentInput} />
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('enhanceSelector')
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