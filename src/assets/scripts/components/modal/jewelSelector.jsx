/**
 * Jewel Selector Modal
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
import JewelDataset from 'libraries/dataset/jewel'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconInput from 'components/common/iconInput'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquipJewel(tempData.equipType, tempData.idIndex, itemId)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquipJewel(tempData.equipType, tempData.idIndex, itemId)
    }

    States.setter.hideModal('jewelSelector')
}

/**
 * Render Functions
 */
const renderJewelItem = (jewelItem, tempData) => {
    return (
        <div key={jewelItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>[{jewelItem.size}] {_(jewelItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(Helper.isNotEmpty(tempData.target) && jewelItem.id !== tempData.id) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {
                                handleItemPickUp(jewelItem.id, tempData)
                            }} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {jewelItem.skills.map((skillData, index) => {
                    let skillItem = SkillDataset.getItem(skillData.id)

                    return Helper.isNotEmpty(skillItem) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhrc-name">
                                <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                            </div>
                            <div className="col-12 mhrc-value mhrc-description">
                                <span>{_(skillItem.list[skillData.level - 1].effect)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

export default function JewelSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('jewelSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    const [stateTempData, updateTempData] = useState(null)
    const refModal = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('jewelSelector'))
            updatePlayerEquips(States.getter.getPlayerEquips())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Initialize
    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            updateTempData(null)

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
                && Helper.isNotEmpty(statePlayerEquips[equipType].jeweldIds)
                && Helper.isNotEmpty(statePlayerEquips[equipType].jeweldIds[idIndex])
            ) {
                tempData.id = statePlayerEquips[equipType].jeweldIds[idIndex]
            }

            if ('requiredConditions' === tempData.target
                && Helper.isNotEmpty(stateRequiredConditions.equips)
                && Helper.isNotEmpty(stateRequiredConditions.equips[equipType])
                && Helper.isNotEmpty(stateRequiredConditions.equips[equipType].jeweldIds)
                && Helper.isNotEmpty(stateRequiredConditions.equips[equipType].jeweldIds[idIndex])
            ) {
                tempData.id = stateRequiredConditions.equips[equipType].jeweldIds[idIndex]
            }
        }

        // Set Size
        if (Helper.isEmpty(tempData.size)) {
            tempData.size = 3
        }

        // Set List
        tempData.list = []

        for (let size = tempData.size; size >= 1; size--) {
            for (let rare = 9; rare >= 1; rare--) {
                tempData.list = tempData.list.concat(JewelDataset.rareIs(rare).sizeIs(size).getList())
            }
        }

        updateTempData(tempData)
    }, [
        stateModalData,
        statePlayerEquips,
        stateRequiredConditions
    ])

    /**
     * Handle Functions
     */
    const handleFastClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('jewelSelector')
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        updateTempData(Object.assign({}, stateTempData, {
            segment: (0 !== segment.length)
                ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null
        }))
    }, [stateTempData])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        return stateTempData.list.filter((item) => {

            // Create Text
            let text = _(item.name)

            item.skills.forEach((skillData) => {
                let skillItem = SkillDataset.getItem(skillData.id)

                if (Helper.isNotEmpty(skillItem)) {
                    text += _(skillItem.name)
                }
            })

            // Search Nameword
            if (Helper.isNotEmpty(stateTempData.segment)
                && -1 === text.toLowerCase().search(stateTempData.segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.id) > _(itemB.id) ? 1 : -1
        }).map((item) => {
            return renderJewelItem(item, stateTempData)
        })
    }, [stateTempData])

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastClose}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('jewelList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateTempData.segment} onChange={handleSegmentInput} />
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('jewelSelector')
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