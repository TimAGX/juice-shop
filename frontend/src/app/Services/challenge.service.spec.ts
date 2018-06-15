import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed, inject, tick, fakeAsync } from '@angular/core/testing'

import { ChallengeService } from './challenge.service'

describe('ChallengeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports : [
        HttpClientTestingModule
      ],
      providers: [ChallengeService]
    })
  })

  it('should be created', inject([ChallengeService], (service: ChallengeService) => {
    expect(service).toBeTruthy()
  }))

  it('should get all challenges directly from the rest api' ,inject([ChallengeService, HttpTestingController],
    fakeAsync((service: ChallengeService, httpMock: HttpTestingController) => {
      let res
      service.find().subscribe((data) => res = data)

      const req = httpMock.expectOne('http://localhost:3000/api/Challenges/')
      req.flush({ data: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get current continue code directly from the rest api' ,inject([ChallengeService, HttpTestingController],
    fakeAsync((service: ChallengeService, httpMock: HttpTestingController) => {
      let res
      service.continueCode().subscribe((data) => res = data)

      const req = httpMock.expectOne('http://localhost:3000/rest/continue-code')
      req.flush({ continueCode: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should pass continue code for restoring challenge progress on to the rest api' ,inject([ChallengeService, HttpTestingController],
    fakeAsync((service: ChallengeService, httpMock: HttpTestingController) => {
      let res
      service.restoreProgress('CODE').subscribe((data) => res = data)

      const req = httpMock.expectOne('http://localhost:3000/rest/continue-code/apply/CODE')
      req.flush('apiResponse')
      tick()

      expect(req.request.method).toBe('PUT')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should repeat notification directly from the rest api' ,inject([ChallengeService, HttpTestingController],
    fakeAsync((service: ChallengeService, httpMock: HttpTestingController) => {
      let res
      service.repeatNotification('CHALLENGE').subscribe((data) => res = data)

      const req = httpMock.expectOne(req => req.url === 'http://localhost:3000/rest/repeat-notification')
      req.flush('apiResponse')
      tick()

      expect(req.request.method).toBe('GET')
      expect(req.request.params.get('challenge')).toBe('CHALLENGE')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
