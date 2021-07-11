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
// import EnhanceDataset from 'libraries/dataset/enhance'
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
// const renderEnhanceBlock = (equipExtendItem) => {
//     let usedSize = 0

//     equipExtendItem.enhances.forEach((enhance) => {
//         let enhanceInfo = EnhanceDataset.getItem(enhance.id)

//         usedSize += enhanceInfo.list[enhance.level - 1].size
//     })

//     return (
//         <div className="col-12 mhrc-content">
//             <div className="col-3 mhrc-name">
//                 <span>{_('enhanceFieldSize')}</span>
//             </div>
//             <div className="col-9 mhrc-value">
//                 <span>{usedSize} / {equipExtendItem.enhanceSize}</span>
//                 <div className="mhrc-icons_bundle">
//                     {(usedSize < equipExtendItem.enhanceSize) ? (
//                         <IconButton key={equipExtendItem.enhances.length} iconName="plus" altName={_('add')} onClick={() => {
//                             States.setter.showModal('enhanceSelector', {
//                                 equipType: equipExtendItem.type,
//                                 equipRare: equipExtendItem.rare,
//                                 enhanceIndex: equipExtendItem.enhances.length,
//                                 enhanceIds: equipExtendItem.enhances.map((enhance) => {
//                                     return enhance.id
//                                 })
//                             })
//                         }} />
//                     ) : false}
//                 </div>
//             </div>

//             {/* {equipExtendItem.enhances.map((enhance, index) => {
//                 let enhanceInfo = EnhanceDataset.getItem(enhance.id)

//                 let currentLevel = enhance.level
//                 let prevLevel = 1 <= (currentLevel - 1)
//                     ? currentLevel - 1 : currentLevel
//                 let nextLevel = (currentLevel + 1) <= enhanceInfo.list.length
//                     ? currentLevel + 1 : currentLevel
//                 let currentSize = enhanceInfo.list[currentLevel - 1].size
//                 let prevSize = enhanceInfo.list[prevLevel - 1].size
//                 let nextSize = enhanceInfo.list[nextLevel - 1].size

//                 if ((usedSize + nextSize - currentSize) > equipExtendItem.enhanceSize) {
//                     nextLevel = currentLevel
//                 } else if (-1 === enhanceInfo.list[nextLevel - 1].allowRares.indexOf(equipExtendItem.rare)) {
//                     nextLevel = currentLevel
//                 }

//                 return (
//                     <Fragment key={`${equipExtendItem.type}:${index}`}>
//                         <div className="col-3 mhrc-name">
//                             <span>{_('enhance')}: {index + 1}</span>
//                         </div>
//                         <div className="col-9 mhrc-value">
//                             <span>[{enhanceInfo.list[currentLevel - 1].size}] {_(enhanceInfo.name)} Lv.{currentLevel}</span>
//                             <div className="mhrc-icons_bundle">
//                                 <IconButton key={`prev:${prevLevel}`} iconName="minus-circle" altName={_('down')} onClick={() => {
//                                     States.setter.setPlayerEquip({
//                                         equipType: equipExtendItem.type,
//                                         enhanceIndex: index,
//                                         enhanceId: enhance.id,
//                                         enhanceLevel: prevLevel
//                                     })
//                                 }} />
//                                 <IconButton key={`next:${nextLevel}`} iconName="plus-circle" altName={_('up')} onClick={() => {
//                                     States.setter.setPlayerEquip({
//                                         equipType: equipExtendItem.type,
//                                         enhanceIndex: index,
//                                         enhanceId: enhance.id,
//                                         enhanceLevel: nextLevel
//                                     })
//                                 }} />
//                                 <IconButton iconName="times" altName={_('clean')} onClick={() => {
//                                     States.setter.setPlayerEquip({
//                                         equipType: equipExtendItem.type,
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

