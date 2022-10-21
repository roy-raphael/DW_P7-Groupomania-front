import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function sanityCheckValidator(regex: RegExp): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
        if (!ctrl.value) {
            // if control is empty return no error
            return null;
        }
    
        // test the value of the control against the regexp supplied
        const match = ctrl.value.match(regex);
        if (match) {
            // If at least one match has been found, return an error
            return { hasForbiddenCharacter: true };
        } else {
            // Else, return no error (null)
            return null;
        }
    };
}