var InteractAPI = (function () {
  NameValuePair: {
  }
  BatchResponse: {
  }
  Response: {
  }
  AdvisoryMessage: {
  }
  Offer: {
  }
  OfferList: {
  }
  GetOfferRequest: {
  }
  Command: {
  }
  CommandUtil: {
  }
  Callback: {
  }
  ResponseTransUtil: {
  }
  function Q(R) {
    this.config = R
  }
  function E(R) {
    if (R && R.enableLog && R.enableLog === "true") {
      return true
    } else {
      return false
    }
  }
  function A(T, S) {
    if (T && typeof T.successCb === "function") {
      var R = this.ResponseTransUtil.buildAPIResponse(S)
      T.successCb(R ? R : S)
    }
  }
  function K(S, R) {
    if (S && typeof S.failureCb === "function") {
      S.failureCb(R)
    }
  }
  function O(V, W) {
    var U = this
    var S = new XMLHttpRequest()
    var R = U.config.url + "/servlet/RestServlet"
    S.open("POST", R, true)
    S.setRequestHeader("Content-type", "application/json; charset=utf-8")
    if (V.indexOf("endSession") > -1) {
      U.config.endSession = true
    }
    var T = L("m_tokenId")
    if (T) {
      S.setRequestHeader("m_tokenId", T)
    } else {
      if (U.config.m_user_name) {
        S.setRequestHeader("m_user_name", encodeURIComponent(U.config.m_user_name))
        S.setRequestHeader("m_user_password", encodeURIComponent(U.config.m_user_password))
      }
    }
    S.onreadystatechange = function () {
      if (S.readyState === 4) {
        P("m_tokenId", S.getResponseHeader("m_tokenId"), U.config.endSession)
        var Y = null
        var Z = null
        if (typeof S.response === "string") {
          Z = S.response
        } else {
          if (typeof S.responseText !== "undefined") {
            Z = S.responseText
          }
        }
        if (Z) {
          try {
            Y = JSON.parse(Z)
          } catch (X) {
            Y = Z
          }
        }
        if (!Y) {
          Y = S.response
        }
        if (S.status === 200) {
          if (E(U.config)) {
            console.log("Executing commands: " + JSON.stringify(S.responseText))
          }
          A.call(U, W, Y)
        } else {
          if (E(U.config)) {
            console.error("Executing commands: " + JSON.stringify(S.responseText))
          }
          K.call(U, W, Y)
        }
      }
    }
    S.send(V)
    if (E(U.config)) {
      console.log("Executing commands: " + JSON.stringify(V))
    }
  }
  function F(S) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createGetVersionCmd()
    this.executeBatch(null, R, InteractAPI.FirstResponseCallback.create(S))
  }
  function N(S, T) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createEndSessionCmd()
    this.executeBatch(S, R, InteractAPI.FirstResponseCallback.create(T))
  }
  function I(S, R, T) {
    this.executeCmd(JSON.stringify({ sessionId: S, commands: R }), T)
  }
  function H(U, T, S, V) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createGetOffersCmd(T, S)
    this.executeBatch(U, R, InteractAPI.FirstResponseCallback.create(V))
  }
  function G(T, S, U) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createGetOffersForMultipleInteractionPointsCmd(S)
    this.executeBatch(T, R, InteractAPI.FirstResponseCallback.create(U))
  }
  function C(S, T) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createGetProfileCmd()
    this.executeBatch(S, R, InteractAPI.FirstResponseCallback.create(T))
  }
  function D(U, S, T, V) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createPostEventCmd(S, T)
    this.executeBatch(U, R, InteractAPI.FirstResponseCallback.create(V))
  }
  function J(T, S, U) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createSetDebugCmd(S)
    this.executeBatch(T, R, InteractAPI.FirstResponseCallback.create(U))
  }
  function M(V, U, S, T, W) {
    var R = new Array(1)
    R[0] = this.CommandUtil.createSetAudienceCmd(U, S, T)
    this.executeBatch(V, R, InteractAPI.FirstResponseCallback.create(W))
  }
  function B(W, U, V, S, Z, Y, R, X) {
    var T = new Array(1)
    T[0] = this.CommandUtil.createStartSessionCmd(U, V, S, Z, Y, R)
    this.executeBatch(W, T, InteractAPI.FirstResponseCallback.create(X))
  }
  function P(V, T, U) {
    if (T !== null && !U) {
      var S = new Date()
      S.setTime(S.getTime() + 15 * 60 * 1000)
      var R = "expires=" + S.toUTCString()
      document.cookie = V + "=" + T + ";" + R + ";path=/interact/"
    } else {
      var S = new Date()
      S.setTime(S.getTime() - 24 * 60 * 60 * 1000)
      var R = "expires=" + S.toUTCString()
      document.cookie = V + "=" + T + ";" + R + ";path=/interact/"
    }
  }
  function L(V) {
    var T = V + "="
    var R = document.cookie.split(";")
    for (var U = 0; U < R.length; U++) {
      var S = R[U]
      while (S.charAt(0) == " ") {
        S = S.substring(1)
      }
      if (S.indexOf(T) == 0) {
        return S.substring(T.length, S.length)
      }
    }
    return ""
  }
  return {
    init: Q,
    executeCmd: O,
    getVersion: F,
    endSession: N,
    executeBatch: I,
    getOffers: H,
    getOffersForMultipleInteractionPoints: G,
    getProfile: C,
    postEvent: D,
    setDebug: J,
    setAudience: M,
    startSession: B,
  }
})()
InteractAPI.namespace = function (D) {
  var C = D.split("."),
    B = InteractAPI,
    A
  if (C[0] === "InteractAPI") {
    C = C.slice(1)
  }
  for (A = 0; A < C.length; A += 1) {
    if (B[C[A]] === "undefined") {
      B[C[A]] = {}
    }
    B = B[C[A]]
  }
  return B
}
InteractAPI.namespace("InteractAPI.NameValuePair")
InteractAPI.NameValuePair = function () {}
InteractAPI.NameValuePair.create = function (D, A, B) {
  var C = new InteractAPI.NameValuePair()
  C.n = D
  C.v = A
  C.t = B
  return C
}
InteractAPI.NameValuePair.prototype = {
  TypeEnum: { STRING: "string", NUMERIC: "numeric", DATETIME: "datetime" },
  getName: function () {
    return this.n
  },
  getValue: function () {
    return this.v
  },
  getType: function () {
    return this.t
  },
}
InteractAPI.namespace("InteractAPI.AdvisoryMessage")
InteractAPI.AdvisoryMessage = function () {}
InteractAPI.AdvisoryMessage.create = function (A, E, D, B) {
  var C = new InteractAPI.AdvisoryMessage()
  C.msgLevel = A
  C.msg = E
  C.detailMsg = D
  C.msgCode = B
  return C
}
InteractAPI.AdvisoryMessage.prototype = {
  StatusLevelEnum: { INFO: 0, WARNING: 1, ERROR: 2 },
  getStatusLevel: function () {
    return this.msgLevel
  },
  getMessage: function () {
    return this.msg
  },
  getDetailedMessage: function () {
    return this.detailMsg
  },
  getMessageCode: function () {
    return this.msgCode
  },
}
InteractAPI.namespace("InteractAPI.Offer")
InteractAPI.Offer = function () {}
InteractAPI.Offer.create = function (G, C, A, F, E, B) {
  var D = new InteractAPI.Offer()
  D.n = G
  D.code = C
  D.treatmentCode = A
  D.score = F
  D.desc = E
  D.attributes = B
  return D
}
InteractAPI.Offer.prototype = {
  getOfferName: function () {
    return this.n
  },
  getOfferCode: function () {
    return this.code
  },
  getTreatmentCode: function () {
    return this.treatmentCode
  },
  getScore: function () {
    return this.score
  },
  getDescription: function () {
    return this.desc
  },
  getAttributes: function () {
    return this.attributes
  },
}
InteractAPI.namespace("InteractAPI.OfferList")
InteractAPI.OfferList = function () {}
InteractAPI.OfferList.create = function (D, A, B) {
  var C = new InteractAPI.OfferList()
  C.ip = D
  C.defaultString = A
  C.offers = B
  return C
}
InteractAPI.OfferList.prototype = {
  getInteractionPointName: function () {
    return this.ip
  },
  getDefaultString: function () {
    return this.defaultString
  },
  getRecommendedOffers: function () {
    return this.offers
  },
}
InteractAPI.namespace("InteractAPI.Response")
InteractAPI.Response = function () {}
InteractAPI.Response.create = function (G, D, B, C, A, E) {
  var F = new InteractAPI.Response()
  F.statusCode = D
  F.sessionId = G
  F.offerList = B
  F.profile = C
  F.version = A
  F.messages = E
  return F
}
InteractAPI.Response.prototype = {
  StatusEnum: { SUCCESS: 0, WARNING: 1, ERROR: 2 },
  getAdvisoryMessages: function () {
    return this.messages
  },
  getOfferList: function () {
    return this.offerList
  },
  getProfileRecord: function () {
    return this.profile
  },
  getSessionID: function () {
    return this.sessionId
  },
  getStatusCode: function () {
    return this.statusCode
  },
}
InteractAPI.namespace("InteractAPI.BatchResponse")
InteractAPI.BatchResponse = function () {}
InteractAPI.BatchResponse.create = function (A, B) {
  var C = new InteractAPI.Response()
  C.batchStatusCode = A
  C.responses = B
  return C
}
InteractAPI.BatchResponse.prototype = {
  getBatchStatusCode: function () {
    return this.batchStatusCode
  },
  getResponses: function () {
    return this.responses
  },
}
InteractAPI.namespace("InteractAPI.OfferAttributeRequirements")
InteractAPI.OfferAttributeRequirements = function () {}
InteractAPI.OfferAttributeRequirements.create = function (A, B, C) {
  var D = new InteractAPI.OfferAttributeRequirements()
  D.numberRequested = A
  if (B) {
    D.attributes = B
  }
  if (C) {
    D.childOfferAttrReqs = C
  }
  return D
}
InteractAPI.OfferAttributeRequirements.prototype = {
  getNumberRequested: function () {
    return this.numberRequested
  },
  getAttributes: function () {
    return this.attributes
  },
  getChildRequirements: function () {
    return this.childOfferAttrReqs
  },
}
InteractAPI.namespace("InteractAPI.GetOfferRequest")
InteractAPI.GetOfferRequest = function () {}
InteractAPI.GetOfferRequest.create = function (E, A, C, B) {
  var D = new InteractAPI.GetOfferRequest()
  D.ip = E
  D.numberRequested = A
  D.dupPolicy = C
  D.offerAttribReq = B
  if (!D.offerAttribReq) {
    D.offerAttribReq = InteractAPI.OfferAttributeRequirements.create(2147483647, [], null)
  }
  return D
}
InteractAPI.GetOfferRequest.prototype = {
  DuplicationPolicyEnum: { NO_DUPLICATION: 1, ALLOW_DUPLICATION: 2 },
  getOfferAttributes: function () {
    return this.offerAttribReq
  },
  getDuplicationPolicy: function () {
    return this.dupPolicy
  },
  getIpName: function () {
    return this.ip
  },
  getNumberRequested: function () {
    return this.numberRequested
  },
}
InteractAPI.namespace("InteractAPI.Command")
InteractAPI.Command = function () {}
InteractAPI.Command.create = function (A) {
  var B = new InteractAPI.Command()
  if (A) {
    B.setMethodIdentifier(A)
  }
  return B
}
InteractAPI.Command.prototype = {
  CommandEnum: {
    ENDSESSION: "endSession",
    GETOFFERS: "getOffers",
    GETOFFERS_MULTI_IP: "getOffersForMultipleInteractionPoints",
    GETPROFILE: "getProfile",
    GETVERSION: "getVersion",
    POSTEVENT: "postEvent",
    SETAUDIENCE: "setAudience",
    SETDEBUG: "setDebug",
    STARTSESSION: "startSession",
  },
  setMethodIdentifier: function (A) {
    this.action = A
  },
  getMethodIdentifier: function () {
    return this.action
  },
  setAudienceID: function (A) {
    this.audienceID = A
  },
  getAudienceID: function () {
    return this.audienceID
  },
  setAudienceLevel: function (A) {
    this.audienceLevel = A
  },
  getAudienceLevel: function () {
    return this.audienceLevel
  },
  setDebug: function (A) {
    this.debug = A
  },
  getDebug: function () {
    return this.debug
  },
  setRelyOnExistingSession: function (A) {
    this.relyOnExistingSession = A
  },
  getRelyOnExistingSession: function () {
    return this.relyOnExistingSession
  },
  setNumberRequested: function (A) {
    this.numberRequested = A
  },
  getNumberRequested: function () {
    return this.numberRequested
  },
  setInteractionPoint: function (A) {
    this.ip = A
  },
  getInteractionPoint: function () {
    return this.ip
  },
  setInteractiveChannel: function (A) {
    this.ic = A
  },
  getInteractiveChannel: function () {
    return this.ic
  },
  setEvent: function (A) {
    this.event = A
  },
  getEvent: function () {
    return this.event
  },
  setParameters: function (A) {
    this.parameters = A
  },
  getParameters: function () {
    return this.parameters
  },
  setGetOfferRequests: function (A) {
    this.getOfferRequests = A
  },
  getGetOfferRequests: function () {
    return this.getOfferRequests
  },
}
InteractAPI.namespace("InteractAPI.CommandUtil")
InteractAPI.CommandUtil = function () {}
InteractAPI.CommandUtil.createGetVersionCmd = function () {
  return InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETVERSION)
}
InteractAPI.CommandUtil.createEndSessionCmd = function () {
  return InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.ENDSESSION)
}
InteractAPI.CommandUtil.createStartSessionCmd = function (B, G, A, E, F, C) {
  var D = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.STARTSESSION)
  D.setInteractiveChannel(B)
  D.setAudienceID(G)
  D.setAudienceLevel(A)
  D.setRelyOnExistingSession(F)
  D.setDebug(C)
  if (E) {
    D.setParameters(E)
  }
  return D
}
InteractAPI.CommandUtil.createGetOffersCmd = function (C, A) {
  var B = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETOFFERS)
  B.setInteractionPoint(C)
  B.setNumberRequested(A)
  return B
}
InteractAPI.CommandUtil.createGetOffersForMultipleInteractionPointsCmd = function (A) {
  var B = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETOFFERS_MULTI_IP)
  B.setGetOfferRequests(A)
  return B
}
InteractAPI.CommandUtil.createGetProfileCmd = function () {
  return InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETPROFILE)
}
InteractAPI.CommandUtil.createPostEventCmd = function (B, C) {
  var A = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.POSTEVENT)
  A.setEvent(B)
  if (C) {
    A.setParameters(C)
  }
  return A
}
InteractAPI.CommandUtil.createSetDebugCmd = function (B) {
  var A = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.SETDEBUG)
  A.setDebug(B)
  return A
}
InteractAPI.CommandUtil.createSetAudienceCmd = function (D, A, C) {
  var B = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.SETAUDIENCE)
  B.setAudienceID(D)
  B.setAudienceLevel(A)
  if (C) {
    B.setParameters(C)
  }
  return B
}
InteractAPI.namespace("InteractAPI.Callback")
InteractAPI.Callback = function () {}
InteractAPI.Callback.create = function (A, C) {
  var B = new InteractAPI.Callback()
  if (A) {
    B.successCb = A
  }
  if (C) {
    B.failureCb = C
  }
  return B
}
InteractAPI.namespace("InteractAPI.FirstResponseCallback")
InteractAPI.FirstResponseCallback = function () {}
InteractAPI.FirstResponseCallback.create = function (B) {
  if (!B) {
    return null
  }
  var A = InteractAPI.Callback.create(
    InteractAPI.FirstResponseCallback.prototype.sucCb,
    InteractAPI.FirstResponseCallback.prototype.failCb,
  )
  A.callback = B
  return A
}
InteractAPI.FirstResponseCallback.prototype = {
  sucCb: function (A) {
    if (A && this.callback && typeof this.callback.successCb === "function") {
      this.callback.successCb(InteractAPI.FirstResponseCallback.prototype.extract(A))
    }
  },
  failCb: function (A) {
    if (this.callback && typeof this.callback.failureCb === "function") {
      this.callback.failureCb(A)
    }
  },
  extract: function (A) {
    if (A.responses !== "undefined" && A.responses.length >= 1) {
      return A.responses[0]
    } else {
      return null
    }
  },
}
InteractAPI.namespace("InteractAPI.ResponseTransUtil")
InteractAPI.ResponseTransUtil = function () {}
InteractAPI.ResponseTransUtil._buildAdvisoryMessage = function (A) {
  if (!A) {
    return null
  }
  return InteractAPI.AdvisoryMessage.create(A.msgLevel, A.msg, A.detailMsg, A.msgCode)
}
InteractAPI.ResponseTransUtil._buildOffer = function (C) {
  if (!C) {
    return null
  }
  var B = null
  if (C.attributes) {
    B = []
    for (var D = 0; D < C.attributes.length; D++) {
      var A = this._buildNameValuePair(C.attributes[D])
      if (A) {
        B.push(A)
      }
    }
  }
  return InteractAPI.Offer.create(C.n, C.code, C.treatmentCode, C.score, C.desc, B)
}
InteractAPI.ResponseTransUtil._buildOfferList = function (D) {
  if (!D) {
    return null
  }
  var C = null
  if (D.offers) {
    C = []
    for (var B = 0; B < D.offers.length; B++) {
      var A = this._buildOffer(D.offers[B])
      if (A) {
        C.push(A)
      }
    }
  }
  return InteractAPI.OfferList.create(D.ip, D.defaultString, C)
}
InteractAPI.ResponseTransUtil._buildNameValuePair = function (A) {
  if (!A) {
    return null
  } else {
    return InteractAPI.NameValuePair.create(A.n, A.v, A.t)
  }
}
InteractAPI.ResponseTransUtil._buildResponse = function (C) {
  if (!C) {
    return null
  }
  var J = null
  if (C.offerLists) {
    J = []
    for (var F = 0; F < C.offerLists.length; F++) {
      var E = this._buildOfferList(C.offerLists[F])
      if (E) {
        J.push(E)
      }
    }
  }
  var D = null
  if (C.messages) {
    D = []
    for (var G = 0; G < C.messages.length; G++) {
      var A = this._buildAdvisoryMessage(C.messages[G])
      if (A) {
        D.push(A)
      }
    }
  }
  var B = null
  if (C.profile) {
    B = []
    for (var H = 0; H < C.profile.length; H++) {
      var I = this._buildNameValuePair(C.profile[H])
      if (I) {
        B.push(I)
      }
    }
  }
  return InteractAPI.Response.create(C.sessionId, C.statusCode, J, B, C.version, D)
}
InteractAPI.ResponseTransUtil._buildBatchResponse = function (B) {
  if (!B) {
    return null
  }
  var C = null
  if (B.responses) {
    C = []
    for (var A = 0; A < B.responses.length; A++) {
      var D = this._buildResponse(B.responses[A])
      if (D) {
        C.push(D)
      }
    }
  }
  return InteractAPI.BatchResponse.create(B.batchStatusCode, C)
}
InteractAPI.ResponseTransUtil.buildAPIResponse = function (A) {
  if (!A) {
    return null
  }
  if (A.batchStatusCode !== "undefined") {
    return this._buildBatchResponse(A)
  } else {
    return this._buildResponse(A)
  }
}

export default InteractAPI
