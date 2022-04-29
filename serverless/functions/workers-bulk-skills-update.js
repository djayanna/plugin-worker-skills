const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async (context, event, callback) =>  {
  
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    let { workerSids, updatedAttributes } = event;
    const updateAttr = JSON.parse(updatedAttributes);
    workerSids = JSON.parse(workerSids);

    console.log(updateAttr);

    const updateWorker = async (workerSid, retryCount = 0, lastError = null) => {
      if (retryCount > 2) throw new Error(lastError);
      try {
        const client = context.getTwilioClient();
        const worker = await client.taskrouter
          .workspaces(context.TWILIO_WORKSPACE_SID)
          .workers(workerSid)
          .fetch();
  
        console.log(client._httpClient.lastResponse.headers);
  
        var etag = client._httpClient.lastResponse.headers["etag"]; 
  
        let workersAttributes = JSON.parse(worker.attributes);
  
        workersAttributes = {
          ...workersAttributes,
          ...updateAttr,
        };
  
        var opts = { attributes: JSON.stringify(workersAttributes) }
  
        if(etag) {
          var ifMatch = new String(etag).toString().replace(/['"]+/g, '');
          opts["ifMatch"] = ifMatch;
        }
  
        await client.taskrouter
          .workspaces(context.TWILIO_WORKSPACE_SID)
          .workers(workerSid)
          .update(opts);

        console.log('Updated', workerSid, 'attributes with', updatedAttributes);
      
      } catch (e) {
        console.error(e);
        return updateWorker(workerSid, retryCount + 1, e);
      }
    };

    await Promise.all( workerSids.map(async (workerSid) => {
     await updateWorker(workerSid);
  }));

    response.appendHeader("Content-Type", "application/json");
    response.setStatusCode(200);
    return callback(null, response);

  } catch (error) {
    console.error(error.code);
    response.appendHeader("Content-Type", "plain/text");
    response.setBody(error.message);
    response.setStatusCode(500);
    return callback(null, response);
  }
});