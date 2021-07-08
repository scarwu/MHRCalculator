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
// import SetDataset from 'libraries/dataset/set'
import SkillDataset from 'libraries/dataset/skill'

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
const renderSkillItem = (skill) => {
    return (
        <div key={skill.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(skill.name)}</span>

                <div className="mhrc-icons_bundle">
                    {skill.isSelect ? (
                        <IconButton
                            iconName="minus" altName={_('remove')}
                            onClick={() => {States.setter.removeRequiredSkill(skill.id)}} />
                    ) : (
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {States.setter.addRequiredSkill(skill.id)}} />
                    )}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {skill.list.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="col-2 mhrc-name">
                                {item.isHidden ? (
                                    <span>(Lv.{item.level})</span>
                                ) : (
                                    <span>Lv.{item.level}</span>
                                )}
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

/**
 * Sub Components
 */
const SkillList = (props) => {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: ConditionItemSelector -> SkillList')

        return data.map(renderSkillItem)
    }, [data])
}

export default function SkillSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('skillSelector'))
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

        idList = stateRequiredConditions.skills.map((skill) => {
            return skill.id
        })

        SkillDataset.getItems().forEach((skillInfo) => {
            if (-1 !== idList.indexOf(skillInfo.id)) {
                skillInfo.isSelect = true

                selectedList.push(skillInfo)
            } else {
                skillInfo.isSelect = false

                unselectedList.push(skillInfo)
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
            updateModalData(States.getter.getModalData('skillSelector'))
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

        States.setter.hideModal('skillSelector')
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    const getContent = useCallback(() => {
        return (
            <SkillList data={stateSortedList.filter((skill) => {

                // Create Text
                let text = _(skill.name)

                skill.list.forEach((item) => {
                    text += _(item.name) + _(item.description)
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
                        {getContent()}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
