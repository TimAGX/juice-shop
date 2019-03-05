import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'

import { ErrorPageComponent } from './error-page.component'
import { ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

describe('ErrorPageComponent', () => {
  let component: ErrorPageComponent
  let fixture: ComponentFixture<ErrorPageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorPageComponent],
      imports: [
        TranslateModule.forRoot(),
        MatCardModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { params: '?error=UNAUTHORIZED_PAGE_ACCESS_ERROR' } } }
        }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
