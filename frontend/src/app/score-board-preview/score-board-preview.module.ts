import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { WarningCardComponent } from './components/warning-card/warning-card.component'
import { ChallengeCardComponent } from './components/challenge-card/challenge-card.component'
import { FilterSettingsComponent } from './components/filter-settings/filter-settings.component'
import { TutorialModeWarningComponent } from './components/tutorial-mode-warning/tutorial-mode-warning.component'
import { PreviewFeatureNoticeComponent } from './components/preview-feature-notice/preview-feature-notice.component'
import { CategoryFilterComponent } from './components/filter-settings/components/category-filter/category-filter.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'
import { ChallengesUnavailableWarningComponent } from './components/challenges-unavailable-warning/challenges-unavailable-warning.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'

import { ChallengeHintPipe } from './pipes/challenge-hint.pipe'
import { RouterModule } from '@angular/router'
import { ScoreBoardAdditionalSettingsDialogComponent } from './components/filter-settings/components/score-board-additional-settings-dialog/score-board-additional-settings-dialog.component'
import { MatRadioModule } from '@angular/material/radio'

@NgModule({
  declarations: [
    CategoryFilterComponent,
    ChallengeCardComponent,
    ChallengeHintPipe,
    ChallengesUnavailableWarningComponent,
    CodingChallengeProgressScoreCardComponent,
    DifficultyOverviewScoreCardComponent,
    FilterSettingsComponent,
    HackingChallengeProgressScoreCardComponent,
    PreviewFeatureNoticeComponent,
    ScoreBoardAdditionalSettingsDialogComponent,
    ScoreBoardPreviewComponent,
    ScoreCardComponent,
    TutorialModeWarningComponent,
    WarningCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatRadioModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
  ],
})
class ScoreBoardPreviewModule {}

export { ScoreBoardPreviewModule }
