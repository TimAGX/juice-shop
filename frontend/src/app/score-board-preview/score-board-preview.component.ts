import { combineLatest } from 'rxjs'
import { Component, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'

import { ChallengeService } from '../Services/challenge.service'
import { CodeSnippetService } from '../Services/code-snippet.service'

import { EnrichedChallenge } from './types/EnrichedChallenge'
import { DEFAULT_FILTER_SETTING, FilterSetting } from './types/FilterSetting'

@Component({
  selector: 'score-board-preview',
  templateUrl: './score-board-preview.component.html',
  styleUrls: ['./score-board-preview.component.scss']
})
export class ScoreBoardPreviewComponent implements OnInit {
  public allChallenges: EnrichedChallenge[] = []
  public filteredChallenges: EnrichedChallenge[] = []
  public filterSetting: FilterSetting = structuredClone(DEFAULT_FILTER_SETTING)

  constructor (
    private readonly challengeService: ChallengeService,
    private readonly codeSnippetService: CodeSnippetService,
    private readonly sanitizer: DomSanitizer
  ) { }

  onFilterSettingUpdate (filterSetting: FilterSetting) {
    console.log('ScoreBoardPreview - filter setting update', filterSetting)
    this.filterSetting = filterSetting
    this.filteredChallenges = ScoreBoardPreviewComponent.filterChallenges(this.allChallenges, filterSetting)
  }

  public static filterChallenges (challenges: EnrichedChallenge[], filterSetting: FilterSetting): EnrichedChallenge[] {
    return challenges
      .filter((challenge) => {
        if (filterSetting.categories.size === 0) {
          return true
        }
        return filterSetting.categories.has(challenge.category)
      })
      .filter((challenge) => {
        if (filterSetting.difficulties.length === 0) {
          return true
        }
        return filterSetting.difficulties.includes(challenge.difficulty)
      })
      .filter((challenge) => {
        if (filterSetting.tags.length === 0) {
          return true
        }
        return challenge.tagList.some((tag) => filterSetting.tags.includes(tag))
      })
      .filter((challenge) => {
        if (filterSetting.status === null) {
          return true
        }
        if (filterSetting.status === 'solved') {
          return challenge.solved
        }
        if (filterSetting.status === 'unsolved') {
          return !challenge.solved
        }
        return true
      })
  }

  ngOnInit () {
    console.time('ScoreBoardPreview - load challenges')
    combineLatest([
      this.challengeService.find({ sort: 'name' }),
      this.codeSnippetService.challenges()
    ]).subscribe(([challenges, challengeKeysWithCodeChallenges]) => {
      console.timeEnd('ScoreBoardPreview - load challenges')

      console.time('ScoreBoardPreview - transform challenges')
      const transformedChallenges = challenges.map((challenge) => {
        return {
          ...challenge,
          tagList: challenge.tags ? challenge.tags.split(',').map((tag) => tag.trim()) : [],
          description: this.sanitizer.bypassSecurityTrustHtml(challenge.description as string),
          difficultyAsList: [...Array(challenge.difficulty).keys()],
          hasCodingChallenge: challengeKeysWithCodeChallenges.includes(challenge.key)
        }
      })
      this.allChallenges = transformedChallenges
      this.filteredChallenges = ScoreBoardPreviewComponent.filterChallenges(this.allChallenges, this.filterSetting)
      console.timeEnd('ScoreBoardPreview - transform challenges')
    })
  }

  getChallengeKey (index: number, challenge: EnrichedChallenge): string {
    return challenge.key
  }

  public reset () {
    console.log('resetting filter settings')
    this.filterSetting = structuredClone(DEFAULT_FILTER_SETTING)
    this.filteredChallenges = ScoreBoardPreviewComponent.filterChallenges(this.allChallenges, this.filterSetting)
  }
}
