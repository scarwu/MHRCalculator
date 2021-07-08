/**
 * Weapon Selector Modal
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
import WeaponDataset from 'libraries/dataset/weapon'
import EnhanceDataset from 'libraries/dataset/enhance'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconSelector from 'components/common/iconSelector'
import IconInput from 'components/common/iconInput'
import SharpnessBar from 'components/common/sharpnessBar'

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

    CommonState.setter.hideModal('weaponSelector')
}

/**
 * Render Functions
 */
const renderWeaponItem = (weaponItem, modalData) => {
    if (Helper.isNotEmpty(weaponItem.element.attack)
        && Helper.isEmpty(weaponItem.element.attack.maxValue)
    ) {
        weaponItem.element.attack.maxValue = '?'
    }

    if (Helper.isNotEmpty(weaponItem.element.status)
        && Helper.isEmpty(weaponItem.element.status.maxValue)
    ) {
        weaponItem.element.status.maxValue = '?'
    }

    return (
        <div key={weaponItem.id} className="mhrc-item mhrc-item-2-step">
            <div className="col-12 mhrc-name">
                <span>{_(weaponItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {(weaponItem.id !== modalData.equipId) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => { handleItemPickUp(weaponItem.id, modalData)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    <span>{_(weaponItem.series)}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.criticalRate}</span>
                </div>

                {Helper.isNotEmpty(weaponItem.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhrc-value mhrc-sharpness">
                            <SharpnessBar data={{ value: weaponItem.sharpness.minValue, steps: weaponItem.sharpness.steps }} />
                            <SharpnessBar data={{ value: weaponItem.sharpness.maxValue, steps: weaponItem.sharpness.steps }} />
                        </div>
                    </Fragment>
                ) : false}

                {Helper.isNotEmpty(weaponItem.element.attack) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_(weaponItem.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            {weaponItem.element.attack.isHidden ? (
                                <span>({weaponItem.element.attack.minValue}-{weaponItem.element.attack.maxValue})</span>
                            ) : (
                                <span>{weaponItem.element.attack.minValue}-{weaponItem.element.attack.maxValue}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                {Helper.isNotEmpty(weaponItem.element.status) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_(weaponItem.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            {weaponItem.element.status.isHidden ? (
                                <span>({weaponItem.element.status.minValue}-{weaponItem.element.status.maxValue})</span>
                            ) : (
                                <span>{weaponItem.element.status.minValue}-{weaponItem.element.status.maxValue}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.defense}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    {weaponItem.slots.map((slot, index) => {
                        return (
                            <span key={index}>[{slot.size}]</span>
                        )
                    })}
                </div>

                {/* {weaponItem.skills.map((skillItem, index) => {
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
                })} */}
            </div>
        </div>
    )
}

export default function WeaponSelectorModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(CommonState.getter.getModalData('weaponSelector'))
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

        let sortedList = WeaponDataset.getItems()
        let typeList = {}
        let rareList = {}
        let type = null
        let rare = null

        let weaponInfo = WeaponDataset.getInfo(stateModalData.equipId)

        typeList = Constant.weaponTypes.map((type) => {
            return { key: type, value: _(type) }
        })
        type = (Helper.isNotEmpty(weaponInfo) && Helper.isNotEmpty(weaponInfo.type))
            ? weaponInfo.type : typeList[0].key

        sortedList.forEach((weaponInfo) => {
            rareList[weaponInfo.rare] = weaponInfo.rare
        })

        rareList = Object.values(rareList).reverse().map((rare) => {
            return { key: rare, value: _('rare') + `: ${rare}` }
        })
        rare = (Helper.isNotEmpty(weaponInfo)) ? weaponInfo.rare : rareList[0].key

        updateSortedList(sortedList)
        updateTypeList(typeList)
        updateRareList(rareList)
        updateType(type)
        updateRare(rare)
    }, [stateModalData])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeModel = CommonState.store.subscribe(() => {
            updateModalData(CommonState.getter.getModalData('weaponSelector'))
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

        CommonState.setter.hideEquipItemSelector()
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
            text += _(data.type)

            if (Helper.isNotEmpty(data.element)
                && Helper.isNotEmpty(data.element.attack)
            ) {
                text += _(data.element.attack.type)
            }

            if (Helper.isNotEmpty(data.element)
                && Helper.isNotEmpty(data.element.status)
            ) {
                text += _(data.element.status.type)
            }

            // data.skills.forEach((data) => {
            //     let skillInfo = SkillDataset.getInfo(data.id)

            //     if (Helper.isNotEmpty(skillInfo)) {
            //         text += _(skillInfo.name)
            //     }
            // })

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
            return renderWeaponItem(data, modalData)
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
                    <span className="mhrc-title">{_('WeaponList')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                             defaultValue={stateSegment} onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="globe" defaultValue={stateType}
                            options={stateTypeList} onChange={handleTypeChange} />
                        <IconSelector
                            iconName="globe" defaultValue={stateRare}
                            options={stateRareList} onChange={handleRareChange} />
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {CommonState.setter.hideModal('weaponSelector')}} />
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