# microblink-license-usage-logs-uploader

Microblink License Usage log's client for sending logs to the Microblink License Usage log's service

## Docker

Application is bundled as Docker Image for easier deployment.

### Releasing levels

1. `Private` at Google Cloud registry
  - only for internal testing

2. `Protected` at Microblink private registry
  - private release for security patches

3. `Public` at Docker Hub
  - a public release which is internally tested and it could be deployed by everyone
### Build & Push

- `PRIVATE_RELEASE` - push Docker image to private Google Cloud Registry
- `PROTECTED_RELEASE` - push Docker image to private Microblink registry for sharing protected images internally and with the clients for images which are not allowed to be publicly available at Docker Hub
- `PUBLIC_RELEASE` - push Docker image to public Docker Hub repository
- `SOURCE_PRIVATE_PUSH` - push source to private Bitbucket repository
- `SOURCE_PUBLIC_PUSH` - push source to public GitHub repository

```bash
PRIVATE_RELEASE=true PROTECTED_RELEASE=true PUBLIC_RELEASE=true SOURCE_PRIVATE_PUSH=true SOURCE_PUBLIC_PUSH=true ./build-and-push.sh
```


### Configuration

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
