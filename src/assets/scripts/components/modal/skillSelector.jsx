/**
 * Condition Item Selector
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
const renderSetItem = (set) => {
    return (
        <div key={set.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(set.name)}</span>

                <div className="mhrc-icons_bundle">
                    {set.isSelect ? (
                        <IconButton
                            iconName="minus" altName={_('remove')}
                            onClick={() => {States.setter.removeRequiredSet(set.id)}} />
                    ) : (
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {States.setter.addRequiredSet(set.id)}} />
                    )}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {set.skills.map((skill, index) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhrc-name">
                                <span>({skill.require}) {_(skillInfo.name)} Lv.{skill.level}</span>
                            </div>
                            <div className="col-12 mhrc-value mhrc-description">
                                <span>{_(skillInfo.list[0].description)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

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
                                <span>{_(item.description)}</span>
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
const SetList = (props) => {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: ConditionItemSelector -> SetList')

        return data.map(renderSetItem)
    }, [data])
}

const SkillList = (props) => {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: ConditionItemSelector -> SkillList')

        return data.map(renderSkillItem)
    }, [data])
}

export default function ConditionItemSelector(props) {

    /**
     * Hooks
     */
    const [stateIsShow, updateIsShow] = useState(States.getter.isShowConditionItemSelector())
    const [stateBypassData, updateBypassData] = useState(States.getter.getConditionItemSelectorBypassData())
    const [stateRequiredSets, updateRequiredSets] = useState(States.getter.getRequiredSets())
    const [stateRequiredSkills, updateRequiredSkills] = useState(States.getter.getRequiredSkills())
    const [stateMode, updateMode] = useState(undefined)
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateBypassData)) {
            return
        }

        let idList = []
        let selectedList = []
        let unselectedList = []

        switch (stateBypassData.mode) {
        // case 'set':
        //     idList = stateRequiredSets.map((set) => {
        //         return set.id
        //     })

        //     SetDataset.getItems().forEach((setInfo) => {
        //         if (-1 !== idList.indexOf(setInfo.id)) {
        //             setInfo.isSelect = true

        //             selectedList.push(setInfo)
        //         } else {
        //             setInfo.isSelect = false

        //             unselectedList.push(setInfo)
        //         }
        //     })

        //     break
        case 'skill':
            idList = stateRequiredSkills.map((skill) => {
                return skill.id
            })

            SkillDataset.getItems().forEach((skillInfo) => {
                if (true === skillInfo.from.jewel
                    || true === skillInfo.from.armor
                    || true === skillInfo.from.charm
                ) {
                    if (-1 !== idList.indexOf(skillInfo.id)) {
                        skillInfo.isSelect = true

                        selectedList.push(skillInfo)
                    } else {
                        skillInfo.isSelect = false

                        unselectedList.push(skillInfo)
                    }
                }
            })

            break
        default:
            return
        }

        updateMode(stateBypassData.mode)
        updateSortedList(selectedList.concat(unselectedList))
    }, [stateBypassData, stateRequiredSets, stateRequiredSkills])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeCommon = States.store.subscribe(() => {
            updateRequiredSets(States.getter.getRequiredSets())
            updateRequiredSkills(States.getter.getRequiredSkills())
        })

        const unsubscribeModal = States.store.subscribe(() => {
            updateIsShow(States.getter.isShowConditionItemSelector())
            updateBypassData(States.getter.getConditionItemSelectorBypassData())
        })

        return () => {
            unsubscribeCommon()
            unsubscribeModal()
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
    const handleFastWindowClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideConditionItemSelector()
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    const getContent = useCallback(() => {
        switch (stateMode) {
        case 'set':
            return (
                <SetList data={stateSortedList.filter((set) => {

                    // Create Text
                    let text = _(set.name)

                    set.skills.forEach((set) => {
                        let skillInfo = SkillDataset.getInfo(set.id)

                        if (Helper.isEmpty(skillInfo)) {
                            return
                        }

                        text += _(skillInfo.name) + skillInfo.list.map((item) => {
                            return _(item.description)
                        }).join('')
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
        case 'skill':
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
        default:
            return false
        }
    }, [stateMode, stateSortedList, stateSegment])

    return (stateIsShow && Helper.isNotEmpty(stateBypassData)) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_(stateMode + 'List')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateSegment} onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="globe" defaultValue={stateMode}
                            options={getModeList()} onChange={handleModeChange} />
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={States.setter.hideConditionItemSelector} />
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
