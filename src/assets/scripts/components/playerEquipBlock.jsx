/**
 * Equips Displayer
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

// Load Libraries
import React, { Fragment, useState, useEffect, useMemo } from 'react'

// Load Core Libraries
import Helper from 'core/helper'

// Load Custom Libraries
import _ from 'libraries/lang'
import JewelDataset from 'libraries/dataset/jewel'
import EnhanceDataset from 'libraries/dataset/enhance'
import SkillDataset from 'libraries/dataset/skill'
import CommonDataset from 'libraries/dataset/common'

// Load Components
import CustomWeapon from 'components/sub/customWeapon'
import CustomCharm from 'components/sub/customCharm'

import IconButton from 'components/common/iconButton'
import IconTab from 'components/common/iconTab'
import SharpnessBar from 'components/common/sharpnessBar'

// Load State Control
import CommonState from 'states/common'

// Load Config & Constant
import Config from 'config'
import Constant from 'constant'

/**
 * Handle Functions
 */
const handleEquipsDisplayerRefresh = () => {
    CommonState.setter.cleanPlayerEquips()
}

const handleSwitchTempData = (index) => {
    CommonState.setter.switchTempData('playerEquips', index)
}

/**
 * Render Functions
 */
const renderEnhanceBlock = (equipItemInfo) => {
    let usedSize = 0

    equipItemInfo.enhances.forEach((enhance) => {
        let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

        usedSize += enhanceInfo.list[enhance.level - 1].size
    })

    return (
        <div className="col-12 mhrc-content">
            <div className="col-3 mhrc-name">
                <span>{_('enhanceFieldSize')}</span>
            </div>
            <div className="col-9 mhrc-value">
                <span>{usedSize} / {equipItemInfo.enhanceSize}</span>
                <div className="mhrc-icons_bundle">
                    {(usedSize < equipItemInfo.enhanceSize) ? (
                        <IconButton key={equipItemInfo.enhances.length} iconName="plus" altName={_('add')} onClick={() => {
                            CommonState.setter.showModal('enhanceSelector', {
                                equipType: equipItemInfo.type,
                                equipRare: equipItemInfo.rare,
                                enhanceIndex: equipItemInfo.enhances.length,
                                enhanceIds: equipItemInfo.enhances.map((enhance) => {
                                    return enhance.id
                                })
                            })
                        }} />
                    ) : false}
                </div>
            </div>

            {equipItemInfo.enhances.map((enhance, index) => {
                let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

                let currentLevel = enhance.level
                let prevLevel = 1 <= (currentLevel - 1)
                    ? currentLevel - 1 : currentLevel
                let nextLevel = (currentLevel + 1) <= enhanceInfo.list.length
                    ? currentLevel + 1 : currentLevel
                let currentSize = enhanceInfo.list[currentLevel - 1].size
                let prevSize = enhanceInfo.list[prevLevel - 1].size
                let nextSize = enhanceInfo.list[nextLevel - 1].size

                if ((usedSize + nextSize - currentSize) > equipItemInfo.enhanceSize) {
                    nextLevel = currentLevel
                } else if (-1 === enhanceInfo.list[nextLevel - 1].allowRares.indexOf(equipItemInfo.rare)) {
                    nextLevel = currentLevel
                }

                return (
                    <Fragment key={`${equipItemInfo.type}:${index}`}>
                        <div className="col-3 mhrc-name">
                            <span>{_('enhance')}: {index + 1}</span>
                        </div>
                        <div className="col-9 mhrc-value">
                            <span>[{enhanceInfo.list[currentLevel - 1].size}] {_(enhanceInfo.name)} Lv.{currentLevel}</span>
                            <div className="mhrc-icons_bundle">
                                <IconButton key={`prev:${prevLevel}`} iconName="minus-circle" altName={_('down')} onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipType: equipItemInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: enhance.id,
                                        enhanceLevel: prevLevel
                                    })
                                }} />
                                <IconButton key={`next:${nextLevel}`} iconName="plus-circle" altName={_('up')} onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipType: equipItemInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: enhance.id,
                                        enhanceLevel: nextLevel
                                    })
                                }} />
                                <IconButton iconName="times" altName={_('clean')} onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipType: equipItemInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: null
                                    })
                                }} />
                            </div>
                        </div>
                    </Fragment>
                )
            })}
        </div>
    )
}

