import { environment } from './../../environments/environment'
import { ComplaintService } from './../Services/complaint.service'
import { UserService } from './../Services/user.service'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { FileUploader } from 'ng2-file-upload'
import fontawesome from '@fortawesome/fontawesome'
import { faBomb } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faBomb)

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent implements OnInit {

  public customerControl: FormControl = new FormControl({ value: '', disabled: true }, [])
  public messageControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(160)])
  @ViewChild('fileControl') fileControl: ElementRef // For controlling the DOM Element for file input.
  public fileUploadError: any = undefined // For controlling error handling related to file input.
  public uploader: FileUploader = new FileUploader({
    url: environment.hostServer + '/file-upload',
    authToken: `Bearer ${localStorage.getItem('token')}`,
    allowedMimeType: [ 'application/pdf' , 'application/xml', 'text/xml' ],
    maxFileSize: 100000
  })
  public userEmail: any = undefined
  public complaint: any = undefined
  public confirmation: any

  constructor (private userService: UserService, private complaintService: ComplaintService) { }

  ngOnInit () {
    this.initComplaint()
    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      this.fileUploadError = filter
      throw new Error(`Error due to : ${filter.name}`)
    }
    this.uploader.onAfterAddingFile = () => {
      this.fileUploadError = undefined
    }
    this.uploader.onSuccessItem = () => {
      this.saveComplaint()
      this.uploader.clearQueue()
    }
  }

  initComplaint () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.complaint = {}
      this.complaint.UserId = user.id
      this.userEmail = user.email
      this.customerControl.setValue(this.userEmail)
    }, (err) => {
      this.complaint = undefined
      console.log(err)
    })
  }

  save () {
    if (this.uploader.queue[0]) {
      this.uploader.queue[0].upload()
      this.fileControl.nativeElement.value = null
    } else {
      this.saveComplaint()
    }
  }

  saveComplaint () {
    this.complaint.message = this.messageControl.value
    this.complaintService.save(this.complaint).subscribe((savedComplaint: any) => {
      this.confirmation = 'Customer support will get in touch with you soon! Your complaint reference is #' + savedComplaint.id
      this.initComplaint()
      this.resetForm()
      this.fileUploadError = undefined
    }, (error) => error)
  }

  resetForm () {
    this.messageControl.setValue('')
    this.messageControl.markAsUntouched()
    this.messageControl.markAsPristine()
    this.fileControl.nativeElement.value = null
  }
}
