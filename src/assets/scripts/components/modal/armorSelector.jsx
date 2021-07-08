/**
 * Armor Selector Modal
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
import ArmorDataset from 'libraries/dataset/armor'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
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

    CommonState.setter.hideModal('armorSelector')
}

/**
 * Render Functions
 */
const renderArmorItem = (armorItem, modalData) => {
    return (
        <div key={armorItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(armorItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(armorItem.id !== modalData.equipId) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => { handleItemPickUp(armorItem.id, modalData) }} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    <span>{_(armorItem.series)}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{armorItem.minDefense}-{Helper.isNotEmpty(armorItem.maxDefense) ? armorItem.maxDefense : '?'}</span>
                </div>

                {Constant.resistanceTypes.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhrc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <span>{armorItem.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}

                <div className="col-3 mhrc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    {armorItem.slots.map((slotItem, index) => {
                        return (
                            <span key={index}>[{slotItem.size}]</span>
                        )
                    })}
                </div>

                {armorItem.skills.map((skillItem, index) => {
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

export default function ArmorSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(CommonState.getter.getModalData('armorSelector'))
    const [stateSortedList, updateSortedList] = useState([])
    const [stateType, updateType] = useState(undefined)
    const [stateRare, updateRare] = useState(undefined)
    const [stateTypeList, updateTypeList] = useState([])
    const [stateRareList, updateRareList] = useState([])
    const [stateSegment, updateSegment] = useState(undefined)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            return
        }

        let sortedList = ArmorDataset.getItems()
        let typeList = {}
        let rareList = {}
        let type = null
        let rare = null

        let armorInfo = ArmorDataset.getInfo(stateModalData.equipId)

        typeList = Constant.armorTypes.map((type) => {
            return { key: type, value: _(type) }
        })
        type = (Helper.isNotEmpty(stateModalData.equipType))
            ? stateModalData.equipType : typeList[0].key

        sortedList.forEach((armorInfo) => {
            rareList[armorInfo.rare] = armorInfo.rare
        })
        rareList = Object.values(rareList).reverse().map((rare) => {
            return { key: rare, value: _('rare') + `: ${rare}` }
        })
        rare = (Helper.isNotEmpty(armorInfo)) ? armorInfo.rare : rareList[0].key

        updateSortedList(sortedList)
        updateTypeList(typeList)
        updateRareList(rareList)
        updateType(type)
        updateRare(rare)
    }, [stateModalData])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeModel = CommonState.store.subscribe(() => {
            updateModalData(CommonState.getter.getModalData('armorSelector'))
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

        CommonState.setter.hideModal('armorSelector')
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    const handleTypeChange = useCallback((event) => {
        updateType(event.target.value)
    }, [])

    const handleRareChange = useCallback((event) => {
        updateRare(parseInt(event.target.value, 10))
    }, [])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateModalData)) {
            return false
        }

        let modalData = Helper.deepCopy(stateModalData)

        return stateSortedList.filter((data) => {
            if (data.type !== stateType) {
                return false
            }

            if (data.rare !== stateRare) {
                return false
            }

            // Create Text
            let text = _(data.name)
            text += _(data.series)

            data.skills.forEach((data) => {
                let skillInfo = SkillDataset.getInfo(data.id)

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
            return renderArmorItem(data, modalData)
        })
    }, [
        stateModalData,
        stateSortedList,
        stateTypeList,
        stateRareList,
        stateType,
        stateRare,
        stateSegment
    ])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('ArmorList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateSegment} onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="filter" defaultValue={stateType}
                            options={stateTypeList} onChange={handleTypeChange} />
                        <IconSelector
                            iconName="filter" defaultValue={stateRare}
                            options={stateRareList} onChange={handleRareChange} />
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { CommonState.setter.hideModal('armorSelector') }} />
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