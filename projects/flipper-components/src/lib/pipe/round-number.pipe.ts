import { Pipe, PipeTransform, Injectable } from '@angular/core'

@Pipe({
  name: 'roundNumber',
})
@Injectable({
  providedIn: 'root',
})
export class RoundNumberPipe implements PipeTransform {
  transform(nums: number, decimals: number = 2): any {
    let newString // The new rounded number
    decimals = Number(decimals)
    if (decimals < 1) {
      newString = Math.round(nums).toString()
    } else {
      let numString = nums.toString()
      if (numString.lastIndexOf('.') === -1) {
        // If there is no decimal point
        numString += '.' // give it one at the end
      }
      let cutoff = numString.lastIndexOf('.') + decimals // The point at which to truncate the number
      let d1 = Number(numString.substring(cutoff, cutoff + 1)) // The value of the last decimal place that we'll end up with
      const d2 = Number(numString.substring(cutoff + 1, cutoff + 2)) // The next decimal, after the last one we want
      if (d2 >= 5) {
        // Do we need to round up at all? If not, the string will just be truncated
        if (d1 === 9 && cutoff > 0) {
          // If the last digit is 9, find a new cutoff point
          while (cutoff > 0 && (d1 === 9 || isNaN(d1))) {
            if (String(d1) !== '.') {
              cutoff -= 1
              d1 = Number(numString.substring(cutoff, cutoff + 1))
            } else {
              cutoff -= 1
            }
          }
        }
        d1 += 1
      }
      if (d1 === 10) {
        numString = numString.substring(0, numString.lastIndexOf('.'))
        const roundedNum = Number(numString) + 1
        newString = roundedNum.toString() + '.'
      } else {
        newString = numString.substring(0, cutoff) + d1.toString()
      }
    }
    if (decimals > 0) {
      if (newString.lastIndexOf('.') === -1) {
        // Do this again, to the new string
        newString += '.'
      }
      const decs = newString.substring(newString.lastIndexOf('.') + 1).length
      for (let i = 0; i < decimals - decs; i++) {
        newString += '0'
      }
    }
    // var newNumber = Number(newString);// make it a number if you like
    return this.formatNumbers(newString) // Output the result to the form field (change for your purposes)
  }

  formatNumbers(nums) {
    return nums.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
}
