const TokenValidator = require("twilio-flex-token-validator").functionValidator;
const axios = require("axios");

exports.handler = TokenValidator(async (context, event, callback) => {
  const client = context.getTwilioClient();

  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    let { workerSids, updatedAttributes } = event;
    const updateAttr = JSON.parse(updatedAttributes);
    workerSids = JSON.parse(workerSids);

    const updateWorker = async (
      workerSid,
      retryCount = 0,
      lastError = null
    ) => {
      if (retryCount >= context.RETRY_COUNT) throw new Error(lastError);
      try {
        const { attributes, etag } = await getWorkerAttrributes(
          context,
          workerSid
        );

        let workersAttributes = JSON.parse(attributes);

        workersAttributes = {
          ...workersAttributes,
          ...updateAttr,
        };

        var opts = { attributes: JSON.stringify(workersAttributes) };

        if (etag) {
          var ifMatch = new String(etag).toString().replace(/['"]+/g, "");

          // if (workerSid === "WKadec2407e973e7483c3eec8abfee2081") { ifMatch += "1"};
          opts["ifMatch"] = ifMatch;
        }

        await client.taskrouter
          .workspaces(context.TWILIO_WORKSPACE_SID)
          .workers(workerSid)
          .update(opts);

        console.log("Updated", workerSid, "attributes with", updatedAttributes);
      } catch (e) {
        return updateWorker(workerSid, retryCount + 1, e);
      }
    };

    let data = [];

    var results = await Promise.allSettled(
      workerSids.map(async (workerSid) => {
        return updateWorker(workerSid)
          .catch((error) => {
            console.log("error....", error);
            return Promise.reject({ error: error.message, workerSid });
          })
          .then(() => {
            return Promise.resolve(workerSid);
          });
      })
    );
    results.forEach((result) => {
      console.log(result);
      let status, message, workerSid;
      if (result.status === "rejected") {
        workerSid = result.reason.workerSid;
        status = 400;
        message = JSON.stringify(result);
      } else {
        workerSid = result.value;
        status = 200;
        message = "success";
      }

      var res = { worker_sid: workerSid, message: message, status: status };
      data.push(res);
    });

    response.appendHeader("Content-Type", "application/json");
    response.setBody({ statusCode: "200", data: data });
    return callback(null, response);
  } catch (error) {
    response.appendHeader("Content-Type", "plain/text");
    response.setStatusCode(error.code);
    return callback("error", response);
  }
});

async function getWorkerAttrributes(context, workerSid) {
  const url = `https://taskrouter.twilio.com/v1/Workspaces/${context.TWILIO_WORKSPACE_SID}/Workers/${workerSid}`;
  const response = await axios({
    method: "get",
    url: url,
    auth: {
      username: process.env.ACCOUNT_SID,
      password: process.env.AUTH_TOKEN,
    },
  });

  let attributes = response.data?.attributes;
  let etag = response.headers?.etag;
  return { attributes, etag };
}
