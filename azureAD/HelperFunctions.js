/**
 * Helper function to serialize object into urlencoded form data string, properties
 * which value is either `null` or `undefined` will be ignored.
 * @param  {Object} params Object which contains props.
 * @return {string} Result form data string.
 */
export function _serialize(params:Object):string {
    let paramStr = ''
    for(let prop in params) {
      if(params[prop] !== null && params[prop] !== void 0 && prop !== 'grant_type')
        paramStr += `&${prop}=${encodeURIComponent(params[prop])}`
    }
    return paramStr;
  }