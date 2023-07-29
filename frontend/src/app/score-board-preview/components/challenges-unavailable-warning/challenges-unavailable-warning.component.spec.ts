import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengesUnavailableWarningComponent } from './challenges-unavailable-warning.component'
import { TranslateModule } from '@ngx-translate/core'
import { DEFAULT_FILTER_SETTING } from '../../types/FilterSetting'

describe('ChallengesUnavailableWarningComponent', () => {
  let component: ChallengesUnavailableWarningComponent
  let fixture: ComponentFixture<ChallengesUnavailableWarningComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ChallengesUnavailableWarningComponent]
    })
    .compileComponents()

    fixture = TestBed.createComponent(ChallengesUnavailableWarningComponent)
    component = fixture.componentInstance

    component.challenges = [
      {
        category: 'foobar',
        name: 'my name',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: 'Docker',
        difficultyAsList: [undefined, undefined, undefined]
    },
      {
        category: 'foobar',
        name: 'my name two',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: ['Easy'],
        disabledEnv: null,
        difficultyAsList: [undefined, undefined, undefined]
    }
  ] as any

    component.filterSetting = structuredClone(DEFAULT_FILTER_SETTING)

    fixture.detectChanges()
  })

  it('should properly calculate number of disabled challenges', () => {
    component.ngOnChanges()

    expect(component.numberOfDisabledChallenges).toBe(1)
    expect(component.disabledBecauseOfEnv).toBe('Docker')
  })
})
