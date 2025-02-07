declare namespace InteractAPI {
  // Existing types for InteractAPI
  interface Config {
    url: string
    enableLog?: string
    m_user_name?: string
    m_user_password?: string
    endSession?: boolean
  }

  interface NameValuePair {
    n: string
    v: any
    t: string
  }

  interface Offer {
    n: string
    code: string
    treatmentCode: string
    score: number
    desc: string
    attributes: NameValuePair[]
  }

  interface OfferList {
    ip: string
    defaultString: string
    offers: Offer[]
  }

  interface Response {
    statusCode: number
    sessionId: string
    offerList: OfferList[]
    profile: NameValuePair[]
    version: string
    messages: AdvisoryMessage[]
  }

  interface AdvisoryMessage {
    msgLevel: number
    msg: string
    detailMsg: string
    msgCode: string
  }

  interface BatchResponse {
    batchStatusCode: number
    responses: Response[]
  }

  interface Callback {
    successCb?: (response: Response | BatchResponse) => void
    failureCb?: (error: any) => void
  }

  interface Command {
    action: string
    audienceID?: string
    audienceLevel?: string
    debug?: boolean
    relyOnExistingSession?: boolean
    numberRequested?: number
    ip?: string
    ic?: string
    event?: string
    parameters?: any
    getOfferRequests?: any
  }

  interface CommandUtil {
    createGetVersionCmd: () => Command
    createEndSessionCmd: () => Command
    createStartSessionCmd: (
      ic: string,
      audienceID: string,
      audienceLevel: string,
      relyOnExistingSession: boolean,
      debug: boolean,
      parameters?: any,
    ) => Command
    createGetOffersCmd: (ip: string, numberRequested: number) => Command
    createGetOffersForMultipleInteractionPointsCmd: (requests: any) => Command
    createGetProfileCmd: () => Command
    createPostEventCmd: (event: string, parameters?: any) => Command
    createSetDebugCmd: (debug: boolean) => Command
    createSetAudienceCmd: (audienceID: string, audienceLevel: string, parameters?: any) => Command
  }

  interface ResponseTransUtil {
    buildAPIResponse: (response: any) => Response | BatchResponse | null
  }

  interface FirstResponseCallback {
    sucCb: (response: any) => void
    failCb: (error: any) => void
    extract: (response: any) => any
  }
}

// Wrapper functions
declare namespace InteractAPIWrapper {
  interface Config {
    serverUrl: string
    debug?: boolean
    [key: string]: any // Allow additional properties
  }

  interface SpotConfig {
    event: string
    eventVars: string
    interactionPoint: string
    maxNumOffers: number
    renderFunction: (spotId: string, response: InteractAPI.Response) => void
    offerTemplateURL: string
    interactSpot: string[]
    [key: string]: any // Allow additional properties
  }

  interface AudienceConfig {
    audId: string
    audLevel: string
    visitorAudLvl: string
    customerAudLvl: string
    visitorAudID: string
    customerAud: string
    customerAudType: string
    visitorAltIDVar: string
    sessVars: string
    idMgmt: boolean
    prevAudIdVar: string
    prevAudId: string
    timeout: number
    [key: string]: any // Allow additional properties
  }

  // Wrapper functions
  function postEventAndGetOffers(spotId: string, aud: AudienceConfig, conf: SpotConfig): void
  function postEvent(spotId: string, aud: AudienceConfig, conf: SpotConfig): void
  function postAccept(treatment: string): void
  function postPresentEvent(params: string): void
  function getOffers(spotId: string, aud: AudienceConfig, conf: SpotConfig): void
  function checkSession(): void
  function sessionCalls(calls: InteractAPI.Command[]): void
  function renderOffers(spotId: string, response: InteractAPI.Response): void
  function audienceSwitch(response: InteractAPI.Response): void
  function applyOfferTemplate(spotId: string, template: string): void
  function renderDefaultOffer(response: InteractAPI.Response): void
  function initModal(spot: SpotConfig): void
  function getOfferAttrValue(offerAttrs: InteractAPI.NameValuePair[], offerName: string): string
  function logMsg(message: string): void
  function getNameValuePairs(parameters: string): InteractAPI.NameValuePair[] | null
  function dummyCallback(): void
  function onErrorCallback(response: InteractAPI.Response): void
  function updateConf(spotId: string, aud: AudienceConfig, conf: SpotConfig): void
}

// Export the wrapper namespace
export default InteractAPIWrapper
