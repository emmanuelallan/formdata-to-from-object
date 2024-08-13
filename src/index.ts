type FormDataValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | File
    | Blob
    | Date
    | FormDataValue[];

type FormDataObject = { [key: string]: FormDataValue | FormDataObject };

interface Options {
    indices?: boolean;
    nullsAsUndefineds?: boolean;
    booleansAsIntegers?: boolean;
    allowEmptyArrays?: boolean;
    noAttributesWithArrayNotation?: boolean;
    noFilesWithArrayNotation?: boolean;
    dotsForObjectNotation?: boolean;
}

function isUndefined(value: any): value is undefined {
    return value === undefined;
}

function isNull(value: any): value is null {
    return value === null;
}

function isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
}

function isObject(value: any): value is object {
    return value === Object(value);
}

function isArray(value: any): value is any[] {
    return Array.isArray(value);
}

function isDate(value: any): value is Date {
    return value instanceof Date;
}

function isFile(value: any): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function isBlob(value: any): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function initOption(value: boolean | undefined): boolean {
    return isUndefined(value) ? false : value;
}

function toObj(source: FormData, options: Options = {}): FormDataObject {
  const entries = Array.from(source.entries());
  const initialObject = entries.reduce(
    (obj, [key, value]) => {
      obj[key] = value;
      return obj;
    },
    {} as { [key: string]: FormDataEntryValue },
  );

  return Object.keys(initialObject).reduce((output, key) => {
    const parts = options.dotsForObjectNotation ? key.split('.') : key.split(/[\[\]]/).filter(Boolean);
    let currentObject: FormDataObject = output;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        const value = initialObject[key];
        if (isFile(value) || isBlob(value)) {
          currentObject[part] = value;
        } else if (typeof value === 'string') {
          // Try to parse the value if it's a stringified primitive
          if (value === 'true') currentObject[part] = true;
          else if (value === 'false') currentObject[part] = false;
          else if (value === 'null') currentObject[part] = null;
          else if (!isNaN(Number(value))) currentObject[part] = Number(value);
          else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
            currentObject[part] = new Date(value);
          } else {
            currentObject[part] = value;
          }
        } else {
          currentObject[part] = value as FormDataValue;
        }
      } else {
        if (!currentObject[part]) {
          currentObject[part] = isNaN(Number(parts[i + 1])) ? {} : [];
        }
        currentObject = currentObject[part] as FormDataObject;
      }
    }
    return output;
  }, {} as FormDataObject);
}

function fromObj(obj: FormDataObject, options: Options = {}): FormData {
    const formData = new FormData();

    options.indices = initOption(options.indices);
    options.nullsAsUndefineds = initOption(options.nullsAsUndefineds);
    options.booleansAsIntegers = initOption(options.booleansAsIntegers);
    options.allowEmptyArrays = initOption(options.allowEmptyArrays);
    options.noAttributesWithArrayNotation = initOption(options.noAttributesWithArrayNotation);
    options.noFilesWithArrayNotation = initOption(options.noFilesWithArrayNotation);
    options.dotsForObjectNotation = initOption(options.dotsForObjectNotation);

    function serialize(currentObj: FormDataObject | FormDataValue, currentPath: string = "") {
        if (isUndefined(currentObj)) {
            return;
        } else if (isNull(currentObj)) {
            if (!options.nullsAsUndefineds) {
                formData.append(currentPath, '');
            }
        } else if (isBoolean(currentObj)) {
            if (options.booleansAsIntegers) {
                formData.append(currentPath, currentObj ? '1' : '0');
            } else {
                formData.append(currentPath, currentObj.toString());
            }
        } else if (isArray(currentObj)) {
            if (currentObj.length || options.allowEmptyArrays) {
                currentObj.forEach((item, index) => {
                    const key = options.noAttributesWithArrayNotation
                        ? currentPath
                        : `${currentPath}[${options.indices ? index : ''}]`;
                    serialize(item, key);
                });
            }
        } else if (isDate(currentObj)) {
            formData.append(currentPath, currentObj.toISOString());
        } else if (isBlob(currentObj) || isFile(currentObj)) {
            const key = options.noFilesWithArrayNotation ? currentPath.replace(/\[\d*\]$/, '') : currentPath;
            formData.append(key, currentObj);
        } else if (isObject(currentObj)) {
            Object.keys(currentObj).forEach((key) => {
                const value = currentObj[key];
                const newPath = currentPath
                    ? options.dotsForObjectNotation
                        ? `${currentPath}.${key}`
                        : `${currentPath}[${key}]`
                    : key;
                serialize(value as FormDataObject | FormDataValue, newPath);
            });
        } else {
            formData.append(currentPath, String(currentObj));
        }
    }

    serialize(obj);
    return formData;
}

export default {
    toObj,
    fromObj,
};