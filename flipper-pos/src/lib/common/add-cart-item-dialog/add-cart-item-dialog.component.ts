import { Component, OnInit, HostListener, Inject } from '@angular/core'

import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NotificationService, Taxes, SettingsService } from '@enexus/flipper-components'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'flipper-add-cart-item-dialog',
  templateUrl: './add-cart-item-dialog.component.html',
  styleUrls: ['./add-cart-item-dialog.component.css'],
})
export class AddCartItemDialogComponent implements OnInit {
  units: any[] = []

  constructor(
    public dialogRef: MatDialogRef<AddCartItemDialogComponent>,
    private formBuilder: FormBuilder,
    protected notificationSvc: NotificationService,
    private setting: SettingsService,
    @Inject(MAT_DIALOG_DATA) public taxes$: Taxes[]
  ) {
    this.units = this.setting.units()
  }

  get formControl() {
    return this.form.controls
  }
  submitted = false
  form: FormGroup
  isFocused = ''

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Esc') {
      this.dialogRef.close('close')
    }
  }


  ngOnInit() {
    this.form = this.formBuilder.group({
      price: [100, Validators.required],
      name: 'Custom Amount',
      quantity: [1, Validators.min(1)],
      tax: null,
      unit: '',
    })
  }

  onSubmit() {
    this.submitted = true
    // stop here if form is invalid
    console.log('we got it here then changes',this.form.value)
    //TODO: add a given product, this should handle creating default stock,regular product etc..
    //TODO: on success then add the proeuct to the list of cart items as searched item
    // if (this.form.invalid) {
    //   this.notificationSvc.error(
    //     'Add Cart item',
    //     'We need you to complete all of the required fields before we can continue',
    //     5000
    //   )
    //   return
    // } else {
    //   this.dialogRef.close({
    //     price: this.form.value.price,
    //     quantity: this.form.value.quantity && this.form.value.quantity > 0 ? this.form.value.quantity : 1,
    //     variantName: this.form.value.name ? this.form.value.name : 'No prduct name',
    //     productName: this.form.value.name ? this.form.value.name : '--',
    //     taxName: this.form.value.tax ? this.form.value.tax.name : 0,
    //     taxRate: this.form.value.tax ? this.form.value.tax.percentage : 0,
    //     unit: this.form.value.unit,
    //     canTrackingStock: false,
    //     currentStock: 0,
    //     sku: '00',
    //   })
    // }
  }

  focusing(value: any) {
    this.isFocused = value
    // if (value === 'name') {
    //   this.form.controls.name.setValue('')
    // } else if (value === 'price') {
    //   this.form.controls.price.setValue('')
    // } else if (value === 'quantity') {
    //   this.form.controls.quantity.setValue('')
    // }
  }
  focusingOut() {
    this.isFocused = ''
  }
}
