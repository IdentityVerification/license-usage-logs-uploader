# microblink-license-usage-logs-uploader

Microblink License Usage log's client for sending logs to the Microblink License Usage log's service

## Docker

Application is bundled as Docker Image for the easier deployment.

### Releasing levels

1. `Private` at Google Cloud registry
  - only for internal testing

2. `Protected` at Microblink private registry
  - private release for security patches

3. `Public` at Docker Hub
  - public release which is internally tested and it could be deployed by everyone
### Build & Push

- `PRIVATE_RELEASE` - push Docker image to private Google Cloud Registry
- `PROTECTED_RELEASE` - push Docker image to private Microblink registry for sharing protected images internally and with the clients for images which are not allowed to be publicly available at Docker Hub
- `PUBLIC_RELEASE` - push Docker image to public Docker Hub repository
- `SOURCE_PRIVATE_PUSH` - push source to private Bitbucket repository
- `SOURCE_PUBLIC_PUSH` - push source to public GitHub repository

```bash
PRIVATE_RELEASE=true PROTECTED_RELEASE=true PUBLIC_RELEASE=true SOURCE_PRIVATE_PUSH=true SOURCE_PUBLIC_PUSH=true ./build-and-push.sh
```
