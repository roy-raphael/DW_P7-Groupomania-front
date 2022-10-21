import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function requiredFileType( types: string[] ): ValidatorFn {
  return (control: AbstractControl): null | ValidationErrors => {
    if (types.length === 0) {
      console.error("requiredFileType error : no type to check (empty array)");
      return null;
    }
    
    const file = control.value;
    if ( !file ) {
      return null;
    }

    var filename: String = "";
    if (file instanceof File) {
      filename = file.name;
    } else if (typeof file === "string") {
      filename = file;
    } else {
      console.error("requiredFileType error : unknown input type : " + typeof file);
      return null;
    }
    
    const extension = filename.split('.')[1];
    if (extension == null) {
      console.error("requiredFileType error : no extension found for file : " + filename);
      return null;
    }

    for (let type of types) {
      if ( type.toLowerCase() === extension.toLowerCase() ) {
        return null;
      }
    }

    return { requiredFileType: true };
  };
}