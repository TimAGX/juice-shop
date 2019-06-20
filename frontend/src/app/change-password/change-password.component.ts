import { FormControl, Validators, AbstractControl } from '@angular/forms'
import { UserService } from '../Services/user.service'
import { Component } from '@angular/core'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'

library.add(faSave, faEdit)
dom.watch()

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  public passwordControl: FormControl = new FormControl('', [Validators.required])
  public newPasswordControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)])
  public repeatNewPasswordControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), matchValidator(this.newPasswordControl)])
  public error: any
  public confirmation: any

  constructor (private userService: UserService, private formSubmitService: FormSubmitService) { }

  ngOnInit () {
    this.formSubmitService.attachEnterKeyHandler('password-form', 'changeButton', () => this.changePassword())
  }

  changePassword () {
    this.userService.changePassword({
      current: this.passwordControl.value,
      new: this.newPasswordControl.value,
      repeat: this.repeatNewPasswordControl.value
    }).subscribe((response: any) => {
      this.error = undefined
      this.confirmation = 'Your password was successfully changed.'
      this.resetForm()
    }, (error) => {
      console.log(error)
      this.error = error
      this.confirmation = undefined
      this.resetPasswords()
    })
  }

  resetForm () {
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.newPasswordControl.setValue('')
    this.newPasswordControl.markAsPristine()
    this.newPasswordControl.markAsUntouched()
    this.repeatNewPasswordControl.setValue('')
    this.repeatNewPasswordControl.markAsPristine()
    this.repeatNewPasswordControl.markAsUntouched()
  }

  resetPasswords () {
    this.newPasswordControl.setValue('')
    this.newPasswordControl.markAsPristine()
    this.newPasswordControl.markAsUntouched()
    this.repeatNewPasswordControl.setValue('')
    this.repeatNewPasswordControl.markAsPristine()
    this.repeatNewPasswordControl.markAsUntouched()
  }
}

function matchValidator (newPasswordControl: AbstractControl) {
  return function matchOtherValidate (repeatNewPasswordControl: FormControl) {
    let password = newPasswordControl.value
    let passwordRepeat = repeatNewPasswordControl.value
    if (password !== passwordRepeat) {
      return { notSame: true }
    }
    return null
  }
}
