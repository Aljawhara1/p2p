/*cocktail library created at 2/3/2023 - Devloped by yousef sayed*/
export function $(element = "string") {
  let el = document.querySelector(element);
  if (!el) {
    return new Promise((res, rej) => {
      setInterval(() => {
        let el = document.querySelector(element);
        el ? res(el) : false
      }, 1)
    })
  }
  return el;
}

export function $a(elements = "string") {
  return document.querySelectorAll(elements);
}

export function cre({ elementType, className, id, src, href, type = "", placeholder, where = document, prepend = false, replace = false }) {
  let el = document.createElement(elementType)
  console.log(el);
  if (className) { el.className = className };
  if (id) { el.id = id };
  if (src) { el.src = src };
  if (href) { el.href = href };
  if (placeholder) { el.placeholder = placeholder };
  if (where) { where.appendChild(el) };
  if (prepend) { where.prepend(el); }
  if (type) { el.type = type; }
  return el;
}

export function setOnInObjectProto() {
  Element.prototype.on = function (type = "string", callback = () => { }) {
    this.addEventListener(type, callback)
  }
}

export class MakeAudioRecorder {
  constructor() {

    const stream = navigator.mediaDevices.getUserMedia({ audio: true });
    let record, blob, url;

    this.getStream = async function getStream() {
      return await stream;
    }

    this.startRecord = async function startRecord() {
      record = new MediaRecorder(await stream);
      record.start();
      this.isStream = record.state == 'recording' ? true : false;
    }

    async function stopStream() {
      let stream2 = await stream;
      const tracks = stream2.getTracks();
      record.addEventListener("stop", () => {
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].stop();
        }
      });
    }

    this.stopRecord = async function stopRecord(arrayToSavePartsOfRecord) {
      this.isStream = record.state == 'inactive' ? false : true;
      if (record.state == 'inactive') { return false }
      record.stop();
      record.addEventListener("dataavailable", (e) => {
        if (arrayToSavePartsOfRecord) {
          arrayToSavePartsOfRecord.push(e.data);
          blob = new Blob(arrayToSavePartsOfRecord, { type: "audio/webm" });
        }
      });
      stopStream();
      this.getBlobURL(arrayToSavePartsOfRecord);
    }

    this.getBlobURL = async function getBlobURL(arrayOfpartsOfRecord) {
      if (record.state == "recording") {
        //recording
        record.stop();
        stopStream();
        this.isStream = record.state == 'inactive' ? false : true;
        record.addEventListener("dataavailable", (e) => {
          arrayOfpartsOfRecord.push(e.data);
          blob = new Blob(arrayOfpartsOfRecord, { type: "audio/webm" });
          url = URL.createObjectURL(blob);
        }); //dataavailable
        const prom = new Promise((res, rej) => {
          setTimeout(() => {
            if (url) {
              res(url);
            } else {
              rej("No Url");
            }
          }, 1);
        });
        return await prom;
      } else {
        blob = new Blob(arrayOfpartsOfRecord, { type: "audio/webm" });
        return URL.createObjectURL(blob);
      }
    }


  }
}

export class MakeLiveSoundWave {
  constructor({ canvas = document, waveColor = "String" }) {

    let audio, ctx, width, height, audCtx, analyser, srcG;

    this.loadAudio = function (src = "string", isStreamUrl = true) {
      audio = new Audio();
      audio.load();
      ctx = canvas.getContext("2d");
      ({ width, height } = canvas);
      audCtx = new AudioContext();
      analyser = audCtx.createAnalyser();

      if (isStreamUrl) {
        srcG = audCtx.createMediaStreamSource(src)
        audio.srcObject = src;
      } else {
        audio.src = src;
      }
      srcG.connect(analyser);
      // analyser.connect(audCtx.destination);
      console.log(srcG);
      return audio;
    }
    this.drawOnCanvas = function drawOnCanvas() {
      let unitArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(unitArray);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < unitArray.length; i++) {
        ctx.fillStyle = waveColor;
        let unit = unitArray[i] <= 0 ? 2 : unitArray[i] - Math.trunc(unitArray[i] * 0.9);
        if (unitArray[i]) {
          ctx.fillRect(2.4 * i, height / 2, width / unitArray.length, unit);
          ctx.fillRect(2.4 * i, height / 2, width / unitArray.length, -unit);
        }
      }
      window.requestAnimationFrame(drawOnCanvas);
    }

    this.playAudio = function playAudio() {
      audio.play();
    }

    this.stopAudio = function stopAudio() {
      audio.pause();
    }
  }
}

