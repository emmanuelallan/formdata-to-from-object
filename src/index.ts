type FormDataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | FormDataValue[];
type FormDataObject = { [key: string]: FormDataValue | FormDataObject };

function toObj(source: FormData): FormDataObject {
  const entries = Array.from(source.entries());
  const initialObject = entries.reduce(
    (obj, [key, value]) => {
      obj[key] = value;
      return obj;
    },
    {} as { [key: string]: FormDataEntryValue },
  );

  return Object.keys(initialObject).reduce((output, key) => {
    const parts = key.split(/[\[\]]/).filter(Boolean);
    let currentObject: FormDataObject = output;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        currentObject[part] = initialObject[key] as FormDataValue;
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

function fromObj(obj: FormDataObject): FormData {
  const formData = new FormData();

  function recur(currentObj: FormDataObject, currentPath: string = "") {
    Object.keys(currentObj).forEach((key) => {
      const value = currentObj[key];
      const path = currentPath ? `${currentPath}[${key}]` : key;
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            recur(item as unknown as FormDataObject, `${path}[${index}]`);
          });
        } else {
          recur(value as FormDataObject, path);
        }
      } else {
        formData.append(path, String(value));
      }
    });
  }

  recur(obj);
  return formData;
}

export default {
  toObj,
  fromObj,
};
