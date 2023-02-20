/**
 * RampageSkill Selector Modal
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
import RampageSkillDataset from '@/scripts/libraries/dataset/rampageSkill'

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
        States.setter.setPlayerEquipRampageSkill('weapon', tempData.idIndex, itemId)
    }
}

/**
 * Render Functions
 */
const renderRampageSkillItem = (rampageSkillItem, tempData) => {
    let classNames = [
        'mhrc-item'
    ]

    if (Helper.isEmpty(tempData.target) || rampageSkillItem.id !== tempData.id) {
        classNames.push('mhrc-item-2-step')
    } else {
        classNames.push('mhrc-item-3-step')
    }

    return (
        <div key={rampageSkillItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhrc-name">
                <span>{_(rampageSkillItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (rampageSkillItem.id !== tempData.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(rampageSkillItem.id, tempData)
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
            <div className="col-12 mhrc-value mhrc-description">
                <span>{_(rampageSkillItem.description)}</span>
            </div>
        </div>
    )
}

export default function RampageSkillSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('rampageSkillSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('rampageSkillSelector'))
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
                && Helper.isNotEmpty(statePlayerEquips.weapon)
                && Helper.isNotEmpty(statePlayerEquips.weapon.rampageSkillIds)
                && Helper.isNotEmpty(statePlayerEquips.weapon.rampageSkillIds[idIndex])
            ) {
                tempData.id = statePlayerEquips.weapon.rampageSkillIds[idIndex]
            }
        }

        // Set List
        tempData.list = RampageSkillDataset.getList()

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

        States.setter.hideModal('rampageSkillSelector')

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
            return _(itemA.id) > _(itemB.id) ? 1 : -1
        }).map((item) => {
            return renderRampageSkillItem(item, stateTempData)
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

                    <span className="mhrc-title">{_('rampageSkillList')}</span>

                    <div className="mhrc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('rampageSkillSelector')
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