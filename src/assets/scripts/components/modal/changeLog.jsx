/**
 * ChangeLog Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

// Load Core
import _ from 'core/lang'
import Status from 'core/status'
import Helper from 'core/helper'

// Load Components
import IconButton from 'components/common/iconButton'

// Load States
import States from 'states'

// Load Markdown Files
import zhTWChangeLog from 'langs/zhTW/changeLog.md'
import jaJPChangeLog from 'langs/jaJP/changeLog.md'
import enUSChangeLog from 'langs/enUS/changeLog.md'

/**
 * Variables
 */
const changeLogMapping = {
    zhTW: zhTWChangeLog,
    jaJP: jaJPChangeLog,
    enUS: enUSChangeLog
}

/**
 * Handle Functions
 */
const getChangeLog = () => {
    let changeLog = Helper.isNotEmpty(changeLogMapping[Status.get('sys:lang')])
        ? changeLogMapping[Status.get('sys:lang')] : false

    if (false === changeLog) {
        return false
    }

    return changeLog.replace(/\n/g, '').split('<hr>').map((log, index) => {
        let [all, title, content] = log.trim().match(/^\<h3.+\>(.+)\<\/h3\>(.+)$/)

        return (
            <div key={index} className="mhrc-item mhrc-item-2-step">
                <div className="col-12 mhrc-name">
                    <span>{title}</span>
                </div>
                <div className="col-12 mhrc-value mhrc-description"
                    dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        )
    })
}

export default function ChangeLogModal(props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('changeLog'))
    const refModal = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('changeLog'))
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('changeLog')
    }, [])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal mhrc-slim-modal">
                <div className="mhrc-panel">
                    <span className="mhrc-title">{_('changeLog')}</span>

                    <div className="mhrc-icons_bundle">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.setter.hideModal('changeLog') }} />
                    </div>
                </div>
                <div className="mhrc-list">
                    <div className="mhrc-wrapper">
                        {getChangeLog()}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
