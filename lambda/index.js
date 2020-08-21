// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

const Alexa = require('ask-sdk-core') , moment = require('moment-timezone');

var http = require('http');
var request = require('request');

const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

function httpost(dta)
{

request.post(
    'http://35.203.107.172:8000/get-response/',
    { json: dta},
    function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
        }
    }
);

}
  

function httpostlogs(log)
{

request.post(
    'http://35.203.107.172:8000/logging/',
    { json: log},
    function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
        }
    }
);

}
  
    
    
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to home Voice , your personalised voice for reminders ';
        
        var log = {
            "pid" : "T2",
            "item" : "launch skill"
        };
        httpostlogs(log);
 
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};


const playreminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'remindplayintent';
        
    },
    
    async handle(handlerInput) {
        //const speakOutput = ' <audio src="soundbank://soundlibrary/weather/thunder/thunder_12"/> ';
        //const speakOutput = '<audio src="https://s3.amazonaws.com/cdn.dabblelab.com/audio/one-small-step-for-man.mp3"/> '
        //const speakOutput = '<audio src="https://djangomediakinvoice.s3-ap-southeast-2.amazonaws.com/U02/M_7.mp3"/> '
        var str = "https://djangomediakinvoice.s3-ap-southeast-2.amazonaws.com/T2/"
        
        
        
    
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
        
        var token = sessionAttributes.hasOwnProperty('token') ? sessionAttributes.token : 0; 
        
        var strx = str + token + ".mp3"
        
        
        //console.log(global.token);
        var output =  '<audio src=' + '"' + strx + '"' + '/> '
        
        const speakOutput = output
        
         var log = {
            "pid" : "T2",
            "item" : "Play Reminder"
        };
        httpostlogs(log);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};





const createreminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'reminderintent';
    },
async handle(handlerInput) {    
    var time = handlerInput.requestEnvelope.request.intent.slots.time.value;
    var date = handlerInput.requestEnvelope.request.intent.slots.day.value;
    var message = handlerInput.requestEnvelope.request.intent.slots.message.value;
   
   //const attributesManager = handlerInput.attributesManager;
   var datime = date + 'T' + time + ':00';
        
        
        
        // reminder request *****************************************************************
    
    
    const remindersApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient(),
    { permissions } = handlerInput.requestEnvelope.context.System.user
    
  /*
    Check if user has granted the skill permissions.
    If not, send consent card to request reminders read and write permission for skill
  */
  if(!permissions) {
    return handlerInput.responseBuilder
      .speak("Please enable reminders permissions in the Amazon Alexa app")
      .withAskForPermissionsConsentCard(["alexa::alerts:reminders:skill:readwrite"])
      .getResponse();
  }
  const currentTime = moment().tz("Pacific/Auckland"), // Use Moment Timezone to get the current time in Pacific Time
       reminderRequest = {
        requestTime: currentTime.format("YYYY-MM-DDTHH:mm:ss"), // Add requestTime
        trigger: {
          type: "SCHEDULED_ABSOLUTE", // Update from SCHEDULED_RELATIVE
          scheduledTime:datime,
          timeZoneId: "Pacific/Auckland", // Set timeZoneId to Pacific Time
          recurrence: {                     
            freq : "DAILY" // Set recurrence and frequency
          }
        },
        alertInfo: {
          spokenInfo: {
            content: [{
              locale: "en-US",
              text: " please ask home Voice to play the reminder." ,
             
               
            }]
          }
        },
        pushNotification: {
          status: "ENABLED"
        }
    }
 
   try {
    const reminderResponse = await remindersApiClient.createReminder(reminderRequest); // json fill gives status of alarm
    var index = reminderResponse.alertToken;
    var remindtime = reminderResponse.updatedTime;
    var dta = {
        "pid": "T2",
        "txt": message,
        "indx": index,
        "remdate" : datime,
        "remtime" :time
    };
    httpost(dta);
    console.log("##################################################");
      console.log(JSON.stringify(reminderResponse));
  // 
   } catch(error) {
       
  console.log("~~~~~ createReminder Error ${error} ~~~~~")
  return handlerInput.responseBuilder
          .speak("There was an error creating your reminder. Please let the skill publisher know.")
          .getResponse();
   }
   
  
  
      const speakOutput = `Your reminder has been set for ${date} ${time}  The task is  ${message}. `;
       
     return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();   
   
    }
};
    

   


// checking th reminder started

const ReminderstartedeventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'Reminders.ReminderStarted');
   // return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Reminders.ReminderStarted';
  },
  async handle(handlerInput) {
      
    var x =JSON.stringify(handlerInput.requestEnvelope);
    var token = handlerInput.requestEnvelope.request.body.alertToken;
    
     const tokenAttributes = {

            "token": token,

        };
        
    console.log(JSON.stringify(handlerInput.requestEnvelope));
    const speakOutput = ' this winning feels like <audio src="soundbank://soundlibrary/weather/thunder/thunder_12"/>  ';
    
    
     const attributesManager = handlerInput.attributesManager;
     attributesManager.setPersistentAttributes(tokenAttributes);
     await attributesManager.savePersistentAttributes();


       



  },
            
  };






// *************************************************************

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;
        
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()

    .addRequestHandlers(
        LaunchRequestHandler,
        createreminderIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        ReminderstartedeventHandler,
        playreminderIntentHandler,
        )
    .addErrorHandlers(
        ErrorHandler,
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .withPersistenceAdapter(
new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
)
    .lambda();
