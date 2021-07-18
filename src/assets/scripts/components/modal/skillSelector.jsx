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
const handleItemPickUp = (itemId, action, tempData) => {
    if ('requiredConditions' === tempData.target) {
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
const renderSkillItem = (skillItem, tempData) => {
    let classNames = [
        'mhrc-item'
    ]

    if (-1 === tempData.ids.indexOf(skillItem.id)) {
        classNames.push('mhrc-item-2-step')
    } else {
        classNames.push('mhrc-item-3-step')
    }

    return (
        <div key={skillItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhrc-name">
                <span>{_(skillItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (-1 === tempData.ids.indexOf(skillItem.id)) ? (
                            <IconButton
                                iconName="plus" altName={_('add')}
                                onClick={() => {
                                    handleItemPickUp(skillItem.id, 'add', tempData)
                                }} />
                        ) : (
                            <IconButton
                                iconName="minus" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(skillItem.id, 'remove', tempData)
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

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

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

    // Initialize
    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            updateTempData(null)

            window.removeEventListener('keydown', handleSearchFocus)

            return
        }

        let tempData = Helper.deepCopy(stateModalData)

        // Set Ids
        tempData.ids = []

        if (Helper.isNotEmpty(tempData.target)) {
            if ('requiredConditions' === tempData.target) {
                tempData.ids = stateRequiredConditions.skills.map((setData) => {
                    return setData.id
                })
            }
        }

        // Set List
        tempData.list = SkillDataset.getList()

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
    }, [
        stateModalData,
        stateRequiredConditions
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('skillSelector')

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

            item.list.forEach((skillData) => {
                text += _(skillData.name) + _(skillData.effect)
            })

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
            return renderSkillItem(item, stateTempData)
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

                    <span className="mhrc-title">{_('skillList')}</span>

                    <div className="mhrc-icons_bundle-right">
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
