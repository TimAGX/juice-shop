/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs, waitForAngularRouteToBeVisited, sleep, waitForElementToGetClicked
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const PrivacyPolicyInstruction: ChallengeInstruction = {
  name: 'Privacy Policy',
  hints: [
    {
      text:
        'Log in with any user to begin this challenge. You can use an existing or freshly registered account.',
      fixture: 'app-navbar',
      unskippable: true,
      async resolved () {
        while (true) {
          if (localStorage.getItem('token') !== null) {
            break
          }
          await sleep(100)
        }
      }
    },
    {
      text:
        'Great, you are logged in! Now open the _Account_ menu.',
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForElementToGetClicked('#navbarAccount')
    },
    {
      text:
        'Open the _Privacy & Security_ sub-menu and click _Privacy Policy_.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('privacy-security/privacy-policy')
    },
    {
      text: '🎉 That was super easy, right? This challenge is a bit of a joke actually, because nobody reads any fine print online... 🙈',
      fixture: 'app-privacy-policy',
      resolved: waitInMs(60000)
    }
  ]
}