const renderJewelOption = (equipType, slotIndex, slotSize, jewelInfo) => {
    let selectorData = {
        equipType: equipType,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null
    }

    let emptySelectorData = {
        equipType: equipType,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: null
    }

    if (Helper.isEmpty(jewelInfo)) {
        return (
            <Fragment key={`${equipType}:${slotIndex}`}>
                <div className="col-3 mhrc-name">
                    <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
                </div>
                <div className="col-9 mhrc-value">
                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => { CommonState.setter.showModal('jewelSelector', selectorData) }} />
                    </div>
                </div>
            </Fragment>
        )
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}`}>
            <div className="col-3 mhrc-name">
                <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
            </div>
            <div className="col-9 mhrc-value">
                <span>[{jewelInfo.size}] {_(jewelInfo.name)}</span>
                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => { CommonState.setter.showModal('jewelSelector', selectorData) }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => { CommonState.setter.setCurrentEquip(emptySelectorData) }} />
                </div>
            </div>
        </Fragment>
    )
}

const renderWeaponProperties = (equipItemInfo) => {
    let originalSharpness = null
    let enhancedSharpness = null

    if (Helper.isNotEmpty(equipItemInfo.sharpness)) {
        originalSharpness = Helper.deepCopy(equipItemInfo.sharpness)
        enhancedSharpness = Helper.deepCopy(equipItemInfo.sharpness)
        enhancedSharpness.value += 50
    }

    return (
        <div className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhrc-content">
                {Helper.isNotEmpty(equipItemInfo.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhrc-value mhrc-sharpness">
                            <SharpnessBar data={originalSharpness} />
                            <SharpnessBar data={enhancedSharpness} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipItemInfo.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipItemInfo.criticalRate}%</span>
                </div>

                {(Helper.isNotEmpty(equipItemInfo.element)
                    && Helper.isNotEmpty(equipItemInfo.element.attack))
                    ? (
                        <Fragment>
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: {_(equipItemInfo.element.attack.type)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {equipItemInfo.element.attack.isHidden ? (
                                    <span>({equipItemInfo.element.attack.value})</span>
                                ) : (
                                    <span>{equipItemInfo.element.attack.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipItemInfo.element)
                    && Helper.isNotEmpty(equipItemInfo.element.status))
                    ? (
                        <Fragment>
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: {_(equipItemInfo.element.status.type)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {equipItemInfo.element.status.isHidden ? (
                                    <span>({equipItemInfo.element.status.value})</span>
                                ) : (
                                    <span>{equipItemInfo.element.status.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipItemInfo.elderseal)) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('elderseal')}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{_(equipItemInfo.elderseal.affinity)}</span>
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipItemInfo.defense}</span>
                </div>
            </div>
        </div>
    )
}

const renderArmorProperties = (equipItemInfo) => {
    return (
        <div className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipItemInfo.defense}</span>
                </div>

                {Constant.resistances.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhrc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <span>{equipItemInfo.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const renderEquipPartBlock = (equipType, currentEquipItem, requiredEquip) => {
    let equipItemInfo = null

    if ('weapon' === equipType) {
        equipItemInfo = CommonDataset.getAppliedWeaponInfo(currentEquipItem)
    } else if ('helm' === equipType
        || 'chest' === equipType
        || 'arm' === equipType
        || 'waist' === equipType
        || 'leg' === equipType
    ) {
        equipItemInfo = CommonDataset.getAppliedArmorInfo(currentEquipItem)
    } else if ('petalace' === equipType) {
        // equipItemInfo = CommonDataset.getAppliedPetalaceInfo(currentEquipItem)
    } else if ('charm' === equipType) {
        // equipItemInfo = CommonDataset.getAppliedCharmInfo(currentEquipItem)
    } else {
        return false
    }

    let isNotRequire = true

    if (Helper.isNotEmpty(requiredEquip)) {
        if ('weapon' === equipType) {
            isNotRequire = Helper.jsonHash({
                id: currentEquipItem.id,
                enhances: currentEquipItem.enhances
            }) !== Helper.jsonHash({
                id: requiredEquip.id,
                enhances: requiredEquip.enhances
            })
        } else {
            isNotRequire = currentEquipItem.id !== requiredEquip.id
        }
    }

    if (Helper.isEmpty(equipItemInfo)) {
        return (
            <div key={equipType} className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_(equipType)}</span>
                    <div className="mhrc-icons_bundle">
                        {'weapon' === equipType ? (
                            <IconButton
                                iconName="wrench" altName={_('customWeapon')}
                                onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipType: 'weapon',
                                        equipId: 'customWeapon'
                                    })
                                }} />
                        ) : false}
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {
                                let modalName = equipType + 'Selector'

                                if ('helm' === equipType
                                    || 'chest' === equipType
                                    || 'arm' === equipType
                                    || 'waist' === equipType
                                    || 'leg' === equipType
                                ) {
                                    modalName = 'armorSelector'
                                }

                                CommonState.setter.showModal(modalName, {
                                    target: 'playerEquips',
                                    equipType: equipType,
                                    equipId: (Helper.isNotEmpty(equipItemInfo)) ? equipItemInfo.id : null
                                })
                            }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={selectorData.equipId} className="mhrc-item mhrc-item-3-step">
            <div className="col-12 mhrc-name">
                <span>{_(equipType)}: {_(equipItemInfo.name)}</span>
                <div className="mhrc-icons_bundle">
                    {isNotRequire ? (
                        <IconButton
                            iconName="arrow-left" altName={_('include')}
                            onClick={() => { CommonState.setter.setRequiredConditions(equipType, currentEquipItem) }} />
                    ) : false}
                    {'weapon' === equipType ? (
                        <IconButton
                            iconName="wrench" altName={_('customWeapon')}
                            onClick={() => {
                                CommonState.setter.setCurrentEquip({
                                    equipType: 'weapon',
                                    equipId: 'customWeapon'
                                })
                            }} />
                    ) : false}
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => { CommonState.setter.showModal(equipType + 'Selector', selectorData) }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            CommonState.setter.setCurrentEquip({
                                equipType: equipType,
                                equipId: null
                            })
                        }} />
                </div>
            </div>

            {(0 < equipItemInfo.enhanceSize) ? (
                renderEnhanceBlock(equipItemInfo)
            ) : false}

            {(Helper.isNotEmpty(equipItemInfo.slots)
                && 0 !== equipItemInfo.slots.length)
                ? (
                    <div className="col-12 mhrc-content">
                        {equipItemInfo.slots.map((data, index) => {
                            return renderJewelOption(
                                equipType, index, data.size,
                                JewelDataset.getInfo(data.jewel.id)
                            )
                        })}
                    </div>
                ) : false}

            {('weapon' === equipType)
                ? renderWeaponProperties(equipItemInfo) : false}

            {('weapon' !== equipType && 'charm' !== equipType)
                ? renderArmorProperties(equipItemInfo) : false}

            {(Helper.isNotEmpty(equipItemInfo.skills)
                && 0 !== equipItemInfo.skills.length)
                ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('skill')}</span>
                        </div>
                        <div className="col-12 mhrc-content">
                            {equipItemInfo.skills.sort((skillA, skillB) => {
                                return skillB.level - skillA.level
                            }).map((data) => {
                                let skillInfo = SkillDataset.getInfo(data.id)

                                return (Helper.isNotEmpty(skillInfo)) ? (
                                    <div key={data.id} className="col-6 mhrc-value">
                                        <span>{_(skillInfo.name)} Lv.{data.level}</span>
                                    </div>
                                ) : false
                            })}
                        </div>
                    </div>
                ) : false}
        </div>
    )
}

export default function PlayerEquipsBlock(props) {

    /**
     * Hooks
     */
    const [stateTempData, updateTempData] = useState(CommonState.getter.getTempData())
    const [statePlayerEquips, updatePlayerEquips] = useState(CommonState.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(CommonState.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = CommonState.store.subscribe(() => {
            updateTempData(CommonState.getter.getTempData())
            updatePlayerEquips(CommonState.getter.getPlayerEquips())
            updateRequiredConditions(CommonState.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const getContent = useMemo(() => {
        let blocks = []

        Object.keys(statePlayerEquips.current).forEach((equipType) => {
            if (Helper.isNotEmpty(statePlayerEquips.current[equipType])
                && 'customWeapon' === statePlayerEquips.current[equipType].id
            ) {
                blocks.push((
                    <CustomWeapon key="customWeapon" />
                ))

                return
            }

            if (Helper.isNotEmpty(statePlayerEquips.current[equipType])
                && 'customCharm' === statePlayerEquips.current[equipType].id
            ) {
                blocks.push((
                    <CustomCharm key="customCharm" />
                ))

                return
            }

            blocks.push(renderEquipPartBlock(
                equipType,
                statePlayerEquips.current[equipType],
                stateRequiredConditions.equips.current[equipType]
            ))
        })

        return blocks
    }, [statePlayerEquips, stateRequiredConditions])

    return (
        <div className="col mhrc-equips">
            <div className="mhrc-panel">
                <span className="mhrc-title">{_('equipBundle')}</span>

                <div className="mhrc-icons_bundle-left">
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 1'}
                        isActive={0 === stateTempData.playerEquips.index}
                        onClick={() => { handleSwitchTempData(0) }} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 2'}
                        isActive={1 === stateTempData.playerEquips.index}
                        onClick={() => { handleSwitchTempData(1) }} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 3'}
                        isActive={2 === stateTempData.playerEquips.index}
                        onClick={() => { handleSwitchTempData(2) }} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 4'}
                        isActive={3 === stateTempData.playerEquips.index}
                        onClick={() => { handleSwitchTempData(3) }} />
                </div>

                <div className="mhrc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleEquipsDisplayerRefresh} />
                    <IconButton
                        iconName="th-list" altName={_('bundleList')}
                        onClick={CommonState.setter.showBundleItemSelector} />
                </div>
            </div>

            <div className="mhrc-list">
                {getContent}
            </div>
        </div>
    )
}
