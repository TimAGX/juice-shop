import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { ImageCaptchaService } from './image-captcha.service'

describe('ImageCaptchaService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImageCaptchaService]
    })
  })

  it('should be created', inject([ImageCaptchaService], (service: ImageCaptchaService) => {
    expect(service).toBeTruthy()
  }))

  it('should get captcha directly from the rest api', inject([ImageCaptchaService, HttpTestingController],
    fakeAsync((service: ImageCaptchaService, httpMock: HttpTestingController) => {
      let res
      service.getCaptcha().subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/image-captcha/')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should request data export directly from the rest api', inject([ImageCaptchaService, HttpTestingController],
    fakeAsync((service: ImageCaptchaService, httpMock: HttpTestingController) => {
      let res
      service.dataExport(1).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/data-export/')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toBe(1)
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
