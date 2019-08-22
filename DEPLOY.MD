# Deployment

We're automatically deploying on every update to master using Travis-CI. Check
the .travis.yml file for details.

Manual deployment is still possible. For manual deployment, follow the
instructions below:

1. Ask Kosta, Alberto or Tim for AWS S3 credentials.
1. Go to `~/.aws/credentials` and create a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) called "leap" with the credentials you received.
1. `npm run deploy` will re-build, deploy to S3 and invalidate the Cloudfront Distribution.
