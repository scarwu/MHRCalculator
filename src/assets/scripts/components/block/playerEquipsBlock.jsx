/**
 * Equips Displayer
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { Fragment, useState, useEffect, useMemo } from 'react'

// Load Config & Constant
import Config from 'config'
import Constant from 'constant'

// Load Core
import _ from 'core/lang'
import Helper from 'core/helper'

// Load Libraries
import Misc from 'libraries/misc'
import JewelDataset from 'libraries/dataset/jewel'
import EnhanceDataset from 'libraries/dataset/enhance'
import SkillDataset from 'libraries/dataset/skill'

// Load Components
import IconButton from 'components/common/iconButton'
import IconTab from 'components/common/iconTab'
import SharpnessBar from 'components/common/sharpnessBar'
import CustomWeapon from 'components/common/customWeapon'
import CustomCharm from 'components/common/customCharm'

// Load States
import States from 'states'

/**
 * Handle Functions
 */
const handleEquipsDisplayerRefresh = () => {
    States.setter.cleanPlayerEquips()
}

const handleSwitchDataStore = (index) => {
    States.setter.switchDataStore('playerEquips', index)
}

/**
 * Render Functions
 */
// const renderEnhanceBlock = (equipExtendInfo) => {
//     let usedSize = 0

//     equipExtendInfo.enhances.forEach((enhance) => {
//         let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

//         usedSize += enhanceInfo.list[enhance.level - 1].size
//     })

//     return (
//         <div className="col-12 mhrc-content">
//             <div className="col-3 mhrc-name">
//                 <span>{_('enhanceFieldSize')}</span>
//             </div>
//             <div className="col-9 mhrc-value">
//                 <span>{usedSize} / {equipExtendInfo.enhanceSize}</span>
//                 <div className="mhrc-icons_bundle">
//                     {(usedSize < equipExtendInfo.enhanceSize) ? (
//                         <IconButton key={equipExtendInfo.enhances.length} iconName="plus" altName={_('add')} onClick={() => {
//                             States.setter.showModal('enhanceSelector', {
//                                 equipType: equipExtendInfo.type,
//                                 equipRare: equipExtendInfo.rare,
//                                 enhanceIndex: equipExtendInfo.enhances.length,
//                                 enhanceIds: equipExtendInfo.enhances.map((enhance) => {
//                                     return enhance.id
//                                 })
//                             })
//                         }} />
//                     ) : false}
//                 </div>
//             </div>

//             {/* {equipExtendInfo.enhances.map((enhance, index) => {
//                 let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

//                 let currentLevel = enhance.level
//                 let prevLevel = 1 <= (currentLevel - 1)
//                     ? currentLevel - 1 : currentLevel
//                 let nextLevel = (currentLevel + 1) <= enhanceInfo.list.length
//                     ? currentLevel + 1 : currentLevel
//                 let currentSize = enhanceInfo.list[currentLevel - 1].size
//                 let prevSize = enhanceInfo.list[prevLevel - 1].size
//                 let nextSize = enhanceInfo.list[nextLevel - 1].size

//                 if ((usedSize + nextSize - currentSize) > equipExtendInfo.enhanceSize) {
//                     nextLevel = currentLevel
//                 } else if (-1 === enhanceInfo.list[nextLevel - 1].allowRares.indexOf(equipExtendInfo.rare)) {
//                     nextLevel = currentLevel
//                 }

//                 return (
//                     <Fragment key={`${equipExtendInfo.type}:${index}`}>
//                         <div className="col-3 mhrc-name">
//                             <span>{_('enhance')}: {index + 1}</span>
//                         </div>
//                         <div className="col-9 mhrc-value">
//                             <span>[{enhanceInfo.list[currentLevel - 1].size}] {_(enhanceInfo.name)} Lv.{currentLevel}</span>
//                             <div className="mhrc-icons_bundle">
//                                 <IconButton key={`prev:${prevLevel}`} iconName="minus-circle" altName={_('down')} onClick={() => {
//                                     States.setter.setPlayerEquip({
//                                         equipType: equipExtendInfo.type,
//                                         enhanceIndex: index,
//                                         enhanceId: enhance.id,
//                                         enhanceLevel: prevLevel
//                                     })
//                                 }} />
//                                 <IconButton key={`next:${nextLevel}`} iconName="plus-circle" altName={_('up')} onClick={() => {
//                                     States.setter.setPlayerEquip({
//                                         equipType: equipExtendInfo.type,
//                                         enhanceIndex: index,
//                                         enhanceId: enhance.id,
//                                         enhanceLevel: nextLevel
//                                     })
//                                 }} />
//                                 <IconButton iconName="times" altName={_('clean')} onClick={() => {
//                                     States.setter.setPlayerEquip({
//                                         equipType: equipExtendInfo.type,
//                                         enhanceIndex: index,
//                                         enhanceId: null
//                                     })
//                                 }} />
//                             </div>
//                         </div>
//                     </Fragment>
//                 )
//             })} */}
//         </div>
//     )
// }

