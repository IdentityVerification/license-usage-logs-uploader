# microblink-license-usage-logs-uploader

Microblink License Usage log's client for sending logs to the Microblink License Usage log's service. This application is open-sourced and it could be modified by consulting the Microblink Support team with keeping requirements which are responsible for delivering BlinkID Verify Server and FaceTec Server license usage logs.  

All logs will be delivered to the public service at https://license-usage-logs.microblink.com authorized with correct credentials of specific ingress source which should be created at Microblink Developer Hub https://license-usage-logs.microblink.com/ingress-source  

To use application out-of-the-box as standalone "black box", please deploy it as Docker container from the prebuilt Docker image available publicly at Docker Hub from [this](https://hub.docker.com/r/microblink/license-usage-logs-uploader) repository.

## Source

The application's source is available at https://github.com/BlinkID/license-usage-logs-uploader

## Docker

Application is bundled as Docker Image for easier deployment.


### Configuration with environment variables

- `CRON_SCHEDULE` cron job definition when license usage logs uploader should be executed
  - default: `*/60 * * * * *` 
  - every minute

- `LICENSE_USAGE_LOGS_STATE_DIR_PATH` directory where application state will be persisted, application state should be persisted between application deployment and it should be mounted from the shared volume, inside of that directory application will create `state.json` file which is state holder.
  - default: `/app/state`

- `LICENSE_USAGE_LOGS_BLINKID_VERIFY_DIR_PATH` directory in which are available BlinkID Verify Server Logs, logs should be mounted from the external directory by shared volume
  - default: `/blinkid-verify-license-usage-logs`

- `LICENSE_USAGE_LOGS_FACETEC_DIR_PATH` directory in which are available FaceTec Server Logs, logs should be mounted from the external directory by shared volume
  - default: `/facetec-license-usage-logs`

- `PORT` at which is the application available at the HTTP protocol

### Maintenance

Application is primarily designed to works as script triggered periodically by cron job definition, but to check is it application alive and to get a current state without tracing logs it is possible to ping endpoint `/health` which is health check endpoint. If that endpoint is not alive then the whole container should be restarted from the outside.
