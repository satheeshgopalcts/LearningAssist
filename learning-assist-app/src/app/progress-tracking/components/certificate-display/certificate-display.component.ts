import { Component, Input } from '@angular/core';
import { Certificate } from '../../../models/progress-tracking.model';

@Component({
  selector: 'app-certificate-display',
  templateUrl: './certificate-display.component.html',
  styleUrls: ['./certificate-display.component.scss']
})
export class CertificateDisplayComponent {
  @Input() certificate!: Certificate;
}
