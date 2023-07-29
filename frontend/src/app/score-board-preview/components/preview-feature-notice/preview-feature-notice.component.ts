import { Component, Input } from '@angular/core'

import { Config } from 'src/app/Services/configuration.service'

@Component({
  selector: 'preview-feature-notice',
  templateUrl: './preview-feature-notice.component.html',
})
export class PreviewFeatureNotice {
  @Input()
  public applicationConfig: Config | null = null
}