class MakeAudioWaveOnLoad {
  constructor(loadSrc, drawCanvas) {
    this.laodSrc = loadSrc;
    this.drawCanvas = drawCanvas;

    async function loadSrc(src) {
      let buffer = (await fetch(src)).arrayBuffer(),
        audCtx = new AudioContext(),
        audioBuffer = await audCtx.decodeAudioData(await buffer),
        float32Array = audioBuffer.getChannelData(0);
      return float32Array
    }

    async function drawCanvas({ src, canvas, waveColor }) {
      let channelData = await loadSrc(src),
        ctx = canvas.getContext('2d');
      let { width, height } = canvas;
      let step = Math.ceil(channelData.length / width)
      ctx.fillStyle = waveColor;
      for (let i = 0; i < width; i++) {
        ctx.fillRect(2.4 * i, height / 2, 2, channelData[i]);
        ctx.fillRect(2.4 * i, height / 2, 2, -channelData[i]);
      }
    }
  }
}

export class MakeMinAndSecInterval {
  constructor({ minuts = document, seconds = document }) {
    let interval;
    this.startInterval = function () {
      clearInterval(interval);
      if (this.min || this.sec) { minuts.textContent = this.min; seconds.textContent = this.sec; } //becuse if user start interval while playing record
      interval = setInterval(() => {
        seconds.textContent++;
        if (seconds.textContent >= 60) {
          seconds.textContent = 0;
          minuts.textContent++;
        }
        this.min = minuts.textContent;
        this.sec = seconds.textContent;
      }, 1000);
    };

    this.stopInterval = function () {
      clearInterval(interval);
    };

    this.clearMin = function () {
      minuts.textContent = 0;
    };

    this.clearSec = function () {
      seconds.textContent = 0;
    };

    this.clearMinAndSec = function () {
      minuts.textContent = 0;
      seconds.textContent = 0;
    };

    this.makeIntervalWithAudioTime = function (audio) {
      clearInterval(interval)
      console.log(seconds.textContent);
      interval = setInterval(() => {
        let currentTime = Math.trunc(audio.getCurrentTime()) || audio.currentTime;
        if (Math.trunc(currentTime / 60) || Math.trunc(currentTime - +minuts.textContent * 60)) {
          minuts.textContent = Math.trunc(currentTime / 60);
          seconds.textContent = Math.trunc(currentTime - +minuts.textContent * 60);
        }
      }, 100)
    }
  }
};

