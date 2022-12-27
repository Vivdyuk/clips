import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class RegisterValidators {

  static match(contytolName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(contytolName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        console.error('Form control can not be found int the form group.');

        return {
          controlNotFound: false
        }
      }
      const error = control.value === matchingControl.value ? null : { nullMatch: true };

      matchingControl.setErrors(error)

      return error;
    }
  }
}