const renderJewelOption = (equipType, slotIndex, slotSize, jewelId) => {

    // Get Jewel Item
    let jewelItem = JewelDataset.getItem(jewelId)

    const showModal = () => {
        States.setter.showModal('jewelSelector', {
            target: 'playerEquips',
            equipType: equipType,
            idIndex: slotIndex,

            // filter
            size: slotSize
        })
    }

    const removeItem = () => {
        States.setter.setPlayerEquipJewel(equipType, slotIndex, null)
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}`}>
            <div className="col-3 mhrc-name">
                <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
            </div>
            <div className="col-9 mhrc-value">
                {Helper.isNotEmpty(jewelItem) ? (
                    <Fragment>
                        <span>[{jewelItem.size}] {_(jewelItem.name)}</span>

                        <div className="mhrc-icons_bundle">
                            <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                            <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                        </div>
                    </Fragment>
                ) : (
                    <div className="mhrc-icons_bundle">
                        <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                    </div>
                )}
            </div>
        </Fragment>
    )
}

const renderWeaponProperties = (equipExtendItem) => {
    return (
        <div className="col-12 mhrc-content">
            <div className="col-12 mhrc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhrc-content">
                {Helper.isNotEmpty(equipExtendItem.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhrc-value mhrc-sharpness">
                            <SharpnessBar data={{
                                value: equipExtendItem.sharpness.minValue,
                                steps: equipExtendItem.sharpness.steps
                            }} />
                            <SharpnessBar data={{
                                value: equipExtendItem.sharpness.maxValue,
                                steps: equipExtendItem.sharpness.steps
                            }} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.criticalRate}%</span>
                </div>

                {(Helper.isNotEmpty(equipExtendItem.element)
                    && Helper.isNotEmpty(equipExtendItem.element.attack))
                    ? (
                        <Fragment>
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: {_(equipExtendItem.element.attack.type)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {equipExtendItem.element.attack.isHidden ? (
                                    <span>({equipExtendItem.element.attack.value})</span>
                                ) : (
                                    <span>{equipExtendItem.element.attack.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipExtendItem.element)
                    && Helper.isNotEmpty(equipExtendItem.element.status))
                    ? (
                        <Fragment>
                            <div className="col-3 mhrc-name">
                                <span>{_('element')}: {_(equipExtendItem.element.status.type)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                {equipExtendItem.element.status.isHidden ? (
                                    <span>({equipExtendItem.element.status.value})</span>
                                ) : (
                                    <span>{equipExtendItem.element.status.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipExtendItem.elderseal)) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('elderseal')}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{_(equipExtendItem.elderseal.affinity)}</span>
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.defense}</span>
                </div>
            </div>
        </div>
    )
}

const renderArmorProperties = (equipExtendItem) => {
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
                    <span>{equipExtendItem.defense}</span>
                </div>

                {Constant.resistanceTypes.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhrc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhrc-value">
                                <span>{equipExtendItem.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const renderPetalaceProperties = (equipExtendItem) => {
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
                    <span>{equipExtendItem.health.increment}</span>
                </div>
                <div className="col-3 mhrc-name">
                    <span>{_('healthObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.health.obtain}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attackIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.attack.increment}</span>
                </div>
                <div className="col-3 mhrc-name">
                    <span>{_('attackObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.attack.obtain}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('defenseIncrement')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.defense.increment}</span>
                </div>
                <div className="col-3 mhrc-name">
                    <span>{_('defenseObtain')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{equipExtendItem.defense.obtain}</span>
                </div>
            </div>
        </div>
    )
}

const renderEquipPartBlock = (equipType, currentEquipData, requiredEquipData) => {
    let equipExtendItem = Misc.getEquipExtendItem(equipType, currentEquipData)

    // Can Add to Required Contditions
    let isNotRequire = null

    if (('weapon' === equipType || 'charm' === equipType)
        && 'custom' === currentEquipData.id
        && 'custom' === requiredEquipData.id
    ) {
        isNotRequire = Helper.jsonHash(currentEquipData.custom) !== Helper.jsonHash(requiredEquipData.custom)
    } else {
        isNotRequire = currentEquipData.id !== requiredEquipData.id
    }

    const showModal = () => {
        States.setter.showModal(Misc.equipTypeToDatasetType(equipType) + 'Selector', {
            target: 'playerEquips',
            equipType: equipType,

            // Filter
            type: equipType
        })
    }

    const removeItem = () => {
        States.setter.setPlayerEquip(equipType, null)
    }

    if (Helper.isEmpty(equipExtendItem)) {
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
                            <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                        ) : false}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={equipType + ':' + equipExtendItem.id} className="mhrc-item mhrc-item-3-step">
            <div className="col-12 mhrc-name">
                <span>{_(equipType)}: {_(equipExtendItem.name)}</span>
                <div className="mhrc-icons_bundle">
                    {'petalace' !== equipType && isNotRequire ? (
                        <IconButton
                            iconName="arrow-left" altName={_('include')}
                            onClick={() => {
                                States.setter.setRequiredConditionsEquip(equipType, currentEquipData.id)
                            }} />
                    ) : false}
                    {'weapon' === equipType || 'charm' === equipType ? (
                        <IconButton
                            iconName="wrench" altName={_('customEquip')}
                            onClick={() => {
                                States.setter.setPlayerEquip(equipType, 'custom')
                            }} />
                    ) : false}
                    {'charm' !== equipType ? (
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                    ) : false}
                    <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                </div>
            </div>

            {/* {(0 < equipExtendItem.enhanceSize) ? (
                renderEnhanceBlock(equipExtendItem)
            ) : false} */}

            {(Helper.isNotEmpty(equipExtendItem.slots) && 0 !== equipExtendItem.slots.length) ? (
                <div className="col-12 mhrc-content">
                    {equipExtendItem.slots.map((slotData, slotIndex) => {
                        return renderJewelOption(
                            equipType,
                            slotIndex,
                            slotData.size,
                            Helper.isNotEmpty(currentEquipData.jewelIds[slotIndex])
                                ? currentEquipData.jewelIds[slotIndex] : null
                        )
                    })}
                </div>
            ) : false}

            {('weapon' === Misc.equipTypeToDatasetType(equipType))
                ? renderWeaponProperties(equipExtendItem) : false}

            {('armor' === Misc.equipTypeToDatasetType(equipType))
                ? renderArmorProperties(equipExtendItem) : false}

            {('petalace' === Misc.equipTypeToDatasetType(equipType))
                ? renderPetalaceProperties(equipExtendItem) : false}

            {(Helper.isNotEmpty(equipExtendItem.skills) && 0 !== equipExtendItem.skills.length) ? (
                <div className="col-12 mhrc-content">
                    <div className="col-12 mhrc-name">
                        <span>{_('skill')}</span>
                    </div>
                    <div className="col-12 mhrc-content">
                        {equipExtendItem.skills.sort((skillDataA, skillDataB) => {
                            return skillDataB.level - skillDataA.level
                        }).map((skillData) => {
                            let skillItem = SkillDataset.getItem(skillData.id)

                            return (Helper.isNotEmpty(skillItem)) ? (
                                <div key={skillItem.id} className="col-6 mhrc-value">
                                    <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                                </div>
                            ) : false
                        })}
                    </div>
                </div>
            ) : false}
        </div>
    )
}

export default function PlayerEquipsBlock (props) {

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
                </div>
            </div>

            <div className="mhrc-list">
                {getContent}
            </div>
        </div>
    )
}