const langsElemement = new Map()
//make component function
export function component({ type, attr, events, style, $for, push, content, langs, children }) {
  const el = !type ? document.createDocumentFragment() : document.createElement(type);
  const handlers = {
    createForElement: async (prop, parent) => {
      if (prop) {
        let loop = await (await (prop.loop)).length || prop.loop
        console.log(prop.loop);
        for (let i = 0; i < loop; i++) {
          let item = document.createElement(prop.type);

          //start set attrtibutes
          if (prop.attr) {
            for (const key in prop.attr) {
              let attrs = /*prop.attr[key] instanceof Function ? prop.attr[key]() :*/await prop.attr[key]
              if (!attrs[i]) { continue; }
              !attrs[i][key] ? item.setAttribute(key, await attrs[i]) : item.setAttribute(key, (await attrs)[i][key])
            }


          }
          //end set attrtibutes

          //start set contents
          if (prop.content) {
            const asyncProp = prop.asyncProp;

            if (!prop.asyncProp) {
              (await prop.content)[i] instanceof Element || (await prop.content)[i] instanceof DocumentFragment ? item.appendChild((await prop.content)[i]) : item.insertAdjacentHTML('beforeend', (await prop.content)[i]);

            } else {
              if (Array.isArray(asyncProp)) {
                asyncProp.forEach(async (method) => {
                  (await prop.content)[i][method] instanceof Element || (await prop.content)[i][method] instanceof DocumentFragment ? item.appendChild((await prop.content)[i][method]) : item.insertAdjacentHTML('beforeend', (await prop.content)[i][method]);
                })
              } else {
                (await prop.content)[i][asyncProp] instanceof Element || (await prop.content)[i][asyncProp] instanceof DocumentFragment ? item.appendChild((await prop.content)[i][asyncProp]) : item.insertAdjacentHTML('beforeend', (await prop.content)[i][asyncProp]);
              }

            }

          }
          //end set contents

          //start events
          if (prop.events) {
            const events = prop.events;
            for (const key in events) {
              let lenghtOfEvent = +key.charAt(1);

              for (const key2 in events[key]) {
                if (lenghtOfEvent == i + 1) {
                  item.addEventListener(key2, events[key][key2])
                } else if (key === '$all') { item.addEventListener(key2, events[key][key2]) }
              }
            }
          }
          //end events

          //now append the child
          parent.appendChild(item)
        }
      }
    },

    contentHandler: async (content, parent) => {

      async function isHtmlInFragment(content) {
        let contentOfFragment = document.createElement('div');
        contentOfFragment.insertAdjacentHTML('beforeend', await content);
        parent.appendChild(contentOfFragment)
      }

      function isParentFragment(content) {
        parent instanceof DocumentFragment ? isHtmlInFragment(content) : parent.insertAdjacentHTML('beforeend', content);
      }

      if (Array.isArray(content)) {
        for (let i = 0; i < content.length; i++) {
          await content[i] instanceof Element || await content[i] instanceof DocumentFragment ? parent.appendChild(await content[i]) : isHtmlInFragment(await content[i]);
        }
      } else { await content instanceof Element || await content instanceof DocumentFragment ? parent.appendChild(await content) : isParentFragment(await content) }
    },

    eventsHandler: (events, element) => {
      for (const key in events) {
        if (events.hasOwnProperty(key)) {
          element.addEventListener(key, events[key])
        }
      }
    },

    styleHandler: (styles, element) => {
      for (const key in styles) {
        if (styles.hasOwnProperty(key)) {
          element.style[key] = styles[key];
        }
      }
    },
    langsHandler: (el, langs) => {
      langsElemement.set(el, langs);
    }

  }
  // set attributes for parent element
  if (attr) {
    for (const key of Object.keys(attr)) {
      if (attr.hasOwnProperty(key)) {
        el.setAttribute(key, attr[key]);
      }
    }
  }

  if (events) {
    handlers.eventsHandler(events, el);
  }

  if (style) {
    handlers.styleHandler(style, el)
  }

  //start for in parent element
  if ($for) {
    handlers.createForElement($for, el);
  }

  //if he chose push way
  if (push) {
    const types = push.types, attrs = push.attrs, contents = push.contents;
    for (let i = 0; i < types.length; i++) {
      let chiledPush = document.createElement(types[i]);

      //set attributes 
      if (attrs) {
        for (const key in attrs) {
          if (attrs.hasOwnProperty(key)) {
            chiledPush.setAttribute(key, attrs[key][i]);
          }
        }
      }

      //set contents
      if (contents) {
        contents[i] instanceof Element ? chiledPush.appendChild(contents[i]) : chiledPush.insertAdjacentHTML('beforeend', contents[i]);
      }
      el.appendChild(chiledPush)
    }
  }


  if (langs) {
    handlers.langsHandler(el, langs)
  }

  //set the content as textNode in parent
  if (content) {
    handlers.contentHandler(content, el)
  }

  //set childeren
  if (children) {
    for (const key of Object.keys(children)) {
      let childType = children[key].type, childAttr = children[key].attr,
        childContent = children[key].content,
        childLangs = children[key].langs,
        childrepeat = children[key].repeat,
        childEvent = children[key].events,
        childStyle = children[key].style,
        childFor = children[key].$for;

      const childEl = document.createElement(childType);

      //set attributes of child
      if (childAttr) {
        for (const key of Object.keys(childAttr)) {
          if (childAttr.hasOwnProperty(key)) {
            childEl.setAttribute(key, childAttr[key]);
          }
        }
      }

      if (childLangs) {
        handlers.langsHandler(childEl, childLangs)
      }

      if (childContent) {
        // if (Array.isArray(childContent)) {
        //   handlers.contentHandler(childContent)
        // }
        handlers.contentHandler(childContent, childEl)
      }
      //if some love to reapet same child
      if (childrepeat) {
        for (let i = 0; i < childrepeat; i++) {
          if (childContent instanceof Element) {
            let cloneNode = childContent.cloneNode(true);
            childEl.appendChild(cloneNode)
          } else { childEl.insertAdjacentHTML('beforeend', childContent) }
        }
        // el.appendChild(childEl);
      }

      if (childEvent) {
        handlers.eventsHandler(childEvent, childEl);
      }

      if (childStyle) {
        handlers.styleHandler(childStyle, childEl)
      }

      //to for on items
      handlers.createForElement(childFor, childEl)
      el.appendChild(childEl)
    }
  }


  return document.adoptNode(el);
}
let myComponent = component({
  type: 'section',
  attr: {
    class: "parent",
    id: "parent"
  },
  textNode: 'Welcome in first test',

  langs: {
    ar: 'اهلا',
    fr: 'bonjour'
  },

  contentNode: 'Welcome in first test',
  events: {
    click: (ev) => { console.log(ev) },
    input: (ev) => { console.log(ev); }
  },
  //children
  children: {
    child1: {
      type: 'div',
      attr: { class: "child1" },
      contentNode: component({
        type: 'div', attr: { class: "nestedChild" }, children: {
          child1: { type: "div", attr: { class: "nestdNestedChild" }, contentNode: "welcome bro" }
        },
      }),
      repeat: 4,
      events: {
        mousemove: (ev) => { console.log(true); }
      }
    },
    child2: {
      type: 'div',
      attr: { class: "child2" },
      contentNode: component({
        type: 'div', attr: { class: "nestedChild2" }, children: {
          child1: { type: "div", attr: { class: "nestdNestedChild2" }, contentNode: "welcome bro2" }
        },
      }),
      repeat: 4,
    },
    child3: {
      type: 'ul',
      attr: { class: "many-items", id: "k=list" },
      $for: { loop: 4, type: 'li', attr: { class: ['i1', 'i2', 'i3', 'i4'], id: ['i1', 'i2', 'i3', 'i4'] }, content: ['welcom1', 'welcome2', 'welcome3', 'welcome4'] }
    }
  }
});

