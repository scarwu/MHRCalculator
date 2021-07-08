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
const handleItemPickUp = (itemId, modalData) => {
    if ('playerEquips' === modalData.target) {
        States.setter.setPlayerEquipJewel(modalData.equipType, modalData.idIndex, itemId)
    }

    if ('requiredConditions' === modalData.target) {
        States.setter.setRequiredConditionsEquipJewel(modalData.equipType, modalData.idIndex, itemId)
    }

    States.setter.hideModal('jewelSelector')
}

/**
 * Render Functions
 */

const renderJewelItem = (jewelItem, modalData) => {
    return (
        <div key={jewelItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>[{jewelItem.size}] {_(jewelItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(jewelItem.id !== modalData.equipId) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {
                                handleItemPickUp(jewelItem.id, modalData)
                            }} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {jewelItem.skills.map((skillItem, index) => {
                    let skillInfo = SkillDataset.getInfo(skillItem.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhrc-name">
                                <span>{_(skillInfo.name)} Lv.{skillItem.level}</span>
                            </div>
                            <div className="col-12 mhrc-value mhrc-description">
                                <span>{_(skillInfo.list[skillItem.level - 1].effect)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

export default function JewelSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('jewelSelector'))
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let sortedList = JewelDataset.getItems()

        // for (let size = stateModalData.slotSize; size >= 1; size--) {
        //     for (let rare = 9; rare >= 1; rare--) {
        //         sortedList = sortedList.concat(
        //             JewelDataset.rareIs(rare).sizeIs(size).getItems().map((jewelInfo) => {
        //                 jewelInfo.isSelect = (stateModalData.jewelId === jewelInfo.id)

        //                 return jewelInfo
        //             })
        //         )
        //     }
        // }

        updateSortedList(sortedList)
    }, [stateModalData])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('jewelSelector'))
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

        States.setter.hideModel('jewelSelector')
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

            data.skills.forEach((skill) => {
                let skillInfo = SkillDataset.getInfo(skill.id)

                if (Helper.isNotEmpty(skillInfo)) {
                    text += _(skillInfo.name)
                }
            })

            // Search Nameword
            if (Helper.isNotEmpty(stateSegment)
                && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((dataA, dataB) => {
            return _(dataA.id) > _(dataB.id) ? 1 : -1
        }).map((data) => {
            return renderJewelItem(data, modalData)
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
                    <span className="mhrc-title">{_('jewelList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                             defaultValue={stateSegment} onChange={handleSegmentInput} />
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