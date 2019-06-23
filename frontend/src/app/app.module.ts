import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngx-cookie'
import { ReactiveFormsModule } from '@angular/forms'
import { Routing, AdminGuard, AccountingGuard } from './app.routing'
import { OverlayContainer } from '@angular/cdk/overlay'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { QRCodeModule } from 'angularx-qrcode'
import { BarRatingModule } from 'ng2-bar-rating'
import { ClipboardModule } from 'ngx-clipboard'
import { FileUploadModule } from 'ng2-file-upload'
import { SlideshowModule } from 'ng-simple-slideshow'
import { NgxSpinnerModule } from 'ngx-spinner'
/* Imported Components */
import { AppComponent } from './app.component'
import { AboutComponent } from './about/about.component'
import { AdministrationComponent } from './administration/administration.component'
import { BasketComponent } from './basket/basket.component'
import { LoginComponent } from './login/login.component'
import { ScoreBoardComponent } from './score-board/score-board.component'
import { NavbarComponent } from './navbar/navbar.component'
import { WelcomeComponent } from './welcome/welcome.component'
import { WelcomeBannerComponent } from './welcome-banner/welcome-banner.component'
import { SearchResultComponent } from './search-result/search-result.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { RegisterComponent } from './register/register.component'
import { ContactComponent } from './contact/contact.component'
import { ErasureRequestComponent } from './erasure-request/erasure-request.component'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { ProductDetailsComponent } from './product-details/product-details.component'
import { ComplaintComponent } from './complaint/complaint.component'
import { TrackOrderComponent } from './track-order/track-order.component'
import { TrackResultComponent } from './track-result/track-result.component'
import { RecycleComponent } from './recycle/recycle.component'
import { QrCodeComponent } from './qr-code/qr-code.component'
import { UserDetailsComponent } from './user-details/user-details.component'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification/challenge-solved-notification.component'
import { OAuthComponent } from './oauth/oauth.component'
import { TokenSaleComponent } from './token-sale/token-sale.component'
import { ProductReviewEditComponent } from './product-review-edit/product-review-edit.component'
import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter/two-factor-auth-enter.component'
import { PrivacySecurityComponent } from './privacy-security/privacy-security.component'
import { ErrorPageComponent } from './error-page/error-page.component'
import { NgMatSearchBarModule } from 'ng-mat-search-bar'
/* Imported Services */
import { RequestInterceptor } from './Services/request.interceptor'
import { ProductService } from './Services/product.service'
import { ConfigurationService } from './Services/configuration.service'
import { AdministrationService } from './Services/administration.service'
import { SecurityQuestionService } from './Services/security-question.service'
import { UserService } from './Services/user.service'
import { SecurityAnswerService } from './Services/security-answer.service'
import { FeedbackService } from './Services/feedback.service'
import { CaptchaService } from './Services/captcha.service'
import { WindowRefService } from './Services/window-ref.service'
import { ProductReviewService } from './Services/product-review.service'
import { ComplaintService } from './Services/complaint.service'
import { TrackOrderService } from './Services/track-order.service'
import { RecycleService } from './Services/recycle.service'
import { BasketService } from './Services/basket.service'
import { ChallengeService } from './Services/challenge.service'
import { DataSubjectService } from './Services/data-subject.service'
import { ImageCaptchaService } from './Services/image-captcha.service'
import { QuantityService } from './Services/quantity.service'
/* Modules required for Angular Material */
import { FlexLayoutModule } from '@angular/flex-layout'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatMenuModule } from '@angular/material/menu'
import { MatListModule } from '@angular/material/list'
import { SidenavComponent } from './sidenav/sidenav.component'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { LayoutModule } from '@angular/cdk/layout'
import { MatGridListModule, MatRadioModule, MatSnackBarModule } from '@angular/material'
import { MatBadgeModule } from '@angular/material/badge'
/* Internal components */
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component'
import { DataExportComponent } from './data-export/data-export.component'
import { LastLoginIpComponent } from './last-login-ip/last-login-ip.component'
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component'
import { AccountingComponent } from './accounting/accounting.component'
import { ChallengeStatusBadgeComponent } from './challenge-status-badge/challenge-status-badge.component'

export function HttpLoaderFactory (http: HttpClient) {
  return new TranslateHttpLoader(http, './../assets/i18n/', '.json')
}

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    AdministrationComponent,
    BasketComponent,
    LoginComponent,
    ScoreBoardComponent,
    NavbarComponent,
    WelcomeComponent,
    WelcomeBannerComponent,
    SearchResultComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    ContactComponent,
    ErasureRequestComponent,
    ChangePasswordComponent,
    ProductDetailsComponent,
    ComplaintComponent,
    TrackOrderComponent,
    TrackResultComponent,
    RecycleComponent,
    QrCodeComponent,
    UserDetailsComponent,
    ServerStartedNotificationComponent,
    ChallengeSolvedNotificationComponent,
    OAuthComponent,
    TokenSaleComponent,
    ProductReviewEditComponent,
    TwoFactorAuthEnterComponent,
    SidenavComponent,
    PrivacySecurityComponent,
    ErrorPageComponent,
    TwoFactorAuthComponent,
    DataExportComponent,
    LastLoginIpComponent,
    PrivacyPolicyComponent,
    AccountingComponent
    PrivacyPolicyComponent,
    ChallengeStatusBadgeComponent
  ],
  entryComponents: [
    ProductDetailsComponent,
    QrCodeComponent,
    UserDetailsComponent,
    ProductReviewEditComponent,
    WelcomeBannerComponent
  ],
  imports: [
    BrowserModule,
    Routing,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }
    ),
    CookieModule.forRoot(),
    FlexLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SlideshowModule,
    QRCodeModule,
    BarRatingModule,
    FileUploadModule,
    ClipboardModule,
    NgxSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatListModule,
    MatButtonToggleModule,
    LayoutModule,
    MatGridListModule,
    NgMatSearchBarModule,
    MatBadgeModule,
    MatRadioModule,
    MatSnackBarModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    ProductService,
    ConfigurationService,
    AdministrationService,
    SecurityQuestionService,
    DataSubjectService,
    UserService,
    SecurityAnswerService,
    CaptchaService,
    FeedbackService,
    WindowRefService,
    ProductReviewService,
    ComplaintService,
    TrackOrderService,
    RecycleService,
    BasketService,
    ChallengeService,
    CookieService,
    AdminGuard,
    AccountingGuard,
    ImageCaptchaService,
    QuantityService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor (configurationService: ConfigurationService, overlayContainer: OverlayContainer) {
    configurationService.getApplicationConfiguration().subscribe((conf) => {
      overlayContainer.getContainerElement().classList.add(conf.application.theme + '-theme')
    })
  }

}