let my2comp = component({
  $for: { loop: 4, type: 'li', attr: { class: ['li1', 'li1', 'li3'] }, content: ['well1', 'well2', 'well3', 'well4'] },
  children: {
    ch1: {
      type: 'h1',
      attr: { class: 'h1c2', id: 'h1c2' },
      contentNode: 'h1c2',
      repeat: 3
    }
  }
})

let my3comp = component({
  push: {
    types: ['h1', 'div', 'section'],
    attrs: {
      class: ['h1', 'div', 'section'],
      id: ['h1', 'div', 'section']
    },
    contents: ['hello h1', 'hello div', 'hello section']
  }
})

let my4comp = component({
  contentNode:/*html*/`
    <h1>helloooo</h1>
  `
})
console.log(myComponent);
console.log(my2comp);
console.log(my3comp);
console.log(my4comp);

//set render function to render component
export class Render {
  constructor(element, [...components]) {
    const vDom = document.createDocumentFragment();
    async function renderWithAsync(params) {
      for (let i = 0; i < components.length; i++) {
        console.log();
        isElement(await components[i]) ? vDom.appendChild(await components[i]) : vDom.appendChild(component({ type: 'div', content: await components[i] }));
        element.appendChild(vDom);
      }
    }
    renderWithAsync()
  }
}

/*******************@Start_Element_prototypes ==========================*/

Element.prototype.on = function (type = "string", callback = () => { }) {
  this.addEventListener(type, callback)
}


Element.prototype.render = function (...components) {
  return new Render(this, components)
}

Promise.prototype.changeContentWith = async function (element) {
  if (isElement(await this)) {
    (await this).innerHTML = '';
    (await this).render(element)
  }
}

Promise.prototype.render = async function (...components) {
  if (isElement(await this)) {
    console.log(components);
    (await this).render(components)
  }
}


Element.prototype.changeContentWith = function (element) {
  this.innerHTML = '';
  this.render(element)
}

/*******************@End_Element_prototypes ==========================*/




/*******************@Start_Array_prototypes ==========================*/
Array.prototype.at = function (num) {
  if (num >= 0) { return this[num] }
  return this[this.length + num]
}

Array.prototype.remove = function (...num) {
  for (let i = 0; i < num.length; i++) {
    if (num[i] > 0) {
      this[num[i] - 1] = null;
    } else {
      this[this.length + num[i]] = null;
    }
  }
  return this.filter(e => e != null)
}

/*******************@End_Array_prototypes ==========================*/

/*******************@Start_functions ==========================*/
export function transformTo(from, to = "string") {
  if (to == 'object' || to == 'Object' || to == 'obj' || to == 'Obj') {
    return { from }
  } else if (to == 'number' || to == 'Number') {
    let matching = /\d+/ig.test(from) ? from.match(/\d+/ig) : undefined;
    if (matching) { return +matching.join("") }

  } else if (to == 'boolean' || to == 'Boolean') {
    return Boolean(from)
  } else if (to == 'string' || to == 'String') {
    if (typeof from == 'object') {
      return JSON.stringify(from);
    } else {
      return String(from);
    }
  }
}

export function switchLang(prop) {
  if (!prop) throw new Error('prop lang is null')
  langsElemement.forEach((val, key) => {
    key.textContent = val[prop]
  })
}

export function random(num) {
  return Math.trunc(Math.random() * num)
}

export function uniqueID() {
  const letters = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ];

  const l = letters.length;

  return (random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(7) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)))
}


export function scrollTo(element) {
  if (element.id) {
    location.href = `#${element.id}`
  } else {
    element.id = `scrollTo-function`;
    location.href = `#${element.id}`;
    element.removeAttribute('id');
  }
}

