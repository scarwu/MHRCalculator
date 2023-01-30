/**
 * Petalace Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import PetalaceDataset from '@/scripts/libraries/dataset/petalace'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconInput from '@/scripts/components/common/iconInput'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquip(tempData.equipType, itemId)
    }
}

/**
 * Render Functions
 */
const renderPetalaceItem = (petalaceItem, tempData) => {
    let classNames = [
        'mhrc-item'
    ]

    if (Helper.isEmpty(tempData.target) || petalaceItem.id !== tempData.id) {
        classNames.push('mhrc-item-2-step')
    } else {
        classNames.push('mhrc-item-3-step')
    }

    return (
        <div key={petalaceItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhrc-name">
                <span>{_(petalaceItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (petalaceItem.id !== tempData.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(petalaceItem.id, tempData)
                                }} />
                        ) : (
                            <IconButton
                                iconName="times" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(null, tempData)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('rare')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    <span>{petalaceItem.rare}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('healthIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{petalaceItem.health.increment}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('healthObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{petalaceItem.health.obtain}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attackIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{petalaceItem.attack.increment}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attackObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{petalaceItem.attack.obtain}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('defenseIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{petalaceItem.defense.increment}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('defenseObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{petalaceItem.defense.obtain}</span>
                </div>
            </div>
        </div>
    )
}

export default function PetalaceSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('petalaceSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('petalaceSelector'))
            updatePlayerEquips(States.getter.getPlayerEquips())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Initialize
    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            updateTempData(null)

            window.removeEventListener('keydown', handleSearchFocus)

            return
        }

        let tempData = Helper.deepCopy(stateModalData)

        // Set Id
        tempData.id = null

        if (Helper.isNotEmpty(tempData.target)) {
            let equipType = tempData.equipType
            let idIndex = tempData.idIndex

            if ('playerEquips' === tempData.target
                && Helper.isNotEmpty(statePlayerEquips[equipType])
            ) {
                tempData.id = statePlayerEquips[equipType].id
            }
        }

        // Set List
        tempData.list = PetalaceDataset.getList()

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
    }, [
        stateModalData,
        statePlayerEquips
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('petalaceSelector')

        updateFilter({})
    }, [])

    const handleSearchFocus = useCallback((event) => {
        if ('f' !== event.key || true !== event.ctrlKey) {
            return
        }

        event.preventDefault()

        refSearch.current.focus()
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        updateFilter(Object.assign({}, stateFilter, {
            segment: (0 !== segment.length)
                ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null
        }))
    }, [stateFilter])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        return stateTempData.list.filter((item) => {

            // Create Text
            let text = _(item.name)

            // Search Nameword
            if (Helper.isNotEmpty(stateFilter.segment)
                && -1 === text.toLowerCase().search(stateFilter.segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.rare) > _(itemB.rare) ? 1 : -1
        }).map((item) => {
            return renderPetalaceItem(item, stateTempData)
        })
    }, [
        stateTempData,
        stateFilter
    ])

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <div className="mhrc-icons_bundle-left">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            bypassRef={refSearch} defaultValue={stateFilter.segment}
                            onChange={handleSegmentInput} />
                    </div>

                    <span className="mhrc-title">{_('petalaceList')}</span>

                    <div className="mhrc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('petalaceSelector')
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