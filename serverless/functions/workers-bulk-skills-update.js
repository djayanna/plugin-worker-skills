const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async (context, event, callback) =>  {
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    let { workerSids, updatedAttributes } = event;
    const updateAttr = JSON.parse(updatedAttributes);
    workerSids = JSON.parse(workerSids);

    console.log(updateAttr);
    await Promise.all( workerSids.map(async (workerSid) => {
      const worker = await client.taskrouter
        .workspaces(context.TWILIO_WORKSPACE_SID)
        .workers(workerSid)
        .fetch();

      let workersAttributes = JSON.parse(worker.attributes);

      workersAttributes = {
        ...workersAttributes,
        ...updateAttr,
      };

      await client.taskrouter
        .workspaces(context.TWILIO_WORKSPACE_SID)
        .workers(workerSid)
        .update({ attributes: JSON.stringify(workersAttributes) });

      console.log('Updated', workerSid, 'attributes with', updatedAttributes);
    
  }));

    response.appendHeader("Content-Type", "application/json");
    response.setStatusCode(200);
    return callback(null, response);

  } catch (error) {

    console.error(error.message);
    response.appendHeader("Content-Type", "plain/text");
    response.setBody(error.message);
    response.setStatusCode(500);
    return callback(null, response);
  }
});