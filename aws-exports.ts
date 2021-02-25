export const awsconfig = {
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'eu-central-1:bed78bd0-921f-4d0c-9af7-018d6bac45e5',

        // REQUIRED - Amazon Cognito Region
        region: 'eu-central-1',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-central-1_RBd43RtGv',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '3md8krt2g1jmd6jdd7tk505adp',
    },
    Storage: {
        AWSS3: {
            bucket: 'budget-mania-test-user-data', //REQUIRED -  Amazon S3 bucket
            region: 'eu-central-1', //OPTIONAL -  Amazon service region
        }
    }
}