export function onMobile(cb = function () { }) {
  if (navigator.userAgentData.platform == 'mobile' || navigator.userAgentData.platform == 'Mobile') {
    cb();
  }
}

export function repeatAsArray(data, length) {
  if (!data) throw new Error('data is null!');
  if (!length) throw new Error('length is null!');
  let empArr = [];
  for (let i = 0; i < length; i++) {
    empArr.push(data)
  }
  return empArr
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

//log asynchronous and synchronous
export async function log(data) {
  try {
    console.log(await data);
  } catch (error) {
    throw new Error(error.message)
  }
}

export function getKeys(obj = {}) {
  return Object.getOwnPropertyNames(obj)
}

export function getValues(obj = {}) {
  return Object.values(obj);
}

export function isElement(element) {
  return element instanceof Element;
}

export function isFragment(fragment) {
  return fragment instanceof DocumentFragment;
}

export function isFunction(data) {
  return data instanceof Function;
}

export function isArray(data) {
  return data instanceof Array;
}

export function isNull(data) {
  return typeof data === 'null'
}
export function isUndefined(data) {
  return typeof data === 'undefined'
}
/*******************@End_functions ==========================*/




//send to server
export async function post(api = "string", data = {}, json = false) {
  let response = await fetch(api, { method: "POST", headers: { 'content-type': 'Application/json' }, body: JSON.stringify(data) });

  return json ? JSON.parse(await response.json()) : await response.text()
}

export async function get(url, resType = 'json') {
  return await (await (await fetch(url))[resType]());
}

//Email validation
export function isValidEmail(email = "string") {
  let matching = email.trim().match(/\w+(\.\w+)?@\w+\.\w+$/ig);
  if (!matching) {
    return { valid: false, msg: "Email is not a valid" }
  } else if (matching.join("").match(/\.\w+/ig)[matching.join("").match(/\.\w+/ig).length - 1] != ".com") {
    return { valid: false, msg: "We just accept .com" }
  }
  else { return { valid: true, type: "email", data: email.trim(), msg: "Email is valid" } }
}

//Name validation
export function isValidName(name = "") {
  let specialCharMatch = name.trim().match(/[\s+|\W+]/g);
  if (specialCharMatch || name.trim() === "") {
    return { valid: false, msg: "Invalid name" };
  } else { return { valid: true, type: "name", data: name, msg: "Valid name" }; }
}

//Date validation
export function isValidDate(date = "", callback = () => { }) {
  let myDate = new Date(date), dateNow = new Date(),
    trulyDate = `${myDate.getFullYear()}/${myDate.getMonth() + 1}/${myDate.getDate()}`;
  callback(dateNow)
  if (myDate.getFullYear() <= dateNow.getFullYear() && myDate.getFullYear() > 1930 && date === trulyDate && myDate.getFullYear() > 1930) { return { valid: true, type: "date", data: date, msg: "Valid date" } } else { return { valid: false, msg: "Invalied date" } }
}

//Password validation
export function isValidPassword(password = "") {
  password = password.trim();
  let specialCharMatch = password.match(/[^a-z0-9\.\s+]/ig);
  let numsMatch = password.match(/[0-9]/ig);
  let upperCharMatch = password.match(/[A-Z]/g);
  let lowerrCharMatch = password.match(/[a-z]/g);
  let spaceMatch = password.match(/[\s+]/g);
  if (!password) { return { valid: false, msg: "Password must not be empty" }; }
  else if (!specialCharMatch) {
    return { valid: false, msg: "Password must have special characters" };
  } else if (!numsMatch || numsMatch.length < 4) {
    return { valid: false, msg: "Password must be at least 4 digits" };
  } else if (!upperCharMatch || upperCharMatch.length < 1) {
    return { valid: false, msg: "Password must be at least 1 capital letter" };
  } else if (!lowerrCharMatch || lowerrCharMatch.length < 1) {
    return { valid: false, msg: "Password must be at least 1 small letter" };
  } else if (spaceMatch) {
    return { valid: false, msg: "Password must not have spaces" };
  }
  else if (password.length < 8) { return { valid: false, msg: "Password must be at least 8 characters" }; }
  else { return { valid: true, type: "password", data: password, msg: "Password is valid" } }
}

//Re password validation
export function isValidRePassword(mainPassword, rePassword) {
  return rePassword.trim() == mainPassword.trim() ? { valid: true, data: rePassword.trim(), msg: "valid" } : { valid: false, msg: "Re password does not match" };
}

//Gender validation
export function isValidGender([...genders]) {
  for (let i = 0; i < genders.length; i++) {
    if (genders[i].checked) { return { valid: true, type: "gender", data: genders[i].id, msg: "Valid gender" }; };
  }
  return { valid: false, data: false, msg: "Please select a your gender" }
}

//transform text input value to number format
export function makeItNumsInput(input) {
  input.value = input.value.match(/\d+/ig);
  let dateNow = new Date();
  if (input.id == "year" && +input.value > dateNow.getFullYear() || input.id == "year" && +input.value < 1930) { return { valid: false, msg: "Invalid year", type: "year" } }
  if (input.id == "month" && +input.value > 12) { console.log(input);; return { valid: false, msg: "Maximum : 12", type: "month" } }
  if (input.id == "day" && +input.value > 31) { return { valid: false, msg: "Maximum : 31", type: "day" } }
  return { valid: true, msg: "All is valid", type: "All inputs" }
}


//submitting form
export function isValidForm({ fName = "", lName = "", date = [document], email, password, rePassword, genders = [document] }) {
  //check names
  let fNameValidation = isValidName(fName.value), lNameValidation = isValidName(lName.value);

  //check date
  let dateValidation = isValidDate(`${date[0].value}/${date[1].value}/${date[2].value}`);

  //check email 
  let emailValidation = isValidEmail(email);

  //check password
  let passwordValidation = isValidPassword(password);

  //check re password
  let rePasswordValidation = isValidRePassword(password, rePassword);

  //check gender
  let genderValidation = isValidGender(genders);

  //start checking
  let checker = [fNameValidation, lNameValidation, dateValidation, emailValidation, passwordValidation, rePasswordValidation, genderValidation];
  let result, ok;
  for (let i = 0; i < checker.length; i++) {
    if (!checker[i].valid) { result = checker[i].msg, ok = false; break; } else {
      result = {
        name: `${fName.value.trim()} ${lName.value.trim()}`,
        gender: genderValidation.data,
        age: dateValidation.data,
        email: email.trim(),
        password: password.trim()
      }
      ok = true;
    }
  }

  return { ok, result }
}

//encode & decode
export function encode(text = "string", password = "") {
  const complexChars = [
    "∆", "¬", "œ", "€", "®", "¨", "ø", "π", "å", "ß", "∂", "ƒ", "©",
    "˚", "¬", "µ", "+", "Ω", "œ", "®", "´", "´´", "≠", "–",
    "≤", "≥", "÷", "Ω", "µ", "∞", "¥", "§", "Π", "∫",
    "‰", "∏", "“", "”", "’", "‘", "≤", "≥", "⁄", "©",
    "~", "Π", "‹", "›", "ﬂ", "·", "‚", "£", "„", "‰",
    "", "œ", "®", "†", "¨", "ø", "π", "å", "ß", "∂", "ƒ", "©", "∆", "˚",
    "¬", "µ", "Ω", "≠", "œ", "®", "∑", "´", "´´", "–", "≤", "≥",
    "÷", "Ω", "µ", "∞", "§", "Π", "∫", "∑", "∆", "ø", "ˆ", "¨", "‰",
    "∏", "“", "”", "’", "‘", "≤", "≥", "⁄", "∑", "ƒ", "©", "∆", "«",
    "𝕼", "𝕽", "𝕾", "𝕿", "𝖀", "𝖁", "𝖂", "𝖃", "𝖄", "𝖅", "𝖆", "𝖇", "𝖈", "𝖉", "𝖊", "𝖋",
    "𝖌", "𝖍", "𝖎", "𝖏", "𝖐", "𝖑", "𝖒", "𝖓", "𝖔", "𝖕", "𝖖", "𝖗", "𝖘", "𝖙", "𝖚", "𝖛",
    "𝖜", "𝖝", "𝖞", "𝖟", "𝛢", "𝛣", "𝛤", "𝛥", "𝛦", "𝛧", "𝛨", "𝛩", "𝛪", "𝛫", "𝛬", "𝛭",
    "𝛮", "𝛯", "𝛰", "𝛱", "𝛲", "𝛳", "𝛴", "𝛵", "𝛶", "𝛷", "𝛸", "𝛹", "𝛺", "𝛻", "𝛼", "𝛽",
    "𝛾", "𝛿", "𝜀", "𝜁", "𝜂", "𝜃", "𝜄", "𝜅", "𝜆", "𝜇", "𝜈", "𝜉", "𝜊", "𝜋", "𝜌", "𝜎",
    "𝜏", "𝜐", "𝜑", "𝜒", "𝜓", "𝜔", "ℂ", "ℍ", "𝕃", "ℕ", "ℙ", "𝕊", "𝕋", "𝕌", "𝕍", "𝕎",
    "𝕏", "𝕐", "𝕒", "𝕓", "𝕔", "𝕕", "𝕖", "𝕗", "𝕘", "𝕙", "𝕚", "𝕛", "𝕜", "𝕝", "𝕞", "𝕟",
    "𝕠", "𝕡", "𝕢", "𝕣", "𝕤", "𝕥", "𝕦", "𝕧", "𝕨", "𝕩", "𝕪", "𝕫", "𝟙", "𝟚", "𝟛", "𝟜",
    "𝟝", "𝟞", "𝟟", "𝟠", "𝟡", "𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡", "ℑ",
    "ℜ", "𝒜", "ℬ", "𝒞"
  ];

  let encodedCode = [...encodeURIComponent(text) + encodeURIComponent("SSpassword:" + password)];
  for (let i = 0; i < encodedCode.length; i++) { encodedCode[i] = encodedCode[i] + complexChars[i + 3 + 4 + 1] + complexChars[i + 1 + 2] + complexChars[i + 1] + complexChars[i + 5] + complexChars[i] + complexChars[i + 3 + 1] + complexChars[i + 1 + 5]; };

  let reader = new FileReader(), textEncoder = new TextEncoder().encode(encodedCode.join("")), blob = new Blob(textEncoder);

  const myData = new Promise((res, rej) => {
    reader.readAsBinaryString(blob);
    reader.on('load', () => {
      if (reader.result) {
        let dataArray = [...reader.result.replace("data:application/octet-stream;base64,", "")]
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] += complexChars[i + 1 + i] + complexChars[i + 2 + 3 + i] + complexChars[i + 2 + 3 + 1 + i]
          if (i >= 15) { dataArray[i] = " "; }
        }
        res(dataArray.join("").split(" ").join("") + btoa(`*^Password$#${password}`))
      } else {
        rej(new Error("Worng Data!"));
      }
    })
  })

  return myData;
};

