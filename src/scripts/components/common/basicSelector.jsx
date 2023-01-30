/**
 * Basic Selector
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function BasicSelector (props) {
    const {defaultValue, options, onChange} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> BasicSelector')

        return (
            <div className="mhrc-basic_selector">
                <select className="mhrc-select" value={defaultValue} onChange={onChange}>
                    {options.map((option) => {
                        return (
                            <option key={option.key} value={option.key}>{option.value}</option>
                        )
                    })}
                </select>
                <div className="mhrc-arrow-icon">
                    <i className="fa fa-caret-down"></i>
                </div>
            </div>
        )
    }, [defaultValue, options, onChange])
}
