if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  class AbortablePromise {
    constructor(executor) {
      this._reject = null;
      this.promise = new Promise((resolve, reject) => {
        executor(resolve, reject);
        this._reject = reject;
      });
    }
    // 提供abort方法来中止Promise
    abort(error) {
      if (this._reject) {
        this._reject(error);
      }
    }
    then(onfulfilled, onrejected) {
      return this.promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.promise.catch(onrejected);
    }
  }
  function addUnit(num) {
    return !isNumber(num) ? num : `${num}px`;
  }
  function isObj(value) {
    return Object.prototype.toString.call(value) === "[object Object]" || typeof value === "object";
  }
  function getType(target) {
    const typeStr = Object.prototype.toString.call(target);
    const match = typeStr.match(/\[object (\w+)\]/);
    const type = match && match.length ? match[1].toLowerCase() : "";
    return type;
  }
  const defaultDisplayFormat = function(items, kv) {
    const labelKey = (kv == null ? void 0 : kv.labelKey) || "value";
    if (Array.isArray(items)) {
      return items.map((item) => item[labelKey]).join(", ");
    } else {
      return items[labelKey];
    }
  };
  const isDef = (value) => value !== void 0 && value !== null;
  const checkNumRange = (num, label = "value") => {
    if (num < 0) {
      throw new Error(`${label} shouldn't be less than zero`);
    }
  };
  function rgbToHex(r, g, b) {
    const hex = (r << 16 | g << 8 | b).toString(16);
    const paddedHex = "#" + "0".repeat(Math.max(0, 6 - hex.length)) + hex;
    return paddedHex;
  }
  function hexToRgb(hex) {
    const rgb = [];
    for (let i = 1; i < 7; i += 2) {
      rgb.push(parseInt("0x" + hex.slice(i, i + 2), 16));
    }
    return rgb;
  }
  const gradient = (startColor, endColor, step = 2) => {
    const sColor = hexToRgb(startColor);
    const eColor = hexToRgb(endColor);
    const rStep = (eColor[0] - sColor[0]) / step;
    const gStep = (eColor[1] - sColor[1]) / step;
    const bStep = (eColor[2] - sColor[2]) / step;
    const gradientColorArr = [];
    for (let i = 0; i < step; i++) {
      gradientColorArr.push(
        rgbToHex(parseInt(String(rStep * i + sColor[0])), parseInt(String(gStep * i + sColor[1])), parseInt(String(bStep * i + sColor[2])))
      );
    }
    return gradientColorArr;
  };
  const range = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
  };
  const isEqual = (value1, value2) => {
    if (value1 === value2) {
      return true;
    }
    if (!Array.isArray(value1) || !Array.isArray(value2)) {
      return false;
    }
    if (value1.length !== value2.length) {
      return false;
    }
    for (let i = 0; i < value1.length; ++i) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  };
  const context = {
    id: 1e3
  };
  function getRect(selector, all, scope) {
    return new Promise((resolve, reject) => {
      let query = null;
      if (scope) {
        query = uni.createSelectorQuery().in(scope);
      } else {
        query = uni.createSelectorQuery();
      }
      query[all ? "selectAll" : "select"](selector).boundingClientRect((rect) => {
        if (all && isArray(rect) && rect.length > 0) {
          resolve(rect);
        } else if (!all && rect) {
          resolve(rect);
        } else {
          reject(new Error("No nodes found"));
        }
      }).exec();
    });
  }
  function kebabCase(word) {
    const newWord = word.replace(/[A-Z]/g, function(match) {
      return "-" + match;
    }).toLowerCase();
    return newWord;
  }
  function camelCase(word) {
    return word.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }
  function isArray(value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    }
    return Object.prototype.toString.call(value) === "[object Array]";
  }
  function isFunction(value) {
    return getType(value) === "function";
  }
  function isString(value) {
    return getType(value) === "string";
  }
  function isNumber(value) {
    return getType(value) === "number";
  }
  function isPromise(value) {
    if (isObj(value) && isDef(value)) {
      return isFunction(value.then) && isFunction(value.catch);
    }
    return false;
  }
  function objToStyle(styles) {
    if (isArray(styles)) {
      return styles.filter(function(item) {
        return item != null && item !== "";
      }).map(function(item) {
        return objToStyle(item);
      }).join(";");
    }
    if (isString(styles)) {
      return styles;
    }
    if (isObj(styles)) {
      return Object.keys(styles).filter(function(key) {
        return styles[key] != null && styles[key] !== "";
      }).map(function(key) {
        return [kebabCase(key), styles[key]].join(":");
      }).join(";");
    }
    return "";
  }
  const requestAnimationFrame = (cb = () => {
  }) => {
    return new AbortablePromise((resolve) => {
      const timer = setInterval(() => {
        clearInterval(timer);
        resolve(true);
        cb();
      }, 1e3 / 30);
    });
  };
  function deepClone(obj, cache = /* @__PURE__ */ new Map()) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }
    if (obj instanceof Error) {
      const errorCopy = new Error(obj.message);
      errorCopy.stack = obj.stack;
      return errorCopy;
    }
    if (cache.has(obj)) {
      return cache.get(obj);
    }
    const copy = Array.isArray(obj) ? [] : {};
    cache.set(obj, copy);
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepClone(obj[key], cache);
      }
    }
    return copy;
  }
  function deepAssign(target, source) {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const newObjValue = source[key];
      if (isObj(targetValue) && isObj(newObjValue)) {
        deepAssign(targetValue, newObjValue);
      } else {
        target[key] = newObjValue;
      }
    });
    return target;
  }
  const getPropByPath = (obj, path) => {
    const keys = path.split(".");
    try {
      return keys.reduce((acc, key) => acc !== void 0 && acc !== null ? acc[key] : void 0, obj);
    } catch (error) {
      return void 0;
    }
  };
  const isDate = (val) => Object.prototype.toString.call(val) === "[object Date]" && !Number.isNaN(val.getTime());
  const numericProp = [Number, String];
  const makeRequiredProp = (type) => ({
    type,
    required: true
  });
  const makeArrayProp = () => ({
    type: Array,
    default: () => []
  });
  const makeBooleanProp = (defaultVal) => ({
    type: Boolean,
    default: defaultVal
  });
  const makeNumberProp = (defaultVal) => ({
    type: Number,
    default: defaultVal
  });
  const makeNumericProp = (defaultVal) => ({
    type: numericProp,
    default: defaultVal
  });
  const makeStringProp = (defaultVal) => ({
    type: String,
    default: defaultVal
  });
  const baseProps = {
    /**
     * 自定义根节点样式
     */
    customStyle: makeStringProp(""),
    /**
     * 自定义根节点样式类
     */
    customClass: makeStringProp("")
  };
  const iconProps = {
    ...baseProps,
    /**
     * 使用的图标名字，可以使用链接图片
     */
    name: makeRequiredProp(String),
    /**
     * 图标的颜色
     */
    color: String,
    /**
     * 图标的字体大小
     */
    size: String,
    /**
     * 类名前缀，用于使用自定义图标
     */
    classPrefix: makeStringProp("wd-icon")
  };
  const __default__$e = {
    name: "wd-icon",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$g = /* @__PURE__ */ vue.defineComponent({
    ...__default__$e,
    props: iconProps,
    emits: ["click"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const isImageUrl = vue.ref(false);
      vue.watch(
        () => props.name,
        (val) => {
          isImageUrl.value = val.indexOf("/") > -1;
        },
        { deep: true, immediate: true }
      );
      const rootClass = vue.computed(() => {
        const prefix = props.classPrefix;
        return `${prefix} ${props.customClass} ${isImageUrl.value ? "wd-icon--image" : prefix + "-" + props.name}`;
      });
      const rootStyle = vue.computed(() => {
        const style = {};
        if (props.color) {
          style["color"] = props.color;
        }
        if (props.size) {
          style["font-size"] = props.size;
        }
        return `${objToStyle(style)}; ${props.customStyle}`;
      });
      function handleClick(event) {
        emit("click", event);
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            onClick: handleClick,
            class: vue.normalizeClass(rootClass.value),
            style: vue.normalizeStyle(rootStyle.value)
          },
          [
            isImageUrl.value ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "wd-icon__image",
              src: _ctx.name
            }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-24906af6"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-icon/wd-icon.vue"]]);
  const _b64chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"];
  const _mkUriSafe = (src) => src.replace(/[+/]/g, (m0) => m0 === "+" ? "-" : "_").replace(/=+\$/m, "");
  const fromUint8Array = (src, rfc4648 = false) => {
    let b64 = "";
    for (let i = 0, l = src.length; i < l; i += 3) {
      const [a0, a1, a2] = [src[i], src[i + 1], src[i + 2]];
      const ord = a0 << 16 | a1 << 8 | a2;
      b64 += _b64chars[ord >>> 18];
      b64 += _b64chars[ord >>> 12 & 63];
      b64 += typeof a1 !== "undefined" ? _b64chars[ord >>> 6 & 63] : "=";
      b64 += typeof a2 !== "undefined" ? _b64chars[ord & 63] : "=";
    }
    return rfc4648 ? _mkUriSafe(b64) : b64;
  };
  const _btoa = typeof btoa === "function" ? (s) => btoa(s) : (s) => {
    if (s.charCodeAt(0) > 255) {
      throw new RangeError("The string contains invalid characters.");
    }
    return fromUint8Array(Uint8Array.from(s, (c) => c.charCodeAt(0)));
  };
  const utob = (src) => unescape(encodeURIComponent(src));
  function encode(src, rfc4648 = false) {
    const b64 = _btoa(utob(src));
    return rfc4648 ? _mkUriSafe(b64) : b64;
  }
  const loadingProps = {
    ...baseProps,
    /**
     * 加载指示器类型，可选值：'outline' | 'ring'
     */
    type: makeStringProp("ring"),
    /**
     * 设置加载指示器颜色
     */
    color: makeStringProp("#4D80F0"),
    /**
     * 设置加载指示器大小
     */
    size: makeNumericProp("")
  };
  const __default__$d = {
    name: "wd-loading",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$f = /* @__PURE__ */ vue.defineComponent({
    ...__default__$d,
    props: loadingProps,
    setup(__props) {
      const svgDefineId = context.id++;
      const svgDefineId1 = context.id++;
      const svgDefineId2 = context.id++;
      const icon = {
        outline(color = "#4D80F0") {
          return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42"><defs><linearGradient x1="100%" y1="0%" x2="0%" y2="0%" id="${svgDefineId}"><stop stop-color="#FFF" offset="0%" stop-opacity="0"/><stop stop-color="#FFF" offset="100%"/></linearGradient></defs><g fill="none" fill-rule="evenodd"><path d="M21 1c11.046 0 20 8.954 20 20s-8.954 20-20 20S1 32.046 1 21 9.954 1 21 1zm0 7C13.82 8 8 13.82 8 21s5.82 13 13 13 13-5.82 13-13S28.18 8 21 8z" fill="${color}"/><path d="M4.599 21c0 9.044 7.332 16.376 16.376 16.376 9.045 0 16.376-7.332 16.376-16.376" stroke="url(#${svgDefineId}) " stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
        },
        ring(color = "#4D80F0", intermediateColor2 = "#a6bff7") {
          return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><linearGradient id="${svgDefineId1}" gradientUnits="userSpaceOnUse" x1="50" x2="50" y2="180"><stop offset="0" stop-color="${color}"></stop> <stop offset="1" stop-color="${intermediateColor2}"></stop></linearGradient> <path fill="url(#${svgDefineId1})" d="M20 100c0-44.1 35.9-80 80-80V0C44.8 0 0 44.8 0 100s44.8 100 100 100v-20c-44.1 0-80-35.9-80-80z"></path> <linearGradient id="${svgDefineId2}" gradientUnits="userSpaceOnUse" x1="150" y1="20" x2="150" y2="180"><stop offset="0" stop-color="#fff" stop-opacity="0"></stop> <stop offset="1" stop-color="${intermediateColor2}"></stop></linearGradient> <path fill="url(#${svgDefineId2})" d="M100 0v20c44.1 0 80 35.9 80 80s-35.9 80-80 80v20c55.2 0 100-44.8 100-100S155.2 0 100 0z"></path> <circle cx="100" cy="10" r="10" fill="${color}"></circle></svg>`;
        }
      };
      const props = __props;
      const svg = vue.ref("");
      const intermediateColor = vue.ref("");
      const iconSize = vue.ref(null);
      vue.watch(
        () => props.size,
        (newVal) => {
          iconSize.value = addUnit(newVal);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.type,
        () => {
          buildSvg();
        },
        {
          deep: true,
          immediate: true
        }
      );
      const rootStyle = vue.computed(() => {
        const style = {};
        if (isDef(iconSize.value)) {
          style.height = addUnit(iconSize.value);
          style.width = addUnit(iconSize.value);
        }
        return `${objToStyle(style)}; ${props.customStyle}`;
      });
      vue.onBeforeMount(() => {
        intermediateColor.value = gradient(props.color, "#ffffff", 2)[1];
        buildSvg();
      });
      function buildSvg() {
        const { type, color } = props;
        let ringType = isDef(type) ? type : "ring";
        const svgStr = `"data:image/svg+xml;base64,${encode(ringType === "ring" ? icon[ringType](color, intermediateColor.value) : icon[ringType](color))}"`;
        svg.value = svgStr;
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-loading ${props.customClass}`),
            style: vue.normalizeStyle(rootStyle.value)
          },
          [
            vue.createElementVNode("view", { class: "wd-loading__body" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "wd-loading__svg",
                  style: vue.normalizeStyle(`background-image: url(${svg.value});`)
                },
                null,
                4
                /* STYLE */
              )
            ])
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_6 = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-f2b508ee"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-loading/wd-loading.vue"]]);
  const pickerViewProps = {
    ...baseProps,
    /**
     * 加载状态
     */
    loading: makeBooleanProp(false),
    /**
     * 加载的颜色，只能使用十六进制的色值写法，且不能使用缩写
     */
    loadingColor: makeStringProp("#4D80F0"),
    /**
     * picker内部滚筒高
     */
    columnsHeight: makeNumberProp(217),
    /**
     * 选项对象中，value对应的 key
     */
    valueKey: makeStringProp("value"),
    /**
     * 选项对象中，展示的文本对应的 key
     */
    labelKey: makeStringProp("label"),
    /**
     * 是否在手指松开时立即触发picker-view的 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
     */
    immediateChange: makeBooleanProp(false),
    /**
     * 选中项，如果为多列选择器，则其类型应为数组
     */
    modelValue: {
      type: [String, Number, Boolean, Array, Array, Array],
      default: "",
      required: true
    },
    /**
     * 选择器数据，可以为字符串数组，也可以为对象数组，如果为二维数组，则为多列选择器
     */
    columns: makeArrayProp(),
    /**
     * 接收 pickerView 实例、选中项、当前修改列的下标、resolve 作为入参，根据选中项和列下标进行判断，通过 pickerView 实例暴露出来的 setColumnData 方法修改其他列的数据源。
     */
    columnChange: Function
  };
  function formatArray(array, valueKey, labelKey) {
    let tempArray = isArray(array) ? array : [array];
    const firstLevelTypeList = new Set(array.map(getType));
    if (firstLevelTypeList.size !== 1 && firstLevelTypeList.has("object")) {
      throw Error("The columns are correct");
    }
    if (!isArray(array[0])) {
      tempArray = [tempArray];
    }
    const result = tempArray.map((col) => {
      return col.map((row) => {
        if (!isObj(row)) {
          return {
            [valueKey]: row,
            [labelKey]: row
          };
        }
        if (!row.hasOwnProperty(valueKey) && !row.hasOwnProperty(labelKey)) {
          throw Error("Can't find valueKey and labelKey in columns");
        }
        if (!row.hasOwnProperty(labelKey)) {
          row[labelKey] = row[valueKey];
        }
        if (!row.hasOwnProperty(valueKey)) {
          row[valueKey] = row[labelKey];
        }
        return row;
      });
    });
    return result;
  }
  const __default__$c = {
    name: "wd-picker-view",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$e = /* @__PURE__ */ vue.defineComponent({
    ...__default__$c,
    props: pickerViewProps,
    emits: ["change", "pickstart", "pickend", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const formatColumns = vue.ref([]);
      const itemHeight = vue.ref(35);
      const selectedIndex = vue.ref([]);
      vue.watch(
        [() => props.modelValue, () => props.columns],
        (newValue, oldValue) => {
          if (!isEqual(oldValue[1], newValue[1])) {
            formatColumns.value = formatArray(newValue[1], props.valueKey, props.labelKey);
          }
          if (!isEqual(oldValue[0], newValue[0]) && isDef(newValue[0])) {
            selectWithValue(newValue[0]);
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      const { proxy } = vue.getCurrentInstance();
      function selectWithValue(value) {
        if (formatColumns.value.length === 0)
          return;
        if (value === "" || !isDef(value) || isArray(value) && value.length === 0) {
          value = formatColumns.value.map((col) => {
            return col[0][props.valueKey];
          });
        }
        const valueType = getType(value);
        const type = ["string", "number", "boolean", "array"];
        if (type.indexOf(valueType) === -1)
          formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-picker-view/wd-picker-view.vue:91", `value must be one of ${type.toString()}`);
        value = isArray(value) ? value : [value];
        value = value.slice(0, formatColumns.value.length);
        let selected = deepClone(selectedIndex.value);
        value.forEach((target, col) => {
          let row = formatColumns.value[col].findIndex((row2) => {
            return row2[props.valueKey].toString() === target.toString();
          });
          row = row === -1 ? 0 : row;
          selected = correctSelectedIndex(col, row, selected);
        });
        selectedIndex.value = selected.slice(0, value.length);
      }
      function correctSelected(value) {
        let selected = deepClone(value);
        value.forEach((row, col) => {
          row = range(row, 0, formatColumns.value[col].length - 1);
          selected = correctSelectedIndex(col, row, selected);
        });
        return selected;
      }
      function correctSelectedIndex(columnIndex, rowIndex, selected) {
        const col = formatColumns.value[columnIndex];
        if (!col || !col[rowIndex]) {
          throw Error(`The value to select with Col:${columnIndex} Row:${rowIndex} is incorrect`);
        }
        const select = deepClone(selected);
        select[columnIndex] = rowIndex;
        if (col[rowIndex].disabled) {
          const prev = col.slice(0, rowIndex).reverse().findIndex((s) => !s.disabled);
          const next = col.slice(rowIndex + 1).findIndex((s) => !s.disabled);
          if (prev !== -1) {
            select[columnIndex] = rowIndex - 1 - prev;
          } else if (next !== -1) {
            select[columnIndex] = rowIndex + 1 + next;
          } else if (select[columnIndex] === void 0) {
            select[columnIndex] = 0;
          }
        }
        return select;
      }
      function onChange({ detail: { value } }) {
        value = value.map((v) => {
          return Number(v || 0);
        });
        const index = getChangeDiff(value);
        selectedIndex.value = deepClone(value);
        vue.nextTick(() => {
          selectedIndex.value = correctSelected(value);
          if (props.columnChange) {
            if (props.columnChange.length < 4) {
              props.columnChange(proxy.$.exposed, getSelects(), index || 0, () => {
              });
              handleChange(index || 0);
            } else {
              props.columnChange(proxy.$.exposed, getSelects(), index || 0, () => {
                handleChange(index || 0);
              });
            }
          } else {
            handleChange(index || 0);
          }
        });
      }
      function getChangeColumn(now, origin) {
        if (!now || !origin)
          return -1;
        const index = now.findIndex((row, index2) => row !== origin[index2]);
        return index;
      }
      function getChangeDiff(value) {
        value = value.slice(0, formatColumns.value.length);
        const origin = deepClone(selectedIndex.value);
        let selected = deepClone(selectedIndex.value);
        value.forEach((row, col) => {
          row = range(row, 0, formatColumns.value[col].length - 1);
          if (row === origin[col])
            return;
          selected = correctSelectedIndex(col, row, selected);
        });
        const diffCol = getChangeColumn(selected, origin);
        if (diffCol === -1)
          return;
        const diffRow = selected[diffCol];
        return selected.length === 1 ? diffRow : diffCol;
      }
      function handleChange(index) {
        const value = getValues();
        if (isEqual(value, props.modelValue))
          return;
        emit("update:modelValue", value);
        setTimeout(() => {
          emit("change", {
            picker: proxy.$.exposed,
            value,
            index
          });
        }, 0);
      }
      function getSelects() {
        const selects = selectedIndex.value.map((row, col) => formatColumns.value[col][row]);
        if (selects.length === 1) {
          return selects[0];
        }
        return selects;
      }
      function getValues() {
        const { valueKey } = props;
        const values = selectedIndex.value.map((row, col) => {
          return formatColumns.value[col][row][valueKey];
        });
        if (values.length === 1) {
          return values[0];
        }
        return values;
      }
      function getLabels() {
        const { labelKey } = props;
        return selectedIndex.value.map((row, col) => formatColumns.value[col][row][labelKey]);
      }
      function getColumnIndex(columnIndex) {
        return selectedIndex.value[columnIndex];
      }
      function getColumnData(columnIndex) {
        return formatColumns.value[columnIndex];
      }
      function setColumnData(columnIndex, data, rowIndex = 0) {
        formatColumns.value[columnIndex] = formatArray(data, props.valueKey, props.labelKey).reduce((acc, val) => acc.concat(val), []);
        selectedIndex.value = correctSelectedIndex(columnIndex, rowIndex, selectedIndex.value);
      }
      function getColumnsData() {
        return deepClone(formatColumns.value);
      }
      function getSelectedIndex() {
        return selectedIndex.value;
      }
      function onPickStart() {
        emit("pickstart");
      }
      function onPickEnd() {
        emit("pickend");
      }
      __expose({
        getSelects,
        getValues,
        setColumnData,
        getColumnsData,
        getColumnData,
        getColumnIndex,
        getLabels,
        getSelectedIndex
      });
      return (_ctx, _cache) => {
        const _component_wd_loading = resolveEasycom(vue.resolveDynamicComponent("wd-loading"), __easycom_6);
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-picker-view ${_ctx.customClass}`),
            style: vue.normalizeStyle(_ctx.customStyle)
          },
          [
            _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "wd-picker-view__loading"
            }, [
              vue.createVNode(_component_wd_loading, { color: _ctx.loadingColor }, null, 8, ["color"])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "view",
              {
                style: vue.normalizeStyle(`height: ${_ctx.columnsHeight - 20}px;`)
              },
              [
                vue.createElementVNode("picker-view", {
                  "mask-class": "wd-picker-view__mask",
                  "indicator-class": "wd-picker-view__roller",
                  "indicator-style": `height: ${itemHeight.value}px;`,
                  style: vue.normalizeStyle(`height: ${_ctx.columnsHeight - 20}px;`),
                  value: selectedIndex.value,
                  "immediate-change": _ctx.immediateChange,
                  onChange,
                  onPickstart: onPickStart,
                  onPickend: onPickEnd
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(formatColumns.value, (col, colIndex) => {
                      return vue.openBlock(), vue.createElementBlock("picker-view-column", {
                        key: colIndex,
                        class: "wd-picker-view-column"
                      }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(col, (row, rowIndex) => {
                            return vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: rowIndex,
                                class: vue.normalizeClass(`wd-picker-view-column__item ${row["disabled"] ? "wd-picker-view-column__item--disabled" : ""}  ${selectedIndex.value[colIndex] == rowIndex ? "wd-picker-view-column__item--active" : ""}`),
                                style: vue.normalizeStyle(`line-height: ${itemHeight.value}px;`)
                              },
                              vue.toDisplayString(row[_ctx.labelKey]),
                              7
                              /* TEXT, CLASS, STYLE */
                            );
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ], 44, ["indicator-style", "value", "immediate-change"])
              ],
              4
              /* STYLE */
            )
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-c3bc94ff"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-picker-view/wd-picker-view.vue"]]);
  const transitionProps = {
    ...baseProps,
    /**
     * 是否展示组件
     * 类型：boolean
     * 默认值：false
     */
    show: makeBooleanProp(false),
    /**
     * 动画执行时间
     * 类型：number | boolean | Record<string, number>
     * 默认值：300 (毫秒)
     */
    duration: {
      type: [Object, Number, Boolean],
      default: 300
    },
    /**
     * 动画类型
     * 类型：string
     * 可选值：fade / fade-up / fade-down / fade-left / fade-right / slide-up / slide-down / slide-left / slide-right / zoom-in
     * 默认值：'fade'
     */
    name: makeStringProp("fade"),
    /**
     * 是否延迟渲染子组件
     * 类型：boolean
     * 默认值：true
     */
    lazyRender: makeBooleanProp(true),
    /**
     * 进入过渡的开始状态
     * 类型：string
     */
    enterClass: makeStringProp(""),
    /**
     * 进入过渡的激活状态
     * 类型：string
     */
    enterActiveClass: makeStringProp(""),
    /**
     * 进入过渡的结束状态
     * 类型：string
     */
    enterToClass: makeStringProp(""),
    /**
     * 离开过渡的开始状态
     * 类型：string
     */
    leaveClass: makeStringProp(""),
    /**
     * 离开过渡的激活状态
     * 类型：string
     */
    leaveActiveClass: makeStringProp(""),
    /**
     * 离开过渡的结束状态
     * 类型：string
     */
    leaveToClass: makeStringProp("")
  };
  const __default__$b = {
    name: "wd-transition",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$d = /* @__PURE__ */ vue.defineComponent({
    ...__default__$b,
    props: transitionProps,
    emits: ["click", "before-enter", "enter", "before-leave", "leave", "after-leave", "after-enter"],
    setup(__props, { emit: __emit }) {
      const getClassNames = (name) => {
        if (!name) {
          return {
            enter: `${props.enterClass} ${props.enterActiveClass}`,
            "enter-to": `${props.enterToClass} ${props.enterActiveClass}`,
            leave: `${props.leaveClass} ${props.leaveActiveClass}`,
            "leave-to": `${props.leaveToClass} ${props.leaveActiveClass}`
          };
        }
        return {
          enter: `wd-${name}-enter wd-${name}-enter-active`,
          "enter-to": `wd-${name}-enter-to wd-${name}-enter-active`,
          leave: `wd-${name}-leave wd-${name}-leave-active`,
          "leave-to": `wd-${name}-leave-to wd-${name}-leave-active`
        };
      };
      const props = __props;
      const emit = __emit;
      const inited = vue.ref(false);
      const display = vue.ref(false);
      const status = vue.ref("");
      const transitionEnded = vue.ref(false);
      const currentDuration = vue.ref(300);
      const classes = vue.ref("");
      const enterPromise = vue.ref(null);
      const enterLifeCyclePromises = vue.ref(null);
      const leaveLifeCyclePromises = vue.ref(null);
      const style = vue.computed(() => {
        return `-webkit-transition-duration:${currentDuration.value}ms;transition-duration:${currentDuration.value}ms;${display.value ? "" : "display: none;"}${props.customStyle}`;
      });
      const rootClass = vue.computed(() => {
        return `wd-transition ${props.customClass}  ${classes.value}`;
      });
      vue.onBeforeMount(() => {
        if (props.show) {
          enter();
        }
      });
      vue.watch(
        () => props.show,
        (newVal) => {
          handleShow(newVal);
        },
        { deep: true }
      );
      function handleClick() {
        emit("click");
      }
      function handleShow(value) {
        if (value) {
          handleAbortPromise();
          enter();
        } else {
          leave();
        }
      }
      function handleAbortPromise() {
        isPromise(enterPromise.value) && enterPromise.value.abort();
        isPromise(enterLifeCyclePromises.value) && enterLifeCyclePromises.value.abort();
        isPromise(leaveLifeCyclePromises.value) && leaveLifeCyclePromises.value.abort();
        enterPromise.value = null;
        enterLifeCyclePromises.value = null;
        leaveLifeCyclePromises.value = null;
      }
      function enter() {
        enterPromise.value = new AbortablePromise(async (resolve) => {
          try {
            const classNames = getClassNames(props.name);
            const duration = isObj(props.duration) ? props.duration.enter : props.duration;
            status.value = "enter";
            emit("before-enter");
            enterLifeCyclePromises.value = requestAnimationFrame();
            await enterLifeCyclePromises.value;
            emit("enter");
            classes.value = classNames.enter;
            currentDuration.value = duration;
            enterLifeCyclePromises.value = requestAnimationFrame();
            await enterLifeCyclePromises.value;
            inited.value = true;
            display.value = true;
            enterLifeCyclePromises.value = requestAnimationFrame();
            await enterLifeCyclePromises.value;
            enterLifeCyclePromises.value = null;
            transitionEnded.value = false;
            classes.value = classNames["enter-to"];
            resolve();
          } catch (error) {
          }
        });
      }
      async function leave() {
        if (!enterPromise.value) {
          transitionEnded.value = false;
          return onTransitionEnd();
        }
        try {
          await enterPromise.value;
          if (!display.value)
            return;
          const classNames = getClassNames(props.name);
          const duration = isObj(props.duration) ? props.duration.leave : props.duration;
          status.value = "leave";
          emit("before-leave");
          currentDuration.value = duration;
          leaveLifeCyclePromises.value = requestAnimationFrame();
          await leaveLifeCyclePromises.value;
          emit("leave");
          classes.value = classNames.leave;
          leaveLifeCyclePromises.value = requestAnimationFrame();
          await leaveLifeCyclePromises.value;
          transitionEnded.value = false;
          classes.value = classNames["leave-to"];
          leaveLifeCyclePromises.value = setPromise(currentDuration.value);
          await leaveLifeCyclePromises.value;
          leaveLifeCyclePromises.value = null;
          onTransitionEnd();
          enterPromise.value = null;
        } catch (error) {
        }
      }
      function setPromise(duration) {
        return new AbortablePromise((resolve) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            resolve();
          }, duration);
        });
      }
      function onTransitionEnd() {
        if (transitionEnded.value)
          return;
        transitionEnded.value = true;
        if (status.value === "leave") {
          emit("after-leave");
        } else if (status.value === "enter") {
          emit("after-enter");
        }
        if (!props.show && display.value) {
          display.value = false;
        }
      }
      return (_ctx, _cache) => {
        return inited.value ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(rootClass.value),
            style: vue.normalizeStyle(style.value),
            onTransitionend: onTransitionEnd,
            onClick: handleClick
          },
          [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ],
          38
          /* CLASS, STYLE, NEED_HYDRATION */
        )) : vue.createCommentVNode("v-if", true);
      };
    }
  });
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-af59a128"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-transition/wd-transition.vue"]]);
  const overlayProps = {
    ...baseProps,
    /**
     * 是否展示遮罩层
     */
    show: makeBooleanProp(false),
    /**
     * 动画时长，单位毫秒
     */
    duration: {
      type: [Object, Number, Boolean],
      default: 300
    },
    /**
     * 是否锁定滚动
     */
    lockScroll: makeBooleanProp(true),
    /**
     * 层级
     */
    zIndex: makeNumberProp(10)
  };
  const __default__$a = {
    name: "wd-overlay",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
    ...__default__$a,
    props: overlayProps,
    emits: ["click"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      function handleClick() {
        emit("click");
      }
      function noop() {
      }
      return (_ctx, _cache) => {
        const _component_wd_transition = resolveEasycom(vue.resolveDynamicComponent("wd-transition"), __easycom_0$2);
        return vue.openBlock(), vue.createBlock(_component_wd_transition, {
          show: _ctx.show,
          name: "fade",
          "custom-class": "wd-overlay",
          duration: _ctx.duration,
          "custom-style": `z-index: ${_ctx.zIndex}; ${_ctx.customStyle}`,
          onClick: handleClick,
          onTouchmove: _cache[0] || (_cache[0] = vue.withModifiers(($event) => _ctx.lockScroll ? noop : "", ["stop", "prevent"]))
        }, {
          default: vue.withCtx(() => [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ]),
          _: 3
          /* FORWARDED */
        }, 8, ["show", "duration", "custom-style"]);
      };
    }
  });
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-6e0d1141"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-overlay/wd-overlay.vue"]]);
  const popupProps = {
    ...baseProps,
    transition: String,
    /**
     * 关闭按钮
     */
    closable: makeBooleanProp(false),
    /**
     * 弹出框的位置
     */
    position: makeStringProp("center"),
    /**
     * 点击遮罩是否关闭
     */
    closeOnClickModal: makeBooleanProp(true),
    /**
     * 动画持续时间
     */
    duration: {
      type: [Number, Boolean],
      default: 300
    },
    /**
     * 是否显示遮罩
     */
    modal: makeBooleanProp(true),
    /**
     * 设置层级
     */
    zIndex: makeNumberProp(10),
    /**
     * 是否当关闭时将弹出层隐藏（display: none)
     */
    hideWhenClose: makeBooleanProp(true),
    /**
     * 遮罩样式
     */
    modalStyle: makeStringProp(""),
    /**
     * 弹出面板是否设置底部安全距离（iphone X 类型的机型）
     */
    safeAreaInsetBottom: makeBooleanProp(false),
    /**
     * 弹出层是否显示
     */
    modelValue: makeBooleanProp(false),
    /**
     * 弹层内容懒渲染，触发展示时才渲染内容
     */
    lazyRender: makeBooleanProp(true),
    /**
     * 是否锁定滚动
     */
    lockScroll: makeBooleanProp(true)
  };
  const __default__$9 = {
    name: "wd-popup",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    ...__default__$9,
    props: popupProps,
    emits: [
      "update:modelValue",
      "before-enter",
      "enter",
      "before-leave",
      "leave",
      "after-leave",
      "after-enter",
      "click-modal",
      "close"
    ],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const getClassNames = (name2) => {
        if (!name2) {
          return {
            enter: "enter-class enter-active-class",
            "enter-to": "enter-to-class enter-active-class",
            leave: "leave-class leave-active-class",
            "leave-to": "leave-to-class leave-active-class"
          };
        }
        return {
          enter: `wd-${name2}-enter wd-${name2}-enter-active`,
          "enter-to": `wd-${name2}-enter-to wd-${name2}-enter-active`,
          leave: `wd-${name2}-leave wd-${name2}-leave-active`,
          "leave-to": `wd-${name2}-leave-to wd-${name2}-leave-active`
        };
      };
      const inited = vue.ref(false);
      const display = vue.ref(false);
      const status = vue.ref("");
      const transitionEnded = vue.ref(false);
      const currentDuration = vue.ref(300);
      const classes = vue.ref("");
      const safeBottom = vue.ref(0);
      const name = vue.ref("");
      const style = vue.computed(() => {
        return `z-index: ${props.zIndex}; padding-bottom: ${safeBottom.value}px; -webkit-transition-duration: ${currentDuration.value}ms; transition-duration: ${currentDuration.value}ms; ${display.value || !props.hideWhenClose ? "" : "display: none;"} ${props.customStyle}`;
      });
      const rootClass = vue.computed(() => {
        return `wd-popup wd-popup--${props.position} ${props.customClass || ""} ${classes.value || ""}`;
      });
      vue.onBeforeMount(() => {
        observerTransition();
        if (props.safeAreaInsetBottom) {
          const { safeArea, screenHeight, safeAreaInsets } = uni.getSystemInfoSync();
          if (safeArea) {
            safeBottom.value = safeAreaInsets ? safeAreaInsets.bottom : 0;
          } else {
            safeBottom.value = 0;
          }
        }
        if (props.modelValue) {
          enter();
        }
      });
      vue.watch(
        () => props.modelValue,
        (newVal) => {
          observermodelValue(newVal);
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        [() => props.position, () => props.transition],
        () => {
          observerTransition();
        },
        { deep: true, immediate: true }
      );
      function observermodelValue(value) {
        value ? enter() : leave();
      }
      function enter() {
        const classNames = getClassNames(props.transition || props.position);
        const duration = props.transition === "none" ? 0 : isObj(props.duration) ? props.duration.enter : props.duration;
        status.value = "enter";
        emit("before-enter");
        requestAnimationFrame(() => {
          emit("enter");
          classes.value = classNames.enter;
          currentDuration.value = duration;
          requestAnimationFrame(() => {
            inited.value = true;
            display.value = true;
            requestAnimationFrame(() => {
              transitionEnded.value = false;
              classes.value = classNames["enter-to"];
            });
          });
        });
      }
      function leave() {
        if (!display.value)
          return;
        const classNames = getClassNames(props.transition || props.position);
        const duration = props.transition === "none" ? 0 : isObj(props.duration) ? props.duration.leave : props.duration;
        status.value = "leave";
        emit("before-leave");
        requestAnimationFrame(() => {
          emit("leave");
          classes.value = classNames.leave;
          currentDuration.value = duration;
          requestAnimationFrame(() => {
            transitionEnded.value = false;
            const timer = setTimeout(() => {
              onTransitionEnd();
              clearTimeout(timer);
            }, currentDuration.value);
            classes.value = classNames["leave-to"];
          });
        });
      }
      function onTransitionEnd() {
        if (transitionEnded.value)
          return;
        transitionEnded.value = true;
        if (status.value === "leave") {
          emit("after-leave");
        } else if (status.value === "enter") {
          emit("after-enter");
        }
        if (!props.modelValue && display.value) {
          display.value = false;
        }
      }
      function observerTransition() {
        const { transition, position } = props;
        name.value = transition || position;
      }
      function handleClickModal() {
        emit("click-modal");
        if (props.closeOnClickModal) {
          close();
        }
      }
      function close() {
        emit("close");
        emit("update:modelValue", false);
      }
      function noop() {
      }
      return (_ctx, _cache) => {
        const _component_wd_overlay = resolveEasycom(vue.resolveDynamicComponent("wd-overlay"), __easycom_0$1);
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        return vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          [
            _ctx.modal ? (vue.openBlock(), vue.createBlock(_component_wd_overlay, {
              key: 0,
              show: _ctx.modelValue,
              "z-index": _ctx.zIndex,
              "lock-scroll": _ctx.lockScroll,
              duration: _ctx.duration,
              "custom-style": _ctx.modalStyle,
              onClick: handleClickModal,
              onTouchmove: noop
            }, null, 8, ["show", "z-index", "lock-scroll", "duration", "custom-style"])) : vue.createCommentVNode("v-if", true),
            !_ctx.lazyRender || inited.value ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 1,
                class: vue.normalizeClass(rootClass.value),
                style: vue.normalizeStyle(style.value),
                onTransitionend: onTransitionEnd
              },
              [
                vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
                _ctx.closable ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                  key: 0,
                  "custom-class": "wd-popup__close",
                  name: "add",
                  onClick: close
                })) : vue.createCommentVNode("v-if", true)
              ],
              38
              /* CLASS, STYLE, NEED_HYDRATION */
            )) : vue.createCommentVNode("v-if", true)
          ],
          64
          /* STABLE_FRAGMENT */
        );
      };
    }
  });
  const __easycom_2$2 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-25a8a9f7"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-popup/wd-popup.vue"]]);
  function useParent(key) {
    const parent = vue.inject(key, null);
    if (parent) {
      const instance = vue.getCurrentInstance();
      const { link, unlink, internalChildren } = parent;
      link(instance);
      vue.onUnmounted(() => unlink(instance));
      const index = vue.computed(() => internalChildren.indexOf(instance));
      return {
        parent,
        index
      };
    }
    return {
      parent: null,
      index: vue.ref(-1)
    };
  }
  const CELL_GROUP_KEY = Symbol("wd-cell-group");
  function useCell() {
    const { parent: cellGroup, index } = useParent(CELL_GROUP_KEY);
    const border = vue.computed(() => {
      return cellGroup && cellGroup.props.border && index.value;
    });
    return { border };
  }
  const FORM_KEY = Symbol("wd-form");
  const zhCN = {
    calendar: {
      placeholder: "请选择",
      title: "选择日期",
      day: "日",
      week: "周",
      month: "月",
      confirm: "确定",
      startTime: "开始时间",
      endTime: "结束时间",
      to: "至",
      timeFormat: "YY年MM月DD日 HH:mm:ss",
      dateFormat: "YYYY年MM月DD日",
      weekFormat: (year, week) => `${year} 第 ${week} 周`,
      startWeek: "开始周",
      endWeek: "结束周",
      startMonth: "开始月",
      endMonth: "结束月",
      monthFormat: "YYYY年MM月"
    },
    calendarView: {
      startTime: "开始",
      endTime: "结束",
      weeks: {
        sun: "日",
        mon: "一",
        tue: "二",
        wed: "三",
        thu: "四",
        fri: "五",
        sat: "六"
      },
      rangePrompt: (maxRange) => `选择天数不能超过${maxRange}天`,
      rangePromptWeek: (maxRange) => `选择周数不能超过${maxRange}周`,
      rangePromptMonth: (maxRange) => `选择月份不能超过${maxRange}个月`,
      monthTitle: "YYYY年M月",
      yearTitle: "YYYY年",
      month: "M月",
      hour: (value) => `${value}时`,
      minute: (value) => `${value}分`,
      second: (value) => `${value}秒`
    },
    collapse: {
      expand: "展开",
      retract: "收起"
    },
    colPicker: {
      title: "请选择",
      placeholder: "请选择",
      select: "请选择"
    },
    datetimePicker: {
      start: "开始时间",
      end: "结束时间",
      to: "至",
      placeholder: "请选择",
      confirm: "完成",
      cancel: "取消"
    },
    loadmore: {
      loading: "正在努力加载中...",
      finished: "已加载完毕",
      error: "加载失败",
      retry: "点击重试"
    },
    messageBox: {
      inputPlaceholder: "请输入",
      confirm: "确定",
      cancel: "取消",
      inputNoValidate: "输入的数据不合法"
    },
    numberKeyboard: {
      confirm: "完成"
    },
    pagination: {
      prev: "上一页",
      next: "下一页",
      page: (value) => `当前页：${value}`,
      total: (total) => `当前数据：${total}条`,
      size: (size) => `分页大小：${size}`
    },
    picker: {
      cancel: "取消",
      done: "完成",
      placeholder: "请选择"
    },
    imgCropper: {
      confirm: "完成",
      cancel: "取消"
    },
    search: {
      search: "搜索",
      cancel: "取消"
    },
    steps: {
      wait: "未开始",
      finished: "已完成",
      process: "进行中",
      failed: "失败"
    },
    tabs: {
      all: "全部"
    },
    upload: {
      error: "上传失败"
    },
    input: {
      placeholder: "请输入..."
    },
    selectPicker: {
      title: "请选择",
      placeholder: "请选择",
      select: "请选择",
      confirm: "确认",
      filterPlaceholder: "搜索"
    },
    tag: {
      placeholder: "请输入",
      add: "新增标签"
    },
    textarea: {
      placeholder: "请输入..."
    },
    tableCol: {
      indexLabel: "序号"
    }
  };
  const lang = vue.ref("zh-CN");
  const messages = vue.reactive({
    "zh-CN": zhCN
  });
  const Locale = {
    messages() {
      return messages[lang.value];
    },
    use(newLang, newMessage) {
      lang.value = newLang;
      if (newMessage) {
        this.add({ [newLang]: newMessage });
      }
    },
    add(newMessages = {}) {
      deepAssign(messages, newMessages);
    }
  };
  const useTranslate = (name) => {
    const prefix = name ? camelCase(name) + "." : "";
    const translate = (key, ...args) => {
      const currentMessages = Locale.messages();
      const message = getPropByPath(currentMessages, prefix + key);
      return isFunction(message) ? message(...args) : message;
    };
    return { translate };
  };
  const pickerProps = {
    ...baseProps,
    /**
     * label 外部自定义样式
     */
    customLabelClass: makeStringProp(""),
    /**
     * value 外部自定义样式
     */
    customValueClass: makeStringProp(""),
    /**
     * pickerView 外部自定义样式
     */
    customViewClass: makeStringProp(""),
    /**
     * 选择器左侧文案
     */
    label: String,
    /**
     * 选择器占位符
     */
    placeholder: String,
    /**
     * 是否禁用
     */
    disabled: makeBooleanProp(false),
    /**
     * 是否只读
     */
    readonly: makeBooleanProp(false),
    /**
     * 加载中
     */
    loading: makeBooleanProp(false),
    /**
     * 加载中颜色
     */
    loadingColor: makeStringProp("#4D80F0"),
    /* popup */
    /**
     * 弹出层标题
     */
    title: String,
    /**
     * 取消按钮文案
     */
    cancelButtonText: String,
    /**
     * 确认按钮文案
     */
    confirmButtonText: String,
    /**
     * 是否必填
     */
    required: makeBooleanProp(false),
    /**
     * 尺寸
     */
    size: String,
    /**
     * 标签宽度
     */
    labelWidth: String,
    /**
     * 使用默认插槽
     */
    useDefaultSlot: makeBooleanProp(false),
    /**
     * 使用标签插槽
     */
    useLabelSlot: makeBooleanProp(false),
    /**
     * 错误状态
     */
    error: makeBooleanProp(false),
    /**
     * 右对齐
     */
    alignRight: makeBooleanProp(false),
    /**
     * 确定前校验函数，接收 (value, resolve, picker) 参数，通过 resolve 继续执行 picker，resolve 接收1个boolean参数
     */
    beforeConfirm: Function,
    /**
     * 点击蒙层关闭
     */
    closeOnClickModal: makeBooleanProp(true),
    /**
     * 底部安全区域内
     */
    safeAreaInsetBottom: makeBooleanProp(true),
    /**
     * 文本溢出显示省略号
     */
    ellipsis: makeBooleanProp(false),
    /**
     * 选项总高度
     */
    columnsHeight: makeNumberProp(217),
    /**
     * 选项值对应的键名
     */
    valueKey: makeStringProp("value"),
    /**
     * 选项文本对应的键名
     */
    labelKey: makeStringProp("label"),
    /**
     * 选中项，如果为多列选择器，则其类型应为数组
     */
    modelValue: {
      type: [String, Number, Array],
      default: ""
    },
    /**
     * 选择器数据，可以为字符串数组，也可以为对象数组，如果为二维数组，则为多列选择器
     */
    columns: {
      type: Array,
      default: () => []
    },
    /**
     * 接收 pickerView 实例、选中项、当前修改列的下标、resolve 作为入参，根据选中项和列下标进行判断，通过 pickerView 实例暴露出来的 setColumnData 方法修改其他列的数据源。
     */
    columnChange: Function,
    /**
     * 自定义展示文案的格式化函数，返回一个字符串
     */
    displayFormat: Function,
    /**
     * 自定义层级
     */
    zIndex: makeNumberProp(15),
    /**
     * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
     */
    prop: String,
    /**
     * 表单验证规则，结合wd-form组件使用
     */
    rules: makeArrayProp(),
    /**
     * 是否在手指松开时立即触发 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
     */
    immediateChange: makeBooleanProp(false)
  };
  const __default__$8 = {
    name: "wd-picker",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    ...__default__$8,
    props: pickerProps,
    emits: ["confirm", "open", "cancel", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const { translate } = useTranslate("picker");
      const props = __props;
      const emit = __emit;
      const pickerViewWd = vue.ref(null);
      const cell = useCell();
      const innerLoading = vue.ref(false);
      const popupShow = vue.ref(false);
      const showValue = vue.ref("");
      const pickerValue = vue.ref("");
      const displayColumns = vue.ref([]);
      const resetColumns = vue.ref([]);
      const isPicking = vue.ref(false);
      const hasConfirmed = vue.ref(false);
      const isLoading = vue.computed(() => {
        return props.loading || innerLoading.value;
      });
      vue.watch(
        () => props.displayFormat,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue:119", "The type of displayFormat must be Function");
          }
          if (pickerViewWd.value && pickerViewWd.value.getSelectedIndex().length !== 0) {
            handleShowValueUpdate(props.modelValue);
          }
        },
        {
          immediate: true,
          deep: true
        }
      );
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          pickerValue.value = newValue;
          handleShowValueUpdate(newValue);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.columns,
        (newValue) => {
          displayColumns.value = deepClone(newValue);
          resetColumns.value = deepClone(newValue);
          handleShowValueUpdate(props.modelValue);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.columnChange,
        (newValue) => {
          if (newValue && !isFunction(newValue)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue:162", "The type of columnChange must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      const { parent: form } = useParent(FORM_KEY);
      const errorMessage = vue.computed(() => {
        if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
          return form.errorMessages[props.prop];
        } else {
          return "";
        }
      });
      const isRequired = vue.computed(() => {
        let formRequired = false;
        if (form && form.props.rules) {
          const rules = form.props.rules;
          for (const key in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
              formRequired = rules[key].some((rule) => rule.required);
            }
          }
        }
        return props.required || props.rules.some((rule) => rule.required) || formRequired;
      });
      const { proxy } = vue.getCurrentInstance();
      vue.onMounted(() => {
        handleShowValueUpdate(props.modelValue);
      });
      vue.onBeforeMount(() => {
        displayColumns.value = deepClone(props.columns);
        resetColumns.value = deepClone(props.columns);
      });
      function handleShowValueUpdate(value) {
        if (isArray(value) && value.length > 0 || isDef(value) && !isArray(value) && value !== "") {
          if (pickerViewWd.value) {
            vue.nextTick(() => {
              setShowValue(pickerViewWd.value.getSelects());
            });
          } else {
            setShowValue(getSelects(value));
          }
        } else {
          showValue.value = "";
        }
      }
      function getSelects(value) {
        const formatColumns = formatArray(props.columns, props.valueKey, props.labelKey);
        if (props.columns.length === 0)
          return;
        if (value === "" || !isDef(value) || isArray(value) && value.length === 0) {
          return;
        }
        const valueType = getType(value);
        const type = ["string", "number", "boolean", "array"];
        if (type.indexOf(valueType) === -1)
          return [];
        value = isArray(value) ? value : [value];
        value = value.slice(0, formatColumns.length);
        if (value.length === 0) {
          value = formatColumns.map(() => 0);
        }
        let selected = [];
        value.forEach((target, col) => {
          let row = formatColumns[col].findIndex((row2) => {
            return row2[props.valueKey].toString() === target.toString();
          });
          row = row === -1 ? 0 : row;
          selected.push(row);
        });
        const selects = selected.map((row, col) => formatColumns[col][row]);
        if (selects.length === 1) {
          return selects[0];
        }
        return selects;
      }
      function open() {
        showPopup();
      }
      function close() {
        onCancel();
      }
      function showPopup() {
        if (props.disabled || props.readonly)
          return;
        emit("open");
        popupShow.value = true;
        pickerValue.value = props.modelValue;
        displayColumns.value = resetColumns.value;
      }
      function onCancel() {
        popupShow.value = false;
        emit("cancel");
      }
      function onConfirm() {
        if (isLoading.value)
          return;
        if (isPicking.value) {
          hasConfirmed.value = true;
          return;
        }
        const { beforeConfirm } = props;
        if (beforeConfirm && isFunction(beforeConfirm)) {
          beforeConfirm(
            pickerValue.value,
            (isPass) => {
              isPass && handleConfirm();
            },
            proxy.$.exposed
          );
        } else {
          handleConfirm();
        }
      }
      function handleConfirm() {
        if (isLoading.value || props.disabled) {
          popupShow.value = false;
          return;
        }
        const selects = pickerViewWd.value.getSelects();
        const values = pickerViewWd.value.getValues();
        const columns = pickerViewWd.value.getColumnsData();
        popupShow.value = false;
        resetColumns.value = deepClone(columns);
        emit("update:modelValue", values);
        setShowValue(selects);
        emit("confirm", {
          value: values,
          selectedItems: selects
        });
      }
      function pickerViewChange({ value }) {
        pickerValue.value = value;
      }
      function setShowValue(items) {
        if (isArray(items) && !items.length || !items)
          return;
        const { valueKey, labelKey } = props;
        showValue.value = (props.displayFormat || defaultDisplayFormat)(items, { valueKey, labelKey });
      }
      function noop() {
      }
      function onPickStart() {
        isPicking.value = true;
      }
      function onPickEnd() {
        isPicking.value = false;
        if (hasConfirmed.value) {
          hasConfirmed.value = false;
          onConfirm();
        }
      }
      function setLoading(loading) {
        innerLoading.value = loading;
      }
      __expose({
        close,
        open,
        setLoading
      });
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        const _component_wd_picker_view = resolveEasycom(vue.resolveDynamicComponent("wd-picker-view"), __easycom_1$2);
        const _component_wd_popup = resolveEasycom(vue.resolveDynamicComponent("wd-popup"), __easycom_2$2);
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-picker ${_ctx.disabled ? "is-disabled" : ""} ${_ctx.size ? "is-" + _ctx.size : ""}  ${vue.unref(cell).border.value ? "is-border" : ""} ${_ctx.alignRight ? "is-align-right" : ""} ${_ctx.error ? "is-error" : ""} ${_ctx.customClass}`),
            style: vue.normalizeStyle(_ctx.customStyle)
          },
          [
            vue.createElementVNode("view", {
              class: "wd-picker__field",
              onClick: showPopup
            }, [
              _ctx.useDefaultSlot ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "wd-picker__cell"
              }, [
                _ctx.label || _ctx.useLabelSlot ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: vue.normalizeClass(`wd-picker__label ${_ctx.customLabelClass}  ${isRequired.value ? "is-required" : ""}`),
                    style: vue.normalizeStyle(_ctx.labelWidth ? "min-width:" + _ctx.labelWidth + ";max-width:" + _ctx.labelWidth + ";" : "")
                  },
                  [
                    _ctx.label ? (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      { key: 0 },
                      [
                        vue.createTextVNode(
                          vue.toDisplayString(_ctx.label),
                          1
                          /* TEXT */
                        )
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : vue.renderSlot(_ctx.$slots, "label", { key: 1 }, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", { class: "wd-picker__body" }, [
                  vue.createElementVNode("view", { class: "wd-picker__value-wraper" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(`wd-picker__value ${_ctx.ellipsis && "is-ellipsis"} ${_ctx.customValueClass} ${showValue.value ? "" : "wd-picker__placeholder"}`)
                      },
                      vue.toDisplayString(showValue.value ? showValue.value : _ctx.placeholder || vue.unref(translate)("placeholder")),
                      3
                      /* TEXT, CLASS */
                    ),
                    !_ctx.disabled && !_ctx.readonly ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                      key: 0,
                      "custom-class": "wd-picker__arrow",
                      name: "arrow-right"
                    })) : vue.createCommentVNode("v-if", true)
                  ]),
                  errorMessage.value ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "wd-picker__error-message"
                    },
                    vue.toDisplayString(errorMessage.value),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ])
              ]))
            ]),
            vue.createVNode(_component_wd_popup, {
              modelValue: popupShow.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => popupShow.value = $event),
              position: "bottom",
              "hide-when-close": false,
              "close-on-click-modal": _ctx.closeOnClickModal,
              "z-index": _ctx.zIndex,
              "safe-area-inset-bottom": _ctx.safeAreaInsetBottom,
              onClose: onCancel,
              "custom-class": "wd-picker__popup"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("view", { class: "wd-picker__wraper" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "wd-picker__toolbar",
                      onTouchmove: noop
                    },
                    [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "wd-picker__action wd-picker__action--cancel",
                          onClick: onCancel
                        },
                        vue.toDisplayString(_ctx.cancelButtonText || vue.unref(translate)("cancel")),
                        1
                        /* TEXT */
                      ),
                      _ctx.title ? (vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: 0,
                          class: "wd-picker__title"
                        },
                        vue.toDisplayString(_ctx.title),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(`wd-picker__action ${isLoading.value ? "is-loading" : ""}`),
                          onClick: onConfirm
                        },
                        vue.toDisplayString(_ctx.confirmButtonText || vue.unref(translate)("done")),
                        3
                        /* TEXT, CLASS */
                      )
                    ],
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createVNode(_component_wd_picker_view, {
                    ref_key: "pickerViewWd",
                    ref: pickerViewWd,
                    "custom-class": _ctx.customViewClass,
                    modelValue: pickerValue.value,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => pickerValue.value = $event),
                    columns: displayColumns.value,
                    loading: isLoading.value,
                    "loading-color": _ctx.loadingColor,
                    "columns-height": _ctx.columnsHeight,
                    "value-key": _ctx.valueKey,
                    "label-key": _ctx.labelKey,
                    "immediate-change": _ctx.immediateChange,
                    onChange: pickerViewChange,
                    onPickstart: onPickStart,
                    onPickend: onPickEnd,
                    "column-change": _ctx.columnChange
                  }, null, 8, ["custom-class", "modelValue", "columns", "loading", "loading-color", "columns-height", "value-key", "label-key", "immediate-change", "column-change"])
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["modelValue", "close-on-click-modal", "z-index", "safe-area-inset-bottom"])
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-e228acd5"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue"]]);
  const searchProps = {
    ...baseProps,
    /**
     * 输入框内容，双向绑定
     * 类型: string
     * 默认值: ''
     */
    modelValue: makeStringProp(""),
    /**
     * 是否使用输入框右侧插槽
     * 类型: boolean
     * 默认值: false
     * @deprecated 该属性已废弃，将在下一个minor版本被移除，直接使用插槽即可
     */
    useSuffixSlot: makeBooleanProp(false),
    /**
     * 搜索框占位文本
     * 类型: string
     */
    placeholder: String,
    /**
     * 搜索框右侧文本
     * 类型: string
     */
    cancelTxt: String,
    /**
     * 搜索框亮色（白色）
     * 类型: boolean
     * 默认值: false
     */
    light: makeBooleanProp(false),
    /**
     * 是否隐藏右侧文本
     * 类型: boolean
     * 默认值: false
     */
    hideCancel: makeBooleanProp(false),
    /**
     * 是否禁用搜索框
     * 类型: boolean
     * 默认值: false
     */
    disabled: makeBooleanProp(false),
    /**
     * 原生属性，设置最大长度。-1 表示无限制
     * 类型: string / number
     * 默认值: -1
     */
    maxlength: makeNumericProp(-1),
    /**
     * placeholder 居左边
     * 类型: boolean
     * 默认值: false
     */
    placeholderLeft: makeBooleanProp(false),
    /**
     * 是否自动聚焦
     * 类型: boolean
     * 默认值: false
     * 最低版本: 0.1.63
     */
    focus: makeBooleanProp(false),
    /**
     * 是否在点击清除按钮时聚焦输入框
     * 类型: boolean
     * 默认值: false
     * 最低版本: 0.1.63
     */
    focusWhenClear: makeBooleanProp(false)
  };
  const __default__$7 = {
    name: "wd-search",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$7,
    props: searchProps,
    emits: ["update:modelValue", "change", "clear", "search", "focus", "blur", "cancel"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { translate } = useTranslate("search");
      const isFocused = vue.ref(false);
      const showInput = vue.ref(false);
      const str = vue.ref("");
      const showPlaceHolder = vue.ref(true);
      const clearing = vue.ref(false);
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          str.value = newValue;
          if (newValue) {
            showInput.value = true;
          }
        },
        { immediate: true }
      );
      vue.watch(
        () => props.focus,
        (newValue) => {
          if (newValue) {
            if (props.disabled)
              return;
            closeCover();
          }
        }
      );
      vue.onMounted(() => {
        if (props.focus) {
          closeCover();
        }
      });
      const rootClass = vue.computed(() => {
        return `wd-search  ${props.light ? "is-light" : ""}  ${props.hideCancel ? "is-without-cancel" : ""} ${props.customClass}`;
      });
      const coverStyle = vue.computed(() => {
        const coverStyle2 = {
          display: str.value === "" && showPlaceHolder.value ? "flex" : "none"
        };
        return objToStyle(coverStyle2);
      });
      function hackFocus(focus) {
        showInput.value = focus;
        requestAnimationFrame(() => {
          isFocused.value = focus;
        });
      }
      function closeCover() {
        if (props.disabled)
          return;
        requestAnimationFrame().then(() => requestAnimationFrame()).then(() => requestAnimationFrame()).then(() => {
          showPlaceHolder.value = false;
          hackFocus(true);
        });
      }
      function inputValue(event) {
        str.value = event.detail.value;
        emit("update:modelValue", event.detail.value);
        emit("change", {
          value: event.detail.value
        });
      }
      function clearSearch() {
        str.value = "";
        clearing.value = true;
        if (props.focusWhenClear) {
          isFocused.value = false;
        }
        requestAnimationFrame().then(() => requestAnimationFrame()).then(() => requestAnimationFrame()).then(() => {
          if (props.focusWhenClear) {
            showPlaceHolder.value = false;
            hackFocus(true);
          } else {
            showPlaceHolder.value = true;
            hackFocus(false);
          }
          emit("change", {
            value: ""
          });
          emit("update:modelValue", "");
          emit("clear");
        });
      }
      function search({ detail: { value } }) {
        emit("search", {
          value
        });
      }
      function searchFocus() {
        if (clearing.value) {
          clearing.value = false;
          return;
        }
        showPlaceHolder.value = false;
        emit("focus", {
          value: str.value
        });
      }
      function searchBlur() {
        if (clearing.value)
          return;
        showPlaceHolder.value = !str.value;
        showInput.value = !showPlaceHolder.value;
        isFocused.value = false;
        emit("blur", {
          value: str.value
        });
      }
      function handleCancel() {
        emit("cancel", {
          value: str.value
        });
      }
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(rootClass.value),
            style: vue.normalizeStyle(_ctx.customStyle)
          },
          [
            vue.createCommentVNode("自定义label插槽"),
            vue.createCommentVNode("搜索框主体"),
            vue.createElementVNode("view", { class: "wd-search__block" }, [
              vue.renderSlot(_ctx.$slots, "prefix", {}, void 0, true),
              vue.createElementVNode("view", { class: "wd-search__field" }, [
                !_ctx.placeholderLeft ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    style: vue.normalizeStyle(coverStyle.value),
                    class: "wd-search__cover",
                    onClick: closeCover
                  },
                  [
                    vue.createVNode(_component_wd_icon, {
                      name: "search",
                      size: "18px",
                      "custom-class": "wd-search__search-icon"
                    }),
                    vue.createElementVNode(
                      "text",
                      { class: "wd-search__placeholder-txt" },
                      vue.toDisplayString(_ctx.placeholder || vue.unref(translate)("search")),
                      1
                      /* TEXT */
                    )
                  ],
                  4
                  /* STYLE */
                )) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode("icon:search"),
                showInput.value || str.value || _ctx.placeholderLeft ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                  key: 1,
                  name: "search",
                  size: "18px",
                  "custom-class": "wd-search__search-left-icon"
                })) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode("搜索框"),
                showInput.value || str.value || _ctx.placeholderLeft ? vue.withDirectives((vue.openBlock(), vue.createElementBlock("input", {
                  key: 2,
                  placeholder: _ctx.placeholder || vue.unref(translate)("search"),
                  "placeholder-class": "wd-search__placeholder-txt",
                  "confirm-type": "search",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => str.value = $event),
                  class: "wd-search__input",
                  onFocus: searchFocus,
                  onInput: inputValue,
                  onBlur: searchBlur,
                  onConfirm: search,
                  disabled: _ctx.disabled,
                  maxlength: _ctx.maxlength,
                  focus: isFocused.value
                }, null, 40, ["placeholder", "disabled", "maxlength", "focus"])), [
                  [vue.vModelText, str.value]
                ]) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode("icon:clear"),
                str.value ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                  key: 3,
                  "custom-class": "wd-search__clear wd-search__clear-icon",
                  name: "error-fill",
                  size: "16px",
                  onClick: clearSearch
                })) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createCommentVNode("the button behind input,care for hideCancel without displaying"),
            !_ctx.hideCancel ? vue.renderSlot(_ctx.$slots, "suffix", { key: 0 }, () => [
              vue.createCommentVNode("默认button"),
              vue.createElementVNode(
                "view",
                {
                  class: "wd-search__cancel",
                  onClick: handleCancel
                },
                vue.toDisplayString(_ctx.cancelTxt || vue.unref(translate)("cancel")),
                1
                /* TEXT */
              )
            ], true) : vue.createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-cc0202be"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-search/wd-search.vue"]]);
  const CHECKBOX_GROUP_KEY = Symbol("wd-checkbox-group");
  const checkboxGroupProps = {
    ...baseProps,
    /**
     * 绑定值
     */
    modelValue: {
      type: Array,
      default: () => []
    },
    /**
     * 表单模式
     */
    cell: makeBooleanProp(false),
    /**
     * 单选框形状，可选值：circle / square / button
     */
    shape: makeStringProp("circle"),
    /**
     * 选中的颜色
     */
    checkedColor: String,
    /**
     * 禁用
     */
    disabled: makeBooleanProp(false),
    /**
     * 最小选中的数量
     */
    min: makeNumberProp(0),
    /**
     * 最大选中的数量，0 为无限数量，默认为 0
     */
    max: makeNumberProp(0),
    /**
     * 同行展示
     */
    inline: makeBooleanProp(false),
    /**
     * 设置大小，可选值：large
     */
    size: String
  };
  const checkboxProps = {
    ...baseProps,
    customLabelClass: makeStringProp(""),
    customShapeClass: makeStringProp(""),
    /**
     * 单选框选中时的值
     */
    modelValue: {
      type: [String, Number, Boolean],
      required: true,
      default: false
    },
    /**
     * 单选框形状，可选值：circle / square / button
     */
    shape: makeStringProp("circle"),
    /**
     * 选中的颜色
     */
    checkedColor: String,
    /**
     * 禁用
     */
    disabled: {
      type: [Boolean, null],
      default: null
    },
    /**
     * 选中值，在 checkbox-group 中使用无效，需同 false-value 一块使用
     */
    trueValue: {
      type: [String, Number, Boolean],
      default: true
    },
    /**
     * 非选中时的值，在 checkbox-group 中使用无效，需同 true-value 一块使用
     */
    falseValue: {
      type: [String, Number, Boolean],
      default: false
    },
    /**
     * 设置大小，可选值：large
     */
    size: String,
    /**
     * 文字位置最大宽度
     */
    maxWidth: String
  };
  const __default__$6 = {
    name: "wd-checkbox",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$6,
    props: checkboxProps,
    emits: ["change", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emit = __emit;
      __expose({
        toggle
      });
      const { parent: checkboxGroup, index } = useParent(CHECKBOX_GROUP_KEY);
      const isChecked = vue.computed(() => {
        if (checkboxGroup) {
          return checkboxGroup.props.modelValue.indexOf(props.modelValue) > -1;
        } else {
          return props.modelValue === props.trueValue;
        }
      });
      const isFirst = vue.computed(() => {
        return index.value === 0;
      });
      const isLast = vue.computed(() => {
        const children = isDef(checkboxGroup) ? checkboxGroup.children : [];
        return index.value === children.length - 1;
      });
      const { proxy } = vue.getCurrentInstance();
      vue.watch(
        () => props.modelValue,
        () => {
          if (checkboxGroup) {
            checkName();
          }
        }
      );
      vue.watch(
        () => props.shape,
        (newValue) => {
          const type = ["circle", "square", "button"];
          if (type.indexOf(newValue) === -1)
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox/wd-checkbox.vue:93", `shape must be one of ${type.toString()}`);
        }
      );
      const innerShape = vue.computed(() => {
        if (!props.shape && checkboxGroup && checkboxGroup.props.shape) {
          return checkboxGroup.props.shape;
        } else {
          return props.shape;
        }
      });
      const innerCheckedColor = vue.computed(() => {
        if (!props.checkedColor && checkboxGroup && checkboxGroup.props.checkedColor) {
          return checkboxGroup.props.checkedColor;
        } else {
          return props.checkedColor;
        }
      });
      const innerDisabled = vue.computed(() => {
        let innerDisabled2 = props.disabled;
        if (checkboxGroup) {
          if (
            // max 生效时，group 已经选满，禁止其它节点再选中。
            checkboxGroup.props.max && checkboxGroup.props.modelValue.length >= checkboxGroup.props.max && !isChecked.value || // min 生效时，group 选中的节点数量仅满足最小值，禁止取消已选中的节点。
            checkboxGroup.props.min && checkboxGroup.props.modelValue.length <= checkboxGroup.props.min && isChecked.value || // 只要子节点自己要求 disabled，那就 disabled。
            props.disabled === true || // 父节点要求全局 disabled，子节点没吱声，那就 disabled。
            checkboxGroup.props.disabled && props.disabled === null
          ) {
            innerDisabled2 = true;
          }
        }
        return innerDisabled2;
      });
      const innerInline = vue.computed(() => {
        if (checkboxGroup && checkboxGroup.props.inline) {
          return checkboxGroup.props.inline;
        } else {
          return false;
        }
      });
      const innerCell = vue.computed(() => {
        if (checkboxGroup && checkboxGroup.props.cell) {
          return checkboxGroup.props.cell;
        } else {
          return false;
        }
      });
      const innerSize = vue.computed(() => {
        if (!props.size && checkboxGroup && checkboxGroup.props.size) {
          return checkboxGroup.props.size;
        } else {
          return props.size;
        }
      });
      vue.onBeforeMount(() => {
        if (props.modelValue === null)
          formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox/wd-checkbox.vue:158", "checkbox's value must be set");
      });
      function checkName() {
        checkboxGroup && checkboxGroup.children && checkboxGroup.children.forEach((child) => {
          if (child.$.uid !== proxy.$.uid && child.modelValue === props.modelValue) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox/wd-checkbox.vue:171", `The checkbox's bound value: ${props.modelValue} has been used`);
          }
        });
      }
      function toggle() {
        if (innerDisabled.value)
          return;
        if (checkboxGroup) {
          emit("change", {
            value: !isChecked.value
          });
          checkboxGroup.changeSelectState(props.modelValue);
        } else {
          const newVal = props.modelValue === props.trueValue ? props.falseValue : props.trueValue;
          emit("update:modelValue", newVal);
          emit("change", {
            value: newVal
          });
        }
      }
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-checkbox ${innerCell.value ? "is-cell-box" : ""} ${innerShape.value === "button" ? "is-button-box" : ""} ${isChecked.value ? "is-checked" : ""} ${isFirst.value ? "is-first-child" : ""} ${isLast.value ? "is-last-child" : ""} ${innerInline.value ? "is-inline" : ""} ${innerShape.value === "button" ? "is-button" : ""} ${innerDisabled.value ? "is-disabled" : ""} ${innerSize.value ? "is-" + innerSize.value : ""} ${_ctx.customClass}`),
            style: vue.normalizeStyle(_ctx.customStyle),
            onClick: toggle
          },
          [
            vue.createCommentVNode("shape为button时，移除wd-checkbox__shape，只保留wd-checkbox__label"),
            innerShape.value !== "button" ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: vue.normalizeClass(`wd-checkbox__shape ${innerShape.value === "square" ? "is-square" : ""} ${_ctx.customShapeClass}`),
                style: vue.normalizeStyle(isChecked.value && !innerDisabled.value && innerCheckedColor.value ? "color :" + innerCheckedColor.value : "")
              },
              [
                vue.createVNode(_component_wd_icon, {
                  "custom-class": "wd-checkbox__check",
                  name: "check-bold",
                  size: "14px"
                })
              ],
              6
              /* CLASS, STYLE */
            )) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode("shape为button时只保留wd-checkbox__label"),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(`wd-checkbox__label ${_ctx.customLabelClass}`),
                style: vue.normalizeStyle(isChecked.value && innerShape.value === "button" && !innerDisabled.value && innerCheckedColor.value ? "color:" + innerCheckedColor.value : "")
              },
              [
                vue.createCommentVNode("button选中时展示的icon"),
                innerShape.value === "button" && isChecked.value ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                  key: 0,
                  "custom-class": "wd-checkbox__btn-check",
                  name: "check-bold",
                  size: "14px"
                })) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode("文案"),
                vue.createElementVNode(
                  "view",
                  {
                    class: "wd-checkbox__txt",
                    style: vue.normalizeStyle(_ctx.maxWidth ? "max-width:" + _ctx.maxWidth : "")
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  4
                  /* STYLE */
                )
              ],
              6
              /* CLASS, STYLE */
            )
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_2$1 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-66fc790e"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-checkbox/wd-checkbox.vue"]]);
  function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
  }
  function flattenVNodes(children) {
    const result = [];
    const traverse = (children2) => {
      if (Array.isArray(children2)) {
        children2.forEach((child) => {
          var _a;
          if (isVNode(child)) {
            result.push(child);
            if ((_a = child.component) == null ? void 0 : _a.subTree) {
              result.push(child.component.subTree);
              traverse(child.component.subTree.children);
            }
            if (child.children) {
              traverse(child.children);
            }
          }
        });
      }
    };
    traverse(children);
    return result;
  }
  const findVNodeIndex = (vnodes, vnode) => {
    const index = vnodes.indexOf(vnode);
    if (index === -1) {
      return vnodes.findIndex((item) => vnode.key !== void 0 && vnode.key !== null && item.type === vnode.type && item.key === vnode.key);
    }
    return index;
  };
  function sortChildren(parent, publicChildren, internalChildren) {
    const vnodes = parent && parent.subTree && parent.subTree.children ? flattenVNodes(parent.subTree.children) : [];
    internalChildren.sort((a, b) => findVNodeIndex(vnodes, a.vnode) - findVNodeIndex(vnodes, b.vnode));
    const orderedPublicChildren = internalChildren.map((item) => item.proxy);
    publicChildren.sort((a, b) => {
      const indexA = orderedPublicChildren.indexOf(a);
      const indexB = orderedPublicChildren.indexOf(b);
      return indexA - indexB;
    });
  }
  function useChildren(key) {
    const publicChildren = vue.reactive([]);
    const internalChildren = vue.reactive([]);
    const parent = vue.getCurrentInstance();
    const linkChildren = (value) => {
      const link = (child) => {
        if (child.proxy) {
          internalChildren.push(child);
          publicChildren.push(child.proxy);
          sortChildren(parent, publicChildren, internalChildren);
        }
      };
      const unlink = (child) => {
        const index = internalChildren.indexOf(child);
        publicChildren.splice(index, 1);
        internalChildren.splice(index, 1);
      };
      vue.provide(
        key,
        Object.assign(
          {
            link,
            unlink,
            children: publicChildren,
            internalChildren
          },
          value
        )
      );
    };
    return {
      children: publicChildren,
      linkChildren
    };
  }
  const __default__$5 = {
    name: "wd-checkbox-group",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$5,
    props: checkboxGroupProps,
    emits: ["change", "update:modelValue"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { linkChildren } = useChildren(CHECKBOX_GROUP_KEY);
      linkChildren({ props, changeSelectState });
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          if (new Set(newValue).size !== newValue.length) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox-group/wd-checkbox-group.vue:36", "checkboxGroup's bound value includes same value");
          }
          if (newValue.length < props.min) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox-group/wd-checkbox-group.vue:40", "checkboxGroup's bound value's length can't be less than min");
          }
          if (props.max !== 0 && newValue.length > props.max) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox-group/wd-checkbox-group.vue:44", "checkboxGroup's bound value's length can't be large than max");
          }
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.shape,
        (newValue) => {
          const type = ["circle", "square", "button"];
          if (type.indexOf(newValue) === -1)
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-checkbox-group/wd-checkbox-group.vue:55", `shape must be one of ${type.toString()}`);
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.min,
        (newValue) => {
          checkNumRange(newValue, "min");
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.max,
        (newValue) => {
          checkNumRange(newValue, "max");
        },
        { deep: true, immediate: true }
      );
      function changeSelectState(value) {
        const temp = deepClone(props.modelValue);
        const index = temp.indexOf(value);
        if (index > -1) {
          temp.splice(index, 1);
        } else {
          temp.push(value);
        }
        emit("update:modelValue", temp);
        emit("change", {
          value: temp
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-checkbox-group ${_ctx.shape === "button" && _ctx.cell ? "is-button" : ""} ${_ctx.customClass}`),
            style: vue.normalizeStyle(_ctx.customStyle)
          },
          [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-395de5f2"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-checkbox-group/wd-checkbox-group.vue"]]);
  const RADIO_GROUP_KEY = Symbol("wd-radio-group");
  const radioGroupProps = {
    ...baseProps,
    /** 会自动选中value对应的单选框 */
    modelValue: [String, Number, Boolean],
    /** 单选框形状，可选值为 dot / button / check，默认为 check */
    shape: makeStringProp("check"),
    /** 选中的颜色，默认为 #4D80F0 */
    checkedColor: String,
    /** 是否禁用，默认为 false */
    disabled: makeBooleanProp(false),
    /** 表单模式，默认为 false */
    cell: makeBooleanProp(false),
    /** 设置大小，默认为空 */
    size: makeStringProp(""),
    /** 同行展示，默认为 false */
    inline: makeBooleanProp(false)
  };
  const radioProps = {
    ...baseProps,
    /** 选中时的值 */
    value: makeRequiredProp([String, Number, Boolean]),
    /** 单选框的形状 */
    shape: String,
    /** 选中的颜色 */
    checkedColor: String,
    /** 禁用 */
    disabled: {
      type: [Boolean, null],
      default: null
    },
    /** 单元格 */
    cell: {
      type: [Boolean, null],
      default: null
    },
    /** 大小 */
    size: String,
    /** 内联 */
    inline: {
      type: [Boolean, null],
      default: null
    },
    /** 最大宽度 */
    maxWidth: String
  };
  const __default__$4 = {
    name: "wd-radio",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$4,
    props: radioProps,
    setup(__props) {
      const props = __props;
      const { parent: radioGroup } = useParent(RADIO_GROUP_KEY);
      const isChecked = vue.computed(() => {
        if (radioGroup) {
          return props.value === radioGroup.props.modelValue;
        } else {
          return false;
        }
      });
      const innerShape = vue.computed(() => {
        if (!props.shape && radioGroup && radioGroup.props.shape) {
          return radioGroup.props.shape;
        } else {
          return props.shape;
        }
      });
      const innerCheckedColor = vue.computed(() => {
        if (!props.checkedColor && radioGroup && radioGroup.props.checkedColor) {
          return radioGroup.props.checkedColor;
        } else {
          return props.checkedColor;
        }
      });
      const innerDisabled = vue.computed(() => {
        if ((props.disabled === null || props.disabled === void 0) && radioGroup && radioGroup.props.disabled) {
          return radioGroup.props.disabled;
        } else {
          return props.disabled;
        }
      });
      const innerInline = vue.computed(() => {
        if ((props.inline === null || props.inline === void 0) && radioGroup && radioGroup.props.inline) {
          return radioGroup.props.inline;
        } else {
          return props.inline;
        }
      });
      const innerSize = vue.computed(() => {
        if (!props.size && radioGroup && radioGroup.props.size) {
          return radioGroup.props.size;
        } else {
          return props.size;
        }
      });
      const innerCell = vue.computed(() => {
        if ((props.cell === null || props.cell === void 0) && radioGroup && radioGroup.props.cell) {
          return radioGroup.props.cell;
        } else {
          return props.cell;
        }
      });
      vue.watch(
        () => props.shape,
        (newValue) => {
          const type = ["check", "dot", "button"];
          if (!newValue || type.indexOf(newValue) === -1)
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-radio/wd-radio.vue:104", `shape must be one of ${type.toString()}`);
        }
      );
      function handleClick() {
        const { value } = props;
        if (!innerDisabled.value && radioGroup && value !== null && value !== void 0) {
          radioGroup.updateValue(value);
        }
      }
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-radio ${innerCell.value ? "is-cell-radio" : ""} ${innerCell.value && innerShape.value == "button" ? "is-button-radio" : ""} ${innerSize.value ? "is-" + innerSize.value : ""} ${innerInline.value ? "is-inline" : ""} ${isChecked.value ? "is-checked" : ""} ${innerShape.value !== "check" ? "is-" + innerShape.value : ""} ${innerDisabled.value ? "is-disabled" : ""} ${_ctx.customClass}`),
            style: vue.normalizeStyle(_ctx.customStyle),
            onClick: handleClick
          },
          [
            vue.createElementVNode(
              "view",
              {
                class: "wd-radio__label",
                style: vue.normalizeStyle(`${_ctx.maxWidth ? "max-width:" + _ctx.maxWidth : ""};  ${isChecked.value && innerShape.value === "button" && !innerDisabled.value ? "color :" + innerCheckedColor.value : ""}`)
              },
              [
                vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ],
              4
              /* STYLE */
            ),
            vue.createElementVNode(
              "view",
              {
                class: "wd-radio__shape",
                style: vue.normalizeStyle(isChecked.value && !_ctx.disabled ? "color: " + innerCheckedColor.value : "")
              },
              [
                innerShape.value === "check" ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                  key: 0,
                  style: vue.normalizeStyle(isChecked.value && !_ctx.disabled ? "color: " + innerCheckedColor.value : ""),
                  name: "check"
                }, null, 8, ["style"])) : vue.createCommentVNode("v-if", true)
              ],
              4
              /* STYLE */
            )
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-a54631cc"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-radio/wd-radio.vue"]]);
  const __default__$3 = {
    name: "wd-radio-group",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$3,
    props: radioGroupProps,
    emits: ["change", "update:modelValue"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { linkChildren, children } = useChildren(RADIO_GROUP_KEY);
      linkChildren({ props, updateValue });
      vue.watch(
        () => props.shape,
        (newValue) => {
          const type = ["check", "dot", "button"];
          if (type.indexOf(newValue) === -1)
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-radio-group/wd-radio-group.vue:34", `shape must be one of ${type.toString()}`);
        },
        { deep: true, immediate: true }
      );
      function updateValue(value) {
        emit("update:modelValue", value);
        emit("change", {
          value
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-radio-group  ${_ctx.customClass} ${_ctx.cell && _ctx.shape === "button" ? "is-button" : ""}`),
            style: vue.normalizeStyle(_ctx.customStyle)
          },
          [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_5 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-1a9e9b05"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-radio-group/wd-radio-group.vue"]]);
  const buttonProps = {
    ...baseProps,
    /**
     * 幽灵按钮
     */
    plain: makeBooleanProp(false),
    /**
     * 圆角按钮
     */
    round: makeBooleanProp(true),
    /**
     * 禁用按钮
     */
    disabled: makeBooleanProp(false),
    /**
     * 是否细边框
     */
    hairline: makeBooleanProp(false),
    /**
     * 块状按钮
     */
    block: makeBooleanProp(false),
    /**
     * 按钮类型，可选值：primary / success / info / warning / error / text / icon
     */
    type: makeStringProp("primary"),
    /**
     * 按钮尺寸，可选值：small / medium / large
     */
    size: makeStringProp("medium"),
    /**
     * 图标类名
     */
    icon: String,
    /**
     * 类名前缀，用于使用自定义图标，用法参考Icon组件
     */
    classPrefix: makeStringProp("wd-icon"),
    /**
     * 加载中按钮
     */
    loading: makeBooleanProp(false),
    /**
     * 加载图标颜色
     */
    loadingColor: String,
    /**
     * 开放能力
     */
    openType: String,
    formType: String,
    /**
     * 指定是否阻止本节点的祖先节点出现点击态
     */
    hoverStopPropagation: Boolean,
    /**
     * 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文
     */
    lang: String,
    /**
     * 会话来源，open-type="contact"时有效
     */
    sessionFrom: String,
    /**
     * 会话内消息卡片标题，open-type="contact"时有效
     */
    sendMessageTitle: String,
    /**
     * 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效
     */
    sendMessagePath: String,
    /**
     * 会话内消息卡片图片，open-type="contact"时有效
     */
    sendMessageImg: String,
    /**
     * 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效
     */
    appParameter: String,
    /**
     * 是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话会在右下角显示"可能要发送的小程序"提示，用户点击后可以快速发送小程序消息，open-type="contact"时有效
     */
    showMessageCard: Boolean
  };
  const __default__$2 = {
    name: "wd-button",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$2,
    props: buttonProps,
    emits: [
      "click",
      "getuserinfo",
      "contact",
      "getphonenumber",
      "error",
      "launchapp",
      "opensetting",
      "chooseavatar",
      "agreeprivacyauthorization"
    ],
    setup(__props, { emit: __emit }) {
      const loadingIcon = (color = "#4D80F0", reverse = true) => {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42"><defs><linearGradient x1="100%" y1="0%" x2="0%" y2="0%" id="a"><stop stop-color="${reverse ? color : "#fff"}" offset="0%" stop-opacity="0"/><stop stop-color="${reverse ? color : "#fff"}" offset="100%"/></linearGradient></defs><g fill="none" fill-rule="evenodd"><path d="M21 1c11.046 0 20 8.954 20 20s-8.954 20-20 20S1 32.046 1 21 9.954 1 21 1zm0 7C13.82 8 8 13.82 8 21s5.82 13 13 13 13-5.82 13-13S28.18 8 21 8z" fill="${reverse ? "#fff" : color}"/><path d="M4.599 21c0 9.044 7.332 16.376 16.376 16.376 9.045 0 16.376-7.332 16.376-16.376" stroke="url(#a)" stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
      };
      const props = __props;
      const emit = __emit;
      const hoverStartTime = vue.ref(20);
      const hoverStayTime = vue.ref(70);
      const loadingIconSvg = vue.ref("");
      const loadingStyle = vue.computed(() => {
        return `background-image: url(${loadingIconSvg.value});`;
      });
      vue.watch(
        () => props.loading,
        () => {
          buildLoadingSvg();
        },
        { deep: true, immediate: true }
      );
      function handleClick(event) {
        if (!props.disabled && !props.loading) {
          emit("click", event);
        }
      }
      function handleGetuserinfo(event) {
        emit("getuserinfo", event.detail);
      }
      function handleConcat(event) {
        emit("contact", event.detail);
      }
      function handleGetphonenumber(event) {
        emit("getphonenumber", event.detail);
      }
      function handleError(event) {
        emit("error", event.detail);
      }
      function handleLaunchapp(event) {
        emit("launchapp", event.detail);
      }
      function handleOpensetting(event) {
        emit("opensetting", event.detail);
      }
      function handleChooseavatar(event) {
        emit("chooseavatar", event.detail);
      }
      function handleAgreePrivacyAuthorization(event) {
        emit("agreeprivacyauthorization", event.detail);
      }
      function buildLoadingSvg() {
        const { loadingColor, type, plain } = props;
        let color = loadingColor;
        if (!color) {
          switch (type) {
            case "primary":
              color = "#4D80F0";
              break;
            case "success":
              color = "#34d19d";
              break;
            case "info":
              color = "#333";
              break;
            case "warning":
              color = "#f0883a";
              break;
            case "error":
              color = "#fa4350";
              break;
            case "default":
              color = "#333";
              break;
          }
        }
        const svg = loadingIcon(color, !plain);
        loadingIconSvg.value = `"data:image/svg+xml;base64,${encode(svg)}"`;
      }
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        return vue.openBlock(), vue.createElementBlock("button", {
          "hover-class": `${_ctx.disabled || _ctx.loading ? "" : "wd-button--active"}`,
          style: vue.normalizeStyle(_ctx.customStyle),
          class: vue.normalizeClass([
            "wd-button",
            "is-" + _ctx.type,
            "is-" + _ctx.size,
            _ctx.plain ? "is-plain" : "",
            _ctx.disabled ? "is-disabled" : "",
            _ctx.round ? "is-round" : "",
            _ctx.hairline ? "is-hairline" : "",
            _ctx.block ? "is-block" : "",
            _ctx.loading ? "is-loading" : "",
            _ctx.customClass
          ]),
          "hover-start-time": hoverStartTime.value,
          "hover-stay-time": hoverStayTime.value,
          "open-type": _ctx.openType,
          "send-message-title": _ctx.sendMessageTitle,
          "send-message-path": _ctx.sendMessagePath,
          "send-message-img": _ctx.sendMessageImg,
          "app-parameter": _ctx.appParameter,
          "show-message-card": _ctx.showMessageCard,
          "session-from": _ctx.sessionFrom,
          lang: _ctx.lang,
          "hover-stop-propagation": _ctx.hoverStopPropagation,
          "form-type": _ctx.formType,
          onClick: handleClick,
          onGetuserinfo: handleGetuserinfo,
          onContact: handleConcat,
          onGetphonenumber: handleGetphonenumber,
          onError: handleError,
          onLaunchapp: handleLaunchapp,
          onOpensetting: handleOpensetting,
          onChooseavatar: handleChooseavatar,
          onAgreeprivacyauthorization: handleAgreePrivacyAuthorization
        }, [
          _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "wd-button__loading"
          }, [
            vue.createElementVNode(
              "view",
              {
                class: "wd-button__loading-svg",
                style: vue.normalizeStyle(loadingStyle.value)
              },
              null,
              4
              /* STYLE */
            )
          ])) : _ctx.icon ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
            key: 1,
            "custom-class": "wd-button__icon",
            name: _ctx.icon,
            classPrefix: _ctx.classPrefix
          }, null, 8, ["name", "classPrefix"])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "wd-button__text" }, [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ])
        ], 46, ["hover-class", "hover-start-time", "hover-stay-time", "open-type", "send-message-title", "send-message-path", "send-message-img", "app-parameter", "show-message-card", "session-from", "lang", "hover-stop-propagation", "form-type"]);
      };
    }
  });
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-d858c170"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-button/wd-button.vue"]]);
  const actionSheetProps = {
    ...baseProps,
    /**
     * header 头部样式
     * @default ''
     * @type {string}
     */
    customHeaderClass: makeStringProp(""),
    /**
     * 设置菜单显示隐藏
     * @default false
     * @type {boolean}
     */
    modelValue: { ...makeBooleanProp(false), ...makeRequiredProp(Boolean) },
    /**
     * 菜单选项
     * @default []
     * @type {Action[]}
     */
    actions: makeArrayProp(),
    /**
     * 自定义面板项,可以为字符串数组，也可以为对象数组，如果为二维数组，则为多行展示
     * @default []
     * @type {Array<Panel | Panel[]>}
     */
    panels: makeArrayProp(),
    /**
     * 标题
     * @type {string}
     */
    title: String,
    /**
     * 取消按钮文案
     * @type {string}
     */
    cancelText: String,
    /**
     * 点击选项后是否关闭菜单
     * @default true
     * @type {boolean}
     */
    closeOnClickAction: makeBooleanProp(true),
    /**
     * 点击遮罩是否关闭
     * @default true
     * @type {boolean}
     */
    closeOnClickModal: makeBooleanProp(true),
    /**
     * 弹框动画持续时间
     * @default 200
     * @type {number}
     */
    duration: makeNumberProp(200),
    /**
     * 菜单层级
     * @default 10
     * @type {number}
     */
    zIndex: makeNumberProp(10),
    /**
     * 弹层内容懒渲染，触发展示时才渲染内容
     * @default true
     * @type {boolean}
     */
    lazyRender: makeBooleanProp(true),
    /**
     * 弹出面板是否设置底部安全距离（iphone X 类型的机型）
     * @default true
     * @type {boolean}
     */
    safeAreaInsetBottom: makeBooleanProp(true)
  };
  const __default__$1 = {
    name: "wd-action-sheet",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$1,
    props: actionSheetProps,
    emits: ["select", "click-modal", "cancel", "closed", "close", "open", "opened", "update:modelValue"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const formatPanels = vue.ref([]);
      const showPopup = vue.ref(false);
      vue.watch(() => props.panels, computedValue, { deep: true, immediate: true });
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          showPopup.value = newValue;
        },
        { deep: true, immediate: true }
      );
      function isPanelArray() {
        return props.panels.length && !isArray(props.panels[0]);
      }
      function computedValue() {
        formatPanels.value = isPanelArray() ? [props.panels] : props.panels;
      }
      function select(rowIndex, type, colIndex) {
        if (type === "action") {
          if (props.actions[rowIndex].disabled || props.actions[rowIndex].loading) {
            return;
          }
          emit("select", {
            item: props.actions[rowIndex],
            index: rowIndex
          });
        } else if (isPanelArray()) {
          emit("select", {
            item: props.panels[Number(colIndex)],
            index: colIndex
          });
        } else {
          emit("select", {
            item: props.panels[rowIndex][Number(colIndex)],
            rowIndex,
            colIndex
          });
        }
        close();
      }
      function handleClickModal() {
        emit("click-modal");
        if (props.closeOnClickModal) {
          close();
        }
      }
      function handleCancel() {
        emit("cancel");
        close();
      }
      function close() {
        emit("update:modelValue", false);
        emit("close");
      }
      function handleOpen() {
        emit("open");
      }
      function handleOpened() {
        emit("opened");
      }
      function handleClosed() {
        emit("closed");
      }
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        const _component_wd_loading = resolveEasycom(vue.resolveDynamicComponent("wd-loading"), __easycom_6);
        const _component_wd_popup = resolveEasycom(vue.resolveDynamicComponent("wd-popup"), __easycom_2$2);
        return vue.openBlock(), vue.createElementBlock("view", null, [
          vue.createVNode(_component_wd_popup, {
            "custom-class": "wd-action-sheet__popup",
            "custom-style": `${_ctx.actions && _ctx.actions.length || _ctx.panels && _ctx.panels.length ? "background: transparent;" : ""}`,
            modelValue: showPopup.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => showPopup.value = $event),
            duration: _ctx.duration,
            position: "bottom",
            "close-on-click-modal": _ctx.closeOnClickModal,
            "safe-area-inset-bottom": _ctx.safeAreaInsetBottom,
            "lazy-render": _ctx.lazyRender,
            onEnter: handleOpen,
            onClose: close,
            onAfterEnter: handleOpened,
            onAfterLeave: handleClosed,
            onClickModal: handleClickModal,
            "z-index": _ctx.zIndex
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(`wd-action-sheet ${_ctx.customClass}`),
                  style: vue.normalizeStyle(`${_ctx.actions && _ctx.actions.length || _ctx.panels && _ctx.panels.length ? "margin: 0 10px calc(var(--window-bottom) + 10px) 10px; border-radius: 16px;" : "margin-bottom: var(--window-bottom);"} ${_ctx.customStyle}`)
                },
                [
                  _ctx.title ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: vue.normalizeClass(`wd-action-sheet__header ${_ctx.customHeaderClass}`)
                    },
                    [
                      vue.createTextVNode(
                        vue.toDisplayString(_ctx.title) + " ",
                        1
                        /* TEXT */
                      ),
                      vue.createVNode(_component_wd_icon, {
                        "custom-class": "wd-action-sheet__close",
                        name: "add",
                        onClick: close
                      })
                    ],
                    2
                    /* CLASS */
                  )) : vue.createCommentVNode("v-if", true),
                  _ctx.actions && _ctx.actions.length ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "wd-action-sheet__actions"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(_ctx.actions, (action, rowIndex) => {
                        return vue.openBlock(), vue.createElementBlock("button", {
                          key: rowIndex,
                          class: vue.normalizeClass(`wd-action-sheet__action ${action.disabled ? "wd-action-sheet__action--disabled" : ""}  ${action.loading ? "wd-action-sheet__action--loading" : ""}`),
                          style: vue.normalizeStyle(`color: ${action.color}`),
                          onClick: ($event) => select(rowIndex, "action")
                        }, [
                          action.loading ? (vue.openBlock(), vue.createBlock(_component_wd_loading, {
                            key: 0,
                            size: "20px"
                          })) : (vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              key: 1,
                              class: "wd-action-sheet__name"
                            },
                            vue.toDisplayString(action.name),
                            1
                            /* TEXT */
                          )),
                          !action.loading && action.subname ? (vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              key: 2,
                              class: "wd-action-sheet__subname"
                            },
                            vue.toDisplayString(action.subname),
                            1
                            /* TEXT */
                          )) : vue.createCommentVNode("v-if", true)
                        ], 14, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true),
                  formatPanels.value && formatPanels.value.length ? (vue.openBlock(), vue.createElementBlock("view", { key: 2 }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(formatPanels.value, (panel, rowIndex) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: rowIndex,
                          class: "wd-action-sheet__panels"
                        }, [
                          vue.createElementVNode("view", { class: "wd-action-sheet__panels-content" }, [
                            (vue.openBlock(true), vue.createElementBlock(
                              vue.Fragment,
                              null,
                              vue.renderList(panel, (col, colIndex) => {
                                return vue.openBlock(), vue.createElementBlock("view", {
                                  key: colIndex,
                                  class: "wd-action-sheet__panel",
                                  onClick: ($event) => select(rowIndex, "panels", colIndex)
                                }, [
                                  vue.createElementVNode("image", {
                                    class: "wd-action-sheet__panel-img",
                                    src: col.iconUrl
                                  }, null, 8, ["src"]),
                                  vue.createElementVNode(
                                    "view",
                                    { class: "wd-action-sheet__panel-title" },
                                    vue.toDisplayString(col.title),
                                    1
                                    /* TEXT */
                                  )
                                ], 8, ["onClick"]);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
                  _ctx.cancelText ? (vue.openBlock(), vue.createElementBlock(
                    "button",
                    {
                      key: 3,
                      class: "wd-action-sheet__cancel",
                      onClick: handleCancel
                    },
                    vue.toDisplayString(_ctx.cancelText),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ],
                6
                /* CLASS, STYLE */
              )
            ]),
            _: 3
            /* FORWARDED */
          }, 8, ["custom-style", "modelValue", "duration", "close-on-click-modal", "safe-area-inset-bottom", "lazy-render", "z-index"])
        ]);
      };
    }
  });
  const __easycom_8 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-03619ba9"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-action-sheet/wd-action-sheet.vue"]]);
  const selectPickerProps = {
    ...baseProps,
    /** 选择器左侧文案 */
    label: String,
    /** 设置左侧标题宽度 */
    labelWidth: makeStringProp("33%"),
    /** 禁用 */
    disabled: makeBooleanProp(false),
    /** 只读 */
    readonly: Boolean,
    /** 选择器占位符 */
    placeholder: String,
    /** 弹出层标题 */
    title: String,
    /** 选择器的值靠右展示 */
    alignRight: makeBooleanProp(false),
    /** 是否为错误状态，错误状态时右侧内容为红色 */
    error: makeBooleanProp(false),
    /** 必填样式 */
    required: makeBooleanProp(false),
    /** 使用 label 插槽时设置该选项 */
    useLabelSlot: makeBooleanProp(false),
    /** 使用默认插槽时设置该选项 */
    useDefaultSlot: makeBooleanProp(false),
    /** 设置选择器大小 */
    size: String,
    /** 选中的颜色（单/复选框） */
    checkedColor: String,
    /** 最小选中的数量（仅在复选框类型下生效，`type`类型为`checkbox`） */
    min: makeNumberProp(0),
    /** 最大选中的数量，0 为无限数量，默认为 0（仅在复选框类型下生效，`type`类型为`checkbox`） */
    max: makeNumberProp(0),
    /** 设置 picker 内部的选项组尺寸大小 （单/复选框） */
    selectSize: String,
    /** 加载中 */
    loading: makeBooleanProp(false),
    /** 加载的颜色，只能使用十六进制的色值写法，且不能使用缩写 */
    loadingColor: makeStringProp("#4D80F0"),
    /** 点击遮罩是否关闭 */
    closeOnClickModal: makeBooleanProp(true),
    /** 选中项，`type`类型为`checkbox`时，类型为 array；`type`为`radio` 时 ，类型为 number / boolean / string */
    modelValue: makeRequiredProp([String, Number, Boolean, Array]),
    /** 选择器数据，一维数组 */
    columns: makeArrayProp(),
    /** 单复选选择器类型 */
    type: makeStringProp("checkbox"),
    /** 选项对象中，value 对应的 key */
    valueKey: makeStringProp("value"),
    /** 选项对象中，展示的文本对应的 key */
    labelKey: makeStringProp("label"),
    /** 确认按钮文案 */
    confirmButtonText: String,
    /** 自定义展示文案的格式化函数，返回一个字符串 */
    displayFormat: Function,
    /** 确定前校验函数，接收 (value, resolve) 参数，通过 resolve 继续执行 picker，resolve 接收 1 个 boolean 参数 */
    beforeConfirm: Function,
    /** 弹窗层级 */
    zIndex: makeNumberProp(15),
    /** 弹出面板是否设置底部安全距离（iphone X 类型的机型） */
    safeAreaInsetBottom: makeBooleanProp(true),
    /** 可搜索（目前只支持本地搜索） */
    filterable: makeBooleanProp(false),
    /** 搜索框占位符 */
    filterPlaceholder: String,
    /** 是否超出隐藏 */
    ellipsis: makeBooleanProp(false),
    /** 重新打开是否滚动到选中项 */
    scrollIntoView: makeBooleanProp(true),
    /** 表单域 `model` 字段名，在使用表单校验功能的情况下，该属性是必填的 */
    prop: String,
    /** 表单验证规则，结合`wd-form`组件使用 */
    rules: makeArrayProp(),
    /** 自定义内容样式类 */
    customContentClass: makeStringProp(""),
    /** 自定义标签样式类 */
    customLabelClass: makeStringProp(""),
    /** 自定义值样式类 */
    customValueClass: makeStringProp(""),
    /** 是否显示确认按钮（radio类型生效），默认值为：true */
    showConfirm: makeBooleanProp(true)
  };
  const __default__ = {
    name: "wd-select-picker",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    ...__default__,
    props: selectPickerProps,
    emits: ["change", "cancel", "confirm", "update:modelValue", "open", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const { translate } = useTranslate("select-picker");
      const props = __props;
      const emit = __emit;
      const pickerShow = vue.ref(false);
      const selectList = vue.ref([]);
      const isConfirm = vue.ref(false);
      const lastSelectList = vue.ref([]);
      const filterVal = vue.ref("");
      const filterColumns = vue.ref([]);
      const scrollTop = vue.ref(0);
      const cell = useCell();
      const showValue = vue.computed(() => {
        const value = valueFormat(props.modelValue);
        let showValueTemp = "";
        if (props.displayFormat) {
          showValueTemp = props.displayFormat(value, props.columns);
        } else {
          const { type, labelKey } = props;
          if (type === "checkbox") {
            const selectedItems = (isArray(value) ? value : []).map((item) => {
              return getSelectedItem(item);
            });
            showValueTemp = selectedItems.map((item) => {
              return item[labelKey];
            }).join(", ");
          } else if (type === "radio") {
            const selectedItem = getSelectedItem(value);
            showValueTemp = selectedItem[labelKey];
          } else {
            showValueTemp = value;
          }
        }
        return showValueTemp;
      });
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          if (newValue === selectList.value)
            return;
          selectList.value = valueFormat(newValue);
          lastSelectList.value = valueFormat(newValue);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.columns,
        (newValue) => {
          if (props.filterable && filterVal.value) {
            formatFilterColumns(newValue, filterVal.value);
          } else {
            filterColumns.value = newValue;
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.displayFormat,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-select-picker/wd-select-picker.vue:199", "The type of displayFormat must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.beforeConfirm,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-select-picker/wd-select-picker.vue:212", "The type of beforeConfirm must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      const { parent: form } = useParent(FORM_KEY);
      const errorMessage = vue.computed(() => {
        if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
          return form.errorMessages[props.prop];
        } else {
          return "";
        }
      });
      const isRequired = vue.computed(() => {
        let formRequired = false;
        if (form && form.props.rules) {
          const rules = form.props.rules;
          for (const key in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
              formRequired = rules[key].some((rule) => rule.required);
            }
          }
        }
        return props.required || props.rules.some((rule) => rule.required) || formRequired;
      });
      vue.onBeforeMount(() => {
        selectList.value = valueFormat(props.modelValue);
        filterColumns.value = props.columns;
      });
      const { proxy } = vue.getCurrentInstance();
      function setScrollIntoView() {
        let wraperSelector = "";
        let selectorPromise = [];
        if (isDef(selectList.value) && selectList.value !== "" && !isArray(selectList.value)) {
          wraperSelector = "#wd-radio-group";
          selectorPromise = [getRect(`#radio${selectList.value}`, false, proxy)];
        } else if (isArray(selectList.value) && selectList.value.length > 0) {
          selectList.value.forEach((value) => {
            selectorPromise.push(getRect(`#check${value}`, false, proxy));
          });
          wraperSelector = "#wd-checkbox-group";
        }
        if (wraperSelector) {
          requestAnimationFrame().then(() => {
            requestAnimationFrame().then(() => {
              Promise.all([getRect(".wd-select-picker__wrapper", false, proxy), getRect(wraperSelector, false, proxy), ...selectorPromise]).then((res) => {
                if (isDef(res) && isArray(res)) {
                  const scrollView = res[0];
                  const wraper = res[1];
                  const target = res.slice(2) || [];
                  if (isDef(wraper) && isDef(scrollView)) {
                    const index = target.findIndex((item) => {
                      return item.top >= scrollView.top && item.bottom <= scrollView.bottom;
                    });
                    if (index < 0) {
                      scrollTop.value = -1;
                      vue.nextTick(() => {
                        scrollTop.value = Math.max(0, target[0].top - wraper.top - scrollView.height / 2);
                      });
                    }
                  }
                }
              }).catch((error) => {
                formatAppLog("log", "at uni_modules/wot-design-uni/components/wd-select-picker/wd-select-picker.vue:288", error);
              });
            });
          });
        }
      }
      function noop() {
      }
      function getSelectedItem(value) {
        const { valueKey, labelKey, columns } = props;
        const selecteds = columns.filter((item) => {
          return item[valueKey] === value;
        });
        if (selecteds.length > 0) {
          return selecteds[0];
        }
        return {
          [valueKey]: value,
          [labelKey]: ""
        };
      }
      function valueFormat(value) {
        return props.type === "checkbox" ? isArray(value) ? value : [] : value;
      }
      function handleChange({ value }) {
        selectList.value = value;
        emit("change", { value });
        if (props.type === "radio" && !props.showConfirm) {
          onConfirm();
        }
      }
      function close() {
        pickerShow.value = false;
        if (!isConfirm.value) {
          selectList.value = valueFormat(lastSelectList.value);
        }
        emit("cancel");
        emit("close");
      }
      function open() {
        if (props.disabled || props.readonly)
          return;
        selectList.value = valueFormat(props.modelValue);
        pickerShow.value = true;
        isConfirm.value = false;
        emit("open");
      }
      function onConfirm() {
        if (props.loading) {
          pickerShow.value = false;
          emit("confirm");
          emit("close");
          return;
        }
        if (props.beforeConfirm) {
          props.beforeConfirm(selectList.value, (isPass) => {
            isPass && handleConfirm();
          });
        } else {
          handleConfirm();
        }
      }
      function handleConfirm() {
        isConfirm.value = true;
        pickerShow.value = false;
        lastSelectList.value = valueFormat(selectList.value);
        let selectedItems = {};
        if (props.type === "checkbox") {
          selectedItems = (isArray(lastSelectList.value) ? lastSelectList.value : []).map((item) => {
            return getSelectedItem(item);
          });
        } else {
          selectedItems = getSelectedItem(lastSelectList.value);
        }
        emit("update:modelValue", lastSelectList.value);
        emit("confirm", {
          value: lastSelectList.value,
          selectedItems
        });
        emit("close");
      }
      function getFilterText(label, filterVal2) {
        const reg = new RegExp(`(${filterVal2})`, "g");
        return label.split(reg).map((text) => {
          return {
            type: text === filterVal2 ? "active" : "normal",
            label: text
          };
        });
      }
      function handleFilterChange({ value }) {
        if (value === "") {
          filterColumns.value = [];
          filterVal.value = value;
          vue.nextTick(() => {
            filterColumns.value = props.columns;
          });
        } else {
          filterVal.value = value;
          formatFilterColumns(props.columns, value);
        }
      }
      function formatFilterColumns(columns, filterVal2) {
        const filterColumnsTemp = columns.filter((item) => {
          return item[props.labelKey].indexOf(filterVal2) > -1;
        });
        const formatFilterColumns2 = filterColumnsTemp.map((item) => {
          return {
            ...item,
            [props.labelKey]: getFilterText(item[props.labelKey], filterVal2)
          };
        });
        filterColumns.value = [];
        vue.nextTick(() => {
          filterColumns.value = formatFilterColumns2;
        });
      }
      const showConfirm = vue.computed(() => {
        return props.type === "radio" && props.showConfirm || props.type === "checkbox";
      });
      __expose({
        close,
        open
      });
      return (_ctx, _cache) => {
        const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$3);
        const _component_wd_search = resolveEasycom(vue.resolveDynamicComponent("wd-search"), __easycom_1$1);
        const _component_wd_checkbox = resolveEasycom(vue.resolveDynamicComponent("wd-checkbox"), __easycom_2$1);
        const _component_wd_checkbox_group = resolveEasycom(vue.resolveDynamicComponent("wd-checkbox-group"), __easycom_3);
        const _component_wd_radio = resolveEasycom(vue.resolveDynamicComponent("wd-radio"), __easycom_4);
        const _component_wd_radio_group = resolveEasycom(vue.resolveDynamicComponent("wd-radio-group"), __easycom_5);
        const _component_wd_loading = resolveEasycom(vue.resolveDynamicComponent("wd-loading"), __easycom_6);
        const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_2);
        const _component_wd_action_sheet = resolveEasycom(vue.resolveDynamicComponent("wd-action-sheet"), __easycom_8);
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: vue.normalizeClass(`wd-select-picker ${vue.unref(cell).border.value ? "is-border" : ""} ${_ctx.customClass}`),
            style: vue.normalizeStyle(_ctx.customStyle)
          },
          [
            vue.createElementVNode("view", {
              class: "wd-select-picker__field",
              onClick: open
            }, [
              _ctx.useDefaultSlot ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 1,
                  class: vue.normalizeClass(`wd-select-picker__cell ${_ctx.disabled && "is-disabled"} ${_ctx.readonly && "is-readonly"} ${_ctx.alignRight && "is-align-right"} ${_ctx.error && "is-error"} ${_ctx.size && "is-" + _ctx.size}`)
                },
                [
                  _ctx.label || _ctx.useLabelSlot ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: vue.normalizeClass(`wd-select-picker__label ${isRequired.value && "is-required"} ${_ctx.customLabelClass}`),
                      style: vue.normalizeStyle(_ctx.labelWidth ? "min-width:" + _ctx.labelWidth + ";max-width:" + _ctx.labelWidth + ";" : "")
                    },
                    [
                      _ctx.label ? (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        { key: 0 },
                        [
                          vue.createTextVNode(
                            vue.toDisplayString(_ctx.label),
                            1
                            /* TEXT */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : vue.renderSlot(_ctx.$slots, "label", { key: 1 }, void 0, true)
                    ],
                    6
                    /* CLASS, STYLE */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("view", { class: "wd-select-picker__body" }, [
                    vue.createElementVNode("view", { class: "wd-select-picker__value-wraper" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(`wd-select-picker__value ${_ctx.ellipsis && "is-ellipsis"} ${_ctx.customValueClass} ${showValue.value ? "" : "wd-select-picker__value--placeholder"}`)
                        },
                        vue.toDisplayString(showValue.value || _ctx.placeholder || vue.unref(translate)("placeholder")),
                        3
                        /* TEXT, CLASS */
                      ),
                      !_ctx.disabled && !_ctx.readonly ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                        key: 0,
                        "custom-class": "wd-select-picker__arrow",
                        name: "arrow-right"
                      })) : vue.createCommentVNode("v-if", true)
                    ]),
                    errorMessage.value ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: "wd-select-picker__error-message"
                      },
                      vue.toDisplayString(errorMessage.value),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ],
                2
                /* CLASS */
              ))
            ]),
            vue.createVNode(_component_wd_action_sheet, {
              modelValue: pickerShow.value,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => pickerShow.value = $event),
              duration: 250,
              title: _ctx.title || vue.unref(translate)("title"),
              "close-on-click-modal": _ctx.closeOnClickModal,
              "z-index": _ctx.zIndex,
              "safe-area-inset-bottom": _ctx.safeAreaInsetBottom,
              onClose: close,
              onOpened: _cache[4] || (_cache[4] = ($event) => _ctx.scrollIntoView ? setScrollIntoView() : ""),
              "custom-header-class": "wd-select-picker__header"
            }, {
              default: vue.withCtx(() => [
                _ctx.filterable ? (vue.openBlock(), vue.createBlock(_component_wd_search, {
                  key: 0,
                  modelValue: filterVal.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filterVal.value = $event),
                  placeholder: _ctx.filterPlaceholder || vue.unref(translate)("filterPlaceholder"),
                  "hide-cancel": "",
                  "placeholder-left": "",
                  onChange: handleFilterChange
                }, null, 8, ["modelValue", "placeholder"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("scroll-view", {
                  class: vue.normalizeClass(`wd-select-picker__wrapper ${_ctx.filterable ? "is-filterable" : ""} ${_ctx.loading ? "is-loading" : ""} ${_ctx.customContentClass}`),
                  "scroll-y": !_ctx.loading,
                  "scroll-top": scrollTop.value,
                  "scroll-with-animation": true
                }, [
                  vue.createCommentVNode(" 多选 "),
                  _ctx.type === "checkbox" && vue.unref(isArray)(selectList.value) ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    id: "wd-checkbox-group"
                  }, [
                    vue.createVNode(_component_wd_checkbox_group, {
                      modelValue: selectList.value,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => selectList.value = $event),
                      cell: "",
                      size: _ctx.selectSize,
                      "checked-color": _ctx.checkedColor,
                      min: _ctx.min,
                      max: _ctx.max,
                      onChange: handleChange
                    }, {
                      default: vue.withCtx(() => [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(filterColumns.value, (item) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: item[_ctx.valueKey],
                              id: "check" + item[_ctx.valueKey]
                            }, [
                              vue.createVNode(_component_wd_checkbox, {
                                modelValue: item[_ctx.valueKey],
                                disabled: item.disabled
                              }, {
                                default: vue.withCtx(() => [
                                  _ctx.filterable && filterVal.value ? (vue.openBlock(true), vue.createElementBlock(
                                    vue.Fragment,
                                    { key: 0 },
                                    vue.renderList(item[_ctx.labelKey], (text) => {
                                      return vue.openBlock(), vue.createElementBlock(
                                        vue.Fragment,
                                        {
                                          key: text.label
                                        },
                                        [
                                          text.type === "active" ? (vue.openBlock(), vue.createElementBlock(
                                            "text",
                                            {
                                              key: 0,
                                              class: "wd-select-picker__text-active"
                                            },
                                            vue.toDisplayString(text.label),
                                            1
                                            /* TEXT */
                                          )) : (vue.openBlock(), vue.createElementBlock(
                                            vue.Fragment,
                                            { key: 1 },
                                            [
                                              vue.createTextVNode(
                                                vue.toDisplayString(text.label),
                                                1
                                                /* TEXT */
                                              )
                                            ],
                                            64
                                            /* STABLE_FRAGMENT */
                                          ))
                                        ],
                                        64
                                        /* STABLE_FRAGMENT */
                                      );
                                    }),
                                    128
                                    /* KEYED_FRAGMENT */
                                  )) : (vue.openBlock(), vue.createElementBlock(
                                    vue.Fragment,
                                    { key: 1 },
                                    [
                                      vue.createTextVNode(
                                        vue.toDisplayString(item[_ctx.labelKey]),
                                        1
                                        /* TEXT */
                                      )
                                    ],
                                    64
                                    /* STABLE_FRAGMENT */
                                  ))
                                ]),
                                _: 2
                                /* DYNAMIC */
                              }, 1032, ["modelValue", "disabled"])
                            ], 8, ["id"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["modelValue", "size", "checked-color", "min", "max"])
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 单选 "),
                  _ctx.type === "radio" && !vue.unref(isArray)(selectList.value) ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    id: "wd-radio-group"
                  }, [
                    vue.createVNode(_component_wd_radio_group, {
                      modelValue: selectList.value,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => selectList.value = $event),
                      cell: "",
                      size: _ctx.selectSize,
                      "checked-color": _ctx.checkedColor,
                      onChange: handleChange
                    }, {
                      default: vue.withCtx(() => [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(filterColumns.value, (item, index) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: index,
                              id: "radio" + item[_ctx.valueKey]
                            }, [
                              vue.createVNode(_component_wd_radio, {
                                value: item[_ctx.valueKey],
                                disabled: item.disabled
                              }, {
                                default: vue.withCtx(() => [
                                  _ctx.filterable && filterVal.value ? (vue.openBlock(true), vue.createElementBlock(
                                    vue.Fragment,
                                    { key: 0 },
                                    vue.renderList(item[_ctx.labelKey], (text) => {
                                      return vue.openBlock(), vue.createElementBlock("text", {
                                        key: text.label,
                                        clsss: `${text.type === "active" ? "wd-select-picker__text-active" : ""}`
                                      }, vue.toDisplayString(text.label), 9, ["clsss"]);
                                    }),
                                    128
                                    /* KEYED_FRAGMENT */
                                  )) : (vue.openBlock(), vue.createElementBlock(
                                    vue.Fragment,
                                    { key: 1 },
                                    [
                                      vue.createTextVNode(
                                        vue.toDisplayString(item[_ctx.labelKey]),
                                        1
                                        /* TEXT */
                                      )
                                    ],
                                    64
                                    /* STABLE_FRAGMENT */
                                  ))
                                ]),
                                _: 2
                                /* DYNAMIC */
                              }, 1032, ["value", "disabled"])
                            ], 8, ["id"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      _: 1
                      /* STABLE */
                    }, 8, ["modelValue", "size", "checked-color"])
                  ])) : vue.createCommentVNode("v-if", true),
                  _ctx.loading ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 2,
                      class: "wd-select-picker__loading",
                      onTouchmove: noop
                    },
                    [
                      vue.createVNode(_component_wd_loading, { color: _ctx.loadingColor }, null, 8, ["color"])
                    ],
                    32
                    /* NEED_HYDRATION */
                  )) : vue.createCommentVNode("v-if", true)
                ], 10, ["scroll-y", "scroll-top"]),
                vue.createCommentVNode(" 确认按钮 "),
                showConfirm.value ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "wd-select-picker__footer"
                }, [
                  vue.createVNode(_component_wd_button, {
                    block: "",
                    size: "large",
                    onClick: onConfirm,
                    disabled: _ctx.loading
                  }, {
                    default: vue.withCtx(() => [
                      vue.createTextVNode(
                        vue.toDisplayString(_ctx.confirmButtonText || vue.unref(translate)("confirm")),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["disabled"])
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["modelValue", "title", "close-on-click-modal", "z-index", "safe-area-inset-bottom"])
          ],
          6
          /* CLASS, STYLE */
        );
      };
    }
  });
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-b8ce50f5"], ["__file", "E:/test_project/test/uni_modules/wot-design-uni/components/wd-select-picker/wd-select-picker.vue"]]);
  const _sfc_main$1 = {
    __name: "index",
    setup(__props) {
      const columns = vue.ref([
        {
          value: "101",
          label: "男装"
        },
        {
          value: "102",
          label: "奢侈品"
        },
        {
          value: "103",
          label: "女装"
        }
      ]);
      const value = vue.ref(["101"]);
      return (_ctx, _cache) => {
        const _component_wd_picker = resolveEasycom(vue.resolveDynamicComponent("wd-picker"), __easycom_0);
        const _component_wd_select_picker = resolveEasycom(vue.resolveDynamicComponent("wd-select-picker"), __easycom_1);
        const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_2);
        return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
          vue.createCommentVNode(" 滚动列表 "),
          vue.createElementVNode("scroll-view", {
            class: "scroll-view",
            "scroll-y": ""
          }, [
            vue.createVNode(_component_wd_picker, {
              id: "a",
              columns: columns.value,
              label: "单列选项",
              modelValue: value.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => value.value = $event)
            }, null, 8, ["columns", "modelValue"]),
            vue.createVNode(_component_wd_select_picker, {
              id: "b",
              label: "基本用法",
              modelValue: value.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => value.value = $event),
              columns: columns.value
            }, null, 8, ["modelValue", "columns"]),
            vue.createElementVNode("view", {
              id: "c",
              style: { "background-color": "aqua", "height": "500px" }
            }),
            vue.createVNode(_component_wd_picker, {
              id: "d",
              columns: columns.value,
              label: "单列选项",
              modelValue: value.value,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => value.value = $event)
            }, null, 8, ["columns", "modelValue"]),
            vue.createVNode(_component_wd_select_picker, {
              id: "e",
              label: "基本用法",
              modelValue: value.value,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => value.value = $event),
              columns: columns.value
            }, null, 8, ["modelValue", "columns"]),
            vue.createVNode(_component_wd_picker, {
              id: "f",
              columns: columns.value,
              label: "单列选项",
              modelValue: value.value,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => value.value = $event)
            }, null, 8, ["columns", "modelValue"]),
            vue.createVNode(_component_wd_select_picker, {
              id: "g",
              label: "基本用法",
              modelValue: value.value,
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => value.value = $event),
              columns: columns.value
            }, null, 8, ["modelValue", "columns"])
          ]),
          vue.createCommentVNode(" 底部保存按钮 "),
          vue.createElementVNode("view", { class: "footer" }, [
            vue.createVNode(_component_wd_button, null, {
              default: vue.withCtx(() => [
                vue.createTextVNode("保存")
              ]),
              _: 1
              /* STABLE */
            })
          ])
        ]);
      };
    }
  };
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/test_project/test/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/test_project/test/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