export async function compare({ comparedText = "string", comparedEncodedText = "string", password = "" }) {
  return await encode(comparedText, password) === comparedEncodedText ? { ok: true, msg: "It is matched" } : { ok: false, msg: "It is not matched" }
}



export class CocktailDB {
  constructor(dbname = "string") {
    this.updateI = 1;
    this.dbname = dbname;
    this.handlers = {
      doRequest: async (callback = () => { }) => {
        const request = indexedDB.open(dbname, this.updateI - 1);
        let returnData = new Promise((res, rej) => {
          request.addEventListener('success', function (ev) {
            let cb = callback(this.result);
            res(cb)
          })

          request.addEventListener('error', function () {
            rej(new Error('Error : ' + this.error))
          });
        });

        return returnData;
      },

      createObjectStore: async (name, request) => {
        request.addEventListener('upgradeneeded', function (ev) {
          this.result.createObjectStore(name, { keyPath: 'id' })
        })

        // close request if it seccesded and to if we wanna to create new collection
        request.addEventListener('success', function () {
          this.result.close();
        });
      },

      returnData: async (data) => {
        try {
          return new Promise((res, rej) => {
            data.addEventListener('success', function () {
              res(this.result)
            })
            data.addEventListener('error', function () {
              rej(this.errorCode);
            })

          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findHandler: async (name, key, cb = () => { }) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            let objectStore = db.transaction(name, 'readonly').objectStore(name).getAll();;
            let data = await this.handlers.returnData(objectStore), matches = [];
            if (key) {
              data.forEach((val) => {
                for (const prop1 in val) {
                  for (const prop2 in key) {
                    if (prop1 == prop2 && val[prop1] == key[prop2]) {
                      matches.push(val)
                    }
                  }
                }
              })
              return cb(matches);
            } else { return cb(data) }
          });
        } catch (error) {
          throw new Error(error.message);

        }
      }

    }

  };