const renderJewelOption = (equipType, slotIndex, slotSize, jewelInfo) => {
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
                            onClick={() => {
                                States.setter.showModal('jewelSelector', {
                                    equipType: equipType,
                                    idIndex: slotIndex,
                                    jewelId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null,

                                    // For Selector
                                    slotSize: slotSize
                                })
                            }} />
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
                        onClick={() => {
                            States.setter.showModal('jewelSelector', {
                                equipType: equipType,
                                idIndex: slotIndex,
                                jewelId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null,

                                // For Selector
                                slotSize: slotSize
                            })
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => { States.setter.setPlayerEquipJewel(equipType, slotIndex, null) }} />
                </div>
            </div>
        </Fragment>
    )
}

const renderWeaponProperties = (equipExtendInfo) => {
    return (
        <div className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhrc-content">
                {Helper.isNotEmpty(equipExtendInfo.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhrc-value mhrc-sharpness">
                            <SharpnessBar data={{
                                value: equipExtendInfo.sharpness.minValue,
                                steps: equipExtendInfo.sharpness.steps
                            }} />
                            <SharpnessBar data={{
                                value: equipExtendInfo.sharpness.maxValue,
                                steps: equipExtendInfo.sharpness.steps
                            }} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.criticalRate}%</span>
                </div>

                {(Helper.isNotEmpty(equipExtendInfo.element)
                    && Helper.isNotEmpty(equipExtendInfo.element.attack))
                    ? (
                        <Fragment>
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: {_(equipExtendInfo.element.attack.type)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {equipExtendInfo.element.attack.isHidden ? (
                                    <span>({equipExtendInfo.element.attack.value})</span>
                                ) : (
                                    <span>{equipExtendInfo.element.attack.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipExtendInfo.element)
                    && Helper.isNotEmpty(equipExtendInfo.element.status))
                    ? (
                        <Fragment>
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: {_(equipExtendInfo.element.status.type)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {equipExtendInfo.element.status.isHidden ? (
                                    <span>({equipExtendInfo.element.status.value})</span>
                                ) : (
                                    <span>{equipExtendInfo.element.status.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipExtendInfo.elderseal)) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('elderseal')}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{_(equipExtendInfo.elderseal.affinity)}</span>
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.defense}</span>
                </div>
            </div>
        </div>
    )
}

const renderArmorProperties = (equipExtendInfo) => {
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
                    <span>{equipExtendInfo.defense}</span>
                </div>

                {Constant.resistanceTypes.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhrc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <span>{equipExtendInfo.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const renderPetalaceProperties = (equipExtendInfo) => {
    return (
        <div className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhrc-content">
                <div className="col-3 mhrc-name">
                    <span>{_('healthIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.health.increment}</span>
                </div>
                <div className="col-3 mhrc-name">
                    <span>{_('healthObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.health.obtain}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attackIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.attack.increment}</span>
                </div>
                <div className="col-3 mhrc-name">
                    <span>{_('attackObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.attack.obtain}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('defenseIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.defense.increment}</span>
                </div>
                <div className="col-3 mhrc-name">
                    <span>{_('defenseObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendInfo.defense.obtain}</span>
                </div>
            </div>
        </div>
    )
}

const renderEquipPartBlock = (equipType, currentEquipItem, requiredEquipItem) => {
    let equipExtendInfo = Misc.getEquipExtendInfo(equipType, currentEquipItem)

    // Can Add to Required Contditions
    let isNotRequire = null

    if (('weapon' === equipType || 'charm' === equipType)
        && 'custom' === currentEquipItem.id
        && 'custom' === requiredEquipItem.id
    ) {
        isNotRequire = Helper.jsonHash(currentEquipItem.custom) !== Helper.jsonHash(requiredEquipItem.custom)
    } else {
        isNotRequire = currentEquipItem.id !== requiredEquipItem.id
    }

    let datasetType = Misc.equipTypeToDatasetType(equipType)
    let modalName = datasetType + 'Selector'

    if (Helper.isEmpty(equipExtendInfo)) {
        return (
            <div key={equipType} className="mhrc-item mhrc-item-3-step">
                <div className="col-12 mhrc-name">
                    <span>{_(equipType)}</span>
                    <div className="mhrc-icons_bundle">
                        {'weapon' === equipType || 'charm' === equipType ? (
                            <IconButton
                                iconName="wrench" altName={_('customEquip')}
                                onClick={() => {
                                    States.setter.setPlayerEquip(equipType, 'custom')
                                }} />
                        ) : false}
                        {'charm' !== equipType ? (
                            <IconButton
                                iconName="plus" altName={_('add')}
                                onClick={() => {
                                    States.setter.showModal(modalName, {
                                        target: 'playerEquips',
                                        equipType: equipType,
                                        equipId: (Helper.isNotEmpty(equipExtendInfo)) ? equipExtendInfo.id : null
                                    })
                                }} />
                        ) : false}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={equipExtendInfo.id} className="mhrc-item mhrc-item-3-step">
            <div className="col-12 mhrc-name">
                <span>{_(equipType)}: {_(equipExtendInfo.name)}</span>
                <div className="mhrc-icons_bundle">
                    {isNotRequire ? (
                        <IconButton
                            iconName="arrow-left" altName={_('include')}
                            onClick={() => {
                                States.setter.setRequiredConditionsEquip(equipType, currentEquipItem.id)
                            }} />
                    ) : false}
                    {'weapon' === equipType || 'charm' === equipType ? (
                        <IconButton
                            iconName="wrench" altName={_('customEquip')}
                            onClick={() => {
                                States.setter.setPlayerEquip(equipType, 'custom')
                            }} />
                    ) : false}
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => {
                            States.setter.showModal(modalName, {
                                target: 'playerEquips',
                                equipType: equipType,
                                equipId: (Helper.isNotEmpty(equipExtendInfo)) ? equipExtendInfo.id : null
                            })
                         }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.setter.setPlayerEquip(equipType, null)
                        }} />
                </div>
            </div>

            {/* {(0 < equipExtendInfo.enhanceSize) ? (
                renderEnhanceBlock(equipExtendInfo)
            ) : false} */}

            {(Helper.isNotEmpty(equipExtendInfo.slots)
                && 0 !== equipExtendInfo.slots.length)
                ? (
                    <div className="col-12 mhrc-content">
                        {equipExtendInfo.slots.map((data, index) => {
                            return renderJewelOption(
                                equipType, index, data.size,
                                JewelDataset.getInfo(data.jewel.id)
                            )
                        })}
                    </div>
                ) : false}

            {('weapon' === Misc.equipTypeToDatasetType(equipType))
                ? renderWeaponProperties(equipExtendInfo) : false}

            {('armor' === Misc.equipTypeToDatasetType(equipType))
                ? renderArmorProperties(equipExtendInfo) : false}

            {('petalace' === Misc.equipTypeToDatasetType(equipType))
                ? renderPetalaceProperties(equipExtendInfo) : false}

            {(Helper.isNotEmpty(equipExtendInfo.skills)
                && 0 !== equipExtendInfo.skills.length)
                ? (
                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('skill')}</span>
                        </div>
                        <div className="col-12 mhrc-content">
                            {equipExtendInfo.skills.sort((skillA, skillB) => {
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
    const [stateDataStore, updateDataStore] = useState(States.getter.getDataStore())
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateDataStore(States.getter.getDataStore())
            updatePlayerEquips(States.getter.getPlayerEquips())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const getContent = useMemo(() => {
        let blocks = []

        Object.keys(statePlayerEquips).forEach((equipType) => {
            if ('weapon' === Misc.equipTypeToDatasetType(equipType)
                && 'custom' === statePlayerEquips[equipType].id
            ) {
                blocks.push((
                    <CustomWeapon key="customWeapon" />
                ))

                return
            }

            if ('charm' === Misc.equipTypeToDatasetType(equipType)
                && 'custom' === statePlayerEquips[equipType].id
            ) {
                blocks.push((
                    <CustomCharm key="customCharm" />
                ))

                return
            }

            blocks.push(renderEquipPartBlock(
                equipType,
                statePlayerEquips[equipType],
                stateRequiredConditions.equips[equipType]
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
                        isActive={0 === stateDataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(0) }} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 2'}
                        isActive={1 === stateDataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(1) }} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 3'}
                        isActive={2 === stateDataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(2) }} />
                    <IconTab
                        iconName="circle-o" altName={_('tab') + ' 4'}
                        isActive={3 === stateDataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(3) }} />
                </div>

                <div className="mhrc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleEquipsDisplayerRefresh} />
                    <IconButton
                        iconName="th-list" altName={_('bundleList')}
                        onClick={States.setter.showBundleItemSelector} />
                </div>
            </div>

            <div className="mhrc-list">
                {getContent}
            </div>
        </div>
    )
}
