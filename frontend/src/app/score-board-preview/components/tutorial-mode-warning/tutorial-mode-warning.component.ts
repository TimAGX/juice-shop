import { Component, Input, OnChanges } from '@angular/core'

import { EnrichedChallenge } from '../../types/EnrichedChallenge'
import { Config } from 'src/app/Services/configuration.service'

@Component({
  selector: 'tutorial-mode-warning',
  templateUrl: './tutorial-mode-warning.component.html',
  styleUrls: ['./tutorial-mode-warning.component.scss']
})
export class TutorialModeWarningComponent implements OnChanges {
  @Input()
  public allChallenges: EnrichedChallenge[]

  @Input()
  public applicationConfig: Config | null = null

  public tutorialModeActive: boolean | null = null

  ngOnChanges (): void {
    if (!this.applicationConfig?.challenges?.restrictToTutorialsFirst) {
      this.tutorialModeActive = false
      return
    }

    const allTutorialChallengesSolved = this.allChallenges
      .filter(challenge => challenge.tutorialOrder !== null)
      .every(challenge => challenge.solved)
    this.tutorialModeActive = !allTutorialChallengesSolved
  }
}
