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
import CustomWeapon from 'components/sub/equipsDisplayer/customWeapon'
import CustomCharm from 'components/sub/equipsDisplayer/customCharm'
import IconButton from 'components/common/iconButton'
import IconTab from 'components/common/iconTab'
import SharpnessBar from 'components/common/sharpnessBar'

// Load State Control
import CommonState from 'states/common'
import ModalState from 'states/modal'

// Load Config & Constant
import Config from 'config'
import Constant from 'constant'

/**
 * Handle Functions
 */
const handleEquipsDisplayerRefresh = () => {
    CommonState.setter.cleanPlayerEquipment()
}

const handleSwitchTempData = (index) => {
    CommonState.setter.switchTempData('equipsDisplayer', index)
}

/**
 * Render Functions
 */
const renderEnhanceBlock = (equipInfo) => {
    let usedSize = 0

    equipInfo.enhances.forEach((enhance) => {
        let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

        usedSize += enhanceInfo.list[enhance.level - 1].size
    })

    return (
        <div className="col-12 mhrc-content">
            <div className="col-3 mhrc-name">
                <span>{_('enhanceFieldSize')}</span>
            </div>
            <div className="col-9 mhrc-value">
                <span>{usedSize} / {equipInfo.enhanceSize}</span>
                <div className="mhrc-icons_bundle">
                    {(usedSize < equipInfo.enhanceSize) ? (
                        <IconButton key={equipInfo.enhances.length} iconName="plus" altName={_('add')} onClick={() => {
                            ModalState.setter.showEquipItemSelector({
                                equipmentPart: equipInfo.type,
                                equipRare: equipInfo.rare,
                                enhanceIndex: equipInfo.enhances.length,
                                enhanceIds: equipInfo.enhances.map((enhance) => {
                                    return enhance.id
                                })
                            })
                        }} />
                    ) : false}
                </div>
            </div>

            {equipInfo.enhances.map((enhance, index) => {
                let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

                let currentLevel = enhance.level
                let prevLevel = 1 <= (currentLevel - 1)
                    ? currentLevel - 1 : currentLevel
                let nextLevel = (currentLevel + 1) <= enhanceInfo.list.length
                    ? currentLevel + 1 : currentLevel
                let currentSize = enhanceInfo.list[currentLevel - 1].size
                let prevSize = enhanceInfo.list[prevLevel - 1].size
                let nextSize = enhanceInfo.list[nextLevel - 1].size

                if ((usedSize + nextSize - currentSize) > equipInfo.enhanceSize) {
                    nextLevel = currentLevel
                } else if (-1 === enhanceInfo.list[nextLevel - 1].allowRares.indexOf(equipInfo.rare)) {
                    nextLevel = currentLevel
                }

                return (
                    <Fragment key={`${equipInfo.type}:${index}`}>
                        <div className="col-3 mhrc-name">
                            <span>{_('enhance')}: {index + 1}</span>
                        </div>
                        <div className="col-9 mhrc-value">
                            <span>[{enhanceInfo.list[currentLevel - 1].size}] {_(enhanceInfo.name)} Lv.{currentLevel}</span>
                            <div className="mhrc-icons_bundle">
                                <IconButton key={`prev:${prevLevel}`} iconName="minus-circle" altName={_('down')} onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipmentPart: equipInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: enhance.id,
                                        enhanceLevel: prevLevel
                                    })
                                }} />
                                <IconButton key={`next:${nextLevel}`} iconName="plus-circle" altName={_('up')} onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipmentPart: equipInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: enhance.id,
                                        enhanceLevel: nextLevel
                                    })
                                }} />
                                <IconButton iconName="times" altName={_('clean')} onClick={() => {
                                    CommonState.setter.setCurrentEquip({
                                        equipmentPart: equipInfo.type,
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

const renderJewelOption = (equipmentPart, slotIndex, slotSize, jewelInfo) => {
    let selectorData = {
        equipmentPart: equipmentPart,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null
    }

    let emptySelectorData = {
        equipmentPart: equipmentPart,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: null
    }

    if (Helper.isEmpty(jewelInfo)) {
        return (
            <Fragment key={`${equipmentPart}:${slotIndex}`}>
                <div className="col-3 mhrc-name">
                    <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
                </div>
                <div className="col-9 mhrc-value">
                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {ModalState.setter.showEquipItemSelector(selectorData)}} />
                    </div>
                </div>
            </Fragment>
        )
    }

    return (
        <Fragment key={`${equipmentPart}:${slotIndex}`}>
            <div className="col-3 mhrc-name">
                <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
            </div>
            <div className="col-9 mhrc-value">
                <span>[{jewelInfo.size}] {_(jewelInfo.name)}</span>
                <div className="mhrc-icons_bundle">
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => {ModalState.setter.showEquipItemSelector(selectorData)}} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {CommonState.setter.setCurrentEquip(emptySelectorData)}} />
                </div>
            </div>
        </Fragment>
    )
}

const renderWeaponProperties = (equipInfo) => {
    let originalSharpness = null
    let enhancedSharpness = null

    if (Helper.isNotEmpty(equipInfo.sharpness)) {
        originalSharpness = Helper.deepCopy(equipInfo.sharpness)
        enhancedSharpness = Helper.deepCopy(equipInfo.sharpness)
        enhancedSharpness.value += 50
    }

    return (
        <div className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhrc-content">
                {Helper.isNotEmpty(equipInfo.sharpness) ? (
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
                    <span>{equipInfo.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipInfo.criticalRate}%</span>
                </div>

                {(Helper.isNotEmpty(equipInfo.element)
                    && Helper.isNotEmpty(equipInfo.element.attack))
                ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('element')}: {_(equipInfo.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            {equipInfo.element.attack.isHidden ? (
                                <span>({equipInfo.element.attack.value})</span>
                            ) : (
                                <span>{equipInfo.element.attack.value}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                {(Helper.isNotEmpty(equipInfo.element)
                    && Helper.isNotEmpty(equipInfo.element.status))
                ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('element')}: {_(equipInfo.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            {equipInfo.element.status.isHidden ? (
                                <span>({equipInfo.element.status.value})</span>
                            ) : (
                                <span>{equipInfo.element.status.value}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                {(Helper.isNotEmpty(equipInfo.elderseal)) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('elderseal')}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{_(equipInfo.elderseal.affinity)}</span>
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipInfo.defense}</span>
                </div>
            </div>
        </div>
    )
}

const renderArmorProperties = (equipInfo) => {
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
                    <span>{equipInfo.defense}</span>
                </div>

                {Constant.resistances.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhrc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <span>{equipInfo.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const renderEquipBlock = (equipmentPart, currentEquip, requiredEquip) => {
    let equipInfo = null

    if ('weapon' === equipmentPart) {
        equipInfo = CommonDataset.getAppliedWeaponInfo(currentEquip)
    } else if ('helm' === equipmentPart
        || 'chest' === equipmentPart
        || 'arm' === equipmentPart
        || 'waist' === equipmentPart
        || 'leg' === equipmentPart
    ) {
        equipInfo = CommonDataset.getAppliedArmorInfo(currentEquip)
    } else if ('petalace' === equipmentPart) {
        // equipInfo = CommonDataset.getAppliedPetalaceInfo(currentEquip)
    } else if ('charm' === equipmentPart) {
        // equipInfo = CommonDataset.getAppliedCharmInfo(currentEquip)
    } else {
        return false
    }

    let selectorData = {
        equipmentPart: equipmentPart,
        equipId: (Helper.isNotEmpty(equipInfo)) ? equipInfo.id : null
    }

    let emptySelectorData = {
        equipmentPart: equipmentPart,
        equipId: null
    }

    let isNotRequire = true

    if (Helper.isNotEmpty(requiredEquip)) {
        if ('weapon' === equipmentPart) {
            isNotRequire = Helper.jsonHash({
                id: currentEquip.id,
                enhances: currentEquip.enhances
            }) !== Helper.jsonHash({
                id: requiredEquip.id,
                enhances: requiredEquip.enhances
            })
        } else {
            isNotRequire = currentEquip.id !== requiredEquip.id
        }
    }

    if (Helper.isEmpty(equipInfo)) {
        return (
            <div key={equipmentPart} className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_(equipmentPart)}</span>
                    <div className="mhrc-icons_bundle">
                        {'weapon' === equipmentPart ? (
                            <IconButton
                                iconName="wrench" altName={_('customWeapon')}
                                onClick={() => {CommonState.setter.setCurrentEquip({
                                    equipmentPart: 'weapon',
                                    equipId: 'customWeapon'
                                })}} />
                        ) : false}
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {ModalState.setter.showEquipItemSelector(selectorData)}} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={selectorData.equipId} className="mhrc-item mhrc-item-3-step">
            <div className="col-12 mhrc-name">
                <span>{_(equipmentPart)}: {_(equipInfo.name)}</span>
                <div className="mhrc-icons_bundle">
                    {isNotRequire ? (
                        <IconButton
                            iconName="arrow-left" altName={_('include')}
                            onClick={() => {CommonState.setter.setRequiredConditions(equipmentPart, currentEquip)}} />
                    ) : false}
                    {'weapon' === equipmentPart ? (
                        <IconButton
                            iconName="wrench" altName={_('customWeapon')}
                            onClick={() => {CommonState.setter.setCurrentEquip({
                                equipmentPart: 'weapon',
                                equipId: 'customWeapon'
                            })}} />
                    ) : false}
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => {ModalState.setter.showEquipItemSelector(selectorData)}} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {CommonState.setter.setCurrentEquip(emptySelectorData)}} />
                </div>
            </div>

            {(0 < equipInfo.enhanceSize) ? (
                renderEnhanceBlock(equipInfo)
            ) : false}

            {(Helper.isNotEmpty(equipInfo.slots)
                && 0 !== equipInfo.slots.length)
            ? (
                <div className="col-12 mhrc-content">
                    {equipInfo.slots.map((data, index) => {
                        return renderJewelOption(
                            equipmentPart, index, data.size,
                            JewelDataset.getInfo(data.jewel.id)
                        )
                    })}
                </div>
            ) : false}

            {('weapon' === equipmentPart)
                ? renderWeaponProperties(equipInfo) : false}

            {('weapon' !== equipmentPart && 'charm' !== equipmentPart)
                ? renderArmorProperties(equipInfo) : false}

            {(Helper.isNotEmpty(equipInfo.skills)
                && 0 !== equipInfo.skills.length)
            ? (
                <div className="col-12 mhrc-content">
                    <div className="col-12 mhrc-name">
                        <span>{_('skill')}</span>
                    </div>
                    <div className="col-12 mhrc-content">
                        {equipInfo.skills.sort((skillA, skillB) => {
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

export default function EquipsDisplayer(props) {

    /**
     * Hooks
     */
    const [stateTempData, updateTempData] = useState(CommonState.getter.getTempData())
    const [statePlayerEquipment, updatePlayerEquipment] = useState(CommonState.getter.getPlayerEquipment())
    const [stateRequiredConditions, updateRequiredConditions] = useState(CommonState.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = CommonState.store.subscribe(() => {
            updateTempData(CommonState.getter.getTempData())
            updatePlayerEquipment(CommonState.getter.getPlayerEquipment())
            updateRequiredConditions(CommonState.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const getContent = useMemo(() => {
        let blocks = []

        Object.keys(statePlayerEquipment.current).forEach((equipmentPart) => {
            if (Helper.isNotEmpty(statePlayerEquipment[equipmentPart])
                && 'customWeapon' === statePlayerEquipment[equipmentPart].id
            ) {
                blocks.push((
                    <CustomWeapon key="customWeapon" />
                ))
            } else {
                blocks.push(renderEquipBlock(
                    equipmentPart,
                    statePlayerEquipment[equipmentPart],
                    stateRequiredConditions[equipmentPart]
                ))
            }
        })

        return blocks
    }, [statePlayerEquipment, stateRequiredConditions])

    return (
        <div className="col mhrc-equips">
            <div className="mhrc-panel">
                <span className="mhrc-title">{_('equipBundle')}</span>

                <div className="mhrc-icons_bundle-left">
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 1'}
                        isActive={0 === stateTempData.equipsDisplayer.index}
                        onClick={() => {handleSwitchTempData(0)}} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 2'}
                        isActive={1 === stateTempData.equipsDisplayer.index}
                        onClick={() => {handleSwitchTempData(1)}} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 3'}
                        isActive={2 === stateTempData.equipsDisplayer.index}
                        onClick={() => {handleSwitchTempData(2)}} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 4'}
                        isActive={3 === stateTempData.equipsDisplayer.index}
                        onClick={() => {handleSwitchTempData(3)}} />
                </div>

                <div className="mhrc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleEquipsDisplayerRefresh} />
                    <IconButton
                        iconName="th-list" altName={_('bundleList')}
                        onClick={ModalState.setter.showBundleItemSelector} />
                </div>
            </div>

            <div className="mhrc-list">
                {getContent}
            </div>
        </div>
    )
}
