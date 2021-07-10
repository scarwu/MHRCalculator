/**
 * Skill Selector Modal
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
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconInput from 'components/common/iconInput'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, action, bypassData) => {
    if ('requiredConditions' === bypassData.target) {
        if ('add' === action) {
            States.setter.addRequiredConditionsSkill(itemId)
        }

        if ('remove' === action) {
            States.setter.removeRequiredConditionsSkill(itemId)
        }
    }
}

/**
 * Render Functions
 */
const renderSkillItem = (skillItem, selectedIds, modalData) => {
    return (
        <div key={skillItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(skillItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(modalData.bypass) ? (
                        (-1 === selectedIds.indexOf(skillItem.id)) ? (
                            <IconButton
                                iconName="plus" altName={_('add')}
                                onClick={() => {
                                    handleItemPickUp(skillItem.id, 'add', modalData.bypass)
                                }} />
                        ) : (
                            <IconButton
                                iconName="minus" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(skillItem.id, 'remove', modalData.bypass)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {skillItem.list.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="col-2 mhrc-name">
                                <span>Lv.{item.level}</span>
                            </div>
                            <div className="col-10 mhrc-value mhrc-description">
                                <span>{_(item.effect)}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default function SkillSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('skillSelector'))
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())
    const [stateSelectedIds, updateSelectedIds] = useState([])
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let selectedIds = []

        if (Helper.isNotEmpty(stateModalData.bypass)
            && 'requiredConditions' === stateModalData.bypass.target
        ) {
            selectedIds = stateRequiredConditions.skills.map((skillData) => {
                return skillData.id
            })
        }

        let selectedList = []
        let unselectedList = []

        SkillDataset.getList().forEach((skillItem) => {
            if (-1 === selectedIds.indexOf(skillItem.id)) {
                selectedList.push(skillItem)
            } else {
                unselectedList.push(skillItem)
            }
        })

        updateSelectedIds(selectedIds)
        updateSortedList(selectedList.concat(unselectedList))
    }, [
        stateModalData,
        stateRequiredConditions
    ])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('skillSelector'))
            updateRequiredConditions(States.getter.getRequiredConditions())
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

        States.setter.hideModal('skillSelector')
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

            item.list.forEach((skillData) => {
                text += _(skillData.name) + _(skillData.description)
            })

            // Search Nameword
            if (Helper.isNotEmpty(stateSegment)
                && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.id) > _(itemB.id) ? 1 : -1
        }).map((item) => {
            return renderSkillItem(item, stateSelectedIds, modalData)
        })
    }, [
        stateModalData,
        stateSortedList,
        stateSelectedIds,
        stateSegment
    ])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('skillList')}</span>

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
                                States.setter.hideModal('skillSelector')
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
