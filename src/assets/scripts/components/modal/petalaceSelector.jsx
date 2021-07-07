/**
 * Petalace Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core Libraries
import Helper from 'core/helper'

// Load Custom Libraries
import _ from 'libraries/lang'
import PetalaceDataset from 'libraries/dataset/petalace'

// Load Components
import IconButton from 'components/common/iconButton'
import IconInput from 'components/common/iconInput'

// Load State Control
import CommonState from 'states/common'

// Load Constant
import Constant from 'constant'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, modalData) => {
    if ('playerEquips' === modalData.target) {
        CommonState.setter.setPlayerEquip(modalData.equipType, itemId)
    }

    if ('requiredConditions' === modalData.target) {
        CommonState.setter.setRequiredConditionsEquip(modalData.equipType, itemId)
    }

    CommonState.setter.hideModal('petalaceSelector')
}

/**
 * Render Functions
 */
const renderPetalaceItem = (petalaceItem, modalData) => {
    return (
        <div key={petalaceItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(petalaceItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(modalData.equipId !== petalaceItem.id) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => { handleItemPickUp(petalaceItem.id, modalData) }} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">

            </div>
        </div>
    )
}

export default function PetalaceSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(CommonState.getter.getModalData('petalaceSelector'))
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let sortedList = []

        sortedList = PetalaceDataset.getItems().map((petalaceInfo) => {
            petalaceInfo.isSelect = (stateModalData.equipId === petalaceInfo.id)

            return petalaceInfo
        })

        updateSortedList(sortedList)
    }, [stateModalData])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeModel = CommonState.store.subscribe(() => {
            updateModalData(CommonState.getter.getModalData('petalaceSelector'))
        })

        return () => {
            unsubscribeModel()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        CommonState.setter.hideModal('petalaceSelector')
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

            // Search Nameword
            if (Helper.isNotEmpty(stateSegment)
                && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((dataA, dataB) => {
            return _(dataA.rare) > _(dataB.rare) ? 1 : -1
        }).map((data) => {
            return renderPetalaceItem(data, modalData)
        })
    }, [
        stateModalData,
        stateSortedList,
        stateSegment
    ])

    return (Helper.isNotEmpty(stateModalData)) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('petalaceList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateSegment} onChange={handleSegmentInput} />

                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { CommonState.setter.hideModal('petalaceSelector') }} />
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