  createCollction = async function (name) {
    const request = indexedDB.open(this.dbname, this.updateI);
    this.updateI++; //to update version to create new objectStore (collection)
    this.handlers.createObjectStore(name, request); //to create new objectStore (collection)

    const methods = {
      set: async (query) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            let lastId = await methods.find();
            console.log(lastId[lastId.length - 1].id);
            query.id = lastId[lastId.length - 1].id + 1 || 0;
            db.transaction(name, 'readwrite').objectStore(name).add(query);
            db.close();
          });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findOne: async (query) => {
        try {
          if (query instanceof Object && !Object.entries(query)[0]) { throw new Error(`findeOne must not be an empty`) }
          if (typeof query !== typeof {}) { throw new Error(`findeOne key type must not be an object`) }
          return await this.handlers.findHandler(name, query, (matches) => matches[0])
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findOneAndUpdate: async (oldQuery, newQuery) => {
        try {
          this.handlers.doRequest(async (db) => {
            let key = await methods.findOne(oldQuery);
            newQuery.id = key.id;
            db.transaction(name, 'readwrite').objectStore(name).put(newQuery)
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      find: async (query) => {
        try {
          if (query && typeof query !== typeof {}) { throw new Error(`findeOne key type must not be an object`) };
          return await this.handlers.findHandler(name, query, matches => matches)
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findAndUpdate: async (oldQuery, newQuery) => {
        try {
          this.handlers.doRequest(async (db) => {
            let key = await methods.find(oldQuery);
            for (let i = 0; i < key.length; i++) {
              newQuery.id = key[i].id;
              db.transaction(name, 'readwrite').objectStore(name).put(newQuery)
            }
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      delete: async (query) => {
        try {
          this.handlers.doRequest(async (db) => {
            let targetQuery = await methods.find(query);
            for (let i = 0; i < targetQuery.length; i++) {
              db.transaction(name, 'readwrite').objectStore(name).delete(targetQuery[i].id)
            }
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      deleteOne: async (query) => {
        try {
          this.handlers.doRequest(async (db) => {
            let targetQuery = await methods.findOne(query);
            console.log(targetQuery);
            db.transaction(name, 'readwrite').objectStore(name).delete(targetQuery.id)
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

    }

    return methods
  };

  deleteDatabase() {
    indexedDB.deleteDatabase(dbname)
  }
}
let i = 0;




export class TelegramBot {
  constructor(token = "string", chatId = "string") {
    this.getFileFromBot = async function (fileId) {
      const url1 = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
      const getFile = await (await fetch(url1)).json();
      console.log(getFile, 'jsosos');
      const file_path = getFile.result.file_path;
      const fileURL = `https://api.telegram.org/file/bot${token}/${file_path}`;
      return fileURL
    }

    //compress url to more sequrity
    this.compressURL = async function (fileId) {
      let tinyUrl = `https://tinyurl.com/api-create.php?url=${await this.getFileFromBot(fileId)}`;
      let compresedURl = await (await fetch(tinyUrl)).text();
      return compresedURl;
    }
    // Base function


    //sendImage
    this.sendFile = async function (blob = Blob) {
      try {
        let formData = new FormData();
        formData.append('document', blob, `${blob.name}`);
        formData.append('chat_id', chatId)
        const options = { method: 'POST', body: formData };
        let data = await (await fetch(`https://api.telegram.org/bot${token}/sendDocument`, options)).json();
        const fileId = data.result.document.file_id;
        console.log(fileId);
        return { ok: true, url: await this.compressURL(fileId) };
      } catch (error) {
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    }

    //send Image
    this.sendImage = async function (blob = Blob) {
      return await this.sendFile(blob)
    }

    //send video
    this.sendVideo = async function (blob = Blob) {
      try {
        const formData = new FormData();
        formData.append('video', blob, `${blob.name}`);
        let sendVideoURL = `https://api.telegram.org/bot${token}/sendVideo?chat_id=${chatId}`;
        let response = await (await fetch(sendVideoURL, { method: "POST", body: formData })).json();
        let fileId = response.result.video.file_id;
        return { ok: true, url: await this.compressURL(fileId) };
      } catch (error) {
        console.error(error);
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    }

    //send audio
    this.sendAudio = async function (blob = Blob) {
      try {
        let sendAudioURL = `https://api.telegram.org/bot${token}/sendAudio?chat_id=${chatId}`;
        const formData = new FormData();
        formData.append('audio', blob, `${blob.name}`);
        let response = await (await fetch(sendAudioURL, { method: "POST", body: formData })).json();
        let fileId = response.result.audio.file_id
        console.log(response);

        return { ok: true, url: await this.compressURL(fileId) };
      } catch (error) {
        console.error(error);
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    }

    //sendMessage
    this.sendMessage = async function (text = "string") {
      try {
        let url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;
        let message = await (await fetch(url)).json();
        return message;
      } catch (error) {
        console.error(error);
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    };

    //get updates
    this.getUpdates = async function () {
      return await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json()
    }

    //get chat id
    this.getChatDetails = async function () {
      return ((await this.getUpdates()).result[0].message.chat)
    }

    //get messages
    this.getMessages = async function () {
      return (await this.getUpdates()).result[0].message
    }

    //get chat history
    this.getChatHistory = async function (params) {
      const res = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-1`)).json();
      console.log(res);
    }
    //delete webhook
    this.deleteWebhook = async function () {
      return await (await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`)).json()
    }
  }
}


const cocktail = 'Welcome in cocktail library';
export default cocktail;