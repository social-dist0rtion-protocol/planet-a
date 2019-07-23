# Deployment

To deploy planet-a to planeta.leap.rocks, follow the instructions below:

1. Ask Kosta, Alberto or Tim for AWS S3 credentials.
1. Go to `~/.aws/credentials` and create a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) called "leap" with the credentials you received.
1. `npm run deploy` will re-build, deploy to S3 and invalidate the Cloudfront Distribution.
