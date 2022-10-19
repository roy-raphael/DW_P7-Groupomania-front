import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function patternValidator(regex: RegExp, minOccurences: number, error: ValidationErrors): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
        if (!ctrl.value) {
            // if control is empty return no error
            return null;
        }
    
        // test the value of the control against the regexp supplied
        const match = ctrl.value.match(regex);
        if (match && match.length >= minOccurences) {
            // If the minimum matches has been found, return no error (null)
            return null;
        } else {
            // Else, return the error passed in the second parameter
            return error;
        }
    };
}