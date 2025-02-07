// Interact Web Page Spot
// Default configuration setting
import InteractAPI from "./interact-api"

let confObj = {}

const setConfig = config => {
  confObj = config
}

function postEventAndGetOffers(spotId, aud, conf) {
  // Set global config
  //debugger;
  updateConf(spotId, aud, conf)

  if (confObj.serverUrl == null) {
    logMsg("Error: Interact server URL is not configured")
    return
  } else {
    InteractAPI.init({ url: confObj.serverUrl })
  }
  // Setup the sequence of API calls
  checkSession()

  var calls = []
  // Setup API call sequence

  sessionCalls(calls)
  //Add postEvent to call sequence
  calls.push(
    InteractAPI.CommandUtil.createPostEventCmd(confObj[spotId].event, getNameValuePairs(confObj[spotId].eventVars)),
  )

  //Add getOffers to call sequence
  calls.push(InteractAPI.CommandUtil.createGetOffersCmd(confObj[spotId].interactionPoint, confObj[spotId].maxNumOffers))

  // Add callback to render offers
  var callback = InteractAPI.Callback.create(function (response) {
    confObj[spotId].renderFunction(spotId, response)
  }, renderDefaultOffer)

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

function postEvent(spotId, aud, conf) {
  // Set global config
  //debugger;
  updateConf(spotId, aud, conf)

  if (confObj.serverUrl == null) {
    logMsg("Error: Interact server URL is not configured")
    return
  } else {
    InteractAPI.init({ url: confObj.serverUrl })
  }
  // Setup the sequence of API calls
  checkSession()

  var calls = []
  // Setup API call sequence

  sessionCalls(calls)
  //Add postEvent to call sequence
  calls.push(
    InteractAPI.CommandUtil.createPostEventCmd(confObj[spotId].event, getNameValuePairs(confObj[spotId].eventVars)),
  )

  // Add dummy callbacks
  var callback = InteractAPI.Callback.create(audienceSwitch, onErrorCallback)

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

function postAccept(treatment) {
  logMsg("In AcceptEvent " + treatment)
  var trackingCode = "UACIOfferTrackingCode," + treatment + ",string"
  var callback = InteractAPI.Callback.create(dummyCallback, onError)
  // Setup the sequence of API calls
  checkSession()

  var calls = []
  // Setup API call sequence

  sessionCalls(calls)
  //Add postEvent to call sequence
  calls.push(InteractAPI.CommandUtil.createPostEventCmd(confObj.acceptEvent, getNameValuePairs(treatment)))

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

function postPresentEvent(params) {
  logMsg("In ContactEvent " + params)
  var trackingCode = "UACIOfferTrackingCode," + params + ",string"

  var callback = InteractAPI.Callback.create(dummyCallback, onError)
  InteractAPI.postEvent(ssId, "contact", getNameValuePairs(trackingCode), callback)
}

function getOffers(spotId, aud, conf) {
  return new Promise((resolve, reject) => {
    // Set global config
    updateConf(spotId, aud, conf)

    if (confObj.serverUrl == null) {
      logMsg("Error: Interact server URL is not configured")
      reject(new Error("Interact server URL is not configured"))
      return
    } else {
      InteractAPI.init({ url: confObj.serverUrl })
    }

    // Setup the sequence of API calls
    checkSession()
    var calls = []

    // Setup API call sequence
    sessionCalls(calls)
    // Add getOffers to call sequence
    calls.push(
      InteractAPI.CommandUtil.createGetOffersCmd(confObj[spotId].interactionPoint, confObj[spotId].maxNumOffers),
    )

    // Create callback
    var callback = InteractAPI.Callback.create(function (response) {
      if (confObj[spotId].renderFunction) {
        confObj[spotId].renderFunction(spotId, response)
      } else {
        resolve(response)
      }
    }, renderDefaultOffer)

    // Execute Interact batch
    InteractAPI.executeBatch(confObj.ssId, calls, callback)
  })
}

function checkSession() {
  var needInitSession = false
  var needLoginEvent = false
  var newVisitor = false
  var ts
  var d

  if (confObj.audId == null) {
    logMsg("Error:  Audience ID is not configured")
    return
  }
  var currAudId = sessionStorage.getItem("audId")
  if (currAudId == null) {
    if (confObj.audLevel == confObj.visitorAudLvl) {
      newVisitor = true
    }
    sessionStorage.setItem("audId", confObj.audId.replaceAll(",", "|"))
    needInitSession = true
  } else {
    currAudId = currAudId.replaceAll("|", ",")
    if (currAudId !== confObj.audId) {
      var visitorKey = ""
      var currKey = currAudId.split(",")[0]
      var audKey = confObj.audId.split(",")[0]
      // Check if session store has login ID and use that
      if (confObj.visitorAudID != "") {
        visitorKey = confObj.visitorAudID.split(",")[0]
      }
      if (audKey == visitorKey && currKey != visitorKey) {
        confObj.audId = currAudId
        confObj.audLvl = confObj.customerAudLvl
      } else {
        needLoginEvent = true
        confObj.prevAudId = currAudId
        sessionStorage.setItem("audId", confObj.audId.replaceAll(",", "|"))
      }
    }
  }
  if (confObj.sessionCookie > "") {
    var savedSess = sessionStorage.getItem("ssId")
    if (savedSess == null) {
      confObj.ssId = confObj.sessionCookie
      sessionStorage.setItem("ssId", confObj.ssId)
      sessionStorage.setItem("ssTs", ts)
      needInitSession = true
    } else {
      var savedTime = sessionStorage.getItem("ssTs")
      d = new Date()
      ts = d.getTime()
      if (ts - savedTime < 1000 * 60 * confObj.timeout) {
        confObj.ssId = savedSess
        sessionStorage.setItem("ssTs", ts)
      } else {
        confObj.ssId = confObj.sessionCookie
        sessionStorage.setItem("ssId", confObj.ssId)
        sessionStorage.setItem("ssTs", ts)
        needInitSession = true
      }
    }
  } else {
    var savedSess = sessionStorage.getItem("ssId")
    if (savedSess == null) {
      d = new Date()
      ts = d.getTime()
      confObj.ssId = confObj.audId.replaceAll(",", "|") + ts.toString()
      sessionStorage.setItem("ssId", confObj.ssId)
      sessionStorage.setItem("ssTs", ts)
      needInitSession = true
    } else {
      var savedTime = sessionStorage.getItem("ssTs")
      d = new Date()
      ts = d.getTime()
      if (ts - savedTime < 1000 * 60 * confObj.timeout) {
        confObj.ssId = savedSess
        sessionStorage.setItem("ssTs", ts)
      } else {
        confObj.ssId = confObj.audId.replaceAll(",", "|") + ts.toString()
        sessionStorage.setItem("ssId", confObj.ssId)
        sessionStorage.setItem("ssTs", ts)
        needInitSession = true
      }
    }
  }
  confObj.startSession = needInitSession
  confObj.setAudience = needLoginEvent
  confObj.newVisitor = newVisitor
}

function sessionCalls(calls) {
  if (confObj.startSession) {
    var relyOldSs = true
    //Add startSession to call sequence
    if (confObj.newVisitor == true) {
      // First time unauthenticated visitor

      var audParts = confObj.audId.split(",")
      var altID = confObj.visitorAltIDVar + "," + audParts[1] + "," + audParts[2]
      // Start session with predefined visitorID and pass current audID in AlternateID profile var
      // Have flowchart insert a new profile record for the first time visitor
      calls.push(
        InteractAPI.CommandUtil.createStartSessionCmd(
          confObj.icName,
          getNameValuePairs(confObj.visitorAudID),
          confObj.visitorAudLvl,
          getNameValuePairs(altID + ";" + confObj.sessVars),
          relyOldSs,
          confObj.debug,
        ),
      )
      calls.push(
        InteractAPI.CommandUtil.createSetAudienceCmd(
          getNameValuePairs(confObj.audId),
          confObj.audLevel,
          getNameValuePairs(""),
        ),
      )
      // Get profile to check if customer ID lookup for unknown visitor is successful
      if (confObj.idMgmt == true) {
        calls.push(InteractAPI.CommandUtil.createGetProfileCmd())
      }
    } else {
      // Repeat visitor or authenticated visitor

      calls.push(
        InteractAPI.CommandUtil.createStartSessionCmd(
          confObj.icName,
          getNameValuePairs(confObj.audId),
          confObj.audLevel,
          getNameValuePairs(confObj.sessVars),
          relyOldSs,
          confObj.debug,
        ),
      )
    }
  } else if (confObj.setAudience) {
    // Login event
    logMsg("Adding setAudience for id:" + confObj.audId)
    //Add setAudience to call sequence
    let parms = ""
    if (confObj.prevAudIdVar && confObj.prevAudIdVar > "") {
      parms = confObj.prevAudIdVar + "," + confObj.prevAudId.replaceAll(",", "|") + ",string"
    }
    calls.push(
      InteractAPI.CommandUtil.createSetAudienceCmd(
        getNameValuePairs(confObj.audId),
        confObj.audLevel,
        getNameValuePairs(parms),
      ),
    )
    // Get profile to check if customer ID lookup for unknown visitor is successful
    if (confObj.idMgmt == true) {
      calls.push(InteractAPI.CommandUtil.createGetProfileCmd())
    }
  }
}

function renderOffers(spotId, response) {
  //debugger;
  const respList = response.responses

  // Extract offer attributes
  for (var n = 0; n < respList.length; n++) {
    if (respList[n].offerList.length > 0) {
      var offerList = []
      logMsg("[" + spotId + "] In renderOffers")
      // document.getElementById("interactOffers").style.display = "block";
      // See if there are offers ... sometime response.offerList returns null for some odd reason

      offerList = respList[n].offerList[0].offers

      var offers = []

      logMsg("offerList.length is " + offerList.length)

      for (var i = 0; i < offerList.length; i++) {
        var offer = {}
        offer.offerImage = getOfferAttrValue(offerList[i].attributes, confObj.imageAttribute)
        offer.offerTitle = getOfferAttrValue(offerList[i].attributes, confObj.titleAttribute)
        offer.offerCopy = getOfferAttrValue(offerList[i].attributes, confObj.copyAttribute)
        offer.offerLink = getOfferAttrValue(offerList[i].attributes, confObj.linkAttribute)
        offer.offerCTA = getOfferAttrValue(offerList[i].attributes, confObj.ctaAttribute)
        offer.treatment = offerList[i].getTreatmentCode()

        if (offer.offerLink.toLowerCase() == "x") {
          offer.offerLink.offerLink = "#"
        }
        offers.push(offer)
      }
      // Get offer template
      confObj[spotId].offers = offers
      break
    }
  }
  fetch(confObj[spotId].offerTemplateURL).then(response =>
    response.text().then(function (response) {
      console.log(response)
      applyOfferTemplate(spotId, response)
    }),
  )

  audienceSwitch(response)
}

function audienceSwitch(response) {
  // Check if profile is returned in the response
  // Check customer level ID is in the profileList
  // If yes, then setAudience
  const respList = response.responses
  // Check if audience switch is required
  for (var n = 0; n < respList.length; n++) {
    if ("profile" in respList[n] && respList[n].profile !== null) {
      var profileList = respList[n].profile
      logMsg("Reading profile")
      for (var i = 0; i < profileList.length; i++) {
        if (profileList[i].n == confObj.customerAud) {
          var val = profileList[i].v.toString()
          if (val.length > 1) {
            var audID = confObj.customerAud + "," + val + "," + confObj.customerAudType
            var calls = []
            calls.push(
              InteractAPI.CommandUtil.createSetAudienceCmd(
                confObj.customerAudLvl,
                getNameValuePairs(audID),
                getNameValuePairs(""),
              ),
            )

            // Add dummy callbacks
            var callback = InteractAPI.Callback.create(dummyCallback, onErrorCallback)
            // Execute Interact batch
            InteractAPI.executeBatch(confObj.ssId, calls, callback)
          }
          break
        }
      }
    }
  }
}

function applyOfferTemplate(spotId, template) {
  //debugger;
  if (confObj[spotId].offers && confObj[spotId].offers.length > 0) {
    let contacts = []
    var d = confObj[spotId].offers.length
    var tdWidth = 100 / d
    logMsg("tdWidth is " + tdWidth)

    var offers = confObj[spotId].offers
    for (var i = 0; i < confObj[spotId].offers.length; i++) {
      // Format offer content

      let offer = template
        .replaceAll("##OfferTitle##", offers[i].offerTitle)
        .replaceAll("##OfferCopy##", offers[i].offerCopy)
        .replaceAll("##OfferImage##", offers[i].offerImage)
        .replaceAll("##OfferCTA##", offers[i].offerCTA)
        .replaceAll("##OfferLink##", offers[i].offerLink)
        .replaceAll("##OfferCTA##", offers[i].offerCopy)
        .replaceAll("##OfferAccept##", "postAcceptEvent('" + offers[i].treatment + "');")

      //Add contact event to call sequence
      var trackingCode = "UACIOfferTrackingCode," + offers[i].treatment + ",string"
      contacts.push(InteractAPI.CommandUtil.createPostEventCmd(confObj.contactEvent, getNameValuePairs(trackingCode)))
      // Set HTML into i-th memeber of spot array
      if (confObj[spotId].interactSpot.length > i) {
        console.log(confObj, spotId)
        console.log(confObj[spotId].interactSpot[i])
        document.getElementById(confObj[spotId].interactSpot[i]).innerHTML = offer

        // For modal/interstitial display of offers
        if (confObj.modalOffers && confObj.modalOffers == true) {
          var modal = document.getElementById("interactModal")
          var span = document.getElementById("interact-modal-span")
          span.onclick = function () {
            modal.style.display = "none"
          }
          window.onclick = function (event) {
            if (event.target == modal) {
              modal.style.display = "none"
            }
          }
          modal.style.display = "block"
        }
      }
    }

    // Post contact events
    // Add callback to render offers
    var callback = InteractAPI.Callback.create(dummyCallback, onErrorCallback)

    // Execute Interact batch
    InteractAPI.executeBatch(confObj.ssId, contacts, callback)
  } else {
    document.getElementById(confObj.interactSpot[0]).innerHTML = confObj.debug
      ? "Personalized Interact Offer Goes Here!"
      : ""
  }
} // Interact Web Page Spot

function renderDefaultOffer(response) {
  respList = response.responses

  if (response.batchStatusCode > 0) {
    logMsg("postEventAndgetOffers API call failed")
    for (var n = 0; n < respList.length; n++) {
      for (var m = 0; m < respList[n].messages.length; m++) {
        logMsg("   " + respList[n].messages[m])
      }
    }
    sessionStorage.setItem("ssTs", 0)
  }
  document.getElementById(confObj.interactSpot[0]).innerHTML = confObj.debug ? "Deafult Interact Offer Goes Here!" : ""
  return
}

function initModal(spot) {
  var iDiv = document.createElement("div")
  iDiv.id = "interactModal"
  iDiv.className = "interact-modal"

  var html = '<div class="interact-modal-content"><span id="interact-modal-span" class="interact-close">&times;</span>'
  for (var i = 0; i < spot.interactSpot.length; i++) {
    html = html + '<div id="' + spot.interactSpot[i] + '"></div>'
  }
  html = html + "</div></div>"

  iDiv.innerHTML = html

  // Then append the whole thing onto the body
  document.getElementsByTagName("body")[0].appendChild(iDiv)
}

function getOfferAttrValue(offerAttrs, offerName) {
  var offerValue = ""
  for (var j = 0; j < offerAttrs.length; j++) {
    if (offerAttrs[j].n.toLowerCase() === offerName.toLowerCase()) {
      offerValue = offerAttrs[j].v
      break
    }
  }
  return offerValue
}

function logMsg(message) {
  if (confObj.debug) {
    console.log("[InteractClient] " + message)
  }
}

function getNameValuePairs(parameters) {
  if (parameters === "") return null

  var parts = parameters.split(";")
  var nvpArray = new Array(parts.length)

  for (var i = 0; i < parts.length; i += 1) {
    var nvp1 = parts[i].split(",")
    var nvp = new Array(3)
    nvp[0] = nvp1[0]
    nvp[2] = nvp1[nvp1.length - 1]

    var value = nvp1[1]
    for (var j = 2; j <= nvp1.length - 2; j++) {
      value = value + "," + nvp1[j]
    }
    if (nvp[2] === InteractAPI.NameValuePair.prototype.TypeEnum.NUMERIC) {
      if (!isNaN(value)) {
        value = Number(value)
      }
    }

    //special handling NULL value
    if (value && typeof value === "string") {
      if (value.toUpperCase() === "NULL") {
        value = null
      }
    }
    nvpArray[i] = InteractAPI.NameValuePair.create(nvp[0], value, nvp[2])
  }

  return nvpArray
}

function dummyCallback() {
  return
}

function onErrorCallback(response) {
  respList = response.responses

  if (response.batchStatusCode > 0) {
    logMsg("API call(s) failed")
    for (var n = 0; n < respList.length; n++) {
      for (var m = 0; m < respList[n].messages.length; m++) {
        logMsg("   " + respList[n].messages[m].msg)
      }
    }
    sessionStorage.setItem("ssTs", 0)
    return
  }
}

function updateConf(spotId, aud, conf) {
  if (aud) {
    for (var key of Object.keys(aud)) {
      confObj[key] = aud[key]
    }
  }
  if (conf) {
    confObj[spotId] = conf
  }
}

export {
  postEventAndGetOffers,
  postEvent,
  postAccept,
  postPresentEvent,
  getOffers,
  checkSession,
  sessionCalls,
  renderOffers,
  audienceSwitch,
  applyOfferTemplate,
  renderDefaultOffer,
  initModal,
  getOfferAttrValue,
  logMsg,
  getNameValuePairs,
  dummyCallback,
  onErrorCallback,
  updateConf,
  setConfig,
}
