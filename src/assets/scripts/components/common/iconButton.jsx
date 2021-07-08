/**
 * Icon Button
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from 'core/helper'

export default function IconButton(props) {
    const {iconName, altName, onClick} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconButton')

        return (
            <div className="mhrc-icon_button">
                <div className="mhrc-body">
                    <a className="mhrc-icon" onClick={onClick}>
                        <i className={`fa fa-${iconName}`}></i>
                    </a>
                </div>

                <div className="mhrc-label">
                    <span>{altName}</span>
                </div>
            </div>
        )
    }, [iconName, altName, onClick])
}
