import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { mimeType } from './mime-type.validator'
import { PhotoWallService } from '../Services/photo-wall.service'
import { IImage } from 'ng-simple-slideshow'
import { ConfigurationService } from '../Services/configuration.service'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

library.add(faTwitter)
dom.watch()

@Component({
  selector: 'app-photo-wall',
  templateUrl: './photo-wall.component.html',
  styleUrls: ['./photo-wall.component.scss']
})
export class PhotoWallComponent implements OnInit {

  public emptyState: boolean = true
  public imagePreview: string
  public form: FormGroup = new FormGroup({
    image: new FormControl('', { validators: [Validators.required], asyncValidators: [mimeType] }),
    caption: new FormControl('', [Validators.required])
  })
  public slideshowDataSource: IImage[] = []
  public twitterHandle = null

  constructor (private photoWallService: PhotoWallService, private configurationService: ConfigurationService) { }

  ngOnInit () {
    this.slideshowDataSource = []
    this.photoWallService.get().subscribe((memories) => {
      if (memories.length === 0) {
        this.emptyState = true
      } else {
        this.emptyState = false
      }
      for (const memory of memories) {
        this.slideshowDataSource.push({ url: memory.imagePath, caption: memory.caption })
      }
    },(err) => console.log(err))
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.application) {
        if (config.application.twitterUrl !== null) {
          this.twitterHandle = config.application.twitterUrl.replace('https://twitter.com/','@')
        }
      }
    },(err) => console.log(err))
  }

  onImagePicked (event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({ image: file })
    this.form.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  save () {
    this.photoWallService.addMemory(this.form.value.caption, this.form.value.image).subscribe(() => {
      this.resetForm()
      this.ngOnInit()
    },(err) => console.log(err))
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  resetForm () {
    this.form.get('image').setValue('')
    this.form.get('image').markAsPristine()
    this.form.get('image').markAsUntouched()
    this.form.get('caption').setValue('')
    this.form.get('caption').markAsPristine()
    this.form.get('caption').markAsUntouched()
    this.form.get('caption').setErrors(null)
  }
}
