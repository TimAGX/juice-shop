import { SecurityQuestionService } from '../Services/security-question.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle, faStar } from '@fortawesome/free-solid-svg-icons'

library.add(faStar, faExclamationTriangle)
dom.watch()

@Component({
  selector: 'app-data-subject',
  templateUrl: './data-subject.component.html',
  styleUrls: ['./data-subject.component.scss']
})
export class DataSubjectComponent implements OnInit {
  public dataSubjectGroup: FormGroup = new FormGroup({
    emailControl: new FormControl('', [Validators.required, Validators.email]),
    securityQuestionControl: new FormControl('', [Validators.required])
  })
  public securityQuestion = undefined
  public error
  public confirmation
  public email?: string

  constructor (private securityQuestionService: SecurityQuestionService, private dataSubjectService: DataSubjectService) { }
  ngOnInit () {
    this.findSecurityQuestion()
  }

  get emailForm(): any {
    return this.dataSubjectGroup.get('emailControl')
  }

  get securityQuestionForm(): any {
    return this.dataSubjectGroup.get('securityQuestionControl')
  }

  findSecurityQuestion () {
    this.email = this.dataSubjectGroup.get('emailControl').value
    this.securityQuestion = undefined
    if (this.email) {
      this.securityQuestionService.findBy(this.email).subscribe((securityQuestion: any) => {
        if (securityQuestion) {
          this.securityQuestion = securityQuestion.question
        }
      },
      (error) => error
      )
    }
  }

  save () {
    this.dataSubjectService.deactivate().subscribe((response: any) => {
      this.error = undefined
      this.confirmation = 'The account details have been successfully erased. Changes will take effect from new login.'
      this.resetForm()
    }, (error) => {
      this.confirmation = undefined
      this.error = error.error
      this.resetForm()
    })
  }

  resetForm () {
    this.dataSubjectGroup.get('emailControl').markAsUntouched()
    this.dataSubjectGroup.get('emailControl').markAsPristine()
    this.dataSubjectGroup.get('emailControl').setValue('')
    this.dataSubjectGroup.get('securityQuestionControl').markAsUntouched()
    this.dataSubjectGroup.get('securityQuestionControl').markAsPristine()
    this.dataSubjectGroup.get('securityQuestionControl').setValue('')
  }
}
