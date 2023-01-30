/**
 * Icon Selector
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function IconSelector (props) {
    const {iconName, defaultValue, options, onChange} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconSelector')

        return (
            <div className="mhrc-icon_selector">
                <div className="mhrc-body">
                    <div className="mhrc-icon">
                        <i className={`fa fa-${iconName}`}></i>
                    </div>
                    <select className="mhrc-select" value={defaultValue} onChange={onChange}>
                        {options.map((option) => {
                            return (
                                <option key={option.key} value={option.key}>{option.value}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="mhrc-arrow-icon">
                    <i className="fa fa-caret-down"></i>
                </div>
            </div>
        )
    }, [iconName, defaultValue, options, onChange])
}
