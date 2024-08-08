# FormData Utils

A utility library to convert FormData to and from JavaScript objects.

### Installation

```bash
npm install formdata-object-utils```


### Usage

Importing the library

```ts
import FormDataUtils from 'formdata-object-utils';
```

### Converting FormData to an Object

```ts
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('age', '30');

const obj = FormDataUtils.toObj(formData);
console.log(obj); // { name: 'John Doe', age: '30' }
```

### Converting an Object to FormData

```ts
const obj = { name: 'John Doe', age: '30' };
const formData = FormDataUtils.fromObj(obj);

// Now formData can be used as FormData object
```

### API
`toObj(source: FormData): FormDataObject`
Converts a `FormData` object to a plain JavaScript object.

`fromObj(obj: FormDataObject): FormData`
Converts a plain JavaScript object to a `FormData` object.

### License
This project is licensed under the MIT License.


### **Optional: Adding `engines` Field in `package.json`**
   To specify the Node.js version and package managers supported, you can add an `engines` field in your `package.json`:

```json
{
  "engines": {
    "node": ">=12",
    "npm": ">=6",
    "yarn": ">=1.22",
    "pnpm": ">=6",
    "bun": ">=0.1"
  }
}
