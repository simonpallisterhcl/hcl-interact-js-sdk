var confObj = {
  serverUrl: "https://unicacx-demo-1.hcltechsw.com/interact", // http://UNICAVMDEMO:8080/
  icName: "WoodburnInsurance", // interactive channel name
  audId: "", // audience id.  3 is what we will use as default to represent an unknown/anonymous user
  audLevel: "", // audience level. This is default value/
  contactEvent: "contact",
  acceptEvent: "accept",
  sessVars: "UACIWaitForSegmentation,true,string",
  debug: true,
  prevAudIdVar: "",
  customerAudLvl: "Individual", // Audience name for customer audience level
  customerAud: "indiv_id", // Audience key for customer audience level
  customerAudType: "numeric", // Audience key type
  visitorAudLvl: "Visitor", // Audience Level for unauthenticated visitors
  visitorAud: "VisitorID",
  visitorAudType: "string",
  visitorAudID: "0", // Predefined visitor ID used to start session for a first time visitor
  visitorAltIDVar: "AlternateID", // Visitor profile variable used to pass first time visitor ID (e.g. cookie) on session start.
  // Offer content attributes
  imageAttribute: "offer_image",
  titleAttribute: "offer_title",
  copyAttribute: "offer_copy",
  ctaAttribute: "offer_cta",
  linkAttribute: "offer_link",
  offerTemplateURL: "",
  timeout: 5,
  interactSpot: [],
  sessionCookie: "",
  modalOffers: false,
}

function getCookie(cname) {
  var name = cname + "="
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(";")
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

function getAudience() {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has("utm_email")) {
    let id = urlParams.get("utm_email")
    return { audId: "VisitorID," + id + ",string", audLevel: "Visitor" }
  } else if (urlParams.has("id")) {
    let id = urlParams.get("id")
    return {
      audId: confObj.customerAud + "," + id.toString() + "," + confObj.customerAudType,
      audLevel: confObj.customerAudLvl,
    }
  } else {
    var currAudId = sessionStorage.getItem("audId")
    if (currAudId == null) {
      return { audId: "VisitorID,0,string", audLevel: "Visitor" }
    } else {
      currAudId = currAudId.replaceAll("|", ",")
      let lvl = confObj.visitorAudLvl
      if (currAudId.includes(confObj.customerAud)) {
        lvl = confObj.customerAudLvl
      }
      return { audId: currAudId, audLevel: lvl }
    }
  }
}

function getPageLoadData() {
  const urlParams = new URLSearchParams(window.location.search)
  const url = window.location.href
  var ipName = ""
  var eventName = "page_view"
  var eventVars = ""
  var spots = ["spot1"]
  var template = "https://unicacx-demo-1.hcltechsw.com/htm/horz_table_template2.html"

  if (url.includes("car-insurance")) {
    ipName = "vivre_car_IP"
  } else if (url.includes("home-insurance")) {
    ipName = "vivre_home_IP"
  } else if (url.includes("health-insurance")) {
    ipName = "vivre_life_IP"
  } else {
    ipName = "home"
    //template = "https://unicacx-demo-1.hcltechsw.com/htm/horz_table_template2.html";
  }

  return {
    interactionPoint: ipName, // interaction point name - what page are you on?
    event: eventName, // Event to post
    maxNumOffers: spots.length, // max number of offers we want
    eventVars: eventVars, // Event variables to post
    renderFunction: renderPageOffers,
    offerTemplateURL: template, // Offer rendering template (parametrized HTML fragment)
    interactSpot: spots,
  }
}

function renderPageOffers(spotId, response) {
  // Use default offer rendering or provide page specific logic

  renderOffers(spotId, response)
}

function pageLoadCalls() {
  //debugger;
  confObj.sessionCookie = getCookie("TLTSID")
  var aud = getAudience()
  var spot = getPageLoadData()
  if (confObj.modalOffers && confObj.modalOffers == true) {
    initModal(spot)
  }

  getOffers(
    spot.event, // Spot name unique for the page
    aud, // Audience info
    spot,
  ) // Spot configuration
}

setTimeout(pageLoadCalls(), 15000)
