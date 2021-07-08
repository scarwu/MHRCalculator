/**
 * Icon Tab
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from 'core/helper'

export default function IconTab(props) {
    const {iconName, altName, isActive, onClick} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconTab')

        let className = [
            'mhrc-body'
        ]

        if (isActive) {
            className.push('is-active')
        }

        return (
            <div className="mhrc-icon_tab">
                <a className={className.join(' ')} onClick={onClick}>
                    <div className="mhrc-icon">
                        <i className={`fa fa-${iconName}`}></i>
                    </div>
                </a>

                <div className="mhrc-label">
                    <span>{altName}</span>
                </div>
            </div>
        )
    }, [iconName, altName, isActive, onClick])
}
